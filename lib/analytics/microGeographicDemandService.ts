// Micro-Geographic Demand Heatmap — Phase 228
// Zip-code level buyer concentration mapping with regional trend analysis

export interface GeoHotspot {
  id: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  buyerDensity: number;
  avgSpend: number;
  topPlayers: string[];
  topCategories: string[];
  growthRate: number;
  heatLevel: 'extreme' | 'high' | 'moderate' | 'low';
}

export interface RegionalTrend {
  id: string;
  region: string;
  states: string[];
  trendingPlayers: { player: string; demandIndex: number; localPremium: number }[];
  marketSize: number;
  yoyGrowth: number;
  dominantSport: string;
  uniqueInsight: string;
}

export interface ArbitrageLane {
  id: string;
  fromRegion: string;
  toRegion: string;
  player: string;
  card: string;
  priceDiff: number;
  priceDiffPct: number;
  avgDaysToSell: number;
  confidence: number;
}

export interface LocalEventImpact {
  id: string;
  event: string;
  city: string;
  date: string;
  type: 'card-show' | 'game' | 'draft' | 'hall-of-fame' | 'convention';
  expectedDemandSpike: number;
  affectedPlayers: string[];
  radius: string;
}

const MOCK_HOTSPOTS: GeoHotspot[] = [
  { id: 'gh-1', city: 'Dallas', state: 'TX', zipCode: '75201', lat: 32.78, lng: -96.80, buyerDensity: 94, avgSpend: 720, topPlayers: ['Caleb Williams', 'Luka Doncic', 'CeeDee Lamb'], topCategories: ['NFL', 'NBA', 'modern rookies'], growthRate: 18.5, heatLevel: 'extreme' },
  { id: 'gh-2', city: 'Los Angeles', state: 'CA', zipCode: '90012', lat: 34.05, lng: -118.24, buyerDensity: 91, avgSpend: 890, topPlayers: ['Shohei Ohtani', 'LeBron James', 'Mookie Betts'], topCategories: ['MLB', 'NBA', 'high-end graded'], growthRate: 12.3, heatLevel: 'extreme' },
  { id: 'gh-3', city: 'New York', state: 'NY', zipCode: '10001', lat: 40.75, lng: -73.99, buyerDensity: 88, avgSpend: 1050, topPlayers: ['Aaron Judge', 'Jalen Brunson', 'Saquon Barkley'], topCategories: ['MLB', 'NBA', 'vintage'], growthRate: 8.7, heatLevel: 'high' },
  { id: 'gh-4', city: 'Chicago', state: 'IL', zipCode: '60601', lat: 41.88, lng: -87.63, buyerDensity: 82, avgSpend: 580, topPlayers: ['Caleb Williams', 'Michael Jordan', 'Anthony Rizzo'], topCategories: ['NFL', 'NBA vintage', 'MLB'], growthRate: 22.1, heatLevel: 'high' },
  { id: 'gh-5', city: 'Phoenix', state: 'AZ', zipCode: '85001', lat: 33.45, lng: -112.07, buyerDensity: 76, avgSpend: 420, topPlayers: ['Kevin Durant', 'Corbin Carroll', 'Kyler Murray'], topCategories: ['NBA', 'MLB', 'football'], growthRate: 31.4, heatLevel: 'high' },
  { id: 'gh-6', city: 'Miami', state: 'FL', zipCode: '33101', lat: 25.76, lng: -80.19, buyerDensity: 71, avgSpend: 650, topPlayers: ['Lionel Messi', 'Bam Adebayo', 'Jazz Chisholm'], topCategories: ['Soccer', 'NBA', 'international'], growthRate: 28.6, heatLevel: 'high' },
  { id: 'gh-7', city: 'Philadelphia', state: 'PA', zipCode: '19101', lat: 39.95, lng: -75.17, buyerDensity: 68, avgSpend: 490, topPlayers: ['Bryce Harper', 'Joel Embiid', 'Jalen Hurts'], topCategories: ['MLB', 'NBA', 'NFL'], growthRate: 15.2, heatLevel: 'moderate' },
  { id: 'gh-8', city: 'Cooperstown', state: 'NY', zipCode: '13326', lat: 42.70, lng: -74.92, buyerDensity: 95, avgSpend: 2100, topPlayers: ['Mickey Mantle', 'Willie Mays', 'Babe Ruth'], topCategories: ['vintage', 'HOF', 'pre-war'], growthRate: 5.4, heatLevel: 'extreme' },
];

