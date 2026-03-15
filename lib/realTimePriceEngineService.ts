// Real-Time Price Engine (eBay Comp Aggregator)
// Cross-marketplace comp aggregation with real-time pricing intelligence,
// market depth analysis, price alerts, and volume tracking across all
// major sports card marketplaces.

// ── Types ─────────────────────────────────────────────────────────────────

export type MarketplaceSource = 'ebay' | 'goldin' | 'pwcc' | 'heritage' | 'comc' | 'alt' | 'whatnot';
export type SaleType = 'auction' | 'buy_it_now' | 'best_offer' | 'fixed';
export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';
export type PriceDirection = 'up' | 'down' | 'stable';

export interface RecentSale {
  id: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  grade: string;
  gradingCompany: 'PSA' | 'BGS' | 'SGC' | 'CGC';
  salePrice: number;
  previousComp: number;
  saleType: SaleType;
  source: MarketplaceSource;
  soldDate: string;
  imageUrl: string;
  buyerFeedbackScore: number;
  sellerName: string;
  shippingCost: number;
  listingUrl: string;
}

export interface PriceComposite {
  cardId: string;
  cardName: string;
  player: string;
  grade: string;
  gradingCompany: string;
  fairMarketValue: number;
  low: number;
  median: number;
  high: number;
  mean: number;
  salesCount: number;
  direction: PriceDirection;
  changePercent: number;
  change24h: number;
  change7d: number;
  change30d: number;
  volatility: number;
  lastSaleDate: string;
  confidenceScore: number;
  sources: { source: MarketplaceSource; count: number; avgPrice: number }[];
}

export interface MarketDepth {
  cardId: string;
  activeListings: number;
  lowestAsk: number;
  highestBid: number;
  spread: number;
  spreadPercent: number;
  listingsByPrice: { priceRange: string; count: number }[];
  avgDaysOnMarket: number;
  sellThroughRate: number;
}

