// Cross-Platform Arbitrage Alerts Service
// Real-time cross-platform price spread detection, fee-adjusted profit calculation,
// and arbitrage opportunity tracking across major sports card marketplaces.

// ── Types ─────────────────────────────────────────────────────────────────────

export type Platform = 'ebay' | 'goldin' | 'pwcc' | 'heritage' | 'comc' | 'alt' | 'whatnot' | 'myslabs';
export type ArbitrageStatus = 'active' | 'expired' | 'executed' | 'missed';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ArbitrageType = 'cross_platform' | 'grade_spread' | 'condition_arbitrage' | 'regional' | 'timing';

export interface ArbitrageOpportunity {
  id: string;
  cardName: string;
  player: string;
  year: number;
  grade: string;
  gradingCompany: string;
  type: ArbitrageType;
  buyPlatform: Platform;
  sellPlatform: Platform;
  buyPrice: number;
  sellPrice: number;
  buyFees: number;
  sellFees: number;
  shippingCost: number;
  netProfit: number;
  profitMargin: number;
  riskLevel: RiskLevel;
  confidence: number;
  timeRemaining: string;
  status: ArbitrageStatus;
  discoveredAt: string;
  buyUrl: string;
  sellUrl: string;
  notes: string;
}

export interface PlatformPricing {
  platform: Platform;
  lowestPrice: number;
  avgPrice: number;
  highestPrice: number;
  activeListings: number;
  avgDaysToSell: number;
  sellerFeePercent: number;
  buyerPremium: number;
}

export interface ArbitrageStats {
  totalOpportunities: number;
  activeOpportunities: number;
  avgProfitMargin: number;
  bestSpread: number;
  totalPotentialProfit: number;
  executedTrades: number;
  executedProfit: number;
  winRate: number;
  avgHoldTime: string;
  topPlatformPair: { buy: Platform; sell: Platform; avgSpread: number };
}

export interface FeeComparison {
  platform: Platform;
  sellerFee: number;
  buyerPremium: number;
  paymentProcessing: number;
  shipping: number;
  totalCost: number;
  netOnSale: number;
}

export interface SpreadHistory {
  date: string;
  spread: number;
  buyPrice: number;
  sellPrice: number;
  platform: Platform;
}

export interface ArbitrageAlert {
  id: string;
  opportunityId: string;
  cardName: string;
  type: 'new_opportunity' | 'spread_widening' | 'expiring_soon' | 'price_change';
  message: string;
  profit: number;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

// ── Storage Helpers ───────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'msi_arbitrage';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}_${key}`, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

// ── Platform Metadata ─────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<Platform, string> = {
  ebay: 'eBay',
  goldin: 'Goldin',
  pwcc: 'PWCC',
  heritage: 'Heritage Auctions',
  comc: 'COMC',
  alt: 'ALT',
  whatnot: 'Whatnot',
  myslabs: 'MySlabs',
};

const PLATFORM_COLORS: Record<Platform, string> = {
  ebay: '#3b82f6',
  goldin: '#f59e0b',
  pwcc: '#8b5cf6',
  heritage: '#ef4444',
  comc: '#10b981',
  alt: '#06b6d4',
  whatnot: '#ec4899',
  myslabs: '#84cc16',
};

const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const TYPE_LABELS: Record<ArbitrageType, string> = {
  cross_platform: 'Cross-Platform',
  grade_spread: 'Grade Spread',
  condition_arbitrage: 'Condition Arbitrage',
  regional: 'Regional',
  timing: 'Timing',
};

// ── Platform Fee Structures ───────────────────────────────────────────────────

const PLATFORM_FEE_DATA: Record<Platform, { sellerFee: number; buyerPremium: number; paymentProcessing: number; shipping: number }> = {
  ebay:      { sellerFee: 0.1310, buyerPremium: 0.00, paymentProcessing: 0.0290, shipping: 4.50 },
  goldin:    { sellerFee: 0.10,   buyerPremium: 0.20, paymentProcessing: 0.03,   shipping: 0.00 },
  pwcc:      { sellerFee: 0.08,   buyerPremium: 0.20, paymentProcessing: 0.03,   shipping: 0.00 },
  heritage:  { sellerFee: 0.10,   buyerPremium: 0.20, paymentProcessing: 0.03,   shipping: 0.00 },
  comc:      { sellerFee: 0.05,   buyerPremium: 0.00, paymentProcessing: 0.00,   shipping: 0.99 },
  alt:       { sellerFee: 0.00,   buyerPremium: 0.00, paymentProcessing: 0.03,   shipping: 6.00 },
  whatnot:   { sellerFee: 0.089,  buyerPremium: 0.00, paymentProcessing: 0.029,  shipping: 5.00 },
  myslabs:   { sellerFee: 0.06,   buyerPremium: 0.00, paymentProcessing: 0.029,  shipping: 4.00 },
};

// ── Mock Data: Arbitrage Opportunities ────────────────────────────────────────

