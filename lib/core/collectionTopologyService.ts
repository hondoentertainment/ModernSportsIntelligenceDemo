// @ts-nocheck
// ─────────────────────────────────────────────────────────────
// Collection Topology Mapper – Service Layer
// Topological data analysis (TDA) applied to card collections
// ─────────────────────────────────────────────────────────────

export type TopologyDimension =
  | 'era'
  | 'sport'
  | 'position'
  | 'set-prestige'
  | 'grade'
  | 'price-tier'
  | 'liquidity'
  | 'correlation';

export interface TopologicalHole {
  id: string;
  dimensions: TopologyDimension[];
  description: string;
  severity: 'minor' | 'moderate' | 'critical';
  financialImpact: string;
  recommendation: string;
}

export interface TopologyCluster {
  id: string;
  label: string;
  cardCount: number;
  avgValue: number;
  cohesion: number; // 0-100, how tightly grouped
  dominantDimension: TopologyDimension;
  color: string; // hex
}

export interface TopologyNode {
  id: string;
  cardName: string;
  x: number;
  y: number;
  z: number;
  cluster: string; // cluster id
  value: number;
  connections: string[]; // other node ids
}

export interface TopologyStats {
  totalNodes: number;
  totalClusters: number;
  totalHoles: number;
  bettiNumbers: { b0: number; b1: number; b2: number };
  topologicalResilience: number; // 0-100
  structuralScore: number; // 0-100
  isolatedOutliers: number;
  liquidityDeserts: { priceRange: string; gap: string }[];
}

export interface ResilienceScenario {
  name: string;
  description: string;
  nodesLost: number;
  resilienceAfter: number; // 0-100
  fragmentsCreated: number;
}

// ── Mock Topological Holes ───────────────────────────────────

const MOCK_TOPOLOGY_HOLES: TopologicalHole[] = [
  {
    id: 'hole-001',
    dimensions: ['era', 'price-tier'],
    description: 'No mid-tier ($200–$800) cards from the 2015–2018 era. Collection jumps from low-end rookies to ultra-premium vintage with nothing bridging the gap.',
    severity: 'critical',
    financialImpact: 'Exposes portfolio to 34% downside if premium vintage corrects — no mid-tier buffer absorbs the shock.',
    recommendation: 'Acquire 3–5 mid-grade Prizm or Select rookies from 2016–2018 to fill the structural void.',
  },
  {
    id: 'hole-002',
    dimensions: ['sport', 'liquidity'],
    description: 'Football cards in the collection have extremely low liquidity scores. All 8 football holdings trade fewer than 2 comps per month.',
    severity: 'moderate',
    financialImpact: 'Approximately $4,200 in football holdings could take 45+ days to liquidate at fair value.',
    recommendation: 'Swap 2 illiquid football cards for higher-volume Prizm or Optic parallels with weekly sales activity.',
  },
  {
    id: 'hole-003',
    dimensions: ['position', 'correlation'],
    description: 'Pitcher cards are 100% correlated — all are aces from the same era. An injury narrative or era re-pricing would hit all simultaneously.',
    severity: 'moderate',
    financialImpact: 'Correlated pitcher exposure totals $6,800. A single Tommy John news cycle could trigger 15–25% synchronized decline.',
    recommendation: 'Diversify pitching holdings across eras or add relief/closer cards to break the correlation chain.',
  },
  {
    id: 'hole-004',
    dimensions: ['grade', 'set-prestige'],
    description: 'No BGS 9.5 or SGC holdings at all. Entire collection is PSA-graded, creating single-grader concentration risk.',
    severity: 'minor',
    financialImpact: 'If PSA turnaround times spike or fees increase, rebalancing cost estimated at $1,200 in regrading fees.',
    recommendation: 'Consider acquiring 2–3 BGS 9.5 Gem Mint cards to diversify grading-house exposure.',
  },
  {
    id: 'hole-005',
    dimensions: ['price-tier', 'liquidity', 'correlation'],
    description: 'The $1,000–$3,000 tier is entirely basketball rookies from 2020–2022. A single draft-class disappointment cascades through all holdings.',
    severity: 'critical',
    financialImpact: 'Total mid-tier basketball exposure of $14,500 moves in lockstep — beta to the 2021 class is 0.92.',
    recommendation: 'Introduce baseball or football mid-tier cards, or shift 30% to proven veterans to decorrelate.',
  },
  {
    id: 'hole-006',
    dimensions: ['era', 'sport', 'set-prestige'],
    description: 'Zero representation from premium soccer sets (Topps Chrome UCL, Panini Immaculate Soccer). Global sports exposure is a structural blind spot.',
    severity: 'minor',
    financialImpact: 'Missing estimated 12% annual growth from international soccer market — opportunity cost of ~$3,400/year.',
    recommendation: 'Add 1–2 Topps Chrome UCL autos or Panini Select soccer rookies to capture global demand trends.',
  },
];

// ── Mock Topology Clusters ───────────────────────────────────

