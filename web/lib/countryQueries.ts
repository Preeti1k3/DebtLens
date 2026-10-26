import { pool } from './db';

export async function getCountry(code: string) {
  const { rows: [c] } = await pool.query(
    `SELECT c.country_id, c.country_code AS code, c.country_name AS name, r.region_name AS region
     FROM country c JOIN region r ON r.region_id = c.region_id
     WHERE c.country_code = $1`, [code.toUpperCase()]);
  if (!c) return null;

  const [obs, risk] = await Promise.all([
    pool.query(
      `SELECT d.year, i.indicator_code AS code, d.value
       FROM debt_observation d JOIN indicator i ON i.indicator_id = d.indicator_id
       WHERE d.country_id = $1 ORDER BY d.year`, [c.country_id]),
    pool.query(
      `SELECT year, risk_score, risk_category, explanation
       FROM risk_assessment WHERE country_id = $1 ORDER BY year`, [c.country_id]),
  ]);

  const byYear = new Map<number, Record<string, number>>();
  for (const o of obs.rows) {
    const row = byYear.get(o.year) ?? { year: o.year };
    row[o.code] = Number(o.value);
    byYear.set(o.year, row);
  }
  const r1 = (v: number | undefined) => (v == null ? null : Math.round(v * 10) / 10);
  const series = [...byYear.values()].map(r => ({
    year: r.year,
    debtBn: r1(r.EXT_DEBT_USD == null ? undefined : r.EXT_DEBT_USD / 1000),
    debtGni: r1(r.DEBT_GNI),
    debtService: r1(r.DEBT_SERVICE_EXPORTS),
  }));

  const history = risk.rows.map(r => ({
    year: r.year as number, score: Number(r.risk_score), category: r.risk_category as string,
  }));
  const last = risk.rows.at(-1);
  const latest = last && {
    year: last.year as number,
    score: Number(last.risk_score),
    category: last.risk_category as string,
    componentsUsed: (last.explanation?.componentsUsed ?? 0) as number,
    breakdown: (last.explanation?.breakdown ?? []) as
      { key: string; label: string; value: number | null; points: number | null; note: string }[],
  };

  return { country: { code: c.code as string, name: c.name as string, region: c.region as string }, series, history, latest };
}