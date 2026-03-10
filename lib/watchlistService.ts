import { Sport } from '../types';

// ---- Types ----

export interface WatchlistItem {
  id: string;
  watchlistId: string;
  player: string;
  sport: Sport;
  year: number;
  set: string;
  estimatedValue: number;
  grade?: string;
  addedAt: string;
  priceHistory: number[]; // simulated mini price history (last 7 data points)
  currentPrice: number;
  priceChangePercent: number;
}

export interface Watchlist {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  items: WatchlistItem[];
}

export interface PriceAlertRule {
  id: string;
  watchlistItemId: string;
  type: 'below' | 'above' | 'change_pct' | 'all_time_low';
  threshold: number; // dollar amount for below/above, percentage for change_pct, ignored for all_time_low
  createdAt: string;
}

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  watchlistItemId: string;
  player: string;
  sport: Sport;
  ruleType: PriceAlertRule['type'];
  threshold: number;
  currentPrice: number;
  triggeredAt: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  isAcknowledged: boolean;
  snoozedUntil?: string;
}

export interface MarketScanResult {
  id: string;
  player: string;
  sport: Sport;
  year: number;
  set: string;
  grade?: string;
  price: number;
  previousPrice: number;
  changePct: number;
  source: string;
  listedAt: string;
  confidence: number;
}

// ---- Constants ----

const WATCHLISTS_KEY = 'msi_watchlists';
const ALERT_RULES_KEY = 'msi_alert_rules';
const TRIGGERED_ALERTS_KEY = 'msi_triggered_alerts';

const MARKET_SOURCES = ['eBay', 'COMC', 'MySlabs', 'PWCC', 'Alt Marketplace', 'StockX'] as const;

const PLAYER_POOLS: Record<Sport, string[]> = {
  Baseball: ['Mike Trout', 'Shohei Ohtani', 'Aaron Judge', 'Juan Soto', 'Mookie Betts', 'Ronald Acuna Jr', 'Freddie Freeman', 'Corey Seager', 'Julio Rodriguez', 'Bobby Witt Jr'],
  Basketball: ['LeBron James', 'Luka Doncic', 'Victor Wembanyama', 'Jayson Tatum', 'Anthony Edwards', 'Giannis Antetokounmpo', 'Nikola Jokic', 'Ja Morant', 'Shai Gilgeous-Alexander', 'Tyrese Haliburton'],
  Football: ['Patrick Mahomes', 'Josh Allen', 'Joe Burrow', 'Justin Jefferson', 'Ja\'Marr Chase', 'Lamar Jackson', 'CJ Stroud', 'Caleb Williams', 'Travis Kelce', 'Brock Purdy'],
  Hockey: ['Connor McDavid', 'Auston Matthews', 'Nathan MacKinnon', 'Cale Makar', 'Connor Bedard', 'Leon Draisaitl', 'Jack Hughes', 'Kirill Kaprizov', 'Andrei Svechnikov', 'Jason Robertson'],
  Soccer: ['Erling Haaland', 'Kylian Mbappe', 'Jude Bellingham', 'Vinicius Jr', 'Bukayo Saka', 'Phil Foden', 'Pedri', 'Florian Wirtz', 'Lamine Yamal', 'Cole Palmer'],
};

const SET_POOLS: Record<Sport, string[]> = {
  Baseball: ['Topps Chrome', 'Bowman 1st', 'Topps Heritage', 'Panini Prizm', 'Topps Series 1'],
  Basketball: ['Panini Prizm', 'Donruss Optic', 'Select', 'Fleer Ultra', 'Topps Chrome'],
  Football: ['Panini Prizm', 'Donruss Optic', 'Select', 'Mosaic', 'Panini Contenders'],
  Hockey: ['Upper Deck Young Guns', 'O-Pee-Chee', 'SP Authentic', 'Upper Deck Series 1', 'Parkhurst'],
  Soccer: ['Topps Chrome UCL', 'Panini Prizm', 'Topps Merlin', 'Donruss', 'Select'],
};

