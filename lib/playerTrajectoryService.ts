// ── Types ────────────────────────────────────────────────────────────────────────

export interface TrajectoryProjection {
  year: number;
  optimistic: number;
  baseline: number;
  pessimistic: number;
  cardValue: number;
}

export interface PlayerComparable {
  name: string;
  similarity: number;   // 0-100 similarity score
  peakAge: number;
  careerArc: 'rising' | 'peak' | 'declining' | 'breakout' | 'steady';
}

export interface TrajectoryFactor {
  label: string;
  impact: number;        // -100 to +100
  description: string;
}

export interface PlayerTrajectoryData {
  playerId: string;
  playerName: string;
  sport: string;
  position: string;
  age: number;
  currentCardValue: number;
  trajectoryScore: number;  // 0-100
  projections: TrajectoryProjection[];
  comparables: PlayerComparable[];
  factors: TrajectoryFactor[];
  peakProjectedAge: number;
  peakProjectedValue: number;
  riskLevel: 'low' | 'moderate' | 'high';
}

// ── Mock Data ────────────────────────────────────────────────────────────────────

const MOCK_PLAYERS: Record<string, PlayerTrajectoryData> = {
  'p-001': {
    playerId: 'p-001',
    playerName: 'Jayson Tatum',
    sport: 'Basketball',
    position: 'SF',
    age: 27,
    currentCardValue: 485,
    trajectoryScore: 88,
    peakProjectedAge: 30,
    peakProjectedValue: 920,
    riskLevel: 'low',
    projections: [
      { year: 2026, optimistic: 540, baseline: 485, pessimistic: 420, cardValue: 485 },
      { year: 2027, optimistic: 640, baseline: 545, pessimistic: 390, cardValue: 545 },
      { year: 2028, optimistic: 780, baseline: 620, pessimistic: 370, cardValue: 620 },
      { year: 2029, optimistic: 920, baseline: 710, pessimistic: 350, cardValue: 710 },
      { year: 2030, optimistic: 950, baseline: 740, pessimistic: 330, cardValue: 740 },
      { year: 2031, optimistic: 900, baseline: 690, pessimistic: 310, cardValue: 690 },
      { year: 2032, optimistic: 830, baseline: 620, pessimistic: 280, cardValue: 620 },
      { year: 2033, optimistic: 750, baseline: 540, pessimistic: 250, cardValue: 540 },
      { year: 2034, optimistic: 680, baseline: 470, pessimistic: 220, cardValue: 470 },
      { year: 2035, optimistic: 620, baseline: 410, pessimistic: 200, cardValue: 410 },
    ],
    comparables: [
      { name: 'Paul George', similarity: 87, peakAge: 29, careerArc: 'peak' },
      { name: 'Kawhi Leonard', similarity: 82, peakAge: 28, careerArc: 'peak' },
      { name: 'Carmelo Anthony', similarity: 74, peakAge: 28, careerArc: 'declining' },
      { name: 'Tracy McGrady', similarity: 71, peakAge: 27, careerArc: 'declining' },
    ],
    factors: [
      { label: 'Age Curve', impact: 72, description: 'Entering prime years with 3-4 seasons of peak performance ahead' },
      { label: 'Performance Trend', impact: 85, description: 'Consistent All-NBA level production with upward trajectory' },
      { label: 'Injury Risk', impact: -15, description: 'Minor durability concerns but largely healthy career' },
      { label: 'Market Demand', impact: 65, description: 'High demand for Celtics championship window cards' },
      { label: 'Legacy Potential', impact: 58, description: 'Top-75 all-time trajectory if current pace maintained' },
    ],
  },
  'p-002': {
    playerId: 'p-002',
    playerName: 'Victor Wembanyama',
    sport: 'Basketball',
    position: 'C',
    age: 21,
    currentCardValue: 1250,
    trajectoryScore: 96,
    peakProjectedAge: 28,
    peakProjectedValue: 4800,
    riskLevel: 'moderate',
    projections: [
      { year: 2026, optimistic: 1600, baseline: 1250, pessimistic: 900, cardValue: 1250 },
      { year: 2027, optimistic: 2200, baseline: 1650, pessimistic: 850, cardValue: 1650 },
      { year: 2028, optimistic: 3000, baseline: 2100, pessimistic: 800, cardValue: 2100 },
      { year: 2029, optimistic: 3800, baseline: 2600, pessimistic: 780, cardValue: 2600 },
      { year: 2030, optimistic: 4500, baseline: 3100, pessimistic: 750, cardValue: 3100 },
      { year: 2031, optimistic: 4800, baseline: 3300, pessimistic: 720, cardValue: 3300 },
      { year: 2032, optimistic: 4600, baseline: 3100, pessimistic: 700, cardValue: 3100 },
      { year: 2033, optimistic: 4200, baseline: 2800, pessimistic: 680, cardValue: 2800 },
      { year: 2034, optimistic: 3800, baseline: 2500, pessimistic: 650, cardValue: 2500 },
      { year: 2035, optimistic: 3500, baseline: 2200, pessimistic: 620, cardValue: 2200 },
    ],
    comparables: [
      { name: 'Tim Duncan', similarity: 78, peakAge: 27, careerArc: 'steady' },
      { name: 'Kevin Garnett', similarity: 75, peakAge: 28, careerArc: 'peak' },
      { name: 'Anthony Davis', similarity: 72, peakAge: 27, careerArc: 'declining' },
      { name: 'Giannis Antetokounmpo', similarity: 69, peakAge: 28, careerArc: 'peak' },
    ],
    factors: [
      { label: 'Age Curve', impact: 95, description: 'Generational talent at just 21 — enormous upside runway' },
      { label: 'Performance Trend', impact: 90, description: 'Historic rookie numbers with rapid year-over-year improvement' },
      { label: 'Injury Risk', impact: -35, description: 'Frame concerns for a 7\'4" player over long career' },
      { label: 'Market Demand', impact: 92, description: 'Global appeal and generational hype driving premium demand' },
      { label: 'Legacy Potential', impact: 88, description: 'All-time great ceiling if health permits' },
    ],
  },
  'p-003': {
    playerId: 'p-003',
    playerName: 'Gunnar Henderson',
    sport: 'Baseball',
    position: 'SS',
    age: 24,
    currentCardValue: 320,
    trajectoryScore: 84,
    peakProjectedAge: 29,
    peakProjectedValue: 780,
    riskLevel: 'low',
    projections: [
      { year: 2026, optimistic: 380, baseline: 320, pessimistic: 260, cardValue: 320 },
      { year: 2027, optimistic: 470, baseline: 380, pessimistic: 240, cardValue: 380 },
      { year: 2028, optimistic: 580, baseline: 450, pessimistic: 225, cardValue: 450 },
      { year: 2029, optimistic: 700, baseline: 530, pessimistic: 210, cardValue: 530 },
      { year: 2030, optimistic: 780, baseline: 580, pessimistic: 200, cardValue: 580 },
      { year: 2031, optimistic: 750, baseline: 550, pessimistic: 190, cardValue: 550 },
      { year: 2032, optimistic: 700, baseline: 500, pessimistic: 180, cardValue: 500 },
      { year: 2033, optimistic: 640, baseline: 440, pessimistic: 170, cardValue: 440 },
      { year: 2034, optimistic: 570, baseline: 380, pessimistic: 160, cardValue: 380 },
      { year: 2035, optimistic: 500, baseline: 330, pessimistic: 150, cardValue: 330 },
    ],
    comparables: [
      { name: 'Corey Seager', similarity: 83, peakAge: 28, careerArc: 'peak' },
      { name: 'Carlos Correa', similarity: 79, peakAge: 27, careerArc: 'steady' },
      { name: 'Alex Rodriguez', similarity: 68, peakAge: 30, careerArc: 'breakout' },
      { name: 'Troy Tulowitzki', similarity: 65, peakAge: 27, careerArc: 'declining' },
    ],
    factors: [
      { label: 'Age Curve', impact: 82, description: 'Five peak seasons ahead at premium position' },
      { label: 'Performance Trend', impact: 78, description: 'Elite power-speed combo with improving plate discipline' },
      { label: 'Injury Risk', impact: -10, description: 'Durable build and clean injury history' },
      { label: 'Market Demand', impact: 60, description: 'Rising star in a competitive Orioles window' },
      { label: 'Legacy Potential', impact: 52, description: 'Hall of Fame trajectory if pace maintained through age 32' },
    ],
  },
  'p-004': {
    playerId: 'p-004',
    playerName: 'Patrick Mahomes',
    sport: 'Football',
    position: 'QB',
    age: 29,
    currentCardValue: 1800,
    trajectoryScore: 91,
    peakProjectedAge: 31,
    peakProjectedValue: 2600,
    riskLevel: 'low',
    projections: [
      { year: 2026, optimistic: 2100, baseline: 1800, pessimistic: 1500, cardValue: 1800 },
      { year: 2027, optimistic: 2400, baseline: 2000, pessimistic: 1400, cardValue: 2000 },
      { year: 2028, optimistic: 2600, baseline: 2100, pessimistic: 1300, cardValue: 2100 },
      { year: 2029, optimistic: 2500, baseline: 2000, pessimistic: 1200, cardValue: 2000 },
      { year: 2030, optimistic: 2300, baseline: 1850, pessimistic: 1100, cardValue: 1850 },
      { year: 2031, optimistic: 2100, baseline: 1700, pessimistic: 1000, cardValue: 1700 },
      { year: 2032, optimistic: 1900, baseline: 1550, pessimistic: 900, cardValue: 1550 },
      { year: 2033, optimistic: 1800, baseline: 1450, pessimistic: 850, cardValue: 1450 },
      { year: 2034, optimistic: 1700, baseline: 1350, pessimistic: 800, cardValue: 1350 },
      { year: 2035, optimistic: 1650, baseline: 1300, pessimistic: 780, cardValue: 1300 },
    ],
    comparables: [
      { name: 'Tom Brady', similarity: 85, peakAge: 33, careerArc: 'steady' },
      { name: 'Peyton Manning', similarity: 80, peakAge: 31, careerArc: 'peak' },
      { name: 'Aaron Rodgers', similarity: 76, peakAge: 30, careerArc: 'declining' },
      { name: 'Drew Brees', similarity: 72, peakAge: 32, careerArc: 'steady' },
    ],
    factors: [
      { label: 'Age Curve', impact: 68, description: 'QBs age gracefully — 5+ elite seasons likely remain' },
      { label: 'Performance Trend', impact: 92, description: 'Dynasty-caliber production with multiple rings' },
      { label: 'Injury Risk', impact: -20, description: 'Ankle and knee history but manageable long-term' },
      { label: 'Market Demand', impact: 88, description: 'Arguably the GOAT in real-time — unmatched collector demand' },
      { label: 'Legacy Potential', impact: 95, description: 'First-ballot HOF lock with Brady-level legacy upside' },
    ],
  },
  'p-005': {
    playerId: 'p-005',
    playerName: 'Connor Bedard',
    sport: 'Hockey',
    position: 'C',
    age: 20,
    currentCardValue: 680,
    trajectoryScore: 82,
    peakProjectedAge: 27,
    peakProjectedValue: 1900,
    riskLevel: 'moderate',
    projections: [
      { year: 2026, optimistic: 820, baseline: 680, pessimistic: 500, cardValue: 680 },
      { year: 2027, optimistic: 1050, baseline: 820, pessimistic: 460, cardValue: 820 },
      { year: 2028, optimistic: 1350, baseline: 990, pessimistic: 430, cardValue: 990 },
      { year: 2029, optimistic: 1650, baseline: 1150, pessimistic: 400, cardValue: 1150 },
      { year: 2030, optimistic: 1900, baseline: 1300, pessimistic: 380, cardValue: 1300 },
      { year: 2031, optimistic: 1850, baseline: 1250, pessimistic: 360, cardValue: 1250 },
      { year: 2032, optimistic: 1700, baseline: 1100, pessimistic: 340, cardValue: 1100 },
      { year: 2033, optimistic: 1500, baseline: 950, pessimistic: 320, cardValue: 950 },
      { year: 2034, optimistic: 1300, baseline: 800, pessimistic: 300, cardValue: 800 },
      { year: 2035, optimistic: 1100, baseline: 680, pessimistic: 280, cardValue: 680 },
    ],
    comparables: [
      { name: 'Connor McDavid', similarity: 80, peakAge: 27, careerArc: 'peak' },
      { name: 'Sidney Crosby', similarity: 76, peakAge: 26, careerArc: 'steady' },
      { name: 'Nathan MacKinnon', similarity: 73, peakAge: 27, careerArc: 'breakout' },
      { name: 'Jack Eichel', similarity: 68, peakAge: 26, careerArc: 'steady' },
    ],
    factors: [
      { label: 'Age Curve', impact: 90, description: 'Just 20 years old with massive development runway' },
      { label: 'Performance Trend', impact: 70, description: 'Strong rookie year but needs continued progression' },
      { label: 'Injury Risk', impact: -25, description: 'Small frame for NHL physicality raises durability questions' },
      { label: 'Market Demand', impact: 75, description: 'Generational Canadian hockey talent driving strong demand' },
      { label: 'Legacy Potential', impact: 65, description: 'Crosby-level ceiling but needs playoff success to realize it' },
    ],
  },
  'p-006': {
    playerId: 'p-006',
    playerName: 'Chet Holmgren',
    sport: 'Basketball',
    position: 'PF/C',
    age: 23,
    currentCardValue: 210,
    trajectoryScore: 76,
    peakProjectedAge: 28,
    peakProjectedValue: 650,
    riskLevel: 'high',
    projections: [
      { year: 2026, optimistic: 310, baseline: 210, pessimistic: 140, cardValue: 210 },
      { year: 2027, optimistic: 420, baseline: 280, pessimistic: 120, cardValue: 280 },
      { year: 2028, optimistic: 540, baseline: 350, pessimistic: 105, cardValue: 350 },
      { year: 2029, optimistic: 650, baseline: 400, pessimistic: 95, cardValue: 400 },
      { year: 2030, optimistic: 620, baseline: 380, pessimistic: 85, cardValue: 380 },
      { year: 2031, optimistic: 580, baseline: 340, pessimistic: 80, cardValue: 340 },
      { year: 2032, optimistic: 520, baseline: 300, pessimistic: 75, cardValue: 300 },
      { year: 2033, optimistic: 450, baseline: 260, pessimistic: 70, cardValue: 260 },
      { year: 2034, optimistic: 380, baseline: 220, pessimistic: 65, cardValue: 220 },
      { year: 2035, optimistic: 320, baseline: 190, pessimistic: 60, cardValue: 190 },
    ],
    comparables: [
      { name: 'Kristaps Porzingis', similarity: 84, peakAge: 27, careerArc: 'breakout' },
      { name: 'Chris Bosh', similarity: 72, peakAge: 28, careerArc: 'peak' },
      { name: 'Dirk Nowitzki', similarity: 65, peakAge: 30, careerArc: 'steady' },
      { name: 'Yao Ming', similarity: 60, peakAge: 26, careerArc: 'declining' },
    ],
    factors: [
      { label: 'Age Curve', impact: 80, description: 'Young with five prime seasons ahead' },
      { label: 'Performance Trend', impact: 62, description: 'Flashes of elite two-way play but inconsistent' },
      { label: 'Injury Risk', impact: -55, description: 'Major foot injury history — significant long-term concern' },
      { label: 'Market Demand', impact: 45, description: 'Moderate demand, dependent on health and team success' },
      { label: 'Legacy Potential', impact: 40, description: 'All-Star ceiling but injury risk caps floor dramatically' },
    ],
  },
};

