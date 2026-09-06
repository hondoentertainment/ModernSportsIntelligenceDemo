// ── Phase 1: Multi-Sport League Hub Service ─────────────────────────────────

export type LeagueSport = 'nfl' | 'nba' | 'nhl' | 'soccer';
export type Conference = string;
export type Division = string;

export interface LeagueStanding {
  rank: number;
  team: string;
  conference: Conference;
  division: Division;
  wins: number;
  losses: number;
  draws?: number;
  otLosses?: number;
  winPct: number;
  pointsFor: number;
  pointsAgainst: number;
  streak: string;
  last5: string;
  playoffSeed?: number;
  cardMarketIndex: number;
  cardMarketChange: number;
}

export interface LeagueDraftClass {
  id: string;
  name: string;
  position: string;
  team: string;
  school: string;
  pickNumber: number;
  round: number;
  rookieCardValue: number;
  rookieCardChange: number;
  projectedCeiling: number;
  gamesPlayed: number;
  keyStats: Record<string, number | string>;
  trend: 'up' | 'down' | 'stable';
}

export interface LeagueSeasonEvent {
  id: string;
  name: string;
  date: string;
  type: 'regular' | 'playoff' | 'allstar' | 'draft' | 'bye' | 'transfer' | 'international' | 'final';
  description: string;
  cardMarketImpact: 'high' | 'medium' | 'low';
  teams?: string[];
}

export interface LeagueStatLeader {
  rank: number;
  player: string;
  team: string;
  position: string;
  statCategory: string;
  statValue: number;
  statLabel: string;
  gamesPlayed: number;
  cardValue: number;
  cardChange: number;
  efficiency?: number;
}

export interface LeagueCardMarketTrend {
  month: string;
  overall: number;
  rookies: number;
  veterans: number;
  volume: number;
}

export interface LeagueRookieWatch {
  id: string;
  name: string;
  team: string;
  position: string;
  sport: LeagueSport;
  draftPick: number;
  topCardName: string;
  topCardValue: number;
  weeklyChange: number;
  seasonGrade: string;
  recentPerformance: string;
  projectedROI: number;
  hypeScore: number;
}

export interface InjuryCardImpact {
  player: string;
  team: string;
  injury: string;
  status: 'out' | 'doubtful' | 'questionable' | 'day-to-day';
  cardValueBefore: number;
  cardValueAfter: number;
  returnTimeline: string;
  buyOpportunity: boolean;
}

export interface TransferImpact {
  player: string;
  fromTeam: string;
  toTeam: string;
  league: string;
  fee: string;
  cardValueBefore: number;
  cardValueAfter: number;
  projectedImpact: number;
}

export interface LeagueHub {
  sport: LeagueSport;
  name: string;
  season: string;
  standings: LeagueStanding[];
  draftClass: LeagueDraftClass[];
  seasonCalendar: LeagueSeasonEvent[];
  statLeaders: LeagueStatLeader[];
  cardMarketTrends: LeagueCardMarketTrend[];
  rookieWatch: LeagueRookieWatch[];
  injuryImpacts?: InjuryCardImpact[];
  transfers?: TransferImpact[];
}

export type LeaguePlayerRole = 'leader' | 'rookie' | 'watch';

export interface LeaguePlayerDesk {
  id: string;
  name: string;
  team: string;
  position: string;
  sport: LeagueSport;
  role: LeaguePlayerRole;
  headlineStat: string;
  cardValue: number;
  cardChange: number;
  note: string;
}

export interface LeagueTeamDesk {
  team: string;
  sport: LeagueSport;
  conference: string;
  division: string;
  record: string;
  winPct: number;
  playoffSeed?: number;
  cardMarketIndex: number;
  cardMarketChange: number;
  spotlightPlayer: string | null;
}

export const LEAGUE_HUB_DATA_DISCLOSURE =
  'Seeded 2025-26 desk for collector context. Not a live league feed. Live MLB stats stay on PressBox Hub (/mlb-stats). Card values are demo marks.';

// ── NFL Mock Data ────────────────────────────────────────────────────────────

const NFL_STANDINGS: LeagueStanding[] = [
  { rank: 1, team: 'Kansas City Chiefs', conference: 'AFC', division: 'AFC West', wins: 13, losses: 4, winPct: 0.765, pointsFor: 421, pointsAgainst: 298, streak: 'W5', last5: '4-1', playoffSeed: 1, cardMarketIndex: 142, cardMarketChange: 8.3 },
  { rank: 2, team: 'Buffalo Bills', conference: 'AFC', division: 'AFC East', wins: 12, losses: 5, winPct: 0.706, pointsFor: 398, pointsAgainst: 310, streak: 'W3', last5: '4-1', playoffSeed: 2, cardMarketIndex: 138, cardMarketChange: 6.1 },
  { rank: 3, team: 'Baltimore Ravens', conference: 'AFC', division: 'AFC North', wins: 12, losses: 5, winPct: 0.706, pointsFor: 435, pointsAgainst: 322, streak: 'W2', last5: '3-2', playoffSeed: 3, cardMarketIndex: 155, cardMarketChange: 12.4 },
  { rank: 4, team: 'Houston Texans', conference: 'AFC', division: 'AFC South', wins: 11, losses: 6, winPct: 0.647, pointsFor: 378, pointsAgainst: 325, streak: 'L1', last5: '3-2', playoffSeed: 4, cardMarketIndex: 128, cardMarketChange: 15.2 },
  { rank: 5, team: 'Pittsburgh Steelers', conference: 'AFC', division: 'AFC North', wins: 10, losses: 7, winPct: 0.588, pointsFor: 352, pointsAgainst: 318, streak: 'W1', last5: '2-3', playoffSeed: 5, cardMarketIndex: 115, cardMarketChange: -2.1 },
  { rank: 6, team: 'Miami Dolphins', conference: 'AFC', division: 'AFC East', wins: 10, losses: 7, winPct: 0.588, pointsFor: 385, pointsAgainst: 340, streak: 'L2', last5: '2-3', playoffSeed: 6, cardMarketIndex: 121, cardMarketChange: -4.5 },
  { rank: 7, team: 'Denver Broncos', conference: 'AFC', division: 'AFC West', wins: 10, losses: 7, winPct: 0.588, pointsFor: 348, pointsAgainst: 315, streak: 'W2', last5: '3-2', playoffSeed: 7, cardMarketIndex: 112, cardMarketChange: 9.8 },
  { rank: 8, team: 'Detroit Lions', conference: 'NFC', division: 'NFC North', wins: 14, losses: 3, winPct: 0.824, pointsFor: 461, pointsAgainst: 301, streak: 'W7', last5: '5-0', playoffSeed: 1, cardMarketIndex: 162, cardMarketChange: 22.5 },
  { rank: 9, team: 'Philadelphia Eagles', conference: 'NFC', division: 'NFC East', wins: 13, losses: 4, winPct: 0.765, pointsFor: 410, pointsAgainst: 285, streak: 'W4', last5: '4-1', playoffSeed: 2, cardMarketIndex: 148, cardMarketChange: 11.7 },
  { rank: 10, team: 'San Francisco 49ers', conference: 'NFC', division: 'NFC West', wins: 11, losses: 6, winPct: 0.647, pointsFor: 388, pointsAgainst: 312, streak: 'W1', last5: '3-2', playoffSeed: 3, cardMarketIndex: 135, cardMarketChange: -3.2 },
  { rank: 11, team: 'Green Bay Packers', conference: 'NFC', division: 'NFC North', wins: 11, losses: 6, winPct: 0.647, pointsFor: 372, pointsAgainst: 318, streak: 'L1', last5: '3-2', playoffSeed: 4, cardMarketIndex: 126, cardMarketChange: 7.4 },
  { rank: 12, team: 'Tampa Bay Buccaneers', conference: 'NFC', division: 'NFC South', wins: 10, losses: 7, winPct: 0.588, pointsFor: 361, pointsAgainst: 330, streak: 'W2', last5: '4-1', playoffSeed: 5, cardMarketIndex: 118, cardMarketChange: 3.1 },
  { rank: 13, team: 'Washington Commanders', conference: 'NFC', division: 'NFC East', wins: 10, losses: 7, winPct: 0.588, pointsFor: 355, pointsAgainst: 322, streak: 'W1', last5: '3-2', playoffSeed: 6, cardMarketIndex: 124, cardMarketChange: 18.9 },
  { rank: 14, team: 'Minnesota Vikings', conference: 'NFC', division: 'NFC North', wins: 10, losses: 7, winPct: 0.588, pointsFor: 368, pointsAgainst: 335, streak: 'L1', last5: '2-3', playoffSeed: 7, cardMarketIndex: 119, cardMarketChange: 5.2 },
];

const NFL_DRAFT_CLASS: LeagueDraftClass[] = [
  { id: 'nfl-d1', name: 'Caleb Williams', position: 'QB', team: 'Chicago Bears', school: 'USC', pickNumber: 1, round: 1, rookieCardValue: 285, rookieCardChange: 12.5, projectedCeiling: 850, gamesPlayed: 16, keyStats: { passYds: 3842, passTD: 24, int: 9, qbr: 88.2 }, trend: 'up' },
  { id: 'nfl-d2', name: 'Jayden Daniels', position: 'QB', team: 'Washington Commanders', school: 'LSU', pickNumber: 2, round: 1, rookieCardValue: 345, rookieCardChange: 28.4, projectedCeiling: 920, gamesPlayed: 17, keyStats: { passYds: 4128, passTD: 28, rushYds: 648, qbr: 92.1 }, trend: 'up' },
  { id: 'nfl-d3', name: 'Drake Maye', position: 'QB', team: 'New England Patriots', school: 'North Carolina', pickNumber: 3, round: 1, rookieCardValue: 165, rookieCardChange: -8.2, projectedCeiling: 580, gamesPlayed: 13, keyStats: { passYds: 2891, passTD: 18, int: 12, qbr: 76.5 }, trend: 'down' },
  { id: 'nfl-d4', name: 'Marvin Harrison Jr.', position: 'WR', team: 'Arizona Cardinals', school: 'Ohio State', pickNumber: 4, round: 1, rookieCardValue: 220, rookieCardChange: 5.8, projectedCeiling: 650, gamesPlayed: 16, keyStats: { rec: 72, recYds: 1085, recTD: 8 }, trend: 'up' },
  { id: 'nfl-d5', name: 'Joe Alt', position: 'OT', team: 'Los Angeles Chargers', school: 'Notre Dame', pickNumber: 5, round: 1, rookieCardValue: 45, rookieCardChange: 2.1, projectedCeiling: 120, gamesPlayed: 17, keyStats: { sacksAllowed: 2, proSnaps: 1092 }, trend: 'stable' },
  { id: 'nfl-d6', name: 'Malik Nabers', position: 'WR', team: 'New York Giants', school: 'LSU', pickNumber: 6, round: 1, rookieCardValue: 195, rookieCardChange: 14.2, projectedCeiling: 580, gamesPlayed: 14, keyStats: { rec: 82, recYds: 1142, recTD: 6 }, trend: 'up' },
  { id: 'nfl-d7', name: 'Brock Bowers', position: 'TE', team: 'Las Vegas Raiders', school: 'Georgia', pickNumber: 13, round: 1, rookieCardValue: 175, rookieCardChange: 22.3, projectedCeiling: 520, gamesPlayed: 17, keyStats: { rec: 108, recYds: 1194, recTD: 5 }, trend: 'up' },
  { id: 'nfl-d8', name: 'Rome Odunze', position: 'WR', team: 'Chicago Bears', school: 'Washington', pickNumber: 9, round: 1, rookieCardValue: 88, rookieCardChange: -3.5, projectedCeiling: 320, gamesPlayed: 16, keyStats: { rec: 58, recYds: 782, recTD: 4 }, trend: 'down' },
  { id: 'nfl-d9', name: 'Bo Nix', position: 'QB', team: 'Denver Broncos', school: 'Oregon', pickNumber: 12, round: 1, rookieCardValue: 155, rookieCardChange: 18.7, projectedCeiling: 480, gamesPlayed: 17, keyStats: { passYds: 3775, passTD: 29, int: 12, qbr: 85.4 }, trend: 'up' },
  { id: 'nfl-d10', name: 'Laiatu Latu', position: 'EDGE', team: 'Indianapolis Colts', school: 'UCLA', pickNumber: 15, round: 1, rookieCardValue: 62, rookieCardChange: 8.9, projectedCeiling: 185, gamesPlayed: 16, keyStats: { sacks: 10.5, tackles: 52, forcedFumbles: 3 }, trend: 'up' },
];

const NFL_SEASON_EVENTS: LeagueSeasonEvent[] = [
  { id: 'nfl-e1', name: 'NFL Draft 2026', date: '2026-04-23', type: 'draft', description: 'Round 1 from Green Bay, WI', cardMarketImpact: 'high' },
  { id: 'nfl-e2', name: 'Free Agency Opens', date: '2026-03-12', type: 'transfer', description: 'Legal tampering period begins', cardMarketImpact: 'high' },
  { id: 'nfl-e3', name: 'Regular Season Kickoff', date: '2026-09-10', type: 'regular', description: 'Week 1 Thursday Night Football', cardMarketImpact: 'high' },
  { id: 'nfl-e4', name: 'NFL Combine', date: '2026-02-27', type: 'draft', description: 'Prospect workouts in Indianapolis', cardMarketImpact: 'medium' },
  { id: 'nfl-e5', name: 'Trade Deadline', date: '2025-11-05', type: 'transfer', description: 'Last day for in-season trades', cardMarketImpact: 'high' },
  { id: 'nfl-e6', name: 'Super Bowl LX', date: '2026-02-08', type: 'final', description: 'Championship game at Levi\'s Stadium', cardMarketImpact: 'high' },
  { id: 'nfl-e7', name: 'Pro Bowl Games', date: '2026-02-02', type: 'allstar', description: 'Skills competition and flag football', cardMarketImpact: 'low' },
  { id: 'nfl-e8', name: 'Preseason Week 1', date: '2026-08-07', type: 'regular', description: 'Hall of Fame Game', cardMarketImpact: 'medium' },
  { id: 'nfl-e9', name: 'Wild Card Weekend', date: '2026-01-10', type: 'playoff', description: 'AFC/NFC Wild Card round', cardMarketImpact: 'high' },
  { id: 'nfl-e10', name: 'Divisional Round', date: '2026-01-17', type: 'playoff', description: 'Divisional playoff matchups', cardMarketImpact: 'high' },
];

const NFL_STAT_LEADERS: LeagueStatLeader[] = [
  { rank: 1, player: 'Lamar Jackson', team: 'BAL', position: 'QB', statCategory: 'Passing Yards', statValue: 4172, statLabel: 'YDS', gamesPlayed: 17, cardValue: 425, cardChange: 14.8, efficiency: 92.5 },
  { rank: 2, player: 'Joe Burrow', team: 'CIN', position: 'QB', statCategory: 'Passing Yards', statValue: 4018, statLabel: 'YDS', gamesPlayed: 17, cardValue: 380, cardChange: 8.2, efficiency: 89.1 },
  { rank: 3, player: 'Josh Allen', team: 'BUF', position: 'QB', statCategory: 'Passing Yards', statValue: 3942, statLabel: 'YDS', gamesPlayed: 17, cardValue: 520, cardChange: 5.4, efficiency: 90.8 },
  { rank: 1, player: 'Derrick Henry', team: 'BAL', position: 'RB', statCategory: 'Rushing Yards', statValue: 1921, statLabel: 'YDS', gamesPlayed: 17, cardValue: 185, cardChange: 22.1, efficiency: 5.2 },
  { rank: 2, player: 'Saquon Barkley', team: 'PHI', position: 'RB', statCategory: 'Rushing Yards', statValue: 2005, statLabel: 'YDS', gamesPlayed: 17, cardValue: 245, cardChange: 35.8, efficiency: 5.8 },
  { rank: 3, player: 'Josh Jacobs', team: 'GB', position: 'RB', statCategory: 'Rushing Yards', statValue: 1329, statLabel: 'YDS', gamesPlayed: 17, cardValue: 95, cardChange: 12.4, efficiency: 4.4 },
  { rank: 1, player: 'Ja\'Marr Chase', team: 'CIN', position: 'WR', statCategory: 'Receiving Yards', statValue: 1708, statLabel: 'YDS', gamesPlayed: 17, cardValue: 485, cardChange: 18.9, efficiency: 14.2 },
  { rank: 2, player: 'Amon-Ra St. Brown', team: 'DET', position: 'WR', statCategory: 'Receiving Yards', statValue: 1515, statLabel: 'YDS', gamesPlayed: 17, cardValue: 225, cardChange: 28.5, efficiency: 12.8 },
  { rank: 3, player: 'CeeDee Lamb', team: 'DAL', position: 'WR', statCategory: 'Receiving Yards', statValue: 1398, statLabel: 'YDS', gamesPlayed: 16, cardValue: 310, cardChange: -5.2, efficiency: 11.7 },
  { rank: 4, player: 'Brock Bowers', team: 'LV', position: 'TE', statCategory: 'Receiving Yards', statValue: 1194, statLabel: 'YDS', gamesPlayed: 17, cardValue: 175, cardChange: 22.3, efficiency: 11.1 },
];

