import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import MarketPulseRail from '../../components/MarketPulseRail';
import { MARKET_PULSE_DISCLOSURE } from '../../lib/analytics/marketPulse';
import { makeCard } from '../helpers';

describe('MarketPulseRail', () => {
  it('renders multi-segment Pulse with disclosure', () => {
    render(
      <MarketPulseRail
        inventory={[
          makeCard({ id: 'a', sport: 'Baseball', year: 2018, currentValue: 200 }),
          makeCard({ id: 'b', set: 'Hobby Box', year: 2024, currentValue: 80 }),
        ]}
      />,
    );
    expect(screen.getByRole('region', { name: /market pulse/i })).toBeInTheDocument();
    expect(screen.getByText(MARKET_PULSE_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText(/sealed vs singles/i)).toBeInTheDocument();
  });
});
