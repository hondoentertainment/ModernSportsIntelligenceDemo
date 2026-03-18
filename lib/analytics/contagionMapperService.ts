// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Contagion Mapper Service
// Models how negative events propagate through card portfolios like financial
// contagion — injuries, scandals, era-wide taints, grading crises, and more.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ────────────────────────────────────────────────────────────────────

export type RelationshipType =
  | 'teammate'
  | 'rival'
  | 'same-era'
  | 'same-position'
  | 'same-team'
  | 'same-draft-class'
  | 'same-grader'
  | 'same-set';

export interface ContagionEdge {
  targetCardId: string;
  relationship: RelationshipType;
  /** Probability of transmission per unit time, 0–1 */
  transmissionRate: number;
  /** Estimated lag in days before contagion reaches this edge */
  lag_days: number;
}

export interface ContagionNode {
  cardId: string;
  cardName: string;
  player: string;
  sport: string;
  currentValue: number;
  /** Aggregate exposure score, 0–100 */
  contagionExposure: number;
  connections: ContagionEdge[];
  vulnerabilityFactors: string[];
}

export interface ContagionScenario {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  triggerCard: string;
  affectedCards: {
    cardId: string;
    impactPercent: number;
    order: number;
    pathway: string[];
  }[];
  /** Net portfolio-value change as a percentage */
  totalPortfolioImpact: number;
  cascadeDepth: number;
  peakContagionDay: number;
}

export interface ContagionSimulation {
  scenarioId: string;
  timeline: { day: number; cardId: string; cumulativeImpact: number }[];
  recoveryTimeline: { day: number; recoveredPercent: number }[];
}

export interface ImmunityScore {
  cardId: string;
  overallImmunity: number;
  factors: { name: string; score: number }[];
}

export interface ContagionHotspot {
  cluster: string;
  cards: string[];
  avgExposure: number;
  primaryRisk: string;
  secondaryRisks: string[];
}

export interface SystemicRisk {
  portfolioId: string;
  systemicScore: number;
  concentrationRisk: number;
  correlationRisk: number;
  singlePointOfFailure: string[];
}

export interface ContagionPath {
  source: string;
  target: string;
  hops: { cardId: string; relationship: RelationshipType; cumulativeRate: number }[];
  totalTransmission: number;
  estimatedDays: number;
}

// ── Relationship Color Map (used by both service and UI) ─────────────────────

export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  teammate: '#3b82f6',
  rival: '#ef4444',
  'same-era': '#a855f7',
  'same-position': '#f97316',
  'same-team': '#06b6d4',
  'same-draft-class': '#eab308',
  'same-grader': '#ec4899',
  'same-set': '#10b981',
};

// ── Mock Data ────────────────────────────────────────────────────────────────

