// Phase 138: Predictive Rookie Class & Draft Capital Index

export type Sport = 'nba' | 'nfl' | 'mlb' | 'nhl';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface RookieClassIndex {
  year: number;
  sport: Sport;
  index_value: number;
  change_pct: number;
  top_performers: string[];
  total_cards_tracked: number;
  aggregate_market_cap: number;
  rank_all_time: number;
}

export interface RookieIndexEntry {
  player: string;
  draft_position: number;
  team: string;
  card_count: number;
  avg_value: number;
  total_market_cap: number;
  roi_since_draft: number;
  trend: TrendDirection;
  sport: Sport;
  year: number;
}

export interface DraftCapitalEfficiency {
  position_range: string;
  position_start: number;
  position_end: number;
  historical_roi_avg: number;
  best_pick: { player: string; year: number; roi: number };
  worst_pick: { player: string; year: number; roi: number };
  sport: Sport;
}

export interface ClassComparison {
  year_a: number;
  year_b: number;
  sport: Sport;
  comparison_metrics: {
    metric: string;
    value_a: number;
    value_b: number;
    winner: 'a' | 'b' | 'tie';
  }[];
}

export interface HistoricalClassPerformance {
  year: number;
  sport: Sport;
  index_values: { month: string; value: number }[];
}

export interface PreDraftProjection {
  player: string;
  projected_position: number;
  school_or_team: string;
  sport: Sport;
  projected_roi_year1: number;
  projected_market_cap: number;
  confidence: number;
  comp_player: string;
  risk_level: 'low' | 'medium' | 'high';
}

export interface DraftPositionROI {
  position: number;
  avg_roi: number;
  sample_size: number;
  sport: Sport;
}

export interface InvestableIndex {
  year: number;
  sport: Sport;
  buy_rating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  current_value: number;
  projected_value_12m: number;
  volatility: number;
  liquidity_score: number;
}

// ─── Mock Data ───────────────────────────────────────────────