const MOCK_OPPORTUNITIES: ArbitrageOpportunity[] = [
  {
    id: 'arb-001',
    cardName: '2018 Prizm Silver Luka Doncic RC #280',
    player: 'Luka Doncic',
    year: 2018,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'ebay',
    sellPlatform: 'goldin',
    buyPrice: 2850,
    sellPrice: 3400,
    buyFees: 0,
    sellFees: 340,
    shippingCost: 15,
    netProfit: 195,
    profitMargin: 6.84,
    riskLevel: 'low',
    confidence: 92,
    timeRemaining: '2h 15m',
    status: 'active',
    discoveredAt: '2026-03-15T08:30:00Z',
    buyUrl: 'https://ebay.com/itm/example1',
    sellUrl: 'https://goldin.co/example1',
    notes: 'Buy It Now available. Goldin weekly auction ends tonight with strong demand.',
  },
  {
    id: 'arb-002',
    cardName: '2003 Topps Chrome Refractor LeBron James RC #111',
    player: 'LeBron James',
    year: 2003,
    grade: 'PSA 9',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'pwcc',
    sellPlatform: 'heritage',
    buyPrice: 18500,
    sellPrice: 22000,
    buyFees: 3700,
    sellFees: 2200,
    shippingCost: 25,
    netProfit: 1575,
    profitMargin: 7.10,
    riskLevel: 'medium',
    confidence: 78,
    timeRemaining: '5d 12h',
    status: 'active',
    discoveredAt: '2026-03-14T14:20:00Z',
    buyUrl: 'https://pwcc.com/example2',
    sellUrl: 'https://ha.com/example2',
    notes: 'Heritage signature auction incoming. PWCC price below recent comps.',
  },
  {
    id: 'arb-003',
    cardName: '2020 Prizm Justin Herbert RC #325',
    player: 'Justin Herbert',
    year: 2020,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'timing',
    buyPlatform: 'comc',
    sellPlatform: 'ebay',
    buyPrice: 135,
    sellPrice: 185,
    buyFees: 6.75,
    sellFees: 24.24,
    shippingCost: 4.50,
    netProfit: 14.51,
    profitMargin: 10.75,
    riskLevel: 'low',
    confidence: 88,
    timeRemaining: '6h 30m',
    status: 'active',
    discoveredAt: '2026-03-15T06:00:00Z',
    buyUrl: 'https://comc.com/example3',
    sellUrl: 'https://ebay.com/itm/example3',
    notes: 'NFL Draft hype. COMC has underpriced inventory.',
  },
  {
    id: 'arb-004',
    cardName: '2019 Mosaic Zion Williamson RC #209',
    player: 'Zion Williamson',
    year: 2019,
    grade: 'BGS 9.5',
    gradingCompany: 'BGS',
    type: 'grade_spread',
    buyPlatform: 'whatnot',
    sellPlatform: 'goldin',
    buyPrice: 320,
    sellPrice: 425,
    buyFees: 0,
    sellFees: 42.50,
    shippingCost: 5.00,
    netProfit: 57.50,
    profitMargin: 17.97,
    riskLevel: 'low',
    confidence: 85,
    timeRemaining: '1h 45m',
    status: 'active',
    discoveredAt: '2026-03-15T09:15:00Z',
    buyUrl: 'https://whatnot.com/example4',
    sellUrl: 'https://goldin.co/example4',
    notes: 'Whatnot live sale ended low. Goldin has strong BGS 9.5 demand.',
  },
  {
    id: 'arb-005',
    cardName: '1986 Fleer Michael Jordan RC #57',
    player: 'Michael Jordan',
    year: 1986,
    grade: 'PSA 7',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'myslabs',
    sellPlatform: 'heritage',
    buyPrice: 4200,
    sellPrice: 5100,
    buyFees: 252,
    sellFees: 510,
    shippingCost: 20,
    netProfit: 118,
    profitMargin: 2.81,
    riskLevel: 'medium',
    confidence: 72,
    timeRemaining: '8d 4h',
    status: 'active',
    discoveredAt: '2026-03-13T10:00:00Z',
    buyUrl: 'https://myslabs.com/example5',
    sellUrl: 'https://ha.com/example5',
    notes: 'Heritage auction premium historically 15-20% above market for vintage Jordan.',
  },
  {
    id: 'arb-006',
    cardName: '2023 Bowman Chrome Victor Wembanyama RC #1',
    player: 'Victor Wembanyama',
    year: 2023,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'timing',
    buyPlatform: 'alt',
    sellPlatform: 'ebay',
    buyPrice: 475,
    sellPrice: 580,
    buyFees: 14.25,
    sellFees: 76.00,
    shippingCost: 6.00,
    netProfit: 8.75,
    profitMargin: 1.84,
    riskLevel: 'high',
    confidence: 62,
    timeRemaining: '45m',
    status: 'active',
    discoveredAt: '2026-03-15T10:30:00Z',
    buyUrl: 'https://alt.xyz/example6',
    sellUrl: 'https://ebay.com/itm/example6',
    notes: 'ALT fixed price. eBay best offer trending higher. Tight window.',
  },
  {
    id: 'arb-007',
    cardName: '2011 Topps Update Mike Trout RC #US175',
    player: 'Mike Trout',
    year: 2011,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'ebay',
    sellPlatform: 'pwcc',
    buyPrice: 3100,
    sellPrice: 3600,
    buyFees: 0,
    sellFees: 288,
    shippingCost: 15,
    netProfit: 197,
    profitMargin: 6.35,
    riskLevel: 'low',
    confidence: 90,
    timeRemaining: '3d 8h',
    status: 'active',
    discoveredAt: '2026-03-14T16:45:00Z',
    buyUrl: 'https://ebay.com/itm/example7',
    sellUrl: 'https://pwcc.com/example7',
    notes: 'PWCC Weekly auction typically realizes 10-15% above eBay BIN for Trout RCs.',
  },
  {
    id: 'arb-008',
    cardName: '2018 National Treasures Saquon Barkley RPA /99',
    player: 'Saquon Barkley',
    year: 2018,
    grade: 'BGS 9',
    gradingCompany: 'BGS',
    type: 'condition_arbitrage',
    buyPlatform: 'comc',
    sellPlatform: 'goldin',
    buyPrice: 890,
    sellPrice: 1150,
    buyFees: 44.50,
    sellFees: 115,
    shippingCost: 8,
    netProfit: 92.50,
    profitMargin: 10.39,
    riskLevel: 'medium',
    confidence: 75,
    timeRemaining: '4d 2h',
    status: 'active',
    discoveredAt: '2026-03-14T08:00:00Z',
    buyUrl: 'https://comc.com/example8',
    sellUrl: 'https://goldin.co/example8',
    notes: 'National Treasures RPAs command premium on Goldin. COMC undervalued.',
  },
  {
    id: 'arb-009',
    cardName: '2022 Topps Chrome Julio Rodriguez RC #151',
    player: 'Julio Rodriguez',
    year: 2022,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'whatnot',
    sellPlatform: 'ebay',
    buyPrice: 65,
    sellPrice: 95,
    buyFees: 0,
    sellFees: 12.45,
    shippingCost: 4.50,
    netProfit: 13.05,
    profitMargin: 20.08,
    riskLevel: 'low',
    confidence: 93,
    timeRemaining: '12h',
    status: 'active',
    discoveredAt: '2026-03-15T07:00:00Z',
    buyUrl: 'https://whatnot.com/example9',
    sellUrl: 'https://ebay.com/itm/example9',
    notes: 'Whatnot live auction ended well below market. Easy flip to eBay.',
  },
  {
    id: 'arb-010',
    cardName: '1993 SP Foil Derek Jeter RC #279',
    player: 'Derek Jeter',
    year: 1993,
    grade: 'PSA 9',
    gradingCompany: 'PSA',
    type: 'regional',
    buyPlatform: 'myslabs',
    sellPlatform: 'goldin',
    buyPrice: 1850,
    sellPrice: 2250,
    buyFees: 111,
    sellFees: 225,
    shippingCost: 12,
    netProfit: 52,
    profitMargin: 2.81,
    riskLevel: 'medium',
    confidence: 70,
    timeRemaining: '6d',
    status: 'active',
    discoveredAt: '2026-03-13T12:00:00Z',
    buyUrl: 'https://myslabs.com/example10',
    sellUrl: 'https://goldin.co/example10',
    notes: 'Jeter HOF premium on Goldin. MySlabs has lower visibility for vintage.',
  },
  {
    id: 'arb-011',
    cardName: '2020 Prizm Ja Morant RC #259',
    player: 'Ja Morant',
    year: 2020,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'timing',
    buyPlatform: 'ebay',
    sellPlatform: 'alt',
    buyPrice: 210,
    sellPrice: 265,
    buyFees: 0,
    sellFees: 7.95,
    shippingCost: 6.00,
    netProfit: 41.05,
    profitMargin: 19.55,
    riskLevel: 'medium',
    confidence: 74,
    timeRemaining: '3h',
    status: 'active',
    discoveredAt: '2026-03-15T09:45:00Z',
    buyUrl: 'https://ebay.com/itm/example11',
    sellUrl: 'https://alt.xyz/example11',
    notes: 'Morant comeback narrative driving ALT prices above eBay. Time-sensitive.',
  },
  {
    id: 'arb-012',
    cardName: '2021 Panini Prizm Trevor Lawrence RC #331',
    player: 'Trevor Lawrence',
    year: 2021,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'comc',
    sellPlatform: 'whatnot',
    buyPrice: 42,
    sellPrice: 68,
    buyFees: 2.10,
    sellFees: 0,
    shippingCost: 4.50,
    netProfit: 19.40,
    profitMargin: 46.19,
    riskLevel: 'medium',
    confidence: 71,
    timeRemaining: '1d 6h',
    status: 'active',
    discoveredAt: '2026-03-15T05:30:00Z',
    buyUrl: 'https://comc.com/example12',
    sellUrl: 'https://whatnot.com/example12',
    notes: 'Whatnot NFL breaks trending. COMC clearance pricing.',
  },
  {
    id: 'arb-013',
    cardName: '2019 Optic Rated Rookie Zion Williamson #158',
    player: 'Zion Williamson',
    year: 2019,
    grade: 'SGC 10',
    gradingCompany: 'SGC',
    type: 'grade_spread',
    buyPlatform: 'ebay',
    sellPlatform: 'goldin',
    buyPrice: 180,
    sellPrice: 240,
    buyFees: 0,
    sellFees: 24,
    shippingCost: 4.50,
    netProfit: 31.50,
    profitMargin: 17.50,
    riskLevel: 'low',
    confidence: 86,
    timeRemaining: '8h',
    status: 'active',
    discoveredAt: '2026-03-15T04:00:00Z',
    buyUrl: 'https://ebay.com/itm/example13',
    sellUrl: 'https://goldin.co/example13',
    notes: 'SGC 10s selling near PSA 10 prices on Goldin. eBay discount for SGC labels.',
  },
  {
    id: 'arb-014',
    cardName: '2023 Topps Chrome Elly De La Cruz RC #80',
    player: 'Elly De La Cruz',
    year: 2023,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'timing',
    buyPlatform: 'myslabs',
    sellPlatform: 'ebay',
    buyPrice: 55,
    sellPrice: 82,
    buyFees: 3.30,
    sellFees: 10.74,
    shippingCost: 4.50,
    netProfit: 8.46,
    profitMargin: 15.38,
    riskLevel: 'low',
    confidence: 87,
    timeRemaining: '2d',
    status: 'active',
    discoveredAt: '2026-03-14T18:00:00Z',
    buyUrl: 'https://myslabs.com/example14',
    sellUrl: 'https://ebay.com/itm/example14',
    notes: 'Spring training hype. MySlabs price lag behind eBay for hot rookies.',
  },
  {
    id: 'arb-015',
    cardName: '2001 Bowman Chrome Albert Pujols RC #340',
    player: 'Albert Pujols',
    year: 2001,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'pwcc',
    sellPlatform: 'heritage',
    buyPrice: 4800,
    sellPrice: 5700,
    buyFees: 960,
    sellFees: 570,
    shippingCost: 20,
    netProfit: -650,
    profitMargin: -13.54,
    riskLevel: 'high',
    confidence: 45,
    timeRemaining: '10d',
    status: 'expired',
    discoveredAt: '2026-03-05T12:00:00Z',
    buyUrl: 'https://pwcc.com/example15',
    sellUrl: 'https://ha.com/example15',
    notes: 'Expired. Heritage auction did not reach expected levels.',
  },
  {
    id: 'arb-016',
    cardName: '2022 Prizm Brock Purdy RC #368',
    player: 'Brock Purdy',
    year: 2022,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'comc',
    sellPlatform: 'ebay',
    buyPrice: 95,
    sellPrice: 140,
    buyFees: 4.75,
    sellFees: 18.34,
    shippingCost: 4.50,
    netProfit: 17.41,
    profitMargin: 18.33,
    riskLevel: 'low',
    confidence: 91,
    timeRemaining: '18h',
    status: 'active',
    discoveredAt: '2026-03-15T03:00:00Z',
    buyUrl: 'https://comc.com/example16',
    sellUrl: 'https://ebay.com/itm/example16',
    notes: 'COMC consistently underpriced for football. Strong eBay demand.',
  },
  {
    id: 'arb-017',
    cardName: '2019 Topps Chrome Yordan Alvarez RC #168',
    player: 'Yordan Alvarez',
    year: 2019,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'timing',
    buyPlatform: 'alt',
    sellPlatform: 'goldin',
    buyPrice: 280,
    sellPrice: 370,
    buyFees: 8.40,
    sellFees: 37,
    shippingCost: 5,
    netProfit: 39.60,
    profitMargin: 14.14,
    riskLevel: 'low',
    confidence: 84,
    timeRemaining: '1d 12h',
    status: 'active',
    discoveredAt: '2026-03-14T20:00:00Z',
    buyUrl: 'https://alt.xyz/example17',
    sellUrl: 'https://goldin.co/example17',
    notes: 'Alvarez contract year. ALT fixed price below Goldin auction trend.',
  },
  {
    id: 'arb-018',
    cardName: '2018 Optic Lamar Jackson RC #167',
    player: 'Lamar Jackson',
    year: 2018,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'whatnot',
    sellPlatform: 'pwcc',
    buyPrice: 155,
    sellPrice: 210,
    buyFees: 0,
    sellFees: 16.80,
    shippingCost: 5,
    netProfit: 33.20,
    profitMargin: 21.42,
    riskLevel: 'low',
    confidence: 88,
    timeRemaining: '4d',
    status: 'active',
    discoveredAt: '2026-03-14T11:00:00Z',
    buyUrl: 'https://whatnot.com/example18',
    sellUrl: 'https://pwcc.com/example18',
    notes: 'Whatnot underperforms for football. PWCC weekly has strong football demand.',
  },
  {
    id: 'arb-019',
    cardName: '2023 Panini Prizm Caleb Williams RC #301',
    player: 'Caleb Williams',
    year: 2023,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'timing',
    buyPlatform: 'ebay',
    sellPlatform: 'whatnot',
    buyPrice: 48,
    sellPrice: 75,
    buyFees: 0,
    sellFees: 0,
    shippingCost: 5,
    netProfit: 22,
    profitMargin: 45.83,
    riskLevel: 'medium',
    confidence: 68,
    timeRemaining: '6h',
    status: 'active',
    discoveredAt: '2026-03-15T08:00:00Z',
    buyUrl: 'https://ebay.com/itm/example19',
    sellUrl: 'https://whatnot.com/example19',
    notes: 'Whatnot NFL draft hype shows premium for Bears rookies in live auctions.',
  },
  {
    id: 'arb-020',
    cardName: '1989 Upper Deck Ken Griffey Jr. RC #1',
    player: 'Ken Griffey Jr.',
    year: 1989,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'ebay',
    sellPlatform: 'heritage',
    buyPrice: 2400,
    sellPrice: 2950,
    buyFees: 0,
    sellFees: 295,
    shippingCost: 15,
    netProfit: 240,
    profitMargin: 10.00,
    riskLevel: 'low',
    confidence: 89,
    timeRemaining: '7d',
    status: 'active',
    discoveredAt: '2026-03-13T09:00:00Z',
    buyUrl: 'https://ebay.com/itm/example20',
    sellUrl: 'https://ha.com/example20',
    notes: 'Heritage consistently realizes premium for junk wax era iconic RCs.',
  },
  {
    id: 'arb-021',
    cardName: '2023 Bowman 1st Ethan Salas #BCP-1',
    player: 'Ethan Salas',
    year: 2023,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'timing',
    buyPlatform: 'comc',
    sellPlatform: 'alt',
    buyPrice: 38,
    sellPrice: 58,
    buyFees: 1.90,
    sellFees: 1.74,
    shippingCost: 4.50,
    netProfit: 11.86,
    profitMargin: 31.21,
    riskLevel: 'medium',
    confidence: 73,
    timeRemaining: '2d 8h',
    status: 'active',
    discoveredAt: '2026-03-14T22:00:00Z',
    buyUrl: 'https://comc.com/example21',
    sellUrl: 'https://alt.xyz/example21',
    notes: 'Top prospect call-up speculation. ALT audience skews younger / speculative.',
  },
  {
    id: 'arb-022',
    cardName: '2020 Select Concourse Joe Burrow RC #44',
    player: 'Joe Burrow',
    year: 2020,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'myslabs',
    sellPlatform: 'ebay',
    buyPrice: 110,
    sellPrice: 150,
    buyFees: 6.60,
    sellFees: 19.65,
    shippingCost: 4.50,
    netProfit: 9.25,
    profitMargin: 8.41,
    riskLevel: 'low',
    confidence: 85,
    timeRemaining: '1d',
    status: 'active',
    discoveredAt: '2026-03-15T01:00:00Z',
    buyUrl: 'https://myslabs.com/example22',
    sellUrl: 'https://ebay.com/itm/example22',
    notes: 'MySlabs to eBay arbitrage. Burrow always has liquid eBay demand.',
  },
  {
    id: 'arb-023',
    cardName: '2018 Topps Update Ronald Acuna Jr. RC #US250',
    player: 'Ronald Acuna Jr.',
    year: 2018,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'condition_arbitrage',
    buyPlatform: 'pwcc',
    sellPlatform: 'ebay',
    buyPrice: 285,
    sellPrice: 355,
    buyFees: 57,
    sellFees: 46.51,
    shippingCost: 4.50,
    netProfit: -38.01,
    profitMargin: -13.34,
    riskLevel: 'high',
    confidence: 40,
    timeRemaining: '0m',
    status: 'missed',
    discoveredAt: '2026-03-10T10:00:00Z',
    buyUrl: 'https://pwcc.com/example23',
    sellUrl: 'https://ebay.com/itm/example23',
    notes: 'Missed opportunity. Spread closed before execution.',
  },
  {
    id: 'arb-024',
    cardName: '2023 Topps Chrome Corbin Carroll RC #50',
    player: 'Corbin Carroll',
    year: 2023,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'alt',
    sellPlatform: 'goldin',
    buyPrice: 72,
    sellPrice: 105,
    buyFees: 2.16,
    sellFees: 10.50,
    shippingCost: 5,
    netProfit: 15.34,
    profitMargin: 21.31,
    riskLevel: 'low',
    confidence: 82,
    timeRemaining: '10h',
    status: 'active',
    discoveredAt: '2026-03-15T02:00:00Z',
    buyUrl: 'https://alt.xyz/example24',
    sellUrl: 'https://goldin.co/example24',
    notes: 'ALT price sticky low. Goldin weekly auction has baseball demand.',
  },
  {
    id: 'arb-025',
    cardName: '2020 Mosaic Tua Tagovailoa RC #210',
    player: 'Tua Tagovailoa',
    year: 2020,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'cross_platform',
    buyPlatform: 'comc',
    sellPlatform: 'whatnot',
    buyPrice: 28,
    sellPrice: 48,
    buyFees: 1.40,
    sellFees: 0,
    shippingCost: 4.50,
    netProfit: 14.10,
    profitMargin: 50.36,
    riskLevel: 'medium',
    confidence: 66,
    timeRemaining: '5h',
    status: 'active',
    discoveredAt: '2026-03-15T07:30:00Z',
    buyUrl: 'https://comc.com/example25',
    sellUrl: 'https://whatnot.com/example25',
    notes: 'Dolphins off-season hype. COMC clearance vs Whatnot live premium.',
  },
  {
    id: 'arb-026',
    cardName: '2022 Bowman Chrome Druw Jones 1st #BCP-50',
    player: 'Druw Jones',
    year: 2022,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'timing',
    buyPlatform: 'ebay',
    sellPlatform: 'alt',
    buyPrice: 22,
    sellPrice: 35,
    buyFees: 0,
    sellFees: 1.05,
    shippingCost: 4.50,
    netProfit: 7.45,
    profitMargin: 33.86,
    riskLevel: 'medium',
    confidence: 65,
    timeRemaining: '3d',
    status: 'active',
    discoveredAt: '2026-03-14T15:00:00Z',
    buyUrl: 'https://ebay.com/itm/example26',
    sellUrl: 'https://alt.xyz/example26',
    notes: 'Spring training breakout candidate. ALT prospect speculation premium.',
  },
  {
    id: 'arb-027',
    cardName: '2023 Prizm Chet Holmgren RC #249',
    player: 'Chet Holmgren',
    year: 2023,
    grade: 'PSA 10',
    gradingCompany: 'PSA',
    type: 'grade_spread',
    buyPlatform: 'whatnot',
    sellPlatform: 'ebay',
    buyPrice: 58,
    sellPrice: 85,
    buyFees: 0,
    sellFees: 11.14,
    shippingCost: 4.50,
    netProfit: 11.36,
    profitMargin: 19.59,
    riskLevel: 'low',
    confidence: 83,
    timeRemaining: '14h',
    status: 'active',
    discoveredAt: '2026-03-15T06:30:00Z',
    buyUrl: 'https://whatnot.com/example27',
    sellUrl: 'https://ebay.com/itm/example27',
    notes: 'Whatnot basketball deals available below eBay market consistently.',
  },
  {
    id: 'arb-028',
    cardName: '1952 Topps Mickey Mantle #311',
    player: 'Mickey Mantle',
    year: 1952,
    grade: 'PSA 3',
    gradingCompany: 'PSA',
    type: 'regional',
    buyPlatform: 'heritage',
    sellPlatform: 'goldin',
    buyPrice: 125000,
    sellPrice: 145000,
    buyFees: 25000,
    sellFees: 14500,
    shippingCost: 100,
    netProfit: -19600,
    profitMargin: -15.68,
    riskLevel: 'high',
    confidence: 35,
    timeRemaining: '0m',
    status: 'executed',
    discoveredAt: '2026-02-01T12:00:00Z',
    buyUrl: 'https://ha.com/example28',
    sellUrl: 'https://goldin.co/example28',
    notes: 'Executed trade. Buyer premium significantly ate into margin.',
  },
];

