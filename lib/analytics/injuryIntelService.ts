// Phase 127: Predictive Injury & Roster Intelligence Service

// ---- Types ----

export interface InjuryReport {
  id: string;
  playerId: string;
  playerName: string;
  sport: string;
  team: string;
  injuryType: string;
  bodyPart: string;
  severity: 'minor' | 'moderate' | 'severe' | 'career_threatening';
  status: 'active' | 'day_to_day' | 'out' | 'ir' | 'recovered';
  dateReported: string;
  estimatedReturn: string | null;
  gamesExpectedMissed: number;
  notes: string;
}

export interface InjuryProbability {
  playerId: string;
  playerName: string;
  sport: string;
  team: string;
  age: number;
  position: string;
  injuryRisk: number; // 0-100
  riskTrend: 'increasing' | 'stable' | 'decreasing';
  priorInjuries: number;
  workloadIndex: number; // 0-100
  softTissueRisk: number;
  concussionHistory: number;
  projectedGamesLost: number;
  cardValueImpact: number; // percent change expected
  confidenceInterval: [number, number];
}

export type RosterMove = 'trade' | 'free_agency' | 'retirement' | 'extension' | 'draft';

export interface TradeDeadlineScenario {
  id: string;
  playerId: string;
  playerName: string;
  currentTeam: string;
  sport: string;
  moveType: RosterMove;
  probability: number; // 0-100
  potentialTeams: { team: string; probability: number; cardImpact: number }[];
  deadline: string;
  contractValue?: number;
  years?: number;
  analysis: string;
  cardValueUpside: number;
  cardValueDownside: number;
}

export interface RetirementWatch {
  playerId: string;
  playerName: string;
  sport: string;
  team: string;
  age: number;
  seasonsPlayed: number;
  retirementProbability: number; // 0-100
  expectedSeasonsRemaining: number;
  lastContractYear: boolean;
  recentPerformanceDecline: boolean;
  publicStatements: string[];
  cardValueAtRetirement: number; // projected % change
  recommendedAction: 'hold' | 'sell_now' | 'buy_dip' | 'accumulate';
  timeline: string;
}

export interface HallOfFameProb {
  playerId: string;
  playerName: string;
  sport: string;
  position: string;
  hofProbability: number; // 0-100
  yearsUntilEligible: number;
  keyStats: { label: string; value: string; percentile: number }[];
  comparablePlayers: string[];
  longTermHoldSignal: 'strong_buy' | 'buy' | 'hold' | 'neutral';
  projectedValueMultiplier: number;
  inductionYear?: number;
}

