import { Sport } from '../../types';

// ---- Types ----

export type RiskTrend = 'rising' | 'stable' | 'falling';
export type InjurySeverity = 'minor' | 'moderate' | 'major' | 'career-threatening';
export type RiskCategory =
  | 'workload'
  | 'biomechanical'
  | 'historical'
  | 'age'
  | 'surface'
  | 'schedule';
export type HedgeRecommendation = 'hold' | 'sell-partial' | 'sell-all' | 'buy-dip' | 'hedge';

export interface RiskFactor {
  category: RiskCategory;
  name: string;
  weight: number; // 0-1 contribution weight
  currentValue: number;
  threshold: number;
  description: string;
}

export interface InjuryProjection {
  type: string;
  probability: number; // 0-1
  timeframe: string;
  severity: InjurySeverity;
  expectedRecoveryDays: number;
  cardValueDropPercent: number;
  historicalComparison: string;
}

export interface ProjectedValue {
  optimistic: number;
  baseline: number;
  pessimistic: number;
}

export interface CardValueImpact {
  cardId: string;
  cardName: string;
  currentValue: number;
  projected30: ProjectedValue;
  projected60: ProjectedValue;
  projected90: ProjectedValue;
  hedgeRecommendation: HedgeRecommendation;
}

export interface InjuryRiskProfile {
  playerId: string;
  name: string;
  sport: Sport;
  position: string;
  age: number;
  currentRiskScore: number; // 0-100
  riskTrend: RiskTrend;
  riskFactors: RiskFactor[];
  projectedInjuryWindows: InjuryProjection[];
  cardValueImpact: CardValueImpact;
}

export interface TeamRisk {
  team: string;
  averageRisk: number;
  highRiskPlayerCount: number;
  players: string[];
}

export interface LeagueRiskHeatMap {
  sport: Sport;
  teams: TeamRisk[];
  averageRisk: number;
  highRiskCount: number;
}

export interface InjuryCorrelation {
  factor1: string;
  factor2: string;
  correlationCoefficient: number; // -1 to 1
  sampleSize: number;
}

export interface TimelineEvent {
  playerId: string;
  playerName: string;
  sport: Sport;
  date: string;
  riskLevel: number;
  eventDescription: string;
  actionRequired: boolean;
}

export interface PortfolioExposure {
  totalCards: number;
  totalValue: number;
  weightedRiskScore: number;
  highRiskCards: number;
  projectedValueAtRisk: number;
  worstCaseLoss: number;
  recommendations: string[];
}

// ---- Deterministic seed helpers ----

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min);
}

function seededInt(seed: number, min: number, max: number): number {
  return Math.floor(seededRange(seed, min, max + 1));
}

// ---- Player Database ----

interface PlayerSeed {
  id: string;
  name: string;
  sport: Sport;
  position: string;
  team: string;
  age: number;
  baseRisk: number;
  injuryHistory: string[];
  cardValue: number;
  cardName: string;
}

