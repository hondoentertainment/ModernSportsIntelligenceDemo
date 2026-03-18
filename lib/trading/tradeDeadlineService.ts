// Phase 149: Trade Deadline & Free Agency Impact Tracker
// Tracks how trade deadlines, free agency signings, and roster moves impact card values in real-time

// ---- Types ----

export type League = 'nba' | 'nfl' | 'mlb' | 'nhl';

export interface TradeEvent {
  id: string;
  league: League;
  date: string;
  playerTraded: string;
  fromTeam: string;
  toTeam: string;
  tradeDetails: string;
  cardValueImpact: number;
  impactDirection: 'up' | 'down' | 'neutral';
  confirmed: boolean;
  headline: string;
  assetsReceived: string[];
}

export interface FreeAgentSigning {
  id: string;
  league: League;
  player: string;
  previousTeam: string;
  newTeam: string;
  contractYears: number;
  contractValue: number;
  signingDate: string;
  cardValueBefore: number;
  cardValueAfter: number;
  percentChange: number;
  headline: string;
}

export interface RosterMove {
  id: string;
  league: League;
  player: string;
  team: string;
  moveType: 'callup' | 'demotion' | 'injured_reserve' | 'waiver' | 'release' | 'retirement' | 'suspension';
  date: string;
  cardValueImpact: number;
  description: string;
}

export interface ImpactPrediction {
  id: string;
  playerId: string;
  playerName: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
  factors: string[];
}

export interface PlayerImpact {
  id: string;
  playerName: string;
  league: League;
  team: string;
  cardValueBefore: number;
  cardValueAfter: number;
  percentChange: number;
  reason: string;
  eventType: 'trade' | 'signing' | 'roster_move' | 'rumor';
  date: string;
  trending: 'up' | 'down' | 'stable';
}

export interface TeamImpact {
  id: string;
  teamName: string;
  league: League;
  overallImpact: number;
  playerChanges: number;
  averageCardValueChange: number;
  championshipOddsChange: number;
  description: string;
}

export interface DeadlineCountdown {
  id: string;
  league: League;
  deadlineName: string;
  deadlineDate: string;
  daysRemaining: number;
  hoursRemaining: number;
  isActive: boolean;
  expectedMoves: number;
  completedMoves: number;
}

export interface HistoricalTrade {
  id: string;
  league: League;
  year: number;
  playerTraded: string;
  fromTeam: string;
  toTeam: string;
  cardValueAtTrade: number;
  cardValueAfter: number;
  percentChange: number;
  timeToRealize: string;
  description: string;
}

export interface MarketReaction {
  id: string;
  eventId: string;
  eventType: 'trade' | 'signing' | 'rumor';
  volumeSpike: number;
  priceMovement: number;
  marketSentiment: 'bullish' | 'bearish' | 'mixed';
  topMovers: string[];
  timestamp: string;
}

export interface WatchlistAlert {
  id: string;
  playerName: string;
  alertType: 'trade_rumor' | 'value_spike' | 'value_drop' | 'deadline_approaching' | 'signing_imminent';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
}

export interface TradeRumor {
  id: string;
  league: League;
  playerName: string;
  currentTeam: string;
  rumoredTeams: string[];
  confidence: number;
  source: string;
  reportedDate: string;
  potentialCardImpact: number;
  description: string;
  status: 'active' | 'confirmed' | 'denied' | 'expired';
}

// ---- Storage Helpers ----

const STORAGE_KEY = 'msi_trade_deadline';

function loadData<T>(key: string): T | null {
  try {
    return store.get(`${STORAGE_KEY}_${key}`, null);
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    store.set(`${STORAGE_KEY}_${key}`, data);
  } catch {
    // Storage full or unavailable
  }
}