// ── Mock Data: Platform Pricing ───────────────────────────────────────────────

const MOCK_PLATFORM_PRICING: PlatformPricing[] = [
  {
    platform: 'ebay',
    lowestPrice: 245,
    avgPrice: 312,
    highestPrice: 425,
    activeListings: 847,
    avgDaysToSell: 4.2,
    sellerFeePercent: 13.1,
    buyerPremium: 0,
  },
  {
    platform: 'goldin',
    lowestPrice: 290,
    avgPrice: 378,
    highestPrice: 520,
    activeListings: 156,
    avgDaysToSell: 7.0,
    sellerFeePercent: 10,
    buyerPremium: 20,
  },
  {
    platform: 'pwcc',
    lowestPrice: 275,
    avgPrice: 352,
    highestPrice: 490,
    activeListings: 234,
    avgDaysToSell: 7.0,
    sellerFeePercent: 8,
    buyerPremium: 20,
  },
  {
    platform: 'heritage',
    lowestPrice: 310,
    avgPrice: 415,
    highestPrice: 580,
    activeListings: 42,
    avgDaysToSell: 30.0,
    sellerFeePercent: 10,
    buyerPremium: 20,
  },
  {
    platform: 'comc',
    lowestPrice: 210,
    avgPrice: 268,
    highestPrice: 340,
    activeListings: 1245,
    avgDaysToSell: 12.5,
    sellerFeePercent: 5,
    buyerPremium: 0,
  },
  {
    platform: 'alt',
    lowestPrice: 255,
    avgPrice: 330,
    highestPrice: 410,
    activeListings: 312,
    avgDaysToSell: 3.5,
    sellerFeePercent: 0,
    buyerPremium: 0,
  },
  {
    platform: 'whatnot',
    lowestPrice: 195,
    avgPrice: 285,
    highestPrice: 380,
    activeListings: 523,
    avgDaysToSell: 1.0,
    sellerFeePercent: 8.9,
    buyerPremium: 0,
  },
  {
    platform: 'myslabs',
    lowestPrice: 220,
    avgPrice: 295,
    highestPrice: 365,
    activeListings: 189,
    avgDaysToSell: 8.0,
    sellerFeePercent: 6,
    buyerPremium: 0,
  },
];

