import { pool } from './db';

export async function getDashboard() {
  // latest year with decent coverage (the newest year is often sparse)
  const { rows: [y] } = await pool.query(
    `SELECT MAX(year) AS year FROM
       (SELECT year FROM risk_assessment GROUP BY year HAVING COUNT(*) >= 50) t`);
  const year: number = y.year;

  const [cats, topDebt, topRisk, trend, avg] = await Promise.all([
    pool.query(
      `SELECT risk_category AS category, COUNT(*)::int AS count
       FROM risk_assessment WHERE year = $1 GROUP BY 1`, [year]),
    pool.query(
      `SELECT c.country_name AS country, d.value AS debt
       FROM debt_observation d
       JOIN country c ON c.country_id = d.country_id
       JOIN indicator i ON i.indicator_id = d.indicator_id
       WHERE i.indicator_code = 'EXT_DEBT_USD' AND d.year = $1
       ORDER BY d.value DESC LIMIT 10`, [year]),
    pool.query(
      `SELECT c.country_code AS code, c.country_name AS country, r.region_name AS region,
              ra.risk_score AS score, ra.risk_category AS category
       FROM risk_assessment ra
       JOIN country c ON c.country_id = ra.country_id
       JOIN region r ON r.region_id = c.region_id
       WHERE ra.year = $1
       ORDER BY ra.risk_score DESC, c.country_name LIMIT 10`, [year]),
    pool.query(
      `SELECT d.year, ROUND(AVG(d.value), 2) AS avg
       FROM debt_observation d
       JOIN indicator i ON i.indicator_id = d.indicator_id
       WHERE i.indicator_code = 'DEBT_GNI'
       GROUP BY d.year ORDER BY d.year`),
    pool.query(
      `SELECT ROUND(AVG(risk_score), 1) AS avg, COUNT(*)::int AS n
       FROM risk_assessment WHERE year = $1`, [year]),
  ]);

  const order = ['Low', 'Moderate', 'High', 'Very High'];
  return {
    year,
    countriesAssessed: avg.rows[0].n as number,
    avgScore: Number(avg.rows[0].avg),
    categories: order.map(c => ({
      category: c,
      count: cats.rows.find(r => r.category === c)?.count ?? 0,
    })),
    topDebt: topDebt.rows.map(r => ({ country: r.country, debt: Number(r.debt) })),
    topRisk: topRisk.rows.map(r => ({ ...r, score: Number(r.score) })),
    trend: trend.rows.map(r => ({ year: r.year as number, avg: Number(r.avg) })),
  };
}