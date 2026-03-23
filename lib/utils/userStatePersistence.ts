/**
 * User State Persistence Layer
 *
 * Provides a unified persistence layer for user data across all features
 * of the sports card collecting app. Supports localStorage (immediate),
 * IndexedDB (large datasets), and a cloud sync stub for future API backing.
 *
 * Features:
 * - Fallback chain: localStorage -> IndexedDB -> in-memory
 * - Schema versioning and migration support
 * - Storage quota handling with graceful degradation
 * - Feature-specific convenience functions
 * - JSON export/import for data portability
 */

import { logger } from '../logger';
import { listLocalStorageKeysWithPrefix, store } from '../dal/syncStore';
import type { Sport } from '../../types';

// ---------------------------------------------------------------------------
// Schema version — bump when UserState shape changes
// ---------------------------------------------------------------------------

const SCHEMA_VERSION = 1;
const LS_PREFIX = 'msi_user_';
const LS_META_KEY = `${LS_PREFIX}meta`;
const IDB_NAME = 'msi_user_store';
const IDB_VERSION = 1;
const IDB_STORE = 'state';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CardPosition {
  cardId: string;
  player: string;
  year: number;
  set: string;
  sport: Sport;
  grade?: string;
  gradingCompany?: string;
  quantity: number;
  costBasis: number;
  currentValue: number;
  acquiredAt: string;
  notes?: string;
  image?: string;
}

export interface UserPortfolioState {
  positions: CardPosition[];
  totalValue: number;
  lastUpdated: string;
}

export interface NotificationPreferences {
  priceAlerts: boolean;
  trendAlerts: boolean;
  portfolioDigest: boolean;
  breakAlerts: boolean;
  digestFrequency: 'daily' | 'weekly' | 'never';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultSport: Sport;
  favoriteFeatures: string[];
  dashboardLayout: string[];
  notificationPreferences: NotificationPreferences;
}

export interface WatchlistCard {
  cardId: string;
  player: string;
  year: number;
  set: string;
  sport: Sport;
  targetPrice: number;
  currentPrice: number;
  addedAt: string;
  notes?: string;
  image?: string;
}

