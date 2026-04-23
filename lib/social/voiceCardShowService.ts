// @ts-nocheck
// ---- Types ----

export interface CardShowEvent {
  id: string;
  name: string;
  location: string;
  date: string;
  vendorCount: number;
  estimatedAttendance: number;
  status: 'upcoming' | 'live' | 'completed';
}

export interface VoiceCommand {
  id: string;
  transcript: string;
  commandType: 'identify' | 'price-check' | 'negotiate' | 'compare' | 'add-to-cart' | 'portfolio-check';
  timestamp: string;
  result: string;
  confidence: number;
}

export interface VendorProfile {
  id: string;
  name: string;
  boothNumber: string;
  specialties: string[];
  reputationScore: number;
  avgPriceVsMarket: number;
  dealHistory: number;
  responseRate: number;
}

export interface LiveScan {
  id: string;
  cardIdentified: string;
  playerName: string;
  estimatedGrade: string;
  marketValue: number;
  negotiationFloor: number;
  negotiationCeiling: number;
  portfolioExposure: number;
  recommendation: 'strong-buy' | 'buy' | 'hold' | 'pass';
}

export interface CrowdHeatzone {
  zone: string;
  density: 'low' | 'medium' | 'high' | 'packed';
  bestTime: string;
  hotDeals: number;
}

export interface CompanionStats {
  showsAttended: number;
  cardsScanned: number;
  dealsCompleted: number;
  totalSaved: number;
  avgNegotiationDiscount: number;
  vendorsRated: number;
}

// ---- Mock Data ----

const mockCardShows: CardShowEvent[] = [
  {
    id: 'show-001',
    name: 'National Sports Collectors Convention',
    location: 'Atlantic City, NJ',
    date: '2026-03-16',
    vendorCount: 450,
    estimatedAttendance: 25000,
    status: 'live',
  },
  {
    id: 'show-002',
    name: 'Dallas Card Show',
    location: 'Dallas, TX',
    date: '2026-03-28',
    vendorCount: 180,
    estimatedAttendance: 8500,
    status: 'upcoming',
  },
  {
    id: 'show-003',
    name: 'Chicago Sports Spectacular',
    location: 'Rosemont, IL',
    date: '2026-02-14',
    vendorCount: 320,
    estimatedAttendance: 15000,
    status: 'completed',
  },
  {
    id: 'show-004',
    name: 'SoCal Card Expo',
    location: 'Anaheim, CA',
    date: '2026-04-11',
    vendorCount: 200,
    estimatedAttendance: 10000,
    status: 'upcoming',
  },
];

