import { MongoClient } from 'mongodb';
import fs from 'node:fs';

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const raw = client.db(process.env.MONGO_DB).collection('raw_records');

// join to countries_meta and drop World Bank aggregates ("World", "Low income", ...)
const countriesOnly = (field) => [
  { $lookup: { from: 'countries_meta', localField: field, foreignField: 'id', as: 'meta' } },
  { $unwind: '$meta' },
  { $match: { 'meta.region.value': { $ne: 'Aggregates' } } },
];

const pipelines = {
  'A. Average external debt (% of GNI) by year, countries only': [
    { $match: { 'indicator.id': 'DT.DOD.DECT.GN.ZS', value: { $ne: null } } },
    ...countriesOnly('countryiso3code'),
    { $group: { _id: '$date', avg: { $avg: '$value' }, countries: { $sum: 1 } } },
    { $project: { _id: 0, year: '$_id', avgDebtToGni: { $round: ['$avg', 2] }, countries: 1 } },
    { $sort: { year: 1 } },
  ],
  'B. Top 10 countries by latest total external debt (US$)': [
    { $match: { 'indicator.id': 'DT.DOD.DECT.CD', value: { $ne: null } } },
    { $sort: { date: -1 } },
    { $group: { _id: '$countryiso3code', country: { $first: '$country.value' },
                year: { $first: '$date' }, debtUsd: { $first: '$value' } } },
    ...countriesOnly('_id'),
    { $sort: { debtUsd: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, country: 1, year: 1, debtUsd: 1 } },
  ],
  'C. Average external debt (% of GNI) by region, 2020 onwards': [
    { $match: { 'indicator.id': 'DT.DOD.DECT.GN.ZS', value: { $ne: null }, date: { $gte: '2020' } } },
    ...countriesOnly('countryiso3code'),
    { $group: { _id: '$meta.region.value', avg: { $avg: '$value' }, observations: { $sum: 1 } } },
    { $project: { _id: 0, region: '$_id', avgDebtToGni: { $round: ['$avg', 2] }, observations: 1 } },
    { $sort: { avgDebtToGni: -1 } },
  ],
};

let out = '';
for (const [name, p] of Object.entries(pipelines)) {
  const res = await raw.aggregate(p).toArray();
  out += `\n=== ${name} ===\n${JSON.stringify(res, null, 2)}\n`;
}
console.log(out);
fs.writeFileSync('aggregation_output.txt', out);
await client.close();