const GRADE_OPTIONS = ['PSA 10', 'PSA 9', 'BGS 9.5', 'BGS 10', 'SGC 10', 'CGC 9.5', 'Raw'] as const;

// ---- Deterministic seed helpers ----

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function seededRange(seed: number, offset: number, min: number, max: number): number {
  return min + seededRandom(seed, offset) * (max - min);
}

function generateId(prefix: string): string {
  const seed = dateSeed();
  const rand = Math.floor(seededRandom(seed, Date.now() % 10000) * 1000000);
  return `${prefix}-${Date.now()}-${rand}`;
}

// ---- localStorage helpers ----

function loadWatchlists(): Watchlist[] {
  try {
    const raw = localStorage.getItem(WATCHLISTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Watchlist[];
  } catch {
    return [];
  }
}

function saveWatchlists(watchlists: Watchlist[]): void {
  try {
    localStorage.setItem(WATCHLISTS_KEY, JSON.stringify(watchlists));
  } catch {
    // quota exceeded - silently ignore
  }
}

function loadAlertRules(): PriceAlertRule[] {
  try {
    const raw = localStorage.getItem(ALERT_RULES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PriceAlertRule[];
  } catch {
    return [];
  }
}

function saveAlertRules(rules: PriceAlertRule[]): void {
  try {
    localStorage.setItem(ALERT_RULES_KEY, JSON.stringify(rules));
  } catch {
    // quota exceeded - silently ignore
  }
}

function loadTriggeredAlerts(): TriggeredAlert[] {
  try {
    const raw = localStorage.getItem(TRIGGERED_ALERTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TriggeredAlert[];
  } catch {
    return [];
  }
}

function saveTriggeredAlerts(alerts: TriggeredAlert[]): void {
  try {
    localStorage.setItem(TRIGGERED_ALERTS_KEY, JSON.stringify(alerts));
  } catch {
    // quota exceeded - silently ignore
  }
}

// ---- Simulated price generation ----

function simulateCurrentPrice(basePrice: number, player: string, sport: Sport): number {
  const seed = dateSeed();
  const playerHash = hashString(player + sport);
  const combined = seed + playerHash;
  const changeFactor = seededRange(combined, 7, -0.15, 0.20);
  return Math.max(1, basePrice * (1 + changeFactor));
}

function simulatePriceHistory(basePrice: number, player: string, sport: Sport): number[] {
  const seed = dateSeed();
  const playerHash = hashString(player + sport);
  const history: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const daySeed = seed - i + playerHash;
    const change = seededRange(daySeed, 11, -0.08, 0.10);
    history.push(Math.max(1, Math.round(basePrice * (1 + change) * 100) / 100));
  }
  return history;
}

function simulatePriceChangePct(player: string, sport: Sport): number {
  const seed = dateSeed();
  const playerHash = hashString(player + sport);
  return Math.round(seededRange(seed + playerHash, 13, -18, 22) * 100) / 100;
}

// ---- Watchlist CRUD ----

export function createWatchlist(name: string, category: string): Watchlist {
  const watchlists = loadWatchlists();
  const newWatchlist: Watchlist = {
    id: generateId('wl'),
    name,
    category,
    createdAt: new Date().toISOString(),
    items: [],
  };
  watchlists.push(newWatchlist);
  saveWatchlists(watchlists);
  return newWatchlist;
}

export function deleteWatchlist(id: string): void {
  const watchlists = loadWatchlists();
  const filtered = watchlists.filter(w => w.id !== id);
  saveWatchlists(filtered);

  // Also remove associated alert rules
  const rules = loadAlertRules();
  const itemIds = new Set(
    watchlists.find(w => w.id === id)?.items.map(i => i.id) ?? []
  );
  const filteredRules = rules.filter(r => !itemIds.has(r.watchlistItemId));
  saveAlertRules(filteredRules);
}

export function getWatchlists(): Watchlist[] {
  const watchlists = loadWatchlists();
  // Refresh simulated prices on each load
  for (const wl of watchlists) {
    for (const item of wl.items) {
      item.currentPrice = Math.round(simulateCurrentPrice(item.estimatedValue, item.player, item.sport) * 100) / 100;
      item.priceHistory = simulatePriceHistory(item.estimatedValue, item.player, item.sport);
      item.priceChangePercent = simulatePriceChangePct(item.player, item.sport);
    }
  }
  return watchlists;
}

export function addToWatchlist(
  watchlistId: string,
  item: { player: string; sport: Sport; year: number; set: string; estimatedValue: number; grade?: string }
): WatchlistItem {
  const watchlists = loadWatchlists();
  const wl = watchlists.find(w => w.id === watchlistId);
  if (!wl) throw new Error(`Watchlist ${watchlistId} not found`);

  const currentPrice = simulateCurrentPrice(item.estimatedValue, item.player, item.sport);
  const priceHistory = simulatePriceHistory(item.estimatedValue, item.player, item.sport);
  const priceChangePercent = simulatePriceChangePct(item.player, item.sport);

  const newItem: WatchlistItem = {
    id: generateId('wi'),
    watchlistId,
    player: item.player,
    sport: item.sport,
    year: item.year,
    set: item.set,
    estimatedValue: item.estimatedValue,
    grade: item.grade,
    addedAt: new Date().toISOString(),
    priceHistory,
    currentPrice: Math.round(currentPrice * 100) / 100,
    priceChangePercent,
  };

  wl.items.push(newItem);
  saveWatchlists(watchlists);
  return newItem;
}

export function removeFromWatchlist(watchlistId: string, itemId: string): void {
  const watchlists = loadWatchlists();
  const wl = watchlists.find(w => w.id === watchlistId);
  if (!wl) return;
  wl.items = wl.items.filter(i => i.id !== itemId);
  saveWatchlists(watchlists);

  // Remove alert rules for this item
  const rules = loadAlertRules();
  saveAlertRules(rules.filter(r => r.watchlistItemId !== itemId));
}

// ---- Alert Rules ----

export function createAlertRule(
  watchlistItemId: string,
  rule: Omit<PriceAlertRule, 'id' | 'createdAt'>
): PriceAlertRule {
  const rules = loadAlertRules();
  const newRule: PriceAlertRule = {
    ...rule,
    id: generateId('ar'),
    watchlistItemId,
    createdAt: new Date().toISOString(),
  };
  rules.push(newRule);
  saveAlertRules(rules);
  return newRule;
}

export function deleteAlertRule(ruleId: string): void {
  const rules = loadAlertRules();
  saveAlertRules(rules.filter(r => r.id !== ruleId));
}

// ---- Alert Evaluation ----

export function evaluateAlerts(watchlists: Watchlist[]): TriggeredAlert[] {
  const rules = loadAlertRules();
  const existingAlerts = loadTriggeredAlerts();
  const existingRuleIds = new Set(existingAlerts.filter(a => !a.isAcknowledged).map(a => a.ruleId));

  // Build lookup: itemId -> WatchlistItem
  const itemMap = new Map<string, WatchlistItem>();
  for (const wl of watchlists) {
    for (const item of wl.items) {
      itemMap.set(item.id, item);
    }
  }

  const newAlerts: TriggeredAlert[] = [];

  for (const rule of rules) {
    // Skip if already triggered and unacknowledged
    if (existingRuleIds.has(rule.id)) continue;

    const item = itemMap.get(rule.watchlistItemId);
    if (!item) continue;

    let triggered = false;
    let message = '';
    let severity: TriggeredAlert['severity'] = 'medium';

    switch (rule.type) {
      case 'below':
        if (item.currentPrice <= rule.threshold) {
          triggered = true;
          const dropPct = ((item.estimatedValue - item.currentPrice) / item.estimatedValue * 100).toFixed(1);
          message = `${item.player} dropped to $${item.currentPrice.toFixed(2)}, below your $${rule.threshold.toFixed(2)} threshold (down ${dropPct}% from estimated value)`;
          severity = item.currentPrice < rule.threshold * 0.9 ? 'critical' : 'high';
        }
        break;

      case 'above':
        if (item.currentPrice >= rule.threshold) {
          triggered = true;
          const gainPct = ((item.currentPrice - item.estimatedValue) / item.estimatedValue * 100).toFixed(1);
          message = `${item.player} rose to $${item.currentPrice.toFixed(2)}, above your $${rule.threshold.toFixed(2)} target (+${gainPct}%)`;
          severity = item.currentPrice > rule.threshold * 1.1 ? 'high' : 'medium';
        }
        break;

      case 'change_pct':
        if (Math.abs(item.priceChangePercent) >= rule.threshold) {
          triggered = true;
          const direction = item.priceChangePercent > 0 ? 'up' : 'down';
          message = `${item.player} moved ${direction} ${Math.abs(item.priceChangePercent).toFixed(1)}%, exceeding your ${rule.threshold}% change threshold`;
          severity = Math.abs(item.priceChangePercent) > rule.threshold * 1.5 ? 'critical' : 'high';
        }
        break;

      case 'all_time_low': {
        const minHistory = Math.min(...item.priceHistory);
        if (item.currentPrice <= minHistory * 1.02) { // within 2% of all-time low
          triggered = true;
          message = `${item.player} at $${item.currentPrice.toFixed(2)} is near its all-time low of $${minHistory.toFixed(2)}. Potential buying opportunity.`;
          severity = item.currentPrice <= minHistory ? 'critical' : 'high';
        }
        break;
      }
    }

    if (triggered) {
      newAlerts.push({
        id: generateId('ta'),
        ruleId: rule.id,
        watchlistItemId: rule.watchlistItemId,
        player: item.player,
        sport: item.sport,
        ruleType: rule.type,
        threshold: rule.threshold,
        currentPrice: item.currentPrice,
        triggeredAt: new Date().toISOString(),
        severity,
        message,
        isAcknowledged: false,
      });
    }
  }

  // Merge with existing
  const allAlerts = [...existingAlerts, ...newAlerts];
  saveTriggeredAlerts(allAlerts);
  return allAlerts.filter(a => {
    // Filter out snoozed alerts
    if (a.snoozedUntil && new Date(a.snoozedUntil) > new Date()) return false;
    return !a.isAcknowledged;
  });
}

// ---- Market Scanner ----

export function scanMarket(criteria: {
  sport?: Sport;
  minPrice?: number;
  maxPrice?: number;
  grade?: string;
  yearRange?: [number, number];
}): MarketScanResult[] {
  const seed = dateSeed();
  const criteriaHash = hashString(JSON.stringify(criteria));
  const baseSeed = seed + criteriaHash;

  const sports: Sport[] = criteria.sport
    ? [criteria.sport]
    : ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

  const minPrice = criteria.minPrice ?? 10;
  const maxPrice = criteria.maxPrice ?? 5000;
  const minYear = criteria.yearRange?.[0] ?? 2018;
  const maxYear = criteria.yearRange?.[1] ?? 2025;

  const resultCount = Math.floor(seededRange(baseSeed, 0, 10, 21));
  const results: MarketScanResult[] = [];

  for (let i = 0; i < resultCount; i++) {
    const itemSeed = baseSeed + i * 17;
    const sportIdx = Math.floor(seededRange(itemSeed, 1, 0, sports.length));
    const sport = sports[sportIdx];
    const players = PLAYER_POOLS[sport];
    const sets = SET_POOLS[sport];
    const playerIdx = Math.floor(seededRange(itemSeed, 2, 0, players.length));
    const setIdx = Math.floor(seededRange(itemSeed, 3, 0, sets.length));
    const sourceIdx = Math.floor(seededRange(itemSeed, 4, 0, MARKET_SOURCES.length));

    const price = Math.round(seededRange(itemSeed, 5, minPrice, maxPrice) * 100) / 100;
    const changePct = Math.round(seededRange(itemSeed, 6, -25, 30) * 100) / 100;
    const previousPrice = Math.round(price / (1 + changePct / 100) * 100) / 100;
    const year = Math.floor(seededRange(itemSeed, 7, minYear, maxYear + 1));

    const gradeIdx = Math.floor(seededRange(itemSeed, 8, 0, GRADE_OPTIONS.length));
    const grade = criteria.grade || GRADE_OPTIONS[gradeIdx];

    // Generate a listing date within the last 7 days
    const daysAgo = Math.floor(seededRange(itemSeed, 9, 0, 7));
    const listedDate = new Date();
    listedDate.setDate(listedDate.getDate() - daysAgo);
    listedDate.setHours(Math.floor(seededRange(itemSeed, 10, 0, 24)));

    results.push({
      id: `ms-${baseSeed}-${i}`,
      player: players[playerIdx],
      sport,
      year,
      set: sets[setIdx],
      grade,
      price,
      previousPrice,
      changePct,
      source: MARKET_SOURCES[sourceIdx],
      listedAt: listedDate.toISOString(),
      confidence: Math.round(seededRange(itemSeed, 11, 60, 98)),
    });
  }

  // Sort by best deals (largest negative change first)
  results.sort((a, b) => a.changePct - b.changePct);

  return results;
}

// ---- Analytics ----

export function getWatchlistAnalytics(watchlists: Watchlist[]): {
  totalWatched: number;
  triggeredAlerts: number;
  topMover: { player: string; changePct: number } | null;
  bestEntry: { player: string; priceDrop: number } | null;
} {
  const allItems: WatchlistItem[] = [];
  for (const wl of watchlists) {
    allItems.push(...wl.items);
  }

  const totalWatched = allItems.length;
  const alerts = loadTriggeredAlerts().filter(a => !a.isAcknowledged);
  const triggeredAlerts = alerts.length;

  // Top mover: item with largest absolute price change percentage
  let topMover: { player: string; changePct: number } | null = null;
  let maxAbsChange = 0;
  for (const item of allItems) {
    if (Math.abs(item.priceChangePercent) > maxAbsChange) {
      maxAbsChange = Math.abs(item.priceChangePercent);
      topMover = { player: item.player, changePct: item.priceChangePercent };
    }
  }

  // Best entry: item with the largest price drop from estimated value
  let bestEntry: { player: string; priceDrop: number } | null = null;
  let maxDrop = 0;
  for (const item of allItems) {
    const drop = item.estimatedValue - item.currentPrice;
    if (drop > maxDrop) {
      maxDrop = drop;
      bestEntry = { player: item.player, priceDrop: Math.round(drop * 100) / 100 };
    }
  }

  return { totalWatched, triggeredAlerts, topMover, bestEntry };
}

// ---- Alert management ----

export function acknowledgeAlert(alertId: string): void {
  const alerts = loadTriggeredAlerts();
  const updated = alerts.map(a =>
    a.id === alertId ? { ...a, isAcknowledged: true } : a
  );
  saveTriggeredAlerts(updated);
}

export function snoozeAlert(alertId: string, hours: number): void {
  const alerts = loadTriggeredAlerts();
  const snoozeUntil = new Date();
  snoozeUntil.setHours(snoozeUntil.getHours() + hours);
  const updated = alerts.map(a =>
    a.id === alertId ? { ...a, snoozedUntil: snoozeUntil.toISOString() } : a
  );
  saveTriggeredAlerts(updated);
}

// ---- CSV Export ----

export function exportWatchlistCSV(watchlist: Watchlist): string {
  const headers = ['Player', 'Sport', 'Year', 'Set', 'Grade', 'Estimated Value', 'Current Price', 'Change %', 'Added Date'];
  const rows = watchlist.items.map(item => [
    `"${item.player}"`,
    item.sport,
    item.year.toString(),
    `"${item.set}"`,
    item.grade ?? 'Raw',
    item.estimatedValue.toFixed(2),
    item.currentPrice.toFixed(2),
    item.priceChangePercent.toFixed(2),
    new Date(item.addedAt).toLocaleDateString(),
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
