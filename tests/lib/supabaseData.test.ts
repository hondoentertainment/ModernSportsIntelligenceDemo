// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CardInventory, TargetWatchlist } from '../../types';

// Mock supabase module - must be inline in factory
vi.mock('../../lib/supabase', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
    },
    isDemoMode: false,
  };
});

vi.mock('../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Import after mocks
import * as supabaseData from '../../lib/supabaseData';
import { supabase } from '../../lib/supabase';

describe('supabaseData', () => {
  const mockUserId = 'test-user-123';
  const mockCard: CardInventory = {
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
    valuationSource: 'historical-comps',
    valuationTimestamp: '2024-01-02T12:00:00.000Z',
    salesData: [
      { title: 'Comp A', price: 110, condition: 'Near Mint', soldAt: '2024-01-01T00:00:00.000Z' },
    ],
  };

  const mockTarget: TargetWatchlist = {
    id: 'target-1',
    player: 'Target Player',
    cardDescription: 'Rookie Card',
    priority: 'High',
    targetPrice: 50,
    sport: 'Baseball',
    league: 'MLB',
    status: 'active',
    createdAt: '2024-01-01',
    valuationSource: 'gemini',
    valuationTimestamp: '2024-01-02T12:00:00.000Z',
    salesData: [
      { title: 'Comp T', price: 45, condition: 'Raw', soldAt: '2024-01-01T00:00:00.000Z' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCards', () => {
    it('fetches and transforms cards from Supabase', async () => {
      const mockData = [{
        id: 'card-1',
        player: 'Test Player',
        year: 2024,
        manufacturer: 'Topps',
        card_number: '1',
        set_name: 'Series 1',
        sport: 'Baseball',
        league: 'MLB',
        is_autographed: false,
        condition: 'Mint',
        is_graded: false,
        purchase_price: 100,
        purchase_date: '2024-01-01',
        valuation_source: 'historical-comps',
        valuation_timestamp: '2024-01-02T12:00:00.000Z',
        sales_data: [{ title: 'Comp A', price: 110, condition: 'Near Mint', soldAt: '2024-01-01T00:00:00.000Z' }],
        created_at: '2024-01-01',
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any);

      const cards = await supabaseData.fetchCards(mockUserId);
      expect(cards).toHaveLength(1);
      expect(cards[0].player).toBe('Test Player');
      expect(cards[0].valuationSource).toBe('historical-comps');
      expect(cards[0].valuationTimestamp).toBe('2024-01-02T12:00:00.000Z');
      expect(cards[0].salesData?.[0]?.title).toBe('Comp A');
      expect(supabase.from).toHaveBeenCalledWith('cards');
    });

    it('returns empty array on error', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any);

      const cards = await supabaseData.fetchCards(mockUserId);
      expect(cards).toEqual([]);
    });
  });

  describe('upsertCard', () => {
    it('upserts card successfully', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any);

      const result = await supabaseData.upsertCard(mockCard, mockUserId);
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('cards');
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          valuation_source: 'historical-comps',
          valuation_timestamp: '2024-01-02T12:00:00.000Z',
          sales_data: expect.any(Array),
        }),
        { onConflict: 'id' }
      );
    });

    it('returns false on error', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'Error' } });
      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any);

      const result = await supabaseData.upsertCard(mockCard, mockUserId);
      expect(result).toBe(false);
    });
  });

  describe('deleteCard', () => {
    it('deletes card successfully', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      } as any);

      const result = await supabaseData.deleteCard('card-1');
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Error' } });
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      } as any);

      const result = await supabaseData.deleteCard('card-1');
      expect(result).toBe(false);
    });
  });

  describe('bulkUpsertCards', () => {
    it('bulk upserts cards successfully', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any);

      const result = await supabaseData.bulkUpsertCards([mockCard], mockUserId);
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'Error' } });
      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any);

      const result = await supabaseData.bulkUpsertCards([mockCard], mockUserId);
      expect(result).toBe(false);
    });
  });

  describe('fetchTargets', () => {
    it('fetches and transforms targets from Supabase', async () => {
      const mockData = [{
        id: 'target-1',
        player: 'Target Player',
        card_description: 'Rookie Card',
        priority: 'High',
        target_price: 50,
        sport: 'Baseball',
        league: 'MLB',
        status: 'active',
        valuation_source: 'gemini',
        valuation_timestamp: '2024-01-02T12:00:00.000Z',
        sales_data: [{ title: 'Comp T', price: 45, condition: 'Raw', soldAt: '2024-01-01T00:00:00.000Z' }],
        created_at: '2024-01-01',
      }];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any);

      const targets = await supabaseData.fetchTargets(mockUserId);
      expect(targets).toHaveLength(1);
      expect(targets[0].player).toBe('Target Player');
      expect(targets[0].valuationSource).toBe('gemini');
      expect(targets[0].valuationTimestamp).toBe('2024-01-02T12:00:00.000Z');
      expect(targets[0].salesData?.[0]?.title).toBe('Comp T');
    });

    it('returns empty array on error', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any);

      const targets = await supabaseData.fetchTargets(mockUserId);
      expect(targets).toEqual([]);
    });
  });

  describe('upsertTarget', () => {
    it('upserts target successfully', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any);

      const result = await supabaseData.upsertTarget(mockTarget, mockUserId);
      expect(result).toBe(true);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          valuation_source: 'gemini',
          valuation_timestamp: '2024-01-02T12:00:00.000Z',
          sales_data: expect.any(Array),
        }),
        { onConflict: 'id' }
      );
    });

    it('returns false on error', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'Error' } });
      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any);

      const result = await supabaseData.upsertTarget(mockTarget, mockUserId);
      expect(result).toBe(false);
    });
  });

  describe('bulkUpsertTargets', () => {
    it('bulk upserts targets successfully', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any);

      const result = await supabaseData.bulkUpsertTargets([mockTarget], mockUserId);
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'Error' } });
      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
      } as any);

      const result = await supabaseData.bulkUpsertTargets([mockTarget], mockUserId);
      expect(result).toBe(false);
    });
  });

  describe('deleteTarget', () => {
    it('deletes target successfully', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      } as any);

      const result = await supabaseData.deleteTarget('target-1');
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Error' } });
      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      } as any);

      const result = await supabaseData.deleteTarget('target-1');
      expect(result).toBe(false);
    });
  });
});