const NFL_INJURY_IMPACTS: InjuryCardImpact[] = [
  { player: 'Dak Prescott', team: 'Dallas Cowboys', injury: 'Hamstring', status: 'out', cardValueBefore: 285, cardValueAfter: 195, returnTimeline: 'Season-ending', buyOpportunity: true },
  { player: 'Jordan Love', team: 'Green Bay Packers', injury: 'MCL Sprain', status: 'questionable', cardValueBefore: 165, cardValueAfter: 142, returnTimeline: '2-3 weeks', buyOpportunity: true },
  { player: 'Anthony Richardson', team: 'Indianapolis Colts', injury: 'Shoulder', status: 'out', cardValueBefore: 195, cardValueAfter: 110, returnTimeline: '6-8 weeks', buyOpportunity: false },
  { player: 'Tyreek Hill', team: 'Miami Dolphins', injury: 'Knee (ACL)', status: 'out', cardValueBefore: 310, cardValueAfter: 225, returnTimeline: 'Season-ending', buyOpportunity: true },
  { player: 'Christian McCaffrey', team: 'San Francisco 49ers', injury: 'Achilles', status: 'out', cardValueBefore: 265, cardValueAfter: 178, returnTimeline: 'Season-ending', buyOpportunity: false },
  { player: 'Puka Nacua', team: 'Los Angeles Rams', injury: 'Knee', status: 'day-to-day', cardValueBefore: 185, cardValueAfter: 172, returnTimeline: '1-2 weeks', buyOpportunity: true },
  { player: 'Chris Olave', team: 'New Orleans Saints', injury: 'Concussion', status: 'doubtful', cardValueBefore: 142, cardValueAfter: 118, returnTimeline: 'Protocol', buyOpportunity: false },
  { player: 'Tua Tagovailoa', team: 'Miami Dolphins', injury: 'Concussion', status: 'questionable', cardValueBefore: 195, cardValueAfter: 155, returnTimeline: 'Indefinite', buyOpportunity: false },
];

// ── NBA Mock Data ────────────────────────────────────────────────────────────

const NBA_STANDINGS: LeagueStanding[] = [
  { rank: 1, team: 'Boston Celtics', conference: 'Eastern', division: 'Atlantic', wins: 52, losses: 14, winPct: 0.788, pointsFor: 118.2, pointsAgainst: 108.5, streak: 'W8', last5: '5-0', playoffSeed: 1, cardMarketIndex: 165, cardMarketChange: 15.2 },
  { rank: 2, team: 'Cleveland Cavaliers', conference: 'Eastern', division: 'Central', wins: 50, losses: 16, winPct: 0.758, pointsFor: 116.8, pointsAgainst: 109.2, streak: 'W4', last5: '4-1', playoffSeed: 2, cardMarketIndex: 148, cardMarketChange: 22.8 },
  { rank: 3, team: 'New York Knicks', conference: 'Eastern', division: 'Atlantic', wins: 46, losses: 20, winPct: 0.697, pointsFor: 114.5, pointsAgainst: 110.1, streak: 'W2', last5: '3-2', playoffSeed: 3, cardMarketIndex: 142, cardMarketChange: 18.4 },
  { rank: 4, team: 'Milwaukee Bucks', conference: 'Eastern', division: 'Central', wins: 42, losses: 24, winPct: 0.636, pointsFor: 115.8, pointsAgainst: 112.3, streak: 'L1', last5: '3-2', playoffSeed: 4, cardMarketIndex: 138, cardMarketChange: -3.5 },
  { rank: 5, team: 'Indiana Pacers', conference: 'Eastern', division: 'Central', wins: 40, losses: 26, winPct: 0.606, pointsFor: 117.2, pointsAgainst: 114.8, streak: 'W1', last5: '2-3', playoffSeed: 5, cardMarketIndex: 125, cardMarketChange: 8.9 },
  { rank: 6, team: 'Orlando Magic', conference: 'Eastern', division: 'Southeast', wins: 39, losses: 27, winPct: 0.591, pointsFor: 108.5, pointsAgainst: 105.2, streak: 'L2', last5: '2-3', playoffSeed: 6, cardMarketIndex: 118, cardMarketChange: 12.1 },
  { rank: 7, team: 'Philadelphia 76ers', conference: 'Eastern', division: 'Atlantic', wins: 36, losses: 30, winPct: 0.545, pointsFor: 112.1, pointsAgainst: 111.5, streak: 'W1', last5: '3-2', playoffSeed: 7, cardMarketIndex: 132, cardMarketChange: -8.2 },
  { rank: 8, team: 'Oklahoma City Thunder', conference: 'Western', division: 'Northwest', wins: 54, losses: 12, winPct: 0.818, pointsFor: 119.5, pointsAgainst: 106.8, streak: 'W6', last5: '5-0', playoffSeed: 1, cardMarketIndex: 172, cardMarketChange: 28.5 },
  { rank: 9, team: 'Houston Rockets', conference: 'Western', division: 'Southwest', wins: 46, losses: 20, winPct: 0.697, pointsFor: 112.8, pointsAgainst: 107.5, streak: 'W3', last5: '4-1', playoffSeed: 2, cardMarketIndex: 135, cardMarketChange: 32.1 },
  { rank: 10, team: 'Denver Nuggets', conference: 'Western', division: 'Northwest', wins: 44, losses: 22, winPct: 0.667, pointsFor: 115.2, pointsAgainst: 111.8, streak: 'L1', last5: '3-2', playoffSeed: 3, cardMarketIndex: 145, cardMarketChange: -2.8 },
  { rank: 11, team: 'Memphis Grizzlies', conference: 'Western', division: 'Southwest', wins: 42, losses: 24, winPct: 0.636, pointsFor: 114.5, pointsAgainst: 110.5, streak: 'W2', last5: '4-1', playoffSeed: 4, cardMarketIndex: 128, cardMarketChange: 15.8 },
  { rank: 12, team: 'Dallas Mavericks', conference: 'Western', division: 'Southwest', wins: 40, losses: 26, winPct: 0.606, pointsFor: 116.8, pointsAgainst: 113.2, streak: 'W1', last5: '3-2', playoffSeed: 5, cardMarketIndex: 155, cardMarketChange: 4.5 },
  { rank: 13, team: 'Minnesota Timberwolves', conference: 'Western', division: 'Northwest', wins: 38, losses: 28, winPct: 0.576, pointsFor: 110.2, pointsAgainst: 108.5, streak: 'L2', last5: '2-3', playoffSeed: 6, cardMarketIndex: 122, cardMarketChange: -5.8 },
  { rank: 14, team: 'Los Angeles Lakers', conference: 'Western', division: 'Pacific', wins: 37, losses: 29, winPct: 0.561, pointsFor: 113.5, pointsAgainst: 112.8, streak: 'L1', last5: '2-3', playoffSeed: 7, cardMarketIndex: 168, cardMarketChange: -1.2 },
];

const NBA_DRAFT_CLASS: LeagueDraftClass[] = [
  { id: 'nba-d1', name: 'Zaccharie Risacher', position: 'SF', team: 'Atlanta Hawks', school: 'JL Bourg (France)', pickNumber: 1, round: 1, rookieCardValue: 125, rookieCardChange: -5.2, projectedCeiling: 420, gamesPlayed: 58, keyStats: { ppg: 12.4, rpg: 4.8, apg: 1.5, fgPct: '42.1%' }, trend: 'stable' },
  { id: 'nba-d2', name: 'Alex Sarr', position: 'C', team: 'Washington Wizards', school: 'Perth (NBL)', pickNumber: 2, round: 1, rookieCardValue: 145, rookieCardChange: 8.5, projectedCeiling: 480, gamesPlayed: 60, keyStats: { ppg: 14.2, rpg: 7.1, bpg: 2.3, fgPct: '46.8%' }, trend: 'up' },
  { id: 'nba-d3', name: 'Reed Sheppard', position: 'SG', team: 'Houston Rockets', school: 'Kentucky', pickNumber: 3, round: 1, rookieCardValue: 185, rookieCardChange: 24.5, projectedCeiling: 550, gamesPlayed: 56, keyStats: { ppg: 15.8, rpg: 3.2, apg: 4.5, threePct: '41.2%' }, trend: 'up' },
  { id: 'nba-d4', name: 'Stephon Castle', position: 'PG', team: 'San Antonio Spurs', school: 'UConn', pickNumber: 4, round: 1, rookieCardValue: 112, rookieCardChange: 6.8, projectedCeiling: 380, gamesPlayed: 54, keyStats: { ppg: 11.8, rpg: 2.8, apg: 5.2, fgPct: '43.5%' }, trend: 'up' },
  { id: 'nba-d5', name: 'Dalton Knecht', position: 'SG', team: 'Los Angeles Lakers', school: 'Tennessee', pickNumber: 17, round: 1, rookieCardValue: 155, rookieCardChange: 32.1, projectedCeiling: 420, gamesPlayed: 62, keyStats: { ppg: 14.5, rpg: 3.8, threePct: '38.5%' }, trend: 'up' },
  { id: 'nba-d6', name: 'Donovan Clingan', position: 'C', team: 'Portland Trail Blazers', school: 'UConn', pickNumber: 7, round: 1, rookieCardValue: 88, rookieCardChange: 4.2, projectedCeiling: 310, gamesPlayed: 48, keyStats: { ppg: 8.5, rpg: 6.2, bpg: 1.8, fgPct: '55.2%' }, trend: 'stable' },
  { id: 'nba-d7', name: 'Cody Williams', position: 'SF', team: 'Utah Jazz', school: 'Colorado', pickNumber: 10, round: 1, rookieCardValue: 72, rookieCardChange: -2.8, projectedCeiling: 280, gamesPlayed: 52, keyStats: { ppg: 9.2, rpg: 3.5, apg: 1.8, fgPct: '41.8%' }, trend: 'down' },
  { id: 'nba-d8', name: 'Rob Dillingham', position: 'PG', team: 'Minnesota Timberwolves', school: 'Kentucky', pickNumber: 8, round: 1, rookieCardValue: 95, rookieCardChange: 11.5, projectedCeiling: 350, gamesPlayed: 50, keyStats: { ppg: 10.8, apg: 4.8, fgPct: '44.2%' }, trend: 'up' },
  { id: 'nba-d9', name: 'Matas Buzelis', position: 'SF', team: 'Chicago Bulls', school: 'G League Ignite', pickNumber: 11, round: 1, rookieCardValue: 68, rookieCardChange: -8.5, projectedCeiling: 240, gamesPlayed: 44, keyStats: { ppg: 7.5, rpg: 3.2, bpg: 1.2, fgPct: '38.5%' }, trend: 'down' },
  { id: 'nba-d10', name: 'Tidjane Salaun', position: 'SF', team: 'Charlotte Hornets', school: 'Cholet (France)', pickNumber: 6, round: 1, rookieCardValue: 62, rookieCardChange: -4.1, projectedCeiling: 220, gamesPlayed: 46, keyStats: { ppg: 8.2, rpg: 4.5, fgPct: '40.2%' }, trend: 'down' },
];

const NBA_SEASON_EVENTS: LeagueSeasonEvent[] = [
  { id: 'nba-e1', name: 'NBA All-Star Weekend', date: '2026-02-15', type: 'allstar', description: 'All-Star Game in San Francisco', cardMarketImpact: 'high' },
  { id: 'nba-e2', name: 'NBA Trade Deadline', date: '2026-02-06', type: 'transfer', description: 'Last day for trades', cardMarketImpact: 'high' },
  { id: 'nba-e3', name: 'NBA Draft 2026', date: '2026-06-25', type: 'draft', description: 'First round in Brooklyn', cardMarketImpact: 'high' },
  { id: 'nba-e4', name: 'Playoffs Begin', date: '2026-04-19', type: 'playoff', description: 'First round matchups set', cardMarketImpact: 'high' },
  { id: 'nba-e5', name: 'NBA Finals', date: '2026-06-05', type: 'final', description: 'Championship series Game 1', cardMarketImpact: 'high' },
  { id: 'nba-e6', name: 'Free Agency Opens', date: '2026-06-30', type: 'transfer', description: 'Teams can begin negotiations', cardMarketImpact: 'high' },
  { id: 'nba-e7', name: 'Regular Season Ends', date: '2026-04-13', type: 'regular', description: 'Final day of regular season', cardMarketImpact: 'medium' },
  { id: 'nba-e8', name: 'Play-In Tournament', date: '2026-04-15', type: 'playoff', description: '7-10 seeds compete', cardMarketImpact: 'medium' },
  { id: 'nba-e9', name: 'Draft Lottery', date: '2026-05-20', type: 'draft', description: 'Non-playoff teams lottery', cardMarketImpact: 'high' },
  { id: 'nba-e10', name: 'Christmas Day Games', date: '2025-12-25', type: 'regular', description: 'Premier holiday matchups', cardMarketImpact: 'medium' },
];

const NBA_STAT_LEADERS: LeagueStatLeader[] = [
  { rank: 1, player: 'Luka Doncic', team: 'DAL', position: 'PG', statCategory: 'PPG', statValue: 33.2, statLabel: 'PPG', gamesPlayed: 58, cardValue: 685, cardChange: 6.5, efficiency: 31.2 },
  { rank: 2, player: 'Shai Gilgeous-Alexander', team: 'OKC', position: 'SG', statCategory: 'PPG', statValue: 31.8, statLabel: 'PPG', gamesPlayed: 62, cardValue: 545, cardChange: 28.4, efficiency: 30.5 },
  { rank: 3, player: 'Giannis Antetokounmpo', team: 'MIL', position: 'PF', statCategory: 'PPG', statValue: 30.4, statLabel: 'PPG', gamesPlayed: 56, cardValue: 485, cardChange: -2.1, efficiency: 29.8 },
  { rank: 1, player: 'Domantas Sabonis', team: 'SAC', position: 'C', statCategory: 'RPG', statValue: 14.2, statLabel: 'RPG', gamesPlayed: 64, cardValue: 165, cardChange: 12.8, efficiency: 26.5 },
  { rank: 2, player: 'Nikola Jokic', team: 'DEN', position: 'C', statCategory: 'RPG', statValue: 13.1, statLabel: 'RPG', gamesPlayed: 62, cardValue: 725, cardChange: 5.2, efficiency: 32.8 },
  { rank: 3, player: 'Anthony Davis', team: 'LAL', position: 'PF', statCategory: 'RPG', statValue: 12.4, statLabel: 'RPG', gamesPlayed: 58, cardValue: 285, cardChange: 8.5, efficiency: 28.2 },
  { rank: 1, player: 'Nikola Jokic', team: 'DEN', position: 'C', statCategory: 'APG', statValue: 10.2, statLabel: 'APG', gamesPlayed: 62, cardValue: 725, cardChange: 5.2, efficiency: 32.8 },
  { rank: 2, player: 'Tyrese Haliburton', team: 'IND', position: 'PG', statCategory: 'APG', statValue: 9.5, statLabel: 'APG', gamesPlayed: 54, cardValue: 225, cardChange: -5.8, efficiency: 22.5 },
  { rank: 3, player: 'Trae Young', team: 'ATL', position: 'PG', statCategory: 'APG', statValue: 8.8, statLabel: 'APG', gamesPlayed: 60, cardValue: 195, cardChange: 4.2, efficiency: 21.8 },
  { rank: 4, player: 'LaMelo Ball', team: 'CHA', position: 'PG', statCategory: 'APG', statValue: 8.2, statLabel: 'APG', gamesPlayed: 50, cardValue: 285, cardChange: -12.5, efficiency: 20.5 },
];

// ── NHL Mock Data ────────────────────────────────────────────────────────────

