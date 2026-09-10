import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import HoldingHorizonRail from '../../components/HoldingHorizonRail';
import { HOLDING_HORIZON_DISCLOSURE } from '../../lib/analytics/holdingHorizon';
import { makeCard } from '../helpers';

describe('HoldingHorizonRail', () => {
  it('returns nothing without active holdings', () => {
    const { container } = render(
      <HoldingHorizonRail inventory={[makeCard({ status: 'sold', purchaseDate: '2024-01-01' })]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows ST/LT and wash-sale proximity copy', () => {
    render(
      <HoldingHorizonRail
        inventory={[
          makeCard({
            id: 'hold',
            player: 'Mike Trout',
            purchaseDate: '2026-09-05',
            currentValue: 400,
          }),
          makeCard({
            id: 'sold',
            player: 'Mike Trout',
            purchaseDate: '2024-01-01',
            saleDate: '2026-09-02',
            salePrice: 50,
            purchasePrice: 120,
            status: 'sold',
          }),
        ]}
      />,
    );
    expect(screen.getByRole('region', { name: /holding horizon/i })).toBeInTheDocument();
    expect(screen.getByText(HOLDING_HORIZON_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText(/Mike Trout/)).toBeInTheDocument();
    expect(screen.getByText(/same lot is within the 30-day wash-sale window/i)).toBeInTheDocument();
  });
});
