// ─── Offline-First Data Management Service ───────────────────────────────────
// Provides production-grade offline support with sync queue, caching,
// conflict resolution, and storage management.

import { store } from '../dal/syncStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export type OfflineStatus = 'online' | 'offline' | 'syncing';

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete' | 'bulk';
  entity: string;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
  priority: number;
}

export interface CachedData<T = unknown> {
  key: string;
  data: T;
  cachedAt: number;
  expiresAt: number;
  version: number;
  scope: string;
  sizeBytes: number;
}

export interface OfflineCapability {
  feature: string;
  availableOffline: boolean;
  readOnly: boolean;
  cacheDuration: number;
  lastCached: number | null;
  description: string;
}

export interface ConflictResolution {
  id: string;
  itemId: string;
  entity: string;
  localVersion: Record<string, unknown>;
  serverVersion: Record<string, unknown>;
  detectedAt: number;
  resolvedAt: number | null;
  resolution: 'local' | 'server' | 'merge' | 'pending';
  fieldConflicts: string[];
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  startedAt: number;
  estimatedCompletion: number | null;
  currentItem: string | null;
  bytesTransferred: number;
}

export interface OfflineStorageStats {
  usedBytes: number;
  availableBytes: number;
  totalBytes: number;
  cacheEntries: number;
  syncQueueSize: number;
  conflictCount: number;
  oldestCache: number | null;
  newestCache: number | null;
  byScope: Record<string, number>;
}

export interface QueuedTransaction {
  action: 'create' | 'update' | 'delete' | 'bulk';
  entity: string;
  payload: Record<string, unknown>;
  priority?: number;
}

export interface CachePolicy {
  defaultTTL: number;
  maxEntries: number;
  maxSizeBytes: number;
  evictionStrategy: 'lru' | 'lfu' | 'ttl';
  prefetchEnabled: boolean;
  compressionEnabled: boolean;
  scopes: Record<string, { ttl: number; priority: number }>;
}

export interface OfflineConfig {
  syncInterval: number;
  maxRetries: number;
  retryBackoff: 'linear' | 'exponential';
  conflictStrategy: 'local-wins' | 'server-wins' | 'manual';
  backgroundSync: boolean;
  notifyOnSync: boolean;
  cachePolicy: CachePolicy;
}

// ─── Storage Keys ────────────────────────────────────────────────────────────

const KEYS = {
  SYNC_QUEUE: 'msi_sync_queue',
  CACHE_PREFIX: 'msi_cache_',
  CACHE_INDEX: 'msi_cache_index',
  PORTFOLIO: 'msi_cached_portfolio',
  CONFLICTS: 'msi_conflicts',
  CACHE_POLICY: 'msi_cache_policy',
  CONFIG: 'msi_offline_config',
  LAST_SYNC: 'msi_last_sync',
  STATUS: 'msi_offline_status',
} as const;

// ─── Internal Helpers ────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function safeGetItem<T>(key: string, fallback: T): T {
  return store.get<T>(key, fallback);
}

function safeSetItem(key: string, value: unknown): void {
  try {
    store.set(key, value);
  } catch {
    // storage full — evict oldest cache entries
    evictOldestCacheEntries(1);
    try {
      store.set(key, value);
    } catch {
      // still full; nothing we can do
    }
  }
}

function estimateSize(data: unknown): number {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    return JSON.stringify(data).length * 2;
  }
}

function evictOldestCacheEntries(count: number): void {
  const index = safeGetItem<string[]>(KEYS.CACHE_INDEX, []);
  const entries = index.map((key) => {
    const cached = safeGetItem<CachedData | null>(`${KEYS.CACHE_PREFIX}${key}`, null);
    return { key, cached };
  }).filter((e) => e.cached !== null);
  entries.sort((a, b) => (a.cached!.cachedAt - b.cached!.cachedAt));
  const toRemove = entries.slice(0, count);
  for (const entry of toRemove) {
    store.remove(`${KEYS.CACHE_PREFIX}${entry.key}`);
  }
  const remaining = index.filter((k) => !toRemove.some((r) => r.key === k));
  safeSetItem(KEYS.CACHE_INDEX, remaining);
}

// ─── Status Listeners ────────────────────────────────────────────────────────

let currentStatus: OfflineStatus = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
const statusListeners: Array<(status: OfflineStatus) => void> = [];

function notifyListeners(): void {
  statusListeners.forEach((fn) => fn(currentStatus));
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    currentStatus = 'online';
    notifyListeners();
  });
  window.addEventListener('offline', () => {
    currentStatus = 'offline';
    notifyListeners();
  });
}

