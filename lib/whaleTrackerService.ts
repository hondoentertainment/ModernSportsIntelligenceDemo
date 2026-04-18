// Whale Tracker Service
// Tracks large collector movements and accumulation/distribution patterns

export interface WhaleActivity {
  id: string;
  whaleId: string;
  whaleName: string;
  activityType: "accumulation" | "distribution" | "swap" | "grading_submission";
  cardName: string;
  playerName: string;
  quantity: number;
  estimatedValue: number;
  date: string;
  platform: string;
  confidence: number;
  significance: "low" | "medium" | "high" | "critical";
}

export interface AccumulationPattern {
  id: string;
  whaleId: string;
  whaleName: string;
  targetCard: string;
  playerName: string;
  totalAcquired: number;
  totalSpent: number;
  avgPrice: number;
  startDate: string;
  lastActivity: string;
  patternType: "steady_accumulation" | "aggressive_buying" | "dip_buying" | "distribution" | "rotation";
  completionEstimate: number;
  priceImpact: number;
}

export interface WhaleProfile {
  id: string;
  alias: string;
  estimatedPortfolioValue: number;
  primaryFocus: string[];
  tradingStyle: string;
  avgTransactionSize: number;
  activityFrequency: string;
  winRate: number;
  avgHoldPeriod: number;
  lastSeen: string;
  tier: "mega" | "major" | "mid" | "emerging";
  knownPositions: { card: string; estimatedQty: number; estimatedValue: number }[];
}

export interface WhaleHistory {
  id: string;
  whaleId: string;
  month: string;
  totalBuys: number;
  totalSells: number;
  netFlow: number;
  topAcquisition: string;
  topDisposal: string;
  portfolioChange: number;
}

const mockActivities: WhaleActivity[] = [
  { id: "wa1", whaleId: "wp1", whaleName: "The GOAT Collector", activityType: "accumulation", cardName: "1986 Fleer Jordan #57 PSA 9", playerName: "Michael Jordan", quantity: 3, estimatedValue: 96000, date: "2026-04-15", platform: "Private Sale", confidence: 92, significance: "critical" },
  { id: "wa2", whaleId: "wp2", whaleName: "Silicon Valley Slab King", activityType: "accumulation", cardName: "2018 Prizm Luka Doncic Silver PSA 10", playerName: "Luka Doncic", quantity: 8, estimatedValue: 33600, date: "2026-04-14", platform: "eBay", confidence: 85, significance: "high" },
  { id: "wa3", whaleId: "wp3", whaleName: "Wall Street Wax", activityType: "distribution", cardName: "2019 Prizm Zion Williamson Silver PSA 10", playerName: "Zion Williamson", quantity: 15, estimatedValue: 4200, date: "2026-04-13", platform: "COMC", confidence: 78, significance: "high" },
  { id: "wa4", whaleId: "wp4", whaleName: "The Registry Hunter", activityType: "accumulation", cardName: "1952 Topps Mantle #311 PSA 6", playerName: "Mickey Mantle", quantity: 1, estimatedValue: 285000, date: "2026-04-12", platform: "Heritage Auctions", confidence: 95, significance: "critical" },
  { id: "wa5", whaleId: "wp5", whaleName: "Draft Day Danny", activityType: "swap", cardName: "2024 Prizm Caleb Williams Silver PSA 10", playerName: "Caleb Williams", quantity: 25, estimatedValue: 2125, date: "2026-04-11", platform: "StockX", confidence: 72, significance: "medium" },
  { id: "wa6", whaleId: "wp1", whaleName: "The GOAT Collector", activityType: "grading_submission", cardName: "1986 Fleer Jordan #57 Raw", playerName: "Michael Jordan", quantity: 5, estimatedValue: 75000, date: "2026-04-10", platform: "PSA", confidence: 88, significance: "high" },
  { id: "wa7", whaleId: "wp6", whaleName: "International Card Baron", activityType: "accumulation", cardName: "2022 Topps Chrome UCL Bellingham RC", playerName: "Jude Bellingham", quantity: 20, estimatedValue: 18000, date: "2026-04-09", platform: "eBay UK", confidence: 68, significance: "medium" },
  { id: "wa8", whaleId: "wp2", whaleName: "Silicon Valley Slab King", activityType: "accumulation", cardName: "2023 Prizm Wembanyama Silver PSA 10", playerName: "Victor Wembanyama", quantity: 12, estimatedValue: 8160, date: "2026-04-08", platform: "Alt Marketplace", confidence: 82, significance: "high" },
  { id: "wa9", whaleId: "wp7", whaleName: "The Prospect Maven", activityType: "distribution", cardName: "2023 Bowman Chrome Various 1st Autos", playerName: "Multiple Prospects", quantity: 45, estimatedValue: 12600, date: "2026-04-07", platform: "Blowout Forums", confidence: 75, significance: "medium" },
  { id: "wa10", whaleId: "wp8", whaleName: "Patch Monster", activityType: "accumulation", cardName: "2023 National Treasures LeBron Patch Auto /25", playerName: "LeBron James", quantity: 2, estimatedValue: 24000, date: "2026-04-15", platform: "Goldin Auctions", confidence: 90, significance: "high" }
];

