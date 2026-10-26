import { MongoClient } from 'mongodb';

const INDICATORS = [
  'DT.DOD.DECT.CD',     // total external debt stocks, US$
  'DT.DOD.DECT.GN.ZS',  // external debt % of GNI
  'DT.TDS.DECT.EX.ZS',  // debt service % of exports
  'DT.DOD.DSTC.IR.ZS',  // short-term debt % of reserves
];

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db(process.env.MONGO_DB);

// country metadata (region, income level) so we can tell countries from aggregates
const metaRes = await (await fetch('https://api.worldbank.org/v2/country?format=json&per_page=400')).json();
await db.collection('countries_meta').deleteMany({});
await db.collection('countries_meta').insertMany(metaRes[1]);
console.log('countries_meta:', metaRes[1].length);

for (const ind of INDICATORS) {
  const started = new Date();
  let page = 1, pages = 1, total = 0, status = 'success';
  await db.collection('raw_records').deleteMany({ '_import.indicator': ind }); // makes re-runs safe
  try {
    while (page <= pages) {
      const url = `https://api.worldbank.org/v2/country/all/indicator/${ind}?format=json&per_page=1000&date=2015:2023&page=${page}`;
      const [meta, rows] = await (await fetch(url)).json();
      if (!rows) { status = 'failed: ' + JSON.stringify(meta); break; }
      pages = meta.pages;
      if (rows.length) {
        await db.collection('raw_records').insertMany(
          rows.map(r => ({ ...r, _import: { indicator: ind, fetchedAt: new Date() } })));
        total += rows.length;
      }
      page++;
    }
  } catch (e) { status = 'failed: ' + e.message; }
  await db.collection('import_logs').insertOne({
    source: 'World Bank IDS (source 6)', indicator: ind,
    startedAt: started, finishedAt: new Date(), recordCount: total, status,
  });
  console.log(ind, total, status);
}
await client.close();