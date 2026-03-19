// Regret Minimization Engine Service

// ---- Types ----

export interface PassedCard {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  grade: string;
  passedOnDate: string;
  passedOnPrice: number;
  currentPrice: number;
  returnPct: number;
  regretScore: number; // 0-100
  reason: string;
  category: string;
  isStillAvailable: boolean;
  compsSincePass: number;
}

export interface RegretPattern {
  patternType: string;
  avgRegretScore: number;
  totalPassed: number;
  totalMissed: number;
  estimatedMissedValue: number;
}

export interface RegretCoefficient {
  overall: number; // 0-100
  byCategory: Record<string, number>;
  trend: 'improving' | 'worsening' | 'stable';
  topRegretCategory: string;
}

export interface RegretAlert {
  id: string;
  cardName: string;
  message: string;
  urgency: 'high' | 'medium' | 'low';
  potentialRegretScore: number;
}

export interface RegretSummary {
  totalPassedCards: number;
  totalMissedValue: number;
  avgReturnMissed: number;
  biggestMiss: string;
  regretCoefficient: number;
}

export interface RegretTimelinePoint {
  month: string;
  regretScore: number;
  passedCards: number;
  cumulativeMissedValue: number;
}

// ---- Mock Data ----

const PASSED_CARDS: PassedCard[] = [
  {
    id: 'pc-001',
    cardName: '2018 Topps Chrome Patrick Mahomes RC PSA 10',
    player: 'Patrick Mahomes',
    sport: 'Football',
    year: 2018,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    passedOnDate: '2019-03-14',
    passedOnPrice: 320,
    currentPrice: 8400,
    returnPct: 2525,
    regretScore: 99,
    reason: 'Price too high',
    category: 'Rookie Cards',
    isStillAvailable: true,
    compsSincePass: 847,
  },
  {
    id: 'pc-002',
    cardName: '1986 Fleer Michael Jordan RC BGS 9',
    player: 'Michael Jordan',
    sport: 'Basketball',
    year: 1986,
    set: 'Fleer',
    grade: 'BGS 9',
    passedOnDate: '2017-08-22',
    passedOnPrice: 4200,
    currentPrice: 42000,
    returnPct: 900,
    regretScore: 97,
    reason: 'Wrong timing',
    category: 'Vintage',
    isStillAvailable: true,
    compsSincePass: 312,
  },
  {
    id: 'pc-003',
    cardName: '2003 Topps Chrome LeBron James RC PSA 10',
    player: 'LeBron James',
    sport: 'Basketball',
    year: 2003,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    passedOnDate: '2018-11-05',
    passedOnPrice: 5500,
    currentPrice: 96000,
    returnPct: 1645,
    regretScore: 98,
    reason: 'Passed on instinct',
    category: 'Rookie Cards',
    isStillAvailable: false,
    compsSincePass: 203,
  },
  {
    id: 'pc-004',
    cardName: '2009 Bowman Chrome Mike Trout Auto RC PSA 10',
    player: 'Mike Trout',
    sport: 'Baseball',
    year: 2009,
    set: 'Bowman Chrome',
    grade: 'PSA 10',
    passedOnDate: '2016-06-18',
    passedOnPrice: 7800,
    currentPrice: 310000,
    returnPct: 3874,
    regretScore: 100,
    reason: 'Price too high',
    category: 'Autographs',
    isStillAvailable: false,
    compsSincePass: 42,
  },
  {
    id: 'pc-005',
    cardName: '2000 Bowman Chrome Tom Brady RC PSA 9',
    player: 'Tom Brady',
    sport: 'Football',
    year: 2000,
    set: 'Bowman Chrome',
    grade: 'PSA 9',
    passedOnDate: '2015-09-10',
    passedOnPrice: 1100,
    currentPrice: 18500,
    returnPct: 1582,
    regretScore: 96,
    reason: 'Wrong timing',
    category: 'Rookie Cards',
    isStillAvailable: true,
    compsSincePass: 520,
  },
  {
    id: 'pc-006',
    cardName: '1979 Topps Wayne Gretzky RC PSA 8',
    player: 'Wayne Gretzky',
    sport: 'Hockey',
    year: 1979,
    set: 'Topps',
    grade: 'PSA 8',
    passedOnDate: '2016-02-14',
    passedOnPrice: 3200,
    currentPrice: 22000,
    returnPct: 588,
    regretScore: 91,
    reason: 'Passed on instinct',
    category: 'Vintage',
    isStillAvailable: true,
    compsSincePass: 188,
  },
  {
    id: 'pc-007',
    cardName: '2020 Prizm Justin Herbert RC Silver PSA 10',
    player: 'Justin Herbert',
    sport: 'Football',
    year: 2020,
    set: 'Prizm',
    grade: 'PSA 10',
    passedOnDate: '2020-12-02',
    passedOnPrice: 280,
    currentPrice: 1850,
    returnPct: 561,
    regretScore: 78,
    reason: 'Price too high',
    category: 'Rookie Cards',
    isStillAvailable: true,
    compsSincePass: 634,
  },
  {
    id: 'pc-008',
    cardName: '2017 Panini Prizm Luka Doncic RC PSA 10',
    player: 'Luka Doncic',
    sport: 'Basketball',
    year: 2017,
    set: 'Panini Prizm',
    grade: 'PSA 10',
    passedOnDate: '2018-07-30',
    passedOnPrice: 180,
    currentPrice: 12400,
    returnPct: 6789,
    regretScore: 100,
    reason: 'Passed on instinct',
    category: 'Rookie Cards',
    isStillAvailable: false,
    compsSincePass: 1102,
  },
  {
    id: 'pc-009',
    cardName: '1952 Topps Mickey Mantle PSA 4',
    player: 'Mickey Mantle',
    sport: 'Baseball',
    year: 1952,
    set: 'Topps',
    grade: 'PSA 4',
    passedOnDate: '2014-04-11',
    passedOnPrice: 28000,
    currentPrice: 195000,
    returnPct: 596,
    regretScore: 94,
    reason: 'Wrong timing',
    category: 'Vintage',
    isStillAvailable: false,
    compsSincePass: 28,
  },
  {
    id: 'pc-010',
    cardName: '2019 Prizm Ja Morant RC Silver PSA 10',
    player: 'Ja Morant',
    sport: 'Basketball',
    year: 2019,
    set: 'Prizm',
    grade: 'PSA 10',
    passedOnDate: '2020-01-15',
    passedOnPrice: 95,
    currentPrice: 2200,
    returnPct: 2216,
    regretScore: 95,
    reason: 'Price too high',
    category: 'Rookie Cards',
    isStillAvailable: true,
    compsSincePass: 887,
  },
  {
    id: 'pc-011',
    cardName: '2021 Topps Chrome Wander Franco Auto RC PSA 10',
    player: 'Wander Franco',
    sport: 'Baseball',
    year: 2021,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    passedOnDate: '2021-09-05',
    passedOnPrice: 1200,
    currentPrice: 620,
    returnPct: -48,
    regretScore: 8,
    reason: 'Price too high',
    category: 'Autographs',
    isStillAvailable: true,
    compsSincePass: 215,
  },
  {
    id: 'pc-012',
    cardName: '2020 Topps Chrome Devin Booker PSA 10',
    player: 'Devin Booker',
    sport: 'Basketball',
    year: 2020,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    passedOnDate: '2021-03-20',
    passedOnPrice: 340,
    currentPrice: 295,
    returnPct: -13,
    regretScore: 12,
    reason: 'Wrong timing',
    category: 'Base Cards',
    isStillAvailable: true,
    compsSincePass: 342,
  },
  {
    id: 'pc-013',
    cardName: '2016 Topps Chrome Kris Bryant RC PSA 10',
    player: 'Kris Bryant',
    sport: 'Baseball',
    year: 2016,
    set: 'Topps Chrome',
    grade: 'PSA 10',
    passedOnDate: '2017-05-08',
    passedOnPrice: 420,
    currentPrice: 390,
    returnPct: -7,
    regretScore: 15,
    reason: 'Passed on instinct',
    category: 'Rookie Cards',
    isStillAvailable: true,
    compsSincePass: 178,
  },
  {
    id: 'pc-014',
    cardName: '2021 Prizm Cade Cunningham RC PSA 10',
    player: 'Cade Cunningham',
    sport: 'Basketball',
    year: 2021,
    set: 'Prizm',
    grade: 'PSA 10',
    passedOnDate: '2022-02-14',
    passedOnPrice: 310,
    currentPrice: 480,
    returnPct: 55,
    regretScore: 42,
    reason: 'Price too high',
    category: 'Rookie Cards',
    isStillAvailable: true,
    compsSincePass: 421,
  },
  {
    id: 'pc-015',
    cardName: '2020 Bowman Chrome Spencer Torkelson Auto RC BGS 9.5',
    player: 'Spencer Torkelson',
    sport: 'Baseball',
    year: 2020,
    set: 'Bowman Chrome',
    grade: 'BGS 9.5',
    passedOnDate: '2021-06-22',
    passedOnPrice: 890,
    currentPrice: 540,
    returnPct: -39,
    regretScore: 10,
    reason: 'Passed on instinct',
    category: 'Autographs',
    isStillAvailable: true,
    compsSincePass: 96,
  },
  {
    id: 'pc-016',
    cardName: '2019 Panini National Treasures Zion Williamson RPA /99 PSA 9',
    player: 'Zion Williamson',
    sport: 'Basketball',
    year: 2019,
    set: 'National Treasures',
    grade: 'PSA 9',
    passedOnDate: '2020-04-01',
    passedOnPrice: 3400,
    currentPrice: 28000,
    returnPct: 724,
    regretScore: 93,
    reason: 'Wrong timing',
    category: 'Patch Autos',
    isStillAvailable: false,
    compsSincePass: 67,
  },
  {
    id: 'pc-017',
    cardName: '1969 Topps Lew Alcindor (Kareem) RC PSA 7',
    player: 'Kareem Abdul-Jabbar',
    sport: 'Basketball',
    year: 1969,
    set: 'Topps',
    grade: 'PSA 7',
    passedOnDate: '2015-11-18',
    passedOnPrice: 2800,
    currentPrice: 14500,
    returnPct: 418,
    regretScore: 82,
    reason: 'Price too high',
    category: 'Vintage',
    isStillAvailable: true,
    compsSincePass: 44,
  },
  {
    id: 'pc-018',
    cardName: '2021 Prizm Evan Mobley RC Silver PSA 10',
    player: 'Evan Mobley',
    sport: 'Basketball',
    year: 2021,
    set: 'Prizm',
    grade: 'PSA 10',
    passedOnDate: '2022-01-10',
    passedOnPrice: 145,
    currentPrice: 210,
    returnPct: 45,
    regretScore: 38,
    reason: 'Passed on instinct',
    category: 'Rookie Cards',
    isStillAvailable: true,
    compsSincePass: 503,
  },
];

