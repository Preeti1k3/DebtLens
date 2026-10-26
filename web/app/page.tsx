import Link from 'next/link';
import { getDashboard } from '@/lib/queries';
import { TopDebtChart, RiskCountChart, TrendChart } from '@/components/charts';

export const dynamic = 'force-dynamic';

const BADGE: Record<string, string> = {
  Low: 'bg-green-100 text-green-800', Moderate: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800', 'Very High': 'bg-red-100 text-red-800',
};

export default async function Home() {
  const d = await getDashboard();
  const veryHigh = d.categories.find(c => c.category === 'Very High')?.count ?? 0;

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">DebtLens</h1>
        <p className="text-gray-500">Global external debt risk dashboard · data year {d.year}</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Countries assessed', d.countriesAssessed],
          ['Average risk score', d.avgScore],
          ['Very High risk', veryHigh],
          ['Data year', d.year],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
          <h2 className="font-semibold mb-2">Top 10 by external debt (US$ millions)</h2>
          <TopDebtChart data={d.topDebt} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
          <h2 className="font-semibold mb-2">Countries by risk category</h2>
          <RiskCountChart data={d.categories} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
        <h2 className="font-semibold mb-2">Average external debt, % of GNI, over time</h2>
        <TrendChart data={d.trend} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
        <h2 className="font-semibold mb-3">Highest-risk countries</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr><th>Country</th><th>Region</th><th>Score</th><th>Category</th></tr>
          </thead>
          <tbody>
            {d.topRisk.map(r => (
              <tr key={r.code} className="border-t border-slate-100">
                <td className="py-2">
                  <Link className="text-blue-600 hover:underline" href={`/country/${r.code}`}>{r.country}</Link>
                </td>
                <td>{r.region}</td>
                <td>{r.score}</td>
                <td><span className={`px-2 py-0.5 rounded-full ${BADGE[r.category]}`}>{r.category}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}