const NHL_STANDINGS: LeagueStanding[] = [
  { rank: 1, team: 'Winnipeg Jets', conference: 'Western', division: 'Central', wins: 44, losses: 16, otLosses: 4, winPct: 0.719, pointsFor: 228, pointsAgainst: 172, streak: 'W4', last5: '4-0-1', playoffSeed: 1, cardMarketIndex: 138, cardMarketChange: 22.5 },
  { rank: 2, team: 'Washington Capitals', conference: 'Eastern', division: 'Metropolitan', wins: 42, losses: 18, otLosses: 5, winPct: 0.685, pointsFor: 235, pointsAgainst: 188, streak: 'W3', last5: '4-1-0', playoffSeed: 1, cardMarketIndex: 155, cardMarketChange: 18.2 },
  { rank: 3, team: 'Florida Panthers', conference: 'Eastern', division: 'Atlantic', wins: 40, losses: 20, otLosses: 4, winPct: 0.656, pointsFor: 218, pointsAgainst: 182, streak: 'W2', last5: '3-1-1', playoffSeed: 2, cardMarketIndex: 148, cardMarketChange: 8.5 },
  { rank: 4, team: 'Dallas Stars', conference: 'Western', division: 'Central', wins: 40, losses: 19, otLosses: 5, winPct: 0.664, pointsFor: 222, pointsAgainst: 180, streak: 'L1', last5: '3-2-0', playoffSeed: 2, cardMarketIndex: 132, cardMarketChange: 6.8 },
  { rank: 5, team: 'Toronto Maple Leafs', conference: 'Eastern', division: 'Atlantic', wins: 38, losses: 22, otLosses: 4, winPct: 0.625, pointsFor: 215, pointsAgainst: 192, streak: 'W1', last5: '3-2-0', playoffSeed: 3, cardMarketIndex: 158, cardMarketChange: -2.5 },
  { rank: 6, team: 'Edmonton Oilers', conference: 'Western', division: 'Pacific', wins: 38, losses: 22, otLosses: 5, winPct: 0.623, pointsFor: 232, pointsAgainst: 198, streak: 'W5', last5: '5-0-0', playoffSeed: 3, cardMarketIndex: 172, cardMarketChange: 12.8 },
  { rank: 7, team: 'Carolina Hurricanes', conference: 'Eastern', division: 'Metropolitan', wins: 38, losses: 21, otLosses: 5, winPct: 0.633, pointsFor: 210, pointsAgainst: 178, streak: 'L2', last5: '2-2-1', playoffSeed: 4, cardMarketIndex: 128, cardMarketChange: 4.2 },
  { rank: 8, team: 'Colorado Avalanche', conference: 'Western', division: 'Central', wins: 37, losses: 23, otLosses: 4, winPct: 0.609, pointsFor: 225, pointsAgainst: 202, streak: 'W2', last5: '3-1-1', playoffSeed: 4, cardMarketIndex: 162, cardMarketChange: 8.5 },
  { rank: 9, team: 'New Jersey Devils', conference: 'Eastern', division: 'Metropolitan', wins: 36, losses: 24, otLosses: 5, winPct: 0.592, pointsFor: 218, pointsAgainst: 198, streak: 'W1', last5: '3-2-0', playoffSeed: 5, cardMarketIndex: 135, cardMarketChange: 15.2 },
  { rank: 10, team: 'Vegas Golden Knights', conference: 'Western', division: 'Pacific', wins: 36, losses: 24, otLosses: 4, winPct: 0.594, pointsFor: 212, pointsAgainst: 195, streak: 'L1', last5: '2-3-0', playoffSeed: 5, cardMarketIndex: 125, cardMarketChange: -4.8 },
];

const NHL_DRAFT_CLASS: LeagueDraftClass[] = [
  { id: 'nhl-d1', name: 'Macklin Celebrini', position: 'C', team: 'San Jose Sharks', school: 'Boston University', pickNumber: 1, round: 1, rookieCardValue: 165, rookieCardChange: 18.5, projectedCeiling: 520, gamesPlayed: 52, keyStats: { goals: 18, assists: 28, points: 46, plusMinus: 8 }, trend: 'up' },
  { id: 'nhl-d2', name: 'Artyom Levshunov', position: 'D', team: 'Chicago Blackhawks', school: 'Michigan State', pickNumber: 2, round: 1, rookieCardValue: 85, rookieCardChange: 5.2, projectedCeiling: 280, gamesPlayed: 58, keyStats: { goals: 5, assists: 22, points: 27, plusMinus: 12 }, trend: 'stable' },
  { id: 'nhl-d3', name: 'Beckett Sennecke', position: 'RW', team: 'Anaheim Ducks', school: 'Oshawa (OHL)', pickNumber: 3, round: 1, rookieCardValue: 72, rookieCardChange: 8.8, projectedCeiling: 245, gamesPlayed: 45, keyStats: { goals: 12, assists: 18, points: 30, plusMinus: 2 }, trend: 'up' },
  { id: 'nhl-d4', name: 'Cayden Lindstrom', position: 'C', team: 'Columbus Blue Jackets', school: 'Medicine Hat (WHL)', pickNumber: 4, round: 1, rookieCardValue: 68, rookieCardChange: -2.5, projectedCeiling: 220, gamesPlayed: 38, keyStats: { goals: 8, assists: 14, points: 22, plusMinus: -4 }, trend: 'down' },
  { id: 'nhl-d5', name: 'Ivan Demidov', position: 'LW', team: 'Montreal Canadiens', school: 'SKA (KHL)', pickNumber: 5, round: 1, rookieCardValue: 92, rookieCardChange: 15.2, projectedCeiling: 350, gamesPlayed: 42, keyStats: { goals: 14, assists: 22, points: 36, plusMinus: 6 }, trend: 'up' },
  { id: 'nhl-d6', name: 'Carter Yakemchuk', position: 'D', team: 'Ottawa Senators', school: 'Calgary (WHL)', pickNumber: 7, round: 1, rookieCardValue: 55, rookieCardChange: 3.5, projectedCeiling: 185, gamesPlayed: 50, keyStats: { goals: 4, assists: 16, points: 20, plusMinus: 5 }, trend: 'stable' },
  { id: 'nhl-d7', name: 'Tij Iginla', position: 'LW', team: 'Utah Hockey Club', school: 'Kelowna (WHL)', pickNumber: 6, round: 1, rookieCardValue: 62, rookieCardChange: 6.8, projectedCeiling: 210, gamesPlayed: 48, keyStats: { goals: 11, assists: 15, points: 26, plusMinus: 3 }, trend: 'up' },
  { id: 'nhl-d8', name: 'Zeev Buium', position: 'D', team: 'Minnesota Wild', school: 'Denver', pickNumber: 12, round: 1, rookieCardValue: 48, rookieCardChange: 12.5, projectedCeiling: 175, gamesPlayed: 44, keyStats: { goals: 3, assists: 18, points: 21, plusMinus: 8 }, trend: 'up' },
  { id: 'nhl-d9', name: 'Anton Silayev', position: 'D', team: 'New Jersey Devils', school: 'Torpedo (KHL)', pickNumber: 10, round: 1, rookieCardValue: 42, rookieCardChange: -1.2, projectedCeiling: 155, gamesPlayed: 35, keyStats: { goals: 2, assists: 10, points: 12, plusMinus: -2 }, trend: 'stable' },
  { id: 'nhl-d10', name: 'Michael Brandsegg-Nygard', position: 'LW', team: 'Detroit Red Wings', school: 'Mora (SHL)', pickNumber: 15, round: 1, rookieCardValue: 38, rookieCardChange: 8.2, projectedCeiling: 145, gamesPlayed: 40, keyStats: { goals: 9, assists: 12, points: 21, plusMinus: 4 }, trend: 'up' },
];

const NHL_SEASON_EVENTS: LeagueSeasonEvent[] = [
  { id: 'nhl-e1', name: 'Stanley Cup Playoffs', date: '2026-04-15', type: 'playoff', description: 'First round begins', cardMarketImpact: 'high' },
  { id: 'nhl-e2', name: 'NHL Trade Deadline', date: '2026-03-07', type: 'transfer', description: 'Contenders load up for playoff push', cardMarketImpact: 'high' },
  { id: 'nhl-e3', name: 'NHL Draft 2026', date: '2026-06-27', type: 'draft', description: 'First round from St. Paul, MN', cardMarketImpact: 'high' },
  { id: 'nhl-e4', name: 'NHL All-Star Game', date: '2026-02-01', type: 'allstar', description: '4 Nations Face-Off replacement', cardMarketImpact: 'medium' },
  { id: 'nhl-e5', name: 'Stanley Cup Final', date: '2026-06-02', type: 'final', description: 'Best of 7 championship', cardMarketImpact: 'high' },
  { id: 'nhl-e6', name: 'Free Agency Opens', date: '2026-07-01', type: 'transfer', description: 'UFA/RFA signings begin', cardMarketImpact: 'high' },
  { id: 'nhl-e7', name: 'Regular Season Ends', date: '2026-04-12', type: 'regular', description: 'Final day of regular season', cardMarketImpact: 'medium' },
  { id: 'nhl-e8', name: 'Winter Classic', date: '2026-01-01', type: 'regular', description: 'Outdoor game at Wrigley Field', cardMarketImpact: 'medium' },
  { id: 'nhl-e9', name: 'Conference Finals', date: '2026-05-15', type: 'playoff', description: 'Final four teams compete', cardMarketImpact: 'high' },
  { id: 'nhl-e10', name: 'Draft Lottery', date: '2026-05-12', type: 'draft', description: 'Non-playoff teams lottery', cardMarketImpact: 'high' },
];

