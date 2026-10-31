import Link from 'next/link';
import { getRiskPage } from '@/lib/riskQueries';

export const dynamic = 'force-dynamic';

const BADGE: Record<string, string> = {
  Low: 'bg-green-100 text-green-800', Moderate: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800', 'Very High': 'bg-red-100 text-red-800',
};

export default async function RiskPage({ searchParams }: {
  searchParams: Promise<{ year?: string; category?: string; region?: string }>;
}) {
  const sp = await searchParams;
  const d = await getRiskPage({ year: sp.year ? Number(sp.year) : undefined, category: sp.category, region: sp.region });
  const card = 'rounded-xl border border-slate-200 bg-white shadow-sm p-5';
  const sel = 'border border-slate-300 rounded-lg px-2 py-1.5 bg-white';

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">← Dashboard</Link>
      <h1 className="text-3xl font-bold">Risk analysis</h1>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {d.summary.map(s => (
          <div key={s.category} className={card}>
            <span className={`px-2 py-0.5 rounded-full text-sm ${BADGE[s.category]}`}>{s.category}</span>
            <div className="text-3xl font-semibold mt-2">{s.count}</div>
            <div className="text-xs text-slate-500">countries in {d.year}</div>
          </div>
        ))}
      </section>

      <form method="GET" className={`${card} flex flex-wrap items-end gap-3`}>
        <label className="text-sm"><span className="block text-slate-500 mb-1">Year</span>
          <select name="year" defaultValue={String(d.year)} className={sel}>
            {d.years.map(y => <option key={y} value={y}>{y}</option>)}
          </select></label>
        <label className="text-sm"><span className="block text-slate-500 mb-1">Category</span>
          <select name="category" defaultValue={sp.category ?? ''} className={sel}>
            <option value="">All</option>
            {['Low', 'Moderate', 'High', 'Very High'].map(c => <option key={c}>{c}</option>)}
          </select></label>
        <label className="text-sm"><span className="block text-slate-500 mb-1">Region</span>
          <select name="region" defaultValue={sp.region ?? ''} className={sel}>
            <option value="">All</option>
            {d.regions.map(r => <option key={r}>{r}</option>)}
          </select></label>
        <button className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm">Apply</button>
      </form>

      <section className={card}>
        <h2 className="font-semibold mb-1">{d.rows.length} countries</h2>
        <p className="text-xs text-slate-500 mb-3">
          Score 0–100 from banded debt indicators (Low &lt;25 · Moderate 25–49 · High 50–74 · Very High 75+).
          Click a country for the full explanation.
        </p>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr><th>Country</th><th>Region</th><th>Score</th><th>Category</th><th>Indicators used</th></tr>
          </thead>
          <tbody>
            {d.rows.map(r => (
              <tr key={r.code} className="border-t border-slate-100">
                <td className="py-2"><Link className="text-blue-600 hover:underline" href={`/country/${r.code}`}>{r.country}</Link></td>
                <td>{r.region}</td>
                <td>{r.score}</td>
                <td><span className={`px-2 py-0.5 rounded-full ${BADGE[r.category]}`}>{r.category}</span></td>
                <td>{r.components} / 4</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}