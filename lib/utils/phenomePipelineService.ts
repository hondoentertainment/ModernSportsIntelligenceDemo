// Phase 246 — Phenome Pipeline Service
// Tracks rising prospect phenoms before they break out in the sports card market

// ---- Types ----

export interface PhenomSignal {
  type: 'stats' | 'social' | 'media' | 'scouting';
  description: string;
  strength: number;
}

export interface Phenom {
  id: string;
  name: string;
  sport: string;
  league: string;
  team: string;
  age: number;
  scoutGrade: number;
  projectedCeiling: string;
  cardValue: number;
  sixMonthProjection: number;
  breakoutProbability: number;
  signals: PhenomSignal[];
}

// ---- Mock Data ----

const phenoms: Phenom[] = [
  {
    id: 'ph-001',
    name: 'Elly De La Cruz',
    sport: 'Baseball',
    league: 'MLB',
    team: 'Cincinnati Reds',
    age: 23,
    scoutGrade: 70,
    projectedCeiling: 'MVP Candidate',
    cardValue: 185,
    sixMonthProjection: 420,
    breakoutProbability: 0.82,
    signals: [
      { type: 'stats', description: '40/40 season pace through spring training', strength: 92 },
      { type: 'social', description: 'Highlight reels trending across all platforms weekly', strength: 85 },
      { type: 'scouting', description: 'Rated top-5 dynasty asset by three major outlets', strength: 88 },
    ],
  },
  {
    id: 'ph-002',
    name: 'Connor Bedard',
    sport: 'Hockey',
    league: 'NHL',
    team: 'Chicago Blackhawks',
    age: 20,
    scoutGrade: 75,
    projectedCeiling: 'Generational Talent',
    cardValue: 340,
    sixMonthProjection: 750,
    breakoutProbability: 0.91,
    signals: [
      { type: 'stats', description: 'Point-per-game pace in sophomore NHL season', strength: 95 },
      { type: 'media', description: 'Featured in ESPN and TSN primetime segments', strength: 88 },
    ],
  },
  {
    id: 'ph-003',
    name: 'Chet Holmgren',
    sport: 'Basketball',
    league: 'NBA',
    team: 'Oklahoma City Thunder',
    age: 22,
    scoutGrade: 68,
    projectedCeiling: 'All-Star Starter',
    cardValue: 125,
    sixMonthProjection: 310,
    breakoutProbability: 0.74,
    signals: [
      { type: 'stats', description: 'Averaging 20/10 with 3 blocks in playoff push', strength: 86 },
      { type: 'scouting', description: 'Unicorn skill set drawing KG comparisons', strength: 80 },
      { type: 'social', description: 'Fan engagement up 200% after game-winner highlights', strength: 78 },
    ],
  },
  {
    id: 'ph-004',
    name: 'Caleb Williams',
    sport: 'Football',
    league: 'NFL',
    team: 'Chicago Bears',
    age: 23,
    scoutGrade: 72,
    projectedCeiling: 'Franchise QB',
    cardValue: 210,
    sixMonthProjection: 525,
    breakoutProbability: 0.79,
    signals: [
      { type: 'stats', description: 'Top-10 QBR in rookie campaign with 28 TDs', strength: 90 },
      { type: 'media', description: 'National ad campaign launching pre-season', strength: 82 },
    ],
  },
  {
    id: 'ph-005',
    name: 'Edouard Julien',
    sport: 'Baseball',
    league: 'MLB',
    team: 'Minnesota Twins',
    age: 25,
    scoutGrade: 60,
    projectedCeiling: 'All-Star',
    cardValue: 42,
    sixMonthProjection: 135,
    breakoutProbability: 0.63,
    signals: [
      { type: 'stats', description: 'Elite walk rate and OPS above .850 in spring', strength: 75 },
      { type: 'scouting', description: 'Power/patience combo comparable to young Votto', strength: 70 },
      { type: 'social', description: 'Growing Canadian fanbase driving hobby interest', strength: 55 },
    ],
  },
  {
    id: 'ph-006',
    name: 'Alexandre Sarr',
    sport: 'Basketball',
    league: 'NBA',
    team: 'Washington Wizards',
    age: 19,
    scoutGrade: 73,
    projectedCeiling: 'Franchise Cornerstone',
    cardValue: 155,
    sixMonthProjection: 380,
    breakoutProbability: 0.77,
    signals: [
      { type: 'stats', description: 'Averaging 16/9 with elite rim protection as rookie', strength: 84 },
      { type: 'media', description: 'Rising in Rookie of the Year odds after strong Q1', strength: 79 },
      { type: 'scouting', description: 'Defensive versatility rated elite by front offices', strength: 86 },
    ],
  },
];

// ---- Service Functions ----

export function getPhenoms(): Phenom[] {
  return [...phenoms];
}

export function getPhenomStats() {
  const totalPhenoms = phenoms.length;
  const avgBreakoutProbability =
    Math.round((phenoms.reduce((sum, p) => sum + p.breakoutProbability, 0) / totalPhenoms) * 100);
  const totalProjectedGain = phenoms.reduce((sum, p) => sum + (p.sixMonthProjection - p.cardValue), 0);
  const highestCeiling = phenoms.reduce((best, p) => (p.scoutGrade > best.scoutGrade ? p : best), phenoms[0]);
  const avgScoutGrade = Math.round(phenoms.reduce((sum, p) => sum + p.scoutGrade, 0) / totalPhenoms);
  const sportBreakdown = phenoms.reduce<Record<string, number>>((acc, p) => {
    acc[p.sport] = (acc[p.sport] || 0) + 1;
    return acc;
  }, {});

  return {
    totalPhenoms,
    avgBreakoutProbability,
    totalProjectedGain,
    highestCeiling: highestCeiling.name,
    avgScoutGrade,
    sportBreakdown,
  };
}

const phenomePipelineService = {
  getPhenoms,
  getPhenomStats,
};

export default phenomePipelineService;
