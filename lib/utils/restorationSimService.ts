// @ts-nocheck
// AI Card Restoration Simulator Service
// Simulates card restoration outcomes, estimates costs/ROI, and provides
// visual before/after analysis for surface, corner, edge, and centering improvements.

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CardCondition {
  id: string;
  cardName: string;
  player: string;
  year: number;
  currentGrade: number;
  currentSubgrades: {
    centering: number;
    corners: number;
    edges: number;
    surface: number;
  };
  currentValue: number;
  imageDescription: string;
}

export interface GradeImprovement {
  attribute: 'centering' | 'corners' | 'edges' | 'surface';
  currentScore: number;
  projectedScore: number;
  technique: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  cost: number;
  successRate: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RestorationSimulation {
  cardId: string;
  targetGrade: number;
  probability: number;
  estimatedCost: number;
  estimatedNewValue: number;
  roi: number;
  timeframeDays: number;
  riskLevel: RiskLevel;
  improvements: GradeImprovement[];
}

export interface RestorationTechnique {
  id: string;
  name: string;
  category: 'surface' | 'edge' | 'corner' | 'centering';
  description: string;
  avgCost: number;
  avgSuccessRate: number;
  riskFactor: number;
  applicableDefects: string[];
}

export interface RegradeAnalysis {
  cardId: string;
  currentGrade: number;
  gradeDistribution: { grade: number; probability: number }[];
  expectedValue: number;
  varianceRange: [number, number];
  recommendation: 'regrade' | 'hold' | 'sell-as-is';
}

export interface RestorationROIScenario {
  scenario: 'best' | 'likely' | 'worst';
  targetGrade: number;
  probability: number;
  cost: number;
  newValue: number;
  netROI: number;
}

export interface BeforeAfterVisualization {
  attribute: 'centering' | 'corners' | 'edges' | 'surface';
  beforeScore: number;
  afterScore: number;
  visualDescriptor: string;
}

export interface BatchPlanItem {
  card: CardCondition;
  simulation: RestorationSimulation;
  priority: number;
  roiScenarios: RestorationROIScenario[];
}

export interface RestorationHistoryEntry {
  id: string;
  cardId: string;
  cardName: string;
  player: string;
  gradeBefore: number;
  gradeAfter: number;
  cost: number;
  valueBefore: number;
  valueAfter: number;
  roi: number;
  date: string;
  techniques: string[];
  success: boolean;
}

// ── Mock Data: Cards ──────────────────────────────────────────────────────────

const MOCK_CARDS: CardCondition[] = [
  {
    id: 'card-001',
    cardName: '1986 Fleer #57',
    player: 'Michael Jordan',
    year: 1986,
    currentGrade: 6,
    currentSubgrades: { centering: 7, corners: 5.5, edges: 6, surface: 6.5 },
    currentValue: 18500,
    imageDescription: 'Light surface wear along left border, slight corner rounding on bottom-left, minor edge chipping near top. Off-center 55/45 left-right.',
  },
  {
    id: 'card-002',
    cardName: '2003 Topps Chrome #111',
    player: 'LeBron James',
    year: 2003,
    currentGrade: 8,
    currentSubgrades: { centering: 8.5, corners: 7.5, edges: 8, surface: 8 },
    currentValue: 4200,
    imageDescription: 'Clean chrome surface with faint hairline scratch near nameplate. Minor corner softness on upper-right. Well-centered overall.',
  },
  {
    id: 'card-003',
    cardName: '1952 Topps #311',
    player: 'Mickey Mantle',
    year: 1952,
    currentGrade: 3,
    currentSubgrades: { centering: 4, corners: 2.5, edges: 3, surface: 3.5 },
    currentValue: 185000,
    imageDescription: 'Rounded corners throughout, moderate creasing across center. Surface scuffing with paper loss near bottom border. Off-center 60/40.',
  },
  {
    id: 'card-004',
    cardName: '2018 Panini Prizm #280',
    player: 'Luka Doncic',
    year: 2018,
    currentGrade: 9,
    currentSubgrades: { centering: 8.5, corners: 9, edges: 9.5, surface: 9 },
    currentValue: 1800,
    imageDescription: 'Near-mint condition. Slight centering drift to the right. Virtually flawless corners and edges. Minor surface print dot near jersey number.',
  },
  {
    id: 'card-005',
    cardName: '1989 Upper Deck #1',
    player: 'Ken Griffey Jr.',
    year: 1989,
    currentGrade: 7,
    currentSubgrades: { centering: 7.5, corners: 6.5, edges: 7, surface: 7 },
    currentValue: 320,
    imageDescription: 'Corner tip wear on all four corners, light edge whitening along top. Surface has minor roller marks from production. Centering acceptable.',
  },
  {
    id: 'card-006',
    cardName: '2009 Panini National Treasures #206',
    player: 'Stephen Curry',
    year: 2009,
    currentGrade: 8.5,
    currentSubgrades: { centering: 9, corners: 8, edges: 8.5, surface: 8.5 },
    currentValue: 28000,
    imageDescription: 'Thick stock card with patch window. Minor corner ding on lower-left. Edges clean with minimal whitening. Surface glossy with no scratches.',
  },
  {
    id: 'card-007',
    cardName: '1993 SP Foil #279',
    player: 'Derek Jeter',
    year: 1993,
    currentGrade: 7.5,
    currentSubgrades: { centering: 8, corners: 7, edges: 7.5, surface: 7.5 },
    currentValue: 2800,
    imageDescription: 'Foil card with light surface dimpling. Corner tips show slight wear. Edges have minor chipping on reverse. Centering well within spec.',
  },
  {
    id: 'card-008',
    cardName: '2000 Playoff Contenders #144',
    player: 'Tom Brady',
    year: 2000,
    currentGrade: 8,
    currentSubgrades: { centering: 7.5, corners: 8, edges: 8.5, surface: 8 },
    currentValue: 125000,
    imageDescription: 'Auto on-card signature crisp. Slight centering shift upward. Corners sharp. Edge wear minimal. Surface has faint wax residue near top.',
  },
  {
    id: 'card-009',
    cardName: '1979 O-Pee-Chee #18',
    player: 'Wayne Gretzky',
    year: 1979,
    currentGrade: 5,
    currentSubgrades: { centering: 5.5, corners: 4, edges: 5, surface: 5.5 },
    currentValue: 22000,
    imageDescription: 'Moderate corner wear with paper separation on lower-right. Edge nicks along bottom border. Surface has light staining near top-left.',
  },
  {
    id: 'card-010',
    cardName: '2020 Panini Prizm #339',
    player: 'Justin Herbert',
    year: 2020,
    currentGrade: 9.5,
    currentSubgrades: { centering: 9.5, corners: 9.5, edges: 10, surface: 9.5 },
    currentValue: 850,
    imageDescription: 'Gem-mint candidate. Perfect edges. Corners razor-sharp. Centering nearly perfect with slight 52/48 shift. Minute surface print inclusion.',
  },
  {
    id: 'card-011',
    cardName: '1969 Topps #260',
    player: 'Reggie Jackson',
    year: 1969,
    currentGrade: 4,
    currentSubgrades: { centering: 5, corners: 3.5, edges: 4, surface: 4.5 },
    currentValue: 3200,
    imageDescription: 'Heavy corner rounding on all four corners. Edge chipping visible along right border. Surface shows moderate handling wear with minor creasing.',
  },
  {
    id: 'card-012',
    cardName: '2019 Panini Mosaic #209',
    player: 'Ja Morant',
    year: 2019,
    currentGrade: 8,
    currentSubgrades: { centering: 7, corners: 8.5, edges: 8, surface: 8.5 },
    currentValue: 420,
    imageDescription: 'Mosaic pattern intact with good surface sheen. Off-center 58/42 left-right. Corners and edges in excellent condition. Clean back printing.',
  },
  {
    id: 'card-013',
    cardName: '1955 Topps #164',
    player: 'Roberto Clemente',
    year: 1955,
    currentGrade: 4.5,
    currentSubgrades: { centering: 5, corners: 4, edges: 4.5, surface: 5 },
    currentValue: 28000,
    imageDescription: 'Vintage card with expected age wear. Corner tips soft with minor paper loss. Edges show whitening throughout. Surface retains good color saturation.',
  },
  {
    id: 'card-014',
    cardName: '2017 Panini Prizm #269',
    player: 'Patrick Mahomes',
    year: 2017,
    currentGrade: 9,
    currentSubgrades: { centering: 9, corners: 9, edges: 9, surface: 8.5 },
    currentValue: 3200,
    imageDescription: 'Sharp example with consistent subgrades. Minor surface fingerprint smudge visible under magnification. Centering and structure excellent.',
  },
  {
    id: 'card-015',
    cardName: '1986 Fleer #68',
    player: 'Karl Malone',
    year: 1986,
    currentGrade: 8.5,
    currentSubgrades: { centering: 8.5, corners: 8, edges: 9, surface: 8.5 },
    currentValue: 180,
    imageDescription: 'Clean Fleer issue with slight corner softness on top-right. Edges and surface in strong condition. Well-centered with minor registration shift.',
  },
  {
    id: 'card-016',
    cardName: '2021 Panini Prizm #331',
    player: 'Trevor Lawrence',
    year: 2021,
    currentGrade: 8,
    currentSubgrades: { centering: 6.5, corners: 8.5, edges: 8.5, surface: 8.5 },
    currentValue: 280,
    imageDescription: 'Noticeably off-center 62/38 left-right. All other attributes strong. Surface pristine, corners sharp, edges clean.',
  },
  {
    id: 'card-017',
    cardName: '1996 Topps Chrome #138',
    player: 'Kobe Bryant',
    year: 1996,
    currentGrade: 7,
    currentSubgrades: { centering: 7.5, corners: 6.5, edges: 7, surface: 7 },
    currentValue: 4500,
    imageDescription: 'Chrome refractor shows light surface scratching under angle. Corner softness at bottom pair. Edges with minor whitening. Centering decent.',
  },
  {
    id: 'card-018',
    cardName: '2018 Topps Update #US250',
    player: 'Shohei Ohtani',
    year: 2018,
    currentGrade: 9,
    currentSubgrades: { centering: 9.5, corners: 8.5, edges: 9, surface: 9 },
    currentValue: 650,
    imageDescription: 'Well-centered RC with minor corner tip rounding on bottom-right. Edges and surface strong. Color registration perfect.',
  },
  {
    id: 'card-019',
    cardName: '1984 Topps #63',
    player: 'John Elway',
    year: 1984,
    currentGrade: 6.5,
    currentSubgrades: { centering: 7, corners: 6, edges: 6.5, surface: 6.5 },
    currentValue: 180,
    imageDescription: 'Multiple corner tip wear points. Edge whitening along bottom and right borders. Surface shows light wax staining. Acceptable centering.',
  },
  {
    id: 'card-020',
    cardName: '2022 Panini Prizm #275',
    player: 'Paolo Banchero',
    year: 2022,
    currentGrade: 9.5,
    currentSubgrades: { centering: 9, corners: 10, edges: 9.5, surface: 9.5 },
    currentValue: 120,
    imageDescription: 'Near-perfect modern card. Centering 53/47 top-bottom is the limiting factor. Corners, edges, surface all flawless under 10x magnification.',
  },
  {
    id: 'card-021',
    cardName: '1971 Topps #513',
    player: 'Nolan Ryan',
    year: 1971,
    currentGrade: 5.5,
    currentSubgrades: { centering: 6, corners: 5, edges: 5.5, surface: 6 },
    currentValue: 1400,
    imageDescription: 'Diamond cut with 55/45 centering. Corner rounding moderate with paper lift. Edge chipping on right side. Surface shows age toning but no creases.',
  },
  {
    id: 'card-022',
    cardName: '2020 Panini Select #44',
    player: 'Joe Burrow',
    year: 2020,
    currentGrade: 8.5,
    currentSubgrades: { centering: 8, corners: 8.5, edges: 9, surface: 8.5 },
    currentValue: 380,
    imageDescription: 'Concourse level with die-cut edges clean. Minor centering shift. Corners tight. Surface has faint roller line visible at angle.',
  },
];

// ── Mock Data: Techniques ─────────────────────────────────────────────────────

const MOCK_TECHNIQUES: RestorationTechnique[] = [
  {
    id: 'tech-001',
    name: 'Steam Pressing',
    category: 'surface',
    description: 'Uses controlled steam and pressure to flatten warps, bends, and light surface imperfections without altering the card stock.',
    avgCost: 25,
    avgSuccessRate: 0.82,
    riskFactor: 0.08,
    applicableDefects: ['warping', 'bowing', 'light creasing', 'roller marks'],
  },
  {
    id: 'tech-002',
    name: 'Humidity Chamber Treatment',
    category: 'surface',
    description: 'Gradually introduces moisture to relax card fibers and reduce surface dimpling or puckering caused by environmental damage.',
    avgCost: 35,
    avgSuccessRate: 0.75,
    riskFactor: 0.12,
    applicableDefects: ['dimpling', 'puckering', 'surface wrinkles', 'moisture damage'],
  },
  {
    id: 'tech-003',
    name: 'Micro-Pressing (Corner Focus)',
    category: 'corner',
    description: 'Targeted pressing using precision tools to tighten soft corners and reduce tip rounding without affecting surrounding areas.',
    avgCost: 30,
    avgSuccessRate: 0.7,
    riskFactor: 0.15,
    applicableDefects: ['soft corners', 'corner rounding', 'corner bends', 'corner dings'],
  },
  {
    id: 'tech-004',
    name: 'Edge Realignment',
    category: 'edge',
    description: 'Careful manipulation of edge fibers to reduce visible whitening and minor chipping along card borders.',
    avgCost: 40,
    avgSuccessRate: 0.65,
    riskFactor: 0.18,
    applicableDefects: ['edge whitening', 'edge chipping', 'edge separation', 'border wear'],
  },
  {
    id: 'tech-005',
    name: 'Centering Compensation Press',
    category: 'centering',
    description: 'Strategic pressing that visually minimizes centering issues by subtly adjusting border presentation within the holder.',
    avgCost: 20,
    avgSuccessRate: 0.55,
    riskFactor: 0.05,
    applicableDefects: ['off-center', 'registration shift', 'border variance'],
  },
  {
    id: 'tech-006',
    name: 'Surface Decontamination',
    category: 'surface',
    description: 'Removes wax residue, adhesive marks, and light surface contaminants using archival-safe solvents and micro-fiber techniques.',
    avgCost: 45,
    avgSuccessRate: 0.78,
    riskFactor: 0.1,
    applicableDefects: ['wax residue', 'adhesive marks', 'surface grime', 'fingerprints', 'light staining'],
  },
  {
    id: 'tech-007',
    name: 'Cold Pressing',
    category: 'surface',
    description: 'Extended low-pressure treatment at room temperature for delicate vintage stock that cannot tolerate heat or moisture.',
    avgCost: 30,
    avgSuccessRate: 0.68,
    riskFactor: 0.05,
    applicableDefects: ['warping', 'bowing', 'light bends'],
  },
  {
    id: 'tech-008',
    name: 'Corner Reconstruction',
    category: 'corner',
    description: 'Advanced technique using archival materials to rebuild heavily damaged corner tips. Detectable under magnification.',
    avgCost: 75,
    avgSuccessRate: 0.6,
    riskFactor: 0.35,
    applicableDefects: ['paper loss', 'corner tears', 'severe rounding', 'corner separation'],
  },
  {
    id: 'tech-009',
    name: 'Edge Burnishing',
    category: 'edge',
    description: 'Polishes edge fibers to reduce whitening appearance. Works on modern card stock with clean cuts.',
    avgCost: 35,
    avgSuccessRate: 0.72,
    riskFactor: 0.14,
    applicableDefects: ['edge whitening', 'fuzzy edges', 'surface edge wear'],
  },
  {
    id: 'tech-010',
    name: 'Heat Laminar Press',
    category: 'surface',
    description: 'Precision heat application to re-seat delaminating layers and reduce surface bubbling on chrome and foil cards.',
    avgCost: 55,
    avgSuccessRate: 0.6,
    riskFactor: 0.22,
    applicableDefects: ['delamination', 'surface bubbling', 'layer separation', 'chrome peeling'],
  },
  {
    id: 'tech-011',
    name: 'Ultrasonic Surface Cleaning',
    category: 'surface',
    description: 'Uses high-frequency vibrations in a controlled solution bath to remove embedded surface contaminants without physical contact.',
    avgCost: 50,
    avgSuccessRate: 0.73,
    riskFactor: 0.16,
    applicableDefects: ['embedded grime', 'ink transfer', 'surface oxidation', 'toning'],
  },
  {
    id: 'tech-012',
    name: 'Border Recoloring',
    category: 'edge',
    description: 'Applies archival-grade pigment to restore color to whitened or worn borders. Considered restoration and may be flagged by graders.',
    avgCost: 65,
    avgSuccessRate: 0.5,
    riskFactor: 0.4,
    applicableDefects: ['border color loss', 'heavy whitening', 'color fading', 'sun bleaching'],
  },
  {
    id: 'tech-013',
    name: 'Dual-Stage Pressing',
    category: 'corner',
    description: 'Two-phase process: humidity relaxation followed by precision pressing, targeting both corner structure and surface simultaneously.',
    avgCost: 50,
    avgSuccessRate: 0.74,
    riskFactor: 0.13,
    applicableDefects: ['corner bends', 'corner creasing', 'corner softness', 'structural deformation'],
  },
  {
    id: 'tech-014',
    name: 'Acetone Vapor Treatment',
    category: 'surface',
    description: 'Controlled acetone vapor exposure to address specific surface defects on compatible card stocks. High risk for incompatible materials.',
    avgCost: 40,
    avgSuccessRate: 0.58,
    riskFactor: 0.28,
    applicableDefects: ['surface scratching', 'scuff marks', 'light abrasion'],
  },
];

// ── Value Multipliers by Grade ────────────────────────────────────────────────

const GRADE_VALUE_MULTIPLIERS: Record<number, number> = {
  1: 0.15,
  1.5: 0.18,
  2: 0.22,
  2.5: 0.27,
  3: 0.33,
  3.5: 0.4,
  4: 0.48,
  4.5: 0.57,
  5: 0.68,
  5.5: 0.78,
  6: 0.88,
  6.5: 1.0,
  7: 1.2,
  7.5: 1.5,
  8: 2.0,
  8.5: 2.8,
  9: 4.5,
  9.5: 8.0,
  10: 18.0,
};

// ── Helper: Estimate card base value (value at 6.5) ───────────────────────────

function estimateBaseValue(card: CardCondition): number {
  const currentMultiplier = GRADE_VALUE_MULTIPLIERS[card.currentGrade] ?? 1.0;
  return card.currentValue / currentMultiplier;
}

function estimateValueAtGrade(card: CardCondition, grade: number): number {
  const baseValue = estimateBaseValue(card);
  const targetMultiplier = GRADE_VALUE_MULTIPLIERS[grade] ?? 1.0;
  return Math.round(baseValue * targetMultiplier);
}

// ── Helper: Compute restoration difficulty ────────────────────────────────────

function computeImprovements(
  card: CardCondition,
  targetGrade: number
): GradeImprovement[] {
  const improvements: GradeImprovement[] = [];
  const subgrades = card.currentSubgrades;
  const attrs: Array<{ key: keyof typeof subgrades; label: GradeImprovement['attribute'] }> = [
    { key: 'centering', label: 'centering' },
    { key: 'corners', label: 'corners' },
    { key: 'edges', label: 'edges' },
    { key: 'surface', label: 'surface' },
  ];

  for (const { key, label } of attrs) {
    const current = subgrades[key];
    // Target subgrade needs to be at least the target overall grade
    const needed = Math.max(current, targetGrade);
    if (needed <= current) continue;

    const gap = needed - current;
    const difficulty: GradeImprovement['difficulty'] =
      gap <= 0.5 ? 'easy' : gap <= 1.5 ? 'moderate' : gap <= 2.5 ? 'hard' : 'expert';

    const techniques = MOCK_TECHNIQUES.filter((t) => t.category === label);
    const bestTechnique = techniques.sort((a, b) => b.avgSuccessRate - a.avgSuccessRate)[0];

    const baseSuccess = bestTechnique ? bestTechnique.avgSuccessRate : 0.5;
    const gapPenalty = Math.max(0, gap - 1) * 0.12;
    const successRate = Math.max(0.1, Math.min(0.95, baseSuccess - gapPenalty));

    const baseCost = bestTechnique ? bestTechnique.avgCost : 35;
    const cost = Math.round(baseCost * (1 + gap * 0.4));

    improvements.push({
      attribute: label,
      currentScore: current,
      projectedScore: Math.min(10, needed),
      technique: bestTechnique ? bestTechnique.name : 'General Restoration',
      difficulty,
      cost,
      successRate: Math.round(successRate * 100) / 100,
    });
  }

  return improvements;
}

// ── Service Functions ─────────────────────────────────────────────────────────

export async function getCardCondition(cardId: string): Promise<CardCondition | null> {
  await delay(180);
  return MOCK_CARDS.find((c) => c.id === cardId) ?? null;
}

export async function getAllCards(): Promise<CardCondition[]> {
  await delay(220);
  return [...MOCK_CARDS];
}

export async function simulateRestoration(
  cardId: string,
  targetGrade: number
): Promise<RestorationSimulation | null> {
  await delay(350);
  const card = MOCK_CARDS.find((c) => c.id === cardId);
  if (!card) return null;

  if (targetGrade <= card.currentGrade) {
    return {
      cardId,
      targetGrade,
      probability: 0.95,
      estimatedCost: 0,
      estimatedNewValue: card.currentValue,
      roi: 0,
      timeframeDays: 0,
      riskLevel: 'low',
      improvements: [],
    };
  }

  const improvements = computeImprovements(card, targetGrade);
  const estimatedCost = improvements.reduce((sum, imp) => sum + imp.cost, 0) + 25; // base service fee
  const avgSuccess = improvements.length > 0
    ? improvements.reduce((sum, imp) => sum + imp.successRate, 0) / improvements.length
    : 0.5;
  const gradeDiff = targetGrade - card.currentGrade;
  const probability = Math.max(0.03, Math.min(0.95, avgSuccess - gradeDiff * 0.08));
  const estimatedNewValue = estimateValueAtGrade(card, targetGrade);
  const netGain = estimatedNewValue - card.currentValue - estimatedCost;
  const roi = estimatedCost > 0 ? Math.round((netGain / estimatedCost) * 100) : 0;

  const riskLevel: RiskLevel =
    probability >= 0.65 ? 'low' : probability >= 0.35 ? 'medium' : 'high';

  const timeframeDays = Math.round(14 + gradeDiff * 8 + improvements.length * 3);

  return {
    cardId,
    targetGrade,
    probability: Math.round(probability * 100) / 100,
    estimatedCost,
    estimatedNewValue,
    roi,
    timeframeDays,
    riskLevel,
    improvements,
  };
}

export async function getRegradeAnalysis(cardId: string): Promise<RegradeAnalysis | null> {
  await delay(300);
  const card = MOCK_CARDS.find((c) => c.id === cardId);
  if (!card) return null;

  const currentGrade = card.currentGrade;
  const subAvg =
    (card.currentSubgrades.centering +
      card.currentSubgrades.corners +
      card.currentSubgrades.edges +
      card.currentSubgrades.surface) /
    4;

  // Build bell curve around current grade
  const grades = [
    currentGrade - 1.5,
    currentGrade - 1,
    currentGrade - 0.5,
    currentGrade,
    currentGrade + 0.5,
    currentGrade + 1,
    currentGrade + 1.5,
  ].filter((g) => g >= 1 && g <= 10);

  const rawDist = grades.map((grade) => {
    const diff = Math.abs(grade - subAvg);
    const prob = Math.exp(-diff * diff * 1.2);
    return { grade, probability: prob };
  });

  const totalProb = rawDist.reduce((s, d) => s + d.probability, 0);
  const gradeDistribution = rawDist.map((d) => ({
    grade: d.grade,
    probability: Math.round((d.probability / totalProb) * 100) / 100,
  }));

  const expectedGrade =
    gradeDistribution.reduce((s, d) => s + d.grade * d.probability, 0);
  const expectedValue = estimateValueAtGrade(card, Math.round(expectedGrade * 2) / 2);

  const minGrade = grades[0];
  const maxGrade = grades[grades.length - 1];
  const varianceRange: [number, number] = [
    estimateValueAtGrade(card, minGrade),
    estimateValueAtGrade(card, maxGrade),
  ];

  // Recommendation logic
  const upgrProb = gradeDistribution
    .filter((d) => d.grade > currentGrade)
    .reduce((s, d) => s + d.probability, 0);
  const downgrProb = gradeDistribution
    .filter((d) => d.grade < currentGrade)
    .reduce((s, d) => s + d.probability, 0);

  let recommendation: RegradeAnalysis['recommendation'];
  if (upgrProb > 0.4 && expectedValue > card.currentValue * 1.15) {
    recommendation = 'regrade';
  } else if (downgrProb > 0.3) {
    recommendation = 'sell-as-is';
  } else {
    recommendation = 'hold';
  }

  return {
    cardId,
    currentGrade,
    gradeDistribution,
    expectedValue,
    varianceRange,
    recommendation,
  };
}

export async function getRestorationTechniques(): Promise<RestorationTechnique[]> {
  await delay(150);
  return [...MOCK_TECHNIQUES];
}

export async function calculateROIScenarios(
  cardId: string
): Promise<RestorationROIScenario[] | null> {
  await delay(280);
  const card = MOCK_CARDS.find((c) => c.id === cardId);
  if (!card) return null;

  const cg = card.currentGrade;

  // Best case: +2 grade bump
  const bestTarget = Math.min(10, cg + 2);
  const bestImprovements = computeImprovements(card, bestTarget);
  const bestCost = bestImprovements.reduce((s, i) => s + i.cost, 0) + 25;
  const bestValue = estimateValueAtGrade(card, bestTarget);

  // Likely case: +1 grade bump
  const likelyTarget = Math.min(10, cg + 1);
  const likelyImprovements = computeImprovements(card, likelyTarget);
  const likelyCost = likelyImprovements.reduce((s, i) => s + i.cost, 0) + 25;
  const likelyValue = estimateValueAtGrade(card, likelyTarget);

  // Worst case: +0.5 bump (minimal improvement)
  const worstTarget = Math.min(10, cg + 0.5);
  const worstImprovements = computeImprovements(card, worstTarget);
  const worstCost = worstImprovements.reduce((s, i) => s + i.cost, 0) + 25;
  const worstValue = estimateValueAtGrade(card, worstTarget);

  return [
    {
      scenario: 'best',
      targetGrade: bestTarget,
      probability: 0.15,
      cost: bestCost,
      newValue: bestValue,
      netROI: bestCost > 0 ? Math.round(((bestValue - card.currentValue - bestCost) / bestCost) * 100) : 0,
    },
    {
      scenario: 'likely',
      targetGrade: likelyTarget,
      probability: 0.55,
      cost: likelyCost,
      newValue: likelyValue,
      netROI: likelyCost > 0 ? Math.round(((likelyValue - card.currentValue - likelyCost) / likelyCost) * 100) : 0,
    },
    {
      scenario: 'worst',
      targetGrade: worstTarget,
      probability: 0.3,
      cost: worstCost,
      newValue: worstValue,
      netROI: worstCost > 0 ? Math.round(((worstValue - card.currentValue - worstCost) / worstCost) * 100) : 0,
    },
  ];
}

export async function getGradeDistribution(
  cardId: string
): Promise<{ grade: number; probability: number }[] | null> {
  await delay(200);
  const analysis = await getRegradeAnalysis(cardId);
  return analysis ? analysis.gradeDistribution : null;
}

export async function getBatchRestorationPlan(
  cardIds: string[]
): Promise<BatchPlanItem[]> {
  await delay(400);
  const results: BatchPlanItem[] = [];

  for (const cardId of cardIds) {
    const card = MOCK_CARDS.find((c) => c.id === cardId);
    if (!card) continue;

    const targetGrade = Math.min(10, card.currentGrade + 1);
    const simulation = await simulateRestoration(cardId, targetGrade);
    if (!simulation) continue;

    const roiScenarios = (await calculateROIScenarios(cardId)) ?? [];

    const priority = simulation.roi > 100 ? 1 : simulation.roi > 50 ? 2 : simulation.roi > 0 ? 3 : 4;

    results.push({ card, simulation, priority, roiScenarios });
  }

  return results.sort((a, b) => a.priority - b.priority || b.simulation.roi - a.simulation.roi);
}

export async function getRestorationHistory(): Promise<RestorationHistoryEntry[]> {
  await delay(200);
  return [
    {
      id: 'hist-001',
      cardId: 'card-005',
      cardName: '1989 Upper Deck #1',
      player: 'Ken Griffey Jr.',
      gradeBefore: 6,
      gradeAfter: 8,
      cost: 85,
      valueBefore: 180,
      valueAfter: 520,
      roi: 300,
      date: '2025-11-15',
      techniques: ['Steam Pressing', 'Micro-Pressing (Corner Focus)'],
      success: true,
    },
    {
      id: 'hist-002',
      cardId: 'card-017',
      cardName: '1996 Topps Chrome #138',
      player: 'Kobe Bryant',
      gradeBefore: 6,
      gradeAfter: 7,
      cost: 120,
      valueBefore: 2400,
      valueAfter: 4500,
      roi: 1650,
      date: '2025-10-22',
      techniques: ['Surface Decontamination', 'Cold Pressing'],
      success: true,
    },
    {
      id: 'hist-003',
      cardId: 'card-011',
      cardName: '1969 Topps #260',
      player: 'Reggie Jackson',
      gradeBefore: 3.5,
      gradeAfter: 4,
      cost: 95,
      valueBefore: 2100,
      valueAfter: 3200,
      roi: 1058,
      date: '2025-09-08',
      techniques: ['Cold Pressing', 'Edge Realignment'],
      success: true,
    },
    {
      id: 'hist-004',
      cardId: 'card-019',
      cardName: '1984 Topps #63',
      player: 'John Elway',
      gradeBefore: 5.5,
      gradeAfter: 5.5,
      cost: 75,
      valueBefore: 130,
      valueAfter: 130,
      roi: -100,
      date: '2025-08-14',
      techniques: ['Steam Pressing'],
      success: false,
    },
    {
      id: 'hist-005',
      cardId: 'card-007',
      cardName: '1993 SP Foil #279',
      player: 'Derek Jeter',
      gradeBefore: 7,
      gradeAfter: 7.5,
      cost: 90,
      valueBefore: 2200,
      valueAfter: 2800,
      roi: 567,
      date: '2025-07-30',
      techniques: ['Humidity Chamber Treatment', 'Micro-Pressing (Corner Focus)'],
      success: true,
    },
    {
      id: 'hist-006',
      cardId: 'card-002',
      cardName: '2003 Topps Chrome #111',
      player: 'LeBron James',
      gradeBefore: 7.5,
      gradeAfter: 8,
      cost: 110,
      valueBefore: 3100,
      valueAfter: 4200,
      roi: 900,
      date: '2025-06-12',
      techniques: ['Surface Decontamination', 'Edge Burnishing', 'Steam Pressing'],
      success: true,
    },
    {
      id: 'hist-007',
      cardId: 'card-015',
      cardName: '1986 Fleer #68',
      player: 'Karl Malone',
      gradeBefore: 8,
      gradeAfter: 8,
      cost: 60,
      valueBefore: 140,
      valueAfter: 140,
      roi: -100,
      date: '2025-05-20',
      techniques: ['Steam Pressing'],
      success: false,
    },
    {
      id: 'hist-008',
      cardId: 'card-009',
      cardName: '1979 O-Pee-Chee #18',
      player: 'Wayne Gretzky',
      gradeBefore: 4,
      gradeAfter: 5,
      cost: 150,
      valueBefore: 14000,
      valueAfter: 22000,
      roi: 5233,
      date: '2025-04-03',
      techniques: ['Cold Pressing', 'Micro-Pressing (Corner Focus)', 'Edge Realignment'],
      success: true,
    },
  ];
}

// ── Utility ───────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatCurrency(value: number): string {
  return value >= 1000
    ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : `$${value.toFixed(0)}`;
}

export function getSubgradeColor(score: number): string {
  if (score >= 9) return 'text-emerald-400';
  if (score >= 8) return 'text-green-400';
  if (score >= 7) return 'text-yellow-400';
  if (score >= 6) return 'text-orange-400';
  if (score >= 5) return 'text-red-400';
  return 'text-red-600';
}

export function getSubgradeBarColor(score: number): string {
  if (score >= 9) return 'bg-emerald-500';
  if (score >= 8) return 'bg-green-500';
  if (score >= 7) return 'bg-yellow-500';
  if (score >= 6) return 'bg-orange-500';
  if (score >= 5) return 'bg-red-500';
  return 'bg-red-700';
}

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'low': return 'text-emerald-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-red-400';
  }
}

export function getRiskBadgeColor(risk: RiskLevel): string {
  switch (risk) {
    case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
}
