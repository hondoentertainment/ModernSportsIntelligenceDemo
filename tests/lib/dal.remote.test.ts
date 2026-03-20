/**
 * Supabase-backed DAL paths + runtime isDemoMode toggle for fallback branches.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CardInventory } from '../../types';

const fetchCards = vi.fn();
const fetchTargets = vi.fn();
const bulkUpsertCards = vi.fn();
const bulkUpsertTargets = vi.fn();

const demoRef = vi.hoisted(() => ({ value: false }));

vi.mock('../../lib/supabase', () => ({
  get isDemoMode() {
    return demoRef.value;
  },
}));

vi.mock('../../lib/supabaseData', () => ({
  fetchCards: (...args: unknown[]) => fetchCards(...args),
  fetchTargets: (...args: unknown[]) => fetchTargets(...args),
  bulkUpsertCards: (...args: unknown[]) => bulkUpsertCards(...args),
  bulkUpsertTargets: (...args: unknown[]) => bulkUpsertTargets(...args),
}));

import { createDataAccessLayer, DAL_KEYS } from '../../lib/dal';

const card: CardInventory = {
  id: 'c1',
  player: 'P',
  year: 2024,
  manufacturer: 'M',
  cardNumber: '1',
  set: 'S',
  sport: 'Baseball',
  league: 'MLB',
  isAutographed: false,
  condition: 'Mint',
  isGraded: false,
  purchasePrice: 10,
  purchaseDate: '2024-01-01',
};

describe('dal remote (SupabaseDAL)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    demoRef.value = false;
    fetchCards.mockResolvedValue([card]);
    fetchTargets.mockResolvedValue([]);
    bulkUpsertCards.mockResolvedValue(true);
    bulkUpsertTargets.mockResolvedValue(true);
    localStorage.setItem(DAL_KEYS.INVENTORY, JSON.stringify([]));
    localStorage.setItem(DAL_KEYS.TARGETS, JSON.stringify([]));
  });

  it('uses fetchCards when userId set and not demo', async () => {
    const dal = createDataAccessLayer('user-1');
    const cards = await dal.getCards();
    expect(fetchCards).toHaveBeenCalledWith('user-1');
    expect(cards).toEqual([card]);
  });

  it('uses fetchTargets when userId set and not demo', async () => {
    const dal = createDataAccessLayer('user-1');
    await dal.getTargets();
    expect(fetchTargets).toHaveBeenCalledWith('user-1');
  });

  it('falls back to local cards when demo toggles on after SupabaseDAL construction', async () => {
    localStorage.setItem(DAL_KEYS.INVENTORY, JSON.stringify([card]));
    const dal = createDataAccessLayer('user-1');
    demoRef.value = true;
    fetchCards.mockClear();
    const cards = await dal.getCards();
    expect(fetchCards).not.toHaveBeenCalled();
    expect(cards).toHaveLength(1);
  });

  it('falls back to local targets when demo toggles on', async () => {
    const t = {
      id: 't1',
      player: 'P',
      cardDescription: 'D',
      priority: 'High' as const,
      targetPrice: 1,
      sport: 'Baseball',
      league: 'MLB',
      status: 'active' as const,
      createdAt: '2024-01-01',
    };
    localStorage.setItem(DAL_KEYS.TARGETS, JSON.stringify([t]));
    const dal = createDataAccessLayer('user-1');
    demoRef.value = true;
    const targets = await dal.getTargets();
    expect(targets).toHaveLength(1);
  });

  it('bulkUpsertCards when not demo', async () => {
    const dal = createDataAccessLayer('user-1');
    await dal.setCards([card]);
    expect(bulkUpsertCards).toHaveBeenCalled();
  });

  it('skips bulk upsert when demo mode on', async () => {
    const dal = createDataAccessLayer('user-1');
    demoRef.value = true;
    await dal.setCards([card]);
    expect(bulkUpsertCards).not.toHaveBeenCalled();
  });

  it('bulkUpsertTargets when not demo', async () => {
    const dal = createDataAccessLayer('user-1');
    const t = {
      id: 't1',
      player: 'P',
      cardDescription: 'D',
      priority: 'High' as const,
      targetPrice: 1,
      sport: 'Baseball',
      league: 'MLB',
      status: 'active' as const,
      createdAt: '2024-01-01',
    };
    await dal.setTargets([t]);
    expect(bulkUpsertTargets).toHaveBeenCalled();
  });

  it('logs when bulkUpsertCards fails', async () => {
    const { logger } = await import('../../lib/logger');
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    bulkUpsertCards.mockResolvedValue(false);
    const dal = createDataAccessLayer('user-1');
    await dal.setCards([card]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('logs when bulkUpsertTargets fails', async () => {
    const { logger } = await import('../../lib/logger');
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    bulkUpsertTargets.mockResolvedValue(false);
    const dal = createDataAccessLayer('user-1');
    await dal.setTargets([
      {
        id: 't1',
        player: 'P',
        cardDescription: 'D',
        priority: 'High',
        targetPrice: 1,
        sport: 'Baseball',
        league: 'MLB',
        status: 'active',
        createdAt: '2024-01-01',
      },
    ]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('SupabaseDAL getJson/setJson/remove round-trip via local helpers', async () => {
    const dal = createDataAccessLayer('user-1');
    await dal.setJson('msi_custom_test_key', { n: 42 });
    expect(await dal.getJson<{ n: number }>('msi_custom_test_key')).toEqual({ n: 42 });
    await dal.remove('msi_custom_test_key');
    expect(await dal.getJson('msi_custom_test_key')).toBeNull();
  });
});