const mockPatterns: AccumulationPattern[] = [
  { id: "ap1", whaleId: "wp1", whaleName: "The GOAT Collector", targetCard: "1986 Fleer Jordan #57 PSA 9", playerName: "Michael Jordan", totalAcquired: 18, totalSpent: 576000, avgPrice: 32000, startDate: "2025-06-01", lastActivity: "2026-04-15", patternType: "steady_accumulation", completionEstimate: 75, priceImpact: 8.5 },
  { id: "ap2", whaleId: "wp2", whaleName: "Silicon Valley Slab King", targetCard: "2018 Prizm Luka Doncic Silver PSA 10", playerName: "Luka Doncic", totalAcquired: 35, totalSpent: 147000, avgPrice: 4200, startDate: "2025-09-15", lastActivity: "2026-04-14", patternType: "dip_buying", completionEstimate: 60, priceImpact: 12.2 },
  { id: "ap3", whaleId: "wp3", whaleName: "Wall Street Wax", targetCard: "2019 Prizm Zion Williamson Silver PSA 10", playerName: "Zion Williamson", totalAcquired: 0, totalSpent: 0, avgPrice: 0, startDate: "2026-03-01", lastActivity: "2026-04-13", patternType: "distribution", completionEstimate: 40, priceImpact: -15.8 },
  { id: "ap4", whaleId: "wp4", whaleName: "The Registry Hunter", targetCard: "1952 Topps Mantle #311 High Grade", playerName: "Mickey Mantle", totalAcquired: 4, totalSpent: 920000, avgPrice: 230000, startDate: "2024-01-01", lastActivity: "2026-04-12", patternType: "steady_accumulation", completionEstimate: 90, priceImpact: 5.2 },
  { id: "ap5", whaleId: "wp6", whaleName: "International Card Baron", targetCard: "2022 Topps Chrome UCL Bellingham RC", playerName: "Jude Bellingham", totalAcquired: 85, totalSpent: 76500, avgPrice: 900, startDate: "2025-11-01", lastActivity: "2026-04-09", patternType: "aggressive_buying", completionEstimate: 55, priceImpact: 22.5 },
  { id: "ap6", whaleId: "wp5", whaleName: "Draft Day Danny", targetCard: "2024 Prizm Caleb Williams Silver PSA 10", playerName: "Caleb Williams", totalAcquired: 120, totalSpent: 10200, avgPrice: 85, startDate: "2025-12-01", lastActivity: "2026-04-11", patternType: "rotation", completionEstimate: 30, priceImpact: 6.8 }
];

