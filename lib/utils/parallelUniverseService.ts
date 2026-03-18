import { store } from '../dal/syncStore';

// ---- Types ----

export type ParallelRarity = 'common' | 'uncommon' | 'rare' | 'super_rare' | 'ssp' | 'one_of_one';

export interface Parallel {
  name: string;
  color: string;
  numberedTo: number | null;
  rarity: ParallelRarity;
  owned: boolean;
  value: number;
  imageUrl?: string;
}

export interface ParallelCard {
  id: string;
  baseCardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  parallels: Parallel[];
  totalParallels: number;
  ownedCount: number;
  completionPercent: number;
  totalValue: number;
}

export interface ParallelSet {
  id: string;
  setName: string;
  year: number;
  sport: string;
  brand: string;
  baseCards: number;
  parallelTypes: { name: string; color: string; numberedTo: number | null; rarity: string }[];
  totalPossibleCards: number;
}

export interface RarityTier {
  rarity: string;
  count: number;
  ownedCount: number;
  totalValue: number;
  avgValue: number;
}

export interface ParallelStats {
  totalCardsTracked: number;
  totalParallelsOwned: number;
  uniqueParallels: number;
  completionRate: number;
  totalValue: number;
  rarestOwned: { name: string; numberedTo: number };
  mostComplete: { cardName: string; percent: number };
}

// ---- Storage ----

const STORAGE_KEY = 'msi_parallel_universe_cards';
const SETS_KEY = 'msi_parallel_universe_sets';

// ---- Mock Data ----

