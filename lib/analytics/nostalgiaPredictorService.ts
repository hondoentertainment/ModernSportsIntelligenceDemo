// Cross-Generational Nostalgia Predictor Service
// Forecasts card demand surges driven by generational nostalgia cycles,
// cultural moments, and cohort spending power curves.

// ---- Types ----

export type DemographicCohort =
  | 'silent'
  | 'boomer'
  | 'gen-x'
  | 'millennial'
  | 'gen-z'
  | 'gen-alpha';

export type NostalgiaTrigger =
  | 'anniversary'
  | 'documentary'
  | 'HOF-induction'
  | 'retirement'
  | 'comeback'
  | 'death'
  | 'record-broken'
  | 'jersey-retirement'
  | 'reunion-event';

export interface CohortProfile {
  cohort: DemographicCohort;
  label: string;
  birthYearStart: number;
  birthYearEnd: number;
  peakEarningAgeStart: number;
  peakEarningAgeEnd: number;
  peakEarningYearStart: number;
  peakEarningYearEnd: number;
  culturalTouchstones: string[];
  collectingPeakDecade: string;
  avgDisposableIncome: number;
  digitalAdoption: number; // 0-100
  color: string;
}

export interface NostalgiaWave {
  id: string;
  name: string;
  trigger: NostalgiaTrigger;
  playerName: string;
  year: number;
  month: number;
  peakPriceMultiplier: number;
  durationMonths: number;
  primaryCohort: DemographicCohort;
  secondaryCohort: DemographicCohort | null;
  description: string;
  priceBeforeWave: number;
  priceAtPeak: number;
  priceAfterWave: number;
  cardName: string;
}

export interface PlayerNostalgiaScore {
  playerId: string;
  playerName: string;
  sport: string;
  activeYears: string;
  cohortScores: Record<DemographicCohort, number>; // 0-100 per cohort
  overallNostalgiaIndex: number;
  upcomingTriggers: string[];
  topCard: string;
  currentAvgPrice: number;
  projectedPeakPrice: number;
}

export interface DemandForecast {
  year: number;
  quarter: string;
  cohort: DemographicCohort;
  demandIndex: number; // 0-100
  spendingPower: number;
  nostalgiaIntensity: number;
  topPlayers: string[];
  confidence: number;
}

export interface CohortSpendingPower {
  decade: string;
  silent: number;
  boomer: number;
  'gen-x': number;
  millennial: number;
  'gen-z': number;
  'gen-alpha': number;
}

export interface PriceWaveProjection {
  monthsFromTrigger: number;
  priceMultiplier: number;
  buyerSentiment: number;
  volumeIndex: number;
}

export interface CulturalMoment {
  id: string;
  title: string;
  date: string;
  trigger: NostalgiaTrigger;
  affectedPlayers: string[];
  affectedCohorts: DemographicCohort[];
  estimatedImpact: 'low' | 'medium' | 'high' | 'extreme';
  description: string;
  priceImpactPercent: number;
}

export interface TopNostalgiaPlay {
  rank: number;
  playerName: string;
  cardName: string;
  sport: string;
  currentPrice: number;
  targetPrice: number;
  expectedReturn: number;
  primaryCohort: DemographicCohort;
  triggerType: NostalgiaTrigger;
  triggerDate: string;
  confidence: number;
  thesis: string;
}

// ---- Cohort Profiles ----

const COHORT_PROFILES: CohortProfile[] = [
  {
    cohort: 'silent',
    label: 'Silent Generation',
    birthYearStart: 1928,
    birthYearEnd: 1945,
    peakEarningAgeStart: 35,
    peakEarningAgeEnd: 55,
    peakEarningYearStart: 1963,
    peakEarningYearEnd: 2000,
    culturalTouchstones: ['Mickey Mantle', 'Willie Mays', 'Ted Williams', 'Jackie Robinson', 'Joe DiMaggio'],
    collectingPeakDecade: '1950s',
    avgDisposableIncome: 28000,
    digitalAdoption: 12,
    color: '#94a3b8',
  },
  {
    cohort: 'boomer',
    label: 'Baby Boomers',
    birthYearStart: 1946,
    birthYearEnd: 1964,
    peakEarningAgeStart: 35,
    peakEarningAgeEnd: 55,
    peakEarningYearStart: 1981,
    peakEarningYearEnd: 2019,
    culturalTouchstones: ['Hank Aaron', 'Muhammad Ali', 'Johnny Unitas', 'Wilt Chamberlain', 'Sandy Koufax', 'Bobby Orr'],
    collectingPeakDecade: '1960s-1970s',
    avgDisposableIncome: 52000,
    digitalAdoption: 38,
    color: '#f59e0b',
  },
  {
    cohort: 'gen-x',
    label: 'Generation X',
    birthYearStart: 1965,
    birthYearEnd: 1980,
    peakEarningAgeStart: 35,
    peakEarningAgeEnd: 55,
    peakEarningYearStart: 2000,
    peakEarningYearEnd: 2035,
    culturalTouchstones: ['Michael Jordan', 'Wayne Gretzky', 'Joe Montana', 'Magic Johnson', 'Larry Bird', 'Cal Ripken Jr.'],
    collectingPeakDecade: '1980s-1990s',
    avgDisposableIncome: 64000,
    digitalAdoption: 62,
    color: '#ef4444',
  },
  {
    cohort: 'millennial',
    label: 'Millennials',
    birthYearStart: 1981,
    birthYearEnd: 1996,
    peakEarningAgeStart: 35,
    peakEarningAgeEnd: 55,
    peakEarningYearStart: 2016,
    peakEarningYearEnd: 2051,
    culturalTouchstones: ['Kobe Bryant', 'Derek Jeter', 'Tom Brady', 'LeBron James', 'Peyton Manning', 'Allen Iverson'],
    collectingPeakDecade: '2000s-2010s',
    avgDisposableIncome: 48000,
    digitalAdoption: 88,
    color: '#8b5cf6',
  },
  {
    cohort: 'gen-z',
    label: 'Generation Z',
    birthYearStart: 1997,
    birthYearEnd: 2012,
    peakEarningAgeStart: 35,
    peakEarningAgeEnd: 55,
    peakEarningYearStart: 2032,
    peakEarningYearEnd: 2067,
    culturalTouchstones: ['Luka Doncic', 'Ja Morant', 'Patrick Mahomes', 'Shohei Ohtani', 'Victor Wembanyama', 'Connor Bedard'],
    collectingPeakDecade: '2020s-2030s',
    avgDisposableIncome: 32000,
    digitalAdoption: 96,
    color: '#06b6d4',
  },
  {
    cohort: 'gen-alpha',
    label: 'Generation Alpha',
    birthYearStart: 2013,
    birthYearEnd: 2028,
    peakEarningAgeStart: 35,
    peakEarningAgeEnd: 55,
    peakEarningYearStart: 2048,
    peakEarningYearEnd: 2083,
    culturalTouchstones: ['Victor Wembanyama', 'Connor Bedard', 'Future Stars TBD'],
    collectingPeakDecade: '2030s-2040s',
    avgDisposableIncome: 18000,
    digitalAdoption: 99,
    color: '#10b981',
  },
];

