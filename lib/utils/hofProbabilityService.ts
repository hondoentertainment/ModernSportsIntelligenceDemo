// ── Types ────────────────────────────────────────────────────────────────────────

export type HofSport = 'MLB' | 'NBA' | 'NFL' | 'NHL';
export type TrajectoryTrend = 'rising' | 'stable' | 'declining';

export interface HofCandidate {
  id: string;
  playerName: string;
  team: string;
  sport: HofSport;
  position: string;
  currentAge: number;
  yearsActive: number;
  hofProbability: number; // 0-100
  trajectoryTrend: TrajectoryTrend;
  careerStats: Record<string, number>;
  comparisonPlayers: string[];
  projectedInductionYear: number | null;
}

export interface HofComparable {
  id: string;
  hofMemberName: string;
  sport: HofSport;
  inductionYear: number;
  careerStats: Record<string, number>;
  similarityScore: number; // 0-100
}

export interface HofPricingModel {
  playerId: string;
  currentCardValue: number;
  hofPremiumMultiplier: number;
  projectedValueAtInduction: number;
  projectedValueIfMiss: number;
  breakEvenProbability: number;
  timeHorizon: string;
}

export interface HofStats {
  totalCandidatesTracked: number;
  avgProbability: number;
  highestProbabilityPlayer: string;
  portfolioHofExposure: number;
  premiumAtRisk: number;
}

// ── Mock Data: Candidates ────────────────────────────────────────────────────────

