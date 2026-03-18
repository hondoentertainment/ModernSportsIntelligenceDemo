// Phase 145: Referee & Rule Change Impact Modeler
// Analyzes how rule changes across sports affect player stats, card values, and collecting strategy

// ---- Types ----

export type Sport = 'mlb' | 'nfl' | 'nba' | 'nhl' | 'soccer';

export type ImpactCategory =
  | 'offensive-boost'
  | 'defensive-nerf'
  | 'pace-change'
  | 'scoring-change'
  | 'safety';

export type RuleStatus = 'implemented' | 'approved' | 'proposed' | 'hypothetical';

export type Confidence = 'high' | 'medium' | 'low';

export interface RuleChange {
  id: string;
  sport: Sport;
  name: string;
  description: string;
  category: ImpactCategory;
  status: RuleStatus;
  implementedDate?: string;
  proposedDate?: string;
  season?: string;
  source: string;
  cardPriceImpactPct: number; // overall average % impact
  confidence: Confidence;
}

export interface StatDistributionShift {
  id: string;
  ruleChangeId: string;
  statName: string;
  sport: Sport;
  beforeMean: number;
  afterMean: number;
  beforeStdDev: number;
  afterStdDev: number;
  shiftPct: number;
  sampleSize: number;
  pValue: number;
  unit: string;
}

export interface PlayerImpactProfile {
  id: string;
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  sport: Sport;
  ruleChangeId: string;
  impactScore: number; // -100 to +100
  cardValueChangePct: number;
  keyStatsBefore: Record<string, number>;
  keyStatsAfter: Record<string, number>;
  reasoning: string;
  tier: 'major-winner' | 'minor-winner' | 'neutral' | 'minor-loser' | 'major-loser';
}

export interface HistoricalRuleChange {
  id: string;
  ruleChangeId: string;
  sport: Sport;
  name: string;
  year: number;
  description: string;
  category: ImpactCategory;
  avgCardPriceImpactPct: number;
  topWinner: string;
  topWinnerImpactPct: number;
  topLoser: string;
  topLoserImpactPct: number;
  leagueAvgStatChange: Record<string, number>;
  marketReactionDays: number;
  sustainedMonths: number;
}

export interface CardPriceImpact {
  id: string;
  ruleChangeId: string;
  cardName: string;
  playerName: string;
  sport: Sport;
  beforePrice: number;
  afterPrice: number;
  changePct: number;
  timeframe: string;
  grade: string;
}

export interface PositionImpact {
  id: string;
  ruleChangeId: string;
  sport: Sport;
  position: string;
  impactScore: number; // -100 to +100
  avgCardValueChangePct: number;
  volumeChangePct: number;
  reasoning: string;
}

export interface RuleChangeScenario {
  id: string;
  name: string;
  sport: Sport;
  description: string;
  category: ImpactCategory;
  probability: number; // 0-100
  estimatedImpactPct: number;
  affectedPositions: string[];
  projectedWinners: string[];
  projectedLosers: string[];
  timelineEstimate: string;
}

export interface ProjectedStatLine {
  id: string;
  ruleChangeId: string;
  playerName: string;
  sport: Sport;
  position: string;
  stats: Record<string, { before: number; after: number; changePct: number }>;
  overallImpact: number;
  cardValueProjection: number;
}

export interface RuleChangeTimelineEvent {
  id: string;
  ruleChangeId: string;
  date: string;
  title: string;
  description: string;
  type: 'announcement' | 'vote' | 'implementation' | 'market-reaction' | 'stat-shift';
  sport: Sport;
}

// ---- Mock Data: Historical Rule Changes ----