// ---- Player Nostalgia Scores (30+ players) ----

const PLAYER_NOSTALGIA_SCORES: PlayerNostalgiaScore[] = [
  {
    playerId: 'mj-23',
    playerName: 'Michael Jordan',
    sport: 'Basketball',
    activeYears: '1984-2003',
    cohortScores: { silent: 25, boomer: 72, 'gen-x': 98, millennial: 85, 'gen-z': 60, 'gen-alpha': 42 },
    overallNostalgiaIndex: 96,
    upcomingTriggers: ['40th draft anniversary (2024)', 'Space Jam cultural revival'],
    topCard: '1986 Fleer #57 PSA 10',
    currentAvgPrice: 738000,
    projectedPeakPrice: 1100000,
  },
  {
    playerId: 'kb-24',
    playerName: 'Kobe Bryant',
    sport: 'Basketball',
    activeYears: '1996-2016',
    cohortScores: { silent: 8, boomer: 30, 'gen-x': 65, millennial: 97, 'gen-z': 78, 'gen-alpha': 50 },
    overallNostalgiaIndex: 94,
    upcomingTriggers: ['Memorial anniversary cycles', '81-point game anniversary'],
    topCard: '1996 Topps Chrome Refractor PSA 10',
    currentAvgPrice: 285000,
    projectedPeakPrice: 425000,
  },
  {
    playerId: 'lj-23',
    playerName: 'LeBron James',
    sport: 'Basketball',
    activeYears: '2003-present',
    cohortScores: { silent: 5, boomer: 22, 'gen-x': 48, millennial: 92, 'gen-z': 88, 'gen-alpha': 65 },
    overallNostalgiaIndex: 90,
    upcomingTriggers: ['Retirement announcement', 'Scoring record anniversary'],
    topCard: '2003 Topps Chrome Refractor PSA 10',
    currentAvgPrice: 375000,
    projectedPeakPrice: 620000,
  },
  {
    playerId: 'tb-12',
    playerName: 'Tom Brady',
    sport: 'Football',
    activeYears: '2000-2023',
    cohortScores: { silent: 10, boomer: 40, 'gen-x': 62, millennial: 90, 'gen-z': 72, 'gen-alpha': 35 },
    overallNostalgiaIndex: 88,
    upcomingTriggers: ['HOF induction 2028', 'Documentary series'],
    topCard: '2000 Playoff Contenders Auto PSA 10',
    currentAvgPrice: 420000,
    projectedPeakPrice: 700000,
  },
  {
    playerId: 'dj-2',
    playerName: 'Derek Jeter',
    sport: 'Baseball',
    activeYears: '1995-2014',
    cohortScores: { silent: 8, boomer: 35, 'gen-x': 58, millennial: 88, 'gen-z': 45, 'gen-alpha': 18 },
    overallNostalgiaIndex: 82,
    upcomingTriggers: ['Monument Park ceremony', 'Yankees dynasty anniversary'],
    topCard: '1993 SP Foil #279 PSA 10',
    currentAvgPrice: 82000,
    projectedPeakPrice: 120000,
  },
  {
    playerId: 'wg-99',
    playerName: 'Wayne Gretzky',
    sport: 'Hockey',
    activeYears: '1979-1999',
    cohortScores: { silent: 15, boomer: 62, 'gen-x': 95, millennial: 55, 'gen-z': 30, 'gen-alpha': 15 },
    overallNostalgiaIndex: 85,
    upcomingTriggers: ['Record anniversary events', 'NHL centennial'],
    topCard: '1979 O-Pee-Chee #18 PSA 10',
    currentAvgPrice: 3200000,
    projectedPeakPrice: 4500000,
  },
  {
    playerId: 'mm-7',
    playerName: 'Mickey Mantle',
    sport: 'Baseball',
    activeYears: '1951-1968',
    cohortScores: { silent: 95, boomer: 90, 'gen-x': 65, millennial: 42, 'gen-z': 28, 'gen-alpha': 15 },
    overallNostalgiaIndex: 88,
    upcomingTriggers: ['Heritage auction cycles', 'Card market blue-chip narrative'],
    topCard: '1952 Topps #311 PSA 8',
    currentAvgPrice: 6200000,
    projectedPeakPrice: 8000000,
  },
  {
    playerId: 'pm-15',
    playerName: 'Patrick Mahomes',
    sport: 'Football',
    activeYears: '2017-present',
    cohortScores: { silent: 2, boomer: 12, 'gen-x': 28, millennial: 70, 'gen-z': 95, 'gen-alpha': 80 },
    overallNostalgiaIndex: 78,
    upcomingTriggers: ['Super Bowl dynasty narrative', 'Career milestone records'],
    topCard: '2017 Panini Prizm Silver PSA 10',
    currentAvgPrice: 48000,
    projectedPeakPrice: 95000,
  },
  {
    playerId: 'so-17',
    playerName: 'Shohei Ohtani',
    sport: 'Baseball',
    activeYears: '2018-present',
    cohortScores: { silent: 3, boomer: 15, 'gen-x': 30, millennial: 68, 'gen-z': 92, 'gen-alpha': 85 },
    overallNostalgiaIndex: 80,
    upcomingTriggers: ['MVP seasons', 'Record-breaking two-way stats'],
    topCard: '2018 Topps Chrome Update Auto PSA 10',
    currentAvgPrice: 110000,
    projectedPeakPrice: 200000,
  },
  {
    playerId: 'ld-77',
    playerName: 'Luka Doncic',
    sport: 'Basketball',
    activeYears: '2018-present',
    cohortScores: { silent: 1, boomer: 8, 'gen-x': 20, millennial: 55, 'gen-z': 90, 'gen-alpha': 78 },
    overallNostalgiaIndex: 72,
    upcomingTriggers: ['Championship pursuit', 'International star narrative'],
    topCard: '2018 Panini Prizm Silver PSA 10',
    currentAvgPrice: 32000,
    projectedPeakPrice: 65000,
  },
  {
    playerId: 'ai-3',
    playerName: 'Allen Iverson',
    sport: 'Basketball',
    activeYears: '1996-2010',
    cohortScores: { silent: 3, boomer: 18, 'gen-x': 55, millennial: 92, 'gen-z': 65, 'gen-alpha': 30 },
    overallNostalgiaIndex: 78,
    upcomingTriggers: ['Cultural icon status', 'Practice speech anniversary'],
    topCard: '1996 Topps Chrome Refractor PSA 10',
    currentAvgPrice: 45000,
    projectedPeakPrice: 72000,
  },
  {
    playerId: 'kg-21',
    playerName: 'Ken Griffey Jr.',
    sport: 'Baseball',
    activeYears: '1989-2010',
    cohortScores: { silent: 5, boomer: 30, 'gen-x': 75, millennial: 90, 'gen-z': 40, 'gen-alpha': 15 },
    overallNostalgiaIndex: 82,
    upcomingTriggers: ['Upper Deck anniversary', '90s kid cultural cycle'],
    topCard: '1989 Upper Deck #1 PSA 10',
    currentAvgPrice: 18000,
    projectedPeakPrice: 30000,
  },
  {
    playerId: 'cr-jr',
    playerName: 'Cal Ripken Jr.',
    sport: 'Baseball',
    activeYears: '1981-2001',
    cohortScores: { silent: 12, boomer: 55, 'gen-x': 85, millennial: 52, 'gen-z': 18, 'gen-alpha': 5 },
    overallNostalgiaIndex: 70,
    upcomingTriggers: ['Iron Man record anniversary', 'MLB heritage events'],
    topCard: '1982 Topps Traded #98T PSA 10',
    currentAvgPrice: 28000,
    projectedPeakPrice: 42000,
  },
  {
    playerId: 'mj-ml',
    playerName: 'Magic Johnson',
    sport: 'Basketball',
    activeYears: '1979-1996',
    cohortScores: { silent: 10, boomer: 68, 'gen-x': 90, millennial: 45, 'gen-z': 22, 'gen-alpha': 10 },
    overallNostalgiaIndex: 76,
    upcomingTriggers: ['Showtime Lakers retrospectives', 'Business empire narrative'],
    topCard: '1980 Topps #139 PSA 10',
    currentAvgPrice: 145000,
    projectedPeakPrice: 210000,
  },
  {
    playerId: 'lb-33',
    playerName: 'Larry Bird',
    sport: 'Basketball',
    activeYears: '1979-1992',
    cohortScores: { silent: 10, boomer: 65, 'gen-x': 88, millennial: 40, 'gen-z': 18, 'gen-alpha': 8 },
    overallNostalgiaIndex: 74,
    upcomingTriggers: ['Bird-Magic rivalry anniversary', 'Celtics dynasty retrospectives'],
    topCard: '1980 Topps #34 PSA 10',
    currentAvgPrice: 95000,
    projectedPeakPrice: 140000,
  },
  {
    playerId: 'tg-12',
    playerName: 'Tiger Woods',
    sport: 'Golf',
    activeYears: '1996-present',
    cohortScores: { silent: 5, boomer: 38, 'gen-x': 60, millennial: 82, 'gen-z': 55, 'gen-alpha': 25 },
    overallNostalgiaIndex: 75,
    upcomingTriggers: ['Masters anniversary wins', 'Retirement speculation'],
    topCard: '2001 SP Authentic Auto PSA 10',
    currentAvgPrice: 185000,
    projectedPeakPrice: 280000,
  },
  {
    playerId: 'sc-30',
    playerName: 'Stephen Curry',
    sport: 'Basketball',
    activeYears: '2009-present',
    cohortScores: { silent: 2, boomer: 15, 'gen-x': 35, millennial: 82, 'gen-z': 88, 'gen-alpha': 70 },
    overallNostalgiaIndex: 80,
    upcomingTriggers: ['3-point record milestones', 'Dynasty era retrospective'],
    topCard: '2009 Panini Prizm PSA 10',
    currentAvgPrice: 52000,
    projectedPeakPrice: 90000,
  },
  {
    playerId: 'pm-18',
    playerName: 'Peyton Manning',
    sport: 'Football',
    activeYears: '1998-2015',
    cohortScores: { silent: 5, boomer: 35, 'gen-x': 55, millennial: 85, 'gen-z': 38, 'gen-alpha': 12 },
    overallNostalgiaIndex: 72,
    upcomingTriggers: ['Omaha nostalgia', 'Manning family legacy'],
    topCard: '1998 Playoff Contenders Auto PSA 10',
    currentAvgPrice: 72000,
    projectedPeakPrice: 105000,
  },
  {
    playerId: 'ha-44',
    playerName: 'Hank Aaron',
    sport: 'Baseball',
    activeYears: '1954-1976',
    cohortScores: { silent: 82, boomer: 88, 'gen-x': 52, millennial: 30, 'gen-z': 15, 'gen-alpha': 8 },
    overallNostalgiaIndex: 78,
    upcomingTriggers: ['HR record anniversary', 'Civil rights legacy tributes'],
    topCard: '1954 Topps #128 PSA 8',
    currentAvgPrice: 320000,
    projectedPeakPrice: 450000,
  },
  {
    playerId: 'ma-12',
    playerName: 'Muhammad Ali',
    sport: 'Boxing',
    activeYears: '1960-1981',
    cohortScores: { silent: 55, boomer: 92, 'gen-x': 70, millennial: 50, 'gen-z': 35, 'gen-alpha': 22 },
    overallNostalgiaIndex: 82,
    upcomingTriggers: ['Cultural icon retrospectives', 'Documentary releases'],
    topCard: '1960 Cassius Clay Rookie Card',
    currentAvgPrice: 280000,
    projectedPeakPrice: 400000,
  },
  {
    playerId: 'sd-21',
    playerName: 'Tim Duncan',
    sport: 'Basketball',
    activeYears: '1997-2016',
    cohortScores: { silent: 3, boomer: 18, 'gen-x': 48, millennial: 78, 'gen-z': 32, 'gen-alpha': 10 },
    overallNostalgiaIndex: 62,
    upcomingTriggers: ['Spurs dynasty retrospective', 'Quiet greatness narrative'],
    topCard: '1997 Topps Chrome Refractor PSA 10',
    currentAvgPrice: 28000,
    projectedPeakPrice: 42000,
  },
  {
    playerId: 'jm-16',
    playerName: 'Joe Montana',
    sport: 'Football',
    activeYears: '1979-1994',
    cohortScores: { silent: 8, boomer: 60, 'gen-x': 92, millennial: 42, 'gen-z': 15, 'gen-alpha': 5 },
    overallNostalgiaIndex: 72,
    upcomingTriggers: ['The Catch anniversary', '49ers dynasty retrospective'],
    topCard: '1981 Topps #216 PSA 10',
    currentAvgPrice: 62000,
    projectedPeakPrice: 88000,
  },
  {
    playerId: 'vw-1',
    playerName: 'Victor Wembanyama',
    sport: 'Basketball',
    activeYears: '2023-present',
    cohortScores: { silent: 0, boomer: 5, 'gen-x': 12, millennial: 40, 'gen-z': 82, 'gen-alpha': 95 },
    overallNostalgiaIndex: 65,
    upcomingTriggers: ['Rookie milestone achievements', 'Generational talent narrative'],
    topCard: '2023 Panini Prizm Silver PSA 10',
    currentAvgPrice: 18000,
    projectedPeakPrice: 45000,
  },
  {
    playerId: 'cb-98',
    playerName: 'Connor Bedard',
    sport: 'Hockey',
    activeYears: '2023-present',
    cohortScores: { silent: 0, boomer: 3, 'gen-x': 8, millennial: 30, 'gen-z': 75, 'gen-alpha': 88 },
    overallNostalgiaIndex: 58,
    upcomingTriggers: ['Calder Trophy pursuit', 'Next Gretzky narrative'],
    topCard: '2023 Upper Deck Young Guns PSA 10',
    currentAvgPrice: 8500,
    projectedPeakPrice: 22000,
  },
  {
    playerId: 'jm-ja',
    playerName: 'Ja Morant',
    sport: 'Basketball',
    activeYears: '2019-present',
    cohortScores: { silent: 0, boomer: 5, 'gen-x': 15, millennial: 48, 'gen-z': 88, 'gen-alpha': 72 },
    overallNostalgiaIndex: 62,
    upcomingTriggers: ['Highlight reel narrative', 'Comeback arc'],
    topCard: '2019 Panini Prizm Silver PSA 10',
    currentAvgPrice: 12000,
    projectedPeakPrice: 28000,
  },
  {
    playerId: 'mt-97',
    playerName: 'Mike Trout',
    sport: 'Baseball',
    activeYears: '2011-present',
    cohortScores: { silent: 2, boomer: 12, 'gen-x': 25, millennial: 75, 'gen-z': 68, 'gen-alpha': 40 },
    overallNostalgiaIndex: 70,
    upcomingTriggers: ['Career comeback narrative', 'What-if legacy'],
    topCard: '2011 Topps Update #US175 PSA 10',
    currentAvgPrice: 42000,
    projectedPeakPrice: 72000,
  },
  {
    playerId: 'sd-57',
    playerName: 'Shaquille O\'Neal',
    sport: 'Basketball',
    activeYears: '1992-2011',
    cohortScores: { silent: 3, boomer: 22, 'gen-x': 62, millennial: 88, 'gen-z': 55, 'gen-alpha': 32 },
    overallNostalgiaIndex: 76,
    upcomingTriggers: ['Shaq-Kobe dynasty retrospective', 'Media personality nostalgia'],
    topCard: '1992 Topps Stadium Club #247 PSA 10',
    currentAvgPrice: 15000,
    projectedPeakPrice: 25000,
  },
  {
    playerId: 'bo-34',
    playerName: 'Bo Jackson',
    sport: 'Multi-Sport',
    activeYears: '1986-1994',
    cohortScores: { silent: 5, boomer: 35, 'gen-x': 88, millennial: 72, 'gen-z': 30, 'gen-alpha': 12 },
    overallNostalgiaIndex: 74,
    upcomingTriggers: ['Bo Knows revival', '30 for 30 replay cycles'],
    topCard: '1986 Topps Traded #50T PSA 10',
    currentAvgPrice: 5200,
    projectedPeakPrice: 9500,
  },
  {
    playerId: 'kg-05',
    playerName: 'Kevin Garnett',
    sport: 'Basketball',
    activeYears: '1995-2016',
    cohortScores: { silent: 2, boomer: 12, 'gen-x': 45, millennial: 82, 'gen-z': 38, 'gen-alpha': 12 },
    overallNostalgiaIndex: 65,
    upcomingTriggers: ['Anything is possible anniversary', 'KG documentary'],
    topCard: '1995 Topps Chrome Refractor PSA 10',
    currentAvgPrice: 22000,
    projectedPeakPrice: 35000,
  },
  {
    playerId: 'nm-10',
    playerName: 'Nolan Ryan',
    sport: 'Baseball',
    activeYears: '1966-1993',
    cohortScores: { silent: 30, boomer: 78, 'gen-x': 72, millennial: 28, 'gen-z': 10, 'gen-alpha': 3 },
    overallNostalgiaIndex: 68,
    upcomingTriggers: ['No-hitter record anniversary', 'Express legacy events'],
    topCard: '1968 Topps #177 PSA 9',
    currentAvgPrice: 95000,
    projectedPeakPrice: 135000,
  },
  {
    playerId: 'jr-42',
    playerName: 'Jackie Robinson',
    sport: 'Baseball',
    activeYears: '1947-1956',
    cohortScores: { silent: 88, boomer: 75, 'gen-x': 52, millennial: 40, 'gen-z': 32, 'gen-alpha': 20 },
    overallNostalgiaIndex: 80,
    upcomingTriggers: ['Jackie Robinson Day annual', 'Breaking barriers legacy'],
    topCard: '1948 Leaf #79 PSA 5',
    currentAvgPrice: 180000,
    projectedPeakPrice: 260000,
  },
  {
    playerId: 'dm-4',
    playerName: 'Dak Prescott',
    sport: 'Football',
    activeYears: '2016-present',
    cohortScores: { silent: 0, boomer: 8, 'gen-x': 18, millennial: 55, 'gen-z': 72, 'gen-alpha': 45 },
    overallNostalgiaIndex: 48,
    upcomingTriggers: ['Cowboys dynasty hopes', 'Contract saga narrative'],
    topCard: '2016 Panini Prizm Silver PSA 10',
    currentAvgPrice: 3800,
    projectedPeakPrice: 6500,
  },
];

