// ─────────────────────────────────────────────────────────────────────────────
// Liquidity Premium Decomposer Service
// Separates liquidity premium from fundamental value in card pricing
// ─────────────────────────────────────────────────────────────────────────────

export interface LiquidityPremium {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  grade: string;
  marketPrice: number;
  fundamentalValue: number;
  liquidityPremium: number;
  liquidityPremiumPct: number;
  liquidityScore: number;
  avgDaysToSell: number;
  activeListings: number;
  recentSales30d: number;
  bidAskSpread: number;
  venue: string;
}

export interface PremiumDecomposition {
  cardId: string;
  cardName: string;
  totalPrice: number;
  fundamentalValue: number;
  liquidityPremium: number;
  scarcityPremium: number;
  narrativePremium: number;
  gradePremium: number;
  venuePremium: number;
  components: { name: string; value: number; pct: number }[];
}

export interface LiquidityScore {
  cardId: string;
  cardName: string;
  player: string;
  overallScore: number;
  volumeScore: number;
  spreadScore: number;
  depthScore: number;
  velocityScore: number;
  platformScore: number;
  tier: 'ultra-liquid' | 'liquid' | 'moderate' | 'illiquid' | 'frozen';
  trend: 'improving' | 'stable' | 'deteriorating';
}

export interface PremiumHistory {
  month: string;
  avgLiquidityPremiumPct: number;
  medianPremiumPct: number;
  avgSpread: number;
  totalVolume: number;
  avgDaysToSell: number;
  premiumDispersion: number;
}

