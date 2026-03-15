// ---- Types ----

export interface CardShow {
  id: string;
  name: string;
  location: string;
  venue: string;
  startDate: string;
  endDate: string;
  admission: number;
  expectedVendors: number;
  description: string;
  features: string[];
  distanceMiles: number;
  popularity: 'low' | 'medium' | 'high' | 'mega';
  isActive?: boolean;
}

export interface ShowVendor {
  id: string;
  name: string;
  boothNumber: string;
  specialties: string[];
  reputation: number; // 1-5
  priceLevel: 'budget' | 'mid' | 'premium';
  notes?: string;
  hasVisited: boolean;
}

export interface ShowDeal {
  id: string;
  showId: string;
  vendorId: string;
  vendorName: string;
  cardName: string;
  year: string;
  set: string;
  grade?: string;
  grader?: string;
  purchasePrice: number;
  estimatedValue: number;
  timestamp: string;
  notes?: string;
  category: 'raw' | 'graded' | 'lot' | 'sealed';
}

export interface ShowHaul {
  showId: string;
  showName: string;
  deals: ShowDeal[];
  totalSpent: number;
  totalEstimatedValue: number;
  profitLoss: number;
  profitLossPercent: number;
  bestDeal: ShowDeal | null;
  worstDeal: ShowDeal | null;
  categoryBreakdown: { category: string; count: number; spent: number; value: number }[];
}

export interface QuickComp {
  id: string;
  cardName: string;
  year: string;
  set: string;
  grade?: string;
  grader?: string;
  recentSales: { date: string; price: number; platform: string }[];
  averagePrice: number;
  medianPrice: number;
  lowPrice: number;
  highPrice: number;
  trend: 'rising' | 'stable' | 'falling';
  trendPercent: number;
  lastUpdated: string;
  confidence: number;
}

export interface NegotiationHelper {
  cardName: string;
  askingPrice: number;
  fairMarketValue: number;
  walkAwayPrice: number;
  suggestedOffer: number;
  maxBuyPrice: number;
  margin: number;
  marginPercent: number;
  advice: string;
  talkingPoints: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ShowChecklist {
  id: string;
  category: 'supplies' | 'want_list' | 'budget' | 'prep';
  item: string;
  checked: boolean;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface OfflineSyncStatus {
  isOnline: boolean;
  lastSyncTimestamp: string;
  pendingUploads: number;
  cachedShows: number;
  cachedComps: number;
  cacheSize: string;
  syncProgress: number;
}

export interface PostShowSummary {
  showId: string;
  showName: string;
  date: string;
  totalDeals: number;
  totalSpent: number;
  estimatedValue: number;
  roi: number;
  topPicks: ShowDeal[];
  vendorsVisited: number;
  timeSpent: string;
  highlights: string[];
  lessonsLearned: string[];
  overallGrade: string;
}

// ---- Cache Keys ----

const CACHE_KEYS = {
  SHOWS: 'msi_cardshow_shows',
  DEALS: 'msi_cardshow_deals',
  CHECKLIST: 'msi_cardshow_checklist',
  COMPS: 'msi_cardshow_comps',
  ACTIVE_SHOW: 'msi_cardshow_active',
  SYNC_STATUS: 'msi_cardshow_sync',
  VENDORS: 'msi_cardshow_vendors',
};

// ---- Offline Cache Helpers ----

function saveToCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: new Date().toISOString() }));
  } catch {
    // Storage full — remove oldest entries
    const oldest = Object.values(CACHE_KEYS).sort(() => Math.random() - 0.5)[0];
    localStorage.removeItem(oldest);
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp: new Date().toISOString() }));
    } catch {
      // silently fail
    }
  }
}

function loadFromCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data as T;
  } catch {
    return null;
  }
}

// ---- Mock Data ----