// ---- Historical Nostalgia Waves (15+) ----

const HISTORICAL_WAVES: NostalgiaWave[] = [
  {
    id: 'wave-1',
    name: 'The Last Dance Effect',
    trigger: 'documentary',
    playerName: 'Michael Jordan',
    year: 2020,
    month: 4,
    peakPriceMultiplier: 3.2,
    durationMonths: 8,
    primaryCohort: 'gen-x',
    secondaryCohort: 'millennial',
    description: 'ESPN documentary about the 1997-98 Bulls season drove massive MJ card demand.',
    priceBeforeWave: 215000,
    priceAtPeak: 738000,
    priceAfterWave: 480000,
    cardName: '1986 Fleer #57',
  },
  {
    id: 'wave-2',
    name: 'Kobe Memorial Surge',
    trigger: 'death',
    playerName: 'Kobe Bryant',
    year: 2020,
    month: 1,
    peakPriceMultiplier: 4.5,
    durationMonths: 12,
    primaryCohort: 'millennial',
    secondaryCohort: 'gen-x',
    description: 'Tragic passing in January 2020 triggered unprecedented demand for Kobe memorabilia.',
    priceBeforeWave: 58000,
    priceAtPeak: 285000,
    priceAfterWave: 165000,
    cardName: '1996 Topps Chrome Refractor',
  },
  {
    id: 'wave-3',
    name: 'Jeter HOF Induction',
    trigger: 'HOF-induction',
    playerName: 'Derek Jeter',
    year: 2021,
    month: 9,
    peakPriceMultiplier: 1.8,
    durationMonths: 5,
    primaryCohort: 'millennial',
    secondaryCohort: 'gen-x',
    description: 'Near-unanimous Hall of Fame induction reignited Yankees dynasty nostalgia.',
    priceBeforeWave: 48000,
    priceAtPeak: 86000,
    priceAfterWave: 62000,
    cardName: '1993 SP Foil #279',
  },
  {
    id: 'wave-4',
    name: 'Tom Brady Retirement Wave',
    trigger: 'retirement',
    playerName: 'Tom Brady',
    year: 2023,
    month: 2,
    peakPriceMultiplier: 2.1,
    durationMonths: 6,
    primaryCohort: 'millennial',
    secondaryCohort: 'gen-x',
    description: 'Final retirement announcement crystallized GOAT narrative and card demand.',
    priceBeforeWave: 200000,
    priceAtPeak: 420000,
    priceAfterWave: 310000,
    cardName: '2000 Playoff Contenders Auto',
  },
  {
    id: 'wave-5',
    name: 'Gretzky Record Anniversary',
    trigger: 'anniversary',
    playerName: 'Wayne Gretzky',
    year: 2019,
    month: 10,
    peakPriceMultiplier: 1.6,
    durationMonths: 4,
    primaryCohort: 'gen-x',
    secondaryCohort: 'boomer',
    description: '30th anniversary of the all-time points record sparked renewed interest.',
    priceBeforeWave: 2100000,
    priceAtPeak: 3360000,
    priceAfterWave: 2800000,
    cardName: '1979 O-Pee-Chee #18',
  },
  {
    id: 'wave-6',
    name: 'Mantle Record Auction',
    trigger: 'anniversary',
    playerName: 'Mickey Mantle',
    year: 2022,
    month: 8,
    peakPriceMultiplier: 2.8,
    durationMonths: 6,
    primaryCohort: 'boomer',
    secondaryCohort: 'silent',
    description: '$12.6M sale of 1952 Topps Mantle created a halo effect across all vintage cards.',
    priceBeforeWave: 2800000,
    priceAtPeak: 6200000,
    priceAfterWave: 5100000,
    cardName: '1952 Topps #311',
  },
  {
    id: 'wave-7',
    name: 'Griffey 90s Revival',
    trigger: 'documentary',
    playerName: 'Ken Griffey Jr.',
    year: 2022,
    month: 3,
    peakPriceMultiplier: 2.2,
    durationMonths: 7,
    primaryCohort: 'millennial',
    secondaryCohort: 'gen-x',
    description: 'Social media-driven 90s nostalgia wave pushed Griffey rookies to new heights.',
    priceBeforeWave: 8200,
    priceAtPeak: 18000,
    priceAfterWave: 14000,
    cardName: '1989 Upper Deck #1',
  },
  {
    id: 'wave-8',
    name: 'Iverson Cultural Moment',
    trigger: 'documentary',
    playerName: 'Allen Iverson',
    year: 2021,
    month: 6,
    peakPriceMultiplier: 2.5,
    durationMonths: 5,
    primaryCohort: 'millennial',
    secondaryCohort: 'gen-z',
    description: 'Viral Practice rant anniversary + Netflix doc drove millennial buying frenzy.',
    priceBeforeWave: 18000,
    priceAtPeak: 45000,
    priceAfterWave: 32000,
    cardName: '1996 Topps Chrome Refractor',
  },
  {
    id: 'wave-9',
    name: 'Tiger Masters Comeback',
    trigger: 'comeback',
    playerName: 'Tiger Woods',
    year: 2019,
    month: 4,
    peakPriceMultiplier: 3.0,
    durationMonths: 4,
    primaryCohort: 'millennial',
    secondaryCohort: 'gen-x',
    description: '2019 Masters victory after years of decline created an emotional buying wave.',
    priceBeforeWave: 62000,
    priceAtPeak: 185000,
    priceAfterWave: 120000,
    cardName: '2001 SP Authentic Auto',
  },
  {
    id: 'wave-10',
    name: 'Montana 49ers Nostalgia',
    trigger: 'anniversary',
    playerName: 'Joe Montana',
    year: 2022,
    month: 1,
    peakPriceMultiplier: 1.5,
    durationMonths: 3,
    primaryCohort: 'gen-x',
    secondaryCohort: 'boomer',
    description: 'Super Bowl XXIII anniversary + The Catch retrospectives boosted Montana values.',
    priceBeforeWave: 42000,
    priceAtPeak: 63000,
    priceAfterWave: 52000,
    cardName: '1981 Topps #216',
  },
  {
    id: 'wave-11',
    name: 'Magic-Bird Rivalry Revival',
    trigger: 'documentary',
    playerName: 'Magic Johnson',
    year: 2023,
    month: 5,
    peakPriceMultiplier: 1.7,
    durationMonths: 5,
    primaryCohort: 'gen-x',
    secondaryCohort: 'boomer',
    description: 'Winning Time HBO series reignited Showtime Lakers / Celtics dynasty interest.',
    priceBeforeWave: 88000,
    priceAtPeak: 150000,
    priceAfterWave: 118000,
    cardName: '1980 Topps #139',
  },
  {
    id: 'wave-12',
    name: 'Bo Jackson Knows Again',
    trigger: 'anniversary',
    playerName: 'Bo Jackson',
    year: 2021,
    month: 7,
    peakPriceMultiplier: 2.0,
    durationMonths: 4,
    primaryCohort: 'gen-x',
    secondaryCohort: 'millennial',
    description: 'Bo Knows campaign 30th anniversary viral on TikTok drove Gen-X buying surge.',
    priceBeforeWave: 2600,
    priceAtPeak: 5200,
    priceAfterWave: 3800,
    cardName: '1986 Topps Traded #50T',
  },
  {
    id: 'wave-13',
    name: 'Hank Aaron Legacy Tribute',
    trigger: 'death',
    playerName: 'Hank Aaron',
    year: 2021,
    month: 1,
    peakPriceMultiplier: 2.4,
    durationMonths: 8,
    primaryCohort: 'boomer',
    secondaryCohort: 'gen-x',
    description: 'Passing of Hammerin Hank drove vintage card prices to all-time highs.',
    priceBeforeWave: 135000,
    priceAtPeak: 324000,
    priceAfterWave: 245000,
    cardName: '1954 Topps #128',
  },
  {
    id: 'wave-14',
    name: 'Robinson Day Annual Spike',
    trigger: 'anniversary',
    playerName: 'Jackie Robinson',
    year: 2022,
    month: 4,
    peakPriceMultiplier: 1.4,
    durationMonths: 2,
    primaryCohort: 'boomer',
    secondaryCohort: 'millennial',
    description: '75th anniversary of breaking the color barrier created sustained price floor.',
    priceBeforeWave: 140000,
    priceAtPeak: 196000,
    priceAfterWave: 165000,
    cardName: '1948 Leaf #79',
  },
  {
    id: 'wave-15',
    name: 'LeBron Scoring Record',
    trigger: 'record-broken',
    playerName: 'LeBron James',
    year: 2023,
    month: 2,
    peakPriceMultiplier: 1.9,
    durationMonths: 4,
    primaryCohort: 'millennial',
    secondaryCohort: 'gen-z',
    description: 'Breaking Kareem\'s all-time scoring record triggered a cross-generational demand surge.',
    priceBeforeWave: 210000,
    priceAtPeak: 399000,
    priceAfterWave: 320000,
    cardName: '2003 Topps Chrome Refractor',
  },
  {
    id: 'wave-16',
    name: 'Nolan Ryan Express Centennial',
    trigger: 'anniversary',
    playerName: 'Nolan Ryan',
    year: 2023,
    month: 9,
    peakPriceMultiplier: 1.3,
    durationMonths: 3,
    primaryCohort: 'boomer',
    secondaryCohort: 'gen-x',
    description: 'Texas Rangers heritage celebration boosted Ryan card values across the board.',
    priceBeforeWave: 75000,
    priceAtPeak: 97500,
    priceAfterWave: 85000,
    cardName: '1968 Topps #177',
  },
  {
    id: 'wave-17',
    name: 'Curry 3-Point Revolution',
    trigger: 'record-broken',
    playerName: 'Stephen Curry',
    year: 2021,
    month: 12,
    peakPriceMultiplier: 2.3,
    durationMonths: 5,
    primaryCohort: 'gen-z',
    secondaryCohort: 'millennial',
    description: 'Breaking Ray Allen\'s all-time 3-point record sent Curry rookie prices soaring.',
    priceBeforeWave: 22000,
    priceAtPeak: 50600,
    priceAfterWave: 38000,
    cardName: '2009 Panini Prizm',
  },
];

