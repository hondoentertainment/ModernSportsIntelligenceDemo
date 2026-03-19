import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDataAccessLayer, DAL_KEYS } from '../../lib/dal';
import type { CardInventory, TargetWatchlist } from '../../types';

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
  get length() {
    return Object.keys(storage).length;
  },
  key: (i: number) => Object.keys(storage)[i] ?? null,
};

beforeEach(() => {
  vi.stubGlobal('localStorage', localStorageMock);
  localStorageMock.clear();
  storage[DAL_KEYS.INVENTORY] = JSON.stringify([]);
  storage[DAL_KEYS.TARGETS] = JSON.stringify([]);
});

describe('createDataAccessLayer', () => {
  it('returns LocalStorageDAL when userId is null', async () => {
    const dal = createDataAccessLayer(null);
    const cards = await dal.getCards();
    expect(cards).toEqual([]);
    const card: CardInventory = {
      id: 'c1',
      player: 'Test Player',
      year: 2024,
      manufacturer: 'Test',
      cardNumber: '1',
      set: 'Test Set',
      sport: 'Baseball',
      league: 'MLB',
      isAutographed: false,
      condition: 'Mint',
      isGraded: false,
      purchasePrice: 100,
      purchaseDate: '2024-01-01',
    };
    await dal.setCards([card]);
    const loaded = await dal.getCards();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].player).toBe('Test Player');
  });

  it('getJson and setJson work with LocalStorageDAL', async () => {
    const dal = createDataAccessLayer(null);
    await dal.setJson('custom_key', { foo: 'bar' });
    const val = await dal.getJson<{ foo: string }>('custom_key');
    expect(val).toEqual({ foo: 'bar' });
  });

  it('remove works with LocalStorageDAL', async () => {
    const dal = createDataAccessLayer(null);
    await dal.setJson('temp', { x: 1 });
    expect(await dal.getJson('temp')).toEqual({ x: 1 });
    await dal.remove('temp');
    expect(await dal.getJson('temp')).toBeNull();
  });

  it('getTargets and setTargets work', async () => {
    const dal = createDataAccessLayer(null);
    const target: TargetWatchlist = {
      id: 't1',
      player: 'Player',
      cardDescription: 'Card',
      priority: 'High',
      targetPrice: 50,
      sport: 'Baseball',
      league: 'MLB',
      status: 'active',
      createdAt: '2024-01-01',
    };
    await dal.setTargets([target]);
    const loaded = await dal.getTargets();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].player).toBe('Player');
  });
});