const NHL_STAT_LEADERS: LeagueStatLeader[] = [
  { rank: 1, player: 'Nathan MacKinnon', team: 'COL', position: 'C', statCategory: 'Points', statValue: 98, statLabel: 'PTS', gamesPlayed: 62, cardValue: 385, cardChange: 12.5, efficiency: 1.58 },
  { rank: 2, player: 'Nikita Kucherov', team: 'TB', position: 'RW', statCategory: 'Points', statValue: 95, statLabel: 'PTS', gamesPlayed: 60, cardValue: 265, cardChange: 8.2, efficiency: 1.58 },
  { rank: 3, player: 'Connor McDavid', team: 'EDM', position: 'C', statCategory: 'Points', statValue: 92, statLabel: 'PTS', gamesPlayed: 58, cardValue: 685, cardChange: 5.8, efficiency: 1.59 },
  { rank: 1, player: 'Auston Matthews', team: 'TOR', position: 'C', statCategory: 'Goals', statValue: 42, statLabel: 'G', gamesPlayed: 60, cardValue: 425, cardChange: -2.5, efficiency: 0.70 },
  { rank: 2, player: 'Leon Draisaitl', team: 'EDM', position: 'C', statCategory: 'Goals', statValue: 40, statLabel: 'G', gamesPlayed: 62, cardValue: 285, cardChange: 15.2, efficiency: 0.65 },
  { rank: 3, player: 'Sam Reinhart', team: 'FLA', position: 'C', statCategory: 'Goals', statValue: 38, statLabel: 'G', gamesPlayed: 60, cardValue: 145, cardChange: 28.5, efficiency: 0.63 },
  { rank: 1, player: 'Connor McDavid', team: 'EDM', position: 'C', statCategory: 'Assists', statValue: 62, statLabel: 'A', gamesPlayed: 58, cardValue: 685, cardChange: 5.8, efficiency: 1.07 },
  { rank: 2, player: 'Nathan MacKinnon', team: 'COL', position: 'C', statCategory: 'Assists', statValue: 58, statLabel: 'A', gamesPlayed: 62, cardValue: 385, cardChange: 12.5, efficiency: 0.94 },
  { rank: 3, player: 'Cale Makar', team: 'COL', position: 'D', statCategory: 'Assists', statValue: 55, statLabel: 'A', gamesPlayed: 60, cardValue: 325, cardChange: 8.8, efficiency: 0.92 },
  { rank: 4, player: 'Alex Ovechkin', team: 'WSH', position: 'LW', statCategory: 'Goals', statValue: 35, statLabel: 'G', gamesPlayed: 56, cardValue: 525, cardChange: 32.5 },
];

// ── Soccer Mock Data ─────────────────────────────────────────────────────────

const SOCCER_STANDINGS: LeagueStanding[] = [
  // Premier League
  { rank: 1, team: 'Liverpool', conference: 'Premier League', division: 'Premier League', wins: 22, losses: 3, draws: 4, winPct: 0.759, pointsFor: 68, pointsAgainst: 24, streak: 'W4', last5: '5-0-0', playoffSeed: 1, cardMarketIndex: 175, cardMarketChange: 18.5 },
  { rank: 2, team: 'Arsenal', conference: 'Premier League', division: 'Premier League', wins: 19, losses: 4, draws: 6, winPct: 0.655, pointsFor: 58, pointsAgainst: 22, streak: 'W2', last5: '3-1-1', playoffSeed: 2, cardMarketIndex: 168, cardMarketChange: 8.2 },
  { rank: 3, team: 'Nottingham Forest', conference: 'Premier League', division: 'Premier League', wins: 17, losses: 6, draws: 6, winPct: 0.586, pointsFor: 48, pointsAgainst: 28, streak: 'W1', last5: '3-1-1', playoffSeed: 3, cardMarketIndex: 125, cardMarketChange: 42.8 },
  { rank: 4, team: 'Manchester City', conference: 'Premier League', division: 'Premier League', wins: 16, losses: 8, draws: 5, winPct: 0.552, pointsFor: 52, pointsAgainst: 32, streak: 'L2', last5: '2-2-1', cardMarketIndex: 182, cardMarketChange: -12.5 },
  { rank: 5, team: 'Chelsea', conference: 'Premier League', division: 'Premier League', wins: 15, losses: 7, draws: 7, winPct: 0.517, pointsFor: 55, pointsAgainst: 35, streak: 'D1', last5: '2-1-2', cardMarketIndex: 155, cardMarketChange: 5.8 },
  // La Liga
  { rank: 1, team: 'Barcelona', conference: 'La Liga', division: 'La Liga', wins: 21, losses: 4, draws: 4, winPct: 0.724, pointsFor: 72, pointsAgainst: 28, streak: 'W3', last5: '4-1-0', playoffSeed: 1, cardMarketIndex: 185, cardMarketChange: 15.2 },
  { rank: 2, team: 'Real Madrid', conference: 'La Liga', division: 'La Liga', wins: 18, losses: 5, draws: 6, winPct: 0.621, pointsFor: 62, pointsAgainst: 30, streak: 'W1', last5: '3-1-1', playoffSeed: 2, cardMarketIndex: 192, cardMarketChange: 8.5 },
  { rank: 3, team: 'Atletico Madrid', conference: 'La Liga', division: 'La Liga', wins: 18, losses: 4, draws: 7, winPct: 0.621, pointsFor: 52, pointsAgainst: 22, streak: 'D2', last5: '2-0-3', cardMarketIndex: 135, cardMarketChange: 12.8 },
  // Serie A
  { rank: 1, team: 'Napoli', conference: 'Serie A', division: 'Serie A', wins: 20, losses: 4, draws: 5, winPct: 0.690, pointsFor: 55, pointsAgainst: 20, streak: 'W5', last5: '5-0-0', playoffSeed: 1, cardMarketIndex: 145, cardMarketChange: 22.5 },
  { rank: 2, team: 'Inter Milan', conference: 'Serie A', division: 'Serie A', wins: 18, losses: 3, draws: 6, winPct: 0.667, pointsFor: 58, pointsAgainst: 22, streak: 'D1', last5: '3-0-2', playoffSeed: 2, cardMarketIndex: 152, cardMarketChange: 6.8 },
  // Bundesliga
  { rank: 1, team: 'Bayern Munich', conference: 'Bundesliga', division: 'Bundesliga', wins: 19, losses: 4, draws: 4, winPct: 0.704, pointsFor: 68, pointsAgainst: 28, streak: 'W2', last5: '4-1-0', playoffSeed: 1, cardMarketIndex: 172, cardMarketChange: 5.2 },
  { rank: 2, team: 'Bayer Leverkusen', conference: 'Bundesliga', division: 'Bundesliga', wins: 17, losses: 5, draws: 5, winPct: 0.630, pointsFor: 62, pointsAgainst: 30, streak: 'W1', last5: '3-1-1', cardMarketIndex: 148, cardMarketChange: -8.5 },
  // MLS
  { rank: 1, team: 'Inter Miami', conference: 'MLS', division: 'MLS Eastern', wins: 8, losses: 2, draws: 2, winPct: 0.667, pointsFor: 28, pointsAgainst: 12, streak: 'W3', last5: '4-1-0', playoffSeed: 1, cardMarketIndex: 195, cardMarketChange: 35.2 },
  { rank: 2, team: 'LAFC', conference: 'MLS', division: 'MLS Western', wins: 7, losses: 3, draws: 2, winPct: 0.583, pointsFor: 22, pointsAgainst: 14, streak: 'W1', last5: '3-1-1', playoffSeed: 1, cardMarketIndex: 118, cardMarketChange: 8.5 },
];