const REGRET_PATTERNS: RegretPattern[] = [
  {
    patternType: 'Rookie Cards',
    avgRegretScore: 82,
    totalPassed: 8,
    totalMissed: 6,
    estimatedMissedValue: 127400,
  },
  {
    patternType: 'Vintage',
    avgRegretScore: 89,
    totalPassed: 4,
    totalMissed: 4,
    estimatedMissedValue: 248000,
  },
  {
    patternType: 'Autographs',
    avgRegretScore: 39,
    totalPassed: 3,
    totalMissed: 1,
    estimatedMissedValue: 18200,
  },
  {
    patternType: 'Patch Autos',
    avgRegretScore: 93,
    totalPassed: 1,
    totalMissed: 1,
    estimatedMissedValue: 24600,
  },
  {
    patternType: 'Base Cards',
    avgRegretScore: 12,
    totalPassed: 2,
    totalMissed: 0,
    estimatedMissedValue: 0,
  },
];

const REGRET_COEFFICIENT: RegretCoefficient = {
  overall: 74,
  byCategory: {
    'Rookie Cards': 82,
    'Vintage': 89,
    'Autographs': 39,
    'Patch Autos': 93,
    'Base Cards': 12,
  },
  trend: 'worsening',
  topRegretCategory: 'Patch Autos',
};

