import React, { useMemo, useState, useSyncExternalStore } from 'react';
import type { CardInventory } from '../types';
import {
  EXIT_RECORD_NOTE,
  SHOW_EXIT_NOTE,
  buildExitPatch,
  exitRowCopy,
  showExit,
  type ExitRow,
} from '../lib/collector/showExit';
import { rangeForSeat } from '../lib/collector/saleRange';
import { haggleSnapshot, subscribeHaggle } from '../lib/shows/showHaggleLog';

interface Props {
  showId: string;
  inventory: CardInventory[];
  purchaseDate?: string;
  onRecordSale?: (cardId: string, patch: Partial<CardInventory>) => Promise<void> | void;
}

const ShowExitPanel: React.FC<Props> = ({ showId, inventory, purchaseDate = '', onRecordSale }) => {
  const notes = useSyncExternalStore(subscribeHaggle, haggleSnapshot, haggleSnapshot);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const exit = useMemo(() => showExit({
    notes: notes.filter((note) => note.showId === showId),
    inventory,
    rangeForId: (id) => {
      const card = inventory.find((row) => row.id === id);
      return card ? rangeForSeat(card) : null;
    },
  }), [notes, showId, inventory]);
  const shown = exit.rows.slice(0, 8);

  const record = async (row: ExitRow) => {
    if (!onRecordSale || !row.cardId) return;
    const card = inventory.find((item) => item.id === row.cardId);
    const note = notes.find((item) => item.id === row.id);
    const patch = card && note
      ? buildExitPatch({ note, card, purchaseDate, existingNotes: card.notes })
      : null;
    if (!patch || !row.cardId) {
      setError('That sale needs a card you still hold.');
      return;
    }
    setPendingId(row.id);
    setError(null);
    try {
      await onRecordSale(row.cardId, patch);
    } catch {
      setError('Could not record that sale. The collection was not changed.');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section className="mt-3 rounded-xl border border-slate-800 p-3" aria-label="Show exit">
      <h3 className="text-xs font-black uppercase tracking-widest text-white">Show exit</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{SHOW_EXIT_NOTE}</p>
      <p className="mt-2 text-xs text-slate-200" aria-label="Show exit totals">{exit.copy}</p>
      {shown.length > 0 ? (
        <ul className="mt-2 space-y-2" aria-label="Show exit cards">
          {shown.map((row) => (
            <li key={row.id} className="text-xs text-slate-300">
              <p>{exitRowCopy(row)}</p>
              {onRecordSale && row.held && row.cardId ? (
                <button
                  type="button"
                  disabled={pendingId === row.id}
                  onClick={() => { void record(row); }}
                  className="mt-2 min-h-[44px] rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-100 disabled:opacity-50"
                >
                  {pendingId === row.id ? 'Recording…' : `Record ${row.player} sale`}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {exit.rows.length > 8 ? (
        <p className="mt-1 text-xs text-slate-500">
          {exit.rows.length - 8 === 1
            ? '1 more card stays off this list.'
            : `${exit.rows.length - 8} more cards stay off this list.`}
        </p>
      ) : null}
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{EXIT_RECORD_NOTE}</p>
      {error ? <p className="mt-1 text-[11px] text-rose-300" role="alert">{error}</p> : null}
    </section>
  );
};

export default ShowExitPanel;
