// Phase 150: AI Collection Appraiser & Insurance Valuation
// Provides AI-powered appraisals, insurance valuations, and depreciation tracking for card collections

// ---- Types ----

export type AppraisalType =
  | 'fair_market_value'
  | 'insurance_replacement'
  | 'liquidation'
  | 'auction_estimate'
  | 'private_sale'
  | 'retail_replacement';

export interface AppraisalReport {
  id: string;
  collectionName: string;
  appraisalDate: string;
  appraisalType: AppraisalType;
  totalCards: number;
  totalFairMarketValue: number;
  totalInsuranceValue: number;
  totalLiquidationValue: number;
  highestValueCard: string;
  averageCardValue: number;
  appreciationRate: number;
  riskScore: number;
  recommendations: string[];
  status: 'draft' | 'final' | 'certified';
}

export interface CardAppraisal {
  id: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  grade: string;
  grader: 'PSA' | 'BGS' | 'SGC' | 'CGC' | 'raw';
  fairMarketValue: number;
  insuranceValue: number;
  liquidationValue: number;
  replacementCost: number;
  condition: 'mint' | 'near_mint' | 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
  lastSaleDate: string;
  lastSalePrice: number;
  priceHistory: { date: string; value: number }[];
  appreciationRate: number;
  riskFactors: string[];
  notes: string;
}

export interface InsuranceCoverage {
  id: string;
  provider: string;
  coverageType: 'blanket' | 'scheduled' | 'valuable_articles' | 'transit' | 'exhibition';
  premium: number;
  deductible: number;
  coverageLimit: number;
  coveredPerils: string[];
  exclusions: string[];
  renewalDate: string;
  recommended: boolean;
  rating: number;
  description: string;
}

export interface DepreciationSchedule {
  id: string;
  cardId: string;
  cardName: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  annualDepreciation: number;
  projectedValues: { year: number; value: number }[];
  depreciationType: 'straight_line' | 'accelerated' | 'appreciating';
}

export interface ReplacementCost {
  id: string;
  cardId: string;
  cardName: string;
  currentMarketPrice: number;
  replacementPremium: number;
  totalReplacementCost: number;
  availability: 'readily_available' | 'scarce' | 'very_scarce' | 'nearly_impossible';
  estimatedSearchTime: string;
  alternativeOptions: string[];
}

export interface ComparableValue {
  id: string;
  cardName: string;
  saleDate: string;
  salePrice: number;
  platform: string;
  grade: string;
  grader: string;
  auctionHouse: string;
  notes: string;
  verified: boolean;
}

export interface AppraisalHistory {
  id: string;
  cardId: string;
  appraisalDate: string;
  appraiser: string;
  fairMarketValue: number;
  insuranceValue: number;
  method: string;
  notes: string;
}

export interface CollectionSummary {
  totalCards: number;
  totalValue: number;
  totalInsuranceValue: number;
  averageCardValue: number;
  highestValueCard: CardAppraisal;
  lowestValueCard: CardAppraisal;
  topAppreciating: CardAppraisal[];
  topDepreciating: CardAppraisal[];
  riskScore: number;
  diversificationScore: number;
  concentrationRisk: number;
}

export interface RiskFactor {
  id: string;
  category: 'market' | 'condition' | 'authenticity' | 'storage' | 'liquidity' | 'concentration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
  affectedCards: string[];
  impactEstimate: number;
}

export interface CoverageRecommendation {
  id: string;
  coverageType: InsuranceCoverage['coverageType'];
  provider: string;
  estimatedPremium: number;
  reasoning: string;
  priority: 'essential' | 'recommended' | 'optional';
  collectionValueThreshold: number;
}

export interface AppraisalCertificate {
  id: string;
  reportId: string;
  certificationDate: string;
  certifier: string;
  totalValue: number;
  methodology: string;
  validUntil: string;
  cardCount: number;
  purpose: 'insurance' | 'estate' | 'sale' | 'donation' | 'legal';
}

// ---- Constants ----

const STORAGE_KEY = 'msi_collection_appraiser';

