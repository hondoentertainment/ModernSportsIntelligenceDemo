import { Sport } from '../../types';
import { store } from '../dal/syncStore';

// ---- Types ----

export type ProductType = 'hobby_box' | 'blaster' | 'mega_box' | 'retail_pack' | 'fat_pack';

export interface SealedProduct {
  id: string;
  name: string;
  year: number;
  sport: Sport;
  productType: ProductType;
  msrp: number;
  currentValue: number;
  keyRookies: string[];
  releaseDate: string;
}

export interface WaxPortfolioEntry {
  id: string;
  productId: string;
  quantity: number;
  costBasis: number;
  addedAt: string;
}

export interface HoldVsRipAnalysis {
  productId: string;
  productName: string;
  holdEV: number;
  ripEV: number;
  recommendation: 'hold' | 'rip';
  holdProjection12m: number;
  keyPulls: { card: string; pullRate: number; value: number; ev: number }[];
  totalCardsPerBox: number;
}

export interface ProductRelease {
  id: string;
  name: string;
  sport: Sport;
  productType: ProductType;
  msrp: number;
  releaseDate: string;
  keyRookies: string[];
}

export interface WaxAlert {
  id: string;
  type: 'price_drop' | 'new_release' | 'trending';
  title: string;
  description: string;
  productId?: string;
  timestamp: string;
}

// ---- Constants ----

const PORTFOLIO_KEY = 'msi_wax_portfolio';

// ---- Deterministic seed helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

// ---- Sealed Product Database (20+ products across 5 sports) ----

