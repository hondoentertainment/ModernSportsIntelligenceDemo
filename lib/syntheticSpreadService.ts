// ─────────────────────────────────────────────────────────────────────────────
// Synthetic Spread Engine Service
// Creates synthetic spread trades between sports card positions
// ─────────────────────────────────────────────────────────────────────────────

export interface SpreadTrade {
  id: string;
  spreadName: string;
  type: 'calendar' | 'grade' | 'cross-sport' | 'era' | 'intra-set';
  longLeg: { cardName: string; player: string; price: number; quantity: number };
  shortLeg: { cardName: string; player: string; price: number; quantity: number };
  entrySpread: number;
  currentSpread: number;
  targetSpread: number;
  unrealizedPnL: number;
  maxLoss: number;
  status: 'active' | 'profit-target' | 'stop-loss' | 'closed';
  openDate: string;
  daysOpen: number;
  riskScore: number;
}

export interface SyntheticPosition {
  id: string;
  positionName: string;
  components: { cardName: string; weight: number; direction: 'long' | 'short'; notional: number }[];
  netExposure: number;
  grossExposure: number;
  beta: number;
  expectedReturn: number;
  risk: number;
  sharpeRatio: number;
}

export interface SpreadPnL {
  tradeId: string;
  tradeName: string;
  dailyPnL: { date: string; pnl: number; cumPnl: number; spread: number }[];
  totalPnL: number;
  maxDrawdown: number;
  sharpe: number;
  winDays: number;
  lossDays: number;
}

export interface SpreadHistory {
  month: string;
  activeSpreads: number;
  closedSpreads: number;
  totalPnL: number;
  avgReturn: number;
  winRate: number;
  cumPnL: number;
}

