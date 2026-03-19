// Phase 94: Sealed Wax Market Intelligence Service
// "The Bloomberg Commodity Desk for Sealed Products"

// ---- Types ----

export type WaxProductType =
  | 'hobby_box'
  | 'retail_box'
  | 'blaster'
  | 'mega_box'
  | 'case'
  | 'cello_pack'
  | 'fat_pack';

export type SupplyStatus = 'sealed_limited' | 'in_print' | 'out_of_print';

export interface HitOdds {
  auto: string;
  relic: string;
  numbered: string;
  one_of_one: string;
}

export interface TopPull {
  card: string;
  value: number;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface WaxProduct {
  id: string;
  name: string;
  year: number;
  manufacturer: string;
  sport: string;
  type: WaxProductType;
  marketPrice: number;
  msrp: number;
  evPerBox: number;
  evRatio: number; // EV / Price
  hitOdds: HitOdds;
  topPull: TopPull;
  avgBoxValue: number;
  roi30d: number;
  roi90d: number;
  supply: SupplyStatus;
  priceHistory: PricePoint[];
}

export interface BreakProbability {
  productId: string;
  card: string;
  probability: number;
  expectedValue: number;
  bestCase: number;
  worstCase: number;
}

export interface WaxPortfolioItem {
  id: string;
  product: WaxProduct;
  quantity: number;
  purchasePrice: number;
  currentValue: number;
  unrealizedPL: number;
  opened: number;
  sealed: number;
}

export interface WaxStats {
  totalSealedValue: number;
  evPortfolio: number;
  bestProductByROI: { name: string; roi: number } | null;
  totalProducts: number;
  avgEvRatio: number;
}

// ---- Helpers ----

const STORAGE_KEY = 'msi_wax_intelligence_portfolio';

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

function generatePriceHistory(basePrice: number, currentPrice: number, seed: number): PricePoint[] {
  const points: PricePoint[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const progress = (12 - i) / 12;
    const base = basePrice + (currentPrice - basePrice) * progress;
    const noise = seededRange(seed, i * 7 + 42, -0.06, 0.06);
    const price = Math.round(base * (1 + noise) * 100) / 100;
    points.push({ date: dateStr, price: Math.max(price, basePrice * 0.5) });
  }
  return points;
}

function productTypeLabel(t: WaxProductType): string {
  const map: Record<WaxProductType, string> = {
    hobby_box: 'Hobby Box',
    retail_box: 'Retail Box',
    blaster: 'Blaster',
    mega_box: 'Mega Box',
    case: 'Case',
    cello_pack: 'Cello Pack',
    fat_pack: 'Fat Pack',
  };
  return map[t];
}

// ---- Product Database ----

const WAX_PRODUCTS: WaxProduct[] = [
  {
    id: 'wxi_001',
    name: '2024 Topps Series 1 Hobby',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    type: 'hobby_box',
    marketPrice: 185,
    msrp: 150,
    evPerBox: 162,
    evRatio: 0.876,
    hitOdds: { auto: '1:24', relic: '1:12', numbered: '1:6', one_of_one: '1:4800' },
    topPull: { card: 'Jackson Holliday Chrome Auto /25', value: 4800 },
    avgBoxValue: 145,
    roi30d: 4.2,
    roi90d: 12.8,
    supply: 'in_print',
    priceHistory: [],
  },
  {
    id: 'wxi_002',
    name: '2024 Panini Prizm NBA Hobby',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Basketball',
    type: 'hobby_box',
    marketPrice: 875,
    msrp: 500,
    evPerBox: 720,
    evRatio: 0.823,
    hitOdds: { auto: '1:12', relic: '1:24', numbered: '1:4', one_of_one: '1:3600' },
    topPull: { card: 'Wembanyama Gold Prizm Auto /10', value: 18500 },
    avgBoxValue: 680,
    roi30d: 8.5,
    roi90d: 22.4,
    supply: 'sealed_limited',
    priceHistory: [],
  },
  {
    id: 'wxi_003',
    name: '2023 Bowman Chrome Hobby',
    year: 2023,
    manufacturer: 'Topps',
    sport: 'Baseball',
    type: 'hobby_box',
    marketPrice: 310,
    msrp: 250,
    evPerBox: 285,
    evRatio: 0.919,
    hitOdds: { auto: '2:box', relic: '0:box', numbered: '1:4', one_of_one: '1:5400' },
    topPull: { card: 'Jackson Holliday Shimmer Auto /50', value: 3200 },
    avgBoxValue: 260,
    roi30d: 2.1,
    roi90d: 8.6,
    supply: 'out_of_print',
    priceHistory: [],
  },
  {
    id: 'wxi_004',
    name: '2024 Panini Prizm NFL Hobby',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    type: 'hobby_box',
    marketPrice: 620,
    msrp: 450,
    evPerBox: 545,
    evRatio: 0.879,
    hitOdds: { auto: '3:box', relic: '1:box', numbered: '1:3', one_of_one: '1:2880' },
    topPull: { card: 'Caleb Williams Gold Vinyl 1/1', value: 28000 },
    avgBoxValue: 510,
    roi30d: 6.8,
    roi90d: 18.2,
    supply: 'sealed_limited',
    priceHistory: [],
  },
  {
    id: 'wxi_005',
    name: '2024 Topps Chrome Update Hobby',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    type: 'hobby_box',
    marketPrice: 275,
    msrp: 225,
    evPerBox: 310,
    evRatio: 1.127,
    hitOdds: { auto: '2:box', relic: '1:24', numbered: '1:5', one_of_one: '1:4200' },
    topPull: { card: 'Paul Skenes Refractor Auto /25', value: 5600 },
    avgBoxValue: 290,
    roi30d: 11.3,
    roi90d: 28.5,
    supply: 'in_print',
    priceHistory: [],
  },
  {
    id: 'wxi_006',
    name: '2024 Panini Select NBA Hobby',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Basketball',
    type: 'hobby_box',
    marketPrice: 450,
    msrp: 350,
    evPerBox: 395,
    evRatio: 0.878,
    hitOdds: { auto: '2:box', relic: '1:box', numbered: '1:3', one_of_one: '1:4000' },
    topPull: { card: 'Zaccharie Risacher Courtside Gold /10', value: 7200 },
    avgBoxValue: 370,
    roi30d: 3.4,
    roi90d: 9.7,
    supply: 'in_print',
    priceHistory: [],
  },
  {
    id: 'wxi_007',
    name: '2024 Topps Series 1 Blaster',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    type: 'blaster',
    marketPrice: 42,
    msrp: 30,
    evPerBox: 28,
    evRatio: 0.667,
    hitOdds: { auto: '1:480', relic: '1:96', numbered: '1:24', one_of_one: '1:48000' },
    topPull: { card: 'Jackson Holliday SP RC', value: 350 },
    avgBoxValue: 24,
    roi30d: -1.2,
    roi90d: 5.4,
    supply: 'in_print',
    priceHistory: [],
  },
  {
    id: 'wxi_008',
    name: '2024 Bowman Baseball Hobby',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    type: 'hobby_box',
    marketPrice: 520,
    msrp: 300,
    evPerBox: 480,
    evRatio: 0.923,
    hitOdds: { auto: '1:box', relic: '0:box', numbered: '1:4', one_of_one: '1:6000' },
    topPull: { card: 'Ethan Salas 1st Chrome Auto /50', value: 6800 },
    avgBoxValue: 440,
    roi30d: 5.6,
    roi90d: 32.1,
    supply: 'out_of_print',
    priceHistory: [],
  },
  {
    id: 'wxi_009',
    name: '2024 Upper Deck Series 1 Hockey Hobby',
    year: 2024,
    manufacturer: 'Upper Deck',
    sport: 'Hockey',
    type: 'hobby_box',
    marketPrice: 155,
    msrp: 120,
    evPerBox: 138,
    evRatio: 0.890,
    hitOdds: { auto: '1:box', relic: '1:box', numbered: '1:8', one_of_one: '1:7200' },
    topPull: { card: 'Macklin Celebrini Young Guns Canvas', value: 2800 },
    avgBoxValue: 125,
    roi30d: 2.8,
    roi90d: 7.2,
    supply: 'in_print',
    priceHistory: [],
  },
  {
    id: 'wxi_010',
    name: '2024 Panini Prizm NFL Blaster',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    type: 'blaster',
    marketPrice: 52,
    msrp: 35,
    evPerBox: 38,
    evRatio: 0.731,
    hitOdds: { auto: '1:240', relic: '1:48', numbered: '1:12', one_of_one: '1:24000' },
    topPull: { card: 'Jayden Daniels Silver Prizm RC', value: 480 },
    avgBoxValue: 32,
    roi30d: 1.8,
    roi90d: 14.6,
    supply: 'in_print',
    priceHistory: [],
  },
  {
    id: 'wxi_011',
    name: '2024 Topps Chrome UEFA CL Hobby',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Soccer',
    type: 'hobby_box',
    marketPrice: 275,
    msrp: 200,
    evPerBox: 248,
    evRatio: 0.902,
    hitOdds: { auto: '1:box', relic: '1:24', numbered: '1:6', one_of_one: '1:5000' },
    topPull: { card: 'Lamine Yamal Refractor Auto /25', value: 9500 },
    avgBoxValue: 230,
    roi30d: 7.2,
    roi90d: 19.8,
    supply: 'sealed_limited',
    priceHistory: [],
  },
  {
    id: 'wxi_012',
    name: '2024 Panini Prizm NBA Mega Box',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Basketball',
    type: 'mega_box',
    marketPrice: 88,
    msrp: 60,
    evPerBox: 72,
    evRatio: 0.818,
    hitOdds: { auto: '1:120', relic: '1:24', numbered: '1:6', one_of_one: '1:12000' },
    topPull: { card: 'Wembanyama Hyper Prizm RC', value: 2200 },
    avgBoxValue: 65,
    roi30d: 4.1,
    roi90d: 11.3,
    supply: 'in_print',
    priceHistory: [],
  },
  {
    id: 'wxi_013',
    name: '2023 Panini Prizm NBA Hobby Case',
    year: 2023,
    manufacturer: 'Panini',
    sport: 'Basketball',
    type: 'case',
    marketPrice: 14800,
    msrp: 6000,
    evPerBox: 15200,
    evRatio: 1.027,
    hitOdds: { auto: '36:case', relic: '12:case', numbered: '72:case', one_of_one: '1:300' },
    topPull: { card: 'Wembanyama Gold Prizm Auto 1/1', value: 125000 },
    avgBoxValue: 14200,
    roi30d: 3.2,
    roi90d: 42.8,
    supply: 'out_of_print',
    priceHistory: [],
  },
  {
    id: 'wxi_014',
    name: '2024 Panini Donruss NFL Cello Pack',
    year: 2024,
    manufacturer: 'Panini',
    sport: 'Football',
    type: 'cello_pack',
    marketPrice: 12,
    msrp: 8,
    evPerBox: 7.5,
    evRatio: 0.625,
    hitOdds: { auto: '1:1200', relic: '1:360', numbered: '1:48', one_of_one: '1:72000' },
    topPull: { card: 'Caleb Williams Rated Rookie SP', value: 120 },
    avgBoxValue: 6,
    roi30d: -3.5,
    roi90d: 2.1,
    supply: 'in_print',
    priceHistory: [],
  },
  {
    id: 'wxi_015',
    name: '2024 Bowman Draft Mega Box',
    year: 2024,
    manufacturer: 'Topps',
    sport: 'Baseball',
    type: 'mega_box',
    marketPrice: 72,
    msrp: 50,
    evPerBox: 65,
    evRatio: 0.903,
    hitOdds: { auto: '1:box', relic: '0:box', numbered: '1:8', one_of_one: '1:9600' },
    topPull: { card: 'Travis Bazzana Chrome Auto /99', value: 1800 },
    avgBoxValue: 58,
    roi30d: 5.1,
    roi90d: 15.2,
    supply: 'in_print',
    priceHistory: [],
  },
];

// Generate price histories using seed
WAX_PRODUCTS.forEach((p, idx) => {
  const seed = p.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  p.priceHistory = generatePriceHistory(p.msrp, p.marketPrice, seed + idx * 13);
});

// ---- Break Probability Data ----

const BREAK_PROBABILITIES: Record<string, BreakProbability[]> = {};

function generateBreakProbabilities(product: WaxProduct): BreakProbability[] {
  const seed = product.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const pulls: BreakProbability[] = [];

  const cardTemplates: { suffix: string; probRange: [number, number]; valueRange: [number, number] }[] = [
    { suffix: 'Base Auto /25', probRange: [0.001, 0.005], valueRange: [2000, 8000] },
    { suffix: 'Numbered Refractor /99', probRange: [0.005, 0.015], valueRange: [500, 2500] },
    { suffix: 'Color Parallel /199', probRange: [0.01, 0.03], valueRange: [200, 800] },
    { suffix: 'Shimmer Insert', probRange: [0.02, 0.05], valueRange: [100, 500] },
    { suffix: 'Base Rookie RC', probRange: [0.05, 0.12], valueRange: [30, 200] },
    { suffix: 'Veteran Star Base', probRange: [0.08, 0.15], valueRange: [10, 80] },
    { suffix: 'Common Parallel', probRange: [0.1, 0.2], valueRange: [5, 30] },
    { suffix: 'Relic Card', probRange: [0.01, 0.04], valueRange: [40, 300] },
    { suffix: 'Insert Chase Card', probRange: [0.03, 0.08], valueRange: [60, 400] },
    { suffix: 'Super Short Print 1/1', probRange: [0.0001, 0.0005], valueRange: [5000, 50000] },
  ];

  cardTemplates.forEach((tmpl, idx) => {
    const prob = seededRange(seed, idx * 11 + 300, tmpl.probRange[0], tmpl.probRange[1]);
    const bestCase = Math.round(seededRange(seed, idx * 11 + 301, tmpl.valueRange[0], tmpl.valueRange[1]));
    const worstCase = Math.round(bestCase * seededRange(seed, idx * 11 + 302, 0.1, 0.4));
    const expectedValue = Math.round(prob * bestCase * 100) / 100;
    const topName = product.topPull.card.split(' ')[0] || 'Star';

    pulls.push({
      productId: product.id,
      card: `${topName} ${tmpl.suffix}`,
      probability: Math.round(prob * 10000) / 10000,
      expectedValue,
      bestCase,
      worstCase,
    });
  });

  return pulls.sort((a, b) => b.expectedValue - a.expectedValue);
}

// Pre-generate break probabilities
WAX_PRODUCTS.forEach(p => {
  BREAK_PROBABILITIES[p.id] = generateBreakProbabilities(p);
});

// ---- localStorage helpers ----

interface StoredPortfolioItem {
  id: string;
  productId: string;
  quantity: number;
  purchasePrice: number;
  opened: number;
  sealed: number;
}

function loadPortfolio(): StoredPortfolioItem[] {
  try {
    return store.get(STORAGE_KEY, []);
  } catch {
    return [];
  }
}

function savePortfolio(items: StoredPortfolioItem[]): void {
  try {
    store.set(STORAGE_KEY, items);
  } catch {
    // quota exceeded
  }
}

// ---- Default portfolio seed ----

function ensureDefaultPortfolio(): StoredPortfolioItem[] {
  const existing = loadPortfolio();
  if (existing.length > 0) return existing;

  const defaults: StoredPortfolioItem[] = [
    { id: 'wxi_pf_001', productId: 'wxi_002', quantity: 2, purchasePrice: 750, opened: 0, sealed: 2 },
    { id: 'wxi_pf_002', productId: 'wxi_005', quantity: 4, purchasePrice: 230, opened: 1, sealed: 3 },
    { id: 'wxi_pf_003', productId: 'wxi_004', quantity: 1, purchasePrice: 480, opened: 0, sealed: 1 },
    { id: 'wxi_pf_004', productId: 'wxi_008', quantity: 3, purchasePrice: 380, opened: 1, sealed: 2 },
    { id: 'wxi_pf_005', productId: 'wxi_011', quantity: 2, purchasePrice: 220, opened: 0, sealed: 2 },
  ];
  savePortfolio(defaults);
  return defaults;
}

// ---- Public API ----

export function getWaxProducts(): WaxProduct[] {
  return [...WAX_PRODUCTS];
}

export function getWaxProductById(id: string): WaxProduct | undefined {
  return WAX_PRODUCTS.find(p => p.id === id);
}

export function getBreakProbabilities(productId: string): BreakProbability[] {
  return BREAK_PROBABILITIES[productId] ?? [];
}

export function getWaxPortfolio(): WaxPortfolioItem[] {
  const stored = ensureDefaultPortfolio();
  return stored
    .map(item => {
      const product = WAX_PRODUCTS.find(p => p.id === item.productId);
      if (!product) return null;
      const currentValue = product.marketPrice * item.quantity;
      const totalCost = item.purchasePrice * item.quantity;
      const unrealizedPL = currentValue - totalCost;
      return {
        id: item.id,
        product,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        currentValue,
        unrealizedPL,
        opened: item.opened,
        sealed: item.sealed,
      };
    })
    .filter((x): x is WaxPortfolioItem => x !== null);
}

export function addWaxPortfolioItem(productId: string, quantity: number, purchasePrice: number): void {
  const items = loadPortfolio();
  items.push({
    id: `wxi_pf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    productId,
    quantity,
    purchasePrice,
    opened: 0,
    sealed: quantity,
  });
  savePortfolio(items);
}

export function removeWaxPortfolioItem(itemId: string): void {
  const items = loadPortfolio();
  savePortfolio(items.filter(i => i.id !== itemId));
}

export function getWaxStats(): WaxStats {
  const portfolio = getWaxPortfolio();
  const products = WAX_PRODUCTS;

  const totalSealedValue = portfolio.reduce((sum, i) => sum + i.product.marketPrice * i.sealed, 0);
  const evPortfolio = portfolio.reduce((sum, i) => sum + i.product.evPerBox * i.sealed, 0);

  let bestProductByROI: { name: string; roi: number } | null = null;
  if (products.length > 0) {
    const best = [...products].sort((a, b) => b.roi90d - a.roi90d)[0];
    bestProductByROI = { name: best.name, roi: best.roi90d };
  }

  const avgEvRatio =
    products.length > 0
      ? Math.round((products.reduce((s, p) => s + p.evRatio, 0) / products.length) * 1000) / 1000
      : 0;

  return {
    totalSealedValue,
    evPortfolio,
    bestProductByROI,
    totalProducts: products.length,
    avgEvRatio,
  };
}

export function getWaxProductTypeLabel(t: WaxProductType): string {
  return productTypeLabel(t);
}

export function getSupplyLabel(s: SupplyStatus): string {
  const map: Record<SupplyStatus, string> = {
    sealed_limited: 'Limited',
    in_print: 'In Print',
    out_of_print: 'OOP',
  };
  return map[s];
}

import { store } from '../dal/syncStore';
export function getSupplyColor(s: SupplyStatus): string {
  const map: Record<SupplyStatus, string> = {
    sealed_limited: 'text-amber-400',
    in_print: 'text-green-400',
    out_of_print: 'text-red-400',
  };
  return map[s];
}
