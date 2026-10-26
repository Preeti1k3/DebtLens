'use client';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function BarBlock({ data, color = '#2563eb', unit = '' }: {
  data: { name: string; value: number }[]; color?: string; unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => `${Number(v).toLocaleString()}${unit}`} />
        <Bar dataKey="value" fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}