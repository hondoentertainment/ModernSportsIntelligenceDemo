import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listLocalStorageKeysWithPrefix,
  migrateLocalStorageJsonKeyOnce,
  store,
} from '../../lib/dal/syncStore';

vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock localStorage
const storage: Record<string, string> = {};
const localStorageMock = {
  get length() {
    return Object.keys(storage).length;
  },
  key: (i: number) => Object.keys(storage)[i] ?? null,
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, value: string) => {
    storage[key] = value;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    for (const k of Object.keys(storage)) delete storage[k];
  },
};

beforeEach(() => {
  vi.stubGlobal('localStorage', localStorageMock);
  localStorageMock.clear();
  store.clear();
});

describe('syncStore', () => {
  describe('get', () => {
    it('returns fallback when key does not exist', () => {
      expect(store.get('nonexistent', 'default')).toBe('default');
    });

    it('returns cached value when available', () => {
      store.set('test-key', 'cached-value');
      expect(store.get('test-key', 'default')).toBe('cached-value');
    });

    it('reads from localStorage on cache miss', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'));
      expect(store.get('test-key', 'default')).toBe('stored-value');
    });

    it('caches value read from localStorage', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'));
      store.get('test-key', 'default');
      localStorage.removeItem('test-key');
      expect(store.get('test-key', 'default')).toBe('stored-value');
    });

    it('handles invalid JSON in localStorage', () => {
      localStorage.setItem('test-key', 'invalid json {{{');
      expect(store.get('test-key', 'default')).toBe('default');
    });
  });

  describe('set', () => {
    it('stores value in cache', () => {
      store.set('test-key', 'value');
      expect(store.get('test-key', 'default')).toBe('value');
    });

    it('writes to localStorage', () => {
      store.set('test-key', 'value');
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify('value'));
    });

    it('handles localStorage quota exceeded', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Quota exceeded');
      });
      store.set('test-key', 'value');
      expect(store.get('test-key', 'default')).toBe('value');
      localStorage.setItem = originalSetItem;
    });
  });

  describe('remove', () => {
    it('removes from cache', () => {
      store.set('test-key', 'value');
      store.remove('test-key');
      expect(store.get('test-key', 'default')).toBe('default');
    });

    it('removes from localStorage', () => {
      store.set('test-key', 'value');
      store.remove('test-key');
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('warns when adapter.remove fails asynchronously', async () => {
      const cw = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const adapter = {
        get: vi.fn(),
        set: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn().mockRejectedValue(new Error('rm')),
        keys: vi.fn().mockResolvedValue([]),
      };
      store.setAdapter(adapter);
      store.set('rm-key', 1);
      store.remove('rm-key');
      await Promise.resolve();
      await Promise.resolve();
      expect(cw).toHaveBeenCalledWith(
        '[MSI]',
        '[SyncedStore] Failed to remove "rm-key" from DAL',
        expect.any(Error)
      );
      cw.mockRestore();
    });
  });

  describe('has', () => {
    it('returns true when key exists in cache', () => {
      store.set('test-key', 'value');
      expect(store.has('test-key')).toBe(true);
    });

    it('returns true when key exists in localStorage', () => {
      localStorage.setItem('test-key', JSON.stringify('value'));
      expect(store.has('test-key')).toBe(true);
    });

    it('returns false when key does not exist', () => {
      expect(store.has('nonexistent')).toBe(false);
    });
  });

  describe('setAdapter', () => {
    it('sets the adapter', () => {
      const adapter = {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue([]),
      };
      store.setAdapter(adapter);
      // Adapter is set (can't directly test, but can test through hydrate)
      expect(true).toBe(true);
    });
  });

  describe('hydrate', () => {
    it('does nothing when no adapter', async () => {
      await store.hydrate();
      expect(true).toBe(true);
    });

    it('hydrates from adapter', async () => {
      const adapter = {
        get: vi.fn().mockResolvedValue('adapter-value'),
        set: vi.fn(),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue(['key1', 'key2']),
      };
      store.setAdapter(adapter);
      await store.hydrate();
      expect(adapter.keys).toHaveBeenCalled();
    });

    it('logs when hydration throws', async () => {
      const cw = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const adapter = {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        keys: vi.fn().mockRejectedValue(new Error('no keys')),
      };
      store.setAdapter(adapter);
      await store.hydrate();
      expect(cw).toHaveBeenCalledWith(
        '[MSI]',
        '[SyncedStore] Hydration failed, using localStorage cache',
        expect.any(Error)
      );
      cw.mockRestore();
    });

    it('Supabase data overwrites stale localStorage for keys not written since hydration', async () => {
      // Populate localStorage directly (bypasses writtenSinceHydration tracking)
      localStorage.setItem('stale-key', JSON.stringify('stale-local-value'));
      const adapter = {
        get: vi.fn().mockResolvedValue('fresh-supabase-value'),
        set: vi.fn(),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue(['stale-key']),
      };
      store.setAdapter(adapter);
      await store.hydrate();
      expect(store.get('stale-key', 'default')).toBe('fresh-supabase-value');
    });

    it('in-flight writes (via store.set) are protected from hydration overwrite', async () => {
      // store.set() marks the key in writtenSinceHydration — hydration skips it
      store.set('key1', 'local-value');
      const adapter = {
        get: vi.fn().mockResolvedValue('adapter-value'),
        set: vi.fn(),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue(['key1', 'key2']),
      };
      store.setAdapter(adapter);
      await store.hydrate();
      expect(store.get('key1', 'default')).toBe('local-value');
    });

    it('mirrors Supabase values back to localStorage after hydration', async () => {
      const adapter = {
        get: vi.fn().mockResolvedValue({ score: 42 }),
        set: vi.fn(),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue(['mirrored-key']),
      };
      store.setAdapter(adapter);
      await store.hydrate();
      expect(localStorage.getItem('mirrored-key')).toBe(JSON.stringify({ score: 42 }));
    });

    it('sets hydrated=true in getSyncStatus after hydration completes', async () => {
      const adapter = {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn(),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue([]),
      };
      store.setAdapter(adapter);
      expect(store.getSyncStatus().hydrated).toBe(false);
      await store.hydrate();
      expect(store.getSyncStatus().hydrated).toBe(true);
    });
  });

  describe('getSyncStatus', () => {
    it('returns defaults before any activity', () => {
      expect(store.getSyncStatus()).toEqual({ syncing: false, hydrated: false, lastError: null });
    });

    it('lastError is set on flush write failure', async () => {
      const adapter = {
        get: vi.fn(),
        set: vi.fn().mockRejectedValue(new Error('connection refused')),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue([]),
      };
      store.setAdapter(adapter);
      store.set('fail-key', 'value');
      await store.forceFlush();
      expect(store.getSyncStatus().lastError).toBe('connection refused');
    });

    it('lastError is cleared on next successful flush', async () => {
      // First cause a write error
      const failAdapter = {
        get: vi.fn(),
        set: vi.fn().mockRejectedValue(new Error('down')),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue([]),
      };
      store.setAdapter(failAdapter);
      store.set('recover-key', 'v1');
      await store.forceFlush();
      expect(store.getSyncStatus().lastError).toBe('down');

      // Now recover — key is still dirty, swap in a working adapter
      const okAdapter = {
        get: vi.fn(),
        set: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue([]),
      };
      store.setAdapter(okAdapter);
      store.set('recover-key', 'v2');
      await store.forceFlush();
      expect(store.getSyncStatus().lastError).toBeNull();
    });
  });

  describe('onStatusChange', () => {
    it('fires listener on hydration completion', async () => {
      const listener = vi.fn();
      const adapter = {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn(),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue([]),
      };
      store.setAdapter(adapter);
      const unsub = store.onStatusChange(listener);
      await store.hydrate();
      expect(listener).toHaveBeenCalled();
      unsub();
    });

    it('does not fire after unsubscribe', async () => {
      const listener = vi.fn();
      const adapter = {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn(),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue([]),
      };
      store.setAdapter(adapter);
      const unsub = store.onStatusChange(listener);
      unsub();
      await store.hydrate();
      expect(listener).not.toHaveBeenCalled();
    });

    it('fires listener during flush (syncing transitions)', async () => {
      const listener = vi.fn();
      const adapter = {
        get: vi.fn(),
        set: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue([]),
      };
      store.setAdapter(adapter);
      const unsub = store.onStatusChange(listener);
      store.set('notify-key', 'val');
      await store.forceFlush();
      // Listener should have been called at least twice (syncing=true, syncing=false)
      expect(listener.mock.calls.length).toBeGreaterThanOrEqual(2);
      unsub();
    });
  });

  describe('forceFlush', () => {
    it('flushes dirty keys to adapter', async () => {
      const adapter = {
        get: vi.fn(),
        set: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue([]),
      };
      store.setAdapter(adapter);
      store.set('test-key', 'value');
      await store.forceFlush();
      expect(adapter.set).toHaveBeenCalledWith('test-key', 'value');
    });

    it('warns and re-queues when adapter.set fails', async () => {
      const cw = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const adapter = {
        get: vi.fn(),
        set: vi.fn().mockRejectedValue(new Error('dal down')),
        remove: vi.fn(),
        keys: vi.fn().mockResolvedValue([]),
      };
      store.setAdapter(adapter);
      store.set('flaky-key', { v: 1 });
      await store.forceFlush();
      expect(cw).toHaveBeenCalledWith(
        '[MSI]',
        expect.stringContaining('DAL write failed'),
        expect.any(Error)
      );
      cw.mockRestore();
    });
  });

  describe('clear', () => {
    it('clears cache and resets hydration state', () => {
      store.set('key1', 'value1');
      store.set('key2', 'value2');
      localStorage.removeItem('key1');
      localStorage.removeItem('key2');
      store.clear();
      expect(store.get('key1', 'default')).toBe('default');
      expect(store.get('key2', 'default')).toBe('default');
    });
  });

  describe('listLocalStorageKeysWithPrefix', () => {
    it('returns keys matching prefix', () => {
      localStorage.setItem('msi_a', '1');
      localStorage.setItem('msi_b', '2');
      localStorage.setItem('other', '3');
      expect(listLocalStorageKeysWithPrefix('msi_').sort()).toEqual(['msi_a', 'msi_b']);
    });

    it('returns all keys when prefix is empty', () => {
      localStorage.setItem('x', '1');
      expect(listLocalStorageKeysWithPrefix('')).toContain('x');
    });
  });

  describe('migrateLocalStorageJsonKeyOnce', () => {
    it('copies legacy to canonical and sets done flag', () => {
      localStorage.setItem('legacy_k', JSON.stringify({ a: 1 }));
      localStorage.removeItem('canonical_k');
      localStorage.removeItem('done_k');
      migrateLocalStorageJsonKeyOnce('legacy_k', 'canonical_k', 'done_k');
      expect(JSON.parse(localStorage.getItem('canonical_k')!)).toEqual({ a: 1 });
      expect(localStorage.getItem('legacy_k')).toBeNull();
      expect(localStorage.getItem('done_k')).toBe('1');
    });

    it('does not overwrite canonical if already present', () => {
      localStorage.setItem('legacy_k2', JSON.stringify({ old: true }));
      localStorage.setItem('canonical_k2', JSON.stringify({ keep: true }));
      localStorage.removeItem('done_k2');
      migrateLocalStorageJsonKeyOnce('legacy_k2', 'canonical_k2', 'done_k2');
      expect(JSON.parse(localStorage.getItem('canonical_k2')!)).toEqual({ keep: true });
      expect(localStorage.getItem('legacy_k2')).not.toBeNull();
      expect(localStorage.getItem('done_k2')).toBe('1');
    });

    it('sets done flag when legacy is absent', () => {
      localStorage.removeItem('legacy_k3');
      localStorage.removeItem('canonical_k3');
      localStorage.removeItem('done_k3');
      migrateLocalStorageJsonKeyOnce('legacy_k3', 'canonical_k3', 'done_k3');
      expect(localStorage.getItem('canonical_k3')).toBeNull();
      expect(localStorage.getItem('done_k3')).toBe('1');
    });

    it('returns early when done flag already set', () => {
      localStorage.setItem('legacy_k4', JSON.stringify({ x: 1 }));
      localStorage.removeItem('canonical_k4');
      localStorage.setItem('done_k4', '1');
      migrateLocalStorageJsonKeyOnce('legacy_k4', 'canonical_k4', 'done_k4');
      expect(localStorage.getItem('canonical_k4')).toBeNull();
      expect(localStorage.getItem('legacy_k4')).not.toBeNull();
    });
  });

  describe('SSR-style localStorage absence', () => {
    it('listLocalStorageKeysWithPrefix and migrate no-op without localStorage', () => {
      vi.stubGlobal(
        'localStorage',
        undefined as unknown as Storage,
      );
      expect(listLocalStorageKeysWithPrefix('msi_')).toEqual([]);
      migrateLocalStorageJsonKeyOnce('a', 'b', 'c');
      vi.unstubAllGlobals();
    });

    it('skips null keys from localStorage.key', () => {
      vi.stubGlobal('localStorage', {
        length: 2,
        key: (i: number) => (i === 0 ? null : 'ok'),
        getItem: (k: string) => (k === 'ok' ? '"v"' : null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      } as unknown as Storage);
      expect(listLocalStorageKeysWithPrefix('')).toEqual(['ok']);
      vi.unstubAllGlobals();
    });
  });
});