const NODES: ContagionNode[] = [
  // ── NFL Cluster ────────────────────────────────────────────────────────────
  {
    cardId: 'card-001',
    cardName: '2000 Bowman Chrome Tom Brady RC #236 PSA 10',
    player: 'Tom Brady',
    sport: 'Football',
    currentValue: 425000,
    contagionExposure: 72,
    connections: [
      { targetCardId: 'card-002', relationship: 'teammate', transmissionRate: 0.78, lag_days: 3 },
      { targetCardId: 'card-003', relationship: 'rival', transmissionRate: 0.35, lag_days: 7 },
      { targetCardId: 'card-004', relationship: 'same-position', transmissionRate: 0.42, lag_days: 10 },
      { targetCardId: 'card-005', relationship: 'same-era', transmissionRate: 0.25, lag_days: 14 },
      { targetCardId: 'card-006', relationship: 'same-draft-class', transmissionRate: 0.30, lag_days: 8 },
      { targetCardId: 'card-031', relationship: 'same-grader', transmissionRate: 0.15, lag_days: 5 },
    ],
    vulnerabilityFactors: ['High concentration asset', 'Age-related decline narrative', 'Single-grader dependency'],
  },
  {
    cardId: 'card-002',
    cardName: '2010 Topps Chrome Rob Gronkowski RC #C112 PSA 10',
    player: 'Rob Gronkowski',
    sport: 'Football',
    currentValue: 12500,
    contagionExposure: 85,
    connections: [
      { targetCardId: 'card-001', relationship: 'teammate', transmissionRate: 0.78, lag_days: 3 },
      { targetCardId: 'card-007', relationship: 'same-position', transmissionRate: 0.40, lag_days: 12 },
      { targetCardId: 'card-005', relationship: 'same-team', transmissionRate: 0.55, lag_days: 5 },
    ],
    vulnerabilityFactors: ['Brady-dependent valuation', 'CTE concerns at position', 'Retirement volatility'],
  },
  {
    cardId: 'card-003',
    cardName: '2004 Topps Chrome Peyton Manning #100 PSA 10',
    player: 'Peyton Manning',
    sport: 'Football',
    currentValue: 28000,
    contagionExposure: 45,
    connections: [
      { targetCardId: 'card-001', relationship: 'rival', transmissionRate: 0.35, lag_days: 7 },
      { targetCardId: 'card-004', relationship: 'same-position', transmissionRate: 0.50, lag_days: 6 },
      { targetCardId: 'card-008', relationship: 'same-draft-class', transmissionRate: 0.28, lag_days: 10 },
    ],
    vulnerabilityFactors: ['HGH scandal residual', 'Position-wide CTE risk'],
  },
  {
    cardId: 'card-004',
    cardName: '2018 Panini Prizm Patrick Mahomes II RC #269 PSA 10',
    player: 'Patrick Mahomes',
    sport: 'Football',
    currentValue: 48000,
    contagionExposure: 38,
    connections: [
      { targetCardId: 'card-001', relationship: 'same-position', transmissionRate: 0.42, lag_days: 10 },
      { targetCardId: 'card-003', relationship: 'same-position', transmissionRate: 0.50, lag_days: 6 },
      { targetCardId: 'card-009', relationship: 'teammate', transmissionRate: 0.65, lag_days: 4 },
    ],
    vulnerabilityFactors: ['Ankle injury history', 'Overexposure in modern sets'],
  },
  {
    cardId: 'card-005',
    cardName: '2014 Panini Prizm Julian Edelman #89 PSA 10',
    player: 'Julian Edelman',
    sport: 'Football',
    currentValue: 1800,
    contagionExposure: 91,
    connections: [
      { targetCardId: 'card-001', relationship: 'teammate', transmissionRate: 0.82, lag_days: 2 },
      { targetCardId: 'card-002', relationship: 'same-team', transmissionRate: 0.55, lag_days: 5 },
    ],
    vulnerabilityFactors: ['Extreme Brady dependency', 'PED suspension history', 'Low standalone demand'],
  },
  {
    cardId: 'card-006',
    cardName: '2000 Bowman Chrome Jamal Lewis RC #178 PSA 9',
    player: 'Jamal Lewis',
    sport: 'Football',
    currentValue: 450,
    contagionExposure: 68,
    connections: [
      { targetCardId: 'card-001', relationship: 'same-draft-class', transmissionRate: 0.30, lag_days: 8 },
      { targetCardId: 'card-010', relationship: 'same-position', transmissionRate: 0.38, lag_days: 9 },
    ],
    vulnerabilityFactors: ['Draft class correlation', 'Off-field legal issues'],
  },
  {
    cardId: 'card-007',
    cardName: '2017 Panini Prizm Travis Kelce #44 PSA 10',
    player: 'Travis Kelce',
    sport: 'Football',
    currentValue: 8200,
    contagionExposure: 52,
    connections: [
      { targetCardId: 'card-002', relationship: 'same-position', transmissionRate: 0.40, lag_days: 12 },
      { targetCardId: 'card-009', relationship: 'teammate', transmissionRate: 0.72, lag_days: 3 },
      { targetCardId: 'card-004', relationship: 'same-team', transmissionRate: 0.60, lag_days: 4 },
    ],
    vulnerabilityFactors: ['Pop culture overexposure', 'Age-related decline'],
  },
  {
    cardId: 'card-008',
    cardName: '1998 Topps Chrome Peyton Manning RC #165 PSA 10',
    player: 'Peyton Manning',
    sport: 'Football',
    currentValue: 95000,
    contagionExposure: 42,
    connections: [
      { targetCardId: 'card-003', relationship: 'same-draft-class', transmissionRate: 0.28, lag_days: 10 },
      { targetCardId: 'card-001', relationship: 'rival', transmissionRate: 0.32, lag_days: 8 },
      { targetCardId: 'card-004', relationship: 'same-position', transmissionRate: 0.44, lag_days: 7 },
    ],
    vulnerabilityFactors: ['Duplicate player concentration', 'HGH narrative risk'],
  },
  {
    cardId: 'card-009',
    cardName: '2020 Panini Mosaic Tyreek Hill #18 PSA 10',
    player: 'Tyreek Hill',
    sport: 'Football',
    currentValue: 3200,
    contagionExposure: 64,
    connections: [
      { targetCardId: 'card-004', relationship: 'teammate', transmissionRate: 0.65, lag_days: 4 },
      { targetCardId: 'card-007', relationship: 'teammate', transmissionRate: 0.72, lag_days: 3 },
    ],
    vulnerabilityFactors: ['Off-field controversy history', 'Team-change depreciation'],
  },
  {
    cardId: 'card-010',
    cardName: '2017 Panini Prizm Derrick Henry RC #385 PSA 10',
    player: 'Derrick Henry',
    sport: 'Football',
    currentValue: 6500,
    contagionExposure: 55,
    connections: [
      { targetCardId: 'card-006', relationship: 'same-position', transmissionRate: 0.38, lag_days: 9 },
      { targetCardId: 'card-004', relationship: 'same-era', transmissionRate: 0.20, lag_days: 15 },
    ],
    vulnerabilityFactors: ['Running back devaluation trend', 'Injury-prone position'],
  },

  // ── MLB Cluster ────────────────────────────────────────────────────────────
  {
    cardId: 'card-011',
    cardName: '1993 SP Foil Derek Jeter RC #279 PSA 10',
    player: 'Derek Jeter',
    sport: 'Baseball',
    currentValue: 385000,
    contagionExposure: 34,
    connections: [
      { targetCardId: 'card-012', relationship: 'teammate', transmissionRate: 0.60, lag_days: 5 },
      { targetCardId: 'card-013', relationship: 'same-era', transmissionRate: 0.45, lag_days: 12 },
      { targetCardId: 'card-014', relationship: 'rival', transmissionRate: 0.25, lag_days: 14 },
      { targetCardId: 'card-015', relationship: 'same-set', transmissionRate: 0.55, lag_days: 6 },
    ],
    vulnerabilityFactors: ['90s era steroid-cloud adjacency', 'Yankees dynasty correlation'],
  },
  {
    cardId: 'card-012',
    cardName: '1993 Topps Gold Mariano Rivera RC #98 PSA 10',
    player: 'Mariano Rivera',
    sport: 'Baseball',
    currentValue: 52000,
    contagionExposure: 48,
    connections: [
      { targetCardId: 'card-011', relationship: 'teammate', transmissionRate: 0.60, lag_days: 5 },
      { targetCardId: 'card-016', relationship: 'same-position', transmissionRate: 0.35, lag_days: 10 },
      { targetCardId: 'card-013', relationship: 'same-era', transmissionRate: 0.40, lag_days: 12 },
    ],
    vulnerabilityFactors: ['Single-team concentration', 'Closer position volatility'],
  },
  {
    cardId: 'card-013',
    cardName: '1994 Bowman Alex Rodriguez RC #6 PSA 10',
    player: 'Alex Rodriguez',
    sport: 'Baseball',
    currentValue: 14000,
    contagionExposure: 88,
    connections: [
      { targetCardId: 'card-011', relationship: 'same-era', transmissionRate: 0.45, lag_days: 12 },
      { targetCardId: 'card-012', relationship: 'same-era', transmissionRate: 0.40, lag_days: 12 },
      { targetCardId: 'card-017', relationship: 'same-position', transmissionRate: 0.70, lag_days: 4 },
      { targetCardId: 'card-014', relationship: 'rival', transmissionRate: 0.55, lag_days: 6 },
    ],
    vulnerabilityFactors: ['Confirmed PED user', 'Steroid-era flagship', 'Reputation permanently impaired'],
  },
  {
    cardId: 'card-014',
    cardName: '2001 Bowman Chrome Albert Pujols RC #340 PSA 10',
    player: 'Albert Pujols',
    sport: 'Baseball',
    currentValue: 72000,
    contagionExposure: 40,
    connections: [
      { targetCardId: 'card-011', relationship: 'rival', transmissionRate: 0.25, lag_days: 14 },
      { targetCardId: 'card-013', relationship: 'rival', transmissionRate: 0.55, lag_days: 6 },
      { targetCardId: 'card-018', relationship: 'same-team', transmissionRate: 0.48, lag_days: 5 },
    ],
    vulnerabilityFactors: ['Steroid era proximity (guilt by association)', 'Age controversy'],
  },
  {
    cardId: 'card-015',
    cardName: '1993 SP Foil Mike Piazza RC #273 PSA 10',
    player: 'Mike Piazza',
    sport: 'Baseball',
    currentValue: 9500,
    contagionExposure: 76,
    connections: [
      { targetCardId: 'card-011', relationship: 'same-set', transmissionRate: 0.55, lag_days: 6 },
      { targetCardId: 'card-013', relationship: 'same-era', transmissionRate: 0.42, lag_days: 11 },
    ],
    vulnerabilityFactors: ['Same-set exposure to Jeter', 'Steroid suspicion (unproven)', 'HOF controversy era'],
  },
  {
    cardId: 'card-016',
    cardName: '2019 Bowman Chrome Devin Williams RC #BCP-82 PSA 10',
    player: 'Devin Williams',
    sport: 'Baseball',
    currentValue: 1200,
    contagionExposure: 42,
    connections: [
      { targetCardId: 'card-012', relationship: 'same-position', transmissionRate: 0.35, lag_days: 10 },
    ],
    vulnerabilityFactors: ['Thin trade market', 'Injury volatility'],
  },
  {
    cardId: 'card-017',
    cardName: '2019 Topps Chrome Fernando Tatis Jr. RC #203 PSA 10',
    player: 'Fernando Tatis Jr.',
    sport: 'Baseball',
    currentValue: 4800,
    contagionExposure: 82,
    connections: [
      { targetCardId: 'card-013', relationship: 'same-position', transmissionRate: 0.70, lag_days: 4 },
      { targetCardId: 'card-014', relationship: 'same-position', transmissionRate: 0.30, lag_days: 8 },
    ],
    vulnerabilityFactors: ['PED suspension', 'Injury history', 'Crash from hype peak'],
  },
  {
    cardId: 'card-018',
    cardName: '2018 Topps Update Shohei Ohtani RC #US1 PSA 10',
    player: 'Shohei Ohtani',
    sport: 'Baseball',
    currentValue: 8500,
    contagionExposure: 28,
    connections: [
      { targetCardId: 'card-014', relationship: 'same-team', transmissionRate: 0.48, lag_days: 5 },
      { targetCardId: 'card-017', relationship: 'same-era', transmissionRate: 0.18, lag_days: 16 },
    ],
    vulnerabilityFactors: ['International market dependency', 'Two-way player risk multiplier'],
  },

  // ── NBA Cluster ────────────────────────────────────────────────────────────
  {
    cardId: 'card-019',
    cardName: '2003 Topps Chrome LeBron James RC #111 PSA 10',
    player: 'LeBron James',
    sport: 'Basketball',
    currentValue: 210000,
    contagionExposure: 55,
    connections: [
      { targetCardId: 'card-020', relationship: 'teammate', transmissionRate: 0.62, lag_days: 4 },
      { targetCardId: 'card-021', relationship: 'rival', transmissionRate: 0.30, lag_days: 10 },
      { targetCardId: 'card-022', relationship: 'same-draft-class', transmissionRate: 0.45, lag_days: 7 },
      { targetCardId: 'card-023', relationship: 'same-position', transmissionRate: 0.35, lag_days: 12 },
    ],
    vulnerabilityFactors: ['Age-related decline narrative', 'Mega-cap concentration risk', 'Political polarization effect'],
  },
  {
    cardId: 'card-020',
    cardName: '2019 Panini Prizm Anthony Davis #65 PSA 10',
    player: 'Anthony Davis',
    sport: 'Basketball',
    currentValue: 3600,
    contagionExposure: 78,
    connections: [
      { targetCardId: 'card-019', relationship: 'teammate', transmissionRate: 0.62, lag_days: 4 },
      { targetCardId: 'card-024', relationship: 'same-position', transmissionRate: 0.42, lag_days: 8 },
    ],
    vulnerabilityFactors: ['LeBron dependency', 'Chronic injury designation', 'Declining trade volume'],
  },
  {
    cardId: 'card-021',
    cardName: '2009 Topps Chrome Stephen Curry RC #101 PSA 10',
    player: 'Stephen Curry',
    sport: 'Basketball',
    currentValue: 62000,
    contagionExposure: 32,
    connections: [
      { targetCardId: 'card-019', relationship: 'rival', transmissionRate: 0.30, lag_days: 10 },
      { targetCardId: 'card-025', relationship: 'teammate', transmissionRate: 0.58, lag_days: 4 },
      { targetCardId: 'card-023', relationship: 'same-position', transmissionRate: 0.38, lag_days: 9 },
    ],
    vulnerabilityFactors: ['Ankle injury history', 'Dynasty fatigue'],
  },
  {
    cardId: 'card-022',
    cardName: '2003 Topps Chrome Dwyane Wade RC #115 PSA 10',
    player: 'Dwyane Wade',
    sport: 'Basketball',
    currentValue: 18000,
    contagionExposure: 65,
    connections: [
      { targetCardId: 'card-019', relationship: 'same-draft-class', transmissionRate: 0.45, lag_days: 7 },
      { targetCardId: 'card-024', relationship: 'same-team', transmissionRate: 0.50, lag_days: 5 },
    ],
    vulnerabilityFactors: ['Draft-class correlation', 'Heat dynasty dependency'],
  },
  {
    cardId: 'card-023',
    cardName: '2018 Panini Prizm Luka Doncic RC #280 PSA 10',
    player: 'Luka Doncic',
    sport: 'Basketball',
    currentValue: 9200,
    contagionExposure: 36,
    connections: [
      { targetCardId: 'card-019', relationship: 'same-position', transmissionRate: 0.35, lag_days: 12 },
      { targetCardId: 'card-021', relationship: 'same-position', transmissionRate: 0.38, lag_days: 9 },
    ],
    vulnerabilityFactors: ['Conditioning concerns', 'Team performance dependency'],
  },
  {
    cardId: 'card-024',
    cardName: '2019 Panini Prizm Bam Adebayo #248 PSA 10',
    player: 'Bam Adebayo',
    sport: 'Basketball',
    currentValue: 1400,
    contagionExposure: 60,
    connections: [
      { targetCardId: 'card-020', relationship: 'same-position', transmissionRate: 0.42, lag_days: 8 },
      { targetCardId: 'card-022', relationship: 'same-team', transmissionRate: 0.50, lag_days: 5 },
    ],
    vulnerabilityFactors: ['Small market visibility', 'Position-shift risk'],
  },
  {
    cardId: 'card-025',
    cardName: '2014 Panini Prizm Klay Thompson #223 PSA 10',
    player: 'Klay Thompson',
    sport: 'Basketball',
    currentValue: 4800,
    contagionExposure: 74,
    connections: [
      { targetCardId: 'card-021', relationship: 'teammate', transmissionRate: 0.58, lag_days: 4 },
    ],
    vulnerabilityFactors: ['Curry-dependent valuation', 'Major injury history (ACL + Achilles)'],
  },

  // ── Hockey Cluster ────────────────────────────────────────────────────────
  {
    cardId: 'card-026',
    cardName: '2015-16 Upper Deck Young Guns Connor McDavid RC #201 PSA 10',
    player: 'Connor McDavid',
    sport: 'Hockey',
    currentValue: 28000,
    contagionExposure: 30,
    connections: [
      { targetCardId: 'card-027', relationship: 'teammate', transmissionRate: 0.68, lag_days: 3 },
      { targetCardId: 'card-028', relationship: 'rival', transmissionRate: 0.22, lag_days: 12 },
    ],
    vulnerabilityFactors: ['Small market (Edmonton)', 'Thin hockey card market'],
  },
  {
    cardId: 'card-027',
    cardName: '2016-17 Upper Deck Young Guns Leon Draisaitl RC #227 PSA 10',
    player: 'Leon Draisaitl',
    sport: 'Hockey',
    currentValue: 4200,
    contagionExposure: 80,
    connections: [
      { targetCardId: 'card-026', relationship: 'teammate', transmissionRate: 0.68, lag_days: 3 },
    ],
    vulnerabilityFactors: ['McDavid-dependent valuation', 'Contract-year sensitivity'],
  },
  {
    cardId: 'card-028',
    cardName: '2019-20 Upper Deck Young Guns Cale Makar RC #493 PSA 10',
    player: 'Cale Makar',
    sport: 'Hockey',
    currentValue: 6800,
    contagionExposure: 25,
    connections: [
      { targetCardId: 'card-026', relationship: 'rival', transmissionRate: 0.22, lag_days: 12 },
      { targetCardId: 'card-029', relationship: 'same-position', transmissionRate: 0.40, lag_days: 8 },
    ],
    vulnerabilityFactors: ['Defensive position lower ceiling', 'Injury risk for physical position'],
  },
  {
    cardId: 'card-029',
    cardName: '2019-20 Upper Deck Young Guns Quinn Hughes RC #249 PSA 10',
    player: 'Quinn Hughes',
    sport: 'Hockey',
    currentValue: 2100,
    contagionExposure: 50,
    connections: [
      { targetCardId: 'card-028', relationship: 'same-position', transmissionRate: 0.40, lag_days: 8 },
      { targetCardId: 'card-030', relationship: 'same-draft-class', transmissionRate: 0.35, lag_days: 7 },
    ],
    vulnerabilityFactors: ['Defenseman volatility', 'Small market'],
  },
  {
    cardId: 'card-030',
    cardName: '2019-20 Upper Deck Young Guns Jack Hughes RC #201 PSA 10',
    player: 'Jack Hughes',
    sport: 'Hockey',
    currentValue: 3500,
    contagionExposure: 58,
    connections: [
      { targetCardId: 'card-029', relationship: 'same-draft-class', transmissionRate: 0.35, lag_days: 7 },
      { targetCardId: 'card-026', relationship: 'same-era', transmissionRate: 0.18, lag_days: 14 },
    ],
    vulnerabilityFactors: ['Brother comparison overhang', 'Draft-class correlation'],
  },

  // ── Cross-Sport / Grading Risk Node ────────────────────────────────────────
  {
    cardId: 'card-031',
    cardName: '1986 Fleer Michael Jordan RC #57 PSA 10',
    player: 'Michael Jordan',
    sport: 'Basketball',
    currentValue: 780000,
    contagionExposure: 18,
    connections: [
      { targetCardId: 'card-001', relationship: 'same-grader', transmissionRate: 0.15, lag_days: 5 },
      { targetCardId: 'card-019', relationship: 'same-position', transmissionRate: 0.20, lag_days: 18 },
      { targetCardId: 'card-032', relationship: 'same-grader', transmissionRate: 0.15, lag_days: 5 },
    ],
    vulnerabilityFactors: ['Mega-cap single-point-of-failure', 'PSA grading monopoly exposure', 'Counterfeit target'],
  },
  {
    cardId: 'card-032',
    cardName: '2011 Topps Update Mike Trout RC #US175 PSA 10',
    player: 'Mike Trout',
    sport: 'Baseball',
    currentValue: 310000,
    contagionExposure: 22,
    connections: [
      { targetCardId: 'card-031', relationship: 'same-grader', transmissionRate: 0.15, lag_days: 5 },
      { targetCardId: 'card-018', relationship: 'same-team', transmissionRate: 0.52, lag_days: 4 },
      { targetCardId: 'card-014', relationship: 'same-era', transmissionRate: 0.20, lag_days: 15 },
    ],
    vulnerabilityFactors: ['Injury-curtailed career', 'Angels futility drag', 'PSA grading exposure'],
  },
  {
    cardId: 'card-033',
    cardName: '2018 Panini National Treasures Luka Doncic RPA #127 BGS 9.5',
    player: 'Luka Doncic',
    sport: 'Basketball',
    currentValue: 42000,
    contagionExposure: 40,
    connections: [
      { targetCardId: 'card-023', relationship: 'same-set', transmissionRate: 0.65, lag_days: 2 },
      { targetCardId: 'card-019', relationship: 'same-position', transmissionRate: 0.35, lag_days: 12 },
    ],
    vulnerabilityFactors: ['Duplicate player concentration', 'High-end set manipulation risk', 'BGS grader risk'],
  },
];

