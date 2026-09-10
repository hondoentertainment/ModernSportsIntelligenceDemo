import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import RatioIntelligenceRail from '../../components/RatioIntelligenceRail';
import { RATIO_INTELLIGENCE_DISCLOSURE } from '../../lib/analytics/ratioIntelligence';
import { makeCard } from '../helpers';
import type { MarketComp } from '../../types';

function comps(): MarketComp[] {
  return [
    { title: 'raw NM', price: 100, condition: 'raw', soldAt: '2026-08-01' },
    { title: 'PSA 9', price: 180, condition: 'PSA 9', soldAt: '2026-08-08' },
    { title: 'PSA 10', price: 400, condition: 'PSA 10', soldAt: '2026-08-15' },
  ];
}

describe('RatioIntelligenceRail', () => {
  it('returns nothing without ratio rows', () => {
    const { container } = render(
      <RatioIntelligenceRail inventory={[makeCard({ status: 'sold', currentValue: 900 })]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows grade ladder disclosure and player spread', () => {
    render(
      <RatioIntelligenceRail
        inventory={[
          makeCard({ id: 'a', player: 'Trout', year: 2011, set: 'Update', currentValue: 400, salesData: comps() }),
          makeCard({ id: 'b', player: 'Trout', year: 2018, set: 'Chrome', currentValue: 120 }),
        ]}
      />,
    );
    expect(screen.getByRole('region', { name: /ratio intelligence/i })).toBeInTheDocument();
    expect(screen.getByText(RATIO_INTELLIGENCE_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getAllByText(/Trout/).length).toBeGreaterThan(0);
  });
});
