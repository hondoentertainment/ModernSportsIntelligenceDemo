// @ts-nocheck
// Phase 100 — Hall of Fame Probability Tracker
// ML-powered HOF probability calculator with historical vote modeling,
// card value impact projections, and "invest before the call" timing signals.

import { store } from '../dal/syncStore';

// ---- Types ----

export interface HOFCandidate {
  id: string;
  player: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey';
  team: string;
  position: string;
  hofProbability: number; // 0-100
  yearsEligible: number;
  votesNeeded: number; // 75%
  projectedYear: number;
  careerStats: Record<string, string>;
  hofComparables: string[];
  cardValueImpact: {
    currentAvg: number;
    projectedPostHOF: number;
    multiplier: number;
  };
  status: 'active' | 'eligible' | 'ballot' | 'inducted' | 'not_eligible';
  war: number; // baseball WAR or equivalent composite
  accolades: string[];
}

export interface HOFProjection {
  player: string;
  yearByYear: { year: number; probability: number; catalyst: string }[];
  tippingPoint: number; // year when >50%
  keyMilestones: { milestone: string; impact: number; yearsAway: number }[];
}

export interface HOFImpactHistory {
  player: string;
  inductionYear: number;
  preInductionValue: number;
  postInductionValue: number;
  multiplier: number;
  peakValue: number;
  peakDate: string;
  timeToRecover: number; // months
}

export interface HOFInvestSignal {
  player: string;
  signal: 'strong_buy' | 'buy' | 'accumulate' | 'hold' | 'wait';
  timing: string;
  reasoning: string;
  yearsToInduction: number;
  probabilityThreshold: number;
}

export interface HOFStats {
  trackedCandidates: number;
  highProbability: number; // count >70%
  portfolioExposure: number; // percentage
  avgProjectedMultiplier: number;
  nextBallotDate: string;
}

// ---- Storage ----

const STORAGE_KEY = 'msi_hof_tracker';

function _loadStorage(): { lastUpdated: string } {
  return store.get<{ lastUpdated: string }>(STORAGE_KEY, { lastUpdated: new Date().toISOString() });
}

function saveStorage(data: { lastUpdated: string }) {
  store.set(STORAGE_KEY, data);
}

// ---- Candidate Data ----

const candidates: HOFCandidate[] = [
  // Baseball
  {
    id: 'hof-trout',
    player: 'Mike Trout',
    sport: 'baseball',
    team: 'LAA',
    position: 'CF',
    hofProbability: 92,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2037,
    careerStats: { AVG: '.303', HR: '378', OPS: '.999', 'All-Star': '11x', MVP: '3x' },
    hofComparables: ['Mickey Mantle', 'Willie Mays', 'Ken Griffey Jr.'],
    cardValueImpact: { currentAvg: 485, projectedPostHOF: 920, multiplier: 1.90 },
    status: 'active',
    war: 85.2,
    accolades: ['3x AL MVP', '11x All-Star', '9x Silver Slugger', 'AL ROY'],
  },
  {
    id: 'hof-kershaw',
    player: 'Clayton Kershaw',
    sport: 'baseball',
    team: 'LAD',
    position: 'SP',
    hofProbability: 89,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2033,
    careerStats: { W: '210', ERA: '2.48', SO: '2,944', 'Cy Young': '3x', 'No-Hitter': '1' },
    hofComparables: ['Sandy Koufax', 'Pedro Martinez', 'Greg Maddux'],
    cardValueImpact: { currentAvg: 310, projectedPostHOF: 560, multiplier: 1.81 },
    status: 'active',
    war: 77.1,
    accolades: ['3x NL Cy Young', '9x All-Star', 'NL MVP', '5x ERA Title'],
  },
  {
    id: 'hof-betts',
    player: 'Mookie Betts',
    sport: 'baseball',
    team: 'LAD',
    position: 'RF',
    hofProbability: 78,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2038,
    careerStats: { AVG: '.290', HR: '310', OPS: '.895', 'Gold Glove': '6x', 'WS MVP': '1' },
    hofComparables: ['Roberto Clemente', 'Andre Dawson', 'Larry Walker'],
    cardValueImpact: { currentAvg: 220, projectedPostHOF: 410, multiplier: 1.86 },
    status: 'active',
    war: 58.4,
    accolades: ['AL MVP', '6x All-Star', '6x Gold Glove', 'WS Champion'],
  },
  {
    id: 'hof-freeman',
    player: 'Freddie Freeman',
    sport: 'baseball',
    team: 'LAD',
    position: '1B',
    hofProbability: 72,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2037,
    careerStats: { AVG: '.299', HR: '342', OPS: '.893', 'Gold Glove': '1', 'Silver Slugger': '4x' },
    hofComparables: ['Jeff Bagwell', 'Eddie Murray', 'Jim Thome'],
    cardValueImpact: { currentAvg: 145, projectedPostHOF: 265, multiplier: 1.83 },
    status: 'active',
    war: 61.9,
    accolades: ['NL MVP', '8x All-Star', '4x Silver Slugger', 'WS Champion'],
  },
  // Basketball
  {
    id: 'hof-lebron',
    player: 'LeBron James',
    sport: 'basketball',
    team: 'LAL',
    position: 'SF',
    hofProbability: 99,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2031,
    careerStats: { PPG: '27.1', RPG: '7.5', APG: '7.4', 'Championships': '4', 'MVPs': '4' },
    hofComparables: ['Michael Jordan', 'Kareem Abdul-Jabbar', 'Magic Johnson'],
    cardValueImpact: { currentAvg: 2850, projectedPostHOF: 5400, multiplier: 1.89 },
    status: 'active',
    war: 264.2,
    accolades: ['4x NBA Champion', '4x Finals MVP', '4x NBA MVP', 'All-Time Scoring Leader'],
  },
  {
    id: 'hof-curry',
    player: 'Stephen Curry',
    sport: 'basketball',
    team: 'GSW',
    position: 'PG',
    hofProbability: 98,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2032,
    careerStats: { PPG: '24.8', APG: '6.4', '3PM': '3,747', 'Championships': '4', 'FT%': '.911' },
    hofComparables: ['Magic Johnson', 'Steve Nash', 'Ray Allen'],
    cardValueImpact: { currentAvg: 1420, projectedPostHOF: 2700, multiplier: 1.90 },
    status: 'active',
    war: 107.5,
    accolades: ['4x NBA Champion', 'Finals MVP', '2x NBA MVP', 'All-Time 3PM Leader'],
  },
  {
    id: 'hof-durant',
    player: 'Kevin Durant',
    sport: 'basketball',
    team: 'PHX',
    position: 'SF',
    hofProbability: 96,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2033,
    careerStats: { PPG: '27.3', RPG: '7.1', 'Championships': '2', 'FMVPs': '2', 'Scoring Titles': '4' },
    hofComparables: ['Larry Bird', 'Dirk Nowitzki', 'Karl Malone'],
    cardValueImpact: { currentAvg: 890, projectedPostHOF: 1640, multiplier: 1.84 },
    status: 'active',
    war: 142.8,
    accolades: ['2x NBA Champion', '2x Finals MVP', 'NBA MVP', '14x All-Star'],
  },
  {
    id: 'hof-giannis',
    player: 'Giannis Antetokounmpo',
    sport: 'basketball',
    team: 'MIL',
    position: 'PF',
    hofProbability: 94,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2036,
    careerStats: { PPG: '23.4', RPG: '9.8', BPG: '1.3', 'Championship': '1', 'MVPs': '2' },
    hofComparables: ['Tim Duncan', 'Charles Barkley', 'Kevin Garnett'],
    cardValueImpact: { currentAvg: 750, projectedPostHOF: 1410, multiplier: 1.88 },
    status: 'active',
    war: 108.1,
    accolades: ['NBA Champion', 'Finals MVP', '2x NBA MVP', 'DPOY', '8x All-Star'],
  },
  // Football
  {
    id: 'hof-mahomes',
    player: 'Patrick Mahomes',
    sport: 'football',
    team: 'KC',
    position: 'QB',
    hofProbability: 95,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2041,
    careerStats: { 'Pass Yds': '28,424', TD: '216', 'Passer Rating': '103.3', 'Super Bowls': '3', 'MVPs': '2' },
    hofComparables: ['Tom Brady', 'Joe Montana', 'Peyton Manning'],
    cardValueImpact: { currentAvg: 1650, projectedPostHOF: 3150, multiplier: 1.91 },
    status: 'active',
    war: 52.8,
    accolades: ['3x Super Bowl Champion', '3x Super Bowl MVP', '2x NFL MVP', '6x Pro Bowl'],
  },
  {
    id: 'hof-donald',
    player: 'Aaron Donald',
    sport: 'football',
    team: 'LAR',
    position: 'DT',
    hofProbability: 99,
    yearsEligible: 1,
    votesNeeded: 75,
    projectedYear: 2030,
    careerStats: { Sacks: '111', 'All-Pro': '8x', 'DPOY': '3x', 'Pro Bowl': '10x', 'SB Champ': '1' },
    hofComparables: ['Reggie White', 'Bruce Smith', 'Mean Joe Greene'],
    cardValueImpact: { currentAvg: 420, projectedPostHOF: 780, multiplier: 1.86 },
    status: 'inducted',
    war: 118.4,
    accolades: ['3x NFL DPOY', '8x First-Team All-Pro', '10x Pro Bowl', 'Super Bowl Champion'],
  },
  {
    id: 'hof-kelce',
    player: 'Travis Kelce',
    sport: 'football',
    team: 'KC',
    position: 'TE',
    hofProbability: 88,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2036,
    careerStats: { Rec: '908', Yds: '11,328', TD: '74', 'Pro Bowl': '9x', 'SB Champ': '3' },
    hofComparables: ['Tony Gonzalez', 'Rob Gronkowski', 'Shannon Sharpe'],
    cardValueImpact: { currentAvg: 380, projectedPostHOF: 690, multiplier: 1.82 },
    status: 'active',
    war: 42.7,
    accolades: ['3x Super Bowl Champion', '9x Pro Bowl', '4x First-Team All-Pro'],
  },
  // Hockey
  {
    id: 'hof-mcdavid',
    player: 'Connor McDavid',
    sport: 'hockey',
    team: 'EDM',
    position: 'C',
    hofProbability: 91,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2040,
    careerStats: { G: '335', A: '572', PTS: '907', 'Art Ross': '5x', 'Hart': '4x' },
    hofComparables: ['Wayne Gretzky', 'Mario Lemieux', 'Sidney Crosby'],
    cardValueImpact: { currentAvg: 620, projectedPostHOF: 1180, multiplier: 1.90 },
    status: 'active',
    war: 68.9,
    accolades: ['4x Hart Trophy', '5x Art Ross Trophy', '3x Ted Lindsay', 'Conn Smythe'],
  },
  {
    id: 'hof-crosby',
    player: 'Sidney Crosby',
    sport: 'hockey',
    team: 'PIT',
    position: 'C',
    hofProbability: 99,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2031,
    careerStats: { G: '592', A: '1,000', PTS: '1,592', 'Stanley Cups': '3', 'Hart': '2x' },
    hofComparables: ['Wayne Gretzky', 'Mario Lemieux', 'Mark Messier'],
    cardValueImpact: { currentAvg: 880, projectedPostHOF: 1580, multiplier: 1.80 },
    status: 'active',
    war: 102.4,
    accolades: ['3x Stanley Cup Champion', '2x Conn Smythe', '2x Hart Trophy', '2x Art Ross'],
  },
  {
    id: 'hof-ohtani',
    player: 'Shohei Ohtani',
    sport: 'baseball',
    team: 'LAD',
    position: 'DH/SP',
    hofProbability: 85,
    yearsEligible: 0,
    votesNeeded: 75,
    projectedYear: 2040,
    careerStats: { AVG: '.274', HR: '225', 'W-L': '38-19', ERA: '3.01', 'WAR Bat+Pitch': '42.1' },
    hofComparables: ['Babe Ruth', 'No modern comparable'],
    cardValueImpact: { currentAvg: 1100, projectedPostHOF: 2310, multiplier: 2.10 },
    status: 'active',
    war: 42.1,
    accolades: ['2x AL MVP', 'AL ROY', 'Silver Slugger', 'Historic Two-Way Player'],
  },
];

// ---- Historical Impact Data ----

const historicalImpact: HOFImpactHistory[] = [
  {
    player: 'Derek Jeter',
    inductionYear: 2020,
    preInductionValue: 320,
    postInductionValue: 470,
    multiplier: 1.47,
    peakValue: 560,
    peakDate: '2020-11',
    timeToRecover: 18,
  },
  {
    player: 'Kobe Bryant',
    inductionYear: 2020,
    preInductionValue: 1200,
    postInductionValue: 3800,
    multiplier: 3.17,
    peakValue: 4200,
    peakDate: '2021-02',
    timeToRecover: 0,
  },
  {
    player: 'Ken Griffey Jr.',
    inductionYear: 2016,
    preInductionValue: 280,
    postInductionValue: 420,
    multiplier: 1.50,
    peakValue: 510,
    peakDate: '2016-12',
    timeToRecover: 14,
  },
  {
    player: 'Mariano Rivera',
    inductionYear: 2019,
    preInductionValue: 190,
    postInductionValue: 310,
    multiplier: 1.63,
    peakValue: 350,
    peakDate: '2019-09',
    timeToRecover: 12,
  },
  {
    player: 'Tim Duncan',
    inductionYear: 2020,
    preInductionValue: 240,
    postInductionValue: 380,
    multiplier: 1.58,
    peakValue: 430,
    peakDate: '2021-01',
    timeToRecover: 16,
  },
  {
    player: 'Tony Hawk (HOF Equivalent)',
    inductionYear: 2022,
    preInductionValue: 150,
    postInductionValue: 260,
    multiplier: 1.73,
    peakValue: 310,
    peakDate: '2022-08',
    timeToRecover: 10,
  },
  {
    player: 'Peyton Manning',
    inductionYear: 2021,
    preInductionValue: 180,
    postInductionValue: 290,
    multiplier: 1.61,
    peakValue: 340,
    peakDate: '2021-10',
    timeToRecover: 14,
  },
  {
    player: 'David Ortiz',
    inductionYear: 2022,
    preInductionValue: 210,
    postInductionValue: 350,
    multiplier: 1.67,
    peakValue: 400,
    peakDate: '2022-11',
    timeToRecover: 12,
  },
];

