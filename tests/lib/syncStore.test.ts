import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage before importing SyncedStore
const lsStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => lsStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { lsStore[key] = value; }),
  removeItem: vi.fn((key: string) => { delete lsStore[key]; }),
  key: vi.fn((i: number) => Object.keys(lsStore)[i] ?? null),
  get length() { return Object.keys(lsStore).length; },
  clear: vi.fn(() => { for (const k of Object.keys(lsStore)) delete lsStore[k]; }),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// Import after mock is in place
import { store } from '../../lib/dal/syncStore';

describe('SyncedStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    store.clear();
  });

  it('should return fallback for missing keys', () => {
    expect(store.get<number[]>('missing', [])).toEqual([]);
    expect(store.get<string>('missing', 'default')).toBe('default');
  });

  it('should set and get values synchronously', () => {
    store.set('items', [1, 2, 3]);
    expect(store.get<number[]>('items', [])).toEqual([1, 2, 3]);
  });

  it('should write through to localStorage on set', () => {
    store.set('key', { foo: 'bar' });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('key', JSON.stringify({ foo: 'bar' }));
  });

  it('should read from localStorage on cache miss', () => {
    lsStore['existing'] = JSON.stringify({ data: 42 });
    expect(store.get<{ data: number }>('existing', { data: 0 })).toEqual({ data: 42 });
  });

  it('should remove values', () => {
    store.set('temp', 'value');
    store.remove('temp');
    expect(store.get<string>('temp', 'gone')).toBe('gone');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('temp');
  });

  it('should check existence with has', () => {
    expect(store.has('nope')).toBe(false);
    store.set('yep', true);
    expect(store.has('yep')).toBe(true);
  });

  it('should handle invalid JSON in localStorage gracefully', () => {
    lsStore['bad_json'] = '{broken';
    expect(store.get<string>('bad_json', 'fallback')).toBe('fallback');
  });

  it('should handle localStorage quota exceeded gracefully', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    // Should not throw — still writes to cache
    store.set('big', { data: 'lots' });
    expect(store.get<{ data: string }>('big', { data: '' })).toEqual({ data: 'lots' });
  });

  it('should clear all cached data', () => {
    store.set('a', 1);
    store.set('b', 2);
    // Clear both store cache and localStorage mock
    store.clear();
    localStorageMock.clear();
    expect(store.get<number>('a', 0)).toBe(0);
    expect(store.get<number>('b', 0)).toBe(0);
  });
});
