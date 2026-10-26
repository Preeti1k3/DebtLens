import { MongoClient } from 'mongodb';
import pg from 'pg';

const MAP = [  // World Bank code -> Preeti's indicator code
  { wb: 'DT.DOD.DECT.CD',     code: 'EXT_DEBT_USD',             name: 'External debt stock',               unit: 'USD millions', scale: 1e6 },
  { wb: 'DT.DOD.DECT.GN.ZS',  code: 'DEBT_GNI',                 name: 'External debt as percentage of GNI', unit: 'Percent', scale: 1 },
  { wb: 'DT.TDS.DECT.EX.ZS',  code: 'DEBT_SERVICE_EXPORTS',     name: 'Debt service as percentage of exports', unit: 'Percent', scale: 1 },
  { wb: 'DT.DOD.DSTC.IR.ZS',  code: 'SHORT_TERM_DEBT_RESERVES', name: 'Short-term debt as percentage of reserves', unit: 'Percent', scale: 1 },
];

const mongo = new MongoClient(process.env.MONGO_URI);
await mongo.connect();
const db = mongo.db(process.env.MONGO_DB);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// 1. regions + countries (aggregates excluded)
const metas = await db.collection('countries_meta')
  .find({ 'region.value': { $ne: 'Aggregates' } }).toArray();
for (const m of metas) {
  await pool.query('INSERT INTO region (region_name) VALUES ($1) ON CONFLICT (region_name) DO NOTHING', [m.region.value]);
  await pool.query(
    `INSERT INTO country (country_code, country_name, region_id)
     VALUES ($1, $2, (SELECT region_id FROM region WHERE region_name = $3))
     ON CONFLICT (country_code) DO UPDATE SET
       country_name = EXCLUDED.country_name, region_id = EXCLUDED.region_id`,
    [m.id, m.name, m.region.value]);
}
console.log('countries:', metas.length);

// 2. indicators + observations
for (const ind of MAP) {
  const { rows: [{ indicator_id }] } = await pool.query(
    `INSERT INTO indicator (indicator_code, indicator_name, unit) VALUES ($1,$2,$3)
     ON CONFLICT (indicator_code) DO UPDATE SET indicator_name = EXCLUDED.indicator_name
     RETURNING indicator_id`, [ind.code, ind.name, ind.unit]);

  const docs = await db.collection('raw_records')
    .find({ 'indicator.id': ind.wb, value: { $ne: null } }).toArray();
  const codes = docs.map(d => d.countryiso3code);
  const years = docs.map(d => Number(d.date));
  const values = docs.map(d => d.value / ind.scale);

  const res = await pool.query(
    `INSERT INTO debt_observation (country_id, indicator_id, year, value, source)
     SELECT c.country_id, $1, v.year, v.value, 'World Bank'
     FROM unnest($2::text[], $3::int[], $4::numeric[]) AS v(code, year, value)
     JOIN country c ON c.country_code = v.code
     ON CONFLICT (country_id, indicator_id, year)
       DO UPDATE SET value = EXCLUDED.value, source = EXCLUDED.source`,
    [indicator_id, codes, years, values]);
  console.log(ind.code, 'rows loaded:', res.rowCount);
}
await mongo.close();
await pool.end();