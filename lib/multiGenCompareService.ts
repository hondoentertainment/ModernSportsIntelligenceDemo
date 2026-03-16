// ── Types ────────────────────────────────────────────────────────────────────────

export interface LegendPlayer {
  id: string;
  name: string;
  sport: 'Basketball' | 'Football' | 'Baseball' | 'Hockey';
  position: string;
  draftYear: number;
  draftPick: number;
  era: 'Vintage' | 'Junk-Wax' | 'Modern' | 'Ultra-Modern';
  careerStart: number;
  careerEnd: number | null; // null = still active
  peakYearStart: number;
  peakYearEnd: number;
  careerStats: Record<string, number | string>;
  accolades: string[];
  keyCard: EraCard;
  allTimeRank: number; // subjective 1-100 GOAT ranking within sport
}

export interface EraCard {
  id: string;
  playerId: string;
  set: string;
  year: number;
  cardNumber: string;
  grade: string; // e.g. "PSA 10", "BGS 9.5"
  population: number;
  releasePrice: number;
  peakValue: number;
  peakYear: number;
  currentValue: number;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  year: number;
  value: number;
  event?: string; // optional note about why price moved
}

export interface NormalizedMetric {
  careerYear: number; // 1 = rookie year, 2 = sophomore, etc.
  playerId: string;
  playerName: string;
  cardValue: number;
  cardValueNormalized: number;  // 0-100 scale relative to player peak
  performanceIndex: number;     // 0-100 composite stat index
  marketSentiment: number;      // 0-100
  inflationFactor: number;      // CPI multiplier from that year
}

export interface HoldingPeriodReturn {
  playerId: string;
  playerName: string;
  holdingYears: number;
  nominalReturn: number;        // percentage
  annualizedReturn: number;     // CAGR percentage
  inflationAdjustedReturn: number;
  startValue: number;
  endValue: number;
  peakDrawdown: number;         // max % loss from peak during period
}

export interface InflationAdjustedValue {
  year: number;
  playerId: string;
  playerName: string;
  nominalValue: number;
  realValue: number;            // adjusted to present-day dollars
  cpiIndex: number;
  cumulativeInflation: number;  // percentage since card release
}

export interface ComparisonResult {
  players: LegendPlayer[];
  normalizedMetrics: NormalizedMetric[];
  holdingPeriodReturns: HoldingPeriodReturn[];
  inflationAdjusted: InflationAdjustedValue[];
  careerOverlay: NormalizedMetric[];
  rankings: PlayerRanking[];
}

export interface PlayerRanking {
  playerId: string;
  playerName: string;
  sport: string;
  era: string;
  totalROI: number;
  annualizedROI: number;
  peakMultiple: number;       // peak value / release price
  currentMultiple: number;    // current value / release price
  sharpeRatio: number;        // return / volatility proxy
  maxDrawdown: number;
  holdingScore: number;       // composite 0-100
  rank: number;
}

// ── CPI Data (US CPI-U, base 1982-84 = 100) ─────────────────────────────────────

const CPI_BY_YEAR: Record<number, number> = {
  1948: 24.1, 1950: 24.1, 1952: 26.5, 1955: 26.8, 1958: 28.9,
  1960: 29.6, 1965: 31.5, 1970: 38.8, 1975: 53.8, 1980: 82.4,
  1982: 96.5, 1984: 103.9, 1986: 109.6, 1988: 118.3, 1990: 130.7,
  1991: 136.2, 1992: 140.3, 1993: 144.5, 1994: 148.2, 1995: 152.4,
  1996: 156.9, 1997: 160.5, 1998: 163.0, 1999: 166.6, 2000: 172.2,
  2001: 177.1, 2002: 179.9, 2003: 184.0, 2004: 188.9, 2005: 195.3,
  2006: 201.6, 2007: 207.3, 2008: 215.3, 2009: 214.5, 2010: 218.1,
  2011: 224.9, 2012: 229.6, 2013: 233.0, 2014: 236.7, 2015: 237.0,
  2016: 240.0, 2017: 245.1, 2018: 251.1, 2019: 255.7, 2020: 258.8,
  2021: 271.0, 2022: 292.7, 2023: 304.7, 2024: 313.0, 2025: 319.5,
  2026: 325.0,
};

