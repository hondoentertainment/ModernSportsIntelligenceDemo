// ─────────────────────────────────────────────────────────────────────────────
// Crowding Risk Monitor Service
// Detects when too many collectors pile into the same thesis
// ─────────────────────────────────────────────────────────────────────────────

export interface CrowdingSignal {
  id: string;
  thesisName: string;
  category: 'player-hype' | 'set-chase' | 'grade-premium' | 'vintage-rotation' | 'prospect-spec' | 'narrative-momentum';
  crowdingLevel: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  participantEstimate: number;
  avgPositionSize: number;
  totalCapitalAtRisk: number;
  exitRiskScore: number;
  detectedDate: string;
  peakDate: string | null;
  status: 'crowded' | 'moderately-crowded' | 'normal' | 'contrarian-opportunity';
  affectedCards: string[];
}

export interface ThesisDensity {
  thesisId: string;
  thesisName: string;
  densityScore: number;
  socialMentions: number;
  listingGrowth: number;
  priceCorrelation: number;
  volumeConcentration: number;
  newEntrants30d: number;
  heatMap: { week: string; density: number; mentions: number }[];
}

export interface ExitRisk {
  thesisId: string;
  thesisName: string;
  exitRiskScore: number;
  liquidityAtExit: number;
  estimatedSlippage: number;
  cascadeRisk: number;
  timeToExit: string;
  worstCaseDrawdown: number;
  scenario: string;
  mitigationSteps: string[];
}

export interface CrowdingHistory {
  month: string;
  avgCrowdingLevel: number;
  crowdedTheses: number;
  contrarianPlays: number;
  avgExitRisk: number;
  capitalAtRisk: number;
  crowdingEvents: number;
}