const MOCK_SHOWS: CardShow[] = [
  {
    id: 'show-001',
    name: 'National Sports Collectors Convention',
    location: 'Cleveland, OH',
    venue: 'Huntington Convention Center',
    startDate: '2026-07-22',
    endDate: '2026-07-26',
    admission: 50,
    expectedVendors: 800,
    description: 'The largest and longest running sports collectibles show in the world.',
    features: ['Celebrity Autographs', 'Corporate Pavilion', 'Grading Services On-Site', 'Breaks Lounge'],
    distanceMiles: 145,
    popularity: 'mega',
  },
  {
    id: 'show-002',
    name: 'Dallas Card Show',
    location: 'Dallas, TX',
    venue: 'Dallas Market Hall',
    startDate: '2026-04-11',
    endDate: '2026-04-12',
    admission: 10,
    expectedVendors: 250,
    description: 'Premier monthly card show in the DFW metroplex with top regional vendors.',
    features: ['Free Parking', 'Grading Drop-Off', 'Case Breaks'],
    distanceMiles: 32,
    popularity: 'high',
  },
  {
    id: 'show-003',
    name: 'Chicago Sports Spectacular',
    location: 'Rosemont, IL',
    venue: 'Donald E. Stephens Convention Center',
    startDate: '2026-05-16',
    endDate: '2026-05-17',
    admission: 15,
    expectedVendors: 300,
    description: 'Midwest flagship show featuring vintage and modern cards, plus memorabilia dealers.',
    features: ['Vintage Alley', 'PSA On-Site', 'Kids Zone'],
    distanceMiles: 210,
    popularity: 'high',
  },
  {
    id: 'show-004',
    name: 'Bay Area Card Expo',
    location: 'San Jose, CA',
    venue: 'San Jose Convention Center',
    startDate: '2026-04-25',
    endDate: '2026-04-26',
    admission: 12,
    expectedVendors: 180,
    description: 'West coast show known for tech-savvy collectors and premium singles.',
    features: ['Digital Grading Station', 'Wax Rip Room'],
    distanceMiles: 1580,
    popularity: 'medium',
  },
  {
    id: 'show-005',
    name: 'Southeast Card Fest',
    location: 'Atlanta, GA',
    venue: 'Georgia World Congress Center',
    startDate: '2026-06-06',
    endDate: '2026-06-07',
    admission: 8,
    expectedVendors: 150,
    description: 'Growing southeast show with a mix of vintage, modern, and international cards.',
    features: ['Soccer & International Cards', 'Budget Tables', 'Trade Night'],
    distanceMiles: 680,
    popularity: 'medium',
  },
  {
    id: 'show-006',
    name: 'Northeast Collectors Summit',
    location: 'Edison, NJ',
    venue: 'NJ Convention & Expo Center',
    startDate: '2026-03-28',
    endDate: '2026-03-29',
    admission: 10,
    expectedVendors: 200,
    description: 'Tri-state favorite for raw card hunters and vintage specialists.',
    features: ['Vintage Focus', 'Authentication Services', 'Collector Meetups'],
    distanceMiles: 420,
    popularity: 'high',
  },
];

const MOCK_VENDORS: ShowVendor[] = [
  { id: 'v-001', name: 'Vintage Kings', boothNumber: 'A-101', specialties: ['Pre-War', 'Vintage', 'HOF'], reputation: 5, priceLevel: 'premium', hasVisited: false },
  { id: 'v-002', name: 'Budget Breaks', boothNumber: 'C-215', specialties: ['Modern', 'Lots', 'Wax'], reputation: 4, priceLevel: 'budget', hasVisited: false },
  { id: 'v-003', name: 'Graded Gems', boothNumber: 'B-110', specialties: ['PSA 10s', 'BGS 9.5', 'Graded'], reputation: 5, priceLevel: 'premium', hasVisited: false },
  { id: 'v-004', name: 'Prospect Pipeline', boothNumber: 'D-308', specialties: ['Prospects', 'Autos', 'Bowman'], reputation: 3, priceLevel: 'mid', hasVisited: false },
  { id: 'v-005', name: 'The Card Vault', boothNumber: 'A-205', specialties: ['Rookies', 'Numbered', 'Parallels'], reputation: 4, priceLevel: 'mid', hasVisited: false },
  { id: 'v-006', name: 'Wax City', boothNumber: 'E-102', specialties: ['Sealed Wax', 'Hobby Boxes', 'Cases'], reputation: 4, priceLevel: 'mid', hasVisited: false },
  { id: 'v-007', name: 'Slabbed Society', boothNumber: 'B-320', specialties: ['SGC', 'CSG', 'Crossovers'], reputation: 3, priceLevel: 'budget', hasVisited: false },
  { id: 'v-008', name: 'Ink Masters', boothNumber: 'A-400', specialties: ['Autographs', 'Patch Autos', 'Game-Used'], reputation: 5, priceLevel: 'premium', hasVisited: false },
];