// ---- Cohort Spending Power Over Decades ----

const COHORT_SPENDING_DATA: CohortSpendingPower[] = [
  { decade: '1960s', silent: 40, boomer: 5, 'gen-x': 0, millennial: 0, 'gen-z': 0, 'gen-alpha': 0 },
  { decade: '1970s', silent: 65, boomer: 22, 'gen-x': 2, millennial: 0, 'gen-z': 0, 'gen-alpha': 0 },
  { decade: '1980s', silent: 80, boomer: 55, 'gen-x': 12, millennial: 0, 'gen-z': 0, 'gen-alpha': 0 },
  { decade: '1990s', silent: 72, boomer: 82, 'gen-x': 45, millennial: 5, 'gen-z': 0, 'gen-alpha': 0 },
  { decade: '2000s', silent: 50, boomer: 90, 'gen-x': 75, millennial: 22, 'gen-z': 0, 'gen-alpha': 0 },
  { decade: '2010s', silent: 28, boomer: 78, 'gen-x': 88, millennial: 55, 'gen-z': 8, 'gen-alpha': 0 },
  { decade: '2020s', silent: 10, boomer: 55, 'gen-x': 92, millennial: 78, 'gen-z': 35, 'gen-alpha': 2 },
  { decade: '2030s', silent: 2, boomer: 30, 'gen-x': 75, millennial: 90, 'gen-z': 68, 'gen-alpha': 15 },
  { decade: '2040s', silent: 0, boomer: 8, 'gen-x': 42, millennial: 78, 'gen-z': 88, 'gen-alpha': 48 },
  { decade: '2050s', silent: 0, boomer: 1, 'gen-x': 15, millennial: 50, 'gen-z': 92, 'gen-alpha': 78 },
];

