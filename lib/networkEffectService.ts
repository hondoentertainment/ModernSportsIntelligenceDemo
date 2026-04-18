// Network Effect Valuation Service
// Values cards based on community network effects and collector density

export interface NetworkMetric {
  id: string;
  cardName: string;
  playerName: string;
  baseValue: number;
  networkPremium: number;
  networkAdjustedValue: number;
  collectorCount: number;
  activeTraders: number;
  communitySize: number;
  networkScore: number;
  growthVelocity: number;
  category: string;
}

export interface NetworkPremium {
  id: string;
  factor: string;
  description: string;
  premiumPercent: number;
  applicableCards: number;
  avgImpact: number;
  reliability: number;
  trend: "increasing" | "stable" | "decreasing";
}

export interface CollectorDensity {
  id: string;
  cardName: string;
  playerName: string;
  totalCollectors: number;
  activeCollectors: number;
  casualCollectors: number;
  investorCollectors: number;
  densityScore: number;
  liquidityRating: number;
  concentrationRisk: number;
  geographicSpread: number;
}

export interface NetworkHistory {
  id: string;
  cardName: string;
  month: string;
  networkScore: number;
  collectorCount: number;
  premiumPercent: number;
  priceChange: number;
  newEntrants: number;
  exitingCollectors: number;
}

const mockNetworkMetrics: NetworkMetric[] = [
  { id: "nm1", cardName: "1986 Fleer Michael Jordan #57", playerName: "Michael Jordan", baseValue: 28000, networkPremium: 35, networkAdjustedValue: 37800, collectorCount: 45200, activeTraders: 8900, communitySize: 125000, networkScore: 96, growthVelocity: 2.1, category: "Vintage Basketball" },
  { id: "nm2", cardName: "2018 Prizm Luka Doncic Silver PSA 10", playerName: "Luka Doncic", baseValue: 3200, networkPremium: 28, networkAdjustedValue: 4096, collectorCount: 32100, activeTraders: 12400, communitySize: 89000, networkScore: 88, growthVelocity: 8.5, category: "Modern Basketball" },
  { id: "nm3", cardName: "1952 Topps Mickey Mantle #311", playerName: "Mickey Mantle", baseValue: 165000, networkPremium: 18, networkAdjustedValue: 194700, collectorCount: 8900, activeTraders: 450, communitySize: 42000, networkScore: 82, growthVelocity: 0.5, category: "Vintage Baseball" },
  { id: "nm4", cardName: "2003 Topps Chrome LeBron James RC", playerName: "LeBron James", baseValue: 38000, networkPremium: 32, networkAdjustedValue: 50160, collectorCount: 28500, activeTraders: 5600, communitySize: 98000, networkScore: 92, growthVelocity: -1.2, category: "Modern Basketball" },
  { id: "nm5", cardName: "2018 Topps Chrome Shohei Ohtani RC", playerName: "Shohei Ohtani", baseValue: 420, networkPremium: 42, networkAdjustedValue: 596, collectorCount: 22800, activeTraders: 8200, communitySize: 115000, networkScore: 90, growthVelocity: 15.2, category: "Modern Baseball" },
  { id: "nm6", cardName: "2020 Prizm Joe Burrow Silver PSA 10", playerName: "Joe Burrow", baseValue: 380, networkPremium: 22, networkAdjustedValue: 464, collectorCount: 18500, activeTraders: 6800, communitySize: 72000, networkScore: 78, growthVelocity: 12.8, category: "Modern Football" },
  { id: "nm7", cardName: "2023 Prizm Victor Wembanyama Silver", playerName: "Victor Wembanyama", baseValue: 450, networkPremium: 55, networkAdjustedValue: 698, collectorCount: 41200, activeTraders: 18500, communitySize: 145000, networkScore: 94, growthVelocity: 28.5, category: "Modern Basketball" },
  { id: "nm8", cardName: "2019 Prizm Zion Williamson Silver PSA 10", playerName: "Zion Williamson", baseValue: 310, networkPremium: -8, networkAdjustedValue: 285, collectorCount: 15200, activeTraders: 4800, communitySize: 52000, networkScore: 55, growthVelocity: -18.5, category: "Modern Basketball" },
  { id: "nm9", cardName: "2021 Prizm Anthony Edwards Silver PSA 10", playerName: "Anthony Edwards", baseValue: 520, networkPremium: 38, networkAdjustedValue: 718, collectorCount: 26800, activeTraders: 9200, communitySize: 95000, networkScore: 89, growthVelocity: 22.1, category: "Modern Basketball" },
  { id: "nm10", cardName: "2022 Topps Chrome UCL Jude Bellingham RC", playerName: "Jude Bellingham", baseValue: 680, networkPremium: 48, networkAdjustedValue: 1006, collectorCount: 35600, activeTraders: 14200, communitySize: 180000, networkScore: 91, growthVelocity: 32.5, category: "Soccer" },
  { id: "nm11", cardName: "2011 Topps Update Mike Trout RC PSA 10", playerName: "Mike Trout", baseValue: 2800, networkPremium: 15, networkAdjustedValue: 3220, collectorCount: 19500, activeTraders: 3200, communitySize: 65000, networkScore: 72, growthVelocity: -5.2, category: "Modern Baseball" },
  { id: "nm12", cardName: "2024 Prizm Caleb Williams Silver PSA 10", playerName: "Caleb Williams", baseValue: 72, networkPremium: 25, networkAdjustedValue: 90, collectorCount: 28900, activeTraders: 15800, communitySize: 110000, networkScore: 76, growthVelocity: 45.8, category: "Modern Football" }
];