const MOCK_DEALS: ShowDeal[] = [
  { id: 'd-001', showId: 'show-002', vendorId: 'v-001', vendorName: 'Vintage Kings', cardName: '1986 Fleer Michael Jordan', year: '1986', set: 'Fleer', grade: 'PSA 6', grader: 'PSA', purchasePrice: 4200, estimatedValue: 5800, timestamp: '2026-03-01T10:30:00Z', category: 'graded' },
  { id: 'd-002', showId: 'show-002', vendorId: 'v-002', vendorName: 'Budget Breaks', cardName: '2023 Bowman Chrome Victor Wembanyama 1st', year: '2023', set: 'Bowman Chrome', grade: 'Raw', purchasePrice: 85, estimatedValue: 130, timestamp: '2026-03-01T11:15:00Z', category: 'raw' },
  { id: 'd-003', showId: 'show-002', vendorId: 'v-003', vendorName: 'Graded Gems', cardName: '2020 Prizm Justin Herbert Silver', year: '2020', set: 'Prizm', grade: 'PSA 10', grader: 'PSA', purchasePrice: 320, estimatedValue: 425, timestamp: '2026-03-01T12:00:00Z', category: 'graded' },
  { id: 'd-004', showId: 'show-002', vendorId: 'v-004', vendorName: 'Prospect Pipeline', cardName: '2024 Bowman Prospects Lot (25 cards)', year: '2024', set: 'Bowman', purchasePrice: 60, estimatedValue: 95, timestamp: '2026-03-01T13:20:00Z', category: 'lot' },
  { id: 'd-005', showId: 'show-002', vendorId: 'v-005', vendorName: 'The Card Vault', cardName: '2022 Select Brock Purdy Concourse', year: '2022', set: 'Select', grade: 'Raw', purchasePrice: 45, estimatedValue: 72, timestamp: '2026-03-01T14:05:00Z', category: 'raw' },
  { id: 'd-006', showId: 'show-006', vendorId: 'v-001', vendorName: 'Vintage Kings', cardName: '1957 Topps Bill Russell RC', year: '1957', set: 'Topps', grade: 'SGC 3', grader: 'SGC', purchasePrice: 2800, estimatedValue: 3200, timestamp: '2026-02-15T09:45:00Z', category: 'graded' },
  { id: 'd-007', showId: 'show-006', vendorId: 'v-006', vendorName: 'Wax City', cardName: '2024 Panini Prizm Basketball Hobby Box', year: '2024', set: 'Prizm', purchasePrice: 395, estimatedValue: 420, timestamp: '2026-02-15T10:30:00Z', category: 'sealed' },
  { id: 'd-008', showId: 'show-006', vendorId: 'v-003', vendorName: 'Graded Gems', cardName: '2018 Optic Luka Doncic Rated Rookie', year: '2018', set: 'Optic', grade: 'PSA 10', grader: 'PSA', purchasePrice: 750, estimatedValue: 1050, timestamp: '2026-02-15T11:15:00Z', category: 'graded' },
  { id: 'd-009', showId: 'show-006', vendorId: 'v-008', vendorName: 'Ink Masters', cardName: '2021 National Treasures Trevor Lawrence RPA /99', year: '2021', set: 'National Treasures', grade: 'BGS 9', grader: 'BGS', purchasePrice: 1100, estimatedValue: 1380, timestamp: '2026-02-15T13:00:00Z', category: 'graded' },
  { id: 'd-010', showId: 'show-006', vendorId: 'v-007', vendorName: 'Slabbed Society', cardName: '2020 Mosaic Joe Burrow Pink Camo', year: '2020', set: 'Mosaic', grade: 'CSG 9.5', grader: 'CSG', purchasePrice: 110, estimatedValue: 160, timestamp: '2026-02-15T14:20:00Z', category: 'graded' },
  { id: 'd-011', showId: 'show-003', vendorId: 'v-002', vendorName: 'Budget Breaks', cardName: 'Modern Rookies Lot (50 cards)', year: '2023', set: 'Mixed', purchasePrice: 120, estimatedValue: 200, timestamp: '2026-01-18T10:00:00Z', category: 'lot' },
  { id: 'd-012', showId: 'show-003', vendorId: 'v-005', vendorName: 'The Card Vault', cardName: '2023 Topps Chrome Corbin Carroll RC /75', year: '2023', set: 'Topps Chrome', grade: 'Raw', purchasePrice: 180, estimatedValue: 250, timestamp: '2026-01-18T11:30:00Z', category: 'raw' },
  { id: 'd-013', showId: 'show-003', vendorId: 'v-001', vendorName: 'Vintage Kings', cardName: '1969 Topps Reggie Jackson RC', year: '1969', set: 'Topps', grade: 'PSA 4', grader: 'PSA', purchasePrice: 950, estimatedValue: 1100, timestamp: '2026-01-18T12:45:00Z', category: 'graded' },
  { id: 'd-014', showId: 'show-003', vendorId: 'v-004', vendorName: 'Prospect Pipeline', cardName: '2024 Bowman Chrome 1st Auto /250', year: '2024', set: 'Bowman Chrome', grade: 'Raw', purchasePrice: 200, estimatedValue: 175, timestamp: '2026-01-18T14:00:00Z', category: 'raw', notes: 'Overpaid slightly, prospect hype' },
  { id: 'd-015', showId: 'show-003', vendorId: 'v-006', vendorName: 'Wax City', cardName: '2023 Topps Series 1 Hobby Box', year: '2023', set: 'Topps', purchasePrice: 90, estimatedValue: 85, timestamp: '2026-01-18T15:15:00Z', category: 'sealed' },
];

