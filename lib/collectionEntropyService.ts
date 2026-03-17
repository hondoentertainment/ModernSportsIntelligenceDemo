// Collection Entropy Service — portfolio diversity scoring and pattern analysis

export interface EntropyScore {
  overall: number;
  sportDiversity: number;
  eraDiversity: number;
  gradeDiversity: number;
  priceTierDiversity: number;
  playerConcentration: number;
  riskRating: 'well-diversified' | 'moderate' | 'concentrated' | 'highly-concentrated';
  recommendation: string;
  breakdown: { category: string; allocation: number; ideal: number }[];
}

export interface EntropyPattern {
  id: string;
  name: string;
  type: 'bias' | 'opportunity' | 'risk' | 'trend';
  description: string;
  severity: number;
  affectedCards: number;
  suggestion: string;
  detectedDate: string;
}

export function getScore(): EntropyScore {
  return {
    overall: 68,
    sportDiversity: 42,
    eraDiversity: 75,
    gradeDiversity: 81,
    priceTierDiversity: 63,
    playerConcentration: 38,
    riskRating: 'moderate',
    recommendation: 'Your collection is over-concentrated in NBA modern cards. Consider adding vintage baseball and NFL to improve diversification.',
    breakdown: [
      { category: 'NBA Modern', allocation: 48, ideal: 25 },
      { category: 'NFL Modern', allocation: 22, ideal: 20 },
      { category: 'MLB Modern', allocation: 12, ideal: 15 },
      { category: 'Vintage (pre-1980)', allocation: 8, ideal: 20 },
      { category: 'Hockey/Soccer/Other', allocation: 5, ideal: 10 },
      { category: 'Graded Premium', allocation: 5, ideal: 10 },
    ],
  };
}

export function getPatterns(): EntropyPattern[] {
  return [
    { id: 'ep-1', name: 'Rookie Card Overweight', type: 'risk', description: '82% of your collection is rookie cards. This creates outsized exposure to bust risk.', severity: 78, affectedCards: 145, suggestion: 'Add veteran star cards and 2nd-year breakouts to reduce rookie concentration.', detectedDate: '2026-03-15' },
    { id: 'ep-2', name: 'PSA 10 Chasing', type: 'bias', description: 'You consistently pay 3x+ premiums for PSA 10 over PSA 9. The ROI difference is often minimal.', severity: 65, affectedCards: 38, suggestion: 'Consider PSA 9 and BGS 9.5 alternatives for better value.', detectedDate: '2026-03-14' },
    { id: 'ep-3', name: 'Single Sport Dependency', type: 'risk', description: 'NBA cards represent 48% of portfolio value. A basketball market correction would heavily impact you.', severity: 72, affectedCards: 85, suggestion: 'Rebalance by selling some NBA positions into MLB and vintage.', detectedDate: '2026-03-12' },
    { id: 'ep-4', name: 'Underexploited Vintage', type: 'opportunity', description: 'You have minimal vintage exposure during a period of relative undervaluation.', severity: 55, affectedCards: 12, suggestion: 'Vintage cards provide inflation hedging and tend to be less volatile.', detectedDate: '2026-03-10' },
    { id: 'ep-5', name: 'Hype Cycle Following', type: 'trend', description: 'Purchase history correlates 87% with social media hype cycles. You tend to buy at peak sentiment.', severity: 82, affectedCards: 52, suggestion: 'Implement a 48-hour cooling period before purchasing trending cards.', detectedDate: '2026-03-08' },
  ];
}
