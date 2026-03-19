/**
 * Collection DNA Mixer Service
 * Genetic algorithm-inspired breeding engine that combines two collecting strategies
 * into optimized hybrid portfolios. Uses crossover, mutation, and fitness evaluation
 * to discover portfolio configurations that outperform both parent collections.
 */

// ────────────────────────────── Types ──────────────────────────────

export type GeneCategory =
  | 'growth'
  | 'stability'
  | 'diversification'
  | 'liquidity'
  | 'rarity'
  | 'vintage'
  | 'modern'
  | 'sport-mix';

export interface CollectionGene {
  trait: string;
  expression: number; // 0–100
  category: GeneCategory;
}

export interface CollectionDNA {
  id: string;
  ownerName: string;
  strategy: string;
  archetype: string;
  totalValue: number;
  cardCount: number;
  genes: CollectionGene[];
  fitnessScore: number; // 0–100
  strengths: string[];
  weaknesses: string[];
  color: string; // hex for UI
  icon: string; // emoji shorthand
}

export type HybridCardSource = 'parent1' | 'parent2' | 'mutation';

export interface HybridCard {
  cardId: string;
  cardName: string;
  player: string;
  source: HybridCardSource;
  weight: number; // portfolio weight 0–1
  contribution: string;
}

export interface HybridPortfolio {
  id: string;
  name: string;
  cards: HybridCard[];
  projectedReturn: number; // annualized %
  projectedRisk: number; // annualized std-dev %
  fitnessScore: number;
  inheritedFrom: { parent1Percent: number; parent2Percent: number };
  mutations: string[];
}

export interface BreedingResult {
  id: string;
  parent1: CollectionDNA;
  parent2: CollectionDNA;
  offspring: HybridPortfolio[];
  generationNumber: number;
  mutationRate: number;
  crossoverPoints: string[];
}

export interface GenerationHistory {
  breedingId: string;
  generations: {
    number: number;
    bestFitness: number;
    avgFitness: number;
    topOffspring: string;
  }[];
}

export interface CompatibilityScore {
  collection1: string;
  collection2: string;
  geneticDistance: number; // 0–100
  complementaryTraits: string[];
  conflictingTraits: string[];
  breedingPotential: number; // 0–100
}

export interface EvolutionaryPressure {
  factor: string;
  direction: 'towards' | 'away';
  strength: number; // 0–100
  description: string;
}

export interface BreedingLeaderboardEntry {
  breedingId: string;
  parent1Name: string;
  parent2Name: string;
  bestOffspringName: string;
  fitnessScore: number;
  generation: number;
  projectedReturn: number;
}

// ────────────────────────────── Archetypes ──────────────────────────────

const ARCHETYPES: Record<string, { label: string; description: string }> = {
  'blue-chipper': {
    label: 'The Blue Chipper',
    description: 'High-value holdings, low card count. Concentrates capital in proven blue-chip rookies and HOF staples.',
  },
  'volume-trader': {
    label: 'The Volume Trader',
    description: 'High card count, moderate total value. Profits from frequent flips and arbitrage across marketplaces.',
  },
  'vintage-purist': {
    label: 'The Vintage Purist',
    description: 'Pre-1980 focus. Prioritizes Topps, Bowman, and T206-era cards with proven scarcity floors.',
  },
  'modern-speculator': {
    label: 'The Modern Speculator',
    description: 'Chrome, Prizm, and National Treasures RC focus. Rides hype cycles and first-year performance spikes.',
  },
  'diversifier': {
    label: 'The Diversifier',
    description: 'Multi-sport balanced portfolio. Reduces correlation risk by spreading across NFL, NBA, MLB, and NHL.',
  },
  'niche-expert': {
    label: 'The Niche Expert',
    description: 'Deep single-player or single-team specialization. Exploits information edge within a narrow domain.',
  },
  'grail-hunter': {
    label: 'The Grail Hunter',
    description: 'Few ultra-high-value trophy cards. Targets PSA 10 flagship rookies and 1/1 autos with institutional demand.',
  },
  'prospect-farmer': {
    label: 'The Prospect Farmer',
    description: 'Young players, high risk/reward. Accumulates Bowman 1sts and international prospects before breakout.',
  },
};

// ────────────────────────────── Mock DNA Profiles ──────────────────────────────

