// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductType = 'hobby_box' | 'retail_box' | 'blaster' | 'mega_box' | 'case' | 'pack';

export interface Hit {
  type: string;
  probability: number;
  avgValue: number;
}

export interface Product {
  id: string;
  name: string;
  year: number;
  sport: string;
  brand: string;
  type: ProductType;
  price: number;
  cardsPerPack: number;
  packsPerBox: number;
  hits: Hit[];
  expectedValue: number;
  evRatio: number;
  imageUrl: string;
}

export interface SimulationResult {
  productId: string;
  productName: string;
  trials: number;
  avgReturn: number;
  medianReturn: number;
  bestCase: number;
  worstCase: number;
  profitProbability: number;
  evPerBox: number;
  distribution: { range: string; count: number; percent: number }[];
}

export interface HitResult {
  type: string;
  cardName: string;
  player: string;
  value: number;
  probability: number;
}

export interface FlipComparison {
  products: Product[];
  winner: { id: string; name: string; reason: string };
}

export interface RipFlipStats {
  totalSimulations: number;
  avgEVRatio: number;
  bestProduct: string;
  worstProduct: string;
  totalProductsTracked: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'msi_rip_flip';
const HISTORY_KEY = `${STORAGE_PREFIX}_history`;

// ─── Mock Products (12+) ──────────────────────────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'rf-001',
    name: '2024 Topps Chrome Hobby Box',
    year: 2024,
    sport: 'Baseball',
    brand: 'Topps',
    type: 'hobby_box',
    price: 250,
    cardsPerPack: 4,
    packsPerBox: 24,
    hits: [
      { type: 'Auto', probability: 0.04, avgValue: 75 },
      { type: 'Refractor', probability: 0.15, avgValue: 20 },
      { type: 'Numbered Parallel', probability: 0.05, avgValue: 40 },
      { type: 'Gold Refractor', probability: 0.01, avgValue: 200 },
    ],
    expectedValue: 210,
    evRatio: 0.84,
    imageUrl: '/images/topps-chrome-hobby.png',
  },
  {
    id: 'rf-002',
    name: '2024 Panini Prizm Basketball Hobby',
    year: 2024,
    sport: 'Basketball',
    brand: 'Panini',
    type: 'hobby_box',
    price: 500,
    cardsPerPack: 12,
    packsPerBox: 12,
    hits: [
      { type: 'Auto', probability: 0.03, avgValue: 150 },
      { type: 'Silver Prizm', probability: 0.12, avgValue: 35 },
      { type: 'Gold Prizm', probability: 0.008, avgValue: 500 },
      { type: 'Color Blast', probability: 0.002, avgValue: 2000 },
    ],
    expectedValue: 475,
    evRatio: 0.95,
    imageUrl: '/images/prizm-basketball-hobby.png',
  },
  {
    id: 'rf-003',
    name: '2024 Topps Series 1 Blaster',
    year: 2024,
    sport: 'Baseball',
    brand: 'Topps',
    type: 'blaster',
    price: 30,
    cardsPerPack: 14,
    packsPerBox: 7,
    hits: [
      { type: 'Relic', probability: 0.02, avgValue: 15 },
      { type: 'Parallel', probability: 0.10, avgValue: 5 },
      { type: 'SP Variation', probability: 0.01, avgValue: 50 },
    ],
    expectedValue: 18,
    evRatio: 0.60,
    imageUrl: '/images/topps-series1-blaster.png',
  },
  {
    id: 'rf-004',
    name: '2024 Donruss Football Mega Box',
    year: 2024,
    sport: 'Football',
    brand: 'Panini',
    type: 'mega_box',
    price: 60,
    cardsPerPack: 8,
    packsPerBox: 10,
    hits: [
      { type: 'Auto', probability: 0.02, avgValue: 50 },
      { type: 'Rated Rookie', probability: 0.08, avgValue: 15 },
      { type: 'Holo Orange', probability: 0.03, avgValue: 30 },
    ],
    expectedValue: 42,
    evRatio: 0.70,
    imageUrl: '/images/donruss-football-mega.png',
  },
  {
    id: 'rf-005',
    name: '2024 Bowman Chrome Hobby Box',
    year: 2024,
    sport: 'Baseball',
    brand: 'Topps',
    type: 'hobby_box',
    price: 300,
    cardsPerPack: 5,
    packsPerBox: 24,
    hits: [
      { type: 'Auto', probability: 0.05, avgValue: 100 },
      { type: 'Refractor', probability: 0.12, avgValue: 25 },
      { type: 'Mojo Refractor', probability: 0.02, avgValue: 80 },
      { type: 'Superfractor 1/1', probability: 0.0005, avgValue: 5000 },
    ],
    expectedValue: 320,
    evRatio: 1.07,
    imageUrl: '/images/bowman-chrome-hobby.png',
  },
  {
    id: 'rf-006',
    name: '2024 Panini Select Football Hobby',
    year: 2024,
    sport: 'Football',
    brand: 'Panini',
    type: 'hobby_box',
    price: 450,
    cardsPerPack: 10,
    packsPerBox: 12,
    hits: [
      { type: 'Auto', probability: 0.035, avgValue: 120 },
      { type: 'Die-Cut', probability: 0.06, avgValue: 40 },
      { type: 'Tie-Dye Prizm', probability: 0.005, avgValue: 600 },
      { type: 'Zebra Prizm', probability: 0.003, avgValue: 800 },
    ],
    expectedValue: 410,
    evRatio: 0.91,
    imageUrl: '/images/select-football-hobby.png',
  },
  {
    id: 'rf-007',
    name: '2024 Upper Deck Series 1 Hockey Hobby',
    year: 2024,
    sport: 'Hockey',
    brand: 'Upper Deck',
    type: 'hobby_box',
    price: 120,
    cardsPerPack: 8,
    packsPerBox: 24,
    hits: [
      { type: 'Young Guns', probability: 0.10, avgValue: 15 },
      { type: 'Jersey Card', probability: 0.03, avgValue: 25 },
      { type: 'Auto', probability: 0.01, avgValue: 100 },
    ],
    expectedValue: 95,
    evRatio: 0.79,
    imageUrl: '/images/upper-deck-hockey-hobby.png',
  },
  {
    id: 'rf-008',
    name: '2024 Topps Chrome Retail Box',
    year: 2024,
    sport: 'Baseball',
    brand: 'Topps',
    type: 'retail_box',
    price: 100,
    cardsPerPack: 4,
    packsPerBox: 24,
    hits: [
      { type: 'Refractor', probability: 0.12, avgValue: 15 },
      { type: 'Pink Refractor', probability: 0.04, avgValue: 25 },
      { type: 'Numbered Parallel', probability: 0.02, avgValue: 35 },
    ],
    expectedValue: 72,
    evRatio: 0.72,
    imageUrl: '/images/topps-chrome-retail.png',
  },
  {
    id: 'rf-009',
    name: '2024 Panini Prizm Football Blaster',
    year: 2024,
    sport: 'Football',
    brand: 'Panini',
    type: 'blaster',
    price: 35,
    cardsPerPack: 4,
    packsPerBox: 6,
    hits: [
      { type: 'Silver Prizm', probability: 0.06, avgValue: 20 },
      { type: 'Red White Blue', probability: 0.08, avgValue: 10 },
      { type: 'Auto', probability: 0.005, avgValue: 80 },
    ],
    expectedValue: 22,
    evRatio: 0.63,
    imageUrl: '/images/prizm-football-blaster.png',
  },
  {
    id: 'rf-010',
    name: '2024 Topps Chrome Case (12 Boxes)',
    year: 2024,
    sport: 'Baseball',
    brand: 'Topps',
    type: 'case',
    price: 2800,
    cardsPerPack: 4,
    packsPerBox: 24,
    hits: [
      { type: 'Auto', probability: 0.04, avgValue: 75 },
      { type: 'Refractor', probability: 0.15, avgValue: 20 },
      { type: 'Gold Refractor', probability: 0.01, avgValue: 200 },
      { type: 'Superfractor 1/1', probability: 0.001, avgValue: 3000 },
    ],
    expectedValue: 2650,
    evRatio: 0.95,
    imageUrl: '/images/topps-chrome-case.png',
  },
  {
    id: 'rf-011',
    name: '2024 Panini Mosaic Basketball Mega',
    year: 2024,
    sport: 'Basketball',
    brand: 'Panini',
    type: 'mega_box',
    price: 55,
    cardsPerPack: 6,
    packsPerBox: 8,
    hits: [
      { type: 'Mosaic Prizm', probability: 0.10, avgValue: 12 },
      { type: 'Genesis', probability: 0.02, avgValue: 60 },
      { type: 'Auto', probability: 0.01, avgValue: 80 },
    ],
    expectedValue: 38,
    evRatio: 0.69,
    imageUrl: '/images/mosaic-basketball-mega.png',
  },
  {
    id: 'rf-012',
    name: '2024 Topps Heritage Pack',
    year: 2024,
    sport: 'Baseball',
    brand: 'Topps',
    type: 'pack',
    price: 5,
    cardsPerPack: 9,
    packsPerBox: 1,
    hits: [
      { type: 'SP', probability: 0.05, avgValue: 10 },
      { type: 'Chrome Parallel', probability: 0.03, avgValue: 15 },
      { type: 'Real One Auto', probability: 0.005, avgValue: 100 },
    ],
    expectedValue: 3.5,
    evRatio: 0.70,
    imageUrl: '/images/topps-heritage-pack.png',
  },
  {
    id: 'rf-013',
    name: '2024 Bowman Draft Hobby Box',
    year: 2024,
    sport: 'Baseball',
    brand: 'Topps',
    type: 'hobby_box',
    price: 200,
    cardsPerPack: 10,
    packsPerBox: 24,
    hits: [
      { type: 'Chrome Auto', probability: 0.04, avgValue: 90 },
      { type: 'Refractor', probability: 0.10, avgValue: 18 },
      { type: 'Gold Refractor', probability: 0.008, avgValue: 250 },
    ],
    expectedValue: 185,
    evRatio: 0.93,
    imageUrl: '/images/bowman-draft-hobby.png',
  },
];