const historicalRuleChanges: HistoricalRuleChange[] = [
  {
    id: 'hist-1', ruleChangeId: 'rc-1', sport: 'mlb', name: 'Pitch Clock Introduction',
    year: 2023, description: 'MLB introduced a 15/20-second pitch clock to speed up games.',
    category: 'pace-change', avgCardPriceImpactPct: 8.3,
    topWinner: 'Shohei Ohtani', topWinnerImpactPct: 14.2,
    topLoser: 'Max Scherzer', topLoserImpactPct: -6.8,
    leagueAvgStatChange: { 'game_time_min': -26, 'batting_avg': 0.007, 'stolen_bases_pct': 12.4 },
    marketReactionDays: 14, sustainedMonths: 18,
  },
  {
    id: 'hist-2', ruleChangeId: 'rc-2', sport: 'mlb', name: 'Shift Ban (Defensive Alignment)',
    year: 2023, description: 'Banned extreme infield shifts; two infielders each side of second base.',
    category: 'offensive-boost', avgCardPriceImpactPct: 5.7,
    topWinner: 'Kyle Schwarber', topWinnerImpactPct: 18.5,
    topLoser: 'Matt Chapman', topLoserImpactPct: -4.2,
    leagueAvgStatChange: { 'batting_avg': 0.012, 'babip': 0.015, 'hits': 4.1 },
    marketReactionDays: 21, sustainedMonths: 12,
  },
  {
    id: 'hist-3', ruleChangeId: 'rc-3', sport: 'mlb', name: 'Larger Bases (15" to 18")',
    year: 2023, description: 'Bases enlarged from 15 to 18 inches to encourage stolen base attempts.',
    category: 'pace-change', avgCardPriceImpactPct: 6.1,
    topWinner: 'Ronald Acuna Jr.', topWinnerImpactPct: 22.4,
    topLoser: 'J.T. Realmuto', topLoserImpactPct: -3.9,
    leagueAvgStatChange: { 'stolen_bases': 28.2, 'caught_stealing_pct': -4.1 },
    marketReactionDays: 7, sustainedMonths: 15,
  },
  {
    id: 'hist-4', ruleChangeId: 'rc-4', sport: 'nba', name: 'Three-Point Line Extended (1997)',
    year: 1997, description: 'NBA moved three-point line back to 23\'9" from the shortened 22\' distance.',
    category: 'scoring-change', avgCardPriceImpactPct: -3.2,
    topWinner: 'Reggie Miller', topWinnerImpactPct: 11.7,
    topLoser: 'John Starks', topLoserImpactPct: -14.3,
    leagueAvgStatChange: { 'three_pt_pct': -3.8, 'three_pt_attempts': -1.4, 'mid_range_pct': 2.1 },
    marketReactionDays: 30, sustainedMonths: 24,
  },
  {
    id: 'hist-5', ruleChangeId: 'rc-5', sport: 'nba', name: 'Hand-Checking Eliminated (2004)',
    year: 2004, description: 'NBA eliminated hand-checking on the perimeter to increase offensive flow.',
    category: 'offensive-boost', avgCardPriceImpactPct: 12.6,
    topWinner: 'Steve Nash', topWinnerImpactPct: 34.5,
    topLoser: 'Bruce Bowen', topLoserImpactPct: -18.2,
    leagueAvgStatChange: { 'ppg_league_avg': 4.2, 'pace': 2.8, 'assists': 1.3 },
    marketReactionDays: 45, sustainedMonths: 36,
  },
  {
    id: 'hist-6', ruleChangeId: 'rc-6', sport: 'nba', name: 'Shot Clock Reduced to 14 After Offensive Rebound',
    year: 2018, description: 'Reset shot clock to 14 seconds instead of 24 after an offensive rebound.',
    category: 'pace-change', avgCardPriceImpactPct: 3.1,
    topWinner: 'Russell Westbrook', topWinnerImpactPct: 7.4,
    topLoser: 'Andre Drummond', topLoserImpactPct: -5.6,
    leagueAvgStatChange: { 'pace': 1.6, 'second_chance_pts': -2.3, 'fast_break_pts': 1.1 },
    marketReactionDays: 10, sustainedMonths: 8,
  },
  {
    id: 'hist-7', ruleChangeId: 'rc-7', sport: 'nfl', name: 'Pass Interference Review (2019)',
    year: 2019, description: 'NFL allowed coaches to challenge pass interference calls and non-calls.',
    category: 'defensive-nerf', avgCardPriceImpactPct: 2.4,
    topWinner: 'Michael Thomas', topWinnerImpactPct: 9.8,
    topLoser: 'Stephon Gilmore', topLoserImpactPct: -5.1,
    leagueAvgStatChange: { 'pi_calls': -8.2, 'passing_yards_game': 2.1 },
    marketReactionDays: 35, sustainedMonths: 6,
  },
  {
    id: 'hist-8', ruleChangeId: 'rc-8', sport: 'nfl', name: 'Taunting Penalty Emphasis (2021)',
    year: 2021, description: 'NFL strictly enforced taunting penalties with 15-yard consequences.',
    category: 'safety', avgCardPriceImpactPct: -1.2,
    topWinner: 'Davante Adams', topWinnerImpactPct: 2.1,
    topLoser: 'Tyreek Hill', topLoserImpactPct: -4.8,
    leagueAvgStatChange: { 'taunting_penalties': 42.0, 'unsportsmanlike_total': 18.4 },
    marketReactionDays: 7, sustainedMonths: 4,
  },
  {
    id: 'hist-9', ruleChangeId: 'rc-9', sport: 'nfl', name: 'Roughing the Passer Emphasis (2018)',
    year: 2018, description: 'NFL expanded roughing the passer to protect QBs, including body weight rule.',
    category: 'safety', avgCardPriceImpactPct: 7.8,
    topWinner: 'Patrick Mahomes', topWinnerImpactPct: 22.3,
    topLoser: 'Khalil Mack', topLoserImpactPct: -8.4,
    leagueAvgStatChange: { 'sacks': -6.2, 'passing_yards_game': 5.8, 'qb_hits': -11.3 },
    marketReactionDays: 14, sustainedMonths: 24,
  },
  {
    id: 'hist-10', ruleChangeId: 'rc-10', sport: 'nfl', name: 'Kickoff Touchback to 25-Yard Line',
    year: 2016, description: 'Touchbacks moved to the 25-yard line from the 20 to reduce kick return injuries.',
    category: 'safety', avgCardPriceImpactPct: -4.6,
    topWinner: 'Dak Prescott', topWinnerImpactPct: 3.2,
    topLoser: 'Cordarrelle Patterson', topLoserImpactPct: -21.8,
    leagueAvgStatChange: { 'touchback_pct': 22.5, 'return_yards_game': -18.7 },
    marketReactionDays: 21, sustainedMonths: 36,
  },
  {
    id: 'hist-11', ruleChangeId: 'rc-11', sport: 'nhl', name: 'Goalie Equipment Size Reduction (2013)',
    year: 2013, description: 'NHL mandated smaller goalie pads to increase scoring opportunities.',
    category: 'scoring-change', avgCardPriceImpactPct: 5.4,
    topWinner: 'Alex Ovechkin', topWinnerImpactPct: 11.2,
    topLoser: 'Henrik Lundqvist', topLoserImpactPct: -7.6,
    leagueAvgStatChange: { 'goals_per_game': 0.18, 'save_pct': -0.004 },
    marketReactionDays: 28, sustainedMonths: 18,
  },
  {
    id: 'hist-12', ruleChangeId: 'rc-12', sport: 'nhl', name: 'Overtime 3-on-3 Format',
    year: 2015, description: 'NHL switched overtime from 4-on-4 to 3-on-3 to reduce shootouts.',
    category: 'pace-change', avgCardPriceImpactPct: 4.7,
    topWinner: 'Connor McDavid', topWinnerImpactPct: 15.8,
    topLoser: 'Zdeno Chara', topLoserImpactPct: -6.3,
    leagueAvgStatChange: { 'ot_goals_per_game': 0.42, 'shootout_frequency_pct': -38 },
    marketReactionDays: 10, sustainedMonths: 24,
  },
  {
    id: 'hist-13', ruleChangeId: 'rc-13', sport: 'nhl', name: 'Coaches Challenge for Goaltender Interference',
    year: 2015, description: 'Teams can challenge goals for goaltender interference via video review.',
    category: 'defensive-nerf', avgCardPriceImpactPct: 1.3,
    topWinner: 'Carey Price', topWinnerImpactPct: 5.2,
    topLoser: 'Corey Perry', topLoserImpactPct: -3.8,
    leagueAvgStatChange: { 'overturned_goals_pct': 12.4 },
    marketReactionDays: 14, sustainedMonths: 6,
  },
  {
    id: 'hist-14', ruleChangeId: 'rc-14', sport: 'soccer', name: 'VAR Implementation (Premier League)',
    year: 2019, description: 'Video Assistant Referee introduced in the English Premier League.',
    category: 'defensive-nerf', avgCardPriceImpactPct: -2.1,
    topWinner: 'Mohamed Salah', topWinnerImpactPct: 6.3,
    topLoser: 'Pierre-Emerick Aubameyang', topLoserImpactPct: -8.7,
    leagueAvgStatChange: { 'penalties_per_season': 18.2, 'offside_goals_overturned': 34 },
    marketReactionDays: 60, sustainedMonths: 12,
  },
  {
    id: 'hist-15', ruleChangeId: 'rc-15', sport: 'soccer', name: 'Five Substitutions Permanent',
    year: 2022, description: 'FIFA made five substitutions permanent across all competitions.',
    category: 'pace-change', avgCardPriceImpactPct: 3.8,
    topWinner: 'Kylian Mbappe', topWinnerImpactPct: 8.1,
    topLoser: 'Jordan Henderson', topLoserImpactPct: -5.4,
    leagueAvgStatChange: { 'goals_after_70min_pct': 14.2, 'injury_rate_pct': -8.6 },
    marketReactionDays: 21, sustainedMonths: 18,
  },
  {
    id: 'hist-16', ruleChangeId: 'rc-16', sport: 'soccer', name: 'Handball Rule Clarification (2020)',
    year: 2020, description: 'IFAB clarified accidental handball; arm in natural position not penalized.',
    category: 'defensive-nerf', avgCardPriceImpactPct: -1.4,
    topWinner: 'Bruno Fernandes', topWinnerImpactPct: 9.2,
    topLoser: 'Eric Dier', topLoserImpactPct: -4.1,
    leagueAvgStatChange: { 'penalties_awarded': -11.3, 'handball_calls': -22.4 },
    marketReactionDays: 14, sustainedMonths: 8,
  },
  {
    id: 'hist-17', ruleChangeId: 'rc-17', sport: 'nba', name: 'Freedom of Movement Rules (2018)',
    year: 2018, description: 'NBA cracked down on off-ball contact, illegal screens, and take fouls.',
    category: 'offensive-boost', avgCardPriceImpactPct: 9.4,
    topWinner: 'James Harden', topWinnerImpactPct: 19.7,
    topLoser: 'Draymond Green', topLoserImpactPct: -11.3,
    leagueAvgStatChange: { 'free_throws_per_game': 2.4, 'ppg_league_avg': 3.6, 'offensive_fouls': -8.7 },
    marketReactionDays: 21, sustainedMonths: 18,
  },
  {
    id: 'hist-18', ruleChangeId: 'rc-18', sport: 'nba', name: 'Take Foul Penalty (Transition)',
    year: 2022, description: 'Take fouls in transition result in one FT plus possession retained.',
    category: 'pace-change', avgCardPriceImpactPct: 4.2,
    topWinner: 'Ja Morant', topWinnerImpactPct: 12.6,
    topLoser: 'Rudy Gobert', topLoserImpactPct: -5.8,
    leagueAvgStatChange: { 'fast_break_pts': 3.8, 'take_fouls': -72.0, 'pace': 1.4 },
    marketReactionDays: 14, sustainedMonths: 12,
  },
  {
    id: 'hist-19', ruleChangeId: 'rc-19', sport: 'nfl', name: 'Dynamic Kickoff (2024)',
    year: 2024, description: 'NFL redesigned kickoffs with alignment zones to increase returns while improving safety.',
    category: 'pace-change', avgCardPriceImpactPct: 3.5,
    topWinner: 'KaVontae Turpin', topWinnerImpactPct: 28.4,
    topLoser: 'Tyler Bass', topLoserImpactPct: -8.2,
    leagueAvgStatChange: { 'return_rate_pct': 62.0, 'touchback_pct': -41.0, 'return_yards_avg': 8.4 },
    marketReactionDays: 10, sustainedMonths: 6,
  },
  {
    id: 'hist-20', ruleChangeId: 'rc-20', sport: 'nfl', name: 'Hip-Drop Tackle Ban (2024)',
    year: 2024, description: 'NFL banned hip-drop tackles, penalized as unnecessary roughness.',
    category: 'safety', avgCardPriceImpactPct: 1.8,
    topWinner: 'Derrick Henry', topWinnerImpactPct: 6.4,
    topLoser: 'Roquan Smith', topLoserImpactPct: -4.7,
    leagueAvgStatChange: { 'hip_drop_tackles': -88.0, 'missed_tackles_pct': 3.2 },
    marketReactionDays: 7, sustainedMonths: 4,
  },
  {
    id: 'hist-21', ruleChangeId: 'rc-21', sport: 'mlb', name: 'Universal DH Adoption',
    year: 2022, description: 'National League adopted the designated hitter permanently.',
    category: 'offensive-boost', avgCardPriceImpactPct: 6.8,
    topWinner: 'Yordan Alvarez', topWinnerImpactPct: 16.3,
    topLoser: 'Madison Bumgarner', topLoserImpactPct: -9.2,
    leagueAvgStatChange: { 'nl_batting_avg': 0.008, 'nl_runs_per_game': 0.4, 'pitcher_at_bats': -100 },
    marketReactionDays: 7, sustainedMonths: 24,
  },
];

// ---- Mock Data: Current / Upcoming Rule Changes ----

const ruleChanges: RuleChange[] = [
  {
    id: 'rc-101', sport: 'mlb', name: 'Automated Ball-Strike System (ABS)',
    description: 'Full robotic umpire for ball-strike calls replacing human judgment behind the plate.',
    category: 'scoring-change', status: 'proposed', proposedDate: '2027-04-01',
    season: '2027', source: 'MLB Competition Committee',
    cardPriceImpactPct: 7.5, confidence: 'medium',
  },
  {
    id: 'rc-102', sport: 'mlb', name: 'Runner on Second in Extra Innings (Permanent)',
    description: 'Making the ghost runner rule permanent for all extra-inning games.',
    category: 'pace-change', status: 'approved', implementedDate: '2023-01-01',
    season: '2023+', source: 'MLB Official Rules',
    cardPriceImpactPct: 2.1, confidence: 'high',
  },
  {
    id: 'rc-103', sport: 'nba', name: 'Flopping Penalty Escalation',
    description: 'Progressive fines and in-game technical fouls for verified flopping violations.',
    category: 'defensive-nerf', status: 'proposed', proposedDate: '2026-10-01',
    season: '2026-27', source: 'NBA Competition Committee',
    cardPriceImpactPct: 4.2, confidence: 'medium',
  },
  {
    id: 'rc-104', sport: 'nba', name: 'Four-Point Line at 28 Feet',
    description: 'Hypothetical addition of a four-point arc at 28 feet from the basket.',
    category: 'scoring-change', status: 'hypothetical',
    season: 'Hypothetical', source: 'Analytics Community Discussion',
    cardPriceImpactPct: 18.5, confidence: 'low',
  },
  {
    id: 'rc-105', sport: 'nfl', name: 'Guardian Cap Mandate (All Positions)',
    description: 'Requiring padded helmet covers for all positions during games, not just practice.',
    category: 'safety', status: 'proposed', proposedDate: '2027-09-01',
    season: '2027', source: 'NFL Competition Committee',
    cardPriceImpactPct: -1.5, confidence: 'low',
  },
  {
    id: 'rc-106', sport: 'nfl', name: 'Expanded Replay Review (Holdings)',
    description: 'Allowing replay review of offensive and defensive holding penalties.',
    category: 'defensive-nerf', status: 'proposed', proposedDate: '2027-09-01',
    season: '2027', source: 'NFL Owners Meeting Proposal',
    cardPriceImpactPct: 3.8, confidence: 'medium',
  },
  {
    id: 'rc-107', sport: 'nfl', name: '18-Game Regular Season',
    description: 'Expanding the NFL regular season from 17 to 18 games.',
    category: 'pace-change', status: 'proposed', proposedDate: '2028-09-01',
    season: '2028', source: 'NFLPA CBA Discussions',
    cardPriceImpactPct: 8.4, confidence: 'medium',
  },
  {
    id: 'rc-108', sport: 'nhl', name: 'Larger Net Openings',
    description: 'Hypothetical increase of net dimensions to boost scoring in the modern era.',
    category: 'scoring-change', status: 'hypothetical',
    season: 'Hypothetical', source: 'Hockey Analytics Community',
    cardPriceImpactPct: 14.2, confidence: 'low',
  },
  {
    id: 'rc-109', sport: 'nhl', name: 'No-Touch Icing Permanent',
    description: 'Making hybrid icing the permanent standard to reduce high-speed collisions at the boards.',
    category: 'safety', status: 'implemented', implementedDate: '2013-10-01',
    season: '2013+', source: 'NHL Official Rules',
    cardPriceImpactPct: 1.2, confidence: 'high',
  },
  {
    id: 'rc-110', sport: 'soccer', name: 'Semi-Automated Offside Technology',
    description: 'AI-powered offside detection using limb-tracking cameras, reducing VAR delays.',
    category: 'pace-change', status: 'approved', implementedDate: '2024-08-01',
    season: '2024-25', source: 'FIFA/UEFA',
    cardPriceImpactPct: 2.8, confidence: 'high',
  },
  {
    id: 'rc-111', sport: 'soccer', name: 'Blue Cards (Sin Bin Trials)',
    description: 'Temporary 10-minute dismissals for tactical fouls, dissent, and persistent fouling.',
    category: 'defensive-nerf', status: 'proposed', proposedDate: '2026-08-01',
    season: '2026-27', source: 'IFAB Trials',
    cardPriceImpactPct: 5.6, confidence: 'medium',
  },
  {
    id: 'rc-112', sport: 'nba', name: 'Coach Challenge Expansion (3 per game)',
    description: 'Increasing coach challenges from 1 to 3 per game with escalating stakes.',
    category: 'defensive-nerf', status: 'proposed', proposedDate: '2026-10-01',
    season: '2026-27', source: 'NBA Board of Governors',
    cardPriceImpactPct: 1.8, confidence: 'medium',
  },
  {
    id: 'rc-113', sport: 'mlb', name: 'Electronic Pitch Calling',
    description: 'Replacing catcher signals with electronic communication from dugout to pitcher.',
    category: 'pace-change', status: 'approved', implementedDate: '2025-04-01',
    season: '2025', source: 'MLB Technology Committee',
    cardPriceImpactPct: 1.4, confidence: 'high',
  },
  {
    id: 'rc-114', sport: 'nfl', name: 'Fourth-and-15 Onside Kick Alternative',
    description: 'Teams can attempt a 4th-and-15 from their own 25 instead of an onside kick.',
    category: 'scoring-change', status: 'hypothetical',
    season: 'Hypothetical', source: 'NFL Competition Committee Discussion',
    cardPriceImpactPct: 6.2, confidence: 'low',
  },
  {
    id: 'rc-115', sport: 'soccer', name: 'Multi-Ball System',
    description: 'Keeping multiple balls around the pitch perimeter to reduce dead time.',
    category: 'pace-change', status: 'implemented', implementedDate: '2022-11-01',
    season: '2022+', source: 'FIFA World Cup Rules',
    cardPriceImpactPct: 1.1, confidence: 'high',
  },
  {
    id: 'rc-116', sport: 'nhl', name: 'Penalty Shot for Delay of Game',
    description: 'Awarding a penalty shot instead of a minor for intentional delay of game.',
    category: 'scoring-change', status: 'hypothetical',
    season: 'Hypothetical', source: 'Fan Survey Proposals',
    cardPriceImpactPct: 3.4, confidence: 'low',
  },
];

// ---- Mock Data: Player Impact Profiles ----

const playerImpacts: PlayerImpactProfile[] = [
  {
    id: 'pi-1', playerId: 'p-ohtani', playerName: 'Shohei Ohtani', team: 'LAD', position: 'DH/SP',
    sport: 'mlb', ruleChangeId: 'rc-1', impactScore: 72,
    cardValueChangePct: 14.2, reasoning: 'Two-way dominance amplified by faster game pace; pitch clock forces quicker at-bats where his power thrives.',
    keyStatsBefore: { avg: 0.274, hr: 44, sb: 11, era: 3.14 },
    keyStatsAfter: { avg: 0.285, hr: 48, sb: 18, era: 3.01 },
    tier: 'major-winner',
  },
  {
    id: 'pi-2', playerId: 'p-schwarber', playerName: 'Kyle Schwarber', team: 'PHI', position: '1B/DH',
    sport: 'mlb', ruleChangeId: 'rc-2', impactScore: 81,
    cardValueChangePct: 18.5, reasoning: 'Most shifted-against LHH batter; shift ban dramatically boosted BABIP and batting average.',
    keyStatsBefore: { avg: 0.218, hr: 46, babip: 0.252, ops: 0.827 },
    keyStatsAfter: { avg: 0.253, hr: 42, babip: 0.294, ops: 0.879 },
    tier: 'major-winner',
  },
  {
    id: 'pi-3', playerId: 'p-acuna', playerName: 'Ronald Acuna Jr.', team: 'ATL', position: 'OF',
    sport: 'mlb', ruleChangeId: 'rc-3', impactScore: 88,
    cardValueChangePct: 22.4, reasoning: 'Speed-first player maximized by larger bases; led MLB in stolen bases post-change.',
    keyStatsBefore: { sb: 29, cs: 8, sprint_speed: 30.1 },
    keyStatsAfter: { sb: 73, cs: 12, sprint_speed: 30.4 },
    tier: 'major-winner',
  },
  {
    id: 'pi-4', playerId: 'p-nash', playerName: 'Steve Nash', team: 'PHX', position: 'PG',
    sport: 'nba', ruleChangeId: 'rc-5', impactScore: 95,
    cardValueChangePct: 34.5, reasoning: 'Hand-checking elimination unleashed his driving and passing game; won back-to-back MVPs.',
    keyStatsBefore: { ppg: 14.5, apg: 7.2, fg_pct: 0.465 },
    keyStatsAfter: { ppg: 18.8, apg: 11.5, fg_pct: 0.512 },
    tier: 'major-winner',
  },
  {
    id: 'pi-5', playerId: 'p-harden', playerName: 'James Harden', team: 'HOU', position: 'SG',
    sport: 'nba', ruleChangeId: 'rc-17', impactScore: 85,
    cardValueChangePct: 19.7, reasoning: 'Freedom of movement rules maximized his isolation game and foul-drawing ability.',
    keyStatsBefore: { ppg: 30.4, fta: 9.4, usage_rate: 34.2 },
    keyStatsAfter: { ppg: 36.1, fta: 11.8, usage_rate: 40.5 },
    tier: 'major-winner',
  },
  {
    id: 'pi-6', playerId: 'p-morant', playerName: 'Ja Morant', team: 'MEM', position: 'PG',
    sport: 'nba', ruleChangeId: 'rc-18', impactScore: 68,
    cardValueChangePct: 12.6, reasoning: 'Elite transition player benefited from take foul penalty; more fast break opportunities.',
    keyStatsBefore: { ppg: 27.4, fast_break_pts: 5.8, transition_freq: 18.2 },
    keyStatsAfter: { ppg: 26.2, fast_break_pts: 7.4, transition_freq: 22.1 },
    tier: 'major-winner',
  },
  {
    id: 'pi-7', playerId: 'p-mahomes', playerName: 'Patrick Mahomes', team: 'KC', position: 'QB',
    sport: 'nfl', ruleChangeId: 'rc-9', impactScore: 91,
    cardValueChangePct: 22.3, reasoning: 'QB protection rules allowed him to extend plays without fear; career took off in 2018.',
    keyStatsBefore: { passing_yards: 0, tds: 0, sacks_taken: 0 },
    keyStatsAfter: { passing_yards: 5097, tds: 50, sacks_taken: 26 },
    tier: 'major-winner',
  },
  {
    id: 'pi-8', playerId: 'p-thomas', playerName: 'Michael Thomas', team: 'NO', position: 'WR',
    sport: 'nfl', ruleChangeId: 'rc-7', impactScore: 62,
    cardValueChangePct: 9.8, reasoning: 'PI review benefited possession receivers; defenders more cautious about contact.',
    keyStatsBefore: { receptions: 125, yards: 1405, targets: 147 },
    keyStatsAfter: { receptions: 149, yards: 1725, targets: 185 },
    tier: 'major-winner',
  },
  {
    id: 'pi-9', playerId: 'p-mcdavid', playerName: 'Connor McDavid', team: 'EDM', position: 'C',
    sport: 'nhl', ruleChangeId: 'rc-12', impactScore: 78,
    cardValueChangePct: 15.8, reasoning: '3-on-3 OT format perfect for elite skaters with speed; generated highlight moments.',
    keyStatsBefore: { goals: 30, assists: 70, ot_points: 2 },
    keyStatsAfter: { goals: 44, assists: 75, ot_points: 11 },
    tier: 'major-winner',
  },
  {
    id: 'pi-10', playerId: 'p-salah', playerName: 'Mohamed Salah', team: 'LIV', position: 'FW',
    sport: 'soccer', ruleChangeId: 'rc-14', impactScore: 42,
    cardValueChangePct: 6.3, reasoning: 'VAR enforcement of marginal penalties benefited players who draw fouls in the box.',
    keyStatsBefore: { goals: 22, penalties_won: 3, offside_goals: 4 },
    keyStatsAfter: { goals: 19, penalties_won: 6, offside_goals: 1 },
    tier: 'minor-winner',
  },
];

// ---- Mock Data: Card Price Impacts ----

