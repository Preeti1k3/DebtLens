import { Pool } from 'pg';
import { scoreRisk } from '../lib/risk/riskScore';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const n = (v: unknown) => (v == null ? null : Number(v));

async function main() {
  const { rows } = await pool.query(`
    SELECT c.country_id, c.country_name, d.year,
      MAX(CASE WHEN i.indicator_code = 'DEBT_GNI'                 THEN d.value END) AS debt_gni,
      MAX(CASE WHEN i.indicator_code = 'DEBT_SERVICE_EXPORTS'     THEN d.value END) AS debt_service,
      MAX(CASE WHEN i.indicator_code = 'SHORT_TERM_DEBT_RESERVES' THEN d.value END) AS short_term,
      MAX(CASE WHEN i.indicator_code = 'EXT_DEBT_USD'             THEN d.value END) AS debt
    FROM debt_observation d
    JOIN country c   ON c.country_id = d.country_id
    JOIN indicator i ON i.indicator_id = d.indicator_id
    GROUP BY c.country_id, c.country_name, d.year
    ORDER BY c.country_id, d.year`);

  // last seen debt per country, so growth is only computed from the directly preceding year
  const prev = new Map<number, { year: number; debt: number }>();
  let scored = 0, skipped = 0;

  for (const r of rows) {
    const debt = n(r.debt);
    const p = prev.get(r.country_id);
    const growth = debt != null && p && p.year === r.year - 1 && p.debt > 0
      ? ((debt - p.debt) / p.debt) * 100
      : null;
    if (debt != null) prev.set(r.country_id, { year: r.year, debt });

    const result = scoreRisk({
      debtToGni: n(r.debt_gni),
      debtService: n(r.debt_service),
      shortTerm: n(r.short_term),
      growth,
    });

    if (result.total === null) { skipped++; continue; }

    await pool.query(
      `INSERT INTO risk_assessment (country_id, year, risk_score, risk_category, explanation)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       ON CONFLICT (country_id, year) DO UPDATE SET
         risk_score = EXCLUDED.risk_score,
         risk_category = EXCLUDED.risk_category,
         explanation = EXCLUDED.explanation,
         assessed_at = NOW()`,
      [r.country_id, r.year, result.total, result.category,
       JSON.stringify({ method: 'DebtLens v1 banded score', componentsUsed: result.componentsUsed, breakdown: result.breakdown })]
    );
    scored++;
    if (scored % 100 === 0) console.log(`scored ${scored}...`);
  }
  console.log(`Done. Scored: ${scored}, skipped (insufficient data): ${skipped}`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });