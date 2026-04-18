// ─────────────────────────────────────────────────────────────────────────────
// Temporal Clustering Engine Service
// Groups sports cards by shared seasonal price patterns and temporal correlations
// ─────────────────────────────────────────────────────────────────────────────

export interface TemporalCluster {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  avgCorrelation: number;
  dominantPattern: string;
  peakMonth: string;
  troughMonth: string;
  volatility: number;
  annualizedReturn: number;
  color: string;
}

export interface ClusterMember {
  id: string;
  clusterId: string;
  cardName: string;
  category: string;
  correlationToCluster: number;
  distanceFromCentroid: number;
  joinedDate: string;
  priceTrajectory: 'rising' | 'falling' | 'stable' | 'cyclical';
}

export interface ClusterCorrelation {
  cluster1: string;
  cluster2: string;
  correlation: number;
  leadLagDays: number;
  relationship: 'positive' | 'negative' | 'independent';
  strength: 'strong' | 'moderate' | 'weak';
}

export interface TemporalPattern {
  id: string;
  patternName: string;
  clusters: string[];
  description: string;
  seasonality: number;
  amplitude: number;
  phase: number;
  predictivePower: number;
  tradingEdge: number;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const temporalClusters: TemporalCluster[] = [
  {
    id: 'TC-01', name: 'Spring Surge Cards', description: 'Cards that spike during MLB spring training and NBA playoff push. Driven by Opening Day hype and postseason seeding races.',
    memberCount: 42, avgCorrelation: 0.84, dominantPattern: 'Spring Rally',
    peakMonth: 'April', troughMonth: 'November', volatility: 18.3, annualizedReturn: 14.2, color: '#10b981',
  },
  {
    id: 'TC-02', name: 'Playoff Premium Assets', description: 'Cards whose value concentrates in postseason months. Strong correlation to team playoff odds and on-court performance.',
    memberCount: 37, avgCorrelation: 0.79, dominantPattern: 'Postseason Spike',
    peakMonth: 'October', troughMonth: 'February', volatility: 24.6, annualizedReturn: 11.8, color: '#8b5cf6',
  },
  {
    id: 'TC-03', name: 'Draft Hype Cyclicals', description: 'Prospect and rookie cards that cycle sharply around draft season, combine results, and early-season performance windows.',
    memberCount: 55, avgCorrelation: 0.88, dominantPattern: 'Draft Cycle',
    peakMonth: 'June', troughMonth: 'January', volatility: 31.2, annualizedReturn: 8.5, color: '#f59e0b',
  },
  {
    id: 'TC-04', name: 'Evergreen Steady Growers', description: 'Hall of Famers and all-time legends with minimal seasonality. Slow, compounding appreciation driven by scarcity and nostalgia.',
    memberCount: 28, avgCorrelation: 0.92, dominantPattern: 'Steady Accumulation',
    peakMonth: 'August', troughMonth: 'March', volatility: 6.1, annualizedReturn: 19.4, color: '#06b6d4',
  },
  {
    id: 'TC-05', name: 'Holiday Gift Cards', description: 'Cards that surge during Q4 gift-giving season. Driven by eBay traffic, hobby shop promotions, and new collector inflows.',
    memberCount: 33, avgCorrelation: 0.81, dominantPattern: 'Holiday Surge',
    peakMonth: 'December', troughMonth: 'May', volatility: 15.7, annualizedReturn: 9.3, color: '#ec4899',
  },
  {
    id: 'TC-06', name: 'Off-Season Bargain Hunters', description: 'Cards that bottom out when their sport is off-season, creating systematic buying opportunities for patient collectors.',
    memberCount: 46, avgCorrelation: 0.76, dominantPattern: 'Off-Season Dip',
    peakMonth: 'September', troughMonth: 'June', volatility: 20.8, annualizedReturn: 16.1, color: '#ef4444',
  },
];

const clusterMembers: ClusterMember[] = [
  // Spring Surge Cards (TC-01)
  { id: 'CM-01', clusterId: 'TC-01', cardName: 'Paul Skenes 2024 Bowman Chrome 1st Auto', category: 'Baseball', correlationToCluster: 0.91, distanceFromCentroid: 0.12, joinedDate: '2025-08-14', priceTrajectory: 'rising' },
  { id: 'CM-02', clusterId: 'TC-01', cardName: 'Elly De La Cruz 2023 Topps Chrome RC', category: 'Baseball', correlationToCluster: 0.87, distanceFromCentroid: 0.18, joinedDate: '2025-06-22', priceTrajectory: 'cyclical' },
  { id: 'CM-03', clusterId: 'TC-01', cardName: 'Jaylen Brown 2016 Prizm RC PSA 10', category: 'Basketball', correlationToCluster: 0.82, distanceFromCentroid: 0.24, joinedDate: '2025-09-03', priceTrajectory: 'stable' },
  { id: 'CM-04', clusterId: 'TC-01', cardName: 'Jackson Chourio 2024 Topps Chrome RC Auto', category: 'Baseball', correlationToCluster: 0.78, distanceFromCentroid: 0.31, joinedDate: '2026-01-10', priceTrajectory: 'rising' },

  // Playoff Premium Assets (TC-02)
  { id: 'CM-05', clusterId: 'TC-02', cardName: 'Luka Doncic 2018 Prizm Silver RC PSA 10', category: 'Basketball', correlationToCluster: 0.89, distanceFromCentroid: 0.09, joinedDate: '2025-05-18', priceTrajectory: 'cyclical' },
  { id: 'CM-06', clusterId: 'TC-02', cardName: 'Patrick Mahomes 2017 Prizm RC PSA 10', category: 'Football', correlationToCluster: 0.85, distanceFromCentroid: 0.15, joinedDate: '2025-04-01', priceTrajectory: 'stable' },
  { id: 'CM-07', clusterId: 'TC-02', cardName: 'Connor McDavid 2015 Upper Deck Young Guns RC', category: 'Hockey', correlationToCluster: 0.76, distanceFromCentroid: 0.28, joinedDate: '2025-07-12', priceTrajectory: 'rising' },
  { id: 'CM-08', clusterId: 'TC-02', cardName: 'Nikola Jokic 2015 Prizm RC PSA 10', category: 'Basketball', correlationToCluster: 0.81, distanceFromCentroid: 0.19, joinedDate: '2025-10-05', priceTrajectory: 'rising' },

  // Draft Hype Cyclicals (TC-03)
  { id: 'CM-09', clusterId: 'TC-03', cardName: 'Cooper Flagg 2025 Bowman University 1st', category: 'Basketball', correlationToCluster: 0.93, distanceFromCentroid: 0.06, joinedDate: '2025-11-20', priceTrajectory: 'cyclical' },
  { id: 'CM-10', clusterId: 'TC-03', cardName: 'Travis Hunter 2025 Panini Prizm Draft RC', category: 'Football', correlationToCluster: 0.90, distanceFromCentroid: 0.11, joinedDate: '2025-12-01', priceTrajectory: 'falling' },
  { id: 'CM-11', clusterId: 'TC-03', cardName: 'Jared McCain 2024 Prizm RC Auto', category: 'Basketball', correlationToCluster: 0.86, distanceFromCentroid: 0.17, joinedDate: '2026-01-15', priceTrajectory: 'cyclical' },
  { id: 'CM-12', clusterId: 'TC-03', cardName: 'Roki Sasaki 2025 Topps Chrome 1st RC', category: 'Baseball', correlationToCluster: 0.84, distanceFromCentroid: 0.22, joinedDate: '2026-02-08', priceTrajectory: 'rising' },

  // Evergreen Steady Growers (TC-04)
  { id: 'CM-13', clusterId: 'TC-04', cardName: 'Michael Jordan 1986 Fleer RC PSA 10', category: 'Basketball', correlationToCluster: 0.96, distanceFromCentroid: 0.03, joinedDate: '2024-01-15', priceTrajectory: 'rising' },
  { id: 'CM-14', clusterId: 'TC-04', cardName: 'Ken Griffey Jr 1989 Upper Deck RC PSA 10', category: 'Baseball', correlationToCluster: 0.94, distanceFromCentroid: 0.05, joinedDate: '2024-03-08', priceTrajectory: 'stable' },
  { id: 'CM-15', clusterId: 'TC-04', cardName: 'Wayne Gretzky 1979 OPC RC PSA 8', category: 'Hockey', correlationToCluster: 0.91, distanceFromCentroid: 0.08, joinedDate: '2024-02-20', priceTrajectory: 'rising' },
  { id: 'CM-16', clusterId: 'TC-04', cardName: 'Tom Brady 2000 Bowman Chrome RC PSA 10', category: 'Football', correlationToCluster: 0.89, distanceFromCentroid: 0.13, joinedDate: '2024-06-11', priceTrajectory: 'stable' },

  // Holiday Gift Cards (TC-05)
  { id: 'CM-17', clusterId: 'TC-05', cardName: 'Shohei Ohtani 2018 Topps Chrome RC PSA 10', category: 'Baseball', correlationToCluster: 0.88, distanceFromCentroid: 0.14, joinedDate: '2025-09-10', priceTrajectory: 'cyclical' },
  { id: 'CM-18', clusterId: 'TC-05', cardName: 'Victor Wembanyama 2023 Prizm RC PSA 10', category: 'Basketball', correlationToCluster: 0.83, distanceFromCentroid: 0.20, joinedDate: '2025-08-25', priceTrajectory: 'rising' },
  { id: 'CM-19', clusterId: 'TC-05', cardName: 'Caitlin Clark 2024 Prizm WNBA RC', category: 'Basketball', correlationToCluster: 0.79, distanceFromCentroid: 0.25, joinedDate: '2025-10-18', priceTrajectory: 'rising' },
  { id: 'CM-20', clusterId: 'TC-05', cardName: 'Juan Soto 2019 Topps Chrome RC Auto', category: 'Baseball', correlationToCluster: 0.75, distanceFromCentroid: 0.32, joinedDate: '2025-11-05', priceTrajectory: 'stable' },

  // Off-Season Bargain Hunters (TC-06)
  { id: 'CM-21', clusterId: 'TC-06', cardName: 'CJ Stroud 2023 Prizm Silver RC PSA 10', category: 'Football', correlationToCluster: 0.85, distanceFromCentroid: 0.16, joinedDate: '2025-07-20', priceTrajectory: 'cyclical' },
  { id: 'CM-22', clusterId: 'TC-06', cardName: 'Anthony Edwards 2020 Prizm RC PSA 10', category: 'Basketball', correlationToCluster: 0.80, distanceFromCentroid: 0.21, joinedDate: '2025-06-15', priceTrajectory: 'rising' },
  { id: 'CM-23', clusterId: 'TC-06', cardName: 'Connor Bedard 2023 Upper Deck YG RC PSA 10', category: 'Hockey', correlationToCluster: 0.74, distanceFromCentroid: 0.29, joinedDate: '2025-08-01', priceTrajectory: 'cyclical' },
  { id: 'CM-24', clusterId: 'TC-06', cardName: 'Caleb Williams 2024 Prizm RC Auto PSA 10', category: 'Football', correlationToCluster: 0.71, distanceFromCentroid: 0.35, joinedDate: '2026-02-14', priceTrajectory: 'falling' },
];

// All 15 pairwise correlations between 6 clusters
const clusterCorrelations: ClusterCorrelation[] = [
  { cluster1: 'TC-01', cluster2: 'TC-02', correlation: 0.42, leadLagDays: -14, relationship: 'positive', strength: 'moderate' },
  { cluster1: 'TC-01', cluster2: 'TC-03', correlation: 0.67, leadLagDays: -30, relationship: 'positive', strength: 'strong' },
  { cluster1: 'TC-01', cluster2: 'TC-04', correlation: 0.15, leadLagDays: 0, relationship: 'independent', strength: 'weak' },
  { cluster1: 'TC-01', cluster2: 'TC-05', correlation: -0.31, leadLagDays: 45, relationship: 'negative', strength: 'moderate' },
  { cluster1: 'TC-01', cluster2: 'TC-06', correlation: -0.58, leadLagDays: 60, relationship: 'negative', strength: 'strong' },
  { cluster1: 'TC-02', cluster2: 'TC-03', correlation: 0.28, leadLagDays: -90, relationship: 'positive', strength: 'weak' },
  { cluster1: 'TC-02', cluster2: 'TC-04', correlation: 0.12, leadLagDays: 0, relationship: 'independent', strength: 'weak' },
  { cluster1: 'TC-02', cluster2: 'TC-05', correlation: 0.53, leadLagDays: 21, relationship: 'positive', strength: 'moderate' },
  { cluster1: 'TC-02', cluster2: 'TC-06', correlation: -0.44, leadLagDays: 30, relationship: 'negative', strength: 'moderate' },
  { cluster1: 'TC-03', cluster2: 'TC-04', correlation: 0.08, leadLagDays: 0, relationship: 'independent', strength: 'weak' },
  { cluster1: 'TC-03', cluster2: 'TC-05', correlation: -0.22, leadLagDays: 75, relationship: 'negative', strength: 'weak' },
  { cluster1: 'TC-03', cluster2: 'TC-06', correlation: -0.71, leadLagDays: 45, relationship: 'negative', strength: 'strong' },
  { cluster1: 'TC-04', cluster2: 'TC-05', correlation: 0.19, leadLagDays: 0, relationship: 'independent', strength: 'weak' },
  { cluster1: 'TC-04', cluster2: 'TC-06', correlation: 0.11, leadLagDays: 0, relationship: 'independent', strength: 'weak' },
  { cluster1: 'TC-05', cluster2: 'TC-06', correlation: -0.38, leadLagDays: 35, relationship: 'negative', strength: 'moderate' },
];

const temporalPatterns: TemporalPattern[] = [
  {
    id: 'TP-01', patternName: 'Season-Opener Rally',
    clusters: ['TC-01', 'TC-03'],
    description: 'Cards in the Spring Surge and Draft Hype clusters exhibit a synchronized rally from March through June as MLB opens and NBA/NHL playoffs begin.',
    seasonality: 12, amplitude: 22.4, phase: 3, predictivePower: 0.82, tradingEdge: 6.8,
  },
  {
    id: 'TP-02', patternName: 'Playoff-to-Holiday Pipeline',
    clusters: ['TC-02', 'TC-05'],
    description: 'Playoff performers carry momentum into holiday gift-buying season, creating a Q3-Q4 demand wave for star player cards.',
    seasonality: 12, amplitude: 18.1, phase: 9, predictivePower: 0.74, tradingEdge: 5.2,
  },
  {
    id: 'TP-03', patternName: 'Counter-Cyclical Rotation',
    clusters: ['TC-01', 'TC-06'],
    description: 'As Spring Surge cards peak, Off-Season Bargain cards trough, creating a systematic rotation opportunity between the two clusters.',
    seasonality: 12, amplitude: 28.7, phase: 4, predictivePower: 0.88, tradingEdge: 9.1,
  },
  {
    id: 'TP-04', patternName: 'Draft Hype Fade-to-Value',
    clusters: ['TC-03', 'TC-06'],
    description: 'Draft hype cards that disappoint in their first season migrate to the bargain cluster, creating a predictable six-month reversion pattern.',
    seasonality: 6, amplitude: 35.2, phase: 6, predictivePower: 0.71, tradingEdge: 4.5,
  },
  {
    id: 'TP-05', patternName: 'Evergreen Floor Support',
    clusters: ['TC-04'],
    description: 'Legend cards act as market anchors, providing portfolio stability. Their minimal seasonality inversely correlates with overall market volatility.',
    seasonality: 12, amplitude: 5.8, phase: 0, predictivePower: 0.91, tradingEdge: 3.2,
  },
  {
    id: 'TP-06', patternName: 'Holiday Demand Cascade',
    clusters: ['TC-05', 'TC-03', 'TC-01'],
    description: 'Q4 gift demand cascades from recognizable stars to rising prospects to breakout players, each cohort peaking 2-3 weeks apart.',
    seasonality: 12, amplitude: 16.5, phase: 11, predictivePower: 0.77, tradingEdge: 5.9,
  },
];

// ── Getter Functions ─────────────────────────────────────────────────────────

export function getTemporalClusters(): TemporalCluster[] {
  return temporalClusters;
}

export function getClusterMembers(): ClusterMember[] {
  return clusterMembers;
}

export function getClusterCorrelations(): ClusterCorrelation[] {
  return clusterCorrelations;
}

export function getTemporalPatterns(): TemporalPattern[] {
  return temporalPatterns;
}

export function getClusteringSummary(): {
  totalClusters: number;
  totalMembers: number;
  avgCorrelation: number;
  strongestPattern: string;
} {
  const totalClusters = temporalClusters.length;
  const totalMembers = temporalClusters.reduce((sum, c) => sum + c.memberCount, 0);
  const avgCorrelation = Math.round(
    (temporalClusters.reduce((sum, c) => sum + c.avgCorrelation, 0) / totalClusters) * 100
  ) / 100;
  const strongest = temporalPatterns.reduce((best, p) =>
    p.predictivePower > best.predictivePower ? p : best, temporalPatterns[0]
  );

  return { totalClusters, totalMembers, avgCorrelation, strongestPattern: strongest.patternName };
}