export function getAppraisalTypeConfig(type: AppraisalType): { label: string; color: string; bg: string; border: string } {
  const configs: Record<AppraisalType, { label: string; color: string; bg: string; border: string }> = {
    fair_market_value:    { label: 'Fair Market Value',    color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30' },
    insurance_replacement: { label: 'Insurance Replacement', color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
    liquidation:          { label: 'Liquidation',          color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
    auction_estimate:     { label: 'Auction Estimate',     color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30' },
    private_sale:         { label: 'Private Sale',         color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    retail_replacement:   { label: 'Retail Replacement',   color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30' },
  };
  return configs[type];
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

// ---- Seed Data ----

const CARD_APPRAISALS: CardAppraisal[] = [
  {
    id: 'ca_001',
    cardName: '2018 Topps Chrome Shohei Ohtani RC Auto PSA 10',
    player: 'Shohei Ohtani',
    year: 2018,
    set: 'Topps Chrome',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 12500,
    insuranceValue: 16250,
    liquidationValue: 9375,
    replacementCost: 14000,
    condition: 'mint',
    lastSaleDate: '2025-02-15',
    lastSalePrice: 12800,
    priceHistory: [{ date: '2024-01', value: 8500 }, { date: '2024-06', value: 10200 }, { date: '2025-01', value: 12500 }],
    appreciationRate: 22.5,
    riskFactors: ['Player injury risk', 'Market volatility'],
    notes: 'Key modern card, strong long-term hold',
  },
  {
    id: 'ca_002',
    cardName: '1986 Fleer Michael Jordan RC BGS 9.5',
    player: 'Michael Jordan',
    year: 1986,
    set: 'Fleer',
    grade: '9.5',
    grader: 'BGS',
    fairMarketValue: 45000,
    insuranceValue: 58500,
    liquidationValue: 33750,
    replacementCost: 50000,
    condition: 'mint',
    lastSaleDate: '2025-01-20',
    lastSalePrice: 46200,
    priceHistory: [{ date: '2024-01', value: 42000 }, { date: '2024-06', value: 44000 }, { date: '2025-01', value: 45000 }],
    appreciationRate: 7.1,
    riskFactors: ['Vintage condition sensitivity', 'High concentration risk'],
    notes: 'Iconic card, blue-chip investment',
  },
  {
    id: 'ca_003',
    cardName: '2019 Bowman Chrome Julio Rodriguez 1st Auto PSA 10',
    player: 'Julio Rodriguez',
    year: 2019,
    set: 'Bowman Chrome',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 3800,
    insuranceValue: 4940,
    liquidationValue: 2850,
    replacementCost: 4200,
    condition: 'mint',
    lastSaleDate: '2025-03-01',
    lastSalePrice: 3750,
    priceHistory: [{ date: '2024-01', value: 5200 }, { date: '2024-06', value: 4100 }, { date: '2025-01', value: 3800 }],
    appreciationRate: -26.9,
    riskFactors: ['Performance dependency', 'Recent decline'],
    notes: 'Monitoring for rebound potential',
  },
  {
    id: 'ca_004',
    cardName: '2003 Topps Chrome LeBron James RC PSA 10',
    player: 'LeBron James',
    year: 2003,
    set: 'Topps Chrome',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 35000,
    insuranceValue: 45500,
    liquidationValue: 26250,
    replacementCost: 38000,
    condition: 'mint',
    lastSaleDate: '2025-02-10',
    lastSalePrice: 34500,
    priceHistory: [{ date: '2024-01', value: 30000 }, { date: '2024-06', value: 32000 }, { date: '2025-01', value: 35000 }],
    appreciationRate: 16.7,
    riskFactors: ['Retirement timeline', 'High PSA 10 pop'],
    notes: 'GOAT-tier card with steady appreciation',
  },
  {
    id: 'ca_005',
    cardName: '2001 SP Authentic Tiger Woods RC Auto PSA 9',
    player: 'Tiger Woods',
    year: 2001,
    set: 'SP Authentic',
    grade: '9',
    grader: 'PSA',
    fairMarketValue: 18000,
    insuranceValue: 23400,
    liquidationValue: 13500,
    replacementCost: 20000,
    condition: 'near_mint',
    lastSaleDate: '2025-01-05',
    lastSalePrice: 17500,
    priceHistory: [{ date: '2024-01', value: 15000 }, { date: '2024-06', value: 16500 }, { date: '2025-01', value: 18000 }],
    appreciationRate: 20.0,
    riskFactors: ['Non-traditional sport card', 'Limited collector base'],
    notes: 'Iconic golf card, crossover appeal',
  },
  {
    id: 'ca_006',
    cardName: '2023 Bowman Chrome Victor Wembanyama 1st PSA 10',
    player: 'Victor Wembanyama',
    year: 2023,
    set: 'Bowman Chrome',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 8500,
    insuranceValue: 11050,
    liquidationValue: 6375,
    replacementCost: 9500,
    condition: 'mint',
    lastSaleDate: '2025-03-10',
    lastSalePrice: 8800,
    priceHistory: [{ date: '2024-01', value: 12000 }, { date: '2024-06', value: 9500 }, { date: '2025-01', value: 8500 }],
    appreciationRate: -29.2,
    riskFactors: ['Rookie volatility', 'Performance dependency'],
    notes: 'Generational prospect, long-term hold candidate',
  },
  {
    id: 'ca_007',
    cardName: '1952 Topps Mickey Mantle SGC 4',
    player: 'Mickey Mantle',
    year: 1952,
    set: 'Topps',
    grade: '4',
    grader: 'SGC',
    fairMarketValue: 185000,
    insuranceValue: 240500,
    liquidationValue: 138750,
    replacementCost: 210000,
    condition: 'very_good',
    lastSaleDate: '2025-01-15',
    lastSalePrice: 182000,
    priceHistory: [{ date: '2024-01', value: 170000 }, { date: '2024-06', value: 175000 }, { date: '2025-01', value: 185000 }],
    appreciationRate: 8.8,
    riskFactors: ['Ultra-high value concentration', 'Storage and security'],
    notes: 'The holy grail of baseball cards',
  },
  {
    id: 'ca_008',
    cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10',
    player: 'Luka Doncic',
    year: 2018,
    set: 'Panini Prizm',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 5500,
    insuranceValue: 7150,
    liquidationValue: 4125,
    replacementCost: 6200,
    condition: 'mint',
    lastSaleDate: '2025-02-28',
    lastSalePrice: 5400,
    priceHistory: [{ date: '2024-01', value: 4800 }, { date: '2024-06', value: 5000 }, { date: '2025-01', value: 5500 }],
    appreciationRate: 14.6,
    riskFactors: ['International market dependency'],
    notes: 'Top NBA asset, strong demand',
  },
  {
    id: 'ca_009',
    cardName: '2020 Topps Chrome Luis Robert Jr. RC Auto PSA 10',
    player: 'Luis Robert Jr.',
    year: 2020,
    set: 'Topps Chrome',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 2200,
    insuranceValue: 2860,
    liquidationValue: 1650,
    replacementCost: 2500,
    condition: 'mint',
    lastSaleDate: '2025-03-05',
    lastSalePrice: 2350,
    priceHistory: [{ date: '2024-01', value: 1500 }, { date: '2024-06', value: 1800 }, { date: '2025-01', value: 2200 }],
    appreciationRate: 46.7,
    riskFactors: ['Injury history', 'Team change volatility'],
    notes: 'Dodgers trade boosted value significantly',
  },
  {
    id: 'ca_010',
    cardName: '1989 Upper Deck Ken Griffey Jr. RC PSA 10',
    player: 'Ken Griffey Jr.',
    year: 1989,
    set: 'Upper Deck',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 4500,
    insuranceValue: 5850,
    liquidationValue: 3375,
    replacementCost: 5000,
    condition: 'mint',
    lastSaleDate: '2025-02-20',
    lastSalePrice: 4600,
    priceHistory: [{ date: '2024-01', value: 4000 }, { date: '2024-06', value: 4200 }, { date: '2025-01', value: 4500 }],
    appreciationRate: 12.5,
    riskFactors: ['High population', 'Junk wax era stigma'],
    notes: 'Iconic rookie card, steady performer',
  },
  {
    id: 'ca_011',
    cardName: '2024 Topps Chrome Elly De La Cruz RC Auto PSA 10',
    player: 'Elly De La Cruz',
    year: 2024,
    set: 'Topps Chrome',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 1800,
    insuranceValue: 2340,
    liquidationValue: 1350,
    replacementCost: 2000,
    condition: 'mint',
    lastSaleDate: '2025-03-08',
    lastSalePrice: 1850,
    priceHistory: [{ date: '2024-06', value: 2500 }, { date: '2024-09', value: 2100 }, { date: '2025-01', value: 1800 }],
    appreciationRate: -28.0,
    riskFactors: ['Sophomore slump risk', 'Strikeout concerns'],
    notes: 'Electric talent, high ceiling/floor gap',
  },
  {
    id: 'ca_012',
    cardName: '2017 Panini Prizm Patrick Mahomes Silver RC PSA 10',
    player: 'Patrick Mahomes',
    year: 2017,
    set: 'Panini Prizm',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 15000,
    insuranceValue: 19500,
    liquidationValue: 11250,
    replacementCost: 17000,
    condition: 'mint',
    lastSaleDate: '2025-02-05',
    lastSalePrice: 15500,
    priceHistory: [{ date: '2024-01', value: 12000 }, { date: '2024-06', value: 13500 }, { date: '2025-01', value: 15000 }],
    appreciationRate: 25.0,
    riskFactors: ['Dynasty fatigue', 'NFL concussion risk'],
    notes: 'Best modern NFL investment card',
  },
  {
    id: 'ca_013',
    cardName: '2011 Topps Update Mike Trout RC PSA 10',
    player: 'Mike Trout',
    year: 2011,
    set: 'Topps Update',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 28000,
    insuranceValue: 36400,
    liquidationValue: 21000,
    replacementCost: 32000,
    condition: 'mint',
    lastSaleDate: '2025-01-28',
    lastSalePrice: 27500,
    priceHistory: [{ date: '2024-01', value: 25000 }, { date: '2024-06', value: 26500 }, { date: '2025-01', value: 28000 }],
    appreciationRate: 12.0,
    riskFactors: ['Injury history', 'Career wind-down'],
    notes: 'Best player of generation, blue-chip hold',
  },
  {
    id: 'ca_014',
    cardName: '2019 Topps Chrome Fernando Tatis Jr. RC PSA 10',
    player: 'Fernando Tatis Jr.',
    year: 2019,
    set: 'Topps Chrome',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 900,
    insuranceValue: 1170,
    liquidationValue: 675,
    replacementCost: 1000,
    condition: 'mint',
    lastSaleDate: '2025-02-18',
    lastSalePrice: 880,
    priceHistory: [{ date: '2024-01', value: 1400 }, { date: '2024-06', value: 1100 }, { date: '2025-01', value: 900 }],
    appreciationRate: -35.7,
    riskFactors: ['Suspension history', 'Injury risk', 'Declining performance'],
    notes: 'Fallen star, speculative hold only',
  },
  {
    id: 'ca_015',
    cardName: '2023 Topps Chrome Jackson Holliday 1st Auto PSA 10',
    player: 'Jackson Holliday',
    year: 2023,
    set: 'Topps Chrome',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 3200,
    insuranceValue: 4160,
    liquidationValue: 2400,
    replacementCost: 3600,
    condition: 'mint',
    lastSaleDate: '2025-03-12',
    lastSalePrice: 3300,
    priceHistory: [{ date: '2024-01', value: 4500 }, { date: '2024-06', value: 3800 }, { date: '2025-01', value: 3200 }],
    appreciationRate: -28.9,
    riskFactors: ['Prospect bust risk', 'MLB adjustment period'],
    notes: 'Top prospect, volatile pricing expected',
  },
  {
    id: 'ca_016',
    cardName: '1993 SP Derek Jeter RC PSA 10',
    player: 'Derek Jeter',
    year: 1993,
    set: 'SP',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 42000,
    insuranceValue: 54600,
    liquidationValue: 31500,
    replacementCost: 48000,
    condition: 'mint',
    lastSaleDate: '2025-01-10',
    lastSalePrice: 41500,
    priceHistory: [{ date: '2024-01', value: 38000 }, { date: '2024-06', value: 40000 }, { date: '2025-01', value: 42000 }],
    appreciationRate: 10.5,
    riskFactors: ['Low PSA 10 pop scarcity premium', 'HOF stable'],
    notes: 'Iconic RC, scarcity drives premium',
  },
  {
    id: 'ca_017',
    cardName: '2022 Panini Prizm Paolo Banchero Silver RC PSA 10',
    player: 'Paolo Banchero',
    year: 2022,
    set: 'Panini Prizm',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 320,
    insuranceValue: 416,
    liquidationValue: 240,
    replacementCost: 360,
    condition: 'mint',
    lastSaleDate: '2025-03-01',
    lastSalePrice: 310,
    priceHistory: [{ date: '2024-01', value: 450 }, { date: '2024-06', value: 380 }, { date: '2025-01', value: 320 }],
    appreciationRate: -28.9,
    riskFactors: ['Team market size', 'Development uncertainty'],
    notes: 'Solid young player, depressed pricing',
  },
  {
    id: 'ca_018',
    cardName: '2024 Prizm Caleb Williams Silver RC PSA 10',
    player: 'Caleb Williams',
    year: 2024,
    set: 'Panini Prizm',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 850,
    insuranceValue: 1105,
    liquidationValue: 638,
    replacementCost: 950,
    condition: 'mint',
    lastSaleDate: '2025-03-05',
    lastSalePrice: 820,
    priceHistory: [{ date: '2024-09', value: 1500 }, { date: '2024-12', value: 1100 }, { date: '2025-03', value: 850 }],
    appreciationRate: -43.3,
    riskFactors: ['Rookie year struggles', 'Injury concerns', 'Regime change risk'],
    notes: 'High-risk speculative play',
  },
  {
    id: 'ca_019',
    cardName: '2023 Upper Deck Connor Bedard Young Guns RC PSA 10',
    player: 'Connor Bedard',
    year: 2023,
    set: 'Upper Deck',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 2800,
    insuranceValue: 3640,
    liquidationValue: 2100,
    replacementCost: 3200,
    condition: 'mint',
    lastSaleDate: '2025-02-25',
    lastSalePrice: 2750,
    priceHistory: [{ date: '2024-01', value: 3500 }, { date: '2024-06', value: 3100 }, { date: '2025-01', value: 2800 }],
    appreciationRate: -20.0,
    riskFactors: ['Team competitiveness', 'Development timeline'],
    notes: 'Generational hockey talent, long-term play',
  },
  {
    id: 'ca_020',
    cardName: '2019 Topps Chrome Juan Soto RC PSA 10',
    player: 'Juan Soto',
    year: 2019,
    set: 'Topps Chrome',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 1800,
    insuranceValue: 2340,
    liquidationValue: 1350,
    replacementCost: 2000,
    condition: 'mint',
    lastSaleDate: '2025-03-10',
    lastSalePrice: 1850,
    priceHistory: [{ date: '2024-01', value: 1200 }, { date: '2024-06', value: 1500 }, { date: '2025-01', value: 1800 }],
    appreciationRate: 50.0,
    riskFactors: ['Contract front-loaded', 'Aging curve'],
    notes: 'Mets mega-deal boosted value significantly',
  },
  {
    id: 'ca_021',
    cardName: '2020 Panini Prizm Justin Herbert Silver RC PSA 10',
    player: 'Justin Herbert',
    year: 2020,
    set: 'Panini Prizm',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 1200,
    insuranceValue: 1560,
    liquidationValue: 900,
    replacementCost: 1350,
    condition: 'mint',
    lastSaleDate: '2025-02-14',
    lastSalePrice: 1180,
    priceHistory: [{ date: '2024-01', value: 1000 }, { date: '2024-06', value: 1100 }, { date: '2025-01', value: 1200 }],
    appreciationRate: 20.0,
    riskFactors: ['Team competitiveness', 'High PSA 10 pop'],
    notes: 'Elite QB talent, steady growth',
  },
  {
    id: 'ca_022',
    cardName: '2018 Topps Update Ronald Acuna Jr. RC PSA 10',
    player: 'Ronald Acuna Jr.',
    year: 2018,
    set: 'Topps Update',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 550,
    insuranceValue: 715,
    liquidationValue: 413,
    replacementCost: 620,
    condition: 'mint',
    lastSaleDate: '2025-03-02',
    lastSalePrice: 540,
    priceHistory: [{ date: '2024-01', value: 700 }, { date: '2024-06', value: 600 }, { date: '2025-01', value: 550 }],
    appreciationRate: -21.4,
    riskFactors: ['ACL injury history', 'Recovery timeline'],
    notes: 'Generational talent recovering from injury',
  },
  {
    id: 'ca_023',
    cardName: '1979 OPC Wayne Gretzky RC PSA 7',
    player: 'Wayne Gretzky',
    year: 1979,
    set: 'O-Pee-Chee',
    grade: '7',
    grader: 'PSA',
    fairMarketValue: 55000,
    insuranceValue: 71500,
    liquidationValue: 41250,
    replacementCost: 62000,
    condition: 'very_good',
    lastSaleDate: '2025-01-20',
    lastSalePrice: 54000,
    priceHistory: [{ date: '2024-01', value: 48000 }, { date: '2024-06', value: 52000 }, { date: '2025-01', value: 55000 }],
    appreciationRate: 14.6,
    riskFactors: ['Vintage condition sensitivity', 'Ultra-high value'],
    notes: 'The Great One, hockey GOAT card',
  },
  {
    id: 'ca_024',
    cardName: '2024 Bowman Chrome Paul Skenes 1st Auto PSA 10',
    player: 'Paul Skenes',
    year: 2024,
    set: 'Bowman Chrome',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 4200,
    insuranceValue: 5460,
    liquidationValue: 3150,
    replacementCost: 4800,
    condition: 'mint',
    lastSaleDate: '2025-03-08',
    lastSalePrice: 4350,
    priceHistory: [{ date: '2024-06', value: 6000 }, { date: '2024-09', value: 5000 }, { date: '2025-01', value: 4200 }],
    appreciationRate: -30.0,
    riskFactors: ['Pitching injury risk', 'Innings limits'],
    notes: 'Dominant pitcher prospect, volatile pricing',
  },
  {
    id: 'ca_025',
    cardName: '2020 Panini Prizm Anthony Edwards Silver RC PSA 10',
    player: 'Anthony Edwards',
    year: 2020,
    set: 'Panini Prizm',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 2400,
    insuranceValue: 3120,
    liquidationValue: 1800,
    replacementCost: 2700,
    condition: 'mint',
    lastSaleDate: '2025-03-01',
    lastSalePrice: 2450,
    priceHistory: [{ date: '2024-01', value: 1600 }, { date: '2024-06', value: 2000 }, { date: '2025-01', value: 2400 }],
    appreciationRate: 50.0,
    riskFactors: ['Young player volatility', 'Playoff performance dependency'],
    notes: 'Rising superstar, strong upward trend',
  },
  {
    id: 'ca_026',
    cardName: '2018 Panini National Treasures Josh Allen RPA PSA 9',
    player: 'Josh Allen',
    year: 2018,
    set: 'National Treasures',
    grade: '9',
    grader: 'PSA',
    fairMarketValue: 22000,
    insuranceValue: 28600,
    liquidationValue: 16500,
    replacementCost: 25000,
    condition: 'near_mint',
    lastSaleDate: '2025-02-10',
    lastSalePrice: 21500,
    priceHistory: [{ date: '2024-01', value: 18000 }, { date: '2024-06', value: 20000 }, { date: '2025-01', value: 22000 }],
    appreciationRate: 22.2,
    riskFactors: ['Low numbered card', 'NFL injury risk'],
    notes: 'Elite QB, strong investment thesis',
  },
  {
    id: 'ca_027',
    cardName: '2023 Bowman Chrome Roki Sasaki 1st PSA 10',
    player: 'Roki Sasaki',
    year: 2023,
    set: 'Bowman Chrome',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 1500,
    insuranceValue: 1950,
    liquidationValue: 1125,
    replacementCost: 1700,
    condition: 'mint',
    lastSaleDate: '2025-03-12',
    lastSalePrice: 1600,
    priceHistory: [{ date: '2024-06', value: 800 }, { date: '2024-09', value: 1100 }, { date: '2025-01', value: 1500 }],
    appreciationRate: 87.5,
    riskFactors: ['International transition', 'Pitching workload'],
    notes: 'Dodgers signing created massive spike',
  },
  {
    id: 'ca_028',
    cardName: '2021 Panini Prizm Cade Cunningham Silver RC PSA 10',
    player: 'Cade Cunningham',
    year: 2021,
    set: 'Panini Prizm',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 280,
    insuranceValue: 364,
    liquidationValue: 210,
    replacementCost: 320,
    condition: 'mint',
    lastSaleDate: '2025-02-28',
    lastSalePrice: 275,
    priceHistory: [{ date: '2024-01', value: 200 }, { date: '2024-06', value: 240 }, { date: '2025-01', value: 280 }],
    appreciationRate: 40.0,
    riskFactors: ['Team market size', 'Development pace'],
    notes: 'Breakout candidate, undervalued',
  },
  {
    id: 'ca_029',
    cardName: '2022 Topps Chrome Julio Rodriguez RC Auto PSA 10',
    player: 'Julio Rodriguez',
    year: 2022,
    set: 'Topps Chrome',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 1600,
    insuranceValue: 2080,
    liquidationValue: 1200,
    replacementCost: 1800,
    condition: 'mint',
    lastSaleDate: '2025-03-05',
    lastSalePrice: 1550,
    priceHistory: [{ date: '2024-01', value: 2200 }, { date: '2024-06', value: 1900 }, { date: '2025-01', value: 1600 }],
    appreciationRate: -27.3,
    riskFactors: ['Performance regression', 'Team competitiveness'],
    notes: 'Trade rumors could be catalyst',
  },
  {
    id: 'ca_030',
    cardName: '2024 Upper Deck Macklin Celebrini YG RC PSA 10',
    player: 'Macklin Celebrini',
    year: 2024,
    set: 'Upper Deck',
    grade: '10',
    grader: 'PSA',
    fairMarketValue: 1100,
    insuranceValue: 1430,
    liquidationValue: 825,
    replacementCost: 1250,
    condition: 'mint',
    lastSaleDate: '2025-03-10',
    lastSalePrice: 1150,
    priceHistory: [{ date: '2024-09', value: 1800 }, { date: '2024-12', value: 1400 }, { date: '2025-03', value: 1100 }],
    appreciationRate: -38.9,
    riskFactors: ['Injury concerns', 'Team rebuild timeline'],
    notes: 'Generational hockey talent, patience required',
  },
];

const APPRAISAL_REPORTS: AppraisalReport[] = [
  {
    id: 'ar_001',
    collectionName: 'Premium Baseball Collection',
    appraisalDate: '2025-03-01',
    appraisalType: 'fair_market_value',
    totalCards: 450,
    totalFairMarketValue: 285000,
    totalInsuranceValue: 370500,
    totalLiquidationValue: 213750,
    highestValueCard: '1952 Topps Mickey Mantle SGC 4',
    averageCardValue: 633,
    appreciationRate: 12.5,
    riskScore: 35,
    recommendations: ['Consider scheduled coverage for top 20 cards', 'Diversify into basketball prospects', 'Reduce concentration in pre-war cards'],
    status: 'final',
  },
  {
    id: 'ar_002',
    collectionName: 'Modern Basketball Investment Portfolio',
    appraisalDate: '2025-02-15',
    appraisalType: 'insurance_replacement',
    totalCards: 280,
    totalFairMarketValue: 125000,
    totalInsuranceValue: 162500,
    totalLiquidationValue: 93750,
    highestValueCard: '1986 Fleer Michael Jordan RC BGS 9.5',
    averageCardValue: 446,
    appreciationRate: 8.2,
    riskScore: 42,
    recommendations: ['Increase insurance coverage by 30%', 'Add transit coverage for shows', 'Consider selling underperformers'],
    status: 'final',
  },
  {
    id: 'ar_003',
    collectionName: 'Football Rookies Speculation Fund',
    appraisalDate: '2025-03-10',
    appraisalType: 'auction_estimate',
    totalCards: 150,
    totalFairMarketValue: 68000,
    totalInsuranceValue: 88400,
    totalLiquidationValue: 51000,
    highestValueCard: '2018 National Treasures Josh Allen RPA PSA 9',
    averageCardValue: 453,
    appreciationRate: 18.5,
    riskScore: 65,
    recommendations: ['High-risk portfolio needs rebalancing', 'Take profits on Mahomes position', 'Monitor Caleb Williams closely'],
    status: 'draft',
  },
  {
    id: 'ar_004',
    collectionName: 'Vintage Legends Collection',
    appraisalDate: '2025-01-20',
    appraisalType: 'private_sale',
    totalCards: 85,
    totalFairMarketValue: 520000,
    totalInsuranceValue: 676000,
    totalLiquidationValue: 390000,
    highestValueCard: '1952 Topps Mickey Mantle SGC 4',
    averageCardValue: 6118,
    appreciationRate: 9.8,
    riskScore: 28,
    recommendations: ['Maintain vault storage', 'Annual re-appraisal recommended', 'Consider deaccessioning duplicates'],
    status: 'certified',
  },
  {
    id: 'ar_005',
    collectionName: 'Prospect Pipeline Portfolio',
    appraisalDate: '2025-03-12',
    appraisalType: 'liquidation',
    totalCards: 320,
    totalFairMarketValue: 45000,
    totalInsuranceValue: 58500,
    totalLiquidationValue: 33750,
    highestValueCard: '2024 Bowman Chrome Paul Skenes 1st Auto PSA 10',
    averageCardValue: 141,
    appreciationRate: -15.2,
    riskScore: 78,
    recommendations: ['Reduce exposure to unproven prospects', 'Set stop-loss levels on declining cards', 'Rebalance toward proven performers'],
    status: 'final',
  },
];

const INSURANCE_OPTIONS: InsuranceCoverage[] = [
  {
    id: 'ic_001',
    provider: 'Collectibles Insurance Services',
    coverageType: 'blanket',
    premium: 150,
    deductible: 250,
    coverageLimit: 50000,
    coveredPerils: ['Theft', 'Fire', 'Water damage', 'Natural disaster', 'Accidental damage'],
    exclusions: ['Gradual deterioration', 'Voluntary parting', 'War', 'Nuclear'],
    renewalDate: '2026-01-15',
    recommended: true,
    rating: 4.5,
    description: 'Industry-leading blanket coverage for mid-size collections. Best value for collections under $50K.',
  },
  {
    id: 'ic_002',
    provider: 'American Collectors Insurance',
    coverageType: 'scheduled',
    premium: 450,
    deductible: 0,
    coverageLimit: 200000,
    coveredPerils: ['All-risk coverage', 'Mysterious disappearance', 'Breakage', 'Flood', 'Earthquake'],
    exclusions: ['Wear and tear', 'Inherent vice', 'Confiscation'],
    renewalDate: '2026-03-01',
    recommended: true,
    rating: 4.8,
    description: 'Premium scheduled coverage with $0 deductible. Ideal for high-value collections requiring itemized protection.',
  },
  {
    id: 'ic_003',
    provider: 'Hugh Wood Insurance',
    coverageType: 'valuable_articles',
    premium: 800,
    deductible: 500,
    coverageLimit: 500000,
    coveredPerils: ['Comprehensive all-risk', 'Transit', 'Exhibition', 'Flood', 'Earthquake', 'Mysterious disappearance'],
    exclusions: ['War', 'Gradual deterioration', 'Vermin damage'],
    renewalDate: '2026-06-15',
    recommended: false,
    rating: 4.6,
    description: 'High-limit valuable articles policy for serious collectors. Covers transit and exhibition automatically.',
  },
  {
    id: 'ic_004',
    provider: 'USAA Collectibles',
    coverageType: 'blanket',
    premium: 120,
    deductible: 500,
    coverageLimit: 30000,
    coveredPerils: ['Theft', 'Fire', 'Lightning', 'Windstorm', 'Vandalism'],
    exclusions: ['Flood', 'Earthquake', 'Mysterious disappearance', 'Transit'],
    renewalDate: '2026-02-01',
    recommended: false,
    rating: 3.8,
    description: 'Basic blanket coverage for smaller collections. Limited perils but affordable premium.',
  },
  {
    id: 'ic_005',
    provider: 'Chubb Collectibles',
    coverageType: 'transit',
    premium: 200,
    deductible: 100,
    coverageLimit: 100000,
    coveredPerils: ['Transit damage', 'Lost in transit', 'Theft during shipping', 'Convention coverage'],
    exclusions: ['Improper packaging', 'Carrier negligence after handoff'],
    renewalDate: '2026-04-01',
    recommended: true,
    rating: 4.3,
    description: 'Specialized transit coverage for shipping and convention attendance. Essential for active traders.',
  },
  {
    id: 'ic_006',
    provider: 'Lloyds Syndicate Fine Art',
    coverageType: 'exhibition',
    premium: 350,
    deductible: 250,
    coverageLimit: 250000,
    coveredPerils: ['Exhibition display damage', 'Theft at venue', 'Transit to/from events', 'Water damage at venue'],
    exclusions: ['Attendee handling', 'UV degradation during display'],
    renewalDate: '2026-05-01',
    recommended: false,
    rating: 4.1,
    description: 'Exhibition-specific coverage for cards displayed at shows, conventions, and museum loans.',
  },
  {
    id: 'ic_007',
    provider: 'State Farm Riders',
    coverageType: 'scheduled',
    premium: 280,
    deductible: 200,
    coverageLimit: 75000,
    coveredPerils: ['Theft', 'Fire', 'Vandalism', 'Water damage', 'Accidental damage'],
    exclusions: ['Flood', 'Earthquake', 'Mysterious disappearance', 'Gradual wear'],
    renewalDate: '2026-01-01',
    recommended: false,
    rating: 3.5,
    description: 'Homeowner policy rider for scheduled collectibles. Convenient but limited coverage.',
  },
  {
    id: 'ic_008',
    provider: 'Collectibles Shield Pro',
    coverageType: 'valuable_articles',
    premium: 600,
    deductible: 0,
    coverageLimit: 350000,
    coveredPerils: ['All-risk', 'Mysterious disappearance', 'Transit', 'Flood', 'Earthquake', 'Accidental'],
    exclusions: ['War', 'Government seizure', 'Intentional damage'],
    renewalDate: '2026-07-01',
    recommended: true,
    rating: 4.7,
    description: 'Comprehensive all-risk coverage with zero deductible. Top-tier protection for serious collectors.',
  },
];

const COMPARABLE_VALUES: ComparableValue[] = [
  {
    id: 'cv_001',
    cardName: '2018 Topps Chrome Shohei Ohtani RC Auto PSA 10',
    saleDate: '2025-02-15',
    salePrice: 12800,
    platform: 'eBay',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'Private seller',
    notes: 'Best Offer accepted, listed at $14,000',
    verified: true,
  },
  {
    id: 'cv_002',
    cardName: '2018 Topps Chrome Shohei Ohtani RC Auto PSA 10',
    saleDate: '2025-01-28',
    salePrice: 12200,
    platform: 'Goldin',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'Goldin Auctions',
    notes: 'Auction ended with 22 bids',
    verified: true,
  },
  {
    id: 'cv_003',
    cardName: '1986 Fleer Michael Jordan RC BGS 9.5',
    saleDate: '2025-01-20',
    salePrice: 46200,
    platform: 'Heritage',
    grade: '9.5',
    grader: 'BGS',
    auctionHouse: 'Heritage Auctions',
    notes: 'Strong subgrades, all 9 or higher',
    verified: true,
  },
  {
    id: 'cv_004',
    cardName: '1986 Fleer Michael Jordan RC BGS 9.5',
    saleDate: '2024-12-15',
    salePrice: 44800,
    platform: 'PWCC',
    grade: '9.5',
    grader: 'BGS',
    auctionHouse: 'PWCC Marketplace',
    notes: 'Weekly auction, strong competition',
    verified: true,
  },
  {
    id: 'cv_005',
    cardName: '2003 Topps Chrome LeBron James RC PSA 10',
    saleDate: '2025-02-10',
    salePrice: 34500,
    platform: 'eBay',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'Private',
    notes: 'Auction format, 31 bids, clean card',
    verified: true,
  },
  {
    id: 'cv_006',
    cardName: '2017 Panini Prizm Patrick Mahomes Silver RC PSA 10',
    saleDate: '2025-02-05',
    salePrice: 15500,
    platform: 'Goldin',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'Goldin Auctions',
    notes: 'Post-Super Bowl premium',
    verified: true,
  },
  {
    id: 'cv_007',
    cardName: '2011 Topps Update Mike Trout RC PSA 10',
    saleDate: '2025-01-28',
    salePrice: 27500,
    platform: 'Heritage',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'Heritage Auctions',
    notes: 'January signature auction',
    verified: true,
  },
  {
    id: 'cv_008',
    cardName: '1952 Topps Mickey Mantle SGC 4',
    saleDate: '2025-01-15',
    salePrice: 182000,
    platform: 'Heritage',
    grade: '4',
    grader: 'SGC',
    auctionHouse: 'Heritage Auctions',
    notes: 'Clean example for grade, strong eye appeal',
    verified: true,
  },
  {
    id: 'cv_009',
    cardName: '2018 Panini Prizm Luka Doncic Silver RC PSA 10',
    saleDate: '2025-02-28',
    salePrice: 5400,
    platform: 'eBay',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'Private',
    notes: 'Buy It Now accepted',
    verified: true,
  },
  {
    id: 'cv_010',
    cardName: '2020 Panini Prizm Anthony Edwards Silver RC PSA 10',
    saleDate: '2025-03-01',
    salePrice: 2450,
    platform: 'COMC',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'COMC',
    notes: 'Fixed price sale',
    verified: true,
  },
  {
    id: 'cv_011',
    cardName: '2019 Topps Chrome Juan Soto RC PSA 10',
    saleDate: '2025-03-10',
    salePrice: 1850,
    platform: 'eBay',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'Private',
    notes: 'Post-Mets signing premium',
    verified: true,
  },
  {
    id: 'cv_012',
    cardName: '1993 SP Derek Jeter RC PSA 10',
    saleDate: '2025-01-10',
    salePrice: 41500,
    platform: 'Goldin',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'Goldin Auctions',
    notes: 'Extremely low PSA 10 pop',
    verified: true,
  },
  {
    id: 'cv_013',
    cardName: '2023 Bowman Chrome Roki Sasaki 1st PSA 10',
    saleDate: '2025-03-12',
    salePrice: 1600,
    platform: 'eBay',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'Private',
    notes: 'Dodgers debut hype premium',
    verified: true,
  },
  {
    id: 'cv_014',
    cardName: '1979 OPC Wayne Gretzky RC PSA 7',
    saleDate: '2025-01-20',
    salePrice: 54000,
    platform: 'Heritage',
    grade: '7',
    grader: 'PSA',
    auctionHouse: 'Heritage Auctions',
    notes: 'Strong centering for grade',
    verified: true,
  },
  {
    id: 'cv_015',
    cardName: '2018 National Treasures Josh Allen RPA PSA 9',
    saleDate: '2025-02-10',
    salePrice: 21500,
    platform: 'PWCC',
    grade: '9',
    grader: 'PSA',
    auctionHouse: 'PWCC Marketplace',
    notes: 'Clean patch, on-card auto',
    verified: true,
  },
  {
    id: 'cv_016',
    cardName: '2024 Bowman Chrome Paul Skenes 1st Auto PSA 10',
    saleDate: '2025-03-08',
    salePrice: 4350,
    platform: 'eBay',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'Private',
    notes: 'Pre-season buzz pricing',
    verified: true,
  },
  {
    id: 'cv_017',
    cardName: '2001 SP Authentic Tiger Woods RC Auto PSA 9',
    saleDate: '2025-01-05',
    salePrice: 17500,
    platform: 'Goldin',
    grade: '9',
    grader: 'PSA',
    auctionHouse: 'Goldin Auctions',
    notes: 'Strong on-card auto',
    verified: true,
  },
  {
    id: 'cv_018',
    cardName: '2023 Upper Deck Connor Bedard YG RC PSA 10',
    saleDate: '2025-02-25',
    salePrice: 2750,
    platform: 'eBay',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'Private',
    notes: 'Injury return created buying window',
    verified: true,
  },
  {
    id: 'cv_019',
    cardName: '2020 Topps Chrome Luis Robert Jr. RC Auto PSA 10',
    saleDate: '2025-03-05',
    salePrice: 2350,
    platform: 'COMC',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'COMC',
    notes: 'Dodgers trade premium',
    verified: true,
  },
  {
    id: 'cv_020',
    cardName: '2024 Prizm Caleb Williams Silver RC PSA 10',
    saleDate: '2025-03-05',
    salePrice: 820,
    platform: 'eBay',
    grade: '10',
    grader: 'PSA',
    auctionHouse: 'Private',
    notes: 'Declining from peak of $1,500',
    verified: true,
  },
];

const RISK_FACTORS: RiskFactor[] = [
  {
    id: 'rf_001',
    category: 'concentration',
    severity: 'high',
    description: 'Over 35% of collection value concentrated in a single card (Mickey Mantle)',
    mitigation: 'Consider partial deaccessioning or acquiring additional high-value cards to diversify',
    affectedCards: ['ca_007'],
    impactEstimate: 185000,
  },
  {
    id: 'rf_002',
    category: 'market',
    severity: 'medium',
    description: 'Several modern prospect cards showing significant depreciation (>25% decline)',
    mitigation: 'Set stop-loss thresholds and rebalance into proven performers',
    affectedCards: ['ca_003', 'ca_006', 'ca_011', 'ca_014', 'ca_015'],
    impactEstimate: 15000,
  },
  {
    id: 'rf_003',
    category: 'condition',
    severity: 'low',
    description: 'Vintage cards may be subject to condition deterioration if not properly stored',
    mitigation: 'Invest in museum-quality storage: UV-protected cases, climate-controlled vault',
    affectedCards: ['ca_007', 'ca_023', 'ca_016'],
    impactEstimate: 282000,
  },
  {
    id: 'rf_004',
    category: 'authenticity',
    severity: 'medium',
    description: 'Raw cards without authentication are subject to counterfeit risk',
    mitigation: 'Submit all raw cards over $200 to PSA, BGS, or SGC for authentication',
    affectedCards: [],
    impactEstimate: 5000,
  },
  {
    id: 'rf_005',
    category: 'storage',
    severity: 'high',
    description: 'Collection stored in non-climate-controlled environment risks humidity damage',
    mitigation: 'Relocate to bank safe deposit box or specialized vault storage facility',
    affectedCards: ['ca_007', 'ca_002', 'ca_004', 'ca_023'],
    impactEstimate: 327000,
  },
  {
    id: 'rf_006',
    category: 'liquidity',
    severity: 'medium',
    description: 'Ultra-high-value cards ($50K+) have limited buyer pool and longer sale timelines',
    mitigation: 'Work with auction houses for consignment; expect 60-90 day sale cycles',
    affectedCards: ['ca_007', 'ca_023'],
    impactEstimate: 240000,
  },
  {
    id: 'rf_007',
    category: 'market',
    severity: 'high',
    description: 'NFL card market showing volatility due to licensing changes and Panini/Fanatics transition',
    mitigation: 'Monitor Fanatics transition timeline; consider reducing NFL exposure temporarily',
    affectedCards: ['ca_012', 'ca_018', 'ca_021', 'ca_026'],
    impactEstimate: 39050,
  },
  {
    id: 'rf_008',
    category: 'concentration',
    severity: 'medium',
    description: 'Heavy exposure to active players creates performance dependency risk',
    mitigation: 'Balance portfolio with retired HOFers who have established value floors',
    affectedCards: ['ca_001', 'ca_006', 'ca_008', 'ca_025'],
    impactEstimate: 28900,
  },
  {
    id: 'rf_009',
    category: 'authenticity',
    severity: 'low',
    description: 'Reholder/crossover risk - some cards may grade differently at different services',
    mitigation: 'Keep cards in original slabs; only cross if significant grade improvement expected',
    affectedCards: ['ca_005', 'ca_023'],
    impactEstimate: 73000,
  },
  {
    id: 'rf_010',
    category: 'liquidity',
    severity: 'low',
    description: 'Hockey cards have smaller collector base, limiting quick sale options',
    mitigation: 'Use specialized hockey auction platforms and Canadian buyer networks',
    affectedCards: ['ca_019', 'ca_023', 'ca_030'],
    impactEstimate: 58900,
  },
];

// ---- localStorage helpers ----

interface AppraiserData {
  appraisals: CardAppraisal[];
  reports: AppraisalReport[];
  insurance: InsuranceCoverage[];
  comparables: ComparableValue[];
  risks: RiskFactor[];
}

function loadData(): AppraiserData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppraiserData;
  } catch {
    return null;
  }
}

function saveData(data: AppraiserData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded
  }
}

function ensureData(): AppraiserData {
  const stored = loadData();
  if (stored && stored.appraisals?.length > 0) return stored;
  const seed: AppraiserData = {
    appraisals: CARD_APPRAISALS,
    reports: APPRAISAL_REPORTS,
    insurance: INSURANCE_OPTIONS,
    comparables: COMPARABLE_VALUES,
    risks: RISK_FACTORS,
  };
  saveData(seed);
  return seed;
}

// ---- Public API ----

export function getCardAppraisals(player?: string): CardAppraisal[] {
  const data = ensureData();
  if (player) return data.appraisals.filter(a => a.player.toLowerCase().includes(player.toLowerCase()));
  return data.appraisals;
}

export function getAppraisalReports(type?: AppraisalType): AppraisalReport[] {
  const data = ensureData();
  if (type) return data.reports.filter(r => r.appraisalType === type);
  return data.reports;
}

export function getInsuranceCoverage(coverageType?: InsuranceCoverage['coverageType']): InsuranceCoverage[] {
  const data = ensureData();
  if (coverageType) return data.insurance.filter(i => i.coverageType === coverageType);
  return data.insurance;
}

export function getComparableValues(cardName?: string): ComparableValue[] {
  const data = ensureData();
  if (cardName) return data.comparables.filter(c => c.cardName.toLowerCase().includes(cardName.toLowerCase()));
  return data.comparables;
}

export function getRiskFactors(category?: RiskFactor['category']): RiskFactor[] {
  const data = ensureData();
  if (category) return data.risks.filter(r => r.category === category);
  return data.risks;
}

export function getCollectionSummary(): CollectionSummary {
  const data = ensureData();
  const appraisals = data.appraisals;
  const totalValue = appraisals.reduce((sum, a) => sum + a.fairMarketValue, 0);
  const totalInsurance = appraisals.reduce((sum, a) => sum + a.insuranceValue, 0);
  const sorted = [...appraisals].sort((a, b) => b.fairMarketValue - a.fairMarketValue);
  const byAppreciation = [...appraisals].sort((a, b) => b.appreciationRate - a.appreciationRate);

  return {
    totalCards: appraisals.length,
    totalValue,
    totalInsuranceValue: totalInsurance,
    averageCardValue: totalValue / appraisals.length,
    highestValueCard: sorted[0],
    lowestValueCard: sorted[sorted.length - 1],
    topAppreciating: byAppreciation.slice(0, 5),
    topDepreciating: byAppreciation.slice(-5).reverse(),
    riskScore: Math.round(data.risks.reduce((sum, r) => sum + (r.severity === 'critical' ? 4 : r.severity === 'high' ? 3 : r.severity === 'medium' ? 2 : 1), 0) / data.risks.length * 25),
    diversificationScore: 72,
    concentrationRisk: sorted[0].fairMarketValue / totalValue * 100,
  };
}

export function getDepreciationSchedule(cardId: string): DepreciationSchedule | null {
  const data = ensureData();
  const card = data.appraisals.find(a => a.id === cardId);
  if (!card) return null;

  const projectedValues: { year: number; value: number }[] = [];
  const currentYear = new Date().getFullYear();
  let value = card.fairMarketValue;
  for (let i = 1; i <= 5; i++) {
    value = Math.round(value * (1 + card.appreciationRate / 100));
    projectedValues.push({ year: currentYear + i, value });
  }

  return {
    id: `ds_${cardId}`,
    cardId,
    cardName: card.cardName,
    purchaseDate: card.lastSaleDate,
    purchasePrice: card.lastSalePrice,
    currentValue: card.fairMarketValue,
    annualDepreciation: card.appreciationRate < 0 ? Math.abs(card.appreciationRate) : 0,
    projectedValues,
    depreciationType: card.appreciationRate > 0 ? 'appreciating' : card.appreciationRate < -10 ? 'accelerated' : 'straight_line',
  };
}

export function getReplacementCost(cardId: string): ReplacementCost | null {
  const data = ensureData();
  const card = data.appraisals.find(a => a.id === cardId);
  if (!card) return null;

  const premium = card.fairMarketValue > 50000 ? 0.15 : card.fairMarketValue > 10000 ? 0.12 : 0.10;
  return {
    id: `rc_${cardId}`,
    cardId,
    cardName: card.cardName,
    currentMarketPrice: card.fairMarketValue,
    replacementPremium: premium,
    totalReplacementCost: card.replacementCost,
    availability: card.fairMarketValue > 100000 ? 'nearly_impossible' : card.fairMarketValue > 20000 ? 'very_scarce' : card.fairMarketValue > 5000 ? 'scarce' : 'readily_available',
    estimatedSearchTime: card.fairMarketValue > 50000 ? '3-6 months' : card.fairMarketValue > 10000 ? '1-3 months' : '1-4 weeks',
    alternativeOptions: ['Consider lower grade alternative', 'Check international markets', 'Set up saved searches on major platforms'],
  };
}

export function getCoverageRecommendations(): CoverageRecommendation[] {
  const summary = getCollectionSummary();
  const recommendations: CoverageRecommendation[] = [
  {
    id: 'cr_001',
    coverageType: 'scheduled',
    provider: 'American Collectors Insurance',
    estimatedPremium: Math.round(summary.totalValue * 0.003),
    reasoning: 'Your collection value exceeds $50K, warranting scheduled itemized coverage for top cards.',
    priority: 'essential',
    collectionValueThreshold: 50000,
  },
  {
    id: 'cr_002',
    coverageType: 'transit',
    provider: 'Chubb Collectibles',
    estimatedPremium: 200,
    reasoning: 'Essential for any collector who ships cards or attends conventions.',
    priority: 'recommended',
    collectionValueThreshold: 10000,
  },
  {
    id: 'cr_003',
    coverageType: 'blanket',
    provider: 'Collectibles Insurance Services',
    estimatedPremium: Math.round(summary.totalValue * 0.002),
    reasoning: 'Blanket coverage provides baseline protection for the full collection.',
    priority: 'essential',
    collectionValueThreshold: 5000,
  },
  {
    id: 'cr_004',
    coverageType: 'valuable_articles',
    provider: 'Collectibles Shield Pro',
    estimatedPremium: Math.round(summary.totalValue * 0.004),
    reasoning: 'All-risk coverage recommended for collections with concentration risk above 20%.',
    priority: 'recommended',
    collectionValueThreshold: 100000,
  },
  ];
  return recommendations;
}

export function getAppraisalHistory(cardId: string): AppraisalHistory[] {
  const data = ensureData();
  const card = data.appraisals.find(a => a.id === cardId);
  if (!card) return [];

  return card.priceHistory.map((ph, i) => ({
    id: `ah_${cardId}_${i}`,
    cardId,
    appraisalDate: ph.date + '-15',
    appraiser: 'MSI AI Appraiser',
    fairMarketValue: ph.value,
    insuranceValue: Math.round(ph.value * 1.3),
    method: 'Comparable sales analysis',
    notes: `Based on ${3 + i} comparable sales in the period`,
  }));
}

export function getAppraisalCertificate(reportId: string): AppraisalCertificate | null {
  const data = ensureData();
  const report = data.reports.find(r => r.id === reportId);
  if (!report) return null;

  return {
    id: `cert_${reportId}`,
    reportId,
    certificationDate: report.appraisalDate,
    certifier: 'MSI Certified Appraiser',
    totalValue: report.totalFairMarketValue,
    methodology: 'Comparable sales analysis with market adjustment factors applied per USPAP standards',
    validUntil: new Date(new Date(report.appraisalDate).getTime() + 365 * 86400000).toISOString().split('T')[0],
    cardCount: report.totalCards,
    purpose: report.appraisalType === 'insurance_replacement' ? 'insurance' : 'sale',
  };
}

export function searchAppraisals(query: string): CardAppraisal[] {
  const data = ensureData();
  const lower = query.toLowerCase();
  return data.appraisals.filter(a =>
    a.cardName.toLowerCase().includes(lower) ||
    a.player.toLowerCase().includes(lower) ||
    a.set.toLowerCase().includes(lower)
  );
}

// ---- Page-facing adapter types ----

export interface ValueDistribution {
  category: string;
  totalValue: number;
}

export interface DepreciationRate {
  category: string;
  rate: number;
  projectedLoss: number;
}

export interface AppraiserSummary {
  totalCards: number;
  overallRiskScore: number;
}

// ---- Page-facing adapter functions ----

export function getAppraisalReport(): {
  reportId: string;
  totalMarketValue: number;
  highEstimate: number;
  lowEstimate: number;
  recommendedCoverage: number;
  annualPremium: number;
  deductible: number;
  confidenceScore: number;
  lastUpdated: string;
} {
  const data = ensureData();
  const report = data.reports[0];
  if (!report) {
    return {
      reportId: 'RPT-001',
      totalMarketValue: 0,
      highEstimate: 0,
      lowEstimate: 0,
      recommendedCoverage: 0,
      annualPremium: 0,
      deductible: 500,
      confidenceScore: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
  const totalMarket = report.totalFairMarketValue;
  return {
    reportId: report.id,
    totalMarketValue: totalMarket,
    highEstimate: report.totalInsuranceValue,
    lowEstimate: report.totalLiquidationValue,
    recommendedCoverage: report.totalInsuranceValue,
    annualPremium: Math.round(report.totalInsuranceValue * 0.015),
    deductible: 500,
    confidenceScore: Math.max(0, 100 - report.riskScore),
    lastUpdated: report.appraisalDate,
  };
}

export function getValueDistribution(): ValueDistribution[] {
  const data = ensureData();
  const categoryMap: Record<string, number> = {};
  for (const a of data.appraisals) {
    const cat = a.set || 'Other';
    categoryMap[cat] = (categoryMap[cat] || 0) + a.fairMarketValue;
  }
  return Object.entries(categoryMap).map(([category, totalValue]) => ({ category, totalValue }));
}

export function getDepreciationRates(): DepreciationRate[] {
  const data = ensureData();
  const categoryMap: Record<string, { totalRate: number; totalValue: number; count: number }> = {};
  for (const a of data.appraisals) {
    const cat = a.set || 'Other';
    if (!categoryMap[cat]) categoryMap[cat] = { totalRate: 0, totalValue: 0, count: 0 };
    categoryMap[cat].totalRate += Math.abs(a.appreciationRate);
    categoryMap[cat].totalValue += a.fairMarketValue;
    categoryMap[cat].count += 1;
  }
  return Object.entries(categoryMap).map(([category, { totalRate, totalValue, count }]) => ({
    category,
    rate: Math.round((totalRate / count) * 10) / 10,
    projectedLoss: Math.round(totalValue * (totalRate / count) / 100),
  }));
}

export function getAppraisalCertificates(): {
  id: string;
  certificateNumber: string;
  cardName: string;
  description: string;
  fairMarketValue: number;
  insuranceValue: number;
  appraisalDate: string;
  validUntil: string;
  appraiser: string;
}[] {
  const data = ensureData();
  return data.appraisals.slice(0, 6).map((a, i) => ({
    id: `cert_${i + 1}`,
    certificateNumber: `CERT-${String(i + 1).padStart(4, '0')}`,
    cardName: a.cardName,
    description: `Certified appraisal for ${a.cardName} - ${a.grader} ${a.grade}`,
    fairMarketValue: a.fairMarketValue,
    insuranceValue: a.insuranceValue,
    appraisalDate: a.lastSaleDate,
    validUntil: '2026-12-31',
    appraiser: 'MSI Certified Appraisals',
  }));
}

export function getSummaryStats(): AppraiserSummary {
  const data = ensureData();
  const avgRisk = data.risks.length > 0
    ? Math.round(data.risks.reduce((s, r) => s + r.impactEstimate, 0) / data.risks.length)
    : 0;
  return {
    totalCards: data.appraisals.length,
    overallRiskScore: avgRisk,
  };
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function getRiskColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'text-red-500';
    case 'high': return 'text-red-400';
    case 'medium': return 'text-amber-400';
    case 'low': return 'text-emerald-400';
    default: return 'text-slate-400';
  }
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    mint: 'Mint',
    near_mint: 'Near Mint',
    excellent: 'Excellent',
    very_good: 'Very Good',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  };
  return labels[condition] || condition;
}

// ---- Widget-compatible helpers ----

export function getGradingResults(): { id: string; cardName: string; grade: number; grader: string }[] {
  const appraisals = getCardAppraisals();
  return appraisals.map(a => ({
    id: a.id,
    cardName: a.cardName,
    grade: parseFloat(a.grade) || 7.0,
    grader: a.grader,
  }));
}

export function getAppraisalSummaryStats(): {
  totalCardsAppraised: number;
  totalCollectionValue: number;
  totalInsuranceValue: number;
  averageAppreciation: number;
  topPerformer: string;
  worstPerformer: string;
  reportsGenerated: number;
  activeRisks: number;
} {
  const data = ensureData();
  const appreciations = data.appraisals.map(a => a.appreciationRate);
  const avgAppreciation = appreciations.reduce((a, b) => a + b, 0) / appreciations.length;
  const sorted = [...data.appraisals].sort((a, b) => b.appreciationRate - a.appreciationRate);

  return {
    totalCardsAppraised: data.appraisals.length,
    totalCollectionValue: data.appraisals.reduce((sum, a) => sum + a.fairMarketValue, 0),
    totalInsuranceValue: data.appraisals.reduce((sum, a) => sum + a.insuranceValue, 0),
    averageAppreciation: Math.round(avgAppreciation * 10) / 10,
    topPerformer: sorted[0]?.player ?? 'N/A',
    worstPerformer: sorted[sorted.length - 1]?.player ?? 'N/A',
    reportsGenerated: data.reports.length,
    activeRisks: data.risks.length,
  };
}

// (Widget adapter merged into getGradingResults above)
