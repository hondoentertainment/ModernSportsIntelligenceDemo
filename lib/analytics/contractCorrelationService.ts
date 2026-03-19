// Contract Correlation Service
// Maps contract extensions/options to card value movements across NFL, NBA, and MLB

export type Sport = 'NFL' | 'NBA' | 'MLB';

export type ContractType =
  | 'rookie_extension'
  | '5th_year_option'
  | 'max_deal'
  | 'franchise_tag'
  | 'free_agency_signing';

export type SignalDirection = 'buy' | 'sell' | 'hold';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ContractEvent {
  id: string;
  player: string;
  sport: Sport;
  team: string;
  position: string;
  contractType: ContractType;
  contractValue: number; // total value in millions
  contractYears: number;
  annualAverage: number; // AAV in millions
  guaranteedMoney: number; // guaranteed in millions
  eventDate: string;
  card: {
    set: string;
    year: number;
    grade: string;
    cardNumber: string;
  };
  priceBefore: number;
  priceAfter: number;
  percentChange: number;
  timeframeDays: number;
  peakPrice: number;
  peakDaysAfter: number;
  volumeChangePct: number;
}

export interface CardImpact {
  id: string;
  contractEventId: string;
  player: string;
  sport: Sport;
  cardSet: string;
  grade: string;
  priceChange: number;
  percentChange: number;
  timeframeDays: number;
  volumeSpike: number;
  sustainedGain: boolean;
  retracePercent: number;
}

export interface CorrelationPattern {
  id: string;
  contractType: ContractType;
  sport: Sport;
  sampleSize: number;
  avgPriceChange: number;
  medianPriceChange: number;
  stdDeviation: number;
  avgTimeToEffect: number;
  avgPeakDays: number;
  avgRetracePercent: number;
  positiveRate: number;
  cardTier: 'flagship' | 'mid' | 'low';
  description: string;
}

export interface UpcomingContract {
  id: string;
  player: string;
  sport: Sport;
  team: string;
  position: string;
  contractType: ContractType;
  expectedDate: string;
  daysUntil: number;
  currentContractValue: number;
  projectedNewValue: number;
  likelihood: number; // 0-100
  topCard: {
    set: string;
    year: number;
    grade: string;
    currentPrice: number;
  };
  predictedImpact: number;
  confidenceInterval: { low: number; mid: number; high: number };
  signal: SignalDirection;
  signalStrength: number; // 0-100
  notes: string;
}

export interface PredictionModel {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  backtestPeriod: string;
  features: string[];
  lastUpdated: string;
  predictions: {
    contractEventId: string;
    predictedChange: number;
    actualChange: number | null;
    confidence: ConfidenceLevel;
    confidenceScore: number;
  }[];
}

export interface CorrelationMatrixEntry {
  contractType: ContractType;
  sport: Sport;
  flagshipImpact: number;
  midTierImpact: number;
  lowTierImpact: number;
  avgVolume: number;
  sustainRate: number;
}

export interface StrategySignal {
  id: string;
  player: string;
  sport: Sport;
  action: SignalDirection;
  strength: number;
  reasoning: string;
  targetCard: string;
  currentPrice: number;
  targetPrice: number;
  timeHorizon: string;
  riskLevel: 'low' | 'medium' | 'high';
  contractContext: string;
  createdAt: string;
}

// ─── Contract Type Labels ────────────────────────────────────────────

export const contractTypeLabels: Record<ContractType, string> = {
  rookie_extension: 'Rookie Extension',
  '5th_year_option': '5th-Year Option',
  max_deal: 'Max Deal',
  franchise_tag: 'Franchise Tag',
  free_agency_signing: 'Free Agency Signing',
};

export const contractTypeColors: Record<ContractType, string> = {
  rookie_extension: '#84cc16',
  '5th_year_option': '#60a5fa',
  max_deal: '#a78bfa',
  franchise_tag: '#fbbf24',
  free_agency_signing: '#f87171',
};

// ─── Mock Historical Contract Events ─────────────────────────────────