// ── Mock Data: Spread History ─────────────────────────────────────────────────

function generateSpreadHistory(cardId: string): SpreadHistory[] {
  // Deterministic seed from cardId
  let seed = 0;
  for (let i = 0; i < cardId.length; i++) {
    seed = ((seed << 5) - seed + cardId.charCodeAt(i)) | 0;
  }
  const pseudoRandom = (n: number) => {
    seed = (seed * 16807 + 7) % 2147483647;
    return Math.abs(seed % n);
  };

  const history: SpreadHistory[] = [];
  const baseSpread = 8 + pseudoRandom(15);
  const basePrice = 200 + pseudoRandom(800);
  const platforms: Platform[] = ['ebay', 'goldin', 'pwcc', 'heritage', 'comc', 'alt', 'whatnot', 'myslabs'];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = (pseudoRandom(10) - 5) * 0.5;
    const spread = Math.max(1, baseSpread + variation);
    const buyPrice = basePrice + pseudoRandom(40);
    const sellPrice = buyPrice * (1 + spread / 100);

    history.push({
      date: date.toISOString().split('T')[0],
      spread: Math.round(spread * 100) / 100,
      buyPrice: Math.round(buyPrice * 100) / 100,
      sellPrice: Math.round(sellPrice * 100) / 100,
      platform: platforms[pseudoRandom(platforms.length)],
    });
  }

  return history;
}