export interface WatchlistAlert {
  id: string;
  cardId: string;
  type: 'price_above' | 'price_below' | 'volume_spike' | 'new_listing';
  threshold: number;
  isActive: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export interface UserWatchlist {
  cards: WatchlistCard[];
  alerts: WatchlistAlert[];
}

export interface YieldPosition {
  id: string;
  cardId: string;
  player: string;
  principal: number;
  apy: number;
  accrued: number;
  startDate: string;
  maturityDate?: string;
  status: 'active' | 'matured' | 'withdrawn';
}

export interface UserYieldPositions {
  positions: YieldPosition[];
  totalAccrued: number;
}

export interface VaultPosition {
  id: string;
  cardId: string;
  player: string;
  vaultId: string;
  sharesOwned: number;
  totalShares: number;
  costBasis: number;
  currentValue: number;
  acquiredAt: string;
}

export interface UserFractionalHoldings {
  vaultPositions: VaultPosition[];
}

export interface UserDemoProgress {
  completedFlows: string[];
  currentFlow?: string;
  currentStep?: number;
}

export interface CustomIndex {
  id: string;
  name: string;
  description?: string;
  cardIds: string[];
  baseValue: number;
  currentValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  userId: string;
  portfolio: UserPortfolioState;
  preferences: UserPreferences;
  watchlist: UserWatchlist;
  yieldPositions: UserYieldPositions;
  fractionalHoldings: UserFractionalHoldings;
  demoProgress: UserDemoProgress;
  savedIndices: string[];
  savedStrategies: string[];
  customIndices: CustomIndex[];
  lastSyncedAt: string;
  _schemaVersion: number;
}

// ---------------------------------------------------------------------------
// Schema metadata (stored separately for migration checks)
// ---------------------------------------------------------------------------

interface SchemaMeta {
  version: number;
  lastMigratedAt: string;
}

// ---------------------------------------------------------------------------
// Cloud sync stub
// ---------------------------------------------------------------------------

export interface CloudSyncAdapter {
  push(state: UserState): Promise<void>;
  pull(userId: string): Promise<UserState | null>;
  isAvailable(): boolean;
}

/**
 * Stub cloud sync adapter. Replace with a real implementation when the API
 * backend is ready. The persistence layer will call this automatically when
 * available.
 */
const cloudSyncStub: CloudSyncAdapter = {
  async push(_state: UserState): Promise<void> {
    // No-op: wire up to your REST / GraphQL endpoint
  },
  async pull(_userId: string): Promise<UserState | null> {
    return null;
  },
  isAvailable(): boolean {
    return false;
  },
};

let cloudAdapter: CloudSyncAdapter = cloudSyncStub;

export function registerCloudSyncAdapter(adapter: CloudSyncAdapter): void {
  cloudAdapter = adapter;
}

// ---------------------------------------------------------------------------
// Default state factory
// ---------------------------------------------------------------------------

export function createDefaultUserState(userId: string = 'demo-user'): UserState {
  return {
    userId,
    portfolio: { positions: [], totalValue: 0, lastUpdated: new Date().toISOString() },
    preferences: {
      theme: 'system',
      defaultSport: 'Baseball',
      favoriteFeatures: [],
      dashboardLayout: [],
      notificationPreferences: {
        priceAlerts: true,
        trendAlerts: true,
        portfolioDigest: true,
        breakAlerts: false,
        digestFrequency: 'daily',
      },
    },
    watchlist: { cards: [], alerts: [] },
    yieldPositions: { positions: [], totalAccrued: 0 },
    fractionalHoldings: { vaultPositions: [] },
    demoProgress: { completedFlows: [] },
    savedIndices: [],
    savedStrategies: [],
    customIndices: [],
    lastSyncedAt: new Date().toISOString(),
    _schemaVersion: SCHEMA_VERSION,
  };
}

// ---------------------------------------------------------------------------
// Migration support
// ---------------------------------------------------------------------------

type MigrationFn = (state: Record<string, unknown>) => Record<string, unknown>;

/**
 * Map from *source* version to the function that migrates it to source+1.
 * Add new entries here when SCHEMA_VERSION is bumped.
 */
const migrations: Record<number, MigrationFn> = {
  // Example for future use:
  // 1: (state) => { state.newField = 'default'; return state; },
};

function migrateState(raw: Record<string, unknown>): UserState {
  let version = typeof raw._schemaVersion === 'number' ? raw._schemaVersion : 0;
  let current = { ...raw };

  while (version < SCHEMA_VERSION) {
    const migrator = migrations[version];
    if (migrator) {
      current = migrator(current);
    }
    version++;
  }

  current._schemaVersion = SCHEMA_VERSION;

  // Merge with defaults so any newly-added fields get populated
  const defaults = createDefaultUserState((current.userId as string) ?? 'demo-user');
  return deepMerge(defaults as unknown as Record<string, unknown>, current) as unknown as UserState;
}

// ---------------------------------------------------------------------------
// Deep merge utility (target is overwritten by source where source has values)
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (isPlainObject(srcVal) && isPlainObject(tgtVal)) {
      result[key] = deepMerge(tgtVal, srcVal);
    } else if (srcVal !== undefined) {
      result[key] = srcVal;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Storage adapters
// ---------------------------------------------------------------------------

// ---- localStorage adapter ----

function lsKey(suffix: string): string {
  return `${LS_PREFIX}${suffix}`;
}

function lsWrite(key: string, value: unknown): boolean {
  try {
    store.set(key, value);
    return true;
  } catch (err: unknown) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      logger.warn('[UserStatePersistence] localStorage quota exceeded. Attempting cleanup...');
      pruneLocalStorage();
      try {
        store.set(key, value);
        return true;
      } catch {
        logger.error('[UserStatePersistence] localStorage write failed after cleanup.');
        return false;
      }
    }
    logger.error('[UserStatePersistence] localStorage write error:', err);
    return false;
  }
}

function lsRead<T>(key: string): T | null {
  const value = store.get<T | null>(key, null);
  return value;
}

function lsRemove(key: string): void {
  store.remove(key);
}

