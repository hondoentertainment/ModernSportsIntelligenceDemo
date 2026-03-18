// ---- Types ----

export type ProspectLevel =
  | 'high-school'
  | 'college'
  | 'minor-league'
  | 'international'
  | 'g-league'
  | 'ahl'
  | 'mls-next';

export type RiskRating = 'low' | 'medium' | 'high' | 'very-high';

export type MetricTrend = 'improving' | 'stable' | 'declining';

export type AlertType =
  | 'promotion'
  | 'injury'
  | 'stats-breakout'
  | 'draft-stock-rise'
  | 'draft-stock-fall';

export type Sport = 'NFL' | 'NBA' | 'NHL' | 'Soccer';

export interface ProspectMetric {
  name: string;
  value: number;
  percentile: number;
  trend: MetricTrend;
}

export interface CardValueProjection {
  floor: number;
  median: number;
  ceiling: number;
}

export interface ProspectProfile {
  id: string;
  name: string;
  sport: Sport;
  position: string;
  age: number;
  currentLevel: ProspectLevel;
  team: string;
  projectedDraftPosition: number;
  scoutGrade: number; // 20-80 scale
  cardValueProjection: CardValueProjection;
  comparablePlayer: string;
  riskRating: RiskRating;
  timeline: string;
  keyMetrics: ProspectMetric[];
}

export interface DraftClassProjection {
  sport: Sport;
  year: number;
  prospects: ProspectProfile[];
  totalProjectedCardMarketValue: number;
  topProspectValue: number;
  classStrength: number; // 1-10
}

export interface PipelineStage {
  stage: ProspectLevel;
  prospects: ProspectProfile[];
  avgAge: number;
  avgScoutGrade: number;
  promotionRate: number;
}

export interface ProspectComparable {
  playerId: string;
  name: string;
  similarity: number;
  careerOutcome: string;
  peakCardValue: number;
}

export interface ProspectComparison {
  prospectId: string;
  comparables: ProspectComparable[];
}

export interface WatchlistAlert {
  prospectId: string;
  alert: string;
  type: AlertType;
  date: string;
  significance: number; // 1-10
}

// ---- Mock Data ----