// ─── Helper / Utility Functions ───────────────────────────────────────────────

export function formatCurrency(n: number): string {
  return `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function getEVColor(ratio: number): string {
  if (ratio >= 1.0) return 'text-green-400';
  if (ratio >= 0.85) return 'text-yellow-400';
  if (ratio >= 0.7) return 'text-orange-400';
  return 'text-red-400';
}

export function getProductTypeLabel(type: ProductType): string {
  const labels: Record<ProductType, string> = {
    hobby_box: 'Hobby Box',
    retail_box: 'Retail Box',
    blaster: 'Blaster',
    mega_box: 'Mega Box',
    case: 'Case',
    pack: 'Pack',
  };
  return labels[type] || type;
}

export function getProductTypeColor(type: ProductType): string {
  const colors: Record<ProductType, string> = {
    hobby_box: 'bg-purple-500/20 text-purple-400',
    retail_box: 'bg-blue-500/20 text-blue-400',
    blaster: 'bg-orange-500/20 text-orange-400',
    mega_box: 'bg-cyan-500/20 text-cyan-400',
    case: 'bg-amber-500/20 text-amber-400',
    pack: 'bg-green-500/20 text-green-400',
  };
  return colors[type] || 'bg-slate-500/20 text-slate-400';
}

export function getProbabilityColor(prob: number): string {
  if (prob >= 0.10) return 'text-green-400';
  if (prob >= 0.03) return 'text-yellow-400';
  if (prob >= 0.01) return 'text-orange-400';
  return 'text-red-400';
}

// ─── Core Functions ───────────────────────────────────────────────────────────

export function getProducts(): Product[] {
  return [...MOCK_PRODUCTS];
}

export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

export function calculateEV(product: Product): number {
  const totalCards = product.cardsPerPack * product.packsPerBox;
  let ev = 0;
  for (const hit of product.hits) {
    ev += hit.probability * hit.avgValue * totalCards;
  }
  return Math.round(ev * 100) / 100;
}

export function getHitProbabilities(productId: string): HitResult[] {
  const product = getProductById(productId);
  if (!product) return [];

  const players = [
    'Elly De La Cruz', 'Victor Wembanyama', 'Caleb Williams',
    'Caitlin Clark', 'Shohei Ohtani', 'Connor Bedard',
    'Luka Doncic', 'CJ Stroud', 'Jasson Dominguez', 'Anthony Edwards',
  ];

  return product.hits.map((hit, idx) => ({
    type: hit.type,
    cardName: `${product.year} ${product.brand} ${hit.type}`,
    player: players[idx % players.length],
    value: hit.avgValue,
    probability: hit.probability,
  }));
}

/**
 * Run a Monte Carlo simulation for a given product.
 */
export function runSimulation(productId: string, trials: number): SimulationResult | null {
  const product = getProductById(productId);
  if (!product) return null;

  const clampedTrials = Math.max(1, Math.min(trials, 100000));
  const totalCards = product.cardsPerPack * product.packsPerBox;
  const returns: number[] = [];

  for (let t = 0; t < clampedTrials; t++) {
    let boxReturn = 0;
    for (let c = 0; c < totalCards; c++) {
      for (const hit of product.hits) {
        if (seededRandom(t * totalCards * product.hits.length + c * product.hits.length + product.hits.indexOf(hit)) < hit.probability) {
          boxReturn += hit.avgValue;
        }
      }
    }
    returns.push(boxReturn);
  }

  returns.sort((a, b) => a - b);

  const avgReturn = returns.reduce((s, v) => s + v, 0) / returns.length;
  const medianReturn = returns[Math.floor(returns.length / 2)];
  const bestCase = returns[returns.length - 1];
  const worstCase = returns[0];
  const profitCount = returns.filter((r) => r > product.price).length;
  const profitProbability = profitCount / returns.length;

  const distribution = buildDistribution(returns, product.price);

  const result: SimulationResult = {
    productId: product.id,
    productName: product.name,
    trials: clampedTrials,
    avgReturn: Math.round(avgReturn * 100) / 100,
    medianReturn: Math.round(medianReturn * 100) / 100,
    bestCase,
    worstCase,
    profitProbability: Math.round(profitProbability * 10000) / 10000,
    evPerBox: Math.round(avgReturn * 100) / 100,
    distribution,
  };

  saveSimulationToHistory(result);
  return result;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function buildDistribution(
  returns: number[],
  price: number
): { range: string; count: number; percent: number }[] {
  if (returns.length === 0) return [];

  const min = returns[0];
  const max = returns[returns.length - 1];
  const bucketCount = Math.min(10, Math.max(3, Math.ceil(Math.sqrt(returns.length))));
  const bucketSize = Math.max(1, (max - min) / bucketCount);

  const buckets: { range: string; count: number; percent: number }[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const lo = min + i * bucketSize;
    const hi = i === bucketCount - 1 ? max + 1 : min + (i + 1) * bucketSize;
    const count = returns.filter((r) => r >= lo && r < hi).length;
    // Handle last bucket edge: include max
    const finalCount =
      i === bucketCount - 1
        ? returns.filter((r) => r >= lo && r <= max).length
        : count;
    buckets.push({
      range: `${formatCurrency(lo)} - ${formatCurrency(hi === max + 1 ? max : hi)}`,
      count: finalCount,
      percent: Math.round((finalCount / returns.length) * 10000) / 10000,
    });
  }

  return buckets;
}

function saveSimulationToHistory(result: SimulationResult): void {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const history: SimulationResult[] = raw ? JSON.parse(raw) : [];
    history.unshift(result);
    // Keep last 50 simulations
    if (history.length > 50) history.length = 50;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage not available
  }
}

export function getSimulationHistory(): SimulationResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function compareProducts(ids: string[]): FlipComparison | null {
  const products = ids
    .map((id) => getProductById(id))
    .filter((p): p is Product => p !== undefined);

  if (products.length < 2) return null;

  const sorted = [...products].sort((a, b) => b.evRatio - a.evRatio);
  const winner = sorted[0];

  return {
    products,
    winner: {
      id: winner.id,
      name: winner.name,
      reason: `Highest EV ratio of ${(winner.evRatio * 100).toFixed(1)}% with ${formatCurrency(winner.expectedValue)} expected value on a ${formatCurrency(winner.price)} product`,
    },
  };
}

export function getTopEVProducts(limit: number = 5): Product[] {
  return [...MOCK_PRODUCTS].sort((a, b) => b.evRatio - a.evRatio).slice(0, limit);
}

export function getWorstEVProducts(limit: number = 5): Product[] {
  return [...MOCK_PRODUCTS].sort((a, b) => a.evRatio - b.evRatio).slice(0, limit);
}

export function getRipFlipStats(): RipFlipStats {
  const history = getSimulationHistory();
  const products = getProducts();
  const sorted = [...products].sort((a, b) => b.evRatio - a.evRatio);

  const avgEVRatio =
    products.length > 0
      ? products.reduce((s, p) => s + p.evRatio, 0) / products.length
      : 0;

  return {
    totalSimulations: history.length,
    avgEVRatio: Math.round(avgEVRatio * 1000) / 1000,
    bestProduct: sorted.length > 0 ? sorted[0].name : 'N/A',
    worstProduct: sorted.length > 0 ? sorted[sorted.length - 1].name : 'N/A',
    totalProductsTracked: products.length,
  };
}