const COLLECTION_DNAS: CollectionDNA[] = [
  {
    id: 'dna-001',
    ownerName: 'Marcus Chen',
    strategy: 'Concentrate capital in PSA 10 flagship RCs of perennial All-Stars',
    archetype: 'blue-chipper',
    totalValue: 187_500,
    cardCount: 42,
    genes: [
      { trait: 'ROI Consistency', expression: 88, category: 'growth' },
      { trait: 'Price Floor Strength', expression: 92, category: 'stability' },
      { trait: 'Sport Spread', expression: 25, category: 'diversification' },
      { trait: 'Days to Sell', expression: 72, category: 'liquidity' },
      { trait: 'Pop Count Scarcity', expression: 80, category: 'rarity' },
      { trait: 'Pre-1980 Weighting', expression: 15, category: 'vintage' },
      { trait: 'Post-2015 Weighting', expression: 70, category: 'modern' },
      { trait: 'Cross-Sport Balance', expression: 20, category: 'sport-mix' },
    ],
    fitnessScore: 82,
    strengths: ['Reliable 12–18% annual returns', 'Strong downside protection', 'High auction liquidity'],
    weaknesses: ['Low diversification across sports', 'Concentrated position risk', 'Misses breakout prospects'],
    color: '#3b82f6',
    icon: '💎',
  },
  {
    id: 'dna-002',
    ownerName: 'Tanya Rivera',
    strategy: 'Flip 200+ cards per month across eBay, COMC, and MySlabs',
    archetype: 'volume-trader',
    totalValue: 34_200,
    cardCount: 1_840,
    genes: [
      { trait: 'ROI Consistency', expression: 55, category: 'growth' },
      { trait: 'Price Floor Strength', expression: 35, category: 'stability' },
      { trait: 'Sport Spread', expression: 78, category: 'diversification' },
      { trait: 'Days to Sell', expression: 95, category: 'liquidity' },
      { trait: 'Pop Count Scarcity', expression: 22, category: 'rarity' },
      { trait: 'Pre-1980 Weighting', expression: 10, category: 'vintage' },
      { trait: 'Post-2015 Weighting', expression: 88, category: 'modern' },
      { trait: 'Cross-Sport Balance', expression: 72, category: 'sport-mix' },
    ],
    fitnessScore: 64,
    strengths: ['Best-in-class turnover velocity', 'Broad market exposure', 'Quick capital recycling'],
    weaknesses: ['Thin margins per card', 'High transaction costs', 'Minimal scarcity premium'],
    color: '#10b981',
    icon: '⚡',
  },
  {
    id: 'dna-003',
    ownerName: 'Harold Brennan',
    strategy: 'Curate a PSA/SGC registry-quality collection of 1950s–1970s HOFers',
    archetype: 'vintage-purist',
    totalValue: 312_000,
    cardCount: 128,
    genes: [
      { trait: 'ROI Consistency', expression: 70, category: 'growth' },
      { trait: 'Price Floor Strength', expression: 96, category: 'stability' },
      { trait: 'Sport Spread', expression: 18, category: 'diversification' },
      { trait: 'Days to Sell', expression: 40, category: 'liquidity' },
      { trait: 'Pop Count Scarcity', expression: 94, category: 'rarity' },
      { trait: 'Pre-1980 Weighting', expression: 98, category: 'vintage' },
      { trait: 'Post-2015 Weighting', expression: 3, category: 'modern' },
      { trait: 'Cross-Sport Balance', expression: 12, category: 'sport-mix' },
    ],
    fitnessScore: 78,
    strengths: ['Exceptional scarcity moat', 'Inflation-resistant assets', 'Registry set prestige'],
    weaknesses: ['Very slow capital deployment', 'Limited buyer pool', 'No upside from hype cycles'],
    color: '#f59e0b',
    icon: '🏛️',
  },
  {
    id: 'dna-004',
    ownerName: 'Jaylen Brooks',
    strategy: 'Stack Prizm Silver, Optic Rated Rookies, and Topps Chrome 1sts on breakout seasons',
    archetype: 'modern-speculator',
    totalValue: 52_800,
    cardCount: 310,
    genes: [
      { trait: 'ROI Consistency', expression: 42, category: 'growth' },
      { trait: 'Price Floor Strength', expression: 28, category: 'stability' },
      { trait: 'Sport Spread', expression: 55, category: 'diversification' },
      { trait: 'Days to Sell', expression: 90, category: 'liquidity' },
      { trait: 'Pop Count Scarcity', expression: 35, category: 'rarity' },
      { trait: 'Pre-1980 Weighting', expression: 2, category: 'vintage' },
      { trait: 'Post-2015 Weighting', expression: 97, category: 'modern' },
      { trait: 'Cross-Sport Balance', expression: 50, category: 'sport-mix' },
    ],
    fitnessScore: 58,
    strengths: ['Explosive short-term gains possible', 'Rides media/performance catalysts', 'Fast liquidity'],
    weaknesses: ['Severe drawdowns on injuries', 'High volatility', 'Trend-dependent'],
    color: '#ef4444',
    icon: '🚀',
  },
  {
    id: 'dna-005',
    ownerName: 'Priya Kapoor',
    strategy: 'Equal-weight allocation across NFL, NBA, MLB, NHL, and soccer with quarterly rebalance',
    archetype: 'diversifier',
    totalValue: 94_600,
    cardCount: 520,
    genes: [
      { trait: 'ROI Consistency', expression: 75, category: 'growth' },
      { trait: 'Price Floor Strength', expression: 68, category: 'stability' },
      { trait: 'Sport Spread', expression: 96, category: 'diversification' },
      { trait: 'Days to Sell', expression: 65, category: 'liquidity' },
      { trait: 'Pop Count Scarcity', expression: 50, category: 'rarity' },
      { trait: 'Pre-1980 Weighting', expression: 30, category: 'vintage' },
      { trait: 'Post-2015 Weighting', expression: 55, category: 'modern' },
      { trait: 'Cross-Sport Balance', expression: 95, category: 'sport-mix' },
    ],
    fitnessScore: 74,
    strengths: ['Low correlation across positions', 'Smooth equity curve', 'Broad market participation'],
    weaknesses: ['Diluted upside from any single sport', 'Complexity of monitoring 5 sports', 'Average rarity'],
    color: '#8b5cf6',
    icon: '🌐',
  },
  {
    id: 'dna-006',
    ownerName: 'Derek Yamamoto',
    strategy: 'All-in on Shohei Ohtani: every RC, parallel, auto, and memorabilia card available',
    archetype: 'niche-expert',
    totalValue: 145_000,
    cardCount: 280,
    genes: [
      { trait: 'ROI Consistency', expression: 60, category: 'growth' },
      { trait: 'Price Floor Strength', expression: 55, category: 'stability' },
      { trait: 'Sport Spread', expression: 5, category: 'diversification' },
      { trait: 'Days to Sell', expression: 82, category: 'liquidity' },
      { trait: 'Pop Count Scarcity', expression: 88, category: 'rarity' },
      { trait: 'Pre-1980 Weighting', expression: 0, category: 'vintage' },
      { trait: 'Post-2015 Weighting', expression: 95, category: 'modern' },
      { trait: 'Cross-Sport Balance', expression: 3, category: 'sport-mix' },
    ],
    fitnessScore: 71,
    strengths: ['Deepest market knowledge in niche', 'Controls supply of key parallels', 'Strong community following'],
    weaknesses: ['Catastrophic single-player risk', 'Zero diversification', 'Career-event dependent'],
    color: '#ec4899',
    icon: '🎯',
  },
  {
    id: 'dna-007',
    ownerName: 'Victoria Ashford',
    strategy: 'Acquire only PSA 10 / BGS 10 Black Label flagship RCs worth $5K+ each',
    archetype: 'grail-hunter',
    totalValue: 485_000,
    cardCount: 18,
    genes: [
      { trait: 'ROI Consistency', expression: 78, category: 'growth' },
      { trait: 'Price Floor Strength', expression: 90, category: 'stability' },
      { trait: 'Sport Spread', expression: 30, category: 'diversification' },
      { trait: 'Days to Sell', expression: 32, category: 'liquidity' },
      { trait: 'Pop Count Scarcity', expression: 98, category: 'rarity' },
      { trait: 'Pre-1980 Weighting', expression: 40, category: 'vintage' },
      { trait: 'Post-2015 Weighting', expression: 50, category: 'modern' },
      { trait: 'Cross-Sport Balance', expression: 28, category: 'sport-mix' },
    ],
    fitnessScore: 85,
    strengths: ['Institutional-grade assets', 'Highest scarcity moat', 'Strong brand equity'],
    weaknesses: ['Extremely illiquid', 'Large capital requirements', 'Thin auction schedule'],
    color: '#f97316',
    icon: '👑',
  },
  {
    id: 'dna-008',
    ownerName: 'Luis Moreno',
    strategy: 'Buy Bowman 1st Chromes of top-100 prospects across MLB/NBA/NFL before call-up',
    archetype: 'prospect-farmer',
    totalValue: 28_700,
    cardCount: 640,
    genes: [
      { trait: 'ROI Consistency', expression: 30, category: 'growth' },
      { trait: 'Price Floor Strength', expression: 18, category: 'stability' },
      { trait: 'Sport Spread', expression: 70, category: 'diversification' },
      { trait: 'Days to Sell', expression: 75, category: 'liquidity' },
      { trait: 'Pop Count Scarcity', expression: 40, category: 'rarity' },
      { trait: 'Pre-1980 Weighting', expression: 0, category: 'vintage' },
      { trait: 'Post-2015 Weighting', expression: 99, category: 'modern' },
      { trait: 'Cross-Sport Balance', expression: 65, category: 'sport-mix' },
    ],
    fitnessScore: 48,
    strengths: ['Massive upside on breakouts', 'Low cost basis', 'Multi-sport prospect coverage'],
    weaknesses: ['High bust rate', 'Very weak price floors', 'Long hold periods before payoff'],
    color: '#06b6d4',
    icon: '🌱',
  },
];

