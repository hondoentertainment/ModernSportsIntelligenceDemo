import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CardCompareDeskPanel from '../../components/CardCompareDeskPanel';
import { CARD_COMPARE_DESK_DISCLOSURE } from '../../lib/analytics/cardCompareDesk';
import { makeCard } from '../helpers';

describe('CardCompareDeskPanel', () => {
  it('asks for two holdings when incomplete', () => {
    render(<CardCompareDeskPanel cards={[makeCard({ id: 'a' })]} />);
    expect(screen.getByText(/two or three holdings/i)).toBeInTheDocument();
  });

  it('renders desk metrics for two cards', () => {
    render(
      <CardCompareDeskPanel
        cards={[
          makeCard({ id: 'a', player: 'Trout', currentValue: 200, purchasePrice: 100 }),
          makeCard({ id: 'b', player: 'Judge', currentValue: 90, purchasePrice: 80 }),
        ]}
      />,
    );
    expect(screen.getByRole('region', { name: /card compare desk/i })).toBeInTheDocument();
    expect(screen.getByText(CARD_COMPARE_DESK_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText('Trout')).toBeInTheDocument();
    expect(screen.getByText('Judge')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Trout' })).toBeInTheDocument();
    expect(screen.getByText('Preferred mark')).toBeInTheDocument();
  });
});