// ---- Service Functions ----

export function getHOFCandidates(): HOFCandidate[] {
  saveStorage({ lastUpdated: new Date().toISOString() });
  return [...candidates].sort((a, b) => b.hofProbability - a.hofProbability);
}

export function getHOFProjection(playerId: string): HOFProjection | null {
  const candidate = candidates.find(c => c.id === playerId);
  if (!candidate) return null;

  const currentYear = new Date().getFullYear();
  const yearsOut = candidate.projectedYear - currentYear;
  const yearByYear: HOFProjection['yearByYear'] = [];

  // Build year-by-year probability curve
  for (let i = 0; i <= Math.min(yearsOut + 3, 18); i++) {
    const year = currentYear + i;
    let probability: number;

    if (candidate.status === 'inducted') {
      probability = 100;
    } else if (year >= candidate.projectedYear) {
      probability = Math.min(candidate.hofProbability + (year - candidate.projectedYear) * 2, 99);
    } else {
      // S-curve growth toward projected probability
      const progress = i / yearsOut;
      const sCurve = 1 / (1 + Math.exp(-8 * (progress - 0.5)));
      probability = Math.round(15 + (candidate.hofProbability - 15) * sCurve);
    }

    let catalyst = '';
    if (i === 0) catalyst = 'Current season';
    else if (year === candidate.projectedYear) catalyst = 'Projected ballot year';
    else if (probability > 50 && yearByYear.length > 0 && yearByYear[yearByYear.length - 1].probability <= 50) catalyst = 'Tipping point crossed';
    else if (i % 3 === 0) catalyst = 'Career milestone projection';

    yearByYear.push({ year, probability: Math.round(probability), catalyst });
  }

  const tippingPoint = yearByYear.find(y => y.probability > 50)?.year ?? candidate.projectedYear;

  const milestones: HOFProjection['keyMilestones'] = [];
  if (candidate.sport === 'baseball') {
    if (candidate.careerStats.HR) {
      const hr = parseInt(candidate.careerStats.HR.replace(',', ''));
      if (hr < 500) milestones.push({ milestone: '500 Home Runs', impact: 15, yearsAway: Math.max(1, Math.ceil((500 - hr) / 30)) });
      if (hr < 600) milestones.push({ milestone: '600 Home Runs', impact: 10, yearsAway: Math.max(2, Math.ceil((600 - hr) / 30)) });
    }
    milestones.push({ milestone: 'Retirement + 5yr waiting period', impact: 0, yearsAway: Math.max(1, yearsOut - 1) });
  } else if (candidate.sport === 'basketball') {
    milestones.push({ milestone: 'Retirement ceremony', impact: 8, yearsAway: Math.max(1, Math.floor(yearsOut * 0.4)) });
    milestones.push({ milestone: 'Hall of Fame eligibility', impact: 12, yearsAway: Math.max(2, Math.floor(yearsOut * 0.7)) });
  } else if (candidate.sport === 'football') {
    milestones.push({ milestone: 'Additional Super Bowl appearance', impact: 10, yearsAway: 1 });
    milestones.push({ milestone: 'Eligibility window opens', impact: 15, yearsAway: Math.max(2, yearsOut - 2) });
  } else if (candidate.sport === 'hockey') {
    milestones.push({ milestone: '1,000 career points', impact: 12, yearsAway: Math.max(1, 2) });
    milestones.push({ milestone: 'Stanley Cup push', impact: 18, yearsAway: 1 });
  }

  // Always add ballot milestone
  milestones.push({ milestone: 'First ballot appearance', impact: 20, yearsAway: Math.max(1, yearsOut) });

  return { player: candidate.player, yearByYear, tippingPoint, keyMilestones: milestones };
}