// ────────────────────────────── Mock Breeding Results ──────────────────────────────

function buildHybridCards(
  parent1: CollectionDNA,
  parent2: CollectionDNA,
  p1Pct: number,
): HybridCard[] {
  // deterministic but varied card lists per pair
  const p1Cards: HybridCard[] = [
    { cardId: 'hc-01', cardName: '2018 Prizm Silver Luka Doncic RC #280', player: 'Luka Doncic', source: 'parent1', weight: 0.12, contribution: 'Core growth engine — elite RC with steady appreciation' },
    { cardId: 'hc-02', cardName: '2011 Topps Update Mike Trout RC #US175 PSA 10', player: 'Mike Trout', source: 'parent1', weight: 0.15, contribution: 'Blue-chip anchor providing downside protection' },
    { cardId: 'hc-03', cardName: '2020 Panini Prizm Justin Herbert RC #325', player: 'Justin Herbert', source: 'parent1', weight: 0.08, contribution: 'Emerging franchise QB with multi-year upside' },
  ];
  const p2Cards: HybridCard[] = [
    { cardId: 'hc-04', cardName: '2003 Topps Chrome LeBron James RC #111', player: 'LeBron James', source: 'parent2', weight: 0.14, contribution: 'GOAT-tier asset with institutional demand' },
    { cardId: 'hc-05', cardName: '1986 Fleer Michael Jordan RC #57 PSA 9', player: 'Michael Jordan', source: 'parent2', weight: 0.11, contribution: 'Vintage crossover providing era diversification' },
    { cardId: 'hc-06', cardName: '2018 Topps Chrome Shohei Ohtani RC #150', player: 'Shohei Ohtani', source: 'parent2', weight: 0.09, contribution: 'Unicorn two-way player with global appeal' },
  ];
  const mutationCards: HybridCard[] = [
    { cardId: 'hc-07', cardName: '2023 Bowman Chrome Victor Wembanyama 1st', player: 'Victor Wembanyama', source: 'mutation', weight: 0.10, contribution: 'Mutation: generational prospect not in either parent' },
    { cardId: 'hc-08', cardName: '2024 Topps Chrome Elly De La Cruz RC', player: 'Elly De La Cruz', source: 'mutation', weight: 0.06, contribution: 'Mutation: high-ceiling speed/power combo prospect' },
  ];

  const base = [...p1Cards, ...p2Cards, ...mutationCards];
  // adjust weights so they roughly sum to ~0.85 (remaining is cash-like buffer)
  const totalW = base.reduce((s, c) => s + c.weight, 0);
  return base.map((c) => ({ ...c, weight: Math.round((c.weight / totalW) * 100 * p1Pct) / 100 || c.weight }));
}

