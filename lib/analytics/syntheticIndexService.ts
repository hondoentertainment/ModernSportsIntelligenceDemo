// Synthetic Card Index Creator — Custom Investable Thematic Card Index Service

// ---- Types ----

export type IndexMethodology = 'market-cap-weighted' | 'equal-weighted' | 'price-weighted' | 'factor-weighted';

export type RebalanceFrequency = 'monthly' | 'quarterly' | 'annual';

export type Sport = 'baseball' | 'basketball' | 'football' | 'hockey' | 'soccer' | 'multi';

export interface IndexComponent {
  cardId: string;
  cardName: string;
  player: string;
  sport: Sport;
  year: number;
  weight: number;
  currentValue: number;
  priorValue: number;
  contributionToReturn: number;
}

export interface IndexPerformance {
  nav: number;
  navHistory: { date: string; nav: number; benchmark: number }[];
  returns1M: number;
  returns3M: number;
  returns6M: number;
  returns1Y: number;
  returnsYTD: number;
  returnsSinceInception: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  sortino: number;
  calmar: number;
}

export interface IndexBenchmark {
  id: string;
  name: string;
  description: string;
  navHistory: { date: string; nav: number }[];
  returns1Y: number;
  sharpeRatio: number;
  volatility: number;
}

export interface BacktestResult {
  indexId: string;
  startDate: string;
  endDate: string;
  initialNav: number;
  finalNav: number;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  maxDrawdownStart: string;
  maxDrawdownEnd: string;
  sharpeRatio: number;
  volatility: number;
  winRate: number;
  bestMonth: number;
  worstMonth: number;
  monthlyReturns: { month: string; return: number }[];
  equityCurve: { date: string; value: number; benchmark: number }[];
}

export interface FactorExposure {
  indexId: string;
  factors: {
    name: string;
    exposure: number;
    tStat: number;
    pValue: number;
  }[];
  rSquared: number;
  alpha: number;
  residualVol: number;
}

export interface TrackingError {
  indexId: string;
  benchmarkId: string;
  trackingError: number;
  informationRatio: number;
  activeReturn: number;
  activeRisk: number;
  correlationToBenchmark: number;
  beta: number;
  rollingTE: { date: string; te: number }[];
}

export interface IndexCreationParams {
  name: string;
  description: string;
  methodology: IndexMethodology;
  rebalanceFrequency: RebalanceFrequency;
  maxComponents: number;
  minCardValue: number;
  sportFilter: Sport[];
  eraFilter: string;
  themeFilter: string;
  selectedCardIds: string[];
}

export interface SyntheticIndex {
  id: string;
  name: string;
  description: string;
  methodology: IndexMethodology;
  rebalanceFrequency: RebalanceFrequency;
  inception: string;
  creator: string;
  components: IndexComponent[];
  totalValue: number;
  componentCount: number;
  performance: IndexPerformance;
  tags: string[];
  isPreBuilt: boolean;
}

// ---- Helpers ----

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateNavHistory(
  months: number,
  startNav: number,
  annualReturn: number,
  annualVol: number,
  seed: number,
): { date: string; nav: number; benchmark: number }[] {
  const rng = seededRandom(seed);
  const monthlyReturn = annualReturn / 12 / 100;
  const monthlyVol = annualVol / Math.sqrt(12) / 100;
  const series: { date: string; nav: number; benchmark: number }[] = [];
  let v = startNav;
  let b = startNav;
  const benchMonthly = 0.08 / 12;
  const benchVol = 0.12 / Math.sqrt(12);
  const startDate = new Date(2021, 2, 1);

  for (let i = 0; i <= months; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    const dateStr = d.toISOString().slice(0, 10);
    series.push({
      date: dateStr,
      nav: Math.round(v * 100) / 100,
      benchmark: Math.round(b * 100) / 100,
    });
    const noise = (rng() - 0.5) * 2;
    v *= 1 + monthlyReturn + monthlyVol * noise;
    const bNoise = (rng() - 0.5) * 2;
    b *= 1 + benchMonthly + benchVol * bNoise;
  }
  return series;
}

function computePerformance(
  navHistory: { date: string; nav: number; benchmark: number }[],
  annualReturn: number,
  annualVol: number,
  seed: number,
): IndexPerformance {
  const rng = seededRandom(seed + 999);
  const latest = navHistory[navHistory.length - 1]?.nav ?? 1000;
  const navLen = navHistory.length;
  const nav1M = navLen > 1 ? navHistory[navLen - 2]?.nav ?? latest : latest;
  const nav3M = navLen > 3 ? navHistory[navLen - 4]?.nav ?? latest : latest;
  const nav6M = navLen > 6 ? navHistory[navLen - 7]?.nav ?? latest : latest;
  const nav1Y = navLen > 12 ? navHistory[navLen - 13]?.nav ?? latest : latest;
  const navYTD = navLen > 3 ? navHistory[navLen - 4]?.nav ?? latest : latest;
  const navInception = navHistory[0]?.nav ?? 1000;

  return {
    nav: latest,
    navHistory,
    returns1M: Math.round(((latest - nav1M) / nav1M) * 10000) / 100,
    returns3M: Math.round(((latest - nav3M) / nav3M) * 10000) / 100,
    returns6M: Math.round(((latest - nav6M) / nav6M) * 10000) / 100,
    returns1Y: Math.round(((latest - nav1Y) / nav1Y) * 10000) / 100,
    returnsYTD: Math.round(((latest - navYTD) / navYTD) * 10000) / 100,
    returnsSinceInception: Math.round(((latest - navInception) / navInception) * 10000) / 100,
    sharpeRatio: Math.round((annualReturn / annualVol + (rng() - 0.5) * 0.3) * 100) / 100,
    maxDrawdown: Math.round((-5 - rng() * annualVol * 0.8) * 100) / 100,
    volatility: Math.round((annualVol + (rng() - 0.5) * 4) * 100) / 100,
    sortino: Math.round((annualReturn / annualVol * 1.3 + (rng() - 0.5) * 0.2) * 100) / 100,
    calmar: Math.round((annualReturn / (5 + rng() * annualVol * 0.8)) * 100) / 100,
  };
}

