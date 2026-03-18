// Micro-Arbitrage Swarm Network Service
// Distributed crowdsourced real-world pricing from card shows, LCS, flea markets, etc.
// Industry-first: captures pricing data no online scraper can reach.

export type SightingSource =
  | 'card_show'
  | 'lcs'
  | 'flea_market'
  | 'garage_sale'
  | 'estate_sale'
  | 'antique_mall'
  | 'pawn_shop'
  | 'facebook_marketplace';

export const SIGHTING_SOURCE_LABELS: Record<SightingSource, string> = {
  card_show: 'Card Show',
  lcs: 'Local Card Shop',
  flea_market: 'Flea Market',
  garage_sale: 'Garage Sale',
  estate_sale: 'Estate Sale',
  antique_mall: 'Antique Mall',
  pawn_shop: 'Pawn Shop',
  facebook_marketplace: 'Facebook Marketplace',
};

export interface PriceSighting {
  id: string;
  cardDescription: string;
  player: string;
  year: number;
  grade: string;
  price: number;
  source: SightingSource;
  location: {
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  reportedBy: string;
  reportedAt: string;
  verificationCount: number;
  verificationScore: number;
  isVerified: boolean;
  onlinePrice: number;
  arbitrageDelta: number;
  sport: string;
}

export interface SwarmNode {
  userId: string;
  alias: string;
  reputation: number;
  totalSightings: number;
  verifiedSightings: number;
  rewardsEarned: number;
  region: string;
  specialties: string[];
  joinedAt: string;
  accuracy: number;
}

export interface ArbitrageOpportunity {
  id: string;
  sightingId: string;
  cardDescription: string;
  player: string;
  realWorldPrice: number;
  onlinePrice: number;
  delta: number;
  deltaPercent: number;
  source: SightingSource;
  location: string;
  confidence: 'high' | 'medium' | 'low';
  expiresIn: string;
  sport: string;
}

export interface SwarmReputation {
  userId: string;
  alias: string;
  overallScore: number;
  accuracyRate: number;
  totalSightings: number;
  verifiedSightings: number;
  rank: number;
  tier: 'scout' | 'tracker' | 'hunter' | 'elite' | 'legend';
  badges: { name: string; icon: string; earnedAt: string }[];
  streakDays: number;
  rewardsEarned: number;
  monthlySightings: number;
}

export interface SightingVerification {
  sightingId: string;
  verifiedBy: string;
  verifiedAt: string;
  confidence: number;
  newVerificationCount: number;
  newVerificationScore: number;
  isNowVerified: boolean;
}

export interface GeoPriceCluster {
  id: string;
  region: string;
  state: string;
  avgPrice: number;
  sightingCount: number;
  topPlayer: string;
  priceVsNational: number;
  lat: number;
  lng: number;
}

export interface PriceHeatMapData {
  state: string;
  region: string;
  avgDiscount: number;
  sightingCount: number;
  bestDeal: string;
  bestDealDelta: number;
  intensity: number;
}

export interface SwarmStats {
  totalSightings: number;
  activeNodes: number;
  avgSavings: number;
  totalArbitrageFound: number;
  totalValueSaved: number;
  sightingsToday: number;
  verificationsToday: number;
  topRegion: string;
  topSource: SightingSource;
  avgVerificationScore: number;
}

export interface ContributionReward {
  id: string;
  type: 'sighting' | 'verification' | 'streak' | 'milestone' | 'referral';
  description: string;
  points: number;
  earnedAt: string;
  status: 'claimed' | 'pending' | 'expired';
}

export interface SightingReport {
  sightingId: string;
  reason: 'inaccurate_price' | 'fake_listing' | 'duplicate' | 'wrong_card' | 'other';
  details: string;
  reportedBy: string;
  reportedAt: string;
}

export interface SwarmLeaderboard {
  rank: number;
  userId: string;
  alias: string;
  totalSightings: number;
  verifiedSightings: number;
  accuracy: number;
  rewardsEarned: number;
  tier: 'scout' | 'tracker' | 'hunter' | 'elite' | 'legend';
  region: string;
  streak: number;
}

export interface RealWorldVsOnline {
  category: string;
  realWorldAvg: number;
  onlineAvg: number;
  delta: number;
  deltaPercent: number;
  sampleSize: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockSightings: PriceSighting[] = [
  {
    id: 'sight-001', cardDescription: '2023 Topps Chrome Victor Wembanyama RC #201', player: 'Victor Wembanyama', year: 2023, grade: 'Raw NM', price: 85, source: 'card_show', location: { city: 'Houston', state: 'TX', lat: 29.76, lng: -95.37 }, reportedBy: 'user-001', reportedAt: '2026-03-15T09:15:00Z', verificationCount: 7, verificationScore: 92, isVerified: true, onlinePrice: 135, arbitrageDelta: -37.04, sport: 'Basketball',
  },
  {
    id: 'sight-002', cardDescription: '2022 Bowman Chrome Julio Rodriguez RC Auto', player: 'Julio Rodriguez', year: 2022, grade: 'PSA 10', price: 310, source: 'lcs', location: { city: 'Seattle', state: 'WA', lat: 47.61, lng: -122.33 }, reportedBy: 'user-002', reportedAt: '2026-03-15T08:30:00Z', verificationCount: 5, verificationScore: 88, isVerified: true, onlinePrice: 425, arbitrageDelta: -27.06, sport: 'Baseball',
  },
  {
    id: 'sight-003', cardDescription: '2020 Panini Prizm Justin Herbert RC Silver', player: 'Justin Herbert', year: 2020, grade: 'BGS 9.5', price: 175, source: 'flea_market', location: { city: 'Los Angeles', state: 'CA', lat: 34.05, lng: -118.24 }, reportedBy: 'user-003', reportedAt: '2026-03-15T07:45:00Z', verificationCount: 4, verificationScore: 85, isVerified: true, onlinePrice: 260, arbitrageDelta: -32.69, sport: 'Football',
  },
  {
    id: 'sight-004', cardDescription: '2018 Topps Update Juan Soto RC #US300', player: 'Juan Soto', year: 2018, grade: 'Raw EX-MT', price: 42, source: 'garage_sale', location: { city: 'Miami', state: 'FL', lat: 25.76, lng: -80.19 }, reportedBy: 'user-004', reportedAt: '2026-03-15T10:00:00Z', verificationCount: 3, verificationScore: 78, isVerified: false, onlinePrice: 95, arbitrageDelta: -55.79, sport: 'Baseball',
  },
  {
    id: 'sight-005', cardDescription: '2019 Panini Prizm Zion Williamson RC #248', player: 'Zion Williamson', year: 2019, grade: 'PSA 9', price: 120, source: 'estate_sale', location: { city: 'New Orleans', state: 'LA', lat: 29.95, lng: -90.07 }, reportedBy: 'user-005', reportedAt: '2026-03-14T16:20:00Z', verificationCount: 6, verificationScore: 90, isVerified: true, onlinePrice: 185, arbitrageDelta: -35.14, sport: 'Basketball',
  },
  {
    id: 'sight-006', cardDescription: '2023 Topps Series 1 Corbin Carroll RC #1', player: 'Corbin Carroll', year: 2023, grade: 'Raw MT', price: 18, source: 'antique_mall', location: { city: 'Phoenix', state: 'AZ', lat: 33.45, lng: -112.07 }, reportedBy: 'user-006', reportedAt: '2026-03-14T14:10:00Z', verificationCount: 2, verificationScore: 72, isVerified: false, onlinePrice: 28, arbitrageDelta: -35.71, sport: 'Baseball',
  },
  {
    id: 'sight-007', cardDescription: '2021 Donruss Optic Trevor Lawrence RC Rated Rookie', player: 'Trevor Lawrence', year: 2021, grade: 'PSA 10', price: 55, source: 'pawn_shop', location: { city: 'Jacksonville', state: 'FL', lat: 30.33, lng: -81.66 }, reportedBy: 'user-007', reportedAt: '2026-03-14T11:30:00Z', verificationCount: 8, verificationScore: 95, isVerified: true, onlinePrice: 78, arbitrageDelta: -29.49, sport: 'Football',
  },
  {
    id: 'sight-008', cardDescription: '2023 Panini Prizm Chet Holmgren RC Silver', player: 'Chet Holmgren', year: 2023, grade: 'Raw NM-MT', price: 30, source: 'facebook_marketplace', location: { city: 'Oklahoma City', state: 'OK', lat: 35.47, lng: -97.52 }, reportedBy: 'user-008', reportedAt: '2026-03-14T09:00:00Z', verificationCount: 4, verificationScore: 82, isVerified: true, onlinePrice: 48, arbitrageDelta: -37.5, sport: 'Basketball',
  },
  {
    id: 'sight-009', cardDescription: '2011 Topps Update Mike Trout RC #US175', player: 'Mike Trout', year: 2011, grade: 'PSA 8', price: 950, source: 'card_show', location: { city: 'Anaheim', state: 'CA', lat: 33.84, lng: -117.91 }, reportedBy: 'user-002', reportedAt: '2026-03-13T15:45:00Z', verificationCount: 12, verificationScore: 98, isVerified: true, onlinePrice: 1350, arbitrageDelta: -29.63, sport: 'Baseball',
  },
  {
    id: 'sight-010', cardDescription: '2020 Panini Mosaic Joe Burrow RC #201', player: 'Joe Burrow', year: 2020, grade: 'PSA 10', price: 68, source: 'lcs', location: { city: 'Cincinnati', state: 'OH', lat: 39.10, lng: -84.51 }, reportedBy: 'user-009', reportedAt: '2026-03-13T13:20:00Z', verificationCount: 6, verificationScore: 91, isVerified: true, onlinePrice: 98, arbitrageDelta: -30.61, sport: 'Football',
  },
  {
    id: 'sight-011', cardDescription: '2018 Topps Chrome Shohei Ohtani RC #150', player: 'Shohei Ohtani', year: 2018, grade: 'PSA 10', price: 480, source: 'card_show', location: { city: 'Chicago', state: 'IL', lat: 41.88, lng: -87.63 }, reportedBy: 'user-010', reportedAt: '2026-03-13T10:00:00Z', verificationCount: 9, verificationScore: 96, isVerified: true, onlinePrice: 680, arbitrageDelta: -29.41, sport: 'Baseball',
  },
  {
    id: 'sight-012', cardDescription: '2024 Topps Chrome Elly De La Cruz RC', player: 'Elly De La Cruz', year: 2024, grade: 'Raw NM', price: 12, source: 'flea_market', location: { city: 'Columbus', state: 'OH', lat: 39.96, lng: -83.00 }, reportedBy: 'user-011', reportedAt: '2026-03-12T17:30:00Z', verificationCount: 3, verificationScore: 76, isVerified: false, onlinePrice: 22, arbitrageDelta: -45.45, sport: 'Baseball',
  },
  {
    id: 'sight-013', cardDescription: '2023 Panini Prizm Jalin Hyatt RC Silver', player: 'Jalin Hyatt', year: 2023, grade: 'PSA 10', price: 15, source: 'garage_sale', location: { city: 'Nashville', state: 'TN', lat: 36.16, lng: -86.78 }, reportedBy: 'user-012', reportedAt: '2026-03-12T14:15:00Z', verificationCount: 2, verificationScore: 68, isVerified: false, onlinePrice: 35, arbitrageDelta: -57.14, sport: 'Football',
  },
  {
    id: 'sight-014', cardDescription: '2022 Topps Chrome Bobby Witt Jr RC', player: 'Bobby Witt Jr', year: 2022, grade: 'BGS 9.5', price: 85, source: 'lcs', location: { city: 'Kansas City', state: 'MO', lat: 39.10, lng: -94.58 }, reportedBy: 'user-001', reportedAt: '2026-03-12T11:00:00Z', verificationCount: 5, verificationScore: 87, isVerified: true, onlinePrice: 120, arbitrageDelta: -29.17, sport: 'Baseball',
  },
  {
    id: 'sight-015', cardDescription: '2024 Panini Prizm Caitlin Clark RC', player: 'Caitlin Clark', year: 2024, grade: 'Raw NM-MT', price: 95, source: 'card_show', location: { city: 'Indianapolis', state: 'IN', lat: 39.77, lng: -86.16 }, reportedBy: 'user-013', reportedAt: '2026-03-11T16:00:00Z', verificationCount: 11, verificationScore: 94, isVerified: true, onlinePrice: 155, arbitrageDelta: -38.71, sport: 'Basketball',
  },
  {
    id: 'sight-016', cardDescription: '2020 Topps Chrome Luis Robert RC Auto', player: 'Luis Robert', year: 2020, grade: 'PSA 9', price: 140, source: 'estate_sale', location: { city: 'Chicago', state: 'IL', lat: 41.88, lng: -87.63 }, reportedBy: 'user-014', reportedAt: '2026-03-11T12:30:00Z', verificationCount: 4, verificationScore: 83, isVerified: true, onlinePrice: 210, arbitrageDelta: -33.33, sport: 'Baseball',
  },
  {
    id: 'sight-017', cardDescription: '2019 Prizm Lamar Jackson RC Silver', player: 'Lamar Jackson', year: 2019, grade: 'PSA 10', price: 210, source: 'pawn_shop', location: { city: 'Baltimore', state: 'MD', lat: 39.29, lng: -76.61 }, reportedBy: 'user-015', reportedAt: '2026-03-11T09:45:00Z', verificationCount: 7, verificationScore: 91, isVerified: true, onlinePrice: 310, arbitrageDelta: -32.26, sport: 'Football',
  },
  {
    id: 'sight-018', cardDescription: '2023 Topps Chrome Gunnar Henderson RC', player: 'Gunnar Henderson', year: 2023, grade: 'BGS 9.5', price: 42, source: 'antique_mall', location: { city: 'Baltimore', state: 'MD', lat: 39.29, lng: -76.61 }, reportedBy: 'user-016', reportedAt: '2026-03-10T15:20:00Z', verificationCount: 3, verificationScore: 77, isVerified: false, onlinePrice: 65, arbitrageDelta: -35.38, sport: 'Baseball',
  },
  {
    id: 'sight-019', cardDescription: '2021 Panini Prizm Evan Mobley RC', player: 'Evan Mobley', year: 2021, grade: 'Raw NM', price: 8, source: 'flea_market', location: { city: 'Cleveland', state: 'OH', lat: 41.50, lng: -81.69 }, reportedBy: 'user-017', reportedAt: '2026-03-10T11:10:00Z', verificationCount: 2, verificationScore: 65, isVerified: false, onlinePrice: 18, arbitrageDelta: -55.56, sport: 'Basketball',
  },
  {
    id: 'sight-020', cardDescription: '2023 Topps Series 2 Adley Rutschman RC', player: 'Adley Rutschman', year: 2023, grade: 'PSA 10', price: 28, source: 'facebook_marketplace', location: { city: 'Baltimore', state: 'MD', lat: 39.29, lng: -76.61 }, reportedBy: 'user-018', reportedAt: '2026-03-10T08:00:00Z', verificationCount: 5, verificationScore: 86, isVerified: true, onlinePrice: 45, arbitrageDelta: -37.78, sport: 'Baseball',
  },
  {
    id: 'sight-021', cardDescription: '2024 Donruss Caleb Williams RC Rated Rookie', player: 'Caleb Williams', year: 2024, grade: 'Raw NM-MT', price: 22, source: 'card_show', location: { city: 'Chicago', state: 'IL', lat: 41.88, lng: -87.63 }, reportedBy: 'user-010', reportedAt: '2026-03-15T11:30:00Z', verificationCount: 3, verificationScore: 80, isVerified: false, onlinePrice: 38, arbitrageDelta: -42.11, sport: 'Football',
  },
  {
    id: 'sight-022', cardDescription: '2023 Topps Chrome Kodai Senga RC', player: 'Kodai Senga', year: 2023, grade: 'PSA 9', price: 14, source: 'lcs', location: { city: 'New York', state: 'NY', lat: 40.71, lng: -74.01 }, reportedBy: 'user-019', reportedAt: '2026-03-15T10:45:00Z', verificationCount: 4, verificationScore: 84, isVerified: true, onlinePrice: 25, arbitrageDelta: -44.0, sport: 'Baseball',
  },
  {
    id: 'sight-023', cardDescription: '2020 Panini Prizm Anthony Edwards RC', player: 'Anthony Edwards', year: 2020, grade: 'PSA 10', price: 275, source: 'card_show', location: { city: 'Minneapolis', state: 'MN', lat: 44.98, lng: -93.27 }, reportedBy: 'user-020', reportedAt: '2026-03-14T13:00:00Z', verificationCount: 8, verificationScore: 93, isVerified: true, onlinePrice: 410, arbitrageDelta: -32.93, sport: 'Basketball',
  },
  {
    id: 'sight-024', cardDescription: '2022 Topps Chrome Julio Rodriguez RC Refractor', player: 'Julio Rodriguez', year: 2022, grade: 'Raw NM-MT', price: 55, source: 'garage_sale', location: { city: 'Tacoma', state: 'WA', lat: 47.25, lng: -122.44 }, reportedBy: 'user-021', reportedAt: '2026-03-13T09:15:00Z', verificationCount: 2, verificationScore: 70, isVerified: false, onlinePrice: 95, arbitrageDelta: -42.11, sport: 'Baseball',
  },
];

const mockSwarmNodes: SwarmNode[] = [
  { userId: 'user-001', alias: 'CardHunter_TX', reputation: 94, totalSightings: 187, verifiedSightings: 168, rewardsEarned: 2340, region: 'Southwest', specialties: ['Baseball', 'Rookies'], joinedAt: '2025-06-15', accuracy: 0.93 },
  { userId: 'user-002', alias: 'PNW_Collector', reputation: 91, totalSightings: 142, verifiedSightings: 125, rewardsEarned: 1870, region: 'Northwest', specialties: ['Baseball', 'Autos'], joinedAt: '2025-07-20', accuracy: 0.90 },
  { userId: 'user-003', alias: 'SoCalFinds', reputation: 88, totalSightings: 98, verifiedSightings: 82, rewardsEarned: 1210, region: 'West', specialties: ['Football', 'Basketball'], joinedAt: '2025-08-01', accuracy: 0.87 },
  { userId: 'user-004', alias: 'MiamiCardKing', reputation: 82, totalSightings: 73, verifiedSightings: 55, rewardsEarned: 890, region: 'Southeast', specialties: ['Baseball'], joinedAt: '2025-09-10', accuracy: 0.81 },
  { userId: 'user-005', alias: 'NOLA_Pickz', reputation: 86, totalSightings: 64, verifiedSightings: 51, rewardsEarned: 760, region: 'South', specialties: ['Basketball'], joinedAt: '2025-10-05', accuracy: 0.85 },
  { userId: 'user-010', alias: 'ChiTown_Cards', reputation: 90, totalSightings: 156, verifiedSightings: 140, rewardsEarned: 2100, region: 'Midwest', specialties: ['Baseball', 'Football'], joinedAt: '2025-06-20', accuracy: 0.91 },
  { userId: 'user-013', alias: 'Indy_Hoops', reputation: 85, totalSightings: 88, verifiedSightings: 71, rewardsEarned: 1050, region: 'Midwest', specialties: ['Basketball', 'WNBA'], joinedAt: '2025-08-15', accuracy: 0.84 },
  { userId: 'user-015', alias: 'BMore_Hunter', reputation: 87, totalSightings: 112, verifiedSightings: 95, rewardsEarned: 1440, region: 'Northeast', specialties: ['Football', 'Baseball'], joinedAt: '2025-07-10', accuracy: 0.88 },
  { userId: 'user-020', alias: 'MN_Wolves_Fan', reputation: 83, totalSightings: 67, verifiedSightings: 52, rewardsEarned: 780, region: 'Midwest', specialties: ['Basketball'], joinedAt: '2025-11-01', accuracy: 0.82 },
  { userId: 'user-019', alias: 'NYC_Cardboard', reputation: 89, totalSightings: 134, verifiedSightings: 118, rewardsEarned: 1690, region: 'Northeast', specialties: ['Baseball', 'Vintage'], joinedAt: '2025-06-01', accuracy: 0.89 },
];

// ─── Service Functions ───────────────────────────────────────────────────────

let sightingsStore = [...mockSightings];

export function reportSighting(sighting: Partial<PriceSighting>): PriceSighting {
  const onlinePrice = sighting.onlinePrice || Math.round((sighting.price || 50) * (1.25 + Math.random() * 0.5));
  const price = sighting.price || 50;
  const newSighting: PriceSighting = {
    id: `sight-${Date.now()}`,
    cardDescription: sighting.cardDescription || '',
    player: sighting.player || '',
    year: sighting.year || 2024,
    grade: sighting.grade || 'Raw',
    price,
    source: sighting.source || 'card_show',
    location: sighting.location || { city: 'Unknown', state: 'US', lat: 39.83, lng: -98.58 },
    reportedBy: sighting.reportedBy || 'current-user',
    reportedAt: new Date().toISOString(),
    verificationCount: 0,
    verificationScore: 0,
    isVerified: false,
    onlinePrice,
    arbitrageDelta: -Math.round(((onlinePrice - price) / onlinePrice) * 10000) / 100,
    sport: sighting.sport || 'Baseball',
  };
  sightingsStore = [newSighting, ...sightingsStore];
  return newSighting;
}

export function getSightings(filter?: {
  source?: SightingSource;
  sport?: string;
  region?: string;
  verified?: boolean;
}): PriceSighting[] {
  let results = [...sightingsStore];
  if (filter?.source) results = results.filter(s => s.source === filter.source);
  if (filter?.sport) results = results.filter(s => s.sport === filter.sport);
  if (filter?.region) {
    const regionStates: Record<string, string[]> = {
      Northeast: ['NY', 'NJ', 'CT', 'MA', 'PA', 'MD', 'DE', 'VT', 'NH', 'ME', 'RI'],
      Southeast: ['FL', 'GA', 'SC', 'NC', 'VA', 'AL', 'MS', 'LA', 'TN', 'KY', 'WV', 'AR'],
      Midwest: ['OH', 'IN', 'IL', 'MI', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
      Southwest: ['TX', 'AZ', 'NM', 'OK'],
      West: ['CA', 'WA', 'OR', 'NV', 'CO', 'UT', 'ID', 'MT', 'WY', 'HI', 'AK'],
    };
    const states = regionStates[filter.region] || [];
    results = results.filter(s => states.includes(s.location.state));
  }
  if (filter?.verified !== undefined) results = results.filter(s => s.isVerified === filter.verified);
  return results.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
}

export function getArbitrageOpportunities(): ArbitrageOpportunity[] {
  return sightingsStore
    .filter(s => s.arbitrageDelta < -20)
    .sort((a, b) => a.arbitrageDelta - b.arbitrageDelta)
    .slice(0, 15)
    .map((s, i) => ({
      id: `arb-${i + 1}`,
      sightingId: s.id,
      cardDescription: s.cardDescription,
      player: s.player,
      realWorldPrice: s.price,
      onlinePrice: s.onlinePrice,
      delta: s.onlinePrice - s.price,
      deltaPercent: Math.abs(s.arbitrageDelta),
      source: s.source,
      location: `${s.location.city}, ${s.location.state}`,
      confidence: s.verificationScore >= 90 ? 'high' as const : s.verificationScore >= 75 ? 'medium' as const : 'low' as const,
      expiresIn: s.verificationScore >= 85 ? '2-4 hours' : s.verificationScore >= 70 ? '1-2 days' : '3-5 days',
      sport: s.sport,
    }));
}

export function verifySighting(sightingId: string): SightingVerification {
  const sighting = sightingsStore.find(s => s.id === sightingId);
  if (!sighting) throw new Error('Sighting not found');
  sighting.verificationCount += 1;
  sighting.verificationScore = Math.min(100, sighting.verificationScore + Math.round(8 + Math.random() * 7));
  sighting.isVerified = sighting.verificationCount >= 3 && sighting.verificationScore >= 75;
  return {
    sightingId,
    verifiedBy: 'current-user',
    verifiedAt: new Date().toISOString(),
    confidence: sighting.verificationScore,
    newVerificationCount: sighting.verificationCount,
    newVerificationScore: sighting.verificationScore,
    isNowVerified: sighting.isVerified,
  };
}

export function getSwarmStats(): SwarmStats {
  const sightings = sightingsStore;
  const today = sightings.filter(s => s.reportedAt.startsWith('2026-03-15'));
  const avgSavings = sightings.reduce((sum, s) => sum + (s.onlinePrice - s.price), 0) / sightings.length;
  return {
    totalSightings: sightings.length,
    activeNodes: mockSwarmNodes.length,
    avgSavings: Math.round(avgSavings),
    totalArbitrageFound: sightings.filter(s => s.arbitrageDelta < -20).length,
    totalValueSaved: sightings.reduce((sum, s) => sum + Math.max(0, s.onlinePrice - s.price), 0),
    sightingsToday: today.length,
    verificationsToday: 34,
    topRegion: 'Midwest',
    topSource: 'card_show',
    avgVerificationScore: Math.round(sightings.reduce((sum, s) => sum + s.verificationScore, 0) / sightings.length),
  };
}

export function getHeatMap(): PriceHeatMapData[] {
  return [
    { state: 'TX', region: 'Southwest', avgDiscount: 34.2, sightingCount: 28, bestDeal: 'Wembanyama RC', bestDealDelta: -37.04, intensity: 0.85 },
    { state: 'CA', region: 'West', avgDiscount: 31.5, sightingCount: 35, bestDeal: 'Herbert RC BGS 9.5', bestDealDelta: -32.69, intensity: 0.78 },
    { state: 'IL', region: 'Midwest', avgDiscount: 35.1, sightingCount: 42, bestDeal: 'Ohtani RC PSA 10', bestDealDelta: -29.41, intensity: 0.92 },
    { state: 'FL', region: 'Southeast', avgDiscount: 42.8, sightingCount: 22, bestDeal: 'Soto RC Raw', bestDealDelta: -55.79, intensity: 0.95 },
    { state: 'OH', region: 'Midwest', avgDiscount: 38.6, sightingCount: 31, bestDeal: 'De La Cruz RC', bestDealDelta: -45.45, intensity: 0.88 },
    { state: 'NY', region: 'Northeast', avgDiscount: 28.3, sightingCount: 38, bestDeal: 'Senga RC PSA 9', bestDealDelta: -44.0, intensity: 0.72 },
    { state: 'WA', region: 'Northwest', avgDiscount: 30.8, sightingCount: 19, bestDeal: 'J-Rod RC Auto', bestDealDelta: -27.06, intensity: 0.75 },
    { state: 'MD', region: 'Northeast', avgDiscount: 35.5, sightingCount: 25, bestDeal: 'Henderson RC', bestDealDelta: -35.38, intensity: 0.82 },
    { state: 'IN', region: 'Midwest', avgDiscount: 36.9, sightingCount: 16, bestDeal: 'Caitlin Clark RC', bestDealDelta: -38.71, intensity: 0.84 },
    { state: 'MN', region: 'Midwest', avgDiscount: 31.2, sightingCount: 14, bestDeal: 'Ant Edwards RC', bestDealDelta: -32.93, intensity: 0.76 },
    { state: 'TN', region: 'Southeast', avgDiscount: 44.1, sightingCount: 11, bestDeal: 'Hyatt RC PSA 10', bestDealDelta: -57.14, intensity: 0.96 },
    { state: 'MO', region: 'Midwest', avgDiscount: 27.5, sightingCount: 13, bestDeal: 'Witt Jr RC', bestDealDelta: -29.17, intensity: 0.68 },
  ];
}

export function getSwarmLeaderboard(): SwarmLeaderboard[] {
  return mockSwarmNodes
    .sort((a, b) => b.reputation - a.reputation)
    .map((n, i) => ({
      rank: i + 1,
      userId: n.userId,
      alias: n.alias,
      totalSightings: n.totalSightings,
      verifiedSightings: n.verifiedSightings,
      accuracy: n.accuracy * 100,
      rewardsEarned: n.rewardsEarned,
      tier: n.reputation >= 92 ? 'legend' as const : n.reputation >= 88 ? 'elite' as const : n.reputation >= 84 ? 'hunter' as const : n.reputation >= 80 ? 'tracker' as const : 'scout' as const,
      region: n.region,
      streak: Math.floor(Math.random() * 30) + 5,
    }));
}

export function getMyReputation(): SwarmReputation {
  return {
    userId: 'current-user',
    alias: 'YourAlias',
    overallScore: 87,
    accuracyRate: 0.89,
    totalSightings: 52,
    verifiedSightings: 44,
    rank: 14,
    tier: 'hunter',
    badges: [
      { name: 'First Sighting', icon: 'eye', earnedAt: '2025-09-01' },
      { name: '50 Club', icon: 'award', earnedAt: '2026-02-15' },
      { name: 'Sharp Eye', icon: 'target', earnedAt: '2026-01-20' },
      { name: 'Card Show Regular', icon: 'map-pin', earnedAt: '2026-03-01' },
      { name: 'Streak Master', icon: 'flame', earnedAt: '2026-03-10' },
    ],
    streakDays: 12,
    rewardsEarned: 640,
    monthlySightings: 18,
  };
}

export function getRewards(): ContributionReward[] {
  return [
    { id: 'rw-1', type: 'sighting', description: 'Reported Wembanyama RC at Houston card show', points: 15, earnedAt: '2026-03-15T09:15:00Z', status: 'claimed' },
    { id: 'rw-2', type: 'verification', description: 'Verified 5 sightings today', points: 25, earnedAt: '2026-03-15T10:00:00Z', status: 'pending' },
    { id: 'rw-3', type: 'streak', description: '10-day reporting streak bonus', points: 50, earnedAt: '2026-03-14T00:00:00Z', status: 'claimed' },
    { id: 'rw-4', type: 'milestone', description: 'Reached 50 total sightings', points: 100, earnedAt: '2026-03-12T14:20:00Z', status: 'claimed' },
    { id: 'rw-5', type: 'referral', description: 'Referred MN_Wolves_Fan to swarm', points: 75, earnedAt: '2026-03-10T11:00:00Z', status: 'claimed' },
    { id: 'rw-6', type: 'sighting', description: 'High-value Trout RC sighting verified', points: 30, earnedAt: '2026-03-09T16:45:00Z', status: 'claimed' },
    { id: 'rw-7', type: 'verification', description: 'Verified rare estate sale find', points: 20, earnedAt: '2026-03-08T12:00:00Z', status: 'expired' },
  ];
}

export function getRealWorldVsOnline(): RealWorldVsOnline[] {
  return [
    { category: 'Baseball RCs', realWorldAvg: 82, onlineAvg: 118, delta: -36, deltaPercent: -30.5, sampleSize: 48 },
    { category: 'Football RCs', realWorldAvg: 94, onlineAvg: 138, delta: -44, deltaPercent: -31.9, sampleSize: 35 },
    { category: 'Basketball RCs', realWorldAvg: 102, onlineAvg: 155, delta: -53, deltaPercent: -34.2, sampleSize: 41 },
    { category: 'PSA 10s', realWorldAvg: 215, onlineAvg: 305, delta: -90, deltaPercent: -29.5, sampleSize: 28 },
    { category: 'BGS 9.5s', realWorldAvg: 148, onlineAvg: 210, delta: -62, deltaPercent: -29.5, sampleSize: 19 },
    { category: 'Raw Cards', realWorldAvg: 35, onlineAvg: 58, delta: -23, deltaPercent: -39.7, sampleSize: 62 },
    { category: 'Autos', realWorldAvg: 178, onlineAvg: 262, delta: -84, deltaPercent: -32.1, sampleSize: 22 },
    { category: 'Vintage (Pre-1990)', realWorldAvg: 320, onlineAvg: 425, delta: -105, deltaPercent: -24.7, sampleSize: 14 },
  ];
}

export function getNearbyDeals(lat: number, lng: number, radius: number): PriceSighting[] {
  return sightingsStore.filter(s => {
    const dLat = s.location.lat - lat;
    const dLng = s.location.lng - lng;
    const distMiles = Math.sqrt(dLat * dLat + dLng * dLng) * 69;
    return distMiles <= radius;
  }).sort((a, b) => a.arbitrageDelta - b.arbitrageDelta);
}

export function getGeoClusters(): GeoPriceCluster[] {
  return [
    { id: 'gc-1', region: 'Chicago Metro', state: 'IL', avgPrice: 185, sightingCount: 42, topPlayer: 'Shohei Ohtani', priceVsNational: -8.2, lat: 41.88, lng: -87.63 },
    { id: 'gc-2', region: 'SoCal', state: 'CA', avgPrice: 210, sightingCount: 35, topPlayer: 'Justin Herbert', priceVsNational: 4.3, lat: 34.05, lng: -118.24 },
    { id: 'gc-3', region: 'DFW / Houston', state: 'TX', avgPrice: 165, sightingCount: 28, topPlayer: 'Victor Wembanyama', priceVsNational: -12.1, lat: 30.27, lng: -97.74 },
    { id: 'gc-4', region: 'Tri-State', state: 'NY', avgPrice: 225, sightingCount: 38, topPlayer: 'Kodai Senga', priceVsNational: 11.8, lat: 40.71, lng: -74.01 },
    { id: 'gc-5', region: 'Ohio Valley', state: 'OH', avgPrice: 155, sightingCount: 31, topPlayer: 'Elly De La Cruz', priceVsNational: -15.4, lat: 39.96, lng: -83.00 },
    { id: 'gc-6', region: 'Pacific NW', state: 'WA', avgPrice: 195, sightingCount: 19, topPlayer: 'Julio Rodriguez', priceVsNational: -2.8, lat: 47.61, lng: -122.33 },
    { id: 'gc-7', region: 'South Florida', state: 'FL', avgPrice: 140, sightingCount: 22, topPlayer: 'Juan Soto', priceVsNational: -22.6, lat: 25.76, lng: -80.19 },
    { id: 'gc-8', region: 'Mid-Atlantic', state: 'MD', avgPrice: 170, sightingCount: 25, topPlayer: 'Gunnar Henderson', priceVsNational: -6.5, lat: 39.29, lng: -76.61 },
  ];
}