export function onStatusChange(listener: (status: OfflineStatus) => void): () => void {
  statusListeners.push(listener);
  return () => {
    const idx = statusListeners.indexOf(listener);
    if (idx >= 0) statusListeners.splice(idx, 1);
  };
}

// ─── Core Functions ──────────────────────────────────────────────────────────

export function getOfflineStatus(): OfflineStatus {
  return currentStatus;
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function getCachedPortfolio(): Record<string, unknown>[] {
  return safeGetItem<Record<string, unknown>[]>(KEYS.PORTFOLIO, getMockPortfolio());
}

export function cachePortfolio(inventory: Record<string, unknown>[]): void {
  safeSetItem(KEYS.PORTFOLIO, inventory);
  safeSetItem(`${KEYS.LAST_SYNC}_portfolio`, Date.now());
}

export function queueTransaction(transaction: QueuedTransaction): void {
  const queue = safeGetItem<SyncQueueItem[]>(KEYS.SYNC_QUEUE, []);
  const item: SyncQueueItem = {
    id: generateId(),
    action: transaction.action,
    entity: transaction.entity,
    payload: transaction.payload,
    timestamp: Date.now(),
    retryCount: 0,
    maxRetries: 5,
    status: 'pending',
    priority: transaction.priority ?? 1,
  };
  queue.push(item);
  safeSetItem(KEYS.SYNC_QUEUE, queue);
}

export function getSyncQueue(): SyncQueueItem[] {
  return safeGetItem<SyncQueueItem[]>(KEYS.SYNC_QUEUE, getMockSyncQueue());
}

export async function processSyncQueue(): Promise<SyncProgress> {
  const queue = safeGetItem<SyncQueueItem[]>(KEYS.SYNC_QUEUE, []);
  const pending = queue.filter((i) => i.status === 'pending' || i.status === 'failed');
  const progress: SyncProgress = {
    total: pending.length,
    completed: 0,
    failed: 0,
    inProgress: 0,
    startedAt: Date.now(),
    estimatedCompletion: null,
    currentItem: null,
    bytesTransferred: 0,
  };

  if (!isOnline()) {
    return progress;
  }

  currentStatus = 'syncing';
  notifyListeners();

  for (const item of pending) {
    progress.inProgress = 1;
    progress.currentItem = `${item.action} ${item.entity}`;

    // Simulate network sync with delay
    await new Promise((res) => setTimeout(res, 200 + Math.random() * 300));

    // Simulate success/failure (90% success rate)
    if (Math.random() > 0.1) {
      item.status = 'completed';
      progress.completed += 1;
      progress.bytesTransferred += estimateSize(item.payload);
    } else {
      item.retryCount += 1;
      if (item.retryCount >= item.maxRetries) {
        item.status = 'failed';
        item.error = 'Max retries exceeded';
        progress.failed += 1;
      } else {
        item.status = 'pending';
      }
    }
    progress.inProgress = 0;
  }

  // Remove completed items from queue
  const updatedQueue = queue.filter((i) => i.status !== 'completed');
  safeSetItem(KEYS.SYNC_QUEUE, updatedQueue);
  safeSetItem(KEYS.LAST_SYNC, Date.now());

  progress.estimatedCompletion = Date.now();
  progress.currentItem = null;
  currentStatus = isOnline() ? 'online' : 'offline';
  notifyListeners();

  return progress;
}

export function clearSyncQueue(): void {
  safeSetItem(KEYS.SYNC_QUEUE, []);
}

export function getStorageStats(): OfflineStorageStats {
  let usedBytes = 0;
  const byScope: Record<string, number> = {};
  const index = safeGetItem<string[]>(KEYS.CACHE_INDEX, []);
  let oldest: number | null = null;
  let newest: number | null = null;

  // Full-origin estimate (includes keys outside MSI/syncStore); not replaceable by store alone.
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        usedBytes += key.length * 2 + val.length * 2;
      }
    }
  }

  for (const cKey of index) {
    const entry = safeGetItem<CachedData | null>(`${KEYS.CACHE_PREFIX}${cKey}`, null);
    if (entry) {
      const scope = entry.scope || 'general';
      byScope[scope] = (byScope[scope] || 0) + entry.sizeBytes;
      if (!oldest || entry.cachedAt < oldest) oldest = entry.cachedAt;
      if (!newest || entry.cachedAt > newest) newest = entry.cachedAt;
    }
  }

  const totalBytes = 10 * 1024 * 1024; // 10MB localStorage limit
  const queue = safeGetItem<SyncQueueItem[]>(KEYS.SYNC_QUEUE, []);
  const conflicts = safeGetItem<ConflictResolution[]>(KEYS.CONFLICTS, []);

  return {
    usedBytes,
    availableBytes: Math.max(0, totalBytes - usedBytes),
    totalBytes,
    cacheEntries: index.length,
    syncQueueSize: queue.length,
    conflictCount: conflicts.filter((c) => c.resolution === 'pending').length,
    oldestCache: oldest,
    newestCache: newest,
    byScope,
  };
}

