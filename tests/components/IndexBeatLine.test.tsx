import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import IndexBeatLine from '../../components/IndexBeatLine';
import { INDEX_BEAT_NOTE } from '../../lib/analytics/indexBeat';
import { clearPriceHistory, recordBatchSnapshots } from '../../lib/analytics/priceHistory';
import { makeCard } from '../helpers';

afterEach(() => {
  clearPriceHistory();
});

describe('IndexBeatLine', () => {
  it('says when the book cannot beat an index', () => {
    render(
      <MemoryRouter>
        <IndexBeatLine inventory={[makeCard({ id: 'thin', currentValue: 40 })]} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Index beat')).toHaveTextContent(/stays off this desk/);
    expect(screen.getByText(INDEX_BEAT_NOTE)).toBeInTheDocument();
    expect(screen.queryByLabelText('Index beat alert')).not.toBeInTheDocument();
  });

  it('labels a favorites tape apart from the book', () => {
    render(
      <MemoryRouter>
        <IndexBeatLine inventory={[makeCard({ id: 'star', currentValue: 40 })]} ids={['star']} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Favorites index beat')).toHaveTextContent(/1 favorite stays off/);
  });

  it('recomputes when price history arrives after the first render', () => {
    const inventory = [
      makeCard({ id: 'up', player: 'Heavy', currentValue: 600 }),
      makeCard({ id: 'down', player: 'Light', currentValue: 80 }),
    ];
    render(
      <MemoryRouter>
        <IndexBeatLine inventory={inventory} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Index beat')).toHaveTextContent(/stay off this desk/);
    expect(screen.queryByLabelText('Index beat alert')).not.toBeInTheDocument();

    act(() => {
      recordBatchSnapshots([
        { id: 'drag', value: 400, timestamp: '2026-08-01T00:00:00.000Z' },
        { id: 'drag', value: 280, timestamp: '2026-09-01T00:00:00.000Z' },
        { id: 'lift', value: 100, timestamp: '2026-08-01T00:00:00.000Z' },
        { id: 'lift', value: 140, timestamp: '2026-09-01T00:00:00.000Z' },
      ]);
    });
    expect(screen.getByLabelText('Index beat')).toHaveTextContent(/stay off this desk/);

    act(() => {
      recordBatchSnapshots([
        { id: 'up', value: 400, timestamp: '2026-08-01T00:00:00.000Z' },
        { id: 'up', value: 600, timestamp: '2026-09-01T00:00:00.000Z' },
        { id: 'down', value: 100, timestamp: '2026-08-01T00:00:00.000Z' },
        { id: 'down', value: 80, timestamp: '2026-09-01T00:00:00.000Z' },
      ]);
    });
    expect(screen.getByLabelText('Index beat')).toHaveTextContent(/beat that index by 21.0 points/);
    expect(screen.queryByLabelText('Index beat alert')).not.toBeInTheDocument();

    act(() => {
      recordBatchSnapshots([
        { id: 'up', value: 280, timestamp: '2026-10-01T00:00:00.000Z' },
        { id: 'down', value: 140, timestamp: '2026-10-01T00:00:00.000Z' },
      ]);
    });
    expect(screen.getByLabelText('Index beat alert')).toHaveTextContent(/Heavy dragged it/);
  });

  it('links the card that dragged a lagging book', () => {
    recordBatchSnapshots([
      { id: 'drag', value: 400, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'drag', value: 280, timestamp: '2026-09-01T00:00:00.000Z' },
      { id: 'lift', value: 100, timestamp: '2026-08-01T00:00:00.000Z' },
      { id: 'lift', value: 140, timestamp: '2026-09-01T00:00:00.000Z' },
    ]);
    render(
      <MemoryRouter>
        <IndexBeatLine
          inventory={[
            makeCard({ id: 'drag', player: 'Drag', currentValue: 280 }),
            makeCard({ id: 'lift', player: 'Lift', currentValue: 140 }),
          ]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('Index beat')).toHaveTextContent(/lagged that index by 21.0 points/);
    expect(screen.getByLabelText('Index beat alert')).toHaveTextContent(/Drag dragged it/);
    const link = screen.getByRole('link', { name: 'Open the index beat for Drag' });
    expect(link).toHaveAttribute('href', '/audit-dossier?cardId=drag');
    expect(link).toHaveClass('min-h-[44px]');
  });
});