// ---- Upcoming Cultural Moments / Triggers ----

const UPCOMING_TRIGGERS: CulturalMoment[] = [
  {
    id: 'trigger-1',
    title: 'Tom Brady HOF Induction',
    date: '2028-08-03',
    trigger: 'HOF-induction',
    affectedPlayers: ['Tom Brady', 'Peyton Manning'],
    affectedCohorts: ['millennial', 'gen-x'],
    estimatedImpact: 'extreme',
    description: 'Brady\'s first-ballot HOF induction will trigger the largest football card nostalgia wave in history.',
    priceImpactPercent: 65,
  },
  {
    id: 'trigger-2',
    title: 'LeBron James Retirement',
    date: '2027-06-15',
    trigger: 'retirement',
    affectedPlayers: ['LeBron James', 'Stephen Curry'],
    affectedCohorts: ['millennial', 'gen-z'],
    estimatedImpact: 'extreme',
    description: 'The end of the LeBron era will crystallize his GOAT debate position and drive massive card demand.',
    priceImpactPercent: 55,
  },
  {
    id: 'trigger-3',
    title: 'Michael Jordan 40th Draft Anniversary',
    date: '2024-06-19',
    trigger: 'anniversary',
    affectedPlayers: ['Michael Jordan'],
    affectedCohorts: ['gen-x', 'millennial'],
    estimatedImpact: 'high',
    description: '40 years since the iconic 1984 draft pick that changed basketball forever.',
    priceImpactPercent: 30,
  },
  {
    id: 'trigger-4',
    title: 'Kobe Bryant 5th Memorial',
    date: '2025-01-26',
    trigger: 'anniversary',
    affectedPlayers: ['Kobe Bryant', 'Shaquille O\'Neal'],
    affectedCohorts: ['millennial', 'gen-z'],
    estimatedImpact: 'high',
    description: 'Five-year memorial milestone typically triggers renewed memorabilia demand.',
    priceImpactPercent: 35,
  },
  {
    id: 'trigger-5',
    title: 'Griffey Jr. 35th Anniversary Upper Deck',
    date: '2024-03-01',
    trigger: 'anniversary',
    affectedPlayers: ['Ken Griffey Jr.'],
    affectedCohorts: ['millennial', 'gen-x'],
    estimatedImpact: 'medium',
    description: '35 years since the most iconic modern rookie card shook the hobby.',
    priceImpactPercent: 20,
  },
  {
    id: 'trigger-6',
    title: 'Stephen Curry Retirement Window',
    date: '2028-06-01',
    trigger: 'retirement',
    affectedPlayers: ['Stephen Curry'],
    affectedCohorts: ['gen-z', 'millennial'],
    estimatedImpact: 'high',
    description: 'Curry\'s retirement will mark the end of the Warriors dynasty era.',
    priceImpactPercent: 40,
  },
  {
    id: 'trigger-7',
    title: 'Ohtani 50/50 Legacy Documentary',
    date: '2026-09-01',
    trigger: 'documentary',
    affectedPlayers: ['Shohei Ohtani'],
    affectedCohorts: ['gen-z', 'millennial'],
    estimatedImpact: 'high',
    description: 'Streaming documentary covering the historic 50-homer/50-steal season.',
    priceImpactPercent: 35,
  },
  {
    id: 'trigger-8',
    title: 'Jackie Robinson 80th Anniversary',
    date: '2027-04-15',
    trigger: 'anniversary',
    affectedPlayers: ['Jackie Robinson'],
    affectedCohorts: ['boomer', 'millennial'],
    estimatedImpact: 'medium',
    description: '80th anniversary of breaking the color barrier — perennial cultural touchstone.',
    priceImpactPercent: 18,
  },
  {
    id: 'trigger-9',
    title: 'Wembanyama First All-Star MVP',
    date: '2026-02-15',
    trigger: 'record-broken',
    affectedPlayers: ['Victor Wembanyama'],
    affectedCohorts: ['gen-z', 'gen-alpha'],
    estimatedImpact: 'medium',
    description: 'Youngest All-Star MVP in history cements the generational talent narrative.',
    priceImpactPercent: 25,
  },
  {
    id: 'trigger-10',
    title: 'Mahomes 4th Super Bowl Win',
    date: '2027-02-09',
    trigger: 'record-broken',
    affectedPlayers: ['Patrick Mahomes'],
    affectedCohorts: ['gen-z', 'millennial'],
    estimatedImpact: 'extreme',
    description: 'Projected dynasty-clinching championship cements GOAT QB debate.',
    priceImpactPercent: 50,
  },
];