const REGRET_ALERTS: RegretAlert[] = [
  {
    id: 'ra-001',
    cardName: '2023 Topps Chrome Victor Wembanyama RC PSA 10',
    message: 'Based on your Rookie Card pattern (82 avg regret), passing this card has a 91% chance of future regret.',
    urgency: 'high',
    potentialRegretScore: 91,
  },
  {
    id: 'ra-002',
    cardName: '1993 SP Derek Jeter RC PSA 9',
    message: 'Vintage baseball rookie — your historical regret on Vintage passes is 89. Strong buy signal.',
    urgency: 'high',
    potentialRegretScore: 88,
  },
  {
    id: 'ra-003',
    cardName: '2022 Prizm Paolo Banchero RC Silver PSA 10',
    message: 'Rookie card at market low. Prior similar passes averaged +540% returns over 3 years.',
    urgency: 'medium',
    potentialRegretScore: 72,
  },
  {
    id: 'ra-004',
    cardName: '2021 Bowman Chrome Gunnar Henderson Auto RC',
    message: 'Autograph rookie — moderate regret risk based on your Autograph pass history.',
    urgency: 'low',
    potentialRegretScore: 45,
  },
];

const REGRET_TIMELINE: RegretTimelinePoint[] = [
  { month: 'Jan', regretScore: 48, passedCards: 2, cumulativeMissedValue: 12000 },
  { month: 'Feb', regretScore: 52, passedCards: 1, cumulativeMissedValue: 18500 },
  { month: 'Mar', regretScore: 55, passedCards: 3, cumulativeMissedValue: 31000 },
  { month: 'Apr', regretScore: 61, passedCards: 2, cumulativeMissedValue: 47000 },
  { month: 'May', regretScore: 59, passedCards: 1, cumulativeMissedValue: 52000 },
  { month: 'Jun', regretScore: 68, passedCards: 4, cumulativeMissedValue: 89000 },
  { month: 'Jul', regretScore: 65, passedCards: 2, cumulativeMissedValue: 102000 },
  { month: 'Aug', regretScore: 72, passedCards: 3, cumulativeMissedValue: 168000 },
  { month: 'Sep', regretScore: 70, passedCards: 1, cumulativeMissedValue: 175000 },
  { month: 'Oct', regretScore: 76, passedCards: 5, cumulativeMissedValue: 248000 },
  { month: 'Nov', regretScore: 74, passedCards: 2, cumulativeMissedValue: 278000 },
  { month: 'Dec', regretScore: 74, passedCards: 0, cumulativeMissedValue: 287600 },
];