// ── Mock Data: Alerts ─────────────────────────────────────────────────────────

const MOCK_ALERTS: ArbitrageAlert[] = [
  {
    id: 'alert-001',
    opportunityId: 'arb-001',
    cardName: '2018 Prizm Silver Luka Doncic RC #280',
    type: 'new_opportunity',
    message: 'New cross-platform spread detected: eBay to Goldin. $195 potential profit at 6.8% margin.',
    profit: 195,
    timestamp: '2026-03-15T08:30:00Z',
    isRead: false,
    priority: 'high',
  },
  {
    id: 'alert-002',
    opportunityId: 'arb-004',
    cardName: '2019 Mosaic Zion Williamson RC #209',
    type: 'spread_widening',
    message: 'Spread widened to 17.9% for Zion Mosaic. Whatnot price dropped $15.',
    profit: 57.50,
    timestamp: '2026-03-15T09:20:00Z',
    isRead: false,
    priority: 'high',
  },
  {
    id: 'alert-003',
    opportunityId: 'arb-006',
    cardName: '2023 Bowman Chrome Victor Wembanyama RC #1',
    type: 'expiring_soon',
    message: 'Wembanyama arbitrage expires in 45 minutes. Act quickly if interested.',
    profit: 8.75,
    timestamp: '2026-03-15T10:30:00Z',
    isRead: false,
    priority: 'medium',
  },
  {
    id: 'alert-004',
    opportunityId: 'arb-009',
    cardName: '2022 Topps Chrome Julio Rodriguez RC #151',
    type: 'new_opportunity',
    message: 'High-confidence (93%) opportunity: Whatnot to eBay for J-Rod Chrome. 20% margin.',
    profit: 13.05,
    timestamp: '2026-03-15T07:00:00Z',
    isRead: true,
    priority: 'high',
  },
  {
    id: 'alert-005',
    opportunityId: 'arb-012',
    cardName: '2021 Panini Prizm Trevor Lawrence RC #331',
    type: 'new_opportunity',
    message: '46% margin detected on Lawrence Prizm. COMC to Whatnot arbitrage.',
    profit: 19.40,
    timestamp: '2026-03-15T05:30:00Z',
    isRead: true,
    priority: 'medium',
  },
  {
    id: 'alert-006',
    opportunityId: 'arb-016',
    cardName: '2022 Prizm Brock Purdy RC #368',
    type: 'price_change',
    message: 'Purdy eBay ask price increased by $12. Spread now 18.3%.',
    profit: 17.41,
    timestamp: '2026-03-15T04:15:00Z',
    isRead: true,
    priority: 'low',
  },
  {
    id: 'alert-007',
    opportunityId: 'arb-020',
    cardName: '1989 Upper Deck Ken Griffey Jr. RC #1',
    type: 'new_opportunity',
    message: 'Heritage premium for Griffey UD RC. $240 net profit, 10% margin. 7 days until auction.',
    profit: 240,
    timestamp: '2026-03-13T09:00:00Z',
    isRead: true,
    priority: 'high',
  },
  {
    id: 'alert-008',
    opportunityId: 'arb-025',
    cardName: '2020 Mosaic Tua Tagovailoa RC #210',
    type: 'spread_widening',
    message: 'Tua Mosaic spread widened to 50%. COMC clearance price dropping.',
    profit: 14.10,
    timestamp: '2026-03-15T07:30:00Z',
    isRead: false,
    priority: 'medium',
  },
  {
    id: 'alert-009',
    opportunityId: 'arb-019',
    cardName: '2023 Panini Prizm Caleb Williams RC #301',
    type: 'expiring_soon',
    message: 'Williams arbitrage window closing in 6 hours. Draft buzz fading.',
    profit: 22,
    timestamp: '2026-03-15T08:00:00Z',
    isRead: false,
    priority: 'medium',
  },
  {
    id: 'alert-010',
    opportunityId: 'arb-007',
    cardName: '2011 Topps Update Mike Trout RC #US175',
    type: 'new_opportunity',
    message: 'Trout RC spread detected: eBay BIN to PWCC auction. 90% confidence, $197 profit.',
    profit: 197,
    timestamp: '2026-03-14T16:45:00Z',
    isRead: true,
    priority: 'high',
  },
];