const historicalContractEvents: ContractEvent[] = [
  {
    id: 'ce-001',
    player: 'Justin Herbert',
    sport: 'NFL',
    team: 'Los Angeles Chargers',
    position: 'QB',
    contractType: 'rookie_extension',
    contractValue: 262.5,
    contractYears: 5,
    annualAverage: 52.5,
    guaranteedMoney: 218.7,
    eventDate: '2024-07-26',
    card: { set: 'Prizm', year: 2020, grade: 'PSA 10', cardNumber: '325' },
    priceBefore: 285,
    priceAfter: 345,
    percentChange: 21.1,
    timeframeDays: 30,
    peakPrice: 372,
    peakDaysAfter: 14,
    volumeChangePct: 145,
  },
  {
    id: 'ce-002',
    player: 'Joe Burrow',
    sport: 'NFL',
    team: 'Cincinnati Bengals',
    position: 'QB',
    contractType: 'rookie_extension',
    contractValue: 275,
    contractYears: 5,
    annualAverage: 55,
    guaranteedMoney: 219.01,
    eventDate: '2023-09-08',
    card: { set: 'Prizm', year: 2020, grade: 'PSA 10', cardNumber: '307' },
    priceBefore: 410,
    priceAfter: 502,
    percentChange: 22.4,
    timeframeDays: 30,
    peakPrice: 535,
    peakDaysAfter: 18,
    volumeChangePct: 162,
  },
  {
    id: 'ce-003',
    player: 'Jalen Hurts',
    sport: 'NFL',
    team: 'Philadelphia Eagles',
    position: 'QB',
    contractType: 'rookie_extension',
    contractValue: 255,
    contractYears: 5,
    annualAverage: 51,
    guaranteedMoney: 179.3,
    eventDate: '2023-04-17',
    card: { set: 'Prizm', year: 2020, grade: 'PSA 10', cardNumber: '343' },
    priceBefore: 195,
    priceAfter: 238,
    percentChange: 22.1,
    timeframeDays: 30,
    peakPrice: 260,
    peakDaysAfter: 12,
    volumeChangePct: 130,
  },
  {
    id: 'ce-004',
    player: 'Micah Parsons',
    sport: 'NFL',
    team: 'Dallas Cowboys',
    position: 'LB',
    contractType: '5th_year_option',
    contractValue: 21.3,
    contractYears: 1,
    annualAverage: 21.3,
    guaranteedMoney: 21.3,
    eventDate: '2024-04-28',
    card: { set: 'Prizm', year: 2021, grade: 'PSA 10', cardNumber: '382' },
    priceBefore: 145,
    priceAfter: 172,
    percentChange: 18.6,
    timeframeDays: 30,
    peakPrice: 185,
    peakDaysAfter: 10,
    volumeChangePct: 88,
  },
  {
    id: 'ce-005',
    player: 'Kyle Pitts',
    sport: 'NFL',
    team: 'Atlanta Falcons',
    position: 'TE',
    contractType: '5th_year_option',
    contractValue: 10.9,
    contractYears: 1,
    annualAverage: 10.9,
    guaranteedMoney: 10.9,
    eventDate: '2024-04-25',
    card: { set: 'Prizm', year: 2021, grade: 'PSA 10', cardNumber: '334' },
    priceBefore: 42,
    priceAfter: 46,
    percentChange: 9.5,
    timeframeDays: 30,
    peakPrice: 50,
    peakDaysAfter: 7,
    volumeChangePct: 55,
  },
  {
    id: 'ce-006',
    player: 'Jaylen Waddle',
    sport: 'NFL',
    team: 'Miami Dolphins',
    position: 'WR',
    contractType: 'rookie_extension',
    contractValue: 84.75,
    contractYears: 3,
    annualAverage: 28.25,
    guaranteedMoney: 56,
    eventDate: '2024-01-15',
    card: { set: 'Prizm', year: 2021, grade: 'PSA 10', cardNumber: '338' },
    priceBefore: 68,
    priceAfter: 82,
    percentChange: 20.6,
    timeframeDays: 30,
    peakPrice: 91,
    peakDaysAfter: 16,
    volumeChangePct: 112,
  },
  {
    id: 'ce-007',
    player: 'Dak Prescott',
    sport: 'NFL',
    team: 'Dallas Cowboys',
    position: 'QB',
    contractType: 'franchise_tag',
    contractValue: 40.2,
    contractYears: 1,
    annualAverage: 40.2,
    guaranteedMoney: 40.2,
    eventDate: '2024-03-05',
    card: { set: 'Prizm', year: 2016, grade: 'PSA 10', cardNumber: '231' },
    priceBefore: 320,
    priceAfter: 298,
    percentChange: -6.9,
    timeframeDays: 30,
    peakPrice: 325,
    peakDaysAfter: 2,
    volumeChangePct: 72,
  },
  {
    id: 'ce-008',
    player: 'Saquon Barkley',
    sport: 'NFL',
    team: 'Philadelphia Eagles',
    position: 'RB',
    contractType: 'free_agency_signing',
    contractValue: 37.75,
    contractYears: 3,
    annualAverage: 12.58,
    guaranteedMoney: 26,
    eventDate: '2024-03-13',
    card: { set: 'Prizm', year: 2018, grade: 'PSA 10', cardNumber: '202' },
    priceBefore: 120,
    priceAfter: 155,
    percentChange: 29.2,
    timeframeDays: 30,
    peakPrice: 168,
    peakDaysAfter: 21,
    volumeChangePct: 195,
  },
  {
    id: 'ce-009',
    player: 'Anthony Edwards',
    sport: 'NBA',
    team: 'Minnesota Timberwolves',
    position: 'SG',
    contractType: 'max_deal',
    contractValue: 260,
    contractYears: 5,
    annualAverage: 52,
    guaranteedMoney: 260,
    eventDate: '2023-10-22',
    card: { set: 'Prizm', year: 2020, grade: 'PSA 10', cardNumber: '258' },
    priceBefore: 520,
    priceAfter: 665,
    percentChange: 27.9,
    timeframeDays: 30,
    peakPrice: 710,
    peakDaysAfter: 22,
    volumeChangePct: 210,
  },
  {
    id: 'ce-010',
    player: 'Tyrese Haliburton',
    sport: 'NBA',
    team: 'Indiana Pacers',
    position: 'PG',
    contractType: 'max_deal',
    contractValue: 245,
    contractYears: 5,
    annualAverage: 49,
    guaranteedMoney: 245,
    eventDate: '2023-07-06',
    card: { set: 'Prizm', year: 2020, grade: 'PSA 10', cardNumber: '262' },
    priceBefore: 185,
    priceAfter: 230,
    percentChange: 24.3,
    timeframeDays: 30,
    peakPrice: 248,
    peakDaysAfter: 20,
    volumeChangePct: 155,
  },
  {
    id: 'ce-011',
    player: 'Scottie Barnes',
    sport: 'NBA',
    team: 'Toronto Raptors',
    position: 'SF',
    contractType: 'rookie_extension',
    contractValue: 224.6,
    contractYears: 5,
    annualAverage: 44.9,
    guaranteedMoney: 224.6,
    eventDate: '2024-07-02',
    card: { set: 'Prizm', year: 2021, grade: 'PSA 10', cardNumber: '320' },
    priceBefore: 88,
    priceAfter: 105,
    percentChange: 19.3,
    timeframeDays: 30,
    peakPrice: 115,
    peakDaysAfter: 15,
    volumeChangePct: 98,
  },
  {
    id: 'ce-012',
    player: 'LaMelo Ball',
    sport: 'NBA',
    team: 'Charlotte Hornets',
    position: 'PG',
    contractType: 'max_deal',
    contractValue: 260,
    contractYears: 5,
    annualAverage: 52,
    guaranteedMoney: 221,
    eventDate: '2023-07-01',
    card: { set: 'Prizm', year: 2020, grade: 'PSA 10', cardNumber: '278' },
    priceBefore: 310,
    priceAfter: 355,
    percentChange: 14.5,
    timeframeDays: 30,
    peakPrice: 380,
    peakDaysAfter: 11,
    volumeChangePct: 130,
  },
  {
    id: 'ce-013',
    player: 'Julio Rodriguez',
    sport: 'MLB',
    team: 'Seattle Mariners',
    position: 'OF',
    contractType: 'rookie_extension',
    contractValue: 210,
    contractYears: 12,
    annualAverage: 17.5,
    guaranteedMoney: 210,
    eventDate: '2023-08-26',
    card: { set: 'Topps Chrome', year: 2022, grade: 'PSA 10', cardNumber: '1' },
    priceBefore: 175,
    priceAfter: 215,
    percentChange: 22.9,
    timeframeDays: 30,
    peakPrice: 240,
    peakDaysAfter: 18,
    volumeChangePct: 178,
  },
  {
    id: 'ce-014',
    player: 'Shohei Ohtani',
    sport: 'MLB',
    team: 'Los Angeles Dodgers',
    position: 'DH/P',
    contractType: 'free_agency_signing',
    contractValue: 700,
    contractYears: 10,
    annualAverage: 70,
    guaranteedMoney: 700,
    eventDate: '2023-12-09',
    card: { set: 'Topps Chrome', year: 2018, grade: 'PSA 10', cardNumber: '150' },
    priceBefore: 1450,
    priceAfter: 2100,
    percentChange: 44.8,
    timeframeDays: 30,
    peakPrice: 2350,
    peakDaysAfter: 25,
    volumeChangePct: 320,
  },
  {
    id: 'ce-015',
    player: 'Gunnar Henderson',
    sport: 'MLB',
    team: 'Baltimore Orioles',
    position: 'SS',
    contractType: 'rookie_extension',
    contractValue: 192,
    contractYears: 11,
    annualAverage: 17.5,
    guaranteedMoney: 168,
    eventDate: '2024-03-18',
    card: { set: 'Topps Chrome', year: 2023, grade: 'PSA 10', cardNumber: '80' },
    priceBefore: 95,
    priceAfter: 118,
    percentChange: 24.2,
    timeframeDays: 30,
    peakPrice: 132,
    peakDaysAfter: 16,
    volumeChangePct: 142,
  },
  {
    id: 'ce-016',
    player: 'Corbin Carroll',
    sport: 'MLB',
    team: 'Arizona Diamondbacks',
    position: 'OF',
    contractType: 'rookie_extension',
    contractValue: 111,
    contractYears: 8,
    annualAverage: 13.9,
    guaranteedMoney: 111,
    eventDate: '2024-04-01',
    card: { set: 'Topps Chrome', year: 2023, grade: 'PSA 10', cardNumber: '50' },
    priceBefore: 62,
    priceAfter: 74,
    percentChange: 19.4,
    timeframeDays: 30,
    peakPrice: 81,
    peakDaysAfter: 13,
    volumeChangePct: 105,
  },
  {
    id: 'ce-017',
    player: 'Kirk Cousins',
    sport: 'NFL',
    team: 'Atlanta Falcons',
    position: 'QB',
    contractType: 'free_agency_signing',
    contractValue: 180,
    contractYears: 4,
    annualAverage: 45,
    guaranteedMoney: 100,
    eventDate: '2024-03-11',
    card: { set: 'Prizm', year: 2012, grade: 'PSA 10', cardNumber: '232' },
    priceBefore: 45,
    priceAfter: 52,
    percentChange: 15.6,
    timeframeDays: 30,
    peakPrice: 58,
    peakDaysAfter: 8,
    volumeChangePct: 65,
  },
  {
    id: 'ce-018',
    player: 'Chet Holmgren',
    sport: 'NBA',
    team: 'Oklahoma City Thunder',
    position: 'C',
    contractType: 'rookie_extension',
    contractValue: 238,
    contractYears: 5,
    annualAverage: 47.6,
    guaranteedMoney: 238,
    eventDate: '2025-10-20',
    card: { set: 'Prizm', year: 2022, grade: 'PSA 10', cardNumber: '249' },
    priceBefore: 165,
    priceAfter: 202,
    percentChange: 22.4,
    timeframeDays: 30,
    peakPrice: 220,
    peakDaysAfter: 17,
    volumeChangePct: 138,
  },
];