const mockVoiceCommands: VoiceCommand[] = [
  {
    id: 'vc-001',
    transcript: 'Identify this card',
    commandType: 'identify',
    timestamp: '2026-03-16T10:15:00Z',
    result: '2023 Topps Chrome Victor Wembanyama Rookie #101 — estimated PSA 9',
    confidence: 0.94,
  },
  {
    id: 'vc-002',
    transcript: 'What is the market price?',
    commandType: 'price-check',
    timestamp: '2026-03-16T10:15:32Z',
    result: 'Last sale $485, 30-day avg $510, trending down 4%',
    confidence: 0.97,
  },
  {
    id: 'vc-003',
    transcript: 'What should I offer for this?',
    commandType: 'negotiate',
    timestamp: '2026-03-16T10:16:05Z',
    result: 'Recommend opening at $380, ceiling $440 — vendor typically accepts 15% below ask',
    confidence: 0.91,
  },
  {
    id: 'vc-004',
    transcript: 'Compare to the one at booth 214',
    commandType: 'compare',
    timestamp: '2026-03-16T10:22:18Z',
    result: 'Booth 214 copy is PSA 8 at $310. Current scan PSA 9 at $485 — 56% premium for one grade up',
    confidence: 0.89,
  },
  {
    id: 'vc-005',
    transcript: 'Add this to my cart',
    commandType: 'add-to-cart',
    timestamp: '2026-03-16T10:30:00Z',
    result: 'Added 2023 Topps Chrome Wembanyama RC to cart. Cart total: $420',
    confidence: 0.98,
  },
  {
    id: 'vc-006',
    transcript: 'Check my portfolio exposure to Wembanyama',
    commandType: 'portfolio-check',
    timestamp: '2026-03-16T10:31:15Z',
    result: 'Current exposure: 18% ($3,240 of $18,000 portfolio). Adding this card would push to 20.3%',
    confidence: 0.95,
  },
  {
    id: 'vc-007',
    transcript: 'Identify this card please',
    commandType: 'identify',
    timestamp: '2026-03-16T11:05:00Z',
    result: '2020 Panini Prizm Joe Burrow Silver #307 — estimated BGS 9.5',
    confidence: 0.92,
  },
  {
    id: 'vc-008',
    transcript: 'Price check on the Burrow',
    commandType: 'price-check',
    timestamp: '2026-03-16T11:05:45Z',
    result: 'Last sale $725, 30-day avg $690, trending up 8%',
    confidence: 0.96,
  },
  {
    id: 'vc-009',
    transcript: 'What is a fair negotiation range?',
    commandType: 'negotiate',
    timestamp: '2026-03-16T11:06:20Z',
    result: 'Floor $580, ceiling $670 — vendor has high rep, expect modest discount only',
    confidence: 0.88,
  },
  {
    id: 'vc-010',
    transcript: 'Do I already own any Burrow rookies?',
    commandType: 'portfolio-check',
    timestamp: '2026-03-16T11:08:00Z',
    result: 'You own 2 Burrow rookies: 2020 Donruss Rated Rookie PSA 10 ($420) and 2020 Mosaic Base PSA 9 ($185)',
    confidence: 0.93,
  },
  {
    id: 'vc-011',
    transcript: 'Identify the card in front of me',
    commandType: 'identify',
    timestamp: '2026-03-16T12:10:00Z',
    result: '2018 Panini Prizm Luka Doncic Silver #280 — estimated PSA 10',
    confidence: 0.96,
  },
  {
    id: 'vc-012',
    transcript: 'Compare pricing across vendors here',
    commandType: 'compare',
    timestamp: '2026-03-16T12:12:00Z',
    result: 'Booth 108: $4,200 | Booth 315: $4,500 | Booth 422: $3,950 — Booth 422 is 6% below avg',
    confidence: 0.90,
  },
];

