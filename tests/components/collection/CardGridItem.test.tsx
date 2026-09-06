import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import CardGridItem from '../../../components/collection/CardGridItem';
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
    condition: 'PSA 10',
    grade: '10',
    gradingCompany: 'PSA',
    isGraded: true,
    purchasePrice: 5000,
    purchaseDate: '2020-01-01',
    currentValue: 8500,
    image: '',
    status: 'active',
    ...overrides,
  } as CardInventory;
}

function makeProps(card: CardInventory) {
  return {
    card,
    getRarityTier: () => 'Common',
    getTierStyles: () => ({ border: '', text: '', badge: '' }),
    isFavorite: () => false,
    toggleFavorite: vi.fn(),
    deleteCard: vi.fn(),
    setEditingAsset: vi.fn(),
    setIsAssetModalOpen: vi.fn(),
    handleAddToWatchlist: vi.fn(),
    handleUpdatePrice: vi.fn(),
    isPricing: null,
    getSparklineData: () => [1, 2, 3, 4, 5],
    getPriceTrend: () => 'up',
  } as const;
}

describe('CardGridItem — DataSourceBadge regression guard', () => {
  it('renders the "live" DataSourceBadge variant for a fresh ebay-api card', () => {
    const card = makeCard({
      valuationSource: 'ebay-api',
      valuationTimestamp: new Date().toISOString(),
    });
    render(<CardGridItem {...makeProps(card)} />);

    const liveBadges = screen.getAllByRole('status', { name: /live/i });
    expect(liveBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the "mock" DataSourceBadge variant when no valuationSource is provided', () => {
    const card = makeCard({
      valuationSource: undefined,
      valuationTimestamp: undefined,
      lastValuationDate: undefined,
    });
    render(<CardGridItem {...makeProps(card)} />);

    expect(screen.getByRole('status', { name: /demo data/i })).toBeInTheDocument();
  });

  it('renders the "stale" DataSourceBadge variant for an ebay-api card older than 7 days', () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    const card = makeCard({
      valuationSource: 'ebay-api',
      valuationTimestamp: eightDaysAgo,
    });
    render(<CardGridItem {...makeProps(card)} />);

    expect(screen.getByRole('status', { name: /stale/i })).toBeInTheDocument();
  });

  it('renders the "sample" DataSourceBadge variant for a gemini-sourced card', () => {
    const card = makeCard({ valuationSource: 'gemini' });
    render(<CardGridItem {...makeProps(card)} />);

    expect(screen.getByRole('status', { name: /sample/i })).toBeInTheDocument();
  });

  it('also renders the wordy valuation chip ("Live comps") alongside the badge for ebay-api cards', () => {
    const card = makeCard({
      valuationSource: 'ebay-api',
      valuationTimestamp: new Date().toISOString(),
    });
    render(<CardGridItem {...makeProps(card)} />);

    expect(screen.getByText(/live comps/i)).toBeInTheDocument();
  });

  it('renders Audit Dossier when onOpenDossier is wired (Collection already passes this handler)', () => {
    const onOpenDossier = vi.fn();
    const card = makeCard({ isGraded: false });
    render(
      <CardGridItem
        {...makeProps(card)}
        onOpenDossier={onOpenDossier}
        onOpenGradingCalc={vi.fn()}
        onOpenConsignment={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /audit dossier/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /grade premium calc/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /consignment/i })).toBeInTheDocument();
  });
});