const SEALED_PRODUCTS: SealedProduct[] = [
  // Baseball (5)
  {
    id: 'wax_001', name: '2024 Topps Chrome Baseball Hobby', year: 2024, sport: 'Baseball',
    productType: 'hobby_box', msrp: 250, currentValue: 385,
    keyRookies: ['Jackson Holliday', 'Wyatt Langford', 'Jackson Chourio'],
    releaseDate: '2024-09-15',
  },
  {
    id: 'wax_002', name: '2024 Bowman Baseball Hobby', year: 2024, sport: 'Baseball',
    productType: 'hobby_box', msrp: 300, currentValue: 520,
    keyRookies: ['Jackson Holliday', 'Junior Caminero', 'Ethan Salas'],
    releaseDate: '2024-05-22',
  },
  {
    id: 'wax_003', name: '2024 Topps Series 1 Blaster', year: 2024, sport: 'Baseball',
    productType: 'blaster', msrp: 30, currentValue: 42,
    keyRookies: ['Jackson Holliday', 'Evan Carter', 'Jasson Dominguez'],
    releaseDate: '2024-02-14',
  },
  {
    id: 'wax_004', name: '2023 Topps Chrome Baseball Hobby', year: 2023, sport: 'Baseball',
    productType: 'hobby_box', msrp: 250, currentValue: 310,
    keyRookies: ['Corbin Carroll', 'Gunnar Henderson', 'Elly De La Cruz'],
    releaseDate: '2023-10-04',
  },
  {
    id: 'wax_005', name: '2024 Bowman Draft Mega Box', year: 2024, sport: 'Baseball',
    productType: 'mega_box', msrp: 50, currentValue: 72,
    keyRookies: ['Travis Bazzana', 'Charlie Condon', 'Jac Caglianone'],
    releaseDate: '2024-12-11',
  },
  // Basketball (5)
  {
    id: 'wax_006', name: '2024-25 Panini Prizm Basketball Hobby', year: 2024, sport: 'Basketball',
    productType: 'hobby_box', msrp: 500, currentValue: 875,
    keyRookies: ['Zaccharie Risacher', 'Alex Sarr', 'Reed Sheppard'],
    releaseDate: '2025-03-19',
  },
  {
    id: 'wax_007', name: '2023-24 Panini Prizm Basketball Hobby', year: 2023, sport: 'Basketball',
    productType: 'hobby_box', msrp: 500, currentValue: 1250,
    keyRookies: ['Victor Wembanyama', 'Chet Holmgren', 'Brandon Miller'],
    releaseDate: '2024-03-20',
  },
  {
    id: 'wax_008', name: '2024-25 Panini Donruss Basketball Blaster', year: 2024, sport: 'Basketball',
    productType: 'blaster', msrp: 25, currentValue: 35,
    keyRookies: ['Zaccharie Risacher', 'Alex Sarr', 'Stephon Castle'],
    releaseDate: '2025-01-08',
  },
  {
    id: 'wax_009', name: '2023-24 Topps Chrome Basketball Hobby', year: 2023, sport: 'Basketball',
    productType: 'hobby_box', msrp: 200, currentValue: 340,
    keyRookies: ['Victor Wembanyama', 'Scoot Henderson', 'Amen Thompson'],
    releaseDate: '2024-06-05',
  },
  {
    id: 'wax_010', name: '2024-25 Panini Select Basketball Mega', year: 2024, sport: 'Basketball',
    productType: 'mega_box', msrp: 60, currentValue: 88,
    keyRookies: ['Zaccharie Risacher', 'Alex Sarr', 'Dalton Knecht'],
    releaseDate: '2025-05-14',
  },
  // Football (5)
  {
    id: 'wax_011', name: '2024 Panini Prizm Football Hobby', year: 2024, sport: 'Football',
    productType: 'hobby_box', msrp: 450, currentValue: 620,
    keyRookies: ['Caleb Williams', 'Jayden Daniels', 'Marvin Harrison Jr'],
    releaseDate: '2024-11-13',
  },
  {
    id: 'wax_012', name: '2024 Panini Donruss Football Hobby', year: 2024, sport: 'Football',
    productType: 'hobby_box', msrp: 250, currentValue: 290,
    keyRookies: ['Caleb Williams', 'Jayden Daniels', 'Drake Maye'],
    releaseDate: '2024-08-28',
  },
  {
    id: 'wax_013', name: '2024 Panini Prizm Football Blaster', year: 2024, sport: 'Football',
    productType: 'blaster', msrp: 35, currentValue: 52,
    keyRookies: ['Caleb Williams', 'Jayden Daniels', 'Bo Nix'],
    releaseDate: '2024-11-20',
  },
  {
    id: 'wax_014', name: '2024 Panini Prizm Football Fat Pack', year: 2024, sport: 'Football',
    productType: 'fat_pack', msrp: 15, currentValue: 22,
    keyRookies: ['Caleb Williams', 'Jayden Daniels', 'Malik Nabers'],
    releaseDate: '2024-11-20',
  },
  {
    id: 'wax_015', name: '2023 Panini Prizm Football Hobby', year: 2023, sport: 'Football',
    productType: 'hobby_box', msrp: 450, currentValue: 530,
    keyRookies: ['CJ Stroud', 'Bryce Young', 'Anthony Richardson'],
    releaseDate: '2023-12-06',
  },
  // Hockey (3)
  {
    id: 'wax_016', name: '2024-25 Upper Deck Series 1 Hobby', year: 2024, sport: 'Hockey',
    productType: 'hobby_box', msrp: 120, currentValue: 155,
    keyRookies: ['Macklin Celebrini', 'Artyom Levshunov', 'Cayden Lindstrom'],
    releaseDate: '2024-11-06',
  },
  {
    id: 'wax_017', name: '2023-24 Upper Deck Series 1 Hobby', year: 2023, sport: 'Hockey',
    productType: 'hobby_box', msrp: 120, currentValue: 195,
    keyRookies: ['Connor Bedard', 'Leo Carlsson', 'Adam Fantilli'],
    releaseDate: '2023-11-08',
  },
  {
    id: 'wax_018', name: '2024-25 Upper Deck Series 1 Blaster', year: 2024, sport: 'Hockey',
    productType: 'blaster', msrp: 30, currentValue: 38,
    keyRookies: ['Macklin Celebrini', 'Artyom Levshunov'],
    releaseDate: '2024-11-13',
  },
  // Soccer (4)
  {
    id: 'wax_019', name: '2024 Topps Chrome UEFA Champions League Hobby', year: 2024, sport: 'Soccer',
    productType: 'hobby_box', msrp: 200, currentValue: 275,
    keyRookies: ['Lamine Yamal', 'Endrick', 'Alejandro Garnacho'],
    releaseDate: '2024-07-17',
  },
  {
    id: 'wax_020', name: '2024 Panini Prizm Premier League Hobby', year: 2024, sport: 'Soccer',
    productType: 'hobby_box', msrp: 250, currentValue: 310,
    keyRookies: ['Lamine Yamal', 'Kobbie Mainoo', 'Cole Palmer'],
    releaseDate: '2024-09-25',
  },
  {
    id: 'wax_021', name: '2024 Topps Chrome MLS Hobby', year: 2024, sport: 'Soccer',
    productType: 'hobby_box', msrp: 150, currentValue: 165,
    keyRookies: ['Lionel Messi', 'Diego Luna', 'Caden Clark'],
    releaseDate: '2024-08-07',
  },
  {
    id: 'wax_022', name: '2024 Topps Chrome UEFA Mega Box', year: 2024, sport: 'Soccer',
    productType: 'mega_box', msrp: 45, currentValue: 58,
    keyRookies: ['Lamine Yamal', 'Endrick'],
    releaseDate: '2024-07-24',
  },
];