const MOCK_CARDS: ParallelCard[] = [
  {
    id: 'pu-001',
    baseCardName: '2023 Topps Chrome #1',
    player: 'Mike Trout',
    sport: 'Baseball',
    year: 2023,
    set: 'Topps Chrome',
    parallels: [
      { name: 'Base Refractor', color: '#C0C0C0', numberedTo: null, rarity: 'common', owned: true, value: 25 },
      { name: 'Blue Refractor', color: '#3B82F6', numberedTo: 150, rarity: 'uncommon', owned: true, value: 75 },
      { name: 'Green Refractor', color: '#22C55E', numberedTo: 99, rarity: 'rare', owned: false, value: 120 },
      { name: 'Gold Refractor', color: '#EAB308', numberedTo: 50, rarity: 'super_rare', owned: true, value: 250 },
      { name: 'Red Refractor', color: '#EF4444', numberedTo: 5, rarity: 'ssp', owned: false, value: 1500 },
      { name: 'Superfractor', color: '#FFD700', numberedTo: 1, rarity: 'one_of_one', owned: false, value: 8000 },
    ],
    totalParallels: 6,
    ownedCount: 3,
    completionPercent: 50,
    totalValue: 9970,
  },
  {
    id: 'pu-002',
    baseCardName: '2023 Prizm #220',
    player: 'Luka Doncic',
    sport: 'Basketball',
    year: 2023,
    set: 'Panini Prizm',
    parallels: [
      { name: 'Silver Prizm', color: '#C0C0C0', numberedTo: null, rarity: 'common', owned: true, value: 40 },
      { name: 'Blue Prizm', color: '#3B82F6', numberedTo: 199, rarity: 'uncommon', owned: true, value: 90 },
      { name: 'Red Prizm', color: '#EF4444', numberedTo: 99, rarity: 'rare', owned: true, value: 180 },
      { name: 'Green Prizm', color: '#22C55E', numberedTo: 75, rarity: 'rare', owned: false, value: 225 },
      { name: 'Gold Prizm', color: '#EAB308', numberedTo: 10, rarity: 'super_rare', owned: true, value: 800 },
      { name: 'Black Prizm', color: '#1E293B', numberedTo: 1, rarity: 'one_of_one', owned: false, value: 5000 },
    ],
    totalParallels: 6,
    ownedCount: 4,
    completionPercent: 66.67,
    totalValue: 6335,
  },
  {
    id: 'pu-003',
    baseCardName: '2023 Select #150',
    player: 'Patrick Mahomes',
    sport: 'Football',
    year: 2023,
    set: 'Panini Select',
    parallels: [
      { name: 'Silver', color: '#C0C0C0', numberedTo: null, rarity: 'common', owned: true, value: 30 },
      { name: 'Blue', color: '#3B82F6', numberedTo: 249, rarity: 'uncommon', owned: true, value: 60 },
      { name: 'Purple', color: '#A855F7', numberedTo: 99, rarity: 'rare', owned: false, value: 150 },
      { name: 'Orange', color: '#F97316', numberedTo: 49, rarity: 'super_rare', owned: false, value: 300 },
      { name: 'Gold', color: '#EAB308', numberedTo: 10, rarity: 'ssp', owned: false, value: 900 },
    ],
    totalParallels: 5,
    ownedCount: 2,
    completionPercent: 40,
    totalValue: 1440,
  },
  {
    id: 'pu-004',
    baseCardName: '2024 Topps Series 1 #100',
    player: 'Shohei Ohtani',
    sport: 'Baseball',
    year: 2024,
    set: 'Topps Series 1',
    parallels: [
      { name: 'Rainbow Foil', color: '#E879F9', numberedTo: null, rarity: 'common', owned: true, value: 15 },
      { name: 'Blue', color: '#3B82F6', numberedTo: 299, rarity: 'uncommon', owned: true, value: 35 },
      { name: 'Green', color: '#22C55E', numberedTo: 199, rarity: 'uncommon', owned: true, value: 50 },
      { name: 'Orange', color: '#F97316', numberedTo: 75, rarity: 'rare', owned: true, value: 120 },
      { name: 'Red', color: '#EF4444', numberedTo: 25, rarity: 'super_rare', owned: true, value: 350 },
      { name: 'Platinum', color: '#E5E7EB', numberedTo: 1, rarity: 'one_of_one', owned: false, value: 3000 },
    ],
    totalParallels: 6,
    ownedCount: 5,
    completionPercent: 83.33,
    totalValue: 3570,
  },
  {
    id: 'pu-005',
    baseCardName: '2023 Optic #75',
    player: 'Victor Wembanyama',
    sport: 'Basketball',
    year: 2023,
    set: 'Donruss Optic',
    parallels: [
      { name: 'Holo', color: '#C0C0C0', numberedTo: null, rarity: 'common', owned: true, value: 200 },
      { name: 'Blue Velocity', color: '#3B82F6', numberedTo: null, rarity: 'common', owned: true, value: 300 },
      { name: 'Red', color: '#EF4444', numberedTo: 99, rarity: 'rare', owned: false, value: 600 },
      { name: 'Purple', color: '#A855F7', numberedTo: 49, rarity: 'super_rare', owned: false, value: 1200 },
      { name: 'Gold', color: '#EAB308', numberedTo: 10, rarity: 'ssp', owned: false, value: 3500 },
      { name: 'Black', color: '#1E293B', numberedTo: 1, rarity: 'one_of_one', owned: false, value: 12000 },
    ],
    totalParallels: 6,
    ownedCount: 2,
    completionPercent: 33.33,
    totalValue: 17800,
  },
  {
    id: 'pu-006',
    baseCardName: '2023 Mosaic #200',
    player: 'Ja Morant',
    sport: 'Basketball',
    year: 2023,
    set: 'Panini Mosaic',
    parallels: [
      { name: 'Silver Mosaic', color: '#C0C0C0', numberedTo: null, rarity: 'common', owned: true, value: 20 },
      { name: 'Blue Mosaic', color: '#3B82F6', numberedTo: 99, rarity: 'rare', owned: true, value: 80 },
      { name: 'Green Mosaic', color: '#22C55E', numberedTo: 49, rarity: 'super_rare', owned: false, value: 175 },
      { name: 'Gold Mosaic', color: '#EAB308', numberedTo: 10, rarity: 'ssp', owned: false, value: 600 },
    ],
    totalParallels: 4,
    ownedCount: 2,
    completionPercent: 50,
    totalValue: 875,
  },
  {
    id: 'pu-007',
    baseCardName: '2023 Bowman Chrome #BCP1',
    player: 'Jackson Holliday',
    sport: 'Baseball',
    year: 2023,
    set: 'Bowman Chrome',
    parallels: [
      { name: 'Refractor', color: '#C0C0C0', numberedTo: null, rarity: 'common', owned: true, value: 50 },
      { name: 'Blue Refractor', color: '#3B82F6', numberedTo: 150, rarity: 'uncommon', owned: true, value: 120 },
      { name: 'Green Refractor', color: '#22C55E', numberedTo: 99, rarity: 'rare', owned: true, value: 200 },
      { name: 'Gold Refractor', color: '#EAB308', numberedTo: 50, rarity: 'super_rare', owned: false, value: 500 },
      { name: 'Orange Refractor', color: '#F97316', numberedTo: 25, rarity: 'ssp', owned: false, value: 1000 },
      { name: 'Superfractor', color: '#FFD700', numberedTo: 1, rarity: 'one_of_one', owned: false, value: 6000 },
    ],
    totalParallels: 6,
    ownedCount: 3,
    completionPercent: 50,
    totalValue: 7870,
  },
  {
    id: 'pu-008',
    baseCardName: '2024 Prizm Draft #1',
    player: 'Caleb Williams',
    sport: 'Football',
    year: 2024,
    set: 'Prizm Draft Picks',
    parallels: [
      { name: 'Silver Prizm', color: '#C0C0C0', numberedTo: null, rarity: 'common', owned: true, value: 35 },
      { name: 'Blue Prizm', color: '#3B82F6', numberedTo: 199, rarity: 'uncommon', owned: false, value: 70 },
      { name: 'Red Prizm', color: '#EF4444', numberedTo: 99, rarity: 'rare', owned: false, value: 140 },
      { name: 'Green Prizm', color: '#22C55E', numberedTo: 75, rarity: 'rare', owned: false, value: 185 },
      { name: 'Gold Prizm', color: '#EAB308', numberedTo: 10, rarity: 'super_rare', owned: false, value: 650 },
    ],
    totalParallels: 5,
    ownedCount: 1,
    completionPercent: 20,
    totalValue: 1080,
  },
  {
    id: 'pu-009',
    baseCardName: '2023 National Treasures #10',
    player: 'Connor McDavid',
    sport: 'Hockey',
    year: 2023,
    set: 'National Treasures',
    parallels: [
      { name: 'Base', color: '#C0C0C0', numberedTo: 99, rarity: 'rare', owned: true, value: 200 },
      { name: 'Gold', color: '#EAB308', numberedTo: 25, rarity: 'super_rare', owned: true, value: 500 },
      { name: 'Emerald', color: '#10B981', numberedTo: 5, rarity: 'ssp', owned: false, value: 2000 },
      { name: 'Platinum', color: '#E5E7EB', numberedTo: 1, rarity: 'one_of_one', owned: false, value: 8000 },
    ],
    totalParallels: 4,
    ownedCount: 2,
    completionPercent: 50,
    totalValue: 10700,
  },
  {
    id: 'pu-010',
    baseCardName: '2023 Topps Chrome Update #USC1',
    player: 'Corbin Carroll',
    sport: 'Baseball',
    year: 2023,
    set: 'Topps Chrome Update',
    parallels: [
      { name: 'Base Refractor', color: '#C0C0C0', numberedTo: null, rarity: 'common', owned: true, value: 15 },
      { name: 'Pink Refractor', color: '#EC4899', numberedTo: null, rarity: 'common', owned: true, value: 25 },
      { name: 'Purple Refractor', color: '#A855F7', numberedTo: 250, rarity: 'uncommon', owned: true, value: 40 },
      { name: 'Blue Refractor', color: '#3B82F6', numberedTo: 150, rarity: 'uncommon', owned: false, value: 65 },
      { name: 'Gold Refractor', color: '#EAB308', numberedTo: 50, rarity: 'super_rare', owned: false, value: 200 },
      { name: 'Red Refractor', color: '#EF4444', numberedTo: 5, rarity: 'ssp', owned: false, value: 800 },
      { name: 'Superfractor', color: '#FFD700', numberedTo: 1, rarity: 'one_of_one', owned: false, value: 4000 },
    ],
    totalParallels: 7,
    ownedCount: 3,
    completionPercent: 42.86,
    totalValue: 5145,
  },
  {
    id: 'pu-011',
    baseCardName: '2024 Donruss #1',
    player: 'CJ Stroud',
    sport: 'Football',
    year: 2024,
    set: 'Donruss',
    parallels: [
      { name: 'Press Proof Blue', color: '#3B82F6', numberedTo: null, rarity: 'common', owned: true, value: 10 },
      { name: 'Press Proof Red', color: '#EF4444', numberedTo: 100, rarity: 'rare', owned: true, value: 45 },
      { name: 'Press Proof Gold', color: '#EAB308', numberedTo: 25, rarity: 'super_rare', owned: false, value: 150 },
      { name: 'Holo Green', color: '#22C55E', numberedTo: 10, rarity: 'ssp', owned: false, value: 350 },
    ],
    totalParallels: 4,
    ownedCount: 2,
    completionPercent: 50,
    totalValue: 555,
  },
  {
    id: 'pu-012',
    baseCardName: '2023 Spectra #55',
    player: 'Jaylen Brown',
    sport: 'Basketball',
    year: 2023,
    set: 'Panini Spectra',
    parallels: [
      { name: 'Base', color: '#C0C0C0', numberedTo: 99, rarity: 'rare', owned: true, value: 30 },
      { name: 'Blue', color: '#3B82F6', numberedTo: 49, rarity: 'super_rare', owned: true, value: 75 },
      { name: 'Neon Green', color: '#22C55E', numberedTo: 25, rarity: 'ssp', owned: true, value: 150 },
      { name: 'Gold', color: '#EAB308', numberedTo: 10, rarity: 'ssp', owned: false, value: 350 },
      { name: 'Black', color: '#1E293B', numberedTo: 1, rarity: 'one_of_one', owned: false, value: 2000 },
    ],
    totalParallels: 5,
    ownedCount: 3,
    completionPercent: 60,
    totalValue: 2605,
  },
  {
    id: 'pu-013',
    baseCardName: '2024 Bowman #BP50',
    player: 'Ethan Salas',
    sport: 'Baseball',
    year: 2024,
    set: 'Bowman',
    parallels: [
      { name: 'Paper', color: '#D4D4D8', numberedTo: null, rarity: 'common', owned: true, value: 8 },
      { name: 'Blue', color: '#3B82F6', numberedTo: 150, rarity: 'uncommon', owned: true, value: 25 },
      { name: 'Green', color: '#22C55E', numberedTo: 99, rarity: 'rare', owned: false, value: 50 },
      { name: 'Yellow', color: '#FACC15', numberedTo: 50, rarity: 'super_rare', owned: false, value: 100 },
      { name: 'Orange', color: '#F97316', numberedTo: 25, rarity: 'ssp', owned: false, value: 250 },
      { name: 'Red', color: '#EF4444', numberedTo: 5, rarity: 'ssp', owned: false, value: 700 },
    ],
    totalParallels: 6,
    ownedCount: 2,
    completionPercent: 33.33,
    totalValue: 1133,
  },
];

