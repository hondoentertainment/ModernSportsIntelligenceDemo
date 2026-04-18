// Tribal Affinity Mapper Service
// Maps collector tribe identity and loyalty patterns across player/team/era fandoms

export interface CollectorTribe {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  avgSpend: number;
  topPlayers: string[];
  primaryEra: string;
  loyaltyScore: number;
  growthRate: number;
  dominantPlatform: string;
  color: string;
}

export interface AffinityScore {
  id: string;
  tribeA: string;
  tribeB: string;
  affinityScore: number;
  overlapPercentage: number;
  sharedInterests: string[];
  conflictLevel: number;
  tradingFrequency: number;
}

export interface TribeMigration {
  id: string;
  fromTribe: string;
  toTribe: string;
  migrantCount: number;
  migrationDate: string;
  reason: string;
  avgValueShift: number;
  returnRate: number;
}

export interface TribalOverlap {
  id: string;
  tribes: string[];
  overlapCount: number;
  overlapPercentage: number;
  sharedCards: string[];
  avgDualSpend: number;
  synergyScore: number;
}

const mockTribes: CollectorTribe[] = [
  { id: "t1", name: "Jordan Dynasty", description: "Dedicated MJ collectors focused on 1986-1998 era basketball cards", memberCount: 45200, avgSpend: 2850, topPlayers: ["Michael Jordan", "Scottie Pippen", "Dennis Rodman"], primaryEra: "1986-1998", loyaltyScore: 97, growthRate: 3.2, dominantPlatform: "eBay", color: "#e53e3e" },
  { id: "t2", name: "Vintage Baseball Purists", description: "Pre-war and post-war baseball card enthusiasts", memberCount: 28400, avgSpend: 4200, topPlayers: ["Mickey Mantle", "Babe Ruth", "Willie Mays"], primaryEra: "1909-1969", loyaltyScore: 99, growthRate: 1.1, dominantPlatform: "Heritage Auctions", color: "#2b6cb0" },
  { id: "t3", name: "Modern Basketball Wave", description: "Current NBA stars and rising rookies collectors", memberCount: 67800, avgSpend: 1450, topPlayers: ["Luka Doncic", "Victor Wembanyama", "Anthony Edwards"], primaryEra: "2018-Present", loyaltyScore: 68, growthRate: 12.5, dominantPlatform: "StockX", color: "#ed8936" },
  { id: "t4", name: "Gridiron Legends", description: "NFL football card collectors spanning all eras", memberCount: 38900, avgSpend: 1780, topPlayers: ["Tom Brady", "Patrick Mahomes", "Joe Montana"], primaryEra: "1965-Present", loyaltyScore: 85, growthRate: 5.8, dominantPlatform: "COMC", color: "#38a169" },
  { id: "t5", name: "Junk Wax Revivalists", description: "Collectors finding hidden gems in 1987-1994 overproduction era", memberCount: 22100, avgSpend: 320, topPlayers: ["Ken Griffey Jr.", "Frank Thomas", "Barry Bonds"], primaryEra: "1987-1994", loyaltyScore: 82, growthRate: 8.9, dominantPlatform: "Facebook Groups", color: "#805ad5" },
  { id: "t6", name: "Soccer Global Collective", description: "International soccer/football card collectors", memberCount: 51300, avgSpend: 980, topPlayers: ["Lionel Messi", "Cristiano Ronaldo", "Kylian Mbappe"], primaryEra: "2000-Present", loyaltyScore: 76, growthRate: 18.3, dominantPlatform: "Instagram", color: "#d69e2e" },
  { id: "t7", name: "Prospect Hunters", description: "Minor league and amateur prospect card speculators", memberCount: 19700, avgSpend: 2100, topPlayers: ["Top Draft Picks", "International Signings", "Bowman 1sts"], primaryEra: "Current Year", loyaltyScore: 45, growthRate: 22.1, dominantPlatform: "Twitter/X", color: "#e53e3e" },
  { id: "t8", name: "PSA 10 Chasers", description: "Grade-obsessed collectors seeking only gem mint specimens", memberCount: 34600, avgSpend: 3400, topPlayers: ["Any Player", "Grade > Player", "Pop Reports"], primaryEra: "All Eras", loyaltyScore: 71, growthRate: 6.4, dominantPlatform: "PSA Registry", color: "#319795" },
  { id: "t9", name: "The Patch Collectors", description: "Game-used memorabilia and patch card specialists", memberCount: 15800, avgSpend: 1650, topPlayers: ["LeBron James", "Mike Trout", "Connor McDavid"], primaryEra: "2003-Present", loyaltyScore: 88, growthRate: 4.2, dominantPlatform: "Blowout Forums", color: "#dd6b20" },
  { id: "t10", name: "Wax Rippers Anonymous", description: "Box breakers and sealed product enthusiasts", memberCount: 42500, avgSpend: 2200, topPlayers: ["Sealed Product", "Case Hits", "SSP Pulls"], primaryEra: "Current Releases", loyaltyScore: 52, growthRate: 15.7, dominantPlatform: "YouTube", color: "#9f7aea" }
];