// ─── Correlation Patterns ────────────────────────────────────────────

const correlationPatterns: CorrelationPattern[] = [
  {
    id: 'cp-001',
    contractType: 'rookie_extension',
    sport: 'NFL',
    sampleSize: 24,
    avgPriceChange: 21.4,
    medianPriceChange: 20.8,
    stdDeviation: 5.2,
    avgTimeToEffect: 3,
    avgPeakDays: 15,
    avgRetracePercent: 22,
    positiveRate: 0.92,
    cardTier: 'flagship',
    description: 'NFL rookie extensions on Prizm RCs show strong, sustained price increases averaging 21% within 30 days.',
  },
  {
    id: 'cp-002',
    contractType: '5th_year_option',
    sport: 'NFL',
    sampleSize: 18,
    avgPriceChange: 14.2,
    medianPriceChange: 12.8,
    stdDeviation: 7.8,
    avgTimeToEffect: 2,
    avgPeakDays: 10,
    avgRetracePercent: 35,
    positiveRate: 0.78,
    cardTier: 'flagship',
    description: '5th-year option pickups provide moderate bumps. Effect is short-lived with higher retrace rates.',
  },
  {
    id: 'cp-003',
    contractType: 'max_deal',
    sport: 'NBA',
    sampleSize: 15,
    avgPriceChange: 22.5,
    medianPriceChange: 24.3,
    stdDeviation: 8.1,
    avgTimeToEffect: 2,
    avgPeakDays: 20,
    avgRetracePercent: 18,
    positiveRate: 0.93,
    cardTier: 'flagship',
    description: 'NBA max deals produce the strongest sustained gains. Prizm PSA 10 RCs average +22.5% with low retrace.',
  },
  {
    id: 'cp-004',
    contractType: 'franchise_tag',
    sport: 'NFL',
    sampleSize: 12,
    avgPriceChange: -3.8,
    medianPriceChange: -5.1,
    stdDeviation: 9.2,
    avgTimeToEffect: 1,
    avgPeakDays: 3,
    avgRetracePercent: 0,
    positiveRate: 0.33,
    cardTier: 'flagship',
    description: 'Franchise tags signal uncertainty. Cards typically drop slightly as collectors interpret it as lack of long-term commitment.',
  },
  {
    id: 'cp-005',
    contractType: 'free_agency_signing',
    sport: 'NFL',
    sampleSize: 30,
    avgPriceChange: 16.8,
    medianPriceChange: 15.2,
    stdDeviation: 12.4,
    avgTimeToEffect: 1,
    avgPeakDays: 18,
    avgRetracePercent: 28,
    positiveRate: 0.72,
    cardTier: 'flagship',
    description: 'Free agency signings vary widely. Team destination matters enormously — big market = bigger bump.',
  },
  {
    id: 'cp-006',
    contractType: 'rookie_extension',
    sport: 'NBA',
    sampleSize: 20,
    avgPriceChange: 20.1,
    medianPriceChange: 19.3,
    stdDeviation: 6.0,
    avgTimeToEffect: 2,
    avgPeakDays: 16,
    avgRetracePercent: 20,
    positiveRate: 0.90,
    cardTier: 'flagship',
    description: 'NBA rookie extensions closely mirror NFL pattern with slightly lower avg impact but similar consistency.',
  },
  {
    id: 'cp-007',
    contractType: 'rookie_extension',
    sport: 'MLB',
    sampleSize: 16,
    avgPriceChange: 22.1,
    medianPriceChange: 22.0,
    stdDeviation: 4.8,
    avgTimeToEffect: 2,
    avgPeakDays: 16,
    avgRetracePercent: 15,
    positiveRate: 0.94,
    cardTier: 'flagship',
    description: 'MLB rookie extensions on Topps Chrome produce the most consistent gains of any sport/type combination.',
  },
  {
    id: 'cp-008',
    contractType: 'free_agency_signing',
    sport: 'MLB',
    sampleSize: 22,
    avgPriceChange: 28.5,
    medianPriceChange: 22.0,
    stdDeviation: 18.2,
    avgTimeToEffect: 1,
    avgPeakDays: 22,
    avgRetracePercent: 25,
    positiveRate: 0.82,
    cardTier: 'flagship',
    description: 'MLB free agency signings can produce massive spikes (see: Ohtani) but high variance makes them unpredictable.',
  },
  {
    id: 'cp-009',
    contractType: 'rookie_extension',
    sport: 'NFL',
    sampleSize: 24,
    avgPriceChange: 12.8,
    medianPriceChange: 11.5,
    stdDeviation: 6.1,
    avgTimeToEffect: 4,
    avgPeakDays: 12,
    avgRetracePercent: 30,
    positiveRate: 0.83,
    cardTier: 'mid',
    description: 'Mid-tier parallels (Select, Mosaic) see about 60% of the flagship impact on rookie extensions.',
  },
  {
    id: 'cp-010',
    contractType: 'rookie_extension',
    sport: 'NFL',
    sampleSize: 24,
    avgPriceChange: 7.2,
    medianPriceChange: 6.0,
    stdDeviation: 4.5,
    avgTimeToEffect: 5,
    avgPeakDays: 8,
    avgRetracePercent: 45,
    positiveRate: 0.71,
    cardTier: 'low',
    description: 'Low-tier base cards see minimal, short-lived impact from contract events. Not recommended for speculation.',
  },
];

