import React from 'react';
import DataSourceBadge, { type DataSourceVariant } from './DataSourceBadge';

const MUTED =
  'inline-flex min-h-[26px] items-center rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500 bg-brand-charcoal/35 border border-slate-700/45';

export interface ValuationProvenanceChipsProps {
  sourceChip: { label: string; className: string };
  badgeVariant?: DataSourceVariant;
  staleLabel?: string | null;
  thinMarket?: boolean;
  /** Phase B: "Thin tape" or "Low liquidity" from disclosed classifiers. */
  lowLiquidityLabel?: string | null;
  compsCount?: number;
  /** Tooltip: source, freshness, confidence (or unknown), comps, rationale. */
  title?: string;
  showBadge?: boolean;
  className?: string;
}

/**
 * Shared source / freshness / thin-tape chips for collection + watchlist.
 * Does not flip real-data flags — labels follow preferred sold-comp / consensus.
 */
const ValuationProvenanceChips: React.FC<ValuationProvenanceChipsProps> = ({
  sourceChip,
  badgeVariant,
  staleLabel,
  thinMarket,
  lowLiquidityLabel,
  compsCount,
  title,
  showBadge = true,
  className = '',
}) => {
  const liquidityText = lowLiquidityLabel || (thinMarket ? 'Thin market' : null);
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`} title={title}>
      <span
        className={`inline-flex min-h-[26px] items-center rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider ${sourceChip.className}`}
      >
        {sourceChip.label}
      </span>
      {showBadge && badgeVariant && <DataSourceBadge variant={badgeVariant} size="xs" className="ml-0.5" />}
      {staleLabel && <span className={MUTED}>{staleLabel}</span>}
      {liquidityText && <span className={MUTED}>{liquidityText}</span>}
      {compsCount != null && compsCount > 0 && <span className={MUTED}>{compsCount} comps</span>}
    </div>
  );
};

ValuationProvenanceChips.displayName = 'ValuationProvenanceChips';

export default ValuationProvenanceChips;