const ROOKIE_CLASS_INDICES: RookieClassIndex[] = [
  // NBA
  { year: 2003, sport: 'nba', index_value: 9850, change_pct: 2.1, top_performers: ['LeBron James', 'Dwyane Wade', 'Carmelo Anthony', 'Chris Bosh'], total_cards_tracked: 4200, aggregate_market_cap: 285000000, rank_all_time: 1 },
  { year: 2009, sport: 'nba', index_value: 6420, change_pct: -1.3, top_performers: ['Stephen Curry', 'James Harden', 'Blake Griffin'], total_cards_tracked: 3100, aggregate_market_cap: 142000000, rank_all_time: 4 },
  { year: 2013, sport: 'nba', index_value: 2180, change_pct: -4.8, top_performers: ['Giannis Antetokounmpo', 'Victor Oladipo', 'CJ McCollum'], total_cards_tracked: 2600, aggregate_market_cap: 48000000, rank_all_time: 18 },
  { year: 2018, sport: 'nba', index_value: 7890, change_pct: 5.2, top_performers: ['Luka Doncic', 'Trae Young', 'Shai Gilgeous-Alexander', 'Deandre Ayton'], total_cards_tracked: 3800, aggregate_market_cap: 198000000, rank_all_time: 2 },
  { year: 2019, sport: 'nba', index_value: 5100, change_pct: -8.5, top_performers: ['Ja Morant', 'Zion Williamson', 'Tyler Herro', 'RJ Barrett'], total_cards_tracked: 3400, aggregate_market_cap: 95000000, rank_all_time: 8 },
  { year: 2020, sport: 'nba', index_value: 5850, change_pct: 3.4, top_performers: ['Anthony Edwards', 'LaMelo Ball', 'Tyrese Haliburton'], total_cards_tracked: 3200, aggregate_market_cap: 112000000, rank_all_time: 6 },
  { year: 2021, sport: 'nba', index_value: 4200, change_pct: -2.1, top_performers: ['Cade Cunningham', 'Scottie Barnes', 'Evan Mobley', 'Jalen Green'], total_cards_tracked: 3000, aggregate_market_cap: 72000000, rank_all_time: 12 },
  { year: 2022, sport: 'nba', index_value: 5400, change_pct: 6.8, top_performers: ['Paolo Banchero', 'Keegan Murray', 'Jalen Williams', 'Bennedict Mathurin'], total_cards_tracked: 3500, aggregate_market_cap: 88000000, rank_all_time: 7 },
  { year: 2023, sport: 'nba', index_value: 7200, change_pct: 12.4, top_performers: ['Victor Wembanyama', 'Chet Holmgren', 'Brandon Miller', 'Jaime Jaquez Jr.'], total_cards_tracked: 4100, aggregate_market_cap: 165000000, rank_all_time: 3 },
  { year: 2024, sport: 'nba', index_value: 4800, change_pct: 8.1, top_performers: ['Zaccharie Risacher', 'Alex Sarr', 'Reed Sheppard', 'Donovan Clingan'], total_cards_tracked: 3600, aggregate_market_cap: 78000000, rank_all_time: 10 },
  // NFL
  { year: 2017, sport: 'nfl', index_value: 8200, change_pct: 1.5, top_performers: ['Patrick Mahomes', 'Deshaun Watson', 'Christian McCaffrey', 'Marshon Lattimore'], total_cards_tracked: 3900, aggregate_market_cap: 220000000, rank_all_time: 1 },
  { year: 2018, sport: 'nfl', index_value: 6800, change_pct: 3.2, top_performers: ['Josh Allen', 'Lamar Jackson', 'Saquon Barkley', 'Baker Mayfield'], total_cards_tracked: 3700, aggregate_market_cap: 175000000, rank_all_time: 3 },
  { year: 2020, sport: 'nfl', index_value: 7400, change_pct: -2.8, top_performers: ['Justin Herbert', 'Joe Burrow', 'Justin Jefferson', 'CeeDee Lamb'], total_cards_tracked: 4000, aggregate_market_cap: 195000000, rank_all_time: 2 },
  { year: 2021, sport: 'nfl', index_value: 4500, change_pct: -5.4, top_performers: ['Trevor Lawrence', 'Ja\'Marr Chase', 'Micah Parsons', 'Kyle Pitts'], total_cards_tracked: 3600, aggregate_market_cap: 82000000, rank_all_time: 9 },
  { year: 2023, sport: 'nfl', index_value: 6200, change_pct: 9.8, top_performers: ['C.J. Stroud', 'Bijan Robinson', 'Will Anderson Jr.', 'Anthony Richardson'], total_cards_tracked: 3800, aggregate_market_cap: 148000000, rank_all_time: 4 },
  { year: 2024, sport: 'nfl', index_value: 5100, change_pct: 15.2, top_performers: ['Caleb Williams', 'Jayden Daniels', 'Marvin Harrison Jr.', 'Malik Nabers'], total_cards_tracked: 3500, aggregate_market_cap: 92000000, rank_all_time: 7 },
  // MLB
  { year: 2019, sport: 'mlb', index_value: 4800, change_pct: -3.2, top_performers: ['Yordan Alvarez', 'Bo Bichette', 'Eloy Jimenez'], total_cards_tracked: 2800, aggregate_market_cap: 65000000, rank_all_time: 8 },
  { year: 2022, sport: 'mlb', index_value: 6100, change_pct: 4.5, top_performers: ['Julio Rodriguez', 'Bobby Witt Jr.', 'Adley Rutschman', 'Michael Harris II'], total_cards_tracked: 3200, aggregate_market_cap: 118000000, rank_all_time: 3 },
  { year: 2023, sport: 'mlb', index_value: 5400, change_pct: 7.2, top_performers: ['Corbin Carroll', 'Gunnar Henderson', 'Elly De La Cruz', 'Evan Carter'], total_cards_tracked: 3000, aggregate_market_cap: 95000000, rank_all_time: 5 },
  { year: 2024, sport: 'mlb', index_value: 5800, change_pct: 11.8, top_performers: ['Paul Skenes', 'Jackson Chourio', 'Jackson Merrill', 'Yoshinobu Yamamoto'], total_cards_tracked: 3400, aggregate_market_cap: 105000000, rank_all_time: 4 },
  // NHL
  { year: 2016, sport: 'nhl', index_value: 5200, change_pct: 1.2, top_performers: ['Auston Matthews', 'Patrik Laine', 'Matthew Tkachuk'], total_cards_tracked: 1800, aggregate_market_cap: 42000000, rank_all_time: 2 },
  { year: 2023, sport: 'nhl', index_value: 4500, change_pct: 8.4, top_performers: ['Connor Bedard', 'Adam Fantilli', 'Leo Carlsson'], total_cards_tracked: 2000, aggregate_market_cap: 35000000, rank_all_time: 3 },
];