/**
 * Prune old / non-critical data from localStorage to free space.
 * Removes items older than 30 days that start with our prefix, except the
 * primary state key.
 */
function pruneLocalStorage(): void {
  const keysToRemove = listLocalStorageKeysWithPrefix(LS_PREFIX).filter(
    (key) => key !== lsKey('state') && key !== LS_META_KEY,
  );
  // Remove oldest half to free space
  const half = Math.ceil(keysToRemove.length / 2);
  for (let i = 0; i < half; i++) {
    store.remove(keysToRemove[i]);
  }
}

function lsSaveState(state: UserState): boolean {
  const metaOk = lsWrite(LS_META_KEY, { version: SCHEMA_VERSION, lastMigratedAt: new Date().toISOString() } satisfies SchemaMeta);
  const stateOk = lsWrite(lsKey('state'), state);
  return metaOk && stateOk;
}

function lsLoadState(): UserState | null {
  const raw = lsRead<Record<string, unknown>>(lsKey('state'));
  if (!raw) return null;
  return migrateState(raw);
}

// ---- IndexedDB adapter ----

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbWrite(key: string, value: unknown): Promise<boolean> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put({ key, value, updatedAt: new Date().toISOString() });
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => { db.close(); resolve(false); };
    });
  } catch {
    return false;
  }
}

async function idbRead<T>(key: string): Promise<T | null> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        db.close();
        resolve(req.result ? (req.result.value as T) : null);
      };
      req.onerror = () => { db.close(); resolve(null); };
    });
  } catch {
    return null;
  }
}

async function idbClear(): Promise<void> {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).clear();
    await new Promise<void>((resolve) => { tx.oncomplete = () => { db.close(); resolve(); }; });
  } catch {
    // silent
  }
}

async function idbSaveState(state: UserState): Promise<boolean> {
  return idbWrite('userState', state);
}

async function idbLoadState(): Promise<UserState | null> {
  const raw = await idbRead<Record<string, unknown>>('userState');
  if (!raw) return null;
  return migrateState(raw);
}

// ---------------------------------------------------------------------------
// Core public API
// ---------------------------------------------------------------------------

/**
 * Save partial user state. Merges the provided fields into the current
 * persisted state and writes to all available backends.
 */
export async function saveUserState(partial: Partial<UserState>): Promise<void> {
  const current = await loadUserState();
  const merged = deepMerge(current as unknown as Record<string, unknown>, partial as unknown as Record<string, unknown>) as unknown as UserState;
  merged.lastSyncedAt = new Date().toISOString();
  merged._schemaVersion = SCHEMA_VERSION;

  // Write to localStorage first (synchronous, fast)
  lsSaveState(merged);

  // Write to IndexedDB (async, larger capacity)
  await idbSaveState(merged);

  // Attempt cloud sync if available
  if (cloudAdapter.isAvailable()) {
    try {
      await cloudAdapter.push(merged);
    } catch (err) {
      logger.warn('[UserStatePersistence] Cloud sync push failed:', err);
    }
  }
}

/**
 * Load user state from the best available storage backend.
 * Preference: cloud (if available) > IndexedDB > localStorage > defaults.
 */
export async function loadUserState(userId?: string): Promise<UserState> {
  // 1. Try cloud
  if (cloudAdapter.isAvailable() && userId) {
    try {
      const cloudState = await cloudAdapter.pull(userId);
      if (cloudState) return migrateState(cloudState as unknown as Record<string, unknown>);
    } catch {
      // fall through
    }
  }

  // 2. Try localStorage (fast, synchronous-ish)
  const lsState = lsLoadState();

  // 3. Try IndexedDB
  let idbState: UserState | null = null;
  try {
    idbState = await idbLoadState();
  } catch {
    // fall through
  }

  // Pick whichever is more recent
  if (lsState && idbState) {
    const lsTime = new Date(lsState.lastSyncedAt).getTime();
    const idbTime = new Date(idbState.lastSyncedAt).getTime();
    return idbTime > lsTime ? idbState : lsState;
  }

  if (lsState) return lsState;
  if (idbState) return idbState;

  return createDefaultUserState(userId ?? 'demo-user');
}

