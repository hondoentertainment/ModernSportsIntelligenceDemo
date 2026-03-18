import { store } from './dal/syncStore';

// Phase 115: Marketplace Aggregator & One-Click Buy
// Cross-platform marketplace intelligence with unified search, fee-adjusted
// price comparison, one-click purchase orchestration, and platform health monitoring.

// ── Interfaces ──────────────────────────────────────────────────────────────────

export type MarketplacePlatform = 'ebay' | 'comc' | 'myslabs' | 'starstock' | 'alt' | 'pwcc' | 'goldin';

export type ListingCondition = 'raw' | 'graded';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface FeeStructure {
  platform: MarketplacePlatform;
  buyerPremium: number;       // percentage (0-1)
  shippingFlat: number;       // flat shipping cost
  shippingPercent: number;    // percentage-based shipping (0-1)
  salesTaxRate: number;       // percentage (0-1)
  processingFee: number;      // fixed processing fee
  insuranceFee: number;       // insurance per order
  label: string;
}

export interface MarketplaceListing {
  id: string;
  platform: MarketplacePlatform;
  player: string;
  cardDescription: string;
  year: number;
  grade: string;
  askingPrice: number;
  shippingCost: number;
  sellerRating: number;
  sellerName: string;
  condition: ListingCondition;
  imageUrl: string;
  listingUrl: string;
  listedDate: string;
  quantityAvailable: number;
  bestOffer: boolean;
  watchers: number;
  fmvEstimate: number;
  dealScore: number;         // 0-100
}

export interface PriceComparison {
  cardKey: string;
  player: string;
  cardDescription: string;
  grade: string;
  listings: {
    listing: MarketplaceListing;
    netCost: number;          // fee-adjusted total cost
    feeBreakdown: {
      subtotal: number;
      buyerPremium: number;
      shipping: number;
      tax: number;
      processing: number;
      insurance: number;
      total: number;
    };
    savingsVsBest: number;
  }[];
  bestPlatform: MarketplacePlatform;
  bestNetCost: number;
  worstNetCost: number;
  avgNetCost: number;
  potentialSavings: number;
}

export interface PurchaseOrder {
  id: string;
  listingId: string;
  platform: MarketplacePlatform;
  player: string;
  cardDescription: string;
  grade: string;
  purchasePrice: number;
  totalCost: number;
  feeBreakdown: {
    subtotal: number;
    buyerPremium: number;
    shipping: number;
    tax: number;
    processing: number;
    insurance: number;
    total: number;
  };
  status: OrderStatus;
  orderedAt: string;
  estimatedDelivery: string;
  trackingNumber: string | null;
  sellerName: string;
}

export interface SavedSearch {
  id: string;
  query: string;
  platforms: MarketplacePlatform[];
  maxPrice: number | null;
  minDealScore: number;
  alertsEnabled: boolean;
  createdAt: string;
  lastChecked: string;
  matchCount: number;
}

export interface PlatformHealth {
  platform: MarketplacePlatform;
  status: 'online' | 'degraded' | 'offline';
  responseTimeMs: number;
  lastChecked: string;
  activeListings: number;
  avgDealScore: number;
  uptime30d: number;         // percentage
  label: string;
  color: string;
}

// ── Storage ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_marketplace_aggregator_v1';

interface StoredData {
  listings: MarketplaceListing[];
  orders: PurchaseOrder[];
  savedSearches: SavedSearch[];
  platformHealth: PlatformHealth[];
  generatedAt: number;
}

function loadData(): StoredData | null {
  try {
    const data = store.get<StoredData | null>(STORAGE_KEY, null);
    if (!data) return null;
    if (Date.now() - data.generatedAt > 4 * 3600 * 1000) return null;
    return data;
  } catch { return null; }
}

function saveData(data: StoredData): void {
  store.set(STORAGE_KEY, data);
}

// ── Deterministic seeding ───────────────────────────────────────────────────────

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Fee structures ──────────────────────────────────────────────────────────────