function getCPI(year: number): number {
  if (CPI_BY_YEAR[year]) return CPI_BY_YEAR[year];
  const years = Object.keys(CPI_BY_YEAR).map(Number).sort((a, b) => a - b);
  // Linear interpolation for missing years
  for (let i = 0; i < years.length - 1; i++) {
    if (year > years[i] && year < years[i + 1]) {
      const ratio = (year - years[i]) / (years[i + 1] - years[i]);
      return CPI_BY_YEAR[years[i]] + ratio * (CPI_BY_YEAR[years[i + 1]] - CPI_BY_YEAR[years[i]]);
    }
  }
  return CPI_BY_YEAR[years[years.length - 1]];
}

function inflationMultiplier(fromYear: number, toYear: number): number {
  return getCPI(toYear) / getCPI(fromYear);
}

// ── Mock Legend Players ──────────────────────────────────────────────────────────

const LEGEND_PLAYERS: LegendPlayer[] = [
  {
    id: 'mj-23',
    name: 'Michael Jordan',
    sport: 'Basketball',
    position: 'SG',
    draftYear: 1984,
    draftPick: 3,
    era: 'Junk-Wax',
    careerStart: 1984,
    careerEnd: 2003,
    peakYearStart: 1991,
    peakYearEnd: 1998,
    careerStats: { ppg: 30.1, rpg: 6.2, apg: 5.3, championships: 6, mvps: 5 },
    accolades: ['6x Champion', '5x MVP', '10x Scoring Champ', '14x All-Star'],
    allTimeRank: 1,
    keyCard: {
      id: 'mj-fleer86', playerId: 'mj-23', set: '1986-87 Fleer', year: 1986,
      cardNumber: '#57', grade: 'PSA 10', population: 316,
      releasePrice: 0.5, peakValue: 738000, peakYear: 2021, currentValue: 420000,
      priceHistory: [
        { year: 1986, value: 0.5, event: 'Pack release' },
        { year: 1990, value: 200, event: 'Early career rise' },
        { year: 1993, value: 3500, event: 'First three-peat' },
        { year: 1996, value: 4200, event: '72-win season' },
        { year: 1998, value: 6500, event: 'Last Dance' },
        { year: 2003, value: 8500, event: 'Retirement' },
        { year: 2008, value: 18000, event: 'Vintage card boom starts' },
        { year: 2013, value: 32000, event: 'Graded card appreciation' },
        { year: 2016, value: 55000, event: 'Market steady climb' },
        { year: 2019, value: 95000, event: 'Pre-pandemic growth' },
        { year: 2020, value: 280000, event: 'The Last Dance documentary' },
        { year: 2021, value: 738000, event: 'Pandemic peak' },
        { year: 2023, value: 480000, event: 'Market correction' },
        { year: 2025, value: 420000, event: 'Stabilization' },
      ],
    },
  },
  {
    id: 'lbj-23',
    name: 'LeBron James',
    sport: 'Basketball',
    position: 'SF',
    draftYear: 2003,
    draftPick: 1,
    era: 'Modern',
    careerStart: 2003,
    careerEnd: null,
    peakYearStart: 2009,
    peakYearEnd: 2020,
    careerStats: { ppg: 27.1, rpg: 7.5, apg: 7.4, championships: 4, mvps: 4 },
    accolades: ['4x Champion', '4x MVP', 'All-Time Scoring Leader', '20x All-Star'],
    allTimeRank: 2,
    keyCard: {
      id: 'lbj-topps03', playerId: 'lbj-23', set: '2003-04 Topps Chrome', year: 2003,
      cardNumber: '#111', grade: 'PSA 10', population: 1485,
      releasePrice: 15, peakValue: 230000, peakYear: 2021, currentValue: 52000,
      priceHistory: [
        { year: 2003, value: 15, event: 'Release' },
        { year: 2005, value: 350, event: 'Rookie hype' },
        { year: 2008, value: 800, event: 'First MVP buzz' },
        { year: 2010, value: 1200, event: 'The Decision era' },
        { year: 2013, value: 3500, event: 'Miami championships' },
        { year: 2016, value: 6000, event: 'Cleveland title' },
        { year: 2018, value: 18000, event: 'LA Lakers move' },
        { year: 2019, value: 25000, event: 'Market acceleration' },
        { year: 2020, value: 85000, event: 'Bubble championship' },
        { year: 2021, value: 230000, event: 'Market mania peak' },
        { year: 2022, value: 110000, event: 'Correction' },
        { year: 2023, value: 62000, event: 'Scoring record' },
        { year: 2025, value: 52000, event: 'Career winding down' },
      ],
    },
  },
  {
    id: 'luka-77',
    name: 'Luka Doncic',
    sport: 'Basketball',
    position: 'PG/SG',
    draftYear: 2018,
    draftPick: 3,
    era: 'Ultra-Modern',
    careerStart: 2018,
    careerEnd: null,
    peakYearStart: 2022,
    peakYearEnd: 2026,
    careerStats: { ppg: 28.7, rpg: 8.5, apg: 8.3, championships: 0, mvps: 0 },
    accolades: ['ROY', '5x All-Star', '4x All-NBA First Team'],
    allTimeRank: 35,
    keyCard: {
      id: 'luka-prizm18', playerId: 'luka-77', set: '2018-19 Prizm', year: 2018,
      cardNumber: '#280', grade: 'PSA 10', population: 4295,
      releasePrice: 60, peakValue: 4600, peakYear: 2021, currentValue: 1800,
      priceHistory: [
        { year: 2018, value: 60, event: 'Release' },
        { year: 2019, value: 350, event: 'ROY season' },
        { year: 2020, value: 1800, event: 'All-Star breakout' },
        { year: 2021, value: 4600, event: 'Market peak' },
        { year: 2022, value: 2400, event: 'Correction' },
        { year: 2023, value: 1500, event: 'Playoff run' },
        { year: 2024, value: 2200, event: 'Finals appearance' },
        { year: 2025, value: 1800, event: 'Stabilized' },
      ],
    },
  },
  {
    id: 'gretzky-99',
    name: 'Wayne Gretzky',
    sport: 'Hockey',
    position: 'C',
    draftYear: 1979,
    draftPick: 0,
    era: 'Vintage',
    careerStart: 1979,
    careerEnd: 1999,
    peakYearStart: 1981,
    peakYearEnd: 1989,
    careerStats: { goals: 894, assists: 1963, points: 2857, championships: 4, mvps: 9 },
    accolades: ['4x Stanley Cup', '9x Hart Trophy', 'All-Time Points Leader'],
    allTimeRank: 1,
    keyCard: {
      id: 'gretzky-opc79', playerId: 'gretzky-99', set: '1979-80 O-Pee-Chee', year: 1979,
      cardNumber: '#18', grade: 'PSA 10', population: 2,
      releasePrice: 0.1, peakValue: 3750000, peakYear: 2021, currentValue: 2100000,
      priceHistory: [
        { year: 1979, value: 0.1, event: 'Release' },
        { year: 1985, value: 60, event: 'Dynasty years' },
        { year: 1990, value: 500, event: 'Card boom era' },
        { year: 1995, value: 2000, event: 'Post-boom correction' },
        { year: 1999, value: 15000, event: 'Retirement tribute' },
        { year: 2005, value: 60000, event: 'Graded card market matures' },
        { year: 2010, value: 95000, event: 'Steady appreciation' },
        { year: 2015, value: 250000, event: 'Trophy card status' },
        { year: 2019, value: 465000, event: 'Record sale era' },
        { year: 2020, value: 1290000, event: 'Pandemic boom' },
        { year: 2021, value: 3750000, event: 'All-time high' },
        { year: 2023, value: 2400000, event: 'Market adjustment' },
        { year: 2025, value: 2100000, event: 'Stabilized' },
      ],
    },
  },
  {
    id: 'brady-12',
    name: 'Tom Brady',
    sport: 'Football',
    position: 'QB',
    draftYear: 2000,
    draftPick: 199,
    era: 'Modern',
    careerStart: 2000,
    careerEnd: 2023,
    peakYearStart: 2001,
    peakYearEnd: 2021,
    careerStats: { passingYards: 89214, touchdowns: 649, championships: 7, mvps: 3 },
    accolades: ['7x Super Bowl Champion', '3x MVP', '15x Pro Bowl', 'GOAT QB'],
    allTimeRank: 1,
    keyCard: {
      id: 'brady-bowman00', playerId: 'brady-12', set: '2000 Bowman Chrome', year: 2000,
      cardNumber: '#236', grade: 'PSA 10', population: 183,
      releasePrice: 2, peakValue: 555000, peakYear: 2021, currentValue: 175000,
      priceHistory: [
        { year: 2000, value: 2, event: 'Release as late pick' },
        { year: 2002, value: 150, event: 'First Super Bowl win' },
        { year: 2005, value: 600, event: 'Three-peat dynasty' },
        { year: 2008, value: 1200, event: 'Undefeated season run' },
        { year: 2012, value: 2500, event: 'Continued excellence' },
        { year: 2015, value: 4000, event: 'Deflategate notoriety' },
        { year: 2017, value: 12000, event: '28-3 comeback' },
        { year: 2019, value: 25000, event: '6th ring' },
        { year: 2020, value: 120000, event: 'Tampa move + 7th ring' },
        { year: 2021, value: 555000, event: 'GOAT premium peak' },
        { year: 2023, value: 200000, event: 'Retirement' },
        { year: 2025, value: 175000, event: 'Legacy card stabilized' },
      ],
    },
  },
  {
    id: 'trout-27',
    name: 'Mike Trout',
    sport: 'Baseball',
    position: 'CF',
    draftYear: 2009,
    draftPick: 25,
    era: 'Modern',
    careerStart: 2011,
    careerEnd: null,
    peakYearStart: 2012,
    peakYearEnd: 2019,
    careerStats: { avg: '.301', hr: 378, rbi: 940, championships: 0, mvps: 3 },
    accolades: ['3x MVP', 'ROY', '11x All-Star', 'Best Player Never in Playoffs Meme'],
    allTimeRank: 20,
    keyCard: {
      id: 'trout-update11', playerId: 'trout-27', set: '2011 Topps Update', year: 2011,
      cardNumber: '#US175', grade: 'PSA 10', population: 3109,
      releasePrice: 3, peakValue: 3936000, peakYear: 2020, currentValue: 350000,
      priceHistory: [
        { year: 2011, value: 3, event: 'Release' },
        { year: 2013, value: 400, event: 'Back-to-back brilliance' },
        { year: 2015, value: 1200, event: 'MVP dominance' },
        { year: 2017, value: 5000, event: 'Generational talent buzz' },
        { year: 2019, value: 45000, event: '3rd MVP' },
        { year: 2020, value: 3936000, event: 'Record card sale' },
        { year: 2021, value: 1200000, event: 'Injury concerns begin' },
        { year: 2022, value: 700000, event: 'Extended absences' },
        { year: 2023, value: 400000, event: 'Decline phase' },
        { year: 2025, value: 350000, event: 'Career uncertainty' },
      ],
    },
  },
  {
    id: 'mantle-7',
    name: 'Mickey Mantle',
    sport: 'Baseball',
    position: 'CF',
    draftYear: 1949,
    draftPick: 0,
    era: 'Vintage',
    careerStart: 1951,
    careerEnd: 1968,
    peakYearStart: 1956,
    peakYearEnd: 1962,
    careerStats: { avg: '.298', hr: 536, rbi: 1509, championships: 7, mvps: 3 },
    accolades: ['7x World Series Champ', '3x MVP', 'Triple Crown 1956', '16x All-Star'],
    allTimeRank: 8,
    keyCard: {
      id: 'mantle-topps52', playerId: 'mantle-7', set: '1952 Topps', year: 1952,
      cardNumber: '#311', grade: 'PSA 9', population: 3,
      releasePrice: 0.05, peakValue: 12600000, peakYear: 2022, currentValue: 10000000,
      priceHistory: [
        { year: 1952, value: 0.05, event: 'Penny pack pull' },
        { year: 1970, value: 150, event: 'Vintage hobby forms' },
        { year: 1980, value: 3000, event: 'Card collecting boom' },
        { year: 1991, value: 82000, event: 'Peak junk-wax era hype' },
        { year: 1995, value: 110000, event: 'Post-crash recovery' },
        { year: 2000, value: 275000, event: 'eBay era begins' },
        { year: 2006, value: 680000, event: 'Heritage auction record' },
        { year: 2010, value: 1100000, event: 'Seven-figure era' },
        { year: 2016, value: 3500000, event: 'Trophy card demand' },
        { year: 2018, value: 2880000, event: 'Market fluctuation' },
        { year: 2021, value: 5200000, event: 'Pandemic surge' },
        { year: 2022, value: 12600000, event: 'Record card sale ever' },
        { year: 2024, value: 10500000, event: 'Slight pullback' },
        { year: 2025, value: 10000000, event: 'King of cards stable' },
      ],
    },
  },
  {
    id: 'ruth-3',
    name: 'Babe Ruth',
    sport: 'Baseball',
    position: 'OF/P',
    draftYear: 1914,
    draftPick: 0,
    era: 'Vintage',
    careerStart: 1914,
    careerEnd: 1935,
    peakYearStart: 1920,
    peakYearEnd: 1932,
    careerStats: { avg: '.342', hr: 714, rbi: 2213, championships: 7, mvps: 1 },
    accolades: ['7x World Series Champ', 'Sultan of Swat', '714 HR Pioneer'],
    allTimeRank: 3,
    keyCard: {
      id: 'ruth-1916', playerId: 'ruth-3', set: '1916 Sporting News M101-4', year: 1916,
      cardNumber: '#151', grade: 'PSA 3', population: 1,
      releasePrice: 0.01, peakValue: 7200000, peakYear: 2023, currentValue: 6500000,
      priceHistory: [
        { year: 1916, value: 0.01, event: 'Release as pitcher' },
        { year: 1950, value: 50, event: 'Early collecting' },
        { year: 1970, value: 2000, event: 'Hobby expansion' },
        { year: 1980, value: 15000, event: 'Card boom' },
        { year: 1990, value: 80000, event: 'Vintage premiums' },
        { year: 2000, value: 350000, event: 'Millennium collecting' },
        { year: 2005, value: 600000, event: 'Pre-recession' },
        { year: 2010, value: 750000, event: 'Recession recovery' },
        { year: 2015, value: 1500000, event: 'Ultra-rare premium' },
        { year: 2019, value: 2500000, event: 'Historic demand' },
        { year: 2021, value: 5600000, event: 'Pandemic era' },
        { year: 2023, value: 7200000, event: 'Record sale' },
        { year: 2025, value: 6500000, event: 'Stable icon status' },
      ],
    },
  },
  {
    id: 'montana-16',
    name: 'Joe Montana',
    sport: 'Football',
    position: 'QB',
    draftYear: 1979,
    draftPick: 82,
    era: 'Junk-Wax',
    careerStart: 1979,
    careerEnd: 1994,
    peakYearStart: 1984,
    peakYearEnd: 1990,
    careerStats: { passingYards: 40551, touchdowns: 273, championships: 4, mvps: 2 },
    accolades: ['4x Super Bowl Champion', '3x Super Bowl MVP', '2x MVP'],
    allTimeRank: 4,
    keyCard: {
      id: 'montana-topps81', playerId: 'montana-16', set: '1981 Topps', year: 1981,
      cardNumber: '#216', grade: 'PSA 10', population: 72,
      releasePrice: 0.1, peakValue: 150000, peakYear: 2021, currentValue: 75000,
      priceHistory: [
        { year: 1981, value: 0.1, event: 'Release' },
        { year: 1985, value: 15, event: 'Super Bowl wins' },
        { year: 1990, value: 150, event: 'Dynasty recognition' },
        { year: 1995, value: 800, event: 'Post-retirement' },
        { year: 2000, value: 3000, event: 'Legacy appreciation' },
        { year: 2005, value: 8000, event: 'Graded era begins' },
        { year: 2010, value: 15000, event: 'Steady growth' },
        { year: 2015, value: 28000, event: 'GOAT debates fuel demand' },
        { year: 2019, value: 48000, event: 'Pre-pandemic' },
        { year: 2021, value: 150000, event: 'Peak mania' },
        { year: 2023, value: 85000, event: 'Correction' },
        { year: 2025, value: 75000, event: 'Stabilized' },
      ],
    },
  },
  {
    id: 'kobe-8',
    name: 'Kobe Bryant',
    sport: 'Basketball',
    position: 'SG',
    draftYear: 1996,
    draftPick: 13,
    era: 'Modern',
    careerStart: 1996,
    careerEnd: 2016,
    peakYearStart: 2001,
    peakYearEnd: 2010,
    careerStats: { ppg: 25.0, rpg: 5.2, apg: 4.7, championships: 5, mvps: 1 },
    accolades: ['5x Champion', 'MVP', '18x All-Star', '81-Point Game'],
    allTimeRank: 5,
    keyCard: {
      id: 'kobe-topps96', playerId: 'kobe-8', set: '1996-97 Topps Chrome', year: 1996,
      cardNumber: '#138', grade: 'PSA 10', population: 510,
      releasePrice: 8, peakValue: 325000, peakYear: 2021, currentValue: 125000,
      priceHistory: [
        { year: 1996, value: 8, event: 'Release' },
        { year: 2000, value: 250, event: 'Shaq-Kobe dynasty starts' },
        { year: 2002, value: 600, event: 'Three-peat' },
        { year: 2006, value: 1200, event: '81-point game' },
        { year: 2010, value: 3500, event: 'Fifth ring' },
        { year: 2016, value: 5000, event: 'Farewell tour' },
        { year: 2020, value: 175000, event: 'Passing tribute surge' },
        { year: 2021, value: 325000, event: 'Market peak + legacy' },
        { year: 2023, value: 140000, event: 'Correction' },
        { year: 2025, value: 125000, event: 'Memorial premium holds' },
      ],
    },
  },
  {
    id: 'shaq-34',
    name: 'Shaquille O\'Neal',
    sport: 'Basketball',
    position: 'C',
    draftYear: 1992,
    draftPick: 1,
    era: 'Modern',
    careerStart: 1992,
    careerEnd: 2011,
    peakYearStart: 1996,
    peakYearEnd: 2004,
    careerStats: { ppg: 23.7, rpg: 10.9, apg: 2.5, championships: 4, mvps: 1 },
    accolades: ['4x Champion', 'MVP', '3x Finals MVP', '15x All-Star'],
    allTimeRank: 8,
    keyCard: {
      id: 'shaq-topps92', playerId: 'shaq-34', set: '1992-93 Topps', year: 1992,
      cardNumber: '#362', grade: 'PSA 10', population: 2850,
      releasePrice: 2, peakValue: 4800, peakYear: 2021, currentValue: 1500,
      priceHistory: [
        { year: 1992, value: 2, event: 'Release' },
        { year: 1994, value: 30, event: 'Orlando dominance' },
        { year: 1997, value: 60, event: 'LA move' },
        { year: 2001, value: 120, event: 'Three-peat starts' },
        { year: 2005, value: 200, event: 'Post-peak' },
        { year: 2010, value: 350, event: 'Career end' },
        { year: 2015, value: 500, event: 'Nostalgia factor' },
        { year: 2019, value: 1200, event: 'Graded card appreciation' },
        { year: 2021, value: 4800, event: 'Market peak' },
        { year: 2023, value: 1800, event: 'High pop correction' },
        { year: 2025, value: 1500, event: 'Stabilized' },
      ],
    },
  },
  {
    id: 'griffey-24',
    name: 'Ken Griffey Jr.',
    sport: 'Baseball',
    position: 'CF',
    draftYear: 1987,
    draftPick: 1,
    era: 'Junk-Wax',
    careerStart: 1989,
    careerEnd: 2010,
    peakYearStart: 1993,
    peakYearEnd: 1999,
    careerStats: { avg: '.284', hr: 630, rbi: 1836, championships: 0, mvps: 1 },
    accolades: ['MVP', '13x All-Star', '10x Gold Glove', 'Most Popular 90s Player'],
    allTimeRank: 15,
    keyCard: {
      id: 'griffey-ud89', playerId: 'griffey-24', set: '1989 Upper Deck', year: 1989,
      cardNumber: '#1', grade: 'PSA 10', population: 3450,
      releasePrice: 1, peakValue: 8000, peakYear: 2021, currentValue: 2800,
      priceHistory: [
        { year: 1989, value: 1, event: 'Iconic release' },
        { year: 1991, value: 50, event: 'Hobby icon status' },
        { year: 1994, value: 120, event: 'Home run era' },
        { year: 1998, value: 200, event: 'HR chase' },
        { year: 2002, value: 100, event: 'Injury years' },
        { year: 2006, value: 150, event: 'Nostalgia begins' },
        { year: 2010, value: 400, event: 'Retirement' },
        { year: 2016, value: 1200, event: 'HOF induction' },
        { year: 2019, value: 2500, event: 'Junk-wax icon premium' },
        { year: 2021, value: 8000, event: 'Market mania' },
        { year: 2023, value: 3500, event: 'Correction' },
        { year: 2025, value: 2800, event: 'Stabilized icon' },
      ],
    },
  },
];