export interface CardImpactProjection {
  id: string;
  playerId: string;
  playerName: string;
  eventType: 'injury' | 'trade' | 'retirement' | 'extension' | 'free_agency' | 'hof_induction' | 'milestone';
  eventDescription: string;
  eventDate: string;
  probability: number;
  cardValueBefore: number;
  cardValueAfter: number;
  percentChange: number;
  affectedCards: { cardName: string; year: string; set: string; impact: number }[];
  recommendation: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface PlayerHealthTimeline {
  playerId: string;
  playerName: string;
  sport: string;
  entries: {
    date: string;
    event: string;
    type: 'injury' | 'recovery' | 'setback' | 'milestone' | 'surgery';
    severity?: 'minor' | 'moderate' | 'severe';
    gamesImpacted: number;
    cardValueChange: number;
  }[];
  currentStatus: string;
  overallDurability: number; // 0-100
  careerGamesPlayed: number;
  careerGamesMissed: number;
}

export interface UpcomingRosterEvent {
  id: string;
  date: string;
  eventType: RosterMove | 'injury_update' | 'contract_decision';
  playerName: string;
  sport: string;
  team: string;
  description: string;
  cardImpactRange: [number, number];
  importance: 'low' | 'medium' | 'high' | 'critical';
}

// ---- Mock Data ----

const INJURY_REPORTS: InjuryReport[] = [
  { id: 'inj-1', playerId: 'p-1', playerName: 'Patrick Mahomes', sport: 'NFL', team: 'Kansas City Chiefs', injuryType: 'Ankle Sprain', bodyPart: 'Right Ankle', severity: 'minor', status: 'day_to_day', dateReported: '2026-03-01', estimatedReturn: '2026-03-15', gamesExpectedMissed: 1, notes: 'Tweaked ankle in practice; expected to play.' },
  { id: 'inj-2', playerId: 'p-2', playerName: 'Anthony Davis', sport: 'NBA', team: 'Los Angeles Lakers', injuryType: 'Knee Contusion', bodyPart: 'Left Knee', severity: 'moderate', status: 'out', dateReported: '2026-02-20', estimatedReturn: '2026-03-25', gamesExpectedMissed: 8, notes: 'Bone bruise; MRI revealed no structural damage.' },
  { id: 'inj-3', playerId: 'p-3', playerName: 'Ronald Acuna Jr.', sport: 'MLB', team: 'Atlanta Braves', injuryType: 'ACL Recovery', bodyPart: 'Right Knee', severity: 'severe', status: 'ir', dateReported: '2025-05-15', estimatedReturn: '2026-04-10', gamesExpectedMissed: 120, notes: 'Continuing ACL rehab; spring training appearances expected.' },
  { id: 'inj-4', playerId: 'p-4', playerName: 'Ja Morant', sport: 'NBA', team: 'Memphis Grizzlies', injuryType: 'Shoulder Strain', bodyPart: 'Right Shoulder', severity: 'moderate', status: 'out', dateReported: '2026-02-28', estimatedReturn: '2026-03-20', gamesExpectedMissed: 5, notes: 'Rotator cuff inflammation; responding well to rest.' },
  { id: 'inj-5', playerId: 'p-5', playerName: 'Connor McDavid', sport: 'NHL', team: 'Edmonton Oilers', injuryType: 'Lower Body', bodyPart: 'Undisclosed', severity: 'minor', status: 'day_to_day', dateReported: '2026-03-05', estimatedReturn: '2026-03-10', gamesExpectedMissed: 1, notes: 'Left practice early; listed as day-to-day.' },
];

const INJURY_PROBABILITIES: InjuryProbability[] = [
  { playerId: 'p-1', playerName: 'Patrick Mahomes', sport: 'NFL', team: 'Kansas City Chiefs', age: 30, position: 'QB', injuryRisk: 28, riskTrend: 'stable', priorInjuries: 3, workloadIndex: 72, softTissueRisk: 22, concussionHistory: 0, projectedGamesLost: 1.2, cardValueImpact: -3.5, confidenceInterval: [18, 38] },
  { playerId: 'p-2', playerName: 'Anthony Davis', sport: 'NBA', team: 'Los Angeles Lakers', age: 33, position: 'PF/C', injuryRisk: 82, riskTrend: 'increasing', priorInjuries: 18, workloadIndex: 65, softTissueRisk: 75, concussionHistory: 1, projectedGamesLost: 22.5, cardValueImpact: -15.2, confidenceInterval: [72, 92] },
  { playerId: 'p-3', playerName: 'Ronald Acuna Jr.', sport: 'MLB', team: 'Atlanta Braves', age: 28, position: 'OF', injuryRisk: 68, riskTrend: 'decreasing', priorInjuries: 5, workloadIndex: 40, softTissueRisk: 55, concussionHistory: 0, projectedGamesLost: 35, cardValueImpact: -8.0, confidenceInterval: [55, 78] },
  { playerId: 'p-4', playerName: 'Ja Morant', sport: 'NBA', team: 'Memphis Grizzlies', age: 26, position: 'PG', injuryRisk: 55, riskTrend: 'stable', priorInjuries: 8, workloadIndex: 70, softTissueRisk: 48, concussionHistory: 0, projectedGamesLost: 12, cardValueImpact: -7.5, confidenceInterval: [42, 68] },
  { playerId: 'p-5', playerName: 'Connor McDavid', sport: 'NHL', team: 'Edmonton Oilers', age: 29, position: 'C', injuryRisk: 20, riskTrend: 'stable', priorInjuries: 4, workloadIndex: 85, softTissueRisk: 18, concussionHistory: 1, projectedGamesLost: 2.5, cardValueImpact: -2.0, confidenceInterval: [12, 30] },
  { playerId: 'p-6', playerName: 'LeBron James', sport: 'NBA', team: 'Los Angeles Lakers', age: 41, position: 'SF', injuryRisk: 72, riskTrend: 'increasing', priorInjuries: 12, workloadIndex: 55, softTissueRisk: 65, concussionHistory: 0, projectedGamesLost: 18, cardValueImpact: -4.0, confidenceInterval: [60, 85] },
  { playerId: 'p-7', playerName: 'Mike Trout', sport: 'MLB', team: 'Los Angeles Angels', age: 34, position: 'CF', injuryRisk: 85, riskTrend: 'increasing', priorInjuries: 14, workloadIndex: 35, softTissueRisk: 80, concussionHistory: 0, projectedGamesLost: 65, cardValueImpact: -12.0, confidenceInterval: [75, 95] },
  { playerId: 'p-8', playerName: 'Saquon Barkley', sport: 'NFL', team: 'Philadelphia Eagles', age: 29, position: 'RB', injuryRisk: 60, riskTrend: 'stable', priorInjuries: 6, workloadIndex: 78, softTissueRisk: 58, concussionHistory: 0, projectedGamesLost: 4, cardValueImpact: -6.5, confidenceInterval: [48, 72] },
  { playerId: 'p-9', playerName: 'Luka Doncic', sport: 'NBA', team: 'Los Angeles Lakers', age: 27, position: 'PG/SG', injuryRisk: 45, riskTrend: 'increasing', priorInjuries: 7, workloadIndex: 82, softTissueRisk: 40, concussionHistory: 0, projectedGamesLost: 10, cardValueImpact: -5.5, confidenceInterval: [33, 58] },
  { playerId: 'p-10', playerName: 'Shohei Ohtani', sport: 'MLB', team: 'Los Angeles Dodgers', age: 31, position: 'DH/SP', injuryRisk: 52, riskTrend: 'decreasing', priorInjuries: 4, workloadIndex: 88, softTissueRisk: 50, concussionHistory: 0, projectedGamesLost: 15, cardValueImpact: -6.0, confidenceInterval: [40, 65] },
  { playerId: 'p-11', playerName: 'Travis Kelce', sport: 'NFL', team: 'Kansas City Chiefs', age: 36, position: 'TE', injuryRisk: 65, riskTrend: 'increasing', priorInjuries: 9, workloadIndex: 60, softTissueRisk: 62, concussionHistory: 2, projectedGamesLost: 5, cardValueImpact: -8.0, confidenceInterval: [52, 78] },
  { playerId: 'p-12', playerName: 'Victor Wembanyama', sport: 'NBA', team: 'San Antonio Spurs', age: 22, position: 'C', injuryRisk: 38, riskTrend: 'stable', priorInjuries: 2, workloadIndex: 75, softTissueRisk: 35, concussionHistory: 0, projectedGamesLost: 6, cardValueImpact: -4.5, confidenceInterval: [25, 50] },
  { playerId: 'p-13', playerName: 'Aaron Judge', sport: 'MLB', team: 'New York Yankees', age: 34, position: 'RF', injuryRisk: 70, riskTrend: 'stable', priorInjuries: 11, workloadIndex: 72, softTissueRisk: 68, concussionHistory: 0, projectedGamesLost: 28, cardValueImpact: -9.0, confidenceInterval: [58, 82] },
  { playerId: 'p-14', playerName: 'Josh Allen', sport: 'NFL', team: 'Buffalo Bills', age: 30, position: 'QB', injuryRisk: 35, riskTrend: 'stable', priorInjuries: 5, workloadIndex: 80, softTissueRisk: 30, concussionHistory: 1, projectedGamesLost: 1.8, cardValueImpact: -4.0, confidenceInterval: [22, 48] },
  { playerId: 'p-15', playerName: 'Nikola Jokic', sport: 'NBA', team: 'Denver Nuggets', age: 31, position: 'C', injuryRisk: 25, riskTrend: 'stable', priorInjuries: 3, workloadIndex: 80, softTissueRisk: 20, concussionHistory: 0, projectedGamesLost: 4, cardValueImpact: -2.5, confidenceInterval: [15, 35] },
  { playerId: 'p-16', playerName: 'Caitlin Clark', sport: 'WNBA', team: 'Indiana Fever', age: 24, position: 'PG', injuryRisk: 22, riskTrend: 'stable', priorInjuries: 1, workloadIndex: 70, softTissueRisk: 18, concussionHistory: 0, projectedGamesLost: 2, cardValueImpact: -3.0, confidenceInterval: [12, 32] },
];

const TRADE_SCENARIOS: TradeDeadlineScenario[] = [
  { id: 'ts-1', playerId: 'p-7', playerName: 'Mike Trout', currentTeam: 'Los Angeles Angels', sport: 'MLB', moveType: 'trade', probability: 35, potentialTeams: [{ team: 'New York Mets', probability: 40, cardImpact: 12 }, { team: 'Philadelphia Phillies', probability: 30, cardImpact: 15 }, { team: 'Houston Astros', probability: 20, cardImpact: 8 }], deadline: '2026-07-30', contractValue: 35500000, analysis: 'Angels rebuilding; Trout has partial no-trade clause but may waive for contender. Health is key variable.', cardValueUpside: 18, cardValueDownside: -5 },
  { id: 'ts-2', playerId: 'p-4', playerName: 'Ja Morant', currentTeam: 'Memphis Grizzlies', sport: 'NBA', moveType: 'trade', probability: 20, potentialTeams: [{ team: 'Miami Heat', probability: 35, cardImpact: 10 }, { team: 'New York Knicks', probability: 30, cardImpact: 18 }, { team: 'Golden State Warriors', probability: 15, cardImpact: 8 }], deadline: '2026-02-06', contractValue: 34000000, analysis: 'Grizzlies unlikely to move Morant but persistent injury concerns could shift calculus.', cardValueUpside: 22, cardValueDownside: -10 },
  { id: 'ts-3', playerId: 'p-13', playerName: 'Aaron Judge', currentTeam: 'New York Yankees', sport: 'MLB', moveType: 'extension', probability: 45, potentialTeams: [{ team: 'New York Yankees', probability: 85, cardImpact: 5 }], deadline: '2026-04-01', contractValue: 40000000, years: 3, analysis: 'Judge extension talks ongoing. Injury history is key negotiation factor.', cardValueUpside: 8, cardValueDownside: -3 },
  { id: 'ts-4', playerId: 'p-8', playerName: 'Saquon Barkley', currentTeam: 'Philadelphia Eagles', sport: 'NFL', moveType: 'extension', probability: 55, potentialTeams: [{ team: 'Philadelphia Eagles', probability: 75, cardImpact: 6 }, { team: 'Free Agency', probability: 25, cardImpact: -4 }], deadline: '2026-07-15', contractValue: 13000000, years: 2, analysis: 'Eagles expected to lock up Barkley long-term after strong season.', cardValueUpside: 10, cardValueDownside: -8 },
  { id: 'ts-5', playerId: 'p-10', playerName: 'Shohei Ohtani', currentTeam: 'Los Angeles Dodgers', sport: 'MLB', moveType: 'extension', probability: 0, potentialTeams: [{ team: 'Los Angeles Dodgers', probability: 100, cardImpact: 2 }], deadline: '2033-12-31', contractValue: 70000000, years: 8, analysis: 'Locked into historic 10yr/$700M deal. No trade risk. Focus on health milestones.', cardValueUpside: 25, cardValueDownside: -15 },
  { id: 'ts-6', playerId: 'p-16', playerName: 'Caitlin Clark', currentTeam: 'Indiana Fever', sport: 'WNBA', moveType: 'extension', probability: 90, potentialTeams: [{ team: 'Indiana Fever', probability: 95, cardImpact: 12 }], deadline: '2026-09-01', contractValue: 500000, years: 4, analysis: 'Max extension expected. Card values already pricing in supermax-level deal.', cardValueUpside: 15, cardValueDownside: -2 },
];

const RETIREMENT_WATCH: RetirementWatch[] = [
  { playerId: 'p-6', playerName: 'LeBron James', sport: 'NBA', team: 'Los Angeles Lakers', age: 41, seasonsPlayed: 23, retirementProbability: 75, expectedSeasonsRemaining: 0.5, lastContractYear: true, recentPerformanceDecline: true, publicStatements: ['I want to play with Bronny as long as possible', 'My body will tell me when it\'s time', 'This could be the last chapter'], cardValueAtRetirement: 25, recommendedAction: 'hold', timeline: 'End of 2025-26 season' },
  { playerId: 'p-11', playerName: 'Travis Kelce', sport: 'NFL', team: 'Kansas City Chiefs', age: 36, seasonsPlayed: 13, retirementProbability: 55, expectedSeasonsRemaining: 1, lastContractYear: false, recentPerformanceDecline: true, publicStatements: ['I still love the game', 'Taking it year by year', 'Broadcasting is interesting'], cardValueAtRetirement: 15, recommendedAction: 'hold', timeline: 'After 2026 NFL season' },
  { playerId: 'p-7', playerName: 'Mike Trout', sport: 'MLB', team: 'Los Angeles Angels', age: 34, seasonsPlayed: 14, retirementProbability: 25, expectedSeasonsRemaining: 3, lastContractYear: false, recentPerformanceDecline: true, publicStatements: ['I want to honor my contract', 'Health is my focus'], cardValueAtRetirement: 20, recommendedAction: 'accumulate', timeline: '2028-2029 window' },
  { playerId: 'p-15b', playerName: 'Tom Brady (Comparator)', sport: 'NFL', team: 'Retired', age: 48, seasonsPlayed: 23, retirementProbability: 100, expectedSeasonsRemaining: 0, lastContractYear: false, recentPerformanceDecline: false, publicStatements: ['For good this time'], cardValueAtRetirement: 35, recommendedAction: 'hold', timeline: 'Retired 2024' },
  { playerId: 'p-17', playerName: 'Kevin Durant', sport: 'NBA', team: 'Phoenix Suns', age: 37, seasonsPlayed: 17, retirementProbability: 35, expectedSeasonsRemaining: 2, lastContractYear: false, recentPerformanceDecline: false, publicStatements: ['Still got a lot of ball left', 'Championships are the only goal'], cardValueAtRetirement: 18, recommendedAction: 'hold', timeline: '2027-2028 window' },
];

const HOF_PROBABILITIES: HallOfFameProb[] = [
  { playerId: 'p-6', playerName: 'LeBron James', sport: 'NBA', position: 'SF', hofProbability: 99.9, yearsUntilEligible: 4, keyStats: [{ label: 'Points', value: '40,474', percentile: 100 }, { label: 'Assists', value: '11,009', percentile: 99 }, { label: 'MVPs', value: '4', percentile: 99 }], comparablePlayers: ['Michael Jordan', 'Kareem Abdul-Jabbar'], longTermHoldSignal: 'strong_buy', projectedValueMultiplier: 2.5, inductionYear: 2030 },
  { playerId: 'p-1', playerName: 'Patrick Mahomes', sport: 'NFL', position: 'QB', hofProbability: 95.2, yearsUntilEligible: 10, keyStats: [{ label: 'TD Passes', value: '230+', percentile: 95 }, { label: 'Super Bowls', value: '3', percentile: 99 }, { label: 'MVPs', value: '3', percentile: 99 }], comparablePlayers: ['Tom Brady', 'Joe Montana'], longTermHoldSignal: 'strong_buy', projectedValueMultiplier: 3.0, inductionYear: 2036 },
  { playerId: 'p-5', playerName: 'Connor McDavid', sport: 'NHL', position: 'C', hofProbability: 98.5, yearsUntilEligible: 12, keyStats: [{ label: 'Points', value: '982', percentile: 98 }, { label: 'Art Ross', value: '5', percentile: 99 }, { label: 'Hart Trophy', value: '4', percentile: 99 }], comparablePlayers: ['Wayne Gretzky', 'Mario Lemieux'], longTermHoldSignal: 'strong_buy', projectedValueMultiplier: 2.8, inductionYear: 2038 },
  { playerId: 'p-10', playerName: 'Shohei Ohtani', sport: 'MLB', position: 'DH/SP', hofProbability: 92.0, yearsUntilEligible: 12, keyStats: [{ label: 'HR', value: '225+', percentile: 90 }, { label: 'Wins', value: '38', percentile: 60 }, { label: 'WAR', value: '42+', percentile: 92 }], comparablePlayers: ['Babe Ruth'], longTermHoldSignal: 'strong_buy', projectedValueMultiplier: 3.5, inductionYear: 2038 },
  { playerId: 'p-15', playerName: 'Nikola Jokic', sport: 'NBA', position: 'C', hofProbability: 97.8, yearsUntilEligible: 8, keyStats: [{ label: 'Triple-Doubles', value: '130+', percentile: 99 }, { label: 'MVPs', value: '3', percentile: 99 }, { label: 'Championships', value: '1', percentile: 80 }], comparablePlayers: ['Larry Bird', 'Hakeem Olajuwon'], longTermHoldSignal: 'strong_buy', projectedValueMultiplier: 2.2, inductionYear: 2034 },
  { playerId: 'p-9', playerName: 'Luka Doncic', sport: 'NBA', position: 'PG/SG', hofProbability: 85.0, yearsUntilEligible: 15, keyStats: [{ label: 'PPG Career', value: '28.7', percentile: 98 }, { label: 'All-NBA', value: '5', percentile: 95 }, { label: 'Triple-Doubles', value: '80+', percentile: 98 }], comparablePlayers: ['James Harden', 'Oscar Robertson'], longTermHoldSignal: 'buy', projectedValueMultiplier: 2.0, inductionYear: 2041 },
  { playerId: 'p-12', playerName: 'Victor Wembanyama', sport: 'NBA', position: 'C', hofProbability: 62.0, yearsUntilEligible: 20, keyStats: [{ label: 'BPG', value: '3.8', percentile: 99 }, { label: 'DPOY', value: '1', percentile: 90 }, { label: 'ROY', value: '1', percentile: 70 }], comparablePlayers: ['Tim Duncan', 'Hakeem Olajuwon'], longTermHoldSignal: 'buy', projectedValueMultiplier: 4.0, inductionYear: 2046 },
  { playerId: 'p-16', playerName: 'Caitlin Clark', sport: 'WNBA', position: 'PG', hofProbability: 55.0, yearsUntilEligible: 18, keyStats: [{ label: 'APG', value: '8.4', percentile: 99 }, { label: 'ROY', value: '1', percentile: 70 }, { label: '3PM', value: '200+', percentile: 95 }], comparablePlayers: ['Diana Taurasi', 'Sue Bird'], longTermHoldSignal: 'buy', projectedValueMultiplier: 3.0, inductionYear: 2044 },
  { playerId: 'p-13', playerName: 'Aaron Judge', sport: 'MLB', position: 'RF', hofProbability: 58.0, yearsUntilEligible: 8, keyStats: [{ label: 'HR', value: '310+', percentile: 92 }, { label: 'MVP', value: '1', percentile: 80 }, { label: 'OPS+', value: '170+', percentile: 98 }], comparablePlayers: ['Frank Thomas', 'Jim Thome'], longTermHoldSignal: 'hold', projectedValueMultiplier: 1.5, inductionYear: 2034 },
];

const CARD_IMPACT_PROJECTIONS: CardImpactProjection[] = [
  { id: 'ci-1', playerId: 'p-6', playerName: 'LeBron James', eventType: 'retirement', eventDescription: 'LeBron James announces retirement at end of 2025-26 season', eventDate: '2026-06-15', probability: 75, cardValueBefore: 850, cardValueAfter: 1100, percentChange: 29.4, affectedCards: [{ cardName: '2003 Topps Chrome Refractor', year: '2003', set: 'Topps Chrome', impact: 35 }, { cardName: '2003 Upper Deck Exquisite RPA', year: '2003', set: 'Upper Deck Exquisite', impact: 28 }], recommendation: 'Hold all LeBron rookie cards; retirement spike historically 25-40%.', urgency: 'high' },
  { id: 'ci-2', playerId: 'p-2', playerName: 'Anthony Davis', eventType: 'injury', eventDescription: 'Chronic knee issues could limit AD to 50 games or fewer', eventDate: '2026-04-15', probability: 65, cardValueBefore: 120, cardValueAfter: 85, percentChange: -29.2, affectedCards: [{ cardName: '2012 Panini Prizm Silver', year: '2012', set: 'Panini Prizm', impact: -30 }, { cardName: '2012 National Treasures RPA', year: '2012', set: 'National Treasures', impact: -25 }], recommendation: 'Consider selling AD cards; injury risk severely depresses long-term value.', urgency: 'high' },
  { id: 'ci-3', playerId: 'p-7', playerName: 'Mike Trout', eventType: 'trade', eventDescription: 'Trout traded to contender at MLB trade deadline', eventDate: '2026-07-30', probability: 35, cardValueBefore: 250, cardValueAfter: 320, percentChange: 28.0, affectedCards: [{ cardName: '2011 Topps Update RC', year: '2011', set: 'Topps Update', impact: 30 }, { cardName: '2009 Bowman Chrome Auto', year: '2009', set: 'Bowman Chrome', impact: 25 }], recommendation: 'Accumulate Trout cards pre-deadline; trade to contender would reignite market.', urgency: 'medium' },
  { id: 'ci-4', playerId: 'p-1', playerName: 'Patrick Mahomes', eventType: 'milestone', eventDescription: 'Mahomes on pace for 4th Super Bowl before age 32', eventDate: '2027-02-08', probability: 25, cardValueBefore: 600, cardValueAfter: 850, percentChange: 41.7, affectedCards: [{ cardName: '2017 Panini Prizm Silver', year: '2017', set: 'Panini Prizm', impact: 45 }, { cardName: '2017 National Treasures RPA', year: '2017', set: 'National Treasures', impact: 40 }], recommendation: 'Strong long-term hold; dynasty narrative drives premium.', urgency: 'low' },
  { id: 'ci-5', playerId: 'p-16', playerName: 'Caitlin Clark', eventType: 'milestone', eventDescription: 'Clark leads Fever to first WNBA championship', eventDate: '2026-10-15', probability: 15, cardValueBefore: 180, cardValueAfter: 350, percentChange: 94.4, affectedCards: [{ cardName: '2024 Panini Prizm RC', year: '2024', set: 'Panini Prizm', impact: 100 }, { cardName: '2024 Select RC', year: '2024', set: 'Panini Select', impact: 85 }], recommendation: 'Speculative hold; championship would be transformative for WNBA card market.', urgency: 'medium' },
  { id: 'ci-6', playerId: 'p-12', playerName: 'Victor Wembanyama', eventType: 'milestone', eventDescription: 'Wembanyama wins DPOY + MVP in same season', eventDate: '2026-06-01', probability: 20, cardValueBefore: 400, cardValueAfter: 650, percentChange: 62.5, affectedCards: [{ cardName: '2023 Panini Prizm Silver RC', year: '2023', set: 'Panini Prizm', impact: 65 }, { cardName: '2023 Flawless RPA', year: '2023', set: 'Panini Flawless', impact: 55 }], recommendation: 'Accumulate pre-awards season; generational talent with massive upside.', urgency: 'medium' },
];

const PLAYER_HEALTH_TIMELINES: PlayerHealthTimeline[] = [
  {
    playerId: 'p-2', playerName: 'Anthony Davis', sport: 'NBA',
    entries: [
      { date: '2024-01-10', event: 'Calf strain - missed 5 games', type: 'injury', severity: 'minor', gamesImpacted: 5, cardValueChange: -3 },
      { date: '2024-03-15', event: 'Returned to full practice', type: 'recovery', gamesImpacted: 0, cardValueChange: 2 },
      { date: '2024-11-22', event: 'Knee bone bruise', type: 'injury', severity: 'moderate', gamesImpacted: 12, cardValueChange: -8 },
      { date: '2025-01-05', event: 'Cleared for contact', type: 'recovery', gamesImpacted: 0, cardValueChange: 4 },
      { date: '2025-04-10', event: 'Hip flexor strain (playoffs)', type: 'injury', severity: 'moderate', gamesImpacted: 4, cardValueChange: -10 },
      { date: '2025-10-20', event: 'Full preseason participation', type: 'milestone', gamesImpacted: 0, cardValueChange: 3 },
      { date: '2026-02-20', event: 'Left knee contusion (current)', type: 'injury', severity: 'moderate', gamesImpacted: 8, cardValueChange: -6 },
    ],
    currentStatus: 'Out - Knee contusion', overallDurability: 32, careerGamesPlayed: 650, careerGamesMissed: 180,
  },
  {
    playerId: 'p-7', playerName: 'Mike Trout', sport: 'MLB',
    entries: [
      { date: '2021-05-17', event: 'Calf strain - IL stint', type: 'injury', severity: 'moderate', gamesImpacted: 98, cardValueChange: -15 },
      { date: '2022-07-12', event: 'Back surgery', type: 'surgery', severity: 'severe', gamesImpacted: 60, cardValueChange: -20 },
      { date: '2023-04-01', event: 'Returned to lineup', type: 'recovery', gamesImpacted: 0, cardValueChange: 10 },
      { date: '2023-07-03', event: 'Meniscus tear - season over', type: 'injury', severity: 'severe', gamesImpacted: 80, cardValueChange: -18 },
      { date: '2024-04-15', event: 'Full spring training', type: 'milestone', gamesImpacted: 0, cardValueChange: 8 },
      { date: '2024-08-20', event: 'Knee soreness - precautionary rest', type: 'injury', severity: 'minor', gamesImpacted: 10, cardValueChange: -5 },
      { date: '2025-03-01', event: 'Healthy entering season', type: 'milestone', gamesImpacted: 0, cardValueChange: 5 },
    ],
    currentStatus: 'Healthy - Spring Training', overallDurability: 38, careerGamesPlayed: 1200, careerGamesMissed: 420,
  },
  {
    playerId: 'p-3', playerName: 'Ronald Acuna Jr.', sport: 'MLB',
    entries: [
      { date: '2021-07-10', event: 'ACL tear (first)', type: 'injury', severity: 'severe', gamesImpacted: 100, cardValueChange: -22 },
      { date: '2022-04-28', event: 'Returned from ACL', type: 'recovery', gamesImpacted: 0, cardValueChange: 15 },
      { date: '2023-09-01', event: 'MVP-caliber season', type: 'milestone', gamesImpacted: 0, cardValueChange: 30 },
      { date: '2025-05-15', event: 'ACL tear (second) - season over', type: 'injury', severity: 'severe', gamesImpacted: 120, cardValueChange: -25 },
      { date: '2025-06-01', event: 'ACL reconstruction surgery', type: 'surgery', severity: 'severe', gamesImpacted: 0, cardValueChange: -5 },
      { date: '2026-02-01', event: 'Rehab on track; light fielding drills', type: 'recovery', gamesImpacted: 0, cardValueChange: 8 },
    ],
    currentStatus: 'IR - ACL Recovery (on track)', overallDurability: 45, careerGamesPlayed: 700, careerGamesMissed: 260,
  },
];

const UPCOMING_EVENTS: UpcomingRosterEvent[] = [
  { id: 'ue-1', date: '2026-03-15', eventType: 'injury_update', playerName: 'Patrick Mahomes', sport: 'NFL', team: 'Kansas City Chiefs', description: 'Ankle re-evaluation scheduled', cardImpactRange: [-2, 1], importance: 'medium' },
  { id: 'ue-2', date: '2026-03-20', eventType: 'injury_update', playerName: 'Ja Morant', sport: 'NBA', team: 'Memphis Grizzlies', description: 'Expected return from shoulder strain', cardImpactRange: [3, 8], importance: 'high' },
  { id: 'ue-3', date: '2026-03-25', eventType: 'injury_update', playerName: 'Anthony Davis', sport: 'NBA', team: 'Los Angeles Lakers', description: 'Knee contusion follow-up MRI', cardImpactRange: [-10, 5], importance: 'high' },
  { id: 'ue-4', date: '2026-04-01', eventType: 'contract_decision', playerName: 'Aaron Judge', sport: 'MLB', team: 'New York Yankees', description: 'Extension talks deadline', cardImpactRange: [-3, 8], importance: 'high' },
  { id: 'ue-5', date: '2026-04-10', eventType: 'injury_update', playerName: 'Ronald Acuna Jr.', sport: 'MLB', team: 'Atlanta Braves', description: 'Expected return from ACL rehab', cardImpactRange: [5, 20], importance: 'critical' },
  { id: 'ue-6', date: '2026-06-15', eventType: 'retirement', playerName: 'LeBron James', sport: 'NBA', team: 'Los Angeles Lakers', description: 'Potential retirement announcement window', cardImpactRange: [15, 40], importance: 'critical' },
  { id: 'ue-7', date: '2026-07-01', eventType: 'free_agency', playerName: 'Various NBA', sport: 'NBA', team: 'Multiple', description: 'NBA Free Agency opens', cardImpactRange: [-15, 25], importance: 'high' },
  { id: 'ue-8', date: '2026-07-30', eventType: 'trade', playerName: 'MLB Deadline', sport: 'MLB', team: 'Multiple', description: 'MLB Trade Deadline', cardImpactRange: [-10, 30], importance: 'critical' },
  { id: 'ue-9', date: '2026-09-01', eventType: 'extension', playerName: 'Caitlin Clark', sport: 'WNBA', team: 'Indiana Fever', description: 'Max extension expected', cardImpactRange: [8, 15], importance: 'high' },
];

// ---- Service Functions ----

export function getInjuryReports(): InjuryReport[] {
  return INJURY_REPORTS;
}

export function getInjuryProbabilities(): InjuryProbability[] {
  return INJURY_PROBABILITIES.sort((a, b) => b.injuryRisk - a.injuryRisk);
}

export function getRosterMoves(): TradeDeadlineScenario[] {
  return TRADE_SCENARIOS;
}

export function getTradeScenarios(): TradeDeadlineScenario[] {
  return TRADE_SCENARIOS.filter((s) => s.moveType === 'trade');
}

export function getRetirementWatch(): RetirementWatch[] {
  return RETIREMENT_WATCH.sort((a, b) => b.retirementProbability - a.retirementProbability);
}

export function getHOFProbabilities(): HallOfFameProb[] {
  return HOF_PROBABILITIES.sort((a, b) => b.hofProbability - a.hofProbability);
}

export function getCardImpact(): CardImpactProjection[] {
  return CARD_IMPACT_PROJECTIONS.sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}

export function getPlayerHealth(playerId?: string): PlayerHealthTimeline[] {
  if (playerId) {
    return PLAYER_HEALTH_TIMELINES.filter((p) => p.playerId === playerId);
  }
  return PLAYER_HEALTH_TIMELINES;
}

export function getUpcomingEvents(): UpcomingRosterEvent[] {
  return UPCOMING_EVENTS.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