// ── Exported Functions ────────────────────────────────────────────────────────

/**
 * Returns all arbitrage opportunities, merging mock data with any user-stored data.
 */
export function getArbitrageOpportunities(): ArbitrageOpportunity[] {
  const stored = loadFromStorage<ArbitrageOpportunity[]>('opportunities', []);
  if (stored.length > 0) return stored;
  saveToStorage('opportunities', MOCK_OPPORTUNITIES);
  return [...MOCK_OPPORTUNITIES];
}

/**
 * Returns only active opportunities sorted by profit margin descending.
 */
export function getActiveOpportunities(): ArbitrageOpportunity[] {
  return getArbitrageOpportunities()
    .filter(o => o.status === 'active')
    .sort((a, b) => b.profitMargin - a.profitMargin);
}

/**
 * Returns platform pricing data. If cardId is provided, generates
 * slight variations to simulate per-card pricing.
 */
export function getPlatformPricing(cardId?: string): PlatformPricing[] {
  if (!cardId) return [...MOCK_PLATFORM_PRICING];

  // Deterministic variation based on cardId
  let seed = 0;
  for (let i = 0; i < cardId.length; i++) {
    seed = ((seed << 5) - seed + cardId.charCodeAt(i)) | 0;
  }
  const variation = () => {
    seed = (seed * 16807 + 7) % 2147483647;
    return 0.85 + (seed % 30) / 100;
  };

  return MOCK_PLATFORM_PRICING.map(p => {
    const mult = variation();
    return {
      ...p,
      lowestPrice: Math.round(p.lowestPrice * mult * 100) / 100,
      avgPrice: Math.round(p.avgPrice * mult * 100) / 100,
      highestPrice: Math.round(p.highestPrice * mult * 100) / 100,
      activeListings: Math.max(1, Math.round(p.activeListings * mult)),
    };
  });
}

