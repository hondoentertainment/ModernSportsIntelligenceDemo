// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// Liquidity Depth Scanner Service
// Analyzes real-time market depth, bid-ask spreads, volume profiles, and
// time-to-sale metrics for sports card liquidity intelligence.
// ─────────────────────────────────────────────────────────────────────────────

export type LiquidityTier = 'ultra-liquid' | 'liquid' | 'moderate' | 'illiquid' | 'frozen';

export type ExitMethod = 'auction' | 'buy-it-now' | 'consignment' | 'dealer' | 'trade' | 'fractional';

export type PressureDirection = 'buy' | 'sell' | 'neutral';

export type CrisisSeverity = 'watch' | 'warning' | 'critical';

export interface VolumePoint {
  date: string;
  volume: number;
  avgPrice: number;
  highPrice: number;
  lowPrice: number;
}

export interface DepthLevel {
  priceLevel: number;
  bidVolume: number;
  askVolume: number;
  cumulativeBid: number;
  cumulativeAsk: number;
}

export interface ExitStrategy {
  method: ExitMethod;
  estimatedPrice: number;
  estimatedTime: string;
  fees: number;
  netProceeds: number;
  confidence: number;
  pros: string[];
  cons: string[];
}

export interface LiquidityProfile {
  cardId: string;
  cardName: string;
  player: string;
  sport: string;
  currentValue: number;
  liquidityScore: number;
  liquidityTier: LiquidityTier;
  avgDaysToSell: number;
  bidAskSpread: number;
  volumeProfile: VolumePoint[];
  depthLevels: DepthLevel[];
  bestExitStrategy: ExitStrategy;
  marketMakerPresence: boolean;
  activeListings: number;
  recentSales30d: number;
  buyerSellerRatio: number;
  platformDiversity: number;
  seasonalIndex: number;
}

export interface LiquidityCrisis {
  cardId: string;
  cardName: string;
  player: string;
  severity: CrisisSeverity;
  triggers: string[];
  recommendation: string;
  estimatedRecovery: string;
  currentLiquidityScore: number;
  previousLiquidityScore: number;
  detectedAt: string;
}

export interface MarketDepthSnapshot {
  timestamp: string;
  totalBidDepth: number;
  totalAskDepth: number;
  imbalanceRatio: number;
  pressureDirection: PressureDirection;
}

export interface PortfolioLiquidity {
  totalValue: number;
  liquidValue: number;
  illiquidValue: number;
  weightedLiquidityScore: number;
  timeToFullLiquidation: string;
  optimalLiquidationOrder: { cardId: string; order: number; reason: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function tierFromScore(score: number): LiquidityTier {
  if (score >= 85) return 'ultra-liquid';
  if (score >= 65) return 'liquid';
  if (score >= 40) return 'moderate';
  if (score >= 20) return 'illiquid';
  return 'frozen';
}

function generateVolumeHistory(months: number, baseVolume: number, basePrice: number, volatility: number): VolumePoint[] {
  const points: VolumePoint[] = [];
  const now = new Date(2026, 2, 15);
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const seasonal = 1 + 0.15 * Math.sin((d.getMonth() / 12) * Math.PI * 2 - Math.PI / 2);
    const trend = 1 + (months - i) * 0.008;
    const noise = 0.85 + Math.random() * 0.3;
    const vol = Math.round(baseVolume * seasonal * trend * noise);
    const avg = Math.round(basePrice * (1 + (Math.random() - 0.45) * volatility) * 100) / 100;
    const high = Math.round(avg * (1 + Math.random() * volatility * 0.5) * 100) / 100;
    const low = Math.round(avg * (1 - Math.random() * volatility * 0.5) * 100) / 100;
    points.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      volume: vol,
      avgPrice: avg,
      highPrice: high,
      lowPrice: low,
    });
  }
  return points;
}

