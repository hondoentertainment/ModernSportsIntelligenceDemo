import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import { getSyncConfig } from '../../lib/utils/syncScheduler';
import {
  DEMO_SYNC_DEFAULTS,
  SIGNED_IN_SYNC_DEFAULTS,
  SYNC_PRODUCT_DEFAULTS_DISCLOSURE,
  SYNC_PRODUCT_DEFAULTS_KEY,
  applyProductSyncDefaults,
  getSyncProductDefaults,
  resolveSyncProductProfile,
  setDailySyncOptIn,
} from '../../lib/utils/syncProductDefaults';

describe('syncProductDefaults', () => {
  beforeEach(() => {
    localStorage.clear();
    store.clear();
  });

  it('applies daily signed-in defaults once and remembers opt-in', () => {
    expect(resolveSyncProductProfile({ signedIn: true, isDemo: false })).toBe('signed-in');
    expect(resolveSyncProductProfile({ signedIn: true, isDemo: true })).toBe('demo');
    const first = applyProductSyncDefaults({ signedIn: true, isDemo: false });
    expect(first.interval).toBe('daily');
    expect(first.syncOnAppStart).toBe(true);
    expect(getSyncProductDefaults()?.optedIn).toBe(true);
    expect(getSyncProductDefaults()?.profile).toBe('signed-in');
    expect(SIGNED_IN_SYNC_DEFAULTS.interval).toBe('daily');
    expect(DEMO_SYNC_DEFAULTS.interval).toBe('daily');
    expect(SYNC_PRODUCT_DEFAULTS_DISCLOSURE).toMatch(/not web push/i);

    setDailySyncOptIn(false, 'signed-in');
    expect(getSyncConfig().interval).toBe('manual');
    expect(getSyncConfig().syncOnAppStart).toBe(false);

    const later = applyProductSyncDefaults({ signedIn: true, isDemo: false });
    expect(later.interval).toBe('manual');
    expect(store.get(SYNC_PRODUCT_DEFAULTS_KEY, null)?.optedIn).toBe(false);
  });

  it('applies demo defaults and ignores junk stored prefs', () => {
    store.set(SYNC_PRODUCT_DEFAULTS_KEY, { junk: true });
    const config = applyProductSyncDefaults({ signedIn: false, isDemo: true });
    expect(config.interval).toBe('daily');
    expect(getSyncProductDefaults()?.profile).toBe('demo');
    setDailySyncOptIn(true, 'demo');
    expect(getSyncConfig().notifyOnComplete).toBe(true);
  });
});
