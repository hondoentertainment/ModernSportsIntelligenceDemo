/**
 * User-scoped market / catalyst events: local cache via SyncedStore + optional Supabase sync.
 * @see supabase/migrations/00006_price_history_market_events_stripe.sql
 */

import { store } from '../dal/syncStore';
import { isDemoMode } from '../supabase';
import { logger } from '../logger';
import {
    fetchMarketEventsFromCloud,
    insertMarketEventToCloud,
    type MarketEventRow,
} from '../supabaseData';

export type MarketEvent = MarketEventRow;

const STORAGE_KEY = 'msi_market_events_v1';
const MAX_EVENTS = 500;

let _currentUserId: string | null = null;
let _initialized = false;

function readCache(): MarketEvent[] {
    return store.get<MarketEvent[]>(STORAGE_KEY, []);
}

function writeCache(events: MarketEvent[]): void {
    store.set(STORAGE_KEY, events.slice(0, MAX_EVENTS));
}

function mergeById(cloud: MarketEvent[], local: MarketEvent[]): MarketEvent[] {
    const byId = new Map<string, MarketEvent>();
    for (const e of cloud) byId.set(e.id, e);
    for (const e of local) {
        if (!byId.has(e.id)) byId.set(e.id, e);
    }
    return Array.from(byId.values()).sort(
        (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
}

export async function initMarketEvents(userId: string): Promise<void> {
    _currentUserId = userId;
    if (isDemoMode) {
        _initialized = true;
        return;
    }
    try {
        const cloud = await fetchMarketEventsFromCloud(userId);
        const local = readCache();
        const merged = mergeById(cloud, local);
        writeCache(merged);
        _initialized = true;
        if (import.meta.env.DEV) {
            logger.log(`[MarketEvents] Initialized — ${merged.length} events`);
        }
    } catch (e) {
        logger.warn('[MarketEvents] Init failed, using local cache', e);
        _initialized = true;
    }
}

export function teardownMarketEvents(): void {
    _currentUserId = null;
    _initialized = false;
}

export function isMarketEventsInitialized(): boolean {
    return _initialized;
}

export function listMarketEvents(): MarketEvent[] {
    return readCache();
}

/**
 * Append an event: persists to Supabase when signed in (non-demo) and updates the local cache.
 * Offline / failed cloud insert uses a client-generated id and local cache only.
 */
export async function appendMarketEvent(input: {
    kind: string;
    title: string;
    body?: string;
    payload?: Record<string, unknown>;
    occurredAt?: string;
}): Promise<MarketEvent> {
    const occurredAt = input.occurredAt ?? new Date().toISOString();
    const payload = {
        kind: input.kind,
        title: input.title,
        body: input.body,
        payload: input.payload,
        occurredAt,
    };

    if (_currentUserId) {
        const saved = await insertMarketEventToCloud(_currentUserId, payload);
        if (saved) {
            const next = [saved, ...readCache().filter((e) => e.id !== saved.id)].slice(0, MAX_EVENTS);
            writeCache(next);
            return saved;
        }
    }

    const tempId =
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const event: MarketEvent = {
        id: tempId,
        kind: input.kind,
        title: input.title,
        body: input.body ?? null,
        payload: input.payload ?? {},
        occurredAt,
        createdAt: occurredAt,
    };
    writeCache([event, ...readCache()].slice(0, MAX_EVENTS));
    return event;
}

export function clearMarketEventsCache(): void {
    store.remove(STORAGE_KEY);
}
