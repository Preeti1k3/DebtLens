import { describe, it, expect } from 'vitest';
import { scoreRisk } from './riskScore';

describe('scoreRisk', () => {
  it('scores a clearly low-risk country', () => {
    const r = scoreRisk({ debtToGni: 19, debtService: 5, shortTerm: 10, growth: 2 });
    expect(r.total).toBe(0);
    expect(r.category).toBe('Low');
  });
  it('scores a clearly very-high-risk country', () => {
    const r = scoreRisk({ debtToGni: 90, debtService: 35, shortTerm: 120, growth: 40 });
    expect(r.total).toBe(100);
    expect(r.category).toBe('Very High');
  });
  it('rescales when components are missing', () => {
    // 47 -> 8 pts, 10 -> 8 pts; 16 of 50 possible = 32
    const r = scoreRisk({ debtToGni: 47, growth: 10 });
    expect(r.total).toBe(32);
    expect(r.category).toBe('Moderate');
  });
  it('refuses to score with fewer than 2 components', () => {
    const r = scoreRisk({ debtToGni: 47 });
    expect(r.total).toBeNull();
    expect(r.category).toBe('Insufficient data');
  });
});