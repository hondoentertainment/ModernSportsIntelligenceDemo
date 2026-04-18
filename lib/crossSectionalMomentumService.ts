// ─────────────────────────────────────────────────────────────────────────────
// Cross-Sectional Momentum Scanner Service
// Ranks cards by relative momentum within peer groups
// ─────────────────────────────────────────────────────────────────────────────

export interface MomentumRanking {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  peerGroup: string;
  currentPrice: number;
  return1m: number;
  return3m: number;
  return6m: number;
  return12m: number;
  momentumScore: number;
  relativeRank: number;
  peerGroupSize: number;
  signal: 'strong-buy' | 'buy' | 'hold' | 'sell' | 'strong-sell';
  rebalanceAction: string;
}

export interface PeerGroup {
  id: string;
  groupName: string;
  category: 'sport' | 'era' | 'position' | 'grade-tier' | 'price-tier';
  memberCount: number;
  avgMomentum: number;
  topPerformer: string;
  bottomPerformer: string;
  dispersion: number;
  avgReturn3m: number;
  members: { player: string; momentumScore: number; return3m: number }[];
}

export interface RelativeStrength {
  cardId: string;
  cardName: string;
  player: string;
  rsScore: number;
  rsPercentile: number;
  vsMarket: number;
  vsPeerGroup: number;
  trend: 'accelerating' | 'steady' | 'decelerating' | 'reversing';
  rsHistory: { month: string; rs: number; peerAvg: number }[];
}

export interface MomentumHistory {
  month: string;
  topQuintileReturn: number;
  bottomQuintileReturn: number;
  spreadReturn: number;
  avgMomentumScore: number;
  rebalanceCount: number;
  turnover: number;
}