const crowdingSignals: CrowdingSignal[] = [
  {
    id: 'CS-01', thesisName: 'Wembanyama Generational Bet', category: 'player-hype',
    crowdingLevel: 92, trend: 'increasing', participantEstimate: 18500, avgPositionSize: 2800,
    totalCapitalAtRisk: 51800000, exitRiskScore: 88, detectedDate: '2025-10-15', peakDate: null,
    status: 'crowded', affectedCards: ['2023 Bowman Chrome Wemby Auto', '2023 Prizm Wemby RC', '2024 Prizm Wemby Silver']
  },
  {
    id: 'CS-02', thesisName: 'Vintage Baseball Floor Play', category: 'vintage-rotation',
    crowdingLevel: 45, trend: 'stable', participantEstimate: 3200, avgPositionSize: 15000,
    totalCapitalAtRisk: 48000000, exitRiskScore: 35, detectedDate: '2025-06-01', peakDate: null,
    status: 'normal', affectedCards: ['1952 Topps Mantle', '1955 Topps Clemente', '1956 Topps Mantle']
  },
  {
    id: 'CS-03', thesisName: 'PSA 10 Premium Trade', category: 'grade-premium',
    crowdingLevel: 78, trend: 'increasing', participantEstimate: 12000, avgPositionSize: 1500,
    totalCapitalAtRisk: 18000000, exitRiskScore: 72, detectedDate: '2025-08-20', peakDate: null,
    status: 'crowded', affectedCards: ['Various modern PSA 10 rookies']
  },
  {
    id: 'CS-04', thesisName: 'Bowman Chrome 1st Prospect Spec', category: 'prospect-spec',
    crowdingLevel: 85, trend: 'stable', participantEstimate: 22000, avgPositionSize: 450,
    totalCapitalAtRisk: 9900000, exitRiskScore: 80, detectedDate: '2025-03-01', peakDate: '2025-12-15',
    status: 'crowded', affectedCards: ['2024 Bowman 1st Salas', '2024 Bowman 1st Anthony', '2024 Bowman 1st Kurtz']
  },
  {
    id: 'CS-05', thesisName: 'NFL QB Premium Thesis', category: 'narrative-momentum',
    crowdingLevel: 68, trend: 'decreasing', participantEstimate: 8500, avgPositionSize: 800,
    totalCapitalAtRisk: 6800000, exitRiskScore: 55, detectedDate: '2025-09-01', peakDate: '2026-02-10',
    status: 'moderately-crowded', affectedCards: ['2017 Prizm Mahomes', '2020 Prizm Herbert', '2020 Prizm Burrow']
  },
  {
    id: 'CS-06', thesisName: 'Junk Wax Rediscovery', category: 'vintage-rotation',
    crowdingLevel: 38, trend: 'increasing', participantEstimate: 5500, avgPositionSize: 200,
    totalCapitalAtRisk: 1100000, exitRiskScore: 28, detectedDate: '2026-01-15', peakDate: null,
    status: 'contrarian-opportunity', affectedCards: ['1989 Upper Deck Griffey', '1986 Fleer Jordan', '1984 Topps Mattingly']
  },
  {
    id: 'CS-07', thesisName: 'Baseball Prospect Breakout Bet', category: 'prospect-spec',
    crowdingLevel: 72, trend: 'increasing', participantEstimate: 15000, avgPositionSize: 350,
    totalCapitalAtRisk: 5250000, exitRiskScore: 65, detectedDate: '2025-11-01', peakDate: null,
    status: 'moderately-crowded', affectedCards: ['2023 Bowman Chrome Elly', '2024 Bowman 1st Salas', '2023 Bowman Skenes']
  },
  {
    id: 'CS-08', thesisName: 'Soccer Card Crossover', category: 'narrative-momentum',
    crowdingLevel: 55, trend: 'stable', participantEstimate: 6200, avgPositionSize: 600,
    totalCapitalAtRisk: 3720000, exitRiskScore: 48, detectedDate: '2025-07-15', peakDate: null,
    status: 'normal', affectedCards: ['2018 Topps Chrome Mbappe', '2020 Topps Chrome Haaland']
  },
  {
    id: 'CS-09', thesisName: 'LeBron Legacy Play', category: 'player-hype',
    crowdingLevel: 82, trend: 'decreasing', participantEstimate: 9800, avgPositionSize: 5500,
    totalCapitalAtRisk: 53900000, exitRiskScore: 70, detectedDate: '2024-12-01', peakDate: '2025-11-01',
    status: 'crowded', affectedCards: ['2003 Topps Chrome LeBron RC', '2003 Bowman Chrome LeBron RC']
  },
  {
    id: 'CS-10', thesisName: 'Modern Set Completion Chase', category: 'set-chase',
    crowdingLevel: 62, trend: 'stable', participantEstimate: 4500, avgPositionSize: 1200,
    totalCapitalAtRisk: 5400000, exitRiskScore: 42, detectedDate: '2025-05-01', peakDate: null,
    status: 'moderately-crowded', affectedCards: ['2024 Topps Series 1 SP variants', '2024 Prizm Color Parallels']
  },
  {
    id: 'CS-11', thesisName: 'Grading Submission Arb', category: 'grade-premium',
    crowdingLevel: 25, trend: 'decreasing', participantEstimate: 2800, avgPositionSize: 300,
    totalCapitalAtRisk: 840000, exitRiskScore: 18, detectedDate: '2025-04-01', peakDate: '2025-08-01',
    status: 'contrarian-opportunity', affectedCards: ['Various raw-to-grade candidates']
  },
  {
    id: 'CS-12', thesisName: 'WNBA Emerging Market', category: 'narrative-momentum',
    crowdingLevel: 42, trend: 'increasing', participantEstimate: 3800, avgPositionSize: 250,
    totalCapitalAtRisk: 950000, exitRiskScore: 30, detectedDate: '2026-02-01', peakDate: null,
    status: 'normal', affectedCards: ['2024 Prizm Caitlin Clark RC', '2023 Bowman Chrome Angel Reese']
  },
];

const thesisDensities: ThesisDensity[] = crowdingSignals.map(cs => {
  const weeks: { week: string; density: number; mentions: number }[] = [];
  for (let w = 11; w >= 0; w--) {
    const date = new Date(2026, 3, 18 - w * 7);
    weeks.push({
      week: `W${12 - w}`,
      density: Math.max(10, cs.crowdingLevel + Math.round((Math.random() - 0.5) * 20)),
      mentions: Math.round(cs.participantEstimate * 0.05 * (0.8 + Math.random() * 0.4)),
    });
  }
  return {
    thesisId: cs.id,
    thesisName: cs.thesisName,
    densityScore: cs.crowdingLevel,
    socialMentions: Math.round(cs.participantEstimate * 0.15),
    listingGrowth: Math.round((cs.trend === 'increasing' ? 15 : cs.trend === 'decreasing' ? -8 : 2) + (Math.random() - 0.5) * 10),
    priceCorrelation: Math.round((0.5 + cs.crowdingLevel / 200) * 100) / 100,
    volumeConcentration: Math.round(cs.crowdingLevel * 0.8 + Math.random() * 10),
    newEntrants30d: Math.round(cs.participantEstimate * (cs.trend === 'increasing' ? 0.08 : cs.trend === 'decreasing' ? 0.02 : 0.04)),
    heatMap: weeks,
  };
});

