import React, { useMemo, useState } from 'react';
import { Handshake } from 'lucide-react';
import type { CardInventory } from '../types';
import {
  intentBoardDisclaimer,
  listIntents,
  postIntent,
  suggestAskFromCard,
  withdrawIntent,
  type IntentSide,
  type P2PIntent,
} from '../lib/utils/p2pIntentBoard';

interface Props {
  inventory: CardInventory[];
}

function cardLabel(card: CardInventory): string {
  return `${card.player} · ${card.year} ${card.set || card.manufacturer}`;
}

function heldCards(inventory: CardInventory[]): CardInventory[] {
  return inventory.filter((card) => card.status !== 'sold');
}

const P2PIntentBoard: React.FC<Props> = ({ inventory }) => {
  const held = useMemo(() => heldCards(inventory), [inventory]);
  const [intents, setIntents] = useState<P2PIntent[]>(() => listIntents());
  const [side, setSide] = useState<IntentSide>('ask');
  const [cardId, setCardId] = useState(held[0]?.id ?? '');
  const [player, setPlayer] = useState(held[0]?.player ?? '');
  const [limitPrice, setLimitPrice] = useState(String(held[0] ? suggestAskFromCard(held[0]).limitPrice : ''));
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const openIntents = intents.filter((intent) => intent.status === 'open');

  const applyCard = (id: string) => {
    setCardId(id);
    const card = held.find((item) => item.id === id);
    if (!card) return;
    setPlayer(card.player);
    setLimitPrice(String(suggestAskFromCard(card).limitPrice));
  };

  const handlePost = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      postIntent(
        {
          side,
          player,
          cardId: cardId || null,
          limitPrice: Number(limitPrice),
          note,
          source: cardId ? 'local_inventory' : 'manual',
        },
        inventory,
      );
      setIntents(listIntents());
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post intent.');
    }
  };

  const handleWithdraw = (id: string) => {
    withdrawIntent(id);
    setIntents(listIntents());
  };

  if (held.length === 0 && openIntents.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-slate-800 bg-brand-charcoal/60 p-5 md:p-6"
      aria-label="Peer intent board"
    >
      <div className="mb-4 flex items-center gap-2">
        <Handshake size={16} className="text-brand-lime" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-white">Peer intent board</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            Bids & asks as intents · local inventory · not a live exchange
          </p>
        </div>
      </div>
      <p className="mb-4 text-xs text-amber-200/90" role="note">
        {intentBoardDisclaimer()}
      </p>

      <form onSubmit={handlePost} className="mb-5 grid gap-3 md:grid-cols-2">
        <fieldset className="md:col-span-2">
          <legend className="sr-only">Intent side</legend>
          <div className="flex gap-2">
            {(['ask', 'bid'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={side === value}
                onClick={() => setSide(value)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                  side === value
                    ? 'bg-brand-lime text-brand-charcoal'
                    : 'border border-slate-700 text-brand-muted hover:text-white'
                }`}
              >
                {value === 'ask' ? 'Sell intent (ask)' : 'Buy intent (bid)'}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block text-xs text-brand-muted">
          Local holding
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-brand-slate px-3 py-2 text-sm text-white"
            value={cardId}
            onChange={(e) => applyCard(e.target.value)}
          >
            <option value="">{side === 'ask' ? 'Select a held card' : 'Optional — or type a player'}</option>
            {held.map((card) => (
              <option key={card.id} value={card.id}>
                {cardLabel(card)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-brand-muted">
          Player
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-brand-slate px-3 py-2 text-sm text-white"
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
            placeholder="e.g. Shohei Ohtani"
            required
          />
        </label>

        <label className="block text-xs text-brand-muted">
          Limit price (USD)
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-brand-slate px-3 py-2 text-sm text-white"
            type="number"
            min="1"
            step="1"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            required
          />
        </label>

        <label className="block text-xs text-brand-muted">
          Note (optional)
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-brand-slate px-3 py-2 text-sm text-white"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Advisory only — no matching"
          />
        </label>

        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-brand-lime px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-charcoal"
          >
            Post {side === 'ask' ? 'sell' : 'buy'} intent
          </button>
          {error && (
            <p className="text-xs text-brand-red" role="alert">
              {error}
            </p>
          )}
        </div>
      </form>

      {openIntents.length === 0 ? (
        <p className="text-xs text-brand-muted">No open intents. Post a bid or ask from local holdings.</p>
      ) : (
        <ul className="space-y-3">
          {openIntents.map((intent) => (
            <li
              key={intent.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-800/80 bg-brand-slate/30 px-4 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  <span className="mr-2 text-[10px] font-black uppercase tracking-widest text-brand-lime">
                    {intent.side === 'ask' ? 'Ask' : 'Bid'}
                  </span>
                  {intent.player} · ${intent.limitPrice.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-brand-muted">
                  {intent.source === 'local_inventory' ? 'From local inventory' : 'Manual watch'} · advisory only
                  {intent.note ? ` · ${intent.note}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleWithdraw(intent.id)}
                className="self-start rounded-lg border border-slate-700 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-white"
              >
                Withdraw
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default P2PIntentBoard;
