import Link from 'next/link';
import { getReports } from '@/lib/reportQueries';
import { LineBlock } from '@/components/country-charts';
import { BarBlock } from '@/components/report-charts';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const d = await getReports();
  const card = 'rounded-xl border border-slate-200 bg-white shadow-sm p-5';

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">← Dashboard</Link>
      <h1 className="text-3xl font-bold">Debt trends and reports</h1>
      <p className="text-slate-500">Analytical reports from PostgreSQL · data year {d.year}</p>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          ['Countries reporting', d.stats.n],
          ['Average external debt', `$${d.stats.avg.toLocaleString()}bn`],
          ['Countries above average', d.stats.above],
        ].map(([l, v]) => (
          <div key={String(l)} className={card}>
            <div className="text-sm text-slate-500">{l}</div>
            <div className="text-2xl font-semibold">{v}</div>
          </div>
        ))}
      </section>

      <section className={card}>
        <h2 className="font-semibold mb-1">Total external debt of reporting countries (US$ trillions)</h2>
        <p className="text-xs text-slate-500 mb-2">Sum across all countries with data each year.</p>
        <LineBlock data={d.trend} lines={[{ key: 'total', label: 'Total debt (US$ tn)', color: '#2563eb' }]} />
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className={card}>
          <h2 className="font-semibold mb-2">Average external debt by region (US$ bn)</h2>
          <BarBlock data={d.byRegion} unit="bn" />
        </div>
        <div className={card}>
          <h2 className="font-semibold mb-2">Fastest debt growth, year over year (%)</h2>
          <BarBlock data={d.growth} color="#dc2626" unit="%" />
        </div>
      </section>

      <section className={card}>
        <h2 className="font-semibold mb-3">Top 15 countries by external debt</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500"><tr><th>#</th><th>Country</th><th>Region</th><th className="text-right">Debt (US$ millions)</th></tr></thead>
          <tbody>
            {d.top.map((r, i) => (
              <tr key={r.code} className="border-t border-slate-100">
                <td className="py-2">{i + 1}</td>
                <td><Link className="text-blue-600 hover:underline" href={`/country/${r.code}`}>{r.country}</Link></td>
                <td>{r.region}</td>
                <td className="text-right">{r.debt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}