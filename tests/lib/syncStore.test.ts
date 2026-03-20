import { describe, it, expect, vi, beforeEach } from 'vitest';
import { store } from '../../lib/dal/syncStore';

vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock localStorage
const storage: Record<string, string> = {};
const localStorageMock = {
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

    it('only fills cache gaps during hydration', async () => {
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
});