const cardPriceImpacts: CardPriceImpact[] = [
  { id: 'cp-1', ruleChangeId: 'rc-1', cardName: '2018 Topps Update Ohtani RC PSA 10', playerName: 'Shohei Ohtani', sport: 'mlb', beforePrice: 285, afterPrice: 325, changePct: 14.0, timeframe: '3 months', grade: 'PSA 10' },
  { id: 'cp-2', ruleChangeId: 'rc-2', cardName: '2020 Topps Chrome Schwarber', playerName: 'Kyle Schwarber', sport: 'mlb', beforePrice: 12, afterPrice: 14.20, changePct: 18.3, timeframe: '6 months', grade: 'PSA 9' },
  { id: 'cp-3', ruleChangeId: 'rc-3', cardName: '2019 Topps Chrome Acuna Jr. RC', playerName: 'Ronald Acuna Jr.', sport: 'mlb', beforePrice: 195, afterPrice: 239, changePct: 22.6, timeframe: '4 months', grade: 'PSA 10' },
  { id: 'cp-4', ruleChangeId: 'rc-5', cardName: '1996 Topps Nash RC', playerName: 'Steve Nash', sport: 'nba', beforePrice: 14, afterPrice: 18.80, changePct: 34.3, timeframe: '12 months', grade: 'BGS 9.5' },
  { id: 'cp-5', ruleChangeId: 'rc-9', cardName: '2017 Panini Prizm Mahomes RC', playerName: 'Patrick Mahomes', sport: 'nfl', beforePrice: 320, afterPrice: 391, changePct: 22.2, timeframe: '6 months', grade: 'PSA 10' },
  { id: 'cp-6', ruleChangeId: 'rc-12', cardName: '2015 Upper Deck Young Guns McDavid', playerName: 'Connor McDavid', sport: 'nhl', beforePrice: 175, afterPrice: 203, changePct: 16.0, timeframe: '6 months', grade: 'PSA 10' },
  { id: 'cp-7', ruleChangeId: 'rc-14', cardName: '2017 Topps Chrome UCL Salah', playerName: 'Mohamed Salah', sport: 'soccer', beforePrice: 48, afterPrice: 51, changePct: 6.3, timeframe: '12 months', grade: 'PSA 9' },
  { id: 'cp-8', ruleChangeId: 'rc-17', cardName: '2012 Panini Prizm Harden', playerName: 'James Harden', sport: 'nba', beforePrice: 85, afterPrice: 102, changePct: 20.0, timeframe: '6 months', grade: 'PSA 10' },
  { id: 'cp-9', ruleChangeId: 'rc-18', cardName: '2019 Panini Prizm Ja Morant RC', playerName: 'Ja Morant', sport: 'nba', beforePrice: 210, afterPrice: 236, changePct: 12.4, timeframe: '3 months', grade: 'PSA 10' },
  { id: 'cp-10', ruleChangeId: 'rc-10', cardName: '2016 Panini Prizm Prescott RC', playerName: 'Dak Prescott', sport: 'nfl', beforePrice: 52, afterPrice: 53.60, changePct: 3.1, timeframe: '6 months', grade: 'PSA 10' },
  { id: 'cp-11', ruleChangeId: 'rc-19', cardName: '2022 Panini Prizm Turpin RC', playerName: 'KaVontae Turpin', sport: 'nfl', beforePrice: 4.50, afterPrice: 5.78, changePct: 28.4, timeframe: '3 months', grade: 'Raw' },
  { id: 'cp-12', ruleChangeId: 'rc-21', cardName: '2019 Topps Chrome Yordan Alvarez RC', playerName: 'Yordan Alvarez', sport: 'mlb', beforePrice: 88, afterPrice: 102, changePct: 15.9, timeframe: '6 months', grade: 'PSA 10' },
];

// ---- Mock Data: Position Impacts ----

const positionImpacts: PositionImpact[] = [
  { id: 'pos-1', ruleChangeId: 'rc-1', sport: 'mlb', position: 'SP', impactScore: 15, avgCardValueChangePct: 4.2, volumeChangePct: 8.1, reasoning: 'Faster rhythm benefits quick-working starters; clock violations penalize slow pitchers.' },
  { id: 'pos-2', ruleChangeId: 'rc-1', sport: 'mlb', position: 'OF', impactScore: 28, avgCardValueChangePct: 6.8, volumeChangePct: 12.4, reasoning: 'Increased stolen base attempts boost speed-oriented outfielders.' },
  { id: 'pos-3', ruleChangeId: 'rc-1', sport: 'mlb', position: 'C', impactScore: -18, avgCardValueChangePct: -3.2, volumeChangePct: -2.1, reasoning: 'Less time for pitch framing decisions; caught stealing rates under pressure.' },
  { id: 'pos-4', ruleChangeId: 'rc-2', sport: 'mlb', position: '1B', impactScore: 42, avgCardValueChangePct: 8.5, volumeChangePct: 15.2, reasoning: 'Left-handed pull hitters see massive BABIP increases without shift.' },
  { id: 'pos-5', ruleChangeId: 'rc-2', sport: 'mlb', position: 'SS', impactScore: -12, avgCardValueChangePct: -2.1, volumeChangePct: -4.3, reasoning: 'Defensive value of versatile positioning diminished.' },
  { id: 'pos-6', ruleChangeId: 'rc-5', sport: 'nba', position: 'PG', impactScore: 65, avgCardValueChangePct: 14.8, volumeChangePct: 22.1, reasoning: 'Point guards liberated by elimination of hand-checking; driving lanes opened.' },
  { id: 'pos-7', ruleChangeId: 'rc-5', sport: 'nba', position: 'SG', impactScore: 48, avgCardValueChangePct: 11.2, volumeChangePct: 16.8, reasoning: 'Shooting guards benefit from cleaner screens and easier perimeter movement.' },
  { id: 'pos-8', ruleChangeId: 'rc-5', sport: 'nba', position: 'C', impactScore: -35, avgCardValueChangePct: -8.4, volumeChangePct: -12.3, reasoning: 'Traditional centers lose defensive identity; pace increase marginalizes slow bigs.' },
  { id: 'pos-9', ruleChangeId: 'rc-9', sport: 'nfl', position: 'QB', impactScore: 72, avgCardValueChangePct: 18.4, volumeChangePct: 28.5, reasoning: 'QB protection rules directly increase longevity, stats, and card value.' },
  { id: 'pos-10', ruleChangeId: 'rc-9', sport: 'nfl', position: 'EDGE', impactScore: -45, avgCardValueChangePct: -10.2, volumeChangePct: -8.7, reasoning: 'Pass rushers penalized for natural sack mechanics; sack totals decline.' },
  { id: 'pos-11', ruleChangeId: 'rc-9', sport: 'nfl', position: 'WR', impactScore: 38, avgCardValueChangePct: 7.6, volumeChangePct: 14.2, reasoning: 'More passing volume and protected QBs boost receiver production.' },
  { id: 'pos-12', ruleChangeId: 'rc-12', sport: 'nhl', position: 'C', impactScore: 55, avgCardValueChangePct: 12.4, volumeChangePct: 18.6, reasoning: 'Centers with speed dominate 3-on-3 OT; high-skill forwards thrive in open ice.' },
  { id: 'pos-13', ruleChangeId: 'rc-12', sport: 'nhl', position: 'D', impactScore: -22, avgCardValueChangePct: -4.8, volumeChangePct: -6.2, reasoning: 'Stay-at-home defensemen less valuable in wide-open OT format.' },
  { id: 'pos-14', ruleChangeId: 'rc-14', sport: 'soccer', position: 'FW', impactScore: 18, avgCardValueChangePct: 3.8, volumeChangePct: 7.2, reasoning: 'VAR catches missed penalties; clinical forwards who draw fouls benefit.' },
  { id: 'pos-15', ruleChangeId: 'rc-14', sport: 'soccer', position: 'CB', impactScore: -24, avgCardValueChangePct: -5.2, volumeChangePct: -8.4, reasoning: 'Defenders under microscope; marginal fouls in the box now reviewable.' },
  { id: 'pos-16', ruleChangeId: 'rc-104', sport: 'nba', position: 'PG', impactScore: 82, avgCardValueChangePct: 22.5, volumeChangePct: 35.0, reasoning: 'Deep-shooting point guards would see massive value spike with a four-point line.' },
  { id: 'pos-17', ruleChangeId: 'rc-104', sport: 'nba', position: 'C', impactScore: -55, avgCardValueChangePct: -15.8, volumeChangePct: -22.4, reasoning: 'Traditional centers would lose further relevance with four-point option stretching floor.' },
  { id: 'pos-18', ruleChangeId: 'rc-107', sport: 'nfl', position: 'QB', impactScore: 48, avgCardValueChangePct: 10.2, volumeChangePct: 18.4, reasoning: 'Extra game increases counting stats; milestone-driven card values rise.' },
  { id: 'pos-19', ruleChangeId: 'rc-107', sport: 'nfl', position: 'RB', impactScore: -28, avgCardValueChangePct: -6.1, volumeChangePct: -4.8, reasoning: 'Additional wear increases injury risk for running backs; shorter careers.' },
  { id: 'pos-20', ruleChangeId: 'rc-111', sport: 'soccer', position: 'FW', impactScore: 52, avgCardValueChangePct: 11.4, volumeChangePct: 16.8, reasoning: 'Sin bins for tactical fouls mean more power-play situations for attackers.' },
];

