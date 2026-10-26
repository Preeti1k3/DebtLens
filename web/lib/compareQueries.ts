import { pool } from './db';

export async function getCountryList() {
  const { rows } = await pool.query(
    `SELECT country_code AS code, country_name AS name FROM country ORDER BY country_name`);
  return rows as { code: string; name: string }[];
}

type P = { code: string; year: number; v: number };
function pivot(rows: P[]) {
  const m = new Map<number, Record<string, number>>();
  for (const r of rows) {
    const row = m.get(r.year) ?? { year: r.year };
    row[r.code] = r.v;
    m.set(r.year, row);
  }
  return [...m.values()].sort((a, b) => a.year - b.year);
}

export async function getCompare(codes: string[]) {
  const { rows: found } = await pool.query(
    `SELECT country_id, country_code AS code, country_name AS name
     FROM country WHERE country_code = ANY($1::text[])`, [codes]);
  const countries = codes
    .map(c => found.find(f => f.code === c))
    .filter(Boolean) as { country_id: number; code: string; name: string }[];
  const ids = countries.map(c => c.country_id);

  const [obs, risk] = await Promise.all([
    pool.query(
      `SELECT c.country_code AS code, d.year, i.indicator_code AS ind, d.value
       FROM debt_observation d
       JOIN country c ON c.country_id = d.country_id
       JOIN indicator i ON i.indicator_id = d.indicator_id
       WHERE d.country_id = ANY($1::int[])
         AND i.indicator_code IN ('EXT_DEBT_USD','DEBT_GNI','DEBT_SERVICE_EXPORTS')`, [ids]),
    pool.query(
      `SELECT c.country_code AS code, ra.year, ra.risk_score, ra.risk_category
       FROM risk_assessment ra JOIN country c ON c.country_id = ra.country_id
       WHERE ra.country_id = ANY($1::int[]) ORDER BY ra.year`, [ids]),
  ]);

  const pick = (ind: string, f = (x: number) => x): P[] =>
    obs.rows.filter(r => r.ind === ind)
      .map(r => ({ code: r.code, year: r.year, v: Math.round(f(Number(r.value)) * 10) / 10 }));

  const latest = countries.map(c => {
    const last = risk.rows.filter(r => r.code === c.code).at(-1);
    return { code: c.code, name: c.name, year: last?.year as number | undefined,
             score: last ? Number(last.risk_score) : null, category: last?.risk_category as string | undefined };
  });

  return {
    countries: countries.map(({ code, name }) => ({ code, name })),
    debtGni: pivot(pick('DEBT_GNI')),
    debtService: pivot(pick('DEBT_SERVICE_EXPORTS')),
    debtBn: pivot(pick('EXT_DEBT_USD', x => x / 1000)),
    riskHist: pivot(risk.rows.map(r => ({ code: r.code, year: r.year, v: Number(r.risk_score) }))),
    latest,
  };
}