const FEE_STRUCTURES: Record<MarketplacePlatform, FeeStructure> = {
  ebay: {
    platform: 'ebay',
    buyerPremium: 0,
    shippingFlat: 0,
    shippingPercent: 0,
    salesTaxRate: 0.0825,
    processingFee: 0,
    insuranceFee: 0,
    label: 'eBay',
  },
  comc: {
    platform: 'comc',
    buyerPremium: 0,
    shippingFlat: 0.50,
    shippingPercent: 0,
    salesTaxRate: 0.065,
    processingFee: 0,
    insuranceFee: 0,
    label: 'COMC',
  },
  myslabs: {
    platform: 'myslabs',
    buyerPremium: 0,
    shippingFlat: 3.99,
    shippingPercent: 0,
    salesTaxRate: 0.07,
    processingFee: 0.50,
    insuranceFee: 0,
    label: 'MySlabs',
  },
  starstock: {
    platform: 'starstock',
    buyerPremium: 0,
    shippingFlat: 0,
    shippingPercent: 0,
    salesTaxRate: 0.06,
    processingFee: 0,
    insuranceFee: 0,
    label: 'StarStock',
  },
  alt: {
    platform: 'alt',
    buyerPremium: 0.03,
    shippingFlat: 4.99,
    shippingPercent: 0,
    salesTaxRate: 0.075,
    processingFee: 0,
    insuranceFee: 1.50,
    label: 'ALT',
  },
  pwcc: {
    platform: 'pwcc',
    buyerPremium: 0.20,
    shippingFlat: 0,
    shippingPercent: 0.01,
    salesTaxRate: 0.065,
    processingFee: 0,
    insuranceFee: 2.00,
    label: 'PWCC',
  },
  goldin: {
    platform: 'goldin',
    buyerPremium: 0.22,
    shippingFlat: 0,
    shippingPercent: 0.015,
    salesTaxRate: 0.066,
    processingFee: 0,
    insuranceFee: 3.00,
    label: 'Goldin',
  },
};

// ── Mock data pools ─────────────────────────────────────────────────────────────

const PLAYERS = [
  'Patrick Mahomes', 'Shohei Ohtani', 'Luka Doncic', 'Victor Wembanyama',
  'Connor McDavid', 'Mike Trout', 'LeBron James', 'Josh Allen',
  'Jayson Tatum', 'Juan Soto', 'Anthony Edwards', 'Caleb Williams',
];

const CARD_DESCS = [
  '2023 Topps Chrome RC Auto', '2018 Panini Prizm Silver RC',
  '2020 Bowman Chrome 1st Auto', '2022 National Treasures RPA /99',
  '2019 Optic Rated Rookie Holo', '2021 Select Concourse Neon Green /75',
  '2017 Donruss Rated Rookie', '2023 Topps Heritage RC',
  '2020 Panini Mosaic RC Silver', '2022 Upper Deck Young Guns RC',
  '2019 Prizm Draft Picks Auto', '2021 Bowman 1st Chrome Refractor',
];

const GRADES = ['PSA 10', 'PSA 9', 'BGS 9.5', 'BGS 10 Black', 'SGC 10', 'PSA 8', 'CGC 9.5', 'Raw NM-MT'];

const PLATFORMS: MarketplacePlatform[] = ['ebay', 'comc', 'myslabs', 'starstock', 'alt', 'pwcc', 'goldin'];

const SELLER_NAMES = [
  'CardVaultPro', 'SlabKing99', 'PremiumPulls', 'GrailHunterLLC',
  'ToppsElite', 'HobbyBoxHQ', 'MintCondition', 'VintageSlabs',
  'EliteCardsInc', 'ProGradeCards', 'ModernRCshop', 'CertifiedGems',
  'PlatinumHobby', 'AllStarCards', 'RookieInvestor',
];

// ── Data generation ─────────────────────────────────────────────────────────────