const ROOKIE_ENTRIES: RookieIndexEntry[] = [
  // 2023 NBA class
  { player: 'Victor Wembanyama', draft_position: 1, team: 'San Antonio Spurs', card_count: 1240, avg_value: 285, total_market_cap: 42000000, roi_since_draft: 340, trend: 'up', sport: 'nba', year: 2023 },
  { player: 'Brandon Miller', draft_position: 2, team: 'Charlotte Hornets', card_count: 680, avg_value: 42, total_market_cap: 8500000, roi_since_draft: 85, trend: 'stable', sport: 'nba', year: 2023 },
  { player: 'Scoot Henderson', draft_position: 3, team: 'Portland Trail Blazers', card_count: 720, avg_value: 28, total_market_cap: 5200000, roi_since_draft: -15, trend: 'down', sport: 'nba', year: 2023 },
  { player: 'Amen Thompson', draft_position: 4, team: 'Houston Rockets', card_count: 510, avg_value: 35, total_market_cap: 4800000, roi_since_draft: 62, trend: 'up', sport: 'nba', year: 2023 },
  { player: 'Ausar Thompson', draft_position: 5, team: 'Detroit Pistons', card_count: 480, avg_value: 18, total_market_cap: 2400000, roi_since_draft: -28, trend: 'down', sport: 'nba', year: 2023 },
  { player: 'Chet Holmgren', draft_position: 2, team: 'Oklahoma City Thunder', card_count: 890, avg_value: 65, total_market_cap: 15800000, roi_since_draft: 125, trend: 'up', sport: 'nba', year: 2023 },
  { player: 'Jaime Jaquez Jr.', draft_position: 18, team: 'Miami Heat', card_count: 420, avg_value: 32, total_market_cap: 3800000, roi_since_draft: 180, trend: 'up', sport: 'nba', year: 2023 },
  { player: 'Dereck Lively II', draft_position: 12, team: 'Dallas Mavericks', card_count: 380, avg_value: 25, total_market_cap: 2800000, roi_since_draft: 95, trend: 'up', sport: 'nba', year: 2023 },
  { player: 'Keyonte George', draft_position: 16, team: 'Utah Jazz', card_count: 350, avg_value: 22, total_market_cap: 2200000, roi_since_draft: 55, trend: 'stable', sport: 'nba', year: 2023 },
  { player: 'Gradey Dick', draft_position: 13, team: 'Toronto Raptors', card_count: 360, avg_value: 28, total_market_cap: 2500000, roi_since_draft: 72, trend: 'up', sport: 'nba', year: 2023 },
  // 2003 NBA class (all-time best)
  { player: 'LeBron James', draft_position: 1, team: 'Cleveland Cavaliers', card_count: 8500, avg_value: 1850, total_market_cap: 185000000, roi_since_draft: 12400, trend: 'up', sport: 'nba', year: 2003 },
  { player: 'Dwyane Wade', draft_position: 5, team: 'Miami Heat', card_count: 4200, avg_value: 320, total_market_cap: 38000000, roi_since_draft: 2800, trend: 'stable', sport: 'nba', year: 2003 },
  { player: 'Carmelo Anthony', draft_position: 3, team: 'Denver Nuggets', card_count: 3800, avg_value: 185, total_market_cap: 22000000, roi_since_draft: 1600, trend: 'stable', sport: 'nba', year: 2003 },
  { player: 'Chris Bosh', draft_position: 4, team: 'Toronto Raptors', card_count: 2900, avg_value: 125, total_market_cap: 12000000, roi_since_draft: 920, trend: 'down', sport: 'nba', year: 2003 },
  { player: 'David West', draft_position: 18, team: 'New Orleans Hornets', card_count: 1200, avg_value: 22, total_market_cap: 1800000, roi_since_draft: 180, trend: 'stable', sport: 'nba', year: 2003 },
  // 2018 NBA class
  { player: 'Luka Doncic', draft_position: 3, team: 'Dallas Mavericks', card_count: 5200, avg_value: 420, total_market_cap: 95000000, roi_since_draft: 3200, trend: 'up', sport: 'nba', year: 2018 },
  { player: 'Trae Young', draft_position: 5, team: 'Atlanta Hawks', card_count: 3400, avg_value: 85, total_market_cap: 18000000, roi_since_draft: 520, trend: 'stable', sport: 'nba', year: 2018 },
  { player: 'Shai Gilgeous-Alexander', draft_position: 11, team: 'Los Angeles Clippers', card_count: 2800, avg_value: 145, total_market_cap: 28000000, roi_since_draft: 1850, trend: 'up', sport: 'nba', year: 2018 },
  { player: 'Deandre Ayton', draft_position: 1, team: 'Phoenix Suns', card_count: 2600, avg_value: 38, total_market_cap: 6500000, roi_since_draft: -35, trend: 'down', sport: 'nba', year: 2018 },
  // 2017 NFL class
  { player: 'Patrick Mahomes', draft_position: 10, team: 'Kansas City Chiefs', card_count: 6800, avg_value: 580, total_market_cap: 145000000, roi_since_draft: 8500, trend: 'up', sport: 'nfl', year: 2017 },
  { player: 'Deshaun Watson', draft_position: 12, team: 'Houston Texans', card_count: 3200, avg_value: 35, total_market_cap: 8200000, roi_since_draft: -62, trend: 'down', sport: 'nfl', year: 2017 },
  { player: 'Christian McCaffrey', draft_position: 8, team: 'Carolina Panthers', card_count: 2800, avg_value: 95, total_market_cap: 18000000, roi_since_draft: 420, trend: 'stable', sport: 'nfl', year: 2017 },
  // 2020 NFL class
  { player: 'Justin Herbert', draft_position: 6, team: 'Los Angeles Chargers', card_count: 4200, avg_value: 185, total_market_cap: 52000000, roi_since_draft: 680, trend: 'up', sport: 'nfl', year: 2020 },
  { player: 'Joe Burrow', draft_position: 1, team: 'Cincinnati Bengals', card_count: 4800, avg_value: 210, total_market_cap: 62000000, roi_since_draft: 920, trend: 'up', sport: 'nfl', year: 2020 },
  { player: 'Justin Jefferson', draft_position: 22, team: 'Minnesota Vikings', card_count: 3600, avg_value: 155, total_market_cap: 38000000, roi_since_draft: 2400, trend: 'up', sport: 'nfl', year: 2020 },
  { player: 'CeeDee Lamb', draft_position: 17, team: 'Dallas Cowboys', card_count: 3200, avg_value: 120, total_market_cap: 28000000, roi_since_draft: 850, trend: 'up', sport: 'nfl', year: 2020 },
  // 2023 NFL class
  { player: 'C.J. Stroud', draft_position: 2, team: 'Houston Texans', card_count: 3800, avg_value: 165, total_market_cap: 42000000, roi_since_draft: 520, trend: 'up', sport: 'nfl', year: 2023 },
  { player: 'Bijan Robinson', draft_position: 8, team: 'Atlanta Falcons', card_count: 2800, avg_value: 110, total_market_cap: 22000000, roi_since_draft: 340, trend: 'up', sport: 'nfl', year: 2023 },
  { player: 'Anthony Richardson', draft_position: 4, team: 'Indianapolis Colts', card_count: 2600, avg_value: 85, total_market_cap: 15000000, roi_since_draft: 180, trend: 'stable', sport: 'nfl', year: 2023 },
  // 2024 MLB class
  { player: 'Paul Skenes', draft_position: 1, team: 'Pittsburgh Pirates', card_count: 2200, avg_value: 125, total_market_cap: 28000000, roi_since_draft: 380, trend: 'up', sport: 'mlb', year: 2024 },
  { player: 'Jackson Chourio', draft_position: 0, team: 'Milwaukee Brewers', card_count: 1800, avg_value: 85, total_market_cap: 18000000, roi_since_draft: 290, trend: 'up', sport: 'mlb', year: 2024 },
  { player: 'Jackson Merrill', draft_position: 0, team: 'San Diego Padres', card_count: 1400, avg_value: 65, total_market_cap: 12000000, roi_since_draft: 240, trend: 'up', sport: 'mlb', year: 2024 },
  { player: 'Yoshinobu Yamamoto', draft_position: 0, team: 'Los Angeles Dodgers', card_count: 1600, avg_value: 78, total_market_cap: 14000000, roi_since_draft: 195, trend: 'stable', sport: 'mlb', year: 2024 },
  // 2022 MLB class
  { player: 'Julio Rodriguez', draft_position: 0, team: 'Seattle Mariners', card_count: 3200, avg_value: 165, total_market_cap: 38000000, roi_since_draft: 520, trend: 'up', sport: 'mlb', year: 2022 },
  { player: 'Bobby Witt Jr.', draft_position: 0, team: 'Kansas City Royals', card_count: 2800, avg_value: 120, total_market_cap: 28000000, roi_since_draft: 440, trend: 'up', sport: 'mlb', year: 2022 },
  { player: 'Adley Rutschman', draft_position: 0, team: 'Baltimore Orioles', card_count: 2200, avg_value: 72, total_market_cap: 15000000, roi_since_draft: 280, trend: 'stable', sport: 'mlb', year: 2022 },
  // 2024 NFL class
  { player: 'Caleb Williams', draft_position: 1, team: 'Chicago Bears', card_count: 2800, avg_value: 95, total_market_cap: 24000000, roi_since_draft: 185, trend: 'up', sport: 'nfl', year: 2024 },
  { player: 'Jayden Daniels', draft_position: 2, team: 'Washington Commanders', card_count: 2400, avg_value: 110, total_market_cap: 22000000, roi_since_draft: 240, trend: 'up', sport: 'nfl', year: 2024 },
  { player: 'Marvin Harrison Jr.', draft_position: 4, team: 'Arizona Cardinals', card_count: 2200, avg_value: 78, total_market_cap: 16000000, roi_since_draft: 120, trend: 'stable', sport: 'nfl', year: 2024 },
  { player: 'Malik Nabers', draft_position: 6, team: 'New York Giants', card_count: 2000, avg_value: 85, total_market_cap: 14000000, roi_since_draft: 165, trend: 'up', sport: 'nfl', year: 2024 },
  // 2023 NHL class
  { player: 'Connor Bedard', draft_position: 1, team: 'Chicago Blackhawks', card_count: 1800, avg_value: 145, total_market_cap: 22000000, roi_since_draft: 280, trend: 'up', sport: 'nhl', year: 2023 },
  { player: 'Adam Fantilli', draft_position: 3, team: 'Columbus Blue Jackets', card_count: 920, avg_value: 42, total_market_cap: 4500000, roi_since_draft: 95, trend: 'stable', sport: 'nhl', year: 2023 },
  { player: 'Leo Carlsson', draft_position: 2, team: 'Anaheim Ducks', card_count: 850, avg_value: 38, total_market_cap: 3800000, roi_since_draft: 72, trend: 'stable', sport: 'nhl', year: 2023 },
];

const DRAFT_CAPITAL_EFFICIENCY: DraftCapitalEfficiency[] = [
  // NBA
  { position_range: '1st Overall', position_start: 1, position_end: 1, historical_roi_avg: 340, best_pick: { player: 'LeBron James', year: 2003, roi: 12400 }, worst_pick: { player: 'Anthony Bennett', year: 2013, roi: -85 }, sport: 'nba' },
  { position_range: '2-5', position_start: 2, position_end: 5, historical_roi_avg: 185, best_pick: { player: 'Luka Doncic', year: 2018, roi: 3200 }, worst_pick: { player: 'Hasheem Thabeet', year: 2009, roi: -92 }, sport: 'nba' },
  { position_range: '6-10', position_start: 6, position_end: 10, historical_roi_avg: 115, best_pick: { player: 'Damian Lillard', year: 2012, roi: 1800 }, worst_pick: { player: 'Thomas Robinson', year: 2012, roi: -78 }, sport: 'nba' },
  { position_range: '11-15', position_start: 11, position_end: 15, historical_roi_avg: 85, best_pick: { player: 'Shai Gilgeous-Alexander', year: 2018, roi: 1850 }, worst_pick: { player: 'Dante Exum', year: 2014, roi: -72 }, sport: 'nba' },
  { position_range: '16-20', position_start: 16, position_end: 20, historical_roi_avg: 55, best_pick: { player: 'Giannis Antetokounmpo', year: 2013, roi: 8200 }, worst_pick: { player: 'Georgios Papagiannis', year: 2016, roi: -88 }, sport: 'nba' },
  { position_range: '21-30', position_start: 21, position_end: 30, historical_roi_avg: 22, best_pick: { player: 'Nikola Jokic', year: 2014, roi: 9500 }, worst_pick: { player: 'Marquese Chriss', year: 2016, roi: -82 }, sport: 'nba' },
  // NFL
  { position_range: '1st Overall', position_start: 1, position_end: 1, historical_roi_avg: 280, best_pick: { player: 'Joe Burrow', year: 2020, roi: 920 }, worst_pick: { player: 'Baker Mayfield', year: 2018, roi: -45 }, sport: 'nfl' },
  { position_range: '2-5', position_start: 2, position_end: 5, historical_roi_avg: 165, best_pick: { player: 'C.J. Stroud', year: 2023, roi: 520 }, worst_pick: { player: 'Sam Darnold', year: 2018, roi: -65 }, sport: 'nfl' },
  { position_range: '6-10', position_start: 6, position_end: 10, historical_roi_avg: 120, best_pick: { player: 'Patrick Mahomes', year: 2017, roi: 8500 }, worst_pick: { player: 'Solomon Thomas', year: 2017, roi: -78 }, sport: 'nfl' },
  { position_range: '11-20', position_start: 11, position_end: 20, historical_roi_avg: 75, best_pick: { player: 'Justin Jefferson', year: 2020, roi: 2400 }, worst_pick: { player: 'N\'Keal Harry', year: 2019, roi: -85 }, sport: 'nfl' },
  { position_range: '21-32', position_start: 21, position_end: 32, historical_roi_avg: 35, best_pick: { player: 'Lamar Jackson', year: 2018, roi: 1200 }, worst_pick: { player: 'Paxton Lynch', year: 2016, roi: -90 }, sport: 'nfl' },
  // MLB
  { position_range: '1st Overall', position_start: 1, position_end: 1, historical_roi_avg: 220, best_pick: { player: 'Paul Skenes', year: 2024, roi: 380 }, worst_pick: { player: 'Brady Aiken', year: 2014, roi: -95 }, sport: 'mlb' },
  { position_range: '2-5', position_start: 2, position_end: 5, historical_roi_avg: 145, best_pick: { player: 'Corbin Carroll', year: 2019, roi: 480 }, worst_pick: { player: 'Nick Senzel', year: 2016, roi: -42 }, sport: 'mlb' },
  { position_range: '6-15', position_start: 6, position_end: 15, historical_roi_avg: 85, best_pick: { player: 'Gunnar Henderson', year: 2019, roi: 520 }, worst_pick: { player: 'Jason Groome', year: 2016, roi: -88 }, sport: 'mlb' },
  // NHL
  { position_range: '1st Overall', position_start: 1, position_end: 1, historical_roi_avg: 310, best_pick: { player: 'Connor McDavid', year: 2015, roi: 4200 }, worst_pick: { player: 'Nail Yakupov', year: 2012, roi: -72 }, sport: 'nhl' },
  { position_range: '2-5', position_start: 2, position_end: 5, historical_roi_avg: 140, best_pick: { player: 'Auston Matthews', year: 2016, roi: 1800 }, worst_pick: { player: 'Nolan Patrick', year: 2017, roi: -58 }, sport: 'nhl' },
];