const momentumRankings: MomentumRanking[] = [
  { id: 'MR-01', cardName: '2023 Bowman Chrome Wemby 1st Auto PSA 10', player: 'Victor Wembanyama', sport: 'Basketball', peerGroup: 'Modern Basketball Stars', currentPrice: 8900, return1m: 8.5, return3m: 22.1, return6m: 35.8, return12m: 68.2, momentumScore: 95, relativeRank: 1, peerGroupSize: 8, signal: 'strong-buy', rebalanceAction: 'Maintain overweight position' },
  { id: 'MR-02', cardName: '2023 Topps Chrome Elly De La Cruz RC PSA 10', player: 'Elly De La Cruz', sport: 'Baseball', peerGroup: 'Modern Baseball Rookies', currentPrice: 185, return1m: 12.2, return3m: 28.5, return6m: 42.1, return12m: 55.3, momentumScore: 92, relativeRank: 1, peerGroupSize: 6, signal: 'strong-buy', rebalanceAction: 'Increase position by 20%' },
  { id: 'MR-03', cardName: '2017 Prizm Patrick Mahomes RC PSA 10', player: 'Patrick Mahomes', sport: 'Football', peerGroup: 'Elite QB Rookies', currentPrice: 18500, return1m: 5.2, return3m: 15.8, return6m: 22.5, return12m: 38.1, momentumScore: 88, relativeRank: 1, peerGroupSize: 5, signal: 'buy', rebalanceAction: 'Hold current weight' },
  { id: 'MR-04', cardName: '2024 Bowman 1st Ethan Salas Auto', player: 'Ethan Salas', sport: 'Baseball', peerGroup: 'Modern Baseball Rookies', currentPrice: 320, return1m: 15.8, return3m: 32.4, return6m: 48.2, return12m: 72.5, momentumScore: 96, relativeRank: 1, peerGroupSize: 6, signal: 'strong-buy', rebalanceAction: 'Increase position by 15%' },
  { id: 'MR-05', cardName: '2018 Prizm Luka Doncic RC PSA 10', player: 'Luka Doncic', sport: 'Basketball', peerGroup: 'Modern Basketball Stars', currentPrice: 4250, return1m: 3.8, return3m: 12.5, return6m: 18.2, return12m: 25.8, momentumScore: 78, relativeRank: 3, peerGroupSize: 8, signal: 'buy', rebalanceAction: 'Hold current weight' },
  { id: 'MR-06', cardName: '2023 Prizm CJ Stroud RC PSA 10', player: 'CJ Stroud', sport: 'Football', peerGroup: 'Elite QB Rookies', currentPrice: 165, return1m: 6.5, return3m: 18.2, return6m: 28.5, return12m: 42.1, momentumScore: 85, relativeRank: 2, peerGroupSize: 5, signal: 'buy', rebalanceAction: 'Increase position by 10%' },
  { id: 'MR-07', cardName: '2011 Topps Update Trout RC PSA 10', player: 'Mike Trout', sport: 'Baseball', peerGroup: 'Vintage/Established Stars', currentPrice: 42000, return1m: 1.2, return3m: 4.5, return6m: 8.2, return12m: 12.5, momentumScore: 55, relativeRank: 2, peerGroupSize: 5, signal: 'hold', rebalanceAction: 'Reduce to market weight' },
  { id: 'MR-08', cardName: '2020 Prizm Joe Burrow RC PSA 10', player: 'Joe Burrow', sport: 'Football', peerGroup: 'Elite QB Rookies', currentPrice: 275, return1m: 2.5, return3m: 8.8, return6m: 12.1, return12m: 18.5, momentumScore: 62, relativeRank: 3, peerGroupSize: 5, signal: 'hold', rebalanceAction: 'Hold current weight' },
  { id: 'MR-09', cardName: '2003 Topps Chrome LeBron RC PSA 10', player: 'LeBron James', sport: 'Basketball', peerGroup: 'Vintage/Established Stars', currentPrice: 185000, return1m: -1.5, return3m: 2.8, return6m: 5.5, return12m: 8.2, momentumScore: 42, relativeRank: 3, peerGroupSize: 5, signal: 'hold', rebalanceAction: 'Reduce to underweight' },
  { id: 'MR-10', cardName: '1986 Fleer Jordan RC PSA 9', player: 'Michael Jordan', sport: 'Basketball', peerGroup: 'Vintage/Established Stars', currentPrice: 28000, return1m: -2.1, return3m: 1.5, return6m: 4.2, return12m: 5.8, momentumScore: 35, relativeRank: 4, peerGroupSize: 5, signal: 'sell', rebalanceAction: 'Reduce position by 25%' },
  { id: 'MR-11', cardName: '2022 Topps Chrome Julio RC PSA 10', player: 'Julio Rodriguez', sport: 'Baseball', peerGroup: 'Modern Baseball Rookies', currentPrice: 145, return1m: -0.5, return3m: 5.2, return6m: 10.5, return12m: 15.2, momentumScore: 58, relativeRank: 3, peerGroupSize: 6, signal: 'hold', rebalanceAction: 'Hold current weight' },
  { id: 'MR-12', cardName: '2019 Prizm Zion Williamson RC PSA 10', player: 'Zion Williamson', sport: 'Basketball', peerGroup: 'Modern Basketball Stars', currentPrice: 280, return1m: -5.2, return3m: -8.5, return6m: -15.2, return12m: -22.8, momentumScore: 15, relativeRank: 8, peerGroupSize: 8, signal: 'strong-sell', rebalanceAction: 'Exit position entirely' },
  { id: 'MR-13', cardName: '2020 Prizm Justin Herbert RC PSA 10', player: 'Justin Herbert', sport: 'Football', peerGroup: 'Elite QB Rookies', currentPrice: 310, return1m: 1.8, return3m: 5.5, return6m: 8.8, return12m: 12.2, momentumScore: 52, relativeRank: 4, peerGroupSize: 5, signal: 'hold', rebalanceAction: 'Reduce to market weight' },
  { id: 'MR-14', cardName: '2024 Prizm Wemby Silver PSA 10', player: 'Victor Wembanyama', sport: 'Basketball', peerGroup: 'Modern Basketball Stars', currentPrice: 1250, return1m: 10.2, return3m: 25.5, return6m: 38.8, return12m: 62.5, momentumScore: 93, relativeRank: 2, peerGroupSize: 8, signal: 'strong-buy', rebalanceAction: 'Maintain overweight position' },
  { id: 'MR-15', cardName: '2019 Prizm Ja Morant RC PSA 10', player: 'Ja Morant', sport: 'Basketball', peerGroup: 'Modern Basketball Stars', currentPrice: 195, return1m: -3.8, return3m: -5.2, return6m: -8.5, return12m: -12.1, momentumScore: 22, relativeRank: 7, peerGroupSize: 8, signal: 'sell', rebalanceAction: 'Reduce position by 50%' },
  { id: 'MR-16', cardName: '2001 Bowman Chrome Pujols RC PSA 10', player: 'Albert Pujols', sport: 'Baseball', peerGroup: 'Vintage/Established Stars', currentPrice: 8200, return1m: 0.5, return3m: 3.8, return6m: 6.5, return12m: 10.2, momentumScore: 48, relativeRank: 3, peerGroupSize: 5, signal: 'hold', rebalanceAction: 'Hold current weight' },
  { id: 'MR-17', cardName: '2023 Bowman Chrome Corbin Carroll 1st Auto', player: 'Corbin Carroll', sport: 'Baseball', peerGroup: 'Modern Baseball Rookies', currentPrice: 95, return1m: -2.5, return3m: -5.8, return6m: -12.5, return12m: -18.2, momentumScore: 20, relativeRank: 6, peerGroupSize: 6, signal: 'strong-sell', rebalanceAction: 'Exit position entirely' },
  { id: 'MR-18', cardName: '1952 Topps Mantle SGC 3', player: 'Mickey Mantle', sport: 'Baseball', peerGroup: 'Vintage/Established Stars', currentPrice: 125000, return1m: 2.8, return3m: 6.5, return6m: 12.2, return12m: 18.5, momentumScore: 68, relativeRank: 1, peerGroupSize: 5, signal: 'buy', rebalanceAction: 'Increase to overweight' },
  { id: 'MR-19', cardName: '2022 Panini Select Ja Morant Purple', player: 'Ja Morant', sport: 'Basketball', peerGroup: 'Modern Basketball Stars', currentPrice: 85, return1m: -8.5, return3m: -15.2, return6m: -25.8, return12m: -35.2, momentumScore: 8, relativeRank: 8, peerGroupSize: 8, signal: 'strong-sell', rebalanceAction: 'Exit immediately - negative momentum accelerating' },
  { id: 'MR-20', cardName: '2023 Bowman Chrome Paul Skenes 1st Auto', player: 'Paul Skenes', sport: 'Baseball', peerGroup: 'Modern Baseball Rookies', currentPrice: 450, return1m: 8.5, return3m: 18.2, return6m: 32.5, return12m: 48.8, momentumScore: 88, relativeRank: 2, peerGroupSize: 6, signal: 'buy', rebalanceAction: 'Increase position by 15%' },
];