const mockProfiles: WhaleProfile[] = [
  { id: "wp1", alias: "The GOAT Collector", estimatedPortfolioValue: 12500000, primaryFocus: ["Michael Jordan", "Vintage Basketball", "HOF Players"], tradingStyle: "Long-term accumulator", avgTransactionSize: 32000, activityFrequency: "Weekly", winRate: 82, avgHoldPeriod: 1825, lastSeen: "2026-04-15", tier: "mega", knownPositions: [{ card: "1986 Fleer Jordan #57 PSA 9", estimatedQty: 18, estimatedValue: 576000 }, { card: "1986 Fleer Jordan #57 PSA 10", estimatedQty: 2, estimatedValue: 840000 }] },
  { id: "wp2", alias: "Silicon Valley Slab King", estimatedPortfolioValue: 4800000, primaryFocus: ["Modern Basketball", "NBA Rookies", "Tech-Adjacent Athletes"], tradingStyle: "Momentum dip buyer", avgTransactionSize: 4200, activityFrequency: "Daily", winRate: 68, avgHoldPeriod: 365, lastSeen: "2026-04-14", tier: "major", knownPositions: [{ card: "2018 Prizm Luka Doncic Silver PSA 10", estimatedQty: 35, estimatedValue: 147000 }, { card: "2023 Prizm Wembanyama Silver PSA 10", estimatedQty: 12, estimatedValue: 8160 }] },
  { id: "wp3", alias: "Wall Street Wax", estimatedPortfolioValue: 3200000, primaryFocus: ["Modern Basketball", "Modern Football", "Index Approach"], tradingStyle: "Tactical trader", avgTransactionSize: 1800, activityFrequency: "Daily", winRate: 71, avgHoldPeriod: 180, lastSeen: "2026-04-13", tier: "major", knownPositions: [{ card: "Various Modern Slabs", estimatedQty: 450, estimatedValue: 810000 }] },
  { id: "wp4", alias: "The Registry Hunter", estimatedPortfolioValue: 28000000, primaryFocus: ["Pre-War Baseball", "T206", "1952 Topps", "Registry Sets"], tradingStyle: "Patient set builder", avgTransactionSize: 85000, activityFrequency: "Monthly", winRate: 91, avgHoldPeriod: 3650, lastSeen: "2026-04-12", tier: "mega", knownPositions: [{ card: "1952 Topps Mantle #311 PSA 6+", estimatedQty: 4, estimatedValue: 920000 }, { card: "T206 Honus Wagner PSA 2", estimatedQty: 1, estimatedValue: 3200000 }] },
  { id: "wp5", alias: "Draft Day Danny", estimatedPortfolioValue: 850000, primaryFocus: ["NFL Rookies", "NBA Draft", "First Year Cards"], tradingStyle: "High volume flipper", avgTransactionSize: 85, activityFrequency: "Hourly", winRate: 55, avgHoldPeriod: 45, lastSeen: "2026-04-11", tier: "mid", knownPositions: [{ card: "2024 Prizm Various Rookies", estimatedQty: 2500, estimatedValue: 212500 }] },
  { id: "wp6", alias: "International Card Baron", estimatedPortfolioValue: 2100000, primaryFocus: ["Soccer/Football", "International Sports", "F1 Cards"], tradingStyle: "Global arbitrage specialist", avgTransactionSize: 900, activityFrequency: "Daily", winRate: 74, avgHoldPeriod: 270, lastSeen: "2026-04-09", tier: "major", knownPositions: [{ card: "2022 Topps Chrome UCL Various RCs", estimatedQty: 200, estimatedValue: 180000 }] },
  { id: "wp7", alias: "The Prospect Maven", estimatedPortfolioValue: 1500000, primaryFocus: ["Bowman 1st Chromes", "MLB Prospects", "International Signings"], tradingStyle: "Early speculator / distributor", avgTransactionSize: 280, activityFrequency: "Daily", winRate: 48, avgHoldPeriod: 120, lastSeen: "2026-04-07", tier: "mid", knownPositions: [{ card: "2023-2025 Bowman Chrome 1st Autos", estimatedQty: 800, estimatedValue: 224000 }] },
  { id: "wp8", alias: "Patch Monster", estimatedPortfolioValue: 5500000, primaryFocus: ["Game-Used Patches", "RPAs", "National Treasures", "Immaculate"], tradingStyle: "Premium material collector", avgTransactionSize: 12000, activityFrequency: "Weekly", winRate: 76, avgHoldPeriod: 730, lastSeen: "2026-04-15", tier: "major", knownPositions: [{ card: "National Treasures RPAs Various", estimatedQty: 85, estimatedValue: 1020000 }] }
];

