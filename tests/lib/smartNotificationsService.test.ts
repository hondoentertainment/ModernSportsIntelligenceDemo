import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getNotifications,
  getUnreadNotifications,
  getDealAlerts,
  getActiveDealAlerts,
  getNotificationRules,
  getNotificationStats,
  getNotificationPreferences,
  getNotificationGroups,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  getCategoryColor,
  getCategoryLabel,
  getCategoryIcon,
  getPriorityColor,
  getDealTypeLabel,
  formatTimeAgo,
  formatCurrency,
} from '../../lib/utils/smartNotificationsService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('smartNotificationsService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('returns all notifications when no category filter', () => {
      const notifs = getNotifications();
      expect(notifs.length).toBeGreaterThan(40);
      for (const n of notifs) {
        expect(n.id).toBeTruthy();
        expect(n.title).toBeTruthy();
        expect(n.category).toBeTruthy();
        expect(n.priority).toBeTruthy();
      }
    });

    it('filters by category', () => {
      const priceAlerts = getNotifications('price_alert');
      expect(priceAlerts.length).toBeGreaterThan(0);
      for (const n of priceAlerts) {
        expect(n.category).toBe('price_alert');
      }

      const deals = getNotifications('deal_found');
      expect(deals.length).toBeGreaterThan(0);
      for (const n of deals) {
        expect(n.category).toBe('deal_found');
      }
    });

    it('returns notifications sorted by timestamp descending', () => {
      const notifs = getNotifications();
      for (let i = 1; i < notifs.length; i++) {
        expect(new Date(notifs[i - 1].timestamp).getTime())
          .toBeGreaterThanOrEqual(new Date(notifs[i].timestamp).getTime());
      }
    });

    it('excludes dismissed notifications', () => {
      const before = getNotifications();
      const firstId = before[0].id;
      dismissNotification(firstId);
      const after = getNotifications();
      expect(after.find(n => n.id === firstId)).toBeUndefined();
      expect(after.length).toBe(before.length - 1);
    });
  });

  describe('getUnreadNotifications', () => {
    it('returns only unread notifications', () => {
      const unread = getUnreadNotifications();
      expect(unread.length).toBeGreaterThan(0);
      for (const n of unread) {
        expect(n.isRead).toBe(false);
      }
    });

    it('returns fewer than total notifications', () => {
      const all = getNotifications();
      const unread = getUnreadNotifications();
      expect(unread.length).toBeLessThan(all.length);
    });
  });

  describe('getDealAlerts', () => {
    it('returns deal alerts with valid savings', () => {
      const deals = getDealAlerts();
      expect(deals.length).toBeGreaterThanOrEqual(15);
      for (const d of deals) {
        expect(d.savings).toBeGreaterThan(0);
        expect(d.savingsPercent).toBeGreaterThan(0);
        expect(d.listPrice).toBeLessThan(d.marketPrice);
        expect(d.savings).toBeCloseTo(d.marketPrice - d.listPrice, 0);
      }
    });

    it('returns deals sorted by discoveredAt descending', () => {
      const deals = getDealAlerts();
      for (let i = 1; i < deals.length; i++) {
        expect(new Date(deals[i - 1].discoveredAt).getTime())
          .toBeGreaterThanOrEqual(new Date(deals[i].discoveredAt).getTime());
      }
    });
  });

  describe('getActiveDealAlerts', () => {
    it('returns only non-expired deals', () => {
      const active = getActiveDealAlerts();
      for (const d of active) {
        expect(d.isExpired).toBe(false);
      }
    });
  });

  describe('markAsRead', () => {
    it('marks a notification as read', () => {
      const unreadBefore = getUnreadNotifications();
      const target = unreadBefore[0];
      markAsRead(target.id);
      const unreadAfter = getUnreadNotifications();
      expect(unreadAfter.find(n => n.id === target.id)).toBeUndefined();
      expect(unreadAfter.length).toBe(unreadBefore.length - 1);
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read', () => {
      markAllAsRead();
      const unread = getUnreadNotifications();
      expect(unread.length).toBe(0);
    });
  });

  describe('getNotificationStats', () => {
    it('returns accurate stats', () => {
      const stats = getNotificationStats();
      const all = getNotifications();
      const unread = getUnreadNotifications();

      expect(stats.totalNotifications).toBe(all.length);
      expect(stats.unreadCount).toBe(unread.length);
      expect(stats.dealsFound).toBeGreaterThanOrEqual(15);
      expect(stats.totalSavings).toBeGreaterThan(0);
      expect(stats.byCategory.length).toBe(9);
      expect(stats.byPriority.length).toBe(4);
      expect(stats.topAlertedCards.length).toBeGreaterThan(0);

      const categoryTotal = stats.byCategory.reduce((sum, c) => sum + c.count, 0);
      expect(categoryTotal).toBe(stats.totalNotifications);

      const priorityTotal = stats.byPriority.reduce((sum, p) => sum + p.count, 0);
      expect(priorityTotal).toBe(stats.totalNotifications);
    });
  });

  describe('getNotificationRules', () => {
    it('returns rules with valid structure', () => {
      const rules = getNotificationRules();
      expect(rules.length).toBeGreaterThanOrEqual(10);
      for (const r of rules) {
        expect(r.id).toBeTruthy();
        expect(r.name).toBeTruthy();
        expect(r.conditions.length).toBeGreaterThan(0);
        expect(r.channels.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getNotificationPreferences', () => {
    it('returns default preferences', () => {
      const prefs = getNotificationPreferences();
      expect(prefs.quietHoursStart).toBeTruthy();
      expect(prefs.quietHoursEnd).toBeTruthy();
      expect(prefs.maxPerDay).toBeGreaterThan(0);
      expect(prefs.channels.length).toBe(4);
      expect(prefs.categoryPreferences.length).toBe(9);
    });
  });

  describe('getNotificationGroups', () => {
    it('returns groups with valid structure', () => {
      const groups = getNotificationGroups();
      expect(groups.length).toBeGreaterThan(0);
      for (const g of groups) {
        expect(g.groupId).toBeTruthy();
        expect(g.count).toBeGreaterThan(0);
        expect(g.notifications.length).toBe(g.count);
      }
    });
  });

  describe('display helpers', () => {
    it('getCategoryColor returns hex colors', () => {
      expect(getCategoryColor('price_alert')).toMatch(/^#/);
      expect(getCategoryColor('deal_found')).toMatch(/^#/);
    });

    it('getCategoryLabel returns human-readable labels', () => {
      expect(getCategoryLabel('price_alert')).toBe('Price Alert');
      expect(getCategoryLabel('deal_found')).toBe('Deal Found');
      expect(getCategoryLabel('market_move')).toBe('Market Move');
    });

    it('getCategoryIcon returns icon names', () => {
      expect(getCategoryIcon('price_alert')).toBeTruthy();
      expect(getCategoryIcon('auction')).toBeTruthy();
    });

    it('getPriorityColor returns hex colors', () => {
      expect(getPriorityColor('critical')).toMatch(/^#/);
      expect(getPriorityColor('low')).toMatch(/^#/);
    });

    it('getDealTypeLabel returns labels', () => {
      expect(getDealTypeLabel('below_market')).toBe('Below Market');
      expect(getDealTypeLabel('price_crash')).toBe('Price Crash');
    });

    it('formatCurrency formats numbers', () => {
      expect(formatCurrency(100)).toBe('$100');
      expect(formatCurrency(1500)).toContain('$');
      expect(formatCurrency(1000000)).toBe('$1.0M');
    });

    it('formatTimeAgo returns a string', () => {
      const result = formatTimeAgo(new Date().toISOString());
      expect(typeof result).toBe('string');
      expect(result).toBeTruthy();
    });
  });
});