const MOCK_REGIONAL_TRENDS: RegionalTrend[] = [
  { id: 'rt-1', region: 'Sun Belt', states: ['TX', 'AZ', 'FL', 'GA', 'NC'], trendingPlayers: [{ player: 'Caleb Williams', demandIndex: 92, localPremium: 8 }, { player: 'Bryce Young', demandIndex: 74, localPremium: 12 }], marketSize: 8400000, yoyGrowth: 22.4, dominantSport: 'NFL', uniqueInsight: 'Population migration driving new collector base. Sun Belt NFL demand outpaces national average by 35%.' },
  { id: 'rt-2', region: 'Northeast Corridor', states: ['NY', 'NJ', 'CT', 'MA', 'PA'], trendingPlayers: [{ player: 'Aaron Judge', demandIndex: 88, localPremium: 15 }, { player: 'Jalen Brunson', demandIndex: 81, localPremium: 11 }], marketSize: 12000000, yoyGrowth: 6.8, dominantSport: 'MLB', uniqueInsight: 'Mature market with highest per-capita spending. Vintage and graded premiums significantly above national average.' },
  { id: 'rt-3', region: 'Pacific Coast', states: ['CA', 'OR', 'WA'], trendingPlayers: [{ player: 'Shohei Ohtani', demandIndex: 96, localPremium: 22 }, { player: 'LeBron James', demandIndex: 85, localPremium: 5 }], marketSize: 9800000, yoyGrowth: 14.1, dominantSport: 'MLB', uniqueInsight: 'Ohtani effect: Japanese-American collector crossover creating unique demand premium in Pacific Coast metros.' },
  { id: 'rt-4', region: 'Midwest Heartland', states: ['OH', 'IN', 'MI', 'WI', 'MN'], trendingPlayers: [{ player: 'Anthony Edwards', demandIndex: 82, localPremium: 7 }, { player: 'Joe Burrow', demandIndex: 79, localPremium: 18 }], marketSize: 5600000, yoyGrowth: 11.3, dominantSport: 'NFL', uniqueInsight: 'Card show culture strongest in nation. In-person transaction premium of 8-12% persists vs. online.' },
];

const MOCK_ARBITRAGE_LANES: ArbitrageLane[] = [
  { id: 'al-1', fromRegion: 'Midwest', toRegion: 'Pacific Coast', player: 'Shohei Ohtani', card: '2018 Topps Update RC PSA 10', priceDiff: 85, priceDiffPct: 18.2, avgDaysToSell: 3, confidence: 89 },
  { id: 'al-2', fromRegion: 'Pacific Coast', toRegion: 'Sun Belt', player: 'Caleb Williams', card: '2024 Prizm RC Silver', priceDiff: 28, priceDiffPct: 14.5, avgDaysToSell: 5, confidence: 82 },
  { id: 'al-3', fromRegion: 'Northeast', toRegion: 'Midwest', player: 'Anthony Edwards', card: '2020 Prizm RC PSA 10', priceDiff: 42, priceDiffPct: 11.8, avgDaysToSell: 7, confidence: 76 },
  { id: 'al-4', fromRegion: 'Sun Belt', toRegion: 'Northeast', player: 'Aaron Judge', card: '2017 Topps Chrome RC PSA 10', priceDiff: 65, priceDiffPct: 9.2, avgDaysToSell: 4, confidence: 91 },
];

const MOCK_LOCAL_EVENTS: LocalEventImpact[] = [
  { id: 'le-1', event: 'The National Card Show', city: 'Cleveland', date: '2026-07-22', type: 'card-show', expectedDemandSpike: 340, affectedPlayers: ['All Categories'], radius: '500 miles' },
  { id: 'le-2', event: 'NFL Draft 2026', city: 'Green Bay', date: '2026-04-24', type: 'draft', expectedDemandSpike: 185, affectedPlayers: ['Draft prospects', 'Caleb Williams', 'Shedeur Sanders'], radius: '200 miles' },
  { id: 'le-3', event: 'HOF Induction Weekend', city: 'Cooperstown', date: '2026-07-26', type: 'hall-of-fame', expectedDemandSpike: 220, affectedPlayers: ['2026 HOF Class'], radius: '150 miles' },
];

export function getHotspots(): GeoHotspot[] { return [...MOCK_HOTSPOTS]; }
export function getRegionalTrends(): RegionalTrend[] { return [...MOCK_REGIONAL_TRENDS]; }
export function getArbitrageLanes(): ArbitrageLane[] { return [...MOCK_ARBITRAGE_LANES]; }
export function getLocalEvents(): LocalEventImpact[] { return [...MOCK_LOCAL_EVENTS]; }

export default { getHotspots, getRegionalTrends, getArbitrageLanes, getLocalEvents };
