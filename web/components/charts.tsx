'use client';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Cell,
} from 'recharts';

const COLORS: Record<string, string> = {
  Low: '#16a34a', Moderate: '#ca8a04', High: '#ea580c', 'Very High': '#dc2626',
};

export function TopDebtChart({ data }: { data: { country: string; debt: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
        <YAxis type="category" dataKey="country" width={110} />
        <Tooltip formatter={(v: number) => `$${v.toLocaleString()}M`} />
        <Bar dataKey="debt" fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RiskCountChart({ data }: { data: { category: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count">
          {data.map(d => <Cell key={d.category} fill={COLORS[d.category]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({ data }: { data: { year: number; avg: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis unit="%" />
        <Tooltip />
        <Line type="monotone" dataKey="avg" stroke="#2563eb" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  );
}