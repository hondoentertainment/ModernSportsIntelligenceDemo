import { describe, it, expect, vi } from 'vitest';
import {
  getCardItemActions,
  getCardItemActionsForSurface,
  type CardItemActionHandlers,
} from '../../../components/collection/cardItemActions';
import type { CardInventory } from '../../../types';

function makeCard(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'card-1',
    player: 'Mike Trout',
    year: 2011,
    manufacturer: 'Topps Update',
    cardNumber: 'US175',
    set: 'Topps Update',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Raw',
    grade: undefined,
    gradingCompany: undefined,
    isGraded: false,
    purchasePrice: 5000,
    purchaseDate: '2020-01-01',
    currentValue: 8500,
    image: '',
    status: 'active',
    ...overrides,
  } as CardInventory;
}

function makeHandlers(overrides: Partial<CardItemActionHandlers> = {}): CardItemActionHandlers {
  return {
    isFavorite: () => false,
    toggleFavorite: vi.fn(),
    deleteCard: vi.fn(),
    setEditingAsset: vi.fn(),
    setIsAssetModalOpen: vi.fn(),
    handleAddToWatchlist: vi.fn(),
    handleUpdatePrice: vi.fn(),
    isPricing: null,
    ...overrides,
  };
}

/** Handlers Collection.tsx actually wires into grid + list. */
function collectionWiredHandlers(): CardItemActionHandlers {
  return makeHandlers({
    onOpenExitStrategy: vi.fn(),
    onOpenGradingCalc: vi.fn(),
    onOpenDossier: vi.fn(),
    onOpenConsignment: vi.fn(),
  });
}

describe('getCardItemActions', () => {
  it('exposes the Collection-wired grid actions on the list surface', () => {
    const ids = getCardItemActionsForSurface(
      makeCard({ searchUrl: 'https://ebay.example/trout' }),
      collectionWiredHandlers(),
      'list',
    ).map(action => action.id);

    expect(ids).toEqual([
      'favorite',
      'edit',
      'delete',
      'watchlist',
      'sold',
      'updatePrice',
      'exitStrategy',
      'gradingCalc',
      'consignment',
      'dossier',
      'ebay',
    ]);
  });

  it('hides grading calc for graded cards and consignment/sold for sold cards', () => {
    const graded = getCardItemActions(makeCard({ isGraded: true, grade: '10', gradingCompany: 'PSA' }), collectionWiredHandlers())
      .map(action => action.id);
    expect(graded).not.toContain('gradingCalc');

    const sold = getCardItemActions(makeCard({ status: 'sold', isGraded: true }), collectionWiredHandlers())
      .map(action => action.id);
    expect(sold).not.toContain('sold');
    expect(sold).not.toContain('consignment');
  });

  it('omits optional Labs-style actions unless their handlers are passed', () => {
    const ids = getCardItemActions(makeCard(), collectionWiredHandlers()).map(action => action.id);

    expect(ids).not.toContain('predictive');
    expect(ids).not.toContain('thesis');
    expect(ids).not.toContain('marketDepth');
    expect(ids).not.toContain('gradePrediction');
    expect(ids).not.toContain('breakEven');
    expect(ids).not.toContain('taxLot');
    expect(ids).not.toContain('priceHistory');
    expect(ids).not.toContain('anomaly');
    expect(ids).not.toContain('instantBuy');
  });

  it('keeps exit strategy on list only so grid can keep the market-depth row', () => {
    const handlers = collectionWiredHandlers();
    const card = makeCard();

    expect(getCardItemActionsForSurface(card, handlers, 'list').map(a => a.id)).toContain('exitStrategy');
    expect(getCardItemActionsForSurface(card, handlers, 'body').map(a => a.id)).not.toContain('exitStrategy');
    expect(getCardItemActionsForSurface(card, handlers, 'overlay').map(a => a.id)).not.toContain('exitStrategy');
  });

  it('includes optional body actions when those handlers are provided', () => {
    const ids = getCardItemActionsForSurface(
      makeCard(),
      makeHandlers({
        onOpenPredictive: vi.fn(),
        onOpenThesis: vi.fn(),
        onInstantBuy: vi.fn(),
      }),
      'body',
    ).map(action => action.id);

    expect(ids).toEqual(expect.arrayContaining(['updatePrice', 'predictive', 'thesis', 'instantBuy']));
  });
});
