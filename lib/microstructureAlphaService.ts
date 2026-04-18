// ─────────────────────────────────────────────────────────────────────────────
// Microstructure Alpha Engine Service
// Extracts alpha from listing/bidding microstructure patterns in sports card markets
// ─────────────────────────────────────────────────────────────────────────────

export interface MicrostructureSignal {
  id: string;
  signalName: string;
  category: 'bid-pattern' | 'listing-flow' | 'order-imbalance' | 'timing-anomaly' | 'spread-dynamics';
  description: string;
  alphaEstimate: number;
  confidence: number;
  sharpeRatio: number;
  decayHalfLife: number;
  winRate: number;
  avgReturn: number;
  sampleSize: number;
  lastTriggered: string;
  status: 'active' | 'decaying' | 'expired';
  affectedCards: string[];
}

export interface AlphaOpportunity {
  id: string;
  signalId: string;
  signalName: string;
  cardName: string;
  player: string;
  sport: string;
  currentPrice: number;
  targetPrice: number;
  expectedReturn: number;
  confidence: number;
  timeHorizon: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  detectedAt: string;
  expiresAt: string;
}

export interface SignalDecay {
  signalId: string;
  signalName: string;
  initialAlpha: number;
  currentAlpha: number;
  decayRate: number;
  halfLife: number;
  decayCurve: { day: number; alpha: number; cumReturn: number }[];
  estimatedExpiry: string;
  status: 'fresh' | 'decaying' | 'near-expiry' | 'expired';
}

export interface AlphaHistory {
  month: string;
  totalAlpha: number;
  signalsActive: number;
  avgSharpe: number;
  winRate: number;
  cumReturn: number;
}