// ---- Helpers ----

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function getLeagueConfig(league: League): { label: string; text: string; bg: string; border: string } {
  switch (league) {
    case 'nba': return { label: 'NBA', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    case 'nfl': return { label: 'NFL', text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'mlb': return { label: 'MLB', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'nhl': return { label: 'NHL', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
  }
}

// ---- Mock Data: Trade Events (25) ----

const MOCK_TRADE_EVENTS: TradeEvent[] = [
  { id: 'te-1', league: 'nba', date: '2026-02-06', playerTraded: 'Lauri Markkanen', fromTeam: 'Utah Jazz', toTeam: 'Golden State Warriors', tradeDetails: 'Markkanen for Kuminga, Moody, and 2 first-round picks', cardValueImpact: 35, impactDirection: 'up', confirmed: true, headline: 'Warriors land Markkanen in blockbuster deal', assetsReceived: ['Jonathan Kuminga', 'Moses Moody', '2027 1st', '2029 1st'] },
  { id: 'te-2', league: 'nba', date: '2026-02-06', playerTraded: 'Dejounte Murray', fromTeam: 'New Orleans Pelicans', toTeam: 'Minnesota Timberwolves', tradeDetails: 'Murray for Conley, picks, and salary filler', cardValueImpact: 18, impactDirection: 'up', confirmed: true, headline: 'Timberwolves add Murray to bolster backcourt', assetsReceived: ['Mike Conley', '2027 1st', '2028 2nd'] },
  { id: 'te-3', league: 'nba', date: '2026-02-05', playerTraded: 'Zach LaVine', fromTeam: 'Chicago Bulls', toTeam: 'Denver Nuggets', tradeDetails: 'LaVine for Michael Porter Jr and picks', cardValueImpact: 22, impactDirection: 'up', confirmed: true, headline: 'Nuggets acquire LaVine to pair with Jokic', assetsReceived: ['Michael Porter Jr', '2027 1st'] },
  { id: 'te-4', league: 'nba', date: '2026-02-04', playerTraded: 'Brandon Ingram', fromTeam: 'New Orleans Pelicans', toTeam: 'Philadelphia 76ers', tradeDetails: 'Ingram for Tobias Harris and 2 first-round picks', cardValueImpact: 25, impactDirection: 'up', confirmed: true, headline: 'Sixers land Ingram for Embiid pairing', assetsReceived: ['Tobias Harris', '2027 1st', '2029 1st'] },
  { id: 'te-5', league: 'mlb', date: '2026-01-15', playerTraded: 'Vladmir Guerrero Jr', fromTeam: 'Toronto Blue Jays', toTeam: 'Los Angeles Dodgers', tradeDetails: 'Vlad Jr for top prospect package', cardValueImpact: 45, impactDirection: 'up', confirmed: true, headline: 'Dodgers complete mega-deal for Guerrero Jr', assetsReceived: ['Dalton Rushing', 'Nick Frasso', '2027 1st'] },
  { id: 'te-6', league: 'nfl', date: '2026-03-10', playerTraded: 'Tua Tagovailoa', fromTeam: 'Miami Dolphins', toTeam: 'Las Vegas Raiders', tradeDetails: 'Tagovailoa for 2027 1st and 2026 3rd', cardValueImpact: -12, impactDirection: 'down', confirmed: true, headline: 'Raiders take gamble on Tagovailoa', assetsReceived: ['2027 1st', '2026 3rd'] },
  { id: 'te-7', league: 'nba', date: '2026-02-06', playerTraded: 'Pascal Siakam', fromTeam: 'Indiana Pacers', toTeam: 'Los Angeles Lakers', tradeDetails: 'Siakam for Rui Hachimura, picks', cardValueImpact: 20, impactDirection: 'up', confirmed: true, headline: 'Lakers add Siakam alongside LeBron and AD', assetsReceived: ['Rui Hachimura', '2027 1st', '2028 2nd'] },
  { id: 'te-8', league: 'mlb', date: '2026-01-22', playerTraded: 'Corbin Burnes', fromTeam: 'Baltimore Orioles', toTeam: 'Boston Red Sox', tradeDetails: 'Burnes for 3-prospect package', cardValueImpact: 15, impactDirection: 'up', confirmed: true, headline: 'Red Sox land ace Burnes in major trade', assetsReceived: ['Marcelo Mayer', 'Kyle Teel', '2027 PTBNL'] },
  { id: 'te-9', league: 'nhl', date: '2026-03-03', playerTraded: 'Elias Pettersson', fromTeam: 'Vancouver Canucks', toTeam: 'Carolina Hurricanes', tradeDetails: 'Pettersson for Svechnikov and picks', cardValueImpact: 28, impactDirection: 'up', confirmed: true, headline: 'Hurricanes acquire Pettersson in franchise-altering deal', assetsReceived: ['Andrei Svechnikov', '2027 1st', '2028 1st'] },
  { id: 'te-10', league: 'nba', date: '2026-02-05', playerTraded: 'Darius Garland', fromTeam: 'Cleveland Cavaliers', toTeam: 'San Antonio Spurs', tradeDetails: 'Garland for Keldon Johnson, Vassell, and picks', cardValueImpact: 30, impactDirection: 'up', confirmed: true, headline: 'Spurs pair Garland with Wembanyama', assetsReceived: ['Keldon Johnson', 'Devin Vassell', '2027 1st'] },
  { id: 'te-11', league: 'nfl', date: '2026-03-08', playerTraded: 'Davante Adams', fromTeam: 'New York Jets', toTeam: 'Pittsburgh Steelers', tradeDetails: 'Adams for 2026 2nd and 2027 4th', cardValueImpact: -8, impactDirection: 'down', confirmed: true, headline: 'Steelers add veteran Adams to receiving corps', assetsReceived: ['2026 2nd', '2027 4th'] },
  { id: 'te-12', league: 'mlb', date: '2026-02-10', playerTraded: 'Luis Robert Jr', fromTeam: 'Chicago White Sox', toTeam: 'New York Yankees', tradeDetails: 'Robert for prospect package and salary relief', cardValueImpact: 32, impactDirection: 'up', confirmed: true, headline: 'Yankees acquire Robert to fill outfield void', assetsReceived: ['Spencer Jones', 'Chase Hampton', '2027 2nd'] },
  { id: 'te-13', league: 'nba', date: '2026-02-03', playerTraded: 'Mikal Bridges', fromTeam: 'New York Knicks', toTeam: 'Sacramento Kings', tradeDetails: 'Bridges for Kevin Huerter, Davion Mitchell, picks', cardValueImpact: 10, impactDirection: 'up', confirmed: true, headline: 'Kings add Bridges for playoff push', assetsReceived: ['Kevin Huerter', 'Davion Mitchell', '2028 1st'] },
  { id: 'te-14', league: 'nhl', date: '2026-03-01', playerTraded: 'Martin Necas', fromTeam: 'Carolina Hurricanes', toTeam: 'Colorado Avalanche', tradeDetails: 'Necas for Byram and picks', cardValueImpact: 18, impactDirection: 'up', confirmed: true, headline: 'Avalanche add Necas for Cup run', assetsReceived: ['Bowen Byram', '2027 2nd'] },
  { id: 'te-15', league: 'nba', date: '2026-02-06', playerTraded: 'Kyle Kuzma', fromTeam: 'Washington Wizards', toTeam: 'Dallas Mavericks', tradeDetails: 'Kuzma for Tim Hardaway Jr and 2027 2nd', cardValueImpact: 12, impactDirection: 'up', confirmed: true, headline: 'Mavericks add Kuzma as third scoring option', assetsReceived: ['Tim Hardaway Jr', '2027 2nd'] },
  { id: 'te-16', league: 'mlb', date: '2026-02-18', playerTraded: 'Nolan Arenado', fromTeam: 'St. Louis Cardinals', toTeam: 'Houston Astros', tradeDetails: 'Arenado for prospects with salary offset', cardValueImpact: -5, impactDirection: 'down', confirmed: true, headline: 'Astros pick up Arenado with Cardinals eating salary', assetsReceived: ['Drew Gilbert', '2027 PTBNL'] },
  { id: 'te-17', league: 'nfl', date: '2026-03-12', playerTraded: 'Haason Reddick', fromTeam: 'New York Jets', toTeam: 'Detroit Lions', tradeDetails: 'Reddick for 2026 3rd and 2027 5th', cardValueImpact: 8, impactDirection: 'up', confirmed: true, headline: 'Lions bolster pass rush with Reddick', assetsReceived: ['2026 3rd', '2027 5th'] },
  { id: 'te-18', league: 'nba', date: '2026-02-04', playerTraded: 'Nikola Vucevic', fromTeam: 'Chicago Bulls', toTeam: 'Atlanta Hawks', tradeDetails: 'Vucevic for Bogdanovic and picks', cardValueImpact: 5, impactDirection: 'up', confirmed: true, headline: 'Hawks add Vucevic for frontcourt depth', assetsReceived: ['Bogdan Bogdanovic', '2028 2nd'] },
  { id: 'te-19', league: 'nhl', date: '2026-02-25', playerTraded: 'Mikko Rantanen', fromTeam: 'Colorado Avalanche', toTeam: 'Carolina Hurricanes', tradeDetails: 'Rantanen for Taylor Hall, Kotkaniemi, picks', cardValueImpact: 22, impactDirection: 'up', confirmed: true, headline: 'Hurricanes make blockbuster for Rantanen', assetsReceived: ['Taylor Hall', 'Jesperi Kotkaniemi', '2027 1st'] },
  { id: 'te-20', league: 'mlb', date: '2026-02-05', playerTraded: 'Alex Bregman', fromTeam: 'Houston Astros', toTeam: 'Boston Red Sox', tradeDetails: 'Bregman sign-and-trade for prospects', cardValueImpact: 10, impactDirection: 'neutral', confirmed: true, headline: 'Red Sox land Bregman in sign-and-trade', assetsReceived: ['2027 Comp Pick', '2028 2nd'] },
  { id: 'te-21', league: 'nba', date: '2026-02-06', playerTraded: 'Jonas Valanciunas', fromTeam: 'Washington Wizards', toTeam: 'Miami Heat', tradeDetails: 'Valanciunas for salary filler and 2nd rounder', cardValueImpact: 3, impactDirection: 'up', confirmed: true, headline: 'Heat add size with Valanciunas pickup', assetsReceived: ['2027 2nd'] },
  { id: 'te-22', league: 'nfl', date: '2026-03-05', playerTraded: 'Kenny Clark', fromTeam: 'Green Bay Packers', toTeam: 'Washington Commanders', tradeDetails: 'Clark for 2026 4th round pick', cardValueImpact: 5, impactDirection: 'up', confirmed: true, headline: 'Commanders shore up D-line with Clark', assetsReceived: ['2026 4th'] },
  { id: 'te-23', league: 'nhl', date: '2026-02-28', playerTraded: 'Jakob Chychrun', fromTeam: 'Ottawa Senators', toTeam: 'Toronto Maple Leafs', tradeDetails: 'Chychrun for draft picks and prospects', cardValueImpact: 15, impactDirection: 'up', confirmed: true, headline: 'Maple Leafs add Chychrun for playoff defense', assetsReceived: ['2027 1st', 'Matthew Knies'] },
  { id: 'te-24', league: 'mlb', date: '2026-02-20', playerTraded: 'Garrett Crochet', fromTeam: 'Chicago White Sox', toTeam: 'San Diego Padres', tradeDetails: 'Crochet for 4-player prospect package', cardValueImpact: 28, impactDirection: 'up', confirmed: true, headline: 'Padres land Crochet to anchor rotation', assetsReceived: ['Jackson Merrill', 'Ethan Salas', '2027 1st', '2028 1st'] },
  { id: 'te-25', league: 'nba', date: '2026-02-03', playerTraded: 'Cam Johnson', fromTeam: 'Brooklyn Nets', toTeam: 'Orlando Magic', tradeDetails: 'Johnson for Harris and 2028 1st', cardValueImpact: 14, impactDirection: 'up', confirmed: true, headline: 'Magic add shooting with Cam Johnson', assetsReceived: ['Gary Harris', '2028 1st'] },
];

// ---- Mock Data: Free Agent Signings (20) ----

const MOCK_FREE_AGENT_SIGNINGS: FreeAgentSigning[] = [
  { id: 'fas-1', league: 'mlb', player: 'Juan Soto', previousTeam: 'New York Yankees', newTeam: 'New York Mets', contractYears: 15, contractValue: 765000000, signingDate: '2025-12-08', cardValueBefore: 58.00, cardValueAfter: 85.00, percentChange: 46.6, headline: 'Soto signs record-breaking deal with Mets' },
  { id: 'fas-2', league: 'mlb', player: 'Corbin Burnes', previousTeam: 'Baltimore Orioles', newTeam: 'Arizona Diamondbacks', contractYears: 6, contractValue: 210000000, signingDate: '2025-12-22', cardValueBefore: 32.00, cardValueAfter: 42.00, percentChange: 31.3, headline: 'Diamondbacks add Burnes to front of rotation' },
  { id: 'fas-3', league: 'nba', player: 'Paul George', previousTeam: 'LA Clippers', newTeam: 'Philadelphia 76ers', contractYears: 4, contractValue: 212000000, signingDate: '2025-07-01', cardValueBefore: 42.00, cardValueAfter: 55.00, percentChange: 31.0, headline: 'George joins Embiid and Maxey in Philadelphia' },
  { id: 'fas-4', league: 'nfl', player: 'Saquon Barkley', previousTeam: 'New York Giants', newTeam: 'Philadelphia Eagles', contractYears: 3, contractValue: 37500000, signingDate: '2025-03-12', cardValueBefore: 28.00, cardValueAfter: 48.00, percentChange: 71.4, headline: 'Barkley heads to rival Eagles in free agency stunner' },
  { id: 'fas-5', league: 'nfl', player: 'Kirk Cousins', previousTeam: 'Minnesota Vikings', newTeam: 'Atlanta Falcons', contractYears: 4, contractValue: 180000000, signingDate: '2025-03-11', cardValueBefore: 15.00, cardValueAfter: 22.00, percentChange: 46.7, headline: 'Falcons invest heavily in Cousins' },
  { id: 'fas-6', league: 'nhl', player: 'Jake Guentzel', previousTeam: 'Carolina Hurricanes', newTeam: 'Tampa Bay Lightning', contractYears: 7, contractValue: 63000000, signingDate: '2025-07-01', cardValueBefore: 18.00, cardValueAfter: 25.00, percentChange: 38.9, headline: 'Lightning sign Guentzel to bolster offense' },
  { id: 'fas-7', league: 'mlb', player: 'Blake Snell', previousTeam: 'San Francisco Giants', newTeam: 'Los Angeles Dodgers', contractYears: 5, contractValue: 182000000, signingDate: '2026-01-05', cardValueBefore: 22.00, cardValueAfter: 30.00, percentChange: 36.4, headline: 'Dodgers add another arm with Snell' },
  { id: 'fas-8', league: 'nba', player: 'Klay Thompson', previousTeam: 'Golden State Warriors', newTeam: 'Dallas Mavericks', contractYears: 3, contractValue: 50000000, signingDate: '2025-07-02', cardValueBefore: 55.00, cardValueAfter: 38.00, percentChange: -30.9, headline: 'Thompson leaves Warriors for Mavericks' },
  { id: 'fas-9', league: 'mlb', player: 'Pete Alonso', previousTeam: 'New York Mets', newTeam: 'New York Mets', contractYears: 3, contractValue: 68000000, signingDate: '2026-01-10', cardValueBefore: 18.00, cardValueAfter: 22.00, percentChange: 22.2, headline: 'Alonso returns to Mets on shorter deal' },
  { id: 'fas-10', league: 'nfl', player: 'Derrick Henry', previousTeam: 'Tennessee Titans', newTeam: 'Baltimore Ravens', contractYears: 2, contractValue: 16000000, signingDate: '2025-03-07', cardValueBefore: 32.00, cardValueAfter: 45.00, percentChange: 40.6, headline: 'Ravens add Henry to elite rushing attack' },
  { id: 'fas-11', league: 'nba', player: 'DeMar DeRozan', previousTeam: 'Chicago Bulls', newTeam: 'Sacramento Kings', contractYears: 3, contractValue: 74000000, signingDate: '2025-07-06', cardValueBefore: 20.00, cardValueAfter: 25.00, percentChange: 25.0, headline: 'Kings add DeRozan for playoff push' },
  { id: 'fas-12', league: 'nhl', player: 'Sam Reinhart', previousTeam: 'Florida Panthers', newTeam: 'Florida Panthers', contractYears: 8, contractValue: 69000000, signingDate: '2025-07-15', cardValueBefore: 15.00, cardValueAfter: 22.00, percentChange: 46.7, headline: 'Panthers lock up Cup hero Reinhart long-term' },
  { id: 'fas-13', league: 'mlb', player: 'Willy Adames', previousTeam: 'Milwaukee Brewers', newTeam: 'San Francisco Giants', contractYears: 7, contractValue: 182000000, signingDate: '2025-12-18', cardValueBefore: 12.00, cardValueAfter: 20.00, percentChange: 66.7, headline: 'Giants land Adames in huge free-agent splash' },
  { id: 'fas-14', league: 'nfl', player: 'Christian Wilkins', previousTeam: 'Miami Dolphins', newTeam: 'Las Vegas Raiders', contractYears: 4, contractValue: 110000000, signingDate: '2025-03-13', cardValueBefore: 8.00, cardValueAfter: 12.00, percentChange: 50.0, headline: 'Raiders make Wilkins highest-paid DT' },
  { id: 'fas-15', league: 'nba', player: 'Tobias Harris', previousTeam: 'Philadelphia 76ers', newTeam: 'Detroit Pistons', contractYears: 2, contractValue: 52000000, signingDate: '2025-07-03', cardValueBefore: 10.00, cardValueAfter: 8.00, percentChange: -20.0, headline: 'Pistons add veteran Harris to young core' },
  { id: 'fas-16', league: 'mlb', player: 'Max Fried', previousTeam: 'Atlanta Braves', newTeam: 'New York Yankees', contractYears: 8, contractValue: 218000000, signingDate: '2025-12-12', cardValueBefore: 28.00, cardValueAfter: 38.00, percentChange: 35.7, headline: 'Yankees sign Fried to front rotation' },
  { id: 'fas-17', league: 'nhl', player: 'Brady Skjei', previousTeam: 'Carolina Hurricanes', newTeam: 'Nashville Predators', contractYears: 7, contractValue: 49000000, signingDate: '2025-07-01', cardValueBefore: 8.00, cardValueAfter: 12.00, percentChange: 50.0, headline: 'Predators add Skjei in defensive overhaul' },
  { id: 'fas-18', league: 'nfl', player: 'Josh Jacobs', previousTeam: 'Las Vegas Raiders', newTeam: 'Green Bay Packers', contractYears: 4, contractValue: 48000000, signingDate: '2025-03-14', cardValueBefore: 15.00, cardValueAfter: 22.00, percentChange: 46.7, headline: 'Packers land Jacobs to complete offense' },
  { id: 'fas-19', league: 'mlb', player: 'Teoscar Hernandez', previousTeam: 'Los Angeles Dodgers', newTeam: 'Los Angeles Dodgers', contractYears: 3, contractValue: 66000000, signingDate: '2026-01-02', cardValueBefore: 10.00, cardValueAfter: 14.00, percentChange: 40.0, headline: 'Hernandez returns to Dodgers on multi-year deal' },
  { id: 'fas-20', league: 'nba', player: 'Isaiah Hartenstein', previousTeam: 'New York Knicks', newTeam: 'Oklahoma City Thunder', contractYears: 3, contractValue: 87000000, signingDate: '2025-07-01', cardValueBefore: 5.00, cardValueAfter: 10.00, percentChange: 100.0, headline: 'Thunder add Hartenstein in surprise big signing' },
  { id: 'fas-21', league: 'mlb', player: 'Alex Bregman', previousTeam: 'Houston Astros', newTeam: 'Boston Red Sox', contractYears: 6, contractValue: 156000000, signingDate: '2026-01-08', cardValueBefore: 18.00, cardValueAfter: 25.00, percentChange: 38.9, headline: 'Red Sox land Bregman for middle-of-order bat' },
  { id: 'fas-22', league: 'nfl', player: 'Diontae Johnson', previousTeam: 'Carolina Panthers', newTeam: 'Baltimore Ravens', contractYears: 2, contractValue: 28000000, signingDate: '2025-03-18', cardValueBefore: 12.00, cardValueAfter: 18.00, percentChange: 50.0, headline: 'Ravens add Johnson to bolster receiving corps' },
  { id: 'fas-23', league: 'nhl', player: 'Brandon Montour', previousTeam: 'Florida Panthers', newTeam: 'Seattle Kraken', contractYears: 7, contractValue: 50000000, signingDate: '2025-07-01', cardValueBefore: 12.00, cardValueAfter: 8.00, percentChange: -33.3, headline: 'Montour leaves Cup champion Panthers for big contract' },
  { id: 'fas-24', league: 'mlb', player: 'Christian Walker', previousTeam: 'Arizona Diamondbacks', newTeam: 'Houston Astros', contractYears: 3, contractValue: 60000000, signingDate: '2026-01-12', cardValueBefore: 8.00, cardValueAfter: 12.00, percentChange: 50.0, headline: 'Astros sign Walker to replace Bregman at first base' },
  { id: 'fas-25', league: 'nba', player: 'Kentavious Caldwell-Pope', previousTeam: 'Denver Nuggets', newTeam: 'Orlando Magic', contractYears: 3, contractValue: 66000000, signingDate: '2025-07-01', cardValueBefore: 5.00, cardValueAfter: 8.00, percentChange: 60.0, headline: 'Magic add championship experience with KCP' },
  { id: 'fas-26', league: 'nfl', player: 'Mike Evans', previousTeam: 'Tampa Bay Buccaneers', newTeam: 'Tampa Bay Buccaneers', contractYears: 2, contractValue: 52000000, signingDate: '2025-03-08', cardValueBefore: 25.00, cardValueAfter: 28.00, percentChange: 12.0, headline: 'Evans stays loyal to Bucs on new deal' },
  { id: 'fas-27', league: 'mlb', player: 'Carlos Rodon', previousTeam: 'New York Yankees', newTeam: 'New York Yankees', contractYears: 0, contractValue: 0, signingDate: '2025-12-01', cardValueBefore: 10.00, cardValueAfter: 8.00, percentChange: -20.0, headline: 'Rodon opts in to final year of contract after injury struggles' },
  { id: 'fas-28', league: 'nhl', player: 'Jonathan Marchessault', previousTeam: 'Vegas Golden Knights', newTeam: 'Nashville Predators', contractYears: 5, contractValue: 27500000, signingDate: '2025-07-01', cardValueBefore: 15.00, cardValueAfter: 10.00, percentChange: -33.3, headline: 'Conn Smythe winner leaves Vegas for Nashville' },
  { id: 'fas-29', league: 'nba', player: 'Tyrese Maxey', previousTeam: 'Philadelphia 76ers', newTeam: 'Philadelphia 76ers', contractYears: 5, contractValue: 204000000, signingDate: '2025-07-05', cardValueBefore: 35.00, cardValueAfter: 45.00, percentChange: 28.6, headline: 'Sixers lock up Maxey on max extension' },
  { id: 'fas-30', league: 'mlb', player: 'Roki Sasaki', previousTeam: 'Chiba Lotte Marines', newTeam: 'Los Angeles Dodgers', contractYears: 6, contractValue: 12000000, signingDate: '2026-01-18', cardValueBefore: 45.00, cardValueAfter: 75.00, percentChange: 66.7, headline: 'Dodgers land Japanese phenom Sasaki on international deal' },
];

// ---- Mock Data: Roster Moves (15) ----

const MOCK_ROSTER_MOVES: RosterMove[] = [
  { id: 'rm-1', league: 'mlb', player: 'Ethan Salas', team: 'San Diego Padres', moveType: 'callup', date: '2026-03-01', cardValueImpact: 45, description: 'Top prospect called up to Opening Day roster' },
  { id: 'rm-2', league: 'nba', player: 'Bronny James', team: 'Los Angeles Lakers', moveType: 'callup', date: '2026-02-15', cardValueImpact: 18, description: 'James recalled from G League South Bay Lakers' },
  { id: 'rm-3', league: 'nfl', player: 'Aaron Rodgers', team: 'New York Jets', moveType: 'release', date: '2026-03-01', cardValueImpact: -15, description: 'Jets release Rodgers following disappointing season' },
  { id: 'rm-4', league: 'mlb', player: 'Fernando Tatis Jr', team: 'San Diego Padres', moveType: 'injured_reserve', date: '2026-03-05', cardValueImpact: -22, description: 'Tatis placed on 60-day IL with shoulder injury' },
  { id: 'rm-5', league: 'nhl', player: 'Tyler Bertuzzi', team: 'Chicago Blackhawks', moveType: 'waiver', date: '2026-02-20', cardValueImpact: -8, description: 'Bertuzzi placed on waivers amid rebuild' },
  { id: 'rm-6', league: 'nba', player: 'Markelle Fultz', team: 'Orlando Magic', moveType: 'waiver', date: '2026-02-10', cardValueImpact: -5, description: 'Magic waive Fultz to clear roster spot' },
  { id: 'rm-7', league: 'mlb', player: 'Jackson Chourio', team: 'Milwaukee Brewers', moveType: 'callup', date: '2026-03-10', cardValueImpact: 30, description: 'Chourio starts in center field for Opening Day' },
  { id: 'rm-8', league: 'nfl', player: 'Russell Wilson', team: 'Pittsburgh Steelers', moveType: 'release', date: '2026-03-08', cardValueImpact: -10, description: 'Steelers move on from Wilson after one season' },
  { id: 'rm-9', league: 'nba', player: 'Derrick Rose', team: 'Memphis Grizzlies', moveType: 'retirement', date: '2026-02-01', cardValueImpact: 25, description: 'Rose announces retirement, vintage cards spike' },
  { id: 'rm-10', league: 'nhl', player: 'Patrick Kane', team: 'Detroit Red Wings', moveType: 'retirement', date: '2026-02-28', cardValueImpact: 35, description: 'Kane retires after 18 NHL seasons' },
  { id: 'rm-11', league: 'mlb', player: 'Travis Bazzana', team: 'Cleveland Guardians', moveType: 'callup', date: '2026-03-12', cardValueImpact: 20, description: 'No. 1 overall pick earns Opening Day roster spot' },
  { id: 'rm-12', league: 'nfl', player: 'Deshaun Watson', team: 'Cleveland Browns', moveType: 'release', date: '2026-03-02', cardValueImpact: -18, description: 'Browns release Watson, eat remaining dead cap' },
  { id: 'rm-13', league: 'nba', player: 'Ben Simmons', team: 'Brooklyn Nets', moveType: 'waiver', date: '2026-01-20', cardValueImpact: -12, description: 'Nets waive Simmons using stretch provision' },
  { id: 'rm-14', league: 'nhl', player: 'Connor Bedard', team: 'Chicago Blackhawks', moveType: 'injured_reserve', date: '2026-02-15', cardValueImpact: -20, description: 'Bedard placed on IR with lower-body injury' },
  { id: 'rm-15', league: 'mlb', player: 'Andrew Painter', team: 'Philadelphia Phillies', moveType: 'callup', date: '2026-03-08', cardValueImpact: 25, description: 'Painter called up for first MLB start after Tommy John recovery' },
  { id: 'rm-16', league: 'nba', player: 'Donovan Clingan', team: 'Portland Trail Blazers', moveType: 'injured_reserve', date: '2026-02-22', cardValueImpact: -15, description: 'Clingan placed on IR with knee sprain, out 4-6 weeks' },
  { id: 'rm-17', league: 'mlb', player: 'Wyatt Langford', team: 'Texas Rangers', moveType: 'demotion', date: '2026-03-02', cardValueImpact: -18, description: 'Langford optioned to Triple-A to work on approach' },
  { id: 'rm-18', league: 'nfl', player: 'Derek Carr', team: 'New Orleans Saints', moveType: 'release', date: '2026-03-06', cardValueImpact: -10, description: 'Saints release Carr in salary cap move' },
  { id: 'rm-19', league: 'nhl', player: 'Alex Ovechkin', team: 'Washington Capitals', moveType: 'injured_reserve', date: '2026-02-10', cardValueImpact: -12, description: 'Ovechkin placed on IR, Wayne Gretzky record chase paused' },
  { id: 'rm-20', league: 'mlb', player: 'Dylan Crews', team: 'Washington Nationals', moveType: 'callup', date: '2026-03-14', cardValueImpact: 22, description: 'No. 2 overall pick earns Opening Day roster spot' },
  { id: 'rm-21', league: 'nba', player: 'James Harden', team: 'Los Angeles Clippers', moveType: 'waiver', date: '2026-02-08', cardValueImpact: -8, description: 'Clippers buy out Harden contract, becomes free agent' },
  { id: 'rm-22', league: 'nfl', player: 'Nick Chubb', team: 'Cleveland Browns', moveType: 'release', date: '2026-03-04', cardValueImpact: -5, description: 'Browns release Chubb following restructured rehab timeline' },
  { id: 'rm-23', league: 'nhl', player: 'Sidney Crosby', team: 'Pittsburgh Penguins', moveType: 'injured_reserve', date: '2026-03-01', cardValueImpact: 15, description: 'Crosby placed on IR — retirement speculation causes vintage card surge' },
  { id: 'rm-24', league: 'mlb', player: 'James Wood', team: 'Washington Nationals', moveType: 'callup', date: '2026-03-12', cardValueImpact: 18, description: 'Top outfield prospect joins Opening Day roster' },
  { id: 'rm-25', league: 'nba', player: 'Jalen Green', team: 'Houston Rockets', moveType: 'suspension', date: '2026-02-18', cardValueImpact: -10, description: 'Green suspended 5 games for conduct detrimental to team' },
];

// ---- Mock Data: Impact Predictions ----

const MOCK_IMPACT_PREDICTIONS: ImpactPrediction[] = [
  { id: 'ip-1', playerId: 'te-1', playerName: 'Lauri Markkanen', currentValue: 45.00, predictedValue: 65.00, confidence: 82, timeframe: '30 days', reasoning: 'Warriors system boost + playoff contender status', factors: ['New team contender', 'System fit', 'National TV exposure'] },
  { id: 'ip-2', playerId: 'te-5', playerName: 'Vladimir Guerrero Jr', currentValue: 85.00, predictedValue: 120.00, confidence: 78, timeframe: '60 days', reasoning: 'Dodgers lineup provides massive visibility increase', factors: ['Lineup protection', 'Dodger Stadium', 'World Series contender'] },
  { id: 'ip-3', playerId: 'fas-1', playerName: 'Juan Soto', currentValue: 85.00, predictedValue: 110.00, confidence: 88, timeframe: '90 days', reasoning: 'Record contract creates lasting market excitement', factors: ['Record deal', 'NYC market', 'Age 27 prime'] },
  { id: 'ip-4', playerId: 'te-10', playerName: 'Darius Garland', currentValue: 55.00, predictedValue: 72.00, confidence: 75, timeframe: '45 days', reasoning: 'Wembanyama pairing creates highlight factory', factors: ['Wembanyama synergy', 'Rebuild timeline', 'Young core'] },
  { id: 'ip-5', playerId: 'rm-1', playerName: 'Ethan Salas', currentValue: 195.00, predictedValue: 280.00, confidence: 70, timeframe: '120 days', reasoning: 'Top prospect debut always creates massive demand', factors: ['MLB debut hype', 'Youth factor', 'Prospect pedigree'] },
  { id: 'ip-6', playerId: 'te-9', playerName: 'Elias Pettersson', currentValue: 28.00, predictedValue: 38.00, confidence: 72, timeframe: '30 days', reasoning: 'Carolina is a legitimate Stanley Cup contender', factors: ['Contender status', 'Eastern Conference', 'Playoff visibility'] },
  { id: 'ip-7', playerId: 'rm-9', playerName: 'Derrick Rose', currentValue: 35.00, predictedValue: 55.00, confidence: 85, timeframe: '180 days', reasoning: 'Retirement nostalgia drives vintage card demand', factors: ['Retirement bump', 'MVP nostalgia', 'Chicago legacy'] },
  { id: 'ip-8', playerId: 'te-3', playerName: 'Zach LaVine', currentValue: 30.00, predictedValue: 42.00, confidence: 68, timeframe: '45 days', reasoning: 'Playing alongside Jokic elevates all teammates', factors: ['Jokic effect', 'Contender status', 'Usage rate increase'] },
  { id: 'ip-9', playerId: 'te-12', playerName: 'Luis Robert Jr', currentValue: 42.00, predictedValue: 58.00, confidence: 72, timeframe: '60 days', reasoning: 'Yankees lineup and Bronx market create premium demand', factors: ['NYC market premium', 'Lineup visibility', 'Stadium factor'] },
  { id: 'ip-10', playerId: 'te-7', playerName: 'Pascal Siakam', currentValue: 28.00, predictedValue: 38.00, confidence: 65, timeframe: '30 days', reasoning: 'Lakers market and LeBron pairing drive collector interest', factors: ['Lakers brand', 'LeBron effect', 'Media exposure'] },
  { id: 'ip-11', playerId: 'tr-1', playerName: 'Jimmy Butler', currentValue: 35.00, predictedValue: 50.00, confidence: 60, timeframe: '30 days', reasoning: 'Trade to contender would significantly boost values', factors: ['Trade destination', 'Playoff narrative', 'Heat legacy'] },
  { id: 'ip-12', playerId: 'tr-2', playerName: 'Giannis Antetokounmpo', currentValue: 85.00, predictedValue: 120.00, confidence: 40, timeframe: '90 days', reasoning: 'Potential trade to superteam would create seismic market shift', factors: ['Superstar trade rarity', 'Destination market', 'Legacy positioning'] },
  { id: 'ip-13', playerId: 'rm-10', playerName: 'Patrick Kane', currentValue: 38.00, predictedValue: 52.00, confidence: 80, timeframe: '12 months', reasoning: 'Retirement nostalgia creates sustained long-term demand', factors: ['Hall of Fame trajectory', 'Chicago legacy', 'Dynasty era cards'] },
  { id: 'ip-14', playerId: 'te-24', playerName: 'Garrett Crochet', currentValue: 32.00, predictedValue: 48.00, confidence: 74, timeframe: '90 days', reasoning: 'Ace role with contender and potential Cy Young candidacy', factors: ['Ace role', 'Padres contender', 'Strikeout potential'] },
  { id: 'ip-15', playerId: 'tr-10', playerName: 'Zion Williamson', currentValue: 40.00, predictedValue: 65.00, confidence: 55, timeframe: '60 days', reasoning: 'Trade to large market contender would reignite career narrative', factors: ['Unrealized potential', 'Market size', 'Health narrative shift'] },
  { id: 'ip-16', playerId: 'fas-4', playerName: 'Saquon Barkley', currentValue: 48.00, predictedValue: 55.00, confidence: 78, timeframe: '120 days', reasoning: 'Eagles rushing attack success sustains high demand', factors: ['2000-yard potential', 'Rivalry narrative', 'Eagles market'] },
  { id: 'ip-17', playerId: 'rm-11', playerName: 'Travis Bazzana', currentValue: 105.00, predictedValue: 150.00, confidence: 65, timeframe: '90 days', reasoning: 'First overall pick debut creates massive initial demand spike', factors: ['No. 1 pick debut', 'Prospect hype', 'Australia factor'] },
  { id: 'ip-18', playerId: 'te-8', playerName: 'Corbin Burnes', currentValue: 42.00, predictedValue: 50.00, confidence: 70, timeframe: '45 days', reasoning: 'Red Sox rotation anchor role with potential playoff push', factors: ['Ace role', 'Fenway factor', 'Red Sox brand'] },
  { id: 'ip-19', playerId: 'tr-12', playerName: 'Trae Young', currentValue: 30.00, predictedValue: 48.00, confidence: 52, timeframe: '60 days', reasoning: 'Trade to contender would reposition Young as championship-caliber point guard', factors: ['Playmaking elite', 'Trade destination', 'Scoring prowess'] },
  { id: 'ip-20', playerId: 'fas-7', playerName: 'Blake Snell', currentValue: 30.00, predictedValue: 35.00, confidence: 72, timeframe: '60 days', reasoning: 'Dodgers rotation depth creates steady value floor', factors: ['Dodgers brand', 'Cy Young history', 'Rotation depth'] },
];

// ---- Mock Data: Player Impacts (30) ----

const MOCK_PLAYER_IMPACTS: PlayerImpact[] = [
  { id: 'pi-1', playerName: 'Lauri Markkanen', league: 'nba', team: 'Golden State Warriors', cardValueBefore: 32.00, cardValueAfter: 45.00, percentChange: 40.6, reason: 'Traded to Warriors', eventType: 'trade', date: '2026-02-06', trending: 'up' },
  { id: 'pi-2', playerName: 'Juan Soto', league: 'mlb', team: 'New York Mets', cardValueBefore: 58.00, cardValueAfter: 85.00, percentChange: 46.6, reason: 'Record free-agent signing', eventType: 'signing', date: '2025-12-08', trending: 'up' },
  { id: 'pi-3', playerName: 'Vladimir Guerrero Jr', league: 'mlb', team: 'Los Angeles Dodgers', cardValueBefore: 42.00, cardValueAfter: 85.00, percentChange: 102.4, reason: 'Traded to Dodgers', eventType: 'trade', date: '2026-01-15', trending: 'up' },
  { id: 'pi-4', playerName: 'Dejounte Murray', league: 'nba', team: 'Minnesota Timberwolves', cardValueBefore: 18.00, cardValueAfter: 25.00, percentChange: 38.9, reason: 'Traded to contender', eventType: 'trade', date: '2026-02-06', trending: 'up' },
  { id: 'pi-5', playerName: 'Zach LaVine', league: 'nba', team: 'Denver Nuggets', cardValueBefore: 22.00, cardValueAfter: 30.00, percentChange: 36.4, reason: 'Paired with Jokic', eventType: 'trade', date: '2026-02-05', trending: 'up' },
  { id: 'pi-6', playerName: 'Saquon Barkley', league: 'nfl', team: 'Philadelphia Eagles', cardValueBefore: 28.00, cardValueAfter: 48.00, percentChange: 71.4, reason: 'Signed by rival Eagles', eventType: 'signing', date: '2025-03-12', trending: 'up' },
  { id: 'pi-7', playerName: 'Aaron Rodgers', league: 'nfl', team: 'Free Agent', cardValueBefore: 45.00, cardValueAfter: 32.00, percentChange: -28.9, reason: 'Released by Jets', eventType: 'roster_move', date: '2026-03-01', trending: 'down' },
  { id: 'pi-8', playerName: 'Fernando Tatis Jr', league: 'mlb', team: 'San Diego Padres', cardValueBefore: 55.00, cardValueAfter: 38.00, percentChange: -30.9, reason: 'Placed on 60-day IL', eventType: 'roster_move', date: '2026-03-05', trending: 'down' },
  { id: 'pi-9', playerName: 'Ethan Salas', league: 'mlb', team: 'San Diego Padres', cardValueBefore: 145.00, cardValueAfter: 195.00, percentChange: 34.5, reason: 'Called up to majors', eventType: 'roster_move', date: '2026-03-01', trending: 'up' },
  { id: 'pi-10', playerName: 'Darius Garland', league: 'nba', team: 'San Antonio Spurs', cardValueBefore: 35.00, cardValueAfter: 55.00, percentChange: 57.1, reason: 'Paired with Wembanyama', eventType: 'trade', date: '2026-02-05', trending: 'up' },
  { id: 'pi-11', playerName: 'Klay Thompson', league: 'nba', team: 'Dallas Mavericks', cardValueBefore: 55.00, cardValueAfter: 38.00, percentChange: -30.9, reason: 'Left Warriors dynasty', eventType: 'signing', date: '2025-07-02', trending: 'down' },
  { id: 'pi-12', playerName: 'Brandon Ingram', league: 'nba', team: 'Philadelphia 76ers', cardValueBefore: 20.00, cardValueAfter: 32.00, percentChange: 60.0, reason: 'Traded to Sixers', eventType: 'trade', date: '2026-02-04', trending: 'up' },
  { id: 'pi-13', playerName: 'Derrick Rose', league: 'nba', team: 'Retired', cardValueBefore: 25.00, cardValueAfter: 45.00, percentChange: 80.0, reason: 'Retirement nostalgia', eventType: 'roster_move', date: '2026-02-01', trending: 'up' },
  { id: 'pi-14', playerName: 'Patrick Kane', league: 'nhl', team: 'Retired', cardValueBefore: 22.00, cardValueAfter: 38.00, percentChange: 72.7, reason: 'Retirement card spike', eventType: 'roster_move', date: '2026-02-28', trending: 'up' },
  { id: 'pi-15', playerName: 'Elias Pettersson', league: 'nhl', team: 'Carolina Hurricanes', cardValueBefore: 18.00, cardValueAfter: 28.00, percentChange: 55.6, reason: 'Traded to Cup contender', eventType: 'trade', date: '2026-03-03', trending: 'up' },
  { id: 'pi-16', playerName: 'Corbin Burnes', league: 'mlb', team: 'Arizona Diamondbacks', cardValueBefore: 32.00, cardValueAfter: 42.00, percentChange: 31.3, reason: 'Big free-agent signing', eventType: 'signing', date: '2025-12-22', trending: 'up' },
  { id: 'pi-17', playerName: 'Pascal Siakam', league: 'nba', team: 'Los Angeles Lakers', cardValueBefore: 18.00, cardValueAfter: 28.00, percentChange: 55.6, reason: 'Traded to Lakers', eventType: 'trade', date: '2026-02-06', trending: 'up' },
  { id: 'pi-18', playerName: 'Luis Robert Jr', league: 'mlb', team: 'New York Yankees', cardValueBefore: 25.00, cardValueAfter: 42.00, percentChange: 68.0, reason: 'Traded to Yankees', eventType: 'trade', date: '2026-02-10', trending: 'up' },
  { id: 'pi-19', playerName: 'Connor Bedard', league: 'nhl', team: 'Chicago Blackhawks', cardValueBefore: 65.00, cardValueAfter: 48.00, percentChange: -26.2, reason: 'Placed on IR with injury', eventType: 'roster_move', date: '2026-02-15', trending: 'down' },
  { id: 'pi-20', playerName: 'Deshaun Watson', league: 'nfl', team: 'Free Agent', cardValueBefore: 12.00, cardValueAfter: 5.00, percentChange: -58.3, reason: 'Released by Browns', eventType: 'roster_move', date: '2026-03-02', trending: 'down' },
  { id: 'pi-21', playerName: 'Garrett Crochet', league: 'mlb', team: 'San Diego Padres', cardValueBefore: 18.00, cardValueAfter: 32.00, percentChange: 77.8, reason: 'Traded to contender', eventType: 'trade', date: '2026-02-20', trending: 'up' },
  { id: 'pi-22', playerName: 'Derrick Henry', league: 'nfl', team: 'Baltimore Ravens', cardValueBefore: 32.00, cardValueAfter: 45.00, percentChange: 40.6, reason: 'Signed by Ravens', eventType: 'signing', date: '2025-03-07', trending: 'up' },
  { id: 'pi-23', playerName: 'Mikko Rantanen', league: 'nhl', team: 'Carolina Hurricanes', cardValueBefore: 20.00, cardValueAfter: 30.00, percentChange: 50.0, reason: 'Traded to Hurricanes', eventType: 'trade', date: '2026-02-25', trending: 'up' },
  { id: 'pi-24', playerName: 'Max Fried', league: 'mlb', team: 'New York Yankees', cardValueBefore: 28.00, cardValueAfter: 38.00, percentChange: 35.7, reason: 'Signed by Yankees', eventType: 'signing', date: '2025-12-12', trending: 'up' },
  { id: 'pi-25', playerName: 'Cam Johnson', league: 'nba', team: 'Orlando Magic', cardValueBefore: 12.00, cardValueAfter: 18.00, percentChange: 50.0, reason: 'Traded to Magic', eventType: 'trade', date: '2026-02-03', trending: 'up' },
  { id: 'pi-26', playerName: 'Tua Tagovailoa', league: 'nfl', team: 'Las Vegas Raiders', cardValueBefore: 22.00, cardValueAfter: 15.00, percentChange: -31.8, reason: 'Traded to rebuilding team', eventType: 'trade', date: '2026-03-10', trending: 'down' },
  { id: 'pi-27', playerName: 'Ben Simmons', league: 'nba', team: 'Free Agent', cardValueBefore: 8.00, cardValueAfter: 3.00, percentChange: -62.5, reason: 'Waived by Nets', eventType: 'roster_move', date: '2026-01-20', trending: 'down' },
  { id: 'pi-28', playerName: 'Willy Adames', league: 'mlb', team: 'San Francisco Giants', cardValueBefore: 12.00, cardValueAfter: 20.00, percentChange: 66.7, reason: 'Signed by Giants', eventType: 'signing', date: '2025-12-18', trending: 'up' },
  { id: 'pi-29', playerName: 'Travis Bazzana', league: 'mlb', team: 'Cleveland Guardians', cardValueBefore: 80.00, cardValueAfter: 105.00, percentChange: 31.3, reason: 'Called up for Opening Day', eventType: 'roster_move', date: '2026-03-12', trending: 'up' },
  { id: 'pi-30', playerName: 'Russell Wilson', league: 'nfl', team: 'Free Agent', cardValueBefore: 18.00, cardValueAfter: 10.00, percentChange: -44.4, reason: 'Released by Steelers', eventType: 'roster_move', date: '2026-03-08', trending: 'down' },
];

// ---- Mock Data: Team Impacts (20) ----

const MOCK_TEAM_IMPACTS: TeamImpact[] = [
  { id: 'ti-1', teamName: 'Golden State Warriors', league: 'nba', overallImpact: 35, playerChanges: 3, averageCardValueChange: 28.5, championshipOddsChange: 8.2, description: 'Markkanen trade positions Warriors as top contender' },
  { id: 'ti-2', teamName: 'Los Angeles Dodgers', league: 'mlb', overallImpact: 52, playerChanges: 4, averageCardValueChange: 42.0, championshipOddsChange: 12.5, description: 'Guerrero Jr addition makes already-loaded lineup historic' },
  { id: 'ti-3', teamName: 'New York Mets', league: 'mlb', overallImpact: 45, playerChanges: 3, averageCardValueChange: 38.0, championshipOddsChange: 10.8, description: 'Soto signing transforms Mets into instant contenders' },
  { id: 'ti-4', teamName: 'Philadelphia 76ers', league: 'nba', overallImpact: 38, playerChanges: 4, averageCardValueChange: 30.2, championshipOddsChange: 9.5, description: 'George and Ingram additions surround Embiid with talent' },
  { id: 'ti-5', teamName: 'Denver Nuggets', league: 'nba', overallImpact: 28, playerChanges: 2, averageCardValueChange: 22.0, championshipOddsChange: 6.3, description: 'LaVine gives Jokic another elite scoring option' },
  { id: 'ti-6', teamName: 'San Antonio Spurs', league: 'nba', overallImpact: 40, playerChanges: 3, averageCardValueChange: 32.5, championshipOddsChange: 7.8, description: 'Garland-Wembanyama pairing creates exciting young core' },
  { id: 'ti-7', teamName: 'Carolina Hurricanes', league: 'nhl', overallImpact: 42, playerChanges: 3, averageCardValueChange: 25.0, championshipOddsChange: 11.2, description: 'Pettersson and Rantanen acquisitions make Canes Cup favorites' },
  { id: 'ti-8', teamName: 'Philadelphia Eagles', league: 'nfl', overallImpact: 30, playerChanges: 2, averageCardValueChange: 35.0, championshipOddsChange: 5.5, description: 'Barkley signing gives Eagles elite rushing attack' },
  { id: 'ti-9', teamName: 'New York Yankees', league: 'mlb', overallImpact: 35, playerChanges: 3, averageCardValueChange: 28.0, championshipOddsChange: 8.0, description: 'Robert and Fried additions fill major roster gaps' },
  { id: 'ti-10', teamName: 'San Diego Padres', league: 'mlb', overallImpact: 32, playerChanges: 3, averageCardValueChange: 25.5, championshipOddsChange: 7.2, description: 'Crochet and Salas callup transform roster outlook' },
  { id: 'ti-11', teamName: 'Los Angeles Lakers', league: 'nba', overallImpact: 25, playerChanges: 2, averageCardValueChange: 20.0, championshipOddsChange: 5.0, description: 'Siakam trade gives LeBron and AD reliable third option' },
  { id: 'ti-12', teamName: 'Baltimore Ravens', league: 'nfl', overallImpact: 22, playerChanges: 2, averageCardValueChange: 30.0, championshipOddsChange: 4.5, description: 'Henry signing creates dominant rushing combination with Jackson' },
  { id: 'ti-13', teamName: 'Boston Red Sox', league: 'mlb', overallImpact: 28, playerChanges: 3, averageCardValueChange: 18.0, championshipOddsChange: 6.8, description: 'Burnes and Bregman additions signal competitive window opening' },
  { id: 'ti-14', teamName: 'Minnesota Timberwolves', league: 'nba', overallImpact: 20, playerChanges: 2, averageCardValueChange: 15.5, championshipOddsChange: 4.2, description: 'Murray addition addresses backcourt playmaking needs' },
  { id: 'ti-15', teamName: 'Chicago White Sox', league: 'mlb', overallImpact: -15, playerChanges: 3, averageCardValueChange: -12.0, championshipOddsChange: -2.0, description: 'Trading Robert and Crochet signals full rebuild' },
  { id: 'ti-16', teamName: 'Cleveland Browns', league: 'nfl', overallImpact: -18, playerChanges: 2, averageCardValueChange: -15.0, championshipOddsChange: -5.5, description: 'Watson release caps disastrous era for franchise' },
  { id: 'ti-17', teamName: 'Toronto Maple Leafs', league: 'nhl', overallImpact: 18, playerChanges: 2, averageCardValueChange: 14.0, championshipOddsChange: 3.8, description: 'Chychrun deal addresses defensive weakness' },
  { id: 'ti-18', teamName: 'Detroit Lions', league: 'nfl', overallImpact: 15, playerChanges: 2, averageCardValueChange: 10.0, championshipOddsChange: 3.0, description: 'Reddick trade bolsters already strong defense' },
  { id: 'ti-19', teamName: 'Sacramento Kings', league: 'nba', overallImpact: 22, playerChanges: 3, averageCardValueChange: 18.0, championshipOddsChange: 4.5, description: 'Bridges and DeRozan create deep, versatile roster' },
  { id: 'ti-20', teamName: 'Chicago Bulls', league: 'nba', overallImpact: -20, playerChanges: 3, averageCardValueChange: -18.0, championshipOddsChange: -6.0, description: 'LaVine and Vucevic trades signal full teardown rebuild' },
];

// ---- Mock Data: League Transaction Summaries ----

const MOCK_LEAGUE_SUMMARIES = {
  nba: {
    totalTradesMade: 42,
    totalPlayersTraded: 68,
    biggestTrade: 'Lauri Markkanen to Warriors',
    totalSalaryMoved: 485000000,
    averageCardImpact: 18.5,
    topGainers: ['Lauri Markkanen', 'Darius Garland', 'Brandon Ingram', 'Pascal Siakam', 'Cam Johnson'],
    topDecliners: ['Jonathan Kuminga', 'Michael Porter Jr', 'Tobias Harris'],
    deadlineBuyers: ['Golden State Warriors', 'Denver Nuggets', 'Philadelphia 76ers', 'Los Angeles Lakers', 'Sacramento Kings'],
    deadlineSellers: ['Chicago Bulls', 'Washington Wizards', 'Brooklyn Nets', 'New Orleans Pelicans'],
    surpriseMoves: ['Garland to Spurs pairing with Wembanyama', 'Bridges from Knicks to Kings'],
    marketImpactScore: 85,
  },
  mlb: {
    totalTradesMade: 18,
    totalPlayersTraded: 35,
    biggestTrade: 'Vladimir Guerrero Jr to Dodgers',
    totalSalaryMoved: 320000000,
    averageCardImpact: 22.0,
    topGainers: ['Vladimir Guerrero Jr', 'Garrett Crochet', 'Luis Robert Jr', 'Roki Sasaki', 'Ethan Salas'],
    topDecliners: ['Fernando Tatis Jr', 'Nolan Arenado', 'Wyatt Langford'],
    deadlineBuyers: ['Los Angeles Dodgers', 'New York Yankees', 'Boston Red Sox', 'San Diego Padres'],
    deadlineSellers: ['Chicago White Sox', 'Toronto Blue Jays', 'St. Louis Cardinals'],
    surpriseMoves: ['Roki Sasaki to Dodgers on discount', 'Vlad Jr trade before spring training'],
    marketImpactScore: 92,
  },
  nfl: {
    totalTradesMade: 12,
    totalPlayersTraded: 14,
    biggestTrade: 'Saquon Barkley to Eagles (FA)',
    totalSalaryMoved: 580000000,
    averageCardImpact: 8.5,
    topGainers: ['Saquon Barkley', 'Derrick Henry', 'Haason Reddick', 'Josh Jacobs'],
    topDecliners: ['Aaron Rodgers', 'Deshaun Watson', 'Russell Wilson', 'Tua Tagovailoa'],
    deadlineBuyers: ['Philadelphia Eagles', 'Baltimore Ravens', 'Detroit Lions', 'Pittsburgh Steelers'],
    deadlineSellers: ['New York Jets', 'Cleveland Browns', 'Miami Dolphins'],
    surpriseMoves: ['Barkley to rival Eagles', 'Watson release with massive dead cap'],
    marketImpactScore: 72,
  },
  nhl: {
    totalTradesMade: 28,
    totalPlayersTraded: 42,
    biggestTrade: 'Elias Pettersson to Hurricanes',
    totalSalaryMoved: 125000000,
    averageCardImpact: 15.0,
    topGainers: ['Elias Pettersson', 'Mikko Rantanen', 'Patrick Kane', 'Jakob Chychrun'],
    topDecliners: ['Connor Bedard', 'Tyler Bertuzzi', 'Alex Ovechkin'],
    deadlineBuyers: ['Carolina Hurricanes', 'Colorado Avalanche', 'Toronto Maple Leafs'],
    deadlineSellers: ['Vancouver Canucks', 'Ottawa Senators', 'Chicago Blackhawks'],
    surpriseMoves: ['Hurricanes double-dip with Pettersson and Rantanen', 'Kane retirement'],
    marketImpactScore: 78,
  },
};

// ---- Mock Data: Value Movement Timeline ----

const MOCK_VALUE_TIMELINE = [
  { date: '2025-12-01', totalMarketIndex: 100.0, tradeActivity: 'low', keyEvent: 'Pre-offseason baseline' },
  { date: '2025-12-08', totalMarketIndex: 104.5, tradeActivity: 'high', keyEvent: 'Juan Soto signs record deal with Mets' },
  { date: '2025-12-12', totalMarketIndex: 106.2, tradeActivity: 'medium', keyEvent: 'Max Fried signs with Yankees' },
  { date: '2025-12-18', totalMarketIndex: 107.8, tradeActivity: 'medium', keyEvent: 'Willy Adames signs with Giants' },
  { date: '2025-12-22', totalMarketIndex: 108.5, tradeActivity: 'medium', keyEvent: 'Corbin Burnes signs with Diamondbacks' },
  { date: '2026-01-05', totalMarketIndex: 109.2, tradeActivity: 'medium', keyEvent: 'Blake Snell signs with Dodgers' },
  { date: '2026-01-10', totalMarketIndex: 109.8, tradeActivity: 'low', keyEvent: 'Pete Alonso returns to Mets' },
  { date: '2026-01-15', totalMarketIndex: 115.5, tradeActivity: 'high', keyEvent: 'Guerrero Jr traded to Dodgers' },
  { date: '2026-01-18', totalMarketIndex: 118.2, tradeActivity: 'high', keyEvent: 'Roki Sasaki signs with Dodgers' },
  { date: '2026-02-01', totalMarketIndex: 119.0, tradeActivity: 'medium', keyEvent: 'Derrick Rose announces retirement' },
  { date: '2026-02-03', totalMarketIndex: 120.5, tradeActivity: 'high', keyEvent: 'NBA trade deadline week begins' },
  { date: '2026-02-04', totalMarketIndex: 122.8, tradeActivity: 'high', keyEvent: 'Ingram to 76ers, Vucevic to Hawks' },
  { date: '2026-02-05', totalMarketIndex: 126.5, tradeActivity: 'high', keyEvent: 'Garland to Spurs, LaVine to Nuggets' },
  { date: '2026-02-06', totalMarketIndex: 132.0, tradeActivity: 'high', keyEvent: 'NBA deadline day: Markkanen, Murray, Siakam, Kuzma' },
  { date: '2026-02-10', totalMarketIndex: 133.5, tradeActivity: 'medium', keyEvent: 'Luis Robert Jr traded to Yankees' },
  { date: '2026-02-20', totalMarketIndex: 135.0, tradeActivity: 'medium', keyEvent: 'Garrett Crochet traded to Padres' },
  { date: '2026-02-25', totalMarketIndex: 136.2, tradeActivity: 'medium', keyEvent: 'Mikko Rantanen traded to Hurricanes' },
  { date: '2026-02-28', totalMarketIndex: 137.5, tradeActivity: 'medium', keyEvent: 'Patrick Kane retires, Chychrun to Leafs' },
  { date: '2026-03-03', totalMarketIndex: 139.0, tradeActivity: 'high', keyEvent: 'Pettersson traded to Hurricanes' },
  { date: '2026-03-09', totalMarketIndex: 140.2, tradeActivity: 'medium', keyEvent: 'NHL trade deadline passes' },
  { date: '2026-03-11', totalMarketIndex: 141.5, tradeActivity: 'high', keyEvent: 'NFL free agency opens' },
  { date: '2026-03-15', totalMarketIndex: 142.0, tradeActivity: 'medium', keyEvent: 'Current market state' },
];

// ---- Mock Data: Deadline Countdowns ----

const MOCK_DEADLINE_COUNTDOWNS: DeadlineCountdown[] = [
  { id: 'dc-1', league: 'nba', deadlineName: 'NBA Trade Deadline', deadlineDate: '2026-02-06T15:00:00Z', daysRemaining: 0, hoursRemaining: 0, isActive: false, expectedMoves: 35, completedMoves: 42 },
  { id: 'dc-2', league: 'mlb', deadlineName: 'MLB Trade Deadline', deadlineDate: '2026-07-31T16:00:00Z', daysRemaining: 138, hoursRemaining: 3312, isActive: true, expectedMoves: 50, completedMoves: 0 },
  { id: 'dc-3', league: 'nfl', deadlineName: 'NFL Free Agency Opens', deadlineDate: '2026-03-11T16:00:00Z', daysRemaining: 0, hoursRemaining: 0, isActive: false, expectedMoves: 80, completedMoves: 95 },
  { id: 'dc-4', league: 'nhl', deadlineName: 'NHL Trade Deadline', deadlineDate: '2026-03-09T15:00:00Z', daysRemaining: 0, hoursRemaining: 0, isActive: false, expectedMoves: 25, completedMoves: 28 },
  { id: 'dc-5', league: 'nba', deadlineName: 'NBA Buyout Deadline', deadlineDate: '2026-03-01T23:59:59Z', daysRemaining: 0, hoursRemaining: 0, isActive: false, expectedMoves: 12, completedMoves: 8 },
  { id: 'dc-6', league: 'mlb', deadlineName: 'MLB Opening Day', deadlineDate: '2026-03-26T13:00:00Z', daysRemaining: 11, hoursRemaining: 264, isActive: true, expectedMoves: 15, completedMoves: 8 },
  { id: 'dc-7', league: 'nfl', deadlineName: 'NFL Draft', deadlineDate: '2026-04-23T20:00:00Z', daysRemaining: 39, hoursRemaining: 936, isActive: true, expectedMoves: 60, completedMoves: 0 },
  { id: 'dc-8', league: 'nhl', deadlineName: 'NHL Playoffs Begin', deadlineDate: '2026-04-15T19:00:00Z', daysRemaining: 31, hoursRemaining: 744, isActive: true, expectedMoves: 5, completedMoves: 0 },
];

// ---- Mock Data: Historical Trades (15) ----

const MOCK_HISTORICAL_TRADES: HistoricalTrade[] = [
  { id: 'ht-1', league: 'nba', year: 2023, playerTraded: 'Kevin Durant', fromTeam: 'Brooklyn Nets', toTeam: 'Phoenix Suns', cardValueAtTrade: 85.00, cardValueAfter: 65.00, percentChange: -23.5, timeToRealize: '6 months', description: 'Suns failed to win championship, card values dropped' },
  { id: 'ht-2', league: 'mlb', year: 2024, playerTraded: 'Juan Soto', fromTeam: 'San Diego Padres', toTeam: 'New York Yankees', cardValueAtTrade: 45.00, cardValueAfter: 72.00, percentChange: 60.0, timeToRealize: '3 months', description: 'Yankees move boosted visibility and demand significantly' },
  { id: 'ht-3', league: 'nfl', year: 2023, playerTraded: 'Stefon Diggs', fromTeam: 'Buffalo Bills', toTeam: 'Houston Texans', cardValueAtTrade: 35.00, cardValueAfter: 22.00, percentChange: -37.1, timeToRealize: '4 months', description: 'Reduced role in Houston led to value decline' },
  { id: 'ht-4', league: 'nba', year: 2024, playerTraded: 'Mikal Bridges', fromTeam: 'Brooklyn Nets', toTeam: 'New York Knicks', cardValueAtTrade: 22.00, cardValueAfter: 35.00, percentChange: 59.1, timeToRealize: '2 months', description: 'Knicks nostalgia and Villanova reunion drove demand' },
  { id: 'ht-5', league: 'nhl', year: 2024, playerTraded: 'Matthew Tkachuk', fromTeam: 'Calgary Flames', toTeam: 'Florida Panthers', cardValueAtTrade: 28.00, cardValueAfter: 55.00, percentChange: 96.4, timeToRealize: '12 months', description: 'Stanley Cup win caused massive value spike' },
  { id: 'ht-6', league: 'mlb', year: 2022, playerTraded: 'Mookie Betts', fromTeam: 'Boston Red Sox', toTeam: 'Los Angeles Dodgers', cardValueAtTrade: 38.00, cardValueAfter: 65.00, percentChange: 71.1, timeToRealize: '8 months', description: 'World Series win cemented Betts as modern great' },
  { id: 'ht-7', league: 'nba', year: 2019, playerTraded: 'Anthony Davis', fromTeam: 'New Orleans Pelicans', toTeam: 'Los Angeles Lakers', cardValueAtTrade: 55.00, cardValueAfter: 95.00, percentChange: 72.7, timeToRealize: '12 months', description: 'Championship win with LeBron maximized card values' },
  { id: 'ht-8', league: 'nfl', year: 2024, playerTraded: 'Davante Adams', fromTeam: 'Las Vegas Raiders', toTeam: 'New York Jets', cardValueAtTrade: 42.00, cardValueAfter: 28.00, percentChange: -33.3, timeToRealize: '3 months', description: 'Jets dysfunction continued, values dropped' },
  { id: 'ht-9', league: 'mlb', year: 2023, playerTraded: 'Nolan Arenado', fromTeam: 'Colorado Rockies', toTeam: 'St. Louis Cardinals', cardValueAtTrade: 32.00, cardValueAfter: 25.00, percentChange: -21.9, timeToRealize: '18 months', description: 'Cardinals decline eroded Arenado card premium' },
  { id: 'ht-10', league: 'nba', year: 2023, playerTraded: 'Damian Lillard', fromTeam: 'Portland Trail Blazers', toTeam: 'Milwaukee Bucks', cardValueAtTrade: 48.00, cardValueAfter: 38.00, percentChange: -20.8, timeToRealize: '6 months', description: 'Bucks underperformed expectations, modest decline' },
  { id: 'ht-11', league: 'nhl', year: 2023, playerTraded: 'Bo Horvat', fromTeam: 'Vancouver Canucks', toTeam: 'New York Islanders', cardValueAtTrade: 15.00, cardValueAfter: 12.00, percentChange: -20.0, timeToRealize: '6 months', description: 'Islanders missed playoffs, card values dipped' },
  { id: 'ht-12', league: 'nfl', year: 2022, playerTraded: 'Tyreek Hill', fromTeam: 'Kansas City Chiefs', toTeam: 'Miami Dolphins', cardValueAtTrade: 55.00, cardValueAfter: 48.00, percentChange: -12.7, timeToRealize: '12 months', description: 'Elite production maintained but playoff success declined' },
  { id: 'ht-13', league: 'mlb', year: 2024, playerTraded: 'Garrett Crochet', fromTeam: 'Chicago White Sox', toTeam: 'Boston Red Sox', cardValueAtTrade: 12.00, cardValueAfter: 22.00, percentChange: 83.3, timeToRealize: '2 months', description: 'Move to contender and ace role boosted demand' },
  { id: 'ht-14', league: 'nba', year: 2024, playerTraded: 'Pascal Siakam', fromTeam: 'Toronto Raptors', toTeam: 'Indiana Pacers', cardValueAtTrade: 15.00, cardValueAfter: 22.00, percentChange: 46.7, timeToRealize: '4 months', description: 'Pacers playoff run elevated Siakam card demand' },
  { id: 'ht-15', league: 'nhl', year: 2024, playerTraded: 'Jake Guentzel', fromTeam: 'Pittsburgh Penguins', toTeam: 'Carolina Hurricanes', cardValueAtTrade: 18.00, cardValueAfter: 25.00, percentChange: 38.9, timeToRealize: '3 months', description: 'Rental-turned-UFA created buying opportunity' },
  { id: 'ht-16', league: 'mlb', year: 2021, playerTraded: 'Kris Bryant', fromTeam: 'Chicago Cubs', toTeam: 'San Francisco Giants', cardValueAtTrade: 25.00, cardValueAfter: 18.00, percentChange: -28.0, timeToRealize: '12 months', description: 'Injuries and decline reduced post-trade card demand' },
  { id: 'ht-17', league: 'nba', year: 2020, playerTraded: 'James Harden', fromTeam: 'Houston Rockets', toTeam: 'Brooklyn Nets', cardValueAtTrade: 65.00, cardValueAfter: 48.00, percentChange: -26.2, timeToRealize: '18 months', description: 'Nets superteam failed to deliver, values dropped over time' },
  { id: 'ht-18', league: 'nfl', year: 2020, playerTraded: 'DeAndre Hopkins', fromTeam: 'Houston Texans', toTeam: 'Arizona Cardinals', cardValueAtTrade: 38.00, cardValueAfter: 55.00, percentChange: 44.7, timeToRealize: '4 months', description: 'Hopkins thrived in Arizona, immediate card value surge' },
  { id: 'ht-19', league: 'nhl', year: 2022, playerTraded: 'Claude Giroux', fromTeam: 'Philadelphia Flyers', toTeam: 'Florida Panthers', cardValueAtTrade: 12.00, cardValueAfter: 8.00, percentChange: -33.3, timeToRealize: '6 months', description: 'Rental player returned modest playoff value before decline' },
  { id: 'ht-20', league: 'mlb', year: 2020, playerTraded: 'Mookie Betts', fromTeam: 'Boston Red Sox', toTeam: 'Los Angeles Dodgers', cardValueAtTrade: 38.00, cardValueAfter: 72.00, percentChange: 89.5, timeToRealize: '8 months', description: 'World Series win and mega extension created sustained demand' },
  { id: 'ht-21', league: 'nba', year: 2021, playerTraded: 'Ben Simmons', fromTeam: 'Philadelphia 76ers', toTeam: 'Brooklyn Nets', cardValueAtTrade: 28.00, cardValueAfter: 8.00, percentChange: -71.4, timeToRealize: '12 months', description: 'Historic collapse in card value following failed career restart' },
  { id: 'ht-22', league: 'nfl', year: 2023, playerTraded: 'Jalen Ramsey', fromTeam: 'Los Angeles Rams', toTeam: 'Miami Dolphins', cardValueAtTrade: 22.00, cardValueAfter: 15.00, percentChange: -31.8, timeToRealize: '8 months', description: 'Injury-shortened season reduced impact and card values' },
  { id: 'ht-23', league: 'nba', year: 2022, playerTraded: 'Russell Westbrook', fromTeam: 'Washington Wizards', toTeam: 'Los Angeles Lakers', cardValueAtTrade: 30.00, cardValueAfter: 12.00, percentChange: -60.0, timeToRealize: '6 months', description: 'Lakers disaster trade caused massive card value decline' },
  { id: 'ht-24', league: 'mlb', year: 2023, playerTraded: 'Max Scherzer', fromTeam: 'New York Mets', toTeam: 'Texas Rangers', cardValueAtTrade: 25.00, cardValueAfter: 35.00, percentChange: 40.0, timeToRealize: '4 months', description: 'World Series ring boosted legacy cards significantly' },
  { id: 'ht-25', league: 'nhl', year: 2023, playerTraded: 'Ryan OReilly', fromTeam: 'St. Louis Blues', toTeam: 'Toronto Maple Leafs', cardValueAtTrade: 10.00, cardValueAfter: 8.00, percentChange: -20.0, timeToRealize: '4 months', description: 'Leafs first-round exit dampened trade impact' },
];

// ---- Mock Data: Market Reactions ----

const MOCK_MARKET_REACTIONS: MarketReaction[] = [
  { id: 'mr-1', eventId: 'te-1', eventType: 'trade', volumeSpike: 340, priceMovement: 40.6, marketSentiment: 'bullish', topMovers: ['Lauri Markkanen', 'Stephen Curry', 'Jonathan Kuminga'], timestamp: '2026-02-06T15:05:00Z' },
  { id: 'mr-2', eventId: 'fas-1', eventType: 'signing', volumeSpike: 520, priceMovement: 46.6, marketSentiment: 'bullish', topMovers: ['Juan Soto', 'Pete Alonso', 'Francisco Lindor'], timestamp: '2025-12-08T14:00:00Z' },
  { id: 'mr-3', eventId: 'te-5', eventType: 'trade', volumeSpike: 480, priceMovement: 102.4, marketSentiment: 'bullish', topMovers: ['Vladimir Guerrero Jr', 'Shohei Ohtani', 'Mookie Betts'], timestamp: '2026-01-15T18:30:00Z' },
  { id: 'mr-4', eventId: 'te-10', eventType: 'trade', volumeSpike: 290, priceMovement: 57.1, marketSentiment: 'bullish', topMovers: ['Darius Garland', 'Victor Wembanyama', 'Keldon Johnson'], timestamp: '2026-02-05T16:00:00Z' },
  { id: 'mr-5', eventId: 'te-9', eventType: 'trade', volumeSpike: 210, priceMovement: 55.6, marketSentiment: 'bullish', topMovers: ['Elias Pettersson', 'Andrei Svechnikov', 'Sebastian Aho'], timestamp: '2026-03-03T15:00:00Z' },
  { id: 'mr-6', eventId: 'fas-4', eventType: 'signing', volumeSpike: 380, priceMovement: 71.4, marketSentiment: 'bullish', topMovers: ['Saquon Barkley', 'Jalen Hurts', 'AJ Brown'], timestamp: '2025-03-12T16:00:00Z' },
  { id: 'mr-7', eventId: 'te-6', eventType: 'trade', volumeSpike: 150, priceMovement: -12.0, marketSentiment: 'bearish', topMovers: ['Tua Tagovailoa', 'Tyreek Hill', 'Jaylen Waddle'], timestamp: '2026-03-10T14:00:00Z' },
  { id: 'mr-8', eventId: 'fas-8', eventType: 'signing', volumeSpike: 420, priceMovement: -30.9, marketSentiment: 'bearish', topMovers: ['Klay Thompson', 'Stephen Curry', 'Luka Doncic'], timestamp: '2025-07-02T12:00:00Z' },
  { id: 'mr-9', eventId: 'te-3', eventType: 'trade', volumeSpike: 265, priceMovement: 36.4, marketSentiment: 'bullish', topMovers: ['Zach LaVine', 'Nikola Jokic', 'Michael Porter Jr'], timestamp: '2026-02-05T14:30:00Z' },
  { id: 'mr-10', eventId: 'te-4', eventType: 'trade', volumeSpike: 310, priceMovement: 60.0, marketSentiment: 'bullish', topMovers: ['Brandon Ingram', 'Joel Embiid', 'Tyrese Maxey'], timestamp: '2026-02-04T17:00:00Z' },
  { id: 'mr-11', eventId: 'te-12', eventType: 'trade', volumeSpike: 275, priceMovement: 68.0, marketSentiment: 'bullish', topMovers: ['Luis Robert Jr', 'Aaron Judge', 'Juan Soto'], timestamp: '2026-02-10T16:15:00Z' },
  { id: 'mr-12', eventId: 'te-19', eventType: 'trade', volumeSpike: 195, priceMovement: 50.0, marketSentiment: 'bullish', topMovers: ['Mikko Rantanen', 'Sebastian Aho', 'Taylor Hall'], timestamp: '2026-02-25T15:30:00Z' },
  { id: 'mr-13', eventId: 'te-24', eventType: 'trade', volumeSpike: 350, priceMovement: 77.8, marketSentiment: 'bullish', topMovers: ['Garrett Crochet', 'Jackson Merrill', 'Ethan Salas'], timestamp: '2026-02-20T18:00:00Z' },
  { id: 'mr-14', eventId: 'fas-16', eventType: 'signing', volumeSpike: 290, priceMovement: 35.7, marketSentiment: 'bullish', topMovers: ['Max Fried', 'Aaron Judge', 'Gerrit Cole'], timestamp: '2025-12-12T12:00:00Z' },
  { id: 'mr-15', eventId: 'tr-1', eventType: 'rumor', volumeSpike: 180, priceMovement: 12.5, marketSentiment: 'mixed', topMovers: ['Jimmy Butler', 'Bam Adebayo', 'Tyler Herro'], timestamp: '2026-03-10T11:00:00Z' },
  { id: 'mr-16', eventId: 'tr-2', eventType: 'rumor', volumeSpike: 450, priceMovement: 8.2, marketSentiment: 'mixed', topMovers: ['Giannis Antetokounmpo', 'Damian Lillard', 'Bobby Portis'], timestamp: '2026-03-08T09:30:00Z' },
  { id: 'mr-17', eventId: 'tr-10', eventType: 'rumor', volumeSpike: 320, priceMovement: 15.0, marketSentiment: 'mixed', topMovers: ['Zion Williamson', 'CJ McCollum', 'Herbert Jones'], timestamp: '2026-03-14T10:00:00Z' },
  { id: 'mr-18', eventId: 'fas-10', eventType: 'signing', volumeSpike: 245, priceMovement: 40.6, marketSentiment: 'bullish', topMovers: ['Derrick Henry', 'Lamar Jackson', 'Mark Andrews'], timestamp: '2025-03-07T14:00:00Z' },
  { id: 'mr-19', eventId: 'te-7', eventType: 'trade', volumeSpike: 230, priceMovement: 55.6, marketSentiment: 'bullish', topMovers: ['Pascal Siakam', 'LeBron James', 'Anthony Davis'], timestamp: '2026-02-06T16:30:00Z' },
  { id: 'mr-20', eventId: 'fas-13', eventType: 'signing', volumeSpike: 185, priceMovement: 66.7, marketSentiment: 'bullish', topMovers: ['Willy Adames', 'Matt Chapman', 'Jung Hoo Lee'], timestamp: '2025-12-18T15:00:00Z' },
];

// ---- Mock Data: Watchlist Alerts ----

const MOCK_WATCHLIST_ALERTS: WatchlistAlert[] = [
  { id: 'wa-1', playerName: 'Jimmy Butler', alertType: 'trade_rumor', message: 'Butler trade rumors intensifying — multiple teams interested', priority: 'high', timestamp: '2026-03-14T10:00:00Z', read: false },
  { id: 'wa-2', playerName: 'Ethan Salas', alertType: 'value_spike', message: 'Salas cards up 34% after MLB callup announcement', priority: 'urgent', timestamp: '2026-03-01T08:00:00Z', read: true },
  { id: 'wa-3', playerName: 'MLB Trade Deadline', alertType: 'deadline_approaching', message: 'MLB trade deadline 138 days away — monitor prospect markets', priority: 'low', timestamp: '2026-03-15T06:00:00Z', read: false },
  { id: 'wa-4', playerName: 'Vladimir Guerrero Jr', alertType: 'value_spike', message: 'Vlad Jr cards doubled in value after Dodgers trade', priority: 'high', timestamp: '2026-01-15T19:00:00Z', read: true },
  { id: 'wa-5', playerName: 'Fernando Tatis Jr', alertType: 'value_drop', message: 'Tatis cards dropping — placed on 60-day IL', priority: 'high', timestamp: '2026-03-05T12:00:00Z', read: false },
  { id: 'wa-6', playerName: 'Giannis Antetokounmpo', alertType: 'trade_rumor', message: 'Giannis extension talks stalling — trade speculation rising', priority: 'medium', timestamp: '2026-03-12T14:00:00Z', read: false },
  { id: 'wa-7', playerName: 'Travis Bazzana', alertType: 'signing_imminent', message: 'Bazzana confirmed for Opening Day roster — cards moving fast', priority: 'high', timestamp: '2026-03-12T16:00:00Z', read: true },
  { id: 'wa-8', playerName: 'Connor Bedard', alertType: 'value_drop', message: 'Bedard cards down 26% after IR placement', priority: 'medium', timestamp: '2026-02-15T10:00:00Z', read: true },
  { id: 'wa-9', playerName: 'Zion Williamson', alertType: 'trade_rumor', message: 'Pelicans listening to offers for Zion — multiple teams engaged', priority: 'urgent', timestamp: '2026-03-14T11:30:00Z', read: false },
  { id: 'wa-10', playerName: 'Lauri Markkanen', alertType: 'value_spike', message: 'Markkanen cards up 40% following Warriors trade', priority: 'high', timestamp: '2026-02-06T15:30:00Z', read: true },
  { id: 'wa-11', playerName: 'Darius Garland', alertType: 'value_spike', message: 'Garland cards surging — Wembanyama pairing driving demand', priority: 'high', timestamp: '2026-02-05T17:00:00Z', read: true },
  { id: 'wa-12', playerName: 'Luis Robert Jr', alertType: 'value_spike', message: 'Robert cards up 68% after Yankees trade announcement', priority: 'high', timestamp: '2026-02-10T17:00:00Z', read: true },
  { id: 'wa-13', playerName: 'Derrick Rose', alertType: 'value_spike', message: 'Rose vintage cards spiking 80% on retirement announcement', priority: 'medium', timestamp: '2026-02-01T12:00:00Z', read: true },
  { id: 'wa-14', playerName: 'Patrick Kane', alertType: 'value_spike', message: 'Kane young guns and rookies up 72% on retirement news', priority: 'medium', timestamp: '2026-02-28T14:00:00Z', read: true },
  { id: 'wa-15', playerName: 'Mitch Marner', alertType: 'trade_rumor', message: 'Marner rumored to be available — Leafs exploring options', priority: 'medium', timestamp: '2026-03-01T09:00:00Z', read: false },
  { id: 'wa-16', playerName: 'Trae Young', alertType: 'trade_rumor', message: 'Hawks evaluating Young trade offers — Spurs among interested teams', priority: 'medium', timestamp: '2026-03-13T10:00:00Z', read: false },
  { id: 'wa-17', playerName: 'Aaron Rodgers', alertType: 'value_drop', message: 'Rodgers cards declining after Jets release — retirement likely', priority: 'low', timestamp: '2026-03-01T14:00:00Z', read: true },
  { id: 'wa-18', playerName: 'Garrett Crochet', alertType: 'value_spike', message: 'Crochet cards up 78% after Padres trade', priority: 'high', timestamp: '2026-02-20T19:00:00Z', read: true },
  { id: 'wa-19', playerName: 'Andrew Painter', alertType: 'value_spike', message: 'Painter prospect cards surging on MLB callup news', priority: 'medium', timestamp: '2026-03-08T10:00:00Z', read: false },
  { id: 'wa-20', playerName: 'Dylan Cease', alertType: 'trade_rumor', message: 'Cease could be flipped at deadline — Yankees and Phillies interested', priority: 'medium', timestamp: '2026-03-08T11:00:00Z', read: false },
];

// ---- Mock Data: Trade Rumors (12) ----

const MOCK_TRADE_RUMORS: TradeRumor[] = [
  { id: 'tr-1', league: 'nba', playerName: 'Jimmy Butler', currentTeam: 'Miami Heat', rumoredTeams: ['Phoenix Suns', 'Dallas Mavericks', 'Golden State Warriors'], confidence: 75, source: 'Shams Charania', reportedDate: '2026-03-10', potentialCardImpact: 25, description: 'Butler has requested a trade and Heat are actively shopping him', status: 'active' },
  { id: 'tr-2', league: 'nba', playerName: 'Giannis Antetokounmpo', currentTeam: 'Milwaukee Bucks', rumoredTeams: ['Golden State Warriors', 'Miami Heat', 'Oklahoma City Thunder'], confidence: 35, source: 'Adrian Wojnarowski', reportedDate: '2026-03-08', potentialCardImpact: 60, description: 'Extension negotiations have stalled, sparking trade speculation', status: 'active' },
  { id: 'tr-3', league: 'mlb', playerName: 'Pete Alonso', currentTeam: 'New York Mets', rumoredTeams: ['Houston Astros', 'San Francisco Giants'], confidence: 20, source: 'Jon Heyman', reportedDate: '2026-01-05', potentialCardImpact: 10, description: 'Alonso exploring options before re-signing with Mets', status: 'expired' },
  { id: 'tr-4', league: 'nfl', playerName: 'Davante Adams', currentTeam: 'New York Jets', rumoredTeams: ['Pittsburgh Steelers', 'Dallas Cowboys', 'Buffalo Bills'], confidence: 85, source: 'Ian Rapoport', reportedDate: '2026-02-28', potentialCardImpact: 8, description: 'Jets actively shopping Adams, Steelers frontrunners', status: 'confirmed' },
  { id: 'tr-5', league: 'nhl', playerName: 'Mitch Marner', currentTeam: 'Toronto Maple Leafs', rumoredTeams: ['Detroit Red Wings', 'Nashville Predators', 'New Jersey Devils'], confidence: 55, source: 'Pierre LeBrun', reportedDate: '2026-03-01', potentialCardImpact: 18, description: 'Marner could be moved as Leafs reshape roster in offseason', status: 'active' },
  { id: 'tr-6', league: 'nba', playerName: 'Bradley Beal', currentTeam: 'Phoenix Suns', rumoredTeams: ['Miami Heat', 'Detroit Pistons', 'Charlotte Hornets'], confidence: 45, source: 'Marc Stein', reportedDate: '2026-03-05', potentialCardImpact: -10, description: 'Suns looking to shed salary, Beal has no-trade clause', status: 'active' },
  { id: 'tr-7', league: 'mlb', playerName: 'Jazz Chisholm Jr', currentTeam: 'New York Yankees', rumoredTeams: ['Chicago Cubs', 'Texas Rangers'], confidence: 30, source: 'Ken Rosenthal', reportedDate: '2026-03-10', potentialCardImpact: 12, description: 'Yankees could flip Chisholm if they acquire another infielder', status: 'active' },
  { id: 'tr-8', league: 'nfl', playerName: 'Brandon Aiyuk', currentTeam: 'San Francisco 49ers', rumoredTeams: ['Washington Commanders', 'New England Patriots', 'Cleveland Browns'], confidence: 40, source: 'Adam Schefter', reportedDate: '2026-03-12', potentialCardImpact: 15, description: '49ers could move Aiyuk to clear cap space for extensions', status: 'active' },
  { id: 'tr-9', league: 'nhl', playerName: 'John Tavares', currentTeam: 'Toronto Maple Leafs', rumoredTeams: ['New York Islanders', 'Dallas Stars'], confidence: 25, source: 'Elliotte Friedman', reportedDate: '2026-02-20', potentialCardImpact: 5, description: 'Tavares could waive NMC for right situation', status: 'active' },
  { id: 'tr-10', league: 'nba', playerName: 'Zion Williamson', currentTeam: 'New Orleans Pelicans', rumoredTeams: ['Los Angeles Lakers', 'New York Knicks', 'Philadelphia 76ers'], confidence: 50, source: 'Chris Haynes', reportedDate: '2026-03-14', potentialCardImpact: 30, description: 'Pelicans listening to offers as rebuild accelerates', status: 'active' },
  { id: 'tr-11', league: 'mlb', playerName: 'Dylan Cease', currentTeam: 'San Diego Padres', rumoredTeams: ['New York Yankees', 'Baltimore Orioles', 'Philadelphia Phillies'], confidence: 60, source: 'Jeff Passan', reportedDate: '2026-03-08', potentialCardImpact: 15, description: 'Padres could flip Cease at deadline for prospect capital', status: 'active' },
  { id: 'tr-12', league: 'nba', playerName: 'Trae Young', currentTeam: 'Atlanta Hawks', rumoredTeams: ['San Antonio Spurs', 'Los Angeles Lakers', 'Phoenix Suns'], confidence: 42, source: 'Shams Charania', reportedDate: '2026-03-13', potentialCardImpact: 22, description: 'Hawks evaluating offers for Young as rebuild timeline shifts', status: 'active' },
  { id: 'tr-13', league: 'mlb', playerName: 'Vladimir Guerrero Jr', currentTeam: 'Toronto Blue Jays', rumoredTeams: ['Los Angeles Dodgers', 'New York Yankees', 'Seattle Mariners'], confidence: 90, source: 'Jeff Passan', reportedDate: '2025-12-20', potentialCardImpact: 45, description: 'Blue Jays actively shopping Vlad Jr before spring training', status: 'confirmed' },
  { id: 'tr-14', league: 'nba', playerName: 'Donovan Mitchell', currentTeam: 'Cleveland Cavaliers', rumoredTeams: ['New York Knicks', 'Brooklyn Nets', 'Miami Heat'], confidence: 30, source: 'Brian Windhorst', reportedDate: '2026-03-11', potentialCardImpact: 20, description: 'Mitchell extension talks ongoing but Knicks remain interested', status: 'active' },
  { id: 'tr-15', league: 'nfl', playerName: 'Justin Jefferson', currentTeam: 'Minnesota Vikings', rumoredTeams: ['Dallas Cowboys', 'Los Angeles Chargers'], confidence: 15, source: 'Adam Schefter', reportedDate: '2026-03-05', potentialCardImpact: 35, description: 'Extension expected but holdout creates speculation', status: 'expired' },
  { id: 'tr-16', league: 'nhl', playerName: 'Leon Draisaitl', currentTeam: 'Edmonton Oilers', rumoredTeams: ['New York Rangers', 'Dallas Stars', 'Vegas Golden Knights'], confidence: 20, source: 'Frank Seravalli', reportedDate: '2026-03-02', potentialCardImpact: 25, description: 'Draisaitl UFA status creating summer trade chatter', status: 'active' },
  { id: 'tr-17', league: 'mlb', playerName: 'Bo Bichette', currentTeam: 'Toronto Blue Jays', rumoredTeams: ['San Diego Padres', 'Chicago Cubs', 'Arizona Diamondbacks'], confidence: 65, source: 'Ken Rosenthal', reportedDate: '2026-03-10', potentialCardImpact: 15, description: 'Blue Jays expected to move Bichette in full teardown', status: 'active' },
  { id: 'tr-18', league: 'nba', playerName: 'De Aaron Fox', currentTeam: 'Sacramento Kings', rumoredTeams: ['San Antonio Spurs', 'Houston Rockets', 'Miami Heat'], confidence: 38, source: 'Marc Stein', reportedDate: '2026-03-14', potentialCardImpact: 18, description: 'Fox trade discussions could ramp up if Kings miss playoffs', status: 'active' },
  { id: 'tr-19', league: 'nfl', playerName: 'Micah Parsons', currentTeam: 'Dallas Cowboys', rumoredTeams: ['New York Giants', 'Los Angeles Rams', 'Las Vegas Raiders'], confidence: 25, source: 'Ian Rapoport', reportedDate: '2026-03-08', potentialCardImpact: 30, description: 'Cowboys cap situation making extension difficult — trade possible', status: 'active' },
  { id: 'tr-20', league: 'nhl', playerName: 'Trevor Zegras', currentTeam: 'Anaheim Ducks', rumoredTeams: ['New Jersey Devils', 'Pittsburgh Penguins', 'Ottawa Senators'], confidence: 50, source: 'Pierre LeBrun', reportedDate: '2026-02-28', potentialCardImpact: 12, description: 'Ducks exploring options with Zegras amid slow rebuild progress', status: 'active' },
];

// ---- Mock Data: Trade Impact Analysis ----

const MOCK_TRADE_IMPACT_ANALYSIS = {
  overallMarketHealth: {
    currentIndex: 142.0,
    weekOverWeek: 1.8,
    monthOverMonth: 8.5,
    yearOverYear: 42.0,
    volatilityIndex: 28.5,
    liquidityScore: 78,
    sentiment: 'bullish' as const,
  },
  topTenCardMovers: [
    { player: 'Vladimir Guerrero Jr', previousValue: 42.00, currentValue: 85.00, change: 102.4, reason: 'Dodgers trade' },
    { player: 'Derrick Rose', previousValue: 25.00, currentValue: 45.00, change: 80.0, reason: 'Retirement nostalgia' },
    { player: 'Garrett Crochet', previousValue: 18.00, currentValue: 32.00, change: 77.8, reason: 'Padres trade' },
    { player: 'Patrick Kane', previousValue: 22.00, currentValue: 38.00, change: 72.7, reason: 'Retirement bump' },
    { player: 'Saquon Barkley', previousValue: 28.00, currentValue: 48.00, change: 71.4, reason: 'Eagles signing' },
    { player: 'Luis Robert Jr', previousValue: 25.00, currentValue: 42.00, change: 68.0, reason: 'Yankees trade' },
    { player: 'Willy Adames', previousValue: 12.00, currentValue: 20.00, change: 66.7, reason: 'Giants signing' },
    { player: 'Roki Sasaki', previousValue: 45.00, currentValue: 75.00, change: 66.7, reason: 'Dodgers signing' },
    { player: 'Brandon Ingram', previousValue: 20.00, currentValue: 32.00, change: 60.0, reason: 'Sixers trade' },
    { player: 'Darius Garland', previousValue: 35.00, currentValue: 55.00, change: 57.1, reason: 'Spurs trade' },
  ],
  bottomFiveDecliners: [
    { player: 'Ben Simmons', previousValue: 8.00, currentValue: 3.00, change: -62.5, reason: 'Waived by Nets' },
    { player: 'Deshaun Watson', previousValue: 12.00, currentValue: 5.00, change: -58.3, reason: 'Released by Browns' },
    { player: 'Russell Wilson', previousValue: 18.00, currentValue: 10.00, change: -44.4, reason: 'Released by Steelers' },
    { player: 'Tua Tagovailoa', previousValue: 22.00, currentValue: 15.00, change: -31.8, reason: 'Traded to Raiders' },
    { player: 'Klay Thompson', previousValue: 55.00, currentValue: 38.00, change: -30.9, reason: 'Left Warriors' },
  ],
  leagueActivityRanking: [
    { league: 'mlb' as League, activityScore: 92, totalMoves: 18, marketImpact: 'massive' },
    { league: 'nba' as League, activityScore: 85, totalMoves: 42, marketImpact: 'significant' },
    { league: 'nhl' as League, activityScore: 78, totalMoves: 28, marketImpact: 'moderate' },
    { league: 'nfl' as League, activityScore: 72, totalMoves: 12, marketImpact: 'moderate' },
  ],
  upcomingCatalysts: [
    { date: '2026-03-26', event: 'MLB Opening Day', expectedImpact: 'high', description: 'Prospect callups and new team debuts drive card demand spikes' },
    { date: '2026-04-12', event: 'NBA Playoffs Begin', expectedImpact: 'high', description: 'Playoff performers see card value surges' },
    { date: '2026-04-15', event: 'NHL Playoffs Begin', expectedImpact: 'medium', description: 'Stanley Cup contenders drive demand for star players' },
    { date: '2026-04-23', event: 'NFL Draft', expectedImpact: 'high', description: 'Top picks see massive card value spikes on draft night' },
    { date: '2026-07-31', event: 'MLB Trade Deadline', expectedImpact: 'massive', description: 'Annual card market catalyst — trades create instant value shifts' },
    { date: '2026-06-26', event: 'NBA Draft', expectedImpact: 'high', description: 'New rookie cards hit market with fresh prospect hype' },
  ],
  seasonalPatterns: [
    { month: 'January', trend: 'rising', reason: 'Post-holiday buying, MLB offseason moves' },
    { month: 'February', trend: 'peak', reason: 'NBA trade deadline, Super Bowl momentum' },
    { month: 'March', trend: 'stable', reason: 'NFL free agency, spring training hype' },
    { month: 'April', trend: 'rising', reason: 'Playoff action across leagues, MLB Opening Day' },
    { month: 'May', trend: 'stable', reason: 'Sustained playoff momentum' },
    { month: 'June', trend: 'rising', reason: 'NBA Finals, Stanley Cup Finals, MLB All-Star buildup' },
    { month: 'July', trend: 'declining', reason: 'Summer lull, NBA free agency disruption' },
    { month: 'August', trend: 'rising', reason: 'MLB trade deadline, football preview' },
    { month: 'September', trend: 'peak', reason: 'NFL kickoff, MLB pennant races, new product releases' },
    { month: 'October', trend: 'stable', reason: 'World Series, NBA tip-off' },
    { month: 'November', trend: 'declining', reason: 'Holiday slowdown begins' },
    { month: 'December', trend: 'rising', reason: 'Holiday buying, MLB winter meetings' },
  ],
};

// ---- Service Functions ----

export function getTradeEvents(): TradeEvent[] {
  const cached = loadData<TradeEvent[]>('trade_events');
  if (cached) return cached;
  saveData('trade_events', MOCK_TRADE_EVENTS);
  return MOCK_TRADE_EVENTS;
}

export function getTradeEventsByLeague(league: League): TradeEvent[] {
  const events = getTradeEvents();
  return events.filter(e => e.league === league);
}

export function getFreeAgentSignings(): FreeAgentSigning[] {
  const cached = loadData<FreeAgentSigning[]>('free_agent_signings');
  if (cached) return cached;
  saveData('free_agent_signings', MOCK_FREE_AGENT_SIGNINGS);
  return MOCK_FREE_AGENT_SIGNINGS;
}

export function getSigningsByLeague(league: League): FreeAgentSigning[] {
  const signings = getFreeAgentSignings();
  return signings.filter(s => s.league === league);
}

export function getRosterMoves(): RosterMove[] {
  const cached = loadData<RosterMove[]>('roster_moves');
  if (cached) return cached;
  saveData('roster_moves', MOCK_ROSTER_MOVES);
  return MOCK_ROSTER_MOVES;
}

export function getImpactPredictions(): ImpactPrediction[] {
  const cached = loadData<ImpactPrediction[]>('impact_predictions');
  if (cached) return cached;
  saveData('impact_predictions', MOCK_IMPACT_PREDICTIONS);
  return MOCK_IMPACT_PREDICTIONS;
}

export function getPlayerImpacts(): PlayerImpact[] {
  const cached = loadData<PlayerImpact[]>('player_impacts');
  if (cached) return cached;
  saveData('player_impacts', MOCK_PLAYER_IMPACTS);
  return MOCK_PLAYER_IMPACTS;
}

export function getPlayerImpactsByLeague(league: League): PlayerImpact[] {
  const impacts = getPlayerImpacts();
  return impacts.filter(i => i.league === league);
}

export function getTeamImpacts(): TeamImpact[] {
  const cached = loadData<TeamImpact[]>('team_impacts');
  if (cached) return cached;
  saveData('team_impacts', MOCK_TEAM_IMPACTS);
  return MOCK_TEAM_IMPACTS;
}

export function getDeadlineCountdowns(): DeadlineCountdown[] {
  const cached = loadData<DeadlineCountdown[]>('deadline_countdowns');
  if (cached) return cached;
  saveData('deadline_countdowns', MOCK_DEADLINE_COUNTDOWNS);
  return MOCK_DEADLINE_COUNTDOWNS;
}

export function getHistoricalTrades(): HistoricalTrade[] {
  const cached = loadData<HistoricalTrade[]>('historical_trades');
  if (cached) return cached;
  saveData('historical_trades', MOCK_HISTORICAL_TRADES);
  return MOCK_HISTORICAL_TRADES;
}

export function getMarketReactions(): MarketReaction[] {
  const cached = loadData<MarketReaction[]>('market_reactions');
  if (cached) return cached;
  saveData('market_reactions', MOCK_MARKET_REACTIONS);
  return MOCK_MARKET_REACTIONS;
}

export function getWatchlistAlerts(): WatchlistAlert[] {
  const cached = loadData<WatchlistAlert[]>('watchlist_alerts');
  if (cached) return cached;
  saveData('watchlist_alerts', MOCK_WATCHLIST_ALERTS);
  return MOCK_WATCHLIST_ALERTS;
}

export function getTradeRumors(): TradeRumor[] {
  const cached = loadData<TradeRumor[]>('trade_rumors');
  if (cached) return cached;
  saveData('trade_rumors', MOCK_TRADE_RUMORS);
  return MOCK_TRADE_RUMORS;
}

export function getTradeRumorsByLeague(league: League): TradeRumor[] {
  const rumors = getTradeRumors();
  return rumors.filter(r => r.league === league);
}

export function getTopMovers(direction: 'up' | 'down'): PlayerImpact[] {
  const impacts = getPlayerImpacts();
  const filtered = impacts.filter(i => i.trending === direction);
  return filtered.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange)).slice(0, 10);
}

export function getLeagueSummary(league: League): typeof MOCK_LEAGUE_SUMMARIES.nba {
  return MOCK_LEAGUE_SUMMARIES[league];
}

export function getValueTimeline(): typeof MOCK_VALUE_TIMELINE {
  return MOCK_VALUE_TIMELINE;
}

export function getTradeImpactAnalysis(): typeof MOCK_TRADE_IMPACT_ANALYSIS {
  return MOCK_TRADE_IMPACT_ANALYSIS;
}

export function getUnreadAlerts(): WatchlistAlert[] {
  const alerts = getWatchlistAlerts();
  return alerts.filter(a => !a.read);
}

export function getActiveRumors(): TradeRumor[] {
  const rumors = getTradeRumors();
  return rumors.filter(r => r.status === 'active');
}

export function getActiveDeadlines(): DeadlineCountdown[] {
  const countdowns = getDeadlineCountdowns();
  return countdowns.filter(c => c.isActive);
}

export function getRecentTradeEvents(days: number): TradeEvent[] {
  const events = getTradeEvents();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return events.filter(e => new Date(e.date) >= cutoff);
}

export function getPlayerImpactByName(playerName: string): PlayerImpact | null {
  const impacts = getPlayerImpacts();
  return impacts.find(i => i.playerName === playerName) || null;
}

export function getTeamImpactByName(teamName: string): TeamImpact | null {
  const teamImpacts = getTeamImpacts();
  return teamImpacts.find(t => t.teamName === teamName) || null;
}

export function getRumorsByConfidence(minConfidence: number): TradeRumor[] {
  const rumors = getTradeRumors();
  return rumors.filter(r => r.confidence >= minConfidence).sort((a, b) => b.confidence - a.confidence);
}

export function getMarketReactionsByType(eventType: 'trade' | 'signing' | 'rumor'): MarketReaction[] {
  const reactions = getMarketReactions();
  return reactions.filter(r => r.eventType === eventType);
}

export function getHighPriorityAlerts(): WatchlistAlert[] {
  const alerts = getWatchlistAlerts();
  return alerts.filter(a => a.priority === 'high' || a.priority === 'urgent');
}

export function getConfirmedRumors(): TradeRumor[] {
  const rumors = getTradeRumors();
  return rumors.filter(r => r.status === 'confirmed');
}

export function getHistoricalTradesByLeague(league: League): HistoricalTrade[] {
  const trades = getHistoricalTrades();
  return trades.filter(t => t.league === league);
}

export function getRosterMovesByType(moveType: RosterMove['moveType']): RosterMove[] {
  const moves = getRosterMoves();
  return moves.filter(m => m.moveType === moveType);
}

// ---- Page-compatible types & adapters (used by TradeDeadline page) ----

export interface FreeAgencySigning {
  id: string;
  player: string;
  fromTeam: string;
  toTeam: string;
  contractValue: number;
  years: number;
  cardImpact: number;
  marketShift: string;
}

export interface LeagueDeadline {
  id: string;
  league: string;
  deadline: string;
  deadlineType: string;
  completedTrades: number;
  pendingTrades: number;
  totalVolume: number;
}

export interface HistoricalComparison {
  id: string;
  season: string;
  notableTrade: string;
  totalTrades: number;
  marketVolume: number;
  avgImpact: number;
  topCardChange: number;
  impactRating: number;
}

export interface TradeDeadlineSummary {
  totalTrades: number;
  activeTrades: number;
  cardsAffected: number;
}

export interface ValueChange {
  tradeName: string;
  valueIncrease: number;
  valueDecrease: number;
}

export function getFreeAgencySignings(): FreeAgencySigning[] {
  return getFreeAgentSignings().map(s => ({
    id: s.id,
    player: s.player,
    fromTeam: s.previousTeam,
    toTeam: s.newTeam,
    contractValue: s.contractValue,
    years: s.contractYears,
    cardImpact: s.percentChange,
    marketShift: Math.abs(s.percentChange) > 20 ? 'major' : Math.abs(s.percentChange) > 10 ? 'moderate' : 'minor',
  }));
}

export function getLeagueDeadlines(): LeagueDeadline[] {
  return getDeadlineCountdowns().map(d => ({
    id: d.id,
    league: d.league.toUpperCase(),
    deadline: d.deadlineDate,
    deadlineType: d.deadlineName,
    completedTrades: d.completedMoves,
    pendingTrades: d.expectedMoves - d.completedMoves,
    totalVolume: d.expectedMoves * 250_000,
  }));
}

export function getHistoricalComparisons(): HistoricalComparison[] {
  return getHistoricalTrades().map((t, i) => ({
    id: t.id,
    season: `${t.year}-${(t.year + 1).toString().slice(2)}`,
    notableTrade: `${t.playerTraded} (${t.fromTeam} → ${t.toTeam})`,
    totalTrades: 15 + i * 3,
    marketVolume: t.cardValueAtTrade * 10,
    avgImpact: t.percentChange,
    topCardChange: t.cardValueAfter - t.cardValueAtTrade,
    impactRating: Math.min(5, Math.max(1, Math.ceil(Math.abs(t.percentChange) / 10))),
  }));
}

export function getSummaryStats(): TradeDeadlineSummary {
  const events = getTradeEvents();
  const rumors = getTradeRumors();
  return {
    totalTrades: events.length,
    activeTrades: rumors.filter(r => r.status === 'active').length,
    cardsAffected: events.length * 12,
  };
}

export function getValueChanges(): ValueChange[] {
  return getTradeEvents().slice(0, 8).map(e => ({
    tradeName: e.headline || e.playerTraded,
    valueIncrease: Math.max(0, e.cardValueImpact),
    valueDecrease: Math.abs(Math.min(0, e.cardValueImpact)),
  }));
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function getImpactColor(impact: string): string {
  switch (impact) {
    case 'major': return 'text-red-400';
    case 'moderate': return 'text-amber-400';
    case 'minor': return 'text-blue-400';
    default: return 'text-slate-400';
  }
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return 'text-emerald-400';
  if (confidence >= 50) return 'text-amber-400';
  return 'text-red-400';
}

// ---- Widget-compatible helpers ----

export function getAffectedPlayers(): { id: string; playerName: string; team: string }[] {
  const impacts = getPlayerImpacts();
  return impacts.map(p => ({
    id: p.id,
    playerName: p.player,
    team: p.team,
  }));
}

export function getDeadlineInfo(): { daysRemaining: number; nextDeadline: string } {
  const deadlines = getActiveDeadlines();
  if (deadlines.length === 0) {
    return { daysRemaining: 0, nextDeadline: 'N/A' };
  }
  const next = deadlines[0];
  const now = new Date();
  const deadlineDate = new Date(next.deadlineDate);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return { daysRemaining, nextDeadline: next.deadlineName };
}

import { store } from '../dal/syncStore';
export function getMarketImpact(): { totalImpact: number; trendPercent: number } {
  const events = getTradeEvents();
  const totalImpact = events.reduce((sum, e) => sum + Math.abs(e.cardValueImpact), 0);
  const upEvents = events.filter(e => e.impactDirection === 'up');
  const trendPercent = events.length > 0 ? (upEvents.length / events.length) * 100 : 0;
  return { totalImpact, trendPercent: Math.round(trendPercent * 10) / 10 };
}