// ---- Component Data for Pre-Built Indices ----

const leftHandedPitchersComponents: IndexComponent[] = [
  { cardId: 'lhp-001', cardName: '1963 Topps #210', player: 'Sandy Koufax', sport: 'baseball', year: 1963, weight: 15.2, currentValue: 42000, priorValue: 38500, contributionToReturn: 2.8 },
  { cardId: 'lhp-002', cardName: '1968 Topps #45', player: 'Steve Carlton', sport: 'baseball', year: 1968, weight: 12.8, currentValue: 8900, priorValue: 8200, contributionToReturn: 1.1 },
  { cardId: 'lhp-003', cardName: '1975 Topps #223', player: 'Randy Johnson', sport: 'baseball', year: 1989, weight: 11.5, currentValue: 4500, priorValue: 4100, contributionToReturn: 0.9 },
  { cardId: 'lhp-004', cardName: '1988 Fleer #378', player: 'Tom Glavine', sport: 'baseball', year: 1988, weight: 9.4, currentValue: 2800, priorValue: 2600, contributionToReturn: 0.5 },
  { cardId: 'lhp-005', cardName: '1984 Fleer Update #U-43', player: 'Jimmy Key', sport: 'baseball', year: 1984, weight: 7.2, currentValue: 1200, priorValue: 1100, contributionToReturn: 0.3 },
  { cardId: 'lhp-006', cardName: '1957 Topps #302', player: 'Warren Spahn', sport: 'baseball', year: 1957, weight: 14.1, currentValue: 18500, priorValue: 17200, contributionToReturn: 1.9 },
  { cardId: 'lhp-007', cardName: '1955 Topps #123', player: 'Whitey Ford', sport: 'baseball', year: 1955, weight: 13.0, currentValue: 15800, priorValue: 14600, contributionToReturn: 1.7 },
  { cardId: 'lhp-008', cardName: '1990 Leaf #245', player: 'John Franco', sport: 'baseball', year: 1990, weight: 5.2, currentValue: 850, priorValue: 820, contributionToReturn: 0.1 },
  { cardId: 'lhp-009', cardName: '1992 Bowman #302', player: 'Andy Pettitte', sport: 'baseball', year: 1992, weight: 6.1, currentValue: 1100, priorValue: 1050, contributionToReturn: 0.2 },
  { cardId: 'lhp-010', cardName: '1969 Topps #573', player: 'Mickey Lolich', sport: 'baseball', year: 1969, weight: 5.5, currentValue: 3200, priorValue: 3000, contributionToReturn: 0.4 },
];

const nbaDunkersCaliforniaComponents: IndexComponent[] = [
  { cardId: 'nbd-001', cardName: '1996 Topps Chrome #138', player: 'Kobe Bryant', sport: 'basketball', year: 1996, weight: 18.5, currentValue: 198000, priorValue: 185000, contributionToReturn: 4.2 },
  { cardId: 'nbd-002', cardName: '2009 Panini #357', player: 'DeMar DeRozan', sport: 'basketball', year: 2009, weight: 8.2, currentValue: 4500, priorValue: 4200, contributionToReturn: 0.4 },
  { cardId: 'nbd-003', cardName: '2008 Topps Chrome #184', player: 'Russell Westbrook', sport: 'basketball', year: 2008, weight: 12.4, currentValue: 12800, priorValue: 11900, contributionToReturn: 1.5 },
  { cardId: 'nbd-004', cardName: '2001 Topps Chrome #131', player: 'Jason Richardson', sport: 'basketball', year: 2001, weight: 6.8, currentValue: 2200, priorValue: 2100, contributionToReturn: 0.2 },
  { cardId: 'nbd-005', cardName: '1997 Topps Chrome #125', player: 'Paul Pierce', sport: 'basketball', year: 1997, weight: 10.1, currentValue: 8500, priorValue: 8000, contributionToReturn: 0.8 },
  { cardId: 'nbd-006', cardName: '2005 Topps Chrome #168', player: 'Aaron Gordon', sport: 'basketball', year: 2014, weight: 7.5, currentValue: 3200, priorValue: 3000, contributionToReturn: 0.3 },
  { cardId: 'nbd-007', cardName: '2018 Panini Prizm #181', player: 'Miles Bridges', sport: 'basketball', year: 2018, weight: 5.9, currentValue: 1800, priorValue: 1900, contributionToReturn: -0.1 },
  { cardId: 'nbd-008', cardName: '1985 Star #117', player: 'Reggie Miller', sport: 'basketball', year: 1985, weight: 11.8, currentValue: 14200, priorValue: 13000, contributionToReturn: 1.6 },
  { cardId: 'nbd-009', cardName: '2002 Topps Chrome #114', player: 'Amare Stoudemire', sport: 'basketball', year: 2002, weight: 9.4, currentValue: 5800, priorValue: 5500, contributionToReturn: 0.5 },
  { cardId: 'nbd-010', cardName: '2017 Panini Prizm #283', player: 'Lonzo Ball', sport: 'basketball', year: 2017, weight: 9.4, currentValue: 4200, priorValue: 4600, contributionToReturn: -0.4 },
];

const heismanWinnersComponents: IndexComponent[] = [
  { cardId: 'hei-001', cardName: '2017 Panini National Treasures #101', player: 'Patrick Mahomes', sport: 'football', year: 2017, weight: 16.2, currentValue: 188000, priorValue: 175000, contributionToReturn: 4.8 },
  { cardId: 'hei-002', cardName: '2019 Panini Prizm #301', player: 'Kyler Murray', sport: 'football', year: 2019, weight: 8.5, currentValue: 8200, priorValue: 8800, contributionToReturn: -0.4 },
  { cardId: 'hei-003', cardName: '2020 Panini Prizm #325', player: 'Joe Burrow', sport: 'football', year: 2020, weight: 12.1, currentValue: 28000, priorValue: 25000, contributionToReturn: 2.0 },
  { cardId: 'hei-004', cardName: '2016 Panini Prizm #207', player: 'Derrick Henry', sport: 'football', year: 2016, weight: 9.8, currentValue: 12500, priorValue: 11800, contributionToReturn: 0.8 },
  { cardId: 'hei-005', cardName: '2018 Panini Prizm #201', player: 'Baker Mayfield', sport: 'football', year: 2018, weight: 5.4, currentValue: 3800, priorValue: 4200, contributionToReturn: -0.3 },
  { cardId: 'hei-006', cardName: '2018 Panini Prizm #250', player: 'Lamar Jackson', sport: 'football', year: 2018, weight: 13.5, currentValue: 35000, priorValue: 32000, contributionToReturn: 2.4 },
  { cardId: 'hei-007', cardName: '2021 Panini Prizm #341', player: 'DeVonta Smith', sport: 'football', year: 2021, weight: 7.2, currentValue: 5500, priorValue: 5200, contributionToReturn: 0.3 },
  { cardId: 'hei-008', cardName: '2024 Panini Prizm #310', player: 'Jayden Daniels', sport: 'football', year: 2024, weight: 10.8, currentValue: 19800, priorValue: 16500, contributionToReturn: 2.8 },
  { cardId: 'hei-009', cardName: '2023 Panini Prizm #301', player: 'Caleb Williams', sport: 'football', year: 2023, weight: 9.5, currentValue: 15200, priorValue: 14000, contributionToReturn: 1.1 },
  { cardId: 'hei-010', cardName: '2015 Panini Prizm #230', player: 'Marcus Mariota', sport: 'football', year: 2015, weight: 7.0, currentValue: 4800, priorValue: 5100, contributionToReturn: -0.2 },
];

const multiSportAthletesComponents: IndexComponent[] = [
  { cardId: 'msa-001', cardName: '1986 Fleer #57', player: 'Michael Jordan', sport: 'basketball', year: 1986, weight: 18.0, currentValue: 295000, priorValue: 280000, contributionToReturn: 3.2 },
  { cardId: 'msa-002', cardName: '1990 Score #697', player: 'Bo Jackson', sport: 'football', year: 1990, weight: 10.5, currentValue: 4200, priorValue: 3900, contributionToReturn: 0.5 },
  { cardId: 'msa-003', cardName: '1993 SP #279', player: 'Deion Sanders', sport: 'football', year: 1993, weight: 12.8, currentValue: 18500, priorValue: 17000, contributionToReturn: 1.4 },
  { cardId: 'msa-004', cardName: '1951 Bowman #253', player: 'Willie Mays', sport: 'baseball', year: 1951, weight: 14.2, currentValue: 162000, priorValue: 155000, contributionToReturn: 2.2 },
  { cardId: 'msa-005', cardName: '2001 Topps #726', player: 'Drew Henson', sport: 'baseball', year: 2001, weight: 3.8, currentValue: 850, priorValue: 900, contributionToReturn: -0.1 },
  { cardId: 'msa-006', cardName: '2021 Topps Chrome #27', player: 'Shohei Ohtani', sport: 'baseball', year: 2021, weight: 15.5, currentValue: 85000, priorValue: 78000, contributionToReturn: 2.8 },
  { cardId: 'msa-007', cardName: '1994 Classic #60', player: 'Tim Duncan', sport: 'basketball', year: 1997, weight: 8.2, currentValue: 9500, priorValue: 9200, contributionToReturn: 0.3 },
  { cardId: 'msa-008', cardName: '1992 Classic #1', player: 'Jim Thorpe', sport: 'multi', year: 1992, weight: 6.5, currentValue: 3200, priorValue: 3000, contributionToReturn: 0.2 },
  { cardId: 'msa-009', cardName: '1984 Topps #63', player: 'John Elway', sport: 'football', year: 1984, weight: 7.0, currentValue: 8400, priorValue: 8100, contributionToReturn: 0.2 },
  { cardId: 'msa-010', cardName: '1989 Score #246', player: 'Brian Jordan', sport: 'baseball', year: 1989, weight: 3.5, currentValue: 650, priorValue: 680, contributionToReturn: -0.04 },
];

const ninetiesInsertsComponents: IndexComponent[] = [
  { cardId: 'ins-001', cardName: '1993 Finest Refractor #1', player: 'Michael Jordan', sport: 'basketball', year: 1993, weight: 16.8, currentValue: 125000, priorValue: 118000, contributionToReturn: 3.2 },
  { cardId: 'ins-002', cardName: '1996 E-X2000 Credentials', player: 'Kobe Bryant', sport: 'basketball', year: 1996, weight: 13.5, currentValue: 85000, priorValue: 80000, contributionToReturn: 2.1 },
  { cardId: 'ins-003', cardName: '1997 Metal Universe PMG #50', player: 'Michael Jordan', sport: 'basketball', year: 1997, weight: 14.2, currentValue: 92000, priorValue: 88000, contributionToReturn: 1.8 },
  { cardId: 'ins-004', cardName: '1993 SP Foil #279', player: 'Derek Jeter', sport: 'baseball', year: 1993, weight: 11.4, currentValue: 52000, priorValue: 49000, contributionToReturn: 1.4 },
  { cardId: 'ins-005', cardName: '1998 Bowman Chrome Int. Ref.', player: 'Peyton Manning', sport: 'football', year: 1998, weight: 10.2, currentValue: 38000, priorValue: 36000, contributionToReturn: 0.9 },
  { cardId: 'ins-006', cardName: '1996 Select Certified Mirror Gold', player: 'Allen Iverson', sport: 'basketball', year: 1996, weight: 8.5, currentValue: 22000, priorValue: 20500, contributionToReturn: 0.7 },
  { cardId: 'ins-007', cardName: '1994 Finest Refractor #331', player: 'Ken Griffey Jr.', sport: 'baseball', year: 1994, weight: 7.8, currentValue: 18500, priorValue: 17800, contributionToReturn: 0.4 },
  { cardId: 'ins-008', cardName: '1997 Precious Metal Gems Green', player: 'Tim Duncan', sport: 'basketball', year: 1997, weight: 6.2, currentValue: 14200, priorValue: 13500, contributionToReturn: 0.4 },
  { cardId: 'ins-009', cardName: '1998 Contenders Ticket Auto', player: 'Randy Moss', sport: 'football', year: 1998, weight: 5.8, currentValue: 12800, priorValue: 12200, contributionToReturn: 0.3 },
  { cardId: 'ins-010', cardName: '1995 Topps Finest Refractor #115', player: 'Frank Thomas', sport: 'baseball', year: 1995, weight: 5.6, currentValue: 11500, priorValue: 11200, contributionToReturn: 0.2 },
];

const hofRookieCardsComponents: IndexComponent[] = [
  { cardId: 'hof-001', cardName: '1952 Topps #311', player: 'Mickey Mantle', sport: 'baseball', year: 1952, weight: 14.8, currentValue: 385000, priorValue: 370000, contributionToReturn: 2.4 },
  { cardId: 'hof-002', cardName: '1986 Fleer #57', player: 'Michael Jordan', sport: 'basketball', year: 1986, weight: 13.5, currentValue: 295000, priorValue: 282000, contributionToReturn: 2.2 },
  { cardId: 'hof-003', cardName: '1979 O-Pee-Chee #18', player: 'Wayne Gretzky', sport: 'hockey', year: 1979, weight: 12.1, currentValue: 245000, priorValue: 235000, contributionToReturn: 1.9 },
  { cardId: 'hof-004', cardName: '1933 Goudey #53', player: 'Babe Ruth', sport: 'baseball', year: 1933, weight: 11.2, currentValue: 215000, priorValue: 208000, contributionToReturn: 1.5 },
  { cardId: 'hof-005', cardName: '1996 Topps Chrome #138', player: 'Kobe Bryant', sport: 'basketball', year: 1996, weight: 9.8, currentValue: 198000, priorValue: 190000, contributionToReturn: 1.2 },
  { cardId: 'hof-006', cardName: '1951 Bowman #253', player: 'Willie Mays', sport: 'baseball', year: 1951, weight: 8.5, currentValue: 162000, priorValue: 156000, contributionToReturn: 0.9 },
  { cardId: 'hof-007', cardName: '1954 Topps #128', player: 'Hank Aaron', sport: 'baseball', year: 1954, weight: 7.9, currentValue: 148000, priorValue: 142000, contributionToReturn: 0.8 },
  { cardId: 'hof-008', cardName: '1966 Topps #132', player: 'Bobby Orr', sport: 'hockey', year: 1966, weight: 5.8, currentValue: 92000, priorValue: 88000, contributionToReturn: 0.5 },
  { cardId: 'hof-009', cardName: '1958 Topps #1', player: 'Ted Williams', sport: 'baseball', year: 1958, weight: 6.4, currentValue: 132000, priorValue: 128000, contributionToReturn: 0.5 },
  { cardId: 'hof-010', cardName: '1955 Topps #164', player: 'Roberto Clemente', sport: 'baseball', year: 1955, weight: 5.2, currentValue: 110000, priorValue: 105000, contributionToReturn: 0.6 },
  { cardId: 'hof-011', cardName: '1969 Topps #260', player: 'Reggie Jackson', sport: 'baseball', year: 1969, weight: 4.8, currentValue: 82000, priorValue: 79000, contributionToReturn: 0.4 },
];

const internationalStarsComponents: IndexComponent[] = [
  { cardId: 'int-001', cardName: '2021 Topps Chrome #27', player: 'Shohei Ohtani', sport: 'baseball', year: 2021, weight: 16.5, currentValue: 85000, priorValue: 78000, contributionToReturn: 3.8 },
  { cardId: 'int-002', cardName: '2018 Panini Prizm #280', player: 'Luka Doncic', sport: 'basketball', year: 2018, weight: 15.2, currentValue: 175000, priorValue: 165000, contributionToReturn: 3.2 },
  { cardId: 'int-003', cardName: '2013 Panini Prizm #290', player: 'Giannis Antetokounmpo', sport: 'basketball', year: 2013, weight: 13.8, currentValue: 92000, priorValue: 85000, contributionToReturn: 2.8 },
  { cardId: 'int-004', cardName: '2015 Upper Deck #451', player: 'Connor McDavid', sport: 'hockey', year: 2015, weight: 10.5, currentValue: 42000, priorValue: 39000, contributionToReturn: 1.2 },
  { cardId: 'int-005', cardName: '2023 Topps Chrome #200', player: 'Victor Wembanyama', sport: 'basketball', year: 2023, weight: 11.2, currentValue: 42000, priorValue: 36000, contributionToReturn: 2.5 },
  { cardId: 'int-006', cardName: '1979 O-Pee-Chee #18', player: 'Wayne Gretzky', sport: 'hockey', year: 1979, weight: 9.8, currentValue: 245000, priorValue: 238000, contributionToReturn: 1.0 },
  { cardId: 'int-007', cardName: '2019 Topps Chrome #204', player: 'Fernando Tatis Jr.', sport: 'baseball', year: 2019, weight: 6.4, currentValue: 18500, priorValue: 20000, contributionToReturn: -0.8 },
  { cardId: 'int-008', cardName: '2003 Topps Chrome #115', player: 'Tony Parker', sport: 'basketball', year: 2003, weight: 4.8, currentValue: 5200, priorValue: 5000, contributionToReturn: 0.2 },
  { cardId: 'int-009', cardName: '2002 Topps Chrome #176', player: 'Yao Ming', sport: 'basketball', year: 2002, weight: 5.5, currentValue: 8500, priorValue: 8200, contributionToReturn: 0.3 },
  { cardId: 'int-010', cardName: '2016 Upper Deck #201', player: 'Auston Matthews', sport: 'hockey', year: 2016, weight: 6.3, currentValue: 28000, priorValue: 26500, contributionToReturn: 0.6 },
];

const draftBustsComponents: IndexComponent[] = [
  { cardId: 'db-001', cardName: '2017 Panini Prizm #215', player: 'Mitchell Trubisky', sport: 'football', year: 2017, weight: 11.8, currentValue: 1800, priorValue: 2200, contributionToReturn: -1.2 },
  { cardId: 'db-002', cardName: '2013 Panini Prizm #175', player: 'Anthony Bennett', sport: 'basketball', year: 2013, weight: 8.5, currentValue: 450, priorValue: 520, contributionToReturn: -0.8 },
  { cardId: 'db-003', cardName: '2007 Topps Chrome #TC120', player: 'JaMarcus Russell', sport: 'football', year: 2007, weight: 9.2, currentValue: 800, priorValue: 950, contributionToReturn: -0.9 },
  { cardId: 'db-004', cardName: '2006 Bowman Chrome #220', player: 'Greg Oden', sport: 'basketball', year: 2007, weight: 10.1, currentValue: 1200, priorValue: 1400, contributionToReturn: -0.8 },
  { cardId: 'db-005', cardName: '1998 Leaf Rookies #233', player: 'Ryan Leaf', sport: 'football', year: 1998, weight: 8.8, currentValue: 650, priorValue: 780, contributionToReturn: -0.9 },
  { cardId: 'db-006', cardName: '2014 Topps Chrome #185', player: 'Johnny Manziel', sport: 'football', year: 2014, weight: 9.5, currentValue: 1100, priorValue: 1350, contributionToReturn: -1.0 },
  { cardId: 'db-007', cardName: '2013 Topps Chrome #170', player: 'Mark Appel', sport: 'baseball', year: 2013, weight: 7.8, currentValue: 350, priorValue: 420, contributionToReturn: -0.5 },
  { cardId: 'db-008', cardName: '2016 Panini Prizm #152', player: 'Ben Simmons', sport: 'basketball', year: 2016, weight: 12.5, currentValue: 3500, priorValue: 4200, contributionToReturn: -1.1 },
  { cardId: 'db-009', cardName: '2019 Panini Prizm #248', player: 'Zion Williamson', sport: 'basketball', year: 2019, weight: 11.2, currentValue: 5800, priorValue: 7200, contributionToReturn: -1.4 },
  { cardId: 'db-010', cardName: '2021 Panini Prizm #301', player: 'Trey Lance', sport: 'football', year: 2021, weight: 10.6, currentValue: 1500, priorValue: 1850, contributionToReturn: -1.2 },
];

// ---- Pre-Built Indices ----

const PRE_BUILT_INDICES: SyntheticIndex[] = [
  {
    id: 'lhp-pre-2000',
    name: 'Top 10 Left-Handed Pitchers Pre-2000',
    description: 'Tracks the most iconic left-handed pitcher rookie and key cards from before the year 2000. Heavy on vintage, dominated by Koufax and Spahn with a mix of modern HOFers.',
    methodology: 'market-cap-weighted',
    rebalanceFrequency: 'annual',
    inception: '2021-03-01',
    creator: 'MSI Research',
    components: leftHandedPitchersComponents,
    totalValue: leftHandedPitchersComponents.reduce((s, c) => s + c.currentValue, 0),
    componentCount: leftHandedPitchersComponents.length,
    performance: computePerformance(generateNavHistory(60, 1000, 9, 12, 101), 9, 12, 101),
    tags: ['baseball', 'vintage', 'pitchers', 'left-handed'],
    isPreBuilt: true,
  },
  {
    id: 'nba-dunkers-ca',
    name: 'NBA Dunkers Born in California',
    description: 'A thematic index of high-flying NBA players born in the state of California. Anchored by Kobe Bryant with exposure to modern stars and classic dunkers.',
    methodology: 'market-cap-weighted',
    rebalanceFrequency: 'quarterly',
    inception: '2021-03-01',
    creator: 'MSI Research',
    components: nbaDunkersCaliforniaComponents,
    totalValue: nbaDunkersCaliforniaComponents.reduce((s, c) => s + c.currentValue, 0),
    componentCount: nbaDunkersCaliforniaComponents.length,
    performance: computePerformance(generateNavHistory(60, 1000, 14, 22, 202), 14, 22, 202),
    tags: ['basketball', 'dunkers', 'california', 'thematic'],
    isPreBuilt: true,
  },
  {
    id: 'heisman-winners',
    name: 'Heisman Winners',
    description: 'Invests in the rookie cards of Heisman Trophy winners who went on to NFL careers. Captures the premium that college football\'s highest honor commands in the card market.',
    methodology: 'factor-weighted',
    rebalanceFrequency: 'annual',
    inception: '2021-03-01',
    creator: 'MSI Research',
    components: heismanWinnersComponents,
    totalValue: heismanWinnersComponents.reduce((s, c) => s + c.currentValue, 0),
    componentCount: heismanWinnersComponents.length,
    performance: computePerformance(generateNavHistory(60, 1000, 16, 24, 303), 16, 24, 303),
    tags: ['football', 'heisman', 'college', 'award-winners'],
    isPreBuilt: true,
  },
  {
    id: 'multi-sport-athletes',
    name: 'Multi-Sport Athletes',
    description: 'Captures the rare crossover premium of athletes who played multiple professional sports or whose athletic versatility transcends a single discipline.',
    methodology: 'equal-weighted',
    rebalanceFrequency: 'annual',
    inception: '2021-03-01',
    creator: 'MSI Research',
    components: multiSportAthletesComponents,
    totalValue: multiSportAthletesComponents.reduce((s, c) => s + c.currentValue, 0),
    componentCount: multiSportAthletesComponents.length,
    performance: computePerformance(generateNavHistory(60, 1000, 11, 18, 404), 11, 18, 404),
    tags: ['multi-sport', 'crossover', 'versatile', 'iconic'],
    isPreBuilt: true,
  },
  {
    id: '1990s-inserts',
    name: '1990s Inserts',
    description: 'The golden age of insert cards. Tracks the most coveted insert and refractor cards from the 1990s, including Finest Refractors, PMGs, and SP Foils.',
    methodology: 'market-cap-weighted',
    rebalanceFrequency: 'quarterly',
    inception: '2021-03-01',
    creator: 'MSI Research',
    components: ninetiesInsertsComponents,
    totalValue: ninetiesInsertsComponents.reduce((s, c) => s + c.currentValue, 0),
    componentCount: ninetiesInsertsComponents.length,
    performance: computePerformance(generateNavHistory(60, 1000, 18, 26, 505), 18, 26, 505),
    tags: ['1990s', 'inserts', 'refractors', 'nostalgia'],
    isPreBuilt: true,
  },
  {
    id: 'hof-rookie-cards',
    name: 'HOF Rookie Cards',
    description: 'A blue-chip index of Hall of Fame rookie cards spanning all major sports. The ultimate store-of-value index for the sports card market.',
    methodology: 'market-cap-weighted',
    rebalanceFrequency: 'annual',
    inception: '2021-03-01',
    creator: 'MSI Research',
    components: hofRookieCardsComponents,
    totalValue: hofRookieCardsComponents.reduce((s, c) => s + c.currentValue, 0),
    componentCount: hofRookieCardsComponents.length,
    performance: computePerformance(generateNavHistory(60, 1000, 10, 11, 606), 10, 11, 606),
    tags: ['hall-of-fame', 'rookie', 'blue-chip', 'legacy'],
    isPreBuilt: true,
  },
  {
    id: 'international-stars',
    name: 'International Stars',
    description: 'Tracks the card values of the greatest international-born athletes across all sports. Captures the global expansion premium as international players dominate modern rosters.',
    methodology: 'factor-weighted',
    rebalanceFrequency: 'quarterly',
    inception: '2021-03-01',
    creator: 'MSI Research',
    components: internationalStarsComponents,
    totalValue: internationalStarsComponents.reduce((s, c) => s + c.currentValue, 0),
    componentCount: internationalStarsComponents.length,
    performance: computePerformance(generateNavHistory(60, 1000, 20, 25, 707), 20, 25, 707),
    tags: ['international', 'global', 'emerging', 'cross-border'],
    isPreBuilt: true,
  },
  {
    id: 'draft-busts',
    name: 'Draft Busts',
    description: 'A contrarian short-bias index tracking the card values of top draft picks who failed to meet expectations. Useful as a hedge or cautionary benchmark.',
    methodology: 'equal-weighted',
    rebalanceFrequency: 'quarterly',
    inception: '2021-03-01',
    creator: 'MSI Research',
    components: draftBustsComponents,
    totalValue: draftBustsComponents.reduce((s, c) => s + c.currentValue, 0),
    componentCount: draftBustsComponents.length,
    performance: computePerformance(generateNavHistory(60, 1000, -8, 30, 808), -8, 30, 808),
    tags: ['busts', 'contrarian', 'hedge', 'cautionary'],
    isPreBuilt: true,
  },
];

// ---- Benchmarks ----

const BENCHMARKS: IndexBenchmark[] = [
  {
    id: 'bmk-all-cards',
    name: 'All-Cards Composite',
    description: 'Broad market benchmark tracking the top 500 cards by market cap across all sports and eras.',
    navHistory: generateNavHistory(60, 1000, 8, 12, 9001).map((p) => ({ date: p.date, nav: p.benchmark })),
    returns1Y: 8.2,
    sharpeRatio: 0.67,
    volatility: 12.1,
  },
  {
    id: 'bmk-vintage',
    name: 'Vintage 100',
    description: 'Pre-1980 cards benchmark tracking the top 100 vintage cards by market cap.',
    navHistory: generateNavHistory(60, 1000, 6, 9, 9002).map((p) => ({ date: p.date, nav: p.benchmark })),
    returns1Y: 6.4,
    sharpeRatio: 0.71,
    volatility: 9.2,
  },
  {
    id: 'bmk-modern',
    name: 'Modern Chrome 200',
    description: 'Post-2000 Chrome/Prizm cards benchmark tracking the top 200 modern flagship cards.',
    navHistory: generateNavHistory(60, 1000, 12, 20, 9003).map((p) => ({ date: p.date, nav: p.benchmark })),
    returns1Y: 12.8,
    sharpeRatio: 0.60,
    volatility: 20.5,
  },
];

// ---- Available Cards Pool for Index Builder ----

const AVAILABLE_CARDS: IndexComponent[] = [
  ...leftHandedPitchersComponents,
  ...nbaDunkersCaliforniaComponents,
  ...heismanWinnersComponents,
  ...hofRookieCardsComponents.slice(0, 5),
  ...internationalStarsComponents.slice(0, 5),
  ...ninetiesInsertsComponents.slice(0, 5),
  ...multiSportAthletesComponents.slice(0, 5),
  ...draftBustsComponents.slice(0, 5),
];

// Remove duplicates by cardId
const UNIQUE_CARDS = AVAILABLE_CARDS.filter(
  (card, index, self) => index === self.findIndex((c) => c.cardId === card.cardId),
);

// ---- Exported Service Functions ----

export async function getPreBuiltIndices(): Promise<SyntheticIndex[]> {
  await delay(150);
  return PRE_BUILT_INDICES;
}

export async function getIndexPerformance(id: string): Promise<IndexPerformance | null> {
  await delay(120);
  const idx = PRE_BUILT_INDICES.find((i) => i.id === id);
  return idx?.performance ?? null;
}

export async function getIndexComponents(id: string): Promise<IndexComponent[]> {
  await delay(100);
  const idx = PRE_BUILT_INDICES.find((i) => i.id === id);
  return idx?.components ?? [];
}

export async function createCustomIndex(params: IndexCreationParams): Promise<SyntheticIndex> {
  await delay(300);
  const selectedCards = params.selectedCardIds.length > 0
    ? UNIQUE_CARDS.filter((c) => params.selectedCardIds.includes(c.cardId))
    : UNIQUE_CARDS.slice(0, params.maxComponents);

  const equalWeight = 100 / selectedCards.length;
  const components = selectedCards.map((c) => ({
    ...c,
    weight: params.methodology === 'equal-weighted' ? Math.round(equalWeight * 100) / 100 : c.weight,
  }));

  const navHistory = generateNavHistory(60, 1000, 12, 18, Date.now() % 100000);

  return {
    id: `custom-${Date.now()}`,
    name: params.name,
    description: params.description,
    methodology: params.methodology,
    rebalanceFrequency: params.rebalanceFrequency,
    inception: new Date().toISOString().slice(0, 10),
    creator: 'You',
    components,
    totalValue: components.reduce((s, c) => s + c.currentValue, 0),
    componentCount: components.length,
    performance: computePerformance(navHistory, 12, 18, Date.now() % 100000),
    tags: ['custom', params.themeFilter || 'general'],
    isPreBuilt: false,
  };
}

export async function rebalanceIndex(id: string): Promise<{
  indexId: string;
  date: string;
  additions: string[];
  removals: string[];
  weightChanges: { cardId: string; oldWeight: number; newWeight: number }[];
  turnover: number;
}> {
  await delay(250);
  const rng = seededRandom(id.length * 137 + Date.now() % 10000);
  const idx = PRE_BUILT_INDICES.find((i) => i.id === id);
  const components = idx?.components ?? [];

  const weightChanges = components.slice(0, 5).map((c) => {
    const delta = Math.round((rng() * 4 - 2) * 100) / 100;
    return {
      cardId: c.cardId,
      oldWeight: c.weight,
      newWeight: Math.round(Math.max(1, c.weight + delta) * 100) / 100,
    };
  });

  return {
    indexId: id,
    date: new Date().toISOString().slice(0, 10),
    additions: rng() > 0.6 ? ['New addition: rising prospect met inclusion criteria'] : [],
    removals: rng() > 0.7 ? ['Removed: card fell below minimum value threshold'] : [],
    weightChanges,
    turnover: Math.round(rng() * 15 * 100) / 100,
  };
}

export async function backtestIndex(params: {
  indexId?: string;
  methodology?: IndexMethodology;
  components?: string[];
  startDate?: string;
  endDate?: string;
}): Promise<BacktestResult> {
  await delay(350);
  const seed = (params.indexId ?? 'custom').length * 31 + 42;
  const rng = seededRandom(seed);
  const annualReturn = 8 + rng() * 16;
  const vol = 10 + rng() * 20;
  const navHistory = generateNavHistory(60, 1000, annualReturn, vol, seed);
  const navs = navHistory.map((p) => p.nav);
  const monthlyReturns: { month: string; return: number }[] = [];

  for (let i = 1; i < navHistory.length; i++) {
    monthlyReturns.push({
      month: navHistory[i].date.slice(0, 7),
      return: Math.round(((navHistory[i].nav - navHistory[i - 1].nav) / navHistory[i - 1].nav) * 10000) / 100,
    });
  }

  let maxDD = 0;
  let peak = navs[0];
  let ddStart = navHistory[0].date;
  let ddEnd = navHistory[0].date;
  let worstDDStart = ddStart;
  let worstDDEnd = ddEnd;
  for (let i = 1; i < navs.length; i++) {
    if (navs[i] > peak) {
      peak = navs[i];
      ddStart = navHistory[i].date;
    }
    const dd = (navs[i] - peak) / peak;
    if (dd < maxDD) {
      maxDD = dd;
      worstDDStart = ddStart;
      worstDDEnd = navHistory[i].date;
    }
  }

  const wins = monthlyReturns.filter((m) => m.return >= 0).length;
  const returns = monthlyReturns.map((m) => m.return);

  return {
    indexId: params.indexId ?? 'custom',
    startDate: navHistory[0].date,
    endDate: navHistory[navHistory.length - 1].date,
    initialNav: navHistory[0].nav,
    finalNav: navHistory[navHistory.length - 1].nav,
    totalReturn: Math.round(((navHistory[navHistory.length - 1].nav - navHistory[0].nav) / navHistory[0].nav) * 10000) / 100,
    annualizedReturn: Math.round(annualReturn * 100) / 100,
    maxDrawdown: Math.round(maxDD * 10000) / 100,
    maxDrawdownStart: worstDDStart,
    maxDrawdownEnd: worstDDEnd,
    sharpeRatio: Math.round((annualReturn / vol) * 100) / 100,
    volatility: Math.round(vol * 100) / 100,
    winRate: Math.round((wins / monthlyReturns.length) * 10000) / 100,
    bestMonth: Math.max(...returns),
    worstMonth: Math.min(...returns),
    monthlyReturns,
    equityCurve: navHistory.map((p) => ({ date: p.date, value: p.nav, benchmark: p.benchmark })),
  };
}

export async function getFactorExposure(id: string): Promise<FactorExposure> {
  await delay(180);
  const seed = id.length * 53 + 7;
  const rng = seededRandom(seed);

  const factorNames = [
    'Market Beta',
    'Vintage Premium',
    'Rookie Momentum',
    'HOF Probability',
    'Grading Quality',
    'Scarcity',
    'Sport Popularity',
    'Media Exposure',
  ];

  const factors = factorNames.map((name) => {
    const exposure = Math.round((rng() * 2 - 0.5) * 100) / 100;
    const tStat = Math.round(exposure * (2 + rng() * 3) * 100) / 100;
    return {
      name,
      exposure,
      tStat,
      pValue: Math.round(Math.max(0.001, Math.min(0.999, 1 - Math.abs(tStat) / 5)) * 1000) / 1000,
    };
  });

  return {
    indexId: id,
    factors,
    rSquared: Math.round((0.5 + rng() * 0.45) * 100) / 100,
    alpha: Math.round((rng() * 8 - 2) * 100) / 100,
    residualVol: Math.round((3 + rng() * 10) * 100) / 100,
  };
}

export async function compareIndices(ids: string[]): Promise<{
  indices: SyntheticIndex[];
  correlationMatrix: number[][];
  performanceOverlay: { date: string; values: Record<string, number> }[];
}> {
  await delay(200);
  const selected = PRE_BUILT_INDICES.filter((i) => ids.includes(i.id));
  const n = selected.length;

  const correlationMatrix: number[][] = [];
  const rng = seededRandom(ids.join('').length * 17);
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) row.push(1.0);
      else if (j < i) row.push(correlationMatrix[j][i]);
      else row.push(Math.round((0.2 + rng() * 0.6) * 100) / 100);
    }
    correlationMatrix.push(row);
  }

  const maxLen = Math.max(...selected.map((s) => s.performance.navHistory.length));
  const baseSeries = selected.reduce((longest, s) =>
    s.performance.navHistory.length > longest.performance.navHistory.length ? s : longest,
  ).performance.navHistory;

  const performanceOverlay = baseSeries.map((point, i) => {
    const values: Record<string, number> = {};
    for (const s of selected) {
      const idx = Math.min(i, s.performance.navHistory.length - 1);
      values[s.id] = s.performance.navHistory[idx]?.nav ?? 1000;
    }
    return { date: point.date, values };
  });

  return { indices: selected, correlationMatrix, performanceOverlay };
}

export async function getTrackingError(id: string, benchmarkId: string): Promise<TrackingError> {
  await delay(150);
  const seed = (id + benchmarkId).length * 29 + 13;
  const rng = seededRandom(seed);

  const idx = PRE_BUILT_INDICES.find((i) => i.id === id);
  const navHistory = idx?.performance.navHistory ?? [];

  const rollingTE = navHistory.filter((_, i) => i % 3 === 0).map((point) => ({
    date: point.date,
    te: Math.round((2 + rng() * 12) * 100) / 100,
  }));

  return {
    indexId: id,
    benchmarkId,
    trackingError: Math.round((3 + rng() * 10) * 100) / 100,
    informationRatio: Math.round((rng() * 1.5 - 0.3) * 100) / 100,
    activeReturn: Math.round((rng() * 12 - 3) * 100) / 100,
    activeRisk: Math.round((4 + rng() * 8) * 100) / 100,
    correlationToBenchmark: Math.round((0.4 + rng() * 0.55) * 100) / 100,
    beta: Math.round((0.6 + rng() * 0.8) * 100) / 100,
    rollingTE,
  };
}

export async function getTopPerformingIndices(): Promise<SyntheticIndex[]> {
  await delay(100);
  return [...PRE_BUILT_INDICES]
    .sort((a, b) => b.performance.returnsSinceInception - a.performance.returnsSinceInception)
    .slice(0, 5);
}

export function getAvailableCards(): IndexComponent[] {
  return UNIQUE_CARDS;
}

export function getBenchmarks(): IndexBenchmark[] {
  return BENCHMARKS;
}
