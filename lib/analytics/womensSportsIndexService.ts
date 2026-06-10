// Phase 140: Women's Sports & Emerging Market Index
// Comprehensive market tracking for women's sports cards, emerging leagues, and investment opportunities

// ---- Types ----

export type WomensSport =
  | 'wnba'
  | 'nwsl'
  | 'wta'
  | 'lpga'
  | 'olympics'
  | 'volleyball'
  | 'softball'
  | 'hockey';

export type MarketIndex = 'bull' | 'bear' | 'stable' | 'breakout' | 'emerging';

export interface AthleteCard {
  id: string;
  name: string;
  sport: WomensSport;
  team: string;
  position: string;
  cardSet: string;
  year: number;
  currentValue: number;
  previousValue: number;
  peakValue: number;
  growthPercent: number;
  volume: number;
  rookie: boolean;
  autograph: boolean;
  numbered: boolean;
  serialNumber?: string;
  marketIndex: MarketIndex;
  popularity: number;
}

export interface GrowthMetric {
  id: string;
  category: string;
  sport: WomensSport;
  currentValue: number;
  previousValue: number;
  growthPercent: number;
  period: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export interface MarketComparison {
  id: string;
  sport: WomensSport;
  sportLabel: string;
  avgCardValue: number;
  totalMarketCap: number;
  yearOverYearGrowth: number;
  topAthlete: string;
  topAthleteValue: number;
  activeListings: number;
  avgDaysToSell: number;
}

export interface EmergingMarket {
  id: string;
  name: string;
  sport: WomensSport;
  region: string;
  growthRate: number;
  marketSize: number;
  keyAthletes: string[];
  riskLevel: 'low' | 'medium' | 'high';
  entryPoint: number;
  description: string;
}

export interface InvestmentSignal {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'watch';
  sport: WomensSport;
  athlete: string;
  reason: string;
  confidence: number;
  priceTarget: number;
  currentPrice: number;
  timeframe: string;
  createdAt: string;
}

export interface HistoricalMilestone {
  id: string;
  date: string;
  sport: WomensSport;
  title: string;
  description: string;
  marketImpact: number;
  athlete?: string;
  significance: 'high' | 'medium' | 'landmark';
}

export interface LeagueProfile {
  id: string;
  sport: WomensSport;
  leagueName: string;
  founded: number;
  teams: number;
  avgAttendance: number;
  tvDeal: number;
  cardMarketCap: number;
  growthRate: number;
  topCard: string;
  topCardValue: number;
  recentHighlight: string;
}

export interface CollectorDemographic {
  id: string;
  segment: string;
  percentage: number;
  avgSpend: number;
  preferredSport: WomensSport;
  ageRange: string;
  growthRate: number;
  description: string;
}

export interface CrossoverEvent {
  id: string;
  name: string;
  sport: WomensSport;
  date: string;
  type: 'media' | 'endorsement' | 'record' | 'cultural' | 'expansion' | 'broadcast' | 'rivalry' | 'international';
  marketImpact: number;
  athlete?: string;
  description: string;
}

export interface InvestableIndex {
  id: string;
  name: string;
  sports: WomensSport[];
  currentValue: number;
  previousValue: number;
  allTimeHigh: number;
  constituents: number;
  yearToDateReturn: number;
  volatility: number;
  description: string;
}

// ---- Storage Helpers ----

const STORAGE_KEY = 'msi_womens_sports_index';

function loadData<T>(key: string): T | null {
  try {
    return store.get(`${STORAGE_KEY}_${key}`, null);
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    store.set(`${STORAGE_KEY}_${key}`, data);
  } catch {
    // Storage full or unavailable
  }
}

// ---- Helpers ----

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function getSportConfig(sport: WomensSport): { label: string; text: string; bg: string; border: string } {
  switch (sport) {
    case 'wnba': return { label: 'WNBA', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    case 'nwsl': return { label: 'NWSL', text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'wta': return { label: 'WTA', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
    case 'lpga': return { label: 'LPGA', text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' };
    case 'olympics': return { label: 'Olympics', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    case 'volleyball': return { label: 'Volleyball', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    case 'softball': return { label: 'Softball', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    case 'hockey': return { label: 'Hockey', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    default: return { label: sport, text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
  }
}

// ---- Mock Data: League Profiles (8) ----

const MOCK_LEAGUE_PROFILES: LeagueProfile[] = [
  { id: 'lp-1', sport: 'wnba', leagueName: 'WNBA', founded: 1996, teams: 13, avgAttendance: 9850, tvDeal: 200_000_000, cardMarketCap: 85_000_000, growthRate: 340, topCard: 'Caitlin Clark Rookie Prizm Auto', topCardValue: 4500, recentHighlight: 'Record-breaking 2024 season attendance and viewership' },
  { id: 'lp-2', sport: 'nwsl', leagueName: 'NWSL', founded: 2012, teams: 14, avgAttendance: 11200, tvDeal: 240_000_000, cardMarketCap: 42_000_000, growthRate: 520, topCard: 'Trinity Rodman Rookie Auto', topCardValue: 1800, recentHighlight: 'Bay FC and Utah Royals expansion driving massive growth' },
  { id: 'lp-3', sport: 'wta', leagueName: 'WTA Tour', founded: 1973, teams: 0, avgAttendance: 0, tvDeal: 525_000_000, cardMarketCap: 120_000_000, growthRate: 180, topCard: 'Iga Swiatek Championship Auto', topCardValue: 2200, recentHighlight: 'Saudi Arabia partnership expanding global reach' },
  { id: 'lp-4', sport: 'lpga', leagueName: 'LPGA Tour', founded: 1950, teams: 0, avgAttendance: 0, tvDeal: 150_000_000, cardMarketCap: 38_000_000, growthRate: 145, topCard: 'Nelly Korda Major Champion Auto', topCardValue: 1650, recentHighlight: 'Nelly Korda five consecutive wins breaking records' },
  { id: 'lp-5', sport: 'olympics', leagueName: 'Olympic Women\'s Sports', founded: 1900, teams: 0, avgAttendance: 0, tvDeal: 0, cardMarketCap: 95_000_000, growthRate: 290, topCard: 'Simone Biles Gold Medal Auto', topCardValue: 3800, recentHighlight: 'Paris 2024 women\'s events most-watched in Olympic history' },
  { id: 'lp-6', sport: 'volleyball', leagueName: 'Pro Volleyball Federation', founded: 2023, teams: 10, avgAttendance: 5400, tvDeal: 30_000_000, cardMarketCap: 18_000_000, growthRate: 410, topCard: 'Jordan Thompson Rookie Auto', topCardValue: 850, recentHighlight: 'PVF inaugural season exceeded all projections' },
  { id: 'lp-7', sport: 'softball', leagueName: 'Athletes Unlimited Softball', founded: 2020, teams: 0, avgAttendance: 3200, tvDeal: 15_000_000, cardMarketCap: 12_000_000, growthRate: 380, topCard: 'Rachel Garcia Rookie Auto', topCardValue: 620, recentHighlight: 'Softball returning to 2028 LA Olympics driving interest' },
  { id: 'lp-8', sport: 'hockey', leagueName: 'PWHL', founded: 2023, teams: 6, avgAttendance: 6800, tvDeal: 25_000_000, cardMarketCap: 22_000_000, growthRate: 165, topCard: 'Marie-Philip Poulin Inaugural Auto', topCardValue: 920, recentHighlight: 'First PWHL season selling out venues across North America' },
];

// ---- Mock Data: Athlete Cards (52) ----

const MOCK_ATHLETE_CARDS: AthleteCard[] = [
  // WNBA (12 cards)
  { id: 'ac-1', name: 'Caitlin Clark', sport: 'wnba', team: 'Indiana Fever', position: 'Guard', cardSet: 'Panini Prizm', year: 2024, currentValue: 4500, previousValue: 1200, peakValue: 5200, growthPercent: 275, volume: 14500, rookie: true, autograph: true, numbered: true, serialNumber: '/25', marketIndex: 'breakout', popularity: 99 },
  { id: 'ac-2', name: 'Angel Reese', sport: 'wnba', team: 'Chicago Sky', position: 'Forward', cardSet: 'Panini Select', year: 2024, currentValue: 2800, previousValue: 850, peakValue: 3100, growthPercent: 229, volume: 11200, rookie: true, autograph: true, numbered: true, serialNumber: '/50', marketIndex: 'breakout', popularity: 96 },
  { id: 'ac-3', name: "A'ja Wilson", sport: 'wnba', team: 'Las Vegas Aces', position: 'Forward', cardSet: 'Panini Prizm', year: 2022, currentValue: 3200, previousValue: 1800, peakValue: 3500, growthPercent: 78, volume: 8900, rookie: false, autograph: true, numbered: true, serialNumber: '/10', marketIndex: 'bull', popularity: 95 },
  { id: 'ac-4', name: 'Breanna Stewart', sport: 'wnba', team: 'New York Liberty', position: 'Forward', cardSet: 'Panini Chronicles', year: 2023, currentValue: 1950, previousValue: 1100, peakValue: 2200, growthPercent: 77, volume: 6200, rookie: false, autograph: true, numbered: false, marketIndex: 'bull', popularity: 90 },
  { id: 'ac-5', name: 'Cameron Brink', sport: 'wnba', team: 'Los Angeles Sparks', position: 'Forward', cardSet: 'Panini Prizm', year: 2024, currentValue: 1650, previousValue: 580, peakValue: 1900, growthPercent: 184, volume: 7800, rookie: true, autograph: true, numbered: true, serialNumber: '/99', marketIndex: 'breakout', popularity: 88 },
  { id: 'ac-6', name: 'Sabrina Ionescu', sport: 'wnba', team: 'New York Liberty', position: 'Guard', cardSet: 'Panini Optic', year: 2020, currentValue: 1400, previousValue: 920, peakValue: 1800, growthPercent: 52, volume: 5100, rookie: false, autograph: true, numbered: false, marketIndex: 'bull', popularity: 87 },
  { id: 'ac-7', name: 'Kelsey Plum', sport: 'wnba', team: 'Las Vegas Aces', position: 'Guard', cardSet: 'Panini Select', year: 2022, currentValue: 980, previousValue: 620, peakValue: 1100, growthPercent: 58, volume: 4200, rookie: false, autograph: true, numbered: false, marketIndex: 'stable', popularity: 82 },
  { id: 'ac-8', name: 'Paige Bueckers', sport: 'wnba', team: 'Dallas Wings', position: 'Guard', cardSet: 'Panini Prizm', year: 2025, currentValue: 2100, previousValue: 0, peakValue: 2100, growthPercent: 0, volume: 9500, rookie: true, autograph: true, numbered: true, serialNumber: '/50', marketIndex: 'emerging', popularity: 94 },
  { id: 'ac-9', name: 'Alyssa Thomas', sport: 'wnba', team: 'Connecticut Sun', position: 'Forward', cardSet: 'Panini Chronicles', year: 2023, currentValue: 650, previousValue: 380, peakValue: 720, growthPercent: 71, volume: 2800, rookie: false, autograph: true, numbered: false, marketIndex: 'stable', popularity: 75 },
  { id: 'ac-10', name: 'Napheesa Collier', sport: 'wnba', team: 'Minnesota Lynx', position: 'Forward', cardSet: 'Panini Prizm', year: 2023, currentValue: 880, previousValue: 440, peakValue: 950, growthPercent: 100, volume: 3600, rookie: false, autograph: true, numbered: false, marketIndex: 'bull', popularity: 80 },
  { id: 'ac-11', name: 'Rickea Jackson', sport: 'wnba', team: 'Los Angeles Sparks', position: 'Forward', cardSet: 'Panini Prizm', year: 2024, currentValue: 720, previousValue: 280, peakValue: 800, growthPercent: 157, volume: 4100, rookie: true, autograph: false, numbered: true, serialNumber: '/199', marketIndex: 'breakout', popularity: 76 },
  { id: 'ac-12', name: 'Aaliyah Edwards', sport: 'wnba', team: 'Washington Mystics', position: 'Forward', cardSet: 'Panini Select', year: 2024, currentValue: 520, previousValue: 200, peakValue: 580, growthPercent: 160, volume: 3200, rookie: true, autograph: false, numbered: false, marketIndex: 'emerging', popularity: 72 },

  // NWSL (8 cards)
  { id: 'ac-13', name: 'Sophia Smith', sport: 'nwsl', team: 'Portland Thorns', position: 'Forward', cardSet: 'Panini Prizm', year: 2023, currentValue: 1200, previousValue: 420, peakValue: 1350, growthPercent: 186, volume: 5800, rookie: false, autograph: true, numbered: true, serialNumber: '/75', marketIndex: 'bull', popularity: 89 },
  { id: 'ac-14', name: 'Trinity Rodman', sport: 'nwsl', team: 'Washington Spirit', position: 'Forward', cardSet: 'Panini Select', year: 2022, currentValue: 1800, previousValue: 550, peakValue: 2000, growthPercent: 227, volume: 7200, rookie: false, autograph: true, numbered: true, serialNumber: '/50', marketIndex: 'breakout', popularity: 91 },
  { id: 'ac-15', name: 'Mallory Swanson', sport: 'nwsl', team: 'Chicago Red Stars', position: 'Forward', cardSet: 'Panini Chronicles', year: 2023, currentValue: 850, previousValue: 380, peakValue: 920, growthPercent: 124, volume: 3900, rookie: false, autograph: true, numbered: false, marketIndex: 'bull', popularity: 83 },
  { id: 'ac-16', name: 'Naomi Girma', sport: 'nwsl', team: 'San Diego Wave', position: 'Defender', cardSet: 'Panini Prizm', year: 2023, currentValue: 1050, previousValue: 310, peakValue: 1150, growthPercent: 239, volume: 5200, rookie: false, autograph: true, numbered: true, serialNumber: '/99', marketIndex: 'breakout', popularity: 86 },
  { id: 'ac-17', name: 'Lindsey Horan', sport: 'nwsl', team: 'Olympique Lyon', position: 'Midfielder', cardSet: 'Panini Select', year: 2022, currentValue: 680, previousValue: 350, peakValue: 780, growthPercent: 94, volume: 2800, rookie: false, autograph: true, numbered: false, marketIndex: 'stable', popularity: 78 },
  { id: 'ac-18', name: 'Rose Lavelle', sport: 'nwsl', team: 'NJ/NY Gotham FC', position: 'Midfielder', cardSet: 'Panini Prizm', year: 2022, currentValue: 720, previousValue: 480, peakValue: 850, growthPercent: 50, volume: 3100, rookie: false, autograph: true, numbered: false, marketIndex: 'stable', popularity: 80 },
  { id: 'ac-19', name: 'Catarina Macario', sport: 'nwsl', team: 'Portland Thorns', position: 'Forward', cardSet: 'Panini Chronicles', year: 2023, currentValue: 580, previousValue: 220, peakValue: 650, growthPercent: 164, volume: 2400, rookie: false, autograph: false, numbered: true, serialNumber: '/149', marketIndex: 'emerging', popularity: 74 },
  { id: 'ac-20', name: 'Croix Bethune', sport: 'nwsl', team: 'Washington Spirit', position: 'Midfielder', cardSet: 'Panini Prizm', year: 2024, currentValue: 480, previousValue: 150, peakValue: 520, growthPercent: 220, volume: 3600, rookie: true, autograph: true, numbered: false, marketIndex: 'breakout', popularity: 73 },

  // WTA (8 cards)
  { id: 'ac-21', name: 'Iga Swiatek', sport: 'wta', team: 'Poland', position: 'Singles', cardSet: 'Topps Chrome', year: 2022, currentValue: 2200, previousValue: 1100, peakValue: 2500, growthPercent: 100, volume: 6800, rookie: false, autograph: true, numbered: true, serialNumber: '/25', marketIndex: 'bull', popularity: 93 },
  { id: 'ac-22', name: 'Coco Gauff', sport: 'wta', team: 'USA', position: 'Singles', cardSet: 'Topps Finest', year: 2023, currentValue: 1850, previousValue: 720, peakValue: 2100, growthPercent: 157, volume: 7500, rookie: false, autograph: true, numbered: true, serialNumber: '/50', marketIndex: 'breakout', popularity: 92 },
  { id: 'ac-23', name: 'Aryna Sabalenka', sport: 'wta', team: 'Belarus', position: 'Singles', cardSet: 'Topps Chrome', year: 2023, currentValue: 1500, previousValue: 680, peakValue: 1700, growthPercent: 121, volume: 5100, rookie: false, autograph: true, numbered: false, marketIndex: 'bull', popularity: 88 },
  { id: 'ac-24', name: 'Elena Rybakina', sport: 'wta', team: 'Kazakhstan', position: 'Singles', cardSet: 'Topps Finest', year: 2023, currentValue: 980, previousValue: 420, peakValue: 1100, growthPercent: 133, volume: 3500, rookie: false, autograph: true, numbered: false, marketIndex: 'bull', popularity: 79 },
  { id: 'ac-25', name: 'Jessica Pegula', sport: 'wta', team: 'USA', position: 'Singles', cardSet: 'Topps Chrome', year: 2023, currentValue: 680, previousValue: 350, peakValue: 750, growthPercent: 94, volume: 2800, rookie: false, autograph: true, numbered: false, marketIndex: 'stable', popularity: 74 },
  { id: 'ac-26', name: 'Mirra Andreeva', sport: 'wta', team: 'Russia', position: 'Singles', cardSet: 'Topps Chrome', year: 2024, currentValue: 1100, previousValue: 280, peakValue: 1200, growthPercent: 293, volume: 4800, rookie: true, autograph: true, numbered: true, serialNumber: '/99', marketIndex: 'breakout', popularity: 85 },
  { id: 'ac-27', name: 'Jasmine Paolini', sport: 'wta', team: 'Italy', position: 'Singles', cardSet: 'Topps Finest', year: 2024, currentValue: 750, previousValue: 180, peakValue: 820, growthPercent: 317, volume: 3200, rookie: false, autograph: true, numbered: false, marketIndex: 'breakout', popularity: 77 },
  { id: 'ac-28', name: 'Qinwen Zheng', sport: 'wta', team: 'China', position: 'Singles', cardSet: 'Topps Chrome', year: 2024, currentValue: 920, previousValue: 250, peakValue: 1000, growthPercent: 268, volume: 4200, rookie: false, autograph: true, numbered: true, serialNumber: '/75', marketIndex: 'breakout', popularity: 81 },

  // LPGA (6 cards)
  { id: 'ac-29', name: 'Nelly Korda', sport: 'lpga', team: 'USA', position: 'Golfer', cardSet: 'Upper Deck SP', year: 2023, currentValue: 1650, previousValue: 780, peakValue: 1900, growthPercent: 112, volume: 4800, rookie: false, autograph: true, numbered: true, serialNumber: '/25', marketIndex: 'bull', popularity: 90 },
  { id: 'ac-30', name: 'Jin Young Ko', sport: 'lpga', team: 'South Korea', position: 'Golfer', cardSet: 'Upper Deck SP', year: 2022, currentValue: 1100, previousValue: 650, peakValue: 1250, growthPercent: 69, volume: 3200, rookie: false, autograph: true, numbered: false, marketIndex: 'stable', popularity: 82 },
  { id: 'ac-31', name: 'Lilia Vu', sport: 'lpga', team: 'USA', position: 'Golfer', cardSet: 'Upper Deck SP', year: 2023, currentValue: 780, previousValue: 320, peakValue: 880, growthPercent: 144, volume: 2800, rookie: false, autograph: true, numbered: true, serialNumber: '/99', marketIndex: 'bull', popularity: 76 },
  { id: 'ac-32', name: 'Rose Zhang', sport: 'lpga', team: 'USA', position: 'Golfer', cardSet: 'Upper Deck SP', year: 2024, currentValue: 920, previousValue: 250, peakValue: 980, growthPercent: 268, volume: 4200, rookie: true, autograph: true, numbered: true, serialNumber: '/50', marketIndex: 'breakout', popularity: 84 },
  { id: 'ac-33', name: 'Lydia Ko', sport: 'lpga', team: 'New Zealand', position: 'Golfer', cardSet: 'Upper Deck SP', year: 2022, currentValue: 850, previousValue: 520, peakValue: 950, growthPercent: 63, volume: 2400, rookie: false, autograph: true, numbered: false, marketIndex: 'stable', popularity: 78 },
  { id: 'ac-34', name: 'Celine Boutier', sport: 'lpga', team: 'France', position: 'Golfer', cardSet: 'Upper Deck SP', year: 2023, currentValue: 550, previousValue: 280, peakValue: 620, growthPercent: 96, volume: 1800, rookie: false, autograph: false, numbered: false, marketIndex: 'emerging', popularity: 68 },

  // Olympics (6 cards)
  { id: 'ac-35', name: 'Simone Biles', sport: 'olympics', team: 'USA Gymnastics', position: 'All-Around', cardSet: 'Topps Chrome Olympic', year: 2024, currentValue: 3800, previousValue: 2200, peakValue: 4200, growthPercent: 73, volume: 9200, rookie: false, autograph: true, numbered: true, serialNumber: '/10', marketIndex: 'bull', popularity: 98 },
  { id: 'ac-36', name: 'Sydney McLaughlin-Levrone', sport: 'olympics', team: 'USA Track', position: '400m Hurdles', cardSet: 'Topps Finest Olympic', year: 2024, currentValue: 2100, previousValue: 950, peakValue: 2400, growthPercent: 121, volume: 5800, rookie: false, autograph: true, numbered: true, serialNumber: '/50', marketIndex: 'bull', popularity: 91 },
  { id: 'ac-37', name: "Sha'Carri Richardson", sport: 'olympics', team: 'USA Track', position: '100m', cardSet: 'Topps Chrome Olympic', year: 2024, currentValue: 1450, previousValue: 580, peakValue: 1700, growthPercent: 150, volume: 6500, rookie: false, autograph: true, numbered: false, marketIndex: 'breakout', popularity: 89 },
  { id: 'ac-38', name: 'Katie Ledecky', sport: 'olympics', team: 'USA Swimming', position: 'Distance Freestyle', cardSet: 'Topps Finest Olympic', year: 2024, currentValue: 1800, previousValue: 1100, peakValue: 2000, growthPercent: 64, volume: 4200, rookie: false, autograph: true, numbered: true, serialNumber: '/25', marketIndex: 'stable', popularity: 88 },
  { id: 'ac-39', name: 'Rebeca Andrade', sport: 'olympics', team: 'Brazil Gymnastics', position: 'Floor/Vault', cardSet: 'Topps Chrome Olympic', year: 2024, currentValue: 950, previousValue: 280, peakValue: 1050, growthPercent: 239, volume: 3800, rookie: false, autograph: true, numbered: true, serialNumber: '/75', marketIndex: 'breakout', popularity: 84 },
  { id: 'ac-40', name: 'Julien Alfred', sport: 'olympics', team: 'Saint Lucia Track', position: '100m', cardSet: 'Topps Finest Olympic', year: 2024, currentValue: 680, previousValue: 0, peakValue: 780, growthPercent: 0, volume: 2900, rookie: true, autograph: true, numbered: true, serialNumber: '/99', marketIndex: 'emerging', popularity: 75 },

  // Volleyball (4 cards)
  { id: 'ac-41', name: 'Jordan Thompson', sport: 'volleyball', team: 'USA Volleyball', position: 'Outside Hitter', cardSet: 'Panini Prizm', year: 2024, currentValue: 850, previousValue: 180, peakValue: 920, growthPercent: 372, volume: 4100, rookie: true, autograph: true, numbered: true, serialNumber: '/50', marketIndex: 'breakout', popularity: 82 },
  { id: 'ac-42', name: 'Kathryn Plummer', sport: 'volleyball', team: 'USA Volleyball', position: 'Outside Hitter', cardSet: 'Panini Select', year: 2024, currentValue: 520, previousValue: 120, peakValue: 580, growthPercent: 333, volume: 2600, rookie: true, autograph: true, numbered: false, marketIndex: 'breakout', popularity: 74 },
  { id: 'ac-43', name: 'Andrea Drews', sport: 'volleyball', team: 'USA Volleyball', position: 'Opposite Hitter', cardSet: 'Panini Prizm', year: 2024, currentValue: 380, previousValue: 95, peakValue: 420, growthPercent: 300, volume: 1800, rookie: false, autograph: false, numbered: true, serialNumber: '/149', marketIndex: 'emerging', popularity: 68 },
  { id: 'ac-44', name: 'Gabi', sport: 'volleyball', team: 'Brazil Volleyball', position: 'Outside Hitter', cardSet: 'Panini Select', year: 2024, currentValue: 450, previousValue: 110, peakValue: 500, growthPercent: 309, volume: 2200, rookie: false, autograph: true, numbered: false, marketIndex: 'breakout', popularity: 71 },

  // Softball (4 cards)
  { id: 'ac-45', name: 'Rachel Garcia', sport: 'softball', team: 'USA Softball', position: 'Pitcher', cardSet: 'Panini Prizm', year: 2024, currentValue: 620, previousValue: 150, peakValue: 680, growthPercent: 313, volume: 2800, rookie: true, autograph: true, numbered: true, serialNumber: '/75', marketIndex: 'breakout', popularity: 76 },
  { id: 'ac-46', name: 'Jocelyn Alo', sport: 'softball', team: 'Athletes Unlimited', position: 'First Base', cardSet: 'Panini Select', year: 2023, currentValue: 480, previousValue: 130, peakValue: 540, growthPercent: 269, volume: 2200, rookie: false, autograph: true, numbered: false, marketIndex: 'bull', popularity: 73 },
  { id: 'ac-47', name: 'Montana Fouts', sport: 'softball', team: 'Athletes Unlimited', position: 'Pitcher', cardSet: 'Panini Prizm', year: 2024, currentValue: 350, previousValue: 90, peakValue: 390, growthPercent: 289, volume: 1600, rookie: true, autograph: false, numbered: true, serialNumber: '/199', marketIndex: 'emerging', popularity: 69 },
  { id: 'ac-48', name: 'Haylie McCleney', sport: 'softball', team: 'USA Softball', position: 'Outfielder', cardSet: 'Panini Chronicles', year: 2023, currentValue: 280, previousValue: 85, peakValue: 320, growthPercent: 229, volume: 1200, rookie: false, autograph: true, numbered: false, marketIndex: 'stable', popularity: 64 },

  // Hockey (4 cards)
  { id: 'ac-49', name: 'Marie-Philip Poulin', sport: 'hockey', team: 'Montreal PWHL', position: 'Center', cardSet: 'Upper Deck SP', year: 2024, currentValue: 920, previousValue: 380, peakValue: 1000, growthPercent: 142, volume: 3800, rookie: false, autograph: true, numbered: true, serialNumber: '/50', marketIndex: 'bull', popularity: 83 },
  { id: 'ac-50', name: 'Hilary Knight', sport: 'hockey', team: 'Boston PWHL', position: 'Forward', cardSet: 'Upper Deck SP', year: 2024, currentValue: 680, previousValue: 290, peakValue: 750, growthPercent: 134, volume: 2800, rookie: false, autograph: true, numbered: false, marketIndex: 'bull', popularity: 79 },
  { id: 'ac-51', name: 'Sarah Nurse', sport: 'hockey', team: 'Toronto PWHL', position: 'Forward', cardSet: 'Upper Deck SP', year: 2024, currentValue: 520, previousValue: 180, peakValue: 580, growthPercent: 189, volume: 2200, rookie: false, autograph: true, numbered: true, serialNumber: '/99', marketIndex: 'breakout', popularity: 75 },
  { id: 'ac-52', name: 'Brianne Jenner', sport: 'hockey', team: 'Ottawa PWHL', position: 'Forward', cardSet: 'Upper Deck SP', year: 2024, currentValue: 420, previousValue: 160, peakValue: 480, growthPercent: 163, volume: 1800, rookie: false, autograph: true, numbered: false, marketIndex: 'emerging', popularity: 70 },
];

// ---- Mock Data: Growth Metrics (12) ----

const MOCK_GROWTH_METRICS: GrowthMetric[] = [
  { id: 'gm-1', category: 'Card Sales Volume', sport: 'wnba', currentValue: 85000000, previousValue: 22000000, growthPercent: 286, period: '2024 vs 2023', trend: 'up', description: 'WNBA card sales exploded after Caitlin Clark draft' },
  { id: 'gm-2', category: 'New Collectors', sport: 'nwsl', currentValue: 340000, previousValue: 62000, growthPercent: 448, period: '2024 vs 2023', trend: 'up', description: 'NWSL attracting younger and more diverse collector base' },
  { id: 'gm-3', category: 'Average Card Value', sport: 'wta', currentValue: 285, previousValue: 145, growthPercent: 97, period: '2024 vs 2023', trend: 'up', description: 'WTA cards gaining recognition as undervalued assets' },
  { id: 'gm-4', category: 'Graded Submissions', sport: 'wnba', currentValue: 125000, previousValue: 18000, growthPercent: 594, period: '2024 vs 2023', trend: 'up', description: 'PSA and BGS seeing unprecedented women\'s sports submissions' },
  { id: 'gm-5', category: 'Social Media Mentions', sport: 'nwsl', currentValue: 2800000, previousValue: 850000, growthPercent: 229, period: 'Q4 2024 vs Q4 2023', trend: 'up', description: 'NWSL card culture growing rapidly on social platforms' },
  { id: 'gm-6', category: 'Auction Prices Realized', sport: 'olympics', currentValue: 95000000, previousValue: 38000000, growthPercent: 150, period: '2024 Paris vs 2021 Tokyo', trend: 'up', description: 'Olympic women\'s cards hitting record auction prices' },
  { id: 'gm-7', category: 'Retail Distribution', sport: 'volleyball', currentValue: 4200, previousValue: 800, growthPercent: 425, period: '2024 vs 2023', trend: 'up', description: 'Volleyball cards now carried in major retail chains' },
  { id: 'gm-8', category: 'International Demand', sport: 'wta', currentValue: 48000000, previousValue: 22000000, growthPercent: 118, period: '2024 vs 2023', trend: 'up', description: 'European and Asian markets driving WTA card demand' },
  { id: 'gm-9', category: 'Rookie Card Premiums', sport: 'wnba', currentValue: 680, previousValue: 120, growthPercent: 467, period: 'Avg premium % 2024 vs 2023', trend: 'up', description: 'WNBA rookie premiums now rivaling NBA rookie premiums' },
  { id: 'gm-10', category: 'TV Viewership Impact', sport: 'lpga', currentValue: 1850000, previousValue: 1200000, growthPercent: 54, period: 'Avg viewers 2024 vs 2023', trend: 'up', description: 'LPGA viewership increases correlating with card sales' },
  { id: 'gm-11', category: 'Cross-Sport Collecting', sport: 'softball', currentValue: 156000, previousValue: 42000, growthPercent: 271, period: '2024 vs 2023', trend: 'up', description: 'Softball cards benefiting from Olympic reinstatement hype' },
  { id: 'gm-12', category: 'League Partnership Deals', sport: 'hockey', currentValue: 25000000, previousValue: 8000000, growthPercent: 213, period: 'PWHL 2024 vs launch', trend: 'up', description: 'PWHL securing major card manufacturer partnerships' },
];

// ---- Mock Data: Emerging Markets (6) ----

const MOCK_EMERGING_MARKETS: EmergingMarket[] = [
  { id: 'em-1', name: 'PWHL Inaugural Market', sport: 'hockey', region: 'North America', growthRate: 420, marketSize: 22000000, keyAthletes: ['Marie-Philip Poulin', 'Hilary Knight', 'Sarah Nurse'], riskLevel: 'medium', entryPoint: 50, description: 'Professional Women\'s Hockey League creating first-ever dedicated women\'s hockey card market' },
  { id: 'em-2', name: 'Pro Volleyball Federation', sport: 'volleyball', region: 'North America', growthRate: 510, marketSize: 18000000, keyAthletes: ['Jordan Thompson', 'Kathryn Plummer', 'Andrea Drews'], riskLevel: 'high', entryPoint: 25, description: 'New professional volleyball league with massive upside potential but uncertain longevity' },
  { id: 'em-3', name: 'NWSL Expansion Markets', sport: 'nwsl', region: 'North America', growthRate: 380, marketSize: 42000000, keyAthletes: ['Trinity Rodman', 'Sophia Smith', 'Naomi Girma'], riskLevel: 'low', entryPoint: 75, description: 'NWSL expanding to new cities, driving regional card demand and new collector bases' },
  { id: 'em-4', name: 'Asian WTA Market', sport: 'wta', region: 'Asia Pacific', growthRate: 290, marketSize: 35000000, keyAthletes: ['Qinwen Zheng', 'Iga Swiatek', 'Coco Gauff'], riskLevel: 'low', entryPoint: 100, description: 'Chinese and Japanese tennis markets rapidly adopting Western card collecting culture' },
  { id: 'em-5', name: 'Olympic Comeback Sports', sport: 'softball', region: 'Global', growthRate: 450, marketSize: 12000000, keyAthletes: ['Rachel Garcia', 'Jocelyn Alo', 'Montana Fouts'], riskLevel: 'medium', entryPoint: 30, description: 'Softball\'s return to 2028 Olympics creating sustained card market growth' },
  { id: 'em-6', name: 'European Women\'s Football', sport: 'nwsl', region: 'Europe', growthRate: 340, marketSize: 28000000, keyAthletes: ['Lindsey Horan', 'Catarina Macario', 'Mallory Swanson'], riskLevel: 'medium', entryPoint: 60, description: 'UEFA Women\'s Champions League popularity spilling into card collecting' },
];

// ---- Mock Data: Investment Signals (10) ----

const MOCK_INVESTMENT_SIGNALS: InvestmentSignal[] = [
  { id: 'is-1', type: 'buy', sport: 'wnba', athlete: 'Paige Bueckers', reason: 'Top draft pick entering league with massive college following and marketing potential', confidence: 92, priceTarget: 3500, currentPrice: 2100, timeframe: '6-12 months', createdAt: '2026-02-15T10:00:00Z' },
  { id: 'is-2', type: 'buy', sport: 'nwsl', athlete: 'Naomi Girma', reason: 'Best defender in the world, undervalued relative to offensive players, World Cup catalyst', confidence: 88, priceTarget: 1800, currentPrice: 1050, timeframe: '12 months', createdAt: '2026-02-20T14:30:00Z' },
  { id: 'is-3', type: 'hold', sport: 'wnba', athlete: 'Caitlin Clark', reason: 'Already priced at premium but continued performance and media presence supports valuation', confidence: 85, priceTarget: 5000, currentPrice: 4500, timeframe: '6 months', createdAt: '2026-03-01T09:00:00Z' },
  { id: 'is-4', type: 'buy', sport: 'wta', athlete: 'Mirra Andreeva', reason: 'Teenage prodigy with generational talent, cards still accessible before potential Grand Slam win', confidence: 90, priceTarget: 2200, currentPrice: 1100, timeframe: '12-18 months', createdAt: '2026-03-05T11:00:00Z' },
  { id: 'is-5', type: 'sell', sport: 'wta', athlete: 'Jessica Pegula', reason: 'Career peak likely reached, limited upside with younger stars emerging', confidence: 72, priceTarget: 500, currentPrice: 680, timeframe: '6 months', createdAt: '2026-03-08T16:00:00Z' },
  { id: 'is-6', type: 'buy', sport: 'volleyball', athlete: 'Jordan Thompson', reason: 'PVF growing rapidly, Thompson as face of league could see 3x returns', confidence: 78, priceTarget: 2000, currentPrice: 850, timeframe: '12-24 months', createdAt: '2026-03-10T08:30:00Z' },
  { id: 'is-7', type: 'watch', sport: 'lpga', athlete: 'Rose Zhang', reason: 'Monitoring for major championship breakthrough to trigger buy signal', confidence: 80, priceTarget: 1500, currentPrice: 920, timeframe: '6 months', createdAt: '2026-03-12T13:00:00Z' },
  { id: 'is-8', type: 'buy', sport: 'olympics', athlete: 'Rebeca Andrade', reason: 'Brazilian market expanding, Olympic hero status driving international demand', confidence: 82, priceTarget: 1600, currentPrice: 950, timeframe: '12 months', createdAt: '2026-02-28T10:15:00Z' },
  { id: 'is-9', type: 'hold', sport: 'hockey', athlete: 'Marie-Philip Poulin', reason: 'PWHL growing but market still stabilizing, hold position and reassess', confidence: 75, priceTarget: 1200, currentPrice: 920, timeframe: '6-12 months', createdAt: '2026-03-06T15:00:00Z' },
  { id: 'is-10', type: 'buy', sport: 'softball', athlete: 'Rachel Garcia', reason: 'LA 2028 Olympics narrative will drive softball card prices significantly higher', confidence: 86, priceTarget: 1200, currentPrice: 620, timeframe: '18-24 months', createdAt: '2026-03-14T09:45:00Z' },
];

// ---- Mock Data: Historical Milestones (15) ----

const MOCK_HISTORICAL_MILESTONES: HistoricalMilestone[] = [
  { id: 'hm-1', date: '2024-04-15', sport: 'wnba', title: 'Caitlin Clark Draft Night', description: 'Caitlin Clark selected #1 overall by Indiana Fever, card market surges 500% overnight', marketImpact: 500, athlete: 'Caitlin Clark', significance: 'landmark' },
  { id: 'hm-2', date: '2024-07-28', sport: 'olympics', title: 'Simone Biles Paris Gold', description: 'Simone Biles wins all-around gold in Paris, cementing GOAT status and driving card prices', marketImpact: 180, athlete: 'Simone Biles', significance: 'landmark' },
  { id: 'hm-3', date: '2024-06-15', sport: 'wnba', title: 'Clark-Reese Rivalry Game', description: 'Indiana vs Chicago draws 2.3 million viewers, largest WNBA audience in 23 years', marketImpact: 320, athlete: 'Caitlin Clark', significance: 'landmark' },
  { id: 'hm-4', date: '2024-04-20', sport: 'nwsl', title: 'NWSL Record Attendance', description: 'San Diego Wave set NWSL single-game attendance record with 32,000 fans', marketImpact: 85, significance: 'high' },
  { id: 'hm-5', date: '2024-01-01', sport: 'hockey', title: 'PWHL Inaugural Season', description: 'Professional Women\'s Hockey League launches with six teams across North America', marketImpact: 165, significance: 'landmark' },
  { id: 'hm-6', date: '2024-06-02', sport: 'wta', title: 'Swiatek French Open Defense', description: 'Iga Swiatek wins fourth French Open title, cards appreciate 40% in tournament week', marketImpact: 120, athlete: 'Iga Swiatek', significance: 'high' },
  { id: 'hm-7', date: '2024-04-14', sport: 'lpga', title: 'Korda Five Consecutive Wins', description: 'Nelly Korda achieves five consecutive LPGA victories, historic achievement drives card demand', marketImpact: 145, athlete: 'Nelly Korda', significance: 'landmark' },
  { id: 'hm-8', date: '2024-08-03', sport: 'olympics', title: 'McLaughlin-Levrone World Record', description: 'Sydney McLaughlin-Levrone breaks own world record in 400m hurdles at Paris Olympics', marketImpact: 150, athlete: 'Sydney McLaughlin-Levrone', significance: 'landmark' },
  { id: 'hm-9', date: '2023-11-01', sport: 'nwsl', title: 'NWSL $240M TV Deal', description: 'NWSL secures landmark television deal, validating league as major professional sport', marketImpact: 200, significance: 'landmark' },
  { id: 'hm-10', date: '2024-02-10', sport: 'volleyball', title: 'PVF League Launch', description: 'Pro Volleyball Federation debuts as first major US pro volleyball league', marketImpact: 410, significance: 'landmark' },
  { id: 'hm-11', date: '2024-09-07', sport: 'wta', title: 'Gauff US Open Defense', description: 'Coco Gauff defends US Open title, becoming youngest back-to-back champion in decades', marketImpact: 95, athlete: 'Coco Gauff', significance: 'high' },
  { id: 'hm-12', date: '2024-06-22', sport: 'wnba', title: "A'ja Wilson MVP Season", description: "A'ja Wilson posts historic stat line, considered greatest individual WNBA season ever", marketImpact: 110, athlete: "A'ja Wilson", significance: 'high' },
  { id: 'hm-13', date: '2025-06-01', sport: 'softball', title: '2028 Olympic Confirmation', description: 'IOC confirms softball format for 2028 LA Olympics, market anticipation builds', marketImpact: 280, significance: 'high' },
  { id: 'hm-14', date: '2024-03-24', sport: 'wnba', title: 'NCAA Women\'s Final Record', description: 'Iowa vs LSU rematch draws 18.9 million viewers, most-watched basketball game in ESPN history', marketImpact: 450, athlete: 'Caitlin Clark', significance: 'landmark' },
  { id: 'hm-15', date: '2024-11-15', sport: 'hockey', title: 'PWHL Walter Cup Finals', description: 'First-ever PWHL championship series draws sellout crowds and strong TV ratings', marketImpact: 130, significance: 'high' },
];

// ---- Mock Data: Collector Demographics (8) ----

const MOCK_COLLECTOR_DEMOGRAPHICS: CollectorDemographic[] = [
  { id: 'cd-1', segment: 'Young Female Collectors', percentage: 28, avgSpend: 185, preferredSport: 'wnba', ageRange: '18-25', growthRate: 520, description: 'Fastest growing segment, driven by social media and athlete relatability' },
  { id: 'cd-2', segment: 'Crossover Sports Fans', percentage: 22, avgSpend: 340, preferredSport: 'olympics', ageRange: '25-35', growthRate: 280, description: 'Existing male sports card collectors expanding into women\'s sports' },
  { id: 'cd-3', segment: 'Soccer/Football Enthusiasts', percentage: 15, avgSpend: 220, preferredSport: 'nwsl', ageRange: '20-30', growthRate: 410, description: 'Global football fans discovering NWSL and women\'s soccer cards' },
  { id: 'cd-4', segment: 'Investment-Focused Collectors', percentage: 12, avgSpend: 890, preferredSport: 'wnba', ageRange: '30-45', growthRate: 195, description: 'Treating women\'s sports cards as undervalued investment opportunities' },
  { id: 'cd-5', segment: 'Tennis Purists', percentage: 8, avgSpend: 420, preferredSport: 'wta', ageRange: '35-50', growthRate: 120, description: 'Long-time tennis fans with established collecting habits' },
  { id: 'cd-6', segment: 'Olympic Memorabilia Collectors', percentage: 7, avgSpend: 550, preferredSport: 'olympics', ageRange: '30-55', growthRate: 150, description: 'Collectors focused on Olympic moments and patriotic themes' },
  { id: 'cd-7', segment: 'Family Collectors', percentage: 5, avgSpend: 150, preferredSport: 'volleyball', ageRange: '30-45', growthRate: 340, description: 'Parents and children collecting together, drawn to volleyball and softball' },
  { id: 'cd-8', segment: 'International Collectors', percentage: 3, avgSpend: 310, preferredSport: 'wta', ageRange: '25-40', growthRate: 260, description: 'European and Asian collectors entering the market through WTA and Olympic cards' },
];

// ---- Mock Data: Crossover Events (8) ----

const MOCK_CROSSOVER_EVENTS: CrossoverEvent[] = [
  { id: 'ce-1', name: 'Caitlin Clark Nike Deal', sport: 'wnba', date: '2024-04-18', type: 'endorsement', marketImpact: 340, athlete: 'Caitlin Clark', description: 'Nike signs Caitlin Clark to record-breaking endorsement deal, all cards surge' },
  { id: 'ce-2', name: 'WNBA All-Star 3-Point Contest', sport: 'wnba', date: '2024-07-20', type: 'media', marketImpact: 180, athlete: 'Sabrina Ionescu', description: 'Sabrina Ionescu vs Steph Curry 3-point shootout becomes viral cultural moment' },
  { id: 'ce-3', name: 'Trinity Rodman Magazine Cover', sport: 'nwsl', date: '2024-05-15', type: 'cultural', marketImpact: 120, athlete: 'Trinity Rodman', description: 'Trinity Rodman featured on Sports Illustrated cover, crossing into mainstream' },
  { id: 'ce-4', name: 'Biles Perfect 10 Return', sport: 'olympics', date: '2024-07-30', type: 'record', marketImpact: 250, athlete: 'Simone Biles', description: 'Simone Biles scores perfect 10 in Paris, historic moment drives global card frenzy' },
  { id: 'ce-5', name: 'PWHL ESPN Partnership', sport: 'hockey', date: '2024-03-01', type: 'broadcast', marketImpact: 165, description: 'PWHL secures ESPN broadcast deal, dramatically increasing visibility and card demand' },
  { id: 'ce-6', name: 'Clark vs Reese Rivalry', sport: 'wnba', date: '2024-06-01', type: 'rivalry', marketImpact: 420, athlete: 'Caitlin Clark', description: 'Clark-Reese rivalry becomes most compelling storyline in all of sports' },
  { id: 'ce-7', name: 'NWSL London Expansion', sport: 'nwsl', date: '2025-10-01', type: 'expansion', marketImpact: 280, description: 'NWSL announces first international expansion team in London' },
  { id: 'ce-8', name: 'Swiatek Asian Tour Dominance', sport: 'wta', date: '2024-10-15', type: 'international', marketImpact: 140, athlete: 'Iga Swiatek', description: 'Swiatek sweeps Asian swing, opening massive new collector markets in region' },
];

// ---- Mock Data: Investable Indices ----

const MOCK_INVESTABLE_INDICES: InvestableIndex[] = [
  { id: 'ii-1', name: 'WSI Total Market Index', sports: ['wnba', 'nwsl', 'wta', 'lpga', 'olympics', 'volleyball', 'softball', 'hockey'], currentValue: 1842, previousValue: 580, allTimeHigh: 1950, constituents: 52, yearToDateReturn: 217.6, volatility: 28.5, description: 'Comprehensive index tracking all women\'s sports card markets' },
  { id: 'ii-2', name: 'WSI Basketball Index', sports: ['wnba'], currentValue: 2450, previousValue: 650, allTimeHigh: 2680, constituents: 12, yearToDateReturn: 276.9, volatility: 35.2, description: 'WNBA-focused index driven by Clark, Reese, and Wilson' },
  { id: 'ii-3', name: 'WSI Emerging Sports Index', sports: ['volleyball', 'softball', 'hockey'], currentValue: 890, previousValue: 180, allTimeHigh: 920, constituents: 12, yearToDateReturn: 394.4, volatility: 42.8, description: 'High-growth emerging women\'s sports leagues index' },
  { id: 'ii-4', name: 'WSI Global Tennis & Golf Index', sports: ['wta', 'lpga'], currentValue: 1320, previousValue: 620, allTimeHigh: 1400, constituents: 14, yearToDateReturn: 112.9, volatility: 18.4, description: 'Individual women\'s sports with established international markets' },
  { id: 'ii-5', name: 'WSI Olympic Champions Index', sports: ['olympics'], currentValue: 1680, previousValue: 720, allTimeHigh: 1800, constituents: 6, yearToDateReturn: 133.3, volatility: 22.1, description: 'Elite Olympic athletes with proven medal-winning records' },
];

// ---- Service Functions ----

export function getMarketIndices(): InvestableIndex[] {
  const cached = loadData<InvestableIndex[]>('market_indices');
  if (cached) return cached;
  saveData('market_indices', MOCK_INVESTABLE_INDICES);
  return MOCK_INVESTABLE_INDICES;
}

export function getAthleteCards(): AthleteCard[] {
  const cached = loadData<AthleteCard[]>('athlete_cards');
  if (cached) return cached;
  saveData('athlete_cards', MOCK_ATHLETE_CARDS);
  return MOCK_ATHLETE_CARDS;
}

export function getGrowthMetrics(): GrowthMetric[] {
  const cached = loadData<GrowthMetric[]>('growth_metrics');
  if (cached) return cached;
  saveData('growth_metrics', MOCK_GROWTH_METRICS);
  return MOCK_GROWTH_METRICS;
}

export function getTopPerformers(limit: number = 10): AthleteCard[] {
  const cards = getAthleteCards();
  return cards
    .sort((a, b) => b.growthPercent - a.growthPercent)
    .slice(0, limit);
}

export function getEmergingMarkets(): EmergingMarket[] {
  const cached = loadData<EmergingMarket[]>('emerging_markets');
  if (cached) return cached;
  saveData('emerging_markets', MOCK_EMERGING_MARKETS);
  return MOCK_EMERGING_MARKETS;
}

export function getInvestmentSignals(): InvestmentSignal[] {
  const cached = loadData<InvestmentSignal[]>('investment_signals');
  if (cached) return cached;
  saveData('investment_signals', MOCK_INVESTMENT_SIGNALS);
  return MOCK_INVESTMENT_SIGNALS;
}

export function getHistoricalMilestones(): HistoricalMilestone[] {
  const cached = loadData<HistoricalMilestone[]>('historical_milestones');
  if (cached) return cached;
  saveData('historical_milestones', MOCK_HISTORICAL_MILESTONES);
  return MOCK_HISTORICAL_MILESTONES;
}

export function getLeagueProfiles(): LeagueProfile[] {
  const cached = loadData<LeagueProfile[]>('league_profiles');
  if (cached) return cached;
  saveData('league_profiles', MOCK_LEAGUE_PROFILES);
  return MOCK_LEAGUE_PROFILES;
}

export function getMarketComparison(): MarketComparison[] {
  const leagues = getLeagueProfiles();
  const cards = getAthleteCards();

  return leagues.map(league => {
    const sportCards = cards.filter(c => c.sport === league.sport);
    const avgValue = sportCards.length > 0
      ? sportCards.reduce((sum, c) => sum + c.currentValue, 0) / sportCards.length
      : 0;
    const topCard = sportCards.sort((a, b) => b.currentValue - a.currentValue)[0];

    return {
      id: `mc-${league.sport}`,
      sport: league.sport,
      sportLabel: league.leagueName,
      avgCardValue: Math.round(avgValue),
      totalMarketCap: league.cardMarketCap,
      yearOverYearGrowth: league.growthRate,
      topAthlete: topCard?.name || 'N/A',
      topAthleteValue: topCard?.currentValue || 0,
      activeListings: Math.floor(Math.random() * 5000) + 1000,
      avgDaysToSell: Math.floor(Math.random() * 10) + 2,
    };
  });
}

export function getCrossoverEvents(): CrossoverEvent[] {
  const cached = loadData<CrossoverEvent[]>('crossover_events');
  if (cached) return cached;
  saveData('crossover_events', MOCK_CROSSOVER_EVENTS);
  return MOCK_CROSSOVER_EVENTS;
}

export function getCollectorDemographics(): CollectorDemographic[] {
  const cached = loadData<CollectorDemographic[]>('collector_demographics');
  if (cached) return cached;
  saveData('collector_demographics', MOCK_COLLECTOR_DEMOGRAPHICS);
  return MOCK_COLLECTOR_DEMOGRAPHICS;
}

export function getInvestableIndex(id: string): InvestableIndex | null {
  const indices = getMarketIndices();
  return indices.find(i => i.id === id) || null;
}

export function calculateGrowthRate(currentValue: number, previousValue: number): number {
  if (previousValue === 0) return 0;
  return Math.round(((currentValue - previousValue) / previousValue) * 100 * 10) / 10;
}

import { store } from '../dal/syncStore';
export function getMarketCapByLeague(): Record<WomensSport, number> {
  const leagues = getLeagueProfiles();
  const result: Record<string, number> = {};
  for (const league of leagues) {
    result[league.sport] = league.cardMarketCap;
  }
  return result as Record<WomensSport, number>;
}