const PROSPECTS: ProspectProfile[] = [
  // ===== NFL PROSPECTS (College) =====
  {
    id: 'nfl-001',
    name: 'Carson Beck',
    sport: 'NFL',
    position: 'QB',
    age: 22,
    currentLevel: 'college',
    team: 'Georgia Bulldogs',
    projectedDraftPosition: 1,
    scoutGrade: 72,
    cardValueProjection: { floor: 120, median: 450, ceiling: 1200 },
    comparablePlayer: 'Trevor Lawrence',
    riskRating: 'low',
    timeline: '2026 NFL Draft - Round 1',
    keyMetrics: [
      { name: 'Arm Strength', value: 62, percentile: 92, trend: 'stable' },
      { name: 'Accuracy', value: 68.4, percentile: 88, trend: 'improving' },
      { name: 'Pocket Presence', value: 74, percentile: 95, trend: 'improving' },
      { name: 'Decision Making', value: 70, percentile: 90, trend: 'stable' },
    ],
  },
  {
    id: 'nfl-002',
    name: 'Tetairoa McMillan',
    sport: 'NFL',
    position: 'WR',
    age: 21,
    currentLevel: 'college',
    team: 'Arizona Wildcats',
    projectedDraftPosition: 4,
    scoutGrade: 70,
    cardValueProjection: { floor: 80, median: 300, ceiling: 900 },
    comparablePlayer: 'A.J. Green',
    riskRating: 'low',
    timeline: '2026 NFL Draft - Top 10',
    keyMetrics: [
      { name: 'Route Running', value: 72, percentile: 94, trend: 'improving' },
      { name: 'Catch Radius', value: 78, percentile: 98, trend: 'stable' },
      { name: '40-Yard Dash', value: 4.38, percentile: 90, trend: 'stable' },
      { name: 'Contested Catches', value: 68, percentile: 92, trend: 'improving' },
    ],
  },
  {
    id: 'nfl-003',
    name: 'Jalen Milroe',
    sport: 'NFL',
    position: 'QB',
    age: 22,
    currentLevel: 'college',
    team: 'Alabama Crimson Tide',
    projectedDraftPosition: 8,
    scoutGrade: 65,
    cardValueProjection: { floor: 60, median: 220, ceiling: 750 },
    comparablePlayer: 'Jalen Hurts',
    riskRating: 'medium',
    timeline: '2026 NFL Draft - Top 15',
    keyMetrics: [
      { name: 'Arm Strength', value: 66, percentile: 95, trend: 'stable' },
      { name: 'Rushing Ability', value: 72, percentile: 98, trend: 'stable' },
      { name: 'Accuracy', value: 58.2, percentile: 55, trend: 'improving' },
      { name: 'Deep Ball', value: 60, percentile: 72, trend: 'improving' },
    ],
  },
  {
    id: 'nfl-004',
    name: 'Travis Hunter',
    sport: 'NFL',
    position: 'CB/WR',
    age: 21,
    currentLevel: 'college',
    team: 'Colorado Buffaloes',
    projectedDraftPosition: 2,
    scoutGrade: 75,
    cardValueProjection: { floor: 150, median: 550, ceiling: 1500 },
    comparablePlayer: 'Charles Woodson',
    riskRating: 'low',
    timeline: '2026 NFL Draft - Top 3',
    keyMetrics: [
      { name: 'Coverage', value: 76, percentile: 97, trend: 'stable' },
      { name: 'Ball Skills', value: 78, percentile: 99, trend: 'improving' },
      { name: 'Route Running', value: 66, percentile: 85, trend: 'improving' },
      { name: 'Versatility', value: 80, percentile: 99, trend: 'stable' },
    ],
  },
  {
    id: 'nfl-005',
    name: 'Mason Graham',
    sport: 'NFL',
    position: 'DT',
    age: 21,
    currentLevel: 'college',
    team: 'Michigan Wolverines',
    projectedDraftPosition: 5,
    scoutGrade: 68,
    cardValueProjection: { floor: 40, median: 150, ceiling: 400 },
    comparablePlayer: 'Chris Jones',
    riskRating: 'low',
    timeline: '2026 NFL Draft - Top 10',
    keyMetrics: [
      { name: 'Pass Rush Win Rate', value: 24.5, percentile: 96, trend: 'improving' },
      { name: 'Run Stop Rate', value: 72, percentile: 94, trend: 'stable' },
      { name: 'Strength', value: 74, percentile: 92, trend: 'stable' },
      { name: 'Explosiveness', value: 68, percentile: 88, trend: 'stable' },
    ],
  },
  {
    id: 'nfl-006',
    name: 'Will Campbell',
    sport: 'NFL',
    position: 'OT',
    age: 21,
    currentLevel: 'college',
    team: 'LSU Tigers',
    projectedDraftPosition: 6,
    scoutGrade: 67,
    cardValueProjection: { floor: 30, median: 100, ceiling: 300 },
    comparablePlayer: 'Tyron Smith',
    riskRating: 'low',
    timeline: '2026 NFL Draft - Top 10',
    keyMetrics: [
      { name: 'Pass Block Win Rate', value: 94.2, percentile: 97, trend: 'stable' },
      { name: 'Run Blocking', value: 72, percentile: 90, trend: 'improving' },
      { name: 'Footwork', value: 70, percentile: 92, trend: 'improving' },
      { name: 'Anchor Strength', value: 68, percentile: 88, trend: 'stable' },
    ],
  },
  {
    id: 'nfl-007',
    name: 'Mykel Williams',
    sport: 'NFL',
    position: 'EDGE',
    age: 21,
    currentLevel: 'college',
    team: 'Georgia Bulldogs',
    projectedDraftPosition: 7,
    scoutGrade: 66,
    cardValueProjection: { floor: 45, median: 180, ceiling: 500 },
    comparablePlayer: 'Myles Garrett',
    riskRating: 'medium',
    timeline: '2026 NFL Draft - Top 12',
    keyMetrics: [
      { name: 'Bend', value: 72, percentile: 94, trend: 'improving' },
      { name: 'Power Rush', value: 68, percentile: 90, trend: 'stable' },
      { name: 'Sack Production', value: 11.5, percentile: 88, trend: 'improving' },
      { name: 'Run Defense', value: 62, percentile: 78, trend: 'stable' },
    ],
  },
  {
    id: 'nfl-008',
    name: 'Kelvin Banks Jr.',
    sport: 'NFL',
    position: 'OT',
    age: 21,
    currentLevel: 'college',
    team: 'Texas Longhorns',
    projectedDraftPosition: 11,
    scoutGrade: 64,
    cardValueProjection: { floor: 25, median: 85, ceiling: 250 },
    comparablePlayer: 'Trent Williams',
    riskRating: 'medium',
    timeline: '2026 NFL Draft - Mid 1st Round',
    keyMetrics: [
      { name: 'Pass Protection', value: 70, percentile: 91, trend: 'stable' },
      { name: 'Athleticism', value: 74, percentile: 95, trend: 'stable' },
      { name: 'Run Blocking', value: 66, percentile: 84, trend: 'improving' },
      { name: 'Technique', value: 64, percentile: 80, trend: 'improving' },
    ],
  },
  {
    id: 'nfl-009',
    name: 'Luther Burden III',
    sport: 'NFL',
    position: 'WR',
    age: 21,
    currentLevel: 'college',
    team: 'Missouri Tigers',
    projectedDraftPosition: 12,
    scoutGrade: 64,
    cardValueProjection: { floor: 50, median: 200, ceiling: 600 },
    comparablePlayer: 'Stefon Diggs',
    riskRating: 'medium',
    timeline: '2026 NFL Draft - Mid 1st Round',
    keyMetrics: [
      { name: 'Separation', value: 70, percentile: 90, trend: 'improving' },
      { name: 'YAC Ability', value: 74, percentile: 95, trend: 'stable' },
      { name: 'Speed', value: 4.42, percentile: 86, trend: 'stable' },
      { name: 'Hands', value: 66, percentile: 82, trend: 'improving' },
    ],
  },
  {
    id: 'nfl-010',
    name: 'Derrick Harmon',
    sport: 'NFL',
    position: 'DT',
    age: 22,
    currentLevel: 'college',
    team: 'Oregon Ducks',
    projectedDraftPosition: 14,
    scoutGrade: 62,
    cardValueProjection: { floor: 20, median: 80, ceiling: 250 },
    comparablePlayer: 'Javon Hargrave',
    riskRating: 'medium',
    timeline: '2026 NFL Draft - Mid 1st Round',
    keyMetrics: [
      { name: 'Interior Pressure', value: 66, percentile: 88, trend: 'improving' },
      { name: 'Anchor', value: 68, percentile: 86, trend: 'stable' },
      { name: 'Motor', value: 72, percentile: 92, trend: 'stable' },
      { name: 'Versatility', value: 60, percentile: 75, trend: 'improving' },
    ],
  },

  // ===== NBA PROSPECTS =====
  {
    id: 'nba-001',
    name: 'Cooper Flagg',
    sport: 'NBA',
    position: 'SF/PF',
    age: 18,
    currentLevel: 'college',
    team: 'Duke Blue Devils',
    projectedDraftPosition: 1,
    scoutGrade: 78,
    cardValueProjection: { floor: 200, median: 800, ceiling: 3000 },
    comparablePlayer: 'LeBron James',
    riskRating: 'low',
    timeline: '2025 NBA Draft - #1 Overall',
    keyMetrics: [
      { name: 'Basketball IQ', value: 80, percentile: 99, trend: 'stable' },
      { name: 'Defensive Versatility', value: 76, percentile: 97, trend: 'improving' },
      { name: 'Playmaking', value: 72, percentile: 94, trend: 'improving' },
      { name: 'Shooting', value: 58, percentile: 62, trend: 'improving' },
    ],
  },
  {
    id: 'nba-002',
    name: 'Dylan Harper',
    sport: 'NBA',
    position: 'SG',
    age: 19,
    currentLevel: 'college',
    team: 'Rutgers Scarlet Knights',
    projectedDraftPosition: 3,
    scoutGrade: 68,
    cardValueProjection: { floor: 80, median: 350, ceiling: 1100 },
    comparablePlayer: 'Dwyane Wade',
    riskRating: 'medium',
    timeline: '2025 NBA Draft - Top 5',
    keyMetrics: [
      { name: 'Scoring', value: 72, percentile: 94, trend: 'improving' },
      { name: 'Shot Creation', value: 70, percentile: 92, trend: 'improving' },
      { name: 'Athleticism', value: 68, percentile: 88, trend: 'stable' },
      { name: 'Defense', value: 56, percentile: 58, trend: 'improving' },
    ],
  },
  {
    id: 'nba-003',
    name: 'Ace Bailey',
    sport: 'NBA',
    position: 'SF',
    age: 19,
    currentLevel: 'college',
    team: 'Rutgers Scarlet Knights',
    projectedDraftPosition: 2,
    scoutGrade: 70,
    cardValueProjection: { floor: 100, median: 400, ceiling: 1400 },
    comparablePlayer: 'Paul George',
    riskRating: 'medium',
    timeline: '2025 NBA Draft - Top 3',
    keyMetrics: [
      { name: 'Wingspan', value: 7.1, percentile: 97, trend: 'stable' },
      { name: 'Shooting', value: 66, percentile: 85, trend: 'improving' },
      { name: 'Defensive Upside', value: 70, percentile: 90, trend: 'improving' },
      { name: 'Ball Handling', value: 58, percentile: 64, trend: 'improving' },
    ],
  },
  {
    id: 'nba-004',
    name: 'VJ Edgecombe',
    sport: 'NBA',
    position: 'SG',
    age: 19,
    currentLevel: 'college',
    team: 'Baylor Bears',
    projectedDraftPosition: 5,
    scoutGrade: 66,
    cardValueProjection: { floor: 60, median: 250, ceiling: 800 },
    comparablePlayer: 'Jalen Green',
    riskRating: 'medium',
    timeline: '2025 NBA Draft - Top 8',
    keyMetrics: [
      { name: 'Explosiveness', value: 78, percentile: 99, trend: 'stable' },
      { name: 'Finishing', value: 70, percentile: 92, trend: 'improving' },
      { name: 'Shooting', value: 54, percentile: 50, trend: 'improving' },
      { name: 'Defense', value: 62, percentile: 74, trend: 'stable' },
    ],
  },
  {
    id: 'nba-005',
    name: 'Nolan Traore',
    sport: 'NBA',
    position: 'PG',
    age: 19,
    currentLevel: 'international',
    team: 'Saint-Quentin BBL (France)',
    projectedDraftPosition: 6,
    scoutGrade: 65,
    cardValueProjection: { floor: 50, median: 220, ceiling: 700 },
    comparablePlayer: 'Tony Parker',
    riskRating: 'high',
    timeline: '2025 NBA Draft - Top 10',
    keyMetrics: [
      { name: 'Speed', value: 78, percentile: 99, trend: 'stable' },
      { name: 'Court Vision', value: 72, percentile: 94, trend: 'improving' },
      { name: 'Shooting', value: 50, percentile: 42, trend: 'improving' },
      { name: 'Finishing', value: 64, percentile: 78, trend: 'improving' },
    ],
  },
  {
    id: 'nba-006',
    name: 'Egor Demin',
    sport: 'NBA',
    position: 'PG/SG',
    age: 19,
    currentLevel: 'college',
    team: 'BYU Cougars',
    projectedDraftPosition: 8,
    scoutGrade: 63,
    cardValueProjection: { floor: 40, median: 180, ceiling: 600 },
    comparablePlayer: 'Luka Doncic',
    riskRating: 'medium',
    timeline: '2025 NBA Draft - Top 12',
    keyMetrics: [
      { name: 'Playmaking', value: 72, percentile: 94, trend: 'stable' },
      { name: 'Size (6\'9")', value: 76, percentile: 96, trend: 'stable' },
      { name: 'Shooting', value: 60, percentile: 68, trend: 'improving' },
      { name: 'Athleticism', value: 54, percentile: 52, trend: 'stable' },
    ],
  },
  {
    id: 'nba-007',
    name: 'Khaman Maluach',
    sport: 'NBA',
    position: 'C',
    age: 18,
    currentLevel: 'college',
    team: 'Duke Blue Devils',
    projectedDraftPosition: 7,
    scoutGrade: 64,
    cardValueProjection: { floor: 45, median: 190, ceiling: 650 },
    comparablePlayer: 'Rudy Gobert',
    riskRating: 'medium',
    timeline: '2025 NBA Draft - Top 10',
    keyMetrics: [
      { name: 'Rim Protection', value: 74, percentile: 96, trend: 'improving' },
      { name: 'Length (7\'2")', value: 78, percentile: 98, trend: 'stable' },
      { name: 'Mobility', value: 60, percentile: 70, trend: 'improving' },
      { name: 'Offensive Game', value: 52, percentile: 48, trend: 'improving' },
    ],
  },
  {
    id: 'nba-008',
    name: 'Tre Johnson',
    sport: 'NBA',
    position: 'SG',
    age: 19,
    currentLevel: 'college',
    team: 'Texas Longhorns',
    projectedDraftPosition: 4,
    scoutGrade: 67,
    cardValueProjection: { floor: 70, median: 280, ceiling: 950 },
    comparablePlayer: 'Devin Booker',
    riskRating: 'low',
    timeline: '2025 NBA Draft - Top 5',
    keyMetrics: [
      { name: 'Scoring', value: 74, percentile: 96, trend: 'improving' },
      { name: 'Shot Making', value: 72, percentile: 94, trend: 'improving' },
      { name: 'Off-Ball Movement', value: 66, percentile: 84, trend: 'stable' },
      { name: 'Defensive Effort', value: 58, percentile: 62, trend: 'improving' },
    ],
  },
  {
    id: 'nba-009',
    name: 'Kasparas Jakucionis',
    sport: 'NBA',
    position: 'PG',
    age: 19,
    currentLevel: 'college',
    team: 'Illinois Fighting Illini',
    projectedDraftPosition: 9,
    scoutGrade: 62,
    cardValueProjection: { floor: 35, median: 150, ceiling: 500 },
    comparablePlayer: 'Ricky Rubio',
    riskRating: 'medium',
    timeline: '2025 NBA Draft - Lottery',
    keyMetrics: [
      { name: 'Court Vision', value: 74, percentile: 96, trend: 'stable' },
      { name: 'Size (6\'6")', value: 68, percentile: 88, trend: 'stable' },
      { name: 'Shooting', value: 56, percentile: 56, trend: 'improving' },
      { name: 'Ball Handling', value: 64, percentile: 80, trend: 'stable' },
    ],
  },
  {
    id: 'nba-010',
    name: 'Liam McNeeley',
    sport: 'NBA',
    position: 'SF',
    age: 19,
    currentLevel: 'college',
    team: 'UConn Huskies',
    projectedDraftPosition: 10,
    scoutGrade: 61,
    cardValueProjection: { floor: 30, median: 130, ceiling: 450 },
    comparablePlayer: 'Khris Middleton',
    riskRating: 'medium',
    timeline: '2025 NBA Draft - Lottery',
    keyMetrics: [
      { name: 'Shooting', value: 68, percentile: 90, trend: 'improving' },
      { name: 'Length', value: 70, percentile: 92, trend: 'stable' },
      { name: 'Basketball IQ', value: 64, percentile: 80, trend: 'improving' },
      { name: 'Athleticism', value: 58, percentile: 62, trend: 'stable' },
    ],
  },
  {
    id: 'nba-011',
    name: 'Hugo Gonzalez',
    sport: 'NBA',
    position: 'PG',
    age: 18,
    currentLevel: 'g-league',
    team: 'G League Ignite',
    projectedDraftPosition: 15,
    scoutGrade: 58,
    cardValueProjection: { floor: 20, median: 90, ceiling: 350 },
    comparablePlayer: 'Jose Alvarado',
    riskRating: 'high',
    timeline: '2025 NBA Draft - Mid 1st Round',
    keyMetrics: [
      { name: 'Scoring', value: 64, percentile: 78, trend: 'improving' },
      { name: 'Quickness', value: 70, percentile: 92, trend: 'stable' },
      { name: 'Shooting', value: 58, percentile: 62, trend: 'improving' },
      { name: 'Playmaking', value: 60, percentile: 70, trend: 'stable' },
    ],
  },

  // ===== NHL PROSPECTS =====
  {
    id: 'nhl-001',
    name: 'James Hagens',
    sport: 'NHL',
    position: 'C',
    age: 18,
    currentLevel: 'college',
    team: 'Boston College Eagles',
    projectedDraftPosition: 1,
    scoutGrade: 75,
    cardValueProjection: { floor: 100, median: 400, ceiling: 1200 },
    comparablePlayer: 'Jack Hughes',
    riskRating: 'low',
    timeline: '2025 NHL Draft - #1 Overall',
    keyMetrics: [
      { name: 'Skating', value: 74, percentile: 96, trend: 'stable' },
      { name: 'Hockey IQ', value: 78, percentile: 98, trend: 'improving' },
      { name: 'Playmaking', value: 76, percentile: 97, trend: 'improving' },
      { name: 'Shot', value: 66, percentile: 84, trend: 'improving' },
    ],
  },
  {
    id: 'nhl-002',
    name: 'Porter Martone',
    sport: 'NHL',
    position: 'RW',
    age: 18,
    currentLevel: 'minor-league',
    team: 'Brampton Steelheads (OHL)',
    projectedDraftPosition: 2,
    scoutGrade: 72,
    cardValueProjection: { floor: 80, median: 320, ceiling: 900 },
    comparablePlayer: 'Alex Ovechkin',
    riskRating: 'low',
    timeline: '2025 NHL Draft - Top 3',
    keyMetrics: [
      { name: 'Shot Power', value: 76, percentile: 98, trend: 'stable' },
      { name: 'Physicality', value: 74, percentile: 96, trend: 'stable' },
      { name: 'Skating', value: 64, percentile: 78, trend: 'improving' },
      { name: 'Compete Level', value: 78, percentile: 98, trend: 'stable' },
    ],
  },
  {
    id: 'nhl-003',
    name: 'Ivan Ryabkin',
    sport: 'NHL',
    position: 'C',
    age: 18,
    currentLevel: 'international',
    team: 'Yaroslavl Lokomotiv (KHL)',
    projectedDraftPosition: 3,
    scoutGrade: 70,
    cardValueProjection: { floor: 60, median: 250, ceiling: 800 },
    comparablePlayer: 'Evgeni Malkin',
    riskRating: 'high',
    timeline: '2025 NHL Draft - Top 5',
    keyMetrics: [
      { name: 'Offensive Vision', value: 74, percentile: 96, trend: 'improving' },
      { name: 'Size (6\'3")', value: 72, percentile: 92, trend: 'stable' },
      { name: 'Skating', value: 66, percentile: 84, trend: 'improving' },
      { name: 'Defensive Play', value: 56, percentile: 56, trend: 'improving' },
    ],
  },
  {
    id: 'nhl-004',
    name: 'Matthew Schaefer',
    sport: 'NHL',
    position: 'D',
    age: 18,
    currentLevel: 'minor-league',
    team: 'Erie Otters (OHL)',
    projectedDraftPosition: 4,
    scoutGrade: 69,
    cardValueProjection: { floor: 50, median: 200, ceiling: 650 },
    comparablePlayer: 'Cale Makar',
    riskRating: 'medium',
    timeline: '2025 NHL Draft - Top 5',
    keyMetrics: [
      { name: 'Skating', value: 76, percentile: 98, trend: 'stable' },
      { name: 'Offensive D', value: 70, percentile: 92, trend: 'improving' },
      { name: 'Puck Moving', value: 72, percentile: 94, trend: 'improving' },
      { name: 'Physical Play', value: 62, percentile: 74, trend: 'improving' },
    ],
  },
  {
    id: 'nhl-005',
    name: 'Roger McQueen',
    sport: 'NHL',
    position: 'C',
    age: 18,
    currentLevel: 'minor-league',
    team: 'Brandon Wheat Kings (WHL)',
    projectedDraftPosition: 5,
    scoutGrade: 67,
    cardValueProjection: { floor: 40, median: 170, ceiling: 550 },
    comparablePlayer: 'Anze Kopitar',
    riskRating: 'medium',
    timeline: '2025 NHL Draft - Top 8',
    keyMetrics: [
      { name: 'Size (6\'4")', value: 74, percentile: 94, trend: 'stable' },
      { name: 'Two-Way Play', value: 68, percentile: 88, trend: 'improving' },
      { name: 'Puck Skills', value: 66, percentile: 84, trend: 'improving' },
      { name: 'Compete Level', value: 72, percentile: 94, trend: 'stable' },
    ],
  },
  {
    id: 'nhl-006',
    name: 'Caleb Desnoyers',
    sport: 'NHL',
    position: 'C',
    age: 18,
    currentLevel: 'minor-league',
    team: 'Moncton Wildcats (QMJHL)',
    projectedDraftPosition: 6,
    scoutGrade: 65,
    cardValueProjection: { floor: 35, median: 140, ceiling: 450 },
    comparablePlayer: 'Patrice Bergeron',
    riskRating: 'medium',
    timeline: '2025 NHL Draft - Top 10',
    keyMetrics: [
      { name: 'Two-Way Play', value: 72, percentile: 94, trend: 'stable' },
      { name: 'Hockey IQ', value: 70, percentile: 92, trend: 'improving' },
      { name: 'Faceoffs', value: 66, percentile: 84, trend: 'stable' },
      { name: 'Skating', value: 64, percentile: 78, trend: 'improving' },
    ],
  },
  {
    id: 'nhl-007',
    name: 'Nikita Artamonov',
    sport: 'NHL',
    position: 'LW',
    age: 18,
    currentLevel: 'international',
    team: 'SKA St. Petersburg (KHL)',
    projectedDraftPosition: 8,
    scoutGrade: 63,
    cardValueProjection: { floor: 30, median: 120, ceiling: 400 },
    comparablePlayer: 'Artemi Panarin',
    riskRating: 'very-high',
    timeline: '2025 NHL Draft - Top 12',
    keyMetrics: [
      { name: 'Offensive Skill', value: 72, percentile: 94, trend: 'improving' },
      { name: 'Creativity', value: 70, percentile: 92, trend: 'improving' },
      { name: 'Skating', value: 62, percentile: 74, trend: 'improving' },
      { name: 'Physicality', value: 48, percentile: 38, trend: 'stable' },
    ],
  },
  {
    id: 'nhl-008',
    name: 'Jackson Smith',
    sport: 'NHL',
    position: 'D',
    age: 18,
    currentLevel: 'minor-league',
    team: 'Tri-City Americans (WHL)',
    projectedDraftPosition: 9,
    scoutGrade: 62,
    cardValueProjection: { floor: 25, median: 100, ceiling: 350 },
    comparablePlayer: 'Seth Jones',
    riskRating: 'medium',
    timeline: '2025 NHL Draft - Top 12',
    keyMetrics: [
      { name: 'Size (6\'4")', value: 74, percentile: 94, trend: 'stable' },
      { name: 'Defensive Play', value: 68, percentile: 88, trend: 'stable' },
      { name: 'Puck Moving', value: 64, percentile: 78, trend: 'improving' },
      { name: 'Physicality', value: 70, percentile: 92, trend: 'stable' },
    ],
  },
  {
    id: 'nhl-009',
    name: 'Jakub Stancl',
    sport: 'NHL',
    position: 'C/LW',
    age: 18,
    currentLevel: 'minor-league',
    team: 'Guelph Storm (OHL)',
    projectedDraftPosition: 10,
    scoutGrade: 61,
    cardValueProjection: { floor: 20, median: 85, ceiling: 300 },
    comparablePlayer: 'David Pastrnak',
    riskRating: 'medium',
    timeline: '2025 NHL Draft - Lottery',
    keyMetrics: [
      { name: 'Shot', value: 72, percentile: 94, trend: 'improving' },
      { name: 'Release', value: 70, percentile: 92, trend: 'stable' },
      { name: 'Skating', value: 60, percentile: 68, trend: 'improving' },
      { name: 'Compete Level', value: 66, percentile: 84, trend: 'stable' },
    ],
  },
  {
    id: 'nhl-010',
    name: 'Lukas Fischer',
    sport: 'NHL',
    position: 'D',
    age: 18,
    currentLevel: 'international',
    team: 'EV Zug (Swiss NL)',
    projectedDraftPosition: 12,
    scoutGrade: 60,
    cardValueProjection: { floor: 20, median: 75, ceiling: 250 },
    comparablePlayer: 'Roman Josi',
    riskRating: 'high',
    timeline: '2025 NHL Draft - Mid 1st Round',
    keyMetrics: [
      { name: 'Skating', value: 70, percentile: 92, trend: 'stable' },
      { name: 'Offensive D', value: 66, percentile: 84, trend: 'improving' },
      { name: 'Gap Control', value: 64, percentile: 78, trend: 'stable' },
      { name: 'Poise', value: 68, percentile: 88, trend: 'improving' },
    ],
  },

  // ===== SOCCER PROSPECTS =====
  {
    id: 'soc-001',
    name: 'Cavan Sullivan',
    sport: 'Soccer',
    position: 'AM/CM',
    age: 15,
    currentLevel: 'mls-next',
    team: 'Philadelphia Union II',
    projectedDraftPosition: 1,
    scoutGrade: 72,
    cardValueProjection: { floor: 80, median: 350, ceiling: 1500 },
    comparablePlayer: 'Christian Pulisic',
    riskRating: 'high',
    timeline: 'MLS first-team 2025, Europe 2027-28',
    keyMetrics: [
      { name: 'Technical Ability', value: 76, percentile: 98, trend: 'improving' },
      { name: 'Vision', value: 72, percentile: 94, trend: 'improving' },
      { name: 'Dribbling', value: 74, percentile: 96, trend: 'improving' },
      { name: 'Physicality', value: 48, percentile: 34, trend: 'improving' },
    ],
  },
  {
    id: 'soc-002',
    name: 'Pedro Soma',
    sport: 'Soccer',
    position: 'CF',
    age: 17,
    currentLevel: 'mls-next',
    team: 'New York Red Bulls II',
    projectedDraftPosition: 2,
    scoutGrade: 66,
    cardValueProjection: { floor: 40, median: 180, ceiling: 700 },
    comparablePlayer: 'Jozy Altidore',
    riskRating: 'medium',
    timeline: 'MLS first-team 2025, Europe 2027',
    keyMetrics: [
      { name: 'Finishing', value: 70, percentile: 92, trend: 'improving' },
      { name: 'Movement', value: 68, percentile: 88, trend: 'improving' },
      { name: 'Strength', value: 64, percentile: 78, trend: 'improving' },
      { name: 'Link-up Play', value: 62, percentile: 74, trend: 'stable' },
    ],
  },
  {
    id: 'soc-003',
    name: 'Bajung Darboe',
    sport: 'Soccer',
    position: 'CB',
    age: 17,
    currentLevel: 'international',
    team: 'AS Roma Primavera (Italy)',
    projectedDraftPosition: 3,
    scoutGrade: 65,
    cardValueProjection: { floor: 30, median: 150, ceiling: 600 },
    comparablePlayer: 'Kalidou Koulibaly',
    riskRating: 'high',
    timeline: 'Serie A debut 2025-26, USMNT 2026',
    keyMetrics: [
      { name: 'Defending', value: 70, percentile: 92, trend: 'improving' },
      { name: 'Aerial Ability', value: 72, percentile: 94, trend: 'stable' },
      { name: 'Passing', value: 64, percentile: 78, trend: 'improving' },
      { name: 'Recovery Speed', value: 68, percentile: 88, trend: 'stable' },
    ],
  },
  {
    id: 'soc-004',
    name: 'Nimfasha Berchimas',
    sport: 'Soccer',
    position: 'AM',
    age: 17,
    currentLevel: 'mls-next',
    team: 'FC Dallas Academy',
    projectedDraftPosition: 4,
    scoutGrade: 64,
    cardValueProjection: { floor: 30, median: 130, ceiling: 550 },
    comparablePlayer: 'Weston McKennie',
    riskRating: 'medium',
    timeline: 'MLS first-team 2025, Europe 2026-27',
    keyMetrics: [
      { name: 'Athleticism', value: 74, percentile: 96, trend: 'stable' },
      { name: 'Dribbling', value: 68, percentile: 88, trend: 'improving' },
      { name: 'Shooting', value: 62, percentile: 74, trend: 'improving' },
      { name: 'Defensive Work', value: 60, percentile: 70, trend: 'stable' },
    ],
  },
  {
    id: 'soc-005',
    name: 'Lamine Yamal Jr.',
    sport: 'Soccer',
    position: 'RW',
    age: 16,
    currentLevel: 'international',
    team: 'FC Barcelona Juvenil A',
    projectedDraftPosition: 1,
    scoutGrade: 70,
    cardValueProjection: { floor: 60, median: 280, ceiling: 1200 },
    comparablePlayer: 'Lionel Messi',
    riskRating: 'high',
    timeline: 'La Masia graduate 2026-27',
    keyMetrics: [
      { name: 'Dribbling', value: 76, percentile: 98, trend: 'improving' },
      { name: 'Pace', value: 72, percentile: 94, trend: 'improving' },
      { name: 'Creativity', value: 70, percentile: 92, trend: 'improving' },
      { name: 'Physicality', value: 44, percentile: 28, trend: 'improving' },
    ],
  },
  {
    id: 'soc-006',
    name: 'Tyler Dibling',
    sport: 'Soccer',
    position: 'RW',
    age: 18,
    currentLevel: 'international',
    team: 'Southampton FC (England)',
    projectedDraftPosition: 2,
    scoutGrade: 64,
    cardValueProjection: { floor: 40, median: 160, ceiling: 500 },
    comparablePlayer: 'Bukayo Saka',
    riskRating: 'medium',
    timeline: 'Premier League regular 2025-26',
    keyMetrics: [
      { name: 'Dribbling', value: 70, percentile: 92, trend: 'improving' },
      { name: 'Work Rate', value: 72, percentile: 94, trend: 'stable' },
      { name: 'Finishing', value: 60, percentile: 68, trend: 'improving' },
      { name: 'Crossing', value: 64, percentile: 78, trend: 'improving' },
    ],
  },
  {
    id: 'soc-007',
    name: 'Mateo Messi',
    sport: 'Soccer',
    position: 'CM',
    age: 16,
    currentLevel: 'mls-next',
    team: 'Inter Miami Academy',
    projectedDraftPosition: 5,
    scoutGrade: 55,
    cardValueProjection: { floor: 100, median: 250, ceiling: 2000 },
    comparablePlayer: 'Lionel Messi',
    riskRating: 'very-high',
    timeline: 'MLS Next Pro 2026, huge name-value premium',
    keyMetrics: [
      { name: 'Technical Skill', value: 62, percentile: 74, trend: 'improving' },
      { name: 'Vision', value: 60, percentile: 70, trend: 'improving' },
      { name: 'Dribbling', value: 64, percentile: 78, trend: 'improving' },
      { name: 'Physicality', value: 42, percentile: 24, trend: 'improving' },
    ],
  },
  {
    id: 'soc-008',
    name: 'Diego Garcia',
    sport: 'Soccer',
    position: 'LW',
    age: 17,
    currentLevel: 'international',
    team: 'Real Madrid Juvenil (Spain)',
    projectedDraftPosition: 3,
    scoutGrade: 63,
    cardValueProjection: { floor: 35, median: 140, ceiling: 500 },
    comparablePlayer: 'Vinicius Jr.',
    riskRating: 'high',
    timeline: 'Castilla promotion 2025-26',
    keyMetrics: [
      { name: 'Pace', value: 76, percentile: 98, trend: 'stable' },
      { name: 'Dribbling', value: 68, percentile: 88, trend: 'improving' },
      { name: 'Finishing', value: 56, percentile: 56, trend: 'improving' },
      { name: 'Decision Making', value: 54, percentile: 50, trend: 'improving' },
    ],
  },
  {
    id: 'soc-009',
    name: 'Tavian Baker',
    sport: 'Soccer',
    position: 'GK',
    age: 17,
    currentLevel: 'mls-next',
    team: 'Atlanta United Academy',
    projectedDraftPosition: 6,
    scoutGrade: 60,
    cardValueProjection: { floor: 15, median: 60, ceiling: 250 },
    comparablePlayer: 'Zack Steffen',
    riskRating: 'very-high',
    timeline: 'MLS first-team backup 2026',
    keyMetrics: [
      { name: 'Shot Stopping', value: 66, percentile: 84, trend: 'improving' },
      { name: 'Distribution', value: 68, percentile: 88, trend: 'improving' },
      { name: 'Command', value: 58, percentile: 62, trend: 'improving' },
      { name: 'Reflexes', value: 70, percentile: 92, trend: 'stable' },
    ],
  },
];

