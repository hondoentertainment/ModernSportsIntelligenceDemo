import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  recordPriceSnapshot,
  recordBatchSnapshots,
  getCardHistory,
  getSparklineData,
  getPriceTrend,
  getPortfolioNAVHistory,
  clearPriceHistory,
  initPriceHistory,
  teardownPriceHistory,
  isPriceHistoryInitialized,
} from '../../lib/analytics/priceHistory';
import {
  fetchAllPriceHistory,
  insertPriceSnapshot,
  insertBatchPriceSnapshots,
  prunePriceHistory,
} from '../../lib/supabaseData';

vi.mock('../../lib/supabaseData', () => ({
  fetchAllPriceHistory: vi.fn(),
  insertPriceSnapshot: vi.fn().mockResolvedValue(true),
  insertBatchPriceSnapshots: vi.fn().mockResolvedValue(true),
  prunePriceHistory: vi.fn().mockResolvedValue(0),
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

import { logger } from '../../lib/logger';

describe('priceHistory', () => {
  beforeEach(() => {
    clearPriceHistory();
    vi.clearAllMocks();
  });

  describe('recordPriceSnapshot', () => {
    it('records a price snapshot', () => {
      recordPriceSnapshot('card-1', 100);
      const history = getCardHistory('card-1');
      expect(history).toHaveLength(1);
      expect(history[0].value).toBe(100);
      expect(history[0].timestamp).toBeDefined();
    });

    it('rounds values to 2 decimal places', () => {
      recordPriceSnapshot('card-1', 100.123456);
      const history = getCardHistory('card-1');
      expect(history[0].value).toBe(100.12);
    });

    it('includes provenance metadata', () => {
      recordPriceSnapshot('card-1', 100, {
        source: 'ebay',
        valuationMethod: 'sold-listings',
        confidence: 0.9,
      });
      const history = getCardHistory('card-1');
      expect(history[0].source).toBe('ebay');
      expect(history[0].valuationMethod).toBe('sold-listings');
      expect(history[0].confidence).toBe(0.9);
    });

    it('limits snapshots to MAX_SNAPSHOTS', () => {
      for (let i = 0; i < 35; i++) {
        recordPriceSnapshot('card-1', 100 + i);
      }
      const history = getCardHistory('card-1');
      expect(history.length).toBeLessThanOrEqual(30);
    });

    it('does not record invalid values', () => {
      recordPriceSnapshot('card-1', null as any);
      recordPriceSnapshot('card-1', undefined as any);
      recordPriceSnapshot('', 100);
      const history = getCardHistory('card-1');
      expect(history).toHaveLength(0);
    });
  });

  describe('recordBatchSnapshots', () => {
    it('records multiple snapshots at once', () => {
      recordBatchSnapshots([
        { id: 'card-1', value: 100 },
        { id: 'card-2', value: 200 },
      ]);
      expect(getCardHistory('card-1')).toHaveLength(1);
      expect(getCardHistory('card-2')).toHaveLength(1);
    });

    it('uses provided timestamps when available', () => {
      const timestamp = '2024-01-01T00:00:00.000Z';
      recordBatchSnapshots([
        { id: 'card-1', value: 100, timestamp },
      ]);
      const history = getCardHistory('card-1');
      expect(history[0].timestamp).toBe(timestamp);
    });

    it('skips invalid entries in batch', () => {
      recordBatchSnapshots([
        { id: 'card-1', value: 100 },
        { id: '', value: 200 },
        { id: 'card-2', value: null as any },
      ]);
      expect(getCardHistory('card-1')).toHaveLength(1);
      expect(getCardHistory('card-2')).toHaveLength(0);
    });
  });

  describe('getCardHistory', () => {
    it('returns empty array for non-existent card', () => {
      expect(getCardHistory('nonexistent')).toEqual([]);
    });

    it('returns history in reverse chronological order', () => {
      recordPriceSnapshot('card-1', 100);
      recordPriceSnapshot('card-1', 110);
      recordPriceSnapshot('card-1', 120);
      const history = getCardHistory('card-1');
      expect(history[0].value).toBe(120);
      expect(history[1].value).toBe(110);
      expect(history[2].value).toBe(100);
    });
  });

  describe('getSparklineData', () => {
    it('returns values in chronological order', () => {
      recordPriceSnapshot('card-1', 100);
      recordPriceSnapshot('card-1', 110);
      recordPriceSnapshot('card-1', 120);
      const data = getSparklineData('card-1');
      expect(data).toEqual([100, 110, 120]);
    });

    it('limits to specified number of points', () => {
      for (let i = 0; i < 15; i++) {
        recordPriceSnapshot('card-1', 100 + i);
      }
      const data = getSparklineData('card-1', 5);
      expect(data).toHaveLength(5);
    });

    it('returns empty array for non-existent card', () => {
      expect(getSparklineData('nonexistent')).toEqual([]);
    });
  });

  describe('getPriceTrend', () => {
    it('returns stable for insufficient data', () => {
      recordPriceSnapshot('card-1', 100);
      expect(getPriceTrend('card-1')).toBe('stable');
    });

    it('returns up for positive trend', () => {
      recordPriceSnapshot('card-1', 100);
      recordPriceSnapshot('card-1', 105);
      expect(getPriceTrend('card-1')).toBe('up');
    });

    it('returns down for negative trend', () => {
      recordPriceSnapshot('card-1', 100);
      recordPriceSnapshot('card-1', 95);
      expect(getPriceTrend('card-1')).toBe('down');
    });

    it('returns stable for small changes', () => {
      recordPriceSnapshot('card-1', 100);
      recordPriceSnapshot('card-1', 101);
      expect(getPriceTrend('card-1')).toBe('stable');
    });
  });

  describe('getPortfolioNAVHistory', () => {
    it('returns empty array for no history', () => {
      expect(getPortfolioNAVHistory()).toEqual([]);
    });

    it('aggregates values across multiple cards', () => {
      recordPriceSnapshot('card-1', 100);
      recordPriceSnapshot('card-2', 200);
      const nav = getPortfolioNAVHistory();
      expect(nav.length).toBeGreaterThan(0);
      expect(nav[0].val).toBeGreaterThanOrEqual(300);
    });

    it('limits to specified number of points', () => {
      recordPriceSnapshot('card-1', 100);
      const nav = getPortfolioNAVHistory(5);
      expect(nav.length).toBeLessThanOrEqual(5);
    });
  });

  describe('initPriceHistory', () => {
    it('initializes successfully', async () => {
      vi.mocked(fetchAllPriceHistory).mockResolvedValue({});
      await initPriceHistory('user-123');
      expect(isPriceHistoryInitialized()).toBe(true);
    });

    it('fetches and merges cloud history', async () => {
      const cloudHistory = {
        'card-1': [
          { timestamp: '2024-01-01T00:00:00.000Z', value: 100 },
        ],
      };
      vi.mocked(fetchAllPriceHistory).mockResolvedValue(cloudHistory);
      await initPriceHistory('user-123');
      expect(fetchAllPriceHistory).toHaveBeenCalledWith('user-123');
      const history = getCardHistory('card-1');
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('teardownPriceHistory', () => {
    it('resets initialization state', async () => {
      await initPriceHistory('user-123');
      expect(isPriceHistoryInitialized()).toBe(true);
      await teardownPriceHistory();
      expect(isPriceHistoryInitialized()).toBe(false);
    });
  });

  describe('clearPriceHistory', () => {
    it('clears all history', () => {
      recordPriceSnapshot('card-1', 100);
      recordPriceSnapshot('card-2', 200);
      clearPriceHistory();
      expect(getCardHistory('card-1')).toEqual([]);
      expect(getCardHistory('card-2')).toEqual([]);
    });
  });

  describe('cloud merge and error paths', () => {
    async function flushMicrotasks(): Promise<void> {
      for (let i = 0; i < 10; i++) await Promise.resolve();
    }

    it('merges local snapshots that are not present in cloud history', async () => {
      clearPriceHistory();
      recordPriceSnapshot('merge-card', 200);
      vi.mocked(fetchAllPriceHistory).mockResolvedValue({
        'merge-card': [{ timestamp: '2019-01-01T00:00:00.000Z', value: 1 }],
      });
      await initPriceHistory('user-merge');
      const h = getCardHistory('merge-card');
      expect(h.length).toBeGreaterThanOrEqual(2);
    });

    it('warns when initialization fails', async () => {
      vi.mocked(fetchAllPriceHistory).mockRejectedValueOnce(new Error('offline'));
      await initPriceHistory('user-off');
      expect(logger.warn).toHaveBeenCalledWith(
        '[PriceHistory] Initialization failed, falling back to local cache',
        expect.any(Error)
      );
    });

    it('warns when batch cloud persist fails', async () => {
      vi.mocked(insertBatchPriceSnapshots).mockRejectedValueOnce(new Error('upsert'));
      clearPriceHistory();
      await initPriceHistory('user-persist');
      recordBatchSnapshots([{ id: 'persist-1', value: 42 }]);
      await flushMicrotasks();
      expect(logger.warn).toHaveBeenCalledWith(
        '[PriceHistory] Cloud batch persist failed:',
        expect.any(Error)
      );
    });

    it('warns when single cloud persist fails', async () => {
      vi.mocked(insertPriceSnapshot).mockRejectedValueOnce(new Error('one'));
      clearPriceHistory();
      await initPriceHistory('user-one');
      recordPriceSnapshot('single-1', 9);
      await flushMicrotasks();
      expect(logger.warn).toHaveBeenCalledWith(
        '[PriceHistory] Cloud persist failed for',
        'single-1',
        expect.any(Error)
      );
    });

    it('invokes prune on teardown when user was active', async () => {
      vi.mocked(prunePriceHistory).mockClear();
      await initPriceHistory('user-prune');
      await teardownPriceHistory();
      expect(prunePriceHistory).toHaveBeenCalled();
    });
  });
});
