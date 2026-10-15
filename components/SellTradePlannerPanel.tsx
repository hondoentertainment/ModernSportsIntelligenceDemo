import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Scale } from 'lucide-react';
import type { CardInventory } from '../types';
import {
  SELL_TRADE_PLANNER_DISCLOSURE,
  buildSellTradePlan,
  type SellTradeAction,
  type SellTradeRow,
} from '../lib/analytics/sellTradePlanner';
import { getTaxLotPreferences, subscribeTaxLotPreferences } from '../lib/utils/taxLotPreferences';
import { placesSnapshot, subscribePlaces } from '../lib/collector/deskNext';
import { pullCopy } from '../lib/collector/floorPack';

interface Props {
  inventory: CardInventory[];
}

type FilterId = 'all' | SellTradeAction;

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'sell', label: 'Sell' },
  { id: 'trade-in', label: 'Trade in' },
  { id: 'hold', label: 'Hold' },
];

const ACTION_CLASS: Record<SellTradeAction, string> = {
  sell: 'text-sky-200 border-sky-500/40 bg-sky-500/10',
  'trade-in': 'text-emerald-200 border-emerald-500/40 bg-emerald-500/10',
  hold: 'text-amber-200 border-amber-500/40 bg-amber-500/10',
};

function dollars(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(Math.round(value)).toLocaleString('en-US')}`;
}

function actionLabel(action: SellTradeAction): string {
  if (action === 'trade-in') return 'Trade in';
  if (action === 'hold') return 'Hold';
  return 'Sell';
}

function RowCard({ row, place }: { row: SellTradeRow; place: string | undefined }) {
  return (
    <li className="min-w-0 rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-sm text-white">{row.player}</p>
          <p className="mt-1 break-words text-[11px] text-slate-500">{row.label}</p>
        </div>
        <span className={`inline-flex min-h-[44px] items-center self-start rounded-full border px-3 text-[10px] font-black uppercase tracking-widest ${ACTION_CLASS[row.action]}`}>
          {actionLabel(row.action)} · {row.venue}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="min-w-0">
          <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Mark</dt>
          <dd className="mt-1 font-mono text-slate-100">{dollars(row.mark)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Fees</dt>
          <dd className="mt-1 font-mono text-slate-100">{dollars(row.feeAmount)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Net proceeds</dt>
          <dd className="mt-1 font-mono text-slate-100">{dollars(row.netProceeds)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">After tax</dt>
          <dd className="mt-1 font-mono text-slate-100">{dollars(row.cashAfterTax)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
        {row.holdingPeriod} · basis {dollars(row.costBasis)} · unrealized {dollars(row.unrealized)}
        {row.washSale === 'clear' ? '' : ` · wash ${row.washSale}`}
        {row.washSaleDisallowed > 0 ? ` · ${dollars(row.washSaleDisallowed)} flagged disallowed` : ''}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{row.note}</p>
      <p className="mt-1 text-[11px] text-slate-300">{pullCopy(place)}</p>
    </li>
  );
}

const SellTradePlannerPanel: React.FC<Props> = ({ inventory }) => {
  const [filter, setFilter] = useState<FilterId>('all');
  const prefs = useSyncExternalStore(subscribeTaxLotPreferences, getTaxLotPreferences, getTaxLotPreferences);
  const places = useSyncExternalStore(subscribePlaces, placesSnapshot, placesSnapshot);
  const plan = useMemo(
    () =>
      buildSellTradePlan(inventory, {
        method: prefs.method,
        specificLotIds: prefs.specificLotIds,
      }),
    [inventory, prefs],
  );

  if (inventory.length === 0) return null;

  const rows = [...plan.suggestions, ...plan.holds];
  const visible = filter === 'all' ? rows : rows.filter((row) => row.action === filter);

  return (
    <section
      id="sell-trade-planner"
      tabIndex={-1}
      className="rounded-2xl border border-slate-800 bg-brand-charcoal/60 p-4 outline-none sm:p-5 md:p-6"
      aria-label="Sell and trade-in planner"
    >
      <div className="mb-3 flex items-start gap-2">
        <ArrowLeftRight size={16} className="mt-0.5 shrink-0 text-sky-300" aria-hidden />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">Sell and trade-in planner</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            Duplicates · losers · net of fees · {plan.method}
          </p>
        </div>
      </div>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{SELL_TRADE_PLANNER_DISCLOSURE}</p>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-500">{plan.lotDisclosure}</p>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="min-w-0 rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-3">
          <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Book unrealized</dt>
          <dd className="mt-1 font-mono text-sm text-white">{dollars(plan.bookUnrealized)}</dd>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-3">
          <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Suggested</dt>
          <dd className="mt-1 font-mono text-sm text-white">{plan.totals.count}</dd>
          <p className="mt-1 text-[10px] text-slate-500">
            {plan.holds.length} hold{plan.holds.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-3">
          <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Net proceeds</dt>
          <dd className="mt-1 font-mono text-sm text-white">{dollars(plan.totals.netProceeds)}</dd>
          <p className="mt-1 text-[10px] text-slate-500">Fees {dollars(plan.totals.fees)}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-3">
          <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">After tax</dt>
          <dd className="mt-1 font-mono text-sm text-white">{dollars(plan.totals.cashAfterTax)}</dd>
          <p className="mt-1 text-[10px] text-slate-500">Tax {dollars(plan.totals.estimatedTax)}</p>
        </div>
      </dl>

      {plan.specificIdNote ? <p className="mt-3 text-[11px] leading-relaxed text-amber-100/90">{plan.specificIdNote}</p> : null}
      {plan.omittedCount > 0 ? (
        <p className="mt-3 text-[11px] text-slate-500">
          {plan.omittedCount} more {plan.omittedCount === 1 ? 'row is' : 'rows are'} outside this list.
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          to="/tax-report"
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-slate-600 px-3 text-xs font-bold text-slate-100"
        >
          <Scale size={14} aria-hidden />
          Tax-lot method
        </Link>
        <Link
          to="/local-card-shows"
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-slate-600 px-3 text-xs font-bold text-slate-100"
        >
          Card-show desk
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Suggestion filter">
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="radio"
            aria-checked={filter === entry.id}
            onClick={() => setFilter(entry.id)}
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border px-3 text-xs font-bold ${
              filter === entry.id
                ? 'border-sky-400/50 bg-sky-500/15 text-sky-100'
                : 'border-slate-700 bg-slate-900 text-slate-300'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {plan.emptyReason ? (
        <p className="mt-4 text-sm text-slate-400">{plan.emptyReason}</p>
      ) : visible.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Nothing in this filter.</p>
      ) : (
        <ul className="mt-4 space-y-3" aria-label="Sell and trade-in suggestions">
          {visible.map((row) => (
            <RowCard key={row.cardId} row={row} place={places[row.cardId]} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default SellTradePlannerPanel;