const MOCK_CANDIDATES: HofCandidate[] = [
  {
    id: 'hof-001',
    playerName: 'Shohei Ohtani',
    team: 'Los Angeles Dodgers',
    sport: 'MLB',
    position: 'DH/SP',
    currentAge: 31,
    yearsActive: 8,
    hofProbability: 94,
    trajectoryTrend: 'rising',
    careerStats: { WAR: 44.2, HR: 225, AVG: 0.275, ERA: 3.01, K: 608, OPS: 0.942 },
    comparisonPlayers: ['Babe Ruth', 'Ted Williams', 'Willie Mays'],
    projectedInductionYear: 2042,
  },
  {
    id: 'hof-002',
    playerName: 'Patrick Mahomes',
    team: 'Kansas City Chiefs',
    sport: 'NFL',
    position: 'QB',
    currentAge: 30,
    yearsActive: 8,
    hofProbability: 89,
    trajectoryTrend: 'stable',
    careerStats: { QBR: 78.5, PassYds: 31280, PassTD: 238, INT: 62, CompPct: 66.8, Wins: 82 },
    comparisonPlayers: ['Tom Brady', 'Joe Montana', 'Peyton Manning'],
    projectedInductionYear: 2041,
  },
  {
    id: 'hof-003',
    playerName: 'Victor Wembanyama',
    team: 'San Antonio Spurs',
    sport: 'NBA',
    position: 'C',
    currentAge: 22,
    yearsActive: 3,
    hofProbability: 72,
    trajectoryTrend: 'rising',
    careerStats: { PER: 26.8, PPG: 24.1, RPG: 10.8, BPG: 3.6, APG: 3.9, WS: 24.5 },
    comparisonPlayers: ['Tim Duncan', 'Hakeem Olajuwon', 'David Robinson'],
    projectedInductionYear: 2050,
  },
  {
    id: 'hof-004',
    playerName: 'Connor McDavid',
    team: 'Edmonton Oilers',
    sport: 'NHL',
    position: 'C',
    currentAge: 29,
    yearsActive: 11,
    hofProbability: 91,
    trajectoryTrend: 'stable',
    careerStats: { Goals: 385, Assists: 620, Points: 1005, PlusMinus: 112, PPG: 1.46, ArtRoss: 5 },
    comparisonPlayers: ['Wayne Gretzky', 'Mario Lemieux', 'Sidney Crosby'],
    projectedInductionYear: 2040,
  },
  {
    id: 'hof-005',
    playerName: 'Mookie Betts',
    team: 'Los Angeles Dodgers',
    sport: 'MLB',
    position: 'RF',
    currentAge: 33,
    yearsActive: 12,
    hofProbability: 78,
    trajectoryTrend: 'stable',
    careerStats: { WAR: 52.8, HR: 248, AVG: 0.289, SB: 165, OPS: 0.883, GoldGloves: 6 },
    comparisonPlayers: ['Roberto Clemente', 'Andre Dawson', 'Larry Walker'],
    projectedInductionYear: 2039,
  },
  {
    id: 'hof-006',
    playerName: 'Luka Doncic',
    team: 'Los Angeles Lakers',
    sport: 'NBA',
    position: 'PG',
    currentAge: 27,
    yearsActive: 8,
    hofProbability: 85,
    trajectoryTrend: 'stable',
    careerStats: { PER: 27.4, PPG: 28.7, RPG: 8.8, APG: 8.6, WS: 52.3, AllStar: 6 },
    comparisonPlayers: ['Larry Bird', 'LeBron James', 'Magic Johnson'],
    projectedInductionYear: 2044,
  },
  {
    id: 'hof-007',
    playerName: 'Josh Allen',
    team: 'Buffalo Bills',
    sport: 'NFL',
    position: 'QB',
    currentAge: 30,
    yearsActive: 8,
    hofProbability: 62,
    trajectoryTrend: 'rising',
    careerStats: { QBR: 63.2, PassYds: 28450, PassTD: 210, RushTD: 52, INT: 78, Wins: 68 },
    comparisonPlayers: ['John Elway', 'Steve Young', 'Dan Marino'],
    projectedInductionYear: 2042,
  },
  {
    id: 'hof-008',
    playerName: 'Auston Matthews',
    team: 'Toronto Maple Leafs',
    sport: 'NHL',
    position: 'C',
    currentAge: 28,
    yearsActive: 10,
    hofProbability: 76,
    trajectoryTrend: 'stable',
    careerStats: { Goals: 368, Assists: 275, Points: 643, PlusMinus: 67, PPG: 1.18, Richard: 3 },
    comparisonPlayers: ['Alex Ovechkin', 'Brett Hull', 'Mike Bossy'],
    projectedInductionYear: 2043,
  },
  {
    id: 'hof-009',
    playerName: 'Ronald Acuna Jr.',
    team: 'Atlanta Braves',
    sport: 'MLB',
    position: 'OF',
    currentAge: 28,
    yearsActive: 8,
    hofProbability: 68,
    trajectoryTrend: 'rising',
    careerStats: { WAR: 34.6, HR: 178, AVG: 0.281, SB: 142, OPS: 0.895, MVP: 1 },
    comparisonPlayers: ['Ken Griffey Jr.', 'Mike Trout', 'Hank Aaron'],
    projectedInductionYear: 2044,
  },
  {
    id: 'hof-010',
    playerName: 'Jayson Tatum',
    team: 'Boston Celtics',
    sport: 'NBA',
    position: 'SF',
    currentAge: 28,
    yearsActive: 9,
    hofProbability: 74,
    trajectoryTrend: 'stable',
    careerStats: { PER: 23.1, PPG: 24.2, RPG: 7.2, APG: 4.6, WS: 48.7, AllStar: 6 },
    comparisonPlayers: ['Paul Pierce', 'Carmelo Anthony', 'Kawhi Leonard'],
    projectedInductionYear: 2043,
  },
  {
    id: 'hof-011',
    playerName: 'Cale Makar',
    team: 'Colorado Avalanche',
    sport: 'NHL',
    position: 'D',
    currentAge: 27,
    yearsActive: 7,
    hofProbability: 80,
    trajectoryTrend: 'rising',
    careerStats: { Goals: 118, Assists: 285, Points: 403, PlusMinus: 95, PPG: 1.02, Norris: 2 },
    comparisonPlayers: ['Bobby Orr', 'Nicklas Lidstrom', 'Ray Bourque'],
    projectedInductionYear: 2044,
  },
  {
    id: 'hof-012',
    playerName: 'Lamar Jackson',
    team: 'Baltimore Ravens',
    sport: 'NFL',
    position: 'QB',
    currentAge: 29,
    yearsActive: 8,
    hofProbability: 55,
    trajectoryTrend: 'declining',
    careerStats: { QBR: 61.8, PassYds: 22380, PassTD: 155, RushYds: 6820, MVP: 2, Wins: 72 },
    comparisonPlayers: ['Michael Vick', 'Randall Cunningham', 'Russell Wilson'],
    projectedInductionYear: null,
  },
];

