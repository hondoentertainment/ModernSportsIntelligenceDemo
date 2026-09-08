import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import P2PIntentBoard from '../../components/P2PIntentBoard';
import { makeCard } from '../helpers';
import {
  P2P_INTENT_BOARD_KEY,
  P2P_INTENT_DISCLOSURE,
  listOpenIntents,
  normalizeIntent,
} from '../../lib/utils/p2pIntentBoard';
import { store } from '../../lib/dal/syncStore';

describe('P2PIntentBoard', () => {
  beforeEach(() => {
    localStorage.clear();
    store.remove(P2P_INTENT_BOARD_KEY);
    store.clear();
  });

  it('returns nothing when inventory is empty', () => {
    const { container } = render(<P2PIntentBoard inventory={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('posts and withdraws a sell intent from a held card', async () => {
    const user = userEvent.setup();
    const inventory = [
      makeCard({ id: 'c1', player: 'Juan Soto', year: 2022, set: 'Chrome', currentValue: 240 }),
    ];
    render(<P2PIntentBoard inventory={inventory} />);

    expect(screen.getByRole('region', { name: /peer intent board/i })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(P2P_INTENT_DISCLOSURE);

    await user.clear(screen.getByLabelText(/limit price/i));
    await user.type(screen.getByLabelText(/limit price/i), '260');
    await user.click(screen.getByRole('button', { name: /post sell intent/i }));

    expect(screen.getByText(/Juan Soto · \$260/i)).toBeInTheDocument();
    expect(listOpenIntents()).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /withdraw/i }));
    expect(screen.getByText(/no open intents/i)).toBeInTheDocument();
    expect(listOpenIntents()).toHaveLength(0);
  });

  it('posts a buy intent without matching', async () => {
    const user = userEvent.setup();
    render(
      <P2PIntentBoard
        inventory={[makeCard({ id: 'c2', player: 'Held Card', currentValue: 80 })]}
      />,
    );

    await user.click(screen.getByRole('button', { name: /buy intent/i }));
    expect(screen.getByLabelText(/local holding/i)).toHaveValue('');
    expect(screen.getByLabelText(/^player$/i)).toHaveValue('Held Card');
    await user.clear(screen.getByLabelText(/^player$/i));
    await user.type(screen.getByLabelText(/^player$/i), 'Paul Skenes');
    await user.clear(screen.getByLabelText(/limit price/i));
    await user.type(screen.getByLabelText(/limit price/i), '310');
    await user.click(screen.getByRole('button', { name: /post buy intent/i }));

    expect(screen.getByText(/Paul Skenes · \$310/i)).toBeInTheDocument();
    expect(screen.getByText(/manual watch/i)).toBeInTheDocument();
    expect(listOpenIntents()[0]?.side).toBe('bid');
    expect(listOpenIntents()[0]?.source).toBe('manual');
    expect(listOpenIntents()[0]?.cardId).toBeNull();
  });

  it('rejects a sell intent when no held card is selected', async () => {
    const user = userEvent.setup();
    render(
      <P2PIntentBoard
        inventory={[makeCard({ id: 'c3', player: 'Held Card', currentValue: 80 })]}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/local holding/i), '');
    await user.click(screen.getByRole('button', { name: /post sell intent/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/held local inventory/i);
    expect(listOpenIntents()).toHaveLength(0);
  });

  it('refreshes open intents after DAL hydration', async () => {
    const remote = normalizeIntent({
      side: 'bid',
      player: 'Hydrated Bid',
      limitPrice: 99,
      source: 'manual',
    });
    expect(remote).not.toBeNull();
    store.clear();
    store.setAdapter({
      async keys() {
        return [P2P_INTENT_BOARD_KEY];
      },
      async get() {
        return [remote];
      },
      async set() {},
      async remove() {},
    });

    render(
      <P2PIntentBoard
        inventory={[makeCard({ id: 'c4', player: 'Held Card', currentValue: 80 })]}
      />,
    );
    expect(screen.getByText(/no open intents/i)).toBeInTheDocument();

    await act(async () => {
      await store.hydrate();
    });

    expect(screen.getByText(/Hydrated Bid · \$99/i)).toBeInTheDocument();
    store.clear();
    store.setAdapter({
      async keys() {
        return [];
      },
      async get() {
        return null;
      },
      async set() {},
      async remove() {},
    });
  });
});