/**
 * Synchronous load from localStorage only. Useful for initial render
 * where you cannot await.
 */
export function loadUserStateSync(userId?: string): UserState {
  const lsState = lsLoadState();
  return lsState ?? createDefaultUserState(userId ?? 'demo-user');
}

/**
 * Wipe all persisted user data from every backend.
 */
export async function clearUserState(): Promise<void> {
  listLocalStorageKeysWithPrefix(LS_PREFIX).forEach((k) => store.remove(k));

  // IndexedDB
  await idbClear();
}

/**
 * Export all user data as a JSON string for data portability.
 */
export async function exportUserData(): Promise<string> {
  const state = await loadUserState();
  return JSON.stringify(
    {
      _export: true,
      _exportedAt: new Date().toISOString(),
      _schemaVersion: SCHEMA_VERSION,
      data: state,
    },
    null,
    2,
  );
}

/**
 * Import user data from a JSON string. Validates structure and migrates
 * if necessary.
 */
export async function importUserData(json: string): Promise<UserState> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON: could not parse import data.');
  }

  if (!isPlainObject(parsed)) {
    throw new Error('Invalid import format: expected a JSON object.');
  }

  // Support both direct state and wrapped { _export, data } format
  const raw = isPlainObject((parsed as Record<string, unknown>).data)
    ? (parsed as Record<string, unknown>).data as Record<string, unknown>
    : parsed as Record<string, unknown>;

  const state = migrateState(raw);
  await saveUserState(state);
  return state;
}

// ---------------------------------------------------------------------------
// Feature-specific persistence helpers
// ---------------------------------------------------------------------------

// ---- Portfolio ----

export async function savePortfolioPosition(position: CardPosition): Promise<void> {
  const state = await loadUserState();
  const idx = state.portfolio.positions.findIndex((p) => p.cardId === position.cardId);
  if (idx >= 0) {
    state.portfolio.positions[idx] = position;
  } else {
    state.portfolio.positions.push(position);
  }
  state.portfolio.totalValue = state.portfolio.positions.reduce((sum, p) => sum + p.currentValue * p.quantity, 0);
  state.portfolio.lastUpdated = new Date().toISOString();
  await saveUserState({ portfolio: state.portfolio });
}

export async function removePortfolioPosition(cardId: string): Promise<void> {
  const state = await loadUserState();
  state.portfolio.positions = state.portfolio.positions.filter((p) => p.cardId !== cardId);
  state.portfolio.totalValue = state.portfolio.positions.reduce((sum, p) => sum + p.currentValue * p.quantity, 0);
  state.portfolio.lastUpdated = new Date().toISOString();
  await saveUserState({ portfolio: state.portfolio });
}

export async function getPortfolioPositions(): Promise<CardPosition[]> {
  const state = await loadUserState();
  return state.portfolio.positions;
}

// ---- Watchlist ----

export async function saveWatchlistCard(card: WatchlistCard): Promise<void> {
  const state = await loadUserState();
  const idx = state.watchlist.cards.findIndex((c) => c.cardId === card.cardId);
  if (idx >= 0) {
    state.watchlist.cards[idx] = card;
  } else {
    state.watchlist.cards.push(card);
  }
  await saveUserState({ watchlist: state.watchlist });
}

export async function removeWatchlistCard(cardId: string): Promise<void> {
  const state = await loadUserState();
  state.watchlist.cards = state.watchlist.cards.filter((c) => c.cardId !== cardId);
  state.watchlist.alerts = state.watchlist.alerts.filter((a) => a.cardId !== cardId);
  await saveUserState({ watchlist: state.watchlist });
}

export async function getWatchlist(): Promise<UserWatchlist> {
  const state = await loadUserState();
  return state.watchlist;
}

// ---- Yield Positions ----

export async function saveYieldPosition(position: YieldPosition): Promise<void> {
  const state = await loadUserState();
  const idx = state.yieldPositions.positions.findIndex((p) => p.id === position.id);
  if (idx >= 0) {
    state.yieldPositions.positions[idx] = position;
  } else {
    state.yieldPositions.positions.push(position);
  }
  state.yieldPositions.totalAccrued = state.yieldPositions.positions.reduce((sum, p) => sum + p.accrued, 0);
  await saveUserState({ yieldPositions: state.yieldPositions });
}

