// Dead Money Detector Service — Industry-first stagnant capital scanner

// ── Types ────────────────────────────────────────────────────────────────────────

export type LiquidityTrend = 'declining' | 'flat' | 'improving';
export type CatalystOutlookType = 'none' | 'distant' | 'upcoming';
export type SuggestedAction = 'swap' | 'sell' | 'hold' | 'reduce';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type Sport = 'football' | 'basketball' | 'baseball' | 'hockey' | 'soccer';

export interface DeadMoneyAsset {
  cardId: string;
  cardName: string;
  player: string;
  sport: Sport;
  purchasePrice: number;
  currentValue: number;
  holdDays: number;
  appreciationRate: number;
  liquidityTrend: LiquidityTrend;
  catalystOutlook: CatalystOutlookType;
  deadMoneyScore: number; // 0-100, higher = more dead
  opportunityCostPerDay: number;
  stagnationDays: number;
  suggestedAction: SuggestedAction;
  grade: string;
  lastSaleDate: string;
  volume30d: number;
}

export interface StagnationMetrics {
  totalStagnantValue: number;
  avgStagnationDays: number;
  worstOffender: string;
  stagnationRate: number;
  portfolioDrag: number;
}

export interface SwapTarget {
  name: string;
  player: string;
  currentValue: number;
  projectedGrowth: number;
  catalyst: string;
  catalystDate: string;
  sport: Sport;
}

