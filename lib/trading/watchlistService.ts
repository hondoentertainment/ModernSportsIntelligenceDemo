import { store } from '../dal/syncStore';

// ---- Types ----

export type AlertType = 'price_drop' | 'price_target' | 'grade_change' | 'new_listing';

export interface PricePoint {
  date: string;
  price: number;
}

export interface WatchlistItem {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  imageUrl: string;
  currentPrice: number;
  targetPrice: number;
  alertType: AlertType;
  alertEnabled: boolean;
  priceHistory: PricePoint[];
  addedDate: string;
  notes: string;
  condition: string;
  estimatedGrade: string;
}

export interface PriceAlert {
  id: string;
  watchlistItemId: string;
  type: AlertType;
  threshold: number;
  triggered: boolean;
  triggeredAt: string | null;
  message: string;
}

export interface WatchlistStats {
  totalItems: number;
  activeAlerts: number;
  triggeredToday: number;
  avgPriceChange: number;
  topMover: string;
}

// ---- Constants ----

const WATCHLIST_KEY = 'msi_watchlist_items';
const ALERTS_KEY = 'msi_watchlist_alerts';

// ---- localStorage helpers ----

function loadItems(): WatchlistItem[] {
  try {
    return store.get(WATCHLIST_KEY, []);
  } catch {
    return [];
  }
}

function saveItems(items: WatchlistItem[]): void {
  try {
    store.set(WATCHLIST_KEY, items);
  } catch {
    // quota exceeded
  }
}

function loadAlerts(): PriceAlert[] {
  try {
    return store.get(ALERTS_KEY, []);
  } catch {
    return [];
  }
}

function saveAlerts(alerts: PriceAlert[]): void {
  try {
    store.set(ALERTS_KEY, alerts);
  } catch {
    // quota exceeded
  }
}

// ---- Helpers ----

