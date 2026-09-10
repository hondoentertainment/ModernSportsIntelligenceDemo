import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import PortfolioMoversRail from '../../components/PortfolioMoversRail';
import { PORTFOLIO_MOVERS_DISCLOSURE } from '../../lib/analytics/portfolioMovers';
import { clearPriceHistory, recordBatchSnapshots } from '../../lib/analytics/priceHistory';
import { makeCard } from '../helpers';

afterEach(() => {
  clearPriceHistory();
});

describe('PortfolioMoversRail', () => {
  it('shows an honest empty state without snapshot tape', () => {
    render(
      <MemoryRouter>
        <PortfolioMoversRail inventory={[makeCard({ id: 'x', currentValue: 50 })]} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: /collection top movers/i })).toBeInTheDocument();
    expect(screen.getByText(PORTFOLIO_MOVERS_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText(/not enough local snapshots/i)).toBeInTheDocument();
  });

  it('lists favorites movers from snapshots', () => {
    recordBatchSnapshots([
      { id: 'up', value: 100, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'up', value: 130, timestamp: '2026-09-01T00:00:00.000Z' },
    ]);
    render(
      <MemoryRouter>
        <PortfolioMoversRail
          inventory={[makeCard({ id: 'up', player: 'Gainer', currentValue: 130 })]}
          favoriteIds={['up']}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: /favorites top movers/i })).toBeInTheDocument();
    expect(screen.getByText('Gainer')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /favorites/i })).toHaveAttribute('href', '/favorites');
  });
});
