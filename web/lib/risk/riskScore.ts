import { RISK_CONFIG, RiskKey } from './config';

export type RiskInput = Partial<Record<RiskKey, number | null>>;

export function scoreRisk(input: RiskInput) {
  const breakdown = RISK_CONFIG.components.map(c => {
    const value = input[c.key];
    if (value == null) {
      return { key: c.key, label: c.label, value: null, points: null as number | null, note: 'No data' };
    }
    const points = c.bands.find(([upper]) => value < upper)![1];
    return { key: c.key, label: c.label, value, points: points as number | null,
             note: `${c.label} = ${value.toFixed(1)} → ${points}/25` };
  });

  const scored = breakdown.filter(b => b.points !== null);
  if (scored.length < RISK_CONFIG.minComponents) {
    return { total: null, category: 'Insufficient data', breakdown, componentsUsed: scored.length };
  }
  const raw = scored.reduce((s, b) => s + (b.points as number), 0);
  // rescale so missing indicators don't make a country look safer
  const total = Math.round((raw / (scored.length * 25)) * 100);
  const category = RISK_CONFIG.categories.find(([upper]) => total < upper)![1];
  return { total, category, breakdown, componentsUsed: scored.length };
}