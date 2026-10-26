import { getCompare, getCountryList } from '@/lib/compareQueries';
import { LineBlock } from '@/components/country-charts';

export const dynamic = 'force-dynamic';

const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04'];
const BADGE: Record<string, string> = {
  Low: 'bg-green-100 text-green-800', Moderate: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800', 'Very High': 'bg-red-100 text-red-800',
};

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ c?: string | string[] }> }) {
  const sp = await searchParams;
  const picked = [...new Set(([] as string[]).concat(sp.c ?? []).filter(Boolean))].slice(0, 4);
  const codes = picked.length ? picked : ['IND', 'BRA', 'TUR'];

  const [list, data] = await Promise.all([getCountryList(), getCompare(codes)]);
  const lines = data.countries.map((c, i) => ({ key: c.code, label: c.name, color: COLORS[i] }));
  const card = 'rounded-xl border border-slate-200 bg-white shadow-sm p-5';

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <a href="/" className="text-sm text-blue-600 hover:underline">← Dashboard</a>
      <h1 className="text-3xl font-bold">Compare countries</h1>

      <form method="GET" className={`${card} flex flex-wrap items-end gap-3`}>
        {[0, 1, 2, 3].map(i => (
          <label key={i} className="text-sm">
            <span className="block text-slate-500 mb-1">Country {i + 1}</span>
            <select name="c" defaultValue={codes[i] ?? ''} className="border border-slate-300 rounded-lg px-2 py-1.5 bg-white">
              <option value="">— none —</option>
              {list.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </label>
        ))}
        <button className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm">Compare</button>
      </form>

      <section className={card}>
        <h2 className="font-semibold mb-3">Latest risk assessment</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500"><tr><th>Country</th><th>Year</th><th>Score</th><th>Category</th></tr></thead>
          <tbody>
            {data.latest.map(r => (
              <tr key={r.code} className="border-t border-slate-100">
                <td className="py-2">{r.name}</td><td>{r.year ?? '—'}</td><td>{r.score ?? '—'}</td>
                <td>{r.category && <span className={`px-2 py-0.5 rounded-full ${BADGE[r.category]}`}>{r.category}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className={card}><h2 className="font-semibold mb-2">Risk score over time</h2>
          <LineBlock data={data.riskHist} lines={lines} domain={[0, 100]} /></div>
        <div className={card}><h2 className="font-semibold mb-2">External debt (US$ billions)</h2>
          <LineBlock data={data.debtBn} lines={lines} /></div>
        <div className={card}><h2 className="font-semibold mb-2">External debt, % of GNI</h2>
          <LineBlock data={data.debtGni} lines={lines} /></div>
        <div className={card}><h2 className="font-semibold mb-2">Debt service, % of exports</h2>
          <LineBlock data={data.debtService} lines={lines} /></div>
      </section>
    </main>
  );
}