// ---- Exported Functions ----

export function getPassedCards(): PassedCard[] {
  return PASSED_CARDS;
}

export function getTopRegrets(limit = 5): PassedCard[] {
  return [...PASSED_CARDS].sort((a, b) => b.regretScore - a.regretScore).slice(0, limit);
}

export function getRegretPatterns(): RegretPattern[] {
  return REGRET_PATTERNS;
}

export function getRegretCoefficient(): RegretCoefficient {
  return REGRET_COEFFICIENT;
}

export function getRegretAlerts(): RegretAlert[] {
  return REGRET_ALERTS;
}

export function getRegretTimeline(): RegretTimelinePoint[] {
  return REGRET_TIMELINE;
}

export function getRegretSummary(): RegretSummary {
  const totalMissedValue = PASSED_CARDS.reduce((sum, c) => {
    const missed = c.currentPrice - c.passedOnPrice;
    return missed > 0 ? sum + missed : sum;
  }, 0);
  const positiveReturns = PASSED_CARDS.filter(c => c.returnPct > 0);
  const avgReturnMissed =
    positiveReturns.length > 0
      ? Math.round(positiveReturns.reduce((sum, c) => sum + c.returnPct, 0) / positiveReturns.length)
      : 0;
  const biggestMiss = [...PASSED_CARDS].sort((a, b) => b.returnPct - a.returnPct)[0];
  return {
    totalPassedCards: PASSED_CARDS.length,
    totalMissedValue,
    avgReturnMissed,
    biggestMiss: biggestMiss.cardName,
    regretCoefficient: REGRET_COEFFICIENT.overall,
  };
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}
