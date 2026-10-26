import { Pool } from 'pg';
import { scoreRisk } from '../lib/risk/riskScore';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const { rows } = await pool.query(`
    SELECT c.country_id, c.country_name, d.year,
      MAX(CASE WHEN i.indicator_code = 'DEBT_GNI'     THEN d.value END) AS debt_gni,
      MAX(CASE WHEN i.indicator_code = 'EXT_DEBT_USD' THEN d.value END) AS debt
    FROM debt_observation d
    JOIN country c   ON c.country_id = d.country_id
    JOIN indicator i ON i.indicator_id = d.indicator_id
    GROUP BY c.country_id, c.country_name, d.year
    ORDER BY c.country_id, d.year`);

  const prevDebt = new Map<number, number | null>();

  for (const r of rows) {
    const debt = r.debt == null ? null : Number(r.debt);
    const prev = prevDebt.get(r.country_id) ?? null;
    const growth = debt != null && prev ? ((debt - prev) / prev) * 100 : null;
    prevDebt.set(r.country_id, debt);

    const result = scoreRisk({
      debtToGni: r.debt_gni == null ? null : Number(r.debt_gni),
      growth,
    });

    if (result.total === null) {
      console.log(`${r.country_name} ${r.year}: skipped (${result.category})`);
      continue;
    }

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
    console.log(`${r.country_name} ${r.year}: ${result.total} (${result.category})`);
  }
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });