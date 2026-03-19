// Grail Index Constructor — Custom Investable Card Index Service

// ---- Types ----

export type WeightingMethod = 'market-cap' | 'equal' | 'fundamental' | 'custom';
export type RebalanceFrequency = 'monthly' | 'quarterly' | 'annually';

export interface IndexConstituent {
  cardId: string;
  cardName: string;
  player: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey' | 'soccer' | 'multi';
  weight: number;
  currentValue: number;
  addedDate: string;
  inclusionCriteria: string[];
}

export interface IndexPerformance {
  returns1M: number;
  returns3M: number;
  returns6M: number;
  returns1Y: number;
  returns3Y: number;
  returns5Y: number;
  returnsInception: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  alpha: number;
  beta: number;
  trackingError: number;
  informationRatio: number;
  timeSeries: { date: string; value: number; benchmark: number }[];
}

export interface IndexMethodology {
  objectives: string;
  universe: string;
  selectionCriteria: string[];
  weightingRules: string[];
  rebalancingRules: string[];
  exclusionCriteria: string[];
}

export interface RebalanceEvent {
  date: string;
  additions: { cardId: string; reason: string }[];
  removals: { cardId: string; reason: string }[];
  weightChanges: { cardId: string; oldWeight: number; newWeight: number; reason: string }[];
  turnover: number;
}

export interface IndexComparison {
  indices: string[];
  correlationMatrix: number[][];
  performanceOverlay: { date: string; values: number[] }[];
}

export interface BacktestResult {
  indexId: string;
  period: string;
  returns: number;
  volatility: number;
  drawdowns: { start: string; end: string; depth: number }[];
  monthlyReturns: number[];
}

export interface CardIndex {
  id: string;
  name: string;
  description: string;
  methodology: IndexMethodology;
  creator: string;
  inception: string;
  constituents: IndexConstituent[];
  totalValue: number;
  performance: IndexPerformance;
  rebalanceFrequency: RebalanceFrequency;
  weightingMethod: WeightingMethod;
  lastRebalance: string;
  nextRebalance: string;
}

// ---- Helpers ----

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateTimeSeries(
  months: number,
  startValue: number,
  annualReturn: number,
  annualVol: number,
  seed: number,
): { date: string; value: number; benchmark: number }[] {
  const rng = seededRandom(seed);
  const monthlyReturn = annualReturn / 12 / 100;
  const monthlyVol = annualVol / Math.sqrt(12) / 100;
  const series: { date: string; value: number; benchmark: number }[] = [];
  let v = startValue;
  let b = startValue;
  const benchMonthly = 0.08 / 12;
  const benchVol = 0.12 / Math.sqrt(12);
  const startDate = new Date(2021, 2, 1);

  for (let i = 0; i <= months; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    const dateStr = d.toISOString().slice(0, 10);
    series.push({
      date: dateStr,
      value: Math.round(v * 100) / 100,
      benchmark: Math.round(b * 100) / 100,
    });
    const noise = (rng() - 0.5) * 2;
    v *= 1 + monthlyReturn + monthlyVol * noise;
    const bNoise = (rng() - 0.5) * 2;
    b *= 1 + benchMonthly + benchVol * bNoise;
  }
  return series;
}

function generateMonthlyReturns(seed: number, meanAnnual: number, vol: number): number[] {
  const rng = seededRandom(seed);
  const monthlyMean = meanAnnual / 12;
  const monthlyVol = vol / Math.sqrt(12);
  const returns: number[] = [];
  for (let i = 0; i < 60; i++) {
    const noise = (rng() - 0.5) * 2;
    returns.push(Math.round((monthlyMean + monthlyVol * noise) * 100) / 100);
  }
  return returns;
}

// ---- Constituents Data ----

const blueChipConstituents: IndexConstituent[] = [
  { cardId: 'bc-001', cardName: '1952 Topps #311', player: 'Mickey Mantle', sport: 'baseball', weight: 8.2, currentValue: 385000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'PSA 8+ population'] },
  { cardId: 'bc-002', cardName: '1986 Fleer #57', player: 'Michael Jordan', sport: 'basketball', weight: 7.8, currentValue: 295000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Iconic rookie card'] },
  { cardId: 'bc-003', cardName: '2003 Topps Chrome #221', player: 'LeBron James', sport: 'basketball', weight: 7.1, currentValue: 268000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Modern era flagship'] },
  { cardId: 'bc-004', cardName: '1979 O-Pee-Chee #18', player: 'Wayne Gretzky', sport: 'hockey', weight: 6.5, currentValue: 245000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Cross-sport icon'] },
  { cardId: 'bc-005', cardName: '2000 Playoff Contenders #144', player: 'Tom Brady', sport: 'football', weight: 6.2, currentValue: 228000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'GOAT candidate'] },
  { cardId: 'bc-006', cardName: '1933 Goudey #53', player: 'Babe Ruth', sport: 'baseball', weight: 5.8, currentValue: 215000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Pre-war legend'] },
  { cardId: 'bc-007', cardName: '1969 Topps #260', player: 'Reggie Jackson', sport: 'baseball', weight: 4.1, currentValue: 148000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'HOF rookie'] },
  { cardId: 'bc-008', cardName: '1996 Topps Chrome #138', player: 'Kobe Bryant', sport: 'basketball', weight: 5.5, currentValue: 198000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Legacy premium'] },
  { cardId: 'bc-009', cardName: '1989 Upper Deck #1', player: 'Ken Griffey Jr.', sport: 'baseball', weight: 3.9, currentValue: 142000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Junk wax king'] },
  { cardId: 'bc-010', cardName: '1958 Topps #1', player: 'Ted Williams', sport: 'baseball', weight: 3.6, currentValue: 132000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Golden age flagship'] },
  { cardId: 'bc-011', cardName: '2018 Panini Prizm #280', player: 'Luka Doncic', sport: 'basketball', weight: 4.8, currentValue: 175000, addedDate: '2021-06-01', inclusionCriteria: ['Top 25 by market cap', 'Generational talent'] },
  { cardId: 'bc-012', cardName: '2017 Panini National Treasures #101', player: 'Patrick Mahomes', sport: 'football', weight: 5.1, currentValue: 188000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Dynasty QB'] },
  { cardId: 'bc-013', cardName: '1951 Bowman #253', player: 'Willie Mays', sport: 'baseball', weight: 4.4, currentValue: 162000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Say Hey Kid RC'] },
  { cardId: 'bc-014', cardName: '1986 Fleer #68', player: 'Karl Malone', sport: 'basketball', weight: 2.1, currentValue: 78000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'HOF set companion'] },
  { cardId: 'bc-015', cardName: '1984 Topps #63', player: 'John Elway', sport: 'football', weight: 2.3, currentValue: 84000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'QB legend RC'] },
  { cardId: 'bc-016', cardName: '2009 Topps Chrome #TC48', player: 'Mike Trout', sport: 'baseball', weight: 3.4, currentValue: 125000, addedDate: '2022-01-01', inclusionCriteria: ['Top 25 by market cap', 'Generational talent'] },
  { cardId: 'bc-017', cardName: '1948 Leaf #76', player: 'Joe DiMaggio', sport: 'baseball', weight: 2.8, currentValue: 102000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Post-war icon'] },
  { cardId: 'bc-018', cardName: '1957 Topps #17', player: 'Bob Cousy', sport: 'basketball', weight: 1.9, currentValue: 69000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Pioneer era basketball'] },
  { cardId: 'bc-019', cardName: '1966 Topps #132', player: 'Bobby Orr', sport: 'hockey', weight: 2.5, currentValue: 92000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Hockey icon RC'] },
  { cardId: 'bc-020', cardName: '2018 Panini National Treasures #102', player: 'Saquon Barkley', sport: 'football', weight: 1.7, currentValue: 62000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'RB prospect premium'] },
  { cardId: 'bc-021', cardName: '1955 Topps #164', player: 'Roberto Clemente', sport: 'baseball', weight: 3.0, currentValue: 110000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Legend premium'] },
  { cardId: 'bc-022', cardName: '1961 Fleer #8', player: 'Wilt Chamberlain', sport: 'basketball', weight: 2.6, currentValue: 95000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Historical significance'] },
  { cardId: 'bc-023', cardName: '2020 Panini Prizm #339', player: 'Justin Herbert', sport: 'football', weight: 1.5, currentValue: 55000, addedDate: '2022-03-01', inclusionCriteria: ['Top 25 by market cap', 'Emerging franchise QB'] },
  { cardId: 'bc-024', cardName: '1980 Topps #482', player: 'Rickey Henderson', sport: 'baseball', weight: 1.6, currentValue: 58000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'All-time steals leader'] },
  { cardId: 'bc-025', cardName: '2019 Panini Prizm #248', player: 'Zion Williamson', sport: 'basketball', weight: 1.6, currentValue: 58000, addedDate: '2021-03-01', inclusionCriteria: ['Top 25 by market cap', 'Hype-era flagship'] },
];

const rookieGrowthConstituents: IndexConstituent[] = [
  { cardId: 'rg-001', cardName: '2023 Topps Chrome #200', player: 'Victor Wembanyama', sport: 'basketball', weight: 4.2, currentValue: 42000, addedDate: '2024-01-01', inclusionCriteria: ['Top 50 rookie appreciation', '1Y return > 40%'] },
  { cardId: 'rg-002', cardName: '2023 Bowman Chrome #BCP-1', player: 'Jackson Holliday', sport: 'baseball', weight: 3.1, currentValue: 18500, addedDate: '2024-01-01', inclusionCriteria: ['Top 50 rookie appreciation', '#1 overall pick'] },
  { cardId: 'rg-003', cardName: '2023 Panini Prizm #301', player: 'Caleb Williams', sport: 'football', weight: 3.8, currentValue: 28000, addedDate: '2024-06-01', inclusionCriteria: ['Top 50 rookie appreciation', 'Franchise QB premium'] },
  { cardId: 'rg-004', cardName: '2024 Topps Chrome #150', player: 'Paul Skenes', sport: 'baseball', weight: 3.4, currentValue: 22000, addedDate: '2024-06-01', inclusionCriteria: ['Top 50 rookie appreciation', 'Cy Young trajectory'] },
  { cardId: 'rg-005', cardName: '2023 Panini Prizm Silver #280', player: 'Chet Holmgren', sport: 'basketball', weight: 2.5, currentValue: 15200, addedDate: '2024-01-01', inclusionCriteria: ['Top 50 rookie appreciation', 'Unicorn archetype'] },
  { cardId: 'rg-006', cardName: '2023 Topps Chrome #175', player: 'Jasson Dominguez', sport: 'baseball', weight: 2.8, currentValue: 17500, addedDate: '2024-01-01', inclusionCriteria: ['Top 50 rookie appreciation', 'Yankee prospect premium'] },
  { cardId: 'rg-007', cardName: '2024 Panini Prizm #310', player: 'Jayden Daniels', sport: 'football', weight: 2.9, currentValue: 19800, addedDate: '2025-01-01', inclusionCriteria: ['Top 50 rookie appreciation', 'Heisman winner premium'] },
  { cardId: 'rg-008', cardName: '2022 Panini Prizm #275', player: 'Paolo Banchero', sport: 'basketball', weight: 2.0, currentValue: 12800, addedDate: '2023-01-01', inclusionCriteria: ['Top 50 rookie appreciation', '#1 overall pick'] },
  { cardId: 'rg-009', cardName: '2024 Upper Deck #201', player: 'Connor Bedard', sport: 'hockey', weight: 3.0, currentValue: 21000, addedDate: '2024-06-01', inclusionCriteria: ['Top 50 rookie appreciation', 'Generational hockey talent'] },
  { cardId: 'rg-010', cardName: '2022 Topps Chrome #220', player: 'Julio Rodriguez', sport: 'baseball', weight: 2.2, currentValue: 14500, addedDate: '2023-01-01', inclusionCriteria: ['Top 50 rookie appreciation', '5-tool prospect'] },
  { cardId: 'rg-011', cardName: '2024 Panini Prizm #305', player: 'Marvin Harrison Jr.', sport: 'football', weight: 2.7, currentValue: 16800, addedDate: '2025-01-01', inclusionCriteria: ['Top 50 rookie appreciation', 'Dynasty WR prospect'] },
  { cardId: 'rg-012', cardName: '2022 Panini Prizm Silver #268', player: 'Jalen Williams', sport: 'basketball', weight: 1.8, currentValue: 9800, addedDate: '2023-06-01', inclusionCriteria: ['Top 50 rookie appreciation', 'All-Star trajectory'] },
  { cardId: 'rg-013', cardName: '2023 Bowman Chrome #BDC-50', player: 'Ethan Salas', sport: 'baseball', weight: 2.1, currentValue: 11500, addedDate: '2024-06-01', inclusionCriteria: ['Top 50 rookie appreciation', 'International prospect premium'] },
  { cardId: 'rg-014', cardName: '2024 Panini Prizm #320', player: 'Drake Maye', sport: 'football', weight: 1.9, currentValue: 10200, addedDate: '2025-01-01', inclusionCriteria: ['Top 50 rookie appreciation', 'First-round QB premium'] },
  { cardId: 'rg-015', cardName: '2023 Topps Chrome #190', player: 'Brandon Miller', sport: 'basketball', weight: 1.6, currentValue: 8500, addedDate: '2024-01-01', inclusionCriteria: ['Top 50 rookie appreciation', 'Wing scorer archetype'] },
];

const multiSportConstituents: IndexConstituent[] = [
  { cardId: 'ms-001', cardName: '2021 Topps Chrome #27', player: 'Shohei Ohtani', sport: 'baseball', weight: 6.25, currentValue: 85000, addedDate: '2021-06-01', inclusionCriteria: ['Equal-weight cross-sport', 'Baseball representative'] },
  { cardId: 'ms-002', cardName: '2019 Panini Prizm #248', player: 'Ja Morant', sport: 'basketball', weight: 6.25, currentValue: 32000, addedDate: '2021-06-01', inclusionCriteria: ['Equal-weight cross-sport', 'Basketball representative'] },
  { cardId: 'ms-003', cardName: '2020 Panini Prizm #339', player: 'Justin Herbert', sport: 'football', weight: 6.25, currentValue: 55000, addedDate: '2021-06-01', inclusionCriteria: ['Equal-weight cross-sport', 'Football representative'] },
  { cardId: 'ms-004', cardName: '2016 Upper Deck #201', player: 'Auston Matthews', sport: 'hockey', weight: 6.25, currentValue: 28000, addedDate: '2021-06-01', inclusionCriteria: ['Equal-weight cross-sport', 'Hockey representative'] },
  { cardId: 'ms-005', cardName: '2018 Topps Chrome Update #HMT25', player: 'Ronald Acuna Jr.', sport: 'baseball', weight: 6.25, currentValue: 38000, addedDate: '2021-06-01', inclusionCriteria: ['Equal-weight cross-sport', 'Baseball representative'] },
  { cardId: 'ms-006', cardName: '2018 Panini Prizm #280', player: 'Luka Doncic', sport: 'basketball', weight: 6.25, currentValue: 175000, addedDate: '2021-06-01', inclusionCriteria: ['Equal-weight cross-sport', 'Basketball representative'] },
  { cardId: 'ms-007', cardName: '2017 Panini Prizm #269', player: 'Patrick Mahomes', sport: 'football', weight: 6.25, currentValue: 72000, addedDate: '2021-06-01', inclusionCriteria: ['Equal-weight cross-sport', 'Football representative'] },
  { cardId: 'ms-008', cardName: '2015 Upper Deck #451', player: 'Connor McDavid', sport: 'hockey', weight: 6.25, currentValue: 42000, addedDate: '2021-06-01', inclusionCriteria: ['Equal-weight cross-sport', 'Hockey representative'] },
  { cardId: 'ms-009', cardName: '2019 Topps Chrome #203', player: 'Yordan Alvarez', sport: 'baseball', weight: 6.25, currentValue: 18500, addedDate: '2022-01-01', inclusionCriteria: ['Equal-weight cross-sport', 'Baseball representative'] },
  { cardId: 'ms-010', cardName: '2020 Panini Prizm #278', player: 'Anthony Edwards', sport: 'basketball', weight: 6.25, currentValue: 45000, addedDate: '2022-01-01', inclusionCriteria: ['Equal-weight cross-sport', 'Basketball representative'] },
  { cardId: 'ms-011', cardName: '2021 Panini Prizm #331', player: 'Ja\'Marr Chase', sport: 'football', weight: 6.25, currentValue: 32000, addedDate: '2022-01-01', inclusionCriteria: ['Equal-weight cross-sport', 'Football representative'] },
  { cardId: 'ms-012', cardName: '2019 Upper Deck #246', player: 'Cale Makar', sport: 'hockey', weight: 6.25, currentValue: 22000, addedDate: '2022-01-01', inclusionCriteria: ['Equal-weight cross-sport', 'Hockey representative'] },
  { cardId: 'ms-013', cardName: '2022 Topps Chrome #200', player: 'Gunnar Henderson', sport: 'baseball', weight: 6.25, currentValue: 14500, addedDate: '2023-06-01', inclusionCriteria: ['Equal-weight cross-sport', 'Baseball representative'] },
  { cardId: 'ms-014', cardName: '2023 Panini Prizm #282', player: 'Victor Wembanyama', sport: 'basketball', weight: 6.25, currentValue: 42000, addedDate: '2024-01-01', inclusionCriteria: ['Equal-weight cross-sport', 'Basketball representative'] },
  { cardId: 'ms-015', cardName: '2023 Panini Prizm #301', player: 'C.J. Stroud', sport: 'football', weight: 6.25, currentValue: 25000, addedDate: '2024-01-01', inclusionCriteria: ['Equal-weight cross-sport', 'Football representative'] },
  { cardId: 'ms-016', cardName: '2024 Upper Deck #201', player: 'Connor Bedard', sport: 'hockey', weight: 6.25, currentValue: 21000, addedDate: '2024-06-01', inclusionCriteria: ['Equal-weight cross-sport', 'Hockey representative'] },
];

const vintageHeritageConstituents: IndexConstituent[] = [
  { cardId: 'vh-001', cardName: '1952 Topps #311', player: 'Mickey Mantle', sport: 'baseball', weight: 12.5, currentValue: 385000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'PSA registry eligible'] },
  { cardId: 'vh-002', cardName: '1933 Goudey #53', player: 'Babe Ruth', sport: 'baseball', weight: 11.2, currentValue: 215000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'Pre-war icon'] },
  { cardId: 'vh-003', cardName: '1951 Bowman #253', player: 'Willie Mays', sport: 'baseball', weight: 9.8, currentValue: 162000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'HOF rookie'] },
  { cardId: 'vh-004', cardName: '1955 Topps #164', player: 'Roberto Clemente', sport: 'baseball', weight: 8.4, currentValue: 110000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'Legend premium'] },
  { cardId: 'vh-005', cardName: '1948 Leaf #76', player: 'Joe DiMaggio', sport: 'baseball', weight: 7.2, currentValue: 102000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'Post-war classic'] },
  { cardId: 'vh-006', cardName: '1958 Topps #1', player: 'Ted Williams', sport: 'baseball', weight: 6.8, currentValue: 132000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'Golden age flagship'] },
  { cardId: 'vh-007', cardName: '1969 Topps #260', player: 'Reggie Jackson', sport: 'baseball', weight: 5.5, currentValue: 148000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'HOF rookie'] },
  { cardId: 'vh-008', cardName: '1979 O-Pee-Chee #18', player: 'Wayne Gretzky', sport: 'hockey', weight: 8.9, currentValue: 245000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'Hockey GOAT RC'] },
  { cardId: 'vh-009', cardName: '1957 Topps #17', player: 'Bob Cousy', sport: 'basketball', weight: 4.2, currentValue: 69000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'Pioneer era'] },
  { cardId: 'vh-010', cardName: '1966 Topps #132', player: 'Bobby Orr', sport: 'hockey', weight: 5.9, currentValue: 92000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'Defenseman GOAT'] },
  { cardId: 'vh-011', cardName: '1961 Fleer #8', player: 'Wilt Chamberlain', sport: 'basketball', weight: 5.1, currentValue: 95000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'Historical dominance'] },
  { cardId: 'vh-012', cardName: '1954 Topps #128', player: 'Hank Aaron', sport: 'baseball', weight: 7.6, currentValue: 148000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'Home run king RC'] },
  { cardId: 'vh-013', cardName: '1968 Topps #177', player: 'Nolan Ryan', sport: 'baseball', weight: 3.8, currentValue: 58000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'Strikeout king RC'] },
  { cardId: 'vh-014', cardName: '1972 Topps #595', player: 'Nolan Ryan', sport: 'baseball', weight: 1.6, currentValue: 24000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'High-number short print'] },
  { cardId: 'vh-015', cardName: '1971 Topps #160', player: 'Tom Seaver', sport: 'baseball', weight: 1.5, currentValue: 22000, addedDate: '2021-03-01', inclusionCriteria: ['Pre-1980 issue', 'Franchise pitcher'] },
];

