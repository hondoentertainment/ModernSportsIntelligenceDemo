// Phase 147: Cross-Border & International Arbitrage Engine
// Identifies price discrepancies across international card markets with full cost accounting.

// ── Types ────────────────────────────────────────────────────────────────────

export type Market = 'us' | 'japan' | 'uk' | 'germany' | 'australia' | 'korea' | 'canada' | 'france';
export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';
export type TrendDirection = 'rising' | 'falling' | 'stable';

export interface MarketProfile {
  market: Market;
  label: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  avgPriceDifferential: number;
  avgShippingDays: number;
  primaryPlatforms: string[];
  marketSize: number;
  sellerCount: number;
  buyerDemand: number;
  color: string;
}

export interface ArbitrageOpportunity {
  id: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  grade: string;
  buyMarket: Market;
  sellMarket: Market;
  buyPrice: number;
  sellPrice: number;
  spreadPercent: number;
  shippingCost: number;
  customsDuty: number;
  platformFees: number;
  currencyConversionCost: number;
  netProfit: number;
  netProfitPercent: number;
  confidence: number;
  riskLevel: RiskLevel;
  notes: string;
}

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  dailyChange: number;
  weeklyChange: number;
  volatility: number;
}

export interface ShippingRoute {
  id: string;
  fromMarket: Market;
  toMarket: Market;
  carrier: string;
  cost: number;
  transitDays: number;
  insurance: number;
  trackingIncluded: boolean;
  reliabilityScore: number;
}

export interface CustomsDuty {
  country: string;
  market: Market;
  dutyPercent: number;
  vatPercent: number;
  deMinimusThreshold: number;
  notes: string;
}

export interface MarketListing {
  id: string;
  cardName: string;
  player: string;
  market: Market;
  platform: string;
  price: number;
  currency: string;
  priceUSD: number;
  condition: string;
  seller: string;
  sellerRating: number;
  listedDate: string;
}

export interface PlatformFee {
  platform: string;
  market: Market;
  sellerFeePercent: number;
  buyerFeePercent: number;
  withdrawalFee: number;
  currencyConversionFee: number;
  listingFee: number;
}

export interface ArbitrageResult {
  totalOpportunities: number;
  totalPotentialProfit: number;
  avgSpread: number;
  bestOpportunity: ArbitrageOpportunity | null;
  marketPairStats: { pair: string; count: number; avgProfit: number }[];
}

export interface PriceComparison {
  cardId: string;
  cardName: string;
  player: string;
  prices: { market: Market; price: number; currency: string; priceUSD: number }[];
  bestBuy: Market;
  bestSell: Market;
  maxSpread: number;
}

export interface RegionalTrend {
  id: string;
  market: Market;
  direction: TrendDirection;
  category: string;
  description: string;
  changePercent: number;
  timeframe: string;
  impactLevel: number;
}

export interface RiskAssessment {
  opportunityId: string;
  overallRisk: RiskLevel;
  factors: { factor: string; risk: RiskLevel; description: string; probability: number }[];
  recommendation: string;
}

// ── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_international_arbitrage';

function loadData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
  } catch {
    // quota exceeded
  }
}