// ── Service Functions ────────────────────────────────────────────────────────────

export function getAllLegends(): LegendPlayer[] {
  return LEGEND_PLAYERS;
}

export function getLegendById(id: string): LegendPlayer | undefined {
  return LEGEND_PLAYERS.find((p) => p.id === id);
}

export function comparePlayers(playerIds: string[]): ComparisonResult {
  const players = LEGEND_PLAYERS.filter((p) => playerIds.includes(p.id));
  const normalizedMetrics = getNormalizedMetrics(playerIds);
  const holdingPeriodReturns = getHoldingPeriodReturns(playerIds);
  const inflationAdj = getInflationAdjustedValues(playerIds);
  const careerOverlay = getCareerOverlay(playerIds);
  const rankings = rankByROI(playerIds);

  return {
    players,
    normalizedMetrics,
    holdingPeriodReturns,
    inflationAdjusted: inflationAdj,
    careerOverlay,
    rankings,
  };
}

export function getNormalizedMetrics(playerIds: string[]): NormalizedMetric[] {
  const metrics: NormalizedMetric[] = [];
  const players = LEGEND_PLAYERS.filter((p) => playerIds.includes(p.id));

  for (const player of players) {
    const card = player.keyCard;
    const peakVal = card.peakValue;
    const careerLength = (player.careerEnd ?? 2026) - player.careerStart;

    card.priceHistory.forEach((ph, idx) => {
      const careerYear = Math.max(1, ph.year - player.careerStart + 1);
      const normalizedVal = peakVal > 0 ? (ph.value / peakVal) * 100 : 0;

      // Simple performance index based on career position
      const careerPct = careerYear / careerLength;
      let performanceIndex: number;
      if (careerPct <= 0.3) performanceIndex = 40 + careerPct * 150;
      else if (careerPct <= 0.7) performanceIndex = 75 + Math.sin((careerPct - 0.3) * Math.PI / 0.4) * 25;
      else performanceIndex = Math.max(30, 90 - (careerPct - 0.7) * 200);

      metrics.push({
        careerYear,
        playerId: player.id,
        playerName: player.name,
        cardValue: ph.value,
        cardValueNormalized: Math.round(normalizedVal * 100) / 100,
        performanceIndex: Math.round(Math.min(100, Math.max(0, performanceIndex)) * 10) / 10,
        marketSentiment: Math.round(Math.min(100, normalizedVal * 1.1) * 10) / 10,
        inflationFactor: Math.round(inflationMultiplier(ph.year, 2026) * 1000) / 1000,
      });
    });
  }

  return metrics.sort((a, b) => a.careerYear - b.careerYear);
}