const WATCHLIST_ALERTS: WatchlistAlert[] = [
  {
    prospectId: 'nba-001',
    alert: 'Cooper Flagg drops 34 points in ACC tournament, solidifies #1 pick status',
    type: 'stats-breakout',
    date: '2025-03-12',
    significance: 9,
  },
  {
    prospectId: 'nfl-004',
    alert: 'Travis Hunter officially declares for 2025 NFL Draft, confirms two-way play intent',
    type: 'draft-stock-rise',
    date: '2025-03-10',
    significance: 10,
  },
  {
    prospectId: 'nhl-001',
    alert: 'James Hagens named Hockey East Player of the Year, 62 points in 38 games',
    type: 'stats-breakout',
    date: '2025-03-08',
    significance: 8,
  },
  {
    prospectId: 'soc-001',
    alert: 'Cavan Sullivan called up to Philadelphia Union first team for CONCACAF Champions Cup',
    type: 'promotion',
    date: '2025-03-07',
    significance: 9,
  },
  {
    prospectId: 'nfl-003',
    alert: 'Jalen Milroe struggles at NFL Combine throwing drills, completion rate concerns',
    type: 'draft-stock-fall',
    date: '2025-03-05',
    significance: 7,
  },
  {
    prospectId: 'nba-005',
    alert: 'Nolan Traore suffers minor ankle sprain, expected to miss 2 weeks',
    type: 'injury',
    date: '2025-03-04',
    significance: 6,
  },
  {
    prospectId: 'nhl-003',
    alert: 'Ivan Ryabkin scores hat trick in KHL playoff debut, stock surges',
    type: 'stats-breakout',
    date: '2025-03-03',
    significance: 8,
  },
  {
    prospectId: 'nfl-002',
    alert: 'Tetairoa McMillan runs 4.38 40-yard dash at Combine, confirms elite speed',
    type: 'draft-stock-rise',
    date: '2025-03-01',
    significance: 7,
  },
  {
    prospectId: 'nba-004',
    alert: 'VJ Edgecombe erupts for 38 points vs. Kansas, highest-scoring game of season',
    type: 'stats-breakout',
    date: '2025-02-28',
    significance: 8,
  },
  {
    prospectId: 'soc-007',
    alert: 'Mateo Messi featured in MLS Next showcase, global media attention spikes card speculation',
    type: 'stats-breakout',
    date: '2025-02-25',
    significance: 7,
  },
  {
    prospectId: 'nhl-007',
    alert: 'Nikita Artamonov contract situation with SKA uncertain, NHL transfer risk elevated',
    type: 'draft-stock-fall',
    date: '2025-02-22',
    significance: 6,
  },
  {
    prospectId: 'nfl-007',
    alert: 'Mykel Williams dominates Senior Bowl week, solidifies top-10 projection',
    type: 'draft-stock-rise',
    date: '2025-02-20',
    significance: 7,
  },
  {
    prospectId: 'nba-008',
    alert: 'Tre Johnson named Big 12 Player of the Year, consistent 22+ PPG all season',
    type: 'stats-breakout',
    date: '2025-02-18',
    significance: 8,
  },
  {
    prospectId: 'soc-005',
    alert: 'Lamine Yamal Jr. scores twice in UEFA Youth League quarter-final',
    type: 'stats-breakout',
    date: '2025-02-15',
    significance: 7,
  },
  {
    prospectId: 'nhl-004',
    alert: 'Matthew Schaefer promoted to Erie Otters first power-play unit, OHL D scoring leader',
    type: 'promotion',
    date: '2025-02-12',
    significance: 6,
  },
];