const SOCCER_DRAFT_CLASS: LeagueDraftClass[] = [
  { id: 'soc-d1', name: 'Lamine Yamal', position: 'RW', team: 'Barcelona', school: 'La Masia Academy', pickNumber: 0, round: 0, rookieCardValue: 485, rookieCardChange: 45.2, projectedCeiling: 1500, gamesPlayed: 38, keyStats: { goals: 12, assists: 15, appearances: 38, rating: 8.2 }, trend: 'up' },
  { id: 'soc-d2', name: 'Kobbie Mainoo', position: 'CM', team: 'Manchester United', school: 'Academy', pickNumber: 0, round: 0, rookieCardValue: 165, rookieCardChange: 28.5, projectedCeiling: 520, gamesPlayed: 32, keyStats: { goals: 4, assists: 5, appearances: 32, rating: 7.5 }, trend: 'up' },
  { id: 'soc-d3', name: 'Endrick', position: 'ST', team: 'Real Madrid', school: 'Palmeiras Academy', pickNumber: 0, round: 0, rookieCardValue: 225, rookieCardChange: -8.5, projectedCeiling: 850, gamesPlayed: 18, keyStats: { goals: 3, assists: 2, appearances: 18, rating: 6.8 }, trend: 'down' },
  { id: 'soc-d4', name: 'Warren Zaire-Emery', position: 'CM', team: 'Paris Saint-Germain', school: 'PSG Academy', pickNumber: 0, round: 0, rookieCardValue: 185, rookieCardChange: 12.8, projectedCeiling: 620, gamesPlayed: 34, keyStats: { goals: 5, assists: 8, appearances: 34, rating: 7.8 }, trend: 'up' },
  { id: 'soc-d5', name: 'Alejandro Garnacho', position: 'LW', team: 'Napoli', school: 'Man Utd Academy', pickNumber: 0, round: 0, rookieCardValue: 145, rookieCardChange: 15.2, projectedCeiling: 450, gamesPlayed: 28, keyStats: { goals: 8, assists: 5, appearances: 28, rating: 7.2 }, trend: 'up' },
  { id: 'soc-d6', name: 'Florian Wirtz', position: 'CAM', team: 'Bayer Leverkusen', school: 'Leverkusen Academy', pickNumber: 0, round: 0, rookieCardValue: 325, rookieCardChange: 22.5, projectedCeiling: 980, gamesPlayed: 30, keyStats: { goals: 14, assists: 10, appearances: 30, rating: 8.5 }, trend: 'up' },
  { id: 'soc-d7', name: 'Pau Cubarsi', position: 'CB', team: 'Barcelona', school: 'La Masia Academy', pickNumber: 0, round: 0, rookieCardValue: 135, rookieCardChange: 35.8, projectedCeiling: 420, gamesPlayed: 36, keyStats: { goals: 1, assists: 2, tackles: 78, rating: 7.8 }, trend: 'up' },
  { id: 'soc-d8', name: 'Jamie Bynoe-Gittens', position: 'LW', team: 'Borussia Dortmund', school: 'Man City Academy', pickNumber: 0, round: 0, rookieCardValue: 72, rookieCardChange: 18.5, projectedCeiling: 280, gamesPlayed: 26, keyStats: { goals: 6, assists: 4, appearances: 26, rating: 7.1 }, trend: 'up' },
  { id: 'soc-d9', name: 'Mathys Tel', position: 'ST', team: 'Bayern Munich', school: 'Rennes Academy', pickNumber: 0, round: 0, rookieCardValue: 95, rookieCardChange: -4.2, projectedCeiling: 350, gamesPlayed: 24, keyStats: { goals: 5, assists: 3, appearances: 24, rating: 6.9 }, trend: 'down' },
  { id: 'soc-d10', name: 'Cavan Sullivan', position: 'CAM', team: 'Philadelphia Union', school: 'Academy', pickNumber: 0, round: 0, rookieCardValue: 55, rookieCardChange: 42.1, projectedCeiling: 220, gamesPlayed: 12, keyStats: { goals: 2, assists: 3, appearances: 12, rating: 6.8 }, trend: 'up' },
];

const SOCCER_SEASON_EVENTS: LeagueSeasonEvent[] = [
  { id: 'soc-e1', name: 'Transfer Window Opens', date: '2026-01-01', type: 'transfer', description: 'January transfer window begins', cardMarketImpact: 'high' },
  { id: 'soc-e2', name: 'Transfer Window Closes', date: '2026-02-03', type: 'transfer', description: 'January window deadline day', cardMarketImpact: 'high' },
  { id: 'soc-e3', name: 'Champions League R16', date: '2026-02-18', type: 'playoff', description: 'UCL knockout rounds begin', cardMarketImpact: 'high' },
  { id: 'soc-e4', name: 'World Cup 2026 Kicks Off', date: '2026-06-11', type: 'international', description: 'FIFA World Cup in USA, Mexico, Canada', cardMarketImpact: 'high' },
  { id: 'soc-e5', name: 'World Cup Final', date: '2026-07-19', type: 'final', description: 'Championship match at MetLife Stadium', cardMarketImpact: 'high' },
  { id: 'soc-e6', name: 'Summer Transfer Window', date: '2026-07-01', type: 'transfer', description: 'Summer window opens across Europe', cardMarketImpact: 'high' },
  { id: 'soc-e7', name: 'Premier League Season Start', date: '2026-08-15', type: 'regular', description: 'New EPL season kicks off', cardMarketImpact: 'medium' },
  { id: 'soc-e8', name: 'Champions League Final', date: '2026-05-30', type: 'final', description: 'UCL Final in Budapest', cardMarketImpact: 'high' },
  { id: 'soc-e9', name: 'MLS Season Opener', date: '2026-02-22', type: 'regular', description: 'New MLS season begins', cardMarketImpact: 'medium' },
  { id: 'soc-e10', name: 'Copa America 2026', date: '2026-06-20', type: 'international', description: 'South American championship', cardMarketImpact: 'medium' },
];

const SOCCER_STAT_LEADERS: LeagueStatLeader[] = [
  { rank: 1, player: 'Erling Haaland', team: 'Man City', position: 'ST', statCategory: 'Goals', statValue: 22, statLabel: 'Goals', gamesPlayed: 28, cardValue: 525, cardChange: -5.2 },
  { rank: 2, player: 'Mohamed Salah', team: 'Liverpool', position: 'RW', statCategory: 'Goals', statValue: 20, statLabel: 'Goals', gamesPlayed: 26, cardValue: 385, cardChange: 18.5 },
  { rank: 3, player: 'Robert Lewandowski', team: 'Barcelona', position: 'ST', statCategory: 'Goals', statValue: 19, statLabel: 'Goals', gamesPlayed: 25, cardValue: 195, cardChange: 8.2 },
  { rank: 4, player: 'Harry Kane', team: 'Bayern Munich', position: 'ST', statCategory: 'Goals', statValue: 24, statLabel: 'Goals', gamesPlayed: 24, cardValue: 285, cardChange: 12.5 },
  { rank: 5, player: 'Vinicius Jr.', team: 'Real Madrid', position: 'LW', statCategory: 'Goals', statValue: 16, statLabel: 'Goals', gamesPlayed: 26, cardValue: 445, cardChange: 15.8 },
  { rank: 1, player: 'Mohamed Salah', team: 'Liverpool', position: 'RW', statCategory: 'Assists', statValue: 14, statLabel: 'Assists', gamesPlayed: 26, cardValue: 385, cardChange: 18.5 },
  { rank: 2, player: 'Bukayo Saka', team: 'Arsenal', position: 'RW', statCategory: 'Assists', statValue: 12, statLabel: 'Assists', gamesPlayed: 24, cardValue: 325, cardChange: 8.8 },
  { rank: 3, player: 'Kevin De Bruyne', team: 'Man City', position: 'CM', statCategory: 'Assists', statValue: 11, statLabel: 'Assists', gamesPlayed: 20, cardValue: 265, cardChange: -8.5 },
  { rank: 4, player: 'Lamine Yamal', team: 'Barcelona', position: 'RW', statCategory: 'Assists', statValue: 15, statLabel: 'Assists', gamesPlayed: 28, cardValue: 485, cardChange: 45.2 },
  { rank: 5, player: 'Florian Wirtz', team: 'Leverkusen', position: 'CAM', statCategory: 'Assists', statValue: 10, statLabel: 'Assists', gamesPlayed: 24, cardValue: 325, cardChange: 22.5 },
];

const SOCCER_TRANSFERS: TransferImpact[] = [
  { player: 'Alejandro Garnacho', fromTeam: 'Manchester United', toTeam: 'Napoli', league: 'Serie A', fee: '55M', cardValueBefore: 95, cardValueAfter: 145, projectedImpact: 52.6 },
  { player: 'Khvicha Kvaratskhelia', fromTeam: 'Napoli', toTeam: 'Paris Saint-Germain', league: 'Ligue 1', fee: '70M', cardValueBefore: 185, cardValueAfter: 225, projectedImpact: 21.6 },
  { player: 'Randal Kolo Muani', fromTeam: 'PSG', toTeam: 'Juventus', league: 'Serie A', fee: 'Loan', cardValueBefore: 65, cardValueAfter: 78, projectedImpact: 20.0 },
  { player: 'Marcus Rashford', fromTeam: 'Manchester United', toTeam: 'Aston Villa', league: 'Premier League', fee: 'Loan', cardValueBefore: 125, cardValueAfter: 135, projectedImpact: 8.0 },
  { player: 'Omar Marmoush', fromTeam: 'Eintracht Frankfurt', toTeam: 'Manchester City', league: 'Premier League', fee: '75M', cardValueBefore: 85, cardValueAfter: 155, projectedImpact: 82.4 },
  { player: 'Mathys Tel', fromTeam: 'Bayern Munich', toTeam: 'Tottenham', league: 'Premier League', fee: 'Loan', cardValueBefore: 72, cardValueAfter: 95, projectedImpact: 31.9 },
  { player: 'Patrick Dorgu', fromTeam: 'Lecce', toTeam: 'Manchester United', league: 'Premier League', fee: '30M', cardValueBefore: 42, cardValueAfter: 88, projectedImpact: 109.5 },
  { player: 'Dani Olmo', fromTeam: 'Leipzig', toTeam: 'Barcelona', league: 'La Liga', fee: '55M', cardValueBefore: 115, cardValueAfter: 155, projectedImpact: 34.8 },
];