// ---- Upcoming Releases ----

const UPCOMING_RELEASES: ProductRelease[] = [
  {
    id: 'rel_001', name: '2025 Topps Series 1 Baseball Hobby', sport: 'Baseball',
    productType: 'hobby_box', msrp: 260, releaseDate: '2026-02-18',
    keyRookies: ['Roki Sasaki', 'Jackson Holliday', 'Paul Skenes'],
  },
  {
    id: 'rel_002', name: '2025 Bowman Baseball Hobby', sport: 'Baseball',
    productType: 'hobby_box', msrp: 310, releaseDate: '2026-05-21',
    keyRookies: ['Ethan Salas', 'Roman Anthony', 'Sebastian Walcott'],
  },
  {
    id: 'rel_003', name: '2024-25 Panini Prizm Basketball Hobby', sport: 'Basketball',
    productType: 'hobby_box', msrp: 500, releaseDate: '2026-03-25',
    keyRookies: ['Zaccharie Risacher', 'Alex Sarr', 'Reed Sheppard'],
  },
  {
    id: 'rel_004', name: '2025 Panini Donruss Football Hobby', sport: 'Football',
    productType: 'hobby_box', msrp: 260, releaseDate: '2026-04-15',
    keyRookies: ['Shedeur Sanders', 'Cam Ward', 'Travis Hunter'],
  },
  {
    id: 'rel_005', name: '2024-25 Upper Deck Series 2 Hockey Hobby', sport: 'Hockey',
    productType: 'hobby_box', msrp: 130, releaseDate: '2026-03-18',
    keyRookies: ['Macklin Celebrini', 'Cayden Lindstrom'],
  },
  {
    id: 'rel_006', name: '2025 Topps Chrome UEFA Champions League Hobby', sport: 'Soccer',
    productType: 'hobby_box', msrp: 220, releaseDate: '2026-06-04',
    keyRookies: ['Lamine Yamal', 'Pau Cubarsi', 'Endrick'],
  },
  {
    id: 'rel_007', name: '2025 Topps Series 1 Blaster', sport: 'Baseball',
    productType: 'blaster', msrp: 32, releaseDate: '2026-02-18',
    keyRookies: ['Roki Sasaki', 'Paul Skenes'],
  },
  {
    id: 'rel_008', name: '2025 Panini Prizm Football Hobby', sport: 'Football',
    productType: 'hobby_box', msrp: 475, releaseDate: '2026-05-28',
    keyRookies: ['Shedeur Sanders', 'Cam Ward', 'Travis Hunter'],
  },
];

// ---- localStorage helpers ----

function loadPortfolio(): WaxPortfolioEntry[] {
  try {
    return store.get(PORTFOLIO_KEY, []);
  } catch {
    return [];
  }
}

function savePortfolio(entries: WaxPortfolioEntry[]): void {
  try {
    store.set(PORTFOLIO_KEY, entries);
  } catch {
    // quota exceeded
  }
}