const mockWhaleHistory: WhaleHistory[] = [
  { id: "wh1", whaleId: "wp1", month: "2026-01", totalBuys: 245000, totalSells: 42000, netFlow: 203000, topAcquisition: "1986 Fleer Jordan PSA 9", topDisposal: "1990 Fleer Jordan PSA 10", portfolioChange: 1.8 },
  { id: "wh2", whaleId: "wp1", month: "2026-02", totalBuys: 312000, totalSells: 28000, netFlow: 284000, topAcquisition: "1986 Fleer Jordan PSA 9", topDisposal: "Various 1990s inserts", portfolioChange: 2.4 },
  { id: "wh3", whaleId: "wp1", month: "2026-03", totalBuys: 178000, totalSells: 15000, netFlow: 163000, topAcquisition: "1997 Metal Universe PMG", topDisposal: "Duplicate lower grades", portfolioChange: 1.5 },
  { id: "wh4", whaleId: "wp2", month: "2026-01", totalBuys: 85000, totalSells: 32000, netFlow: 53000, topAcquisition: "2018 Prizm Luka Silver PSA 10", topDisposal: "2020 Prizm Various Base", portfolioChange: 1.2 },
  { id: "wh5", whaleId: "wp2", month: "2026-02", totalBuys: 142000, totalSells: 55000, netFlow: 87000, topAcquisition: "2023 Prizm Wembanyama Silver", topDisposal: "2021 Prizm Cade Cunningham", portfolioChange: 2.1 },
  { id: "wh6", whaleId: "wp3", month: "2026-03", totalBuys: 22000, totalSells: 185000, netFlow: -163000, topAcquisition: "2024 Prizm Various", topDisposal: "2019 Prizm Zion Silver PSA 10", portfolioChange: -4.2 },
  { id: "wh7", whaleId: "wp3", month: "2026-04", totalBuys: 8000, totalSells: 95000, netFlow: -87000, topAcquisition: "Small position adds", topDisposal: "2019-2021 Basketball Various", portfolioChange: -2.8 }
];

export function getWhaleActivities(): WhaleActivity[] {
  return mockActivities;
}

export function getAccumulationPatterns(): AccumulationPattern[] {
  return mockPatterns;
}

export function getWhaleProfiles(): WhaleProfile[] {
  return mockProfiles;
}

export function getWhaleHistory(): WhaleHistory[] {
  return mockWhaleHistory;
}

export function getWhaleStats() {
  const totalPortfolioValue = mockProfiles.reduce((s, p) => s + p.estimatedPortfolioValue, 0);
  const activeWhales = mockProfiles.length;
  const megaWhales = mockProfiles.filter(p => p.tier === "mega").length;
  const recentActivities = mockActivities.filter(a => a.significance === "critical" || a.significance === "high").length;
  const netAccumulation = mockWhaleHistory.reduce((s, h) => s + h.netFlow, 0);
  const avgWinRate = Math.round(mockProfiles.reduce((s, p) => s + p.winRate, 0) / mockProfiles.length);
  return { totalPortfolioValue, activeWhales, megaWhales, recentActivities, netAccumulation, avgWinRate };
}