const DEFAULT_CHECKLIST: ShowChecklist[] = [
  { id: 'cl-001', category: 'supplies', item: 'Penny sleeves (200+)', checked: false, priority: 'high' },
  { id: 'cl-002', category: 'supplies', item: 'Top loaders (50+)', checked: false, priority: 'high' },
  { id: 'cl-003', category: 'supplies', item: 'Team bags (20)', checked: false, priority: 'medium' },
  { id: 'cl-004', category: 'supplies', item: 'Card saver I (20)', checked: false, priority: 'medium' },
  { id: 'cl-005', category: 'supplies', item: 'Magnifying loupe', checked: false, priority: 'low' },
  { id: 'cl-006', category: 'supplies', item: 'Phone charger / battery pack', checked: false, priority: 'high' },
  { id: 'cl-007', category: 'supplies', item: 'Backpack / card carrying case', checked: false, priority: 'high' },
  { id: 'cl-008', category: 'want_list', item: '1986 Fleer Jordan PSA 7+', checked: false, priority: 'high' },
  { id: 'cl-009', category: 'want_list', item: 'Wembanyama Prizm Silver RC', checked: false, priority: 'high' },
  { id: 'cl-010', category: 'want_list', item: 'Any Pre-War HOF Raw', checked: false, priority: 'medium' },
  { id: 'cl-011', category: 'want_list', item: 'Bowman Chrome 1st Autos (baseball)', checked: false, priority: 'medium' },
  { id: 'cl-012', category: 'want_list', item: 'Sealed 2024 Prizm Football Hobby', checked: false, priority: 'low' },
  { id: 'cl-013', category: 'budget', item: 'Set cash budget: $2,000', checked: false, priority: 'high' },
  { id: 'cl-014', category: 'budget', item: 'ATM backup plan', checked: false, priority: 'medium' },
  { id: 'cl-015', category: 'budget', item: 'Reserve $500 for graded vintage', checked: false, priority: 'medium' },
  { id: 'cl-016', category: 'prep', item: 'Check recent comp prices', checked: false, priority: 'high' },
  { id: 'cl-017', category: 'prep', item: 'Charge phone & camera', checked: false, priority: 'medium' },
  { id: 'cl-018', category: 'prep', item: 'Print want list', checked: false, priority: 'low' },
  { id: 'cl-019', category: 'prep', item: 'Plan route to venue & parking', checked: false, priority: 'medium' },
];

// ---- Service Functions ----

export function getUpcomingShows(): CardShow[] {
  const cached = loadFromCache<CardShow[]>(CACHE_KEYS.SHOWS);
  if (cached) return cached;
  const shows = [...MOCK_SHOWS].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  saveToCache(CACHE_KEYS.SHOWS, shows);
  return shows;
}

