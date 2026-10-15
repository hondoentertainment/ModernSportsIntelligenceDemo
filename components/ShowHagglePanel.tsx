import React, { useState } from 'react';
import type { CardInventory } from '../types';
import { compsSnapshot } from '../lib/collector/deskNext';
import { askCallCopy, askVersusMedian } from '../lib/collector/floorPack';
import {
  HAGGLE_DISCLOSURE,
  addHaggle,
  readHaggle,
  removeHaggle,
  type HaggleResult,
} from '../lib/shows/showHaggleLog';

interface Props {
  showId: string;
  showName: string;
  inventory?: CardInventory[];
}

function heldCards(inventory: CardInventory[]): CardInventory[] {
  return inventory.filter((card) => card.status !== 'sold' && card.status !== 'consignment');
}

function parsedAsk(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function savedAskCopy(cards: CardInventory[], cardId: string | undefined, askUsd: number): string | null {
  if (!cardId) return null;
  const card = cards.find((item) => item.id === cardId);
  if (!card) return 'That card is no longer in the book.';
  return askCopy(card, askUsd);
}

function askCopy(card: CardInventory, askUsd: number): string {
  const snap = compsSnapshot(card);
  const versus = askVersusMedian(askUsd, snap.median);
  const basis = snap.source === 'comps' ? 'comps' : snap.source === 'demo' ? 'demo' : 'none';
  return askCallCopy({ call: versus.call, gapPct: versus.gapPct, basis, medianUsd: snap.median });
}

const ShowHagglePanel: React.FC<Props> = ({ showId, showName, inventory = [] }) => {
  const cards = heldCards(inventory);
  const [notes, setNotes] = useState(() => readHaggle(showId));
  const [dealer, setDealer] = useState('');
  const [table, setTable] = useState('');
  const [ask, setAsk] = useState('');
  const [offer, setOffer] = useState('');
  const [result, setResult] = useState<HaggleResult>('open');
  const [note, setNote] = useState('');
  const [cardId, setCardId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const askUsd = parsedAsk(ask);
  const picked = cards.find((card) => card.id === cardId);
  const liveAsk = picked && askUsd != null ? askCopy(picked, askUsd) : null;

  const save = () => {
    const saved = addHaggle({
      showId,
      dealer,
      table,
      askUsd: Number(ask),
      offerUsd: Number(offer),
      result,
      note,
      cardId: cardId || undefined,
    });
    setNotes(saved.notes);
    setError(saved.error);
    if (!saved.error) {
      setDealer('');
      setTable('');
      setAsk('');
      setOffer('');
      setNote('');
      setResult('open');
      setCardId('');
    }
  };

  return (
    <div className="mt-4 space-y-3" role="tabpanel" aria-label={`Table notes for ${showName}`}>
      <p className="text-[11px] leading-relaxed text-slate-400">{HAGGLE_DISCLOSURE}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Dealer
          <input value={dealer} onChange={(event) => setDealer(event.target.value)} aria-label={`Dealer at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
        </label>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Table
          <input value={table} onChange={(event) => setTable(event.target.value)} aria-label={`Table at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
        </label>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Ask
          <input inputMode="decimal" value={ask} onChange={(event) => setAsk(event.target.value)} aria-label={`Ask at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
        </label>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Offer
          <input inputMode="decimal" value={offer} onChange={(event) => setOffer(event.target.value)} aria-label={`Offer at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
        </label>
      </div>
      {cards.length > 0 && (
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
          Card for the ask
          <select value={cardId} onChange={(event) => setCardId(event.target.value)} aria-label={`Card for the ask at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm">
            <option value="">No card</option>
            {cards.map((card) => <option key={card.id} value={card.id}>{card.player}</option>)}
          </select>
        </label>
      )}
      {liveAsk ? <p className="text-xs text-slate-200" aria-label="Ask versus median">{liveAsk}</p> : null}
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
        Result
        <select value={result} onChange={(event) => setResult(event.target.value as HaggleResult)} aria-label={`Result at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm">
          <option value="open">Open</option>
          <option value="bought">Bought</option>
          <option value="passed">Passed</option>
        </select>
      </label>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
        Note
        <input value={note} onChange={(event) => setNote(event.target.value)} aria-label={`Note at ${showName}`} className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white md:text-sm" />
      </label>
      {error && <p className="text-[11px] text-rose-300" role="alert">{error}</p>}
      <button type="button" onClick={save} className="min-h-[44px] rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-100">
        Add table note
      </button>
      {notes.length === 0 ? (
        <p className="text-sm text-slate-400">No table notes for this show yet.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((row) => {
            const versus = savedAskCopy(cards, row.cardId, row.askUsd);
            return (
              <li key={row.id} className="rounded-lg border border-slate-800 px-3 py-3" aria-label={`${row.dealer} ${row.table}`}>
                <p className="text-sm text-white">{row.dealer} · table {row.table}</p>
                <p className="font-mono text-xs text-slate-300">
                  Ask ${row.askUsd.toFixed(2)} · offer ${row.offerUsd.toFixed(2)} · {row.result}
                </p>
                {row.note ? <p className="text-xs text-slate-400">{row.note}</p> : null}
                {versus ? <p className="text-xs text-slate-300">{versus}</p> : null}
                <button
                  type="button"
                  onClick={() => setNotes(removeHaggle(showId, row.id))}
                  className="mt-2 min-h-[44px] rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-100"
                >
                  Remove {row.dealer}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ShowHagglePanel;