const PRE_DRAFT_PROJECTIONS: PreDraftProjection[] = [
  // 2026 NBA
  { player: 'Cooper Flagg', projected_position: 1, school_or_team: 'Duke', sport: 'nba', projected_roi_year1: 280, projected_market_cap: 35000000, confidence: 0.92, comp_player: 'LeBron James', risk_level: 'low' },
  { player: 'Ace Bailey', projected_position: 2, school_or_team: 'Rutgers', sport: 'nba', projected_roi_year1: 145, projected_market_cap: 12000000, confidence: 0.78, comp_player: 'Brandon Ingram', risk_level: 'medium' },
  { player: 'Dylan Harper', projected_position: 3, school_or_team: 'Rutgers', sport: 'nba', projected_roi_year1: 120, projected_market_cap: 10000000, confidence: 0.75, comp_player: 'Ja Morant', risk_level: 'medium' },
  { player: 'VJ Edgecombe', projected_position: 4, school_or_team: 'Baylor', sport: 'nba', projected_roi_year1: 95, projected_market_cap: 7000000, confidence: 0.68, comp_player: 'Jalen Green', risk_level: 'medium' },
  { player: 'Kasparas Jakucionis', projected_position: 5, school_or_team: 'Illinois', sport: 'nba', projected_roi_year1: 85, projected_market_cap: 5500000, confidence: 0.65, comp_player: 'Luka Doncic', risk_level: 'medium' },
  // 2026 NFL
  { player: 'Shedeur Sanders', projected_position: 1, school_or_team: 'Colorado', sport: 'nfl', projected_roi_year1: 195, projected_market_cap: 18000000, confidence: 0.82, comp_player: 'Justin Herbert', risk_level: 'medium' },
  { player: 'Cam Ward', projected_position: 2, school_or_team: 'Miami', sport: 'nfl', projected_roi_year1: 165, projected_market_cap: 14000000, confidence: 0.78, comp_player: 'Patrick Mahomes', risk_level: 'medium' },
  { player: 'Travis Hunter', projected_position: 3, school_or_team: 'Colorado', sport: 'nfl', projected_roi_year1: 220, projected_market_cap: 22000000, confidence: 0.88, comp_player: 'Justin Jefferson', risk_level: 'low' },
  { player: 'Abdul Carter', projected_position: 4, school_or_team: 'Penn State', sport: 'nfl', projected_roi_year1: 110, projected_market_cap: 8000000, confidence: 0.72, comp_player: 'Micah Parsons', risk_level: 'medium' },
  // 2026 MLB
  { player: 'Jac Caglianone', projected_position: 1, school_or_team: 'Florida', sport: 'mlb', projected_roi_year1: 140, projected_market_cap: 8000000, confidence: 0.70, comp_player: 'Shohei Ohtani', risk_level: 'high' },
  { player: 'Charlie Condon', projected_position: 2, school_or_team: 'Georgia', sport: 'mlb', projected_roi_year1: 120, projected_market_cap: 6000000, confidence: 0.68, comp_player: 'Pete Alonso', risk_level: 'medium' },
];

