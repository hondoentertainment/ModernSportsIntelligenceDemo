import { vi } from 'vitest';
import { CardInventory } from '../types';

/**
 * Create a mock CardInventory with sensible defaults.
 * Pass overrides to customize any field.
 */
export function makeCard(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: '1',
    player: 'Test Player',
    year: 2023,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Chrome',
    sport: 'Baseball',
    league: 'MLB',
    status: 'active',
    purchasePrice: 100,
    currentValue: 100,
    purchaseDate: '2023-06-01',
    gradingFees: 0,
    shippingFees: 0,
    isGraded: false,
    isAutographed: false,
    condition: 'Near Mint',
    ...overrides,
  } as CardInventory;
}

/**
 * Set up a localStorage mock using vi.stubGlobal for proper cleanup.
 * Call this in a beforeEach or at module scope; Vitest auto-restores after each test file.
 */
export function setupLocalStorageMock() {
  const store: Record<string, string> = {};
  const mock = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
  vi.stubGlobal('localStorage', mock);
  return mock;
}
