// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initMarketEvents,
  teardownMarketEvents,
  listMarketEvents,
  appendMarketEvent,
  clearMarketEventsCache,
  isMarketEventsInitialized,
} from '../../lib/analytics/marketEventsService';
import {
  fetchMarketEventsFromCloud,
  insertMarketEventToCloud,
} from '../../lib/supabaseData';

vi.mock('../../lib/supabaseData', () => ({
  fetchMarketEventsFromCloud: vi.fn(),
  insertMarketEventToCloud: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  isDemoMode: false,
  supabase: {},
}));

vi.mock('../../lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    log: vi.fn(),
  },
}));

describe('marketEventsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    teardownMarketEvents();
    clearMarketEventsCache();
    vi.mocked(fetchMarketEventsFromCloud).mockResolvedValue([]);
  });

  it('hydrates from cloud on init', async () => {
    vi.mocked(fetchMarketEventsFromCloud).mockResolvedValue([
      {
        id: 'e1',
        kind: 'trade',
        title: 'Call-up',
        body: null,
        payload: {},
        occurredAt: '2026-01-01T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
    await initMarketEvents('user-1');
    expect(isMarketEventsInitialized()).toBe(true);
    expect(listMarketEvents()).toHaveLength(1);
    expect(listMarketEvents()[0].title).toBe('Call-up');
  });

  it('appendMarketEvent persists via cloud and updates cache', async () => {
    vi.mocked(insertMarketEventToCloud).mockResolvedValue({
      id: 'srv-1',
      kind: 'note',
      title: 'T1',
      body: null,
      payload: { x: 1 },
      occurredAt: '2026-02-01T12:00:00.000Z',
      createdAt: '2026-02-01T12:00:00.000Z',
    });
    await initMarketEvents('user-2');
    const ev = await appendMarketEvent({ kind: 'note', title: 'T1', payload: { x: 1 } });
    expect(ev.id).toBe('srv-1');
    expect(insertMarketEventToCloud).toHaveBeenCalledWith(
      'user-2',
      expect.objectContaining({ kind: 'note', title: 'T1' })
    );
    expect(listMarketEvents()[0].id).toBe('srv-1');
  });

  it('uses local temp id when cloud insert fails', async () => {
    vi.mocked(insertMarketEventToCloud).mockResolvedValue(null);
    await initMarketEvents('user-3');
    const ev = await appendMarketEvent({ kind: 'note', title: 'Local' });
    expect(ev.id).toBeDefined();
    expect(ev.title).toBe('Local');
    expect(listMarketEvents()).toHaveLength(1);
  });
});
