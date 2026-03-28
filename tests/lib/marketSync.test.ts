import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncPortfolio, syncWatchlistPrices, getSyncMeta, isSyncStale } from '../../lib/utils/marketSync';
import { getEbayCardPrice, getWatchlistItemPrice } from '../../lib/utils/gemini';
import { recordBatchSnapshots } from '../../lib/analytics/priceHistory';
import { showToast } from '../../lib/utils/toast';
import { recordMetric, incrementCounter } from '../../lib/utils/telemetryService';
import { store } from '../../lib/dal/syncStore';
import type { CardInventory, TargetWatchlist } from '../../types';

vi.mock('../../lib/utils/gemini', () => ({
  getEbayCardPrice: vi.fn(),
  getWatchlistItemPrice: vi.fn(),
}));

vi.mock('../../lib/analytics/priceHistory', () => ({
  recordBatchSnapshots: vi.fn(),
}));

vi.mock('../../lib/utils/toast', () => ({
  showToast: vi.fn(),
}));

vi.mock('../../lib/utils/telemetryService', () => ({
  recordMetric: vi.fn(),
  incrementCounter: vi.fn(),
}));

vi.mock('../../lib/dal/syncStore', () => ({
  store: {
    set: vi.fn(),
    get: vi.fn(),
  },
}));