const microstructureSignals: MicrostructureSignal[] = [
  {
    id: 'MS-001', signalName: 'Bid Clustering Reversal', category: 'bid-pattern',
    description: 'Detects clusters of bids at round numbers followed by aggressive breakouts',
    alphaEstimate: 3.2, confidence: 78, sharpeRatio: 1.85, decayHalfLife: 14, winRate: 64.2,
    avgReturn: 5.1, sampleSize: 342, lastTriggered: '2026-04-17T14:30:00Z',
    status: 'active', affectedCards: ['2023 Bowman Chrome Wemby Auto', '2024 Prizm Chet Silver']
  },
  {
    id: 'MS-002', signalName: 'Listing Surge Fade', category: 'listing-flow',
    description: 'Fades price spikes caused by sudden listing surges from panic sellers',
    alphaEstimate: 2.8, confidence: 72, sharpeRatio: 1.62, decayHalfLife: 21, winRate: 61.5,
    avgReturn: 4.3, sampleSize: 287, lastTriggered: '2026-04-16T09:15:00Z',
    status: 'active', affectedCards: ['2020 Prizm Justin Herbert RC', '2022 Topps Chrome Julio PSA 10']
  },
  {
    id: 'MS-003', signalName: 'Order Imbalance Momentum', category: 'order-imbalance',
    description: 'Trades in the direction of sustained bid-ask imbalance above 2:1 ratio',
    alphaEstimate: 4.1, confidence: 82, sharpeRatio: 2.15, decayHalfLife: 10, winRate: 68.3,
    avgReturn: 6.7, sampleSize: 198, lastTriggered: '2026-04-17T16:45:00Z',
    status: 'active', affectedCards: ['2018 Prizm Luka Doncic RC PSA 10', '2001 Bowman Chrome Pujols']
  },
  {
    id: 'MS-004', signalName: 'Weekend Listing Discount', category: 'timing-anomaly',
    description: 'Captures discount from listings posted Friday-Sunday with Monday resolution',
    alphaEstimate: 1.9, confidence: 85, sharpeRatio: 2.45, decayHalfLife: 30, winRate: 72.1,
    avgReturn: 2.8, sampleSize: 524, lastTriggered: '2026-04-13T08:00:00Z',
    status: 'active', affectedCards: ['2023 Topps Chrome Elly De La Cruz', '2022 Panini Select Ja Morant']
  },
  {
    id: 'MS-005', signalName: 'Spread Compression Alpha', category: 'spread-dynamics',
    description: 'Identifies cards where bid-ask spread is compressing, signaling imminent breakout',
    alphaEstimate: 3.7, confidence: 71, sharpeRatio: 1.78, decayHalfLife: 12, winRate: 63.8,
    avgReturn: 5.9, sampleSize: 156, lastTriggered: '2026-04-17T11:20:00Z',
    status: 'active', affectedCards: ['2019 Prizm Zion Williamson RC', '2024 Bowman 1st Ethan Salas']
  },
  {
    id: 'MS-006', signalName: 'Auction Snipe Reversal', category: 'bid-pattern',
    description: 'Detects undervalued auction endings from snipe failures and re-lists at fair value',
    alphaEstimate: 5.2, confidence: 65, sharpeRatio: 1.42, decayHalfLife: 7, winRate: 58.9,
    avgReturn: 8.4, sampleSize: 89, lastTriggered: '2026-04-15T22:00:00Z',
    status: 'decaying', affectedCards: ['2003 Topps Chrome LeBron RC']
  },
  {
    id: 'MS-007', signalName: 'Consignment Lag Exploit', category: 'listing-flow',
    description: 'Exploits pricing lag between consignment house listings and real-time market',
    alphaEstimate: 2.4, confidence: 76, sharpeRatio: 1.95, decayHalfLife: 18, winRate: 66.7,
    avgReturn: 3.6, sampleSize: 213, lastTriggered: '2026-04-16T15:30:00Z',
    status: 'active', affectedCards: ['2011 Topps Update Trout RC PSA 10', '2018 Optic Lamar Jackson']
  },
  {
    id: 'MS-008', signalName: 'New Listing Premium Decay', category: 'listing-flow',
    description: 'Shorts the premium on newly listed high-profile cards that fades within 48h',
    alphaEstimate: 3.5, confidence: 69, sharpeRatio: 1.55, decayHalfLife: 8, winRate: 60.2,
    avgReturn: 5.5, sampleSize: 167, lastTriggered: '2026-04-17T10:00:00Z',
    status: 'active', affectedCards: ['2024 Prizm Victor Wembanyama', '2023 Topps Chrome Corbin Carroll']
  },
  {
    id: 'MS-009', signalName: 'Cross-Platform Arbitrage', category: 'spread-dynamics',
    description: 'Captures price differentials between eBay, PWCC, and MySlabs for same card',
    alphaEstimate: 2.1, confidence: 88, sharpeRatio: 2.68, decayHalfLife: 5, winRate: 75.3,
    avgReturn: 3.1, sampleSize: 445, lastTriggered: '2026-04-17T13:00:00Z',
    status: 'decaying', affectedCards: ['2020 Panini Mosaic Burrow RC']
  },
  {
    id: 'MS-010', signalName: 'Grade Reveal Momentum', category: 'timing-anomaly',
    description: 'Buys raw cards pre-grading submission based on population report gaps',
    alphaEstimate: 6.8, confidence: 58, sharpeRatio: 1.22, decayHalfLife: 25, winRate: 55.4,
    avgReturn: 11.2, sampleSize: 78, lastTriggered: '2026-04-14T09:00:00Z',
    status: 'active', affectedCards: ['2024 Topps Chrome Draft Picks']
  },
  {
    id: 'MS-011', signalName: 'Seasonal Bid Pattern', category: 'bid-pattern',
    description: 'Captures seasonal bidding pattern shifts around NFL/NBA/MLB season transitions',
    alphaEstimate: 2.6, confidence: 81, sharpeRatio: 2.05, decayHalfLife: 45, winRate: 67.8,
    avgReturn: 3.9, sampleSize: 389, lastTriggered: '2026-04-10T08:00:00Z',
    status: 'active', affectedCards: ['2023 Panini Prizm CJ Stroud', '2022 Topps Series 1 Julio Rodriguez']
  },
  {
    id: 'MS-012', signalName: 'Whale Exit Detection', category: 'order-imbalance',
    description: 'Detects large holder liquidation patterns and front-runs the supply shock',
    alphaEstimate: 4.5, confidence: 62, sharpeRatio: 1.38, decayHalfLife: 6, winRate: 57.1,
    avgReturn: 7.8, sampleSize: 64, lastTriggered: '2026-04-12T16:00:00Z',
    status: 'decaying', affectedCards: ['2017 Panini Prizm Patrick Mahomes RC']
  },
  {
    id: 'MS-013', signalName: 'Thin Market Manipulation', category: 'order-imbalance',
    description: 'Identifies wash trading and artificial price inflation in low-volume cards',
    alphaEstimate: 1.5, confidence: 91, sharpeRatio: 3.12, decayHalfLife: 60, winRate: 79.5,
    avgReturn: 2.1, sampleSize: 612, lastTriggered: '2026-04-17T08:30:00Z',
    status: 'active', affectedCards: ['Various low-pop vintage']
  },
  {
    id: 'MS-014', signalName: 'Break Night Volatility Sell', category: 'timing-anomaly',
    description: 'Sells into volatility spikes during major hobby box break nights',
    alphaEstimate: 3.9, confidence: 74, sharpeRatio: 1.72, decayHalfLife: 3, winRate: 65.2,
    avgReturn: 5.8, sampleSize: 143, lastTriggered: '2026-04-11T20:00:00Z',
    status: 'expired', affectedCards: ['2024 Bowman Chrome', '2024 Prizm Football']
  },
  {
    id: 'MS-015', signalName: 'Population Report Front-Run', category: 'spread-dynamics',
    description: 'Trades ahead of PSA/BGS population report updates based on submission volume',
    alphaEstimate: 5.5, confidence: 60, sharpeRatio: 1.30, decayHalfLife: 15, winRate: 56.8,
    avgReturn: 9.2, sampleSize: 95, lastTriggered: '2026-04-16T12:00:00Z',
    status: 'active', affectedCards: ['2023 Bowman Chrome 1st Autos', '2024 Topps Series 1']
  }
];