// ── Pre-built Scenarios ──────────────────────────────────────────────────────

const SCENARIOS: ContagionScenario[] = [
  {
    id: 'scenario-001',
    name: 'Brady Retirement Cascade',
    description: 'Tom Brady announces a permanent, final retirement with no media career plans. The "Brady premium" evaporates, dragging teammate and rival cards into a cascading selloff.',
    triggerEvent: 'Permanent retirement announcement',
    triggerCard: 'card-001',
    affectedCards: [
      { cardId: 'card-001', impactPercent: -28, order: 0, pathway: ['Tom Brady (trigger)'] },
      { cardId: 'card-005', impactPercent: -42, order: 1, pathway: ['Brady', 'Edelman (teammate)'] },
      { cardId: 'card-002', impactPercent: -35, order: 1, pathway: ['Brady', 'Gronkowski (teammate)'] },
      { cardId: 'card-006', impactPercent: -12, order: 2, pathway: ['Brady', 'Lewis (draft class)'] },
      { cardId: 'card-003', impactPercent: -8, order: 2, pathway: ['Brady', 'Manning (rival narrative loss)'] },
      { cardId: 'card-008', impactPercent: -6, order: 3, pathway: ['Brady', 'Manning', 'Manning RC (duplicate)'] },
      { cardId: 'card-004', impactPercent: -3, order: 3, pathway: ['Brady', 'Mahomes (QB position sentiment)'] },
      { cardId: 'card-007', impactPercent: -5, order: 2, pathway: ['Brady', 'Gronk', 'Kelce (same position)'] },
    ],
    totalPortfolioImpact: -4.8,
    cascadeDepth: 3,
    peakContagionDay: 8,
  },
  {
    id: 'scenario-002',
    name: 'Steroid-Era Bombshell',
    description: 'A new investigative report reveals widespread, previously unknown PED usage among 1990s baseball stars, with named players. The entire era faces a revaluation event.',
    triggerEvent: 'Investigative journalism PED exposé',
    triggerCard: 'card-013',
    affectedCards: [
      { cardId: 'card-013', impactPercent: -55, order: 0, pathway: ['A-Rod (trigger, named)'] },
      { cardId: 'card-017', impactPercent: -38, order: 1, pathway: ['A-Rod', 'Tatis Jr. (same position, PED precedent)'] },
      { cardId: 'card-015', impactPercent: -30, order: 1, pathway: ['A-Rod', 'Piazza (era contagion)'] },
      { cardId: 'card-011', impactPercent: -15, order: 2, pathway: ['A-Rod', 'Piazza', 'Jeter (era adjacency)'] },
      { cardId: 'card-012', impactPercent: -12, order: 2, pathway: ['A-Rod', 'Jeter', 'Rivera (teammate)'] },
      { cardId: 'card-014', impactPercent: -18, order: 1, pathway: ['A-Rod', 'Pujols (era suspicion)'] },
      { cardId: 'card-032', impactPercent: -4, order: 3, pathway: ['A-Rod', 'Pujols', 'Trout (sport sentiment)'] },
      { cardId: 'card-018', impactPercent: -2, order: 3, pathway: ['Pujols', 'Ohtani (team)'] },
    ],
    totalPortfolioImpact: -6.2,
    cascadeDepth: 3,
    peakContagionDay: 14,
  },
  {
    id: 'scenario-003',
    name: 'PSA Grading Scandal',
    description: 'Whistleblower reveals systematic over-grading at PSA for premium submissions. All PSA 10 cards face trustworthiness questions — a cross-sport systemic event.',
    triggerEvent: 'Grading integrity scandal',
    triggerCard: 'card-031',
    affectedCards: [
      { cardId: 'card-031', impactPercent: -22, order: 0, pathway: ['Jordan PSA 10 (trigger)'] },
      { cardId: 'card-001', impactPercent: -18, order: 1, pathway: ['Jordan', 'Brady PSA 10 (same grader)'] },
      { cardId: 'card-032', impactPercent: -20, order: 1, pathway: ['Jordan', 'Trout PSA 10 (same grader)'] },
      { cardId: 'card-011', impactPercent: -16, order: 1, pathway: ['Jordan', 'Jeter PSA 10 (same grader)'] },
      { cardId: 'card-019', impactPercent: -14, order: 1, pathway: ['Jordan', 'LeBron PSA 10 (same grader)'] },
      { cardId: 'card-002', impactPercent: -10, order: 2, pathway: ['Brady', 'Gronk PSA 10'] },
      { cardId: 'card-005', impactPercent: -8, order: 2, pathway: ['Brady', 'Edelman PSA 10'] },
      { cardId: 'card-004', impactPercent: -15, order: 1, pathway: ['Direct PSA exposure (Mahomes)'] },
      { cardId: 'card-021', impactPercent: -12, order: 2, pathway: ['LeBron', 'Curry PSA 10'] },
      { cardId: 'card-008', impactPercent: -14, order: 2, pathway: ['Manning PSA 10'] },
    ],
    totalPortfolioImpact: -11.5,
    cascadeDepth: 2,
    peakContagionDay: 5,
  },
  {
    id: 'scenario-004',
    name: 'CTE Research Breakthrough',
    description: 'Landmark study links CTE to virtually all NFL quarterbacks, sparking a position-wide revaluation. QB cards face existential cultural headwinds.',
    triggerEvent: 'Medical research publication',
    triggerCard: 'card-004',
    affectedCards: [
      { cardId: 'card-004', impactPercent: -20, order: 0, pathway: ['Mahomes (active QB, trigger)'] },
      { cardId: 'card-001', impactPercent: -18, order: 1, pathway: ['Mahomes', 'Brady (same position)'] },
      { cardId: 'card-003', impactPercent: -22, order: 1, pathway: ['Mahomes', 'Manning (same position)'] },
      { cardId: 'card-008', impactPercent: -22, order: 1, pathway: ['Manning (same position, duplicate)'] },
      { cardId: 'card-002', impactPercent: -15, order: 2, pathway: ['Brady', 'Gronk (CTE concerns at TE)'] },
      { cardId: 'card-005', impactPercent: -10, order: 2, pathway: ['Brady', 'Edelman (CTE concerns at WR)'] },
      { cardId: 'card-009', impactPercent: -8, order: 2, pathway: ['Mahomes', 'Hill (teammate, WR)'] },
      { cardId: 'card-007', impactPercent: -12, order: 2, pathway: ['Mahomes', 'Kelce (teammate, TE)'] },
      { cardId: 'card-010', impactPercent: -6, order: 3, pathway: ['NFL wide sentiment', 'Henry (RB)'] },
    ],
    totalPortfolioImpact: -7.9,
    cascadeDepth: 3,
    peakContagionDay: 21,
  },
  {
    id: 'scenario-005',
    name: 'LeBron Catastrophic Injury',
    description: 'LeBron James suffers a career-ending Achilles tear. His cards plummet and the shockwave ripples through teammates, draft-class peers, and the broader basketball market.',
    triggerEvent: 'Career-ending Achilles rupture',
    triggerCard: 'card-019',
    affectedCards: [
      { cardId: 'card-019', impactPercent: -35, order: 0, pathway: ['LeBron (trigger)'] },
      { cardId: 'card-020', impactPercent: -28, order: 1, pathway: ['LeBron', 'AD (teammate)'] },
      { cardId: 'card-022', impactPercent: -18, order: 1, pathway: ['LeBron', 'Wade (draft class)'] },
      { cardId: 'card-025', impactPercent: -5, order: 2, pathway: ['LeBron', 'Curry', 'Klay (teammate)'] },
      { cardId: 'card-021', impactPercent: -8, order: 2, pathway: ['LeBron', 'Curry (rival narrative loss)'] },
      { cardId: 'card-023', impactPercent: -4, order: 3, pathway: ['LeBron', 'Luka (position sentiment)'] },
      { cardId: 'card-033', impactPercent: -6, order: 3, pathway: ['LeBron', 'Luka', 'Luka NT (same player)'] },
      { cardId: 'card-024', impactPercent: -10, order: 2, pathway: ['LeBron', 'AD', 'Bam (same position)'] },
    ],
    totalPortfolioImpact: -5.4,
    cascadeDepth: 3,
    peakContagionDay: 10,
  },
  {
    id: 'scenario-006',
    name: '1993 SP Foil Counterfeit Ring',
    description: 'FBI uncovers a sophisticated counterfeiting operation producing near-perfect 1993 SP Foil cards. Every card from the set faces authenticity scrutiny, cratering trust.',
    triggerEvent: 'Counterfeit ring bust',
    triggerCard: 'card-011',
    affectedCards: [
      { cardId: 'card-011', impactPercent: -40, order: 0, pathway: ['Jeter SP Foil (trigger, set)'] },
      { cardId: 'card-015', impactPercent: -45, order: 1, pathway: ['Jeter', 'Piazza (same set)'] },
      { cardId: 'card-012', impactPercent: -20, order: 2, pathway: ['Jeter', 'Rivera (teammate trust)'] },
      { cardId: 'card-013', impactPercent: -10, order: 2, pathway: ['Jeter', 'A-Rod (era contagion)'] },
      { cardId: 'card-014', impactPercent: -5, order: 3, pathway: ['A-Rod', 'Pujols (era adjacency)'] },
      { cardId: 'card-031', impactPercent: -3, order: 3, pathway: ['PSA trust erosion (grader)'] },
    ],
    totalPortfolioImpact: -3.8,
    cascadeDepth: 3,
    peakContagionDay: 7,
  },
];