const mockAffinityScores: AffinityScore[] = [
  { id: "a1", tribeA: "Jordan Dynasty", tribeB: "PSA 10 Chasers", affinityScore: 82, overlapPercentage: 38, sharedInterests: ["High-grade vintage basketball", "Registry sets"], conflictLevel: 12, tradingFrequency: 67 },
  { id: "a2", tribeA: "Modern Basketball Wave", tribeB: "Prospect Hunters", affinityScore: 75, overlapPercentage: 42, sharedInterests: ["Rookie cards", "Short prints", "Speculation"], conflictLevel: 25, tradingFrequency: 81 },
  { id: "a3", tribeA: "Vintage Baseball Purists", tribeB: "Junk Wax Revivalists", affinityScore: 35, overlapPercentage: 8, sharedInterests: ["Baseball history"], conflictLevel: 55, tradingFrequency: 12 },
  { id: "a4", tribeA: "Gridiron Legends", tribeB: "The Patch Collectors", affinityScore: 68, overlapPercentage: 31, sharedInterests: ["Game-used materials", "NFL memorabilia"], conflictLevel: 15, tradingFrequency: 54 },
  { id: "a5", tribeA: "Wax Rippers Anonymous", tribeB: "Modern Basketball Wave", affinityScore: 71, overlapPercentage: 45, sharedInterests: ["New releases", "Case breaks", "Hit chasing"], conflictLevel: 18, tradingFrequency: 73 },
  { id: "a6", tribeA: "Soccer Global Collective", tribeB: "Prospect Hunters", affinityScore: 58, overlapPercentage: 22, sharedInterests: ["Young talent", "International cards"], conflictLevel: 8, tradingFrequency: 34 },
  { id: "a7", tribeA: "Jordan Dynasty", tribeB: "Vintage Baseball Purists", affinityScore: 45, overlapPercentage: 15, sharedInterests: ["High-value vintage", "Authentication"], conflictLevel: 5, tradingFrequency: 19 },
  { id: "a8", tribeA: "PSA 10 Chasers", tribeB: "Wax Rippers Anonymous", affinityScore: 63, overlapPercentage: 29, sharedInterests: ["Fresh pulls for grading", "Pop count tracking"], conflictLevel: 22, tradingFrequency: 58 }
];

const mockMigrations: TribeMigration[] = [
  { id: "m1", fromTribe: "Modern Basketball Wave", toTribe: "Prospect Hunters", migrantCount: 3200, migrationDate: "2026-01-15", reason: "Seeking higher ROI on early picks", avgValueShift: -15, returnRate: 42 },
  { id: "m2", fromTribe: "Junk Wax Revivalists", toTribe: "Vintage Baseball Purists", migrantCount: 1800, migrationDate: "2026-02-20", reason: "Graduating to higher quality vintage", avgValueShift: 180, returnRate: 12 },
  { id: "m3", fromTribe: "Wax Rippers Anonymous", toTribe: "PSA 10 Chasers", migrantCount: 4100, migrationDate: "2025-11-10", reason: "Transitioning from ripping to grading best pulls", avgValueShift: 45, returnRate: 55 },
  { id: "m4", fromTribe: "Gridiron Legends", toTribe: "Modern Basketball Wave", migrantCount: 2700, migrationDate: "2025-12-05", reason: "Following basketball market momentum", avgValueShift: -22, returnRate: 38 },
  { id: "m5", fromTribe: "Soccer Global Collective", toTribe: "Modern Basketball Wave", migrantCount: 5600, migrationDate: "2026-03-01", reason: "US market growth opportunity", avgValueShift: 35, returnRate: 28 },
  { id: "m6", fromTribe: "Prospect Hunters", toTribe: "Jordan Dynasty", migrantCount: 890, migrationDate: "2026-01-28", reason: "Seeking stability after prospect busts", avgValueShift: 120, returnRate: 8 }
];

const mockOverlaps: TribalOverlap[] = [
  { id: "o1", tribes: ["Jordan Dynasty", "PSA 10 Chasers"], overlapCount: 12400, overlapPercentage: 38, sharedCards: ["1986 Fleer #57 PSA 10", "1997 Metal Universe PMG"], avgDualSpend: 4800, synergyScore: 85 },
  { id: "o2", tribes: ["Modern Basketball Wave", "Wax Rippers Anonymous"], overlapCount: 18900, overlapPercentage: 45, sharedCards: ["Prizm Silver Rookies", "National Treasures RPA"], avgDualSpend: 2100, synergyScore: 78 },
  { id: "o3", tribes: ["Gridiron Legends", "The Patch Collectors"], overlapCount: 8200, overlapPercentage: 31, sharedCards: ["National Treasures NFL Patches", "Immaculate Collection"], avgDualSpend: 2900, synergyScore: 72 },
  { id: "o4", tribes: ["Vintage Baseball Purists", "Jordan Dynasty"], overlapCount: 5100, overlapPercentage: 15, sharedCards: ["Pre-war HOF cards", "1986 Fleer set"], avgDualSpend: 5600, synergyScore: 48 },
  { id: "o5", tribes: ["Prospect Hunters", "Soccer Global Collective"], overlapCount: 6800, overlapPercentage: 22, sharedCards: ["Bowman 1st International", "Topps Chrome UCL"], avgDualSpend: 1400, synergyScore: 55 }
];

export function getCollectorTribes(): CollectorTribe[] {
  return mockTribes;
}

export function getAffinityScores(): AffinityScore[] {
  return mockAffinityScores;
}

export function getTribeMigrations(): TribeMigration[] {
  return mockMigrations;
}

export function getTribalOverlaps(): TribalOverlap[] {
  return mockOverlaps;
}

export function getTribeById(id: string): CollectorTribe | undefined {
  return mockTribes.find(t => t.id === id);
}

export function getTribeStats() {
  const totalMembers = mockTribes.reduce((sum, t) => sum + t.memberCount, 0);
  const avgLoyalty = Math.round(mockTribes.reduce((sum, t) => sum + t.loyaltyScore, 0) / mockTribes.length);
  const avgGrowth = parseFloat((mockTribes.reduce((sum, t) => sum + t.growthRate, 0) / mockTribes.length).toFixed(1));
  const totalMigrations = mockMigrations.reduce((sum, m) => sum + m.migrantCount, 0);
  return { totalMembers, avgLoyalty, avgGrowth, totalMigrations, tribeCount: mockTribes.length };
}