const BREEDING_RESULTS: BreedingResult[] = [
  {
    id: 'breed-001',
    parent1: COLLECTION_DNAS[0], // Blue Chipper
    parent2: COLLECTION_DNAS[3], // Modern Speculator
    offspring: [
      {
        id: 'off-001a',
        name: 'Alpha Hybrid: Stable Growth',
        cards: buildHybridCards(COLLECTION_DNAS[0], COLLECTION_DNAS[3], 0.65),
        projectedReturn: 16.4,
        projectedRisk: 11.2,
        fitnessScore: 87,
        inheritedFrom: { parent1Percent: 65, parent2Percent: 28 },
        mutations: ['Added generational prospect exposure', 'Introduced international market weighting'],
      },
      {
        id: 'off-001b',
        name: 'Beta Hybrid: Momentum Tilt',
        cards: buildHybridCards(COLLECTION_DNAS[0], COLLECTION_DNAS[3], 0.45),
        projectedReturn: 22.1,
        projectedRisk: 18.7,
        fitnessScore: 79,
        inheritedFrom: { parent1Percent: 45, parent2Percent: 47 },
        mutations: ['Hype-cycle timing gene activated', 'Reduced vintage ballast'],
      },
      {
        id: 'off-001c',
        name: 'Gamma Hybrid: Balanced Core',
        cards: buildHybridCards(COLLECTION_DNAS[0], COLLECTION_DNAS[3], 0.55),
        projectedReturn: 18.8,
        projectedRisk: 13.5,
        fitnessScore: 84,
        inheritedFrom: { parent1Percent: 55, parent2Percent: 38 },
        mutations: ['Cross-sport rebalance trigger'],
      },
    ],
    generationNumber: 5,
    mutationRate: 0.07,
    crossoverPoints: ['ROI Consistency', 'Days to Sell', 'Post-2015 Weighting'],
  },
  {
    id: 'breed-002',
    parent1: COLLECTION_DNAS[2], // Vintage Purist
    parent2: COLLECTION_DNAS[7], // Prospect Farmer
    offspring: [
      {
        id: 'off-002a',
        name: 'Epoch Blend: Time-Spanning Core',
        cards: [
          { cardId: 'hc-20', cardName: '1952 Topps Mickey Mantle #311 PSA 5', player: 'Mickey Mantle', source: 'parent1', weight: 0.18, contribution: 'Iconic vintage anchor with perpetual demand' },
          { cardId: 'hc-21', cardName: '1969 Topps Reggie Jackson RC #260 PSA 8', player: 'Reggie Jackson', source: 'parent1', weight: 0.10, contribution: 'HOF vintage with upward trajectory' },
          { cardId: 'hc-22', cardName: '1956 Topps Roberto Clemente #33 PSA 6', player: 'Roberto Clemente', source: 'parent1', weight: 0.12, contribution: 'Cultural icon with scarcity premium' },
          { cardId: 'hc-23', cardName: '2024 Bowman Chrome Paul Skenes 1st Auto', player: 'Paul Skenes', source: 'parent2', weight: 0.09, contribution: 'Top pitching prospect with ace upside' },
          { cardId: 'hc-24', cardName: '2023 Bowman 1st Ethan Salas Auto', player: 'Ethan Salas', source: 'parent2', weight: 0.07, contribution: 'Elite international prospect lottery ticket' },
          { cardId: 'hc-25', cardName: '2024 Prizm Draft Caleb Williams RC Auto', player: 'Caleb Williams', source: 'parent2', weight: 0.08, contribution: '#1 overall pick with franchise QB ceiling' },
          { cardId: 'hc-26', cardName: '2023 Topps Chrome Corbin Carroll RC PSA 10', player: 'Corbin Carroll', source: 'mutation', weight: 0.06, contribution: 'Mutation: ROY bridge between eras' },
        ],
        projectedReturn: 14.2,
        projectedRisk: 9.8,
        fitnessScore: 81,
        inheritedFrom: { parent1Percent: 58, parent2Percent: 34 },
        mutations: ['Era-bridge diversification gene', 'Risk-adjusted prospect sizing'],
      },
      {
        id: 'off-002b',
        name: 'Future Vintage: Prospect-Heavy',
        cards: [
          { cardId: 'hc-27', cardName: '1955 Topps Sandy Koufax RC #123 PSA 7', player: 'Sandy Koufax', source: 'parent1', weight: 0.14, contribution: 'Vintage floor protection' },
          { cardId: 'hc-28', cardName: '2024 Bowman Chrome Roki Sasaki 1st', player: 'Roki Sasaki', source: 'parent2', weight: 0.12, contribution: 'Japanese phenom with NPB dominance' },
          { cardId: 'hc-29', cardName: '2024 Bowman Chrome JJ Wetherholt 1st Auto', player: 'JJ Wetherholt', source: 'parent2', weight: 0.08, contribution: 'College star with hit-tool ceiling' },
          { cardId: 'hc-30', cardName: '2023 Bowman 1st Dylan Crews Auto', player: 'Dylan Crews', source: 'parent2', weight: 0.09, contribution: 'Five-tool OF with early impact timeline' },
          { cardId: 'hc-31', cardName: '2025 Prizm Cooper Flagg RC', player: 'Cooper Flagg', source: 'mutation', weight: 0.11, contribution: 'Mutation: #1 NBA draft pick generational talent' },
        ],
        projectedReturn: 28.5,
        projectedRisk: 24.3,
        fitnessScore: 68,
        inheritedFrom: { parent1Percent: 30, parent2Percent: 55 },
        mutations: ['Prospect weighting amplified', 'Added NBA crossover prospect', 'Vintage reduced to floor-only'],
      },
    ],
    generationNumber: 4,
    mutationRate: 0.12,
    crossoverPoints: ['Price Floor Strength', 'Pop Count Scarcity', 'Pre-1980 Weighting'],
  },
  {
    id: 'breed-003',
    parent1: COLLECTION_DNAS[4], // Diversifier
    parent2: COLLECTION_DNAS[6], // Grail Hunter
    offspring: [
      {
        id: 'off-003a',
        name: 'Trophy Mosaic: Grails Across Sports',
        cards: [
          { cardId: 'hc-40', cardName: '2003 Topps Chrome LeBron RC #111 PSA 10', player: 'LeBron James', source: 'parent2', weight: 0.16, contribution: 'NBA grail with unmatched liquidity at scale' },
          { cardId: 'hc-41', cardName: '2000 Playoff Contenders Tom Brady RC Auto #144', player: 'Tom Brady', source: 'parent2', weight: 0.14, contribution: 'NFL GOAT auto with institutional backing' },
          { cardId: 'hc-42', cardName: '2011 Topps Update Mike Trout RC PSA 10', player: 'Mike Trout', source: 'parent1', weight: 0.10, contribution: 'MLB blue-chip diversifier' },
          { cardId: 'hc-43', cardName: '2015-16 Panini Prizm Silver Connor McDavid RC', player: 'Connor McDavid', source: 'parent1', weight: 0.08, contribution: 'NHL exposure for sport-mix gene' },
          { cardId: 'hc-44', cardName: '2019 Topps Chrome Erling Haaland RC', player: 'Erling Haaland', source: 'parent1', weight: 0.07, contribution: 'Soccer/football global market exposure' },
          { cardId: 'hc-45', cardName: '1986 Fleer Michael Jordan RC #57 BGS 9.5', player: 'Michael Jordan', source: 'mutation', weight: 0.12, contribution: 'Mutation: cross-era grail balancing vintage + modern' },
        ],
        projectedReturn: 15.8,
        projectedRisk: 8.4,
        fitnessScore: 91,
        inheritedFrom: { parent1Percent: 42, parent2Percent: 48 },
        mutations: ['Cross-era grail selection', 'Sport-mix grail weighting'],
      },
    ],
    generationNumber: 7,
    mutationRate: 0.05,
    crossoverPoints: ['Sport Spread', 'Pop Count Scarcity', 'Cross-Sport Balance'],
  },
  {
    id: 'breed-004',
    parent1: COLLECTION_DNAS[5], // Niche Expert (Ohtani)
    parent2: COLLECTION_DNAS[1], // Volume Trader
    offspring: [
      {
        id: 'off-004a',
        name: 'Focused Flow: Expert Velocity',
        cards: [
          { cardId: 'hc-50', cardName: '2018 Topps Chrome Shohei Ohtani RC #150 PSA 10', player: 'Shohei Ohtani', source: 'parent1', weight: 0.15, contribution: 'Flagship Ohtani RC as core holding' },
          { cardId: 'hc-51', cardName: '2018 Bowman Chrome Shohei Ohtani #1 Auto', player: 'Shohei Ohtani', source: 'parent1', weight: 0.10, contribution: 'Premium auto for long-term hold' },
          { cardId: 'hc-52', cardName: '2023 Topps Chrome Ohtani /50 Gold Refractor', player: 'Shohei Ohtani', source: 'parent1', weight: 0.08, contribution: 'Low-pop parallel for scarcity' },
          { cardId: 'hc-53', cardName: '2024 Panini Prizm Jayden Daniels RC', player: 'Jayden Daniels', source: 'parent2', weight: 0.06, contribution: 'High-velocity flip candidate from Volume parent' },
          { cardId: 'hc-54', cardName: '2024 Topps Chrome Jackson Merrill RC', player: 'Jackson Merrill', source: 'parent2', weight: 0.05, contribution: 'Quick-flip ROY candidate' },
          { cardId: 'hc-55', cardName: '2024 Prizm Caitlin Clark RC', player: 'Caitlin Clark', source: 'mutation', weight: 0.09, contribution: 'Mutation: WNBA crossover market expansion' },
          { cardId: 'hc-56', cardName: '2024 Topps Chrome Paul Skenes RC', player: 'Paul Skenes', source: 'parent2', weight: 0.05, contribution: 'Pitching phenom with flip liquidity' },
        ],
        projectedReturn: 19.6,
        projectedRisk: 16.2,
        fitnessScore: 76,
        inheritedFrom: { parent1Percent: 52, parent2Percent: 38 },
        mutations: ['WNBA market exposure gene', 'Volume pruning for quality'],
      },
      {
        id: 'off-004b',
        name: 'Broad Flip: Volume Diversified',
        cards: [
          { cardId: 'hc-57', cardName: '2018 Topps Chrome Ohtani RC PSA 10', player: 'Shohei Ohtani', source: 'parent1', weight: 0.08, contribution: 'Reduced Ohtani weight for diversification' },
          { cardId: 'hc-58', cardName: '2024 Donruss Rated Rookie Bundle (x15)', player: 'Various', source: 'parent2', weight: 0.12, contribution: 'Volume flip lot for capital recycling' },
          { cardId: 'hc-59', cardName: '2024 Topps Series 1 SP Bundle (x8)', player: 'Various', source: 'parent2', weight: 0.10, contribution: 'Short-print arbitrage lot' },
          { cardId: 'hc-60', cardName: '2023 Prizm NBA Hobby Box Breaks (allocation)', player: 'Various', source: 'parent2', weight: 0.09, contribution: 'Break participation for upside exposure' },
          { cardId: 'hc-61', cardName: '2024 Bowman Chrome HTA Box Reserve', player: 'Various', source: 'mutation', weight: 0.07, contribution: 'Mutation: sealed product speculation' },
        ],
        projectedReturn: 14.2,
        projectedRisk: 12.8,
        fitnessScore: 70,
        inheritedFrom: { parent1Percent: 28, parent2Percent: 62 },
        mutations: ['Sealed product speculation gene', 'Niche concentration diluted'],
      },
    ],
    generationNumber: 6,
    mutationRate: 0.09,
    crossoverPoints: ['Days to Sell', 'Sport Spread', 'Pop Count Scarcity'],
  },
];

