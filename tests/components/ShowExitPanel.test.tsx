import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import ShowExitPanel from '../../components/ShowExitPanel';
import { HAGGLE_KEY } from '../../lib/shows/showHaggleLog';
import { store } from '../../lib/dal/syncStore';
import { makeCard } from '../helpers';

const sales = [
  { title: 'sold 80', price: 80, condition: 'raw', soldAt: '2026-09-01' },
  { title: 'sold 100', price: 100, condition: 'raw', soldAt: '2026-09-02' },
  { title: 'sold 120', price: 120, condition: 'raw', soldAt: '2026-09-03' },
];

function seed(notes: unknown[]): void {
  act(() => {
    store.set(HAGGLE_KEY, notes);
  });
}

describe('Show exit panel', () => {
  it('records the price you took and reports a failed write', async () => {
    const user = userEvent.setup();
    const onRecordSale = vi.fn(async () => undefined);
    seed([
      {
        id: 'exit-1',
        showId: 'nyc',
        dealer: 'Rivera',
        table: '12',
        askUsd: 80,
        offerUsd: 100,
        result: 'sold',
        note: '',
        player: 'Aaron Judge',
        cardId: 'judge',
        savedAt: '2026-10-30T00:00:00.000Z',
      },
      ...Array.from({ length: 8 }, (_, index) => ({
        id: `extra-${index}`,
        showId: 'nyc',
        dealer: 'Ace',
        table: String(index),
        askUsd: 10,
        offerUsd: 10,
        result: 'sold',
        note: '',
        player: `Extra ${index}`,
        cardId: `missing-${index}`,
        savedAt: '2026-10-30T00:00:00.000Z',
      })),
    ]);
    render(
      <ShowExitPanel
        showId="nyc"
        inventory={[makeCard({
          id: 'judge',
          player: 'Aaron Judge',
          purchasePrice: 40,
          currentValue: 100,
          notes: 'In the binder',
          salesData: sales,
        })]}
        purchaseDate="2026-10-30"
        onRecordSale={onRecordSale}
      />,
    );
    expect(screen.getByLabelText('Show exit totals')).toHaveTextContent(/Exit: 9 cards/i);
    expect(screen.getByLabelText('Show exit totals')).toHaveTextContent(/not a settlement and not a live tape/i);
    expect(screen.getByText(/1 more card stays off this list/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Record Aaron Judge sale' }));
    expect(onRecordSale).toHaveBeenCalledWith('judge', expect.objectContaining({
      status: 'sold',
      salePrice: 100,
      saleDate: '2026-10-30',
      realizedGainLoss: 56,
    }));
    expect(String(onRecordSale.mock.calls[0][1].notes)).toMatch(/In the binder/);

    onRecordSale.mockRejectedValueOnce(new Error('no'));
    await user.click(screen.getByRole('button', { name: 'Record Aaron Judge sale' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/could not record that sale/i);
  });

  it('leaves a missing card and an empty show without a record button', () => {
    seed([{
      id: 'gone',
      showId: 'nyc',
      dealer: 'Ace',
      table: '2',
      askUsd: 20,
      offerUsd: 20,
      result: 'sold',
      player: 'Mike Trout',
      cardId: 'trout',
      savedAt: '2026-10-30T00:00:00.000Z',
    }]);
    const view = render(<ShowExitPanel showId="nyc" inventory={[]} onRecordSale={async () => undefined} />);
    expect(screen.queryByRole('button', { name: /record/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Show exit totals')).toHaveTextContent(/not in the book/i);

    seed([{
      id: 'held',
      showId: 'other',
      dealer: 'Ace',
      table: '2',
      askUsd: 20,
      offerUsd: 20,
      result: 'sold',
      player: 'Aaron Judge',
      cardId: 'judge',
      savedAt: '2026-10-30T00:00:00.000Z',
    }]);
    view.rerender(
      <ShowExitPanel
        showId="nyc"
        inventory={[makeCard({ id: 'judge', player: 'Aaron Judge', status: 'sold', salePrice: 20 })]}
      />,
    );
    expect(screen.getByLabelText('Show exit totals')).toHaveTextContent(/no sold table note/i);
    expect(screen.queryByRole('button', { name: /record/i })).not.toBeInTheDocument();
  });

  it('keeps a record button for a held sale past the first eight rows', () => {
    seed(Array.from({ length: 9 }, (_, index) => ({
      id: `exit-${index}`,
      showId: 'nyc',
      dealer: 'Ace',
      table: String(index),
      askUsd: 10,
      offerUsd: 10,
      result: 'sold',
      player: `Extra ${index}`,
      cardId: `card-${index}`,
      savedAt: '2026-10-30T00:00:00.000Z',
    })));
    render(
      <ShowExitPanel
        showId="nyc"
        inventory={Array.from({ length: 9 }, (_, index) => makeCard({
          id: `card-${index}`,
          player: `Extra ${index}`,
          purchasePrice: 4,
        }))}
        onRecordSale={async () => undefined}
      />,
    );
    expect(screen.getByRole('button', { name: 'Record Extra 8 sale' })).toBeInTheDocument();
  });
});