// ── Simulation Timelines ─────────────────────────────────────────────────────

function buildSimulation(scenario: ContagionScenario): ContagionSimulation {
  const timeline: ContagionSimulation['timeline'] = [];
  const totalDays = 60;

  for (const affected of scenario.affectedCards) {
    const startDay = affected.order === 0 ? 0 : Math.max(1, affected.order * 3);
    const peakDay = scenario.peakContagionDay + affected.order * 2;

    for (let day = 0; day <= totalDays; day++) {
      let impact = 0;
      if (day < startDay) {
        impact = 0;
      } else if (day <= peakDay) {
        const progress = (day - startDay) / Math.max(1, peakDay - startDay);
        impact = affected.impactPercent * Math.min(1, progress * progress * (3 - 2 * progress));
      } else {
        const recoveryProgress = (day - peakDay) / (totalDays - peakDay);
        const recoveryFactor = 0.3 + 0.7 * (1 - Math.exp(-2 * recoveryProgress));
        impact = affected.impactPercent * (1 - recoveryFactor * 0.6);
      }
      timeline.push({ day, cardId: affected.cardId, cumulativeImpact: Math.round(impact * 100) / 100 });
    }
  }

  const recoveryTimeline: ContagionSimulation['recoveryTimeline'] = [];
  for (let day = 0; day <= 180; day++) {
    let recovered: number;
    if (day <= scenario.peakContagionDay) {
      recovered = 0;
    } else {
      const elapsed = day - scenario.peakContagionDay;
      recovered = Math.min(92, 100 * (1 - Math.exp(-elapsed / 45)));
    }
    recoveryTimeline.push({ day, recoveredPercent: Math.round(recovered * 10) / 10 });
  }

  return { scenarioId: scenario.id, timeline, recoveryTimeline };
}