function generateListings(seed: number): MarketplaceListing[] {
  const rand = seededRandom(seed);
  const now = Date.now();
  const listings: MarketplaceListing[] = [];

  // Generate 18 listings across platforms (some cards appear on multiple platforms)
  const cardConfigs = [
    { player: 'Patrick Mahomes', desc: '2017 Donruss Rated Rookie', grade: 'PSA 10', fmv: 2800 },
    { player: 'Shohei Ohtani', desc: '2018 Panini Prizm Silver RC', grade: 'PSA 10', fmv: 1450 },
    { player: 'Victor Wembanyama', desc: '2023 Topps Chrome RC Auto', grade: 'BGS 9.5', fmv: 3200 },
    { player: 'Luka Doncic', desc: '2018 Panini Prizm Silver RC', grade: 'PSA 10', fmv: 4500 },
    { player: 'LeBron James', desc: '2020 Panini Mosaic RC Silver', grade: 'PSA 9', fmv: 850 },
    { player: 'Josh Allen', desc: '2018 Panini Prizm Silver RC', grade: 'PSA 10', fmv: 1200 },
    { player: 'Anthony Edwards', desc: '2020 Panini Mosaic RC Silver', grade: 'PSA 10', fmv: 620 },
    { player: 'Juan Soto', desc: '2019 Optic Rated Rookie Holo', grade: 'PSA 10', fmv: 380 },
  ];

  for (let i = 0; i < cardConfigs.length; i++) {
    const config = cardConfigs[i];
    // Each card listed on 2-3 platforms
    const numPlatforms = 2 + Math.floor(rand() * 2);
    const usedPlatforms = new Set<MarketplacePlatform>();

    for (let j = 0; j < numPlatforms; j++) {
      let platform: MarketplacePlatform;
      do {
        platform = PLATFORMS[Math.floor(rand() * PLATFORMS.length)];
      } while (usedPlatforms.has(platform));
      usedPlatforms.add(platform);

      const priceVariance = 0.85 + rand() * 0.35; // 85-120% of FMV
      const askingPrice = Math.round(config.fmv * priceVariance * 100) / 100;
      const fees = FEE_STRUCTURES[platform];
      const shipping = fees.shippingFlat + askingPrice * fees.shippingPercent + (platform === 'ebay' ? (3.99 + rand() * 6) : 0);
      const daysAgo = Math.floor(rand() * 30);
      const dealScore = Math.round(Math.max(0, Math.min(100, (1 - askingPrice / config.fmv) * 130)));

      listings.push({
        id: `mkt-${seed}-${i}-${j}`,
        platform,
        player: config.player,
        cardDescription: config.desc,
        year: parseInt(config.desc.match(/\d{4}/)?.[0] || '2023'),
        grade: config.grade,
        askingPrice,
        shippingCost: Math.round(shipping * 100) / 100,
        sellerRating: Math.round((90 + rand() * 10) * 10) / 10,
        sellerName: SELLER_NAMES[Math.floor(rand() * SELLER_NAMES.length)],
        condition: config.grade.toLowerCase().includes('raw') ? 'raw' : 'graded',
        imageUrl: '',
        listingUrl: '#',
        listedDate: new Date(now - daysAgo * 86400000).toISOString(),
        quantityAvailable: 1 + Math.floor(rand() * 3),
        bestOffer: rand() < 0.3,
        watchers: Math.floor(rand() * 40),
        fmvEstimate: config.fmv,
        dealScore,
      });
    }
  }

  return listings;
}

function generateOrders(seed: number): PurchaseOrder[] {
  const rand = seededRandom(seed + 7777);
  const now = Date.now();
  const statuses: OrderStatus[] = ['delivered', 'delivered', 'shipped', 'confirmed', 'pending'];
  const orders: PurchaseOrder[] = [];

  for (let i = 0; i < 8; i++) {
    const player = PLAYERS[Math.floor(rand() * PLAYERS.length)];
    const desc = CARD_DESCS[Math.floor(rand() * CARD_DESCS.length)];
    const grade = GRADES[Math.floor(rand() * GRADES.length)];
    const platform = PLATFORMS[Math.floor(rand() * PLATFORMS.length)];
    const price = 50 + Math.floor(rand() * 3000);
    const fees = calculateFeeBreakdown(platform, price);
    const status = statuses[Math.floor(rand() * statuses.length)];
    const daysAgo = 1 + Math.floor(rand() * 45);

    orders.push({
      id: `ord-${seed}-${i}`,
      listingId: `mkt-${seed}-${i}-0`,
      platform,
      player,
      cardDescription: desc,
      grade,
      purchasePrice: price,
      totalCost: fees.total,
      feeBreakdown: fees,
      status,
      orderedAt: new Date(now - daysAgo * 86400000).toISOString(),
      estimatedDelivery: new Date(now - (daysAgo - 7) * 86400000).toISOString(),
      trackingNumber: status === 'shipped' || status === 'delivered' ? `9400${Math.floor(rand() * 9999999999)}` : null,
      sellerName: SELLER_NAMES[Math.floor(rand() * SELLER_NAMES.length)],
    });
  }

  return orders.sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
}