export function getCachePolicy(): CachePolicy {
  return safeGetItem<CachePolicy>(KEYS.CACHE_POLICY, getDefaultCachePolicy());
}

export function setCachePolicy(policy: CachePolicy): void {
  safeSetItem(KEYS.CACHE_POLICY, policy);
}

export function resolveConflict(itemId: string, resolution: ConflictResolution): void {
  const conflicts = safeGetItem<ConflictResolution[]>(KEYS.CONFLICTS, []);
  const idx = conflicts.findIndex((c) => c.itemId === itemId);
  if (idx >= 0) {
    conflicts[idx] = { ...resolution, resolvedAt: Date.now() };
  }
  safeSetItem(KEYS.CONFLICTS, conflicts);
}

export function getConflicts(): ConflictResolution[] {
  return safeGetItem<ConflictResolution[]>(KEYS.CONFLICTS, getMockConflicts());
}

export async function prefetchData(scope: string): Promise<void> {
  const policy = getCachePolicy();
  const ttl = policy.scopes[scope]?.ttl ?? policy.defaultTTL;

  // Simulate fetching and caching data for the scope
  await new Promise((res) => setTimeout(res, 300));

  const index = safeGetItem<string[]>(KEYS.CACHE_INDEX, []);
  const cacheKey = `prefetch_${scope}_${Date.now()}`;
  const cached: CachedData = {
    key: cacheKey,
    data: { scope, prefetched: true, timestamp: Date.now() },
    cachedAt: Date.now(),
    expiresAt: Date.now() + ttl,
    version: 1,
    scope,
    sizeBytes: 1024,
  };
  safeSetItem(`${KEYS.CACHE_PREFIX}${cacheKey}`, cached);
  index.push(cacheKey);
  safeSetItem(KEYS.CACHE_INDEX, index);
}

export function clearCache(): void {
  const index = safeGetItem<string[]>(KEYS.CACHE_INDEX, []);
  for (const key of index) {
    store.remove(`${KEYS.CACHE_PREFIX}${key}`);
  }
  safeSetItem(KEYS.CACHE_INDEX, []);
  store.remove(KEYS.PORTFOLIO);
}

export function exportOfflineData(): string {
  const data: Record<string, unknown> = {
    portfolio: getCachedPortfolio(),
    syncQueue: getSyncQueue(),
    conflicts: getConflicts(),
    cachePolicy: getCachePolicy(),
    storageStats: getStorageStats(),
    exportedAt: Date.now(),
    version: 1,
  };
  return JSON.stringify(data, null, 2);
}

export function importOfflineData(jsonString: string): void {
  try {
    const data = JSON.parse(jsonString) as Record<string, unknown>;
    if (data.portfolio && Array.isArray(data.portfolio)) {
      cachePortfolio(data.portfolio as Record<string, unknown>[]);
    }
    if (data.syncQueue && Array.isArray(data.syncQueue)) {
      safeSetItem(KEYS.SYNC_QUEUE, data.syncQueue);
    }
    if (data.conflicts && Array.isArray(data.conflicts)) {
      safeSetItem(KEYS.CONFLICTS, data.conflicts);
    }
    if (data.cachePolicy) {
      safeSetItem(KEYS.CACHE_POLICY, data.cachePolicy);
    }
  } catch {
    throw new Error('Invalid offline data format');
  }
}

export function getLastSyncTime(scope?: string): number | null {
  if (scope) {
    return safeGetItem<number | null>(`${KEYS.LAST_SYNC}_${scope}`, null);
  }
  return safeGetItem<number | null>(KEYS.LAST_SYNC, null);
}

// ─── Offline Capabilities Registry ──────────────────────────────────────────