export interface PriceAlert {
  id: string;
  cardName: string;
  player: string;
  type: 'below_target' | 'above_target' | 'price_drop' | 'new_comp' | 'outlier';
  currentPrice: number;
  targetPrice: number;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface MarketSummary {
  totalCompsTracked: number;
  totalSalesToday: number;
  avgSalePrice: number;
  marketVolume24h: number;
  topMover: { player: string; change: number };
  biggestDrop: { player: string; change: number };
  hotCards: { cardName: string; sales: number; avgPrice: number }[];
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
}

export interface VolumeBySource {
  source: MarketplaceSource;
  volume: number;
  avgPrice: number;
  salesCount: number;
  marketShare: number;
}

export interface PriceTrend {
  date: string;
  price: number;
  volume: number;
  source: MarketplaceSource;
}

// ── Storage Helpers ───────────────────────────────────────────────────────

const STORAGE_PREFIX = 'msi_price_engine';

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}_${key}`, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

// ── Mock Data: Recent Sales ───────────────────────────────────────────────

function generateRecentSales(): RecentSale[] {
  const cached = loadFromStorage<RecentSale[]>('recent_sales');
  if (cached && cached.length > 0) return cached;

  const sales: RecentSale[] = [
    {
      id: 'sale-001',
      cardName: '2011 Topps Update #US175 Mike Trout RC',
      player: 'Mike Trout',
      year: 2011,
      set: 'Topps Update',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 3850,
      previousComp: 3675,
      saleType: 'auction',
      source: 'ebay',
      soldDate: '2026-03-14',
      imageUrl: '/cards/trout-topps-update.jpg',
      buyerFeedbackScore: 1247,
      sellerName: 'CardVault2024',
      shippingCost: 0,
      listingUrl: 'https://ebay.com/itm/trout-psa10',
    },
    {
      id: 'sale-002',
      cardName: '2018 Topps Update #US1 Shohei Ohtani RC',
      player: 'Shohei Ohtani',
      year: 2018,
      set: 'Topps Update',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 485,
      previousComp: 510,
      saleType: 'buy_it_now',
      source: 'ebay',
      soldDate: '2026-03-14',
      imageUrl: '/cards/ohtani-topps-update.jpg',
      buyerFeedbackScore: 982,
      sellerName: 'PremiumSlabs',
      shippingCost: 4.99,
      listingUrl: 'https://ebay.com/itm/ohtani-psa10',
    },
    {
      id: 'sale-003',
      cardName: '2003 Topps Chrome #111 LeBron James RC',
      player: 'LeBron James',
      year: 2003,
      set: 'Topps Chrome',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 42500,
      previousComp: 41000,
      saleType: 'auction',
      source: 'goldin',
      soldDate: '2026-03-13',
      imageUrl: '/cards/lebron-topps-chrome.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'GoldinAuctions',
      shippingCost: 0,
      listingUrl: 'https://goldin.co/item/lebron-psa10',
    },
    {
      id: 'sale-004',
      cardName: '2018 Panini Prizm #280 Luka Doncic RC',
      player: 'Luka Doncic',
      year: 2018,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 2975,
      previousComp: 3100,
      saleType: 'auction',
      source: 'pwcc',
      soldDate: '2026-03-13',
      imageUrl: '/cards/luka-prizm.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'PWCCMarketplace',
      shippingCost: 0,
      listingUrl: 'https://pwcc.com/item/luka-psa10',
    },
    {
      id: 'sale-005',
      cardName: '2017 Panini Prizm #269 Patrick Mahomes RC',
      player: 'Patrick Mahomes',
      year: 2017,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 8250,
      previousComp: 7900,
      saleType: 'auction',
      source: 'ebay',
      soldDate: '2026-03-14',
      imageUrl: '/cards/mahomes-prizm.jpg',
      buyerFeedbackScore: 3410,
      sellerName: 'EliteCards',
      shippingCost: 0,
      listingUrl: 'https://ebay.com/itm/mahomes-psa10',
    },
    {
      id: 'sale-006',
      cardName: '2023 Panini Prizm #275 Victor Wembanyama RC',
      player: 'Victor Wembanyama',
      year: 2023,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 1850,
      previousComp: 1625,
      saleType: 'auction',
      source: 'goldin',
      soldDate: '2026-03-14',
      imageUrl: '/cards/wemby-prizm.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'GoldinAuctions',
      shippingCost: 0,
      listingUrl: 'https://goldin.co/item/wemby-psa10',
    },
    {
      id: 'sale-007',
      cardName: '2017 Panini Prizm #16 Jayson Tatum RC',
      player: 'Jayson Tatum',
      year: 2017,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 1425,
      previousComp: 1380,
      saleType: 'buy_it_now',
      source: 'comc',
      soldDate: '2026-03-13',
      imageUrl: '/cards/tatum-prizm.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'COMCVault',
      shippingCost: 2.99,
      listingUrl: 'https://comc.com/item/tatum-psa10',
    },
    {
      id: 'sale-008',
      cardName: '2019 Panini Prizm #248 Ja Morant RC',
      player: 'Ja Morant',
      year: 2019,
      set: 'Panini Prizm',
      grade: 'BGS 9.5',
      gradingCompany: 'BGS',
      salePrice: 625,
      previousComp: 690,
      saleType: 'auction',
      source: 'ebay',
      soldDate: '2026-03-12',
      imageUrl: '/cards/morant-prizm.jpg',
      buyerFeedbackScore: 567,
      sellerName: 'WaxpackHero',
      shippingCost: 5.99,
      listingUrl: 'https://ebay.com/itm/morant-bgs95',
    },
    {
      id: 'sale-009',
      cardName: '2020 Panini Prizm #258 Justin Herbert RC',
      player: 'Justin Herbert',
      year: 2020,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 385,
      previousComp: 370,
      saleType: 'buy_it_now',
      source: 'alt',
      soldDate: '2026-03-14',
      imageUrl: '/cards/herbert-prizm.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'AltMarket',
      shippingCost: 0,
      listingUrl: 'https://alt.xyz/item/herbert-psa10',
    },
    {
      id: 'sale-010',
      cardName: '1986 Fleer #57 Michael Jordan RC',
      player: 'Michael Jordan',
      year: 1986,
      set: 'Fleer',
      grade: 'PSA 9',
      gradingCompany: 'PSA',
      salePrice: 28750,
      previousComp: 29500,
      saleType: 'auction',
      source: 'heritage',
      soldDate: '2026-03-11',
      imageUrl: '/cards/jordan-fleer.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'HeritageAuctions',
      shippingCost: 0,
      listingUrl: 'https://ha.com/item/jordan-psa9',
    },
    {
      id: 'sale-011',
      cardName: '2020 Panini Prizm #282 Joe Burrow RC',
      player: 'Joe Burrow',
      year: 2020,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 475,
      previousComp: 440,
      saleType: 'best_offer',
      source: 'ebay',
      soldDate: '2026-03-14',
      imageUrl: '/cards/burrow-prizm.jpg',
      buyerFeedbackScore: 2150,
      sellerName: 'GridironGems',
      shippingCost: 4.50,
      listingUrl: 'https://ebay.com/itm/burrow-psa10',
    },
    {
      id: 'sale-012',
      cardName: '2018 Panini National Treasures #161 Josh Allen RC Auto /99',
      player: 'Josh Allen',
      year: 2018,
      set: 'National Treasures',
      grade: 'BGS 9.5',
      gradingCompany: 'BGS',
      salePrice: 12500,
      previousComp: 11800,
      saleType: 'auction',
      source: 'goldin',
      soldDate: '2026-03-12',
      imageUrl: '/cards/allen-nt-auto.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'GoldinAuctions',
      shippingCost: 0,
      listingUrl: 'https://goldin.co/item/allen-bgs95',
    },
    {
      id: 'sale-013',
      cardName: '2019 Panini Mosaic #209 Zion Williamson RC',
      player: 'Zion Williamson',
      year: 2019,
      set: 'Panini Mosaic',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 215,
      previousComp: 240,
      saleType: 'auction',
      source: 'whatnot',
      soldDate: '2026-03-13',
      imageUrl: '/cards/zion-mosaic.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'WhatnotBreaks',
      shippingCost: 0,
      listingUrl: 'https://whatnot.com/item/zion-psa10',
    },
    {
      id: 'sale-014',
      cardName: '2001 Bowman Chrome #350 Albert Pujols RC',
      player: 'Albert Pujols',
      year: 2001,
      set: 'Bowman Chrome',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 3200,
      previousComp: 3350,
      saleType: 'auction',
      source: 'pwcc',
      soldDate: '2026-03-10',
      imageUrl: '/cards/pujols-bowman.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'PWCCMarketplace',
      shippingCost: 0,
      listingUrl: 'https://pwcc.com/item/pujols-psa10',
    },
    {
      id: 'sale-015',
      cardName: '2018 Topps Chrome Update #HMT25 Juan Soto RC',
      player: 'Juan Soto',
      year: 2018,
      set: 'Topps Chrome Update',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 575,
      previousComp: 540,
      saleType: 'buy_it_now',
      source: 'ebay',
      soldDate: '2026-03-14',
      imageUrl: '/cards/soto-chrome.jpg',
      buyerFeedbackScore: 1845,
      sellerName: 'SlabCity',
      shippingCost: 3.99,
      listingUrl: 'https://ebay.com/itm/soto-psa10',
    },
    {
      id: 'sale-016',
      cardName: '2020 Panini Prizm #339 Anthony Edwards RC',
      player: 'Anthony Edwards',
      year: 2020,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 1150,
      previousComp: 985,
      saleType: 'auction',
      source: 'ebay',
      soldDate: '2026-03-14',
      imageUrl: '/cards/edwards-prizm.jpg',
      buyerFeedbackScore: 2078,
      sellerName: 'HoopsDreams',
      shippingCost: 0,
      listingUrl: 'https://ebay.com/itm/edwards-psa10',
    },
    {
      id: 'sale-017',
      cardName: '2020 Panini Prizm #325 CeeDee Lamb RC',
      player: 'CeeDee Lamb',
      year: 2020,
      set: 'Panini Prizm',
      grade: 'SGC 10',
      gradingCompany: 'SGC',
      salePrice: 165,
      previousComp: 155,
      saleType: 'fixed',
      source: 'comc',
      soldDate: '2026-03-13',
      imageUrl: '/cards/lamb-prizm.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'COMCDirect',
      shippingCost: 2.99,
      listingUrl: 'https://comc.com/item/lamb-sgc10',
    },
    {
      id: 'sale-018',
      cardName: '1993 SP #279 Derek Jeter Foil RC',
      player: 'Derek Jeter',
      year: 1993,
      set: 'SP',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 48000,
      previousComp: 46500,
      saleType: 'auction',
      source: 'heritage',
      soldDate: '2026-03-09',
      imageUrl: '/cards/jeter-sp.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'HeritageAuctions',
      shippingCost: 0,
      listingUrl: 'https://ha.com/item/jeter-psa10',
    },
    {
      id: 'sale-019',
      cardName: '2019 Panini Prizm #75 Kyler Murray RC',
      player: 'Kyler Murray',
      year: 2019,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 120,
      previousComp: 145,
      saleType: 'auction',
      source: 'whatnot',
      soldDate: '2026-03-12',
      imageUrl: '/cards/murray-prizm.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'WhatnotLive',
      shippingCost: 0,
      listingUrl: 'https://whatnot.com/item/murray-psa10',
    },
    {
      id: 'sale-020',
      cardName: '2022 Topps Chrome #150 Julio Rodriguez RC',
      player: 'Julio Rodriguez',
      year: 2022,
      set: 'Topps Chrome',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 210,
      previousComp: 195,
      saleType: 'buy_it_now',
      source: 'ebay',
      soldDate: '2026-03-14',
      imageUrl: '/cards/jrod-chrome.jpg',
      buyerFeedbackScore: 912,
      sellerName: 'NWSlabs',
      shippingCost: 3.99,
      listingUrl: 'https://ebay.com/itm/jrod-psa10',
    },
    {
      id: 'sale-021',
      cardName: '2020 Panini Select #44 Tua Tagovailoa RC',
      player: 'Tua Tagovailoa',
      year: 2020,
      set: 'Panini Select',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 95,
      previousComp: 110,
      saleType: 'auction',
      source: 'ebay',
      soldDate: '2026-03-13',
      imageUrl: '/cards/tua-select.jpg',
      buyerFeedbackScore: 487,
      sellerName: 'FinCollectibles',
      shippingCost: 4.49,
      listingUrl: 'https://ebay.com/itm/tua-psa10',
    },
    {
      id: 'sale-022',
      cardName: '2019 Panini Prizm #249 Tyler Herro RC',
      player: 'Tyler Herro',
      year: 2019,
      set: 'Panini Prizm',
      grade: 'CGC 9.5',
      gradingCompany: 'CGC',
      salePrice: 65,
      previousComp: 70,
      saleType: 'buy_it_now',
      source: 'alt',
      soldDate: '2026-03-12',
      imageUrl: '/cards/herro-prizm.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'AltGrails',
      shippingCost: 0,
      listingUrl: 'https://alt.xyz/item/herro-cgc95',
    },
    {
      id: 'sale-023',
      cardName: '2021 Panini Prizm #334 Trevor Lawrence RC',
      player: 'Trevor Lawrence',
      year: 2021,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 175,
      previousComp: 200,
      saleType: 'auction',
      source: 'ebay',
      soldDate: '2026-03-14',
      imageUrl: '/cards/lawrence-prizm.jpg',
      buyerFeedbackScore: 1523,
      sellerName: 'JaxCards',
      shippingCost: 4.99,
      listingUrl: 'https://ebay.com/itm/lawrence-psa10',
    },
    {
      id: 'sale-024',
      cardName: '2018 Panini Prizm Silver #280 Luka Doncic RC',
      player: 'Luka Doncic',
      year: 2018,
      set: 'Panini Prizm Silver',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 14200,
      previousComp: 13500,
      saleType: 'auction',
      source: 'goldin',
      soldDate: '2026-03-11',
      imageUrl: '/cards/luka-prizm-silver.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'GoldinAuctions',
      shippingCost: 0,
      listingUrl: 'https://goldin.co/item/luka-silver-psa10',
    },
    {
      id: 'sale-025',
      cardName: '2019 Bowman Chrome #100 Wander Franco RC',
      player: 'Wander Franco',
      year: 2019,
      set: 'Bowman Chrome',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 135,
      previousComp: 185,
      saleType: 'auction',
      source: 'ebay',
      soldDate: '2026-03-12',
      imageUrl: '/cards/franco-bowman.jpg',
      buyerFeedbackScore: 745,
      sellerName: 'ProspectKing',
      shippingCost: 3.99,
      listingUrl: 'https://ebay.com/itm/franco-psa10',
    },
    {
      id: 'sale-026',
      cardName: '2023 Topps Chrome #1 Elly De La Cruz RC',
      player: 'Elly De La Cruz',
      year: 2023,
      set: 'Topps Chrome',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 325,
      previousComp: 290,
      saleType: 'buy_it_now',
      source: 'ebay',
      soldDate: '2026-03-14',
      imageUrl: '/cards/elly-chrome.jpg',
      buyerFeedbackScore: 1120,
      sellerName: 'RedMachineCards',
      shippingCost: 4.49,
      listingUrl: 'https://ebay.com/itm/elly-psa10',
    },
    {
      id: 'sale-027',
      cardName: '2022 Panini Prizm #382 Brock Purdy RC',
      player: 'Brock Purdy',
      year: 2022,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 450,
      previousComp: 415,
      saleType: 'auction',
      source: 'ebay',
      soldDate: '2026-03-14',
      imageUrl: '/cards/purdy-prizm.jpg',
      buyerFeedbackScore: 890,
      sellerName: 'NinerNation',
      shippingCost: 0,
      listingUrl: 'https://ebay.com/itm/purdy-psa10',
    },
    {
      id: 'sale-028',
      cardName: '2003 Topps Chrome #115 Carmelo Anthony RC',
      player: 'Carmelo Anthony',
      year: 2003,
      set: 'Topps Chrome',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 1275,
      previousComp: 1350,
      saleType: 'auction',
      source: 'pwcc',
      soldDate: '2026-03-10',
      imageUrl: '/cards/melo-topps-chrome.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'PWCCMarketplace',
      shippingCost: 0,
      listingUrl: 'https://pwcc.com/item/melo-psa10',
    },
    {
      id: 'sale-029',
      cardName: '2020 Panini Prizm #328 Tyreek Hill',
      player: 'Tyreek Hill',
      year: 2020,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 85,
      previousComp: 90,
      saleType: 'fixed',
      source: 'comc',
      soldDate: '2026-03-13',
      imageUrl: '/cards/hill-prizm.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'COMCStore',
      shippingCost: 2.99,
      listingUrl: 'https://comc.com/item/hill-psa10',
    },
    {
      id: 'sale-030',
      cardName: '2022 Bowman Chrome #BCP-1 Jackson Holliday 1st',
      player: 'Jackson Holliday',
      year: 2022,
      set: 'Bowman Chrome',
      grade: 'BGS 9.5',
      gradingCompany: 'BGS',
      salePrice: 625,
      previousComp: 580,
      saleType: 'auction',
      source: 'ebay',
      soldDate: '2026-03-14',
      imageUrl: '/cards/holliday-bowman.jpg',
      buyerFeedbackScore: 654,
      sellerName: 'ProspectPipeline',
      shippingCost: 4.99,
      listingUrl: 'https://ebay.com/itm/holliday-bgs95',
    },
    {
      id: 'sale-031',
      cardName: '2017 Panini National Treasures #101 Patrick Mahomes RC Auto /99',
      player: 'Patrick Mahomes',
      year: 2017,
      set: 'National Treasures',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 185000,
      previousComp: 178000,
      saleType: 'auction',
      source: 'heritage',
      soldDate: '2026-03-08',
      imageUrl: '/cards/mahomes-nt-auto.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'HeritageAuctions',
      shippingCost: 0,
      listingUrl: 'https://ha.com/item/mahomes-nt-psa10',
    },
    {
      id: 'sale-032',
      cardName: '2020 Panini Prizm #288 LaMelo Ball RC',
      player: 'LaMelo Ball',
      year: 2020,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 385,
      previousComp: 410,
      saleType: 'auction',
      source: 'whatnot',
      soldDate: '2026-03-13',
      imageUrl: '/cards/lamelo-prizm.jpg',
      buyerFeedbackScore: 0,
      sellerName: 'WhatnotHoops',
      shippingCost: 0,
      listingUrl: 'https://whatnot.com/item/lamelo-psa10',
    },
    {
      id: 'sale-033',
      cardName: '2024 Topps Chrome #215 Paul Skenes RC',
      player: 'Paul Skenes',
      year: 2024,
      set: 'Topps Chrome',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 275,
      previousComp: 250,
      saleType: 'buy_it_now',
      source: 'ebay',
      soldDate: '2026-03-14',
      imageUrl: '/cards/skenes-chrome.jpg',
      buyerFeedbackScore: 1340,
      sellerName: 'SteelCityCards',
      shippingCost: 3.99,
      listingUrl: 'https://ebay.com/itm/skenes-psa10',
    },
    {
      id: 'sale-034',
      cardName: '2022 Panini Prizm #318 Caleb Williams RC',
      player: 'Caleb Williams',
      year: 2022,
      set: 'Panini Prizm',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      salePrice: 195,
      previousComp: 210,
      saleType: 'auction',
      source: 'ebay',
      soldDate: '2026-03-13',
      imageUrl: '/cards/williams-prizm.jpg',
      buyerFeedbackScore: 432,
      sellerName: 'WindyCards',
      shippingCost: 4.99,
      listingUrl: 'https://ebay.com/itm/williams-psa10',
    },
  ];

  saveToStorage('recent_sales', sales);
  return sales;
}

// ── Mock Data: Price Composites ───────────────────────────────────────────

function generatePriceComposites(): PriceComposite[] {
  const cached = loadFromStorage<PriceComposite[]>('price_composites');
  if (cached && cached.length > 0) return cached;

  const composites: PriceComposite[] = [
    {
      cardId: 'comp-001',
      cardName: '2011 Topps Update #US175 Mike Trout RC',
      player: 'Mike Trout',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 3800,
      low: 3400,
      median: 3775,
      high: 4200,
      mean: 3812,
      salesCount: 42,
      direction: 'up',
      changePercent: 4.8,
      change24h: 1.2,
      change7d: 3.1,
      change30d: 4.8,
      volatility: 12.3,
      lastSaleDate: '2026-03-14',
      confidenceScore: 94,
      sources: [
        { source: 'ebay', count: 28, avgPrice: 3750 },
        { source: 'goldin', count: 6, avgPrice: 3950 },
        { source: 'pwcc', count: 5, avgPrice: 3875 },
        { source: 'comc', count: 3, avgPrice: 3625 },
      ],
    },
    {
      cardId: 'comp-002',
      cardName: '2018 Topps Update #US1 Shohei Ohtani RC',
      player: 'Shohei Ohtani',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 490,
      low: 425,
      median: 485,
      high: 575,
      mean: 492,
      salesCount: 87,
      direction: 'down',
      changePercent: -4.9,
      change24h: -1.5,
      change7d: -3.2,
      change30d: -4.9,
      volatility: 15.7,
      lastSaleDate: '2026-03-14',
      confidenceScore: 97,
      sources: [
        { source: 'ebay', count: 62, avgPrice: 480 },
        { source: 'comc', count: 12, avgPrice: 475 },
        { source: 'alt', count: 8, avgPrice: 510 },
        { source: 'whatnot', count: 5, avgPrice: 500 },
      ],
    },
    {
      cardId: 'comp-003',
      cardName: '2003 Topps Chrome #111 LeBron James RC',
      player: 'LeBron James',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 42000,
      low: 38000,
      median: 41500,
      high: 47500,
      mean: 42150,
      salesCount: 8,
      direction: 'up',
      changePercent: 3.7,
      change24h: 0.5,
      change7d: 2.1,
      change30d: 3.7,
      volatility: 8.9,
      lastSaleDate: '2026-03-13',
      confidenceScore: 78,
      sources: [
        { source: 'goldin', count: 4, avgPrice: 43250 },
        { source: 'heritage', count: 2, avgPrice: 41500 },
        { source: 'pwcc', count: 2, avgPrice: 40000 },
      ],
    },
    {
      cardId: 'comp-004',
      cardName: '2018 Panini Prizm #280 Luka Doncic RC',
      player: 'Luka Doncic',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 3050,
      low: 2700,
      median: 3000,
      high: 3400,
      mean: 3025,
      salesCount: 35,
      direction: 'down',
      changePercent: -4.0,
      change24h: -0.8,
      change7d: -2.5,
      change30d: -4.0,
      volatility: 14.1,
      lastSaleDate: '2026-03-13',
      confidenceScore: 91,
      sources: [
        { source: 'ebay', count: 20, avgPrice: 2975 },
        { source: 'pwcc', count: 7, avgPrice: 3100 },
        { source: 'goldin', count: 5, avgPrice: 3200 },
        { source: 'whatnot', count: 3, avgPrice: 2900 },
      ],
    },
    {
      cardId: 'comp-005',
      cardName: '2017 Panini Prizm #269 Patrick Mahomes RC',
      player: 'Patrick Mahomes',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 8100,
      low: 7200,
      median: 8000,
      high: 9200,
      mean: 8150,
      salesCount: 24,
      direction: 'up',
      changePercent: 4.4,
      change24h: 1.0,
      change7d: 2.8,
      change30d: 4.4,
      volatility: 11.5,
      lastSaleDate: '2026-03-14',
      confidenceScore: 89,
      sources: [
        { source: 'ebay', count: 14, avgPrice: 8050 },
        { source: 'goldin', count: 5, avgPrice: 8400 },
        { source: 'pwcc', count: 3, avgPrice: 8100 },
        { source: 'heritage', count: 2, avgPrice: 8500 },
      ],
    },
    {
      cardId: 'comp-006',
      cardName: '2023 Panini Prizm #275 Victor Wembanyama RC',
      player: 'Victor Wembanyama',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 1750,
      low: 1400,
      median: 1725,
      high: 2100,
      mean: 1780,
      salesCount: 56,
      direction: 'up',
      changePercent: 13.8,
      change24h: 3.2,
      change7d: 8.5,
      change30d: 13.8,
      volatility: 22.4,
      lastSaleDate: '2026-03-14',
      confidenceScore: 92,
      sources: [
        { source: 'ebay', count: 35, avgPrice: 1700 },
        { source: 'goldin', count: 10, avgPrice: 1875 },
        { source: 'whatnot', count: 6, avgPrice: 1650 },
        { source: 'alt', count: 5, avgPrice: 1725 },
      ],
    },
    {
      cardId: 'comp-007',
      cardName: '2017 Panini Prizm #16 Jayson Tatum RC',
      player: 'Jayson Tatum',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 1400,
      low: 1200,
      median: 1375,
      high: 1650,
      mean: 1410,
      salesCount: 31,
      direction: 'up',
      changePercent: 3.3,
      change24h: 0.7,
      change7d: 1.9,
      change30d: 3.3,
      volatility: 10.2,
      lastSaleDate: '2026-03-13',
      confidenceScore: 90,
      sources: [
        { source: 'ebay', count: 18, avgPrice: 1380 },
        { source: 'comc', count: 7, avgPrice: 1350 },
        { source: 'goldin', count: 4, avgPrice: 1500 },
        { source: 'pwcc', count: 2, avgPrice: 1450 },
      ],
    },
    {
      cardId: 'comp-008',
      cardName: '1986 Fleer #57 Michael Jordan RC',
      player: 'Michael Jordan',
      grade: 'PSA 9',
      gradingCompany: 'PSA',
      fairMarketValue: 29000,
      low: 26000,
      median: 28500,
      high: 33000,
      mean: 29250,
      salesCount: 11,
      direction: 'down',
      changePercent: -2.5,
      change24h: -0.3,
      change7d: -1.2,
      change30d: -2.5,
      volatility: 9.8,
      lastSaleDate: '2026-03-11',
      confidenceScore: 82,
      sources: [
        { source: 'heritage', count: 4, avgPrice: 30000 },
        { source: 'goldin', count: 3, avgPrice: 29000 },
        { source: 'ebay', count: 3, avgPrice: 28000 },
        { source: 'pwcc', count: 1, avgPrice: 28500 },
      ],
    },
    {
      cardId: 'comp-009',
      cardName: '2020 Panini Prizm #339 Anthony Edwards RC',
      player: 'Anthony Edwards',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 1100,
      low: 850,
      median: 1075,
      high: 1350,
      mean: 1085,
      salesCount: 48,
      direction: 'up',
      changePercent: 16.8,
      change24h: 4.5,
      change7d: 10.2,
      change30d: 16.8,
      volatility: 24.6,
      lastSaleDate: '2026-03-14',
      confidenceScore: 93,
      sources: [
        { source: 'ebay', count: 30, avgPrice: 1050 },
        { source: 'whatnot', count: 8, avgPrice: 1100 },
        { source: 'goldin', count: 6, avgPrice: 1200 },
        { source: 'alt', count: 4, avgPrice: 1075 },
      ],
    },
    {
      cardId: 'comp-010',
      cardName: '2020 Panini Prizm #282 Joe Burrow RC',
      player: 'Joe Burrow',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 460,
      low: 380,
      median: 450,
      high: 550,
      mean: 465,
      salesCount: 39,
      direction: 'up',
      changePercent: 7.9,
      change24h: 2.1,
      change7d: 5.0,
      change30d: 7.9,
      volatility: 16.3,
      lastSaleDate: '2026-03-14',
      confidenceScore: 91,
      sources: [
        { source: 'ebay', count: 25, avgPrice: 455 },
        { source: 'comc', count: 6, avgPrice: 440 },
        { source: 'whatnot', count: 5, avgPrice: 470 },
        { source: 'alt', count: 3, avgPrice: 475 },
      ],
    },
    {
      cardId: 'comp-011',
      cardName: '2018 Panini National Treasures #161 Josh Allen RC Auto /99',
      player: 'Josh Allen',
      grade: 'BGS 9.5',
      gradingCompany: 'BGS',
      fairMarketValue: 12200,
      low: 10500,
      median: 12000,
      high: 14500,
      mean: 12350,
      salesCount: 6,
      direction: 'up',
      changePercent: 5.9,
      change24h: 1.5,
      change7d: 3.8,
      change30d: 5.9,
      volatility: 13.7,
      lastSaleDate: '2026-03-12',
      confidenceScore: 72,
      sources: [
        { source: 'goldin', count: 3, avgPrice: 12800 },
        { source: 'pwcc', count: 2, avgPrice: 11800 },
        { source: 'heritage', count: 1, avgPrice: 12000 },
      ],
    },
    {
      cardId: 'comp-012',
      cardName: '2022 Topps Chrome #150 Julio Rodriguez RC',
      player: 'Julio Rodriguez',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 205,
      low: 170,
      median: 200,
      high: 250,
      mean: 208,
      salesCount: 63,
      direction: 'up',
      changePercent: 7.7,
      change24h: 2.0,
      change7d: 4.8,
      change30d: 7.7,
      volatility: 18.1,
      lastSaleDate: '2026-03-14',
      confidenceScore: 95,
      sources: [
        { source: 'ebay', count: 42, avgPrice: 200 },
        { source: 'comc', count: 10, avgPrice: 195 },
        { source: 'whatnot', count: 7, avgPrice: 210 },
        { source: 'alt', count: 4, avgPrice: 215 },
      ],
    },
    {
      cardId: 'comp-013',
      cardName: '2022 Panini Prizm #382 Brock Purdy RC',
      player: 'Brock Purdy',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 440,
      low: 360,
      median: 430,
      high: 525,
      mean: 445,
      salesCount: 44,
      direction: 'up',
      changePercent: 8.4,
      change24h: 2.3,
      change7d: 5.5,
      change30d: 8.4,
      volatility: 17.8,
      lastSaleDate: '2026-03-14',
      confidenceScore: 92,
      sources: [
        { source: 'ebay', count: 28, avgPrice: 435 },
        { source: 'whatnot', count: 8, avgPrice: 445 },
        { source: 'comc', count: 5, avgPrice: 420 },
        { source: 'alt', count: 3, avgPrice: 455 },
      ],
    },
    {
      cardId: 'comp-014',
      cardName: '1993 SP #279 Derek Jeter Foil RC',
      player: 'Derek Jeter',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 47500,
      low: 42000,
      median: 47000,
      high: 54000,
      mean: 47800,
      salesCount: 5,
      direction: 'up',
      changePercent: 3.2,
      change24h: 0.4,
      change7d: 1.8,
      change30d: 3.2,
      volatility: 7.5,
      lastSaleDate: '2026-03-09',
      confidenceScore: 68,
      sources: [
        { source: 'heritage', count: 3, avgPrice: 48500 },
        { source: 'goldin', count: 1, avgPrice: 47000 },
        { source: 'pwcc', count: 1, avgPrice: 45000 },
      ],
    },
    {
      cardId: 'comp-015',
      cardName: '2023 Topps Chrome #1 Elly De La Cruz RC',
      player: 'Elly De La Cruz',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 310,
      low: 250,
      median: 305,
      high: 380,
      mean: 315,
      salesCount: 52,
      direction: 'up',
      changePercent: 12.1,
      change24h: 3.0,
      change7d: 7.5,
      change30d: 12.1,
      volatility: 20.3,
      lastSaleDate: '2026-03-14',
      confidenceScore: 94,
      sources: [
        { source: 'ebay', count: 34, avgPrice: 305 },
        { source: 'comc', count: 9, avgPrice: 295 },
        { source: 'whatnot', count: 5, avgPrice: 320 },
        { source: 'alt', count: 4, avgPrice: 315 },
      ],
    },
    {
      cardId: 'comp-016',
      cardName: '2020 Panini Prizm #258 Justin Herbert RC',
      player: 'Justin Herbert',
      grade: 'PSA 10',
      gradingCompany: 'PSA',
      fairMarketValue: 380,
      low: 320,
      median: 375,
      high: 450,
      mean: 382,
      salesCount: 41,
      direction: 'stable',
      changePercent: 1.1,
      change24h: 0.3,
      change7d: 0.6,
      change30d: 1.1,
      volatility: 9.4,
      lastSaleDate: '2026-03-14',
      confidenceScore: 92,
      sources: [
        { source: 'ebay', count: 26, avgPrice: 375 },
        { source: 'alt', count: 7, avgPrice: 385 },
        { source: 'comc', count: 5, avgPrice: 370 },
        { source: 'whatnot', count: 3, avgPrice: 390 },
      ],
    },
  ];

  saveToStorage('price_composites', composites);
  return composites;
}

// ── Mock Data: Price Alerts ───────────────────────────────────────────────

function generatePriceAlerts(): PriceAlert[] {
  const cached = loadFromStorage<PriceAlert[]>('price_alerts');
  if (cached && cached.length > 0) return cached;

  const alerts: PriceAlert[] = [
    {
      id: 'alert-001',
      cardName: '2020 Panini Prizm #339 Anthony Edwards RC PSA 10',
      player: 'Anthony Edwards',
      type: 'price_drop',
      currentPrice: 1150,
      targetPrice: 1000,
      message: 'Anthony Edwards Prizm PSA 10 sold for $1,150 on eBay -- up 16.8% in 30 days. Strong buy signal.',
      timestamp: '2026-03-14T14:32:00Z',
      isRead: false,
      priority: 'high',
    },
    {
      id: 'alert-002',
      cardName: '2023 Panini Prizm #275 Victor Wembanyama RC PSA 10',
      player: 'Victor Wembanyama',
      type: 'above_target',
      currentPrice: 1850,
      targetPrice: 1700,
      message: 'Wembanyama Prizm PSA 10 has broken above your $1,700 target. Last sale: $1,850 on Goldin.',
      timestamp: '2026-03-14T12:15:00Z',
      isRead: false,
      priority: 'high',
    },
    {
      id: 'alert-003',
      cardName: '2018 Topps Update #US1 Shohei Ohtani RC PSA 10',
      player: 'Shohei Ohtani',
      type: 'below_target',
      currentPrice: 485,
      targetPrice: 500,
      message: 'Ohtani Topps Update PSA 10 dropped below your $500 target. Current FMV: $490.',
      timestamp: '2026-03-14T10:45:00Z',
      isRead: true,
      priority: 'medium',
    },
    {
      id: 'alert-004',
      cardName: '2019 Bowman Chrome #100 Wander Franco RC PSA 10',
      player: 'Wander Franco',
      type: 'price_drop',
      currentPrice: 135,
      targetPrice: 185,
      message: 'Wander Franco Bowman Chrome PSA 10 sold for $135 -- down 27% from previous comp of $185. Potential buying opportunity or continued decline.',
      timestamp: '2026-03-12T18:20:00Z',
      isRead: false,
      priority: 'high',
    },
    {
      id: 'alert-005',
      cardName: '2018 Panini Prizm Silver #280 Luka Doncic RC PSA 10',
      player: 'Luka Doncic',
      type: 'new_comp',
      currentPrice: 14200,
      targetPrice: 13000,
      message: 'New comp recorded: Luka Doncic Prizm Silver PSA 10 sold for $14,200 on Goldin. Up 5.2% from last comp.',
      timestamp: '2026-03-11T20:00:00Z',
      isRead: true,
      priority: 'medium',
    },
    {
      id: 'alert-006',
      cardName: '2020 Panini Prizm #282 Joe Burrow RC PSA 10',
      player: 'Joe Burrow',
      type: 'new_comp',
      currentPrice: 475,
      targetPrice: 400,
      message: 'New comp: Joe Burrow Prizm PSA 10 sold for $475 via best offer on eBay. 7.9% above 30-day average.',
      timestamp: '2026-03-14T09:10:00Z',
      isRead: false,
      priority: 'low',
    },
    {
      id: 'alert-007',
      cardName: '1986 Fleer #57 Michael Jordan RC PSA 9',
      player: 'Michael Jordan',
      type: 'outlier',
      currentPrice: 28750,
      targetPrice: 29500,
      message: 'Michael Jordan Fleer PSA 9 sold for $28,750 on Heritage -- 2.5% below recent median. Possible outlier or softening market.',
      timestamp: '2026-03-11T16:45:00Z',
      isRead: true,
      priority: 'medium',
    },
    {
      id: 'alert-008',
      cardName: '2022 Panini Prizm #382 Brock Purdy RC PSA 10',
      player: 'Brock Purdy',
      type: 'above_target',
      currentPrice: 450,
      targetPrice: 400,
      message: 'Brock Purdy Prizm PSA 10 surged to $450. Up 8.4% in 30 days with strong volume.',
      timestamp: '2026-03-14T11:30:00Z',
      isRead: false,
      priority: 'medium',
    },
  ];

  saveToStorage('price_alerts', alerts);
  return alerts;
}

// ── Mock Data: Market Depth ───────────────────────────────────────────────

function generateMarketDepthData(): Record<string, MarketDepth> {
  const cached = loadFromStorage<Record<string, MarketDepth>>('market_depth');
  if (cached && Object.keys(cached).length > 0) return cached;

  const depthMap: Record<string, MarketDepth> = {
    'comp-001': {
      cardId: 'comp-001',
      activeListings: 18,
      lowestAsk: 3650,
      highestBid: 3400,
      spread: 250,
      spreadPercent: 6.8,
      listingsByPrice: [
        { priceRange: '$3,400-$3,600', count: 3 },
        { priceRange: '$3,600-$3,800', count: 7 },
        { priceRange: '$3,800-$4,000', count: 5 },
        { priceRange: '$4,000-$4,200', count: 2 },
        { priceRange: '$4,200+', count: 1 },
      ],
      avgDaysOnMarket: 8.5,
      sellThroughRate: 72,
    },
    'comp-002': {
      cardId: 'comp-002',
      activeListings: 45,
      lowestAsk: 460,
      highestBid: 425,
      spread: 35,
      spreadPercent: 7.6,
      listingsByPrice: [
        { priceRange: '$400-$450', count: 8 },
        { priceRange: '$450-$500', count: 18 },
        { priceRange: '$500-$550', count: 12 },
        { priceRange: '$550-$600', count: 5 },
        { priceRange: '$600+', count: 2 },
      ],
      avgDaysOnMarket: 5.2,
      sellThroughRate: 81,
    },
    'comp-003': {
      cardId: 'comp-003',
      activeListings: 4,
      lowestAsk: 40000,
      highestBid: 37000,
      spread: 3000,
      spreadPercent: 7.5,
      listingsByPrice: [
        { priceRange: '$38K-$40K', count: 1 },
        { priceRange: '$40K-$42K', count: 1 },
        { priceRange: '$42K-$45K', count: 1 },
        { priceRange: '$45K+', count: 1 },
      ],
      avgDaysOnMarket: 21.3,
      sellThroughRate: 55,
    },
    'comp-005': {
      cardId: 'comp-005',
      activeListings: 12,
      lowestAsk: 7800,
      highestBid: 7200,
      spread: 600,
      spreadPercent: 7.7,
      listingsByPrice: [
        { priceRange: '$7,200-$7,800', count: 3 },
        { priceRange: '$7,800-$8,400', count: 5 },
        { priceRange: '$8,400-$9,000', count: 3 },
        { priceRange: '$9,000+', count: 1 },
      ],
      avgDaysOnMarket: 11.7,
      sellThroughRate: 68,
    },
    'comp-006': {
      cardId: 'comp-006',
      activeListings: 32,
      lowestAsk: 1550,
      highestBid: 1400,
      spread: 150,
      spreadPercent: 9.7,
      listingsByPrice: [
        { priceRange: '$1,400-$1,600', count: 6 },
        { priceRange: '$1,600-$1,800', count: 12 },
        { priceRange: '$1,800-$2,000', count: 9 },
        { priceRange: '$2,000-$2,200', count: 4 },
        { priceRange: '$2,200+', count: 1 },
      ],
      avgDaysOnMarket: 4.8,
      sellThroughRate: 85,
    },
    'comp-009': {
      cardId: 'comp-009',
      activeListings: 28,
      lowestAsk: 975,
      highestBid: 900,
      spread: 75,
      spreadPercent: 7.7,
      listingsByPrice: [
        { priceRange: '$900-$1,000', count: 5 },
        { priceRange: '$1,000-$1,100', count: 10 },
        { priceRange: '$1,100-$1,200', count: 8 },
        { priceRange: '$1,200-$1,350', count: 4 },
        { priceRange: '$1,350+', count: 1 },
      ],
      avgDaysOnMarket: 3.9,
      sellThroughRate: 88,
    },
    'comp-010': {
      cardId: 'comp-010',
      activeListings: 22,
      lowestAsk: 410,
      highestBid: 380,
      spread: 30,
      spreadPercent: 7.3,
      listingsByPrice: [
        { priceRange: '$380-$420', count: 5 },
        { priceRange: '$420-$460', count: 8 },
        { priceRange: '$460-$500', count: 6 },
        { priceRange: '$500-$550', count: 2 },
        { priceRange: '$550+', count: 1 },
      ],
      avgDaysOnMarket: 6.1,
      sellThroughRate: 76,
    },
    'comp-013': {
      cardId: 'comp-013',
      activeListings: 25,
      lowestAsk: 395,
      highestBid: 360,
      spread: 35,
      spreadPercent: 8.9,
      listingsByPrice: [
        { priceRange: '$360-$400', count: 5 },
        { priceRange: '$400-$440', count: 9 },
        { priceRange: '$440-$480', count: 7 },
        { priceRange: '$480-$525', count: 3 },
        { priceRange: '$525+', count: 1 },
      ],
      avgDaysOnMarket: 5.5,
      sellThroughRate: 79,
    },
  };

  saveToStorage('market_depth', depthMap);
  return depthMap;
}

// ── Mock Data: Price Trends ───────────────────────────────────────────────

function generatePriceTrends(): Record<string, PriceTrend[]> {
  const cached = loadFromStorage<Record<string, PriceTrend[]>>('price_trends');
  if (cached && Object.keys(cached).length > 0) return cached;

  const trendMap: Record<string, PriceTrend[]> = {};

  // Generate 30-day trends for key composites
  const trendConfigs: { id: string; basePrice: number; trend: number; vol: number }[] = [
    { id: 'comp-001', basePrice: 3600, trend: 0.002, vol: 150 },
    { id: 'comp-002', basePrice: 520, trend: -0.0018, vol: 25 },
    { id: 'comp-003', basePrice: 40000, trend: 0.0012, vol: 2000 },
    { id: 'comp-004', basePrice: 3200, trend: -0.0015, vol: 160 },
    { id: 'comp-005', basePrice: 7600, trend: 0.0016, vol: 350 },
    { id: 'comp-006', basePrice: 1450, trend: 0.005, vol: 100 },
    { id: 'comp-007', basePrice: 1350, trend: 0.001, vol: 70 },
    { id: 'comp-008', basePrice: 30000, trend: -0.001, vol: 1200 },
    { id: 'comp-009', basePrice: 850, trend: 0.006, vol: 60 },
    { id: 'comp-010', basePrice: 400, trend: 0.003, vol: 25 },
    { id: 'comp-013', basePrice: 380, trend: 0.003, vol: 20 },
    { id: 'comp-015', basePrice: 260, trend: 0.004, vol: 18 },
  ];

  const sources: MarketplaceSource[] = ['ebay', 'goldin', 'pwcc', 'heritage', 'comc', 'alt', 'whatnot'];

  for (const cfg of trendConfigs) {
    const trends: PriceTrend[] = [];
    let price = cfg.basePrice;
    for (let d = 30; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];
      const noise = (Math.random() - 0.5) * cfg.vol * 2;
      price = price * (1 + cfg.trend) + noise;
      price = Math.max(price * 0.7, price); // floor
      trends.push({
        date: dateStr,
        price: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 8) + 1,
        source: sources[Math.floor(Math.random() * sources.length)],
      });
    }
    trendMap[cfg.id] = trends;
  }

  saveToStorage('price_trends', trendMap);
  return trendMap;
}

// ── Exported Functions ────────────────────────────────────────────────────

/**
 * Get recent sales filtered by time range.
 */
export function getRecentSales(range?: TimeRange): RecentSale[] {
  const sales = generateRecentSales();

  if (!range) return sales;

  const now = new Date();
  const cutoffs: Record<TimeRange, number> = {
    '24h': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
  };

  const daysBack = cutoffs[range];
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  return sales.filter((s) => new Date(s.soldDate) >= cutoffDate);
}

/**
 * Get all price composites.
 */
export function getPriceComposites(): PriceComposite[] {
  return generatePriceComposites();
}

/**
 * Get market depth for a specific card by composite ID.
 */
export function getMarketDepth(cardId: string): MarketDepth {
  const depthMap = generateMarketDepthData();
  if (depthMap[cardId]) return depthMap[cardId];

  // Generate a fallback for unknown cards
  return {
    cardId,
    activeListings: Math.floor(Math.random() * 20) + 2,
    lowestAsk: 100,
    highestBid: 85,
    spread: 15,
    spreadPercent: 15.0,
    listingsByPrice: [
      { priceRange: '$80-$100', count: 3 },
      { priceRange: '$100-$120', count: 5 },
      { priceRange: '$120-$140', count: 2 },
    ],
    avgDaysOnMarket: 10,
    sellThroughRate: 60,
  };
}

/**
 * Get active price alerts.
 */
export function getPriceAlerts(): PriceAlert[] {
  return generatePriceAlerts();
}

/**
 * Get aggregated market summary.
 */
export function getMarketSummary(): MarketSummary {
  const cached = loadFromStorage<MarketSummary>('market_summary');
  if (cached) return cached;

  const sales = generateRecentSales();
  const composites = generatePriceComposites();

  const totalSalesToday = sales.filter(
    (s) => s.soldDate === '2026-03-14'
  ).length;

  const allPrices = sales.map((s) => s.salePrice);
  const avgPrice = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
  const volume24h = sales
    .filter((s) => s.soldDate === '2026-03-14')
    .reduce((sum, s) => sum + s.salePrice, 0);

  const sortedByChange = [...composites].sort(
    (a, b) => b.changePercent - a.changePercent
  );
  const topMover = sortedByChange[0];
  const biggestDrop = sortedByChange[sortedByChange.length - 1];

  const hotCards = composites
    .filter((c) => c.salesCount >= 30)
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5)
    .map((c) => ({
      cardName: c.cardName,
      sales: c.salesCount,
      avgPrice: c.mean,
    }));

  const avgChange =
    composites.reduce((sum, c) => sum + c.changePercent, 0) / composites.length;
  const sentiment: 'bullish' | 'bearish' | 'neutral' =
    avgChange > 3 ? 'bullish' : avgChange < -3 ? 'bearish' : 'neutral';
  const sentimentScore = Math.min(100, Math.max(0, 50 + avgChange * 5));

  const summary: MarketSummary = {
    totalCompsTracked: composites.reduce((sum, c) => sum + c.salesCount, 0),
    totalSalesToday,
    avgSalePrice: Math.round(avgPrice),
    marketVolume24h: volume24h,
    topMover: { player: topMover.player, change: topMover.changePercent },
    biggestDrop: { player: biggestDrop.player, change: biggestDrop.changePercent },
    hotCards,
    marketSentiment: sentiment,
    sentimentScore: Math.round(sentimentScore),
  };

  saveToStorage('market_summary', summary);
  return summary;
}

/**
 * Get volume aggregated by marketplace source.
 */
export function getVolumeBySource(): VolumeBySource[] {
  const cached = loadFromStorage<VolumeBySource[]>('volume_by_source');
  if (cached && cached.length > 0) return cached;

  const composites = generatePriceComposites();
  const sourceMap = new Map<
    MarketplaceSource,
    { volume: number; totalPrice: number; count: number }
  >();

  for (const comp of composites) {
    for (const src of comp.sources) {
      const existing = sourceMap.get(src.source) || {
        volume: 0,
        totalPrice: 0,
        count: 0,
      };
      existing.volume += src.count * src.avgPrice;
      existing.totalPrice += src.avgPrice * src.count;
      existing.count += src.count;
      sourceMap.set(src.source, existing);
    }
  }

  const totalVolume = Array.from(sourceMap.values()).reduce(
    (sum, v) => sum + v.volume,
    0
  );

  const volumes: VolumeBySource[] = Array.from(sourceMap.entries()).map(
    ([source, data]) => ({
      source,
      volume: Math.round(data.volume),
      avgPrice: Math.round(data.totalPrice / data.count),
      salesCount: data.count,
      marketShare: Math.round((data.volume / totalVolume) * 1000) / 10,
    })
  );

  volumes.sort((a, b) => b.volume - a.volume);
  saveToStorage('volume_by_source', volumes);
  return volumes;
}

/**
 * Get price trend data for a specific card composite.
 */
export function getPriceTrends(cardId: string): PriceTrend[] {
  const trendMap = generatePriceTrends();
  return trendMap[cardId] || [];
}

/**
 * Search recent comps by query string (matches player, card name, set).
 */
export function searchComps(query: string): RecentSale[] {
  const sales = generateRecentSales();
  if (!query.trim()) return sales;

  const q = query.toLowerCase();
  return sales.filter(
    (s) =>
      s.player.toLowerCase().includes(q) ||
      s.cardName.toLowerCase().includes(q) ||
      s.set.toLowerCase().includes(q) ||
      s.grade.toLowerCase().includes(q) ||
      s.source.toLowerCase().includes(q)
  );
}

// ── Utility Functions ─────────────────────────────────────────────────────

/**
 * Format a number as USD currency.
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format an ISO date string into a human-friendly format.
 */
export function formatDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Get a brand color for each marketplace source.
 */
export function getSourceColor(source: MarketplaceSource): string {
  const colors: Record<MarketplaceSource, string> = {
    ebay: '#3b82f6',
    goldin: '#f59e0b',
    pwcc: '#8b5cf6',
    heritage: '#ef4444',
    comc: '#10b981',
    alt: '#06b6d4',
    whatnot: '#ec4899',
  };
  return colors[source] || '#94a3b8';
}

/**
 * Get a human-readable label for sale types.
 */
export function getSaleTypeLabel(type: SaleType): string {
  const labels: Record<SaleType, string> = {
    auction: 'Auction',
    buy_it_now: 'Buy It Now',
    best_offer: 'Best Offer',
    fixed: 'Fixed Price',
  };
  return labels[type] || type;
}

/**
 * Get a color for the price direction indicator.
 */
export function getDirectionColor(direction: PriceDirection): string {
  const colors: Record<PriceDirection, string> = {
    up: '#10b981',
    down: '#ef4444',
    stable: '#94a3b8',
  };
  return colors[direction] || '#94a3b8';
}