// ---- Mock Data: Stat Distribution Shifts ----

const statShifts: StatDistributionShift[] = [
  { id: 'ss-1', ruleChangeId: 'rc-1', statName: 'Game Duration (minutes)', sport: 'mlb', beforeMean: 188, afterMean: 162, beforeStdDev: 18, afterStdDev: 14, shiftPct: -13.8, sampleSize: 2430, pValue: 0.001, unit: 'min' },
  { id: 'ss-2', ruleChangeId: 'rc-1', statName: 'Batting Average', sport: 'mlb', beforeMean: 0.233, afterMean: 0.248, beforeStdDev: 0.042, afterStdDev: 0.039, shiftPct: 6.4, sampleSize: 2430, pValue: 0.004, unit: '' },
  { id: 'ss-3', ruleChangeId: 'rc-1', statName: 'Stolen Bases Per Game', sport: 'mlb', beforeMean: 0.88, afterMean: 1.16, beforeStdDev: 0.31, afterStdDev: 0.35, shiftPct: 31.8, sampleSize: 2430, pValue: 0.001, unit: '' },
  { id: 'ss-4', ruleChangeId: 'rc-2', statName: 'BABIP', sport: 'mlb', beforeMean: 0.292, afterMean: 0.303, beforeStdDev: 0.028, afterStdDev: 0.026, shiftPct: 3.8, sampleSize: 2430, pValue: 0.008, unit: '' },
  { id: 'ss-5', ruleChangeId: 'rc-2', statName: 'Hits Per Game', sport: 'mlb', beforeMean: 8.12, afterMean: 8.62, beforeStdDev: 1.84, afterStdDev: 1.78, shiftPct: 6.2, sampleSize: 2430, pValue: 0.003, unit: '' },
  { id: 'ss-6', ruleChangeId: 'rc-5', statName: 'Points Per Game (League Avg)', sport: 'nba', beforeMean: 93.4, afterMean: 97.2, beforeStdDev: 10.2, afterStdDev: 11.1, shiftPct: 4.1, sampleSize: 1230, pValue: 0.001, unit: 'pts' },
  { id: 'ss-7', ruleChangeId: 'rc-5', statName: 'Pace Factor', sport: 'nba', beforeMean: 90.8, afterMean: 93.6, beforeStdDev: 3.4, afterStdDev: 3.8, shiftPct: 3.1, sampleSize: 1230, pValue: 0.002, unit: '' },
  { id: 'ss-8', ruleChangeId: 'rc-9', statName: 'Passing Yards Per Game', sport: 'nfl', beforeMean: 228, afterMean: 241, beforeStdDev: 42, afterStdDev: 44, shiftPct: 5.7, sampleSize: 256, pValue: 0.012, unit: 'yds' },
  { id: 'ss-9', ruleChangeId: 'rc-9', statName: 'Sacks Per Game', sport: 'nfl', beforeMean: 2.56, afterMean: 2.38, beforeStdDev: 0.62, afterStdDev: 0.58, shiftPct: -7.0, sampleSize: 256, pValue: 0.018, unit: '' },
  { id: 'ss-10', ruleChangeId: 'rc-12', statName: 'OT Goals Per Game', sport: 'nhl', beforeMean: 0.31, afterMean: 0.52, beforeStdDev: 0.12, afterStdDev: 0.18, shiftPct: 67.7, sampleSize: 1312, pValue: 0.001, unit: '' },
  { id: 'ss-11', ruleChangeId: 'rc-14', statName: 'Penalties Per Match', sport: 'soccer', beforeMean: 0.28, afterMean: 0.36, beforeStdDev: 0.08, afterStdDev: 0.11, shiftPct: 28.6, sampleSize: 380, pValue: 0.006, unit: '' },
  { id: 'ss-12', ruleChangeId: 'rc-17', statName: 'Free Throws Per Game', sport: 'nba', beforeMean: 22.4, afterMean: 24.8, beforeStdDev: 4.2, afterStdDev: 4.8, shiftPct: 10.7, sampleSize: 1230, pValue: 0.001, unit: '' },
  { id: 'ss-13', ruleChangeId: 'rc-3', statName: 'Stolen Base Attempts', sport: 'mlb', beforeMean: 1.22, afterMean: 1.58, beforeStdDev: 0.42, afterStdDev: 0.48, shiftPct: 29.5, sampleSize: 2430, pValue: 0.001, unit: '' },
  { id: 'ss-14', ruleChangeId: 'rc-18', statName: 'Fast Break Points', sport: 'nba', beforeMean: 12.4, afterMean: 14.2, beforeStdDev: 3.1, afterStdDev: 3.4, shiftPct: 14.5, sampleSize: 1230, pValue: 0.003, unit: 'pts' },
  { id: 'ss-15', ruleChangeId: 'rc-11', statName: 'Goals Per Game', sport: 'nhl', beforeMean: 2.71, afterMean: 2.89, beforeStdDev: 0.42, afterStdDev: 0.44, shiftPct: 6.6, sampleSize: 1312, pValue: 0.004, unit: '' },
];

// ---- Mock Data: Projected Stat Lines ----