const liquidityPremiums: LiquidityPremium[] = [
  { id: 'LP-01', cardName: '2018 Prizm Luka Doncic RC PSA 10', player: 'Luka Doncic', sport: 'Basketball', grade: 'PSA 10', marketPrice: 4250, fundamentalValue: 3680, liquidityPremium: 570, liquidityPremiumPct: 13.4, liquidityScore: 92, avgDaysToSell: 1.2, activeListings: 28, recentSales30d: 85, bidAskSpread: 3.2, venue: 'eBay' },
  { id: 'LP-02', cardName: '2011 Topps Update Trout RC PSA 10', player: 'Mike Trout', sport: 'Baseball', grade: 'PSA 10', marketPrice: 42000, fundamentalValue: 38500, liquidityPremium: 3500, liquidityPremiumPct: 8.3, liquidityScore: 78, avgDaysToSell: 4.5, activeListings: 5, recentSales30d: 8, bidAskSpread: 6.8, venue: 'PWCC' },
  { id: 'LP-03', cardName: '2017 Prizm Mahomes RC PSA 10', player: 'Patrick Mahomes', sport: 'Football', grade: 'PSA 10', marketPrice: 18500, fundamentalValue: 15800, liquidityPremium: 2700, liquidityPremiumPct: 14.6, liquidityScore: 88, avgDaysToSell: 1.8, activeListings: 15, recentSales30d: 42, bidAskSpread: 4.1, venue: 'eBay' },
  { id: 'LP-04', cardName: '2003 Topps Chrome LeBron RC PSA 10', player: 'LeBron James', sport: 'Basketball', grade: 'PSA 10', marketPrice: 185000, fundamentalValue: 172000, liquidityPremium: 13000, liquidityPremiumPct: 7.0, liquidityScore: 72, avgDaysToSell: 8.5, activeListings: 3, recentSales30d: 2, bidAskSpread: 8.5, venue: 'Goldin' },
  { id: 'LP-05', cardName: '2023 Bowman Chrome Wemby 1st Auto', player: 'Victor Wembanyama', sport: 'Basketball', grade: 'PSA 10', marketPrice: 8900, fundamentalValue: 7200, liquidityPremium: 1700, liquidityPremiumPct: 19.1, liquidityScore: 95, avgDaysToSell: 0.5, activeListings: 42, recentSales30d: 120, bidAskSpread: 2.1, venue: 'eBay' },
  { id: 'LP-06', cardName: '2020 Prizm Justin Herbert RC PSA 10', player: 'Justin Herbert', sport: 'Football', grade: 'PSA 10', marketPrice: 310, fundamentalValue: 275, liquidityPremium: 35, liquidityPremiumPct: 11.3, liquidityScore: 85, avgDaysToSell: 2.0, activeListings: 35, recentSales30d: 65, bidAskSpread: 4.5, venue: 'eBay' },
  { id: 'LP-07', cardName: '1986 Fleer Michael Jordan RC PSA 9', player: 'Michael Jordan', sport: 'Basketball', grade: 'PSA 9', marketPrice: 28000, fundamentalValue: 26500, liquidityPremium: 1500, liquidityPremiumPct: 5.4, liquidityScore: 68, avgDaysToSell: 6.2, activeListings: 8, recentSales30d: 5, bidAskSpread: 7.2, venue: 'Heritage' },
  { id: 'LP-08', cardName: '2024 Bowman 1st Ethan Salas Auto', player: 'Ethan Salas', sport: 'Baseball', grade: 'Raw', marketPrice: 320, fundamentalValue: 245, liquidityPremium: 75, liquidityPremiumPct: 23.4, liquidityScore: 90, avgDaysToSell: 1.0, activeListings: 55, recentSales30d: 92, bidAskSpread: 3.8, venue: 'eBay' },
  { id: 'LP-09', cardName: '2001 Bowman Chrome Pujols RC PSA 10', player: 'Albert Pujols', sport: 'Baseball', grade: 'PSA 10', marketPrice: 8200, fundamentalValue: 7800, liquidityPremium: 400, liquidityPremiumPct: 4.9, liquidityScore: 58, avgDaysToSell: 12.5, activeListings: 4, recentSales30d: 3, bidAskSpread: 9.5, venue: 'Goldin' },
  { id: 'LP-10', cardName: '2023 Prizm CJ Stroud RC PSA 10', player: 'CJ Stroud', sport: 'Football', grade: 'PSA 10', marketPrice: 165, fundamentalValue: 140, liquidityPremium: 25, liquidityPremiumPct: 15.2, liquidityScore: 87, avgDaysToSell: 1.5, activeListings: 48, recentSales30d: 78, bidAskSpread: 3.5, venue: 'eBay' },
  { id: 'LP-11', cardName: '1952 Topps Mickey Mantle SGC 3', player: 'Mickey Mantle', sport: 'Baseball', grade: 'SGC 3', marketPrice: 125000, fundamentalValue: 122000, liquidityPremium: 3000, liquidityPremiumPct: 2.4, liquidityScore: 35, avgDaysToSell: 45, activeListings: 1, recentSales30d: 0, bidAskSpread: 18.5, venue: 'Heritage' },
  { id: 'LP-12', cardName: '2022 Topps Chrome Julio RC PSA 10', player: 'Julio Rodriguez', sport: 'Baseball', grade: 'PSA 10', marketPrice: 145, fundamentalValue: 125, liquidityPremium: 20, liquidityPremiumPct: 13.8, liquidityScore: 83, avgDaysToSell: 2.5, activeListings: 32, recentSales30d: 55, bidAskSpread: 5.2, venue: 'eBay' },
  { id: 'LP-13', cardName: '2019 Prizm Zion Williamson RC PSA 10', player: 'Zion Williamson', sport: 'Basketball', grade: 'PSA 10', marketPrice: 280, fundamentalValue: 250, liquidityPremium: 30, liquidityPremiumPct: 10.7, liquidityScore: 80, avgDaysToSell: 3.0, activeListings: 22, recentSales30d: 38, bidAskSpread: 5.8, venue: 'eBay' },
  { id: 'LP-14', cardName: '2024 Prizm Wemby Silver PSA 10', player: 'Victor Wembanyama', sport: 'Basketball', grade: 'PSA 10', marketPrice: 1250, fundamentalValue: 980, liquidityPremium: 270, liquidityPremiumPct: 21.6, liquidityScore: 93, avgDaysToSell: 0.8, activeListings: 38, recentSales30d: 95, bidAskSpread: 2.5, venue: 'eBay' },
  { id: 'LP-15', cardName: '1993 SP Derek Jeter RC PSA 10', player: 'Derek Jeter', sport: 'Baseball', grade: 'PSA 10', marketPrice: 42000, fundamentalValue: 40200, liquidityPremium: 1800, liquidityPremiumPct: 4.3, liquidityScore: 55, avgDaysToSell: 18, activeListings: 2, recentSales30d: 1, bidAskSpread: 12.0, venue: 'Heritage' },
  { id: 'LP-16', cardName: '2023 Topps Chrome Elly RC PSA 10', player: 'Elly De La Cruz', sport: 'Baseball', grade: 'PSA 10', marketPrice: 185, fundamentalValue: 155, liquidityPremium: 30, liquidityPremiumPct: 16.2, liquidityScore: 86, avgDaysToSell: 1.8, activeListings: 40, recentSales30d: 68, bidAskSpread: 4.0, venue: 'eBay' },
];