// ── Immunity Scores ──────────────────────────────────────────────────────────

function computeImmunity(node: ContagionNode): ImmunityScore {
  const connectionCount = node.connections.length;
  const avgTransmission = connectionCount > 0
    ? node.connections.reduce((s, c) => s + c.transmissionRate, 0) / connectionCount
    : 0;

  const diversificationScore = Math.min(100, Math.max(10, 100 - connectionCount * 12));
  const transmissionResistance = Math.round((1 - avgTransmission) * 100);
  const valueSizeScore = node.currentValue > 100000 ? 30 : node.currentValue > 20000 ? 55 : node.currentValue > 5000 ? 70 : 85;
  const vulnerabilityPenalty = Math.max(0, 100 - node.vulnerabilityFactors.length * 22);
  const sportLiquidity = node.sport === 'Basketball' ? 72 : node.sport === 'Football' ? 68 : node.sport === 'Baseball' ? 65 : 45;
  const lagBuffer = connectionCount > 0
    ? Math.min(100, Math.round(node.connections.reduce((s, c) => s + c.lag_days, 0) / connectionCount * 7))
    : 90;

  const factors = [
    { name: 'Diversification', score: diversificationScore },
    { name: 'Transmission Resistance', score: transmissionResistance },
    { name: 'Value Stability', score: valueSizeScore },
    { name: 'Vulnerability Profile', score: vulnerabilityPenalty },
    { name: 'Sport Liquidity', score: sportLiquidity },
    { name: 'Lag Buffer', score: lagBuffer },
  ];

  const overall = Math.round(factors.reduce((s, f) => s + f.score, 0) / factors.length);

  return { cardId: node.cardId, overallImmunity: overall, factors };
}

