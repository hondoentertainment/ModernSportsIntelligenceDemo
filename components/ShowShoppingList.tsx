import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ShoppingBag } from 'lucide-react';
import type { CardInventory, TargetWatchlist } from '../types';
import type { ResolvedLocalCardShow } from '../lib/shows/localCardShowCatalog';
import {
  buildShowShoppingList,
  shopLineLabel,
  type ShopLine,
} from '../lib/shows/showShoppingList';

interface Props {
  show: ResolvedLocalCardShow;
  inventory: CardInventory[];
  targets: TargetWatchlist[];
  liveTape: boolean;
}

function usd(value: number | null): string {
  if (value == null) return 'no price';
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function LineList({ lines, empty }: { lines: ShopLine[]; empty: string }) {
  if (lines.length === 0) {
    return <p className="text-[11px] text-slate-500">{empty}</p>;
  }
  return (
    <ul className="space-y-2">
      {lines.map((line) => (
        <li key={line.id} className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-white">
              {line.player}
              <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {shopLineLabel(line.kind)}
              </span>
            </p>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">{line.tapeLabel}</span>
          </div>
          <p className="text-xs text-slate-400">{line.detail}</p>
          <p className="mt-1 font-mono text-xs text-slate-300">
            {line.side === 'buy' ? 'Target buy' : 'Offer near'} {usd(line.targetBuyUsd)}
            {line.marketMarkUsd != null ? ` · mark ${usd(line.marketMarkUsd)}` : ''}
            {line.collectorCeilingUsd != null ? ` · ceiling ${usd(line.collectorCeilingUsd)}` : ''}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">{line.priceSource}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{line.why}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {line.cardId && (
              <Link
                to={`/compare?card1=${encodeURIComponent(line.cardId)}`}
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-lime"
              >
                <Scale size={12} /> Comps
              </Link>
            )}
            <Link
              to="/collection"
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-lime"
            >
              <ShoppingBag size={12} /> Collection
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

const ShowShoppingList: React.FC<Props> = ({ show, inventory, targets, liveTape }) => {
  const list = useMemo(
    () => buildShowShoppingList({ show, inventory, targets, liveTape }),
    [show, inventory, targets, liveTape],
  );
  const [open, setOpen] = useState(true);
  const count = list.buys.length + list.sells.length;

  return (
    <section className="mt-4 rounded-xl border border-slate-800 bg-slate-950/30 p-3" aria-label={`Shopping list for ${show.name}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-200">
          Shopping list · {count} {count === 1 ? 'line' : 'lines'} · {list.tapeLabel}
        </h3>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-700 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-200"
        >
          {open ? 'Hide shopping list' : 'Show shopping list'}
        </button>
      </div>
      {open && (
        <div className="mt-3 space-y-3">
          {list.emptyReason ? (
            <p className="text-sm text-slate-400">{list.emptyReason}</p>
          ) : (
            <>
              <div>
                <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-200">Buy</h4>
                <LineList lines={list.buys} empty="Nothing to buy from the watchlist for this room." />
              </div>
              <div>
                <h4 className="mb-2 text-[10px] font-black uppercase tracking-widest text-sky-200">Sell or trade</h4>
                <LineList lines={list.sells} empty="No duplicate extra to sell or trade in a sport this show covers." />
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default ShowShoppingList;
