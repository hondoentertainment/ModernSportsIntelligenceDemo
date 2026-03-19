// ---- Types ----

export type InjurySeverity = 'minor' | 'moderate' | 'severe' | 'season-ending';

export type PlayerRelation =
  | 'injured'
  | 'teammate'
  | 'opponent'
  | 'division-rival'
  | 'same-position';

export type SportLeague = 'MLB' | 'NBA' | 'NFL' | 'NHL' | 'Soccer';

export interface InjuryEvent {
  id: string;
  playerName: string;
  team: string;
  sport: SportLeague;
  injuryType: string;
  severity: InjurySeverity;
  timestamp: string;
  expectedReturn: string;
  source: string;
}

export interface ShockwaveNode {
  id: string;
  playerName: string;
  team: string;
  relation: PlayerRelation;
  cardValueImpact: number; // percentage
  confidenceScore: number; // 0-100
  priceBeforeEvent: number;
  priceAfterEstimate: number;
  propagationDelay: string;
}

export interface ShockwaveGraph {
  eventId: string;
  injuryEvent: InjuryEvent;
  nodes: ShockwaveNode[];
  totalPortfolioImpact: number;
  cascadeDepth: number;
  timestamp: string;
}

export interface ShockwaveStats {
  totalEventsTracked: number;
  averageCascadeDepth: number;
  biggestShockwave: string;
  portfolioExposure: number;
  activeAlerts: number;
}

// ---- Severity config ----