// ── Hotspot Detection ────────────────────────────────────────────────────────

function detectHotspots(): ContagionHotspot[] {
  return [
    {
      cluster: 'New England Patriots Dynasty',
      cards: ['card-001', 'card-002', 'card-005'],
      avgExposure: 83,
      primaryRisk: 'Brady retirement / decline cascade',
      secondaryRisks: ['CTE positional risk', 'Dynasty-era sentiment fatigue'],
    },
    {
      cluster: '1990s Baseball / Steroid Era',
      cards: ['card-011', 'card-012', 'card-013', 'card-014', 'card-015'],
      avgExposure: 57,
      primaryRisk: 'Steroid-era reputational contagion',
      secondaryRisks: ['Counterfeit vulnerability (vintage)', 'HOF controversy'],
    },
    {
      cluster: 'Kansas City Chiefs Stack',
      cards: ['card-004', 'card-007', 'card-009'],
      avgExposure: 51,
      primaryRisk: 'Single-team concentration',
      secondaryRisks: ['Mahomes injury risk', 'Cap-related roster turnover'],
    },
    {
      cluster: 'PSA 10 Mega-Caps',
      cards: ['card-031', 'card-032', 'card-001', 'card-011', 'card-019'],
      avgExposure: 40,
      primaryRisk: 'PSA grading integrity / systemic trust',
      secondaryRisks: ['Counterfeit targeting', 'Liquidity crisis at price point'],
    },
    {
      cluster: 'PED-Tainted Players',
      cards: ['card-013', 'card-017', 'card-005'],
      avgExposure: 80,
      primaryRisk: 'PED scandal re-ignition',
      secondaryRisks: ['MLB policy changes', 'Era-wide guilt by association'],
    },
    {
      cluster: '2003 NBA Draft Class',
      cards: ['card-019', 'card-022'],
      avgExposure: 60,
      primaryRisk: 'Draft-class age cliff',
      secondaryRisks: ['Retirement wave', 'Legacy reassessment'],
    },
  ];
}

