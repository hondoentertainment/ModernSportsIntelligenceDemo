import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageAdapter } from '../../lib/dal/LocalStorageAdapter';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  get length() { return Object.keys(store).length; },
  clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k]; }),
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    adapter = new LocalStorageAdapter('test_');
  });

  it('should get and set values', async () => {
    await adapter.set('foo', { bar: 42 });
    const result = await adapter.get<{ bar: number }>('foo');
    expect(result).toEqual({ bar: 42 });
  });

  it('should return null for missing keys', async () => {
    const result = await adapter.get('nonexistent');
    expect(result).toBeNull();
  });

  it('should remove values', async () => {
    await adapter.set('temp', 'value');
    await adapter.remove('temp');
    const result = await adapter.get('temp');
    expect(result).toBeNull();
  });

  it('should list keys with prefix', async () => {
    await adapter.set('alpha', 1);
    await adapter.set('beta', 2);
    const keys = await adapter.keys();
    expect(keys).toContain('alpha');
    expect(keys).toContain('beta');
  });

  it('should handle JSON parse errors gracefully', async () => {
    store['test_broken'] = 'not-valid-json{{{';
    const result = await adapter.get('broken');
    expect(result).toBeNull();
  });

  it('should handle quota exceeded with retry', async () => {
    const quotaError = new DOMException('quota', 'QuotaExceededError');
    let callCount = 0;
    localStorageMock.setItem.mockImplementation((_key: string, _value: string) => {
      callCount++;
      if (callCount === 1) throw quotaError;
      store[_key] = _value;
    });

    await adapter.set('big', { data: 'lots' });
    // Should have retried after pruning
    expect(callCount).toBeGreaterThan(1);
  });
});
