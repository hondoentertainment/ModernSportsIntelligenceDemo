import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import NegotiationAnalyticsPanel from '../../components/NegotiationAnalyticsPanel';
import {
  computeNegotiationStats,
  emptyNegotiationStats,
  type NegotiationIntel,
  type NegotiationRecord,
} from '../../lib/trading/negotiationAnalytics';

function wrap(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function populatedIntel(): NegotiationIntel {
  const records: NegotiationRecord[] = [
    {
      id: 'a',
      itemName: 'Ohtani',
      listingPrice: 200,
      finalPrice: 160,
      maxWillingToPay: 170,
      discount: 20,
      roundCount: 3,
      outcome: 'accepted',
      playbook: 'Fair Market Anchor',
      timestamp: '2026-03-01T00:00:00.000Z',
      durationMs: 3_600_000,
    },
    {
      id: 'b',
      itemName: 'Judge',
      listingPrice: 100,
      finalPrice: 100,
      maxWillingToPay: 80,
      discount: 0,
      roundCount: 1,
      outcome: 'walked',
      playbook: 'Lowball & Walk',
      timestamp: '2026-03-02T00:00:00.000Z',
      durationMs: 600_000,
    },
  ];
  return {
    stats: computeNegotiationStats(records),
    source: 'simulated',
    records,
    arenaCount: 0,
    simulatedCount: 2,
  };
}

describe('NegotiationAnalyticsPanel', () => {
  it('renders empty-state dashes and honest copy', () => {
    wrap(
      <NegotiationAnalyticsPanel
        intel={{
          stats: emptyNegotiationStats(),
          source: 'empty',
          records: [],
          arenaCount: 0,
          simulatedCount: 0,
        }}
      />,
    );

    expect(screen.getByRole('region', { name: /negotiation analytics/i })).toBeInTheDocument();
    expect(screen.getByText('Win rate')).toBeInTheDocument();
    expect(screen.getByText('Avg discount')).toBeInTheDocument();
    expect(screen.getByText('Time to close')).toBeInTheDocument();
    expect(screen.getByText('Walk / incomplete')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText(/no negotiation outcomes yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open agent desk/i })).toHaveAttribute(
      'href',
      '/autonomous-acquisition',
    );
  });

  it('renders populated KPIs and simulated disclosure', () => {
    wrap(<NegotiationAnalyticsPanel intel={populatedIntel()} />);

    const region = screen.getByRole('region', { name: /negotiation analytics/i });
    expect(region).toHaveTextContent('50%');
    expect(region).toHaveTextContent('20%');
    expect(region).toHaveTextContent('1h');
    expect(region).toHaveTextContent('$40 saved');
    expect(screen.getByText(/simulated campaign negotiations/i)).toBeInTheDocument();
    expect(screen.queryByText(/no negotiation outcomes yet/i)).not.toBeInTheDocument();
  });

  it('shows playbook breakdown in the embedded variant', () => {
    wrap(<NegotiationAnalyticsPanel intel={populatedIntel()} variant="embedded" />);

    expect(screen.getByText('By playbook')).toBeInTheDocument();
    expect(screen.getByText('Fair Market Anchor')).toBeInTheDocument();
    expect(screen.getByText('Lowball & Walk')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /open agent desk/i })).not.toBeInTheDocument();
  });

  it('uses mixed-source copy when both histories are present', () => {
    const intel = populatedIntel();
    intel.source = 'mixed';
    intel.arenaCount = 1;
    wrap(<NegotiationAnalyticsPanel intel={intel} />);
    expect(screen.getByText(/combines your arena history/i)).toBeInTheDocument();
  });
});