const mockVendors: VendorProfile[] = [
  { id: 'v-001', name: 'Elite Cards & Memorabilia', boothNumber: 'A-108', specialties: ['Basketball RC', 'Prizm', 'High-end Singles'], reputationScore: 4.8, avgPriceVsMarket: -0.03, dealHistory: 342, responseRate: 0.95 },
  { id: 'v-002', name: 'Diamond Grading Deals', boothNumber: 'B-214', specialties: ['Graded Cards', 'PSA 10s', 'Vintage'], reputationScore: 4.5, avgPriceVsMarket: 0.05, dealHistory: 218, responseRate: 0.88 },
  { id: 'v-003', name: 'Rookie Warehouse', boothNumber: 'A-315', specialties: ['Football RC', 'Baseball RC', 'Prospect Cards'], reputationScore: 4.2, avgPriceVsMarket: -0.08, dealHistory: 567, responseRate: 0.92 },
  { id: 'v-004', name: 'The Card Vault', boothNumber: 'C-422', specialties: ['Vintage', 'Pre-War', 'Tobacco Cards'], reputationScore: 4.9, avgPriceVsMarket: 0.02, dealHistory: 189, responseRate: 0.97 },
  { id: 'v-005', name: 'Breakaway Sports Cards', boothNumber: 'B-130', specialties: ['Breaks', 'Wax', 'Sealed Product'], reputationScore: 3.8, avgPriceVsMarket: 0.12, dealHistory: 723, responseRate: 0.78 },
  { id: 'v-006', name: 'Pristine Pulls', boothNumber: 'A-245', specialties: ['Basketball', 'Auto Cards', 'Numbered Parallels'], reputationScore: 4.6, avgPriceVsMarket: -0.01, dealHistory: 431, responseRate: 0.91 },
  { id: 'v-007', name: 'Legends Collectibles', boothNumber: 'D-512', specialties: ['HOF Cards', 'Iconic Sets', 'Memorabilia'], reputationScore: 4.7, avgPriceVsMarket: 0.04, dealHistory: 156, responseRate: 0.94 },
  { id: 'v-008', name: 'Prospect Kings', boothNumber: 'C-333', specialties: ['Bowman Chrome', 'Prospect Autos', '1st Bowman'], reputationScore: 4.1, avgPriceVsMarket: -0.06, dealHistory: 389, responseRate: 0.85 },
  { id: 'v-009', name: 'Slab City Cards', boothNumber: 'B-450', specialties: ['Graded Only', 'Crossover Candidates', 'Registry Sets'], reputationScore: 4.4, avgPriceVsMarket: 0.07, dealHistory: 278, responseRate: 0.90 },
  { id: 'v-010', name: 'Budget Hits', boothNumber: 'D-118', specialties: ['Value Picks', 'Raw Cards', 'Bulk Lots'], reputationScore: 3.6, avgPriceVsMarket: -0.15, dealHistory: 892, responseRate: 0.72 },
];

const mockLiveScans: LiveScan[] = [
  { id: 'ls-001', cardIdentified: '2023 Topps Chrome Victor Wembanyama RC #101', playerName: 'Victor Wembanyama', estimatedGrade: 'PSA 9', marketValue: 485, negotiationFloor: 380, negotiationCeiling: 440, portfolioExposure: 18.0, recommendation: 'buy' },
  { id: 'ls-002', cardIdentified: '2020 Panini Prizm Joe Burrow Silver #307', playerName: 'Joe Burrow', estimatedGrade: 'BGS 9.5', marketValue: 725, negotiationFloor: 580, negotiationCeiling: 670, portfolioExposure: 8.5, recommendation: 'strong-buy' },
  { id: 'ls-003', cardIdentified: '2018 Panini Prizm Luka Doncic Silver #280', playerName: 'Luka Doncic', estimatedGrade: 'PSA 10', marketValue: 4200, negotiationFloor: 3600, negotiationCeiling: 4000, portfolioExposure: 12.0, recommendation: 'hold' },
  { id: 'ls-004', cardIdentified: '2011 Topps Update Mike Trout RC #US175', playerName: 'Mike Trout', estimatedGrade: 'PSA 8', marketValue: 1850, negotiationFloor: 1500, negotiationCeiling: 1700, portfolioExposure: 6.2, recommendation: 'buy' },
  { id: 'ls-005', cardIdentified: '2019 Panini Mosaic Zion Williamson RC #209', playerName: 'Zion Williamson', estimatedGrade: 'PSA 9', marketValue: 120, negotiationFloor: 85, negotiationCeiling: 105, portfolioExposure: 2.1, recommendation: 'pass' },
  { id: 'ls-006', cardIdentified: '2022 Topps Chrome Julio Rodriguez RC #150', playerName: 'Julio Rodriguez', estimatedGrade: 'PSA 10', marketValue: 310, negotiationFloor: 240, negotiationCeiling: 280, portfolioExposure: 4.5, recommendation: 'strong-buy' },
  { id: 'ls-007', cardIdentified: '2020 Panini Select Justin Herbert Concourse #44', playerName: 'Justin Herbert', estimatedGrade: 'BGS 9', marketValue: 195, negotiationFloor: 150, negotiationCeiling: 175, portfolioExposure: 3.8, recommendation: 'buy' },
  { id: 'ls-008', cardIdentified: '2003 Topps Chrome LeBron James RC #111', playerName: 'LeBron James', estimatedGrade: 'PSA 7', marketValue: 8500, negotiationFloor: 7200, negotiationCeiling: 8000, portfolioExposure: 0.0, recommendation: 'hold' },
];

