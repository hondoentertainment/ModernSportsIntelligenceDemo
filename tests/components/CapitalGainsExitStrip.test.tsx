import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CapitalGainsExitStrip from '../../components/CapitalGainsExitStrip';
import { CAPITAL_GAINS_EXIT_DISCLOSURE } from '../../lib/analytics/capitalGainsExit';
import { makeCard } from '../helpers';

describe('CapitalGainsExitStrip', () => {
  it('returns nothing without holdings', () => {
    const { container } = render(<CapitalGainsExitStrip inventory={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('compares this year vs next for a short-term lot', () => {
    render(
      <CapitalGainsExitStrip
        card={makeCard({
          player: 'Short Lot',
          purchaseDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
          purchasePrice: 100,
          currentValue: 400,
        })}
      />,
    );
    expect(screen.getByRole('region', { name: /capital gains exit simulator/i })).toBeInTheDocument();
    expect(screen.getByText(CAPITAL_GAINS_EXIT_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText(/Short Lot/)).toBeInTheDocument();
    expect(screen.getByText(/short term/i)).toBeInTheDocument();
  });
});
