export default function FinanceBackdrop() {
  const W = 1200, H = 520;
  const pts = Array.from({ length: 41 }, (_, i) => {
    const x = (i / 40) * W;
    const y = H * 0.78 - i * 6.2 + Math.sin(i * 0.9) * 26 + Math.cos(i * 0.37) * 18;
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;
  const candles = Array.from({ length: 28 }, (_, i) => ({
    x: 40 + i * 42,
    top: H * 0.72 - i * 4.5 + Math.sin(i * 1.3) * 34,
    body: 14 + ((i * 37) % 30),
    up: Math.sin(i * 2.1) > -0.2,
  }));

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px]"
      style={{
        maskImage: 'linear-gradient(to bottom, #000 50%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 50%, transparent)',
      }}
    >
      <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="fadeArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#34d399" stopOpacity="0.30" />
            <stop offset="1" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0H0V60" fill="none" stroke="#ffffff" strokeOpacity="0.05" />
          </pattern>
          <filter id="glow"><feGaussianBlur stdDeviation="7" /></filter>
          <linearGradient id="edge" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.15" stopColor="#fff" />
            <stop offset="0.85" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="edgeMask"><rect width={W} height={H} fill="url(#edge)" /></mask>
        </defs>

        <g mask="url(#edgeMask)">
          <rect width={W} height={H} fill="url(#grid)" />
          <path d={area} fill="url(#fadeArea)" />
          {candles.map(c => {
            const color = c.up ? '#34d399' : '#fb7185';
            return (
              <g key={c.x} opacity="0.5">
                <line x1={c.x} x2={c.x} y1={c.top - 12} y2={c.top + c.body + 12} stroke={color} strokeWidth="2" />
                <rect x={c.x - 7} y={c.top} width="14" height={c.body} rx="2" fill={color} />
              </g>
            );
          })}
          <path d={line} fill="none" stroke="#34d399" strokeWidth="7" strokeOpacity="0.45" filter="url(#glow)" />
          <path className="draw" pathLength={1} d={line} fill="none" stroke="#6ee7b7" strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  );
}