const alphaOpportunities: AlphaOpportunity[] = [
  { id: 'AO-001', signalId: 'MS-003', signalName: 'Order Imbalance Momentum', cardName: '2018 Prizm Luka Doncic RC PSA 10', player: 'Luka Doncic', sport: 'Basketball', currentPrice: 4250, targetPrice: 4680, expectedReturn: 10.1, confidence: 82, timeHorizon: '3-5 days', urgency: 'critical', detectedAt: '2026-04-17T16:45:00Z', expiresAt: '2026-04-20T16:45:00Z' },
  { id: 'AO-002', signalId: 'MS-001', signalName: 'Bid Clustering Reversal', cardName: '2023 Bowman Chrome Wemby Auto', player: 'Victor Wembanyama', sport: 'Basketball', currentPrice: 8900, targetPrice: 9450, expectedReturn: 6.2, confidence: 78, timeHorizon: '5-7 days', urgency: 'high', detectedAt: '2026-04-17T14:30:00Z', expiresAt: '2026-04-22T14:30:00Z' },
  { id: 'AO-003', signalId: 'MS-005', signalName: 'Spread Compression Alpha', cardName: '2024 Bowman 1st Ethan Salas', player: 'Ethan Salas', sport: 'Baseball', currentPrice: 320, targetPrice: 358, expectedReturn: 11.9, confidence: 71, timeHorizon: '2-4 days', urgency: 'high', detectedAt: '2026-04-17T11:20:00Z', expiresAt: '2026-04-19T11:20:00Z' },
  { id: 'AO-004', signalId: 'MS-004', signalName: 'Weekend Listing Discount', cardName: '2023 Topps Chrome Elly De La Cruz', player: 'Elly De La Cruz', sport: 'Baseball', currentPrice: 185, targetPrice: 198, expectedReturn: 7.0, confidence: 85, timeHorizon: '1-2 days', urgency: 'medium', detectedAt: '2026-04-13T08:00:00Z', expiresAt: '2026-04-14T08:00:00Z' },
  { id: 'AO-005', signalId: 'MS-010', signalName: 'Grade Reveal Momentum', cardName: '2024 Topps Chrome Draft Picks Auto', player: 'Paul Skenes', sport: 'Baseball', currentPrice: 450, targetPrice: 540, expectedReturn: 20.0, confidence: 58, timeHorizon: '14-21 days', urgency: 'low', detectedAt: '2026-04-14T09:00:00Z', expiresAt: '2026-04-28T09:00:00Z' },
  { id: 'AO-006', signalId: 'MS-009', signalName: 'Cross-Platform Arbitrage', cardName: '2020 Panini Mosaic Burrow RC PSA 10', player: 'Joe Burrow', sport: 'Football', currentPrice: 275, targetPrice: 295, expectedReturn: 7.3, confidence: 88, timeHorizon: '1-2 days', urgency: 'critical', detectedAt: '2026-04-17T13:00:00Z', expiresAt: '2026-04-18T13:00:00Z' },
];

