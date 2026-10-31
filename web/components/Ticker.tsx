import { pool } from '@/lib/db';

export default async function Ticker() {
  const { rows } = await pool.query(`
    SELECT c.country_code AS code, ra.risk_score AS score
    FROM risk_assessment ra
    JOIN country c ON c.country_id = ra.country_id
    WHERE ra.year = (SELECT MAX(year) FROM
            (SELECT year FROM risk_assessment GROUP BY year HAVING COUNT(*) >= 50) t)
    ORDER BY md5(c.country_code)
    LIMIT 30`);
  const items = rows.map(r => ({ code: r.code as string, score: Number(r.score) }));

  return (
    <div className="overflow-hidden border-b border-emerald-900/20 bg-emerald-950 py-2 font-mono text-xs text-emerald-100">
      <div className="ticker-track">
        {[...items, ...items].map((r, i) => (
          <span key={i} className="mx-5 whitespace-nowrap">
            <span className="text-emerald-300">{r.code}</span> {r.score}{' '}
            <span className={r.score >= 50 ? 'text-rose-400' : r.score < 25 ? 'text-emerald-400' : 'text-amber-300'}>
              {r.score >= 50 ? '▲' : r.score < 25 ? '▼' : '●'}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}