// ─── Upcoming Contracts ──────────────────────────────────────────────

const upcomingContracts: UpcomingContract[] = [
  {
    id: 'uc-001',
    player: 'CJ Stroud',
    sport: 'NFL',
    team: 'Houston Texans',
    position: 'QB',
    contractType: '5th_year_option',
    expectedDate: '2026-05-01',
    daysUntil: 46,
    currentContractValue: 36.2,
    projectedNewValue: 30.8,
    likelihood: 98,
    topCard: { set: 'Prizm', year: 2023, grade: 'PSA 10', currentPrice: 385 },
    predictedImpact: 18.2,
    confidenceInterval: { low: 12.5, mid: 18.2, high: 24.8 },
    signal: 'buy',
    signalStrength: 88,
    notes: 'Elite QB performance makes 5th-year option a certainty. Buy window closing — card already pricing in some expectation.',
  },
  {
    id: 'uc-002',
    player: 'Bryce Young',
    sport: 'NFL',
    team: 'Carolina Panthers',
    position: 'QB',
    contractType: '5th_year_option',
    expectedDate: '2026-05-01',
    daysUntil: 46,
    currentContractValue: 35.1,
    projectedNewValue: 28.2,
    likelihood: 45,
    topCard: { set: 'Prizm', year: 2023, grade: 'PSA 10', currentPrice: 52 },
    predictedImpact: -8.5,
    confidenceInterval: { low: -18.0, mid: -8.5, high: 4.0 },
    signal: 'sell',
    signalStrength: 72,
    notes: 'Declining option signals franchise does not view him as long-term starter. Sell before decision.',
  },
  {
    id: 'uc-003',
    player: 'Victor Wembanyama',
    sport: 'NBA',
    team: 'San Antonio Spurs',
    position: 'C',
    contractType: 'rookie_extension',
    expectedDate: '2027-10-01',
    daysUntil: 564,
    currentContractValue: 55.5,
    projectedNewValue: 340,
    likelihood: 99,
    topCard: { set: 'Prizm', year: 2023, grade: 'PSA 10', currentPrice: 1250 },
    predictedImpact: 25.5,
    confidenceInterval: { low: 18.0, mid: 25.5, high: 35.0 },
    signal: 'buy',
    signalStrength: 95,
    notes: 'Generational talent will command supermax. Long runway means gradual price-in — accumulate on dips.',
  },
  {
    id: 'uc-004',
    player: 'Caleb Williams',
    sport: 'NFL',
    team: 'Chicago Bears',
    position: 'QB',
    contractType: '5th_year_option',
    expectedDate: '2027-05-01',
    daysUntil: 411,
    currentContractValue: 39.5,
    projectedNewValue: 32.5,
    likelihood: 82,
    topCard: { set: 'Prizm', year: 2024, grade: 'PSA 10', currentPrice: 210 },
    predictedImpact: 15.8,
    confidenceInterval: { low: 8.0, mid: 15.8, high: 22.0 },
    signal: 'buy',
    signalStrength: 68,
    notes: 'Promising but inconsistent rookie year. Option likely but not certain — moderate confidence.',
  },
  {
    id: 'uc-005',
    player: 'Paul Skenes',
    sport: 'MLB',
    team: 'Pittsburgh Pirates',
    position: 'SP',
    contractType: 'rookie_extension',
    expectedDate: '2027-03-01',
    daysUntil: 350,
    currentContractValue: 4.8,
    projectedNewValue: 185,
    likelihood: 75,
    topCard: { set: 'Topps Chrome', year: 2024, grade: 'PSA 10', currentPrice: 290 },
    predictedImpact: 22.0,
    confidenceInterval: { low: 14.0, mid: 22.0, high: 32.0 },
    signal: 'buy',
    signalStrength: 78,
    notes: 'Dominant debut season. Extension talks expected after 2026 season. Topps Chrome RC is the card to own.',
  },
  {
    id: 'uc-006',
    player: 'Marvin Harrison Jr',
    sport: 'NFL',
    team: 'Arizona Cardinals',
    position: 'WR',
    contractType: '5th_year_option',
    expectedDate: '2027-05-01',
    daysUntil: 411,
    currentContractValue: 35.7,
    projectedNewValue: 25.2,
    likelihood: 88,
    topCard: { set: 'Prizm', year: 2024, grade: 'PSA 10', currentPrice: 175 },
    predictedImpact: 16.5,
    confidenceInterval: { low: 10.0, mid: 16.5, high: 23.0 },
    signal: 'buy',
    signalStrength: 74,
    notes: 'NFL bloodline and elite talent. 5th-year option exercise is highly probable.',
  },
  {
    id: 'uc-007',
    player: 'Cade Cunningham',
    sport: 'NBA',
    team: 'Detroit Pistons',
    position: 'PG',
    contractType: 'max_deal',
    expectedDate: '2026-07-01',
    daysUntil: 107,
    currentContractValue: 226,
    projectedNewValue: 270,
    likelihood: 90,
    topCard: { set: 'Prizm', year: 2021, grade: 'PSA 10', currentPrice: 72 },
    predictedImpact: 18.8,
    confidenceInterval: { low: 11.0, mid: 18.8, high: 26.0 },
    signal: 'buy',
    signalStrength: 82,
    notes: 'Breakout 2025-26 season makes max deal near-certain. Card is underpriced relative to extension impact.',
  },
  {
    id: 'uc-008',
    player: 'Jackson Holliday',
    sport: 'MLB',
    team: 'Baltimore Orioles',
    position: 'SS',
    contractType: 'rookie_extension',
    expectedDate: '2028-02-01',
    daysUntil: 687,
    currentContractValue: 2.1,
    projectedNewValue: 150,
    likelihood: 60,
    topCard: { set: 'Topps Chrome', year: 2024, grade: 'PSA 10', currentPrice: 145 },
    predictedImpact: 20.5,
    confidenceInterval: { low: 8.0, mid: 20.5, high: 35.0 },
    signal: 'hold',
    signalStrength: 45,
    notes: 'Top prospect but needs to establish himself in MLB. Wide confidence interval — monitor performance.',
  },
];