const signalDecays: SignalDecay[] = microstructureSignals.map(sig => {
  const days = 60;
  const curve: { day: number; alpha: number; cumReturn: number }[] = [];
  let cumReturn = 0;
  for (let d = 0; d <= days; d++) {
    const alpha = sig.alphaEstimate * Math.exp(-0.693 * d / sig.decayHalfLife);
    cumReturn += alpha * 0.01;
    curve.push({ day: d, alpha: Math.round(alpha * 100) / 100, cumReturn: Math.round(cumReturn * 100) / 100 });
  }
  const currentAlpha = sig.alphaEstimate * Math.exp(-0.693 * 5 / sig.decayHalfLife);
  let status: SignalDecay['status'] = 'fresh';
  if (currentAlpha < sig.alphaEstimate * 0.25) status = 'expired';
  else if (currentAlpha < sig.alphaEstimate * 0.5) status = 'near-expiry';
  else if (currentAlpha < sig.alphaEstimate * 0.8) status = 'decaying';
  return {
    signalId: sig.id,
    signalName: sig.signalName,
    initialAlpha: sig.alphaEstimate,
    currentAlpha: Math.round(currentAlpha * 100) / 100,
    decayRate: Math.round((1 - currentAlpha / sig.alphaEstimate) * 10000) / 100,
    halfLife: sig.decayHalfLife,
    decayCurve: curve,
    estimatedExpiry: `${Math.round(sig.decayHalfLife * 4)} days`,
    status
  };
});

const alphaHistory: AlphaHistory[] = [
  { month: '2025-05', totalAlpha: 18.2, signalsActive: 8, avgSharpe: 1.65, winRate: 61.2, cumReturn: 18.2 },
  { month: '2025-06', totalAlpha: 21.5, signalsActive: 9, avgSharpe: 1.78, winRate: 63.1, cumReturn: 39.7 },
  { month: '2025-07', totalAlpha: 15.8, signalsActive: 7, avgSharpe: 1.52, winRate: 59.8, cumReturn: 55.5 },
  { month: '2025-08', totalAlpha: 24.3, signalsActive: 11, avgSharpe: 1.92, winRate: 65.4, cumReturn: 79.8 },
  { month: '2025-09', totalAlpha: 19.7, signalsActive: 10, avgSharpe: 1.71, winRate: 62.5, cumReturn: 99.5 },
  { month: '2025-10', totalAlpha: 22.1, signalsActive: 12, avgSharpe: 1.88, winRate: 64.8, cumReturn: 121.6 },
  { month: '2025-11', totalAlpha: 26.8, signalsActive: 13, avgSharpe: 2.05, winRate: 67.2, cumReturn: 148.4 },
  { month: '2025-12', totalAlpha: 20.4, signalsActive: 10, avgSharpe: 1.76, winRate: 63.9, cumReturn: 168.8 },
  { month: '2026-01', totalAlpha: 28.1, signalsActive: 14, avgSharpe: 2.12, winRate: 68.1, cumReturn: 196.9 },
  { month: '2026-02', totalAlpha: 25.6, signalsActive: 13, avgSharpe: 1.98, winRate: 66.3, cumReturn: 222.5 },
  { month: '2026-03', totalAlpha: 30.2, signalsActive: 15, avgSharpe: 2.25, winRate: 69.5, cumReturn: 252.7 },
  { month: '2026-04', totalAlpha: 23.4, signalsActive: 12, avgSharpe: 1.85, winRate: 64.7, cumReturn: 276.1 },
];

export function getMicrostructureSignals(): MicrostructureSignal[] {
  return microstructureSignals;
}

export function getAlphaOpportunities(): AlphaOpportunity[] {
  return alphaOpportunities;
}

export function getSignalDecays(): SignalDecay[] {
  return signalDecays;
}

export function getAlphaHistory(): AlphaHistory[] {
  return alphaHistory;
}

export function getActiveSignalCount(): number {
  return microstructureSignals.filter(s => s.status === 'active').length;
}

export function getAvgAlphaEstimate(): number {
  const active = microstructureSignals.filter(s => s.status === 'active');
  return Math.round(active.reduce((sum, s) => sum + s.alphaEstimate, 0) / active.length * 100) / 100;
}

export function getTotalOpportunities(): number {
  return alphaOpportunities.length;
}

export function getAvgSharpe(): number {
  const active = microstructureSignals.filter(s => s.status === 'active');
  return Math.round(active.reduce((sum, s) => sum + s.sharpeRatio, 0) / active.length * 100) / 100;
}
