// ---- Types ----

export type SignalType = 'long-spread' | 'short-spread' | 'neutral' | 'close-position';

export interface CointegrationPair {
  id: string;
  cardA: string;
  playerA: string;
  cardB: string;
  playerB: string;
  sport: string;
  pValue: number;
  halfLife: number;
  correlation: number;
  cointegrationScore: number;
  currentSpread: number;
  meanSpread: number;
  spreadZScore: number;
  status: 'active' | 'monitoring' | 'exhausted';
}

export interface PairStatistic {
  pairId: string;
  metric: string;
  value: number;
  percentile: number;
  interpretation: string;
}

export interface SpreadHistory {
  pairId: string;
  date: string;
  spread: number;
  zScore: number;
  upperBand: number;
  lowerBand: number;
  meanSpread: number;
}

export interface PairTradeSignal {
  id: string;
  pairId: string;
  signal: SignalType;
  date: string;
  spreadAtSignal: number;
  zScoreAtSignal: number;
  expectedReturn: number;
  confidence: number;
  reason: string;
}

// ---- Mock Data ----

const mockPairs: CointegrationPair[] = [
  { id: 'cp-1', cardA: '2023 Prizm Silver PSA 10', playerA: 'Victor Wembanyama', cardB: '2018 Prizm Silver PSA 10', playerB: 'Luka Doncic', sport: 'Basketball', pValue: 0.012, halfLife: 18, correlation: 0.87, cointegrationScore: 94, currentSpread: 8450, meanSpread: 7200, spreadZScore: 1.85, status: 'active' },
  { id: 'cp-2', cardA: '2024 Topps Chrome Auto PSA 10', playerA: 'Paul Skenes', cardB: '2022 Topps Chrome Auto PSA 10', playerB: 'Julio Rodriguez', sport: 'Baseball', pValue: 0.024, halfLife: 22, correlation: 0.82, cointegrationScore: 88, currentSpread: 920, meanSpread: 1100, spreadZScore: -1.42, status: 'active' },
  { id: 'cp-3', cardA: '2023 Prizm Base PSA 10', playerA: 'Caleb Williams', cardB: '2020 Prizm Base PSA 10', playerB: 'Joe Burrow', sport: 'Football', pValue: 0.031, halfLife: 15, correlation: 0.79, cointegrationScore: 85, currentSpread: 82, meanSpread: 65, spreadZScore: 1.68, status: 'active' },
  { id: 'cp-4', cardA: '2023 Bowman Chrome 1st Auto PSA 10', playerA: 'Jackson Holliday', cardB: '2019 Bowman Chrome 1st Auto PSA 10', playerB: 'Wander Franco', sport: 'Baseball', pValue: 0.018, halfLife: 28, correlation: 0.84, cointegrationScore: 91, currentSpread: 2780, meanSpread: 2200, spreadZScore: 2.12, status: 'active' },
  { id: 'cp-5', cardA: '2020 Select Concourse PSA 10', playerA: 'Justin Herbert', cardB: '2021 Donruss Rated Rookie PSA 10', playerB: 'Trevor Lawrence', sport: 'Football', pValue: 0.042, halfLife: 12, correlation: 0.76, cointegrationScore: 80, currentSpread: 58, meanSpread: 72, spreadZScore: -1.24, status: 'monitoring' },
  { id: 'cp-6', cardA: '2019 Mosaic Base PSA 10', playerA: 'Ja Morant', cardB: '2022 Prizm Silver PSA 10', playerB: 'Paolo Banchero', sport: 'Basketball', pValue: 0.035, halfLife: 20, correlation: 0.74, cointegrationScore: 82, currentSpread: -24, meanSpread: -15, spreadZScore: -0.88, status: 'monitoring' },
  { id: 'cp-7', cardA: '2023 Topps Chrome Auto PSA 10', playerA: 'Corbin Carroll', cardB: '2022 Topps Chrome Auto PSA 10', playerB: 'Adley Rutschman', sport: 'Baseball', pValue: 0.028, halfLife: 16, correlation: 0.81, cointegrationScore: 86, currentSpread: 628, meanSpread: 510, spreadZScore: 1.56, status: 'active' },
  { id: 'cp-8', cardA: '2023 Select Concourse PSA 10', playerA: 'CJ Stroud', cardB: '2023 Prizm Base PSA 10', playerB: 'Caleb Williams', sport: 'Football', pValue: 0.015, halfLife: 10, correlation: 0.88, cointegrationScore: 93, currentSpread: 78, meanSpread: 55, spreadZScore: 2.34, status: 'active' },
  { id: 'cp-9', cardA: '2020 Topps Chrome Sapphire PSA 10', playerA: 'Bo Bichette', cardB: '2019 Topps Chrome Update Auto PSA 10', playerB: 'Yordan Alvarez', sport: 'Baseball', pValue: 0.038, halfLife: 24, correlation: 0.72, cointegrationScore: 79, currentSpread: -225, meanSpread: -180, spreadZScore: -1.15, status: 'monitoring' },
  { id: 'cp-10', cardA: '2021 Bowman Chrome 1st PSA 10', playerA: 'Marcelo Mayer', cardB: '2022 Bowman Chrome 1st PSA 10', playerB: 'Druw Jones', sport: 'Baseball', pValue: 0.022, halfLife: 19, correlation: 0.83, cointegrationScore: 89, currentSpread: 12, meanSpread: 18, spreadZScore: -0.72, status: 'monitoring' },
  { id: 'cp-11', cardA: '2023 Optic Rated Rookie PSA 10', playerA: 'Victor Wembanyama', cardB: '2023 Prizm Silver PSA 10', playerB: 'Victor Wembanyama', sport: 'Basketball', pValue: 0.008, halfLife: 8, correlation: 0.94, cointegrationScore: 97, currentSpread: -245, meanSpread: -200, spreadZScore: -1.48, status: 'active' },
  { id: 'cp-12', cardA: '2024 Topps 1st Edition Auto PSA 10', playerA: 'Paul Skenes', cardB: '2024 Topps Chrome Auto PSA 10', playerB: 'Paul Skenes', sport: 'Baseball', pValue: 0.006, halfLife: 6, correlation: 0.96, cointegrationScore: 98, currentSpread: 420, meanSpread: 380, spreadZScore: 1.12, status: 'active' },
];