function generateId(): string {
  return `wl-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generatePriceHistory(basePrice: number, days: number = 30): PricePoint[] {
  const history: PricePoint[] = [];
  let price = basePrice * 0.9;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const change = (Math.sin(i * 0.5) * 0.05 + (Math.random() - 0.48) * 0.04) * price;
    price = Math.max(price * 0.5, price + change);
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
    });
  }
  return history;
}

// ---- Mock Data ----

const MOCK_ITEMS: WatchlistItem[] = [
  {
    id: 'mock-1',
    cardName: '2023 Topps Chrome #1 RC',
    player: 'Shohei Ohtani',
    sport: 'Baseball',
    year: 2023,
    set: 'Topps Chrome',
    imageUrl: '/cards/ohtani-chrome.jpg',
    currentPrice: 485.00,
    targetPrice: 400.00,
    alertType: 'price_drop',
    alertEnabled: true,
    priceHistory: generatePriceHistory(485),
    addedDate: '2025-12-01',
    notes: 'Watching for dip below $400',
    condition: 'Near Mint',
    estimatedGrade: 'PSA 10',
  },
  {
    id: 'mock-2',
    cardName: '2018 Prizm Silver #280 RC',
    player: 'Luka Doncic',
    sport: 'Basketball',
    year: 2018,
    set: 'Panini Prizm',
    imageUrl: '/cards/doncic-prizm.jpg',
    currentPrice: 3250.00,
    targetPrice: 3500.00,
    alertType: 'price_target',
    alertEnabled: true,
    priceHistory: generatePriceHistory(3250),
    addedDate: '2025-11-15',
    notes: 'Sell target $3500+',
    condition: 'Mint',
    estimatedGrade: 'PSA 10',
  },
  {
    id: 'mock-3',
    cardName: '2020 Prizm #339 RC',
    player: 'Justin Herbert',
    sport: 'Football',
    year: 2020,
    set: 'Panini Prizm',
    imageUrl: '/cards/herbert-prizm.jpg',
    currentPrice: 189.99,
    targetPrice: 150.00,
    alertType: 'price_drop',
    alertEnabled: true,
    priceHistory: generatePriceHistory(190),
    addedDate: '2025-10-20',
    notes: 'Buy more if drops below $150',
    condition: 'Near Mint',
    estimatedGrade: 'PSA 9',
  },
  {
    id: 'mock-4',
    cardName: '2023 Upper Deck Young Guns #201',
    player: 'Connor Bedard',
    sport: 'Hockey',
    year: 2023,
    set: 'Upper Deck Young Guns',
    imageUrl: '/cards/bedard-yg.jpg',
    currentPrice: 425.00,
    targetPrice: 500.00,
    alertType: 'price_target',
    alertEnabled: false,
    priceHistory: generatePriceHistory(425),
    addedDate: '2025-11-01',
    notes: 'Long-term hold',
    condition: 'Mint',
    estimatedGrade: 'BGS 9.5',
  },
  {
    id: 'mock-5',
    cardName: '2023 Topps Chrome UCL #1',
    player: 'Jude Bellingham',
    sport: 'Soccer',
    year: 2023,
    set: 'Topps Chrome UCL',
    imageUrl: '/cards/bellingham-chrome.jpg',
    currentPrice: 315.00,
    targetPrice: 250.00,
    alertType: 'price_drop',
    alertEnabled: true,
    priceHistory: generatePriceHistory(315),
    addedDate: '2025-09-10',
    notes: 'Watching for buying opportunity',
    condition: 'Near Mint',
    estimatedGrade: 'PSA 10',
  },
  {
    id: 'mock-6',
    cardName: '2023 Bowman Chrome 1st #BCP-1',
    player: 'Jackson Holliday',
    sport: 'Baseball',
    year: 2023,
    set: 'Bowman Chrome',
    imageUrl: '/cards/holliday-bowman.jpg',
    currentPrice: 78.50,
    targetPrice: 100.00,
    alertType: 'price_target',
    alertEnabled: true,
    priceHistory: generatePriceHistory(78.5),
    addedDate: '2025-12-10',
    notes: 'Prospect watch',
    condition: 'Mint',
    estimatedGrade: 'PSA 10',
  },
  {
    id: 'mock-7',
    cardName: '2023 Donruss Optic Rated Rookie',
    player: 'Victor Wembanyama',
    sport: 'Basketball',
    year: 2023,
    set: 'Donruss Optic',
    imageUrl: '/cards/wemby-optic.jpg',
    currentPrice: 1100.00,
    targetPrice: 900.00,
    alertType: 'price_drop',
    alertEnabled: true,
    priceHistory: generatePriceHistory(1100),
    addedDate: '2025-11-20',
    notes: 'Generational talent - buy on any dip',
    condition: 'Near Mint',
    estimatedGrade: 'PSA 10',
  },
  {
    id: 'mock-8',
    cardName: '2020 Select Club Level #244 RC',
    player: 'Patrick Mahomes',
    sport: 'Football',
    year: 2020,
    set: 'Panini Select',
    imageUrl: '/cards/mahomes-select.jpg',
    currentPrice: 725.00,
    targetPrice: 800.00,
    alertType: 'price_target',
    alertEnabled: false,
    priceHistory: generatePriceHistory(725),
    addedDate: '2025-08-15',
    notes: 'Dynasty QB premium',
    condition: 'Mint',
    estimatedGrade: 'PSA 10',
  },
  {
    id: 'mock-9',
    cardName: '2015 Topps Chrome #1 RC',
    player: 'Mike Trout',
    sport: 'Baseball',
    year: 2015,
    set: 'Topps Chrome',
    imageUrl: '/cards/trout-chrome.jpg',
    currentPrice: 2100.00,
    targetPrice: 1800.00,
    alertType: 'price_drop',
    alertEnabled: true,
    priceHistory: generatePriceHistory(2100),
    addedDate: '2025-07-20',
    notes: 'Iconic card - accumulate on weakness',
    condition: 'Near Mint',
    estimatedGrade: 'PSA 9',
  },
  {
    id: 'mock-10',
    cardName: '2024 Topps Chrome UCL #50',
    player: 'Lamine Yamal',
    sport: 'Soccer',
    year: 2024,
    set: 'Topps Chrome UCL',
    imageUrl: '/cards/yamal-chrome.jpg',
    currentPrice: 265.00,
    targetPrice: 300.00,
    alertType: 'new_listing',
    alertEnabled: true,
    priceHistory: generatePriceHistory(265),
    addedDate: '2025-12-15',
    notes: 'Young superstar - watch for new listings',
    condition: 'Mint',
    estimatedGrade: 'PSA 10',
  },
  {
    id: 'mock-11',
    cardName: '2022 Prizm Silver #1 RC',
    player: 'Anthony Edwards',
    sport: 'Basketball',
    year: 2022,
    set: 'Panini Prizm',
    imageUrl: '/cards/edwards-prizm.jpg',
    currentPrice: 550.00,
    targetPrice: 600.00,
    alertType: 'grade_change',
    alertEnabled: true,
    priceHistory: generatePriceHistory(550),
    addedDate: '2025-10-01',
    notes: 'Sent for re-grade',
    condition: 'Near Mint',
    estimatedGrade: 'PSA 9',
  },
  {
    id: 'mock-12',
    cardName: '2023 SP Authentic Future Watch',
    player: 'Connor McDavid',
    sport: 'Hockey',
    year: 2023,
    set: 'SP Authentic',
    imageUrl: '/cards/mcdavid-spa.jpg',
    currentPrice: 890.00,
    targetPrice: 750.00,
    alertType: 'price_drop',
    alertEnabled: false,
    priceHistory: generatePriceHistory(890),
    addedDate: '2025-09-25',
    notes: 'GOAT potential - long term hold',
    condition: 'Mint',
    estimatedGrade: 'BGS 9.5',
  },
  {
    id: 'mock-13',
    cardName: '2023 Mosaic #301 RC',
    player: 'CJ Stroud',
    sport: 'Football',
    year: 2023,
    set: 'Panini Mosaic',
    imageUrl: '/cards/stroud-mosaic.jpg',
    currentPrice: 95.00,
    targetPrice: 120.00,
    alertType: 'price_target',
    alertEnabled: true,
    priceHistory: generatePriceHistory(95),
    addedDate: '2025-11-05',
    notes: 'Breakout candidate',
    condition: 'Near Mint',
    estimatedGrade: 'PSA 10',
  },
  {
    id: 'mock-14',
    cardName: '2023 Topps Series 1 #1',
    player: 'Aaron Judge',
    sport: 'Baseball',
    year: 2023,
    set: 'Topps Series 1',
    imageUrl: '/cards/judge-topps.jpg',
    currentPrice: 45.00,
    targetPrice: 60.00,
    alertType: 'new_listing',
    alertEnabled: true,
    priceHistory: generatePriceHistory(45),
    addedDate: '2025-12-05',
    notes: 'Looking for graded copies',
    condition: 'Excellent',
    estimatedGrade: 'PSA 8',
  },
  {
    id: 'mock-15',
    cardName: '2023 Donruss #201 Rated Rookie',
    player: 'Erling Haaland',
    sport: 'Soccer',
    year: 2023,
    set: 'Panini Donruss',
    imageUrl: '/cards/haaland-donruss.jpg',
    currentPrice: 175.00,
    targetPrice: 200.00,
    alertType: 'price_target',
    alertEnabled: true,
    priceHistory: generatePriceHistory(175),
    addedDate: '2025-10-15',
    notes: 'Premier League machine',
    condition: 'Near Mint',
    estimatedGrade: 'PSA 10',
  },
  {
    id: 'mock-16',
    cardName: '2024 Prizm Draft Picks #1',
    player: 'Caleb Williams',
    sport: 'Football',
    year: 2024,
    set: 'Panini Prizm',
    imageUrl: '/cards/williams-prizm.jpg',
    currentPrice: 62.00,
    targetPrice: 50.00,
    alertType: 'price_drop',
    alertEnabled: true,
    priceHistory: generatePriceHistory(62),
    addedDate: '2025-12-20',
    notes: '#1 pick - high upside',
    condition: 'Mint',
    estimatedGrade: 'PSA 10',
  },
];

const MOCK_ALERTS: PriceAlert[] = [
  { id: 'alert-1', watchlistItemId: 'mock-1', type: 'price_drop', threshold: 400, triggered: true, triggeredAt: new Date().toISOString(), message: 'Shohei Ohtani dropped below $400 target' },
  { id: 'alert-2', watchlistItemId: 'mock-2', type: 'price_target', threshold: 3500, triggered: false, triggeredAt: null, message: 'Luka Doncic target: $3,500' },
  { id: 'alert-3', watchlistItemId: 'mock-3', type: 'price_drop', threshold: 150, triggered: false, triggeredAt: null, message: 'Justin Herbert target: below $150' },
  { id: 'alert-4', watchlistItemId: 'mock-5', type: 'price_drop', threshold: 250, triggered: true, triggeredAt: new Date().toISOString(), message: 'Jude Bellingham dropped below $250 target' },
  { id: 'alert-5', watchlistItemId: 'mock-7', type: 'price_drop', threshold: 900, triggered: false, triggeredAt: null, message: 'Victor Wembanyama target: below $900' },
  { id: 'alert-6', watchlistItemId: 'mock-10', type: 'new_listing', threshold: 300, triggered: true, triggeredAt: new Date().toISOString(), message: 'New Lamine Yamal listing found under $300' },
  { id: 'alert-7', watchlistItemId: 'mock-11', type: 'grade_change', threshold: 0, triggered: false, triggeredAt: null, message: 'Anthony Edwards grade update pending' },
  { id: 'alert-8', watchlistItemId: 'mock-13', type: 'price_target', threshold: 120, triggered: false, triggeredAt: null, message: 'CJ Stroud target: $120' },
];

// ---- Seed mock data if empty ----

function ensureMockData(): void {
  const items = loadItems();
  if (items.length === 0) {
    saveItems(MOCK_ITEMS);
  }
  const alerts = loadAlerts();
  if (alerts.length === 0) {
    saveAlerts(MOCK_ALERTS);
  }
}

// ---- Exported Functions ----

export function getWatchlistItems(): WatchlistItem[] {
  ensureMockData();
  return loadItems();
}

export function addToWatchlist(item: Omit<WatchlistItem, 'id' | 'priceHistory' | 'addedDate'>): WatchlistItem {
  const items = loadItems();
  const newItem: WatchlistItem = {
    ...item,
    id: generateId(),
    priceHistory: generatePriceHistory(item.currentPrice),
    addedDate: new Date().toISOString().split('T')[0],
  };
  items.push(newItem);
  saveItems(items);
  return newItem;
}

export function removeFromWatchlist(id: string): void {
  const items = loadItems();
  saveItems(items.filter(i => i.id !== id));
  // Also remove associated alerts
  const alerts = loadAlerts();
  saveAlerts(alerts.filter(a => a.watchlistItemId !== id));
}

export function updateAlert(id: string, config: Partial<Pick<WatchlistItem, 'alertType' | 'alertEnabled' | 'targetPrice'>>): WatchlistItem | null {
  const items = loadItems();
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...config };
  saveItems(items);
  return items[index];
}

export function getActiveAlerts(): PriceAlert[] {
  ensureMockData();
  const alerts = loadAlerts();
  return alerts.filter(a => !a.triggered);
}

export function getTriggeredAlerts(): PriceAlert[] {
  ensureMockData();
  const alerts = loadAlerts();
  return alerts.filter(a => a.triggered);
}

export function getWatchlistStats(): WatchlistStats {
  ensureMockData();
  const items = loadItems();
  const alerts = loadAlerts();
  const triggeredToday = alerts.filter(a => {
    if (!a.triggered || !a.triggeredAt) return false;
    const today = new Date().toISOString().split('T')[0];
    return a.triggeredAt.startsWith(today);
  }).length;

  // Compute average price change from priceHistory
  let totalChange = 0;
  let counted = 0;
  for (const item of items) {
    const h = item.priceHistory;
    if (h.length >= 2) {
      const prev = h[h.length - 2].price;
      const curr = h[h.length - 1].price;
      if (prev > 0) {
        totalChange += ((curr - prev) / prev) * 100;
        counted++;
      }
    }
  }
  const avgPriceChange = counted > 0 ? Math.round((totalChange / counted) * 100) / 100 : 0;

  // Top mover: item with largest absolute price change
  let topMover = 'N/A';
  let maxChange = 0;
  for (const item of items) {
    const h = item.priceHistory;
    if (h.length >= 2) {
      const prev = h[h.length - 2].price;
      const curr = h[h.length - 1].price;
      const absChange = prev > 0 ? Math.abs((curr - prev) / prev) * 100 : 0;
      if (absChange > maxChange) {
        maxChange = absChange;
        topMover = item.player;
      }
    }
  }

  return {
    totalItems: items.length,
    activeAlerts: alerts.filter(a => !a.triggered).length,
    triggeredToday,
    avgPriceChange,
    topMover,
  };
}

export function getPriceHistory(id: string): PricePoint[] {
  const items = loadItems();
  const item = items.find(i => i.id === id);
  return item?.priceHistory ?? [];
}

export function getTopMovers(): WatchlistItem[] {
  ensureMockData();
  const items = loadItems();
  // Sort by absolute price change (last two data points)
  return [...items]
    .map(item => {
      const h = item.priceHistory;
      const change = h.length >= 2 && h[h.length - 2].price > 0
        ? Math.abs((h[h.length - 1].price - h[h.length - 2].price) / h[h.length - 2].price) * 100
        : 0;
      return { item, change };
    })
    .sort((a, b) => b.change - a.change)
    .map(({ item }) => item)
    .slice(0, 10);
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export function getAlertTypeLabel(type: AlertType): string {
  switch (type) {
    case 'price_drop': return 'Price Drop';
    case 'price_target': return 'Price Target';
    case 'grade_change': return 'Grade Change';
    case 'new_listing': return 'New Listing';
    default: return 'Unknown';
  }
}

export function getAlertColor(type: AlertType): string {
  switch (type) {
    case 'price_drop': return 'text-red-400';
    case 'price_target': return 'text-emerald-400';
    case 'grade_change': return 'text-amber-400';
    case 'new_listing': return 'text-blue-400';
    default: return 'text-slate-400';
  }
}

export interface WatchlistPriceCheckResult {
  item: WatchlistItem;
  /** New price returned by eBay (null if lookup failed). */
  newPrice: number | null;
  triggered: boolean;
  message: string;
}

/**
 * Checks eBay for current prices on all alert-enabled watchlist items and fires
 * browser notifications + updates alert state for any that have crossed their
 * threshold.
 *
 * Requires the eBay API to be configured (EBAY_CLIENT_ID / EBAY_CLIENT_SECRET).
 * Falls back gracefully when the API is unavailable.
 *
 * @returns Array of check results; only items with alertEnabled are included.
 */
export async function checkWatchlistPriceAlerts(): Promise<WatchlistPriceCheckResult[]> {
  const items = loadItems();
  const alertItems = items.filter((i) => i.alertEnabled);
  if (alertItems.length === 0) return [];

  // Dynamic import to avoid including eBay/gemini code in the initial bundle
  let getEbayCardPrice: ((card: { player: string; year: number; set: string }) => Promise<{ estimatedValue?: number } | null>) | null = null;
  try {
    const mod = await import('../utils/gemini.ts' as string);
    getEbayCardPrice = mod.getEbayCardPrice as typeof getEbayCardPrice;
  } catch {
    // eBay module unavailable (e.g. tests or demo mode) — skip API calls
  }

  const results: WatchlistPriceCheckResult[] = [];
  const now = new Date().toISOString();

  for (const item of alertItems) {
    let newPrice: number | null = null;
    let triggered = false;
    let message = '';

    if (getEbayCardPrice) {
      try {
        const analysis = await getEbayCardPrice({
          player: item.player,
          year: item.year,
          set: item.set,
        } as Parameters<typeof getEbayCardPrice>[0]);
        if (analysis?.estimatedValue && analysis.estimatedValue > 0) {
          newPrice = analysis.estimatedValue;
        }
      } catch {
        // Ignore per-item failures — continue with next
      }
    }

    if (newPrice !== null) {
      switch (item.alertType) {
        case 'price_drop':
          if (newPrice <= item.targetPrice) {
            triggered = true;
            message = `${item.player} dropped to ${formatCurrency(newPrice)} (target: ${formatCurrency(item.targetPrice)})`;
          }
          break;
        case 'price_target':
          if (newPrice >= item.targetPrice) {
            triggered = true;
            message = `${item.player} reached ${formatCurrency(newPrice)} (target: ${formatCurrency(item.targetPrice)})`;
          }
          break;
        case 'new_listing':
          // Treat any refreshed price as a "new listing" signal
          triggered = true;
          message = `New ${item.player} listing found at ${formatCurrency(newPrice)}`;
          break;
        default:
          break;
      }
    }

    // Persist updated price and alert trigger into store
    const updatedItem: WatchlistItem = {
      ...item,
      currentPrice: newPrice ?? item.currentPrice,
    };
    const allItems = loadItems();
    const idx = allItems.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      allItems[idx] = updatedItem;
      saveItems(allItems);
    }

    if (triggered) {
      // Persist alert trigger
      const alerts = loadAlerts();
      const existing = alerts.find((a) => a.watchlistItemId === item.id && a.type === item.alertType);
      if (existing) {
        existing.triggered = true;
        existing.triggeredAt = now;
        existing.message = message;
      } else {
        alerts.push({
          id: `alert-${Date.now()}-${item.id}`,
          watchlistItemId: item.id,
          type: item.alertType,
          threshold: item.targetPrice,
          triggered: true,
          triggeredAt: now,
          message,
        });
      }
      saveAlerts(alerts);

      // Browser notification (requires prior Notification.requestPermission)
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('MSI Price Alert', { body: message, icon: '/favicon.ico' });
        } catch {
          // Notification API may be unavailable in some contexts
        }
      }
    }

    results.push({ item: updatedItem, newPrice, triggered, message });
  }

  return results;
}

export function getSportIcon(sport: string): string {
  switch (sport) {
    case 'Baseball': return '\u26BE';
    case 'Basketball': return '\uD83C\uDFC0';
    case 'Football': return '\uD83C\uDFC8';
    case 'Hockey': return '\uD83C\uDFD2';
    case 'Soccer': return '\u26BD';
    default: return '\uD83C\uDFC6';
  }
}