// ── Mock Data: Comparables ───────────────────────────────────────────────────────

const MOCK_COMPARABLES: Record<string, HofComparable[]> = {
  'hof-001': [
    { id: 'comp-001', hofMemberName: 'Babe Ruth', sport: 'MLB', inductionYear: 1936, careerStats: { WAR: 182.5, HR: 714, AVG: 0.342, ERA: 2.28, OPS: 1.164 }, similarityScore: 88 },
    { id: 'comp-002', hofMemberName: 'Ted Williams', sport: 'MLB', inductionYear: 1966, careerStats: { WAR: 121.8, HR: 521, AVG: 0.344, OPS: 1.116, AllStar: 19 }, similarityScore: 76 },
    { id: 'comp-003', hofMemberName: 'Willie Mays', sport: 'MLB', inductionYear: 1979, careerStats: { WAR: 156.2, HR: 660, AVG: 0.302, OPS: 0.941, GoldGloves: 12 }, similarityScore: 72 },
  ],
  'hof-002': [
    { id: 'comp-004', hofMemberName: 'Tom Brady', sport: 'NFL', inductionYear: 2028, careerStats: { QBR: 77.6, PassYds: 89214, PassTD: 649, Rings: 7, MVP: 3 }, similarityScore: 82 },
    { id: 'comp-005', hofMemberName: 'Joe Montana', sport: 'NFL', inductionYear: 2000, careerStats: { QBR: 92.3, PassYds: 40551, PassTD: 273, Rings: 4, MVP: 2 }, similarityScore: 91 },
    { id: 'comp-006', hofMemberName: 'Peyton Manning', sport: 'NFL', inductionYear: 2021, careerStats: { QBR: 65.3, PassYds: 71940, PassTD: 539, Rings: 2, MVP: 5 }, similarityScore: 78 },
  ],
  'hof-003': [
    { id: 'comp-007', hofMemberName: 'Tim Duncan', sport: 'NBA', inductionYear: 2020, careerStats: { PER: 24.2, PPG: 19.0, RPG: 10.8, BPG: 2.2, Rings: 5 }, similarityScore: 85 },
    { id: 'comp-008', hofMemberName: 'Hakeem Olajuwon', sport: 'NBA', inductionYear: 2008, careerStats: { PER: 23.6, PPG: 21.8, RPG: 11.1, BPG: 3.1, Rings: 2 }, similarityScore: 90 },
    { id: 'comp-009', hofMemberName: 'David Robinson', sport: 'NBA', inductionYear: 2009, careerStats: { PER: 26.2, PPG: 21.1, RPG: 10.6, BPG: 3.0, Rings: 2 }, similarityScore: 87 },
  ],
  'hof-004': [
    { id: 'comp-010', hofMemberName: 'Wayne Gretzky', sport: 'NHL', inductionYear: 1999, careerStats: { Goals: 894, Assists: 1963, Points: 2857, ArtRoss: 10, MVP: 9 }, similarityScore: 79 },
    { id: 'comp-011', hofMemberName: 'Mario Lemieux', sport: 'NHL', inductionYear: 1997, careerStats: { Goals: 690, Assists: 1033, Points: 1723, ArtRoss: 6, MVP: 3 }, similarityScore: 86 },
    { id: 'comp-012', hofMemberName: 'Sidney Crosby', sport: 'NHL', inductionYear: 2028, careerStats: { Goals: 592, Assists: 1000, Points: 1592, ArtRoss: 2, MVP: 2 }, similarityScore: 93 },
  ],
  'hof-005': [
    { id: 'comp-013', hofMemberName: 'Roberto Clemente', sport: 'MLB', inductionYear: 1973, careerStats: { WAR: 94.5, HR: 240, AVG: 0.317, GoldGloves: 12, Hits: 3000 }, similarityScore: 74 },
    { id: 'comp-014', hofMemberName: 'Andre Dawson', sport: 'MLB', inductionYear: 2010, careerStats: { WAR: 64.8, HR: 438, AVG: 0.279, GoldGloves: 8, SB: 314 }, similarityScore: 80 },
    { id: 'comp-015', hofMemberName: 'Larry Walker', sport: 'MLB', inductionYear: 2020, careerStats: { WAR: 72.7, HR: 383, AVG: 0.313, OPS: 0.965, GoldGloves: 7 }, similarityScore: 82 },
  ],
  'hof-006': [
    { id: 'comp-016', hofMemberName: 'Larry Bird', sport: 'NBA', inductionYear: 1998, careerStats: { PER: 23.5, PPG: 24.3, RPG: 10.0, APG: 6.3, Rings: 3 }, similarityScore: 84 },
    { id: 'comp-017', hofMemberName: 'LeBron James', sport: 'NBA', inductionYear: 2030, careerStats: { PER: 27.2, PPG: 27.1, RPG: 7.5, APG: 7.4, Rings: 4 }, similarityScore: 88 },
    { id: 'comp-018', hofMemberName: 'Magic Johnson', sport: 'NBA', inductionYear: 2002, careerStats: { PER: 24.1, PPG: 19.5, RPG: 7.2, APG: 11.2, Rings: 5 }, similarityScore: 77 },
  ],
  'hof-007': [
    { id: 'comp-019', hofMemberName: 'John Elway', sport: 'NFL', inductionYear: 2004, careerStats: { QBR: 79.9, PassYds: 51475, PassTD: 300, RushTD: 33, Rings: 2 }, similarityScore: 85 },
    { id: 'comp-020', hofMemberName: 'Steve Young', sport: 'NFL', inductionYear: 2005, careerStats: { QBR: 96.8, PassYds: 33124, PassTD: 232, RushYds: 4239, Rings: 3 }, similarityScore: 78 },
    { id: 'comp-021', hofMemberName: 'Dan Marino', sport: 'NFL', inductionYear: 2005, careerStats: { QBR: 86.4, PassYds: 61361, PassTD: 420, INT: 252, Rings: 0 }, similarityScore: 72 },
  ],
  'hof-008': [
    { id: 'comp-022', hofMemberName: 'Alex Ovechkin', sport: 'NHL', inductionYear: 2030, careerStats: { Goals: 868, Assists: 660, Points: 1528, Richard: 9, MVP: 3 }, similarityScore: 81 },
    { id: 'comp-023', hofMemberName: 'Brett Hull', sport: 'NHL', inductionYear: 2009, careerStats: { Goals: 741, Assists: 650, Points: 1391, Richard: 1, Rings: 2 }, similarityScore: 83 },
    { id: 'comp-024', hofMemberName: 'Mike Bossy', sport: 'NHL', inductionYear: 1991, careerStats: { Goals: 573, Assists: 553, Points: 1126, Rings: 4, GPG: 0.762 }, similarityScore: 79 },
  ],
  'hof-009': [
    { id: 'comp-025', hofMemberName: 'Ken Griffey Jr.', sport: 'MLB', inductionYear: 2016, careerStats: { WAR: 83.8, HR: 630, AVG: 0.284, GoldGloves: 10, AllStar: 13 }, similarityScore: 86 },
    { id: 'comp-026', hofMemberName: 'Mike Trout', sport: 'MLB', inductionYear: 2035, careerStats: { WAR: 85.2, HR: 378, AVG: 0.301, OPS: 0.999, MVP: 3 }, similarityScore: 83 },
    { id: 'comp-027', hofMemberName: 'Hank Aaron', sport: 'MLB', inductionYear: 1982, careerStats: { WAR: 143.1, HR: 755, AVG: 0.305, Hits: 3771, RBI: 2297 }, similarityScore: 68 },
  ],
  'hof-010': [
    { id: 'comp-028', hofMemberName: 'Paul Pierce', sport: 'NBA', inductionYear: 2021, careerStats: { PER: 20.3, PPG: 19.7, RPG: 5.6, APG: 3.5, Rings: 1 }, similarityScore: 82 },
    { id: 'comp-029', hofMemberName: 'Carmelo Anthony', sport: 'NBA', inductionYear: 2028, careerStats: { PER: 20.3, PPG: 22.5, RPG: 6.2, APG: 2.7, AllStar: 10 }, similarityScore: 79 },
    { id: 'comp-030', hofMemberName: 'Kawhi Leonard', sport: 'NBA', inductionYear: 2032, careerStats: { PER: 23.8, PPG: 20.5, RPG: 6.4, APG: 3.0, Rings: 2 }, similarityScore: 85 },
  ],
  'hof-011': [
    { id: 'comp-031', hofMemberName: 'Bobby Orr', sport: 'NHL', inductionYear: 1979, careerStats: { Goals: 270, Assists: 645, Points: 915, Norris: 8, MVP: 3 }, similarityScore: 80 },
    { id: 'comp-032', hofMemberName: 'Nicklas Lidstrom', sport: 'NHL', inductionYear: 2015, careerStats: { Goals: 264, Assists: 878, Points: 1142, Norris: 7, Rings: 4 }, similarityScore: 87 },
    { id: 'comp-033', hofMemberName: 'Ray Bourque', sport: 'NHL', inductionYear: 2004, careerStats: { Goals: 410, Assists: 1169, Points: 1579, Norris: 5, Rings: 1 }, similarityScore: 76 },
  ],
  'hof-012': [
    { id: 'comp-034', hofMemberName: 'Michael Vick', sport: 'NFL', inductionYear: 0, careerStats: { QBR: 75.7, PassYds: 22464, PassTD: 133, RushYds: 6109, ProBowl: 4 }, similarityScore: 88 },
    { id: 'comp-035', hofMemberName: 'Randall Cunningham', sport: 'NFL', inductionYear: 0, careerStats: { QBR: 81.5, PassYds: 29979, PassTD: 207, RushYds: 4928, ProBowl: 4 }, similarityScore: 75 },
    { id: 'comp-036', hofMemberName: 'Russell Wilson', sport: 'NFL', inductionYear: 0, careerStats: { QBR: 100.3, PassYds: 43653, PassTD: 334, RushTD: 25, Rings: 1 }, similarityScore: 71 },
  ],
};