const mockSpreadHistories: SpreadHistory[] = [];
mockPairs.forEach(pair => {
  for (let i = 0; i < 30; i++) {
    const date = new Date(2026, 2, 20 + i);
    const dayStr = date.toISOString().split('T')[0];
    const noise = (Math.random() - 0.5) * Math.abs(pair.meanSpread) * 0.3;
    const spread = pair.meanSpread + noise + (pair.currentSpread - pair.meanSpread) * (i / 30);
    const band = Math.abs(pair.meanSpread) * 0.25;
    mockSpreadHistories.push({
      pairId: pair.id,
      date: dayStr,
      spread: Math.round(spread * 100) / 100,
      zScore: Math.round(((spread - pair.meanSpread) / (band / 1.5)) * 100) / 100,
      upperBand: pair.meanSpread + band,
      lowerBand: pair.meanSpread - band,
      meanSpread: pair.meanSpread,
    });
  }
});

const mockSignals: PairTradeSignal[] = [
  { id: 'pts-1', pairId: 'cp-8', signal: 'short-spread', date: '2026-04-17', spreadAtSignal: 78, zScoreAtSignal: 2.34, expectedReturn: 8.2, confidence: 0.84, reason: 'Spread exceeds 2 standard deviations - mean reversion expected' },
  { id: 'pts-2', pairId: 'cp-4', signal: 'short-spread', date: '2026-04-16', spreadAtSignal: 2780, zScoreAtSignal: 2.12, expectedReturn: 6.8, confidence: 0.79, reason: 'Holliday premium expanded beyond historical norms' },
  { id: 'pts-3', pairId: 'cp-1', signal: 'short-spread', date: '2026-04-15', spreadAtSignal: 8450, zScoreAtSignal: 1.85, expectedReturn: 5.4, confidence: 0.72, reason: 'Wembanyama premium stretched relative to Doncic' },
  { id: 'pts-4', pairId: 'cp-2', signal: 'long-spread', date: '2026-04-14', spreadAtSignal: 920, zScoreAtSignal: -1.42, expectedReturn: 4.8, confidence: 0.76, reason: 'Skenes discount to Rodriguez wider than justified' },
  { id: 'pts-5', pairId: 'cp-11', signal: 'long-spread', date: '2026-04-13', spreadAtSignal: -245, zScoreAtSignal: -1.48, expectedReturn: 5.1, confidence: 0.81, reason: 'Optic underpriced relative to Prizm Silver for same player' },
  { id: 'pts-6', pairId: 'cp-3', signal: 'short-spread', date: '2026-04-12', spreadAtSignal: 82, zScoreAtSignal: 1.68, expectedReturn: 4.2, confidence: 0.71, reason: 'Williams premium over Burrow elevated by draft hype' },
  { id: 'pts-7', pairId: 'cp-7', signal: 'short-spread', date: '2026-04-10', spreadAtSignal: 628, zScoreAtSignal: 1.56, expectedReturn: 3.8, confidence: 0.68, reason: 'Carroll-Rutschman spread widening unsustainable' },
  { id: 'pts-8', pairId: 'cp-5', signal: 'long-spread', date: '2026-04-08', spreadAtSignal: 58, zScoreAtSignal: -1.24, expectedReturn: 3.2, confidence: 0.65, reason: 'Herbert discount to Lawrence approaching entry threshold' },
];

const mockStats: PairStatistic[] = [];
mockPairs.forEach(pair => {
  mockStats.push(
    { pairId: pair.id, metric: 'Engle-Granger p-value', value: pair.pValue, percentile: (1 - pair.pValue) * 100, interpretation: pair.pValue < 0.05 ? 'Statistically significant cointegration' : 'Weak cointegration' },
    { pairId: pair.id, metric: 'Half-life (days)', value: pair.halfLife, percentile: Math.max(0, 100 - pair.halfLife * 2.5), interpretation: pair.halfLife < 15 ? 'Fast mean reversion' : pair.halfLife < 25 ? 'Moderate reversion speed' : 'Slow reversion' },
    { pairId: pair.id, metric: 'Correlation', value: pair.correlation, percentile: pair.correlation * 100, interpretation: pair.correlation > 0.85 ? 'Very strong co-movement' : pair.correlation > 0.75 ? 'Strong co-movement' : 'Moderate co-movement' },
  );
});

// ---- Getter Functions ----

export function getCointegrationPairs(): CointegrationPair[] {
  return mockPairs;
}

export function getActivePairs(): CointegrationPair[] {
  return mockPairs.filter(p => p.status === 'active');
}

export function getPairStatistics(): PairStatistic[] {
  return mockStats;
}

export function getSpreadHistory(pairId: string): SpreadHistory[] {
  return mockSpreadHistories.filter(s => s.pairId === pairId);
}

export function getAllSpreadHistories(): SpreadHistory[] {
  return mockSpreadHistories;
}

export function getTradeSignals(): PairTradeSignal[] {
  return mockSignals;
}

export function getPairById(id: string): CointegrationPair | undefined {
  return mockPairs.find(p => p.id === id);
}