export function getCareerOverlay(playerIds: string[]): NormalizedMetric[] {
  return getNormalizedMetrics(playerIds);
}

export function getHoldingPeriodReturns(playerIds: string[]): HoldingPeriodReturn[] {
  const results: HoldingPeriodReturn[] = [];
  const players = LEGEND_PLAYERS.filter((p) => playerIds.includes(p.id));
  const holdingPeriods = [1, 5, 10, 20];

  for (const player of players) {
    const card = player.keyCard;
    const history = card.priceHistory;
    const latestYear = history[history.length - 1].year;
    const latestValue = history[history.length - 1].value;

    for (const years of holdingPeriods) {
      const startYear = latestYear - years;
      // Find closest data point to startYear
      let startPoint = history[0];
      for (const ph of history) {
        if (Math.abs(ph.year - startYear) < Math.abs(startPoint.year - startYear)) {
          startPoint = ph;
        }
      }

      const actualYears = latestYear - startPoint.year;
      if (actualYears <= 0) continue;

      const nominalReturn = ((latestValue - startPoint.value) / startPoint.value) * 100;
      const cagr = (Math.pow(latestValue / startPoint.value, 1 / actualYears) - 1) * 100;
      const inflAdj = inflationMultiplier(startPoint.year, latestYear);
      const realReturn = (((latestValue / inflAdj) - startPoint.value) / startPoint.value) * 100;

      // Calculate peak drawdown during holding period
      let peakInPeriod = startPoint.value;
      let maxDrawdown = 0;
      for (const ph of history) {
        if (ph.year >= startPoint.year && ph.year <= latestYear) {
          if (ph.value > peakInPeriod) peakInPeriod = ph.value;
          const drawdown = ((peakInPeriod - ph.value) / peakInPeriod) * 100;
          if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        }
      }

      results.push({
        playerId: player.id,
        playerName: player.name,
        holdingYears: years,
        nominalReturn: Math.round(nominalReturn * 100) / 100,
        annualizedReturn: Math.round(cagr * 100) / 100,
        inflationAdjustedReturn: Math.round(realReturn * 100) / 100,
        startValue: startPoint.value,
        endValue: latestValue,
        peakDrawdown: Math.round(maxDrawdown * 100) / 100,
      });
    }
  }

  return results;
}

