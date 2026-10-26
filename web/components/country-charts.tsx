'use client';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export function LineBlock({ data, lines, domain }: {
  data: Record<string, number | string | null>[];
  lines: { key: string; label: string; color: string }[];
  domain?: [number, number];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis domain={domain} />
        <Tooltip />
        {lines.length > 1 && <Legend />}
        {lines.map(l => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.label}
                stroke={l.color} strokeWidth={2} dot connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}