function generateSavedSearches(seed: number): SavedSearch[] {
  const rand = seededRandom(seed + 5555);
  const now = Date.now();
  const searches: SavedSearch[] = [
    { query: 'Wembanyama Prizm Silver PSA 10', maxPrice: 5000, minDealScore: 60 },
    { query: 'Mahomes Optic Rated Rookie', maxPrice: 3000, minDealScore: 50 },
    { query: 'Ohtani Bowman Chrome 1st Auto', maxPrice: 2000, minDealScore: 40 },
    { query: 'Luka Doncic Select Concourse', maxPrice: null, minDealScore: 70 },
    { query: 'Anthony Edwards Mosaic RC', maxPrice: 800, minDealScore: 55 },
  ].map((s, i) => {
    const daysAgo = Math.floor(rand() * 30);
    const platCount = 2 + Math.floor(rand() * 4);
    const plats: MarketplacePlatform[] = [];
    for (let p = 0; p < platCount; p++) {
      const pl = PLATFORMS[Math.floor(rand() * PLATFORMS.length)];
      if (!plats.includes(pl)) plats.push(pl);
    }
    return {
      id: `ss-${seed}-${i}`,
      query: s.query,
      platforms: plats,
      maxPrice: s.maxPrice,
      minDealScore: s.minDealScore,
      alertsEnabled: rand() < 0.7,
      createdAt: new Date(now - daysAgo * 86400000).toISOString(),
      lastChecked: new Date(now - Math.floor(rand() * 3600000)).toISOString(),
      matchCount: Math.floor(rand() * 12),
    };
  });

  return searches;
}

function generatePlatformHealth(seed: number): PlatformHealth[] {
  const rand = seededRandom(seed + 3333);
  const now = new Date().toISOString();

  const configs: { platform: MarketplacePlatform; label: string; color: string }[] = [
    { platform: 'ebay', label: 'eBay', color: 'text-blue-400' },
    { platform: 'comc', label: 'COMC', color: 'text-emerald-400' },
    { platform: 'myslabs', label: 'MySlabs', color: 'text-rose-400' },
    { platform: 'starstock', label: 'StarStock', color: 'text-purple-400' },
    { platform: 'alt', label: 'ALT', color: 'text-amber-400' },
    { platform: 'pwcc', label: 'PWCC', color: 'text-cyan-400' },
    { platform: 'goldin', label: 'Goldin', color: 'text-orange-400' },
  ];

  return configs.map(cfg => {
    const statusRoll = rand();
    const status: PlatformHealth['status'] = statusRoll < 0.75 ? 'online' : statusRoll < 0.92 ? 'degraded' : 'offline';
    return {
      platform: cfg.platform,
      status,
      responseTimeMs: status === 'online' ? 80 + Math.floor(rand() * 200) : status === 'degraded' ? 500 + Math.floor(rand() * 2000) : 0,
      lastChecked: now,
      activeListings: status !== 'offline' ? 1000 + Math.floor(rand() * 50000) : 0,
      avgDealScore: Math.round((35 + rand() * 30) * 10) / 10,
      uptime30d: status === 'online' ? 98 + rand() * 2 : status === 'degraded' ? 90 + rand() * 7 : 60 + rand() * 25,
      label: cfg.label,
      color: cfg.color,
    };
  });
}

// ── Fee calculation ─────────────────────────────────────────────────────────────

function calculateFeeBreakdown(platform: MarketplacePlatform, price: number) {
  const fees = FEE_STRUCTURES[platform];
  const buyerPremium = Math.round(price * fees.buyerPremium * 100) / 100;
  const subtotal = price + buyerPremium;
  const shipping = Math.round((fees.shippingFlat + subtotal * fees.shippingPercent) * 100) / 100;
  const tax = Math.round(subtotal * fees.salesTaxRate * 100) / 100;
  const processing = fees.processingFee;
  const insurance = fees.insuranceFee;
  const total = Math.round((subtotal + shipping + tax + processing + insurance) * 100) / 100;

  return { subtotal, buyerPremium, shipping, tax, processing, insurance, total };
}

function ensureData(): StoredData {
  const existing = loadData();
  if (existing) return existing;

  const now = new Date();
  const seed = hashStr(`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-mktplace`);
  const listings = generateListings(seed);
  const orders = generateOrders(seed);
  const savedSearches = generateSavedSearches(seed);
  const platformHealth = generatePlatformHealth(seed);
  const data: StoredData = { listings, orders, savedSearches, platformHealth, generatedAt: Date.now() };
  saveData(data);
  return data;
}

// ── Public API ──────────────────────────────────────────────────────────────────

export function searchAllPlatforms(query?: string, platforms?: MarketplacePlatform[]): MarketplaceListing[] {
  const data = ensureData();
  let results = data.listings;

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(l =>
      l.player.toLowerCase().includes(q) ||
      l.cardDescription.toLowerCase().includes(q) ||
      l.grade.toLowerCase().includes(q)
    );
  }

  if (platforms && platforms.length > 0) {
    results = results.filter(l => platforms.includes(l.platform));
  }

  return results.sort((a, b) => b.dealScore - a.dealScore);
}