const exitRisks: ExitRisk[] = crowdingSignals.filter(cs => cs.exitRiskScore > 40).map(cs => ({
  thesisId: cs.id,
  thesisName: cs.thesisName,
  exitRiskScore: cs.exitRiskScore,
  liquidityAtExit: Math.round(100 - cs.exitRiskScore * 0.8),
  estimatedSlippage: Math.round(cs.exitRiskScore * 0.15 * 10) / 10,
  cascadeRisk: Math.round(cs.crowdingLevel * cs.exitRiskScore / 100),
  timeToExit: cs.exitRiskScore > 75 ? '15-30 days' : cs.exitRiskScore > 50 ? '7-14 days' : '3-7 days',
  worstCaseDrawdown: Math.round(cs.exitRiskScore * 0.5),
  scenario: cs.exitRiskScore > 75 ? 'Player injury or scandal triggers mass exit' : cs.exitRiskScore > 50 ? 'Market rotation away from thesis' : 'Gradual sentiment shift',
  mitigationSteps: [
    'Reduce position size by 25-50%',
    'Set trailing stop losses at 15% below current',
    'Diversify into uncorrelated theses',
    'Monitor social sentiment for early warning signs',
  ],
}));

const crowdingHistory: CrowdingHistory[] = [
  { month: '2025-05', avgCrowdingLevel: 52, crowdedTheses: 2, contrarianPlays: 3, avgExitRisk: 38, capitalAtRisk: 85000000, crowdingEvents: 1 },
  { month: '2025-06', avgCrowdingLevel: 55, crowdedTheses: 3, contrarianPlays: 2, avgExitRisk: 42, capitalAtRisk: 92000000, crowdingEvents: 1 },
  { month: '2025-07', avgCrowdingLevel: 58, crowdedTheses: 3, contrarianPlays: 2, avgExitRisk: 45, capitalAtRisk: 98000000, crowdingEvents: 2 },
  { month: '2025-08', avgCrowdingLevel: 62, crowdedTheses: 4, contrarianPlays: 1, avgExitRisk: 48, capitalAtRisk: 110000000, crowdingEvents: 2 },
  { month: '2025-09', avgCrowdingLevel: 65, crowdedTheses: 4, contrarianPlays: 1, avgExitRisk: 52, capitalAtRisk: 125000000, crowdingEvents: 3 },
  { month: '2025-10', avgCrowdingLevel: 68, crowdedTheses: 5, contrarianPlays: 1, avgExitRisk: 55, capitalAtRisk: 135000000, crowdingEvents: 2 },
  { month: '2025-11', avgCrowdingLevel: 70, crowdedTheses: 5, contrarianPlays: 2, avgExitRisk: 58, capitalAtRisk: 142000000, crowdingEvents: 3 },
  { month: '2025-12', avgCrowdingLevel: 66, crowdedTheses: 4, contrarianPlays: 2, avgExitRisk: 52, capitalAtRisk: 128000000, crowdingEvents: 1 },
  { month: '2026-01', avgCrowdingLevel: 63, crowdedTheses: 4, contrarianPlays: 2, avgExitRisk: 50, capitalAtRisk: 120000000, crowdingEvents: 2 },
  { month: '2026-02', avgCrowdingLevel: 61, crowdedTheses: 4, contrarianPlays: 2, avgExitRisk: 48, capitalAtRisk: 118000000, crowdingEvents: 1 },
  { month: '2026-03', avgCrowdingLevel: 64, crowdedTheses: 4, contrarianPlays: 2, avgExitRisk: 51, capitalAtRisk: 125000000, crowdingEvents: 2 },
  { month: '2026-04', avgCrowdingLevel: 62, crowdedTheses: 4, contrarianPlays: 2, avgExitRisk: 49, capitalAtRisk: 122000000, crowdingEvents: 1 },
];

export function getCrowdingSignals(): CrowdingSignal[] { return crowdingSignals; }
export function getThesisDensities(): ThesisDensity[] { return thesisDensities; }
export function getExitRisks(): ExitRisk[] { return exitRisks; }
export function getCrowdingHistory(): CrowdingHistory[] { return crowdingHistory; }
export function getCrowdedCount(): number { return crowdingSignals.filter(c => c.status === 'crowded').length; }
export function getContrarianCount(): number { return crowdingSignals.filter(c => c.status === 'contrarian-opportunity').length; }
export function getAvgCrowdingLevel(): number { return Math.round(crowdingSignals.reduce((s, c) => s + c.crowdingLevel, 0) / crowdingSignals.length); }
export function getTotalCapitalAtRisk(): number { return crowdingSignals.reduce((s, c) => s + c.totalCapitalAtRisk, 0); }
