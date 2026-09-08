/**
 * Priority 2.2 leftover — product defaults for daily portfolio+watchlist sync.
 * Remembered via MSI store. No Web Push.
 */
import { store } from '../dal/syncStore';
import {
  getSyncConfig,
  setSyncConfig,
  type SyncSchedulerConfig,
} from './syncScheduler';

export const SYNC_PRODUCT_DEFAULTS_KEY = 'msi_sync_product_defaults_v1';

export const SYNC_PRODUCT_DEFAULTS_DISCLOSURE =
  'Daily on-device portfolio + watchlist refresh. Remembers your opt-in locally. Quiet hours still suppress haptics and browser notifications. Not Web Push or a server feed.';

export type SyncProductProfile = 'signed-in' | 'demo';

export interface SyncProductDefaults {
  optedIn: boolean;
  profile: SyncProductProfile;
  appliedAt: string;
}

export const SIGNED_IN_SYNC_DEFAULTS: SyncSchedulerConfig = {
  interval: 'daily',
  notifyOnComplete: true,
  notifyOnPriceChange: 10,
  syncOnAppStart: true,
};

export const DEMO_SYNC_DEFAULTS: SyncSchedulerConfig = {
  interval: 'daily',
  notifyOnComplete: true,
  notifyOnPriceChange: 10,
  syncOnAppStart: true,
};

function asDefaults(raw: unknown): SyncProductDefaults | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Partial<SyncProductDefaults>;
  if (typeof o.optedIn !== 'boolean') return null;
  return {
    optedIn: o.optedIn,
    profile: o.profile === 'signed-in' ? 'signed-in' : 'demo',
    appliedAt: typeof o.appliedAt === 'string' ? o.appliedAt : new Date().toISOString(),
  };
}

export function getSyncProductDefaults(): SyncProductDefaults | null {
  return asDefaults(store.get<unknown>(SYNC_PRODUCT_DEFAULTS_KEY, null));
}

export function setDailySyncOptIn(optedIn: boolean, profile: SyncProductProfile): SyncProductDefaults {
  const next: SyncProductDefaults = {
    optedIn,
    profile,
    appliedAt: new Date().toISOString(),
  };
  store.set(SYNC_PRODUCT_DEFAULTS_KEY, next);
  if (optedIn) {
    const base = profile === 'signed-in' ? SIGNED_IN_SYNC_DEFAULTS : DEMO_SYNC_DEFAULTS;
    setSyncConfig(base);
  } else {
    setSyncConfig({ interval: 'manual', syncOnAppStart: false });
  }
  return next;
}

/**
 * First visit: apply daily signed-in / demo defaults and remember opt-in.
 * Later visits: do not overwrite a remembered preference or a user-set interval.
 */
export function applyProductSyncDefaults(ctx: { signedIn: boolean; isDemo: boolean }): SyncSchedulerConfig {
  const profile: SyncProductProfile = ctx.signedIn && !ctx.isDemo ? 'signed-in' : 'demo';
  const remembered = getSyncProductDefaults();
  if (remembered) {
    return getSyncConfig();
  }
  setDailySyncOptIn(true, profile);
  return getSyncConfig();
}

export function resolveSyncProductProfile(ctx: { signedIn: boolean; isDemo: boolean }): SyncProductProfile {
  return ctx.signedIn && !ctx.isDemo ? 'signed-in' : 'demo';
}
