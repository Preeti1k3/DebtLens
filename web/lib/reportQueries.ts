import { pool } from './db';

export async function getReports() {
  const { rows: [y] } = await pool.query(
    `SELECT MAX(year) AS year FROM (
       SELECT d.year FROM debt_observation d
       JOIN indicator i ON i.indicator_id = d.indicator_id
       WHERE i.indicator_code = 'EXT_DEBT_USD'
       GROUP BY d.year HAVING COUNT(*) >= 100) t`);
  const year: number = y.year;

  const [trend, byRegion, growth, top, stats] = await Promise.all([
    pool.query(
      `SELECT d.year, ROUND(SUM(d.value) / 1000000, 2) AS total, COUNT(*)::int AS countries
       FROM debt_observation d JOIN indicator i ON i.indicator_id = d.indicator_id
       WHERE i.indicator_code = 'EXT_DEBT_USD' GROUP BY d.year ORDER BY d.year`),
    pool.query(
      `SELECT r.region_name AS name, ROUND(AVG(d.value) / 1000, 1) AS value,
              COUNT(DISTINCT c.country_id)::int AS countries
       FROM debt_observation d
       JOIN country c ON c.country_id = d.country_id
       JOIN region r ON r.region_id = c.region_id
       JOIN indicator i ON i.indicator_id = d.indicator_id
       WHERE i.indicator_code = 'EXT_DEBT_USD' AND d.year = $1
       GROUP BY r.region_name ORDER BY value DESC`, [year]),
    pool.query(
      `SELECT country_name AS name, percentage_change AS value
       FROM vw_debt_growth
       WHERE year = $1 AND percentage_change IS NOT NULL
       ORDER BY percentage_change DESC LIMIT 10`, [year]),
    pool.query(
      `SELECT c.country_code AS code, c.country_name AS country, r.region_name AS region, d.value AS debt
       FROM debt_observation d
       JOIN country c ON c.country_id = d.country_id
       JOIN region r ON r.region_id = c.region_id
       JOIN indicator i ON i.indicator_id = d.indicator_id
       WHERE i.indicator_code = 'EXT_DEBT_USD' AND d.year = $1
       ORDER BY d.value DESC LIMIT 15`, [year]),
    pool.query(
      `WITH v AS (
         SELECT d.value FROM debt_observation d
         JOIN indicator i ON i.indicator_id = d.indicator_id
         WHERE i.indicator_code = 'EXT_DEBT_USD' AND d.year = $1)
       SELECT COUNT(*)::int AS n, ROUND(AVG(value) / 1000, 1) AS avg,
              COUNT(*) FILTER (WHERE value > (SELECT AVG(value) FROM v))::int AS above
       FROM v`, [year]),
  ]);

  return {
    year,
    stats: { n: stats.rows[0].n as number, avg: Number(stats.rows[0].avg), above: stats.rows[0].above as number },
    trend: trend.rows.map(r => ({ year: r.year as number, total: Number(r.total) })),
    byRegion: byRegion.rows.map(r => ({ name: r.name as string, value: Number(r.value), countries: r.countries as number })),
    growth: growth.rows.map(r => ({ name: r.name as string, value: Number(r.value) })),
    top: top.rows.map(r => ({ ...r, debt: Number(r.debt) })) as
      { code: string; country: string; region: string; debt: number }[],
  };
}