const peerGroups: PeerGroup[] = [
  {
    id: 'PG-01', groupName: 'Modern Basketball Stars', category: 'sport',
    memberCount: 8, avgMomentum: 54, topPerformer: 'Victor Wembanyama', bottomPerformer: 'Ja Morant',
    dispersion: 42.5, avgReturn3m: 6.2,
    members: [
      { player: 'Victor Wembanyama', momentumScore: 95, return3m: 22.1 },
      { player: 'Victor Wembanyama (Silver)', momentumScore: 93, return3m: 25.5 },
      { player: 'Luka Doncic', momentumScore: 78, return3m: 12.5 },
      { player: 'Chet Holmgren', momentumScore: 65, return3m: 8.8 },
      { player: 'Anthony Edwards', momentumScore: 58, return3m: 5.2 },
      { player: 'Zion Williamson', momentumScore: 15, return3m: -8.5 },
      { player: 'Ja Morant (Prizm)', momentumScore: 22, return3m: -5.2 },
      { player: 'Ja Morant (Select)', momentumScore: 8, return3m: -15.2 },
    ]
  },
  {
    id: 'PG-02', groupName: 'Modern Baseball Rookies', category: 'sport',
    memberCount: 6, avgMomentum: 62, topPerformer: 'Ethan Salas', bottomPerformer: 'Corbin Carroll',
    dispersion: 38.2, avgReturn3m: 13.1,
    members: [
      { player: 'Ethan Salas', momentumScore: 96, return3m: 32.4 },
      { player: 'Elly De La Cruz', momentumScore: 92, return3m: 28.5 },
      { player: 'Paul Skenes', momentumScore: 88, return3m: 18.2 },
      { player: 'Julio Rodriguez', momentumScore: 58, return3m: 5.2 },
      { player: 'Gunnar Henderson', momentumScore: 52, return3m: 4.5 },
      { player: 'Corbin Carroll', momentumScore: 20, return3m: -5.8 },
    ]
  },
  {
    id: 'PG-03', groupName: 'Elite QB Rookies', category: 'position',
    memberCount: 5, avgMomentum: 69, topPerformer: 'Patrick Mahomes', bottomPerformer: 'Justin Herbert',
    dispersion: 18.5, avgReturn3m: 11.3,
    members: [
      { player: 'Patrick Mahomes', momentumScore: 88, return3m: 15.8 },
      { player: 'CJ Stroud', momentumScore: 85, return3m: 18.2 },
      { player: 'Lamar Jackson', momentumScore: 72, return3m: 10.5 },
      { player: 'Joe Burrow', momentumScore: 62, return3m: 8.8 },
      { player: 'Justin Herbert', momentumScore: 52, return3m: 5.5 },
    ]
  },
  {
    id: 'PG-04', groupName: 'Vintage/Established Stars', category: 'era',
    memberCount: 5, avgMomentum: 50, topPerformer: 'Mickey Mantle', bottomPerformer: 'Michael Jordan',
    dispersion: 15.8, avgReturn3m: 3.8,
    members: [
      { player: 'Mickey Mantle', momentumScore: 68, return3m: 6.5 },
      { player: 'Mike Trout', momentumScore: 55, return3m: 4.5 },
      { player: 'Albert Pujols', momentumScore: 48, return3m: 3.8 },
      { player: 'LeBron James', momentumScore: 42, return3m: 2.8 },
      { player: 'Michael Jordan', momentumScore: 35, return3m: 1.5 },
    ]
  },
  {
    id: 'PG-05', groupName: 'High-Value Icons ($50K+)', category: 'price-tier',
    memberCount: 4, avgMomentum: 52, topPerformer: 'Mickey Mantle', bottomPerformer: 'Michael Jordan',
    dispersion: 22.1, avgReturn3m: 3.8,
    members: [
      { player: 'Mickey Mantle', momentumScore: 68, return3m: 6.5 },
      { player: 'Mike Trout', momentumScore: 55, return3m: 4.5 },
      { player: 'LeBron James', momentumScore: 42, return3m: 2.8 },
      { player: 'Derek Jeter', momentumScore: 38, return3m: 1.8 },
    ]
  },
];