export function getNextShow(): CardShow | null {
  const shows = getUpcomingShows();
  const now = new Date();
  return shows.find((s) => new Date(s.startDate) >= now) ?? shows[0];
}

export function startShowMode(showId: string): CardShow & { isActive: true } {
  const shows = getUpcomingShows();
  const show = shows.find((s) => s.id === showId) ?? shows[0];
  const activeShow = { ...show, isActive: true as const };
  saveToCache(CACHE_KEYS.ACTIVE_SHOW, activeShow);
  saveToCache(CACHE_KEYS.VENDORS, MOCK_VENDORS.map((v) => ({ ...v, hasVisited: false })));
  return activeShow;
}

export function getActiveShow(): (CardShow & { isActive: true }) | null {
  return loadFromCache<CardShow & { isActive: true }>(CACHE_KEYS.ACTIVE_SHOW);
}

export function endShowMode(): void {
  localStorage.removeItem(CACHE_KEYS.ACTIVE_SHOW);
}

export function getShowVendors(): ShowVendor[] {
  const cached = loadFromCache<ShowVendor[]>(CACHE_KEYS.VENDORS);
  return cached ?? MOCK_VENDORS;
}

export function logDeal(deal: Omit<ShowDeal, 'id' | 'timestamp'>): ShowDeal {
  const deals = loadFromCache<ShowDeal[]>(CACHE_KEYS.DEALS) ?? MOCK_DEALS;
  const newDeal: ShowDeal = {
    ...deal,
    id: `d-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  deals.push(newDeal);
  saveToCache(CACHE_KEYS.DEALS, deals);
  return newDeal;
}

export function getAllDeals(): ShowDeal[] {
  const cached = loadFromCache<ShowDeal[]>(CACHE_KEYS.DEALS);
  if (cached) return cached;
  saveToCache(CACHE_KEYS.DEALS, MOCK_DEALS);
  return MOCK_DEALS;
}

export function getShowHaul(showId?: string): ShowHaul {
  const allDeals = getAllDeals();
  const deals = showId ? allDeals.filter((d) => d.showId === showId) : allDeals;
  const totalSpent = deals.reduce((sum, d) => sum + d.purchasePrice, 0);
  const totalEstimatedValue = deals.reduce((sum, d) => sum + d.estimatedValue, 0);
  const profitLoss = totalEstimatedValue - totalSpent;
  const profitLossPercent = totalSpent > 0 ? (profitLoss / totalSpent) * 100 : 0;

  const bestDeal = deals.length > 0
    ? deals.reduce((best, d) => {
        const margin = (d.estimatedValue - d.purchasePrice) / d.purchasePrice;
        const bestMargin = (best.estimatedValue - best.purchasePrice) / best.purchasePrice;
        return margin > bestMargin ? d : best;
      })
    : null;

  const worstDeal = deals.length > 0
    ? deals.reduce((worst, d) => {
        const margin = (d.estimatedValue - d.purchasePrice) / d.purchasePrice;
        const worstMargin = (worst.estimatedValue - worst.purchasePrice) / worst.purchasePrice;
        return margin < worstMargin ? d : worst;
      })
    : null;

  const categoryMap = new Map<string, { count: number; spent: number; value: number }>();
  deals.forEach((d) => {
    const existing = categoryMap.get(d.category) ?? { count: 0, spent: 0, value: 0 };
    existing.count++;
    existing.spent += d.purchasePrice;
    existing.value += d.estimatedValue;
    categoryMap.set(d.category, existing);
  });

  const show = getUpcomingShows().find((s) => s.id === showId);

  return {
    showId: showId ?? 'all',
    showName: show?.name ?? 'All Shows',
    deals,
    totalSpent,
    totalEstimatedValue,
    profitLoss,
    profitLossPercent,
    bestDeal,
    worstDeal,
    categoryBreakdown: Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data,
    })),
  };
}

export function getQuickComp(cardName: string): QuickComp {
  const mockComps: Record<string, Omit<QuickComp, 'id' | 'cardName'>> = {
    default: {
      year: '2023',
      set: 'Prizm',
      grade: 'PSA 10',
      grader: 'PSA',
      recentSales: [
        { date: '2026-03-10', price: 425, platform: 'eBay' },
        { date: '2026-03-08', price: 410, platform: 'eBay' },
        { date: '2026-03-05', price: 440, platform: 'COMC' },
        { date: '2026-03-02', price: 395, platform: 'MySlabs' },
        { date: '2026-02-28', price: 430, platform: 'eBay' },
      ],
      averagePrice: 420,
      medianPrice: 425,
      lowPrice: 395,
      highPrice: 440,
      trend: 'stable',
      trendPercent: 1.2,
      lastUpdated: '2026-03-13T08:00:00Z',
      confidence: 92,
    },
  };

  const comp = mockComps.default;
  const lowerName = cardName.toLowerCase();

  // Adjust values based on keywords for variety
  let priceMultiplier = 1;
  if (lowerName.includes('jordan')) priceMultiplier = 12;
  else if (lowerName.includes('wembanyama')) priceMultiplier = 0.8;
  else if (lowerName.includes('vintage') || lowerName.includes('1957') || lowerName.includes('1969')) priceMultiplier = 6;
  else if (lowerName.includes('lot')) priceMultiplier = 0.25;

  return {
    id: `comp-${Date.now()}`,
    cardName,
    year: comp.year,
    set: comp.set,
    grade: comp.grade,
    grader: comp.grader,
    recentSales: comp.recentSales.map((s) => ({ ...s, price: Math.round(s.price * priceMultiplier) })),
    averagePrice: Math.round(comp.averagePrice * priceMultiplier),
    medianPrice: Math.round(comp.medianPrice * priceMultiplier),
    lowPrice: Math.round(comp.lowPrice * priceMultiplier),
    highPrice: Math.round(comp.highPrice * priceMultiplier),
    trend: comp.trend,
    trendPercent: comp.trendPercent,
    lastUpdated: comp.lastUpdated,
    confidence: comp.confidence,
  };
}

export function simulateQRScan(): QuickComp {
  const sampleCards = [
    '2023 Prizm Victor Wembanyama Silver RC PSA 10',
    '2020 Select Justin Herbert Concourse PSA 10',
    '1986 Fleer Michael Jordan #57 PSA 7',
    '2018 Optic Luka Doncic Rated Rookie BGS 9.5',
    '2024 Bowman Chrome 1st Elly De La Cruz Auto',
  ];
  const randomCard = sampleCards[Math.floor(Math.random() * sampleCards.length)];
  return getQuickComp(randomCard);
}

export function getNegotiationAdvice(cardName: string, askingPrice: number): NegotiationHelper {
  const comp = getQuickComp(cardName);
  const fmv = comp.averagePrice;
  const maxBuy = Math.round(fmv * 0.85); // Target 15% margin
  const walkAway = Math.round(fmv * 0.95); // Never pay more than 95% FMV
  const suggestedOffer = Math.round(askingPrice * 0.75); // Start at 75%
  const margin = fmv - askingPrice;
  const marginPercent = askingPrice > 0 ? (margin / askingPrice) * 100 : 0;

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  let advice = '';
  const talkingPoints: string[] = [];

  if (askingPrice <= maxBuy) {
    riskLevel = 'low';
    advice = `Great deal! Asking price is ${Math.round(((fmv - askingPrice) / fmv) * 100)}% below FMV. Buy immediately.`;
    talkingPoints.push(
      'This is already below market — act fast before someone else does.',
      `Recent comps show ${comp.averagePrice} average across ${comp.recentSales.length} sales.`,
      'No need to negotiate hard on this one.',
    );
  } else if (askingPrice <= walkAway) {
    riskLevel = 'medium';
    advice = `Reasonable ask. Try to negotiate down to $${maxBuy} for a solid margin.`;
    talkingPoints.push(
      `"I've seen these go for around $${comp.medianPrice} recently on eBay."`,
      `"I could do $${suggestedOffer} cash right now — saves you shipping and fees."`,
      `"Would you do $${maxBuy}? That works for both of us."`,
      `Mention you have cash and can close instantly — vendors love no-hassle deals.`,
    );
  } else {
    riskLevel = 'high';
    advice = `Overpriced by ${Math.round(((askingPrice - fmv) / fmv) * 100)}%. Walk away unless they come down significantly.`;
    talkingPoints.push(
      `"I appreciate the card but comps are showing $${comp.averagePrice} — that's a gap."`,
      `"The most I could do is $${maxBuy}. I understand if that doesn't work for you."`,
      `Be prepared to walk away. This deal doesn't have enough margin.`,
      `Check back later in the day — vendors often get flexible toward closing.`,
    );
  }

  return {
    cardName,
    askingPrice,
    fairMarketValue: fmv,
    walkAwayPrice: walkAway,
    suggestedOffer,
    maxBuyPrice: maxBuy,
    margin,
    marginPercent,
    advice,
    talkingPoints,
    riskLevel,
  };
}

