import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import PortfolioConcentrationRail from '../../components/PortfolioConcentrationRail';
import { CONCENTRATION_DISCLOSURE } from '../../lib/analytics/portfolioConcentration';
import { makeCard } from '../helpers';

describe('PortfolioConcentrationRail', () => {
  it('returns nothing without NAV', () => {
    const { container } = render(
      <MemoryRouter>
        <PortfolioConcentrationRail inventory={[makeCard({ currentValue: 0, purchasePrice: 0 })]} />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows player and league shares with advisory rebalance links', () => {
    render(
      <MemoryRouter>
        <PortfolioConcentrationRail
          inventory={[
            makeCard({ id: 't1', player: 'Mike Trout', currentValue: 8000, purchasePrice: 4000 }),
            makeCard({ id: 't2', player: 'Mike Trout', currentValue: 2000, cardNumber: '2' }),
            makeCard({ id: 'o1', player: 'Other Guy', league: 'NBA', sport: 'Basketball', currentValue: 400 }),
          ]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: /portfolio concentration/i })).toBeInTheDocument();
    expect(screen.getByText(CONCENTRATION_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getAllByText(/Mike Trout/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /trade proposals/i })).toHaveAttribute('href', '/collection');
  });
});
