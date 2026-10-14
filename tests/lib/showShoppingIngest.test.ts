import { describe, expect, it } from 'vitest';
import type { ShopLine } from '../../lib/shows/showShoppingList';
import {
  buildShoppingBuyDraft,
  formatIngestUsd,
  parsePaidUsd,
  parseShopDetail,
  shoppingDraftId,
} from '../../lib/shows/showShoppingIngest';

function buy(overrides: Partial<ShopLine> = {}): ShopLine {
  return {
    id: 'nyc-monthly:buy:tatum',
    showId: 'nyc-monthly',
    kind: 'collection-gap',
    side: 'buy',
    player: 'Jayson Tatum',
    detail: '2024 Topps Chrome #12 Auto',
    sport: 'Basketball',
    targetBuyUsd: 180,
    marketMarkUsd: 200,
    collectorCeilingUsd: 220,
    priceSource: 'Local mark',
    tapeLabel: 'Local / demo tape',
    why: 'gap',
    cardId: null,
    targetId: 'tatum',
    copies: null,
    extraCopies: null,
    ...overrides,
  };
}

describe('show shopping ingest', () => {
  it('parses a paid price and a shop description', () => {
    expect(parsePaidUsd(' $1,250.50 ')).toBe(1250.5);
    expect(parsePaidUsd('0')).toBe(0);
    expect(parsePaidUsd('-1')).toBeNull();
    expect(parsePaidUsd('')).toBeNull();
    expect(parseShopDetail('2024 Topps Chrome #12 Auto')).toEqual({
      year: 2024,
      manufacturer: 'Topps',
      setName: 'Chrome',
      cardNumber: '12',
      autographed: true,
    });
    expect(parseShopDetail('Prizm Silver')).toMatchObject({
      manufacturer: 'Show purchase',
      setName: 'Prizm Silver',
      cardNumber: '',
      autographed: false,
    });
    expect(parseShopDetail('2019 Upper Deck Young Guns #249')).toMatchObject({
      manufacturer: 'Upper Deck',
      setName: 'Young Guns',
      cardNumber: '249',
    });
  });

  it('files a buy with the typed price as cost basis', () => {
    const draft = buildShoppingBuyDraft({
      line: buy(),
      paidUsd: 150,
      showName: 'NYC Monthly Card Meetup',
      purchaseDate: '2026-10-18',
    });
    expect(draft).toMatchObject({
      id: 'shop:nyc-monthly:tatum',
      player: 'Jayson Tatum',
      year: 2024,
      manufacturer: 'Topps',
      set: 'Chrome',
      cardNumber: '12',
      sport: 'Basketball',
      league: 'NBA',
      isAutographed: true,
      purchasePrice: 150,
      taxBasis: 150,
      currentValue: 200,
      purchaseDate: '2026-10-18',
      status: 'active',
    });
    expect(draft?.notes).toMatch(/NYC Monthly Card Meetup/);
    expect(formatIngestUsd(150)).toBe('$150.00');
    expect(shoppingDraftId('nyc-monthly', buy())).toBe(draft?.id);
  });

  it('refuses sell lines and a missing price, and falls back when the description is thin', () => {
    expect(buildShoppingBuyDraft({
      line: buy({ side: 'sell', kind: 'duplicate-sell' }),
      paidUsd: 10,
      showName: 'Show',
      purchaseDate: '2026-10-18',
    })).toBeNull();
    expect(buildShoppingBuyDraft({
      line: buy(),
      paidUsd: Number.NaN,
      showName: 'Show',
      purchaseDate: '2026-10-18',
    })).toBeNull();
    const thin = buildShoppingBuyDraft({
      line: buy({
        detail: 'Watchlist target',
        marketMarkUsd: null,
        targetId: null,
        sport: 'Hockey',
        player: '  ',
      }),
      paidUsd: 0,
      showName: '  ',
      purchaseDate: 'not-a-date',
    });
    expect(thin).toMatchObject({
      id: 'shop:nyc-monthly:nyc-monthly:buy:tatum',
      player: 'Unknown player',
      year: 2026,
      manufacturer: 'Show purchase',
      set: 'Watchlist target',
      league: 'Other',
      purchasePrice: 0,
      taxBasis: 0,
      purchaseDate: '2026-01-01',
      currentValue: undefined,
    });
    expect(thin?.notes).toMatch(/Local card show/);
  });
});