export function getShowChecklist(): ShowChecklist[] {
  const cached = loadFromCache<ShowChecklist[]>(CACHE_KEYS.CHECKLIST);
  if (cached) return cached;
  saveToCache(CACHE_KEYS.CHECKLIST, DEFAULT_CHECKLIST);
  return DEFAULT_CHECKLIST;
}

export function toggleChecklistItem(itemId: string): ShowChecklist[] {
  const checklist = getShowChecklist();
  const updated = checklist.map((item) =>
    item.id === itemId ? { ...item, checked: !item.checked } : item,
  );
  saveToCache(CACHE_KEYS.CHECKLIST, updated);
  return updated;
}

export function getPostShowSummary(showId: string): PostShowSummary {
  const haul = getShowHaul(showId);
  const show = getUpcomingShows().find((s) => s.id === showId);

  const topPicks = [...haul.deals]
    .sort((a, b) => {
      const marginA = (a.estimatedValue - a.purchasePrice) / a.purchasePrice;
      const marginB = (b.estimatedValue - b.purchasePrice) / b.purchasePrice;
      return marginB - marginA;
    })
    .slice(0, 3);

  const uniqueVendors = new Set(haul.deals.map((d) => d.vendorId)).size;

  const roi = haul.totalSpent > 0 ? haul.profitLossPercent : 0;

  let overallGrade: string;
  if (roi >= 30) overallGrade = 'A+';
  else if (roi >= 20) overallGrade = 'A';
  else if (roi >= 15) overallGrade = 'B+';
  else if (roi >= 10) overallGrade = 'B';
  else if (roi >= 5) overallGrade = 'C+';
  else if (roi >= 0) overallGrade = 'C';
  else overallGrade = 'D';

  const highlights: string[] = [];
  if (haul.bestDeal) {
    const bestMargin = Math.round(((haul.bestDeal.estimatedValue - haul.bestDeal.purchasePrice) / haul.bestDeal.purchasePrice) * 100);
    highlights.push(`Best flip: ${haul.bestDeal.cardName} at +${bestMargin}% margin`);
  }
  if (haul.deals.length >= 5) highlights.push(`High volume day — ${haul.deals.length} deals logged`);
  if (roi >= 15) highlights.push(`Strong overall ROI of ${roi.toFixed(1)}%`);
  if (uniqueVendors >= 3) highlights.push(`Good vendor coverage — ${uniqueVendors} different sellers`);

  const lessonsLearned: string[] = [];
  if (haul.worstDeal && haul.worstDeal.estimatedValue < haul.worstDeal.purchasePrice) {
    lessonsLearned.push(`Overpaid on ${haul.worstDeal.cardName} — check comps more carefully next time`);
  }
  lessonsLearned.push('Walk the entire show before committing to big purchases');
  lessonsLearned.push('Cash deals at end of day often yield better prices');

  return {
    showId,
    showName: show?.name ?? 'Unknown Show',
    date: show?.startDate ?? new Date().toISOString().split('T')[0],
    totalDeals: haul.deals.length,
    totalSpent: haul.totalSpent,
    estimatedValue: haul.totalEstimatedValue,
    roi,
    topPicks,
    vendorsVisited: uniqueVendors,
    timeSpent: `${3 + Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 60)}m`,
    highlights,
    lessonsLearned,
    overallGrade,
  };
}

export function getOfflineStatus(): OfflineSyncStatus {
  const cached = loadFromCache<OfflineSyncStatus>(CACHE_KEYS.SYNC_STATUS);
  if (cached) return cached;

  const status: OfflineSyncStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncTimestamp: new Date().toISOString(),
    pendingUploads: 0,
    cachedShows: MOCK_SHOWS.length,
    cachedComps: 42,
    cacheSize: '2.4 MB',
    syncProgress: 100,
  };
  saveToCache(CACHE_KEYS.SYNC_STATUS, status);
  return status;
}