const spreadTrades: SpreadTrade[] = [
  {
    id: 'ST-01', spreadName: 'Wemby Grade Spread', type: 'grade',
    longLeg: { cardName: '2023 Prizm Wemby RC PSA 9', player: 'Victor Wembanyama', price: 185, quantity: 5 },
    shortLeg: { cardName: '2023 Prizm Wemby RC PSA 10', player: 'Victor Wembanyama', price: 450, quantity: 2 },
    entrySpread: 0.41, currentSpread: 0.45, targetSpread: 0.55, unrealizedPnL: 145, maxLoss: -200,
    status: 'active', openDate: '2026-03-28', daysOpen: 21, riskScore: 35
  },
  {
    id: 'ST-02', spreadName: 'QB Class Calendar Spread', type: 'calendar',
    longLeg: { cardName: '2023 Prizm CJ Stroud RC', player: 'CJ Stroud', price: 165, quantity: 3 },
    shortLeg: { cardName: '2024 Prizm Caleb Williams RC', player: 'Caleb Williams', price: 120, quantity: 4 },
    entrySpread: 1.38, currentSpread: 1.52, targetSpread: 1.75, unrealizedPnL: 85, maxLoss: -150,
    status: 'active', openDate: '2026-04-02', daysOpen: 16, riskScore: 42
  },
  {
    id: 'ST-03', spreadName: 'Cross-Sport Superstar', type: 'cross-sport',
    longLeg: { cardName: '2018 Prizm Luka Doncic RC PSA 10', player: 'Luka Doncic', price: 4250, quantity: 1 },
    shortLeg: { cardName: '2020 Prizm Joe Burrow RC PSA 10', player: 'Joe Burrow', price: 275, quantity: 15 },
    entrySpread: 1.03, currentSpread: 0.98, targetSpread: 0.85, unrealizedPnL: -210, maxLoss: -500,
    status: 'active', openDate: '2026-03-15', daysOpen: 34, riskScore: 58
  },
  {
    id: 'ST-04', spreadName: 'Vintage vs Modern Era', type: 'era',
    longLeg: { cardName: '1986 Fleer Jordan RC PSA 8', player: 'Michael Jordan', price: 8500, quantity: 1 },
    shortLeg: { cardName: '2003 Topps Chrome LeBron RC SGC 8', player: 'LeBron James', price: 12000, quantity: 1 },
    entrySpread: 0.71, currentSpread: 0.75, targetSpread: 0.85, unrealizedPnL: 480, maxLoss: -800,
    status: 'active', openDate: '2026-02-20', daysOpen: 57, riskScore: 48
  },
  {
    id: 'ST-05', spreadName: 'Bowman Chrome Intra-Set', type: 'intra-set',
    longLeg: { cardName: '2024 Bowman 1st Ethan Salas Auto', player: 'Ethan Salas', price: 320, quantity: 3 },
    shortLeg: { cardName: '2024 Bowman 1st Roman Anthony Auto', player: 'Roman Anthony', price: 185, quantity: 5 },
    entrySpread: 1.04, currentSpread: 1.12, targetSpread: 1.35, unrealizedPnL: 115, maxLoss: -180,
    status: 'active', openDate: '2026-04-05', daysOpen: 13, riskScore: 38
  },
  {
    id: 'ST-06', spreadName: 'Trout Grade Arbitrage', type: 'grade',
    longLeg: { cardName: '2011 Topps Update Trout RC BGS 9.5', player: 'Mike Trout', price: 18500, quantity: 1 },
    shortLeg: { cardName: '2011 Topps Update Trout RC PSA 10', player: 'Mike Trout', price: 42000, quantity: 1 },
    entrySpread: 0.44, currentSpread: 0.42, targetSpread: 0.50, unrealizedPnL: -840, maxLoss: -2000,
    status: 'active', openDate: '2026-03-01', daysOpen: 48, riskScore: 62
  },
  {
    id: 'ST-07', spreadName: 'NFL Draft Class Spread', type: 'calendar',
    longLeg: { cardName: '2022 Prizm Brock Purdy RC PSA 10', player: 'Brock Purdy', price: 125, quantity: 8 },
    shortLeg: { cardName: '2023 Prizm CJ Stroud RC PSA 10', player: 'CJ Stroud', price: 165, quantity: 6 },
    entrySpread: 1.01, currentSpread: 0.95, targetSpread: 0.80, unrealizedPnL: -58, maxLoss: -250,
    status: 'active', openDate: '2026-04-10', daysOpen: 8, riskScore: 45
  },
  {
    id: 'ST-08', spreadName: 'Basketball Generational', type: 'cross-sport',
    longLeg: { cardName: '2019 Prizm Ja Morant RC PSA 10', player: 'Ja Morant', price: 195, quantity: 5 },
    shortLeg: { cardName: '2019 Prizm Zion RC PSA 10', player: 'Zion Williamson', price: 280, quantity: 3 },
    entrySpread: 1.16, currentSpread: 1.25, targetSpread: 1.50, unrealizedPnL: 135, maxLoss: -200,
    status: 'profit-target', openDate: '2026-03-20', daysOpen: 29, riskScore: 32
  },
  {
    id: 'ST-09', spreadName: 'Hobby Box Era Spread', type: 'era',
    longLeg: { cardName: '2001 Bowman Chrome Pujols RC PSA 10', player: 'Albert Pujols', price: 8200, quantity: 1 },
    shortLeg: { cardName: '1993 SP Jeter RC PSA 10', player: 'Derek Jeter', price: 42000, quantity: 1 },
    entrySpread: 0.20, currentSpread: 0.18, targetSpread: 0.25, unrealizedPnL: -840, maxLoss: -1500,
    status: 'active', openDate: '2026-02-15', daysOpen: 62, riskScore: 55
  },
  {
    id: 'ST-10', spreadName: 'MLB Prospect Spread', type: 'intra-set',
    longLeg: { cardName: '2023 Bowman Chrome Elly 1st Auto', player: 'Elly De La Cruz', price: 420, quantity: 2 },
    shortLeg: { cardName: '2023 Bowman Chrome Corbin 1st Auto', player: 'Corbin Carroll', price: 280, quantity: 3 },
    entrySpread: 1.0, currentSpread: 1.08, targetSpread: 1.25, unrealizedPnL: 68, maxLoss: -160,
    status: 'active', openDate: '2026-04-08', daysOpen: 10, riskScore: 30
  },
];

const syntheticPositions: SyntheticPosition[] = [
  {
    id: 'SP-01', positionName: 'Market-Neutral Basketball',
    components: [
      { cardName: 'Wemby PSA 10 Basket', weight: 0.35, direction: 'long', notional: 8900 },
      { cardName: 'Luka PSA 10', weight: 0.35, direction: 'long', notional: 4250 },
      { cardName: 'Zion PSA 10', weight: -0.15, direction: 'short', notional: 280 },
      { cardName: 'Ja Morant PSA 10', weight: -0.15, direction: 'short', notional: 195 },
    ],
    netExposure: 0.40, grossExposure: 1.0, beta: 0.15, expectedReturn: 8.5, risk: 12.2, sharpeRatio: 0.70
  },
  {
    id: 'SP-02', positionName: 'Vintage Value Extraction',
    components: [
      { cardName: 'Jordan PSA 9', weight: 0.5, direction: 'long', notional: 28000 },
      { cardName: 'LeBron PSA 10', weight: -0.3, direction: 'short', notional: 185000 },
      { cardName: 'Mantle SGC 3', weight: 0.2, direction: 'long', notional: 125000 },
    ],
    netExposure: 0.40, grossExposure: 1.0, beta: -0.05, expectedReturn: 5.2, risk: 15.8, sharpeRatio: 0.33
  },
];