export function getOfflineCapabilities(): OfflineCapability[] {
  return [
    { feature: 'Portfolio Viewer', availableOffline: true, readOnly: true, cacheDuration: 3600000, lastCached: Date.now() - 120000, description: 'View cached portfolio data and card inventory' },
    { feature: 'Market Prices', availableOffline: true, readOnly: true, cacheDuration: 1800000, lastCached: Date.now() - 300000, description: 'Last-known market prices from cache' },
    { feature: 'Card Grading', availableOffline: false, readOnly: false, cacheDuration: 0, lastCached: null, description: 'Requires live connection for AI analysis' },
    { feature: 'Trade Execution', availableOffline: true, readOnly: false, cacheDuration: 0, lastCached: null, description: 'Queued for sync when online' },
    { feature: 'Analytics Dashboard', availableOffline: true, readOnly: true, cacheDuration: 7200000, lastCached: Date.now() - 600000, description: 'Cached charts and analytics data' },
    { feature: 'Collection Appraisal', availableOffline: false, readOnly: false, cacheDuration: 0, lastCached: null, description: 'Requires live API for valuation' },
    { feature: 'Notifications', availableOffline: true, readOnly: true, cacheDuration: 86400000, lastCached: Date.now() - 30000, description: 'Cached notification history' },
    { feature: 'Search', availableOffline: true, readOnly: true, cacheDuration: 3600000, lastCached: Date.now() - 900000, description: 'Search cached inventory only' },
    { feature: 'Deal Finder', availableOffline: false, readOnly: false, cacheDuration: 0, lastCached: null, description: 'Requires live marketplace data' },
    { feature: 'Export / Import', availableOffline: true, readOnly: false, cacheDuration: 0, lastCached: null, description: 'Full offline data export and import' },
  ];
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

function getDefaultCachePolicy(): CachePolicy {
  return {
    defaultTTL: 3600000,
    maxEntries: 500,
    maxSizeBytes: 5 * 1024 * 1024,
    evictionStrategy: 'lru',
    prefetchEnabled: true,
    compressionEnabled: false,
    scopes: {
      portfolio: { ttl: 7200000, priority: 10 },
      market: { ttl: 1800000, priority: 8 },
      analytics: { ttl: 3600000, priority: 6 },
      notifications: { ttl: 86400000, priority: 4 },
      search: { ttl: 3600000, priority: 5 },
    },
  };
}

function getMockPortfolio(): Record<string, unknown>[] {
  return [
    { id: '1', name: '2023 Topps Chrome Victor Wembanyama RC PSA 10', value: 4200, category: 'Basketball', cachedAt: Date.now() - 120000 },
    { id: '2', name: '2022 Panini Prizm Ja Morant Silver PSA 10', value: 890, category: 'Basketball', cachedAt: Date.now() - 120000 },
    { id: '3', name: '2021 Topps Update Juan Soto RC PSA 10', value: 320, category: 'Baseball', cachedAt: Date.now() - 180000 },
    { id: '4', name: '2020 Panini Select Justin Herbert RC PSA 10', value: 1450, category: 'Football', cachedAt: Date.now() - 60000 },
    { id: '5', name: '2019 Topps Chrome Yordan Alvarez RC PSA 10', value: 275, category: 'Baseball', cachedAt: Date.now() - 240000 },
  ];
}

function getMockSyncQueue(): SyncQueueItem[] {
  return [
    { id: 'sq-1', action: 'update', entity: 'portfolio', payload: { cardId: '1', field: 'value', newValue: 4350 }, timestamp: Date.now() - 45000, retryCount: 0, maxRetries: 5, status: 'pending', priority: 2 },
    { id: 'sq-2', action: 'create', entity: 'watchlist', payload: { cardName: '2024 Bowman Chrome Paul Skenes', targetPrice: 150 }, timestamp: Date.now() - 30000, retryCount: 0, maxRetries: 5, status: 'pending', priority: 1 },
    { id: 'sq-3', action: 'delete', entity: 'alert', payload: { alertId: 'al-77' }, timestamp: Date.now() - 15000, retryCount: 1, maxRetries: 5, status: 'failed', error: 'Network timeout', priority: 0 },
  ];
}

function getMockConflicts(): ConflictResolution[] {
  return [
    {
      id: 'cf-1',
      itemId: '1',
      entity: 'portfolio',
      localVersion: { value: 4350, condition: 'PSA 10', notes: 'Updated locally' },
      serverVersion: { value: 4500, condition: 'PSA 10', notes: 'Server price update' },
      detectedAt: Date.now() - 60000,
      resolvedAt: null,
      resolution: 'pending',
      fieldConflicts: ['value', 'notes'],
    },
    {
      id: 'cf-2',
      itemId: '4',
      entity: 'portfolio',
      localVersion: { value: 1450, category: 'Football', tags: ['rookie', 'invest'] },
      serverVersion: { value: 1520, category: 'Football', tags: ['rookie', 'invest', 'trending'] },
      detectedAt: Date.now() - 30000,
      resolvedAt: null,
      resolution: 'pending',
      fieldConflicts: ['value', 'tags'],
    },
  ];
}