// ── Helper functions ────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$', JPY: '¥', GBP: '£', EUR: '€', AUD: 'A$', KRW: '₩', CAD: 'C$',
  };
  const sym = symbols[currency] || currency + ' ';
  if (currency === 'JPY' || currency === 'KRW') return `${sym}${Math.round(amount).toLocaleString()}`;
  return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function getMarketConfig(market: Market): { label: string; text: string; bg: string; border: string } {
  const map: Record<Market, { label: string; text: string; bg: string; border: string }> = {
    us: { label: 'United States', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    japan: { label: 'Japan', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    uk: { label: 'United Kingdom', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    germany: { label: 'Germany', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    australia: { label: 'Australia', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    korea: { label: 'South Korea', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    canada: { label: 'Canada', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    france: { label: 'France', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  };
  return map[market];
}

function getRiskConfig(risk: RiskLevel): { label: string; text: string; bg: string; border: string } {
  const map: Record<RiskLevel, { label: string; text: string; bg: string; border: string }> = {
    low: { label: 'Low', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    medium: { label: 'Medium', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    high: { label: 'High', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    very_high: { label: 'Very High', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };
  return map[risk];
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const MARKET_PROFILES: MarketProfile[] = [
  { market: 'us', label: 'United States', currency: 'USD', currencySymbol: '$', flag: '🇺🇸', avgPriceDifferential: 0, avgShippingDays: 0, primaryPlatforms: ['eBay', 'COMC', 'StockX', 'MySlabs'], marketSize: 4200000, sellerCount: 185000, buyerDemand: 95, color: '#3b82f6' },
  { market: 'japan', label: 'Japan', currency: 'JPY', currencySymbol: '¥', flag: '🇯🇵', avgPriceDifferential: -28, avgShippingDays: 12, primaryPlatforms: ['Yahoo Japan Auctions', 'Mercari JP', 'Rakuma', 'Magi'], marketSize: 1800000, sellerCount: 72000, buyerDemand: 82, color: '#ef4444' },
  { market: 'uk', label: 'United Kingdom', currency: 'GBP', currencySymbol: '£', flag: '🇬🇧', avgPriceDifferential: -15, avgShippingDays: 8, primaryPlatforms: ['eBay UK', 'CardMarket', 'Vinted'], marketSize: 920000, sellerCount: 34000, buyerDemand: 74, color: '#06b6d4' },
  { market: 'germany', label: 'Germany', currency: 'EUR', currencySymbol: '€', flag: '🇩🇪', avgPriceDifferential: -22, avgShippingDays: 10, primaryPlatforms: ['CardMarket', 'eBay DE', 'Catawiki'], marketSize: 680000, sellerCount: 28000, buyerDemand: 68, color: '#f59e0b' },
  { market: 'australia', label: 'Australia', currency: 'AUD', currencySymbol: 'A$', flag: '🇦🇺', avgPriceDifferential: -30, avgShippingDays: 14, primaryPlatforms: ['eBay AU', 'SportsTradingCards AU', 'Gumtree'], marketSize: 410000, sellerCount: 15000, buyerDemand: 61, color: '#10b981' },
  { market: 'korea', label: 'South Korea', currency: 'KRW', currencySymbol: '₩', flag: '🇰🇷', avgPriceDifferential: -18, avgShippingDays: 11, primaryPlatforms: ['Naver Cafe', 'Bunjang', 'KreamCards'], marketSize: 520000, sellerCount: 21000, buyerDemand: 72, color: '#a855f7' },
  { market: 'canada', label: 'Canada', currency: 'CAD', currencySymbol: 'C$', flag: '🇨🇦', avgPriceDifferential: -12, avgShippingDays: 5, primaryPlatforms: ['eBay CA', 'Kijiji', '401 Games'], marketSize: 780000, sellerCount: 31000, buyerDemand: 78, color: '#f43f5e' },
  { market: 'france', label: 'France', currency: 'EUR', currencySymbol: '€', flag: '🇫🇷', avgPriceDifferential: -25, avgShippingDays: 9, primaryPlatforms: ['CardMarket', 'LeBonCoin', 'Vinted FR'], marketSize: 350000, sellerCount: 14000, buyerDemand: 58, color: '#6366f1' },
];

const ARBITRAGE_OPPORTUNITIES: ArbitrageOpportunity[] = [
  { id: 'arb_001', cardName: '2023 Topps Chrome Sapphire Shohei Ohtani /75', player: 'Shohei Ohtani', year: 2023, set: 'Topps Chrome Sapphire', grade: 'PSA 10', buyMarket: 'japan', sellMarket: 'us', buyPrice: 285, sellPrice: 520, spreadPercent: 82.5, shippingCost: 28, customsDuty: 0, platformFees: 68, currencyConversionCost: 4.3, netProfit: 134.7, netProfitPercent: 47.3, confidence: 92, riskLevel: 'low', notes: 'Japanese sellers consistently price Ohtani Sapphire parallels below US market due to domestic supply glut' },
  { id: 'arb_002', cardName: '2024 Panini Prizm Victor Wembanyama Silver RC', player: 'Victor Wembanyama', year: 2024, set: 'Panini Prizm', grade: 'PSA 10', buyMarket: 'france', sellMarket: 'us', buyPrice: 180, sellPrice: 340, spreadPercent: 88.9, shippingCost: 22, customsDuty: 0, platformFees: 44.2, currencyConversionCost: 2.7, netProfit: 91.1, netProfitPercent: 50.6, confidence: 88, riskLevel: 'low', notes: 'Wemby cards flood French market from local pack breaks; US demand remains insatiable' },
  { id: 'arb_003', cardName: '2022 Topps Chrome Julio Rodriguez Gold /50', player: 'Julio Rodriguez', year: 2022, set: 'Topps Chrome', grade: 'BGS 9.5', buyMarket: 'australia', sellMarket: 'us', buyPrice: 420, sellPrice: 710, spreadPercent: 69.0, shippingCost: 38, customsDuty: 0, platformFees: 92.3, currencyConversionCost: 6.3, netProfit: 153.4, netProfitPercent: 36.5, confidence: 85, riskLevel: 'medium', notes: 'Australian hobby box breaks produce lower-demand parallels; US collectors pay premium for numbered cards' },
  { id: 'arb_004', cardName: '2023 Bowman Chrome Elly De La Cruz 1st Auto', player: 'Elly De La Cruz', year: 2023, set: 'Bowman Chrome', grade: 'PSA 10', buyMarket: 'canada', sellMarket: 'us', buyPrice: 650, sellPrice: 880, spreadPercent: 35.4, shippingCost: 12, customsDuty: 0, platformFees: 114.4, currencyConversionCost: 9.8, netProfit: 93.8, netProfitPercent: 14.4, confidence: 91, riskLevel: 'low', notes: 'Canadian dollar weakness creates consistent 10-15% discount on equivalent US listings' },
  { id: 'arb_005', cardName: '2024 Topps Series 1 SP Photo Variation Aaron Judge', player: 'Aaron Judge', year: 2024, set: 'Topps Series 1', grade: 'Raw NM-MT', buyMarket: 'uk', sellMarket: 'us', buyPrice: 45, sellPrice: 85, spreadPercent: 88.9, shippingCost: 8, customsDuty: 0, platformFees: 11.1, currencyConversionCost: 0.7, netProfit: 20.2, netProfitPercent: 44.9, confidence: 78, riskLevel: 'medium', notes: 'UK collectors undervalue MLB photo variations; strong arbitrage on SP and SSP variants' },
  { id: 'arb_006', cardName: '2024 Panini Flawless LeBron James Patch Auto /25', player: 'LeBron James', year: 2024, set: 'Panini Flawless', grade: 'BGS 9', buyMarket: 'korea', sellMarket: 'us', buyPrice: 2800, sellPrice: 4200, spreadPercent: 50.0, shippingCost: 35, customsDuty: 0, platformFees: 546, currencyConversionCost: 42, netProfit: 779, netProfitPercent: 27.8, confidence: 82, riskLevel: 'medium', notes: 'Korean Starball exclusive market occasionally produces Flawless at below-US prices via group breaks' },
  { id: 'arb_007', cardName: '2023 Topps Chrome Black Mookie Betts Auto /99', player: 'Mookie Betts', year: 2023, set: 'Topps Chrome Black', grade: 'PSA 10', buyMarket: 'japan', sellMarket: 'us', buyPrice: 390, sellPrice: 620, spreadPercent: 59.0, shippingCost: 28, customsDuty: 0, platformFees: 80.6, currencyConversionCost: 5.9, netProfit: 115.5, netProfitPercent: 29.6, confidence: 87, riskLevel: 'low', notes: 'MLB autos less popular in Japan market; US Dodgers fanbase drives domestic premium' },
  { id: 'arb_008', cardName: '2024 Topps Allen & Ginter Mini Framed Auto Gunnar Henderson', player: 'Gunnar Henderson', year: 2024, set: 'Allen & Ginter', grade: 'PSA 10', buyMarket: 'germany', sellMarket: 'us', buyPrice: 110, sellPrice: 195, spreadPercent: 77.3, shippingCost: 18, customsDuty: 0, platformFees: 25.4, currencyConversionCost: 1.7, netProfit: 39.9, netProfitPercent: 36.3, confidence: 80, riskLevel: 'medium', notes: 'European CardMarket MLB section has significantly fewer buyers; German sellers price competitively' },
  { id: 'arb_009', cardName: '2023 Panini National Treasures Luka Doncic RPA /99', player: 'Luka Doncic', year: 2023, set: 'National Treasures', grade: 'BGS 9.5', buyMarket: 'australia', sellMarket: 'us', buyPrice: 1850, sellPrice: 2900, spreadPercent: 56.8, shippingCost: 45, customsDuty: 0, platformFees: 377, currencyConversionCost: 27.8, netProfit: 600.2, netProfitPercent: 32.4, confidence: 79, riskLevel: 'high', notes: 'Australian NBA market growing but still discounts vs US; high-value items carry authenticity risk' },
  { id: 'arb_010', cardName: '2024 Bowman University Caleb Williams Chrome Auto', player: 'Caleb Williams', year: 2024, set: 'Bowman University', grade: 'PSA 10', buyMarket: 'canada', sellMarket: 'us', buyPrice: 320, sellPrice: 475, spreadPercent: 48.4, shippingCost: 10, customsDuty: 0, platformFees: 61.8, currencyConversionCost: 4.8, netProfit: 78.4, netProfitPercent: 24.5, confidence: 90, riskLevel: 'low', notes: 'CFL-focused Canadian market undervalues NFL rookies; easy cross-border arbitrage' },
  { id: 'arb_011', cardName: '2023 Topps Chrome UEFA Champions League Jude Bellingham RC Auto', player: 'Jude Bellingham', year: 2023, set: 'Topps Chrome UCL', grade: 'PSA 10', buyMarket: 'uk', sellMarket: 'korea', buyPrice: 580, sellPrice: 920, spreadPercent: 58.6, shippingCost: 32, customsDuty: 18.4, platformFees: 92, currencyConversionCost: 8.7, netProfit: 188.9, netProfitPercent: 32.6, confidence: 76, riskLevel: 'medium', notes: 'Korean market pays premium for European soccer stars; Bellingham particularly popular in Asia' },
  { id: 'arb_012', cardName: '2024 Topps Series 2 Yoshinobu Yamamoto RC SP', player: 'Yoshinobu Yamamoto', year: 2024, set: 'Topps Series 2', grade: 'Raw NM', buyMarket: 'us', sellMarket: 'japan', buyPrice: 35, sellPrice: 95, spreadPercent: 171.4, shippingCost: 15, customsDuty: 0, platformFees: 14.3, currencyConversionCost: 0.5, netProfit: 30.2, netProfitPercent: 86.3, confidence: 94, riskLevel: 'low', notes: 'Reverse arbitrage — Japanese collectors pay massive premium for NPB-to-MLB crossover rookies' },
  { id: 'arb_013', cardName: '2023 Panini Prizm FIFA World Cup Kylian Mbappe Gold /10', player: 'Kylian Mbappe', year: 2023, set: 'Prizm World Cup', grade: 'PSA 10', buyMarket: 'france', sellMarket: 'us', buyPrice: 3200, sellPrice: 5100, spreadPercent: 59.4, shippingCost: 42, customsDuty: 0, platformFees: 663, currencyConversionCost: 48, netProfit: 1147, netProfitPercent: 35.8, confidence: 74, riskLevel: 'high', notes: 'French market saturated with Mbappe; US soccer card collectors growing rapidly and paying premium' },
  { id: 'arb_014', cardName: '2024 Topps Chrome Corbin Carroll Orange Refractor /25', player: 'Corbin Carroll', year: 2024, set: 'Topps Chrome', grade: 'PSA 10', buyMarket: 'germany', sellMarket: 'us', buyPrice: 215, sellPrice: 380, spreadPercent: 76.7, shippingCost: 20, customsDuty: 0, platformFees: 49.4, currencyConversionCost: 3.2, netProfit: 92.4, netProfitPercent: 43.0, confidence: 83, riskLevel: 'medium', notes: 'CardMarket EU sellers list MLB parallels well below US eBay comps; color match refractors especially discounted' },
  { id: 'arb_015', cardName: '2023 Topps NPB Roki Sasaki Chrome Auto /50', player: 'Roki Sasaki', year: 2023, set: 'Topps NPB', grade: 'PSA 10', buyMarket: 'japan', sellMarket: 'us', buyPrice: 450, sellPrice: 780, spreadPercent: 73.3, shippingCost: 28, customsDuty: 0, platformFees: 101.4, currencyConversionCost: 6.8, netProfit: 193.8, netProfitPercent: 43.1, confidence: 90, riskLevel: 'low', notes: 'NPB Chrome autos heavily available in Japan at fraction of US price; Sasaki MLB hype driving US demand' },
  { id: 'arb_016', cardName: '2024 Panini Prizm NBA Chet Holmgren Silver RC', player: 'Chet Holmgren', year: 2024, set: 'Panini Prizm', grade: 'PSA 10', buyMarket: 'australia', sellMarket: 'us', buyPrice: 85, sellPrice: 155, spreadPercent: 82.4, shippingCost: 18, customsDuty: 0, platformFees: 20.2, currencyConversionCost: 1.3, netProfit: 30.5, netProfitPercent: 35.9, confidence: 84, riskLevel: 'low', notes: 'NBL crossover interest produces NBA breaks in Australia at discount; lower domestic NBA demand' },
  { id: 'arb_017', cardName: '2023 Topps Chrome Korean Series Exclusive Refractor Set', player: 'Various KBO', year: 2023, set: 'Topps Chrome KBO', grade: 'Factory Sealed', buyMarket: 'korea', sellMarket: 'us', buyPrice: 120, sellPrice: 280, spreadPercent: 133.3, shippingCost: 25, customsDuty: 0, platformFees: 36.4, currencyConversionCost: 1.8, netProfit: 96.8, netProfitPercent: 80.7, confidence: 88, riskLevel: 'low', notes: 'Starball exclusive KBO Chrome sets sell for 2x+ in US due to limited international distribution' },
  { id: 'arb_018', cardName: '2024 Topps Stadium Club Chrome Adley Rutschman Auto', player: 'Adley Rutschman', year: 2024, set: 'Stadium Club Chrome', grade: 'PSA 10', buyMarket: 'uk', sellMarket: 'us', buyPrice: 145, sellPrice: 240, spreadPercent: 65.5, shippingCost: 12, customsDuty: 0, platformFees: 31.2, currencyConversionCost: 2.2, netProfit: 49.6, netProfitPercent: 34.2, confidence: 81, riskLevel: 'low', notes: 'UK eBay MLB autos sit longer and sell cheaper; catchers especially undervalued overseas' },
  { id: 'arb_019', cardName: '2024 Panini Immaculate Soccer Erling Haaland Patch Auto /49', player: 'Erling Haaland', year: 2024, set: 'Immaculate Soccer', grade: 'BGS 9.5', buyMarket: 'germany', sellMarket: 'korea', buyPrice: 1100, sellPrice: 1750, spreadPercent: 59.1, shippingCost: 30, customsDuty: 35, platformFees: 175, currencyConversionCost: 16.5, netProfit: 393.5, netProfitPercent: 35.8, confidence: 72, riskLevel: 'high', notes: 'Bundesliga cards priced lower in Germany; Korean Premier League fans pay significant premiums' },
  { id: 'arb_020', cardName: '2023 Bowman Chrome Draft Jackson Holliday 1st Auto Gold /50', player: 'Jackson Holliday', year: 2023, set: 'Bowman Chrome Draft', grade: 'PSA 10', buyMarket: 'canada', sellMarket: 'us', buyPrice: 1400, sellPrice: 1950, spreadPercent: 39.3, shippingCost: 15, customsDuty: 0, platformFees: 253.5, currencyConversionCost: 21, netProfit: 260.5, netProfitPercent: 18.6, confidence: 86, riskLevel: 'low', notes: 'High-end Bowman autos consistently 15-20% cheaper on Canadian eBay/marketplace listings' },
  { id: 'arb_021', cardName: '2024 Topps Chrome Japanese Exclusive Ichiro SP Refractor', player: 'Ichiro Suzuki', year: 2024, set: 'Topps Chrome JP', grade: 'PSA 10', buyMarket: 'japan', sellMarket: 'us', buyPrice: 180, sellPrice: 410, spreadPercent: 127.8, shippingCost: 22, customsDuty: 0, platformFees: 53.3, currencyConversionCost: 2.7, netProfit: 152, netProfitPercent: 84.4, confidence: 93, riskLevel: 'low', notes: 'Japanese exclusive parallels available at retail in Japan; US collectors pay massive secondary premium' },
  { id: 'arb_022', cardName: '2024 Panini Prizm WNBA Caitlin Clark Silver RC', player: 'Caitlin Clark', year: 2024, set: 'Panini Prizm WNBA', grade: 'PSA 10', buyMarket: 'australia', sellMarket: 'us', buyPrice: 195, sellPrice: 340, spreadPercent: 74.4, shippingCost: 20, customsDuty: 0, platformFees: 44.2, currencyConversionCost: 2.9, netProfit: 77.9, netProfitPercent: 39.9, confidence: 85, riskLevel: 'low', notes: 'Australian basketball market focuses on NBL; WNBA cards significantly cheaper abroad' },
  { id: 'arb_023', cardName: '2024 Topps Heritage Connor McDavid SP', player: 'Connor McDavid', year: 2024, set: 'Topps Heritage Hockey', grade: 'Raw NM-MT', buyMarket: 'us', sellMarket: 'canada', buyPrice: 25, sellPrice: 65, spreadPercent: 160.0, shippingCost: 8, customsDuty: 0, platformFees: 8.5, currencyConversionCost: 0.4, netProfit: 23.1, netProfitPercent: 92.4, confidence: 95, riskLevel: 'low', notes: 'Reverse arbitrage — Canadian hockey demand creates premium for Heritage SPs bought at US retail' },
  { id: 'arb_024', cardName: '2024 Topps Chrome Black Anthony Edwards Auto /75', player: 'Anthony Edwards', year: 2024, set: 'Topps Chrome Black', grade: 'PSA 10', buyMarket: 'uk', sellMarket: 'us', buyPrice: 480, sellPrice: 780, spreadPercent: 62.5, shippingCost: 15, customsDuty: 0, platformFees: 101.4, currencyConversionCost: 7.2, netProfit: 176.4, netProfitPercent: 36.8, confidence: 80, riskLevel: 'medium', notes: 'UK NBA market smaller than US; Chrome Black autos sit at discount on UK eBay' },
  { id: 'arb_025', cardName: '2024 Panini Select FIFA Euro Lamine Yamal Tie-Dye /25', player: 'Lamine Yamal', year: 2024, set: 'Select Euro', grade: 'PSA 10', buyMarket: 'france', sellMarket: 'korea', buyPrice: 890, sellPrice: 1420, spreadPercent: 59.6, shippingCost: 30, customsDuty: 28.4, platformFees: 142, currencyConversionCost: 13.4, netProfit: 316.2, netProfitPercent: 35.5, confidence: 75, riskLevel: 'medium', notes: 'European soccer parallels cheaper in EU markets; Korean soccer card market booming' },
];

const CURRENCY_RATES: CurrencyRate[] = [
  { from: 'JPY', to: 'USD', rate: 0.0067, dailyChange: -0.3, weeklyChange: -1.2, volatility: 8.5 },
  { from: 'GBP', to: 'USD', rate: 1.27, dailyChange: 0.1, weeklyChange: 0.4, volatility: 5.2 },
  { from: 'EUR', to: 'USD', rate: 1.09, dailyChange: -0.2, weeklyChange: -0.6, volatility: 4.8 },
  { from: 'AUD', to: 'USD', rate: 0.66, dailyChange: 0.3, weeklyChange: -0.8, volatility: 7.1 },
  { from: 'KRW', to: 'USD', rate: 0.00075, dailyChange: -0.1, weeklyChange: -1.5, volatility: 9.2 },
  { from: 'CAD', to: 'USD', rate: 0.74, dailyChange: 0.2, weeklyChange: 0.1, volatility: 3.9 },
  { from: 'USD', to: 'JPY', rate: 149.25, dailyChange: 0.3, weeklyChange: 1.2, volatility: 8.5 },
  { from: 'USD', to: 'GBP', rate: 0.79, dailyChange: -0.1, weeklyChange: -0.4, volatility: 5.2 },
];

const SHIPPING_ROUTES: ShippingRoute[] = [
  { id: 'sr_001', fromMarket: 'japan', toMarket: 'us', carrier: 'Japan Post EMS', cost: 28, transitDays: 7, insurance: 5.50, trackingIncluded: true, reliabilityScore: 95 },
  { id: 'sr_002', fromMarket: 'japan', toMarket: 'us', carrier: 'DHL Express', cost: 45, transitDays: 4, insurance: 8.00, trackingIncluded: true, reliabilityScore: 98 },
  { id: 'sr_003', fromMarket: 'uk', toMarket: 'us', carrier: 'Royal Mail Tracked', cost: 12, transitDays: 8, insurance: 3.50, trackingIncluded: true, reliabilityScore: 88 },
  { id: 'sr_004', fromMarket: 'uk', toMarket: 'us', carrier: 'FedEx International', cost: 32, transitDays: 3, insurance: 6.00, trackingIncluded: true, reliabilityScore: 97 },
  { id: 'sr_005', fromMarket: 'germany', toMarket: 'us', carrier: 'Deutsche Post', cost: 18, transitDays: 10, insurance: 4.00, trackingIncluded: true, reliabilityScore: 90 },
  { id: 'sr_006', fromMarket: 'germany', toMarket: 'us', carrier: 'DHL Express', cost: 38, transitDays: 4, insurance: 7.50, trackingIncluded: true, reliabilityScore: 97 },
  { id: 'sr_007', fromMarket: 'australia', toMarket: 'us', carrier: 'Australia Post', cost: 22, transitDays: 14, insurance: 5.00, trackingIncluded: true, reliabilityScore: 82 },
  { id: 'sr_008', fromMarket: 'australia', toMarket: 'us', carrier: 'FedEx International', cost: 48, transitDays: 5, insurance: 9.00, trackingIncluded: true, reliabilityScore: 96 },
  { id: 'sr_009', fromMarket: 'korea', toMarket: 'us', carrier: 'Korea Post EMS', cost: 25, transitDays: 9, insurance: 5.00, trackingIncluded: true, reliabilityScore: 91 },
  { id: 'sr_010', fromMarket: 'canada', toMarket: 'us', carrier: 'Canada Post Tracked', cost: 10, transitDays: 5, insurance: 2.50, trackingIncluded: true, reliabilityScore: 93 },
  { id: 'sr_011', fromMarket: 'france', toMarket: 'us', carrier: 'La Poste Colissimo', cost: 20, transitDays: 9, insurance: 4.50, trackingIncluded: true, reliabilityScore: 87 },
  { id: 'sr_012', fromMarket: 'us', toMarket: 'japan', carrier: 'USPS Priority International', cost: 32, transitDays: 10, insurance: 6.00, trackingIncluded: true, reliabilityScore: 89 },
];

const CUSTOMS_DUTIES: CustomsDuty[] = [
  { country: 'United States', market: 'us', dutyPercent: 0, vatPercent: 0, deMinimusThreshold: 800, notes: 'No duty on imports under $800; sports cards generally duty-free' },
  { country: 'Japan', market: 'japan', dutyPercent: 0, vatPercent: 10, deMinimusThreshold: 130, notes: 'Consumption tax applies above ¥20,000; cards classified as printed matter' },
  { country: 'United Kingdom', market: 'uk', dutyPercent: 0, vatPercent: 20, deMinimusThreshold: 135, notes: 'VAT applies on all imports; no customs duty on collectible cards' },
  { country: 'Germany', market: 'germany', dutyPercent: 0, vatPercent: 19, deMinimusThreshold: 150, notes: 'EU IOSS system; VAT collected at point of sale for items under €150' },
  { country: 'Australia', market: 'australia', dutyPercent: 5, vatPercent: 10, deMinimusThreshold: 700, notes: 'GST applies; low-value imports under A$1000 have simplified clearance' },
  { country: 'South Korea', market: 'korea', dutyPercent: 8, vatPercent: 10, deMinimusThreshold: 112, notes: 'Combined duty + VAT on imports above ₩150,000; customs inspection common' },
  { country: 'Canada', market: 'canada', dutyPercent: 0, vatPercent: 5, deMinimusThreshold: 150, notes: 'GST applies; CUSMA eliminates duty on US-origin goods' },
  { country: 'France', market: 'france', dutyPercent: 0, vatPercent: 20, deMinimusThreshold: 150, notes: 'EU VAT rules apply; IOSS for items under €150' },
];

const PLATFORM_FEES: PlatformFee[] = [
  { platform: 'eBay US', market: 'us', sellerFeePercent: 13.25, buyerFeePercent: 0, withdrawalFee: 0, currencyConversionFee: 0, listingFee: 0 },
  { platform: 'Yahoo Japan Auctions', market: 'japan', sellerFeePercent: 10, buyerFeePercent: 0, withdrawalFee: 2.50, currencyConversionFee: 3.0, listingFee: 0 },
  { platform: 'Mercari JP', market: 'japan', sellerFeePercent: 10, buyerFeePercent: 0, withdrawalFee: 1.50, currencyConversionFee: 3.0, listingFee: 0 },
  { platform: 'CardMarket', market: 'germany', sellerFeePercent: 5, buyerFeePercent: 0, withdrawalFee: 1.00, currencyConversionFee: 1.5, listingFee: 0 },
  { platform: 'eBay UK', market: 'uk', sellerFeePercent: 12.8, buyerFeePercent: 0, withdrawalFee: 0, currencyConversionFee: 2.5, listingFee: 0 },
  { platform: 'eBay AU', market: 'australia', sellerFeePercent: 13.0, buyerFeePercent: 0, withdrawalFee: 0, currencyConversionFee: 2.5, listingFee: 0 },
  { platform: 'Bunjang', market: 'korea', sellerFeePercent: 3.5, buyerFeePercent: 0, withdrawalFee: 1.00, currencyConversionFee: 3.5, listingFee: 0 },
  { platform: 'StockX', market: 'us', sellerFeePercent: 9.5, buyerFeePercent: 3, withdrawalFee: 0, currencyConversionFee: 0, listingFee: 0 },
  { platform: 'eBay CA', market: 'canada', sellerFeePercent: 13.25, buyerFeePercent: 0, withdrawalFee: 0, currencyConversionFee: 2.5, listingFee: 0 },
  { platform: 'Vinted FR', market: 'france', sellerFeePercent: 0, buyerFeePercent: 5, withdrawalFee: 0.50, currencyConversionFee: 2.0, listingFee: 0 },
];

const REGIONAL_TRENDS: RegionalTrend[] = [
  { id: 'rt_001', market: 'japan', direction: 'rising', category: 'MLB Rookies', description: 'Japanese market demand for MLB rookie cards surging with Sasaki and Yamamoto debuts', changePercent: 34.5, timeframe: '90 days', impactLevel: 9 },
  { id: 'rt_002', market: 'us', direction: 'rising', category: 'Soccer Cards', description: 'US soccer card market expanding rapidly with MLS and Premier League interest', changePercent: 28.2, timeframe: '90 days', impactLevel: 8 },
  { id: 'rt_003', market: 'korea', direction: 'rising', category: 'NBA Cards', description: 'Korean NBA card market booming driven by younger collectors and social media', changePercent: 42.1, timeframe: '90 days', impactLevel: 9 },
  { id: 'rt_004', market: 'uk', direction: 'falling', category: 'NFL Cards', description: 'Post-London Games hype fading; NFL card prices softening in UK market', changePercent: -12.8, timeframe: '90 days', impactLevel: 5 },
  { id: 'rt_005', market: 'australia', direction: 'stable', category: 'Cricket Cards', description: 'Cricket card market holding steady with BBL season; cross-sport collectors emerging', changePercent: 2.1, timeframe: '90 days', impactLevel: 3 },
  { id: 'rt_006', market: 'germany', direction: 'rising', category: 'Bundesliga Cards', description: 'Topps Chrome Bundesliga launch driving new collector interest in European soccer', changePercent: 22.6, timeframe: '90 days', impactLevel: 7 },
  { id: 'rt_007', market: 'france', direction: 'falling', category: 'Panini Stickers', description: 'Traditional Panini sticker market declining as chrome/prizm alternatives gain share', changePercent: -18.4, timeframe: '90 days', impactLevel: 6 },
  { id: 'rt_008', market: 'canada', direction: 'rising', category: 'Hockey Cards', description: 'Upper Deck hockey market strengthening with strong Canadian dollar and playoff push', changePercent: 15.3, timeframe: '90 days', impactLevel: 7 },
  { id: 'rt_009', market: 'japan', direction: 'falling', category: 'Pokemon TCG', description: 'Pokemon card prices normalizing in Japan after 2023 speculation peak', changePercent: -24.7, timeframe: '90 days', impactLevel: 8 },
  { id: 'rt_010', market: 'us', direction: 'stable', category: 'Vintage Pre-War', description: 'Pre-war card market remains stable with institutional collector support', changePercent: 1.8, timeframe: '90 days', impactLevel: 4 },
  { id: 'rt_011', market: 'korea', direction: 'rising', category: 'KBO Exclusives', description: 'Starball-exclusive KBO Chrome sets seeing international demand spike', changePercent: 55.2, timeframe: '90 days', impactLevel: 9 },
  { id: 'rt_012', market: 'australia', direction: 'rising', category: 'NBA Cards', description: 'Josh Giddey and Dyson Daniels driving Australian NBA card interest', changePercent: 18.9, timeframe: '90 days', impactLevel: 6 },
  { id: 'rt_013', market: 'uk', direction: 'rising', category: 'Premier League Cards', description: 'Topps Chrome Premier League gaining massive collector traction in UK market', changePercent: 31.4, timeframe: '90 days', impactLevel: 8 },
  { id: 'rt_014', market: 'france', direction: 'rising', category: 'Ligue 1 Cards', description: 'Post-World Cup Mbappe effect continues to drive French football card market', changePercent: 19.7, timeframe: '90 days', impactLevel: 7 },
  { id: 'rt_015', market: 'germany', direction: 'stable', category: 'F1 Cards', description: 'Formula 1 Topps Chrome market stabilizing after initial hype; steady collector base', changePercent: 3.2, timeframe: '90 days', impactLevel: 4 },
];

const MARKET_LISTINGS: MarketListing[] = [
  { id: 'ml_001', cardName: '2024 Topps Chrome Shohei Ohtani Refractor', player: 'Shohei Ohtani', market: 'japan', platform: 'Yahoo Japan Auctions', price: 8500, currency: 'JPY', priceUSD: 56.95, condition: 'PSA 10', seller: 'cardshop_tokyo', sellerRating: 99.2, listedDate: '2026-03-12' },
  { id: 'ml_002', cardName: '2024 Topps Chrome Shohei Ohtani Refractor', player: 'Shohei Ohtani', market: 'us', platform: 'eBay', price: 89.99, currency: 'USD', priceUSD: 89.99, condition: 'PSA 10', seller: 'premiumcards_us', sellerRating: 98.8, listedDate: '2026-03-11' },
  { id: 'ml_003', cardName: '2024 Panini Prizm Wembanyama Silver', player: 'Victor Wembanyama', market: 'france', platform: 'CardMarket', price: 165, currency: 'EUR', priceUSD: 179.85, condition: 'PSA 10', seller: 'cartes_de_sport_paris', sellerRating: 97.5, listedDate: '2026-03-13' },
  { id: 'ml_004', cardName: '2024 Panini Prizm Wembanyama Silver', player: 'Victor Wembanyama', market: 'us', platform: 'eBay', price: 339.99, currency: 'USD', priceUSD: 339.99, condition: 'PSA 10', seller: 'topshelfcards', sellerRating: 99.1, listedDate: '2026-03-10' },
  { id: 'ml_005', cardName: '2023 Topps Chrome Julio Rodriguez Gold /50', player: 'Julio Rodriguez', market: 'australia', platform: 'eBay AU', price: 638, currency: 'AUD', priceUSD: 421.08, condition: 'BGS 9.5', seller: 'aussie_cards_melb', sellerRating: 98.0, listedDate: '2026-03-14' },
  { id: 'ml_006', cardName: '2024 Panini Flawless LeBron Patch Auto /25', player: 'LeBron James', market: 'korea', platform: 'Bunjang', price: 3720000, currency: 'KRW', priceUSD: 2790, condition: 'BGS 9', seller: 'seoul_slabs', sellerRating: 96.8, listedDate: '2026-03-09' },
  { id: 'ml_007', cardName: '2023 Bowman Chrome Elly De La Cruz 1st Auto', player: 'Elly De La Cruz', market: 'canada', platform: 'eBay CA', price: 879, currency: 'CAD', priceUSD: 650.46, condition: 'PSA 10', seller: 'maple_leaf_cards', sellerRating: 99.4, listedDate: '2026-03-13' },
  { id: 'ml_008', cardName: '2024 Topps Chrome Jude Bellingham Auto', player: 'Jude Bellingham', market: 'uk', platform: 'eBay UK', price: 458, currency: 'GBP', priceUSD: 581.66, condition: 'PSA 10', seller: 'uk_sports_collectibles', sellerRating: 98.3, listedDate: '2026-03-12' },
  { id: 'ml_009', cardName: '2024 Topps NPB Roki Sasaki Chrome Auto', player: 'Roki Sasaki', market: 'japan', platform: 'Mercari JP', price: 67000, currency: 'JPY', priceUSD: 448.90, condition: 'PSA 10', seller: 'nippon_cards', sellerRating: 97.9, listedDate: '2026-03-14' },
  { id: 'ml_010', cardName: '2024 Panini Prizm Caitlin Clark Silver', player: 'Caitlin Clark', market: 'australia', platform: 'eBay AU', price: 296, currency: 'AUD', priceUSD: 195.36, condition: 'PSA 10', seller: 'downunder_hoops', sellerRating: 97.2, listedDate: '2026-03-11' },
];

// ── Public API ──────────────────────────────────────────────────────────────

export function getArbitrageOpportunities(market?: Market): ArbitrageOpportunity[] {
  const cached = loadData<ArbitrageOpportunity[]>('opportunities');
  const opps = cached && cached.length > 0 ? cached : ARBITRAGE_OPPORTUNITIES;
  if (!cached || cached.length === 0) saveData('opportunities', ARBITRAGE_OPPORTUNITIES);
  if (market) return opps.filter(o => o.buyMarket === market || o.sellMarket === market);
  return opps;
}

export function getMarketProfiles(): MarketProfile[] {
  const cached = loadData<MarketProfile[]>('market_profiles');
  if (cached && cached.length > 0) return cached;
  saveData('market_profiles', MARKET_PROFILES);
  return MARKET_PROFILES;
}

export function getCurrencyRates(): CurrencyRate[] {
  const cached = loadData<CurrencyRate[]>('currency_rates');
  if (cached && cached.length > 0) return cached;
  saveData('currency_rates', CURRENCY_RATES);
  return CURRENCY_RATES;
}

export function getShippingRoutes(from?: Market, to?: Market): ShippingRoute[] {
  const cached = loadData<ShippingRoute[]>('shipping_routes');
  const routes = cached && cached.length > 0 ? cached : SHIPPING_ROUTES;
  if (!cached || cached.length === 0) saveData('shipping_routes', SHIPPING_ROUTES);
  if (from && to) return routes.filter(r => r.fromMarket === from && r.toMarket === to);
  if (from) return routes.filter(r => r.fromMarket === from);
  if (to) return routes.filter(r => r.toMarket === to);
  return routes;
}

export function getCustomsDuties(country?: Market): CustomsDuty[] {
  const cached = loadData<CustomsDuty[]>('customs_duties');
  const duties = cached && cached.length > 0 ? cached : CUSTOMS_DUTIES;
  if (!cached || cached.length === 0) saveData('customs_duties', CUSTOMS_DUTIES);
  if (country) return duties.filter(d => d.market === country);
  return duties;
}

export function getPlatformFees(platform?: string): PlatformFee[] {
  const cached = loadData<PlatformFee[]>('platform_fees');
  const fees = cached && cached.length > 0 ? cached : PLATFORM_FEES;
  if (!cached || cached.length === 0) saveData('platform_fees', PLATFORM_FEES);
  if (platform) return fees.filter(f => f.platform.toLowerCase().includes(platform.toLowerCase()));
  return fees;
}

export function calculateNetProfit(opportunity: ArbitrageOpportunity): number {
  return opportunity.sellPrice - opportunity.buyPrice - opportunity.shippingCost - opportunity.customsDuty - opportunity.platformFees - opportunity.currencyConversionCost;
}

export function getPriceComparisons(cardId?: string): PriceComparison[] {
  const listings = getMarketListings();
  const cardGroups: Record<string, MarketListing[]> = {};
  listings.forEach(l => {
    const key = l.cardName;
    if (!cardGroups[key]) cardGroups[key] = [];
    cardGroups[key].push(l);
  });

  const comparisons: PriceComparison[] = Object.entries(cardGroups)
    .filter(([, items]) => items.length >= 2)
    .map(([name, items]) => {
      const prices = items.map(i => ({ market: i.market, price: i.price, currency: i.currency, priceUSD: i.priceUSD }));
      const sorted = [...prices].sort((a, b) => a.priceUSD - b.priceUSD);
      return {
        cardId: items[0].id,
        cardName: name,
        player: items[0].player,
        prices,
        bestBuy: sorted[0].market,
        bestSell: sorted[sorted.length - 1].market,
        maxSpread: Math.round(((sorted[sorted.length - 1].priceUSD - sorted[0].priceUSD) / sorted[0].priceUSD) * 1000) / 10,
      };
    });
  if (cardId) return comparisons.filter(c => c.cardId === cardId);
  return comparisons;
}

export function getRegionalTrends(): RegionalTrend[] {
  const cached = loadData<RegionalTrend[]>('regional_trends');
  if (cached && cached.length > 0) return cached;
  saveData('regional_trends', REGIONAL_TRENDS);
  return REGIONAL_TRENDS;
}

export function getRiskAssessment(opportunityId: string): RiskAssessment {
  const opp = ARBITRAGE_OPPORTUNITIES.find(o => o.id === opportunityId) || ARBITRAGE_OPPORTUNITIES[0];
  const factors: RiskAssessment['factors'] = [
    { factor: 'Shipping Damage', risk: opp.shippingCost > 30 ? 'medium' : 'low', description: opp.shippingCost > 30 ? 'Long-distance international shipping increases damage risk' : 'Standard international shipping with tracking and insurance', probability: opp.shippingCost > 30 ? 0.08 : 0.03 },
    { factor: 'Customs Hold', risk: opp.customsDuty > 0 ? 'medium' : 'low', description: opp.customsDuty > 0 ? 'Customs inspection may delay delivery 3-10 business days' : 'Duty-free threshold covers this shipment', probability: opp.customsDuty > 0 ? 0.15 : 0.02 },
    { factor: 'Authenticity', risk: opp.buyPrice > 1000 ? 'medium' : 'low', description: opp.buyPrice > 1000 ? 'High-value items require verified authentication before resale' : 'Standard graded card with verifiable cert number', probability: opp.buyPrice > 1000 ? 0.05 : 0.01 },
    { factor: 'Currency Volatility', risk: opp.currencyConversionCost > 20 ? 'high' : 'low', description: opp.currencyConversionCost > 20 ? 'Large FX exposure; rate changes can significantly impact margin' : 'Manageable currency exposure on this transaction', probability: opp.currencyConversionCost > 20 ? 0.25 : 0.10 },
    { factor: 'Market Price Shift', risk: opp.spreadPercent < 40 ? 'high' : 'medium', description: opp.spreadPercent < 40 ? 'Narrow spread leaves little margin for price movement during transit' : 'Sufficient spread to absorb moderate price fluctuation', probability: opp.spreadPercent < 40 ? 0.20 : 0.12 },
  ];
  const highRiskCount = factors.filter(f => f.risk === 'high' || f.risk === 'very_high').length;
  const overallRisk: RiskLevel = highRiskCount >= 2 ? 'high' : highRiskCount === 1 ? 'medium' : 'low';
  return {
    opportunityId: opp.id,
    overallRisk,
    factors,
    recommendation: overallRisk === 'high' ? 'Proceed with caution — consider insurance and verified sellers only' : overallRisk === 'medium' ? 'Acceptable risk — ensure tracking and buyer protection' : 'Low risk opportunity — standard precautions sufficient',
  };
}

export function getTopArbitrageToday(limit: number = 5): ArbitrageOpportunity[] {
  const opps = getArbitrageOpportunities();
  return opps.sort((a, b) => b.netProfit - a.netProfit).slice(0, limit);
}

export function getMarketListings(market?: Market, limit?: number): MarketListing[] {
  const cached = loadData<MarketListing[]>('market_listings');
  let listings = cached && cached.length > 0 ? cached : MARKET_LISTINGS;
  if (!cached || cached.length === 0) saveData('market_listings', MARKET_LISTINGS);
  if (market) listings = listings.filter(l => l.market === market);
  if (limit) listings = listings.slice(0, limit);
  return listings;
}

export function getHistoricalArbitrage(cardId?: string): { month: string; avgSpread: number; volume: number }[] {
  const months = ['Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'];
  return months.map((month, i) => ({
    month,
    avgSpread: 25 + Math.sin(i * 1.2) * 12 + i * 1.5,
    volume: 120 + Math.floor(Math.cos(i * 0.8) * 40) + i * 15,
  }));
}

export function getArbitrageResult(): ArbitrageResult {
  const opps = getArbitrageOpportunities();
  const totalProfit = opps.reduce((sum, o) => sum + o.netProfit, 0);
  const avgSpread = opps.reduce((sum, o) => sum + o.spreadPercent, 0) / opps.length;
  const pairMap: Record<string, { count: number; totalProfit: number }> = {};
  opps.forEach(o => {
    const pair = `${getMarketConfig(o.buyMarket).label} → ${getMarketConfig(o.sellMarket).label}`;
    if (!pairMap[pair]) pairMap[pair] = { count: 0, totalProfit: 0 };
    pairMap[pair].count++;
    pairMap[pair].totalProfit += o.netProfit;
  });
  const marketPairStats = Object.entries(pairMap).map(([pair, data]) => ({
    pair,
    count: data.count,
    avgProfit: Math.round(data.totalProfit / data.count * 100) / 100,
  })).sort((a, b) => b.avgProfit - a.avgProfit);

  return {
    totalOpportunities: opps.length,
    totalPotentialProfit: Math.round(totalProfit * 100) / 100,
    avgSpread: Math.round(avgSpread * 10) / 10,
    bestOpportunity: opps.sort((a, b) => b.netProfit - a.netProfit)[0] || null,
    marketPairStats,
  };
}

export { getRiskConfig };