const PLAYER_DATABASE: PlayerSeed[] = [
  // NFL (8 players)
  { id: 'nfl-01', name: 'Marcus Williams', sport: 'Football', position: 'QB', team: 'KC Chiefs', age: 28, baseRisk: 42, injuryHistory: ['ankle sprain 2024'], cardValue: 850, cardName: '2022 Panini Prizm Silver /299' },
  { id: 'nfl-02', name: 'DeAndre Cooper', sport: 'Football', position: 'WR', team: 'DAL Cowboys', age: 30, baseRisk: 58, injuryHistory: ['hamstring tear 2023', 'knee sprain 2024'], cardValue: 420, cardName: '2021 Select Concourse Gold /10' },
  { id: 'nfl-03', name: 'Jaylen Harris', sport: 'Football', position: 'RB', team: 'SF 49ers', age: 25, baseRisk: 72, injuryHistory: ['ACL tear 2023', 'ankle sprain 2024', 'concussion 2024'], cardValue: 1200, cardName: '2023 Bowman Chrome Auto /50' },
  { id: 'nfl-04', name: 'Trevon Diggs Jr', sport: 'Football', position: 'CB', team: 'BUF Bills', age: 27, baseRisk: 35, injuryHistory: [], cardValue: 310, cardName: '2022 Mosaic Prizm Silver' },
  { id: 'nfl-05', name: 'Brandon Aiyuk', sport: 'Football', position: 'WR', team: 'PHI Eagles', age: 26, baseRisk: 44, injuryHistory: ['shoulder sprain 2024'], cardValue: 580, cardName: '2023 Optic Holo /150' },
  { id: 'nfl-06', name: 'Malik Jackson', sport: 'Football', position: 'DE', team: 'BAL Ravens', age: 32, baseRisk: 68, injuryHistory: ['back strain 2022', 'knee surgery 2023', 'calf strain 2024'], cardValue: 190, cardName: '2020 Prizm Base' },
  { id: 'nfl-07', name: 'Chris Thompson III', sport: 'Football', position: 'TE', team: 'MIA Dolphins', age: 24, baseRisk: 28, injuryHistory: [], cardValue: 720, cardName: '2024 Prizm Silver Auto RC /199' },
  { id: 'nfl-08', name: 'Darius Allen', sport: 'Football', position: 'LB', team: 'GB Packers', age: 29, baseRisk: 55, injuryHistory: ['pectoral tear 2023'], cardValue: 260, cardName: '2021 Donruss Optic' },

  // NBA (8 players)
  { id: 'nba-01', name: 'Jaylen Mitchell', sport: 'Basketball', position: 'PG', team: 'LAL Lakers', age: 24, baseRisk: 38, injuryHistory: ['ankle sprain 2025'], cardValue: 1400, cardName: '2024 Prizm Silver RC /299' },
  { id: 'nba-02', name: 'Andre Patterson', sport: 'Basketball', position: 'SF', team: 'BOS Celtics', age: 27, baseRisk: 52, injuryHistory: ['knee tendinitis 2024', 'hamstring strain 2025'], cardValue: 680, cardName: '2022 Select Premier Gold /10' },
  { id: 'nba-03', name: 'DeMarcus Thompson', sport: 'Basketball', position: 'C', team: 'DEN Nuggets', age: 31, baseRisk: 65, injuryHistory: ['meniscus tear 2023', 'back spasm 2024', 'ankle surgery 2024'], cardValue: 520, cardName: '2021 National Treasures /49' },
  { id: 'nba-04', name: 'Tyrese Walker', sport: 'Basketball', position: 'SG', team: 'PHX Suns', age: 22, baseRisk: 25, injuryHistory: [], cardValue: 950, cardName: '2025 Prizm Silver RC /299' },
  { id: 'nba-05', name: 'Kevin Okafor', sport: 'Basketball', position: 'PF', team: 'MIL Bucks', age: 29, baseRisk: 60, injuryHistory: ['Achilles tendinitis 2024', 'calf strain 2025'], cardValue: 380, cardName: '2021 Optic Holo' },
  { id: 'nba-06', name: 'Marcus Green', sport: 'Basketball', position: 'PG', team: 'GSW Warriors', age: 34, baseRisk: 78, injuryHistory: ['knee surgery 2023', 'plantar fasciitis 2024', 'hip strain 2025'], cardValue: 2200, cardName: '2019 Prizm Silver /299' },
  { id: 'nba-07', name: 'Isaiah Brooks', sport: 'Basketball', position: 'SF', team: 'MEM Grizzlies', age: 23, baseRisk: 45, injuryHistory: ['shoulder sprain 2025'], cardValue: 1100, cardName: '2024 Select Concourse Silver RC' },
  { id: 'nba-08', name: 'Jalen Williams Jr', sport: 'Basketball', position: 'SG', team: 'OKC Thunder', age: 25, baseRisk: 32, injuryHistory: [], cardValue: 780, cardName: '2023 Prizm Holo /199' },

  // Hockey (8 players)
  { id: 'nhl-01', name: 'Connor Bedard', sport: 'Hockey', position: 'C', team: 'CHI Blackhawks', age: 21, baseRisk: 40, injuryHistory: ['wrist sprain 2025'], cardValue: 3200, cardName: '2024 Upper Deck Young Guns' },
  { id: 'nhl-02', name: 'Erik Lindstrom', sport: 'Hockey', position: 'D', team: 'COL Avalanche', age: 29, baseRisk: 55, injuryHistory: ['shoulder surgery 2023', 'concussion 2024'], cardValue: 280, cardName: '2021 UD Series 1 Exclusives /100' },
  { id: 'nhl-03', name: 'Mikhail Petrov', sport: 'Hockey', position: 'RW', team: 'TOR Maple Leafs', age: 26, baseRisk: 48, injuryHistory: ['groin strain 2024'], cardValue: 540, cardName: '2023 SP Authentic Auto /299' },
  { id: 'nhl-04', name: 'Jake Morrison', sport: 'Hockey', position: 'G', team: 'VGK Golden Knights', age: 30, baseRisk: 35, injuryHistory: ['hip flexor 2024'], cardValue: 420, cardName: '2022 OPC Platinum /149' },
  { id: 'nhl-05', name: 'Aleksei Volkov', sport: 'Hockey', position: 'LW', team: 'TB Lightning', age: 33, baseRisk: 72, injuryHistory: ['knee MCL tear 2022', 'back surgery 2023', 'ankle fracture 2024'], cardValue: 190, cardName: '2019 Upper Deck Base' },
  { id: 'nhl-06', name: 'Nathan Hughes', sport: 'Hockey', position: 'C', team: 'EDM Oilers', age: 24, baseRisk: 30, injuryHistory: [], cardValue: 880, cardName: '2024 UD Young Guns Exclusive /100' },
  { id: 'nhl-07', name: 'Lukas Andersson', sport: 'Hockey', position: 'D', team: 'NYR Rangers', age: 28, baseRisk: 50, injuryHistory: ['broken hand 2024', 'concussion 2025'], cardValue: 340, cardName: '2022 SP Authentic /399' },
  { id: 'nhl-08', name: 'Pierre Dubois', sport: 'Hockey', position: 'RW', team: 'MTL Canadiens', age: 22, baseRisk: 26, injuryHistory: [], cardValue: 620, cardName: '2025 UD Young Guns RC' },

  // Soccer (8 players)
  { id: 'soc-01', name: 'Lamine Yamal', sport: 'Soccer', position: 'RW', team: 'FC Barcelona', age: 18, baseRisk: 34, injuryHistory: [], cardValue: 4800, cardName: '2024 Topps Chrome UCL Auto /50' },
  { id: 'soc-02', name: 'Jude Bellingham', sport: 'Soccer', position: 'CM', team: 'Real Madrid', age: 22, baseRisk: 46, injuryHistory: ['shoulder dislocation 2025', 'ankle sprain 2025'], cardValue: 3200, cardName: '2023 Topps Chrome UCL /75' },
  { id: 'soc-03', name: 'Erling Haaland', sport: 'Soccer', position: 'ST', team: 'Man City', age: 25, baseRisk: 52, injuryHistory: ['groin strain 2024', 'foot stress fracture 2025'], cardValue: 2800, cardName: '2022 Topps Finest UCL /250' },
  { id: 'soc-04', name: 'Florian Wirtz', sport: 'Soccer', position: 'CAM', team: 'Bayer Leverkusen', age: 22, baseRisk: 38, injuryHistory: ['ACL tear 2022'], cardValue: 1900, cardName: '2023 Topps Chrome Auto /99' },
  { id: 'soc-05', name: 'Bukayo Saka', sport: 'Soccer', position: 'RW', team: 'Arsenal', age: 24, baseRisk: 58, injuryHistory: ['hamstring strain 2024', 'knee sprain 2025', 'groin tightness 2025'], cardValue: 1500, cardName: '2022 Topps Merlin Chrome /299' },
  { id: 'soc-06', name: 'Vinicius Junior', sport: 'Soccer', position: 'LW', team: 'Real Madrid', age: 25, baseRisk: 44, injuryHistory: ['muscle fatigue 2024'], cardValue: 2100, cardName: '2022 Topps Chrome UCL Refractor /150' },
  { id: 'soc-07', name: 'Phil Foden', sport: 'Soccer', position: 'CM', team: 'Man City', age: 25, baseRisk: 50, injuryHistory: ['hamstring tear 2024', 'groin strain 2025'], cardValue: 780, cardName: '2021 Topps Chrome UCL' },
  { id: 'soc-08', name: 'Endrick', sport: 'Soccer', position: 'ST', team: 'Real Madrid', age: 19, baseRisk: 30, injuryHistory: [], cardValue: 2400, cardName: '2024 Topps Chrome UCL Auto RC /25' },
];