// ─── Prediction Models ───────────────────────────────────────────────

const predictionModels: PredictionModel[] = [
  {
    id: 'pm-001',
    name: 'ContractPricer v3.2',
    description: 'Primary model using contract value, player performance metrics, card population, and market momentum to predict price impact.',
    accuracy: 0.847,
    backtestPeriod: '2020-2025',
    features: ['contract_aav', 'guaranteed_pct', 'player_war', 'card_pop', 'market_volume', 'social_sentiment', 'team_market_size'],
    lastUpdated: '2026-03-10',
    predictions: [
      { contractEventId: 'uc-001', predictedChange: 18.2, actualChange: null, confidence: 'high', confidenceScore: 0.91 },
      { contractEventId: 'uc-002', predictedChange: -8.5, actualChange: null, confidence: 'medium', confidenceScore: 0.68 },
      { contractEventId: 'uc-003', predictedChange: 25.5, actualChange: null, confidence: 'high', confidenceScore: 0.94 },
      { contractEventId: 'uc-004', predictedChange: 15.8, actualChange: null, confidence: 'medium', confidenceScore: 0.72 },
      { contractEventId: 'uc-005', predictedChange: 22.0, actualChange: null, confidence: 'high', confidenceScore: 0.85 },
      { contractEventId: 'uc-006', predictedChange: 16.5, actualChange: null, confidence: 'medium', confidenceScore: 0.76 },
      { contractEventId: 'uc-007', predictedChange: 18.8, actualChange: null, confidence: 'high', confidenceScore: 0.88 },
      { contractEventId: 'uc-008', predictedChange: 20.5, actualChange: null, confidence: 'low', confidenceScore: 0.55 },
    ],
  },
  {
    id: 'pm-002',
    name: 'HistoricalComps v2.1',
    description: 'Comparison-based model that finds the most similar historical contract events and averages their outcomes.',
    accuracy: 0.792,
    backtestPeriod: '2018-2025',
    features: ['contract_type', 'sport', 'position', 'draft_position', 'years_in_league', 'card_tier', 'pre_event_trend'],
    lastUpdated: '2026-03-08',
    predictions: [
      { contractEventId: 'uc-001', predictedChange: 17.5, actualChange: null, confidence: 'high', confidenceScore: 0.88 },
      { contractEventId: 'uc-002', predictedChange: -12.0, actualChange: null, confidence: 'medium', confidenceScore: 0.62 },
      { contractEventId: 'uc-003', predictedChange: 28.0, actualChange: null, confidence: 'high', confidenceScore: 0.92 },
      { contractEventId: 'uc-004', predictedChange: 14.2, actualChange: null, confidence: 'medium', confidenceScore: 0.70 },
      { contractEventId: 'uc-005', predictedChange: 24.5, actualChange: null, confidence: 'high', confidenceScore: 0.82 },
      { contractEventId: 'uc-006', predictedChange: 15.0, actualChange: null, confidence: 'medium', confidenceScore: 0.73 },
      { contractEventId: 'uc-007', predictedChange: 20.2, actualChange: null, confidence: 'high', confidenceScore: 0.86 },
      { contractEventId: 'uc-008', predictedChange: 18.0, actualChange: null, confidence: 'low', confidenceScore: 0.50 },
    ],
  },
  {
    id: 'pm-003',
    name: 'SentimentBlend v1.4',
    description: 'Incorporates social media sentiment, search trends, and news coverage intensity with contract fundamentals.',
    accuracy: 0.815,
    backtestPeriod: '2021-2025',
    features: ['social_volume', 'sentiment_score', 'search_trend', 'news_coverage', 'contract_aav', 'player_popularity_rank'],
    lastUpdated: '2026-03-12',
    predictions: [
      { contractEventId: 'uc-001', predictedChange: 19.8, actualChange: null, confidence: 'high', confidenceScore: 0.90 },
      { contractEventId: 'uc-002', predictedChange: -5.2, actualChange: null, confidence: 'low', confidenceScore: 0.52 },
      { contractEventId: 'uc-003', predictedChange: 30.2, actualChange: null, confidence: 'high', confidenceScore: 0.95 },
      { contractEventId: 'uc-004', predictedChange: 17.0, actualChange: null, confidence: 'medium', confidenceScore: 0.74 },
      { contractEventId: 'uc-005', predictedChange: 20.5, actualChange: null, confidence: 'medium', confidenceScore: 0.78 },
      { contractEventId: 'uc-006', predictedChange: 18.2, actualChange: null, confidence: 'medium', confidenceScore: 0.75 },
      { contractEventId: 'uc-007', predictedChange: 17.5, actualChange: null, confidence: 'high', confidenceScore: 0.87 },
      { contractEventId: 'uc-008', predictedChange: 22.0, actualChange: null, confidence: 'low', confidenceScore: 0.48 },
    ],
  },
];