const HISTORICAL_TIMELINE: HistoricalClassPerformance[] = [
  {
    year: 2023, sport: 'nba',
    index_values: [
      { month: '2023-07', value: 3200 }, { month: '2023-08', value: 3800 }, { month: '2023-09', value: 4100 },
      { month: '2023-10', value: 4800 }, { month: '2023-11', value: 5200 }, { month: '2023-12', value: 5600 },
      { month: '2024-01', value: 5900 }, { month: '2024-02', value: 6100 }, { month: '2024-03', value: 5800 },
      { month: '2024-04', value: 6200 }, { month: '2024-05', value: 6500 }, { month: '2024-06', value: 6400 },
      { month: '2024-07', value: 6100 }, { month: '2024-08', value: 6300 }, { month: '2024-09', value: 6600 },
      { month: '2024-10', value: 6800 }, { month: '2024-11', value: 7000 }, { month: '2024-12', value: 6900 },
      { month: '2025-01', value: 7100 }, { month: '2025-02', value: 7000 }, { month: '2025-03', value: 7200 },
    ],
  },
  {
    year: 2003, sport: 'nba',
    index_values: [
      { month: '2003-07', value: 1200 }, { month: '2004-01', value: 2800 }, { month: '2004-07', value: 3100 },
      { month: '2005-01', value: 3600 }, { month: '2005-07', value: 4200 }, { month: '2006-01', value: 4800 },
      { month: '2008-01', value: 5600 }, { month: '2010-01', value: 6200 }, { month: '2012-01', value: 7100 },
      { month: '2016-01', value: 8200 }, { month: '2020-01', value: 9100 }, { month: '2023-01', value: 9600 },
      { month: '2025-01', value: 9850 },
    ],
  },
  {
    year: 2017, sport: 'nfl',
    index_values: [
      { month: '2017-05', value: 1800 }, { month: '2017-09', value: 2200 }, { month: '2018-01', value: 3100 },
      { month: '2018-07', value: 3800 }, { month: '2019-01', value: 4500 }, { month: '2019-07', value: 5200 },
      { month: '2020-01', value: 5800 }, { month: '2020-07', value: 6200 }, { month: '2021-01', value: 6800 },
      { month: '2022-01', value: 7400 }, { month: '2023-01', value: 7800 }, { month: '2024-01', value: 8000 },
      { month: '2025-01', value: 8200 },
    ],
  },
  {
    year: 2024, sport: 'mlb',
    index_values: [
      { month: '2024-03', value: 2200 }, { month: '2024-04', value: 2800 }, { month: '2024-05', value: 3100 },
      { month: '2024-06', value: 3800 }, { month: '2024-07', value: 4200 }, { month: '2024-08', value: 4800 },
      { month: '2024-09', value: 5100 }, { month: '2024-10', value: 5400 }, { month: '2024-11', value: 5200 },
      { month: '2024-12', value: 5500 }, { month: '2025-01', value: 5600 }, { month: '2025-02', value: 5800 },
    ],
  },
];