// ---- Risk Factor Generation ----

const RISK_FACTOR_TEMPLATES: Record<RiskCategory, { name: string; description: string; threshold: number }[]> = {
  workload: [
    { name: 'Minutes Played (Last 30d)', description: 'Total competition minutes in the last 30 days vs safe threshold', threshold: 85 },
    { name: 'Games in 14 Days', description: 'Number of games played in the last two weeks', threshold: 75 },
    { name: 'Travel Miles (Monthly)', description: 'Total team travel distance impacting recovery windows', threshold: 70 },
    { name: 'High-Intensity Sprints', description: 'Sprint count per game exceeding safe mechanical load', threshold: 80 },
  ],
  biomechanical: [
    { name: 'Asymmetry Index', description: 'Left-right force production imbalance from motion capture', threshold: 65 },
    { name: 'Joint Stress Load', description: 'Cumulative joint stress from position-specific movements', threshold: 72 },
    { name: 'BMI Variance', description: 'Body composition change from baseline affecting mechanics', threshold: 60 },
  ],
  historical: [
    { name: 'Prior Injury Count', description: 'Total career injuries weighted by recency and severity', threshold: 55 },
    { name: 'Surgery History', description: 'Post-surgical re-injury probability based on procedure type', threshold: 50 },
    { name: 'Chronic Condition Risk', description: 'Likelihood of recurring condition based on medical history', threshold: 45 },
  ],
  age: [
    { name: 'Age-Position Curve', description: 'Injury risk relative to position-specific age decline curve', threshold: 60 },
    { name: 'Recovery Rate Decline', description: 'Estimated recovery speed reduction vs age-25 baseline', threshold: 55 },
  ],
  surface: [
    { name: 'Turf Injury Multiplier', description: 'Risk increase from artificial surface exposure this season', threshold: 70 },
    { name: 'Altitude Stress', description: 'Physiological stress from high-altitude venue schedule', threshold: 50 },
    { name: 'Weather Exposure', description: 'Extreme temperature game count impacting soft tissue', threshold: 55 },
  ],
  schedule: [
    { name: 'Back-to-Back Density', description: 'Frequency of games with less than 48hr rest between', threshold: 75 },
    { name: 'International Travel', description: 'Cross-timezone travel count disrupting circadian recovery', threshold: 60 },
    { name: 'Playoff Intensity', description: 'Elevated exertion factor during postseason or elimination games', threshold: 80 },
  ],
};