const relativeStrengths: RelativeStrength[] = momentumRankings.slice(0, 10).map(mr => {
  const months: { month: string; rs: number; peerAvg: number }[] = [];
  let rs = mr.momentumScore - 20 + Math.random() * 15;
  for (let i = 11; i >= 0; i--) {
    const d = new Date(2026, 3 - i, 1);
    rs += (mr.momentumScore > 60 ? 1.5 : -0.8) + (Math.random() - 0.5) * 8;
    rs = Math.max(5, Math.min(99, rs));
    months.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      rs: Math.round(rs),
      peerAvg: Math.round(50 + (Math.random() - 0.5) * 15),
    });
  }
  return {
    cardId: mr.id,
    cardName: mr.cardName,
    player: mr.player,
    rsScore: mr.momentumScore,
    rsPercentile: Math.round((1 - mr.relativeRank / mr.peerGroupSize) * 100),
    vsMarket: mr.return3m - 5.2,
    vsPeerGroup: mr.return3m - (peerGroups.find(pg => pg.groupName === mr.peerGroup)?.avgReturn3m || 5),
    trend: mr.return1m > mr.return3m / 3 ? 'accelerating' as const :
      mr.return1m > 0 ? 'steady' as const :
      mr.return1m > -3 ? 'decelerating' as const : 'reversing' as const,
    rsHistory: months,
  };
});