// ---- Price Wave Projection Template ----

const WAVE_PROJECTION_TEMPLATE: PriceWaveProjection[] = [
  { monthsFromTrigger: -6, priceMultiplier: 1.0, buyerSentiment: 50, volumeIndex: 40 },
  { monthsFromTrigger: -3, priceMultiplier: 1.05, buyerSentiment: 55, volumeIndex: 48 },
  { monthsFromTrigger: -1, priceMultiplier: 1.15, buyerSentiment: 65, volumeIndex: 62 },
  { monthsFromTrigger: 0, priceMultiplier: 1.35, buyerSentiment: 82, volumeIndex: 85 },
  { monthsFromTrigger: 1, priceMultiplier: 1.85, buyerSentiment: 92, volumeIndex: 100 },
  { monthsFromTrigger: 2, priceMultiplier: 2.20, buyerSentiment: 95, volumeIndex: 90 },
  { monthsFromTrigger: 3, priceMultiplier: 2.05, buyerSentiment: 88, volumeIndex: 75 },
  { monthsFromTrigger: 6, priceMultiplier: 1.70, buyerSentiment: 72, volumeIndex: 55 },
  { monthsFromTrigger: 9, priceMultiplier: 1.45, buyerSentiment: 62, volumeIndex: 42 },
  { monthsFromTrigger: 12, priceMultiplier: 1.30, buyerSentiment: 55, volumeIndex: 35 },
  { monthsFromTrigger: 18, priceMultiplier: 1.20, buyerSentiment: 50, volumeIndex: 30 },
  { monthsFromTrigger: 24, priceMultiplier: 1.15, buyerSentiment: 48, volumeIndex: 28 },
];