export interface SwapRecommendation {
  id: string;
  fromAsset: DeadMoneyAsset;
  toAsset: SwapTarget;
  expectedGain: number;
  confidence: number;
  rationale: string;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface DeadMoneyScore {
  overall: number;
  breakdown: { label: string; score: number; weight: number }[];
  grade: string;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface CapitalEfficiency {
  productiveCapital: number;
  deadCapital: number;
  totalPortfolioValue: number;
  efficiencyRatio: number;
  productiveHistory: { date: string; productive: number; dead: number }[];
}

export interface OpportunityCost {
  totalCost: number;
  dailyAverage: number;
  missedGains: number;
  benchmarkReturn: number;
  costByAsset: { cardName: string; cost: number }[];
  period: number;
}

export interface RedeploymentStrategy {
  id: string;
  name: string;
  description: string;
  expectedReturn: number;
  risk: 'low' | 'medium' | 'high';
  timeframe: string;
  assetsToSell: string[];
  capitalFreed: number;
  targetAllocations: { category: string; percentage: number; rationale: string }[];
}

export interface DeadMoneyAlert {
  id: string;
  cardId: string;
  cardName: string;
  player: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  daysStagnant: number;
  opportunityCost: number;
  read: boolean;
}

export interface PortfolioHealthScore {
  score: number; // 0-100
  grade: string;
  deadMoneyPercentage: number;
  avgVelocity: number;
  catalystCoverage: number;
  liquidityScore: number;
  diversificationScore: number;
  recommendations: string[];
}

export interface AssetVelocity {
  cardId: string;
  cardName: string;
  player: string;
  appreciationRate: number;
  liquidityScore: number;
  quadrant: 'star' | 'sleeper' | 'dead' | 'fading';
  deadMoneyScore: number;
}

export interface CatalystOutlook {
  id: string;
  cardId: string;
  cardName: string;
  player: string;
  catalystType: string;
  catalystDate: string;
  expectedImpact: number;
  description: string;
  likelihood: number;
}

export interface DeadMoneyTrend {
  date: string;
  deadMoneyCount: number;
  deadMoneyValue: number;
  portfolioPercentage: number;
  avgScore: number;
}

// ── Mock Data ────────────────────────────────────────────────────────────────────

const mockDeadMoneyAssets: DeadMoneyAsset[] = [
  {
    cardId: 'dm-001',
    cardName: '2021 Prizm Trevor Lawrence RC #331 PSA 10',
    player: 'Trevor Lawrence',
    sport: 'football',
    purchasePrice: 425,
    currentValue: 185,
    holdDays: 820,
    appreciationRate: -0.283,
    liquidityTrend: 'declining',
    catalystOutlook: 'none',
    deadMoneyScore: 94,
    opportunityCostPerDay: 0.87,
    stagnationDays: 540,
    suggestedAction: 'sell',
    grade: 'PSA 10',
    lastSaleDate: '2025-11-18',
    volume30d: 3,
  },
  {
    cardId: 'dm-002',
    cardName: '2022 Topps Chrome Julio Rodriguez RC #44 SGC 10',
    player: 'Julio Rodriguez',
    sport: 'baseball',
    purchasePrice: 310,
    currentValue: 275,
    holdDays: 640,
    appreciationRate: -0.056,
    liquidityTrend: 'flat',
    catalystOutlook: 'distant',
    deadMoneyScore: 68,
    opportunityCostPerDay: 0.42,
    stagnationDays: 290,
    suggestedAction: 'reduce',
    grade: 'SGC 10',
    lastSaleDate: '2026-01-05',
    volume30d: 8,
  },
  {
    cardId: 'dm-003',
    cardName: '2020 Mosaic Tua Tagovailoa RC #202 PSA 10',
    player: 'Tua Tagovailoa',
    sport: 'football',
    purchasePrice: 220,
    currentValue: 82,
    holdDays: 1100,
    appreciationRate: -0.313,
    liquidityTrend: 'declining',
    catalystOutlook: 'none',
    deadMoneyScore: 97,
    opportunityCostPerDay: 1.12,
    stagnationDays: 780,
    suggestedAction: 'sell',
    grade: 'PSA 10',
    lastSaleDate: '2025-09-22',
    volume30d: 2,
  },
  {
    cardId: 'dm-004',
    cardName: '2021 Panini Select Zion Williamson #1 PSA 9',
    player: 'Zion Williamson',
    sport: 'basketball',
    purchasePrice: 380,
    currentValue: 145,
    holdDays: 950,
    appreciationRate: -0.309,
    liquidityTrend: 'declining',
    catalystOutlook: 'distant',
    deadMoneyScore: 88,
    opportunityCostPerDay: 0.95,
    stagnationDays: 620,
    suggestedAction: 'swap',
    grade: 'PSA 9',
    lastSaleDate: '2025-12-03',
    volume30d: 5,
  },
  {
    cardId: 'dm-005',
    cardName: '2022 Donruss Optic Malik Willis RC #214 PSA 10',
    player: 'Malik Willis',
    sport: 'football',
    purchasePrice: 95,
    currentValue: 12,
    holdDays: 880,
    appreciationRate: -0.437,
    liquidityTrend: 'declining',
    catalystOutlook: 'none',
    deadMoneyScore: 99,
    opportunityCostPerDay: 0.32,
    stagnationDays: 850,
    suggestedAction: 'sell',
    grade: 'PSA 10',
    lastSaleDate: '2025-07-15',
    volume30d: 0,
  },
  {
    cardId: 'dm-006',
    cardName: '2021 Topps Chrome Luis Robert Jr RC #43 PSA 10',
    player: 'Luis Robert Jr',
    sport: 'baseball',
    purchasePrice: 280,
    currentValue: 210,
    holdDays: 720,
    appreciationRate: -0.125,
    liquidityTrend: 'flat',
    catalystOutlook: 'upcoming',
    deadMoneyScore: 45,
    opportunityCostPerDay: 0.35,
    stagnationDays: 180,
    suggestedAction: 'hold',
    grade: 'PSA 10',
    lastSaleDate: '2026-02-20',
    volume30d: 12,
  },
  {
    cardId: 'dm-007',
    cardName: '2022 Prizm Justin Fields RC #303 PSA 10',
    player: 'Justin Fields',
    sport: 'football',
    purchasePrice: 175,
    currentValue: 68,
    holdDays: 760,
    appreciationRate: -0.305,
    liquidityTrend: 'declining',
    catalystOutlook: 'none',
    deadMoneyScore: 91,
    opportunityCostPerDay: 0.58,
    stagnationDays: 590,
    suggestedAction: 'sell',
    grade: 'PSA 10',
    lastSaleDate: '2025-10-01',
    volume30d: 4,
  },
  {
    cardId: 'dm-008',
    cardName: '2020 Topps Chrome Yordan Alvarez RC #200 BGS 9.5',
    player: 'Yordan Alvarez',
    sport: 'baseball',
    purchasePrice: 340,
    currentValue: 295,
    holdDays: 680,
    appreciationRate: -0.066,
    liquidityTrend: 'flat',
    catalystOutlook: 'upcoming',
    deadMoneyScore: 42,
    opportunityCostPerDay: 0.28,
    stagnationDays: 150,
    suggestedAction: 'hold',
    grade: 'BGS 9.5',
    lastSaleDate: '2026-02-28',
    volume30d: 15,
  },
  {
    cardId: 'dm-009',
    cardName: '2021 Prizm Cade Cunningham RC #282 PSA 10',
    player: 'Cade Cunningham',
    sport: 'basketball',
    purchasePrice: 195,
    currentValue: 90,
    holdDays: 810,
    appreciationRate: -0.269,
    liquidityTrend: 'declining',
    catalystOutlook: 'distant',
    deadMoneyScore: 82,
    opportunityCostPerDay: 0.65,
    stagnationDays: 490,
    suggestedAction: 'swap',
    grade: 'PSA 10',
    lastSaleDate: '2025-11-10',
    volume30d: 6,
  },
  {
    cardId: 'dm-010',
    cardName: '2022 Upper Deck Young Guns Owen Power RC #201 PSA 10',
    player: 'Owen Power',
    sport: 'hockey',
    purchasePrice: 85,
    currentValue: 35,
    holdDays: 600,
    appreciationRate: -0.294,
    liquidityTrend: 'declining',
    catalystOutlook: 'none',
    deadMoneyScore: 90,
    opportunityCostPerDay: 0.38,
    stagnationDays: 500,
    suggestedAction: 'sell',
    grade: 'PSA 10',
    lastSaleDate: '2025-08-19',
    volume30d: 1,
  },
  {
    cardId: 'dm-011',
    cardName: '2022 Prizm Paolo Banchero RC #233 PSA 10',
    player: 'Paolo Banchero',
    sport: 'basketball',
    purchasePrice: 260,
    currentValue: 195,
    holdDays: 590,
    appreciationRate: -0.125,
    liquidityTrend: 'flat',
    catalystOutlook: 'upcoming',
    deadMoneyScore: 52,
    opportunityCostPerDay: 0.38,
    stagnationDays: 200,
    suggestedAction: 'hold',
    grade: 'PSA 10',
    lastSaleDate: '2026-02-14',
    volume30d: 18,
  },
  {
    cardId: 'dm-012',
    cardName: '2021 Topps Chrome CJ Stroud RC #150 PSA 10',
    player: 'CJ Stroud',
    sport: 'football',
    purchasePrice: 480,
    currentValue: 390,
    holdDays: 420,
    appreciationRate: -0.094,
    liquidityTrend: 'flat',
    catalystOutlook: 'upcoming',
    deadMoneyScore: 38,
    opportunityCostPerDay: 0.45,
    stagnationDays: 120,
    suggestedAction: 'hold',
    grade: 'PSA 10',
    lastSaleDate: '2026-03-02',
    volume30d: 22,
  },
  {
    cardId: 'dm-013',
    cardName: '2020 Panini Contenders Jordan Love RC Auto #104 PSA 9',
    player: 'Jordan Love',
    sport: 'football',
    purchasePrice: 520,
    currentValue: 310,
    holdDays: 980,
    appreciationRate: -0.202,
    liquidityTrend: 'declining',
    catalystOutlook: 'distant',
    deadMoneyScore: 76,
    opportunityCostPerDay: 0.78,
    stagnationDays: 410,
    suggestedAction: 'reduce',
    grade: 'PSA 9',
    lastSaleDate: '2026-01-15',
    volume30d: 7,
  },
  {
    cardId: 'dm-014',
    cardName: '2022 Topps Chrome Bobby Witt Jr RC #100 PSA 10',
    player: 'Bobby Witt Jr',
    sport: 'baseball',
    purchasePrice: 165,
    currentValue: 140,
    holdDays: 510,
    appreciationRate: -0.076,
    liquidityTrend: 'improving',
    catalystOutlook: 'upcoming',
    deadMoneyScore: 32,
    opportunityCostPerDay: 0.22,
    stagnationDays: 90,
    suggestedAction: 'hold',
    grade: 'PSA 10',
    lastSaleDate: '2026-03-08',
    volume30d: 25,
  },
  {
    cardId: 'dm-015',
    cardName: '2021 Prizm Mac Jones RC #325 PSA 10',
    player: 'Mac Jones',
    sport: 'football',
    purchasePrice: 200,
    currentValue: 28,
    holdDays: 1050,
    appreciationRate: -0.43,
    liquidityTrend: 'declining',
    catalystOutlook: 'none',
    deadMoneyScore: 98,
    opportunityCostPerDay: 0.72,
    stagnationDays: 900,
    suggestedAction: 'sell',
    grade: 'PSA 10',
    lastSaleDate: '2025-06-10',
    volume30d: 1,
  },
  {
    cardId: 'dm-016',
    cardName: '2022 Topps Chrome Adley Rutschman RC #35 PSA 10',
    player: 'Adley Rutschman',
    sport: 'baseball',
    purchasePrice: 120,
    currentValue: 88,
    holdDays: 580,
    appreciationRate: -0.133,
    liquidityTrend: 'flat',
    catalystOutlook: 'distant',
    deadMoneyScore: 62,
    opportunityCostPerDay: 0.30,
    stagnationDays: 310,
    suggestedAction: 'reduce',
    grade: 'PSA 10',
    lastSaleDate: '2026-01-22',
    volume30d: 9,
  },
  {
    cardId: 'dm-017',
    cardName: '2021 Topps Series 1 Wander Franco RC #70 PSA 10',
    player: 'Wander Franco',
    sport: 'baseball',
    purchasePrice: 550,
    currentValue: 85,
    holdDays: 1200,
    appreciationRate: -0.423,
    liquidityTrend: 'declining',
    catalystOutlook: 'none',
    deadMoneyScore: 99,
    opportunityCostPerDay: 1.55,
    stagnationDays: 1000,
    suggestedAction: 'sell',
    grade: 'PSA 10',
    lastSaleDate: '2025-05-01',
    volume30d: 2,
  },
];

const mockSwapRecommendations: SwapRecommendation[] = [
  {
    id: 'swap-001',
    fromAsset: mockDeadMoneyAssets[0], // Trevor Lawrence
    toAsset: {
      name: '2024 Prizm Caleb Williams RC #301 PSA 10',
      player: 'Caleb Williams',
      currentValue: 180,
      projectedGrowth: 0.45,
      catalyst: 'Second NFL season — breakout year potential',
      catalystDate: '2026-09-01',
      sport: 'football',
    },
    expectedGain: 81,
    confidence: 74,
    rationale: 'Lawrence has shown ceiling with no upside catalysts remaining. Williams has massive upside entering year 2 with improved weapons and a potential playoff run. Swap frees up stagnant capital into a rising QB asset.',
    timeframe: '6-9 months',
    riskLevel: 'medium',
  },
  {
    id: 'swap-002',
    fromAsset: mockDeadMoneyAssets[3], // Zion Williamson
    toAsset: {
      name: '2024 Prizm Victor Wembanyama #1 PSA 10',
      player: 'Victor Wembanyama',
      currentValue: 420,
      projectedGrowth: 0.55,
      catalyst: 'First full All-Star season, MVP candidate trajectory',
      catalystDate: '2026-04-15',
      sport: 'basketball',
    },
    expectedGain: 231,
    confidence: 82,
    rationale: 'Zion carries chronic injury risk and depressed market confidence. Wembanyama is the generational talent with ascending demand. Converting Zion capital to Wemby captures the NBA future at a still-reasonable entry point.',
    timeframe: '3-6 months',
    riskLevel: 'low',
  },
  {
    id: 'swap-003',
    fromAsset: mockDeadMoneyAssets[4], // Malik Willis
    toAsset: {
      name: '2024 Topps Chrome Jackson Holliday RC #50 PSA 10',
      player: 'Jackson Holliday',
      currentValue: 45,
      projectedGrowth: 0.80,
      catalyst: 'Full rookie season, top prospect call-up confirmed',
      catalystDate: '2026-04-01',
      sport: 'baseball',
    },
    expectedGain: 36,
    confidence: 68,
    rationale: 'Willis has virtually zero market value recovery potential — a true bust card. Holliday is a top-3 MLB prospect with his full rookie season ahead. Even partial capital salvage into Holliday offers dramatically better upside.',
    timeframe: '3-6 months',
    riskLevel: 'medium',
  },
  {
    id: 'swap-004',
    fromAsset: mockDeadMoneyAssets[6], // Justin Fields
    toAsset: {
      name: '2024 Prizm Jayden Daniels RC #288 PSA 10',
      player: 'Jayden Daniels',
      currentValue: 125,
      projectedGrowth: 0.40,
      catalyst: 'Sophomore NFL season, Commanders playoff contention',
      catalystDate: '2026-09-01',
      sport: 'football',
    },
    expectedGain: 50,
    confidence: 71,
    rationale: 'Fields has been a market disappointment through multiple team changes. Daniels showed electric OROY form and has strong momentum heading into year 2. The swap captures fresh QB upside over a declining asset.',
    timeframe: '6-12 months',
    riskLevel: 'medium',
  },
  {
    id: 'swap-005',
    fromAsset: mockDeadMoneyAssets[8], // Cade Cunningham
    toAsset: {
      name: '2023 Prizm Chet Holmgren RC #249 PSA 10',
      player: 'Chet Holmgren',
      currentValue: 95,
      projectedGrowth: 0.50,
      catalyst: 'Healthy second season with OKC contending for title',
      catalystDate: '2026-04-20',
      sport: 'basketball',
    },
    expectedGain: 47,
    confidence: 69,
    rationale: 'Cunningham on a rebuilding Pistons squad with limited national visibility. Holmgren on a title-contending Thunder team with massive market exposure during playoff run. The OKC playoff factor alone could drive 50%+ appreciation.',
    timeframe: '3-6 months',
    riskLevel: 'medium',
  },
  {
    id: 'swap-006',
    fromAsset: mockDeadMoneyAssets[9], // Owen Power
    toAsset: {
      name: '2024 Upper Deck Young Guns Connor Bedard RC #201 PSA 10',
      player: 'Connor Bedard',
      currentValue: 85,
      projectedGrowth: 0.65,
      catalyst: 'Sophomore NHL season, potential Hart Trophy candidate',
      catalystDate: '2026-10-01',
      sport: 'hockey',
    },
    expectedGain: 55,
    confidence: 76,
    rationale: 'Power has not moved the needle for collectors despite solid play. Bedard is the face of the next hockey generation and commands premium attention. Moving from a flat defenseman asset to the marquee forward is a clear upgrade.',
    timeframe: '6-12 months',
    riskLevel: 'low',
  },
  {
    id: 'swap-007',
    fromAsset: mockDeadMoneyAssets[14], // Mac Jones
    toAsset: {
      name: '2024 Prizm Bo Nix RC #305 PSA 10',
      player: 'Bo Nix',
      currentValue: 55,
      projectedGrowth: 0.35,
      catalyst: 'Year 2 with Denver Broncos, potential playoff push',
      catalystDate: '2026-09-01',
      sport: 'football',
    },
    expectedGain: 19,
    confidence: 60,
    rationale: 'Mac Jones is a near-total loss with no recovery path. Bo Nix showed promise as a rookie and has an inexpensive entry point with genuine upside. Salvaging any capital from the Jones position into Nix is the pragmatic move.',
    timeframe: '6-9 months',
    riskLevel: 'high',
  },
  {
    id: 'swap-008',
    fromAsset: mockDeadMoneyAssets[16], // Wander Franco
    toAsset: {
      name: '2024 Topps Chrome Paul Skenes RC #15 PSA 10',
      player: 'Paul Skenes',
      currentValue: 195,
      projectedGrowth: 0.60,
      catalyst: 'First full MLB season, Cy Young contender',
      catalystDate: '2026-04-01',
      sport: 'baseball',
    },
    expectedGain: 117,
    confidence: 79,
    rationale: 'Franco cards carry off-field risk premium that has destroyed value permanently. Skenes is the most electric young arm in baseball coming off a dominant debut. Rotating from a toxic asset to the next ace is the strongest baseball swap available.',
    timeframe: '3-6 months',
    riskLevel: 'low',
  },
  {
    id: 'swap-009',
    fromAsset: mockDeadMoneyAssets[2], // Tua Tagovailoa
    toAsset: {
      name: '2024 Prizm Drake Maye RC #290 PSA 10',
      player: 'Drake Maye',
      currentValue: 80,
      projectedGrowth: 0.38,
      catalyst: 'Full second season as Patriots starter',
      catalystDate: '2026-09-01',
      sport: 'football',
    },
    expectedGain: 30,
    confidence: 62,
    rationale: 'Tua has concussion history concerns capping his market ceiling permanently. Maye showed flashes as a rookie and has the draft pedigree to bounce. Exiting Tua for a young QB with cleaner trajectory is the smart play.',
    timeframe: '6-12 months',
    riskLevel: 'high',
  },
  {
    id: 'swap-010',
    fromAsset: mockDeadMoneyAssets[12], // Jordan Love
    toAsset: {
      name: '2023 Prizm Anthony Richardson RC #255 PSA 10',
      player: 'Anthony Richardson',
      currentValue: 110,
      projectedGrowth: 0.42,
      catalyst: 'Full healthy season with Colts, electric dual-threat upside',
      catalystDate: '2026-09-01',
      sport: 'football',
    },
    expectedGain: 46,
    confidence: 65,
    rationale: 'Love has underperformed post-Rodgers expectations and the market has cooled significantly. Richardson has generational athleticism and if healthy could be a top-5 fantasy QB. The upside delta strongly favors AR.',
    timeframe: '6-9 months',
    riskLevel: 'high',
  },
  {
    id: 'swap-011',
    fromAsset: mockDeadMoneyAssets[15], // Adley Rutschman
    toAsset: {
      name: '2024 Bowman Chrome Ethan Salas 1st #BCP-1 PSA 10',
      player: 'Ethan Salas',
      currentValue: 90,
      projectedGrowth: 0.70,
      catalyst: 'Top prospect hype, potential call-up speculation',
      catalystDate: '2026-07-01',
      sport: 'baseball',
    },
    expectedGain: 63,
    confidence: 58,
    rationale: 'Rutschman has settled into a steady-but-unspectacular market profile. Salas is the hottest prospect in baseball with massive Bowman hype. Prospect speculation trades tend to outperform established-but-flat players in short windows.',
    timeframe: '3-6 months',
    riskLevel: 'high',
  },
];

const mockCatalystOutlooks: CatalystOutlook[] = [
  { id: 'cat-001', cardId: 'dm-006', cardName: '2021 Topps Chrome Luis Robert Jr RC', player: 'Luis Robert Jr', catalystType: 'MLB Season Start', catalystDate: '2026-03-27', expectedImpact: 15, description: 'Opening Day — potential trade to contender if White Sox sell', likelihood: 65 },
  { id: 'cat-002', cardId: 'dm-008', cardName: '2020 Topps Chrome Yordan Alvarez RC', player: 'Yordan Alvarez', catalystType: 'Contract Extension', catalystDate: '2026-04-15', expectedImpact: 20, description: 'Rumored mega-extension with Astros would boost long-term value', likelihood: 55 },
  { id: 'cat-003', cardId: 'dm-011', cardName: '2022 Prizm Paolo Banchero RC', player: 'Paolo Banchero', catalystType: 'NBA Playoffs', catalystDate: '2026-04-20', expectedImpact: 25, description: 'Magic playoff run — first postseason exposure for Banchero cards', likelihood: 70 },
  { id: 'cat-004', cardId: 'dm-012', cardName: '2021 Topps Chrome CJ Stroud RC', player: 'CJ Stroud', catalystType: 'NFL Draft Upgrade', catalystDate: '2026-04-24', expectedImpact: 18, description: 'Texans add weapons in draft, boosting Stroud outlook', likelihood: 75 },
  { id: 'cat-005', cardId: 'dm-014', cardName: '2022 Topps Chrome Bobby Witt Jr RC', player: 'Bobby Witt Jr', catalystType: 'MVP Race', catalystDate: '2026-07-15', expectedImpact: 30, description: 'Early MVP candidate if Royals remain competitive', likelihood: 50 },
  { id: 'cat-006', cardId: 'dm-004', cardName: '2021 Panini Select Zion Williamson', player: 'Zion Williamson', catalystType: 'Healthy Season', catalystDate: '2026-10-20', expectedImpact: 35, description: 'If healthy for full season, cards could see 30%+ bounce', likelihood: 25 },
  { id: 'cat-007', cardId: 'dm-013', cardName: '2020 Panini Contenders Jordan Love RC Auto', player: 'Jordan Love', catalystType: 'NFL Season Start', catalystDate: '2026-09-07', expectedImpact: 12, description: 'Year 3 as Packers starter — prove-it season', likelihood: 45 },
];

// ── Service Functions ────────────────────────────────────────────────────────────

export function scanPortfolio(): DeadMoneyAsset[] {
  return [...mockDeadMoneyAssets].sort((a, b) => b.deadMoneyScore - a.deadMoneyScore);
}

export function getDeadMoneyScore(): number {
  const avg = mockDeadMoneyAssets.reduce((sum, a) => sum + a.deadMoneyScore, 0) / mockDeadMoneyAssets.length;
  return Math.round(100 - avg);
}

export function getSwapRecommendations(): SwapRecommendation[] {
  return [...mockSwapRecommendations].sort((a, b) => b.confidence - a.confidence);
}

export function getCapitalEfficiency(): CapitalEfficiency {
  const totalValue = mockDeadMoneyAssets.reduce((s, a) => s + a.currentValue, 0);
  const deadValue = mockDeadMoneyAssets.filter(a => a.deadMoneyScore >= 60).reduce((s, a) => s + a.currentValue, 0);
  const productiveValue = totalValue - deadValue;

  const history: CapitalEfficiency['productiveHistory'] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const baseProductive = productiveValue * (0.85 + i * 0.012);
    const baseDead = deadValue * (1.15 - i * 0.01);
    history.push({
      date: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      productive: Math.round(baseProductive + Math.random() * 200 - 100),
      dead: Math.round(baseDead + Math.random() * 150 - 75),
    });
  }

  return {
    productiveCapital: productiveValue,
    deadCapital: deadValue,
    totalPortfolioValue: totalValue,
    efficiencyRatio: Math.round((productiveValue / totalValue) * 100),
    productiveHistory: history,
  };
}

export function getOpportunityCost(days: number): OpportunityCost {
  const deadAssets = mockDeadMoneyAssets.filter(a => a.deadMoneyScore >= 60);
  const totalCost = deadAssets.reduce((s, a) => s + a.opportunityCostPerDay * Math.min(days, a.stagnationDays), 0);
  const benchmarkReturn = 0.12; // 12% annual benchmark

  return {
    totalCost: Math.round(totalCost),
    dailyAverage: Math.round(totalCost / days),
    missedGains: Math.round(totalCost * 1.3),
    benchmarkReturn,
    costByAsset: deadAssets.map(a => ({
      cardName: a.player,
      cost: Math.round(a.opportunityCostPerDay * Math.min(days, a.stagnationDays)),
    })).sort((a, b) => b.cost - a.cost),
    period: days,
  };
}

export function getRedeploymentStrategies(): RedeploymentStrategy[] {
  return [
    {
      id: 'strat-001',
      name: 'Aggressive Growth Rotation',
      description: 'Liquidate all high dead-money-score assets and redeploy into young franchise QB and generational prospects with upcoming catalysts.',
      expectedReturn: 38,
      risk: 'high',
      timeframe: '6-12 months',
      assetsToSell: ['dm-001', 'dm-003', 'dm-005', 'dm-007', 'dm-015', 'dm-017'],
      capitalFreed: 460,
      targetAllocations: [
        { category: 'Young QBs (Year 2)', percentage: 40, rationale: 'Highest ceiling in sports cards — sophomore breakouts drive massive gains' },
        { category: 'MLB Top Prospects', percentage: 30, rationale: 'Bowman/Topps Chrome rookies with call-up catalysts' },
        { category: 'NBA Playoff Contenders', percentage: 20, rationale: 'Playoff exposure drives short-term price spikes' },
        { category: 'Cash Reserve', percentage: 10, rationale: 'Dry powder for opportunistic buys' },
      ],
    },
    {
      id: 'strat-002',
      name: 'Balanced Reallocation',
      description: 'Sell the worst 50% of dead money positions and spread capital across diversified high-liquidity assets.',
      expectedReturn: 22,
      risk: 'medium',
      timeframe: '6-9 months',
      assetsToSell: ['dm-005', 'dm-015', 'dm-017', 'dm-003', 'dm-001'],
      capitalFreed: 392,
      targetAllocations: [
        { category: 'Blue-Chip Veterans', percentage: 35, rationale: 'Stable value with high liquidity — easy exit' },
        { category: 'Rising Sophomores', percentage: 30, rationale: 'Year-2 breakout candidates across all sports' },
        { category: 'Graded Vintage', percentage: 20, rationale: 'Counter-cyclical hedge with steady appreciation' },
        { category: 'Cash Reserve', percentage: 15, rationale: 'Flexibility for market dips' },
      ],
    },
    {
      id: 'strat-003',
      name: 'Capital Preservation',
      description: 'Trim only the most toxic positions and rotate into high-liquidity, low-volatility blue chips.',
      expectedReturn: 12,
      risk: 'low',
      timeframe: '3-6 months',
      assetsToSell: ['dm-005', 'dm-015', 'dm-017'],
      capitalFreed: 125,
      targetAllocations: [
        { category: 'Established Stars (PSA 10)', percentage: 50, rationale: 'Patrick Mahomes, Shohei Ohtani — proven market leaders' },
        { category: 'High-Volume Rookies', percentage: 30, rationale: 'Liquid positions easy to exit if needed' },
        { category: 'Cash Reserve', percentage: 20, rationale: 'Maximum flexibility' },
      ],
    },
  ];
}

export function getPortfolioVelocity(): AssetVelocity[] {
  return mockDeadMoneyAssets.map(a => ({
    cardId: a.cardId,
    cardName: a.cardName,
    player: a.player,
    appreciationRate: a.appreciationRate * 100,
    liquidityScore: a.volume30d * 4 + (a.liquidityTrend === 'improving' ? 20 : a.liquidityTrend === 'flat' ? 10 : 0),
    quadrant: (
      a.appreciationRate > -0.1 && a.volume30d >= 10 ? 'star' :
      a.appreciationRate > -0.1 && a.volume30d < 10 ? 'sleeper' :
      a.appreciationRate <= -0.1 && a.volume30d < 10 ? 'dead' :
      'fading'
    ) as AssetVelocity['quadrant'],
    deadMoneyScore: a.deadMoneyScore,
  }));
}

export function getDeadMoneyTrend(days: number): DeadMoneyTrend[] {
  const trends: DeadMoneyTrend[] = [];
  const intervals = Math.min(days, 12);
  const step = Math.floor(days / intervals);

  for (let i = intervals; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * step);
    const baseCount = 8 + Math.floor(i * 0.5);
    const baseValue = 900 + i * 60;
    trends.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      deadMoneyCount: baseCount + Math.floor(Math.random() * 3),
      deadMoneyValue: baseValue + Math.floor(Math.random() * 200),
      portfolioPercentage: 28 + i * 1.5 + Math.random() * 3,
      avgScore: 62 + i * 1.2 + Math.random() * 5,
    });
  }
  return trends;
}