// ─── Strategy Signals ────────────────────────────────────────────────

const strategySignals: StrategySignal[] = [
  {
    id: 'ss-001',
    player: 'CJ Stroud',
    sport: 'NFL',
    action: 'buy',
    strength: 88,
    reasoning: '5th-year option exercise imminent (46 days). Historical data shows +18% avg for elite QB options. Card has not yet priced in the event.',
    targetCard: '2023 Prizm PSA 10 #301',
    currentPrice: 385,
    targetPrice: 455,
    timeHorizon: '30-60 days',
    riskLevel: 'low',
    contractContext: '5th-year option — 98% likelihood',
    createdAt: '2026-03-16',
  },
  {
    id: 'ss-002',
    player: 'Bryce Young',
    sport: 'NFL',
    action: 'sell',
    strength: 72,
    reasoning: 'Option decline likely signals franchise moving on. Historical pattern shows -8% to -18% on declined options for QBs.',
    targetCard: '2023 Prizm PSA 10 #302',
    currentPrice: 52,
    targetPrice: 42,
    timeHorizon: '30-60 days',
    riskLevel: 'medium',
    contractContext: '5th-year option — 45% likelihood of exercise',
    createdAt: '2026-03-16',
  },
  {
    id: 'ss-003',
    player: 'Victor Wembanyama',
    sport: 'NBA',
    action: 'buy',
    strength: 95,
    reasoning: 'Generational talent with guaranteed supermax incoming. Price will steadily climb as extension date approaches. Best entry point is now.',
    targetCard: '2023 Prizm PSA 10 #275',
    currentPrice: 1250,
    targetPrice: 1570,
    timeHorizon: '6-12 months',
    riskLevel: 'low',
    contractContext: 'Rookie extension — 99% likelihood',
    createdAt: '2026-03-16',
  },
  {
    id: 'ss-004',
    player: 'Cade Cunningham',
    sport: 'NBA',
    action: 'buy',
    strength: 82,
    reasoning: 'Max deal 107 days away. Breakout season makes it near-certain. Card at $72 is significantly undervalued relative to expected +18.8% boost.',
    targetCard: '2021 Prizm PSA 10 #282',
    currentPrice: 72,
    targetPrice: 86,
    timeHorizon: '60-120 days',
    riskLevel: 'low',
    contractContext: 'Max deal — 90% likelihood',
    createdAt: '2026-03-16',
  },
  {
    id: 'ss-005',
    player: 'Paul Skenes',
    sport: 'MLB',
    action: 'buy',
    strength: 78,
    reasoning: 'Dominant debut puts him on extension track. Long runway to accumulate. Topps Chrome RC will be the primary beneficiary.',
    targetCard: '2024 Topps Chrome PSA 10 #200',
    currentPrice: 290,
    targetPrice: 354,
    timeHorizon: '6-12 months',
    riskLevel: 'medium',
    contractContext: 'Rookie extension — 75% likelihood',
    createdAt: '2026-03-16',
  },
  {
    id: 'ss-006',
    player: 'Marvin Harrison Jr',
    sport: 'NFL',
    action: 'buy',
    strength: 74,
    reasoning: 'NFL legacy name with elite talent. 5th-year option exercise is probable. Card undervalued at $175 for a WR1 caliber player.',
    targetCard: '2024 Prizm PSA 10 #350',
    currentPrice: 175,
    targetPrice: 204,
    timeHorizon: '6-12 months',
    riskLevel: 'medium',
    contractContext: '5th-year option — 88% likelihood',
    createdAt: '2026-03-16',
  },
  {
    id: 'ss-007',
    player: 'Caleb Williams',
    sport: 'NFL',
    action: 'hold',
    strength: 55,
    reasoning: 'Potential is there but inconsistent play creates uncertainty. Wait for 2026 season performance data before committing.',
    targetCard: '2024 Prizm PSA 10 #301',
    currentPrice: 210,
    targetPrice: 243,
    timeHorizon: '12+ months',
    riskLevel: 'high',
    contractContext: '5th-year option — 82% likelihood',
    createdAt: '2026-03-16',
  },
  {
    id: 'ss-008',
    player: 'Jackson Holliday',
    sport: 'MLB',
    action: 'hold',
    strength: 45,
    reasoning: 'Top prospect but too early to speculate on extension. Wide outcome range. Monitor 2026 MLB performance.',
    targetCard: '2024 Topps Chrome PSA 10 #100',
    currentPrice: 145,
    targetPrice: 175,
    timeHorizon: '12+ months',
    riskLevel: 'high',
    contractContext: 'Rookie extension — 60% likelihood',
    createdAt: '2026-03-16',
  },
];

