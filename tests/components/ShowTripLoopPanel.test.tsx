import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ShowBuyOpportunity } from '../../lib/shows/showBuyingDesk';
import ShowTripLoopPanel from '../../components/ShowTripLoopPanel';
import type { CardInventory } from '../../types';
import { makeCard } from '../helpers';

function opportunity(overrides: Partial<ShowBuyOpportunity> = {}): ShowBuyOpportunity {
  return {
    id: 'nyc:buy:mike-trout',
    showId: 'nyc',
    kind: 'collection-gap',
    action: 'buy-at-show',
    player: 'Mike Trout',
    detail: '2011 Topps Update',
    why: 'gap',
    tapeLabel: 'Local / demo tape',
    consensusMark: 100,
    askPrice: 80,
    discountPct: null,
    cardId: null,
    targetId: 't1',
    compsHref: null,
    collectionHref: '/collection',
    showBagHref: '/card-show-mode',
    score: 20,
    ...overrides,
  };
}

function Harness({
  inventory = [],
  onFileBuy,
  onRecordSale,
}: {
  inventory?: CardInventory[];
  onFileBuy: (card: CardInventory) => Promise<void> | void;
  onRecordSale: (cardId: string, patch: Partial<CardInventory>) => Promise<void> | void;
}) {
  const [book, setBook] = useState(inventory);
  return (
    <ShowTripLoopPanel
      showId="nyc"
      showName="NYC Monthly Card Meetup"
      admissionUsd={5}
      distanceMiles={null}
      purchaseDate="2026-10-18"
      opportunities={[
        opportunity(),
        opportunity({
          id: 'nyc:sell:judge',
          kind: 'sell-into-room',
          action: 'bring-to-negotiate',
          player: 'Aaron Judge',
          detail: '2017 Chrome',
          consensusMark: 50,
          askPrice: null,
          cardId: 'judge',
          targetId: null,
        }),
      ]}
      inventory={book}
      targets={[{
        id: 't1',
        player: 'Mike Trout',
        cardDescription: '2011 Topps Update',
        priority: 'High',
        targetPrice: 100,
        currentMarketPrice: 80,
        sport: 'Baseball',
        league: 'MLB',
        status: 'active',
        createdAt: '2026-01-01',
      }]}
      fallbackSport="Baseball"
      onFileBuy={async (card) => {
        await onFileBuy(card);
        setBook((prev) => [card, ...prev]);
      }}
      onRecordSale={async (cardId, patch) => {
        await onRecordSale(cardId, patch);
        setBook((prev) => prev.map((row) => (row.id === cardId ? { ...row, ...patch } : row)));
      }}
    />
  );
}

describe('ShowTripLoopPanel', () => {
  it('plans a budget, logs a floor buy, and files it into the collection', async () => {
    const user = userEvent.setup();
    const onFileBuy = vi.fn();
    const onRecordSale = vi.fn();
    render(
      <Harness
        inventory={[makeCard({ id: 'judge', player: 'Aaron Judge', year: 2017, purchasePrice: 20, currentValue: 50 })]}
        onFileBuy={onFileBuy}
        onRecordSale={onRecordSale}
      />,
    );

    expect(screen.getByRole('region', { name: /show trip loop for nyc monthly/i })).toBeInTheDocument();
    expect(screen.getByText(/not live market movers or sports card investor parity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cash you are bringing/i)).toHaveValue('40.00');
    expect(screen.getByRole('status')).toHaveTextContent(/fits/i);

    await user.clear(screen.getByLabelText(/cash you are bringing/i));
    await user.type(screen.getByLabelText(/cash you are bringing/i), '10');
    expect(screen.getByRole('status')).toHaveTextContent(/short/i);
    await user.click(screen.getByRole('button', { name: /save cash budget/i }));

    await user.click(screen.getByRole('tab', { name: /floor calls/i }));
    await user.click(screen.getByRole('button', { name: /^buy$/i }));
    expect(screen.getByText(/logged buy at \$80\.00 · under the local mark/i)).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /floor calls \(1\)/i }));
    await user.click(screen.getByRole('button', { name: /^sell$/i }));
    await user.click(screen.getByRole('tab', { name: /recap/i }));
    expect(screen.getByText(/25\.0%/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /file into collection/i }));
    expect(onFileBuy).toHaveBeenCalledTimes(1);
    expect(onFileBuy.mock.calls[0][0].purchasePrice).toBe(80);
    expect(onFileBuy.mock.calls[0][0].player).toBe('Mike Trout');
    expect(screen.getByText(/in the collection/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /record sale in collection/i }));
    expect(onRecordSale).toHaveBeenCalledWith('judge', expect.objectContaining({ status: 'sold', salePrice: 50 }));
    expect(screen.getByText(/sale already in the book/i)).toBeInTheDocument();
  });

  it('rejects a blank table price and a bad cash amount', async () => {
    const user = userEvent.setup();
    render(
      <Harness onFileBuy={vi.fn()} onRecordSale={vi.fn()} />,
    );
    const cash = screen.getByLabelText(/cash you are bringing/i);
    await user.clear(cash);
    await user.type(cash, '-4');
    await user.click(screen.getByRole('button', { name: /save cash budget/i }));
    expect(screen.getByText(/enter a dollar amount/i)).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /floor calls/i }));
    const price = screen.getAllByLabelText(/table price/i)[0];
    await user.clear(price);
    await user.click(screen.getByRole('button', { name: /^buy$/i }));
    expect(screen.getByText(/enter a table price of 0 or more/i)).toBeInTheDocument();
  });
});