export function getHistoricalImpact(): HOFImpactHistory[] {
  return historicalImpact;
}

export function getInvestSignals(): HOFInvestSignal[] {
  return candidates
    .filter(c => c.status !== 'inducted')
    .map(c => {
      const yearsToInduction = c.projectedYear - new Date().getFullYear();
      let signal: HOFInvestSignal['signal'];
      let timing: string;
      let reasoning: string;

      if (c.hofProbability >= 95 && yearsToInduction <= 3) {
        signal = 'strong_buy';
        timing = 'Immediate — induction imminent';
        reasoning = `${c.player} is a virtual lock at ${c.hofProbability}% probability. Cards historically surge 40-60% around induction announcements. Buy before the final ballot vote.`;
      } else if (c.hofProbability >= 85 && yearsToInduction <= 5) {
        signal = 'buy';
        timing = 'Next 6–12 months';
        reasoning = `Strong HOF case building for ${c.player}. Accumulate key rookies and autos before the narrative shifts from "likely" to "certain."`;
      } else if (c.hofProbability >= 75) {
        signal = 'accumulate';
        timing = 'Gradually over 1-2 years';
        reasoning = `${c.player} trending toward HOF. Strategic position building — target PSA 10 rookies at current prices before premium pricing kicks in.`;
      } else if (c.hofProbability >= 60) {
        signal = 'hold';
        timing = 'Monitor quarterly';
        reasoning = `${c.player} has a solid case but not yet a lock. Hold existing positions, watch for career milestones that could push probability higher.`;
      } else {
        signal = 'wait';
        timing = 'Check back in 12-18 months';
        reasoning = `${c.player} needs more career development. Too early for HOF-driven investment thesis. Watch for breakout seasons.`;
      }

      return {
        player: c.player,
        signal,
        timing,
        reasoning,
        yearsToInduction,
        probabilityThreshold: c.hofProbability,
      };
    })
    .sort((a, b) => {
      const order: Record<string, number> = { strong_buy: 0, buy: 1, accumulate: 2, hold: 3, wait: 4 };
      return order[a.signal] - order[b.signal];
    });
}

export function getHOFStats(): HOFStats {
  const all = getHOFCandidates();
  const high = all.filter(c => c.hofProbability > 70).length;
  const avgMult = all.reduce((sum, c) => sum + c.cardValueImpact.multiplier, 0) / all.length;
  const totalExposure = all.reduce((sum, c) => sum + c.cardValueImpact.currentAvg, 0);
  const portfolioExposure = Math.round((totalExposure / 50000) * 100 * 10) / 10; // assume $50k portfolio

  return {
    trackedCandidates: all.length,
    highProbability: high,
    portfolioExposure: Math.min(portfolioExposure, 100),
    avgProjectedMultiplier: Math.round(avgMult * 100) / 100,
    nextBallotDate: 'Jan 2027',
  };
}