// ---- Top Nostalgia Plays ----

const TOP_NOSTALGIA_PLAYS: TopNostalgiaPlay[] = [
  {
    rank: 1,
    playerName: 'Tom Brady',
    cardName: '2000 Playoff Contenders Auto PSA 10',
    sport: 'Football',
    currentPrice: 420000,
    targetPrice: 700000,
    expectedReturn: 66.7,
    primaryCohort: 'millennial',
    triggerType: 'HOF-induction',
    triggerDate: '2028-08-03',
    confidence: 95,
    thesis: 'First-ballot HOF lock. Buy window closes as induction date approaches. Millennial peak earning convergence.',
  },
  {
    rank: 2,
    playerName: 'LeBron James',
    cardName: '2003 Topps Chrome Refractor PSA 10',
    sport: 'Basketball',
    currentPrice: 375000,
    targetPrice: 620000,
    expectedReturn: 65.3,
    primaryCohort: 'millennial',
    triggerType: 'retirement',
    triggerDate: '2027-06-15',
    confidence: 88,
    thesis: 'Retirement crystallizes GOAT narrative. Dual millennial/gen-z demand. Scoring record holder status.',
  },
  {
    rank: 3,
    playerName: 'Michael Jordan',
    cardName: '1986 Fleer #57 PSA 10',
    sport: 'Basketball',
    currentPrice: 738000,
    targetPrice: 1100000,
    expectedReturn: 49.1,
    primaryCohort: 'gen-x',
    triggerType: 'anniversary',
    triggerDate: '2026-09-01',
    confidence: 92,
    thesis: 'Gen-X at absolute peak earnings. Fleer anniversary cycle. Cultural icon status transcends sports.',
  },
  {
    rank: 4,
    playerName: 'Shohei Ohtani',
    cardName: '2018 Topps Chrome Update Auto PSA 10',
    sport: 'Baseball',
    currentPrice: 110000,
    targetPrice: 200000,
    expectedReturn: 81.8,
    primaryCohort: 'gen-z',
    triggerType: 'documentary',
    triggerDate: '2026-09-01',
    confidence: 82,
    thesis: 'Two-way player unicorn. Global fanbase. Gen-Z hero with massive upside as cohort earnings grow.',
  },
  {
    rank: 5,
    playerName: 'Patrick Mahomes',
    cardName: '2017 Panini Prizm Silver PSA 10',
    sport: 'Football',
    currentPrice: 48000,
    targetPrice: 95000,
    expectedReturn: 97.9,
    primaryCohort: 'gen-z',
    triggerType: 'record-broken',
    triggerDate: '2027-02-09',
    confidence: 78,
    thesis: 'Dynasty-era QB. Gen-Z cultural icon. Massive upside if 4th ring materializes.',
  },
  {
    rank: 6,
    playerName: 'Stephen Curry',
    cardName: '2009 Panini Prizm PSA 10',
    sport: 'Basketball',
    currentPrice: 52000,
    targetPrice: 90000,
    expectedReturn: 73.1,
    primaryCohort: 'gen-z',
    triggerType: 'retirement',
    triggerDate: '2028-06-01',
    confidence: 80,
    thesis: 'Changed basketball forever. Warriors dynasty nostalgia will compound with retirement announcement.',
  },
  {
    rank: 7,
    playerName: 'Ken Griffey Jr.',
    cardName: '1989 Upper Deck #1 PSA 10',
    sport: 'Baseball',
    currentPrice: 18000,
    targetPrice: 30000,
    expectedReturn: 66.7,
    primaryCohort: 'millennial',
    triggerType: 'anniversary',
    triggerDate: '2029-03-01',
    confidence: 85,
    thesis: '40th anniversary of the most iconic modern RC. Peak 90s nostalgia for millennials entering peak spend.',
  },
  {
    rank: 8,
    playerName: 'Victor Wembanyama',
    cardName: '2023 Panini Prizm Silver PSA 10',
    sport: 'Basketball',
    currentPrice: 18000,
    targetPrice: 45000,
    expectedReturn: 150.0,
    primaryCohort: 'gen-alpha',
    triggerType: 'record-broken',
    triggerDate: '2026-02-15',
    confidence: 65,
    thesis: 'Generational talent with gen-alpha ownership. Highest upside play but highest risk.',
  },
  {
    rank: 9,
    playerName: 'Kobe Bryant',
    cardName: '1996 Topps Chrome Refractor PSA 10',
    sport: 'Basketball',
    currentPrice: 285000,
    targetPrice: 425000,
    expectedReturn: 49.1,
    primaryCohort: 'millennial',
    triggerType: 'anniversary',
    triggerDate: '2025-01-26',
    confidence: 90,
    thesis: 'Memorial anniversary cycles create reliable price floors. Emotional buying transcends market logic.',
  },
  {
    rank: 10,
    playerName: 'Wayne Gretzky',
    cardName: '1979 O-Pee-Chee #18 PSA 10',
    sport: 'Hockey',
    currentPrice: 3200000,
    targetPrice: 4500000,
    expectedReturn: 40.6,
    primaryCohort: 'gen-x',
    triggerType: 'anniversary',
    triggerDate: '2029-10-01',
    confidence: 88,
    thesis: 'The holy grail of hockey. Gen-X peak earning power meets 50th anniversary of debut.',
  },
];