const mockCrowdHeatzones: Record<string, CrowdHeatzone[]> = {
  'show-001': [
    { zone: 'Hall A - Main Entrance', density: 'packed', bestTime: '2:00 PM - 3:00 PM', hotDeals: 12 },
    { zone: 'Hall A - Center Aisle', density: 'high', bestTime: '11:00 AM - 12:00 PM', hotDeals: 8 },
    { zone: 'Hall B - East Wing', density: 'medium', bestTime: '10:00 AM - 11:00 AM', hotDeals: 15 },
    { zone: 'Hall B - West Wing', density: 'low', bestTime: '9:00 AM - 10:00 AM', hotDeals: 6 },
    { zone: 'Hall C - Autograph Area', density: 'packed', bestTime: '3:00 PM - 4:00 PM', hotDeals: 3 },
    { zone: 'Hall D - Budget Section', density: 'medium', bestTime: '12:00 PM - 1:00 PM', hotDeals: 22 },
  ],
  'show-003': [
    { zone: 'North Hall - Premium', density: 'high', bestTime: '10:00 AM - 11:00 AM', hotDeals: 9 },
    { zone: 'North Hall - General', density: 'medium', bestTime: '1:00 PM - 2:00 PM', hotDeals: 14 },
    { zone: 'South Hall - Vintage', density: 'low', bestTime: '11:00 AM - 12:00 PM', hotDeals: 7 },
    { zone: 'South Hall - Modern', density: 'high', bestTime: '12:00 PM - 1:00 PM', hotDeals: 18 },
    { zone: 'Lobby - Quick Deals', density: 'packed', bestTime: '9:00 AM - 10:00 AM', hotDeals: 5 },
    { zone: 'Mezzanine - Grading', density: 'low', bestTime: '2:00 PM - 3:00 PM', hotDeals: 2 },
  ],
};

const mockCompanionStats: CompanionStats = {
  showsAttended: 14,
  cardsScanned: 387,
  dealsCompleted: 52,
  totalSaved: 4280,
  avgNegotiationDiscount: 14.2,
  vendorsRated: 38,
};

// ---- Functions ----

export function getCardShows(): CardShowEvent[] {
  return mockCardShows;
}

export function getVoiceHistory(): VoiceCommand[] {
  return mockVoiceCommands;
}

export function getVendorProfiles(_showId?: string): VendorProfile[] {
  return mockVendors;
}

export function getLiveScans(): LiveScan[] {
  return mockLiveScans;
}

export function getCrowdHeatmap(showId: string): CrowdHeatzone[] {
  return mockCrowdHeatzones[showId] ?? mockCrowdHeatzones['show-001'];
}

export function getCompanionStats(): CompanionStats {
  return mockCompanionStats;
}

export function getVendorReputation(vendorId: string): { vendor: VendorProfile; rank: number; totalVendors: number } | null {
  const vendor = mockVendors.find(v => v.id === vendorId);
  if (!vendor) return null;
  const sorted = [...mockVendors].sort((a, b) => b.reputationScore - a.reputationScore);
  const rank = sorted.findIndex(v => v.id === vendorId) + 1;
  return { vendor, rank, totalVendors: mockVendors.length };
}

export function getNegotiationRange(cardValue: number): { floor: number; ceiling: number; openingOffer: number; walkawayPrice: number } {
  const floor = Math.round(cardValue * 0.75);
  const ceiling = Math.round(cardValue * 0.92);
  const openingOffer = Math.round(cardValue * 0.78);
  const walkawayPrice = Math.round(cardValue * 0.88);
  return { floor, ceiling, openingOffer, walkawayPrice };
}
