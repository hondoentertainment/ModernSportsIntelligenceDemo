import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';
import type { CardInventory } from '../types';
import { CatalystEngine } from '../lib/utils/catalystEngine';

interface Props {
  inventory: CardInventory[];
  /** Max scenarios to show in the rail. */
  limit?: number;
}

/**
 * Holdings-linked catalyst rail for the GA dashboard.
 * Uses CatalystEngine scenarios derived from the caller's inventory (not a global news dump).
 */
const HoldingsCatalystRail: React.FC<Props> = ({ inventory, limit = 4 }) => {
  const scenarios = useMemo(
    () => CatalystEngine.generateScenarios(inventory).slice(0, limit),
    [inventory, limit],
  );
  const summary = useMemo(() => CatalystEngine.summarizeScenarios(scenarios), [scenarios]);

  if (inventory.length === 0 || scenarios.length === 0) return null;

  return (
    <section
      className="reveal-section rounded-2xl border border-slate-800 bg-brand-charcoal/60 p-5 md:p-6"
      aria-label="Holdings-linked catalysts"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-brand-orange" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-white">Holdings catalysts</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
              {summary.bullish} bullish · {summary.defensive} defensive · avg move{' '}
              {summary.avgMove.toFixed(1)}%
            </p>
          </div>
        </div>
        <Link
          to="/catalyst-market"
          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-lime hover:underline"
        >
          Full rail <ChevronRight size={12} aria-hidden />
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {scenarios.map((s) => (
          <li
            key={s.id}
            className="rounded-xl border border-slate-800/80 bg-brand-slate/30 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-white">{s.headline}</p>
              <span
                className={`shrink-0 text-[10px] font-black uppercase tracking-widest ${
                  s.bias === 'bullish'
                    ? 'text-brand-lime'
                    : s.bias === 'defensive'
                      ? 'text-amber-300'
                      : 'text-brand-muted'
                }`}
              >
                {s.suggestedAction}
              </span>
            </div>
            <p className="mt-1 text-xs text-brand-muted">
              {s.assetName} · {s.triggerWindow} · +{s.expectedMovePct}% / −{s.downsidePct}%
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HoldingsCatalystRail;