function generateDepthLevels(currentValue: number, liquidityScore: number): DepthLevel[] {
  const levels: DepthLevel[] = [];
  const spread = currentValue * (0.02 + (100 - liquidityScore) * 0.003);
  const midpoint = currentValue;
  const steps = 10;
  let cumBid = 0;
  let cumAsk = 0;

  for (let i = steps; i >= 1; i--) {
    const pct = i / steps;
    const bidPrice = Math.round((midpoint - spread / 2 - spread * pct) * 100) / 100;
    const askPrice = Math.round((midpoint + spread / 2 + spread * pct) * 100) / 100;
    const bidVol = Math.round((liquidityScore / 100) * (3 + Math.random() * 8) * pct);
    const askVol = Math.round((liquidityScore / 100) * (2 + Math.random() * 7) * pct);
    cumBid += bidVol;
    cumAsk += askVol;
    levels.push({ priceLevel: bidPrice, bidVolume: bidVol, askVolume: 0, cumulativeBid: cumBid, cumulativeAsk: 0 });
    levels.push({ priceLevel: askPrice, bidVolume: 0, askVolume: askVol, cumulativeBid: 0, cumulativeAsk: cumAsk });
  }

  // near-the-money levels
  const nearBidVol = Math.round((liquidityScore / 100) * (5 + Math.random() * 12));
  const nearAskVol = Math.round((liquidityScore / 100) * (4 + Math.random() * 10));
  cumBid += nearBidVol;
  cumAsk += nearAskVol;
  levels.push({
    priceLevel: Math.round((midpoint - spread / 2) * 100) / 100,
    bidVolume: nearBidVol,
    askVolume: 0,
    cumulativeBid: cumBid,
    cumulativeAsk: 0,
  });
  levels.push({
    priceLevel: Math.round((midpoint + spread / 2) * 100) / 100,
    bidVolume: 0,
    askVolume: nearAskVol,
    cumulativeBid: 0,
    cumulativeAsk: cumAsk,
  });

  return levels.sort((a, b) => a.priceLevel - b.priceLevel);
}