const COMPARISONS: ProspectComparison[] = [
  {
    prospectId: 'nba-001',
    comparables: [
      { playerId: 'hist-001', name: 'LeBron James', similarity: 0.72, careerOutcome: 'All-time great, 4x Champion, 4x MVP', peakCardValue: 25000 },
      { playerId: 'hist-002', name: 'Jayson Tatum', similarity: 0.81, careerOutcome: 'All-Star, Champion, franchise cornerstone', peakCardValue: 3500 },
      { playerId: 'hist-003', name: 'Grant Hill', similarity: 0.68, careerOutcome: 'All-Star, HOF (injury-impacted)', peakCardValue: 800 },
    ],
  },
  {
    prospectId: 'nfl-004',
    comparables: [
      { playerId: 'hist-004', name: 'Charles Woodson', similarity: 0.78, careerOutcome: 'HOF, DPOY, Heisman winner', peakCardValue: 1200 },
      { playerId: 'hist-005', name: 'Deion Sanders', similarity: 0.65, careerOutcome: 'HOF, 2x Champion, Primetime icon', peakCardValue: 3500 },
      { playerId: 'hist-006', name: 'Champ Bailey', similarity: 0.72, careerOutcome: 'HOF, 12x Pro Bowl CB', peakCardValue: 600 },
    ],
  },
  {
    prospectId: 'nfl-001',
    comparables: [
      { playerId: 'hist-007', name: 'Trevor Lawrence', similarity: 0.82, careerOutcome: 'Franchise QB, improving yearly', peakCardValue: 1800 },
      { playerId: 'hist-008', name: 'Matt Ryan', similarity: 0.71, careerOutcome: 'MVP, long career, Super Bowl appearance', peakCardValue: 400 },
      { playerId: 'hist-009', name: 'Andrew Luck', similarity: 0.67, careerOutcome: 'Elite talent, early retirement', peakCardValue: 1200 },
    ],
  },
  {
    prospectId: 'nhl-001',
    comparables: [
      { playerId: 'hist-010', name: 'Jack Hughes', similarity: 0.80, careerOutcome: '100+ point scorer, franchise center', peakCardValue: 2500 },
      { playerId: 'hist-011', name: 'Patrick Kane', similarity: 0.72, careerOutcome: 'HOF, 3x Champion, Hart Trophy', peakCardValue: 3000 },
      { playerId: 'hist-012', name: 'Jack Eichel', similarity: 0.69, careerOutcome: 'Elite talent, injury concerns', peakCardValue: 1200 },
    ],
  },
  {
    prospectId: 'soc-001',
    comparables: [
      { playerId: 'hist-013', name: 'Christian Pulisic', similarity: 0.85, careerOutcome: 'USMNT star, Champions League winner', peakCardValue: 2000 },
      { playerId: 'hist-014', name: 'Landon Donovan', similarity: 0.70, careerOutcome: 'USMNT all-time great, MLS legend', peakCardValue: 500 },
      { playerId: 'hist-015', name: 'Freddy Adu', similarity: 0.55, careerOutcome: 'Hyped prospect, underwhelming career', peakCardValue: 300 },
    ],
  },
  {
    prospectId: 'nba-003',
    comparables: [
      { playerId: 'hist-016', name: 'Paul George', similarity: 0.79, careerOutcome: 'Perennial All-Star, elite two-way wing', peakCardValue: 1800 },
      { playerId: 'hist-017', name: 'Brandon Ingram', similarity: 0.74, careerOutcome: 'All-Star, high-scoring wing', peakCardValue: 800 },
      { playerId: 'hist-018', name: 'Michael Kidd-Gilchrist', similarity: 0.52, careerOutcome: 'Defensive-only, shot never developed', peakCardValue: 150 },
    ],
  },
  {
    prospectId: 'nhl-002',
    comparables: [
      { playerId: 'hist-019', name: 'Alex Ovechkin', similarity: 0.70, careerOutcome: 'All-time goal scorer, 3x MVP, Champion', peakCardValue: 8000 },
      { playerId: 'hist-020', name: 'Rick Nash', similarity: 0.75, careerOutcome: 'Consistent 30+ goal scorer', peakCardValue: 600 },
      { playerId: 'hist-021', name: 'Milan Lucic', similarity: 0.60, careerOutcome: 'Power forward, Champion, physical player', peakCardValue: 200 },
    ],
  },
  {
    prospectId: 'nba-008',
    comparables: [
      { playerId: 'hist-022', name: 'Devin Booker', similarity: 0.83, careerOutcome: 'All-NBA scorer, Finals appearance', peakCardValue: 4000 },
      { playerId: 'hist-023', name: 'Bradley Beal', similarity: 0.76, careerOutcome: 'All-Star scorer, injury-prone later career', peakCardValue: 1200 },
      { playerId: 'hist-024', name: 'JJ Redick', similarity: 0.62, careerOutcome: 'Elite shooter, long career role player', peakCardValue: 300 },
    ],
  },
  {
    prospectId: 'nfl-002',
    comparables: [
      { playerId: 'hist-025', name: 'A.J. Green', similarity: 0.80, careerOutcome: '7x Pro Bowl, elite for a decade', peakCardValue: 1500 },
      { playerId: 'hist-026', name: 'DeAndre Hopkins', similarity: 0.74, careerOutcome: 'Elite contested catcher, long career', peakCardValue: 1000 },
      { playerId: 'hist-027', name: 'Mike Williams', similarity: 0.58, careerOutcome: 'Injury-limited, flashed elite ceiling', peakCardValue: 200 },
    ],
  },
  {
    prospectId: 'soc-005',
    comparables: [
      { playerId: 'hist-028', name: 'Lionel Messi', similarity: 0.55, careerOutcome: 'Greatest of all time', peakCardValue: 50000 },
      { playerId: 'hist-029', name: 'Pedri', similarity: 0.72, careerOutcome: 'Golden Boy winner, La Masia gem', peakCardValue: 1500 },
      { playerId: 'hist-030', name: 'Bojan Krkic', similarity: 0.65, careerOutcome: 'La Masia hype, solid but not elite career', peakCardValue: 200 },
    ],
  },
];