const INJURY_TYPES_BY_SPORT: Record<Sport, { type: string; severity: InjurySeverity; recoveryDays: number; valueDropPct: number }[]> = {
  Football: [
    { type: 'Hamstring Strain', severity: 'minor', recoveryDays: 21, valueDropPct: 8 },
    { type: 'Ankle Sprain', severity: 'minor', recoveryDays: 14, valueDropPct: 5 },
    { type: 'Knee MCL Sprain', severity: 'moderate', recoveryDays: 42, valueDropPct: 18 },
    { type: 'ACL Tear', severity: 'major', recoveryDays: 270, valueDropPct: 45 },
    { type: 'Achilles Rupture', severity: 'career-threatening', recoveryDays: 365, valueDropPct: 60 },
    { type: 'Concussion', severity: 'moderate', recoveryDays: 28, valueDropPct: 15 },
    { type: 'Shoulder Separation', severity: 'moderate', recoveryDays: 56, valueDropPct: 20 },
  ],
  Basketball: [
    { type: 'Ankle Sprain', severity: 'minor', recoveryDays: 14, valueDropPct: 5 },
    { type: 'Knee Tendinitis', severity: 'minor', recoveryDays: 21, valueDropPct: 10 },
    { type: 'Hamstring Tear', severity: 'moderate', recoveryDays: 35, valueDropPct: 15 },
    { type: 'Meniscus Tear', severity: 'moderate', recoveryDays: 60, valueDropPct: 22 },
    { type: 'ACL Tear', severity: 'major', recoveryDays: 300, valueDropPct: 50 },
    { type: 'Achilles Tear', severity: 'career-threatening', recoveryDays: 365, valueDropPct: 65 },
    { type: 'Stress Fracture (Foot)', severity: 'moderate', recoveryDays: 90, valueDropPct: 25 },
  ],
  Hockey: [
    { type: 'Upper Body Contusion', severity: 'minor', recoveryDays: 10, valueDropPct: 4 },
    { type: 'Groin Strain', severity: 'minor', recoveryDays: 21, valueDropPct: 8 },
    { type: 'Concussion', severity: 'moderate', recoveryDays: 35, valueDropPct: 18 },
    { type: 'Shoulder Surgery', severity: 'major', recoveryDays: 180, valueDropPct: 35 },
    { type: 'Knee MCL Tear', severity: 'major', recoveryDays: 120, valueDropPct: 30 },
    { type: 'Spinal Injury', severity: 'career-threatening', recoveryDays: 365, valueDropPct: 70 },
  ],
  Soccer: [
    { type: 'Muscle Fatigue', severity: 'minor', recoveryDays: 7, valueDropPct: 3 },
    { type: 'Hamstring Strain', severity: 'minor', recoveryDays: 21, valueDropPct: 8 },
    { type: 'Groin Strain', severity: 'moderate', recoveryDays: 28, valueDropPct: 12 },
    { type: 'Ankle Ligament Tear', severity: 'moderate', recoveryDays: 56, valueDropPct: 20 },
    { type: 'ACL Tear', severity: 'major', recoveryDays: 270, valueDropPct: 45 },
    { type: 'Achilles Rupture', severity: 'career-threatening', recoveryDays: 330, valueDropPct: 55 },
    { type: 'Stress Fracture (Metatarsal)', severity: 'moderate', recoveryDays: 90, valueDropPct: 22 },
  ],
  Baseball: [],
};