// ────────────────────────────── Generation Histories ──────────────────────────────

const GENERATION_HISTORIES: GenerationHistory[] = [
  {
    breedingId: 'breed-001',
    generations: [
      { number: 1, bestFitness: 72, avgFitness: 58, topOffspring: 'Proto Hybrid A' },
      { number: 2, bestFitness: 78, avgFitness: 64, topOffspring: 'Refined Core' },
      { number: 3, bestFitness: 82, avgFitness: 70, topOffspring: 'Balanced Blend' },
      { number: 4, bestFitness: 85, avgFitness: 74, topOffspring: 'Gamma Hybrid: Balanced Core' },
      { number: 5, bestFitness: 87, avgFitness: 78, topOffspring: 'Alpha Hybrid: Stable Growth' },
    ],
  },
  {
    breedingId: 'breed-002',
    generations: [
      { number: 1, bestFitness: 55, avgFitness: 42, topOffspring: 'Raw Mix A' },
      { number: 2, bestFitness: 64, avgFitness: 50, topOffspring: 'Era-Split Core' },
      { number: 3, bestFitness: 72, avgFitness: 58, topOffspring: 'Timeline Blend' },
      { number: 4, bestFitness: 81, avgFitness: 65, topOffspring: 'Epoch Blend: Time-Spanning Core' },
    ],
  },
  {
    breedingId: 'breed-003',
    generations: [
      { number: 1, bestFitness: 68, avgFitness: 55, topOffspring: 'Proto Mosaic' },
      { number: 2, bestFitness: 74, avgFitness: 62, topOffspring: 'Sport-Spread Grails' },
      { number: 3, bestFitness: 79, avgFitness: 68, topOffspring: 'Wide Grail v2' },
      { number: 4, bestFitness: 83, avgFitness: 72, topOffspring: 'Refined Mosaic' },
      { number: 5, bestFitness: 86, avgFitness: 76, topOffspring: 'Balanced Trophy' },
      { number: 6, bestFitness: 89, avgFitness: 80, topOffspring: 'Near-Optimal Mosaic' },
      { number: 7, bestFitness: 91, avgFitness: 83, topOffspring: 'Trophy Mosaic: Grails Across Sports' },
    ],
  },
  {
    breedingId: 'breed-004',
    generations: [
      { number: 1, bestFitness: 52, avgFitness: 40, topOffspring: 'Raw Expert-Volume' },
      { number: 2, bestFitness: 60, avgFitness: 48, topOffspring: 'Focused Flip v1' },
      { number: 3, bestFitness: 66, avgFitness: 54, topOffspring: 'Niche Velocity' },
      { number: 4, bestFitness: 70, avgFitness: 60, topOffspring: 'Broad Flip: Volume Diversified' },
      { number: 5, bestFitness: 73, avgFitness: 64, topOffspring: 'Expert Flow v2' },
      { number: 6, bestFitness: 76, avgFitness: 68, topOffspring: 'Focused Flow: Expert Velocity' },
    ],
  },
];