// ── Systemic Risk ────────────────────────────────────────────────────────────

function computeSystemicRisk(cardIds: string[]): SystemicRisk {
  const nodes = cardIds
    .map(id => NODES.find(n => n.cardId === id))
    .filter((n): n is ContagionNode => n !== undefined);

  if (nodes.length === 0) {
    return {
      portfolioId: 'user-portfolio',
      systemicScore: 0,
      concentrationRisk: 0,
      correlationRisk: 0,
      singlePointOfFailure: [],
    };
  }

  const totalValue = nodes.reduce((s, n) => s + n.currentValue, 0);

  // Concentration: Herfindahl-Hirschman style
  const shares = nodes.map(n => n.currentValue / totalValue);
  const hhi = shares.reduce((s, sh) => s + sh * sh, 0);
  const concentrationRisk = Math.round(hhi * 100);

  // Correlation: average pairwise connection density
  let pairConnections = 0;
  let pairCount = 0;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      pairCount++;
      const hasEdge = nodes[i].connections.some(c => c.targetCardId === nodes[j].cardId);
      if (hasEdge) pairConnections++;
    }
  }
  const correlationRisk = pairCount > 0 ? Math.round((pairConnections / pairCount) * 100) : 0;

  // Single points of failure: any card > 25% of portfolio value or with > 4 intra-portfolio connections
  const spof: string[] = [];
  for (const node of nodes) {
    const share = node.currentValue / totalValue;
    const intraConnections = node.connections.filter(c => cardIds.includes(c.targetCardId)).length;
    if (share > 0.25 || intraConnections >= 4) {
      spof.push(node.player + ' (' + node.cardName.split(' ').slice(0, 3).join(' ') + '...)');
    }
  }

  const systemicScore = Math.min(100, Math.round(
    concentrationRisk * 0.4 + correlationRisk * 0.35 +
    (spof.length / Math.max(1, nodes.length)) * 100 * 0.25
  ));

  return {
    portfolioId: 'user-portfolio',
    systemicScore,
    concentrationRisk,
    correlationRisk,
    singlePointOfFailure: spof,
  };
}