// ---- Profile Builder ----

function buildRiskFactors(player: PlayerSeed, seed: number): RiskFactor[] {
  const factors: RiskFactor[] = [];
  const categories = Object.keys(RISK_FACTOR_TEMPLATES) as RiskCategory[];

  for (const category of categories) {
    const templates = RISK_FACTOR_TEMPLATES[category];
    for (let i = 0; i < templates.length; i++) {
      const t = templates[i];
      const factorSeed = seed + hashString(player.id + category + t.name);
      const ageModifier = player.age > 30 ? 1.15 : player.age < 24 ? 0.85 : 1.0;
      const historyModifier = 1 + player.injuryHistory.length * 0.08;
      const baseVal = seededRange(factorSeed, 15, 90) * ageModifier * historyModifier;
      const currentValue = Math.min(100, Math.round(baseVal));
      const weight = +(seededRange(factorSeed + 1, 0.05, 0.2).toFixed(2));

      factors.push({
        category,
        name: t.name,
        weight,
        currentValue,
        threshold: t.threshold,
        description: t.description,
      });
    }
  }

  return factors;
}

function buildInjuryProjections(player: PlayerSeed, seed: number): InjuryProjection[] {
  const sportInjuries = INJURY_TYPES_BY_SPORT[player.sport];
  if (!sportInjuries.length) return [];

  const projections: InjuryProjection[] = [];
  const count = seededInt(seed, 1, 3);

  for (let i = 0; i < count && i < sportInjuries.length; i++) {
    const idx = seededInt(seed + i * 7, 0, sportInjuries.length - 1);
    const injury = sportInjuries[idx];
    const probSeed = seed + hashString(player.id + injury.type);
    const baseProbability = (player.baseRisk / 100) * seededRange(probSeed, 0.3, 0.9);
    const probability = +Math.min(0.95, baseProbability).toFixed(2);

    const timeframes = ['Next 2 weeks', 'Next 30 days', 'Next 60 days', 'Next 90 days'];
    const tfIdx = seededInt(probSeed + 3, 0, timeframes.length - 1);

    projections.push({
      type: injury.type,
      probability,
      timeframe: timeframes[tfIdx],
      severity: injury.severity,
      expectedRecoveryDays: injury.recoveryDays,
      cardValueDropPercent: injury.valueDropPct,
      historicalComparison: `Similar players at age ${player.age} with ${player.injuryHistory.length} prior injuries had a ${Math.round(probability * 100)}% incidence rate`,
    });
  }

  return projections;
}