const projectedStatLines: ProjectedStatLine[] = [
  {
    id: 'psl-1', ruleChangeId: 'rc-101', playerName: 'Aaron Judge', sport: 'mlb', position: 'OF',
    stats: {
      'Batting Avg': { before: 0.267, after: 0.278, changePct: 4.1 },
      'Walks': { before: 78, after: 92, changePct: 17.9 },
      'Strikeouts': { before: 158, after: 142, changePct: -10.1 },
      'OBP': { before: 0.364, after: 0.388, changePct: 6.6 },
    },
    overallImpact: 62, cardValueProjection: 8.4,
  },
  {
    id: 'psl-2', ruleChangeId: 'rc-101', playerName: 'Juan Soto', sport: 'mlb', position: 'OF',
    stats: {
      'Batting Avg': { before: 0.275, after: 0.284, changePct: 3.3 },
      'Walks': { before: 132, after: 148, changePct: 12.1 },
      'Strikeouts': { before: 124, after: 115, changePct: -7.3 },
      'OBP': { before: 0.421, after: 0.442, changePct: 5.0 },
    },
    overallImpact: 58, cardValueProjection: 7.2,
  },
  {
    id: 'psl-3', ruleChangeId: 'rc-104', playerName: 'Stephen Curry', sport: 'nba', position: 'PG',
    stats: {
      'PPG': { before: 26.4, after: 32.8, changePct: 24.2 },
      '3PT%': { before: 0.427, after: 0.412, changePct: -3.5 },
      '4PT Attempts': { before: 0, after: 4.2, changePct: 100 },
      'Usage Rate': { before: 31.2, after: 34.8, changePct: 11.5 },
    },
    overallImpact: 94, cardValueProjection: 28.5,
  },
  {
    id: 'psl-4', ruleChangeId: 'rc-104', playerName: 'Luka Doncic', sport: 'nba', position: 'PG',
    stats: {
      'PPG': { before: 28.6, after: 33.4, changePct: 16.8 },
      '3PT%': { before: 0.358, after: 0.342, changePct: -4.5 },
      '4PT Attempts': { before: 0, after: 3.1, changePct: 100 },
      'APG': { before: 8.8, after: 9.6, changePct: 9.1 },
    },
    overallImpact: 82, cardValueProjection: 22.1,
  },
  {
    id: 'psl-5', ruleChangeId: 'rc-107', playerName: 'Josh Allen', sport: 'nfl', position: 'QB',
    stats: {
      'Passing Yards': { before: 4306, after: 4620, changePct: 7.3 },
      'TDs': { before: 36, after: 40, changePct: 11.1 },
      'Rushing Yards': { before: 524, after: 548, changePct: 4.6 },
      'INTs': { before: 12, after: 14, changePct: 16.7 },
    },
    overallImpact: 55, cardValueProjection: 9.8,
  },
  {
    id: 'psl-6', ruleChangeId: 'rc-107', playerName: 'Bijan Robinson', sport: 'nfl', position: 'RB',
    stats: {
      'Rush Yards': { before: 1456, after: 1384, changePct: -4.9 },
      'Rush TDs': { before: 12, after: 10, changePct: -16.7 },
      'Games Played': { before: 17, after: 16, changePct: -5.9 },
      'Injury Risk': { before: 22, after: 31, changePct: 40.9 },
    },
    overallImpact: -34, cardValueProjection: -6.8,
  },
  {
    id: 'psl-7', ruleChangeId: 'rc-108', playerName: 'Auston Matthews', sport: 'nhl', position: 'C',
    stats: {
      'Goals': { before: 52, after: 61, changePct: 17.3 },
      'Shots/Game': { before: 4.8, after: 5.2, changePct: 8.3 },
      'PPG': { before: 1.12, after: 1.28, changePct: 14.3 },
      'SH%': { before: 16.2, after: 17.8, changePct: 9.9 },
    },
    overallImpact: 76, cardValueProjection: 18.4,
  },
  {
    id: 'psl-8', ruleChangeId: 'rc-111', playerName: 'Erling Haaland', sport: 'soccer', position: 'FW',
    stats: {
      'Goals': { before: 28, after: 33, changePct: 17.9 },
      'Penalty Box Touches': { before: 6.2, after: 7.1, changePct: 14.5 },
      'xG': { before: 24.2, after: 28.8, changePct: 19.0 },
      'Minutes/Goal': { before: 102, after: 88, changePct: -13.7 },
    },
    overallImpact: 68, cardValueProjection: 14.2,
  },
];

// ---- Mock Data: Rule Change Scenarios ----

const ruleChangeScenarios: RuleChangeScenario[] = [
  {
    id: 'scn-1', name: 'NBA Four-Point Line', sport: 'nba',
    description: 'Addition of a four-point arc at 28 feet; would radically reshape offensive strategy.',
    category: 'scoring-change', probability: 8, estimatedImpactPct: 18.5,
    affectedPositions: ['PG', 'SG', 'SF', 'C'],
    projectedWinners: ['Stephen Curry', 'Damian Lillard', 'Luka Doncic', 'Trae Young'],
    projectedLosers: ['Rudy Gobert', 'Bam Adebayo', 'Domantas Sabonis'],
    timelineEstimate: '5-10 years (if ever)',
  },
  {
    id: 'scn-2', name: 'MLB Robot Umpires Full Adoption', sport: 'mlb',
    description: 'Complete automated ball-strike system replacing home plate umpires.',
    category: 'scoring-change', probability: 72, estimatedImpactPct: 7.5,
    affectedPositions: ['SP', 'RP', 'C', 'OF'],
    projectedWinners: ['Aaron Judge', 'Juan Soto', 'Bryce Harper'],
    projectedLosers: ['Framber Valdez', 'Logan Webb'],
    timelineEstimate: '1-2 seasons',
  },
  {
    id: 'scn-3', name: 'NFL 18-Game Season', sport: 'nfl',
    description: 'Expansion from 17 to 18 regular season games with one additional bye.',
    category: 'pace-change', probability: 55, estimatedImpactPct: 8.4,
    affectedPositions: ['QB', 'WR', 'RB', 'TE'],
    projectedWinners: ['Josh Allen', 'Lamar Jackson', 'CeeDee Lamb'],
    projectedLosers: ['Bijan Robinson', 'Saquon Barkley', 'Derrick Henry'],
    timelineEstimate: '2-4 years (next CBA)',
  },
  {
    id: 'scn-4', name: 'Soccer Blue Cards (Sin Bins)', sport: 'soccer',
    description: 'Temporary 10-minute dismissals for tactical fouls and persistent fouling.',
    category: 'defensive-nerf', probability: 45, estimatedImpactPct: 5.6,
    affectedPositions: ['FW', 'AM', 'CDM', 'CB'],
    projectedWinners: ['Erling Haaland', 'Vinicius Jr.', 'Jude Bellingham'],
    projectedLosers: ['Rodri', 'Casemiro', 'Declan Rice'],
    timelineEstimate: '2-3 seasons (trial phase)',
  },
  {
    id: 'scn-5', name: 'NHL Larger Net Dimensions', sport: 'nhl',
    description: 'Increasing net width by 4 inches and height by 2 inches to boost scoring.',
    category: 'scoring-change', probability: 12, estimatedImpactPct: 14.2,
    affectedPositions: ['C', 'W', 'G'],
    projectedWinners: ['Auston Matthews', 'Leon Draisaitl', 'Nathan MacKinnon'],
    projectedLosers: ['Andrei Vasilevskiy', 'Igor Shesterkin', 'Connor Hellebuyck'],
    timelineEstimate: '5+ years (if ever)',
  },
];

// ---- Mock Data: Timeline Events ----

