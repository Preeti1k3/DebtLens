import { pool } from './db';

export async function getRiskPage(opts: { year?: number; category?: string; region?: string }) {
  const { rows: yrs } = await pool.query(
    `SELECT year FROM risk_assessment GROUP BY year HAVING COUNT(*) >= 50 ORDER BY year DESC`);
  const years: number[] = yrs.map(r => r.year);
  const year = opts.year && years.includes(opts.year) ? opts.year : years[0];

  const [rows, regions, cats] = await Promise.all([
    pool.query(
      `SELECT c.country_code AS code, c.country_name AS country, r.region_name AS region,
              ra.risk_score AS score, ra.risk_category AS category,
              COALESCE((ra.explanation->>'componentsUsed')::int, 0) AS components
       FROM risk_assessment ra
       JOIN country c ON c.country_id = ra.country_id
       JOIN region r ON r.region_id = c.region_id
       WHERE ra.year = $1
         AND ($2::text IS NULL OR ra.risk_category = $2)
         AND ($3::text IS NULL OR r.region_name = $3)
       ORDER BY ra.risk_score DESC, c.country_name`,
      [year, opts.category || null, opts.region || null]),
    pool.query(
      `SELECT DISTINCT r.region_name AS name FROM region r
       JOIN country c ON c.region_id = r.region_id ORDER BY 1`),
    pool.query(
      `SELECT risk_category AS category, COUNT(*)::int AS count
       FROM risk_assessment WHERE year = $1 GROUP BY 1`, [year]),
  ]);

  const order = ['Low', 'Moderate', 'High', 'Very High'];
  return {
    year, years,
    regions: regions.rows.map(r => r.name as string),
    summary: order.map(c => ({ category: c, count: cats.rows.find(r => r.category === c)?.count ?? 0 })),
    rows: rows.rows.map(r => ({ ...r, score: Number(r.score) })) as
      { code: string; country: string; region: string; score: number; category: string; components: number }[],
  };
}