// ─── Correlation Matrix ──────────────────────────────────────────────

const correlationMatrix: CorrelationMatrixEntry[] = [
  { contractType: 'rookie_extension', sport: 'NFL', flagshipImpact: 21.4, midTierImpact: 12.8, lowTierImpact: 7.2, avgVolume: 135, sustainRate: 0.78 },
  { contractType: 'rookie_extension', sport: 'NBA', flagshipImpact: 20.1, midTierImpact: 11.5, lowTierImpact: 6.8, avgVolume: 125, sustainRate: 0.80 },
  { contractType: 'rookie_extension', sport: 'MLB', flagshipImpact: 22.1, midTierImpact: 13.2, lowTierImpact: 7.5, avgVolume: 142, sustainRate: 0.85 },
  { contractType: '5th_year_option', sport: 'NFL', flagshipImpact: 14.2, midTierImpact: 8.1, lowTierImpact: 4.2, avgVolume: 72, sustainRate: 0.65 },
  { contractType: 'max_deal', sport: 'NBA', flagshipImpact: 22.5, midTierImpact: 14.0, lowTierImpact: 8.5, avgVolume: 165, sustainRate: 0.82 },
  { contractType: 'franchise_tag', sport: 'NFL', flagshipImpact: -3.8, midTierImpact: -2.1, lowTierImpact: -1.0, avgVolume: 72, sustainRate: 0.33 },
  { contractType: 'free_agency_signing', sport: 'NFL', flagshipImpact: 16.8, midTierImpact: 9.5, lowTierImpact: 5.2, avgVolume: 118, sustainRate: 0.72 },
  { contractType: 'free_agency_signing', sport: 'MLB', flagshipImpact: 28.5, midTierImpact: 16.2, lowTierImpact: 9.0, avgVolume: 195, sustainRate: 0.75 },
];

