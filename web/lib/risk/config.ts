export type RiskKey = 'debtToGni' | 'debtService' | 'shortTerm' | 'growth';

export const RISK_CONFIG: {
  components: { key: RiskKey; label: string; bands: [number, number][] }[];
  categories: [number, string][];
  minComponents: number;
} = {
  // each band is [upperBound, points]; the first band where value < upperBound wins
  components: [
    { key: 'debtToGni',   label: 'External debt / GNI (%)',        bands: [[30,0],[50,8],[80,16],[Infinity,25]] },
    { key: 'debtService', label: 'Debt service / exports (%)',     bands: [[10,0],[20,8],[30,16],[Infinity,25]] },
    { key: 'shortTerm',   label: 'Short-term debt / reserves (%)', bands: [[30,0],[60,8],[100,16],[Infinity,25]] },
    { key: 'growth',      label: '1-yr debt growth (%)',           bands: [[5,0],[15,8],[30,16],[Infinity,25]] },
  ],
  categories: [[25,'Low'],[50,'Moderate'],[75,'High'],[Infinity,'Very High']],
  minComponents: 2,
};