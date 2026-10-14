import React, { useMemo, useState } from 'react';
import type { CardInventory, TargetWatchlist } from '../types';
import type { ResolvedLocalCardShow } from '../lib/shows/localCardShowCatalog';
import { buildShowShoppingList, type ShopLine } from '../lib/shows/showShoppingList';
import {
  SHOPPING_INGEST_DISCLOSURE,
  buildShoppingBuyDraft,
  formatIngestUsd,
  parsePaidUsd,
  shoppingDraftId,
} from '../lib/shows/showShoppingIngest';

interface FileProps {
  lines: ShopLine[];
  inventory: CardInventory[];
  showName: string;
  purchaseDate: string;
  idPrefix?: string;
  onFileBuy: (card: CardInventory) => Promise<void> | void;
}

export function ShoppingBuyFiles({ lines, inventory, showName, purchaseDate, idPrefix = 'shop', onFileBuy }: FileProps) {
  const [paid, setPaid] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileLine = async (line: ShopLine) => {
    const raw = paid[line.id] ?? (line.targetBuyUsd == null ? '' : line.targetBuyUsd.toFixed(2));
    const amount = parsePaidUsd(raw);
    const draft = amount == null ? null : buildShoppingBuyDraft({ line, paidUsd: amount, showName, purchaseDate });
    if (!draft) {
      setErrors((prev) => ({ ...prev, [line.id]: 'Enter a paid price of 0 or more.' }));
      return;
    }
    setPendingId(line.id);
    setErrors((prev) => ({ ...prev, [line.id]: '' }));
    try {
      await onFileBuy(draft);
    } catch {
      setErrors((prev) => ({ ...prev, [line.id]: 'Could not file that buy. The collection was not changed.' }));
    } finally {
      setPendingId(null);
    }
  };

  if (lines.length === 0) return null;

  return (
    <ul className="mt-2 space-y-2">
      {lines.map((line) => {
        const draftId = shoppingDraftId(line.showId, line);
        const held = inventory.find((row) => row.id === draftId);
        const value = paid[line.id] ?? (line.targetBuyUsd == null ? '' : line.targetBuyUsd.toFixed(2));
        return (
          <li key={line.id}>
            {held ? (
              <p className="text-[11px] text-emerald-300">
                {line.player} in the collection · cost basis {formatIngestUsd(held.purchasePrice)}
              </p>
            ) : (
              <>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor={`${idPrefix}-paid-${line.id}`}>
                  Paid price for {line.player}
                  <input
                    id={`${idPrefix}-paid-${line.id}`}
                    inputMode="decimal"
                    value={value}
                    onChange={(event) => setPaid((prev) => ({ ...prev, [line.id]: event.target.value }))}
                    className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-base font-medium normal-case tracking-normal text-white md:text-sm"
                  />
                </label>
                <button
                  type="button"
                  disabled={pendingId === line.id}
                  onClick={() => { void fileLine(line); }}
                  className="mt-2 min-h-[44px] rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-100 disabled:opacity-50"
                >
                  {pendingId === line.id ? 'Filing…' : `Add ${line.player} to collection`}
                </button>
              </>
            )}
            {errors[line.id] ? <p className="mt-1 text-[11px] text-rose-300" role="alert">{errors[line.id]}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}

interface RecapProps {
  show: ResolvedLocalCardShow;
  inventory: CardInventory[];
  targets: TargetWatchlist[];
  liveTape: boolean;
  onFileBuy: (card: CardInventory) => Promise<void> | void;
}

const ShoppingRecapIngest: React.FC<RecapProps> = ({ show, inventory, targets, liveTape, onFileBuy }) => {
  const buys = useMemo(
    () => buildShowShoppingList({ show, inventory, targets, liveTape }).buys,
    [show, inventory, targets, liveTape],
  );
  return (
    <section className="mt-4 rounded-lg border border-slate-800 px-3 py-3" aria-label={`Shopping list recap for ${show.name}`}>
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Shopping list buys</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{SHOPPING_INGEST_DISCLOSURE}</p>
      {buys.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">No shopping-list buys on this show.</p>
      ) : (
        <ShoppingBuyFiles
          lines={buys}
          inventory={inventory}
          showName={show.name}
          purchaseDate={show.endDate}
          idPrefix={`recap-${show.id}`}
          onFileBuy={onFileBuy}
        />
      )}
    </section>
  );
};

export default ShoppingRecapIngest;