function buildCardValueImpact(player: PlayerSeed, seed: number): CardValueImpact {
  const cv = player.cardValue;
  const risk = player.baseRisk / 100;
  const s = seed + hashString(player.id + 'card');

  const opt30 = Math.round(cv * (1 + seededRange(s, 0.02, 0.1)));
  const base30 = Math.round(cv * (1 - risk * seededRange(s + 1, 0.02, 0.08)));
  const pess30 = Math.round(cv * (1 - risk * seededRange(s + 2, 0.1, 0.3)));

  const opt60 = Math.round(cv * (1 + seededRange(s + 3, 0.04, 0.15)));
  const base60 = Math.round(cv * (1 - risk * seededRange(s + 4, 0.04, 0.12)));
  const pess60 = Math.round(cv * (1 - risk * seededRange(s + 5, 0.15, 0.4)));

  const opt90 = Math.round(cv * (1 + seededRange(s + 6, 0.06, 0.2)));
  const base90 = Math.round(cv * (1 - risk * seededRange(s + 7, 0.06, 0.15)));
  const pess90 = Math.round(cv * (1 - risk * seededRange(s + 8, 0.2, 0.55)));

  let hedge: HedgeRecommendation = 'hold';
  if (player.baseRisk > 75) hedge = 'sell-all';
  else if (player.baseRisk > 60) hedge = 'sell-partial';
  else if (player.baseRisk > 45) hedge = 'hedge';
  else if (player.baseRisk < 25) hedge = 'buy-dip';

  return {
    cardId: player.id + '-card',
    cardName: `${player.name} ${player.cardName}`,
    currentValue: cv,
    projected30: { optimistic: opt30, baseline: base30, pessimistic: pess30 },
    projected60: { optimistic: opt60, baseline: base60, pessimistic: pess60 },
    projected90: { optimistic: opt90, baseline: base90, pessimistic: pess90 },
    hedgeRecommendation: hedge,
  };
}

function buildProfile(player: PlayerSeed): InjuryRiskProfile {
  const seed = dateSeed() + hashString(player.id);
  const ageModifier = player.age > 30 ? 8 : player.age > 28 ? 4 : player.age < 23 ? -3 : 0;
  const historyModifier = player.injuryHistory.length * 6;
  const dailyJitter = seededRange(seed, -5, 5);
  const riskScore = Math.max(5, Math.min(98, Math.round(player.baseRisk + ageModifier + historyModifier + dailyJitter)));

  const trends: RiskTrend[] = ['rising', 'stable', 'falling'];
  const trendIdx = riskScore > 65 ? 0 : riskScore < 35 ? 2 : seededInt(seed + 99, 0, 2);

  return {
    playerId: player.id,
    name: player.name,
    sport: player.sport,
    position: player.position,
    age: player.age,
    currentRiskScore: riskScore,
    riskTrend: trends[trendIdx],
    riskFactors: buildRiskFactors(player, seed),
    projectedInjuryWindows: buildInjuryProjections(player, seed),
    cardValueImpact: buildCardValueImpact(player, seed),
  };
}

// ---- Public API ----

export function getPlayerRiskProfile(playerId: string): InjuryRiskProfile | null {
  const player = PLAYER_DATABASE.find((p) => p.id === playerId);
  if (!player) return null;
  return buildProfile(player);
}

export function getAllPlayers(): { id: string; name: string; sport: Sport; position: string; team: string }[] {
  return PLAYER_DATABASE.map((p) => ({
    id: p.id,
    name: p.name,
    sport: p.sport,
    position: p.position,
    team: p.team,
  }));
}

export function getLeagueRiskHeatMap(sport: Sport): LeagueRiskHeatMap {
  const players = PLAYER_DATABASE.filter((p) => p.sport === sport);
  const profiles = players.map(buildProfile);

  const teamMap = new Map<string, InjuryRiskProfile[]>();
  for (const profile of profiles) {
    const player = players.find((p) => p.id === profile.playerId)!;
    const existing = teamMap.get(player.team) || [];
    existing.push(profile);
    teamMap.set(player.team, existing);
  }

  const teams: TeamRisk[] = [];
  let totalRisk = 0;
  let totalHighRisk = 0;

  for (const [team, teamProfiles] of teamMap) {
    const avgRisk = Math.round(teamProfiles.reduce((sum, p) => sum + p.currentRiskScore, 0) / teamProfiles.length);
    const highCount = teamProfiles.filter((p) => p.currentRiskScore > 60).length;
    totalRisk += avgRisk;
    totalHighRisk += highCount;
    teams.push({
      team,
      averageRisk: avgRisk,
      highRiskPlayerCount: highCount,
      players: teamProfiles.map((p) => p.name),
    });
  }

  return {
    sport,
    teams: teams.sort((a, b) => b.averageRisk - a.averageRisk),
    averageRisk: teams.length ? Math.round(totalRisk / teams.length) : 0,
    highRiskCount: totalHighRisk,
  };
}

