import React, { useMemo } from 'react';
import { Scale } from 'lucide-react';
import type { CardInventory } from '../types';
import {
  CAPITAL_GAINS_EXIT_DISCLOSURE,
  simulateCapitalGainsYearVsNext,
  simulateCapitalGainsYearVsNextForCard,
} from '../lib/analytics/capitalGainsExit';

interface Props {
  inventory?: CardInventory[];
  card?: CardInventory;
  compact?: boolean;
}

function money(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

const CapitalGainsExitStrip: React.FC<Props> = ({ inventory, card, compact }) => {
  const summary = useMemo(() => {
    if (card) {
      const row = simulateCapitalGainsYearVsNextForCard(card);
      return row ? simulateCapitalGainsYearVsNext([card]) : null;
    }
    return simulateCapitalGainsYearVsNext(inventory ?? []);
  }, [inventory, card]);

  if (!summary || summary.holdings.length === 0) return null;
  const rows = card ? summary.holdings.slice(0, 1) : summary.holdings.slice(0, 4);

  return (
    <section
      className={compact
        ? 'rounded-xl border border-slate-800/60 bg-brand-charcoal/40 p-3'
        : 'rounded-2xl border border-slate-800 bg-brand-charcoal/50 p-5'}
      aria-label="Capital gains exit simulator"
    >
      <div className="mb-2 flex items-center gap-2">
        <Scale size={16} className="text-sky-300" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-white">Sell this year vs next</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            ST / LT heuristic · {summary.thisYearLabel} vs {summary.nextYearLabel}
          </p>
        </div>
      </div>
      {!compact && <p className="mb-3 text-[11px] leading-relaxed text-slate-400">{CAPITAL_GAINS_EXIT_DISCLOSURE}</p>}
      <div className="mb-3 grid grid-cols-2 gap-3 text-[11px] uppercase tracking-widest text-slate-400">
        <div>
          <p>{summary.thisYearLabel} net</p>
          <p className="mt-1 font-mono text-white">{money(summary.thisYearNet)}</p>
          <p className="mt-0.5 text-amber-200">Tax {money(summary.thisYearTax)}</p>
        </div>
        <div>
          <p>{summary.nextYearLabel} net</p>
          <p className="mt-1 font-mono text-white">{money(summary.nextYearNet)}</p>
          <p className="mt-0.5 text-cyan-200">Tax {money(summary.nextYearTax)}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.cardId} className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-white">{row.player}</p>
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-300">
                {row.recommendation.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{row.reason}</p>
            <p className="mt-1 font-mono text-[10px] text-slate-500">
              {row.thisYear.taxTreatment} now · {row.nextYear.taxTreatment} next
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CapitalGainsExitStrip;
