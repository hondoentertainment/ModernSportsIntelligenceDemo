import React, { useMemo } from 'react';
import type { CardInventory } from '../types';
import {
  FRESHNESS_SLA_DISCLOSURE,
  slaBandLabel,
  summarizeInventorySla,
} from '../lib/pricing/freshnessSla';

interface Props {
  inventory: CardInventory[];
  compact?: boolean;
}

const FreshnessSlaBadge: React.FC<Props> = ({ inventory, compact }) => {
  const summary = useMemo(() => summarizeInventorySla(inventory), [inventory]);
  if (summary.total === 0) return null;

  return (
    <div
      className={
        compact
          ? 'flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-muted'
          : 'rounded-xl border border-slate-800/70 bg-brand-charcoal/40 px-3 py-2'
      }
      title={FRESHNESS_SLA_DISCLOSURE}
      data-testid="freshness-sla-badge"
    >
      <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
        {slaBandLabel(summary.worstBand)} · {summary.slaPct}% fresh
      </span>
      {!compact && (
        <p className="mt-1 text-[10px] text-slate-500">
          {summary.fresh} fresh · {summary.aging} aging · {summary.stale} stale · {summary.unknown} unknown
        </p>
      )}
    </div>
  );
};

FreshnessSlaBadge.displayName = 'FreshnessSlaBadge';

export default FreshnessSlaBadge;