describe('marketSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('syncPortfolio', () => {
    it('syncs all cards and updates values', async () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Test Player',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          purchaseDate: '2024-01-01',
        },
      ];

      vi.mocked(getEbayCardPrice).mockResolvedValue({
        estimatedValue: 150,
        low: 140,
        high: 160,
        avg: 150,
        confidence: 0.9,
        salesCount: 10,
        lastUpdated: '2024-01-02',
        rationale: 'Test rationale',
      });

      const progressCallback = vi.fn();
      const result = await syncPortfolio(inventory, progressCallback);

      expect(result.inventory[0].currentValue).toBe(150);
      expect(result.inventory[0].lastValuationDate).toBe('2024-01-02');
      expect(result.result.success).toBe(true);
      expect(progressCallback).toHaveBeenCalled();
    });

    it('handles sync errors gracefully', async () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Test Player',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          purchaseDate: '2024-01-01',
        },
      ];

      vi.mocked(getEbayCardPrice).mockResolvedValue(null);

      const result = await syncPortfolio(inventory);

      expect(result.result.failedCount).toBeGreaterThan(0);
      expect(showToast).toHaveBeenCalled();
    });

    it('returns original card when getEbayCardPrice throws', async () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-throw',
          player: 'Test Player',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          purchaseDate: '2024-01-01',
        },
      ];
      vi.mocked(getEbayCardPrice).mockRejectedValue(new Error('network'));
      const result = await syncPortfolio(inventory);
      expect(result.inventory[0].id).toBe('card-throw');
      expect(result.inventory[0].currentValue).toBeUndefined();
    });

    it('calls progress callback during sync', async () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Test Player',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          purchaseDate: '2024-01-01',
        },
      ];

      vi.mocked(getEbayCardPrice).mockResolvedValue({
        estimatedValue: 150,
        low: 140,
        high: 160,
        avg: 150,
        confidence: 0.9,
        salesCount: 10,
        lastUpdated: '2024-01-02',
        rationale: 'Test',
      });

      const progressCallback = vi.fn();
      await syncPortfolio(inventory, progressCallback);

      expect(progressCallback).toHaveBeenCalled();
      const lastCall = progressCallback.mock.calls[progressCallback.mock.calls.length - 1][0];
      expect(lastCall.status).toBe('complete');
    });

    it('records metrics after sync', async () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Test Player',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          purchaseDate: '2024-01-01',
        },
      ];

      vi.mocked(getEbayCardPrice).mockResolvedValue({
        estimatedValue: 150,
        low: 140,
        high: 160,
        avg: 150,
        confidence: 0.9,
        salesCount: 10,
        lastUpdated: '2024-01-02',
        rationale: 'Test',
      });

      await syncPortfolio(inventory);

      expect(recordMetric).toHaveBeenCalled();
      expect(incrementCounter).toHaveBeenCalled();
    });

    it('prioritizes stale/non-verifiable cards when requested', async () => {
      const inventory: CardInventory[] = [
        {
          id: 'fresh-verifiable',
          player: 'Fresh Verifiable',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          purchaseDate: '2024-01-01',
          valuationSource: 'ebay-api',
          valuationTimestamp: '2026-03-26T10:00:00.000Z',
        },
        {
          id: 'needs-refresh',
          player: 'Needs Refresh',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '2',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          purchaseDate: '2024-01-01',
          valuationSource: 'gemini',
          valuationTimestamp: '2026-03-10T10:00:00.000Z',
        },
      ];

      vi.mocked(getEbayCardPrice).mockResolvedValue({
        estimatedValue: 150,
        low: 140,
        high: 160,
        avg: 150,
        confidence: 0.9,
        salesCount: 10,
        lastUpdated: '2026-03-27T10:00:00.000Z',
        rationale: 'Test',
      });

      await syncPortfolio(inventory, undefined, { prioritizeVerifiableRefresh: true });
      const callOrder = vi.mocked(getEbayCardPrice).mock.calls.map(call => call[0].id);
      expect(callOrder[0]).toBe('needs-refresh');
    });
  });

  describe('syncWatchlistPrices', () => {
    it('syncs active targets only', async () => {
      const targets: TargetWatchlist[] = [
        {
          id: 'target-1',
          player: 'Player 1',
          cardDescription: 'Card 1',
          priority: 'High',
          targetPrice: 100,
          sport: 'Baseball',
          league: 'MLB',
          status: 'active',
          createdAt: '2024-01-01',
        },
        {
          id: 'target-2',
          player: 'Player 2',
          cardDescription: 'Card 2',
          priority: 'High',
          targetPrice: 200,
          sport: 'Baseball',
          league: 'MLB',
          status: 'inactive',
          createdAt: '2024-01-01',
        },
      ];

      vi.mocked(getWatchlistItemPrice).mockResolvedValue({
        estimatedValue: 90,
        low: 80,
        high: 100,
        avg: 90,
        confidence: 0.9,
        salesCount: 5,
        lastUpdated: '2024-01-02',
        rationale: 'Test',
        searchUrl: 'https://ebay.com',
      });

      const result = await syncWatchlistPrices(targets);

      expect(getWatchlistItemPrice).toHaveBeenCalledTimes(1);
      expect(result.updatedTargets.length).toBe(2);
    });

    it('identifies price hits', async () => {
      const targets: TargetWatchlist[] = [
        {
          id: 'target-1',
          player: 'Player 1',
          cardDescription: 'Card 1',
          priority: 'High',
          targetPrice: 100,
          sport: 'Baseball',
          league: 'MLB',
          status: 'active',
          createdAt: '2024-01-01',
        },
      ];

      vi.mocked(getWatchlistItemPrice).mockResolvedValue({
        estimatedValue: 90,
        low: 80,
        high: 100,
        avg: 90,
        confidence: 0.9,
        salesCount: 5,
        lastUpdated: '2024-01-02',
        rationale: 'Test',
        searchUrl: 'https://ebay.com',
      });

      const result = await syncWatchlistPrices(targets);

      expect(result.priceHits.length).toBe(1);
      expect(result.priceHits[0].id).toBe('target-1');
    });

    it('handles sync failures', async () => {
      const targets: TargetWatchlist[] = [
        {
          id: 'target-1',
          player: 'Player 1',
          cardDescription: 'Card 1',
          priority: 'High',
          targetPrice: 100,
          sport: 'Baseball',
          league: 'MLB',
          status: 'active',
          createdAt: '2024-01-01',
        },
      ];

      vi.mocked(getWatchlistItemPrice).mockResolvedValue(null);

      const result = await syncWatchlistPrices(targets);

      expect(result.failedCount).toBe(1);
      // showToast may or may not be called depending on error handling
      expect(result.updatedTargets.length).toBe(1);
    });

    it('handles thrown errors from getWatchlistItemPrice', async () => {
      const targets: TargetWatchlist[] = [
        {
          id: 'target-err',
          player: 'Player X',
          cardDescription: 'Card X',
          priority: 'High',
          targetPrice: 50,
          sport: 'Baseball',
          league: 'MLB',
          status: 'active',
          createdAt: '2024-01-01',
        },
      ];
      vi.mocked(getWatchlistItemPrice).mockRejectedValue(new Error('wl fail'));
      const result = await syncWatchlistPrices(targets);
      expect(result.failedCount).toBeGreaterThanOrEqual(1);
      expect(showToast).toHaveBeenCalled();
    });

    it('prioritizes stale/non-verifiable targets when requested', async () => {
      const targets: TargetWatchlist[] = [
        {
          id: 'target-fresh',
          player: 'Fresh',
          cardDescription: 'Card F',
          priority: 'High',
          targetPrice: 100,
          sport: 'Baseball',
          league: 'MLB',
          status: 'active',
          createdAt: '2024-01-01',
          valuationSource: 'ebay-api',
          valuationTimestamp: '2026-03-26T10:00:00.000Z',
        },
        {
          id: 'target-stale',
          player: 'Stale',
          cardDescription: 'Card S',
          priority: 'High',
          targetPrice: 100,
          sport: 'Baseball',
          league: 'MLB',
          status: 'active',
          createdAt: '2024-01-01',
          valuationSource: 'gemini',
          valuationTimestamp: '2026-03-10T10:00:00.000Z',
        },
      ];
      vi.mocked(getWatchlistItemPrice).mockResolvedValue({
        estimatedValue: 90,
        low: 80,
        high: 100,
        avg: 90,
        confidence: 0.9,
        salesCount: 5,
        lastUpdated: '2026-03-27T10:00:00.000Z',
      });

      await syncWatchlistPrices(targets, undefined, { prioritizeVerifiableRefresh: true });
      const callOrder = vi.mocked(getWatchlistItemPrice).mock.calls.map(call => call[0].id);
      expect(callOrder[0]).toBe('target-stale');
    });
  });

  describe('getSyncMeta', () => {
    it('returns sync metadata from store', () => {
      vi.mocked(store.get).mockReturnValue({
        lastSyncTime: '2024-01-01T00:00:00.000Z',
        totalValue: 1000,
        assetCount: 5,
      });

      const meta = getSyncMeta();
      expect(meta.lastSyncTime).toBe('2024-01-01T00:00:00.000Z');
      expect(meta.totalValue).toBe(1000);
      expect(meta.assetCount).toBe(5);
    });

    it('returns defaults when no metadata exists', () => {
      vi.mocked(store.get).mockReturnValue({
        lastSyncTime: null,
        totalValue: 0,
        assetCount: 0,
      });

      const meta = getSyncMeta();
      expect(meta.lastSyncTime).toBeNull();
      expect(meta.totalValue).toBe(0);
    });
  });

  describe('isSyncStale', () => {
    it('returns true when no sync time exists', () => {
      vi.mocked(store.get).mockReturnValue({
        lastSyncTime: null,
        totalValue: 0,
        assetCount: 0,
      });

      expect(isSyncStale()).toBe(true);
    });

    it('returns true when sync is older than 24 hours', () => {
      const oldTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      vi.mocked(store.get).mockReturnValue({
        lastSyncTime: oldTime,
        totalValue: 1000,
        assetCount: 5,
      });

      expect(isSyncStale()).toBe(true);
    });

    it('returns false when sync is recent', () => {
      const recentTime = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
      vi.mocked(store.get).mockReturnValue({
        lastSyncTime: recentTime,
        totalValue: 1000,
        assetCount: 5,
      });

      expect(isSyncStale()).toBe(false);
    });
  });
});
