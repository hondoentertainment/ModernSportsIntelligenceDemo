import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import WeightGapLine from '../../components/WeightGapLine';
import { WEIGHT_GAP_NOTE } from '../../lib/analytics/weightGap';
import { clearPriceHistory, recordBatchSnapshots } from '../../lib/analytics/priceHistory';
import { makeCard } from '../helpers';

afterEach(() => {
  clearPriceHistory();
});

describe('WeightGapLine', () => {
  it('says when the book cannot price a weight gap', () => {
    render(
      <MemoryRouter>
        <WeightGapLine inventory={[makeCard({ id: 'thin', currentValue: 40 })]} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Weight gap')).toHaveTextContent(/stays off this desk/);
    expect(screen.getByText(WEIGHT_GAP_NOTE)).toBeInTheDocument();
    expect(screen.queryByLabelText('Weight gap alert')).not.toBeInTheDocument();
  });

  it('labels a favorites tape apart from the book', () => {
    render(
      <MemoryRouter>
        <WeightGapLine inventory={[makeCard({ id: 'star', currentValue: 40 })]} ids={['star']} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Favorites weight gap')).toHaveTextContent(/1 favorite stays off/);
  });

  it('recomputes when price history arrives after the first render', () => {
    const inventory = [
      makeCard({ id: 'up', player: 'Heavy', currentValue: 600 }),
      makeCard({ id: 'down', player: 'Light', currentValue: 80 }),
    ];
    render(
      <MemoryRouter>
        <WeightGapLine inventory={inventory} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Weight gap')).toHaveTextContent(/does not price a weight gap/);

    act(() => {
      recordBatchSnapshots([
        { id: 'up', value: 400, timestamp: '2026-08-01T00:00:00.000Z' },
        { id: 'up', value: 600, timestamp: '2026-09-01T00:00:00.000Z' },
        { id: 'down', value: 100, timestamp: '2026-08-01T00:00:00.000Z' },
        { id: 'down', value: 80, timestamp: '2026-09-01T00:00:00.000Z' },
      ]);
    });
    expect(screen.getByLabelText('Weight gap')).toHaveTextContent(/\$105 ahead/);
    expect(screen.getByLabelText('Weight gap')).toHaveTextContent(/Heavy is 80.0%/);
    expect(screen.queryByLabelText('Weight gap alert')).not.toBeInTheDocument();
  });

  it('links the card that carried a lag, not the percent drag', () => {
    recordBatchSnapshots([
      { id: 'drag', value: 400, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'drag', value: 280, timestamp: '2026-09-01T00:00:00.000Z' },
      { id: 'lift', value: 100, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'lift', value: 140, timestamp: '2026-09-01T00:00:00.000Z' },
    ]);
    render(
      <MemoryRouter>
        <WeightGapLine
          inventory={[
            makeCard({ id: 'drag', player: 'Drag', currentValue: 280 }),
            makeCard({ id: 'lift', player: 'Lift', currentValue: 140 }),
          ]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Weight gap')).toHaveTextContent(/\$105 behind/);
    expect(screen.getByLabelText('Weight gap alert')).toHaveTextContent(/Lift carried 57.1%/);
    const link = screen.getByRole('link', { name: 'Open the weight gap for Lift' });
    expect(link).toHaveAttribute('href', '/audit-dossier?cardId=lift');
    expect(link).toHaveClass('min-h-[44px]');
  });
});
