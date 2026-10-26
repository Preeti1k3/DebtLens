import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCountry } from '@/lib/countryQueries';
import { LineBlock } from '@/components/country-charts';

export const dynamic = 'force-dynamic';

const BADGE: Record<string, string> = {
  Low: 'bg-green-100 text-green-800', Moderate: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800', 'Very High': 'bg-red-100 text-red-800',
};

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getCountry(code);
  if (!data) notFound();
  const { country, series, history, latest } = data;
  const card = 'rounded-xl border border-slate-200 bg-white shadow-sm p-5';

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">← Dashboard</Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{country.name}</h1>
          <p className="text-slate-500">{country.region} · {country.code}</p>
        </div>
        {latest && (
          <div className="text-right">
            <div className="text-4xl font-bold">{latest.score}<span className="text-lg text-slate-400"> / 100</span></div>
            <span className={`px-3 py-1 rounded-full text-sm ${BADGE[latest.category]}`}>{latest.category} risk · {latest.year}</span>
          </div>
        )}
      </header>

      {latest ? (
        <section className={card}>
          <h2 className="font-semibold mb-1">Why this score?</h2>
          <p className="text-sm text-slate-500 mb-4">
            {latest.componentsUsed} indicator(s) scored 0–25 each, then rescaled to 100.
          </p>
          <div className="space-y-4">
            {latest.breakdown.map(b => (
              <div key={b.key}>
                <div className="flex justify-between text-sm">
                  <span>{b.label}</span>
                  <span className="text-slate-500">
                    {b.points == null ? 'No data' : `${b.value?.toFixed(1)} → ${b.points}/25`}
                  </span>
                </div>
                <div className="h-2 rounded bg-slate-100 mt-1">
                  <div className="h-2 rounded bg-blue-600" style={{ width: `${((b.points ?? 0) / 25) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className={card}>No risk assessment available for this country.</section>
      )}

      <section className="grid md:grid-cols-2 gap-6">
        <div className={card}>
          <h2 className="font-semibold mb-2">External debt (US$ billions)</h2>
          <LineBlock data={series} lines={[{ key: 'debtBn', label: 'External debt', color: '#2563eb' }]} />
        </div>
        <div className={card}>
          <h2 className="font-semibold mb-2">Risk score over time</h2>
          <LineBlock data={history} domain={[0, 100]} lines={[{ key: 'score', label: 'Risk score', color: '#dc2626' }]} />
        </div>
      </section>

      <section className={card}>
        <h2 className="font-semibold mb-2">Debt ratios (%)</h2>
        <LineBlock data={series} lines={[
          { key: 'debtGni', label: 'Debt / GNI', color: '#2563eb' },
          { key: 'debtService', label: 'Debt service / exports', color: '#ca8a04' },
        ]} />
      </section>
    </main>
  );
}