export function getDeadMoneyAlerts(): DeadMoneyAlert[] {
  return [
    { id: 'alert-001', cardId: 'dm-017', cardName: '2021 Topps Wander Franco RC', player: 'Wander Franco', severity: 'critical', message: 'Card has lost 84.5% of purchase value with zero recovery catalyst. Immediate liquidation recommended.', timestamp: '2026-03-15T08:22:00Z', daysStagnant: 1000, opportunityCost: 1550, read: false },
    { id: 'alert-002', cardId: 'dm-005', cardName: '2022 Donruss Optic Malik Willis RC', player: 'Malik Willis', severity: 'critical', message: 'Zero 30-day sales volume. Card is effectively illiquid — accept losses and exit.', timestamp: '2026-03-15T07:45:00Z', daysStagnant: 850, opportunityCost: 272, read: false },
    { id: 'alert-003', cardId: 'dm-015', cardName: '2021 Prizm Mac Jones RC', player: 'Mac Jones', severity: 'critical', message: 'Asset has depreciated 86% with continued downward trajectory. No market recovery path visible.', timestamp: '2026-03-14T16:30:00Z', daysStagnant: 900, opportunityCost: 648, read: false },
    { id: 'alert-004', cardId: 'dm-003', cardName: '2020 Mosaic Tua Tagovailoa RC', player: 'Tua Tagovailoa', severity: 'critical', message: 'Health concerns have permanently capped this asset. Declining liquidity signals further erosion.', timestamp: '2026-03-14T12:00:00Z', daysStagnant: 780, opportunityCost: 874, read: true },
    { id: 'alert-005', cardId: 'dm-001', cardName: '2021 Prizm Trevor Lawrence RC', player: 'Trevor Lawrence', severity: 'warning', message: 'Former #1 pick card stagnant for 540 days. Market has repriced expectations permanently.', timestamp: '2026-03-13T10:15:00Z', daysStagnant: 540, opportunityCost: 470, read: true },
    { id: 'alert-006', cardId: 'dm-004', cardName: '2021 Select Zion Williamson', player: 'Zion Williamson', severity: 'warning', message: 'Injury risk premium continues to weigh on valuation. Consider swap to Wembanyama.', timestamp: '2026-03-12T14:00:00Z', daysStagnant: 620, opportunityCost: 589, read: true },
    { id: 'alert-007', cardId: 'dm-009', cardName: '2021 Prizm Cade Cunningham RC', player: 'Cade Cunningham', severity: 'warning', message: 'Rebuilding team limits national exposure. 53% value decline with no reversal catalyst before next season.', timestamp: '2026-03-11T09:30:00Z', daysStagnant: 490, opportunityCost: 319, read: false },
    { id: 'alert-008', cardId: 'dm-013', cardName: '2020 Contenders Jordan Love RC Auto', player: 'Jordan Love', severity: 'info', message: 'Performance has not matched post-Rodgers hype. Monitor through draft for potential weapon upgrades.', timestamp: '2026-03-10T11:45:00Z', daysStagnant: 410, opportunityCost: 320, read: true },
  ];
}