const spreadPnLs: SpreadPnL[] = spreadTrades.slice(0, 5).map(st => {
  const days = st.daysOpen;
  const daily: { date: string; pnl: number; cumPnl: number; spread: number }[] = [];
  let cumPnl = 0;
  let spread = st.entrySpread;
  const direction = st.currentSpread > st.entrySpread ? 1 : -1;
  for (let d = 0; d < days; d++) {
    const date = new Date(2026, 3, 18 - days + d);
    const dailyPnl = Math.round((Math.random() * 40 - 15) * direction);
    cumPnl += dailyPnl;
    spread += (Math.random() - 0.45) * 0.02 * direction;
    daily.push({
      date: date.toISOString().split('T')[0],
      pnl: dailyPnl,
      cumPnl,
      spread: Math.round(spread * 1000) / 1000,
    });
  }
  return {
    tradeId: st.id,
    tradeName: st.spreadName,
    dailyPnL: daily,
    totalPnL: st.unrealizedPnL,
    maxDrawdown: Math.round(Math.min(...daily.map(d => d.cumPnl))),
    sharpe: Math.round((st.unrealizedPnL / Math.abs(st.maxLoss)) * 100) / 100,
    winDays: daily.filter(d => d.pnl > 0).length,
    lossDays: daily.filter(d => d.pnl < 0).length,
  };
});

const spreadHistory: SpreadHistory[] = [
  { month: '2025-05', activeSpreads: 4, closedSpreads: 1, totalPnL: 850, avgReturn: 4.2, winRate: 75, cumPnL: 850 },
  { month: '2025-06', activeSpreads: 5, closedSpreads: 2, totalPnL: 1120, avgReturn: 5.1, winRate: 60, cumPnL: 1970 },
  { month: '2025-07', activeSpreads: 6, closedSpreads: 1, totalPnL: -280, avgReturn: -1.8, winRate: 33, cumPnL: 1690 },
  { month: '2025-08', activeSpreads: 7, closedSpreads: 3, totalPnL: 1580, avgReturn: 6.5, winRate: 71, cumPnL: 3270 },
  { month: '2025-09', activeSpreads: 6, closedSpreads: 2, totalPnL: 920, avgReturn: 3.8, winRate: 67, cumPnL: 4190 },
  { month: '2025-10', activeSpreads: 8, closedSpreads: 2, totalPnL: 1350, avgReturn: 5.5, winRate: 75, cumPnL: 5540 },
  { month: '2025-11', activeSpreads: 9, closedSpreads: 3, totalPnL: -450, avgReturn: -2.1, winRate: 44, cumPnL: 5090 },
  { month: '2025-12', activeSpreads: 8, closedSpreads: 4, totalPnL: 2100, avgReturn: 7.2, winRate: 80, cumPnL: 7190 },
  { month: '2026-01', activeSpreads: 9, closedSpreads: 2, totalPnL: 1250, avgReturn: 4.8, winRate: 67, cumPnL: 8440 },
  { month: '2026-02', activeSpreads: 10, closedSpreads: 3, totalPnL: 1680, avgReturn: 5.8, winRate: 70, cumPnL: 10120 },
  { month: '2026-03', activeSpreads: 10, closedSpreads: 2, totalPnL: 980, avgReturn: 3.5, winRate: 60, cumPnL: 11100 },
  { month: '2026-04', activeSpreads: 10, closedSpreads: 1, totalPnL: 420, avgReturn: 2.8, winRate: 65, cumPnL: 11520 },
];

export function getSpreadTrades(): SpreadTrade[] { return spreadTrades; }
export function getSyntheticPositions(): SyntheticPosition[] { return syntheticPositions; }
export function getSpreadPnLs(): SpreadPnL[] { return spreadPnLs; }
export function getSpreadHistory(): SpreadHistory[] { return spreadHistory; }
export function getActiveSpreadCount(): number { return spreadTrades.filter(s => s.status === 'active').length; }
export function getTotalUnrealizedPnL(): number { return spreadTrades.reduce((s, t) => s + t.unrealizedPnL, 0); }
export function getAvgRiskScore(): number { return Math.round(spreadTrades.reduce((s, t) => s + t.riskScore, 0) / spreadTrades.length); }
export function getCumulativeSpreadPnL(): number { return spreadHistory[spreadHistory.length - 1].cumPnL; }