const premiumDecompositions: PremiumDecomposition[] = liquidityPremiums.slice(0, 8).map(lp => {
  const liquidity = lp.liquidityPremium;
  const scarcity = Math.round(lp.fundamentalValue * (0.1 + Math.random() * 0.15));
  const narrative = Math.round(lp.fundamentalValue * (0.05 + Math.random() * 0.1));
  const grade = Math.round(lp.fundamentalValue * (0.08 + Math.random() * 0.12));
  const venue = Math.round(lp.marketPrice * (0.01 + Math.random() * 0.03));
  const fundamental = lp.marketPrice - liquidity - scarcity - narrative - grade - venue;
  const total = lp.marketPrice;

  return {
    cardId: lp.id,
    cardName: lp.cardName,
    totalPrice: total,
    fundamentalValue: fundamental,
    liquidityPremium: liquidity,
    scarcityPremium: scarcity,
    narrativePremium: narrative,
    gradePremium: grade,
    venuePremium: venue,
    components: [
      { name: 'Fundamental', value: fundamental, pct: Math.round(fundamental / total * 1000) / 10 },
      { name: 'Liquidity', value: liquidity, pct: Math.round(liquidity / total * 1000) / 10 },
      { name: 'Scarcity', value: scarcity, pct: Math.round(scarcity / total * 1000) / 10 },
      { name: 'Narrative', value: narrative, pct: Math.round(narrative / total * 1000) / 10 },
      { name: 'Grade', value: grade, pct: Math.round(grade / total * 1000) / 10 },
      { name: 'Venue', value: venue, pct: Math.round(venue / total * 1000) / 10 },
    ],
  };
});

const liquidityScores: LiquidityScore[] = liquidityPremiums.map(lp => {
  const tier = lp.liquidityScore >= 90 ? 'ultra-liquid' as const :
    lp.liquidityScore >= 75 ? 'liquid' as const :
    lp.liquidityScore >= 50 ? 'moderate' as const :
    lp.liquidityScore >= 25 ? 'illiquid' as const : 'frozen' as const;
  const trend = lp.liquidityScore >= 85 ? 'improving' as const :
    lp.liquidityScore >= 60 ? 'stable' as const : 'deteriorating' as const;

  return {
    cardId: lp.id,
    cardName: lp.cardName,
    player: lp.player,
    overallScore: lp.liquidityScore,
    volumeScore: Math.min(100, Math.round(lp.recentSales30d / 1.2)),
    spreadScore: Math.min(100, Math.round(100 - lp.bidAskSpread * 5)),
    depthScore: Math.min(100, Math.round(lp.activeListings * 2.5)),
    velocityScore: Math.min(100, Math.round(100 - lp.avgDaysToSell * 2)),
    platformScore: Math.round(70 + Math.random() * 25),
    tier,
    trend,
  };
});