function buildExitStrategies(currentValue: number, liquidityScore: number, avgDaysToSell: number): ExitStrategy[] {
  const auctionFeeRate = 0.13;
  const binFeeRate = 0.13;
  const consignmentFeeRate = 0.10;
  const dealerDiscount = 0.20;
  const tradePremium = 0.05;
  const fractionalFeeRate = 0.08;

  const auctionPrice = currentValue * (0.92 + (liquidityScore / 100) * 0.16);
  const binPrice = currentValue * (0.98 + (liquidityScore / 100) * 0.08);
  const consignPrice = currentValue * (1.0 + (liquidityScore / 100) * 0.05);
  const dealerPrice = currentValue * (1 - dealerDiscount);
  const tradePrice = currentValue * (1 + tradePremium);
  const fractionalPrice = currentValue * 1.02;

  return [
    {
      method: 'auction',
      estimatedPrice: Math.round(auctionPrice * 100) / 100,
      estimatedTime: `${Math.max(3, Math.round(avgDaysToSell * 0.6))} days`,
      fees: Math.round(auctionPrice * auctionFeeRate * 100) / 100,
      netProceeds: Math.round(auctionPrice * (1 - auctionFeeRate) * 100) / 100,
      confidence: Math.min(95, liquidityScore + 5),
      pros: ['Price discovery through bidding competition', 'Fast turnaround for desirable cards', 'Wide buyer exposure on major platforms'],
      cons: ['Risk of selling below market if low bidder turnout', 'Final value fees reduce proceeds', 'No price floor guarantee without reserve'],
    },
    {
      method: 'buy-it-now',
      estimatedPrice: Math.round(binPrice * 100) / 100,
      estimatedTime: `${Math.max(1, Math.round(avgDaysToSell * 0.8))} days`,
      fees: Math.round(binPrice * binFeeRate * 100) / 100,
      netProceeds: Math.round(binPrice * (1 - binFeeRate) * 100) / 100,
      confidence: Math.min(90, liquidityScore),
      pros: ['Set your own price', 'Immediate sale when buyer found', 'Good for accurately priced cards'],
      cons: ['May sit longer if priced too high', 'Platform fees still apply', 'Requires monitoring and repricing'],
    },
    {
      method: 'consignment',
      estimatedPrice: Math.round(consignPrice * 100) / 100,
      estimatedTime: `${Math.max(14, Math.round(avgDaysToSell * 1.5))} days`,
      fees: Math.round(consignPrice * consignmentFeeRate * 100) / 100,
      netProceeds: Math.round(consignPrice * (1 - consignmentFeeRate) * 100) / 100,
      confidence: Math.min(85, liquidityScore - 5),
      pros: ['Professional marketing and photography', 'Access to premium buyer networks', 'Hands-off selling experience'],
      cons: ['Longer timeline to sale', 'Commission fees reduce net proceeds', 'Less control over final price'],
    },
    {
      method: 'dealer',
      estimatedPrice: Math.round(dealerPrice * 100) / 100,
      estimatedTime: '1-2 days',
      fees: 0,
      netProceeds: Math.round(dealerPrice * 100) / 100,
      confidence: 95,
      pros: ['Fastest cash-in-hand option', 'No fees or commissions', 'Guaranteed sale'],
      cons: ['Typically 15-25% below market value', 'Dealers cherry-pick desirable cards', 'Poor option for common cards'],
    },
    {
      method: 'trade',
      estimatedPrice: Math.round(tradePrice * 100) / 100,
      estimatedTime: `${Math.max(5, Math.round(avgDaysToSell * 0.9))} days`,
      fees: 0,
      netProceeds: Math.round(tradePrice * 100) / 100,
      confidence: Math.min(75, liquidityScore - 10),
      pros: ['Can get above-market value in trade', 'No platform fees', 'Build relationships with other collectors'],
      cons: ['Requires finding matching trade partner', 'Valuation disputes common', 'Shipping risk on both sides'],
    },
    {
      method: 'fractional',
      estimatedPrice: Math.round(fractionalPrice * 100) / 100,
      estimatedTime: `${Math.max(7, Math.round(avgDaysToSell * 1.2))} days`,
      fees: Math.round(fractionalPrice * fractionalFeeRate * 100) / 100,
      netProceeds: Math.round(fractionalPrice * (1 - fractionalFeeRate) * 100) / 100,
      confidence: Math.min(70, liquidityScore - 15),
      pros: ['Access to larger buyer pool via fractional shares', 'Potential premium over whole-card sale', 'Retain partial ownership optionally'],
      cons: ['Platform fees and lockup periods', 'Regulatory complexity', 'Limited to high-value cards typically $500+'],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Card Catalog (25+ cards with full liquidity profiles)
// ─────────────────────────────────────────────────────────────────────────────

interface CardSeed {
  cardId: string;
  cardName: string;
  player: string;
  sport: string;
  currentValue: number;
  liquidityScore: number;
  avgDaysToSell: number;
  bidAskSpread: number;
  marketMakerPresence: boolean;
  activeListings: number;
  recentSales30d: number;
  buyerSellerRatio: number;
  platformDiversity: number;
  seasonalIndex: number;
  baseVolume: number;
  volatility: number;
}

const CARD_SEEDS: CardSeed[] = [
  { cardId: 'LD001', cardName: '2018 Prizm Silver #280 RC', player: 'Luka Doncic', sport: 'basketball', currentValue: 3250, liquidityScore: 94, avgDaysToSell: 1.2, bidAskSpread: 0.018, marketMakerPresence: true, activeListings: 187, recentSales30d: 312, buyerSellerRatio: 2.8, platformDiversity: 0.92, seasonalIndex: 1.15, baseVolume: 280, volatility: 0.12 },
  { cardId: 'LD002', cardName: '2020 Prizm Silver #1 RC', player: 'Justin Herbert', sport: 'football', currentValue: 485, liquidityScore: 88, avgDaysToSell: 2.1, bidAskSpread: 0.025, marketMakerPresence: true, activeListings: 134, recentSales30d: 198, buyerSellerRatio: 2.1, platformDiversity: 0.88, seasonalIndex: 1.32, baseVolume: 180, volatility: 0.15 },
  { cardId: 'LD003', cardName: '2011 Topps Update #US175 RC', player: 'Mike Trout', sport: 'baseball', currentValue: 88500, liquidityScore: 72, avgDaysToSell: 8.5, bidAskSpread: 0.035, marketMakerPresence: true, activeListings: 23, recentSales30d: 11, buyerSellerRatio: 1.8, platformDiversity: 0.78, seasonalIndex: 1.05, baseVolume: 12, volatility: 0.18 },
  { cardId: 'LD004', cardName: '2018 Optic Rated Rookie #176', player: 'Saquon Barkley', sport: 'football', currentValue: 42, liquidityScore: 82, avgDaysToSell: 2.8, bidAskSpread: 0.045, marketMakerPresence: false, activeListings: 245, recentSales30d: 156, buyerSellerRatio: 1.5, platformDiversity: 0.85, seasonalIndex: 1.2, baseVolume: 140, volatility: 0.2 },
  { cardId: 'LD005', cardName: '2019 Prizm Base #248 RC', player: 'Zion Williamson', sport: 'basketball', currentValue: 125, liquidityScore: 86, avgDaysToSell: 1.8, bidAskSpread: 0.03, marketMakerPresence: true, activeListings: 298, recentSales30d: 267, buyerSellerRatio: 1.9, platformDiversity: 0.9, seasonalIndex: 1.08, baseVolume: 240, volatility: 0.22 },
  { cardId: 'LD006', cardName: '1986 Fleer #57 RC', player: 'Michael Jordan', sport: 'basketball', currentValue: 42000, liquidityScore: 78, avgDaysToSell: 6.2, bidAskSpread: 0.04, marketMakerPresence: true, activeListings: 45, recentSales30d: 28, buyerSellerRatio: 2.5, platformDiversity: 0.82, seasonalIndex: 0.95, baseVolume: 25, volatility: 0.14 },
  { cardId: 'LD007', cardName: '2020 Mosaic #201 RC', player: 'Joe Burrow', sport: 'football', currentValue: 68, liquidityScore: 80, avgDaysToSell: 2.5, bidAskSpread: 0.038, marketMakerPresence: false, activeListings: 189, recentSales30d: 142, buyerSellerRatio: 1.7, platformDiversity: 0.86, seasonalIndex: 1.28, baseVolume: 130, volatility: 0.18 },
  { cardId: 'LD008', cardName: '2003 Topps Chrome #111 RC Refractor', player: 'LeBron James', sport: 'basketball', currentValue: 175000, liquidityScore: 58, avgDaysToSell: 21, bidAskSpread: 0.065, marketMakerPresence: true, activeListings: 5, recentSales30d: 2, buyerSellerRatio: 3.2, platformDiversity: 0.55, seasonalIndex: 0.98, baseVolume: 3, volatility: 0.16 },
  { cardId: 'LD009', cardName: '2022 Bowman Chrome #BCP-1 1st', player: 'Jackson Holliday', sport: 'baseball', currentValue: 320, liquidityScore: 74, avgDaysToSell: 4.5, bidAskSpread: 0.042, marketMakerPresence: false, activeListings: 78, recentSales30d: 56, buyerSellerRatio: 1.6, platformDiversity: 0.72, seasonalIndex: 1.18, baseVolume: 50, volatility: 0.28 },
  { cardId: 'LD010', cardName: '2023 Topps Chrome #150 RC', player: 'Corbin Carroll', sport: 'baseball', currentValue: 95, liquidityScore: 76, avgDaysToSell: 3.8, bidAskSpread: 0.04, marketMakerPresence: false, activeListings: 112, recentSales30d: 89, buyerSellerRatio: 1.4, platformDiversity: 0.76, seasonalIndex: 1.12, baseVolume: 80, volatility: 0.24 },
  { cardId: 'LD011', cardName: '2015 Prizm Silver #335 RC', player: 'Devin Booker', sport: 'basketball', currentValue: 1850, liquidityScore: 70, avgDaysToSell: 5.5, bidAskSpread: 0.048, marketMakerPresence: true, activeListings: 34, recentSales30d: 22, buyerSellerRatio: 1.9, platformDiversity: 0.74, seasonalIndex: 1.05, baseVolume: 20, volatility: 0.2 },
  { cardId: 'LD012', cardName: '2017 Panini National Treasures #101 RPA /99', player: 'Patrick Mahomes', sport: 'football', currentValue: 145000, liquidityScore: 45, avgDaysToSell: 35, bidAskSpread: 0.085, marketMakerPresence: true, activeListings: 3, recentSales30d: 1, buyerSellerRatio: 4.5, platformDiversity: 0.42, seasonalIndex: 1.35, baseVolume: 2, volatility: 0.22 },
  { cardId: 'LD013', cardName: '2019 Topps Chrome Sapphire #410 RC', player: 'Fernando Tatis Jr.', sport: 'baseball', currentValue: 280, liquidityScore: 52, avgDaysToSell: 12, bidAskSpread: 0.06, marketMakerPresence: false, activeListings: 42, recentSales30d: 15, buyerSellerRatio: 0.9, platformDiversity: 0.62, seasonalIndex: 0.88, baseVolume: 14, volatility: 0.35 },
  { cardId: 'LD014', cardName: '2005 Topps Chrome #190 RC', player: 'Aaron Rodgers', sport: 'football', currentValue: 625, liquidityScore: 55, avgDaysToSell: 14, bidAskSpread: 0.055, marketMakerPresence: false, activeListings: 28, recentSales30d: 12, buyerSellerRatio: 1.1, platformDiversity: 0.68, seasonalIndex: 1.22, baseVolume: 11, volatility: 0.2 },
  { cardId: 'LD015', cardName: '2024 Topps Series 1 #1 RC', player: 'Paul Skenes', sport: 'baseball', currentValue: 48, liquidityScore: 91, avgDaysToSell: 1.5, bidAskSpread: 0.022, marketMakerPresence: true, activeListings: 456, recentSales30d: 523, buyerSellerRatio: 2.3, platformDiversity: 0.94, seasonalIndex: 1.25, baseVolume: 450, volatility: 0.25 },
  { cardId: 'LD016', cardName: '2023 Prizm Silver #281 RC', player: 'Victor Wembanyama', sport: 'basketball', currentValue: 1420, liquidityScore: 92, avgDaysToSell: 1.3, bidAskSpread: 0.02, marketMakerPresence: true, activeListings: 210, recentSales30d: 385, buyerSellerRatio: 3.1, platformDiversity: 0.93, seasonalIndex: 1.1, baseVolume: 350, volatility: 0.18 },
  { cardId: 'LD017', cardName: '1952 Topps #311', player: 'Mickey Mantle', sport: 'baseball', currentValue: 2850000, liquidityScore: 15, avgDaysToSell: 180, bidAskSpread: 0.15, marketMakerPresence: false, activeListings: 1, recentSales30d: 0, buyerSellerRatio: 8.0, platformDiversity: 0.15, seasonalIndex: 0.92, baseVolume: 0.3, volatility: 0.1 },
  { cardId: 'LD018', cardName: '2018 Topps Chrome Update #HMT25 RC', player: 'Ronald Acuna Jr.', sport: 'baseball', currentValue: 185, liquidityScore: 79, avgDaysToSell: 3.2, bidAskSpread: 0.032, marketMakerPresence: false, activeListings: 95, recentSales30d: 72, buyerSellerRatio: 1.6, platformDiversity: 0.82, seasonalIndex: 1.15, baseVolume: 65, volatility: 0.19 },
  { cardId: 'LD019', cardName: '2022 Prizm Silver #275 RC', player: 'Paolo Banchero', sport: 'basketball', currentValue: 210, liquidityScore: 73, avgDaysToSell: 4.8, bidAskSpread: 0.044, marketMakerPresence: false, activeListings: 67, recentSales30d: 45, buyerSellerRatio: 1.3, platformDiversity: 0.75, seasonalIndex: 1.02, baseVolume: 40, volatility: 0.26 },
  { cardId: 'LD020', cardName: '2020 Panini Flawless #25 /20 RPA', player: 'Justin Herbert', sport: 'football', currentValue: 32000, liquidityScore: 32, avgDaysToSell: 45, bidAskSpread: 0.095, marketMakerPresence: false, activeListings: 2, recentSales30d: 0, buyerSellerRatio: 2.8, platformDiversity: 0.35, seasonalIndex: 1.3, baseVolume: 1, volatility: 0.2 },
  { cardId: 'LD021', cardName: '2024 Bowman Chrome #BDC-50 1st Auto /25', player: 'Ethan Salas', sport: 'baseball', currentValue: 4200, liquidityScore: 38, avgDaysToSell: 28, bidAskSpread: 0.08, marketMakerPresence: false, activeListings: 4, recentSales30d: 2, buyerSellerRatio: 3.5, platformDiversity: 0.45, seasonalIndex: 1.08, baseVolume: 2, volatility: 0.32 },
  { cardId: 'LD022', cardName: '2023 Donruss Optic Rated Rookie #201', player: 'CJ Stroud', sport: 'football', currentValue: 78, liquidityScore: 84, avgDaysToSell: 2.2, bidAskSpread: 0.028, marketMakerPresence: true, activeListings: 165, recentSales30d: 189, buyerSellerRatio: 2.0, platformDiversity: 0.88, seasonalIndex: 1.3, baseVolume: 170, volatility: 0.17 },
  { cardId: 'LD023', cardName: '2018 National Treasures #161 RPA /99', player: 'Luka Doncic', sport: 'basketball', currentValue: 95000, liquidityScore: 42, avgDaysToSell: 38, bidAskSpread: 0.09, marketMakerPresence: true, activeListings: 4, recentSales30d: 1, buyerSellerRatio: 5.2, platformDiversity: 0.4, seasonalIndex: 1.12, baseVolume: 1.5, volatility: 0.2 },
  { cardId: 'LD024', cardName: '2019 Mosaic Base #209 RC', player: 'Ja Morant', sport: 'basketball', currentValue: 32, liquidityScore: 68, avgDaysToSell: 5.8, bidAskSpread: 0.06, marketMakerPresence: false, activeListings: 312, recentSales30d: 98, buyerSellerRatio: 0.85, platformDiversity: 0.78, seasonalIndex: 0.92, baseVolume: 90, volatility: 0.3 },
  { cardId: 'LD025', cardName: '1993 SP Foil #279 RC', player: 'Derek Jeter', sport: 'baseball', currentValue: 8500, liquidityScore: 62, avgDaysToSell: 9.5, bidAskSpread: 0.052, marketMakerPresence: false, activeListings: 18, recentSales30d: 8, buyerSellerRatio: 1.7, platformDiversity: 0.7, seasonalIndex: 0.98, baseVolume: 7, volatility: 0.14 },
  { cardId: 'LD026', cardName: '2025 Prizm Silver #301 RC', player: 'Cooper Flagg', sport: 'basketball', currentValue: 680, liquidityScore: 89, avgDaysToSell: 1.8, bidAskSpread: 0.024, marketMakerPresence: true, activeListings: 178, recentSales30d: 290, buyerSellerRatio: 2.6, platformDiversity: 0.91, seasonalIndex: 1.2, baseVolume: 260, volatility: 0.3 },
  { cardId: 'LD027', cardName: '2021 Topps Chrome #27 RC', player: 'Bobby Witt Jr.', sport: 'baseball', currentValue: 155, liquidityScore: 77, avgDaysToSell: 3.5, bidAskSpread: 0.035, marketMakerPresence: false, activeListings: 88, recentSales30d: 64, buyerSellerRatio: 1.5, platformDiversity: 0.8, seasonalIndex: 1.12, baseVolume: 58, volatility: 0.21 },
  { cardId: 'LD028', cardName: '2020 Prizm Base #151 RC', player: 'Anthony Edwards', sport: 'basketball', currentValue: 385, liquidityScore: 87, avgDaysToSell: 1.9, bidAskSpread: 0.026, marketMakerPresence: true, activeListings: 156, recentSales30d: 203, buyerSellerRatio: 2.2, platformDiversity: 0.89, seasonalIndex: 1.08, baseVolume: 185, volatility: 0.16 },
];

function buildProfile(seed: CardSeed): LiquidityProfile {
  const volumeProfile = generateVolumeHistory(12, seed.baseVolume, seed.currentValue, seed.volatility);
  const depthLevels = generateDepthLevels(seed.currentValue, seed.liquidityScore);
  const strategies = buildExitStrategies(seed.currentValue, seed.liquidityScore, seed.avgDaysToSell);
  const best = strategies.reduce((a, b) => (a.netProceeds > b.netProceeds ? a : b));

  return {
    cardId: seed.cardId,
    cardName: seed.cardName,
    player: seed.player,
    sport: seed.sport,
    currentValue: seed.currentValue,
    liquidityScore: seed.liquidityScore,
    liquidityTier: tierFromScore(seed.liquidityScore),
    avgDaysToSell: seed.avgDaysToSell,
    bidAskSpread: seed.bidAskSpread,
    volumeProfile,
    depthLevels,
    bestExitStrategy: best,
    marketMakerPresence: seed.marketMakerPresence,
    activeListings: seed.activeListings,
    recentSales30d: seed.recentSales30d,
    buyerSellerRatio: seed.buyerSellerRatio,
    platformDiversity: seed.platformDiversity,
    seasonalIndex: seed.seasonalIndex,
  };
}

const PROFILES: LiquidityProfile[] = CARD_SEEDS.map(buildProfile);

// ─────────────────────────────────────────────────────────────────────────────
// Liquidity Crises
// ─────────────────────────────────────────────────────────────────────────────

const CRISES: LiquidityCrisis[] = [
  {
    cardId: 'LD013',
    cardName: '2019 Topps Chrome Sapphire #410 RC',
    player: 'Fernando Tatis Jr.',
    severity: 'critical',
    triggers: [
      'Sales volume dropped 68% in 30 days',
      'Active listings up 140% vs. last quarter',
      'Bid-ask spread widened from 3.2% to 6.0%',
      'Player injury news causing panic selling',
    ],
    recommendation: 'Consider immediate dealer sale or consignment at 10-15% below current ask to exit before further liquidity erosion. Waiting risks being stuck at frozen tier.',
    estimatedRecovery: '4-6 months pending player health update',
    currentLiquidityScore: 52,
    previousLiquidityScore: 78,
    detectedAt: '2026-03-12T09:30:00Z',
  },
  {
    cardId: 'LD024',
    cardName: '2019 Mosaic Base #209 RC',
    player: 'Ja Morant',
    severity: 'warning',
    triggers: [
      'Buyer-seller ratio dropped below 1.0 (currently 0.85)',
      'Average days to sell increased from 3.2 to 5.8',
      'Off-court controversy reducing collector demand',
    ],
    recommendation: 'Monitor closely for the next 2 weeks. If ratio drops below 0.7, move to BIN at market or slightly below. Avoid auction format in low-demand windows.',
    estimatedRecovery: '2-3 months if no further negative catalysts',
    currentLiquidityScore: 68,
    previousLiquidityScore: 81,
    detectedAt: '2026-03-10T14:15:00Z',
  },
  {
    cardId: 'LD020',
    cardName: '2020 Panini Flawless #25 /20 RPA',
    player: 'Justin Herbert',
    severity: 'watch',
    triggers: [
      'Only 2 active listings — low visibility',
      'No sales in last 30 days',
      'Ultra-premium segment showing broad weakness',
    ],
    recommendation: 'This is a structural liquidity issue inherent to ultra-low-print cards. Consider fractional sale platform or consignment with premium auction house. Patience required for right buyer.',
    estimatedRecovery: 'Seasonal uptick expected during NFL draft and training camp (Apr-Jul)',
    currentLiquidityScore: 32,
    previousLiquidityScore: 38,
    detectedAt: '2026-03-08T11:00:00Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Service Functions
// ─────────────────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getLiquidityProfile(cardId: string): Promise<LiquidityProfile | null> {
  await delay(300);
  return PROFILES.find((p) => p.cardId === cardId) ?? null;
}

export async function getAllLiquidityProfiles(): Promise<LiquidityProfile[]> {
  await delay(400);
  return PROFILES;
}

export async function getMarketDepth(cardId: string): Promise<MarketDepthSnapshot | null> {
  await delay(250);
  const profile = PROFILES.find((p) => p.cardId === cardId);
  if (!profile) return null;

  const totalBid = profile.depthLevels.reduce((s, l) => s + l.bidVolume, 0);
  const totalAsk = profile.depthLevels.reduce((s, l) => s + l.askVolume, 0);
  const imbalance = totalAsk === 0 ? 10 : Math.round((totalBid / totalAsk) * 100) / 100;

  return {
    timestamp: new Date().toISOString(),
    totalBidDepth: totalBid,
    totalAskDepth: totalAsk,
    imbalanceRatio: imbalance,
    pressureDirection: imbalance > 1.2 ? 'buy' : imbalance < 0.8 ? 'sell' : 'neutral',
  };
}

export async function getExitStrategies(cardId: string): Promise<ExitStrategy[]> {
  await delay(350);
  const profile = PROFILES.find((p) => p.cardId === cardId);
  if (!profile) return [];
  return buildExitStrategies(profile.currentValue, profile.liquidityScore, profile.avgDaysToSell);
}

export async function getPortfolioLiquidity(cardIds: string[]): Promise<PortfolioLiquidity> {
  await delay(500);
  const profiles = PROFILES.filter((p) => cardIds.includes(p.cardId));
  const totalValue = profiles.reduce((s, p) => s + p.currentValue, 0);
  const liquidValue = profiles.filter((p) => p.liquidityScore >= 65).reduce((s, p) => s + p.currentValue, 0);
  const illiquidValue = totalValue - liquidValue;
  const weightedScore =
    totalValue > 0
      ? Math.round(profiles.reduce((s, p) => s + p.liquidityScore * p.currentValue, 0) / totalValue)
      : 0;

  // Sort for optimal liquidation: highest liquidity first, then by value descending
  const sorted = [...profiles].sort((a, b) => {
    const scoreDiff = b.liquidityScore - a.liquidityScore;
    if (Math.abs(scoreDiff) > 10) return scoreDiff;
    return b.currentValue - a.currentValue;
  });

  const optimalLiquidationOrder = sorted.map((p, i) => {
    let reason: string;
    if (p.liquidityScore >= 85) reason = 'Ultra-liquid — can sell immediately at tight spread';
    else if (p.liquidityScore >= 65) reason = 'Good liquidity — sell early to generate capital for fees';
    else if (p.liquidityScore >= 40) reason = 'Moderate — requires patience; list concurrently with liquid sales';
    else reason = 'Illiquid — begin consignment process first; longest lead time';
    return { cardId: p.cardId, order: i + 1, reason };
  });

  // Estimate time to full liquidation
  const maxDays = Math.max(...profiles.map((p) => p.avgDaysToSell), 0);
  const avgDays = profiles.length > 0 ? profiles.reduce((s, p) => s + p.avgDaysToSell, 0) / profiles.length : 0;
  const estimatedDays = Math.ceil(maxDays + avgDays * 0.3);

  return {
    totalValue,
    liquidValue,
    illiquidValue,
    weightedLiquidityScore: weightedScore,
    timeToFullLiquidation: estimatedDays <= 7 ? `${estimatedDays} days` : `${Math.ceil(estimatedDays / 7)} weeks`,
    optimalLiquidationOrder,
  };
}

export async function getLiquidityCrises(): Promise<LiquidityCrisis[]> {
  await delay(200);
  return CRISES;
}

export async function getVolumeHistory(cardId: string, months: number = 12): Promise<VolumePoint[]> {
  await delay(300);
  const profile = PROFILES.find((p) => p.cardId === cardId);
  if (!profile) return [];
  return profile.volumeProfile.slice(-months);
}

export async function getOptimalExitTiming(cardId: string): Promise<{
  bestMonth: string;
  reason: string;
  expectedPremium: number;
  currentVsOptimal: number;
} | null> {
  await delay(350);
  const profile = PROFILES.find((p) => p.cardId === cardId);
  if (!profile) return null;

  const sportSeasons: Record<string, { bestMonth: string; reason: string }> = {
    basketball: { bestMonth: 'October', reason: 'NBA season opener drives peak demand for basketball cards' },
    football: { bestMonth: 'September', reason: 'NFL kickoff weekend creates maximum football card demand' },
    baseball: { bestMonth: 'March', reason: 'Spring training and Opening Day hype peaks baseball card interest' },
  };

  const timing = sportSeasons[profile.sport] || { bestMonth: 'November', reason: 'Holiday season increases overall card market demand' };
  const expectedPremium = Math.round(profile.currentValue * (profile.seasonalIndex - 1) * 100) / 100;
  const currentVsOptimal = Math.round((1 / profile.seasonalIndex) * 100);

  return {
    bestMonth: timing.bestMonth,
    reason: timing.reason,
    expectedPremium: Math.max(0, expectedPremium),
    currentVsOptimal,
  };
}

export async function getLiquidityHeatMap(sport?: string): Promise<{
  tier: LiquidityTier;
  count: number;
  totalValue: number;
  avgDaysToSell: number;
}[]> {
  await delay(300);
  const filtered = sport ? PROFILES.filter((p) => p.sport === sport) : PROFILES;
  const tiers: LiquidityTier[] = ['ultra-liquid', 'liquid', 'moderate', 'illiquid', 'frozen'];

  return tiers.map((tier) => {
    const inTier = filtered.filter((p) => p.liquidityTier === tier);
    return {
      tier,
      count: inTier.length,
      totalValue: inTier.reduce((s, p) => s + p.currentValue, 0),
      avgDaysToSell: inTier.length > 0
        ? Math.round((inTier.reduce((s, p) => s + p.avgDaysToSell, 0) / inTier.length) * 10) / 10
        : 0,
    };
  });
}

export async function simulateLiquidation(
  cardIds: string[],
  urgency: 'relaxed' | 'normal' | 'urgent' | 'fire-sale'
): Promise<{
  totalProceeds: number;
  totalFees: number;
  estimatedDays: number;
  perCard: { cardId: string; method: ExitMethod; proceeds: number; fees: number; days: number }[];
}> {
  await delay(600);
  const urgencyMultipliers: Record<string, { priceAdj: number; timeAdj: number }> = {
    relaxed: { priceAdj: 1.05, timeAdj: 1.5 },
    normal: { priceAdj: 1.0, timeAdj: 1.0 },
    urgent: { priceAdj: 0.9, timeAdj: 0.5 },
    'fire-sale': { priceAdj: 0.75, timeAdj: 0.2 },
  };

  const mult = urgencyMultipliers[urgency];
  const profiles = PROFILES.filter((p) => cardIds.includes(p.cardId));
  let totalProceeds = 0;
  let totalFees = 0;
  let maxDays = 0;

  const perCard = profiles.map((p) => {
    const strategies = buildExitStrategies(p.currentValue, p.liquidityScore, p.avgDaysToSell);
    let chosen: ExitStrategy;

    if (urgency === 'fire-sale') {
      chosen = strategies.find((s) => s.method === 'dealer') || strategies[0];
    } else if (urgency === 'urgent') {
      chosen = strategies.find((s) => s.method === 'auction') || strategies[0];
    } else if (urgency === 'relaxed') {
      chosen = strategies.reduce((a, b) => (a.netProceeds > b.netProceeds ? a : b));
    } else {
      chosen = strategies.find((s) => s.method === 'buy-it-now') || strategies[0];
    }

    const adjProceeds = Math.round(chosen.netProceeds * mult.priceAdj * 100) / 100;
    const adjFees = Math.round(chosen.fees * 100) / 100;
    const adjDays = Math.max(1, Math.round(p.avgDaysToSell * mult.timeAdj));

    totalProceeds += adjProceeds;
    totalFees += adjFees;
    if (adjDays > maxDays) maxDays = adjDays;

    return {
      cardId: p.cardId,
      method: chosen.method,
      proceeds: adjProceeds,
      fees: adjFees,
      days: adjDays,
    };
  });

  return {
    totalProceeds: Math.round(totalProceeds * 100) / 100,
    totalFees: Math.round(totalFees * 100) / 100,
    estimatedDays: maxDays,
    perCard,
  };
}