// ── Mock Data: Pricing Models ────────────────────────────────────────────────────

const MOCK_PRICING: Record<string, HofPricingModel> = {
  'hof-001': { playerId: 'hof-001', currentCardValue: 2850, hofPremiumMultiplier: 3.8, projectedValueAtInduction: 10830, projectedValueIfMiss: 1420, breakEvenProbability: 34, timeHorizon: '16 years' },
  'hof-002': { playerId: 'hof-002', currentCardValue: 1920, hofPremiumMultiplier: 3.2, projectedValueAtInduction: 6144, projectedValueIfMiss: 960, breakEvenProbability: 38, timeHorizon: '15 years' },
  'hof-003': { playerId: 'hof-003', currentCardValue: 3200, hofPremiumMultiplier: 4.5, projectedValueAtInduction: 14400, projectedValueIfMiss: 1280, breakEvenProbability: 28, timeHorizon: '24 years' },
  'hof-004': { playerId: 'hof-004', currentCardValue: 1680, hofPremiumMultiplier: 3.4, projectedValueAtInduction: 5712, projectedValueIfMiss: 840, breakEvenProbability: 36, timeHorizon: '14 years' },
  'hof-005': { playerId: 'hof-005', currentCardValue: 890, hofPremiumMultiplier: 2.6, projectedValueAtInduction: 2314, projectedValueIfMiss: 445, breakEvenProbability: 42, timeHorizon: '13 years' },
  'hof-006': { playerId: 'hof-006', currentCardValue: 2100, hofPremiumMultiplier: 3.6, projectedValueAtInduction: 7560, projectedValueIfMiss: 1050, breakEvenProbability: 32, timeHorizon: '18 years' },
  'hof-007': { playerId: 'hof-007', currentCardValue: 780, hofPremiumMultiplier: 2.8, projectedValueAtInduction: 2184, projectedValueIfMiss: 390, breakEvenProbability: 45, timeHorizon: '16 years' },
  'hof-008': { playerId: 'hof-008', currentCardValue: 1150, hofPremiumMultiplier: 2.9, projectedValueAtInduction: 3335, projectedValueIfMiss: 575, breakEvenProbability: 40, timeHorizon: '17 years' },
  'hof-009': { playerId: 'hof-009', currentCardValue: 1420, hofPremiumMultiplier: 3.1, projectedValueAtInduction: 4402, projectedValueIfMiss: 710, breakEvenProbability: 39, timeHorizon: '18 years' },
  'hof-010': { playerId: 'hof-010', currentCardValue: 960, hofPremiumMultiplier: 2.7, projectedValueAtInduction: 2592, projectedValueIfMiss: 480, breakEvenProbability: 43, timeHorizon: '17 years' },
  'hof-011': { playerId: 'hof-011', currentCardValue: 1340, hofPremiumMultiplier: 3.3, projectedValueAtInduction: 4422, projectedValueIfMiss: 670, breakEvenProbability: 37, timeHorizon: '18 years' },
  'hof-012': { playerId: 'hof-012', currentCardValue: 620, hofPremiumMultiplier: 2.4, projectedValueAtInduction: 1488, projectedValueIfMiss: 310, breakEvenProbability: 48, timeHorizon: '16 years' },
};