const MOCK_SETS: ParallelSet[] = [
  {
    id: 'ps-001',
    setName: 'Topps Chrome',
    year: 2023,
    sport: 'Baseball',
    brand: 'Topps',
    baseCards: 200,
    parallelTypes: [
      { name: 'Base Refractor', color: '#C0C0C0', numberedTo: null, rarity: 'common' },
      { name: 'Blue Refractor', color: '#3B82F6', numberedTo: 150, rarity: 'uncommon' },
      { name: 'Green Refractor', color: '#22C55E', numberedTo: 99, rarity: 'rare' },
      { name: 'Gold Refractor', color: '#EAB308', numberedTo: 50, rarity: 'super_rare' },
      { name: 'Red Refractor', color: '#EF4444', numberedTo: 5, rarity: 'ssp' },
      { name: 'Superfractor', color: '#FFD700', numberedTo: 1, rarity: 'one_of_one' },
    ],
    totalPossibleCards: 1200,
  },
  {
    id: 'ps-002',
    setName: 'Panini Prizm',
    year: 2023,
    sport: 'Basketball',
    brand: 'Panini',
    baseCards: 300,
    parallelTypes: [
      { name: 'Silver Prizm', color: '#C0C0C0', numberedTo: null, rarity: 'common' },
      { name: 'Blue Prizm', color: '#3B82F6', numberedTo: 199, rarity: 'uncommon' },
      { name: 'Red Prizm', color: '#EF4444', numberedTo: 99, rarity: 'rare' },
      { name: 'Green Prizm', color: '#22C55E', numberedTo: 75, rarity: 'rare' },
      { name: 'Gold Prizm', color: '#EAB308', numberedTo: 10, rarity: 'super_rare' },
      { name: 'Black Prizm', color: '#1E293B', numberedTo: 1, rarity: 'one_of_one' },
    ],
    totalPossibleCards: 1800,
  },
  {
    id: 'ps-003',
    setName: 'Panini Select',
    year: 2023,
    sport: 'Football',
    brand: 'Panini',
    baseCards: 250,
    parallelTypes: [
      { name: 'Silver', color: '#C0C0C0', numberedTo: null, rarity: 'common' },
      { name: 'Blue', color: '#3B82F6', numberedTo: 249, rarity: 'uncommon' },
      { name: 'Purple', color: '#A855F7', numberedTo: 99, rarity: 'rare' },
      { name: 'Orange', color: '#F97316', numberedTo: 49, rarity: 'super_rare' },
      { name: 'Gold', color: '#EAB308', numberedTo: 10, rarity: 'ssp' },
    ],
    totalPossibleCards: 1250,
  },
  {
    id: 'ps-004',
    setName: 'Bowman Chrome',
    year: 2023,
    sport: 'Baseball',
    brand: 'Topps',
    baseCards: 150,
    parallelTypes: [
      { name: 'Refractor', color: '#C0C0C0', numberedTo: null, rarity: 'common' },
      { name: 'Blue Refractor', color: '#3B82F6', numberedTo: 150, rarity: 'uncommon' },
      { name: 'Green Refractor', color: '#22C55E', numberedTo: 99, rarity: 'rare' },
      { name: 'Gold Refractor', color: '#EAB308', numberedTo: 50, rarity: 'super_rare' },
      { name: 'Orange Refractor', color: '#F97316', numberedTo: 25, rarity: 'ssp' },
      { name: 'Superfractor', color: '#FFD700', numberedTo: 1, rarity: 'one_of_one' },
    ],
    totalPossibleCards: 900,
  },
  {
    id: 'ps-005',
    setName: 'National Treasures',
    year: 2023,
    sport: 'Hockey',
    brand: 'Panini',
    baseCards: 100,
    parallelTypes: [
      { name: 'Base', color: '#C0C0C0', numberedTo: 99, rarity: 'rare' },
      { name: 'Gold', color: '#EAB308', numberedTo: 25, rarity: 'super_rare' },
      { name: 'Emerald', color: '#10B981', numberedTo: 5, rarity: 'ssp' },
      { name: 'Platinum', color: '#E5E7EB', numberedTo: 1, rarity: 'one_of_one' },
    ],
    totalPossibleCards: 400,
  },
];

