import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import LiquidityPoolWidget from '../../components/LiquidityPoolWidget';
import { store } from '../../lib/dal/syncStore';
import { P2P_INTENT_BOARD_KEY, normalizeIntent } from '../../lib/utils/p2pIntentBoard';
import { makeCard } from '../helpers';

describe('LiquidityPoolWidget intent summary', () => {
  beforeEach(() => {
    localStorage.clear();
    store.remove(P2P_INTENT_BOARD_KEY);
    store.clear();
  });

  it('refreshes buy/sell counts after DAL hydration', async () => {
    const remote = normalizeIntent({
      side: 'ask',
      player: 'Hydrated Ask',
      limitPrice: 40,
      cardId: 'c-liq',
      source: 'local_inventory',
    });
    expect(remote).not.toBeNull();
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
      <MemoryRouter>
        <LiquidityPoolWidget
          inventory={[makeCard({ id: 'c-liq', player: 'Held Card', currentValue: 80 })]}
          onInstantBuy={() => {}}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText(/0 buy · 0 sell intents/i)).toBeInTheDocument();

    await act(async () => {
      await store.hydrate();
    });

    expect(screen.getByText(/0 buy · 1 sell intents/i)).toBeInTheDocument();
    store.clear();
  });
});