const timelineEvents: RuleChangeTimelineEvent[] = [
  { id: 'te-1', ruleChangeId: 'rc-1', date: '2022-09-09', title: 'Pitch Clock Approved', description: 'MLB Competition Committee votes to implement pitch clock for 2023.', type: 'vote', sport: 'mlb' },
  { id: 'te-2', ruleChangeId: 'rc-1', date: '2023-03-30', title: 'Opening Day with Pitch Clock', description: 'First regular season games with 15/20-second pitch clock.', type: 'implementation', sport: 'mlb' },
  { id: 'te-3', ruleChangeId: 'rc-1', date: '2023-04-15', title: 'Market Reacts to Faster Games', description: 'Speed-oriented player cards surge 8-15% as stolen base totals spike.', type: 'market-reaction', sport: 'mlb' },
  { id: 'te-4', ruleChangeId: 'rc-5', date: '2004-06-15', title: 'Hand-Checking Rule Announced', description: 'NBA announces elimination of hand-checking on perimeter defenders.', type: 'announcement', sport: 'nba' },
  { id: 'te-5', ruleChangeId: 'rc-5', date: '2004-10-29', title: 'Season Opens Under New Rules', description: 'First NBA season without hand-checking begins.', type: 'implementation', sport: 'nba' },
  { id: 'te-6', ruleChangeId: 'rc-5', date: '2005-03-01', title: 'Scoring Surge Confirmed', description: 'League-wide PPG increases by 4+ points; guard cards appreciate sharply.', type: 'stat-shift', sport: 'nba' },
  { id: 'te-7', ruleChangeId: 'rc-9', date: '2018-03-28', title: 'Body Weight Rule Introduced', description: 'NFL owners approve expanded roughing the passer protections.', type: 'vote', sport: 'nfl' },
  { id: 'te-8', ruleChangeId: 'rc-9', date: '2018-09-06', title: 'Week 1 Controversies', description: 'Multiple questionable RTP calls spark debate; defender cards dip.', type: 'market-reaction', sport: 'nfl' },
  { id: 'te-9', ruleChangeId: 'rc-12', date: '2015-06-24', title: 'NHL Approves 3-on-3 OT', description: 'Board of Governors votes to switch overtime format.', type: 'vote', sport: 'nhl' },
  { id: 'te-10', ruleChangeId: 'rc-12', date: '2015-10-07', title: '3-on-3 Overtime Debuts', description: 'First games with new format produce exciting finishes.', type: 'implementation', sport: 'nhl' },
  { id: 'te-11', ruleChangeId: 'rc-101', date: '2025-11-15', title: 'ABS Committee Review', description: 'MLB Technology Committee reviews ABS trial data from minor leagues.', type: 'announcement', sport: 'mlb' },
  { id: 'te-12', ruleChangeId: 'rc-104', date: '2025-06-01', title: 'Four-Point Line Debate Heats Up', description: 'Multiple analytics pieces discuss feasibility; social media engagement spikes.', type: 'announcement', sport: 'nba' },
  { id: 'te-13', ruleChangeId: 'rc-107', date: '2026-03-01', title: '18-Game Season Negotiations', description: 'NFLPA and NFL begin CBA discussions including 18-game proposal.', type: 'announcement', sport: 'nfl' },
  { id: 'te-14', ruleChangeId: 'rc-111', date: '2025-07-01', title: 'IFAB Blue Card Trials Begin', description: 'Selected leagues begin testing sin bin system for tactical fouls.', type: 'implementation', sport: 'soccer' },
  { id: 'te-15', ruleChangeId: 'rc-14', date: '2019-08-09', title: 'VAR Premier League Debut', description: 'First PL match with VAR technology; controversy on opening weekend.', type: 'implementation', sport: 'soccer' },
  { id: 'te-16', ruleChangeId: 'rc-19', date: '2024-03-25', title: 'Dynamic Kickoff Approved', description: 'NFL owners vote 32-0 to adopt XFL-inspired kickoff format.', type: 'vote', sport: 'nfl' },
  { id: 'te-17', ruleChangeId: 'rc-19', date: '2024-09-05', title: 'Kickoff Returns Surge', description: 'Return rates exceed 60% in early weeks; return specialist cards spike.', type: 'stat-shift', sport: 'nfl' },
  { id: 'te-18', ruleChangeId: 'rc-2', date: '2023-04-20', title: 'Shift Ban Impact Data', description: 'BABIP and batting averages for pull-heavy hitters show significant improvement.', type: 'stat-shift', sport: 'mlb' },
];

// ---- Service Functions ----

export function getRuleChanges(): RuleChange[] {
  return ruleChanges;
}

export function getHistoricalImpacts(): HistoricalRuleChange[] {
  return historicalRuleChanges;
}

export function getPlayerImpact(playerId: string, ruleChangeId: string): PlayerImpactProfile | undefined {
  return playerImpacts.find(p => p.playerId === playerId && p.ruleChangeId === ruleChangeId);
}

export function getAllPlayerImpacts(): PlayerImpactProfile[] {
  return playerImpacts;
}

export function getPositionImpacts(ruleChangeId: string): PositionImpact[] {
  return positionImpacts.filter(p => p.ruleChangeId === ruleChangeId);
}

export function getStatShift(ruleChangeId: string): StatDistributionShift[] {
  return statShifts.filter(s => s.ruleChangeId === ruleChangeId);
}

export function getAllStatShifts(): StatDistributionShift[] {
  return statShifts;
}

export function backtestRuleChange(id: string): {
  ruleChange: HistoricalRuleChange | undefined;
  cardImpacts: CardPriceImpact[];
  statShifts: StatDistributionShift[];
  positionImpacts: PositionImpact[];
  playerImpacts: PlayerImpactProfile[];
} {
  const rc = historicalRuleChanges.find(h => h.ruleChangeId === id);
  return {
    ruleChange: rc,
    cardImpacts: cardPriceImpacts.filter(c => c.ruleChangeId === id),
    statShifts: statShifts.filter(s => s.ruleChangeId === id),
    positionImpacts: positionImpacts.filter(p => p.ruleChangeId === id),
    playerImpacts: playerImpacts.filter(p => p.ruleChangeId === id),
  };
}

export function getUpcomingChanges(): RuleChange[] {
  return ruleChanges.filter(r => r.status === 'proposed' || r.status === 'approved');
}

export function getProjectedStatLines(): ProjectedStatLine[] {
  return projectedStatLines;
}

export function getCardPriceImpacts(): CardPriceImpact[] {
  return cardPriceImpacts;
}

export function getWinnersLosers(ruleChangeId: string): {
  winners: PlayerImpactProfile[];
  losers: PlayerImpactProfile[];
} {
  const impacts = playerImpacts.filter(p => p.ruleChangeId === ruleChangeId);
  return {
    winners: impacts.filter(p => p.tier === 'major-winner' || p.tier === 'minor-winner').sort((a, b) => b.impactScore - a.impactScore),
    losers: impacts.filter(p => p.tier === 'major-loser' || p.tier === 'minor-loser').sort((a, b) => a.impactScore - b.impactScore),
  };
}

export function getRuleChangeTimeline(): RuleChangeTimelineEvent[] {
  return timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRuleChangeScenarios(): RuleChangeScenario[] {
  return ruleChangeScenarios;
}

export function getRuleChangeById(id: string): RuleChange | undefined {
  return ruleChanges.find(r => r.id === id);
}

export function getHistoricalRuleChangeById(id: string): HistoricalRuleChange | undefined {
  return historicalRuleChanges.find(h => h.ruleChangeId === id);
}

export function getSportLabel(sport: Sport): string {
  const labels: Record<Sport, string> = { mlb: 'MLB', nfl: 'NFL', nba: 'NBA', nhl: 'NHL', soccer: 'Soccer' };
  return labels[sport];
}

export function getCategoryLabel(cat: ImpactCategory): string {
  const labels: Record<ImpactCategory, string> = {
    'offensive-boost': 'Offensive Boost',
    'defensive-nerf': 'Defensive Nerf',
    'pace-change': 'Pace Change',
    'scoring-change': 'Scoring Change',
    'safety': 'Safety',
  };
  return labels[cat];
}

export function getCategoryColor(cat: ImpactCategory): string {
  const colors: Record<ImpactCategory, string> = {
    'offensive-boost': '#22c55e',
    'defensive-nerf': '#f97316',
    'pace-change': '#3b82f6',
    'scoring-change': '#a855f7',
    'safety': '#eab308',
  };
  return colors[cat];
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
