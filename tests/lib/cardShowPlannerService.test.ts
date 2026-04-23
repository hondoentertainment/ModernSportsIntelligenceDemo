// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getAllShows,
  getUpcomingShows,
  getPastShows,
  getShowById,
  getShowsByState,
  createShowPlan,
  updateShowPlan,
  getShowPlans,
  getShowStats,
  addExpense,
  getPostShowReports,
  createPostShowReport,
  formatCurrency,
  getShowTypeColor,
  getShowTypeLabel,
  getPriorityColor,
  type CardShow,
  type ShowPlan,
  type PostShowReport,
} from '../../lib/utils/cardShowPlannerService';

const localStorageMock = setupLocalStorageMock();

describe('cardShowPlannerService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // ---- Show Data Tests ----

  describe('getAllShows', () => {
    it('returns at least 12 mock shows', () => {
      const shows = getAllShows();
      expect(shows.length).toBeGreaterThanOrEqual(12);
    });

    it('each show has required fields', () => {
      const shows = getAllShows();
      for (const show of shows) {
        expect(show.id).toBeTruthy();
        expect(show.name).toBeTruthy();
        expect(show.location).toBeTruthy();
        expect(show.city).toBeTruthy();
        expect(show.state).toBeTruthy();
        expect(show.date).toBeTruthy();
        expect(show.endDate).toBeTruthy();
        expect(['local', 'regional', 'national', 'convention']).toContain(show.type);
        expect(show.venue).toBeTruthy();
        expect(show.description).toBeTruthy();
        expect(show.vendors).toBeGreaterThan(0);
        expect(show.expectedAttendance).toBeGreaterThan(0);
        expect(show.admissionCost).toBeGreaterThanOrEqual(0);
        expect(typeof show.featured).toBe('boolean');
      }
    });

    it('returns a copy (not the same array reference)', () => {
      const a = getAllShows();
      const b = getAllShows();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  describe('getShowById', () => {
    it('returns a show for a valid id', () => {
      const show = getShowById('show-1');
      expect(show).toBeDefined();
      expect(show!.id).toBe('show-1');
      expect(show!.name).toBeTruthy();
    });

    it('returns undefined for an invalid id', () => {
      expect(getShowById('nonexistent')).toBeUndefined();
    });
  });

  describe('getUpcomingShows', () => {
    it('returns shows with date >= today', () => {
      const upcoming = getUpcomingShows();
      const today = new Date().toISOString().split('T')[0];
      for (const show of upcoming) {
        expect(show.date >= today).toBe(true);
      }
    });

    it('returns shows sorted by date ascending', () => {
      const upcoming = getUpcomingShows();
      for (let i = 1; i < upcoming.length; i++) {
        expect(upcoming[i].date >= upcoming[i - 1].date).toBe(true);
      }
    });
  });

  describe('getPastShows', () => {
    it('returns shows with endDate < today', () => {
      const past = getPastShows();
      const today = new Date().toISOString().split('T')[0];
      for (const show of past) {
        expect(show.endDate < today).toBe(true);
      }
    });

    it('returns shows sorted by date descending', () => {
      const past = getPastShows();
      for (let i = 1; i < past.length; i++) {
        expect(past[i].date <= past[i - 1].date).toBe(true);
      }
    });
  });

  describe('getShowsByState', () => {
    it('filters shows by state', () => {
      const txShows = getShowsByState('TX');
      expect(txShows.length).toBeGreaterThan(0);
      for (const show of txShows) {
        expect(show.state).toBe('TX');
      }
    });

    it('is case-insensitive', () => {
      const upper = getShowsByState('TX');
      const lower = getShowsByState('tx');
      expect(upper).toEqual(lower);
    });

    it('returns empty array for state with no shows', () => {
      const result = getShowsByState('ZZ');
      expect(result).toEqual([]);
    });
  });

  // ---- Plan Tests ----

  describe('createShowPlan / getShowPlans', () => {
    const samplePlan: ShowPlan = {
      id: 'plan-1',
      showId: 'show-1',
      budget: 500,
      wantList: [
        { cardName: '2023 Topps Chrome', player: 'Mike Trout', maxPrice: 200, priority: 'high' },
      ],
      expenses: [],
      totalSpent: 0,
      notes: 'Looking for vintage finds',
    };

    it('creates and retrieves a plan', () => {
      createShowPlan(samplePlan);
      const plans = getShowPlans();
      expect(plans).toHaveLength(1);
      expect(plans[0].id).toBe('plan-1');
      expect(plans[0].budget).toBe(500);
    });

    it('creates multiple plans', () => {
      createShowPlan(samplePlan);
      createShowPlan({ ...samplePlan, id: 'plan-2', showId: 'show-2' });
      const plans = getShowPlans();
      expect(plans).toHaveLength(2);
    });

    it('persists plan data to localStorage', () => {
      createShowPlan(samplePlan);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('updateShowPlan', () => {
    it('updates an existing plan', () => {
      createShowPlan({
        id: 'plan-u1',
        showId: 'show-1',
        budget: 300,
        wantList: [],
        expenses: [],
        totalSpent: 0,
        notes: '',
      });
      const updated = updateShowPlan('plan-u1', { budget: 600, notes: 'Updated' });
      expect(updated).toBeDefined();
      expect(updated!.budget).toBe(600);
      expect(updated!.notes).toBe('Updated');
      expect(updated!.id).toBe('plan-u1');
    });

    it('returns undefined for nonexistent plan', () => {
      const result = updateShowPlan('nope', { budget: 100 });
      expect(result).toBeUndefined();
    });
  });

  describe('addExpense', () => {
    it('adds expense and recalculates totalSpent', () => {
      createShowPlan({
        id: 'plan-e1',
        showId: 'show-2',
        budget: 1000,
        wantList: [],
        expenses: [],
        totalSpent: 0,
        notes: '',
      });
      const result = addExpense('plan-e1', { category: 'Cards', amount: 150, note: 'Bought a Jeter' });
      expect(result).toBeDefined();
      expect(result!.totalSpent).toBe(150);
      expect(result!.expenses).toHaveLength(1);
    });

    it('accumulates multiple expenses', () => {
      createShowPlan({
        id: 'plan-e2',
        showId: 'show-3',
        budget: 500,
        wantList: [],
        expenses: [],
        totalSpent: 0,
        notes: '',
      });
      addExpense('plan-e2', { category: 'Cards', amount: 100, note: '' });
      const result = addExpense('plan-e2', { category: 'Food', amount: 25, note: '' });
      expect(result!.totalSpent).toBe(125);
      expect(result!.expenses).toHaveLength(2);
    });

    it('returns undefined for nonexistent plan', () => {
      const result = addExpense('nope', { category: 'Cards', amount: 50, note: '' });
      expect(result).toBeUndefined();
    });
  });

  // ---- Post-Show Report Tests ----

  describe('createPostShowReport / getPostShowReports', () => {
    const sampleReport: PostShowReport = {
      showId: 'show-10',
      cardsAcquired: [
        { cardName: '1989 Upper Deck Griffey', player: 'Ken Griffey Jr.', price: 250, booth: 'Booth A12' },
      ],
      totalSpent: 350,
      budgetRemaining: 150,
      highlights: 'Found a PSA 9 Griffey rookie!',
      rating: 5,
    };

    it('creates and retrieves a post-show report', () => {
      createPostShowReport(sampleReport);
      const reports = getPostShowReports();
      expect(reports).toHaveLength(1);
      expect(reports[0].showId).toBe('show-10');
      expect(reports[0].cardsAcquired).toHaveLength(1);
    });

    it('persists reports to localStorage', () => {
      createPostShowReport(sampleReport);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  // ---- Stats Tests ----

  describe('getShowStats', () => {
    it('returns zero stats when no data exists', () => {
      const stats = getShowStats();
      expect(stats.totalAttended).toBe(0);
      expect(stats.totalSpent).toBe(0);
      expect(stats.totalCardsAcquired).toBe(0);
      expect(stats.avgSpendPerShow).toBe(0);
      expect(stats.favoriteVenue).toBe('N/A');
    });

    it('calculates stats from reports and plans', () => {
      createPostShowReport({
        showId: 'show-1',
        cardsAcquired: [
          { cardName: 'Card A', player: 'Player A', price: 100, booth: 'B1' },
          { cardName: 'Card B', player: 'Player B', price: 50, booth: 'B2' },
        ],
        totalSpent: 200,
        budgetRemaining: 100,
        highlights: 'Great show',
        rating: 4,
      });
      createPostShowReport({
        showId: 'show-2',
        cardsAcquired: [
          { cardName: 'Card C', player: 'Player C', price: 300, booth: 'B3' },
        ],
        totalSpent: 400,
        budgetRemaining: 0,
        highlights: 'Spent it all',
        rating: 3,
      });
      createShowPlan({
        id: 'plan-s1',
        showId: 'show-1',
        budget: 300,
        wantList: [],
        expenses: [],
        totalSpent: 0,
        notes: '',
      });

      const stats = getShowStats();
      expect(stats.totalAttended).toBe(2);
      expect(stats.totalSpent).toBe(600);
      expect(stats.totalCardsAcquired).toBe(3);
      expect(stats.avgSpendPerShow).toBe(300);
      expect(stats.favoriteVenue).not.toBe('N/A');
    });
  });

  // ---- Utility Tests ----

  describe('formatCurrency', () => {
    it('formats a number as USD currency', () => {
      expect(formatCurrency(1234.5)).toBe('$1,234.50');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats negative numbers', () => {
      const result = formatCurrency(-50);
      expect(result).toContain('50.00');
    });
  });

  describe('getShowTypeColor', () => {
    it('returns correct colors for all types', () => {
      expect(getShowTypeColor('national')).toBe('bg-purple-600');
      expect(getShowTypeColor('regional')).toBe('bg-blue-600');
      expect(getShowTypeColor('convention')).toBe('bg-amber-600');
      expect(getShowTypeColor('local')).toBe('bg-green-600');
    });
  });

  describe('getShowTypeLabel', () => {
    it('returns correct labels for all types', () => {
      expect(getShowTypeLabel('national')).toBe('National');
      expect(getShowTypeLabel('regional')).toBe('Regional');
      expect(getShowTypeLabel('convention')).toBe('Convention');
      expect(getShowTypeLabel('local')).toBe('Local');
    });
  });

  describe('getPriorityColor', () => {
    it('returns correct colors for all priorities', () => {
      expect(getPriorityColor('high')).toBe('text-red-400');
      expect(getPriorityColor('medium')).toBe('text-yellow-400');
      expect(getPriorityColor('low')).toBe('text-green-400');
    });
  });
});