// ---- Helper Functions ----

function loadCards(): ParallelCard[] {
  if (store.has(STORAGE_KEY)) {
    return store.get<ParallelCard[]>(STORAGE_KEY, JSON.parse(JSON.stringify(MOCK_CARDS)));
  }
  return JSON.parse(JSON.stringify(MOCK_CARDS));
}

function saveCards(cards: ParallelCard[]): void {
  store.set(STORAGE_KEY, cards);
}

function loadSets(): ParallelSet[] {
  if (store.has(SETS_KEY)) {
    return store.get<ParallelSet[]>(SETS_KEY, JSON.parse(JSON.stringify(MOCK_SETS)));
  }
  return JSON.parse(JSON.stringify(MOCK_SETS));
}

// ---- Exported Functions ----

export function getParallelCards(): ParallelCard[] {
  return loadCards();
}

export function addParallelCard(card: ParallelCard): ParallelCard[] {
  const cards = loadCards();
  cards.push(card);
  saveCards(cards);
  return cards;
}

export function updateParallelOwnership(
  cardId: string,
  parallelName: string,
  owned: boolean,
): ParallelCard[] {
  const cards = loadCards();
  const card = cards.find((c) => c.id === cardId);
  if (card) {
    const parallel = card.parallels.find((p) => p.name === parallelName);
    if (parallel) {
      parallel.owned = owned;
      card.ownedCount = card.parallels.filter((p) => p.owned).length;
      card.completionPercent = card.totalParallels > 0
        ? Math.round((card.ownedCount / card.totalParallels) * 10000) / 100
        : 0;
    }
    saveCards(cards);
  }
  return cards;
}