/**
 * Computes aggregate arbitrage statistics from all opportunities.
 */
export function getArbitrageStats(): ArbitrageStats {
  const all = getArbitrageOpportunities();
  const active = all.filter(o => o.status === 'active');
  const executed = all.filter(o => o.status === 'executed');

  const totalPotentialProfit = active.reduce((sum, o) => sum + Math.max(0, o.netProfit), 0);
  const avgProfitMargin = active.length > 0
    ? active.reduce((sum, o) => sum + o.profitMargin, 0) / active.length
    : 0;
  const bestSpread = active.length > 0
    ? Math.max(...active.map(o => o.profitMargin))
    : 0;

  const executedProfit = executed.reduce((sum, o) => sum + o.netProfit, 0);
  const executedWins = executed.filter(o => o.netProfit > 0).length;
  const winRate = executed.length > 0 ? (executedWins / executed.length) * 100 : 0;

  // Find top platform pair by average spread
  const pairMap = new Map<string, { buy: Platform; sell: Platform; spreads: number[] }>();
  for (const o of active) {
    const key = `${o.buyPlatform}-${o.sellPlatform}`;
    if (!pairMap.has(key)) {
      pairMap.set(key, { buy: o.buyPlatform, sell: o.sellPlatform, spreads: [] });
    }
    pairMap.get(key)!.spreads.push(o.profitMargin);
  }

  let topPair = { buy: 'comc' as Platform, sell: 'ebay' as Platform, avgSpread: 0 };
  for (const [, pair] of pairMap) {
    const avg = pair.spreads.reduce((s, v) => s + v, 0) / pair.spreads.length;
    if (avg > topPair.avgSpread) {
      topPair = { buy: pair.buy, sell: pair.sell, avgSpread: Math.round(avg * 100) / 100 };
    }
  }

  return {
    totalOpportunities: all.length,
    activeOpportunities: active.length,
    avgProfitMargin: Math.round(avgProfitMargin * 100) / 100,
    bestSpread: Math.round(bestSpread * 100) / 100,
    totalPotentialProfit: Math.round(totalPotentialProfit * 100) / 100,
    executedTrades: executed.length,
    executedProfit: Math.round(executedProfit * 100) / 100,
    winRate: Math.round(winRate * 100) / 100,
    avgHoldTime: '3.2 days',
    topPlatformPair: topPair,
  };
}