// ── Pathfinding (BFS shortest contagion path) ────────────────────────────────

function findContagionPath(sourceId: string, targetId: string): ContagionPath | null {
  const nodeMap = new Map(NODES.map(n => [n.cardId, n]));
  if (!nodeMap.has(sourceId) || !nodeMap.has(targetId)) return null;
  if (sourceId === targetId) {
    return { source: sourceId, target: targetId, hops: [], totalTransmission: 1, estimatedDays: 0 };
  }

  const visited = new Set<string>();
  const queue: { cardId: string; path: { cardId: string; relationship: RelationshipType; rate: number; days: number }[] }[] = [
    { cardId: sourceId, path: [] },
  ];
  visited.add(sourceId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = nodeMap.get(current.cardId);
    if (!node) continue;

    for (const edge of node.connections) {
      if (visited.has(edge.targetCardId)) continue;
      visited.add(edge.targetCardId);

      const newPath = [
        ...current.path,
        { cardId: edge.targetCardId, relationship: edge.relationship, rate: edge.transmissionRate, days: edge.lag_days },
      ];

      if (edge.targetCardId === targetId) {
        let cumulativeRate = 1;
        let totalDays = 0;
        const hops = newPath.map(h => {
          cumulativeRate *= h.rate;
          totalDays += h.days;
          return { cardId: h.cardId, relationship: h.relationship, cumulativeRate: Math.round(cumulativeRate * 1000) / 1000 };
        });
        return {
          source: sourceId,
          target: targetId,
          hops,
          totalTransmission: Math.round(cumulativeRate * 1000) / 1000,
          estimatedDays: totalDays,
        };
      }

      queue.push({ cardId: edge.targetCardId, path: newPath });
    }
  }

  return null;
}

// ── Custom Contagion Runner ──────────────────────────────────────────────────

function runCustom(triggerCardId: string, impactPercent: number): ContagionScenario {
  const trigger = NODES.find(n => n.cardId === triggerCardId);
  if (!trigger) {
    return {
      id: 'custom-err',
      name: 'Unknown Card',
      description: 'Trigger card not found.',
      triggerEvent: 'Custom',
      triggerCard: triggerCardId,
      affectedCards: [],
      totalPortfolioImpact: 0,
      cascadeDepth: 0,
      peakContagionDay: 0,
    };
  }

  const affected: ContagionScenario['affectedCards'] = [
    { cardId: triggerCardId, impactPercent, order: 0, pathway: [trigger.player + ' (trigger)'] },
  ];

  const visited = new Set<string>([triggerCardId]);

  function propagate(nodeId: string, parentImpact: number, order: number, pathSoFar: string[]) {
    if (order > 4) return;
    const node = NODES.find(n => n.cardId === nodeId);
    if (!node) return;
    for (const edge of node.connections) {
      if (visited.has(edge.targetCardId)) continue;
      visited.add(edge.targetCardId);
      const target = NODES.find(n => n.cardId === edge.targetCardId);
      if (!target) continue;
      const transmittedImpact = Math.round(parentImpact * edge.transmissionRate * 100) / 100;
      if (Math.abs(transmittedImpact) < 1) continue;
      const pathway = [...pathSoFar, target.player + ' (' + edge.relationship + ')'];
      affected.push({ cardId: edge.targetCardId, impactPercent: transmittedImpact, order, pathway });
      propagate(edge.targetCardId, transmittedImpact, order + 1, pathway);
    }
  }

  propagate(triggerCardId, impactPercent, 1, [trigger.player]);

  const totalValue = NODES.reduce((s, n) => s + n.currentValue, 0);
  let impactDollars = 0;
  for (const a of affected) {
    const node = NODES.find(n => n.cardId === a.cardId);
    if (node) impactDollars += node.currentValue * (a.impactPercent / 100);
  }

  return {
    id: 'custom-' + Date.now(),
    name: 'Custom: ' + trigger.player + ' Event',
    description: `Custom scenario: ${trigger.player} faces a ${Math.abs(impactPercent)}% ${impactPercent < 0 ? 'decline' : 'surge'} event.`,
    triggerEvent: 'Custom trigger',
    triggerCard: triggerCardId,
    affectedCards: affected,
    totalPortfolioImpact: Math.round((impactDollars / totalValue) * 1000) / 10,
    cascadeDepth: Math.max(...affected.map(a => a.order)),
    peakContagionDay: Math.round(8 + Math.random() * 10),
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export function getContagionMap(): ContagionNode[] {
  return NODES;
}

export function getNodeDetail(cardId: string): ContagionNode | undefined {
  return NODES.find(n => n.cardId === cardId);
}

export function simulateContagion(scenarioId: string): ContagionSimulation | null {
  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) return null;
  return buildSimulation(scenario);
}

export function getContagionScenarios(): ContagionScenario[] {
  return SCENARIOS;
}

export function getImmunityScore(cardId: string): ImmunityScore | null {
  const node = NODES.find(n => n.cardId === cardId);
  if (!node) return null;
  return computeImmunity(node);
}

export function getAllImmunityScores(): ImmunityScore[] {
  return NODES.map(n => computeImmunity(n));
}

export function getContagionHotspots(): ContagionHotspot[] {
  return detectHotspots();
}

export function getSystemicRisk(cardIds: string[]): SystemicRisk {
  return computeSystemicRisk(cardIds);
}

export function getContagionPath(sourceId: string, targetId: string): ContagionPath | null {
  return findContagionPath(sourceId, targetId);
}

export function runCustomContagion(triggerCardId: string, impactPercent: number): ContagionScenario {
  return runCustom(triggerCardId, impactPercent);
}