export function getParallelSets(): ParallelSet[] {
  return loadSets();
}

export function getParallelStats(): ParallelStats {
  const cards = loadCards();
  const totalCardsTracked = cards.length;
  const totalParallelsOwned = cards.reduce((sum, c) => sum + c.ownedCount, 0);

  const allParallelNames = new Set<string>();
  cards.forEach((c) => c.parallels.forEach((p) => allParallelNames.add(p.name)));
  const uniqueParallels = allParallelNames.size;

  const totalPossible = cards.reduce((sum, c) => sum + c.totalParallels, 0);
  const completionRate = totalPossible > 0
    ? Math.round((totalParallelsOwned / totalPossible) * 10000) / 100
    : 0;

  const totalValue = cards.reduce((sum, c) => sum + c.totalValue, 0);

  // Find rarest owned parallel
  let rarestOwned = { name: 'None', numberedTo: 0 };
  let minNumbered = Infinity;
  cards.forEach((c) => {
    c.parallels.forEach((p) => {
      if (p.owned && p.numberedTo !== null && p.numberedTo < minNumbered) {
        minNumbered = p.numberedTo;
        rarestOwned = { name: p.name, numberedTo: p.numberedTo };
      }
    });
  });

  // Find most complete card
  let mostComplete = { cardName: '', percent: 0 };
  cards.forEach((c) => {
    if (c.completionPercent > mostComplete.percent) {
      mostComplete = { cardName: c.baseCardName, percent: c.completionPercent };
    }
  });

  return {
    totalCardsTracked,
    totalParallelsOwned,
    uniqueParallels,
    completionRate,
    totalValue,
    rarestOwned,
    mostComplete,
  };
}