const mockPremiums: NetworkPremium[] = [
  { id: "np1", factor: "Community Size", description: "Larger collector communities create more demand and better price discovery", premiumPercent: 18, applicableCards: 95, avgImpact: 15.2, reliability: 82, trend: "increasing" },
  { id: "np2", factor: "Active Trading Volume", description: "Higher trading activity improves liquidity and reduces bid-ask spread", premiumPercent: 12, applicableCards: 88, avgImpact: 10.5, reliability: 78, trend: "stable" },
  { id: "np3", factor: "Social Media Presence", description: "Strong social media following amplifies demand through network effects", premiumPercent: 22, applicableCards: 72, avgImpact: 20.8, reliability: 65, trend: "increasing" },
  { id: "np4", factor: "Cross-Platform Visibility", description: "Cards visible across multiple platforms reach wider collector networks", premiumPercent: 8, applicableCards: 60, avgImpact: 7.2, reliability: 75, trend: "increasing" },
  { id: "np5", factor: "Collector Concentration", description: "Excessive concentration in few hands reduces network value (negative)", premiumPercent: -15, applicableCards: 25, avgImpact: -12.5, reliability: 85, trend: "stable" },
  { id: "np6", factor: "International Reach", description: "Global collector base adds resilience and diversified demand", premiumPercent: 15, applicableCards: 45, avgImpact: 12.8, reliability: 72, trend: "increasing" },
  { id: "np7", factor: "New Entrant Growth", description: "Rapid growth in new collectors joining the network", premiumPercent: 25, applicableCards: 55, avgImpact: 22.1, reliability: 58, trend: "decreasing" }
];

const mockDensities: CollectorDensity[] = [
  { id: "cd1", cardName: "1986 Fleer Jordan #57", playerName: "Michael Jordan", totalCollectors: 45200, activeCollectors: 8900, casualCollectors: 28500, investorCollectors: 7800, densityScore: 92, liquidityRating: 88, concentrationRisk: 15, geographicSpread: 85 },
  { id: "cd2", cardName: "2023 Prizm Wembanyama Silver", playerName: "Victor Wembanyama", totalCollectors: 41200, activeCollectors: 18500, casualCollectors: 15200, investorCollectors: 7500, densityScore: 94, liquidityRating: 95, concentrationRisk: 22, geographicSpread: 78 },
  { id: "cd3", cardName: "2018 Prizm Luka Doncic Silver PSA 10", playerName: "Luka Doncic", totalCollectors: 32100, activeCollectors: 12400, casualCollectors: 14200, investorCollectors: 5500, densityScore: 85, liquidityRating: 82, concentrationRisk: 28, geographicSpread: 72 },
  { id: "cd4", cardName: "1952 Topps Mantle #311", playerName: "Mickey Mantle", totalCollectors: 8900, activeCollectors: 450, casualCollectors: 2100, investorCollectors: 6350, densityScore: 45, liquidityRating: 25, concentrationRisk: 65, geographicSpread: 42 },
  { id: "cd5", cardName: "2019 Prizm Zion Silver PSA 10", playerName: "Zion Williamson", totalCollectors: 15200, activeCollectors: 4800, casualCollectors: 8500, investorCollectors: 1900, densityScore: 55, liquidityRating: 72, concentrationRisk: 18, geographicSpread: 65 }
];