// ---- Helper Functions ----

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

// ---- Service Functions ----

export async function getProspects(
  sport?: Sport,
  level?: ProspectLevel,
): Promise<ProspectProfile[]> {
  await delay(300);
  let filtered = [...PROSPECTS];
  if (sport) {
    filtered = filtered.filter((p) => p.sport === sport);
  }
  if (level) {
    filtered = filtered.filter((p) => p.currentLevel === level);
  }
  return filtered;
}

export async function getProspectProfile(
  id: string,
): Promise<ProspectProfile | null> {
  await delay(150);
  return PROSPECTS.find((p) => p.id === id) ?? null;
}

export async function getDraftClassProjection(
  sport: Sport,
  year: number,
): Promise<DraftClassProjection> {
  await delay(400);
  const prospects = PROSPECTS.filter((p) => p.sport === sport);
  const totalValue = prospects.reduce(
    (sum, p) => sum + p.cardValueProjection.median,
    0,
  );
  const topValue = Math.max(...prospects.map((p) => p.cardValueProjection.ceiling));

  const strengthMap: Record<Sport, number> = {
    NFL: 8,
    NBA: 9,
    NHL: 7,
    Soccer: 6,
  };

  return {
    sport,
    year,
    prospects,
    totalProjectedCardMarketValue: totalValue,
    topProspectValue: topValue,
    classStrength: strengthMap[sport],
  };
}