// ---- Public API ----

export function getSealedProducts(): SealedProduct[] {
  return SEALED_PRODUCTS;
}

export function getSealedProductById(productId: string): SealedProduct | undefined {
  return SEALED_PRODUCTS.find(p => p.id === productId);
}

export function addToWaxPortfolio(productId: string, quantity: number, costBasis: number): WaxPortfolioEntry {
  const entries = loadPortfolio();
  const entry: WaxPortfolioEntry = {
    id: `wpe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    productId,
    quantity,
    costBasis,
    addedAt: new Date().toISOString(),
  };
  entries.push(entry);
  savePortfolio(entries);
  return entry;
}

export function removeFromWaxPortfolio(entryId: string): void {
  const entries = loadPortfolio();
  const filtered = entries.filter(e => e.id !== entryId);
  savePortfolio(filtered);
}

export interface WaxPortfolioEntryWithValue extends WaxPortfolioEntry {
  product: SealedProduct;
  currentTotalValue: number;
  totalCost: number;
  roi: number;
}

export function getWaxPortfolio(): WaxPortfolioEntryWithValue[] {
  const entries = loadPortfolio();
  return entries
    .map(entry => {
      const product = SEALED_PRODUCTS.find(p => p.id === entry.productId);
      if (!product) return null;
      const currentTotalValue = product.currentValue * entry.quantity;
      const totalCost = entry.costBasis * entry.quantity;
      const roi = totalCost > 0 ? ((currentTotalValue - totalCost) / totalCost) * 100 : 0;
      return { ...entry, product, currentTotalValue, totalCost, roi };
    })
    .filter((e): e is WaxPortfolioEntryWithValue => e !== null);
}

export interface PriceHistoryPoint {
  month: string;
  value: number;
}

export function getProductPriceHistory(productId: string): PriceHistoryPoint[] {
  const product = SEALED_PRODUCTS.find(p => p.id === productId);
  if (!product) return [];

  const seed = productId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const points: PriceHistoryPoint[] = [];
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;

    // Simulate price path from MSRP to current value with noise
    const progress = (12 - i) / 12;
    const baseValue = product.msrp + (product.currentValue - product.msrp) * progress;
    const noise = seededRange(seed, i * 3 + 100, -0.08, 0.08);
    const value = Math.round(baseValue * (1 + noise) * 100) / 100;

    points.push({ month: monthLabel, value: Math.max(value, product.msrp * 0.6) });
  }

  return points;
}

export function holdVsRip(productId: string): HoldVsRipAnalysis | null {
  const product = SEALED_PRODUCTS.find(p => p.id === productId);
  if (!product) return null;

  const seed = productId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);

  // Simulate key card pulls with rates and values
  const totalCardsPerBox = product.productType === 'hobby_box' ? 24 :
    product.productType === 'mega_box' ? 12 :
    product.productType === 'blaster' ? 8 :
    product.productType === 'fat_pack' ? 3 : 10;

  const keyPulls = product.keyRookies.slice(0, 4).map((rookie, idx) => {
    const pullRate = seededRange(seed, idx * 5 + 200, 0.005, 0.04);
    const baseValue = seededRange(seed, idx * 5 + 201, 80, 800);
    const value = Math.round(baseValue * 100) / 100;
    const ev = Math.round(pullRate * value * totalCardsPerBox * 100) / 100;
    return { card: `${rookie} Base Auto`, pullRate: Math.round(pullRate * 10000) / 10000, value, ev };
  });

  // Add some non-rookie hits
  const insertPulls = [
    { card: 'Numbered Parallel /99', pullRate: 0.02, value: Math.round(seededRange(seed, 300, 30, 120) * 100) / 100, ev: 0 },
    { card: 'Color Parallel', pullRate: 0.08, value: Math.round(seededRange(seed, 301, 15, 60) * 100) / 100, ev: 0 },
  ];
  insertPulls.forEach(p => { p.ev = Math.round(p.pullRate * p.value * totalCardsPerBox * 100) / 100; });

  const allPulls = [...keyPulls, ...insertPulls];
  const ripEV = Math.round(allPulls.reduce((sum, p) => sum + p.ev, 0) * 100) / 100;

  // Hold projection: 12-month trend-based
  const trendMultiplier = product.currentValue / product.msrp;
  const holdProjection12m = Math.round(product.currentValue * (1 + (trendMultiplier - 1) * 0.5) * 100) / 100;
  const holdEV = holdProjection12m;

  const recommendation: 'hold' | 'rip' = holdEV >= ripEV ? 'hold' : 'rip';

  return {
    productId: product.id,
    productName: product.name,
    holdEV,
    ripEV,
    recommendation,
    holdProjection12m,
    keyPulls: allPulls,
    totalCardsPerBox,
  };
}

export function getReleaseCalendar(): ProductRelease[] {
  const now = new Date();
  const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

  return UPCOMING_RELEASES
    .filter(r => {
      const rd = new Date(r.releaseDate);
      return rd >= now && rd <= threeMonthsLater;
    })
    .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
}

export function getWaxAlerts(portfolio: WaxPortfolioEntryWithValue[]): WaxAlert[] {
  const alerts: WaxAlert[] = [];
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

  // Price drop alerts for portfolio items
  portfolio.forEach((entry, _idx) => {
    if (entry.roi < -10) {
      alerts.push({
        id: `wa_drop_${entry.id}`,
        type: 'price_drop',
        title: `Price Drop: ${entry.product.name}`,
        description: `Down ${Math.abs(Math.round(entry.roi))}% from your cost basis. Consider averaging down or cutting losses.`,
        productId: entry.productId,
        timestamp: now.toISOString(),
      });
    }
    // Trending up alerts
    if (entry.roi > 30) {
      alerts.push({
        id: `wa_trend_${entry.id}`,
        type: 'trending',
        title: `Trending Up: ${entry.product.name}`,
        description: `Up ${Math.round(entry.roi)}% from your cost basis. Consider taking profits.`,
        productId: entry.productId,
        timestamp: now.toISOString(),
      });
    }
  });

  // New release alerts from upcoming calendar
  const calendar = getReleaseCalendar();
  calendar.slice(0, 2).forEach((release, _idx) => {
    const releaseDate = new Date(release.releaseDate);
    const daysUntil = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 30) {
      alerts.push({
        id: `wa_release_${release.id}`,
        type: 'new_release',
        title: `Upcoming: ${release.name}`,
        description: `Releasing in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} at $${release.msrp} MSRP.`,
        productId: release.id,
        timestamp: now.toISOString(),
      });
    }
  });

  // Add a general trending alert based on seed
  const trendingIdx = Math.floor(seededRange(seed, 500, 0, SEALED_PRODUCTS.length));
  const trendingProduct = SEALED_PRODUCTS[trendingIdx];
  if (trendingProduct) {
    alerts.push({
      id: `wa_hot_${seed}`,
      type: 'trending',
      title: `Hot Box: ${trendingProduct.name}`,
      description: `Market activity is up ${Math.round(seededRange(seed, 501, 15, 45))}% this week. Consider adding to your portfolio.`,
      productId: trendingProduct.id,
      timestamp: now.toISOString(),
    });
  }

  return alerts;
}

export function getWaxROILeaderboard(portfolio: WaxPortfolioEntryWithValue[]): WaxPortfolioEntryWithValue[] {
  return [...portfolio].sort((a, b) => b.roi - a.roi);
}

export function getProductTypeLabel(pt: ProductType): string {
  const labels: Record<ProductType, string> = {
    hobby_box: 'Hobby Box',
    blaster: 'Blaster',
    mega_box: 'Mega Box',
    retail_pack: 'Retail Pack',
    fat_pack: 'Fat Pack',
  };
  return labels[pt];
}

export function getSportColor(sport: Sport): { text: string; bg: string; border: string } {
  const colors: Record<Sport, { text: string; bg: string; border: string }> = {
    Baseball: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    Basketball: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    Football: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    Hockey: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    Soccer: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  };
  return colors[sport];
}
