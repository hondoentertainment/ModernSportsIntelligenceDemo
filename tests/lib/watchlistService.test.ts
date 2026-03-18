import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getWatchlistItems,
  addToWatchlist,
  removeFromWatchlist,
  updateAlert,
  getActiveAlerts,
  getTriggeredAlerts,
  getWatchlistStats,
  getPriceHistory,
  getTopMovers,
  formatCurrency,
  getAlertTypeLabel,
  getAlertColor,
  getSportIcon,
  type WatchlistItem,
  type PriceAlert,
  type WatchlistStats,
  type AlertType,
} from '../../lib/trading/watchlistService';

const localStorageMock = setupLocalStorageMock();

describe('watchlistService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ---- getWatchlistItems ----

  describe('getWatchlistItems', () => {
    it('returns mock data when localStorage is empty', () => {
      const items = getWatchlistItems();
      expect(items.length).toBeGreaterThanOrEqual(15);
    });

    it('returns items with required fields', () => {
      const items = getWatchlistItems();
      for (const item of items) {
        expect(item.id).toBeTruthy();
        expect(item.cardName).toBeTruthy();
        expect(item.player).toBeTruthy();
        expect(item.sport).toBeTruthy();
        expect(typeof item.year).toBe('number');
        expect(typeof item.currentPrice).toBe('number');
        expect(typeof item.targetPrice).toBe('number');
        expect(Array.isArray(item.priceHistory)).toBe(true);
        expect(item.priceHistory.length).toBeGreaterThan(0);
      }
    });

    it('returns persisted items on subsequent calls', () => {
      const first = getWatchlistItems();
      const second = getWatchlistItems();
      expect(first.length).toBe(second.length);
      expect(first[0].id).toBe(second[0].id);
    });

    it('each price history point has date and price', () => {
      const items = getWatchlistItems();
      const point = items[0].priceHistory[0];
      expect(point.date).toBeTruthy();
      expect(typeof point.price).toBe('number');
    });
  });

  // ---- addToWatchlist ----

  describe('addToWatchlist', () => {
    it('adds a new item and returns it with generated id', () => {
      const newItem = addToWatchlist({
        cardName: '2024 Test Card',
        player: 'Test Player',
        sport: 'Baseball',
        year: 2024,
        set: 'Topps Chrome',
        imageUrl: '/test.jpg',
        currentPrice: 100,
        targetPrice: 80,
        alertType: 'price_drop',
        alertEnabled: true,
        notes: 'Test note',
        condition: 'Mint',
        estimatedGrade: 'PSA 10',
      });
      expect(newItem.id).toBeTruthy();
      expect(newItem.player).toBe('Test Player');
      expect(newItem.addedDate).toBeTruthy();
      expect(newItem.priceHistory.length).toBeGreaterThan(0);
    });

    it('persists the added item to localStorage', () => {
      addToWatchlist({
        cardName: '2024 Persist Card',
        player: 'Persist Player',
        sport: 'Basketball',
        year: 2024,
        set: 'Prizm',
        imageUrl: '/test.jpg',
        currentPrice: 200,
        targetPrice: 150,
        alertType: 'price_target',
        alertEnabled: false,
        notes: '',
        condition: 'Near Mint',
        estimatedGrade: 'PSA 9',
      });
      const items = getWatchlistItems();
      const found = items.find(i => i.player === 'Persist Player');
      expect(found).toBeTruthy();
    });

    it('generates price history for new items', () => {
      const item = addToWatchlist({
        cardName: 'History Card',
        player: 'History Player',
        sport: 'Football',
        year: 2024,
        set: 'Select',
        imageUrl: '/test.jpg',
        currentPrice: 50,
        targetPrice: 40,
        alertType: 'price_drop',
        alertEnabled: true,
        notes: '',
        condition: 'Mint',
        estimatedGrade: 'PSA 10',
      });
      expect(item.priceHistory.length).toBeGreaterThan(10);
    });
  });

  // ---- removeFromWatchlist ----

  describe('removeFromWatchlist', () => {
    it('removes an item by id', () => {
      const items = getWatchlistItems();
      const idToRemove = items[0].id;
      const originalLength = items.length;
      removeFromWatchlist(idToRemove);
      const after = getWatchlistItems();
      expect(after.length).toBe(originalLength - 1);
      expect(after.find(i => i.id === idToRemove)).toBeUndefined();
    });

    it('does nothing when id does not exist', () => {
      const before = getWatchlistItems();
      removeFromWatchlist('nonexistent-id');
      const after = getWatchlistItems();
      expect(after.length).toBe(before.length);
    });
  });

  // ---- updateAlert ----

  describe('updateAlert', () => {
    it('updates alertEnabled on an item', () => {
      const items = getWatchlistItems();
      const target = items.find(i => i.alertEnabled)!;
      const result = updateAlert(target.id, { alertEnabled: false });
      expect(result).not.toBeNull();
      expect(result!.alertEnabled).toBe(false);
    });

    it('updates alertType on an item', () => {
      const items = getWatchlistItems();
      const result = updateAlert(items[0].id, { alertType: 'new_listing' });
      expect(result).not.toBeNull();
      expect(result!.alertType).toBe('new_listing');
    });

    it('updates targetPrice on an item', () => {
      const items = getWatchlistItems();
      const result = updateAlert(items[0].id, { targetPrice: 999.99 });
      expect(result).not.toBeNull();
      expect(result!.targetPrice).toBe(999.99);
    });

    it('returns null for nonexistent id', () => {
      getWatchlistItems(); // seed data
      const result = updateAlert('nonexistent', { alertEnabled: true });
      expect(result).toBeNull();
    });
  });

  // ---- getActiveAlerts ----

  describe('getActiveAlerts', () => {
    it('returns only non-triggered alerts', () => {
      const alerts = getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      for (const a of alerts) {
        expect(a.triggered).toBe(false);
      }
    });

    it('each alert has required fields', () => {
      const alerts = getActiveAlerts();
      for (const a of alerts) {
        expect(a.id).toBeTruthy();
        expect(a.watchlistItemId).toBeTruthy();
        expect(a.type).toBeTruthy();
        expect(typeof a.threshold).toBe('number');
        expect(a.message).toBeTruthy();
      }
    });
  });

  // ---- getTriggeredAlerts ----

  describe('getTriggeredAlerts', () => {
    it('returns only triggered alerts', () => {
      const alerts = getTriggeredAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      for (const a of alerts) {
        expect(a.triggered).toBe(true);
      }
    });

    it('triggered alerts have triggeredAt timestamp', () => {
      const alerts = getTriggeredAlerts();
      for (const a of alerts) {
        expect(a.triggeredAt).toBeTruthy();
      }
    });
  });

  // ---- getWatchlistStats ----

  describe('getWatchlistStats', () => {
    it('returns stats object with all fields', () => {
      const stats = getWatchlistStats();
      expect(typeof stats.totalItems).toBe('number');
      expect(typeof stats.activeAlerts).toBe('number');
      expect(typeof stats.triggeredToday).toBe('number');
      expect(typeof stats.avgPriceChange).toBe('number');
      expect(typeof stats.topMover).toBe('string');
    });

    it('totalItems matches watchlist length', () => {
      const items = getWatchlistItems();
      const stats = getWatchlistStats();
      expect(stats.totalItems).toBe(items.length);
    });

    it('activeAlerts matches active alerts count', () => {
      const alerts = getActiveAlerts();
      const stats = getWatchlistStats();
      expect(stats.activeAlerts).toBe(alerts.length);
    });
  });

  // ---- getPriceHistory ----

  describe('getPriceHistory', () => {
    it('returns price history for existing item', () => {
      const items = getWatchlistItems();
      const history = getPriceHistory(items[0].id);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].date).toBeTruthy();
      expect(typeof history[0].price).toBe('number');
    });

    it('returns empty array for nonexistent item', () => {
      getWatchlistItems(); // seed
      const history = getPriceHistory('nonexistent-id');
      expect(history).toEqual([]);
    });
  });

  // ---- getTopMovers ----

  describe('getTopMovers', () => {
    it('returns up to 10 items', () => {
      const movers = getTopMovers();
      expect(movers.length).toBeGreaterThan(0);
      expect(movers.length).toBeLessThanOrEqual(10);
    });

    it('items are sorted by absolute price change descending', () => {
      const movers = getTopMovers();
      const changes = movers.map(item => {
        const h = item.priceHistory;
        if (h.length < 2 || h[h.length - 2].price === 0) return 0;
        return Math.abs((h[h.length - 1].price - h[h.length - 2].price) / h[h.length - 2].price) * 100;
      });
      for (let i = 1; i < changes.length; i++) {
        expect(changes[i - 1]).toBeGreaterThanOrEqual(changes[i] - 0.001); // float tolerance
      }
    });
  });

  // ---- formatCurrency ----

  describe('formatCurrency', () => {
    it('formats positive numbers with dollar sign', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1,234.56');
      expect(result).toContain('$');
    });

    it('formats zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('$');
      expect(result).toContain('0');
    });

    it('formats negative numbers', () => {
      const result = formatCurrency(-50);
      expect(result).toContain('50');
    });
  });

  // ---- getAlertTypeLabel ----

  describe('getAlertTypeLabel', () => {
    it('returns correct label for price_drop', () => {
      expect(getAlertTypeLabel('price_drop')).toBe('Price Drop');
    });

    it('returns correct label for price_target', () => {
      expect(getAlertTypeLabel('price_target')).toBe('Price Target');
    });

    it('returns correct label for grade_change', () => {
      expect(getAlertTypeLabel('grade_change')).toBe('Grade Change');
    });

    it('returns correct label for new_listing', () => {
      expect(getAlertTypeLabel('new_listing')).toBe('New Listing');
    });
  });

  // ---- getAlertColor ----

  describe('getAlertColor', () => {
    it('returns red for price_drop', () => {
      expect(getAlertColor('price_drop')).toContain('red');
    });

    it('returns emerald for price_target', () => {
      expect(getAlertColor('price_target')).toContain('emerald');
    });

    it('returns amber for grade_change', () => {
      expect(getAlertColor('grade_change')).toContain('amber');
    });

    it('returns blue for new_listing', () => {
      expect(getAlertColor('new_listing')).toContain('blue');
    });
  });

  // ---- getSportIcon ----

  describe('getSportIcon', () => {
    it('returns an icon string for each sport', () => {
      expect(getSportIcon('Baseball')).toBeTruthy();
      expect(getSportIcon('Basketball')).toBeTruthy();
      expect(getSportIcon('Football')).toBeTruthy();
      expect(getSportIcon('Hockey')).toBeTruthy();
      expect(getSportIcon('Soccer')).toBeTruthy();
    });

    it('returns fallback for unknown sport', () => {
      expect(getSportIcon('Cricket')).toBeTruthy();
    });

    it('returns different icons for different sports', () => {
      const icons = new Set([
        getSportIcon('Baseball'),
        getSportIcon('Basketball'),
        getSportIcon('Football'),
        getSportIcon('Hockey'),
        getSportIcon('Soccer'),
      ]);
      expect(icons.size).toBe(5);
    });
  });
});