export function adjustForInflation(
  value: number,
  fromYear: number,
  toYear: number = 2026
): number {
  return Math.round(value * inflationMultiplier(fromYear, toYear) * 100) / 100;
}

export function getInflationAdjustedValues(playerIds: string[]): InflationAdjustedValue[] {
  const results: InflationAdjustedValue[] = [];
  const players = LEGEND_PLAYERS.filter((p) => playerIds.includes(p.id));

  for (const player of players) {
    const card = player.keyCard;
    const releaseYear = card.year;
    const releaseCPI = getCPI(releaseYear);

    for (const ph of card.priceHistory) {
      const currentCPI = getCPI(ph.year);
      const presentDayCPI = getCPI(2026);
      const realValue = ph.value * (presentDayCPI / currentCPI);
      const cumulativeInflation = ((currentCPI - releaseCPI) / releaseCPI) * 100;

      results.push({
        year: ph.year,
        playerId: player.id,
        playerName: player.name,
        nominalValue: ph.value,
        realValue: Math.round(realValue * 100) / 100,
        cpiIndex: Math.round(currentCPI * 10) / 10,
        cumulativeInflation: Math.round(cumulativeInflation * 100) / 100,
      });
    }
  }

  return results.sort((a, b) => a.year - b.year);
}

export function rankByROI(playerIds?: string[]): PlayerRanking[] {
  const players = playerIds
    ? LEGEND_PLAYERS.filter((p) => playerIds.includes(p.id))
    : LEGEND_PLAYERS;

  const rankings: PlayerRanking[] = players.map((player) => {
    const card = player.keyCard;
    const history = card.priceHistory;
    const releasePrice = card.releasePrice;
    const currentValue = card.currentValue;
    const peakValue = card.peakValue;
    const yearsHeld = 2026 - card.year;

    const totalROI = ((currentValue - releasePrice) / releasePrice) * 100;
    const annualizedROI = (Math.pow(currentValue / releasePrice, 1 / yearsHeld) - 1) * 100;
    const peakMultiple = peakValue / releasePrice;
    const currentMultiple = currentValue / releasePrice;

    // Volatility proxy: standard deviation of year-over-year returns
    const yoyReturns: number[] = [];
    for (let i = 1; i < history.length; i++) {
      const yearSpan = history[i].year - history[i - 1].year;
      if (yearSpan > 0) {
        const annReturn = (Math.pow(history[i].value / history[i - 1].value, 1 / yearSpan) - 1) * 100;
        yoyReturns.push(annReturn);
      }
    }
    const avgReturn = yoyReturns.reduce((s, r) => s + r, 0) / yoyReturns.length;
    const variance = yoyReturns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / yoyReturns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? (annualizedROI - 3) / stdDev : 0; // 3% risk-free proxy

    // Max drawdown
    let peak = 0;
    let maxDrawdown = 0;
    for (const ph of history) {
      if (ph.value > peak) peak = ph.value;
      const dd = ((peak - ph.value) / peak) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    // Holding score: weighted composite
    const holdingScore = Math.min(100, Math.max(0,
      annualizedROI * 0.8 +
      (100 - maxDrawdown) * 0.15 +
      sharpeRatio * 5
    ));

    return {
      playerId: player.id,
      playerName: player.name,
      sport: player.sport,
      era: player.era,
      totalROI: Math.round(totalROI * 100) / 100,
      annualizedROI: Math.round(annualizedROI * 100) / 100,
      peakMultiple: Math.round(peakMultiple),
      currentMultiple: Math.round(currentMultiple),
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      holdingScore: Math.round(holdingScore * 10) / 10,
      rank: 0,
    };
  });

  // Sort by holding score descending and assign ranks
  rankings.sort((a, b) => b.holdingScore - a.holdingScore);
  rankings.forEach((r, i) => { r.rank = i + 1; });

  return rankings;
}

// ── Color Helpers ────────────────────────────────────────────────────────────────

const PLAYER_COLORS: Record<string, string> = {
  'mj-23': '#ef4444',      // Red - Bulls
  'lbj-23': '#f59e0b',     // Gold - Lakers
  'luka-77': '#3b82f6',    // Blue - Mavs
  'gretzky-99': '#f97316',  // Orange - Oilers
  'brady-12': '#1e3a5f',   // Navy - Patriots
  'trout-27': '#dc2626',   // Red - Angels
  'mantle-7': '#1d4ed8',   // Blue - Yankees
  'ruth-3': '#7c3aed',     // Purple - classic
  'montana-16': '#b91c1c', // Crimson - 49ers
  'kobe-8': '#eab308',     // Gold - Lakers
  'shaq-34': '#0ea5e9',    // Sky - Magic/Lakers
  'griffey-24': '#059669',  // Teal - Mariners
};

export function getPlayerColor(playerId: string): string {
  return PLAYER_COLORS[playerId] ?? '#84cc16';
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  if (Math.abs(value) >= 10000) return `${(value / 1000).toFixed(0)}K%`;
  return `${value.toFixed(1)}%`;
}

export function formatMultiple(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M×`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K×`;
  return `${value.toFixed(0)}×`;
}