/**
 * Returns fee comparison data for all platforms, calculated on a $500 sale.
 */
export function getFeeComparison(): FeeComparison[] {
  const salePrice = 500;
  return (Object.keys(PLATFORM_FEE_DATA) as Platform[]).map(platform => {
    const fees = PLATFORM_FEE_DATA[platform];
    const sellerFeeAmount = Math.round(salePrice * fees.sellerFee * 100) / 100;
    const buyerPremiumAmount = Math.round(salePrice * fees.buyerPremium * 100) / 100;
    const processingAmount = Math.round(salePrice * fees.paymentProcessing * 100) / 100;
    const shippingAmount = fees.shipping;
    const totalCost = Math.round((sellerFeeAmount + processingAmount + shippingAmount) * 100) / 100;
    const netOnSale = Math.round((salePrice - totalCost) * 100) / 100;

    return {
      platform,
      sellerFee: sellerFeeAmount,
      buyerPremium: buyerPremiumAmount,
      paymentProcessing: processingAmount,
      shipping: shippingAmount,
      totalCost,
      netOnSale,
    };
  });
}

/**
 * Returns spread history for a given card ID.
 */
export function getSpreadHistory(cardId: string): SpreadHistory[] {
  const stored = loadFromStorage<SpreadHistory[]>(`spread_${cardId}`, []);
  if (stored.length > 0) return stored;
  const generated = generateSpreadHistory(cardId);
  saveToStorage(`spread_${cardId}`, generated);
  return generated;
}

/**
 * Returns arbitrage alerts, merging stored state with defaults.
 */
export function getArbitrageAlerts(): ArbitrageAlert[] {
  const stored = loadFromStorage<ArbitrageAlert[]>('alerts', []);
  if (stored.length > 0) return stored;
  saveToStorage('alerts', MOCK_ALERTS);
  return [...MOCK_ALERTS];
}

/**
 * Calculates net profit after all platform fees and shipping.
 */
export function calculateNetProfit(
  buyPrice: number,
  sellPrice: number,
  buyPlatform: Platform,
  sellPlatform: Platform,
): number {
  const buyFees = PLATFORM_FEE_DATA[buyPlatform];
  const sellFees = PLATFORM_FEE_DATA[sellPlatform];

  // Buyer pays buyer premium on top of buy price
  const totalBuyCost = buyPrice * (1 + buyFees.buyerPremium) + buyFees.shipping;

  // Seller receives sale price minus seller fee and processing
  const sellerProceeds = sellPrice * (1 - sellFees.sellerFee - sellFees.paymentProcessing) - sellFees.shipping;

  return Math.round((sellerProceeds - totalBuyCost) * 100) / 100;
}

/**
 * Formats a number as USD currency.
 */
export function formatCurrency(amount: number): string {
  if (amount < 0) {
    return `-$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formats a number as a percentage string.
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Returns the brand color hex string for a platform.
 */
export function getPlatformColor(platform: Platform): string {
  return PLATFORM_COLORS[platform] || '#94a3b8';
}

/**
 * Returns the human-readable label for a platform.
 */
export function getPlatformLabel(platform: Platform): string {
  return PLATFORM_LABELS[platform] || platform;
}

/**
 * Returns the color hex string for a risk level.
 */
export function getRiskColor(risk: RiskLevel): string {
  return RISK_COLORS[risk] || '#94a3b8';
}

/**
 * Returns the human-readable label for an arbitrage type.
 */
export function getTypeLabel(type: ArbitrageType): string {
  return TYPE_LABELS[type] || type;
}
