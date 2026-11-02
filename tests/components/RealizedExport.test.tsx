import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DeskNext from '../../components/DeskNext';
import ShowDayRecap from '../../components/ShowDayRecap';
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
    store.remove(HAGGLE_KEY);
  });
});