// ────────────────────────────── Compatibility Matrix ──────────────────────────────

function computeGeneticDistance(a: CollectionDNA, b: CollectionDNA): number {
  const diffs = a.genes.map((g, i) => Math.abs(g.expression - b.genes[i].expression));
  return Math.round(diffs.reduce((s, d) => s + d, 0) / diffs.length);
}

function deriveComplementaryTraits(a: CollectionDNA, b: CollectionDNA): string[] {
  const traits: string[] = [];
  a.genes.forEach((g, i) => {
    const bg = b.genes[i];
    if ((g.expression >= 70 && bg.expression <= 40) || (bg.expression >= 70 && g.expression <= 40)) {
      const strong = g.expression > bg.expression ? a : b;
      traits.push(`${strong.archetype} contributes strong ${g.trait}`);
    }
  });
  return traits.slice(0, 4);
}

function deriveConflictingTraits(a: CollectionDNA, b: CollectionDNA): string[] {
  const conflicts: string[] = [];
  a.genes.forEach((g, i) => {
    const bg = b.genes[i];
    if (g.expression >= 75 && bg.expression >= 75) {
      conflicts.push(`Both overweight ${g.trait} — redundancy risk`);
    }
  });
  return conflicts.slice(0, 3);
}

function computeBreedingPotential(distance: number, comp: string[], confl: string[]): number {
  // higher distance + more complementary - conflicts = better breeding
  const base = Math.min(100, distance * 1.2 + comp.length * 8 - confl.length * 12);
  return Math.max(10, Math.min(98, Math.round(base)));
}