const DRAFT_POSITION_ROI_DATA: DraftPositionROI[] = [];
// Generate position ROI curves for NBA
for (let i = 1; i <= 30; i++) {
  let avgRoi: number;
  if (i === 1) avgRoi = 340;
  else if (i <= 3) avgRoi = 220 - (i - 2) * 30;
  else if (i <= 5) avgRoi = 185 - (i - 4) * 25;
  else if (i <= 10) avgRoi = 140 - (i - 6) * 12;
  else if (i <= 15) avgRoi = 85 - (i - 11) * 5;
  else if (i <= 20) avgRoi = 55 - (i - 16) * 4;
  else avgRoi = Math.max(8, 35 - (i - 21) * 3);
  DRAFT_POSITION_ROI_DATA.push({ position: i, avg_roi: avgRoi, sample_size: Math.max(5, 30 - i), sport: 'nba' });
}
// Generate position ROI curves for NFL
for (let i = 1; i <= 32; i++) {
  let avgRoi: number;
  if (i === 1) avgRoi = 280;
  else if (i <= 5) avgRoi = 200 - (i - 2) * 20;
  else if (i <= 10) avgRoi = 140 - (i - 6) * 10;
  else if (i <= 20) avgRoi = 90 - (i - 11) * 4;
  else avgRoi = Math.max(5, 50 - (i - 21) * 4);
  DRAFT_POSITION_ROI_DATA.push({ position: i, avg_roi: avgRoi, sample_size: Math.max(4, 28 - i), sport: 'nfl' });
}

// ─── Service Functions ───────────────────────────────────────

export function getRookieClassIndices(sport?: Sport): RookieClassIndex[] {
  if (sport) return ROOKIE_CLASS_INDICES.filter((r) => r.sport === sport);
  return ROOKIE_CLASS_INDICES;
}

export function getClassDetail(year: number, sport: Sport): RookieIndexEntry[] {
  return ROOKIE_ENTRIES.filter((e) => e.year === year && e.sport === sport)
    .sort((a, b) => b.total_market_cap - a.total_market_cap);
}

export function getClassPerformance(year: number, sport: Sport): HistoricalClassPerformance | undefined {
  return HISTORICAL_TIMELINE.find((h) => h.year === year && h.sport === sport);
}