export async function getPipelineByStage(
  sport: Sport,
): Promise<PipelineStage[]> {
  await delay(350);
  const sportProspects = PROSPECTS.filter((p) => p.sport === sport);
  const stages: ProspectLevel[] = [
    'high-school',
    'college',
    'minor-league',
    'international',
    'g-league',
    'ahl',
    'mls-next',
  ];

  return stages
    .map((stage) => {
      const stageProspects = sportProspects.filter(
        (p) => p.currentLevel === stage,
      );
      if (stageProspects.length === 0) return null;

      const promotionRates: Record<ProspectLevel, number> = {
        'high-school': 0.05,
        college: 0.35,
        'minor-league': 0.45,
        international: 0.3,
        'g-league': 0.4,
        ahl: 0.5,
        'mls-next': 0.2,
      };

      return {
        stage,
        prospects: stageProspects,
        avgAge: avg(stageProspects.map((p) => p.age)),
        avgScoutGrade: avg(stageProspects.map((p) => p.scoutGrade)),
        promotionRate: promotionRates[stage],
      };
    })
    .filter((s): s is PipelineStage => s !== null);
}

export async function getProspectComparisons(
  id: string,
): Promise<ProspectComparison | null> {
  await delay(250);
  return COMPARISONS.find((c) => c.prospectId === id) ?? null;
}

export async function getWatchlistAlerts(): Promise<WatchlistAlert[]> {
  await delay(200);
  return [...WATCHLIST_ALERTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function getTopValueProjections(
  sport: Sport,
  count: number,
): Promise<ProspectProfile[]> {
  await delay(300);
  return PROSPECTS.filter((p) => p.sport === sport)
    .sort(
      (a, b) =>
        b.cardValueProjection.ceiling - a.cardValueProjection.ceiling,
    )
    .slice(0, count);
}

export async function getBreakoutCandidates(
  sport: Sport,
): Promise<ProspectProfile[]> {
  await delay(300);
  return PROSPECTS.filter((p) => p.sport === sport).filter((p) => {
    const improvingCount = p.keyMetrics.filter(
      (m) => m.trend === 'improving',
    ).length;
    return improvingCount >= 2 && p.scoutGrade < 70;
  });
}
