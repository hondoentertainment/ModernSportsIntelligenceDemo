import React, { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import type { CardInventory } from '../types';
import { HOLDING_HORIZON_DISCLOSURE, analyzeHoldingHorizon } from '../lib/analytics/holdingHorizon';

interface Props {
  inventory: CardInventory[];
  compact?: boolean;
}

const HoldingHorizonRail: React.FC<Props> = ({ inventory, compact }) => {
  const summary = useMemo(() => analyzeHoldingHorizon(inventory), [inventory]);
  if (summary.active === 0) return null;
  const rows = compact ? summary.rows.slice(0, 3) : summary.rows.slice(0, 6);

  return (
    <section
      className={
        compact
          ? 'rounded-xl border border-slate-800/60 bg-brand-charcoal/40 p-3'
          : 'rounded-2xl border border-slate-800 bg-brand-charcoal/50 p-5 md:p-6'
      }
      aria-label="Holding horizon and wash-sale awareness"
    >
      <div className="mb-2 flex items-center gap-2">
        <CalendarClock size={16} className="text-amber-300" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-white">Holding horizon / wash-sale rail</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            ST vs LT · {summary.shortTerm} short · {summary.longTerm} long · {summary.washSaleWatch} proximity
          </p>
        </div>
      </div>
      {!compact && <p className="mb-3 text-[11px] leading-relaxed text-slate-400">{HOLDING_HORIZON_DISCLOSURE}</p>}
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.cardId} className="rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-white">{row.player}</p>
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  row.treatment === 'Long-Term' ? 'text-sky-300' : 'text-amber-300'
                }`}
              >
                {row.treatment} · {row.daysHeld}d
              </span>
            </div>
            {row.treatment === 'Short-Term' && (
              <p className="mt-1 text-[11px] text-slate-400">{row.daysToLongTerm} days to long-term heuristic.</p>
            )}
            {row.washSaleDetail && (
              <p className="mt-1 text-[11px] text-amber-200">{row.washSaleDetail}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HoldingHorizonRail;