// ── Service Functions ────────────────────────────────────────────────────────────

export function getHofCandidates(): HofCandidate[] {
  return MOCK_CANDIDATES;
}

export function getHofCandidate(id: string): HofCandidate | undefined {
  return MOCK_CANDIDATES.find((c) => c.id === id);
}

export function getHofComparables(playerId: string): HofComparable[] {
  return MOCK_COMPARABLES[playerId] ?? [];
}

export function getHofPricingModel(playerId: string): HofPricingModel | undefined {
  return MOCK_PRICING[playerId];
}

export function getHofStats(): HofStats {
  const candidates = MOCK_CANDIDATES;
  const totalProb = candidates.reduce((sum, c) => sum + c.hofProbability, 0);
  const avgProb = Math.round(totalProb / candidates.length);
  const highest = candidates.reduce((best, c) => (c.hofProbability > best.hofProbability ? c : best), candidates[0]);

  const totalExposure = Object.values(MOCK_PRICING).reduce((sum, p) => sum + p.currentCardValue, 0);
  const premiumAtRisk = Object.values(MOCK_PRICING).reduce(
    (sum, p) => sum + (p.projectedValueAtInduction - p.currentCardValue),
    0,
  );

  return {
    totalCandidatesTracked: candidates.length,
    avgProbability: avgProb,
    highestProbabilityPlayer: highest.playerName,
    portfolioHofExposure: totalExposure,
    premiumAtRisk,
  };
}

export function getTopCandidatesBySport(sport: HofSport): HofCandidate[] {
  return MOCK_CANDIDATES
    .filter((c) => c.sport === sport)
    .sort((a, b) => b.hofProbability - a.hofProbability);
}

export function calculateHofPremium(probability: number): number {
  // Non-linear premium curve — probability above 80% triggers exponential premium growth
  if (probability >= 90) return 3.5 + (probability - 90) * 0.15;
  if (probability >= 80) return 2.8 + (probability - 80) * 0.07;
  if (probability >= 60) return 1.8 + (probability - 60) * 0.05;
  if (probability >= 40) return 1.2 + (probability - 40) * 0.03;
  return 1.0 + probability * 0.005;
}
