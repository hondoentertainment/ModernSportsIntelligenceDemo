import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import DealFinderLiteRail from '../../components/DealFinderLiteRail';
import { DEAL_FINDER_LITE_DISCLOSURE } from '../../lib/analytics/dealFinderLite';
import { makeCard } from '../helpers';
import type { TargetWatchlist } from '../../types';

describe('DealFinderLiteRail', () => {
  it('shows the empty scan state', () => {
    render(
      <MemoryRouter>
        <DealFinderLiteRail inventory={[makeCard({ currentValue: 100 })]} targets={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: /deal finder lite/i })).toBeInTheDocument();
    expect(screen.getByText(DEAL_FINDER_LITE_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText(/no watchlist/i)).toBeInTheDocument();
  });

  it('renders a great-deal candidate', () => {
    const target: TargetWatchlist = {
      id: 't1',
      player: 'Mike Trout',
      cardDescription: '2011 Update',
      priority: 'High',
      targetPrice: 500,
      currentMarketPrice: 300,
      sport: 'Baseball',
      league: 'MLB',
      status: 'active',
      createdAt: '2026-01-01',
    };
    render(
      <MemoryRouter>
        <DealFinderLiteRail
          inventory={[makeCard({ player: 'Mike Trout', year: 2011, set: 'Update', currentValue: 500, purchasePrice: 200 })]}
          targets={[target]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Mike Trout')).toBeInTheDocument();
    expect(screen.getByText(/great deal/i)).toBeInTheDocument();
  });
});
