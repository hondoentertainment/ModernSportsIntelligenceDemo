// ─────────────────────────────────────────────────────────────────────────────
// Alpha Decay Monitor Service
// Tracks how trading signals lose effectiveness over time in card markets
// ─────────────────────────────────────────────────────────────────────────────

export interface AlphaSignal {
  id: string;
  signalName: string;
  category: 'momentum' | 'mean-reversion' | 'seasonal' | 'sentiment' | 'flow' | 'structural';
  discoveredDate: string;
  initialAlpha: number;
  currentAlpha: number;
  peakAlpha: number;
  peakDate: string;
  healthScore: number;
  status: 'healthy' | 'decaying' | 'critical' | 'retired';
  winRate: number;
  tradeCount: number;
  avgHoldPeriod: string;
  description: string;
}

export interface DecayProfile {
  signalId: string;
  signalName: string;
  decayType: 'exponential' | 'linear' | 'step' | 'cyclical';
  halfLife: number;
  decayRate: number;
  curve: { day: number; alpha: number; trades: number; winRate: number }[];
  r2Fit: number;
  predictedZeroDate: string;
}

export interface SignalLifespan {
  signalId: string;
  signalName: string;
  category: string;
  birthDate: string;
  currentAge: number;
  estimatedLifespan: number;
  remainingLife: number;
  lifespanPct: number;
  totalPnL: number;
  peakPnL: number;
  recommendation: 'increase-size' | 'maintain' | 'reduce-size' | 'retire';
}

export interface DecayHistory {
  month: string;
  activeSignals: number;
  retiredSignals: number;
  avgHealth: number;
  newSignals: number;
  avgLifespan: number;
  totalAlpha: number;
}

const alphaSignals: AlphaSignal[] = [
  { id: 'AS-01', signalName: 'Rookie Card Listing Surge Fade', category: 'mean-reversion', discoveredDate: '2025-03-15', initialAlpha: 4.8, currentAlpha: 4.2, peakAlpha: 5.1, peakDate: '2025-06-20', healthScore: 88, status: 'healthy', winRate: 67.5, tradeCount: 142, avgHoldPeriod: '3-5 days', description: 'Fades price spikes from sudden rookie card listing surges' },
  { id: 'AS-02', signalName: 'PSA Submission Volume Predictor', category: 'flow', discoveredDate: '2025-01-10', initialAlpha: 6.2, currentAlpha: 3.8, peakAlpha: 6.5, peakDate: '2025-04-15', healthScore: 62, status: 'decaying', winRate: 58.2, tradeCount: 95, avgHoldPeriod: '14-21 days', description: 'Trades based on PSA submission volume changes predicting pop report shifts' },
  { id: 'AS-03', signalName: 'Season Opener Momentum', category: 'seasonal', discoveredDate: '2024-09-01', initialAlpha: 5.5, currentAlpha: 5.0, peakAlpha: 7.2, peakDate: '2025-09-15', healthScore: 82, status: 'healthy', winRate: 71.3, tradeCount: 48, avgHoldPeriod: '7-14 days', description: 'Buys in-season sport cards 2 weeks before season openers' },
  { id: 'AS-04', signalName: 'Auction House Mispricing', category: 'structural', discoveredDate: '2024-11-20', initialAlpha: 8.1, currentAlpha: 2.5, peakAlpha: 8.5, peakDate: '2025-02-10', healthScore: 31, status: 'critical', winRate: 48.5, tradeCount: 68, avgHoldPeriod: '1-3 days', description: 'Exploits pricing lag between auction house comps and real-time market' },
  { id: 'AS-05', signalName: 'Social Media Sentiment Burst', category: 'sentiment', discoveredDate: '2025-05-01', initialAlpha: 3.9, currentAlpha: 3.5, peakAlpha: 4.2, peakDate: '2025-08-22', healthScore: 85, status: 'healthy', winRate: 63.8, tradeCount: 178, avgHoldPeriod: '1-2 days', description: 'Trades social media sentiment spikes in sports card communities' },
  { id: 'AS-06', signalName: 'Grade Premium Compression', category: 'mean-reversion', discoveredDate: '2024-07-15', initialAlpha: 7.3, currentAlpha: 1.2, peakAlpha: 7.8, peakDate: '2024-12-01', healthScore: 15, status: 'retired', winRate: 42.1, tradeCount: 112, avgHoldPeriod: '30-60 days', description: 'Traded grade premium compression between PSA 10 and PSA 9' },
  { id: 'AS-07', signalName: 'Box Break Night Volatility', category: 'flow', discoveredDate: '2025-06-10', initialAlpha: 4.5, currentAlpha: 3.9, peakAlpha: 4.8, peakDate: '2025-10-05', healthScore: 78, status: 'healthy', winRate: 65.2, tradeCount: 89, avgHoldPeriod: '12-24 hours', description: 'Sells into volatility spikes during major box break events' },
  { id: 'AS-08', signalName: 'Cross-Sport Rotation Alpha', category: 'momentum', discoveredDate: '2025-02-20', initialAlpha: 5.8, currentAlpha: 4.1, peakAlpha: 6.0, peakDate: '2025-05-30', healthScore: 70, status: 'decaying', winRate: 60.5, tradeCount: 65, avgHoldPeriod: '14-30 days', description: 'Rotates between sports based on seasonal momentum shifts' },
  { id: 'AS-09', signalName: 'Vintage Floor Price Bounce', category: 'mean-reversion', discoveredDate: '2024-12-01', initialAlpha: 3.2, currentAlpha: 2.8, peakAlpha: 3.5, peakDate: '2025-03-15', healthScore: 75, status: 'healthy', winRate: 69.4, tradeCount: 42, avgHoldPeriod: '30-45 days', description: 'Buys vintage cards testing historical floor prices' },
  { id: 'AS-10', signalName: 'Injury News Speed Trade', category: 'sentiment', discoveredDate: '2025-08-15', initialAlpha: 9.2, currentAlpha: 5.5, peakAlpha: 9.5, peakDate: '2025-10-01', healthScore: 55, status: 'decaying', winRate: 55.8, tradeCount: 134, avgHoldPeriod: '1-6 hours', description: 'Trades card price reactions to player injury news within minutes' },
  { id: 'AS-11', signalName: 'Population Report Anomaly', category: 'structural', discoveredDate: '2025-04-01', initialAlpha: 6.5, currentAlpha: 5.2, peakAlpha: 6.8, peakDate: '2025-07-20', healthScore: 80, status: 'healthy', winRate: 66.1, tradeCount: 53, avgHoldPeriod: '7-14 days', description: 'Identifies population report anomalies signaling future scarcity' },
  { id: 'AS-12', signalName: 'Weekend Discount Capture', category: 'seasonal', discoveredDate: '2024-06-01', initialAlpha: 2.8, currentAlpha: 0.8, peakAlpha: 3.1, peakDate: '2024-10-15', healthScore: 22, status: 'critical', winRate: 45.2, tradeCount: 215, avgHoldPeriod: '2-3 days', description: 'Captured weekend listing discounts with Monday morning sells' },
];