const MOCK_TOPOLOGY_CLUSTERS: TopologyCluster[] = [
  {
    id: 'cluster-alpha',
    label: 'Premium Basketball Core',
    cardCount: 7,
    avgValue: 4250,
    cohesion: 88,
    dominantDimension: 'sport',
    color: '#3B82F6',
  },
  {
    id: 'cluster-beta',
    label: 'Budget Rookies Pipeline',
    cardCount: 5,
    avgValue: 180,
    cohesion: 72,
    dominantDimension: 'price-tier',
    color: '#10B981',
  },
  {
    id: 'cluster-gamma',
    label: 'Vintage Baseball Anchors',
    cardCount: 4,
    avgValue: 8900,
    cohesion: 91,
    dominantDimension: 'era',
    color: '#F59E0B',
  },
  {
    id: 'cluster-delta',
    label: 'Football Speculative',
    cardCount: 3,
    avgValue: 1400,
    cohesion: 55,
    dominantDimension: 'liquidity',
    color: '#EF4444',
  },
  {
    id: 'cluster-epsilon',
    label: 'Graded Parallel Plays',
    cardCount: 1,
    avgValue: 2100,
    cohesion: 0,
    dominantDimension: 'grade',
    color: '#8B5CF6',
  },
];

// ── Mock Topology Nodes (20 nodes) ───────────────────────────

const MOCK_TOPOLOGY_NODES: TopologyNode[] = [
  { id: 'node-001', cardName: '2020 LaMelo Ball Prizm Silver PSA 10', x: 12.4, y: 8.1, z: 3.2, cluster: 'cluster-alpha', value: 3800, connections: ['node-002', 'node-003', 'node-005'] },
  { id: 'node-002', cardName: '2018 Luka Doncic Prizm Base PSA 10', x: 14.1, y: 9.3, z: 2.8, cluster: 'cluster-alpha', value: 8500, connections: ['node-001', 'node-003', 'node-004'] },
  { id: 'node-003', cardName: '2019 Ja Morant Prizm Silver PSA 10', x: 13.0, y: 7.6, z: 3.5, cluster: 'cluster-alpha', value: 2200, connections: ['node-001', 'node-002', 'node-005'] },
  { id: 'node-004', cardName: '2023 Victor Wembanyama Prizm Base PSA 10', x: 15.2, y: 10.1, z: 4.0, cluster: 'cluster-alpha', value: 4200, connections: ['node-002', 'node-005', 'node-006'] },
  { id: 'node-005', cardName: '2021 Cade Cunningham Optic Holo PSA 10', x: 11.8, y: 8.9, z: 2.5, cluster: 'cluster-alpha', value: 1600, connections: ['node-001', 'node-003', 'node-004'] },
  { id: 'node-006', cardName: '2022 Paolo Banchero Mosaic Silver PSA 10', x: 16.0, y: 9.7, z: 3.8, cluster: 'cluster-alpha', value: 2800, connections: ['node-004', 'node-007'] },
  { id: 'node-007', cardName: '2020 Anthony Edwards Prizm Pink Ice PSA 10', x: 13.5, y: 11.2, z: 3.1, cluster: 'cluster-alpha', value: 6650, connections: ['node-006', 'node-002'] },
  { id: 'node-008', cardName: '2024 Jayden Daniels Prizm Base PSA 9', x: -5.2, y: 2.3, z: 1.0, cluster: 'cluster-beta', value: 120, connections: ['node-009', 'node-010'] },
  { id: 'node-009', cardName: '2024 Caleb Williams Donruss Rated Rookie PSA 9', x: -4.8, y: 1.8, z: 0.8, cluster: 'cluster-beta', value: 95, connections: ['node-008', 'node-011'] },
  { id: 'node-010', cardName: '2024 Angel Reese Optic Base PSA 10', x: -6.1, y: 3.0, z: 1.2, cluster: 'cluster-beta', value: 210, connections: ['node-008', 'node-012'] },
  { id: 'node-011', cardName: '2024 Zach Edey Prizm Base PSA 10', x: -4.2, y: 2.8, z: 0.6, cluster: 'cluster-beta', value: 85, connections: ['node-009'] },
  { id: 'node-012', cardName: '2024 Caitlin Clark Optic Holo PSA 10', x: -5.9, y: 3.5, z: 1.5, cluster: 'cluster-beta', value: 390, connections: ['node-010'] },
  { id: 'node-013', cardName: '1956 Mickey Mantle Topps #135 PSA 5', x: -15.0, y: -12.4, z: 8.0, cluster: 'cluster-gamma', value: 18500, connections: ['node-014', 'node-015'] },
  { id: 'node-014', cardName: '1969 Reggie Jackson Topps RC PSA 6', x: -14.2, y: -11.8, z: 7.5, cluster: 'cluster-gamma', value: 4200, connections: ['node-013', 'node-016'] },
  { id: 'node-015', cardName: '1955 Roberto Clemente Topps RC PSA 4', x: -16.1, y: -13.0, z: 8.8, cluster: 'cluster-gamma', value: 8400, connections: ['node-013', 'node-016'] },
  { id: 'node-016', cardName: '1971 Nolan Ryan Topps PSA 7', x: -13.5, y: -10.9, z: 7.0, cluster: 'cluster-gamma', value: 4500, connections: ['node-014', 'node-015'] },
  { id: 'node-017', cardName: '2023 CJ Stroud Prizm Silver PSA 10', x: 8.0, y: -5.5, z: -2.0, cluster: 'cluster-delta', value: 1800, connections: ['node-018'] },
  { id: 'node-018', cardName: '2022 Brock Purdy Optic Rated Rookie PSA 10', x: 9.2, y: -6.8, z: -1.5, cluster: 'cluster-delta', value: 1200, connections: ['node-017', 'node-019'] },
  { id: 'node-019', cardName: '2021 Mac Jones Prizm Silver PSA 10', x: 7.5, y: -4.2, z: -2.8, cluster: 'cluster-delta', value: 1200, connections: ['node-018'] },
  { id: 'node-020', cardName: '2022 Paolo Banchero Mosaic Gold /10 BGS 9.5', x: 20.0, y: 15.0, z: 6.0, cluster: 'cluster-epsilon', value: 2100, connections: [] },
];