export function getHighRiskPlayers(sport: Sport | 'all', threshold: number = 60): InjuryRiskProfile[] {
  const filtered = sport === 'all' ? PLAYER_DATABASE : PLAYER_DATABASE.filter((p) => p.sport === sport);
  return filtered
    .map(buildProfile)
    .filter((p) => p.currentRiskScore >= threshold)
    .sort((a, b) => b.currentRiskScore - a.currentRiskScore);
}

export function simulateInjuryScenario(
  playerId: string,
  injuryType: string
): { before: CardValueImpact; after: CardValueImpact; timeline: { day: number; value: number }[] } | null {
  const player = PLAYER_DATABASE.find((p) => p.id === playerId);
  if (!player) return null;

  const profile = buildProfile(player);
  const before = profile.cardValueImpact;

  const sportInjuries = INJURY_TYPES_BY_SPORT[player.sport];
  const matchedInjury = sportInjuries.find((i) => i.type === injuryType) || sportInjuries[0];
  if (!matchedInjury) return null;

  const dropPct = matchedInjury.valueDropPct / 100;
  const cv = player.cardValue;
  const seed = dateSeed() + hashString(playerId + injuryType);

  const after: CardValueImpact = {
    cardId: before.cardId,
    cardName: before.cardName,
    currentValue: Math.round(cv * (1 - dropPct)),
    projected30: {
      optimistic: Math.round(cv * (1 - dropPct * 0.7)),
      baseline: Math.round(cv * (1 - dropPct * 0.9)),
      pessimistic: Math.round(cv * (1 - dropPct * 1.3)),
    },
    projected60: {
      optimistic: Math.round(cv * (1 - dropPct * 0.4)),
      baseline: Math.round(cv * (1 - dropPct * 0.7)),
      pessimistic: Math.round(cv * (1 - dropPct * 1.1)),
    },
    projected90: {
      optimistic: Math.round(cv * (1 - dropPct * 0.15)),
      baseline: Math.round(cv * (1 - dropPct * 0.5)),
      pessimistic: Math.round(cv * (1 - dropPct * 0.9)),
    },
    hedgeRecommendation: dropPct > 0.4 ? 'sell-all' : dropPct > 0.2 ? 'sell-partial' : 'hedge',
  };

  const timeline: { day: number; value: number }[] = [];
  for (let day = 0; day <= 180; day += 5) {
    const dropAtDay = day < 3 ? dropPct * 0.8 : dropPct * Math.exp(-day / (matchedInjury.recoveryDays * 0.8));
    const noise = seededRange(seed + day, -0.02, 0.02);
    timeline.push({ day, value: Math.round(cv * (1 - dropAtDay + noise)) });
  }

  return { before, after, timeline };
}

export function getCardValueImpact(playerId: string): CardValueImpact | null {
  const player = PLAYER_DATABASE.find((p) => p.id === playerId);
  if (!player) return null;
  return buildProfile(player).cardValueImpact;
}

export function getRiskCorrelations(sport: Sport): InjuryCorrelation[] {
  const seed = dateSeed() + hashString(sport);
  const factors = [
    'Minutes Played',
    'Games in 14 Days',
    'Prior Injury Count',
    'Player Age',
    'Travel Miles',
    'Back-to-Back Games',
    'Surface Hardness',
    'Recovery Days Between Games',
    'Sprint Count',
    'Joint Stress Load',
  ];

  const correlations: InjuryCorrelation[] = [];
  for (let i = 0; i < factors.length; i++) {
    for (let j = i + 1; j < factors.length; j++) {
      const pairSeed = seed + hashString(factors[i] + factors[j]);
      const coeff = +(seededRange(pairSeed, -0.85, 0.95)).toFixed(3);
      const sample = seededInt(pairSeed + 1, 120, 2400);
      correlations.push({
        factor1: factors[i],
        factor2: factors[j],
        correlationCoefficient: coeff,
        sampleSize: sample,
      });
    }
  }

  return correlations.sort((a, b) => Math.abs(b.correlationCoefficient) - Math.abs(a.correlationCoefficient));
}

