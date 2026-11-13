import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DeskNext from '../../components/DeskNext';
import HoldQueueField from '../../components/HoldQueueField';
import ShowDayRecap from '../../components/ShowDayRecap';
import { HOLD_QUEUE_CASH_KEY, type HoldQueueSource } from '../../lib/collector/holdQueue';
import { floorBuyId } from '../../lib/collector/showClose';
import { store } from '../../lib/dal/syncStore';
import { HAGGLE_KEY, addHaggle } from '../../lib/shows/showHaggleLog';
import { makeCard } from '../helpers';

const NOW = Date.parse('2026-10-31T12:00:00.000Z');

function source(overrides: Partial<HoldQueueSource> = {}): HoldQueueSource {
  return {
    id: 'near',
    player: 'Near',
    holdCall: 'hold',
    treatment: 'short-term',
    daysToLongTerm: 20,
    holdMarkUsd: 80,
    holdRealizedUsd: 56.8,
    ...overrides,
  };
}

describe('Hold queue field', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    store.remove(HOLD_QUEUE_CASH_KEY);
    store.remove(HAGGLE_KEY);
    cleanup();
  });

  it('stays off when no unsold card has a call', () => {
    render(<HoldQueueField unsold={[]} now={NOW} />);
    expect(screen.queryByRole('textbox', { name: 'Cash the table needs' })).not.toBeInTheDocument();
  });

  it('names the order, then the cards a typed need takes, and keeps that need on this browser', async () => {
    const user = userEvent.setup();
    const unsold = [
      source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 62, holdRealizedUsd: -4, daysToLongTerm: 12 }),
      source(),
    ];
    const view = render(<HoldQueueField unsold={unsold} now={NOW} />);
    const input = screen.getByRole('textbox', { name: 'Cash the table needs' });
    expect(input).toHaveClass('min-h-[44px]', 'text-base');
    expect(screen.getByLabelText('Hold queue')).toHaveTextContent(/sell under and clear before a hold/i);
    expect(screen.getByLabelText('Hold queue')).toHaveTextContent(/not a live tape/i);
    expect(screen.getAllByText(/not the eBay fee/i)).toHaveLength(2);

    await user.type(input, '50');
    expect(screen.getByLabelText('Hold queue')).toHaveTextContent('$50 at the table takes Cheap');
    expect(screen.getByLabelText('Hold queue')).toHaveTextContent('Gives up nothing');
    expect(screen.getByLabelText('Hold queue')).toHaveTextContent('Near stays a hold');
    expect(store.get(HOLD_QUEUE_CASH_KEY, null)).toBe(50);

    view.unmount();
    render(<HoldQueueField unsold={unsold} now={NOW} />);
    expect(screen.getByRole('textbox', { name: 'Cash the table needs' })).toHaveValue('50');

    await user.clear(screen.getByRole('textbox', { name: 'Cash the table needs' }));
    expect(screen.getByLabelText('Hold queue')).toHaveTextContent(/sell under and clear before a hold/i);
    expect(store.get(HOLD_QUEUE_CASH_KEY, null)).toBeNull();
  });

  it('leaves a stored need in place when the typed text is not a number', async () => {
    store.set(HOLD_QUEUE_CASH_KEY, 100);
    const user = userEvent.setup();
    const view = render(
      <MemoryRouter>
        <HoldQueueField unsold={[source()]} now={NOW} />
      </MemoryRouter>,
    );
    const input = screen.getByRole('textbox', { name: 'Cash the table needs' });
    expect(input).toHaveValue('100');
    expect(screen.getByLabelText('Hold slip alert')).toHaveTextContent(/still short/);
    await user.type(input, 'x');
    expect(input).toHaveValue('100x');
    expect(screen.getByLabelText('Hold queue')).toHaveTextContent(/sell under and clear before a hold/i);
    expect(screen.queryByLabelText('Hold slip alert')).not.toBeInTheDocument();
    expect(store.get(HOLD_QUEUE_CASH_KEY, null)).toBe(100);
    view.unmount();
    render(
      <MemoryRouter>
        <HoldQueueField unsold={[source()]} now={NOW} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('textbox', { name: 'Cash the table needs' })).toHaveValue('100');
  });

  it('puts the queue on the show profit and loss and the weekly recap', () => {
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
    const inventory = [makeCard({
      id: floorBuyId(noteId),
      player: 'Hold Player',
      purchasePrice: 20,
      currentValue: 80,
      purchaseDate: new Date(Date.now() - 330 * 24 * 60 * 60 * 1000).toISOString(),
    })];
    render(<ShowDayRecap showId="nyc" inventory={inventory} lines={[]} />);
    expect(screen.getByLabelText('Hold queue')).toHaveTextContent('Hold Player');
    expect(screen.getByLabelText('Hold queue')).toHaveTextContent(/gives up/i);
    cleanup();

    render(
      <MemoryRouter>
        <DeskNext inventory={inventory} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('region', { name: 'Weekly collection recap' })).toHaveTextContent('Hold Player');
    expect(screen.getByLabelText('Hold queue')).toHaveTextContent(/gives up/i);
    expect(screen.getByLabelText('Hold slip')).toHaveTextContent(/Next: sell Hold Player/);
    expect(screen.getByLabelText('Hold slip book')).toHaveTextContent(/No cash need is typed/);
    expect(screen.getByRole('button', { name: 'Download the hold slip' })).toHaveClass('min-h-[44px]');
  });

  it('warns when the typed need breaks a hold and downloads that order', async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => 'blob:slip');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const unsold = [
      source({ id: 'cheap', player: 'Cheap', holdCall: 'under', holdMarkUsd: 62, holdRealizedUsd: -4, daysToLongTerm: 12 }),
      source(),
    ];
    render(
      <MemoryRouter>
        <HoldQueueField unsold={unsold} now={NOW} />
      </MemoryRouter>,
    );
    expect(screen.queryByLabelText('Hold slip alert')).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Cash the table needs' }), '60');
    expect(screen.getByLabelText('Hold slip')).toHaveTextContent('Next: sell Cheap and Near. That covers $60 and gives up $8.52.');
    expect(screen.getByLabelText('Hold slip book')).toHaveTextContent('takes 2 cards, raises $136.32, and gives up $8.52');
    expect(screen.getByLabelText('Hold slip alert')).toHaveTextContent(/gives up \$8\.52 by selling Cheap and Near/);
    expect(screen.getByRole('link', { name: 'Open the hold slip for Near' })).toHaveAttribute('href', '/audit-dossier?cardId=near');
    expect(screen.getByRole('link', { name: 'Open the hold slip for Near' })).toHaveClass('min-h-[44px]');
    await user.click(screen.getByRole('button', { name: 'Download the hold slip' }));
    expect(createObjectURL).toHaveBeenCalled();
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(blob.type).toMatch(/text\/csv/);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:slip');
  });
});
