import React from 'react';
import DataSourceBadge, { type DataSourceVariant } from './DataSourceBadge';

const MUTED =
  'inline-flex min-h-[26px] items-center rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500 bg-brand-charcoal/35 border border-slate-700/45';

export interface ValuationProvenanceChipsProps {
  sourceChip: { label: string; className: string };
  badgeVariant?: DataSourceVariant;
  staleLabel?: string | null;
  thinMarket?: boolean;
  /** Tooltip: timestamp, confidence, rationale. */
  title?: string;
  showBadge?: boolean;
  className?: string;
}

/**
 * Shared source / freshness / thin-market chips for collection + watchlist.
 * Does not flip real-data flags — labels follow stored valuationSource.
 */
const ValuationProvenanceChips: React.FC<ValuationProvenanceChipsProps> = ({
  sourceChip,
  badgeVariant,
  staleLabel,
  thinMarket,
  title,
  showBadge = true,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`} title={title}>
      <span
        className={`inline-flex min-h-[26px] items-center rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider ${sourceChip.className}`}
      >
        {sourceChip.label}
      </span>
      {showBadge && badgeVariant && <DataSourceBadge variant={badgeVariant} size="xs" className="ml-0.5" />}
      {staleLabel && <span className={MUTED}>{staleLabel}</span>}
      {thinMarket && <span className={MUTED}>Thin market</span>}
    </div>
  );
};

ValuationProvenanceChips.displayName = 'ValuationProvenanceChips';

export default ValuationProvenanceChips;