const premiumHistory: PremiumHistory[] = [
  { month: '2025-05', avgLiquidityPremiumPct: 10.8, medianPremiumPct: 9.5, avgSpread: 5.8, totalVolume: 4250, avgDaysToSell: 5.2, premiumDispersion: 6.2 },
  { month: '2025-06', avgLiquidityPremiumPct: 11.2, medianPremiumPct: 10.1, avgSpread: 5.5, totalVolume: 4680, avgDaysToSell: 4.8, premiumDispersion: 6.5 },
  { month: '2025-07', avgLiquidityPremiumPct: 12.5, medianPremiumPct: 11.0, avgSpread: 5.2, totalVolume: 5100, avgDaysToSell: 4.5, premiumDispersion: 7.1 },
  { month: '2025-08', avgLiquidityPremiumPct: 11.8, medianPremiumPct: 10.5, avgSpread: 5.4, totalVolume: 4890, avgDaysToSell: 4.6, premiumDispersion: 6.8 },
  { month: '2025-09', avgLiquidityPremiumPct: 10.5, medianPremiumPct: 9.2, avgSpread: 5.9, totalVolume: 4120, avgDaysToSell: 5.5, premiumDispersion: 5.9 },
  { month: '2025-10', avgLiquidityPremiumPct: 11.0, medianPremiumPct: 9.8, avgSpread: 5.6, totalVolume: 4450, avgDaysToSell: 5.0, premiumDispersion: 6.3 },
  { month: '2025-11', avgLiquidityPremiumPct: 12.8, medianPremiumPct: 11.5, avgSpread: 5.0, totalVolume: 5350, avgDaysToSell: 4.2, premiumDispersion: 7.4 },
  { month: '2025-12', avgLiquidityPremiumPct: 13.5, medianPremiumPct: 12.2, avgSpread: 4.8, totalVolume: 5800, avgDaysToSell: 3.8, premiumDispersion: 7.8 },
  { month: '2026-01', avgLiquidityPremiumPct: 12.2, medianPremiumPct: 10.8, avgSpread: 5.1, totalVolume: 5200, avgDaysToSell: 4.3, premiumDispersion: 7.0 },
  { month: '2026-02', avgLiquidityPremiumPct: 11.5, medianPremiumPct: 10.2, avgSpread: 5.3, totalVolume: 4750, avgDaysToSell: 4.7, premiumDispersion: 6.5 },
  { month: '2026-03', avgLiquidityPremiumPct: 12.0, medianPremiumPct: 10.5, avgSpread: 5.2, totalVolume: 4980, avgDaysToSell: 4.5, premiumDispersion: 6.8 },
  { month: '2026-04', avgLiquidityPremiumPct: 11.8, medianPremiumPct: 10.3, avgSpread: 5.4, totalVolume: 4850, avgDaysToSell: 4.6, premiumDispersion: 6.6 },
];

export function getLiquidityPremiums(): LiquidityPremium[] { return liquidityPremiums; }
export function getPremiumDecompositions(): PremiumDecomposition[] { return premiumDecompositions; }
export function getLiquidityScores(): LiquidityScore[] { return liquidityScores; }
export function getPremiumHistory(): PremiumHistory[] { return premiumHistory; }
export function getAvgLiquidityPremium(): number { return Math.round(liquidityPremiums.reduce((s, l) => s + l.liquidityPremiumPct, 0) / liquidityPremiums.length * 10) / 10; }
export function getHighestPremiumCard(): string { const max = liquidityPremiums.reduce((a, b) => a.liquidityPremiumPct > b.liquidityPremiumPct ? a : b); return max.player; }
export function getAvgLiquidityScore(): number { return Math.round(liquidityPremiums.reduce((s, l) => s + l.liquidityScore, 0) / liquidityPremiums.length); }
export function getUltraLiquidCount(): number { return liquidityPremiums.filter(l => l.liquidityScore >= 90).length; }