// ---- Demand Forecast Generator ----

function generateDemandForecasts(years: number): DemandForecast[] {
  const forecasts: DemandForecast[] = [];
  const baseYear = 2025;
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const cohorts: DemographicCohort[] = ['silent', 'boomer', 'gen-x', 'millennial', 'gen-z', 'gen-alpha'];

  for (let y = 0; y < years; y++) {
    const year = baseYear + y;
    for (const q of quarters) {
      for (const cohort of cohorts) {
        const profile = COHORT_PROFILES.find(p => p.cohort === cohort)!;
        const midBirthYear = (profile.birthYearStart + profile.birthYearEnd) / 2;
        const currentAge = year - midBirthYear;

        // Spending power peaks at ages 35-55
        let spendingPower = 0;
        if (currentAge >= profile.peakEarningAgeStart && currentAge <= profile.peakEarningAgeEnd) {
          const peakMid = (profile.peakEarningAgeStart + profile.peakEarningAgeEnd) / 2;
          const dist = Math.abs(currentAge - peakMid);
          spendingPower = Math.max(0, 100 - dist * 4);
        } else if (currentAge > 20 && currentAge < profile.peakEarningAgeStart) {
          spendingPower = Math.max(0, 30 + (currentAge - 20) * 3);
        } else if (currentAge > profile.peakEarningAgeEnd && currentAge < 80) {
          spendingPower = Math.max(0, 80 - (currentAge - profile.peakEarningAgeEnd) * 3);
        }

        // Nostalgia intensity increases with age, peaks ~40-60
        const nostalgiaAge = currentAge;
        let nostalgiaIntensity = 0;
        if (nostalgiaAge >= 30 && nostalgiaAge <= 70) {
          const peakNostalgia = 50;
          nostalgiaIntensity = Math.max(0, 100 - Math.abs(nostalgiaAge - peakNostalgia) * 3);
        }

        const demandIndex = Math.round((spendingPower * 0.6 + nostalgiaIntensity * 0.4) * (profile.digitalAdoption / 100));
        const confidence = Math.max(30, 95 - y * 8);

        const topPlayers = PLAYER_NOSTALGIA_SCORES
          .sort((a, b) => (b.cohortScores[cohort] || 0) - (a.cohortScores[cohort] || 0))
          .slice(0, 3)
          .map(p => p.playerName);

        forecasts.push({
          year,
          quarter: q,
          cohort,
          demandIndex: Math.min(100, Math.max(0, demandIndex)),
          spendingPower: Math.round(spendingPower),
          nostalgiaIntensity: Math.round(nostalgiaIntensity),
          topPlayers,
          confidence,
        });
      }
    }
  }

  return forecasts;
}

// ---- Public API ----

export function getCohortProfiles(): CohortProfile[] {
  return COHORT_PROFILES;
}

export function getNostalgiaScores(): PlayerNostalgiaScore[] {
  return PLAYER_NOSTALGIA_SCORES;
}

export function getDemandForecast(years: number = 5): DemandForecast[] {
  return generateDemandForecasts(years);
}

export function getNostalgiaWaves(): NostalgiaWave[] {
  return HISTORICAL_WAVES;
}

export function getUpcomingTriggers(): CulturalMoment[] {
  return UPCOMING_TRIGGERS.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getCohortSpendingPower(cohort?: DemographicCohort): CohortSpendingPower[] {
  if (!cohort) return COHORT_SPENDING_DATA;
  return COHORT_SPENDING_DATA.map(d => ({
    decade: d.decade,
    silent: cohort === 'silent' ? d.silent : 0,
    boomer: cohort === 'boomer' ? d.boomer : 0,
    'gen-x': cohort === 'gen-x' ? d['gen-x'] : 0,
    millennial: cohort === 'millennial' ? d.millennial : 0,
    'gen-z': cohort === 'gen-z' ? d['gen-z'] : 0,
    'gen-alpha': cohort === 'gen-alpha' ? d['gen-alpha'] : 0,
  }));
}

export function getPlayerCohortMapping(): Record<string, DemographicCohort> {
  const mapping: Record<string, DemographicCohort> = {};
  for (const player of PLAYER_NOSTALGIA_SCORES) {
    const scores = player.cohortScores;
    let maxCohort: DemographicCohort = 'millennial';
    let maxScore = 0;
    for (const [cohort, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxCohort = cohort as DemographicCohort;
      }
    }
    mapping[player.playerName] = maxCohort;
  }
  return mapping;
}

export function getPriceWaveProjections(): PriceWaveProjection[] {
  return WAVE_PROJECTION_TEMPLATE;
}

export function getHistoricalWaves(): NostalgiaWave[] {
  return HISTORICAL_WAVES.sort((a, b) => b.peakPriceMultiplier - a.peakPriceMultiplier);
}

export function getTopNostalgiaPlays(): TopNostalgiaPlay[] {
  return TOP_NOSTALGIA_PLAYS;
}