// ── Shared Card Market Trend Data ────────────────────────────────────────────

function generateCardMarketTrends(sport: LeagueSport): LeagueCardMarketTrend[] {
  const baseValues: Record<LeagueSport, { overall: number; rookies: number; veterans: number; volume: number }> = {
    nfl: { overall: 100, rookies: 115, veterans: 92, volume: 45000 },
    nba: { overall: 108, rookies: 125, veterans: 95, volume: 52000 },
    nhl: { overall: 82, rookies: 98, veterans: 78, volume: 18000 },
    soccer: { overall: 95, rookies: 135, veterans: 85, volume: 32000 },
  };
  const base = baseValues[sport];
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  return months.map((month, i) => {
    const factor = 1 + Math.sin(i / 3) * 0.12 + (i * 0.015);
    const noise = () => (Math.random() - 0.5) * 8;
    return {
      month,
      overall: Math.round((base.overall * factor + noise()) * 10) / 10,
      rookies: Math.round((base.rookies * factor * 1.05 + noise()) * 10) / 10,
      veterans: Math.round((base.veterans * factor * 0.98 + noise()) * 10) / 10,
      volume: Math.round(base.volume * factor * (0.9 + Math.random() * 0.2)),
    };
  });
}

function generateRookieWatch(sport: LeagueSport): LeagueRookieWatch[] {
  const draftClasses: Record<LeagueSport, LeagueDraftClass[]> = {
    nfl: NFL_DRAFT_CLASS,
    nba: NBA_DRAFT_CLASS,
    nhl: NHL_DRAFT_CLASS,
    soccer: SOCCER_DRAFT_CLASS,
  };
  return draftClasses[sport].slice(0, 8).map((d, i) => ({
    id: `${sport}-rw-${i}`,
    name: d.name,
    team: d.team,
    position: d.position,
    sport,
    draftPick: d.pickNumber,
    topCardName: `${d.name} Prizm Silver RC`,
    topCardValue: d.rookieCardValue,
    weeklyChange: d.rookieCardChange,
    seasonGrade: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'][i] || 'B',
    recentPerformance: d.trend === 'up' ? 'Hot streak - 3 straight strong performances' : d.trend === 'down' ? 'Struggling - below expectations recently' : 'Steady - meeting projections',
    projectedROI: Math.round((d.projectedCeiling / d.rookieCardValue - 1) * 100),
    hypeScore: Math.max(0, Math.min(100, 95 - i * 8 + (d.trend === 'up' ? 5 : d.trend === 'down' ? -10 : 0))),
  }));
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getLeagueStandings(sport: LeagueSport): LeagueStanding[] {
  const standings: Record<LeagueSport, LeagueStanding[]> = {
    nfl: NFL_STANDINGS,
    nba: NBA_STANDINGS,
    nhl: NHL_STANDINGS,
    soccer: SOCCER_STANDINGS,
  };
  return standings[sport] || [];
}

export function getDraftClass(sport: LeagueSport): LeagueDraftClass[] {
  const classes: Record<LeagueSport, LeagueDraftClass[]> = {
    nfl: NFL_DRAFT_CLASS,
    nba: NBA_DRAFT_CLASS,
    nhl: NHL_DRAFT_CLASS,
    soccer: SOCCER_DRAFT_CLASS,
  };
  return classes[sport] || [];
}

export function getSeasonCalendar(sport: LeagueSport): LeagueSeasonEvent[] {
  const calendars: Record<LeagueSport, LeagueSeasonEvent[]> = {
    nfl: NFL_SEASON_EVENTS,
    nba: NBA_SEASON_EVENTS,
    nhl: NHL_SEASON_EVENTS,
    soccer: SOCCER_SEASON_EVENTS,
  };
  return calendars[sport] || [];
}

export function getStatLeaders(sport: LeagueSport): LeagueStatLeader[] {
  const leaders: Record<LeagueSport, LeagueStatLeader[]> = {
    nfl: NFL_STAT_LEADERS,
    nba: NBA_STAT_LEADERS,
    nhl: NHL_STAT_LEADERS,
    soccer: SOCCER_STAT_LEADERS,
  };
  return leaders[sport] || [];
}

export function getCardMarketTrends(sport: LeagueSport): LeagueCardMarketTrend[] {
  return generateCardMarketTrends(sport);
}

export function getRookieWatch(sport: LeagueSport): LeagueRookieWatch[] {
  return generateRookieWatch(sport);
}

export function getInjuryImpacts(): InjuryCardImpact[] {
  return NFL_INJURY_IMPACTS;
}

export function getTransferImpacts(): TransferImpact[] {
  return SOCCER_TRANSFERS;
}

export function getLeaguePlayerDesk(sport: LeagueSport): LeaguePlayerDesk[] {
  const leaders = getStatLeaders(sport);
  const rookies = getDraftClass(sport);
  const watch = getRookieWatch(sport);
  const byName = new Map<string, LeaguePlayerDesk>();

  for (const leader of leaders) {
    const existing = byName.get(leader.player);
    const row: LeaguePlayerDesk = {
      id: `${sport}-p-${leader.player.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: leader.player,
      team: leader.team,
      position: leader.position,
      sport,
      role: 'leader',
      headlineStat: `${leader.statValue} ${leader.statLabel}`,
      cardValue: leader.cardValue,
      cardChange: leader.cardChange,
      note: existing
        ? `${existing.note} · ${leader.statCategory}`
        : `${leader.statCategory} leader`,
    };
    byName.set(leader.player, row);
  }

  for (const rookie of rookies) {
    if (byName.has(rookie.name)) continue;
    byName.set(rookie.name, {
      id: `${sport}-r-${rookie.id}`,
      name: rookie.name,
      team: rookie.team,
      position: rookie.position,
      sport,
      role: 'rookie',
      headlineStat: `RC $${rookie.rookieCardValue}`,
      cardValue: rookie.rookieCardValue,
      cardChange: rookie.rookieCardChange,
      note: `Pick ${rookie.pickNumber} · ceiling $${rookie.projectedCeiling}`,
    });
  }

  for (const item of watch) {
    if (byName.has(item.name)) continue;
    byName.set(item.name, {
      id: `${sport}-w-${item.id}`,
      name: item.name,
      team: item.team,
      position: item.position,
      sport,
      role: 'watch',
      headlineStat: item.topCardName,
      cardValue: item.topCardValue,
      cardChange: item.weeklyChange,
      note: item.recentPerformance,
    });
  }

  return [...byName.values()].sort((a, b) => b.cardValue - a.cardValue);
}

export function getLeagueTeamDesk(sport: LeagueSport): LeagueTeamDesk[] {
  const standings = getLeagueStandings(sport);
  const players = getLeaguePlayerDesk(sport);
  return standings
    .map((team) => {
      const spotlight =
        players.find((p) =>
          p.team === team.team ||
          team.team.toLowerCase().includes(p.team.toLowerCase()) ||
          p.team.toLowerCase().includes(team.team.split(' ').pop()?.toLowerCase() || ''),
        )?.name ?? null;
      return {
        team: team.team,
        sport,
        conference: team.conference,
        division: team.division,
        record: team.draws != null
          ? `${team.wins}-${team.losses}-${team.draws}`
          : team.otLosses != null
            ? `${team.wins}-${team.losses}-${team.otLosses}`
            : `${team.wins}-${team.losses}`,
        winPct: team.winPct,
        playoffSeed: team.playoffSeed,
        cardMarketIndex: team.cardMarketIndex,
        cardMarketChange: team.cardMarketChange,
        spotlightPlayer: spotlight,
      };
    })
    .sort((a, b) => b.cardMarketIndex - a.cardMarketIndex);
}

export function searchLeaguePlayers(sport: LeagueSport, query: string): LeaguePlayerDesk[] {
  const q = query.trim().toLowerCase();
  const rows = getLeaguePlayerDesk(sport);
  if (!q) return rows;
  return rows.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.team.toLowerCase().includes(q) ||
    p.position.toLowerCase().includes(q),
  );
}

export function getLeagueHub(sport: LeagueSport): LeagueHub {
  return {
    sport,
    name: { nfl: 'NFL', nba: 'NBA', nhl: 'NHL', soccer: 'Soccer' }[sport],
    season: '2025-26',
    standings: getLeagueStandings(sport),
    draftClass: getDraftClass(sport),
    seasonCalendar: getSeasonCalendar(sport),
    statLeaders: getStatLeaders(sport),
    cardMarketTrends: getCardMarketTrends(sport),
    rookieWatch: getRookieWatch(sport),
    injuryImpacts: sport === 'nfl' ? getInjuryImpacts() : undefined,
    transfers: sport === 'soccer' ? getTransferImpacts() : undefined,
  };
}
