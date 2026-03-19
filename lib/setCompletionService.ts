// ─── Set Completion Advisor Service ─────────────────────────────────────────
// Tracks card set completion progress, missing cards, source recommendations,
// and cost-to-complete analytics for sports card collectors.

const STORAGE_PREFIX = 'msi_set_completion';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MissingCard {
  cardNumber: string;
  cardName: string;
  player: string;
  estimatedCost: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'ssp';
}

export interface CardSet {
  id: string;
  name: string;
  year: number;
  sport: string;
  brand: string;
  totalCards: number;
  ownedCards: number;
  missingCards: MissingCard[];
  completionPercent: number;
  totalSetValue: number;
  ownedValue: number;
  costToComplete: number;
  lastUpdated: string;
}

export interface SetProgress {
  setId: string;
  milestones: { percent: number; reached: boolean; reachedDate?: string }[];
  currentStreak: number;
  lastCardAdded: string;
}

export interface SourceRecommendation {
  cardName: string;
  platform: string;
  price: number;
  condition: string;
  url: string;
  confidence: number;
}

export interface SetCompletionStats {
  totalSets: number;
  avgCompletion: number;
  closestToComplete: string;
  totalOwned: number;
  totalMissing: number;
  totalCostToComplete: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_SETS: CardSet[] = [
  {
    id: 'set-001',
    name: '2023 Topps Chrome',
    year: 2023,
    sport: 'Baseball',
    brand: 'Topps',
    totalCards: 200,
    ownedCards: 178,
    missingCards: [
      { cardNumber: '12', cardName: 'Chrome Refractor #12', player: 'Julio Rodriguez', estimatedCost: 45.00, rarity: 'rare' },
      { cardNumber: '33', cardName: 'Chrome Base #33', player: 'Shohei Ohtani', estimatedCost: 8.50, rarity: 'common' },
      { cardNumber: '55', cardName: 'Chrome Rookie #55', player: 'Corbin Carroll', estimatedCost: 22.00, rarity: 'uncommon' },
      { cardNumber: '78', cardName: 'Chrome Xfractor #78', player: 'Adley Rutschman', estimatedCost: 65.00, rarity: 'ssp' },
      { cardNumber: '101', cardName: 'Chrome Base #101', player: 'Mike Trout', estimatedCost: 5.00, rarity: 'common' },
      { cardNumber: '134', cardName: 'Chrome Sepia #134', player: 'Ronald Acuna Jr.', estimatedCost: 30.00, rarity: 'rare' },
      { cardNumber: '145', cardName: 'Chrome Base #145', player: 'Bobby Witt Jr.', estimatedCost: 3.50, rarity: 'common' },
      { cardNumber: '156', cardName: 'Chrome Refractor #156', player: 'Gunnar Henderson', estimatedCost: 38.00, rarity: 'rare' },
      { cardNumber: '167', cardName: 'Chrome Base #167', player: 'Elly De La Cruz', estimatedCost: 6.00, rarity: 'common' },
      { cardNumber: '178', cardName: 'Chrome Base #178', player: 'CJ Abrams', estimatedCost: 2.50, rarity: 'common' },
      { cardNumber: '183', cardName: 'Chrome Prism #183', player: 'Spencer Strider', estimatedCost: 18.00, rarity: 'uncommon' },
      { cardNumber: '190', cardName: 'Chrome Gold #190', player: 'Corey Seager', estimatedCost: 85.00, rarity: 'ssp' },
      { cardNumber: '195', cardName: 'Chrome Base #195', player: 'Mookie Betts', estimatedCost: 4.00, rarity: 'common' },
      { cardNumber: '198', cardName: 'Chrome Aqua #198', player: 'Marcus Semien', estimatedCost: 12.00, rarity: 'uncommon' },
      { cardNumber: '200', cardName: 'Chrome Rookie SP #200', player: 'Jackson Chourio', estimatedCost: 55.00, rarity: 'rare' },
    ],
    completionPercent: 89,
    totalSetValue: 2800,
    ownedValue: 2400,
    costToComplete: 399.50,
    lastUpdated: '2025-12-15',
  },
  {
    id: 'set-002',
    name: '2023 Panini Prizm Basketball',
    year: 2023,
    sport: 'Basketball',
    brand: 'Panini',
    totalCards: 300,
    ownedCards: 245,
    missingCards: [
      { cardNumber: '7', cardName: 'Prizm Silver #7', player: 'Victor Wembanyama', estimatedCost: 120.00, rarity: 'ssp' },
      { cardNumber: '22', cardName: 'Prizm Base #22', player: 'LeBron James', estimatedCost: 12.00, rarity: 'common' },
      { cardNumber: '45', cardName: 'Prizm Red Wave #45', player: 'Luka Doncic', estimatedCost: 75.00, rarity: 'rare' },
      { cardNumber: '89', cardName: 'Prizm Base #89', player: 'Jayson Tatum', estimatedCost: 5.00, rarity: 'common' },
      { cardNumber: '112', cardName: 'Prizm Green #112', player: 'Brandon Miller', estimatedCost: 28.00, rarity: 'uncommon' },
    ],
    completionPercent: 81.67,
    totalSetValue: 5200,
    ownedValue: 4100,
    costToComplete: 240.00,
    lastUpdated: '2025-12-10',
  },
  {
    id: 'set-003',
    name: '2024 Topps Series 1',
    year: 2024,
    sport: 'Baseball',
    brand: 'Topps',
    totalCards: 330,
    ownedCards: 310,
    missingCards: [
      { cardNumber: '15', cardName: 'Base #15', player: 'Juan Soto', estimatedCost: 4.00, rarity: 'common' },
      { cardNumber: '120', cardName: 'SP Variation #120', player: 'Pete Alonso', estimatedCost: 35.00, rarity: 'rare' },
      { cardNumber: '250', cardName: 'Rookie #250', player: 'Paul Skenes', estimatedCost: 15.00, rarity: 'uncommon' },
    ],
    completionPercent: 93.94,
    totalSetValue: 1800,
    ownedValue: 1720,
    costToComplete: 54.00,
    lastUpdated: '2025-12-18',
  },
  {
    id: 'set-004',
    name: '2023 Panini Donruss Football',
    year: 2023,
    sport: 'Football',
    brand: 'Panini',
    totalCards: 400,
    ownedCards: 280,
    missingCards: [
      { cardNumber: '1', cardName: 'Donruss Rated Rookie #1', player: 'CJ Stroud', estimatedCost: 40.00, rarity: 'rare' },
      { cardNumber: '50', cardName: 'Donruss Base #50', player: 'Patrick Mahomes', estimatedCost: 8.00, rarity: 'common' },
      { cardNumber: '77', cardName: 'Donruss Optic #77', player: 'Caleb Williams', estimatedCost: 55.00, rarity: 'ssp' },
      { cardNumber: '100', cardName: 'Donruss Base #100', player: 'Josh Allen', estimatedCost: 6.00, rarity: 'common' },
      { cardNumber: '150', cardName: 'Donruss Press Proof #150', player: 'Brock Purdy', estimatedCost: 22.00, rarity: 'uncommon' },
      { cardNumber: '200', cardName: 'Donruss Base #200', player: 'Lamar Jackson', estimatedCost: 5.00, rarity: 'common' },
      { cardNumber: '255', cardName: 'Donruss Base #255', player: 'Joe Burrow', estimatedCost: 7.00, rarity: 'common' },
    ],
    completionPercent: 70,
    totalSetValue: 3500,
    ownedValue: 2400,
    costToComplete: 143.00,
    lastUpdated: '2025-11-20',
  },
  {
    id: 'set-005',
    name: '2024 Upper Deck Hockey Series 1',
    year: 2024,
    sport: 'Hockey',
    brand: 'Upper Deck',
    totalCards: 250,
    ownedCards: 125,
    missingCards: [
      { cardNumber: '5', cardName: 'Young Guns #5', player: 'Connor Bedard', estimatedCost: 95.00, rarity: 'ssp' },
      { cardNumber: '30', cardName: 'Base #30', player: 'Connor McDavid', estimatedCost: 10.00, rarity: 'common' },
      { cardNumber: '65', cardName: 'Canvas #65', player: 'Auston Matthews', estimatedCost: 18.00, rarity: 'uncommon' },
      { cardNumber: '110', cardName: 'Base #110', player: 'Nathan MacKinnon', estimatedCost: 4.00, rarity: 'common' },
    ],
    completionPercent: 50,
    totalSetValue: 1500,
    ownedValue: 750,
    costToComplete: 127.00,
    lastUpdated: '2025-10-05',
  },
  {
    id: 'set-006',
    name: '2023 Topps Heritage',
    year: 2023,
    sport: 'Baseball',
    brand: 'Topps',
    totalCards: 500,
    ownedCards: 485,
    missingCards: [
      { cardNumber: '100', cardName: 'Heritage SP #100', player: 'Aaron Judge', estimatedCost: 25.00, rarity: 'rare' },
      { cardNumber: '300', cardName: 'Heritage SP #300', player: 'Freddie Freeman', estimatedCost: 18.00, rarity: 'rare' },
    ],
    completionPercent: 97,
    totalSetValue: 3200,
    ownedValue: 3100,
    costToComplete: 43.00,
    lastUpdated: '2025-12-20',
  },
  {
    id: 'set-007',
    name: '2024 Panini Prizm Draft Picks Football',
    year: 2024,
    sport: 'Football',
    brand: 'Panini',
    totalCards: 200,
    ownedCards: 140,
    missingCards: [
      { cardNumber: '1', cardName: 'Prizm Draft #1', player: 'Caleb Williams', estimatedCost: 50.00, rarity: 'rare' },
      { cardNumber: '25', cardName: 'Prizm Base #25', player: 'Marvin Harrison Jr.', estimatedCost: 15.00, rarity: 'uncommon' },
      { cardNumber: '50', cardName: 'Prizm Silver #50', player: 'Jayden Daniels', estimatedCost: 65.00, rarity: 'ssp' },
      { cardNumber: '75', cardName: 'Prizm Base #75', player: 'Drake Maye', estimatedCost: 8.00, rarity: 'common' },
    ],
    completionPercent: 70,
    totalSetValue: 2200,
    ownedValue: 1500,
    costToComplete: 138.00,
    lastUpdated: '2025-11-15',
  },
  {
    id: 'set-008',
    name: '2023 Panini Select Basketball',
    year: 2023,
    sport: 'Basketball',
    brand: 'Panini',
    totalCards: 250,
    ownedCards: 200,
    missingCards: [
      { cardNumber: '10', cardName: 'Select Courtside #10', player: 'Nikola Jokic', estimatedCost: 42.00, rarity: 'rare' },
      { cardNumber: '88', cardName: 'Select Concourse #88', player: 'Anthony Edwards', estimatedCost: 20.00, rarity: 'uncommon' },
      { cardNumber: '150', cardName: 'Select Base #150', player: 'Shai Gilgeous-Alexander', estimatedCost: 9.00, rarity: 'common' },
    ],
    completionPercent: 80,
    totalSetValue: 4000,
    ownedValue: 3200,
    costToComplete: 71.00,
    lastUpdated: '2025-12-01',
  },
  {
    id: 'set-009',
    name: '2024 Topps Chrome Update',
    year: 2024,
    sport: 'Baseball',
    brand: 'Topps',
    totalCards: 150,
    ownedCards: 85,
    missingCards: [
      { cardNumber: '5', cardName: 'Chrome Update Rookie #5', player: 'Jackson Merrill', estimatedCost: 18.00, rarity: 'uncommon' },
      { cardNumber: '30', cardName: 'Chrome Update Base #30', player: 'Yoshinobu Yamamoto', estimatedCost: 6.00, rarity: 'common' },
      { cardNumber: '60', cardName: 'Chrome Update Refractor #60', player: 'Junior Caminero', estimatedCost: 32.00, rarity: 'rare' },
      { cardNumber: '90', cardName: 'Chrome Update Base #90', player: 'Bryce Harper', estimatedCost: 4.50, rarity: 'common' },
      { cardNumber: '120', cardName: 'Chrome Update Gold #120', player: 'Wyatt Langford', estimatedCost: 78.00, rarity: 'ssp' },
    ],
    completionPercent: 56.67,
    totalSetValue: 1200,
    ownedValue: 680,
    costToComplete: 138.50,
    lastUpdated: '2025-12-22',
  },
  {
    id: 'set-010',
    name: '2023 Topps Finest',
    year: 2023,
    sport: 'Baseball',
    brand: 'Topps',
    totalCards: 200,
    ownedCards: 190,
    missingCards: [
      { cardNumber: '25', cardName: 'Finest Refractor #25', player: 'Mookie Betts', estimatedCost: 20.00, rarity: 'uncommon' },
      { cardNumber: '75', cardName: 'Finest Base #75', player: 'Trea Turner', estimatedCost: 3.00, rarity: 'common' },
    ],
    completionPercent: 95,
    totalSetValue: 2000,
    ownedValue: 1900,
    costToComplete: 23.00,
    lastUpdated: '2025-12-12',
  },
  {
    id: 'set-011',
    name: '2024 Panini Mosaic Football',
    year: 2024,
    sport: 'Football',
    brand: 'Panini',
    totalCards: 350,
    ownedCards: 100,
    missingCards: [
      { cardNumber: '10', cardName: 'Mosaic Stained Glass #10', player: 'Travis Kelce', estimatedCost: 35.00, rarity: 'rare' },
      { cardNumber: '55', cardName: 'Mosaic Base #55', player: 'Jalen Hurts', estimatedCost: 7.00, rarity: 'common' },
      { cardNumber: '120', cardName: 'Mosaic Prizm #120', player: 'CJ Stroud', estimatedCost: 28.00, rarity: 'uncommon' },
      { cardNumber: '200', cardName: 'Mosaic Gold #200', player: 'Tyreek Hill', estimatedCost: 60.00, rarity: 'ssp' },
      { cardNumber: '300', cardName: 'Mosaic Base #300', player: 'Dak Prescott', estimatedCost: 4.00, rarity: 'common' },
    ],
    completionPercent: 28.57,
    totalSetValue: 3800,
    ownedValue: 1100,
    costToComplete: 134.00,
    lastUpdated: '2025-11-01',
  },
  {
    id: 'set-012',
    name: '2024 Topps Stadium Club',
    year: 2024,
    sport: 'Baseball',
    brand: 'Topps',
    totalCards: 300,
    ownedCards: 260,
    missingCards: [
      { cardNumber: '15', cardName: 'Stadium Club Chrome #15', player: 'Fernando Tatis Jr.', estimatedCost: 15.00, rarity: 'uncommon' },
      { cardNumber: '88', cardName: 'Stadium Club Base #88', player: 'Yordan Alvarez', estimatedCost: 3.50, rarity: 'common' },
      { cardNumber: '200', cardName: 'Stadium Club Beam Team #200', player: 'Julio Rodriguez', estimatedCost: 42.00, rarity: 'rare' },
    ],
    completionPercent: 86.67,
    totalSetValue: 1600,
    ownedValue: 1400,
    costToComplete: 60.50,
    lastUpdated: '2025-12-08',
  },
];

// ─── Mock source data ───────────────────────────────────────────────────────

const MOCK_SOURCES: Record<string, SourceRecommendation[]> = {};

function generateSourcesForCard(cardName: string, estimatedCost: number): SourceRecommendation[] {
  return [
    {
      cardName,
      platform: 'eBay',
      price: Math.round((estimatedCost * 0.9) * 100) / 100,
      condition: 'Near Mint',
      url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(cardName)}`,
      confidence: 92,
    },
    {
      cardName,
      platform: 'COMC',
      price: Math.round((estimatedCost * 0.85) * 100) / 100,
      condition: 'Near Mint',
      url: `https://www.comc.com/Cards?search=${encodeURIComponent(cardName)}`,
      confidence: 88,
    },
    {
      cardName,
      platform: 'TCGPlayer',
      price: Math.round((estimatedCost * 1.05) * 100) / 100,
      condition: 'Mint',
      url: `https://www.tcgplayer.com/search/all/product?q=${encodeURIComponent(cardName)}`,
      confidence: 85,
    },
    {
      cardName,
      platform: 'SportLots',
      price: Math.round((estimatedCost * 0.75) * 100) / 100,
      condition: 'Excellent',
      url: `https://www.sportlots.com/inven/default.tpl?adSearch=${encodeURIComponent(cardName)}`,
      confidence: 72,
    },
  ];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function formatCurrency(n: number): string {
  return `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function getCompletionColor(pct: number): string {
  if (pct >= 90) return 'text-green-400';
  if (pct >= 70) return 'text-yellow-400';
  if (pct >= 50) return 'text-orange-400';
  return 'text-red-400';
}

export function getRarityColor(rarity: MissingCard['rarity']): string {
  switch (rarity) {
    case 'common': return 'text-gray-400';
    case 'uncommon': return 'text-blue-400';
    case 'rare': return 'text-purple-400';
    case 'ssp': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
}

export function getRarityLabel(rarity: MissingCard['rarity']): string {
  switch (rarity) {
    case 'common': return 'Common';
    case 'uncommon': return 'Uncommon';
    case 'rare': return 'Rare';
    case 'ssp': return 'SSP';
    default: return 'Unknown';
  }
}

// ─── Storage ────────────────────────────────────────────────────────────────

function loadSets(): CardSet[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}_sets`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [...MOCK_SETS];
}

function saveSets(sets: CardSet[]): void {
  localStorage.setItem(`${STORAGE_PREFIX}_sets`, JSON.stringify(sets));
}

// ─── Core Functions ─────────────────────────────────────────────────────────

export function getTrackedSets(): CardSet[] {
  return loadSets();
}

export function addSet(set: CardSet): CardSet[] {
  const sets = loadSets();
  const existing = sets.findIndex(s => s.id === set.id);
  if (existing >= 0) {
    sets[existing] = set;
  } else {
    sets.push(set);
  }
  saveSets(sets);
  return sets;
}

export function removeSet(id: string): CardSet[] {
  const sets = loadSets().filter(s => s.id !== id);
  saveSets(sets);
  return sets;
}

export function getMissingCards(setId: string): MissingCard[] {
  const sets = loadSets();
  const set = sets.find(s => s.id === setId);
  return set ? set.missingCards : [];
}

export function getSetProgress(setId: string): SetProgress {
  const sets = loadSets();
  const set = sets.find(s => s.id === setId);
  const pct = set ? set.completionPercent : 0;

  const milestonePercentages = [10, 25, 50, 75, 90, 95, 100];
  const milestones = milestonePercentages.map(m => ({
    percent: m,
    reached: pct >= m,
    ...(pct >= m ? { reachedDate: set?.lastUpdated || new Date().toISOString().split('T')[0] } : {}),
  }));

  return {
    setId: setId,
    milestones,
    currentStreak: set ? Math.floor(pct / 10) : 0,
    lastCardAdded: set?.lastUpdated || new Date().toISOString().split('T')[0],
  };
}

export function getSourceRecommendations(cardName: string): SourceRecommendation[] {
  // Look up card cost from all sets
  const sets = loadSets();
  let estimatedCost = 10; // default
  for (const set of sets) {
    const card = set.missingCards.find(c => c.cardName === cardName);
    if (card) {
      estimatedCost = card.estimatedCost;
      break;
    }
  }
  if (MOCK_SOURCES[cardName]) return MOCK_SOURCES[cardName];
  return generateSourcesForCard(cardName, estimatedCost);
}

export function getCompletionStats(): SetCompletionStats {
  const sets = loadSets();

  if (sets.length === 0) {
    return {
      totalSets: 0,
      avgCompletion: 0,
      closestToComplete: 'N/A',
      totalOwned: 0,
      totalMissing: 0,
      totalCostToComplete: 0,
    };
  }

  const totalOwned = sets.reduce((sum, s) => sum + s.ownedCards, 0);
  const totalCards = sets.reduce((sum, s) => sum + s.totalCards, 0);
  const totalMissing = totalCards - totalOwned;
  const avgCompletion = sets.reduce((sum, s) => sum + s.completionPercent, 0) / sets.length;
  const totalCostToComplete = sets.reduce((sum, s) => sum + s.costToComplete, 0);

  // Find set closest to 100% but not yet 100%
  const incomplete = sets.filter(s => s.completionPercent < 100);
  const closest = incomplete.length > 0
    ? incomplete.reduce((best, s) => s.completionPercent > best.completionPercent ? s : best).name
    : sets[0].name;

  return {
    totalSets: sets.length,
    avgCompletion: Math.round(avgCompletion * 100) / 100,
    closestToComplete: closest,
    totalOwned,
    totalMissing,
    totalCostToComplete: Math.round(totalCostToComplete * 100) / 100,
  };
}

export function getCheapestPath(setId: string): MissingCard[] {
  const missing = getMissingCards(setId);
  return [...missing].sort((a, b) => a.estimatedCost - b.estimatedCost);
}

export function getSetsByCompletion(): CardSet[] {
  const sets = loadSets();
  return [...sets].sort((a, b) => b.completionPercent - a.completionPercent);
}

export function getSetsBySport(sport: string): CardSet[] {
  const sets = loadSets();
  return sets.filter(s => s.sport.toLowerCase() === sport.toLowerCase());
}

export function getRarityBreakdown(setId: string): Record<MissingCard['rarity'], number> {
  const missing = getMissingCards(setId);
  const breakdown: Record<MissingCard['rarity'], number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    ssp: 0,
  };
  for (const card of missing) {
    breakdown[card.rarity]++;
  }
  return breakdown;
}
