import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import WatchlistPriceCard from '../../components/WatchlistPriceCard';
import type { TargetWatchlist } from '../../types';

vi.mock('../../lib/analytics/priceHistory.ts', () => ({
  getSparklineData: () => [1, 2, 3],
  getPriceTrend: () => 'stable',
}));

function makeTarget(overrides: Partial<TargetWatchlist> = {}): TargetWatchlist {
  return {
    id: 't-1',
    player: 'Shohei Ohtani',
    cardDescription: '2018 Chrome RC',
    priority: 'High',
    targetPrice: 400,
    currentMarketPrice: 900,
    valuationSource: 'gemini',
    valuationTimestamp: '2026-08-01T00:00:00.000Z',
    sport: 'Baseball',
    league: 'MLB',
    status: 'active',
    createdAt: '2026-03-01T00:00:00.000Z',
    salesData: [
      { title: 'Sold A', price: 210, condition: 'Raw', soldAt: new Date().toISOString() },
      { title: 'Sold B', price: 220, condition: 'Raw', soldAt: new Date().toISOString() },
      { title: 'Sold C', price: 230, condition: 'Raw', soldAt: new Date().toISOString() },
    ],
    ...overrides,
  };
}

describe('WatchlistPriceCard — Phase B pricing truth', () => {
  it('defaults the market mark to sold-comp consensus and labels it honestly', () => {
    render(<WatchlistPriceCard target={makeTarget()} onDelete={vi.fn()} onMarkAcquired={vi.fn()} />);

    expect(screen.getByText('$220')).toBeInTheDocument();
    expect(screen.queryByText('$900')).not.toBeInTheDocument();
    expect(screen.getByText(/sold comps/i)).toBeInTheDocument();
    expect(screen.getByText(/3 comps/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /comps used/i })).toBeInTheDocument();
  });

  it('surfaces a stale chip when the valuation stamp is older than 7 days', () => {
    render(
      <WatchlistPriceCard
        target={makeTarget({
          salesData: undefined,
          currentMarketPrice: 180,
          valuationSource: 'gemini',
          valuationTimestamp: '2026-01-01T00:00:00.000Z',
        })}
        onDelete={vi.fn()}
        onMarkAcquired={vi.fn()}
      />,
    );

    expect(screen.getByText(/stale/i)).toBeInTheDocument();
    expect(screen.getByText(/ai estimate/i)).toBeInTheDocument();
  });
});