// ── Service Functions ────────────────────────────────────────────────────────────

export function getPlayerTrajectory(playerId: string): PlayerTrajectoryData | null {
  return MOCK_PLAYERS[playerId] ?? null;
}

export function getAllPlayerTrajectories(): PlayerTrajectoryData[] {
  return Object.values(MOCK_PLAYERS);
}

export function getComparablePlayers(playerId: string): PlayerComparable[] {
  const player = MOCK_PLAYERS[playerId];
  return player?.comparables ?? [];
}

export function getTrajectoryScore(playerId: string): number {
  const player = MOCK_PLAYERS[playerId];
  return player?.trajectoryScore ?? 0;
}

export function getTrajectoryFactors(playerId: string): TrajectoryFactor[] {
  const player = MOCK_PLAYERS[playerId];
  return player?.factors ?? [];
}

export function getTopProjectedPlayer(): PlayerTrajectoryData {
  const all = Object.values(MOCK_PLAYERS);
  return all.reduce((best, p) => (p.trajectoryScore > best.trajectoryScore ? p : best), all[0]);
}

export function getPlayerIds(): { id: string; name: string; sport: string }[] {
  return Object.values(MOCK_PLAYERS).map(p => ({
    id: p.playerId,
    name: p.playerName,
    sport: p.sport,
  }));
}

export default {
  getPlayerTrajectory,
  getAllPlayerTrajectories,
  getComparablePlayers,
  getTrajectoryScore,
  getTrajectoryFactors,
  getTopProjectedPlayer,
  getPlayerIds,
};
