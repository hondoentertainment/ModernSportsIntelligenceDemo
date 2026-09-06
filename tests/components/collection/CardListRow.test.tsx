import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import CardListRow from '../../../components/collection/CardListRow';
import type { CardItemActionHandlers } from '../../../components/collection/cardItemActions';
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
    isGraded: false,
    purchasePrice: 5000,
    purchaseDate: '2020-01-01',
    currentValue: 8500,
    image: '',
    status: 'active',
    searchUrl: 'https://ebay.example/trout',
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
    onOpenExitStrategy: vi.fn(),
    onOpenGradingCalc: vi.fn(),
    onOpenDossier: vi.fn(),
    onOpenConsignment: vi.fn(),
    ...overrides,
  };
}

function renderRow(
  card: CardInventory = makeCard(),
  handlers: CardItemActionHandlers = makeHandlers(),
  extras: { isSelected?: boolean; onToggleSelect?: (id: string) => void } = {},
) {
  const onToggleSelect = extras.onToggleSelect ?? vi.fn();
  render(
    <table>
      <tbody>
        <CardListRow
          card={card}
          {...handlers}
          isSelected={extras.isSelected}
          onToggleSelect={onToggleSelect}
        />
      </tbody>
    </table>,
  );
  return { handlers, onToggleSelect };
}

describe('CardListRow — grid action parity', () => {
  it('renders the Collection-wired per-card actions with accessible names', () => {
    renderRow();

    expect(screen.getByRole('button', { name: 'Add to favorites' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit asset' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete asset' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to Watchlist' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark as Sold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Intelligence Check' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exit strategy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Grade Premium Calc' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Consignment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Audit Dossier' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Verify on eBay' })).toHaveAttribute(
      'href',
      'https://ebay.example/trout',
    );
  });

  it('feeds row selection into the existing batch-select handler', async () => {
    const user = userEvent.setup();
    const { onToggleSelect } = renderRow();

    await user.click(screen.getByRole('checkbox', { name: 'Select Mike Trout' }));
    expect(onToggleSelect).toHaveBeenCalledWith('card-1');
  });

  it('invokes the same handlers the grid uses for price, exit, grade, and consignment', async () => {
    const user = userEvent.setup();
    const { handlers } = renderRow();

    await user.click(screen.getByRole('button', { name: 'Intelligence Check' }));
    expect(handlers.handleUpdatePrice).toHaveBeenCalledWith(expect.objectContaining({ id: 'card-1' }));

    await user.click(screen.getByRole('button', { name: 'Exit strategy' }));
    expect(handlers.onOpenExitStrategy).toHaveBeenCalledWith(expect.objectContaining({ id: 'card-1' }));

    await user.click(screen.getByRole('button', { name: 'Grade Premium Calc' }));
    expect(handlers.onOpenGradingCalc).toHaveBeenCalledWith(expect.objectContaining({ id: 'card-1' }));

    await user.click(screen.getByRole('button', { name: 'Consignment' }));
    expect(handlers.onOpenConsignment).toHaveBeenCalledWith(expect.objectContaining({ id: 'card-1' }));
  });

  it('shows source, stale, and thin-market provenance chips', () => {
    renderRow(
      makeCard({
        valuationSource: 'historical-comps',
        lastValuationDate: '2020-01-01',
        liquidityScore: 20,
        valuationConfidence: 0.7,
        pricingRationale: 'Four sold comps on a thin book.',
      }),
    );
    expect(screen.getByText('Historical comps')).toBeInTheDocument();
    expect(screen.getByText('Thin market')).toBeInTheDocument();
    expect(screen.getByTitle(/70% conf/)).toBeInTheDocument();
  });

  it('marks the row selected for the batch toolbar highlight', () => {
    renderRow(makeCard(), makeHandlers(), { isSelected: true });

    expect(screen.getByRole('checkbox', { name: 'Select Mike Trout' })).toHaveAttribute('aria-checked', 'true');
  });
});