export function comparePrices(player: string, cardDescription?: string): PriceComparison[] {
  const data = ensureData();
  const grouped = new Map<string, MarketplaceListing[]>();

  for (const listing of data.listings) {
    if (!listing.player.toLowerCase().includes(player.toLowerCase())) continue;
    if (cardDescription && !listing.cardDescription.toLowerCase().includes(cardDescription.toLowerCase())) continue;
    const key = `${listing.player}|${listing.cardDescription}|${listing.grade}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(listing);
  }

  const comparisons: PriceComparison[] = [];

  for (const [cardKey, listings] of grouped) {
    if (listings.length < 2) continue; // need at least 2 to compare
    const [playerName, desc, grade] = cardKey.split('|');

    const withCosts = listings.map(listing => {
      const feeBreakdown = calculateFeeBreakdown(listing.platform, listing.askingPrice);
      return {
        listing,
        netCost: feeBreakdown.total,
        feeBreakdown,
        savingsVsBest: 0,
      };
    }).sort((a, b) => a.netCost - b.netCost);

    const bestCost = withCosts[0].netCost;
    for (const item of withCosts) {
      item.savingsVsBest = Math.round((item.netCost - bestCost) * 100) / 100;
    }

    const worstCost = withCosts[withCosts.length - 1].netCost;
    const avgCost = Math.round(withCosts.reduce((s, w) => s + w.netCost, 0) / withCosts.length * 100) / 100;

    comparisons.push({
      cardKey,
      player: playerName,
      cardDescription: desc,
      grade,
      listings: withCosts,
      bestPlatform: withCosts[0].listing.platform,
      bestNetCost: bestCost,
      worstNetCost: worstCost,
      avgNetCost: avgCost,
      potentialSavings: Math.round((worstCost - bestCost) * 100) / 100,
    });
  }

  return comparisons.sort((a, b) => b.potentialSavings - a.potentialSavings);
}

export function calculateNetCost(platform: MarketplacePlatform, price: number): {
  netCost: number;
  feeBreakdown: ReturnType<typeof calculateFeeBreakdown>;
} {
  const feeBreakdown = calculateFeeBreakdown(platform, price);
  return { netCost: feeBreakdown.total, feeBreakdown };
}

export function createPurchaseOrder(listingId: string): PurchaseOrder {
  const data = ensureData();
  const listing = data.listings.find(l => l.id === listingId);
  if (!listing) throw new Error('Listing not found');

  const fees = calculateFeeBreakdown(listing.platform, listing.askingPrice);
  const now = new Date();
  const order: PurchaseOrder = {
    id: `ord-${Date.now()}`,
    listingId,
    platform: listing.platform,
    player: listing.player,
    cardDescription: listing.cardDescription,
    grade: listing.grade,
    purchasePrice: listing.askingPrice,
    totalCost: fees.total,
    feeBreakdown: fees,
    status: 'confirmed',
    orderedAt: now.toISOString(),
    estimatedDelivery: new Date(now.getTime() + 7 * 86400000).toISOString(),
    trackingNumber: null,
    sellerName: listing.sellerName,
  };

  data.orders.unshift(order);
  saveData(data);
  return order;
}

export function getSavedSearches(): SavedSearch[] {
  return ensureData().savedSearches;
}

export function getPlatformHealth(): PlatformHealth[] {
  return ensureData().platformHealth;
}

export function getBestDeal(): MarketplaceListing | null {
  const data = ensureData();
  if (data.listings.length === 0) return null;
  return data.listings.reduce((best, l) => l.dealScore > best.dealScore ? l : best, data.listings[0]);
}

export function getRecentListings(limit = 10): MarketplaceListing[] {
  const data = ensureData();
  return [...data.listings]
    .sort((a, b) => new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime())
    .slice(0, limit);
}

export function getOrders(): PurchaseOrder[] {
  return ensureData().orders;
}

export function getAllListings(): MarketplaceListing[] {
  return ensureData().listings;
}

export function getFeeStructure(platform: MarketplacePlatform): FeeStructure {
  return FEE_STRUCTURES[platform];
}

export function getPlatformLabel(platform: MarketplacePlatform): string {
  return FEE_STRUCTURES[platform].label;
}