const decayProfiles: DecayProfile[] = alphaSignals.map(sig => {
  const days = 180;
  const curve: { day: number; alpha: number; trades: number; winRate: number }[] = [];
  const halfLife = sig.healthScore > 70 ? 120 + Math.random() * 60 : sig.healthScore > 40 ? 60 + Math.random() * 40 : 20 + Math.random() * 20;
  const decayType = sig.healthScore > 70 ? 'exponential' as const : sig.healthScore > 40 ? 'linear' as const : 'step' as const;

  for (let d = 0; d <= days; d += 5) {
    let alpha: number;
    if (decayType === 'exponential') {
      alpha = sig.initialAlpha * Math.exp(-0.693 * d / halfLife);
    } else if (decayType === 'linear') {
      alpha = Math.max(0, sig.initialAlpha * (1 - d / (halfLife * 3)));
    } else {
      const steps = Math.floor(d / 45);
      alpha = sig.initialAlpha * Math.pow(0.7, steps);
    }
    const wr = sig.winRate - (d / days) * 15 + (Math.random() - 0.5) * 5;
    curve.push({
      day: d,
      alpha: Math.round(Math.max(0, alpha) * 100) / 100,
      trades: Math.round(sig.tradeCount * (1 - d / days * 0.6)),
      winRate: Math.round(Math.max(40, wr) * 10) / 10,
    });
  }

  const zeroDate = new Date(2026, 3, 18);
  zeroDate.setDate(zeroDate.getDate() + Math.round(halfLife * 3));

  return {
    signalId: sig.id,
    signalName: sig.signalName,
    decayType,
    halfLife: Math.round(halfLife),
    decayRate: Math.round((1 - sig.currentAlpha / sig.initialAlpha) * 10000) / 100,
    curve,
    r2Fit: Math.round((0.75 + Math.random() * 0.2) * 100) / 100,
    predictedZeroDate: zeroDate.toISOString().split('T')[0],
  };
});

