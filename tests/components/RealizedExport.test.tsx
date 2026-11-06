import { describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DeskNext from '../../components/DeskNext';
import ShowDayRecap from '../../components/ShowDayRecap';
import { floorBuyId } from '../../lib/collector/showClose';
import { exitMarker } from '../../lib/collector/showExit';
import { store } from '../../lib/dal/syncStore';
import { HAGGLE_KEY, addHaggle } from '../../lib/shows/showHaggleLog';
import { makeCard } from '../helpers';

describe('realized results export', () => {
  it('downloads the show sale and this week’s sale', async () => {
    store.remove(HAGGLE_KEY);
    const user = userEvent.setup();
    const added = addHaggle({
      showId: 'nyc',
      dealer: 'Rivera',
      table: '1',
      askUsd: 90,
      offerUsd: 80,
      result: 'sold',
      note: '',
      player: 'Aaron Judge',
      cardId: 'judge',
      savedAt: new Date().toISOString(),
    });
    const noteId = added.notes[0]?.id ?? '';
    const inventory = [makeCard({
      id: 'judge',
      player: 'Aaron Judge',
      status: 'sold',
      purchasePrice: 40,
      salePrice: 80,
      purchaseDate: '2024-01-01',
      saleDate: '2026-10-30',
      notes: `${exitMarker(noteId)} sold.`,
    })];
    const createObjectURL = vi.fn(() => 'blob:realized');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });

    const view = render(
      <ShowDayRecap showId="nyc" inventory={inventory} lines={[]} />,
    );
    expect(screen.getByRole('region', { name: 'Show profit and loss' })).toHaveTextContent(/long-term/i);
    expect(screen.getByLabelText('Show profit and loss totals')).toHaveTextContent(
      /holding buckets: long-term 1 card, taken \$80, card-show fee \$3\.2, realized \$36\.8/i,
    );
    expect(screen.getByText(/not a tax form and not a live tape/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Download realized results' }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    view.unmount();

    render(
      <MemoryRouter>
        <DeskNext inventory={inventory} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /download this week's realized results/i }));
    expect(createObjectURL).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText('Show profit and loss this week')).toHaveTextContent(/holding buckets: long-term/i);
    store.remove(HAGGLE_KEY);
    cleanup();
  });

  it('names an unsold show card that should wait for long-term', () => {
    cleanup();
    store.remove(HAGGLE_KEY);
    const added = addHaggle({
      showId: 'nyc',
      dealer: 'Rivera',
      table: '2',
      askUsd: 30,
      offerUsd: 20,
      result: 'bought',
      note: '',
      player: 'Hold Player',
      savedAt: new Date().toISOString(),
    });
    const noteId = added.notes[0]?.id ?? '';
    render(
      <ShowDayRecap
        showId="nyc"
        lines={[]}
        inventory={[makeCard({
          id: floorBuyId(noteId),
          player: 'Hold Player',
          purchasePrice: 20,
          currentValue: 80,
          purchaseDate: new Date(Date.now() - 330 * 24 * 60 * 60 * 1000).toISOString(),
        })]}
      />,
    );
    expect(screen.getByRole('list', { name: 'Unsold inventory' })).toHaveTextContent(/hold until long-term · mark \$80/i);
    expect(screen.getByLabelText('Show profit and loss totals')).toHaveTextContent(
      /hold call: hold 1 card inside 45 days of long-term \(Hold Player\)/i,
    );
    store.remove(HAGGLE_KEY);
  });
});