const mockNetworkHistory: NetworkHistory[] = [
  { id: "nh1", cardName: "2023 Prizm Wembanyama Silver", month: "2025-11", networkScore: 78, collectorCount: 28500, premiumPercent: 35, priceChange: 12.5, newEntrants: 4200, exitingCollectors: 800 },
  { id: "nh2", cardName: "2023 Prizm Wembanyama Silver", month: "2025-12", networkScore: 82, collectorCount: 31200, premiumPercent: 40, priceChange: 8.2, newEntrants: 3800, exitingCollectors: 1100 },
  { id: "nh3", cardName: "2023 Prizm Wembanyama Silver", month: "2026-01", networkScore: 86, collectorCount: 34500, premiumPercent: 45, priceChange: 5.8, newEntrants: 4500, exitingCollectors: 1200 },
  { id: "nh4", cardName: "2023 Prizm Wembanyama Silver", month: "2026-02", networkScore: 89, collectorCount: 37200, premiumPercent: 48, priceChange: 3.5, newEntrants: 3800, exitingCollectors: 1100 },
  { id: "nh5", cardName: "2023 Prizm Wembanyama Silver", month: "2026-03", networkScore: 92, collectorCount: 39800, premiumPercent: 52, priceChange: 2.2, newEntrants: 3200, exitingCollectors: 600 },
  { id: "nh6", cardName: "2023 Prizm Wembanyama Silver", month: "2026-04", networkScore: 94, collectorCount: 41200, premiumPercent: 55, priceChange: 4.8, newEntrants: 2200, exitingCollectors: 800 },
  { id: "nh7", cardName: "2019 Prizm Zion Silver PSA 10", month: "2025-11", networkScore: 72, collectorCount: 22800, premiumPercent: 12, priceChange: -5.2, newEntrants: 800, exitingCollectors: 2200 },
  { id: "nh8", cardName: "2019 Prizm Zion Silver PSA 10", month: "2025-12", networkScore: 68, collectorCount: 20500, premiumPercent: 5, priceChange: -8.5, newEntrants: 600, exitingCollectors: 2900 },
  { id: "nh9", cardName: "2019 Prizm Zion Silver PSA 10", month: "2026-01", networkScore: 62, collectorCount: 18200, premiumPercent: 0, priceChange: -12.1, newEntrants: 500, exitingCollectors: 2800 },
  { id: "nh10", cardName: "2019 Prizm Zion Silver PSA 10", month: "2026-02", networkScore: 58, collectorCount: 16800, premiumPercent: -5, priceChange: -6.8, newEntrants: 400, exitingCollectors: 1800 },
  { id: "nh11", cardName: "2019 Prizm Zion Silver PSA 10", month: "2026-03", networkScore: 56, collectorCount: 15800, premiumPercent: -7, priceChange: -3.2, newEntrants: 350, exitingCollectors: 1350 },
  { id: "nh12", cardName: "2019 Prizm Zion Silver PSA 10", month: "2026-04", networkScore: 55, collectorCount: 15200, premiumPercent: -8, priceChange: -1.5, newEntrants: 300, exitingCollectors: 900 }
];

export function getNetworkMetrics(): NetworkMetric[] {
  return mockNetworkMetrics;
}

export function getNetworkPremiums(): NetworkPremium[] {
  return mockPremiums;
}

export function getCollectorDensities(): CollectorDensity[] {
  return mockDensities;
}

export function getNetworkHistory(): NetworkHistory[] {
  return mockNetworkHistory;
}

export function getNetworkStats() {
  const avgNetworkScore = Math.round(mockNetworkMetrics.reduce((s, n) => s + n.networkScore, 0) / mockNetworkMetrics.length);
  const avgPremium = parseFloat((mockNetworkMetrics.reduce((s, n) => s + n.networkPremium, 0) / mockNetworkMetrics.length).toFixed(1));
  const totalCollectors = mockNetworkMetrics.reduce((s, n) => s + n.collectorCount, 0);
  const totalActiveTraders = mockNetworkMetrics.reduce((s, n) => s + n.activeTraders, 0);
  const avgGrowth = parseFloat((mockNetworkMetrics.reduce((s, n) => s + n.growthVelocity, 0) / mockNetworkMetrics.length).toFixed(1));
  return { avgNetworkScore, avgPremium, totalCollectors, totalActiveTraders, avgGrowth, cardsTracked: mockNetworkMetrics.length };
}