export const severityConfig: Record<InjurySeverity, { label: string; color: string; bg: string; border: string; weight: number }> = {
  minor: { label: 'Minor', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', weight: 0.15 },
  moderate: { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', weight: 0.35 },
  severe: { label: 'Severe', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', weight: 0.65 },
  'season-ending': { label: 'Season-Ending', color: 'text-red-500', bg: 'bg-red-600/15', border: 'border-red-600/40', weight: 1.0 },
};

export const relationConfig: Record<PlayerRelation, { label: string; color: string }> = {
  injured: { label: 'Injured Player', color: 'text-red-400' },
  teammate: { label: 'Teammate', color: 'text-amber-400' },
  opponent: { label: 'Opponent', color: 'text-blue-400' },
  'division-rival': { label: 'Division Rival', color: 'text-purple-400' },
  'same-position': { label: 'Same Position', color: 'text-cyan-400' },
};

// ---- Mock Data ----

const injuryEvents: InjuryEvent[] = [
  {
    id: 'inj-001',
    playerName: 'Shohei Ohtani',
    team: 'Los Angeles Dodgers',
    sport: 'MLB',
    injuryType: 'UCL Tear (Elbow)',
    severity: 'season-ending',
    timestamp: '2026-03-14T14:30:00Z',
    expectedReturn: '2027 Spring Training',
    source: 'ESPN Injury Wire',
  },
  {
    id: 'inj-002',
    playerName: 'Ja Morant',
    team: 'Memphis Grizzlies',
    sport: 'NBA',
    injuryType: 'Torn Meniscus (Right Knee)',
    severity: 'severe',
    timestamp: '2026-03-13T21:15:00Z',
    expectedReturn: '6-8 weeks',
    source: 'Shams Charania / The Athletic',
  },
  {
    id: 'inj-003',
    playerName: 'CJ Stroud',
    team: 'Houston Texans',
    sport: 'NFL',
    injuryType: 'Separated Shoulder (AC Joint)',
    severity: 'moderate',
    timestamp: '2026-03-12T18:45:00Z',
    expectedReturn: '4-6 weeks',
    source: 'NFL Network Insider',
  },
  {
    id: 'inj-004',
    playerName: 'Connor McDavid',
    team: 'Edmonton Oilers',
    sport: 'NHL',
    injuryType: 'High Ankle Sprain',
    severity: 'moderate',
    timestamp: '2026-03-11T23:00:00Z',
    expectedReturn: '3-5 weeks',
    source: 'TSN Insider',
  },
  {
    id: 'inj-005',
    playerName: 'Tyreek Hill',
    team: 'Miami Dolphins',
    sport: 'NFL',
    injuryType: 'Torn ACL (Left Knee)',
    severity: 'season-ending',
    timestamp: '2026-03-10T16:00:00Z',
    expectedReturn: '9-12 months',
    source: 'Adam Schefter / ESPN',
  },
  {
    id: 'inj-006',
    playerName: 'Luka Doncic',
    team: 'Los Angeles Lakers',
    sport: 'NBA',
    injuryType: 'Calf Strain (Right)',
    severity: 'minor',
    timestamp: '2026-03-09T20:30:00Z',
    expectedReturn: '1-2 weeks',
    source: 'Woj / ESPN',
  },
  {
    id: 'inj-007',
    playerName: 'Ronald Acuna Jr.',
    team: 'Atlanta Braves',
    sport: 'MLB',
    injuryType: 'Torn ACL (Right Knee)',
    severity: 'season-ending',
    timestamp: '2026-03-08T19:10:00Z',
    expectedReturn: '10-12 months',
    source: 'Jeff Passan / ESPN',
  },
  {
    id: 'inj-008',
    playerName: 'Patrick Mahomes',
    team: 'Kansas City Chiefs',
    sport: 'NFL',
    injuryType: 'Ankle Sprain (Right)',
    severity: 'minor',
    timestamp: '2026-03-07T22:00:00Z',
    expectedReturn: '1 week',
    source: 'NFL Network Insider',
  },
];

const shockwaveGraphs: Record<string, ShockwaveNode[]> = {
  'inj-001': [
    { id: 'sw-001-1', playerName: 'Shohei Ohtani', team: 'Los Angeles Dodgers', relation: 'injured', cardValueImpact: -42.5, confidenceScore: 97, priceBeforeEvent: 1850.00, priceAfterEstimate: 1063.75, propagationDelay: 'Immediate' },
    { id: 'sw-001-2', playerName: 'Mookie Betts', team: 'Los Angeles Dodgers', relation: 'teammate', cardValueImpact: -8.2, confidenceScore: 82, priceBeforeEvent: 320.00, priceAfterEstimate: 293.76, propagationDelay: '2-4 hours' },
    { id: 'sw-001-3', playerName: 'Freddie Freeman', team: 'Los Angeles Dodgers', relation: 'teammate', cardValueImpact: -6.1, confidenceScore: 78, priceBeforeEvent: 275.00, priceAfterEstimate: 258.23, propagationDelay: '2-4 hours' },
    { id: 'sw-001-4', playerName: 'Yoshinobu Yamamoto', team: 'Los Angeles Dodgers', relation: 'teammate', cardValueImpact: 5.3, confidenceScore: 71, priceBeforeEvent: 180.00, priceAfterEstimate: 189.54, propagationDelay: '6-12 hours' },
    { id: 'sw-001-5', playerName: 'Corbin Burnes', team: 'Arizona Diamondbacks', relation: 'division-rival', cardValueImpact: 3.8, confidenceScore: 65, priceBeforeEvent: 145.00, priceAfterEstimate: 150.51, propagationDelay: '12-24 hours' },
    { id: 'sw-001-6', playerName: 'Logan Webb', team: 'San Francisco Giants', relation: 'division-rival', cardValueImpact: 2.9, confidenceScore: 61, priceBeforeEvent: 110.00, priceAfterEstimate: 113.19, propagationDelay: '12-24 hours' },
    { id: 'sw-001-7', playerName: 'Yu Darvish', team: 'San Diego Padres', relation: 'division-rival', cardValueImpact: 2.1, confidenceScore: 58, priceBeforeEvent: 95.00, priceAfterEstimate: 97.00, propagationDelay: '24-48 hours' },
    { id: 'sw-001-8', playerName: 'Gerrit Cole', team: 'New York Yankees', relation: 'same-position', cardValueImpact: 1.5, confidenceScore: 52, priceBeforeEvent: 210.00, priceAfterEstimate: 213.15, propagationDelay: '24-48 hours' },
  ],
  'inj-002': [
    { id: 'sw-002-1', playerName: 'Ja Morant', team: 'Memphis Grizzlies', relation: 'injured', cardValueImpact: -35.0, confidenceScore: 94, priceBeforeEvent: 620.00, priceAfterEstimate: 403.00, propagationDelay: 'Immediate' },
    { id: 'sw-002-2', playerName: 'Desmond Bane', team: 'Memphis Grizzlies', relation: 'teammate', cardValueImpact: -12.4, confidenceScore: 85, priceBeforeEvent: 85.00, priceAfterEstimate: 74.46, propagationDelay: '1-3 hours' },
    { id: 'sw-002-3', playerName: 'Jaren Jackson Jr.', team: 'Memphis Grizzlies', relation: 'teammate', cardValueImpact: 8.5, confidenceScore: 76, priceBeforeEvent: 95.00, priceAfterEstimate: 103.08, propagationDelay: '3-6 hours' },
    { id: 'sw-002-4', playerName: 'Marcus Smart', team: 'Memphis Grizzlies', relation: 'teammate', cardValueImpact: 6.2, confidenceScore: 68, priceBeforeEvent: 42.00, priceAfterEstimate: 44.60, propagationDelay: '3-6 hours' },
    { id: 'sw-002-5', playerName: 'Shai Gilgeous-Alexander', team: 'Oklahoma City Thunder', relation: 'opponent', cardValueImpact: 1.8, confidenceScore: 55, priceBeforeEvent: 480.00, priceAfterEstimate: 488.64, propagationDelay: '12-24 hours' },
    { id: 'sw-002-6', playerName: 'De\'Aaron Fox', team: 'Sacramento Kings', relation: 'same-position', cardValueImpact: 2.3, confidenceScore: 59, priceBeforeEvent: 110.00, priceAfterEstimate: 112.53, propagationDelay: '12-24 hours' },
    { id: 'sw-002-7', playerName: 'Trae Young', team: 'Atlanta Hawks', relation: 'same-position', cardValueImpact: 1.4, confidenceScore: 48, priceBeforeEvent: 135.00, priceAfterEstimate: 136.89, propagationDelay: '24-48 hours' },
  ],
  'inj-003': [
    { id: 'sw-003-1', playerName: 'CJ Stroud', team: 'Houston Texans', relation: 'injured', cardValueImpact: -18.5, confidenceScore: 88, priceBeforeEvent: 410.00, priceAfterEstimate: 334.15, propagationDelay: 'Immediate' },
    { id: 'sw-003-2', playerName: 'Nico Collins', team: 'Houston Texans', relation: 'teammate', cardValueImpact: -14.2, confidenceScore: 83, priceBeforeEvent: 125.00, priceAfterEstimate: 107.25, propagationDelay: '1-3 hours' },
    { id: 'sw-003-3', playerName: 'Stefon Diggs', team: 'Houston Texans', relation: 'teammate', cardValueImpact: -11.8, confidenceScore: 80, priceBeforeEvent: 95.00, priceAfterEstimate: 83.79, propagationDelay: '1-3 hours' },
    { id: 'sw-003-4', playerName: 'Tank Dell', team: 'Houston Texans', relation: 'teammate', cardValueImpact: -9.6, confidenceScore: 75, priceBeforeEvent: 68.00, priceAfterEstimate: 61.47, propagationDelay: '3-6 hours' },
    { id: 'sw-003-5', playerName: 'Davis Mills', team: 'Houston Texans', relation: 'teammate', cardValueImpact: 22.0, confidenceScore: 72, priceBeforeEvent: 12.00, priceAfterEstimate: 14.64, propagationDelay: '1-3 hours' },
    { id: 'sw-003-6', playerName: 'Trevor Lawrence', team: 'Jacksonville Jaguars', relation: 'division-rival', cardValueImpact: 3.5, confidenceScore: 60, priceBeforeEvent: 220.00, priceAfterEstimate: 227.70, propagationDelay: '12-24 hours' },
    { id: 'sw-003-7', playerName: 'Anthony Richardson', team: 'Indianapolis Colts', relation: 'division-rival', cardValueImpact: 2.8, confidenceScore: 56, priceBeforeEvent: 185.00, priceAfterEstimate: 190.18, propagationDelay: '12-24 hours' },
    { id: 'sw-003-8', playerName: 'Caleb Williams', team: 'Chicago Bears', relation: 'same-position', cardValueImpact: 1.2, confidenceScore: 45, priceBeforeEvent: 310.00, priceAfterEstimate: 313.72, propagationDelay: '24-48 hours' },
  ],
  'inj-004': [
    { id: 'sw-004-1', playerName: 'Connor McDavid', team: 'Edmonton Oilers', relation: 'injured', cardValueImpact: -22.0, confidenceScore: 91, priceBeforeEvent: 950.00, priceAfterEstimate: 741.00, propagationDelay: 'Immediate' },
    { id: 'sw-004-2', playerName: 'Leon Draisaitl', team: 'Edmonton Oilers', relation: 'teammate', cardValueImpact: 7.5, confidenceScore: 80, priceBeforeEvent: 320.00, priceAfterEstimate: 344.00, propagationDelay: '2-4 hours' },
    { id: 'sw-004-3', playerName: 'Ryan Nugent-Hopkins', team: 'Edmonton Oilers', relation: 'teammate', cardValueImpact: -5.8, confidenceScore: 72, priceBeforeEvent: 45.00, priceAfterEstimate: 42.39, propagationDelay: '3-6 hours' },
    { id: 'sw-004-4', playerName: 'Evan Bouchard', team: 'Edmonton Oilers', relation: 'teammate', cardValueImpact: -4.3, confidenceScore: 66, priceBeforeEvent: 65.00, priceAfterEstimate: 62.21, propagationDelay: '3-6 hours' },
    { id: 'sw-004-5', playerName: 'Nathan MacKinnon', team: 'Colorado Avalanche', relation: 'same-position', cardValueImpact: 2.1, confidenceScore: 55, priceBeforeEvent: 380.00, priceAfterEstimate: 387.98, propagationDelay: '12-24 hours' },
    { id: 'sw-004-6', playerName: 'Auston Matthews', team: 'Toronto Maple Leafs', relation: 'same-position', cardValueImpact: 1.6, confidenceScore: 50, priceBeforeEvent: 420.00, priceAfterEstimate: 426.72, propagationDelay: '24-48 hours' },
  ],
  'inj-005': [
    { id: 'sw-005-1', playerName: 'Tyreek Hill', team: 'Miami Dolphins', relation: 'injured', cardValueImpact: -48.0, confidenceScore: 96, priceBeforeEvent: 280.00, priceAfterEstimate: 145.60, propagationDelay: 'Immediate' },
    { id: 'sw-005-2', playerName: 'Tua Tagovailoa', team: 'Miami Dolphins', relation: 'teammate', cardValueImpact: -15.5, confidenceScore: 87, priceBeforeEvent: 175.00, priceAfterEstimate: 147.88, propagationDelay: '1-3 hours' },
    { id: 'sw-005-3', playerName: 'Jaylen Waddle', team: 'Miami Dolphins', relation: 'teammate', cardValueImpact: 12.0, confidenceScore: 82, priceBeforeEvent: 120.00, priceAfterEstimate: 134.40, propagationDelay: '2-4 hours' },
    { id: 'sw-005-4', playerName: 'Raheem Mostert', team: 'Miami Dolphins', relation: 'teammate', cardValueImpact: 5.5, confidenceScore: 68, priceBeforeEvent: 35.00, priceAfterEstimate: 36.93, propagationDelay: '3-6 hours' },
    { id: 'sw-005-5', playerName: 'Stefon Diggs', team: 'Houston Texans', relation: 'same-position', cardValueImpact: 3.2, confidenceScore: 58, priceBeforeEvent: 95.00, priceAfterEstimate: 98.04, propagationDelay: '12-24 hours' },
    { id: 'sw-005-6', playerName: 'Josh Allen', team: 'Buffalo Bills', relation: 'division-rival', cardValueImpact: 2.4, confidenceScore: 54, priceBeforeEvent: 520.00, priceAfterEstimate: 532.48, propagationDelay: '12-24 hours' },
    { id: 'sw-005-7', playerName: 'Sauce Gardner', team: 'New York Jets', relation: 'division-rival', cardValueImpact: -1.8, confidenceScore: 46, priceBeforeEvent: 110.00, priceAfterEstimate: 108.02, propagationDelay: '24-48 hours' },
    { id: 'sw-005-8', playerName: 'CeeDee Lamb', team: 'Dallas Cowboys', relation: 'same-position', cardValueImpact: 1.9, confidenceScore: 50, priceBeforeEvent: 340.00, priceAfterEstimate: 346.46, propagationDelay: '24-48 hours' },
    { id: 'sw-005-9', playerName: 'Ja\'Marr Chase', team: 'Cincinnati Bengals', relation: 'same-position', cardValueImpact: 1.5, confidenceScore: 47, priceBeforeEvent: 365.00, priceAfterEstimate: 370.48, propagationDelay: '24-48 hours' },
  ],
  'inj-006': [
    { id: 'sw-006-1', playerName: 'Luka Doncic', team: 'Los Angeles Lakers', relation: 'injured', cardValueImpact: -5.2, confidenceScore: 75, priceBeforeEvent: 890.00, priceAfterEstimate: 843.72, propagationDelay: 'Immediate' },
    { id: 'sw-006-2', playerName: 'LeBron James', team: 'Los Angeles Lakers', relation: 'teammate', cardValueImpact: -1.8, confidenceScore: 58, priceBeforeEvent: 1200.00, priceAfterEstimate: 1178.40, propagationDelay: '3-6 hours' },
    { id: 'sw-006-3', playerName: 'Anthony Davis', team: 'Los Angeles Lakers', relation: 'teammate', cardValueImpact: 3.1, confidenceScore: 62, priceBeforeEvent: 285.00, priceAfterEstimate: 293.84, propagationDelay: '3-6 hours' },
    { id: 'sw-006-4', playerName: 'Austin Reaves', team: 'Los Angeles Lakers', relation: 'teammate', cardValueImpact: 4.5, confidenceScore: 60, priceBeforeEvent: 72.00, priceAfterEstimate: 75.24, propagationDelay: '6-12 hours' },
    { id: 'sw-006-5', playerName: 'Stephen Curry', team: 'Golden State Warriors', relation: 'opponent', cardValueImpact: 0.8, confidenceScore: 42, priceBeforeEvent: 680.00, priceAfterEstimate: 685.44, propagationDelay: '24-48 hours' },
    { id: 'sw-006-6', playerName: 'Kyrie Irving', team: 'Dallas Mavericks', relation: 'same-position', cardValueImpact: 1.1, confidenceScore: 44, priceBeforeEvent: 155.00, priceAfterEstimate: 156.71, propagationDelay: '24-48 hours' },
  ],
  'inj-007': [
    { id: 'sw-007-1', playerName: 'Ronald Acuna Jr.', team: 'Atlanta Braves', relation: 'injured', cardValueImpact: -52.0, confidenceScore: 98, priceBeforeEvent: 720.00, priceAfterEstimate: 345.60, propagationDelay: 'Immediate' },
    { id: 'sw-007-2', playerName: 'Matt Olson', team: 'Atlanta Braves', relation: 'teammate', cardValueImpact: -7.8, confidenceScore: 79, priceBeforeEvent: 140.00, priceAfterEstimate: 129.08, propagationDelay: '2-4 hours' },
    { id: 'sw-007-3', playerName: 'Austin Riley', team: 'Atlanta Braves', relation: 'teammate', cardValueImpact: -5.5, confidenceScore: 74, priceBeforeEvent: 115.00, priceAfterEstimate: 108.68, propagationDelay: '2-4 hours' },
    { id: 'sw-007-4', playerName: 'Spencer Strider', team: 'Atlanta Braves', relation: 'teammate', cardValueImpact: -4.2, confidenceScore: 68, priceBeforeEvent: 165.00, priceAfterEstimate: 158.07, propagationDelay: '3-6 hours' },
    { id: 'sw-007-5', playerName: 'Michael Harris II', team: 'Atlanta Braves', relation: 'teammate', cardValueImpact: 11.5, confidenceScore: 77, priceBeforeEvent: 95.00, priceAfterEstimate: 105.93, propagationDelay: '2-4 hours' },
    { id: 'sw-007-6', playerName: 'Fernando Tatis Jr.', team: 'San Diego Padres', relation: 'same-position', cardValueImpact: 3.4, confidenceScore: 62, priceBeforeEvent: 310.00, priceAfterEstimate: 320.54, propagationDelay: '12-24 hours' },
    { id: 'sw-007-7', playerName: 'Mookie Betts', team: 'Los Angeles Dodgers', relation: 'same-position', cardValueImpact: 2.2, confidenceScore: 55, priceBeforeEvent: 320.00, priceAfterEstimate: 327.04, propagationDelay: '24-48 hours' },
    { id: 'sw-007-8', playerName: 'Juan Soto', team: 'New York Mets', relation: 'same-position', cardValueImpact: 1.8, confidenceScore: 51, priceBeforeEvent: 450.00, priceAfterEstimate: 458.10, propagationDelay: '24-48 hours' },
    { id: 'sw-007-9', playerName: 'Phillies Team Cards', team: 'Philadelphia Phillies', relation: 'division-rival', cardValueImpact: 2.6, confidenceScore: 59, priceBeforeEvent: 85.00, priceAfterEstimate: 87.21, propagationDelay: '12-24 hours' },
  ],
  'inj-008': [
    { id: 'sw-008-1', playerName: 'Patrick Mahomes', team: 'Kansas City Chiefs', relation: 'injured', cardValueImpact: -3.8, confidenceScore: 70, priceBeforeEvent: 1450.00, priceAfterEstimate: 1394.90, propagationDelay: 'Immediate' },
    { id: 'sw-008-2', playerName: 'Travis Kelce', team: 'Kansas City Chiefs', relation: 'teammate', cardValueImpact: -2.1, confidenceScore: 60, priceBeforeEvent: 380.00, priceAfterEstimate: 372.02, propagationDelay: '2-4 hours' },
    { id: 'sw-008-3', playerName: 'Rashee Rice', team: 'Kansas City Chiefs', relation: 'teammate', cardValueImpact: -3.5, confidenceScore: 65, priceBeforeEvent: 95.00, priceAfterEstimate: 91.68, propagationDelay: '2-4 hours' },
    { id: 'sw-008-4', playerName: 'Isiah Pacheco', team: 'Kansas City Chiefs', relation: 'teammate', cardValueImpact: 2.8, confidenceScore: 55, priceBeforeEvent: 65.00, priceAfterEstimate: 66.82, propagationDelay: '3-6 hours' },
    { id: 'sw-008-5', playerName: 'Josh Allen', team: 'Buffalo Bills', relation: 'division-rival', cardValueImpact: 1.5, confidenceScore: 48, priceBeforeEvent: 520.00, priceAfterEstimate: 527.80, propagationDelay: '12-24 hours' },
    { id: 'sw-008-6', playerName: 'Lamar Jackson', team: 'Baltimore Ravens', relation: 'same-position', cardValueImpact: 0.9, confidenceScore: 42, priceBeforeEvent: 390.00, priceAfterEstimate: 393.51, propagationDelay: '24-48 hours' },
  ],
};

// ---- Cascade depth calculator ----

function computeCascadeDepth(nodes: ShockwaveNode[]): number {
  const delays = nodes.map(n => n.propagationDelay);
  let maxDepth = 0;
  for (const delay of delays) {
    if (delay === 'Immediate') maxDepth = Math.max(maxDepth, 0);
    else if (delay.includes('1-3')) maxDepth = Math.max(maxDepth, 1);
    else if (delay.includes('2-4')) maxDepth = Math.max(maxDepth, 1);
    else if (delay.includes('3-6')) maxDepth = Math.max(maxDepth, 2);
    else if (delay.includes('6-12')) maxDepth = Math.max(maxDepth, 2);
    else if (delay.includes('12-24')) maxDepth = Math.max(maxDepth, 3);
    else if (delay.includes('24-48')) maxDepth = Math.max(maxDepth, 4);
  }
  return maxDepth;
}

function computeTotalImpact(nodes: ShockwaveNode[]): number {
  return nodes.reduce((sum, n) => {
    const dollarImpact = n.priceAfterEstimate - n.priceBeforeEvent;
    return sum + dollarImpact;
  }, 0);
}

// ---- Public API ----

/**
 * Returns all tracked injury events, sorted by most recent first.
 */
export function getInjuryEvents(): InjuryEvent[] {
  return [...injuryEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Builds the full shockwave propagation graph for a given injury event.
 */
export function getShockwaveGraph(eventId: string): ShockwaveGraph | null {
  const event = injuryEvents.find(e => e.id === eventId);
  const nodes = shockwaveGraphs[eventId];

  if (!event || !nodes) return null;

  return {
    eventId,
    injuryEvent: event,
    nodes,
    totalPortfolioImpact: computeTotalImpact(nodes),
    cascadeDepth: computeCascadeDepth(nodes),
    timestamp: event.timestamp,
  };
}

/**
 * Returns aggregate statistics across all tracked shockwave events.
 */
export function getShockwaveStats(): ShockwaveStats {
  const graphs = injuryEvents
    .map(e => getShockwaveGraph(e.id))
    .filter((g): g is ShockwaveGraph => g !== null);

  const totalEvents = graphs.length;
  const avgDepth =
    totalEvents > 0
      ? graphs.reduce((sum, g) => sum + g.cascadeDepth, 0) / totalEvents
      : 0;

  let biggestId = '';
  let biggestAbsImpact = 0;
  for (const g of graphs) {
    const absImpact = Math.abs(g.totalPortfolioImpact);
    if (absImpact > biggestAbsImpact) {
      biggestAbsImpact = absImpact;
      biggestId = g.injuryEvent.playerName;
    }
  }

  const totalExposure = graphs.reduce(
    (sum, g) => sum + Math.abs(g.totalPortfolioImpact),
    0
  );

  const activeAlerts = graphs.filter(g => {
    const sev = g.injuryEvent.severity;
    return sev === 'severe' || sev === 'season-ending';
  }).length;

  return {
    totalEventsTracked: totalEvents,
    averageCascadeDepth: Math.round(avgDepth * 10) / 10,
    biggestShockwave: biggestId,
    portfolioExposure: Math.round(totalExposure * 100) / 100,
    activeAlerts,
  };
}

/**
 * Returns only the currently active (severe / season-ending) shockwave graphs.
 */
export function getActiveShockwaves(): ShockwaveGraph[] {
  return injuryEvents
    .filter(e => e.severity === 'severe' || e.severity === 'season-ending')
    .map(e => getShockwaveGraph(e.id))
    .filter((g): g is ShockwaveGraph => g !== null)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

/**
 * Returns every shockwave node that references a specific player,
 * across all tracked events. Useful for portfolio exposure checks.
 */
export function getPlayerExposure(
  playerName: string
): { event: InjuryEvent; node: ShockwaveNode }[] {
  const results: { event: InjuryEvent; node: ShockwaveNode }[] = [];

  for (const event of injuryEvents) {
    const nodes = shockwaveGraphs[event.id];
    if (!nodes) continue;

    for (const node of nodes) {
      if (node.playerName.toLowerCase() === playerName.toLowerCase()) {
        results.push({ event, node });
      }
    }
  }

  return results;
}

/**
 * Estimates the net portfolio impact for a given set of card IDs.
 * Uses player names embedded in the card IDs (simplified mock matching).
 */
export function calculatePortfolioImpact(
  cardIds: string[]
): { totalImpact: number; exposedCards: number; details: { cardId: string; playerName: string; impact: number }[] } {
  const allNodes: { event: InjuryEvent; node: ShockwaveNode }[] = [];

  for (const event of injuryEvents) {
    const nodes = shockwaveGraphs[event.id];
    if (!nodes) continue;
    for (const node of nodes) {
      allNodes.push({ event, node });
    }
  }

  const details: { cardId: string; playerName: string; impact: number }[] = [];
  let totalImpact = 0;
  let exposedCards = 0;

  for (const cardId of cardIds) {
    const normalizedId = cardId.toLowerCase().replace(/[-_]/g, ' ');
    for (const { node } of allNodes) {
      const normalizedPlayer = node.playerName.toLowerCase();
      if (normalizedId.includes(normalizedPlayer) || normalizedPlayer.includes(normalizedId)) {
        const dollarImpact = node.priceAfterEstimate - node.priceBeforeEvent;
        details.push({
          cardId,
          playerName: node.playerName,
          impact: dollarImpact,
        });
        totalImpact += dollarImpact;
        exposedCards++;
        break;
      }
    }
  }

  return {
    totalImpact: Math.round(totalImpact * 100) / 100,
    exposedCards,
    details,
  };
}

/**
 * Returns a formatted time-ago string for display purposes.
 */
export function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
