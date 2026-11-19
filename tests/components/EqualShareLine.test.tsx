import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import EqualShareLine from '../../components/EqualShareLine';
import { EQUAL_SHARE_NOTE } from '../../lib/analytics/equalShare';
import { clearPriceHistory, recordBatchSnapshots } from '../../lib/analytics/priceHistory';
import { makeCard } from '../helpers';

afterEach(() => {
  clearPriceHistory();
});

describe('EqualShareLine', () => {
  it('says when the book cannot name an equal share', () => {
    render(
      <MemoryRouter>
        <EqualShareLine inventory={[makeCard({ id: 'thin', currentValue: 40 })]} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Equal share')).toHaveTextContent(/stays off this desk/);
    expect(screen.getByText(EQUAL_SHARE_NOTE)).toBeInTheDocument();
    expect(screen.queryByLabelText('Equal share alert')).not.toBeInTheDocument();
  });

  it('labels a favorites tape apart from the book', () => {
    render(
      <MemoryRouter>
        <EqualShareLine inventory={[makeCard({ id: 'star', currentValue: 40 })]} ids={['star']} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Favorites equal share')).toHaveTextContent(/1 favorite stays off/);
  });

  it('recomputes when price history arrives after the first render', () => {
    const inventory = [
      makeCard({ id: 'up', player: 'Heavy', currentValue: 600 }),
      makeCard({ id: 'down', player: 'Light', currentValue: 80 }),
    ];
    render(
      <MemoryRouter>
        <EqualShareLine inventory={inventory} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Equal share')).toHaveTextContent(/does not name an equal share/);

    act(() => {
      recordBatchSnapshots([
        { id: 'up', value: 400, timestamp: '2026-08-01T00:00:00.000Z' },
        { id: 'up', value: 600, timestamp: '2026-09-01T00:00:00.000Z' },
        { id: 'down', value: 100, timestamp: '2026-08-01T00:00:00.000Z' },
        { id: 'down', value: 80, timestamp: '2026-09-01T00:00:00.000Z' },
      ]);
    });
    expect(screen.getByLabelText('Equal share')).toHaveTextContent(/\$300 of the \$500 start above/);
    expect(screen.getByLabelText('Equal share')).toHaveTextContent(/would match the index/);
    expect(screen.queryByLabelText('Equal share alert')).not.toBeInTheDocument();
  });

  it('links the card whose equal share would clear a lag', () => {
    recordBatchSnapshots([
      { id: 'drag', value: 400, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'drag', value: 280, timestamp: '2026-09-01T00:00:00.000Z' },
      { id: 'lift', value: 100, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'lift', value: 140, timestamp: '2026-09-01T00:00:00.000Z' },
    ]);
    render(
      <MemoryRouter>
        <EqualShareLine
          inventory={[
            makeCard({ id: 'drag', player: 'Drag', currentValue: 280 }),
            makeCard({ id: 'lift', player: 'Lift', currentValue: 140 }),
          ]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Equal share')).toHaveTextContent(/\$300 of the \$500 start below/);
    expect(screen.getByLabelText('Equal share alert')).toHaveTextContent(/Adding that start to Lift would match/);
    const link = screen.getByRole('link', { name: 'Open the equal share for Lift' });
    expect(link).toHaveAttribute('href', '/audit-dossier?cardId=lift');
    expect(link).toHaveClass('min-h-[44px]');
  });
});
