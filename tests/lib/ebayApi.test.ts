import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ebayApi } from '../../lib/ebayApi';
import { serverApiRequestAuthenticated } from '../../lib/serverApi';

vi.mock('../../lib/serverApi', () => ({
  serverApiRequestAuthenticated: vi.fn(),
}));

describe('ebayApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ebayApi.config = { sandbox: false };
  });

  describe('initialize', () => {
    it('updates config', () => {
      ebayApi.initialize({ sandbox: true });
      expect(ebayApi.config.sandbox).toBe(true);
    });

    it('merges config', () => {
      ebayApi.initialize({ sandbox: true });
      expect(ebayApi.config).toEqual({ sandbox: true });
    });
  });

  describe('isAvailable', () => {
    it('returns true', () => {
      expect(ebayApi.isAvailable()).toBe(true);
    });
  });

  describe('verifyCredentials', () => {
    it('calls verify action (no token returned to client)', async () => {
      vi.mocked(serverApiRequestAuthenticated).mockResolvedValue({ ok: true });
      await ebayApi.verifyCredentials();
      expect(serverApiRequestAuthenticated).toHaveBeenCalledWith('/api/market/ebay', {
        method: 'POST',
        body: JSON.stringify({ action: 'verify', sandbox: false }),
      });
    });

    it('uses sandbox flag from config', async () => {
      ebayApi.initialize({ sandbox: true });
      vi.mocked(serverApiRequestAuthenticated).mockResolvedValue({ ok: true });
      await ebayApi.verifyCredentials();
      expect(serverApiRequestAuthenticated).toHaveBeenCalledWith('/api/market/ebay', {
        method: 'POST',
        body: JSON.stringify({ action: 'verify', sandbox: true }),
      });
    });

    it('throws when server does not return ok', async () => {
      vi.mocked(serverApiRequestAuthenticated).mockResolvedValue({ ok: false });
      await expect(ebayApi.verifyCredentials()).rejects.toThrow(/verify failed/i);
    });
  });

  describe('searchSportsCards', () => {
    it('searches with params', async () => {
      const mockResponse = {
        itemSummaries: [
          {
            itemId: '123',
            title: 'Test Card',
            price: { value: '10.00', currency: 'USD' },
          },
        ],
      };
      vi.mocked(serverApiRequestAuthenticated).mockResolvedValue(mockResponse);
      const result = await ebayApi.searchSportsCards({
        playerName: 'Test Player',
        cardYear: '2024',
      });
      expect(result).toEqual(mockResponse);
      expect(serverApiRequestAuthenticated).toHaveBeenCalledWith('/api/market/ebay', {
        method: 'POST',
        body: JSON.stringify({
          action: 'search',
          sandbox: false,
          params: { playerName: 'Test Player', cardYear: '2024' },
        }),
      });
    });

    it('passes offset and sort; strips legacy soldOnly from API params', async () => {
      vi.mocked(serverApiRequestAuthenticated).mockResolvedValue({ itemSummaries: [] });
      await ebayApi.searchSportsCards({
        playerName: 'Test',
        offset: 40,
        sort: 'newlyListed',
        soldOnly: true,
      });
      expect(serverApiRequestAuthenticated).toHaveBeenCalledWith('/api/market/ebay', {
        method: 'POST',
        body: JSON.stringify({
          action: 'search',
          sandbox: false,
          params: { playerName: 'Test', offset: 40, sort: 'newlyListed' },
        }),
      });
    });
  });

  describe('getMarketValue', () => {
    it('returns zero values when no results', async () => {
      vi.mocked(serverApiRequestAuthenticated).mockResolvedValue({ itemSummaries: [] });
      const result = await ebayApi.getMarketValue({ playerName: 'Test' });
      expect(result).toEqual({
        averagePrice: 0,
        medianPrice: 0,
        priceRange: { min: 0, max: 0 },
        totalListings: 0,
        recentSales: [],
      });
    });

    it('calculates market value from listing prices (Browse API — active listings)', async () => {
      vi.mocked(serverApiRequestAuthenticated).mockResolvedValue({
        itemSummaries: [
          {
            itemId: '1',
            title: 'Card 1',
            price: { value: '10.00', currency: 'USD' },
            condition: 'Mint',
            itemCreationDate: '2024-01-01',
          },
          {
            itemId: '2',
            title: 'Card 2',
            price: { value: '20.00', currency: 'USD' },
            condition: 'Near Mint',
            itemCreationDate: '2024-01-02',
          },
          {
            itemId: '3',
            title: 'Card 3',
            price: { value: '30.00', currency: 'USD' },
            condition: 'Excellent',
            itemCreationDate: '2024-01-03',
          },
        ],
      });
      const result = await ebayApi.getMarketValue({ playerName: 'Test' });
      expect(result.averagePrice).toBe(20);
      expect(result.medianPrice).toBe(20);
      expect(result.priceRange).toEqual({ min: 10, max: 30 });
      expect(result.totalListings).toBe(3);
      expect(result.recentSales).toHaveLength(3);
    });

    it('handles items without prices', async () => {
      vi.mocked(serverApiRequestAuthenticated).mockResolvedValue({
        itemSummaries: [
          { itemId: '1', title: 'Card 1' },
          {
            itemId: '2',
            title: 'Card 2',
            price: { value: '10.00', currency: 'USD' },
          },
        ],
      });
      const result = await ebayApi.getMarketValue({ playerName: 'Test' });
      expect(result.totalListings).toBe(1);
      expect(result.recentSales[0].price).toBe(10);
    });

    it('returns zero aggregate when no item has a usable price', async () => {
      vi.mocked(serverApiRequestAuthenticated).mockResolvedValue({
        itemSummaries: [
          { itemId: '1', title: 'No price' },
          { itemId: '2', title: 'Bad price', price: { value: '', currency: 'USD' } },
        ],
      });
      const result = await ebayApi.getMarketValue({ playerName: 'Test' });
      expect(result).toEqual({
        averagePrice: 0,
        medianPrice: 0,
        priceRange: { min: 0, max: 0 },
        totalListings: 0,
        recentSales: [],
      });
    });

    it('limits recent sales to 10', async () => {
      const items = Array.from({ length: 15 }, (_, i) => ({
        itemId: `${i}`,
        title: `Card ${i}`,
        price: { value: `${i * 10}.00`, currency: 'USD' },
        condition: 'Mint',
        itemCreationDate: `2024-01-${String(i + 1).padStart(2, '0')}`,
      }));
      vi.mocked(serverApiRequestAuthenticated).mockResolvedValue({ itemSummaries: items });
      const result = await ebayApi.getMarketValue({ playerName: 'Test' });
      expect(result.recentSales).toHaveLength(10);
    });
  });

  describe('getItemDetails', () => {
    it('fetches item details', async () => {
      const mockItem = {
        itemId: '123',
        title: 'Test Card',
        price: { value: '10.00', currency: 'USD' },
      };
      vi.mocked(serverApiRequestAuthenticated).mockResolvedValue(mockItem);
      const result = await ebayApi.getItemDetails('123');
      expect(result).toEqual(mockItem);
      expect(serverApiRequestAuthenticated).toHaveBeenCalledWith('/api/market/ebay', {
        method: 'POST',
        body: JSON.stringify({
          action: 'item',
          sandbox: false,
          itemId: '123',
        }),
      });
    });
  });

  describe('testConnection', () => {
    it('returns success message on successful connection', async () => {
      vi.mocked(serverApiRequestAuthenticated).mockResolvedValue({ ok: true });
      const result = await ebayApi.testConnection();
      expect(result).toBe('eBay API connection successful');
    });

    it('returns error message on failed connection', async () => {
      vi.mocked(serverApiRequestAuthenticated).mockRejectedValue(new Error('Network error'));
      const result = await ebayApi.testConnection();
      expect(result).toContain('eBay API connection failed');
    });
  });
});
