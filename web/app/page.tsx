import Link from 'next/link';
import { pool } from '@/lib/db';
import FinanceBackdrop from '@/components/FinanceBackdrop';
import Ticker from '@/components/Ticker';

export const dynamic = 'force-dynamic';

const COLOR: Record<string, string> = {
  Low: '#34d399', Moderate: '#fbbf24', High: '#fb923c', 'Very High': '#f43f5e',
};

async function getData() {
  const [stats, dots] = await Promise.all([
    pool.query(`
      SELECT (SELECT COUNT(*) FROM country)::int          AS countries,
             (SELECT COUNT(*) FROM debt_observation)::int AS observations,
             (SELECT COUNT(*) FROM risk_assessment)::int  AS assessments,
             (SELECT MIN(year) FROM debt_observation)     AS min_year,
             (SELECT MAX(year) FROM debt_observation)     AS max_year`),
    pool.query(`
      SELECT c.country_code AS code, c.country_name AS name, ra.year,
             ra.risk_score AS score, ra.risk_category AS category
      FROM risk_assessment ra JOIN country c ON c.country_id = ra.country_id
      WHERE ra.year = (SELECT MAX(year) FROM
              (SELECT year FROM risk_assessment GROUP BY year HAVING COUNT(*) >= 50) t)
      ORDER BY ra.risk_score DESC, c.country_name`),
  ]);
  return {
    s: stats.rows[0] as { countries: number; observations: number; assessments: number; min_year: number; max_year: number },
    dots: dots.rows.map(r => ({ ...r, score: Number(r.score) })) as
      { code: string; name: string; year: number; score: number; category: string }[],
  };
}

const FEATURES = [
  { title: 'Global dashboard', text: 'Top debtors, risk distribution and long-run trends at a glance.', href: '/dashboard' },
  { title: 'Explainable risk scores', text: 'Every score breaks down by indicator, so you see exactly why.', href: '/risk' },
  { title: 'Compare countries', text: 'Overlay up to four countries on debt, ratios and risk over time.', href: '/compare' },
  { title: 'Trends and reports', text: 'Regional averages, fastest growth and the biggest debtors, straight from SQL.', href: '/reports' },
];

const STEPS = [
  ['World Bank data', 'International Debt Statistics pulled through the public API'],
  ['MongoDB', 'Raw records and import logs stored as flexible documents'],
  ['PostgreSQL', 'A 7-table schema, views, window functions and risk results'],
  ['Next.js app', 'Explainable scoring and interactive pages over both databases'],
];

const eyebrow = 'font-mono text-xs uppercase tracking-[0.3em] text-emerald-400';

export default async function Home() {
  const { s, dots } = await getData();

  return (
    <main className="relative isolate min-h-screen bg-black text-slate-100">
      <FinanceBackdrop />
      <Ticker />

      {/* hero */}
      <section className="mx-auto max-w-6xl px-6 pt-28 pb-32 text-center">
        <p className={eyebrow}>Presented by Ryona &amp; Preeti</p>
        <h1 className="mt-6 text-6xl md:text-8xl font-bold tracking-tight leading-[0.95]">
          Read the world’s<br />
          <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-lime-300 bg-clip-text text-transparent">
            debt.
          </span>
        </h1>
      </section>

      {/* readout strip */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 border-y border-white/10">
          {[
            ['Countries', s.countries],
            ['Observations', s.observations.toLocaleString()],
            ['Risk assessments', s.assessments.toLocaleString()],
            ['Years covered', `${s.min_year}–${s.max_year}`],
          ].map(([label, value]) => (
            <div key={String(label)} className="px-4 py-8 text-center">
              <div className="whitespace-nowrap text-3xl md:text-4xl lg:text-5xl font-bold tabular-nums text-emerald-400">{value}</div>
              <div className="mt-2 font-mono text-xs uppercase tracking-widest text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* constellation */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <p className={eyebrow}>The constellation · {dots[0]?.year}</p>
        <h2 className="mt-3 text-3xl md:text-5xl font-bold">{dots.length} countries.</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Every dot is a country, ordered from highest to lowest risk. Hover for the name, click for the full breakdown.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-2.5">
          {dots.map(d => (
            <Link
              key={d.code}
              href={`/country/${d.code}`}
              title={`${d.name} · ${d.score} (${d.category})`}
              aria-label={`${d.name}, risk ${d.score}, ${d.category}`}
              className="block h-3.5 w-3.5 rounded-full transition-transform hover:scale-[2]"
              style={{ background: COLOR[d.category], boxShadow: `0 0 10px ${COLOR[d.category]}88` }}
            />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-6 font-mono text-xs text-slate-400">
          {Object.entries(COLOR).map(([name, color]) => (
            <span key={name} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <p className={eyebrow}>Explore</p>
        <h2 className="mt-3 mb-8 text-3xl md:text-5xl font-bold">What you can do</h2>
        <div className="border-t border-white/10">
          {FEATURES.map((f, i) => (
            <Link key={f.title} href={f.href}
              className="group flex items-center gap-6 border-b border-white/10 px-2 py-7 transition hover:bg-white/5">
              <span className="font-mono text-sm text-emerald-500">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-semibold text-white transition group-hover:text-emerald-300">{f.title}</h3>
                <p className="mt-1 text-slate-400">{f.text}</p>
              </div>
              <span className="text-2xl text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* pipeline */}
      <section className="mx-auto max-w-5xl px-6 pb-28">
        <p className={eyebrow}>Under the hood</p>
        <h2 className="mt-3 mb-12 text-3xl md:text-5xl font-bold">How it works</h2>
        <div className="relative grid gap-10 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-4 hidden h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent md:block" />
          {STEPS.map(([title, text], i) => (
            <div key={title} className="relative">
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400 bg-black font-mono text-sm text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.5)]">
                {i + 1}
              </div>
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-6 text-center font-mono text-xs text-slate-500">
        DebtLens · Database course final project · Data: World Bank International Debt Statistics
      </footer>
    </main>
  );
}