// ── Mock Resilience Scenarios ────────────────────────────────

const MOCK_RESILIENCE_SCENARIOS: ResilienceScenario[] = [
  {
    name: 'Basketball Market Crash',
    description: 'All basketball cards lose 40% value simultaneously due to a league-wide scandal or lockout. Tests how the portfolio holds together without its largest cluster.',
    nodesLost: 7,
    resilienceAfter: 42,
    fragmentsCreated: 4,
  },
  {
    name: 'Vintage Correction',
    description: 'Pre-1975 baseball cards correct 25% as new generational collectors shift focus to modern cards. The high-value anchor cluster weakens.',
    nodesLost: 4,
    resilienceAfter: 61,
    fragmentsCreated: 2,
  },
  {
    name: 'Grading Crisis',
    description: 'PSA announces a major population report error, shaking confidence in PSA grades. All PSA-graded cards temporarily drop 15%.',
    nodesLost: 2,
    resilienceAfter: 78,
    fragmentsCreated: 1,
  },
  {
    name: 'Liquidity Drought',
    description: 'eBay marketplace fee increase causes a 60% drop in transaction volume across all platforms. Low-liquidity cards become effectively frozen.',
    nodesLost: 5,
    resilienceAfter: 55,
    fragmentsCreated: 3,
  },
];

// ── Utility Helpers ──────────────────────────────────────────

export function getSeverityColor(severity: 'minor' | 'moderate' | 'critical'): string {
  const colors: Record<string, string> = {
    minor: 'text-yellow-400',
    moderate: 'text-orange-400',
    critical: 'text-red-400',
  };
  return colors[severity];
}

export function getDimensionLabel(dim: TopologyDimension): string {
  const labels: Record<TopologyDimension, string> = {
    era: 'Era / Decade',
    sport: 'Sport',
    position: 'Player Position',
    'set-prestige': 'Set Prestige',
    grade: 'Card Grade',
    'price-tier': 'Price Tier',
    liquidity: 'Liquidity',
    correlation: 'Correlation',
  };
  return labels[dim];
}

// ── Public API Functions ─────────────────────────────────────

export function getTopologyHoles(): TopologicalHole[] {
  return MOCK_TOPOLOGY_HOLES;
}

export function getTopologyClusters(): TopologyCluster[] {
  return MOCK_TOPOLOGY_CLUSTERS;
}

export function getTopologyNodes(): TopologyNode[] {
  return MOCK_TOPOLOGY_NODES;
}

export function getTopologyStats(): TopologyStats {
  const nodes = MOCK_TOPOLOGY_NODES;
  const clusters = MOCK_TOPOLOGY_CLUSTERS;
  const holes = MOCK_TOPOLOGY_HOLES;

  const isolatedCount = nodes.filter(n => n.connections.length === 0).length;
  const criticalHoles = holes.filter(h => h.severity === 'critical').length;

  return {
    totalNodes: nodes.length,
    totalClusters: clusters.length,
    totalHoles: holes.length,
    bettiNumbers: {
      b0: clusters.length, // connected components
      b1: holes.filter(h => h.dimensions.length === 2).length, // 1-dimensional holes (loops)
      b2: holes.filter(h => h.dimensions.length >= 3).length, // 2-dimensional holes (voids)
    },
    topologicalResilience: 64,
    structuralScore: 58,
    isolatedOutliers: isolatedCount,
    liquidityDeserts: [
      { priceRange: '$500–$1,000', gap: 'Zero cards in this range for football' },
      { priceRange: '$3,000–$5,000', gap: 'Only 2 cards, both in same sport/era' },
      { priceRange: '$10,000–$15,000', gap: 'No holdings — jump from $8,900 avg to $18,500' },
    ],
  };
}

export function getResilienceScenarios(): ResilienceScenario[] {
  return MOCK_RESILIENCE_SCENARIOS;
}