const modernChromeConstituents: IndexConstituent[] = [
  { cardId: 'mc-001', cardName: '2003 Topps Chrome #221', player: 'LeBron James', sport: 'basketball', weight: 9.5, currentValue: 268000, addedDate: '2021-03-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'Market cap > $50k'] },
  { cardId: 'mc-002', cardName: '2018 Panini Prizm #280', player: 'Luka Doncic', sport: 'basketball', weight: 8.2, currentValue: 175000, addedDate: '2021-03-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'Market cap > $50k'] },
  { cardId: 'mc-003', cardName: '2017 Panini National Treasures #101', player: 'Patrick Mahomes', sport: 'football', weight: 7.8, currentValue: 188000, addedDate: '2021-03-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'Market cap > $50k'] },
  { cardId: 'mc-004', cardName: '1996 Topps Chrome #138', player: 'Kobe Bryant', sport: 'basketball', weight: 7.1, currentValue: 198000, addedDate: '2021-03-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'Legacy premium'] },
  { cardId: 'mc-005', cardName: '2021 Topps Chrome #27', player: 'Shohei Ohtani', sport: 'baseball', weight: 5.9, currentValue: 85000, addedDate: '2021-06-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'Two-way unicorn'] },
  { cardId: 'mc-006', cardName: '2009 Topps Chrome #TC48', player: 'Mike Trout', sport: 'baseball', weight: 5.2, currentValue: 125000, addedDate: '2021-03-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'Generational talent'] },
  { cardId: 'mc-007', cardName: '2020 Panini Prizm #278', player: 'Anthony Edwards', sport: 'basketball', weight: 4.8, currentValue: 45000, addedDate: '2022-01-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'Emerging star'] },
  { cardId: 'mc-008', cardName: '2019 Panini Prizm #248', player: 'Ja Morant', sport: 'basketball', weight: 3.5, currentValue: 32000, addedDate: '2021-06-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'Explosive guard archetype'] },
  { cardId: 'mc-009', cardName: '2000 Playoff Contenders #144', player: 'Tom Brady', sport: 'football', weight: 6.8, currentValue: 228000, addedDate: '2021-03-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'GOAT candidate'] },
  { cardId: 'mc-010', cardName: '2020 Panini Prizm #339', player: 'Justin Herbert', sport: 'football', weight: 3.8, currentValue: 55000, addedDate: '2021-06-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'Franchise QB premium'] },
  { cardId: 'mc-011', cardName: '2018 Topps Chrome Update #HMT25', player: 'Ronald Acuna Jr.', sport: 'baseball', weight: 3.2, currentValue: 38000, addedDate: '2021-06-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', '5-tool player'] },
  { cardId: 'mc-012', cardName: '2023 Topps Chrome #200', player: 'Victor Wembanyama', sport: 'basketball', weight: 4.5, currentValue: 42000, addedDate: '2024-01-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'Generational talent'] },
  { cardId: 'mc-013', cardName: '2015 Upper Deck #451', player: 'Connor McDavid', sport: 'hockey', weight: 3.1, currentValue: 42000, addedDate: '2021-06-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'Hockey generational'] },
  { cardId: 'mc-014', cardName: '2022 Panini Prizm #275', player: 'Paolo Banchero', sport: 'basketball', weight: 2.4, currentValue: 12800, addedDate: '2023-06-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'Number-1 pick'] },
  { cardId: 'mc-015', cardName: '2023 Panini Prizm #301', player: 'C.J. Stroud', sport: 'football', weight: 3.0, currentValue: 25000, addedDate: '2024-01-01', inclusionCriteria: ['Post-2000 Chrome/Prizm', 'OROY premium'] },
];

const goatConstituents: IndexConstituent[] = [
  { cardId: 'gt-001', cardName: '1986 Fleer #57', player: 'Michael Jordan', sport: 'basketball', weight: 11.5, currentValue: 295000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', '6x NBA champion'] },
  { cardId: 'gt-002', cardName: '1952 Topps #311', player: 'Mickey Mantle', sport: 'baseball', weight: 10.8, currentValue: 385000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', 'Triple Crown winner'] },
  { cardId: 'gt-003', cardName: '1933 Goudey #53', player: 'Babe Ruth', sport: 'baseball', weight: 9.2, currentValue: 215000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', 'Sultan of Swat'] },
  { cardId: 'gt-004', cardName: '2003 Topps Chrome #221', player: 'LeBron James', sport: 'basketball', weight: 9.8, currentValue: 268000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', '4x NBA champion'] },
  { cardId: 'gt-005', cardName: '1979 O-Pee-Chee #18', player: 'Wayne Gretzky', sport: 'hockey', weight: 8.5, currentValue: 245000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', 'The Great One'] },
  { cardId: 'gt-006', cardName: '2000 Playoff Contenders #144', player: 'Tom Brady', sport: 'football', weight: 8.1, currentValue: 228000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', '7x Super Bowl champion'] },
  { cardId: 'gt-007', cardName: '1996 Topps Chrome #138', player: 'Kobe Bryant', sport: 'basketball', weight: 7.4, currentValue: 198000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', 'Mamba Legacy'] },
  { cardId: 'gt-008', cardName: '1951 Bowman #253', player: 'Willie Mays', sport: 'baseball', weight: 6.8, currentValue: 162000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', 'Say Hey Kid'] },
  { cardId: 'gt-009', cardName: '1954 Topps #128', player: 'Hank Aaron', sport: 'baseball', weight: 6.2, currentValue: 148000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', 'Home run king'] },
  { cardId: 'gt-010', cardName: '1966 Topps #132', player: 'Bobby Orr', sport: 'hockey', weight: 4.5, currentValue: 92000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', 'Revolutionized defense'] },
  { cardId: 'gt-011', cardName: '2017 Panini National Treasures #101', player: 'Patrick Mahomes', sport: 'football', weight: 5.8, currentValue: 188000, addedDate: '2022-01-01', inclusionCriteria: ['Consensus GOAT candidate', 'Dynasty trajectory'] },
  { cardId: 'gt-012', cardName: '1955 Topps #164', player: 'Roberto Clemente', sport: 'baseball', weight: 4.8, currentValue: 110000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', '3000-hit club legend'] },
  { cardId: 'gt-013', cardName: '1961 Fleer #8', player: 'Wilt Chamberlain', sport: 'basketball', weight: 3.9, currentValue: 95000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', '100-point game'] },
  { cardId: 'gt-014', cardName: '1958 Topps #1', player: 'Ted Williams', sport: 'baseball', weight: 2.7, currentValue: 132000, addedDate: '2021-03-01', inclusionCriteria: ['Consensus GOAT', 'Last .400 hitter'] },
];

// ---- Rebalance History ----

function generateRebalanceHistory(indexId: string, seed: number): RebalanceEvent[] {
  const rng = seededRandom(seed);
  const events: RebalanceEvent[] = [];
  const dates = [
    '2021-06-01', '2021-09-01', '2021-12-01',
    '2022-03-01', '2022-06-01', '2022-09-01', '2022-12-01',
    '2023-03-01', '2023-06-01', '2023-09-01', '2023-12-01',
    '2024-03-01', '2024-06-01', '2024-09-01', '2024-12-01',
    '2025-03-01', '2025-06-01', '2025-09-01', '2025-12-01',
  ];

  const additionPool = [
    { cardId: 'add-001', reason: 'Market cap exceeded inclusion threshold after 35% quarterly appreciation' },
    { cardId: 'add-002', reason: 'Added following breakout rookie season — batting average .328 and 42 HR' },
    { cardId: 'add-003', reason: 'Card upgraded to PSA 10, crossing $50k value floor for index eligibility' },
    { cardId: 'add-004', reason: 'New IPO — first graded sale established market cap above minimum' },
    { cardId: 'add-005', reason: 'Replaced removed constituent with next-eligible card by market cap ranking' },
    { cardId: 'add-006', reason: 'Player earned MVP award, triggering fundamental inclusion criteria' },
  ];

  const removalPool = [
    { cardId: 'rem-001', reason: 'Market cap fell below minimum threshold for two consecutive quarters' },
    { cardId: 'rem-002', reason: 'Player career-ending injury reduced long-term HOF probability below 50%' },
    { cardId: 'rem-003', reason: 'Liquidity dried up — fewer than 5 sales in trailing 90 days' },
    { cardId: 'rem-004', reason: 'Grading controversy reduced authenticated population confidence' },
    { cardId: 'rem-005', reason: 'Card reclassified from rookie to prospect — fails RC-only filter' },
  ];

  for (const date of dates) {
    const numAdditions = rng() > 0.6 ? Math.floor(rng() * 2) + 1 : 0;
    const numRemovals = rng() > 0.6 ? Math.floor(rng() * 2) + 1 : 0;
    const numWeightChanges = Math.floor(rng() * 4) + 2;

    const additions = Array.from({ length: numAdditions }, () => {
      const pick = additionPool[Math.floor(rng() * additionPool.length)];
      return { cardId: `${indexId}-${pick.cardId}-${date}`, reason: pick.reason };
    });

    const removals = Array.from({ length: numRemovals }, () => {
      const pick = removalPool[Math.floor(rng() * removalPool.length)];
      return { cardId: `${indexId}-${pick.cardId}-${date}`, reason: pick.reason };
    });

    const weightChanges = Array.from({ length: numWeightChanges }, (_, i) => {
      const oldW = Math.round((rng() * 8 + 1) * 100) / 100;
      const delta = Math.round((rng() * 3 - 1.5) * 100) / 100;
      return {
        cardId: `${indexId}-wc-${i}-${date}`,
        oldWeight: oldW,
        newWeight: Math.round(Math.max(0.5, oldW + delta) * 100) / 100,
        reason: delta > 0 ? 'Increased weight due to market cap growth relative to index' : 'Decreased weight due to relative underperformance',
      };
    });

    events.push({
      date,
      additions,
      removals,
      weightChanges,
      turnover: Math.round((numAdditions + numRemovals + numWeightChanges * 0.3) / 25 * 100 * 100) / 100,
    });
  }

  return events;
}

// ---- Indices ----

const INDICES: CardIndex[] = [
  {
    id: 'blue-chip-25',
    name: 'Blue Chip 25',
    description: 'The top 25 highest-value sports cards by market capitalization, representing the most liquid and broadly held assets in the hobby. Designed as a core benchmark for serious collectors.',
    methodology: {
      objectives: 'Track the aggregate value of the 25 most valuable sports cards across all sports and eras, providing a reliable benchmark for overall market health.',
      universe: 'All professionally graded (PSA, BGS, SGC) sports cards with a minimum of 10 recorded sales in the trailing 12 months and a market cap above $50,000.',
      selectionCriteria: [
        'Ranked in the top 25 by trailing 6-month average market capitalization',
        'Minimum PSA 7 or equivalent grade',
        'At least 10 verified sales in the trailing 12 months',
        'Primary rookie or iconic issue only (no parallels or inserts)',
      ],
      weightingRules: [
        'Market-cap weighted: each card\'s weight is proportional to its market cap relative to total index value',
        'Single-card cap of 10% at each rebalance to prevent concentration',
        'Minimum weight of 1% to ensure meaningful representation',
      ],
      rebalancingRules: [
        'Full reconstitution quarterly on the first business day of March, June, September, and December',
        'Buffer rule: cards within 5 ranks of the inclusion boundary are retained to reduce unnecessary turnover',
        'Intra-quarter additions permitted only for cards exceeding 150% of the 25th-ranked card\'s market cap',
      ],
      exclusionCriteria: [
        'Cards with known authenticity disputes or pending PSA review',
        'Cards with fewer than 3 unique sellers in the trailing 90 days',
        'Trimmed, altered, or restored cards regardless of grade',
      ],
    },
    creator: 'MSI Research',
    inception: '2021-03-01',
    constituents: blueChipConstituents,
    totalValue: blueChipConstituents.reduce((sum, c) => sum + c.currentValue, 0),
    performance: {
      returns1M: 2.4,
      returns3M: 7.8,
      returns6M: 12.1,
      returns1Y: 18.6,
      returns3Y: 42.3,
      returns5Y: 0,
      returnsInception: 58.7,
      volatility: 14.2,
      sharpeRatio: 1.31,
      maxDrawdown: -18.4,
      alpha: 4.2,
      beta: 0.87,
      trackingError: 5.6,
      informationRatio: 0.75,
      timeSeries: generateTimeSeries(60, 10000, 12, 14, 42),
    },
    rebalanceFrequency: 'quarterly',
    weightingMethod: 'market-cap',
    lastRebalance: '2025-12-01',
    nextRebalance: '2026-03-01',
  },
  {
    id: 'rookie-growth-50',
    name: 'Rookie Growth 50',
    description: 'A growth-focused index tracking the top 50 rookie cards by price appreciation over the trailing 12 months. High beta, high reward — built for collectors who want exposure to emerging stars.',
    methodology: {
      objectives: 'Capture the fastest-appreciating rookie cards in the hobby, providing outsized returns during bull markets while accepting higher volatility.',
      universe: 'All professionally graded rookie cards issued within the last 5 years with a minimum market price of $500.',
      selectionCriteria: [
        'Top 50 rookie cards ranked by trailing 12-month price appreciation',
        'Minimum 5 recorded sales in the trailing 90 days',
        'Card must be a recognized rookie card (not prospect or pre-rookie)',
        'Player must have appeared in at least 1 professional regular-season game',
      ],
      weightingRules: [
        'Fundamental weighted: weight based on a composite score of appreciation rate (40%), sales volume (30%), and player performance metrics (30%)',
        'Single-card cap of 5% to maintain diversification across the 50 constituents',
        'Sport-level cap of 35% to prevent single-sport dominance',
      ],
      rebalancingRules: [
        'Monthly reconstitution on the last business day of each month',
        'Aggressive turnover accepted — target 15-25% monthly turnover to capture momentum',
        'Fast-track additions for cards appreciating more than 50% in any 30-day period',
      ],
      exclusionCriteria: [
        'Players currently on injured reserve or disabled list for more than 60 days',
        'Cards with suspected wash trading or manipulated sales data',
        'Refractor or numbered parallels (base chrome/prizm only)',
      ],
    },
    creator: 'MSI Research',
    inception: '2021-03-01',
    constituents: rookieGrowthConstituents,
    totalValue: rookieGrowthConstituents.reduce((sum, c) => sum + c.currentValue, 0),
    performance: {
      returns1M: 4.8,
      returns3M: 14.2,
      returns6M: 22.6,
      returns1Y: 35.8,
      returns3Y: 68.4,
      returns5Y: 0,
      returnsInception: 112.3,
      volatility: 28.6,
      sharpeRatio: 1.24,
      maxDrawdown: -34.2,
      alpha: 8.6,
      beta: 1.52,
      trackingError: 12.4,
      informationRatio: 0.69,
      timeSeries: generateTimeSeries(60, 10000, 20, 28, 137),
    },
    rebalanceFrequency: 'monthly',
    weightingMethod: 'fundamental',
    lastRebalance: '2026-02-28',
    nextRebalance: '2026-03-31',
  },
  {
    id: 'multi-sport-balanced',
    name: 'Multi-Sport Balanced',
    description: 'An equal-weight index spanning baseball, basketball, football, and hockey — 4 cards per sport per quarter. Built for collectors who want diversified, low-correlation exposure across the hobby.',
    methodology: {
      objectives: 'Provide balanced exposure across all four major North American sports, minimizing single-sport risk while capturing broad hobby market trends.',
      universe: 'Top-100 cards by market cap in each of baseball, basketball, football, and hockey.',
      selectionCriteria: [
        'Top 4 cards per sport by 6-month average market cap',
        'Minimum $10,000 market value to ensure liquidity',
        'One card per player maximum to prevent player-concentration risk',
        'Must be a recognized RC, flagship, or iconic issue',
      ],
      weightingRules: [
        'Strict equal-weight: 6.25% per card (16 cards x 6.25% = 100%)',
        'Rebalanced to equal weight at each quarterly reconstitution',
        'No intra-quarter drift adjustment — weights float between rebalances',
      ],
      rebalancingRules: [
        'Quarterly reconstitution on the first business day of each quarter',
        'Sports with fewer than 4 qualifying cards receive a proportional allocation to the remaining sports',
        'Maximum turnover target of 25% per quarter',
      ],
      exclusionCriteria: [
        'Cards from sports with fewer than 2 qualifying constituents',
        'Duplicate player exposure across different card issues',
        'Cards with less than $5,000 in trailing 90-day transaction volume',
      ],
    },
    creator: 'MSI Research',
    inception: '2021-06-01',
    constituents: multiSportConstituents,
    totalValue: multiSportConstituents.reduce((sum, c) => sum + c.currentValue, 0),
    performance: {
      returns1M: 1.8,
      returns3M: 5.4,
      returns6M: 9.2,
      returns1Y: 14.1,
      returns3Y: 32.8,
      returns5Y: 0,
      returnsInception: 41.5,
      volatility: 11.8,
      sharpeRatio: 1.19,
      maxDrawdown: -14.6,
      alpha: 2.8,
      beta: 0.72,
      trackingError: 4.2,
      informationRatio: 0.67,
      timeSeries: generateTimeSeries(57, 10000, 9, 12, 288),
    },
    rebalanceFrequency: 'quarterly',
    weightingMethod: 'equal',
    lastRebalance: '2026-01-02',
    nextRebalance: '2026-04-01',
  },
  {
    id: 'vintage-heritage',
    name: 'Vintage Heritage',
    description: 'A curated index of pre-1980 cards that have defined the hobby for generations. Low volatility, steady appreciation, and deep historical significance — the fixed-income equivalent of card investing.',
    methodology: {
      objectives: 'Preserve and grow capital through exposure to historically significant pre-1980 sports cards with proven long-term appreciation and cultural permanence.',
      universe: 'All professionally graded sports cards issued before January 1, 1980, with a minimum PSA 5 or equivalent grade.',
      selectionCriteria: [
        'Issued before January 1, 1980',
        'Minimum PSA 5 or equivalent grade',
        'Player must be inducted into a major sports Hall of Fame or be consensus top-50 all-time',
        'Card must be the player\'s recognized primary rookie or iconic issue',
      ],
      weightingRules: [
        'Market-cap weighted with a 15% single-card cap',
        'Era diversification: minimum 20% pre-1960 and minimum 20% 1960-1979',
        'Cross-sport: at least 2 sports represented at all times',
      ],
      rebalancingRules: [
        'Annual reconstitution on January 2 of each year',
        'Minimal turnover expected given the stable nature of vintage card markets',
        'Intra-year additions only for newly graded cards that immediately rank in the top 15',
      ],
      exclusionCriteria: [
        'Cards with known trimming or restoration regardless of encapsulation',
        'Cards from manufacturers with known quality-control issues in the specific year',
        'Reprints, reissues, or tribute cards',
      ],
    },
    creator: 'MSI Research',
    inception: '2021-03-01',
    constituents: vintageHeritageConstituents,
    totalValue: vintageHeritageConstituents.reduce((sum, c) => sum + c.currentValue, 0),
    performance: {
      returns1M: 0.8,
      returns3M: 2.9,
      returns6M: 5.4,
      returns1Y: 9.8,
      returns3Y: 28.6,
      returns5Y: 0,
      returnsInception: 36.2,
      volatility: 8.4,
      sharpeRatio: 1.17,
      maxDrawdown: -9.8,
      alpha: 1.9,
      beta: 0.45,
      trackingError: 3.8,
      informationRatio: 0.50,
      timeSeries: generateTimeSeries(60, 10000, 7, 8, 555),
    },
    rebalanceFrequency: 'annually',
    weightingMethod: 'market-cap',
    lastRebalance: '2026-01-02',
    nextRebalance: '2027-01-04',
  },
  {
    id: 'modern-chrome',
    name: 'Modern Chrome',
    description: 'Focused on post-2000 chrome and Prizm-era cards that dominate modern collecting. High liquidity, strong auction volume, and correlated with current player performance — the NASDAQ of card indices.',
    methodology: {
      objectives: 'Track the performance of the most actively traded modern chromium-based cards, providing real-time insight into the health of the contemporary card market.',
      universe: 'All Topps Chrome, Bowman Chrome, Panini Prizm, Panini Select, and Optic cards issued from 2000 onward.',
      selectionCriteria: [
        'Must be a base Chrome, Prizm, Select, or Optic rookie card',
        'Minimum 20 sales in the trailing 90 days',
        'Market cap above $10,000',
        'Player must be currently active or retired within the last 5 years',
      ],
      weightingRules: [
        'Market-cap weighted with a float adjustment for cards with large portions held by long-term collectors',
        'Single-card cap of 12% and sport cap of 40%',
        'Minimum weight floor of 1.5% per constituent',
      ],
      rebalancingRules: [
        'Monthly reconstitution aligned with the release of new PSA population data',
        'Fast-track removal for cards dropping below $5,000 market cap',
        'Momentum-based additions: cards entering the top 15 by trailing 30-day volume are fast-tracked',
      ],
      exclusionCriteria: [
        'Numbered parallels, refractors, and autograph versions',
        'Cards from unlicensed or grey-market products',
        'Players currently suspended by their league',
      ],
    },
    creator: 'MSI Research',
    inception: '2021-03-01',
    constituents: modernChromeConstituents,
    totalValue: modernChromeConstituents.reduce((sum, c) => sum + c.currentValue, 0),
    performance: {
      returns1M: 3.6,
      returns3M: 10.8,
      returns6M: 16.4,
      returns1Y: 26.2,
      returns3Y: 54.8,
      returns5Y: 0,
      returnsInception: 78.4,
      volatility: 22.4,
      sharpeRatio: 1.17,
      maxDrawdown: -26.8,
      alpha: 6.4,
      beta: 1.28,
      trackingError: 9.8,
      informationRatio: 0.65,
      timeSeries: generateTimeSeries(60, 10000, 16, 22, 777),
    },
    rebalanceFrequency: 'monthly',
    weightingMethod: 'market-cap',
    lastRebalance: '2026-02-28',
    nextRebalance: '2026-03-31',
  },
  {
    id: 'goat-index',
    name: 'The GOAT Index',
    description: 'Cards of the consensus greatest players across every major sport. A concentrated, conviction-weighted portfolio of cards that will never go out of style. The ultimate "buy and hold forever" index.',
    methodology: {
      objectives: 'Own the definitive cards of the greatest athletes in sports history, providing the most resilient and culturally permanent exposure to the hobby.',
      universe: 'Cards of players who are consensus top-5 all-time in their respective sport, as determined by a panel of sports historians and the MSI Advisory Board.',
      selectionCriteria: [
        'Player must be consensus top-5 all-time in at least one major sport',
        'Card must be the player\'s most iconic or most valuable recognized issue',
        'Minimum PSA 6 or equivalent grade for vintage (pre-1980) or PSA 8 for modern',
        'At least 3 recorded sales in the trailing 12 months',
      ],
      weightingRules: [
        'Conviction-weighted by the MSI GOAT Composite Score (50% cultural impact, 30% statistical dominance, 20% market demand)',
        'Single-card cap of 12% and single-sport cap of 35%',
        'Minimum 3 sports represented at all times',
      ],
      rebalancingRules: [
        'Annual reconstitution — GOAT status rarely changes',
        'Intra-year substitution only if a card is delisted from PSA or if a new consensus GOAT emerges',
        'Weight adjustments permitted semi-annually based on updated GOAT Composite Scores',
      ],
      exclusionCriteria: [
        'Players with significant off-field controversies affecting long-term legacy consensus',
        'Cards with population above 10,000 in PSA 9+ (to maintain scarcity premium)',
        'Tribute, memorial, or posthumous issues',
      ],
    },
    creator: 'MSI Research',
    inception: '2021-03-01',
    constituents: goatConstituents,
    totalValue: goatConstituents.reduce((sum, c) => sum + c.currentValue, 0),
    performance: {
      returns1M: 1.6,
      returns3M: 4.8,
      returns6M: 8.6,
      returns1Y: 14.8,
      returns3Y: 38.2,
      returns5Y: 0,
      returnsInception: 48.6,
      volatility: 10.6,
      sharpeRatio: 1.40,
      maxDrawdown: -12.2,
      alpha: 3.8,
      beta: 0.62,
      trackingError: 4.8,
      informationRatio: 0.79,
      timeSeries: generateTimeSeries(60, 10000, 10, 11, 999),
    },
    rebalanceFrequency: 'annually',
    weightingMethod: 'custom',
    lastRebalance: '2026-01-02',
    nextRebalance: '2027-01-04',
  },
];

// ---- Backtest Data ----

const BACKTEST_RESULTS: Record<string, BacktestResult> = {
  'blue-chip-25': {
    indexId: 'blue-chip-25',
    period: '2021-03 to 2026-03',
    returns: 58.7,
    volatility: 14.2,
    drawdowns: [
      { start: '2022-01-15', end: '2022-06-20', depth: -18.4 },
      { start: '2023-03-01', end: '2023-05-15', depth: -11.2 },
      { start: '2024-08-01', end: '2024-10-10', depth: -8.6 },
    ],
    monthlyReturns: generateMonthlyReturns(42, 12, 14),
  },
  'rookie-growth-50': {
    indexId: 'rookie-growth-50',
    period: '2021-03 to 2026-03',
    returns: 112.3,
    volatility: 28.6,
    drawdowns: [
      { start: '2021-11-01', end: '2022-04-15', depth: -34.2 },
      { start: '2022-08-15', end: '2022-12-01', depth: -28.6 },
      { start: '2023-06-01', end: '2023-09-30', depth: -19.4 },
      { start: '2024-03-15', end: '2024-06-01', depth: -15.8 },
    ],
    monthlyReturns: generateMonthlyReturns(137, 20, 28),
  },
  'multi-sport-balanced': {
    indexId: 'multi-sport-balanced',
    period: '2021-06 to 2026-03',
    returns: 41.5,
    volatility: 11.8,
    drawdowns: [
      { start: '2022-02-01', end: '2022-05-15', depth: -14.6 },
      { start: '2023-04-01', end: '2023-06-15', depth: -9.2 },
      { start: '2025-01-15', end: '2025-03-01', depth: -6.8 },
    ],
    monthlyReturns: generateMonthlyReturns(288, 9, 12),
  },
  'vintage-heritage': {
    indexId: 'vintage-heritage',
    period: '2021-03 to 2026-03',
    returns: 36.2,
    volatility: 8.4,
    drawdowns: [
      { start: '2022-03-01', end: '2022-06-01', depth: -9.8 },
      { start: '2023-09-01', end: '2023-11-15', depth: -5.4 },
    ],
    monthlyReturns: generateMonthlyReturns(555, 7, 8),
  },
  'modern-chrome': {
    indexId: 'modern-chrome',
    period: '2021-03 to 2026-03',
    returns: 78.4,
    volatility: 22.4,
    drawdowns: [
      { start: '2021-12-01', end: '2022-05-15', depth: -26.8 },
      { start: '2022-09-01', end: '2023-01-15', depth: -22.4 },
      { start: '2024-02-01', end: '2024-05-01', depth: -14.2 },
    ],
    monthlyReturns: generateMonthlyReturns(777, 16, 22),
  },
  'goat-index': {
    indexId: 'goat-index',
    period: '2021-03 to 2026-03',
    returns: 48.6,
    volatility: 10.6,
    drawdowns: [
      { start: '2022-02-01', end: '2022-05-01', depth: -12.2 },
      { start: '2023-07-01', end: '2023-09-15', depth: -7.8 },
    ],
    monthlyReturns: generateMonthlyReturns(999, 10, 11),
  },
};

// ---- Rebalance Histories (cached) ----

const REBALANCE_HISTORIES: Record<string, RebalanceEvent[]> = {
  'blue-chip-25': generateRebalanceHistory('bc', 100),
  'rookie-growth-50': generateRebalanceHistory('rg', 200),
  'multi-sport-balanced': generateRebalanceHistory('ms', 300),
  'vintage-heritage': generateRebalanceHistory('vh', 400),
  'modern-chrome': generateRebalanceHistory('mc', 500),
  'goat-index': generateRebalanceHistory('gt', 600),
};

// ---- Public API ----

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getIndices(): Promise<CardIndex[]> {
  await delay(180);
  return INDICES;
}

export async function getIndexDetail(id: string): Promise<CardIndex | null> {
  await delay(120);
  return INDICES.find((idx) => idx.id === id) ?? null;
}

export async function getIndexPerformance(
  id: string,
  period: '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'MAX',
): Promise<IndexPerformance | null> {
  await delay(100);
  const idx = INDICES.find((i) => i.id === id);
  if (!idx) return null;
  const monthsMap: Record<string, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '3Y': 36, '5Y': 60, MAX: 999 };
  const months = monthsMap[period] ?? 60;
  const trimmed = idx.performance.timeSeries.slice(-months - 1);
  return { ...idx.performance, timeSeries: trimmed };
}

export async function getRebalanceHistory(id: string): Promise<RebalanceEvent[]> {
  await delay(140);
  return REBALANCE_HISTORIES[id] ?? [];
}

export async function compareIndices(ids: string[]): Promise<IndexComparison> {
  await delay(200);
  const selected = INDICES.filter((i) => ids.includes(i.id));
  const n = selected.length;

  // Build correlation matrix (mock but realistic)
  const corrSeeds: Record<string, Record<string, number>> = {
    'blue-chip-25': { 'blue-chip-25': 1.0, 'rookie-growth-50': 0.72, 'multi-sport-balanced': 0.85, 'vintage-heritage': 0.58, 'modern-chrome': 0.81, 'goat-index': 0.76 },
    'rookie-growth-50': { 'blue-chip-25': 0.72, 'rookie-growth-50': 1.0, 'multi-sport-balanced': 0.64, 'vintage-heritage': 0.31, 'modern-chrome': 0.88, 'goat-index': 0.52 },
    'multi-sport-balanced': { 'blue-chip-25': 0.85, 'rookie-growth-50': 0.64, 'multi-sport-balanced': 1.0, 'vintage-heritage': 0.68, 'modern-chrome': 0.74, 'goat-index': 0.82 },
    'vintage-heritage': { 'blue-chip-25': 0.58, 'rookie-growth-50': 0.31, 'multi-sport-balanced': 0.68, 'vintage-heritage': 1.0, 'modern-chrome': 0.29, 'goat-index': 0.71 },
    'modern-chrome': { 'blue-chip-25': 0.81, 'rookie-growth-50': 0.88, 'multi-sport-balanced': 0.74, 'vintage-heritage': 0.29, 'modern-chrome': 1.0, 'goat-index': 0.62 },
    'goat-index': { 'blue-chip-25': 0.76, 'rookie-growth-50': 0.52, 'multi-sport-balanced': 0.82, 'vintage-heritage': 0.71, 'modern-chrome': 0.62, 'goat-index': 1.0 },
  };

  const correlationMatrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      row.push(corrSeeds[selected[i].id]?.[selected[j].id] ?? 0);
    }
    correlationMatrix.push(row);
  }

  // Performance overlay — align all time series to same dates
  const maxLen = Math.max(...selected.map((s) => s.performance.timeSeries.length));
  const performanceOverlay: { date: string; values: number[] }[] = [];
  const baseSeries = selected.reduce((longest, s) =>
    s.performance.timeSeries.length > longest.performance.timeSeries.length ? s : longest,
  ).performance.timeSeries;

  for (let i = 0; i < baseSeries.length; i++) {
    const values = selected.map((s) => {
      const ts = s.performance.timeSeries;
      const idx = Math.min(i, ts.length - 1);
      return ts[idx]?.value ?? 10000;
    });
    performanceOverlay.push({ date: baseSeries[i].date, values });
  }

  return {
    indices: ids,
    correlationMatrix,
    performanceOverlay,
  };
}

export async function backtestIndex(
  methodologyOrId: string,
  _period?: string,
): Promise<BacktestResult | null> {
  await delay(250);
  return BACKTEST_RESULTS[methodologyOrId] ?? null;
}

export async function getIndexConstituents(id: string): Promise<IndexConstituent[]> {
  await delay(100);
  const idx = INDICES.find((i) => i.id === id);
  return idx?.constituents ?? [];
}

export async function createCustomIndex(methodology: IndexMethodology): Promise<CardIndex> {
  await delay(300);
  const customId = `custom-${Date.now()}`;
  const constituents = blueChipConstituents.slice(0, 10).map((c, i) => ({
    ...c,
    cardId: `${customId}-${i}`,
    weight: 10,
    addedDate: new Date().toISOString().slice(0, 10),
    inclusionCriteria: methodology.selectionCriteria.slice(0, 2),
  }));

  return {
    id: customId,
    name: 'Custom Index',
    description: methodology.objectives,
    methodology,
    creator: 'You',
    inception: new Date().toISOString().slice(0, 10),
    constituents,
    totalValue: constituents.reduce((s, c) => s + c.currentValue, 0),
    performance: {
      returns1M: 0,
      returns3M: 0,
      returns6M: 0,
      returns1Y: 0,
      returns3Y: 0,
      returns5Y: 0,
      returnsInception: 0,
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      alpha: 0,
      beta: 1,
      trackingError: 0,
      informationRatio: 0,
      timeSeries: generateTimeSeries(12, 10000, 10, 15, Date.now()),
    },
    rebalanceFrequency: 'quarterly',
    weightingMethod: 'equal',
    lastRebalance: new Date().toISOString().slice(0, 10),
    nextRebalance: '2026-06-01',
  };
}

export async function getIndexMethodology(id: string): Promise<IndexMethodology | null> {
  await delay(80);
  const idx = INDICES.find((i) => i.id === id);
  return idx?.methodology ?? null;
}