export function compareClasses(yearA: number, yearB: number, sport: Sport): ClassComparison {
  const classA = ROOKIE_CLASS_INDICES.find((r) => r.year === yearA && r.sport === sport);
  const classB = ROOKIE_CLASS_INDICES.find((r) => r.year === yearB && r.sport === sport);
  const entriesA = ROOKIE_ENTRIES.filter((e) => e.year === yearA && e.sport === sport);
  const entriesB = ROOKIE_ENTRIES.filter((e) => e.year === yearB && e.sport === sport);
  const avgRoiA = entriesA.length > 0 ? Math.round(entriesA.reduce((s, e) => s + e.roi_since_draft, 0) / entriesA.length) : 0;
  const avgRoiB = entriesB.length > 0 ? Math.round(entriesB.reduce((s, e) => s + e.roi_since_draft, 0) / entriesB.length) : 0;
  return {
    year_a: yearA,
    year_b: yearB,
    sport,
    comparison_metrics: [
      { metric: 'Index Value', value_a: classA?.index_value || 0, value_b: classB?.index_value || 0, winner: (classA?.index_value || 0) > (classB?.index_value || 0) ? 'a' : (classA?.index_value || 0) < (classB?.index_value || 0) ? 'b' : 'tie' },
      { metric: 'Market Cap ($M)', value_a: Math.round((classA?.aggregate_market_cap || 0) / 1000000), value_b: Math.round((classB?.aggregate_market_cap || 0) / 1000000), winner: (classA?.aggregate_market_cap || 0) > (classB?.aggregate_market_cap || 0) ? 'a' : 'b' },
      { metric: 'Avg ROI %', value_a: avgRoiA, value_b: avgRoiB, winner: avgRoiA > avgRoiB ? 'a' : avgRoiA < avgRoiB ? 'b' : 'tie' },
      { metric: 'Cards Tracked', value_a: classA?.total_cards_tracked || 0, value_b: classB?.total_cards_tracked || 0, winner: (classA?.total_cards_tracked || 0) > (classB?.total_cards_tracked || 0) ? 'a' : 'b' },
      { metric: 'Top Performers', value_a: entriesA.filter((e) => e.roi_since_draft > 200).length, value_b: entriesB.filter((e) => e.roi_since_draft > 200).length, winner: entriesA.filter((e) => e.roi_since_draft > 200).length > entriesB.filter((e) => e.roi_since_draft > 200).length ? 'a' : 'b' },
    ],
  };
}

export function getDraftCapitalEfficiency(sport: Sport): DraftCapitalEfficiency[] {
  return DRAFT_CAPITAL_EFFICIENCY.filter((d) => d.sport === sport);
}

export function getPositionROI(sport: Sport): DraftPositionROI[] {
  return DRAFT_POSITION_ROI_DATA.filter((d) => d.sport === sport);
}

export function getPreDraftProjections(year: number, sport?: Sport): PreDraftProjection[] {
  let projections = PRE_DRAFT_PROJECTIONS;
  if (sport) projections = projections.filter((p) => p.sport === sport);
  return projections.sort((a, b) => a.projected_position - b.projected_position);
}

export function getTopROIRookies(year: number, sport: Sport): RookieIndexEntry[] {
  return ROOKIE_ENTRIES.filter((e) => e.year === year && e.sport === sport)
    .sort((a, b) => b.roi_since_draft - a.roi_since_draft)
    .slice(0, 10);
}

export function getClassComparison(years: number[], sport: Sport): RookieClassIndex[] {
  return ROOKIE_CLASS_INDICES.filter((r) => years.includes(r.year) && r.sport === sport);
}

export function getIndexTimeline(year: number, sport: Sport): { month: string; value: number }[] {
  const perf = HISTORICAL_TIMELINE.find((h) => h.year === year && h.sport === sport);
  return perf?.index_values || [];
}

export function getHistoricalClassRankings(sport: Sport): RookieClassIndex[] {
  return ROOKIE_CLASS_INDICES.filter((r) => r.sport === sport)
    .sort((a, b) => a.rank_all_time - b.rank_all_time);
}

export function getBestDraftPicks(sport: Sport, positionRange?: string): DraftCapitalEfficiency[] {
  let data = DRAFT_CAPITAL_EFFICIENCY.filter((d) => d.sport === sport);
  if (positionRange) data = data.filter((d) => d.position_range === positionRange);
  return data;
}

export function getClassCorrelation(yearA: number, yearB: number): number {
  // Simulated correlation between two class performances
  const diff = Math.abs(yearA - yearB);
  if (diff === 0) return 1.0;
  if (diff <= 2) return 0.72;
  if (diff <= 5) return 0.45;
  return 0.18;
}

export function getInvestableIndex(year: number, sport: Sport): InvestableIndex {
  const classData = ROOKIE_CLASS_INDICES.find((r) => r.year === year && r.sport === sport);
  const indexValue = classData?.index_value || 5000;
  const changePct = classData?.change_pct || 0;
  let buyRating: InvestableIndex['buy_rating'];
  if (changePct > 10) buyRating = 'strong_buy';
  else if (changePct > 5) buyRating = 'buy';
  else if (changePct > -2) buyRating = 'hold';
  else if (changePct > -8) buyRating = 'sell';
  else buyRating = 'strong_sell';
  return {
    year,
    sport,
    buy_rating: buyRating,
    current_value: indexValue,
    projected_value_12m: Math.round(indexValue * (1 + changePct / 100) * 1.05),
    volatility: Math.abs(changePct) > 8 ? 0.85 : Math.abs(changePct) > 4 ? 0.55 : 0.3,
    liquidity_score: classData ? Math.min(1, classData.total_cards_tracked / 4000) : 0.5,
  };
}