// ─── Exported Functions ──────────────────────────────────────────────

export function getHistoricalCorrelations(): ContractEvent[] {
  return historicalContractEvents;
}

export function getUpcomingContracts(): UpcomingContract[] {
  return upcomingContracts.sort((a, b) => a.daysUntil - b.daysUntil);
}

export function predictImpact(contractType: ContractType, sport: Sport, cardTier: 'flagship' | 'mid' | 'low' = 'flagship'): CorrelationPattern | null {
  return correlationPatterns.find(
    (p) => p.contractType === contractType && p.sport === sport && p.cardTier === cardTier
  ) || null;
}

export function getPatternsByType(contractType?: ContractType): CorrelationPattern[] {
  if (!contractType) return correlationPatterns;
  return correlationPatterns.filter((p) => p.contractType === contractType);
}

export function getCorrelationMatrix(): CorrelationMatrixEntry[] {
  return correlationMatrix;
}

export function getPredictionModels(): PredictionModel[] {
  return predictionModels;
}

export function getStrategySignals(): StrategySignal[] {
  return strategySignals.sort((a, b) => b.strength - a.strength);
}

export function getScatterData(): { contractValue: number; priceChange: number; player: string; sport: Sport; type: ContractType }[] {
  return historicalContractEvents.map((e) => ({
    contractValue: e.contractValue,
    priceChange: e.percentChange,
    player: e.player,
    sport: e.sport,
    type: e.contractType,
  }));
}

export function getSummaryStats(): {
  totalEvents: number;
  avgImpact: number;
  positiveRate: number;
  bestType: string;
  bestSport: string;
  avgTimeToEffect: number;
} {
  const events = historicalContractEvents;
  const totalEvents = events.length;
  const avgImpact = events.reduce((sum, e) => sum + e.percentChange, 0) / totalEvents;
  const positiveRate = events.filter((e) => e.percentChange > 0).length / totalEvents;

  const typeAvg: Record<string, number[]> = {};
  events.forEach((e) => {
    if (!typeAvg[e.contractType]) typeAvg[e.contractType] = [];
    typeAvg[e.contractType].push(e.percentChange);
  });

  let bestType = '';
  let bestTypeAvg = -Infinity;
  for (const [type, values] of Object.entries(typeAvg)) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg > bestTypeAvg) {
      bestTypeAvg = avg;
      bestType = type;
    }
  }

  const sportAvg: Record<string, number[]> = {};
  events.forEach((e) => {
    if (!sportAvg[e.sport]) sportAvg[e.sport] = [];
    sportAvg[e.sport].push(e.percentChange);
  });

  let bestSport = '';
  let bestSportAvg = -Infinity;
  for (const [sport, values] of Object.entries(sportAvg)) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg > bestSportAvg) {
      bestSportAvg = avg;
      bestSport = sport;
    }
  }

  return {
    totalEvents,
    avgImpact: Math.round(avgImpact * 10) / 10,
    positiveRate: Math.round(positiveRate * 100),
    bestType: contractTypeLabels[bestType as ContractType] || bestType,
    bestSport,
    avgTimeToEffect: 2,
  };
}