const momentumHistory: MomentumHistory[] = [
  { month: '2025-05', topQuintileReturn: 8.5, bottomQuintileReturn: -4.2, spreadReturn: 12.7, avgMomentumScore: 52, rebalanceCount: 3, turnover: 18.5 },
  { month: '2025-06', topQuintileReturn: 9.2, bottomQuintileReturn: -3.8, spreadReturn: 13.0, avgMomentumScore: 54, rebalanceCount: 2, turnover: 15.2 },
  { month: '2025-07', topQuintileReturn: 6.8, bottomQuintileReturn: -5.5, spreadReturn: 12.3, avgMomentumScore: 50, rebalanceCount: 4, turnover: 22.1 },
  { month: '2025-08', topQuintileReturn: 11.2, bottomQuintileReturn: -2.8, spreadReturn: 14.0, avgMomentumScore: 56, rebalanceCount: 2, turnover: 14.8 },
  { month: '2025-09', topQuintileReturn: 7.5, bottomQuintileReturn: -6.2, spreadReturn: 13.7, avgMomentumScore: 48, rebalanceCount: 5, turnover: 25.5 },
  { month: '2025-10', topQuintileReturn: 10.1, bottomQuintileReturn: -3.5, spreadReturn: 13.6, avgMomentumScore: 55, rebalanceCount: 3, turnover: 19.2 },
  { month: '2025-11', topQuintileReturn: 5.8, bottomQuintileReturn: -7.8, spreadReturn: 13.6, avgMomentumScore: 45, rebalanceCount: 6, turnover: 28.5 },
  { month: '2025-12', topQuintileReturn: 12.5, bottomQuintileReturn: -1.5, spreadReturn: 14.0, avgMomentumScore: 58, rebalanceCount: 2, turnover: 12.8 },
  { month: '2026-01', topQuintileReturn: 8.8, bottomQuintileReturn: -4.5, spreadReturn: 13.3, avgMomentumScore: 53, rebalanceCount: 3, turnover: 17.5 },
  { month: '2026-02', topQuintileReturn: 9.5, bottomQuintileReturn: -3.2, spreadReturn: 12.7, avgMomentumScore: 55, rebalanceCount: 3, turnover: 16.8 },
  { month: '2026-03', topQuintileReturn: 10.8, bottomQuintileReturn: -5.1, spreadReturn: 15.9, avgMomentumScore: 52, rebalanceCount: 4, turnover: 21.2 },
  { month: '2026-04', topQuintileReturn: 9.2, bottomQuintileReturn: -4.8, spreadReturn: 14.0, avgMomentumScore: 54, rebalanceCount: 3, turnover: 18.5 },
];

export function getMomentumRankings(): MomentumRanking[] { return momentumRankings; }
export function getPeerGroups(): PeerGroup[] { return peerGroups; }
export function getRelativeStrengths(): RelativeStrength[] { return relativeStrengths; }
export function getMomentumHistory(): MomentumHistory[] { return momentumHistory; }
export function getStrongBuyCount(): number { return momentumRankings.filter(m => m.signal === 'strong-buy').length; }
export function getStrongSellCount(): number { return momentumRankings.filter(m => m.signal === 'strong-sell').length; }
export function getAvgMomentumScore(): number { return Math.round(momentumRankings.reduce((s, m) => s + m.momentumScore, 0) / momentumRankings.length); }
export function getAvgSpreadReturn(): number { return Math.round(momentumHistory.reduce((s, h) => s + h.spreadReturn, 0) / momentumHistory.length * 10) / 10; }