const COMPATIBILITY_MATRIX: CompatibilityScore[] = [];

for (let i = 0; i < COLLECTION_DNAS.length; i++) {
  for (let j = i + 1; j < COLLECTION_DNAS.length; j++) {
    const a = COLLECTION_DNAS[i];
    const b = COLLECTION_DNAS[j];
    const dist = computeGeneticDistance(a, b);
    const comp = deriveComplementaryTraits(a, b);
    const confl = deriveConflictingTraits(a, b);
    COMPATIBILITY_MATRIX.push({
      collection1: a.id,
      collection2: b.id,
      geneticDistance: dist,
      complementaryTraits: comp,
      conflictingTraits: confl,
      breedingPotential: computeBreedingPotential(dist, comp, confl),
    });
  }
}

// ────────────────────────────── Simulated Async Helpers ──────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ────────────────────────────── Public API ──────────────────────────────

export async function getCollectionDNA(id: string): Promise<CollectionDNA | null> {
  await delay(180);
  return COLLECTION_DNAS.find((d) => d.id === id) ?? null;
}

export async function getAllCollectionDNAs(): Promise<CollectionDNA[]> {
  await delay(220);
  return [...COLLECTION_DNAS];
}

export async function breedCollections(
  id1: string,
  id2: string,
  _generations?: number,
): Promise<BreedingResult | null> {
  await delay(600);
  const result = BREEDING_RESULTS.find(
    (r) =>
      (r.parent1.id === id1 && r.parent2.id === id2) ||
      (r.parent1.id === id2 && r.parent2.id === id1),
  );
  return result ?? null;
}

