import { describe, it, expect } from 'vitest';
import { getRarityTier, getTierStyles } from '../../lib/utils/rarity';
import type { CardInventory } from '../../types';

describe('rarity', () => {
  describe('getRarityTier', () => {
    it('returns OneOfOne for 1/1 cards', () => {
      const card: CardInventory = {
        id: 'card-1',
        player: 'Test Player',
        year: 2024,
        manufacturer: 'Topps',
        cardNumber: '1/1',
        set: 'Series 1',
        sport: 'Baseball',
        league: 'MLB',
        isAutographed: false,
        condition: 'Mint',
        isGraded: false,
        purchasePrice: 100,
        purchaseDate: '2024-01-01',
      };
      expect(getRarityTier(card)).toBe('OneOfOne');
    });

    it('returns OneOfOne for set containing 1/1', () => {
      const card: CardInventory = {
        id: 'card-1',
        player: 'Test Player',
        year: 2024,
        manufacturer: 'Topps',
        cardNumber: '1',
        set: 'Series 1 1/1',
        sport: 'Baseball',
        league: 'MLB',
        isAutographed: false,
        condition: 'Mint',
        isGraded: false,
        purchasePrice: 100,
        purchaseDate: '2024-01-01',
      };
      expect(getRarityTier(card)).toBe('OneOfOne');
    });

    it('returns OneOfOne when set mentions one of one', () => {
      const card: CardInventory = {
        id: 'card-1',
        player: 'Test Player',
        year: 2024,
        manufacturer: 'Topps',
        cardNumber: '2',
        set: 'Platinum ONE OF ONE',
        sport: 'Baseball',
        league: 'MLB',
        isAutographed: false,
        condition: 'Mint',
        isGraded: false,
        purchasePrice: 100,
        purchaseDate: '2024-01-01',
      };
      expect(getRarityTier(card)).toBe('OneOfOne');
    });

    it('returns Grail for high value cards', () => {
      const card: CardInventory = {
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
        currentValue: 15000,
        purchaseDate: '2024-01-01',
      };
      expect(getRarityTier(card)).toBe('Grail');
    });

    it('returns Ultra Rare for medium-high value cards', () => {
      const card: CardInventory = {
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
        currentValue: 2000,
        purchaseDate: '2024-01-01',
      };
      expect(getRarityTier(card)).toBe('Ultra Rare');
    });

    it('returns Rare for medium value cards', () => {
      const card: CardInventory = {
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
        currentValue: 750,
        purchaseDate: '2024-01-01',
      };
      expect(getRarityTier(card)).toBe('Rare');
    });

    it('returns Uncommon for low-medium value cards', () => {
      const card: CardInventory = {
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
        currentValue: 150,
        purchaseDate: '2024-01-01',
      };
      expect(getRarityTier(card)).toBe('Uncommon');
    });

    it('returns Common for low value cards', () => {
      const card: CardInventory = {
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
        purchasePrice: 50,
        purchaseDate: '2024-01-01',
      };
      expect(getRarityTier(card)).toBe('Common');
    });

    it('uses purchasePrice when currentValue is not available', () => {
      const card: CardInventory = {
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
        purchasePrice: 2000,
        purchaseDate: '2024-01-01',
      };
      expect(getRarityTier(card)).toBe('Ultra Rare');
    });
  });

  describe('getTierStyles', () => {
    it('returns styles for OneOfOne tier', () => {
      const styles = getTierStyles('OneOfOne');
      expect(styles.border).toContain('border-brand-lime');
      expect(styles.badge).toContain('bg-brand-lime');
    });

    it('returns styles for Grail tier', () => {
      const styles = getTierStyles('Grail');
      expect(styles.border).toContain('border-purple-500');
      expect(styles.badge).toContain('bg-purple-500');
    });

    it('returns styles for Ultra Rare tier', () => {
      const styles = getTierStyles('Ultra Rare');
      expect(styles.border).toContain('border-amber-400');
      expect(styles.badge).toContain('bg-amber-400');
    });

    it('returns styles for Rare tier', () => {
      const styles = getTierStyles('Rare');
      expect(styles.border).toContain('border-blue-400');
      expect(styles.badge).toContain('bg-blue-400');
    });

    it('returns styles for Uncommon tier', () => {
      const styles = getTierStyles('Uncommon');
      expect(styles.border).toContain('border-brand-green');
      expect(styles.badge).toContain('bg-brand-green');
    });

    it('returns styles for Common tier', () => {
      const styles = getTierStyles('Common');
      expect(styles.border).toContain('border-slate');
      expect(styles.badge).toContain('bg-slate');
    });

    it('returns all style properties', () => {
      const styles = getTierStyles('Rare');
      expect(styles).toHaveProperty('border');
      expect(styles).toHaveProperty('badge');
      expect(styles).toHaveProperty('glow');
      expect(styles).toHaveProperty('text');
    });
  });
});
