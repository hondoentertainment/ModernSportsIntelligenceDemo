import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CollectorAlertDigest from '../../components/CollectorAlertDigest';
import type { TargetWatchlist } from '../../types';

function target(id: string, player: string, targetPrice = 40): TargetWatchlist {
  return {
    id,
    player,
    cardDescription: '2024 Prizm',
    priority: 'High',
    targetPrice,
    currentMarketPrice: 100,
    sport: 'Basketball',
    league: 'NBA',
    status: 'active',
    createdAt: '2026-01-01',
    salesData: [
      { title: 'a', price: 80, condition: 'raw', soldAt: '2026-09-01' },
      { title: 'b', price: 100, condition: 'raw', soldAt: '2026-09-02' },
      { title: 'c', price: 120, condition: 'raw', soldAt: '2026-09-03' },
    ],
  };
}

describe('CollectorAlertDigest sale range', () => {
  it('places an active target on the sale range and says when the list is cut', () => {
    const targets = [
      target('under', 'Under Player', 10),
      ...Array.from({ length: 8 }, (_, index) => target(`more-${index}`, `More ${index}`)),
    ];
    render(
      <MemoryRouter>
        <CollectorAlertDigest targets={targets} inventory={[]} />
      </MemoryRouter>
    );
    const digest = screen.getByRole('region', { name: /watchlist and show alert digest/i });
    expect(digest).toHaveTextContent(/target versus the sale range/i);
    expect(digest).toHaveTextContent(/stable demo sketch|sold comps when those sales are stored/i);
    expect(digest).toHaveTextContent(/Under Player is under the low/);
    expect(digest).toHaveTextContent(/1 more target stays off this list/);
    expect(screen.getAllByRole('link', { name: 'Open' })[0]).toHaveClass('min-h-[44px]');
  });

  it('says when no target can be placed', () => {
    render(
      <MemoryRouter>
        <CollectorAlertDigest targets={[]} inventory={[]} />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/no active target has stored sales or a local mark/i)
    ).toBeInTheDocument();
  });
});