export async function getCompatibilityScore(
  id1: string,
  id2: string,
): Promise<CompatibilityScore | null> {
  await delay(120);
  return (
    COMPATIBILITY_MATRIX.find(
      (c) =>
        (c.collection1 === id1 && c.collection2 === id2) ||
        (c.collection1 === id2 && c.collection2 === id1),
    ) ?? null
  );
}

export async function getFullCompatibilityMatrix(): Promise<CompatibilityScore[]> {
  await delay(250);
  return [...COMPATIBILITY_MATRIX];
}

export async function getCollectionArchetypes(): Promise<
  { key: string; label: string; description: string }[]
> {
  await delay(100);
  return Object.entries(ARCHETYPES).map(([key, val]) => ({ key, ...val }));
}

export async function getGenerationHistory(
  breedingId: string,
): Promise<GenerationHistory | null> {
  await delay(200);
  return GENERATION_HISTORIES.find((h) => h.breedingId === breedingId) ?? null;
}

export async function getOptimalMate(
  collectionId: string,
): Promise<{ mate: CollectionDNA; compatibility: CompatibilityScore }[]> {
  await delay(300);
  const relevant = COMPATIBILITY_MATRIX.filter(
    (c) => c.collection1 === collectionId || c.collection2 === collectionId,
  ).sort((a, b) => b.breedingPotential - a.breedingPotential);

  return relevant.map((compat) => {
    const mateId =
      compat.collection1 === collectionId ? compat.collection2 : compat.collection1;
    const mate = COLLECTION_DNAS.find((d) => d.id === mateId)!;
    return { mate, compatibility: compat };
  });
}

export async function applyEvolutionaryPressure(
  breedingId: string,
  pressures: EvolutionaryPressure[],
): Promise<BreedingResult | null> {
  await delay(500);
  const base = BREEDING_RESULTS.find((r) => r.id === breedingId);
  if (!base) return null;

  // simulate pressure application by adjusting offspring fitness
  const adjusted: BreedingResult = {
    ...base,
    generationNumber: base.generationNumber + 1,
    offspring: base.offspring.map((off) => {
      let fitnessAdj = 0;
      const newMutations = [...off.mutations];
      pressures.forEach((p) => {
        const delta = p.direction === 'towards' ? p.strength * 0.15 : -p.strength * 0.1;
        fitnessAdj += delta;
        newMutations.push(`Pressure: ${p.factor} (${p.direction}, str=${p.strength})`);
      });
      return {
        ...off,
        fitnessScore: Math.max(0, Math.min(100, Math.round(off.fitnessScore + fitnessAdj))),
        mutations: newMutations,
      };
    }),
  };
  return adjusted;
}

export async function getBreedingLeaderboard(): Promise<BreedingLeaderboardEntry[]> {
  await delay(200);
  return BREEDING_RESULTS.flatMap((br) =>
    br.offspring.map((off) => ({
      breedingId: br.id,
      parent1Name: `${br.parent1.ownerName} (${ARCHETYPES[br.parent1.archetype]?.label ?? br.parent1.archetype})`,
      parent2Name: `${br.parent2.ownerName} (${ARCHETYPES[br.parent2.archetype]?.label ?? br.parent2.archetype})`,
      bestOffspringName: off.name,
      fitnessScore: off.fitnessScore,
      generation: br.generationNumber,
      projectedReturn: off.projectedReturn,
    })),
  ).sort((a, b) => b.fitnessScore - a.fitnessScore);
}