export function getHealthScore(): PortfolioHealthScore {
  const totalVal = mockDeadMoneyAssets.reduce((s, a) => s + a.currentValue, 0);
  const deadVal = mockDeadMoneyAssets.filter(a => a.deadMoneyScore >= 60).reduce((s, a) => s + a.currentValue, 0);
  const deadPct = (deadVal / totalVal) * 100;

  return {
    score: 42,
    grade: 'D+',
    deadMoneyPercentage: Math.round(deadPct),
    avgVelocity: -14.2,
    catalystCoverage: 35,
    liquidityScore: 38,
    diversificationScore: 55,
    recommendations: [
      'Liquidate 6 critical dead-money positions to free $460 in capital',
      'Increase catalyst coverage — 65% of portfolio has no upcoming catalyst',
      'Improve liquidity by rotating into higher-volume cards',
      'Diversify out of football (currently 47% of dead money)',
      'Target assets with 90-day volume above 15 for better exit flexibility',
    ],
  };
}

export function simulateSwap(fromId: string, toId: string): { projectedGain: number; riskScore: number; timeline: { month: string; fromValue: number; toValue: number }[] } {
  const fromAsset = mockDeadMoneyAssets.find(a => a.cardId === fromId);
  const swap = mockSwapRecommendations.find(s => s.fromAsset.cardId === fromId);

  const fromValue = fromAsset?.currentValue ?? 100;
  const toGrowth = swap?.toAsset.projectedGrowth ?? 0.3;
  const toValue = swap?.toAsset.currentValue ?? fromValue;

  const timeline = [];
  for (let i = 0; i <= 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    timeline.push({
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      fromValue: Math.round(fromValue * (1 + (fromAsset?.appreciationRate ?? -0.15) * (i / 12))),
      toValue: Math.round(toValue * (1 + toGrowth * (i / 12))),
    });
  }

  return {
    projectedGain: swap?.expectedGain ?? Math.round(fromValue * 0.25),
    riskScore: swap ? (swap.riskLevel === 'low' ? 25 : swap.riskLevel === 'medium' ? 55 : 78) : 50,
    timeline,
  };
}

export function getCatalystOutlooks(): CatalystOutlook[] {
  return [...mockCatalystOutlooks].sort((a, b) => new Date(a.catalystDate).getTime() - new Date(b.catalystDate).getTime());
}

export function getStagnationMetrics(): StagnationMetrics {
  const deadAssets = mockDeadMoneyAssets.filter(a => a.deadMoneyScore >= 60);
  return {
    totalStagnantValue: deadAssets.reduce((s, a) => s + a.currentValue, 0),
    avgStagnationDays: Math.round(deadAssets.reduce((s, a) => s + a.stagnationDays, 0) / deadAssets.length),
    worstOffender: 'Wander Franco',
    stagnationRate: Math.round((deadAssets.length / mockDeadMoneyAssets.length) * 100),
    portfolioDrag: -8.3,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