export function getRarityBreakdown(): RarityTier[] {
  const cards = loadCards();
  const tiers: Record<string, { count: number; ownedCount: number; totalValue: number }> = {};

  cards.forEach((c) => {
    c.parallels.forEach((p) => {
      if (!tiers[p.rarity]) {
        tiers[p.rarity] = { count: 0, ownedCount: 0, totalValue: 0 };
      }
      tiers[p.rarity].count += 1;
      if (p.owned) tiers[p.rarity].ownedCount += 1;
      tiers[p.rarity].totalValue += p.value;
    });
  });

  return Object.entries(tiers).map(([rarity, data]) => ({
    rarity,
    count: data.count,
    ownedCount: data.ownedCount,
    totalValue: data.totalValue,
    avgValue: data.count > 0 ? Math.round((data.totalValue / data.count) * 100) / 100 : 0,
  }));
}

export function getMostComplete(limit: number): ParallelCard[] {
  const cards = loadCards();
  return [...cards].sort((a, b) => b.completionPercent - a.completionPercent).slice(0, limit);
}

export function getMostValuable(limit: number): ParallelCard[] {
  const cards = loadCards();
  return [...cards].sort((a, b) => b.totalValue - a.totalValue).slice(0, limit);
}

export function getParallelsByRarity(rarity: ParallelRarity): ParallelCard[] {
  const cards = loadCards();
  return cards.filter((c) => c.parallels.some((p) => p.rarity === rarity));
}

export function getSetParallels(setId: string): ParallelSet | undefined {
  const sets = loadSets();
  return sets.find((s) => s.id === setId);
}

export function getCompletionBySet(): { setName: string; completionPercent: number; ownedCount: number; totalCards: number }[] {
  const cards = loadCards();
  const setMap: Record<string, { owned: number; total: number }> = {};

  cards.forEach((c) => {
    if (!setMap[c.set]) {
      setMap[c.set] = { owned: 0, total: 0 };
    }
    setMap[c.set].owned += c.ownedCount;
    setMap[c.set].total += c.totalParallels;
  });

  return Object.entries(setMap).map(([setName, data]) => ({
    setName,
    completionPercent: data.total > 0
      ? Math.round((data.owned / data.total) * 10000) / 100
      : 0,
    ownedCount: data.owned,
    totalCards: data.total,
  }));
}

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#94A3B8',
    uncommon: '#3B82F6',
    rare: '#A855F7',
    super_rare: '#EAB308',
    ssp: '#EF4444',
    one_of_one: '#FFD700',
  };
  return colors[rarity] || '#94A3B8';
}

export function getRarityLabel(rarity: string): string {
  const labels: Record<string, string> = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    super_rare: 'Super Rare',
    ssp: 'SSP',
    one_of_one: '1/1',
  };
  return labels[rarity] || rarity;
}

export function getCompletionColor(pct: number): string {
  if (pct >= 80) return '#22C55E';
  if (pct >= 60) return '#3B82F6';
  if (pct >= 40) return '#EAB308';
  if (pct >= 20) return '#F97316';
  return '#EF4444';
}