export function getInjuryTimeline(playerId: string): TimelineEvent[] {
  const player = PLAYER_DATABASE.find((p) => p.id === playerId);
  if (!player) return [];

  const seed = dateSeed() + hashString(playerId + 'timeline');
  const events: TimelineEvent[] = [];
  const now = new Date();

  for (let i = 0; i < 8; i++) {
    const daysAhead = seededInt(seed + i * 13, 1, 90);
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() + daysAhead);
    const riskLevel = seededInt(seed + i * 17, 20, 95);

    const descriptions = [
      `High workload window: 3 games in 5 days scheduled`,
      `Playing on artificial turf at away venue`,
      `Back-to-back games with overnight travel`,
      `Altitude game at Denver (5,280 ft)`,
      `Returning from minor soft-tissue tightness`,
      `Schedule congestion: 5 games in 12 days`,
      `Cross-country travel with timezone change`,
      `Heavy minute load expected due to teammate absence`,
    ];

    events.push({
      playerId: player.id,
      playerName: player.name,
      sport: player.sport,
      date: eventDate.toISOString().split('T')[0],
      riskLevel,
      eventDescription: descriptions[i % descriptions.length],
      actionRequired: riskLevel > 65,
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function getPortfolioRiskExposure(cardIds: string[]): PortfolioExposure {
  const playerIds = cardIds.map((cid) => cid.replace('-card', ''));
  const profiles = playerIds
    .map((pid) => {
      const player = PLAYER_DATABASE.find((p) => p.id === pid);
      return player ? buildProfile(player) : null;
    })
    .filter((p): p is InjuryRiskProfile => p !== null);

  if (profiles.length === 0) {
    return {
      totalCards: 0,
      totalValue: 0,
      weightedRiskScore: 0,
      highRiskCards: 0,
      projectedValueAtRisk: 0,
      worstCaseLoss: 0,
      recommendations: ['Add cards to your portfolio to see risk exposure.'],
    };
  }

  const totalValue = profiles.reduce((sum, p) => sum + p.cardValueImpact.currentValue, 0);
  const weightedRisk = profiles.reduce((sum, p) => {
    const weight = p.cardValueImpact.currentValue / totalValue;
    return sum + p.currentRiskScore * weight;
  }, 0);

  const highRisk = profiles.filter((p) => p.currentRiskScore > 60).length;
  const projectedAtRisk = profiles.reduce((sum, p) => {
    const pess = p.cardValueImpact.projected90.pessimistic;
    const loss = p.cardValueImpact.currentValue - pess;
    return sum + Math.max(0, loss);
  }, 0);
  const worstCase = profiles.reduce((sum, p) => {
    const worst = p.cardValueImpact.projected90.pessimistic;
    return sum + (p.cardValueImpact.currentValue - worst);
  }, 0);

  const recommendations: string[] = [];
  const veryHigh = profiles.filter((p) => p.currentRiskScore > 80);
  if (veryHigh.length > 0) {
    recommendations.push(`Consider selling ${veryHigh.map((p) => p.name).join(', ')} cards — risk scores above 80.`);
  }
  const risingTrend = profiles.filter((p) => p.riskTrend === 'rising');
  if (risingTrend.length > 0) {
    recommendations.push(`Watch ${risingTrend.map((p) => p.name).join(', ')} — risk trends are rising.`);
  }
  if (weightedRisk > 55) {
    recommendations.push('Portfolio risk concentration is high. Diversify into lower-risk player cards.');
  }
  if (highRisk / profiles.length > 0.5) {
    recommendations.push(`${Math.round((highRisk / profiles.length) * 100)}% of your portfolio is high-risk. Rebalance recommended.`);
  }
  if (recommendations.length === 0) {
    recommendations.push('Portfolio risk exposure is within acceptable limits. Continue monitoring.');
  }

  return {
    totalCards: profiles.length,
    totalValue,
    weightedRiskScore: Math.round(weightedRisk),
    highRiskCards: highRisk,
    projectedValueAtRisk: projectedAtRisk,
    worstCaseLoss: worstCase,
    recommendations,
  };
}
