import React, { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import type { CardInventory } from '../types';
import { getHoldingsSeasonalWindows } from '../lib/analytics/seasonalWindowSignals';

interface Props {
  inventory: CardInventory[];
  limit?: number;
}

const SeasonalWindowRail: React.FC<Props> = ({ inventory, limit = 4 }) => {
  const hints = useMemo(
    () => getHoldingsSeasonalWindows(inventory).slice(0, limit),
    [inventory, limit],
  );

  if (inventory.length === 0 || hints.length === 0) return null;

  return (
    <section
      className="reveal-section rounded-2xl border border-slate-800 bg-brand-charcoal/60 p-5 md:p-6"
      aria-label="Seasonal buy and sell windows"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-teal-400" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-white">Seasonal windows</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
              Seeded calendar · spring training / All-Star / playoffs / off-season
            </p>
          </div>
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {hints.map((hint) => (
          <li
            key={`${hint.player}-${hint.sport}`}
            className="rounded-xl border border-slate-800/80 bg-brand-slate/30 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-white">{hint.player}</p>
              <span
                className={`shrink-0 text-[10px] font-black uppercase tracking-widest ${
                  hint.windowType === 'buy'
                    ? 'text-brand-lime'
                    : hint.windowType === 'sell'
                      ? 'text-amber-300'
                      : 'text-brand-muted'
                }`}
              >
                {hint.windowType}
              </span>
            </div>
            <p className="mt-1 text-xs text-brand-muted">
              {hint.eventLabel} · {hint.league} · {hint.cardCount} card{hint.cardCount === 1 ? '' : 's'}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-slate-500">
        Heuristic seasonality — not live sold comps or a pricing forecast.
      </p>
    </section>
  );
};

export default SeasonalWindowRail;