const signalLifespans: SignalLifespan[] = alphaSignals.map(sig => {
  const birth = new Date(sig.discoveredDate);
  const now = new Date(2026, 3, 18);
  const ageInDays = Math.round((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  const estLifespan = sig.healthScore > 70 ? ageInDays + Math.round(ageInDays * 0.8) : sig.healthScore > 40 ? ageInDays + Math.round(ageInDays * 0.3) : ageInDays + 30;
  const remaining = estLifespan - ageInDays;
  let rec: SignalLifespan['recommendation'] = 'maintain';
  if (sig.healthScore > 80) rec = 'increase-size';
  else if (sig.healthScore < 30) rec = 'retire';
  else if (sig.healthScore < 50) rec = 'reduce-size';

  return {
    signalId: sig.id,
    signalName: sig.signalName,
    category: sig.category,
    birthDate: sig.discoveredDate,
    currentAge: ageInDays,
    estimatedLifespan: estLifespan,
    remainingLife: remaining,
    lifespanPct: Math.round((ageInDays / estLifespan) * 100),
    totalPnL: Math.round(sig.currentAlpha * sig.tradeCount * 10),
    peakPnL: Math.round(sig.peakAlpha * sig.tradeCount * 12),
    recommendation: rec,
  };
});

const decayHistory: DecayHistory[] = [
  { month: '2025-05', activeSignals: 7, retiredSignals: 1, avgHealth: 75, newSignals: 2, avgLifespan: 142, totalAlpha: 28.5 },
  { month: '2025-06', activeSignals: 8, retiredSignals: 1, avgHealth: 78, newSignals: 1, avgLifespan: 148, totalAlpha: 32.1 },
  { month: '2025-07', activeSignals: 9, retiredSignals: 1, avgHealth: 74, newSignals: 1, avgLifespan: 152, totalAlpha: 35.8 },
  { month: '2025-08', activeSignals: 10, retiredSignals: 1, avgHealth: 72, newSignals: 2, avgLifespan: 145, totalAlpha: 38.2 },
  { month: '2025-09', activeSignals: 10, retiredSignals: 2, avgHealth: 70, newSignals: 0, avgLifespan: 155, totalAlpha: 36.5 },
  { month: '2025-10', activeSignals: 11, retiredSignals: 2, avgHealth: 73, newSignals: 1, avgLifespan: 160, totalAlpha: 40.1 },
  { month: '2025-11', activeSignals: 11, retiredSignals: 2, avgHealth: 71, newSignals: 0, avgLifespan: 158, totalAlpha: 38.9 },
  { month: '2025-12', activeSignals: 10, retiredSignals: 3, avgHealth: 68, newSignals: 0, avgLifespan: 162, totalAlpha: 35.2 },
  { month: '2026-01', activeSignals: 11, retiredSignals: 3, avgHealth: 72, newSignals: 1, avgLifespan: 155, totalAlpha: 39.8 },
  { month: '2026-02', activeSignals: 10, retiredSignals: 4, avgHealth: 69, newSignals: 0, avgLifespan: 165, totalAlpha: 36.4 },
  { month: '2026-03', activeSignals: 10, retiredSignals: 4, avgHealth: 67, newSignals: 0, avgLifespan: 168, totalAlpha: 34.8 },
  { month: '2026-04', activeSignals: 10, retiredSignals: 4, avgHealth: 65, newSignals: 0, avgLifespan: 170, totalAlpha: 33.5 },
];

export function getAlphaSignals(): AlphaSignal[] { return alphaSignals; }
export function getDecayProfiles(): DecayProfile[] { return decayProfiles; }
export function getSignalLifespans(): SignalLifespan[] { return signalLifespans; }
export function getDecayHistory(): DecayHistory[] { return decayHistory; }
export function getHealthySignalCount(): number { return alphaSignals.filter(s => s.status === 'healthy').length; }
export function getDecayingSignalCount(): number { return alphaSignals.filter(s => s.status === 'decaying' || s.status === 'critical').length; }
export function getAvgHealthScore(): number { return Math.round(alphaSignals.reduce((s, a) => s + a.healthScore, 0) / alphaSignals.length); }
export function getRetiredCount(): number { return alphaSignals.filter(s => s.status === 'retired').length; }
