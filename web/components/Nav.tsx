'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  ['/', 'Home'],
  ['/dashboard', 'Dashboard'],
  ['/risk', 'Risk analysis'],
  ['/reports', 'Trends & reports'],
  ['/compare', 'Compare'],
];

export default function Nav() {
  const path = usePathname();
  const dark = path === '/';
  return (
    <nav className={`sticky top-0 z-20 border-b backdrop-blur ${
      dark ? 'bg-black/70 border-white/10 text-slate-100' : 'bg-white/80 border-slate-200 text-slate-900'}`}>
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center gap-8">
        <Link href="/" className="font-bold text-lg">
          Debt<span className={dark ? 'text-emerald-400' : 'text-emerald-600'}>Lens</span>
        </Link>
        <div className="flex gap-5 text-sm">
          {LINKS.map(([href, label]) => {
            const active = href === '/' ? path === '/' : path.startsWith(href);
            const on = dark ? 'text-emerald-400 font-medium' : 'text-emerald-700 font-medium';
            const off = dark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900';
            return <Link key={href} href={href} className={active ? on : off}>{label}</Link>;
          })}
        </div>
      </div>
    </nav>
  );
}