export async function getYieldPositions(): Promise<UserYieldPositions> {
  const state = await loadUserState();
  return state.yieldPositions;
}

// ---- Fractional Holdings ----

export async function saveFractionalHolding(holding: VaultPosition): Promise<void> {
  const state = await loadUserState();
  const idx = state.fractionalHoldings.vaultPositions.findIndex((v) => v.id === holding.id);
  if (idx >= 0) {
    state.fractionalHoldings.vaultPositions[idx] = holding;
  } else {
    state.fractionalHoldings.vaultPositions.push(holding);
  }
  await saveUserState({ fractionalHoldings: state.fractionalHoldings });
}

export async function getFractionalHoldings(): Promise<UserFractionalHoldings> {
  const state = await loadUserState();
  return state.fractionalHoldings;
}

// ---- Demo Progress ----

export async function saveDemoProgress(flowId: string, step?: number): Promise<void> {
  const state = await loadUserState();
  const progress = { ...state.demoProgress };
  if (step !== undefined) {
    progress.currentFlow = flowId;
    progress.currentStep = step;
  } else {
    // Mark as completed
    if (!progress.completedFlows.includes(flowId)) {
      progress.completedFlows.push(flowId);
    }
    if (progress.currentFlow === flowId) {
      progress.currentFlow = undefined;
      progress.currentStep = undefined;
    }
  }
  await saveUserState({ demoProgress: progress });
}

export async function getDemoProgress(flowId?: string): Promise<UserDemoProgress> {
  const state = await loadUserState();
  if (flowId) {
    return {
      completedFlows: state.demoProgress.completedFlows.filter((f) => f === flowId),
      currentFlow: state.demoProgress.currentFlow === flowId ? flowId : undefined,
      currentStep: state.demoProgress.currentFlow === flowId ? state.demoProgress.currentStep : undefined,
    };
  }
  return state.demoProgress;
}

// ---- Custom Indices ----

export async function saveCustomIndex(index: CustomIndex): Promise<void> {
  const state = await loadUserState();
  const idx = state.customIndices.findIndex((i) => i.id === index.id);
  if (idx >= 0) {
    state.customIndices[idx] = index;
  } else {
    state.customIndices.push(index);
  }
  if (!state.savedIndices.includes(index.id)) {
    state.savedIndices.push(index.id);
  }
  await saveUserState({ customIndices: state.customIndices, savedIndices: state.savedIndices });
}

export async function getCustomIndices(): Promise<CustomIndex[]> {
  const state = await loadUserState();
  return state.customIndices;
}

// ---- User Preferences ----

export async function saveUserPreferences(prefs: Partial<UserPreferences>): Promise<void> {
  const state = await loadUserState();
  const merged = { ...state.preferences, ...prefs };
  if (prefs.notificationPreferences) {
    merged.notificationPreferences = { ...state.preferences.notificationPreferences, ...prefs.notificationPreferences };
  }
  await saveUserState({ preferences: merged });
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const state = await loadUserState();
  return state.preferences;
}

// ---- Saved Strategies ----

export async function saveStrategy(strategyId: string): Promise<void> {
  const state = await loadUserState();
  if (!state.savedStrategies.includes(strategyId)) {
    state.savedStrategies.push(strategyId);
    await saveUserState({ savedStrategies: state.savedStrategies });
  }
}

export async function getSavedStrategies(): Promise<string[]> {
  const state = await loadUserState();
  return state.savedStrategies;
}

// ---------------------------------------------------------------------------
// IndexedDB-specific helpers for large datasets
// ---------------------------------------------------------------------------

/**
 * Save a large dataset (e.g., portfolio history, trade logs) directly to
 * IndexedDB without touching the main state object. Useful for data that
 * would exceed localStorage limits.
 */
export async function saveLargeDataset(key: string, data: unknown): Promise<boolean> {
  return idbWrite(`dataset_${key}`, data);
}

export async function loadLargeDataset<T>(key: string): Promise<T | null> {
  return idbRead<T>(`dataset_${key}`);
}
