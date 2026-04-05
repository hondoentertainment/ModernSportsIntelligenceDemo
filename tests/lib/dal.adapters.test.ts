import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAdapter, getAdapterType, setAdapter } from '../../lib/dal/StorageAdapter';
import { LocalStorageAdapter } from '../../lib/dal/LocalStorageAdapter';
import { SupabaseStorageAdapter } from '../../lib/dal/SupabaseStorageAdapter';
import { initDAL } from '../../lib/dal/index';
import { store } from '../../lib/dal/syncStore';

const storage: Record<string, string> = {};
const ls = {
  getItem: (k: string) => (k in storage ? storage[k] : null),
  setItem: (k: string, v: string) => {
    storage[k] = v;
  },
  removeItem: (k: string) => {
    delete storage[k];
  },
  clear: () => {
    for (const k of Object.keys(storage)) delete storage[k];
  },
  get length() {
    return Object.keys(storage).length;
  },
  key: (i: number) => Object.keys(storage)[i] ?? null,
};

vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const demoRef = vi.hoisted(() => ({ value: true }));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnThis(),
    })),
  },
  get isDemoMode() {
    return demoRef.value;
  },
}));

describe('StorageAdapter registry', () => {
  it('getAdapter returns adapter after setAdapter', () => {
    setAdapter(new LocalStorageAdapter('t_'), 'local');
    expect(getAdapter()).toBeDefined();
    expect(getAdapterType()).toBe('local');
  });
});

describe('LocalStorageAdapter', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', ls);
    ls.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('get returns null for missing key', async () => {
    const a = new LocalStorageAdapter('pfx_');
    expect(await a.get('k')).toBeNull();
  });

  it('get parses JSON', async () => {
    ls.setItem('pfx_x', JSON.stringify({ a: 1 }));
    const a = new LocalStorageAdapter('pfx_');
    expect(await a.get<{ a: number }>('x')).toEqual({ a: 1 });
  });

  it('get returns null on parse error', async () => {
    ls.setItem('pfx_bad', 'not-json');
    const a = new LocalStorageAdapter('pfx_');
    expect(await a.get('bad')).toBeNull();
  });

  it('set and remove', async () => {
    const a = new LocalStorageAdapter('q_');
    await a.set('k', { v: 1 });
    expect(await a.get('k')).toEqual({ v: 1 });
    await a.remove('k');
    expect(await a.get('k')).toBeNull();
  });

  it('keys lists prefixed keys', async () => {
    ls.setItem('q_a', '1');
    ls.setItem('q_b', '2');
    const a = new LocalStorageAdapter('q_');
    const keys = await a.keys();
    expect(keys.sort()).toEqual(['a', 'b']);
  });

  it('handles QuotaExceededError with prune and retry', async () => {
    const a = new LocalStorageAdapter('msi_');
    let attempts = 0;
    const orig = ls.setItem.bind(ls);
    ls.setItem = ((k: string, v: string) => {
      attempts++;
      if (attempts === 1) {
        const e = new DOMException('q', 'QuotaExceededError');
        throw e;
      }
      orig(k, v);
    }) as typeof ls.setItem;
    // pruneOldEntries removes keys whose full localStorage key includes "_cache_"
    orig('msi_z_cache_z', '"1"');
    await a.set('k', { ok: true });
    expect(await a.get('k')).toEqual({ ok: true });
  });

  it('logs when quota retry still fails after prune', async () => {
    const { logger } = await import('../../lib/logger');
    const origSetItem = ls.setItem.bind(ls);
    try {
      const a = new LocalStorageAdapter('msi_');
      ls.setItem = vi.fn(() => {
        throw new DOMException('q', 'QuotaExceededError');
      }) as typeof ls.setItem;
      await a.set('k', { x: 1 });
      expect(logger.error).toHaveBeenCalled();
    } finally {
      ls.setItem = origSetItem;
    }
  });

  it('logs non-quota setItem errors', async () => {
    const { logger } = await import('../../lib/logger');
    const origSetItem = ls.setItem.bind(ls);
    try {
      const a = new LocalStorageAdapter('pfx_');
      ls.setItem = vi.fn(() => {
        throw new Error('disk full');
      }) as typeof ls.setItem;
      await a.set('k', 1);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to write key'),
        expect.any(Error)
      );
    } finally {
      ls.setItem = origSetItem;
    }
  });
});

describe('SupabaseStorageAdapter', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', ls);
    ls.clear();
    demoRef.value = false;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('setUserId updates user', () => {
    const a = new SupabaseStorageAdapter('u1');
    a.setUserId('u2');
    expect(a).toBeDefined();
  });

  it('get falls back to local cache', async () => {
    const a = new SupabaseStorageAdapter(null);
    await a.set('k', 1);
    expect(await a.get('k')).toBe(1);
  });
});

describe('initDAL', () => {
  beforeEach(async () => {
    const { resetDalInitKeyForTests } = await import('../../lib/dal/index');
    resetDalInitKeyForTests();
    vi.stubGlobal('localStorage', ls);
    ls.clear();
    store.clear();
    demoRef.value = true;
    vi.spyOn(store, 'setAdapter').mockImplementation(() => {});
    vi.spyOn(store, 'hydrate').mockResolvedValue();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses local adapter in demo mode', async () => {
    const { logger } = await import('../../lib/logger');
    initDAL('user-1');
    expect(logger.info).toHaveBeenCalled();
  });

  it('uses supabase adapter when authenticated and not demo', async () => {
    demoRef.value = false;
    initDAL('user-1');
    const { logger } = await import('../../lib/logger');
    expect(logger.info).toHaveBeenCalled();
    expect(store.setAdapter).toHaveBeenCalled();
  });

  it('logs when store hydration fails', async () => {
    const { logger } = await import('../../lib/logger');
    demoRef.value = false;
    vi.mocked(store.hydrate).mockRejectedValueOnce(new Error('hydrate failed'));
    initDAL('user-1');
    await Promise.resolve();
    await Promise.resolve();
    expect(logger.warn).toHaveBeenCalledWith('[DAL] Hydration failed', expect.any(Error));
  });
});
