import React from 'react';
import { AlertTriangle } from 'lucide-react';
import DataSourceBadge from './DataSourceBadge';

interface PricingProvenanceNoticeProps {
  title: string;
  detail: string;
  badgeVariant?: 'sample' | 'mock' | 'stale';
  badgeLabel?: string;
  className?: string;
}

/**
 * Shared provenance / freshness disclosure for surfaces that show demo or partial pricing data.
 */
const PricingProvenanceNotice: React.FC<PricingProvenanceNoticeProps> = ({
  title,
  detail,
  badgeVariant = 'sample',
  badgeLabel,
  className = '',
}) => (
  <div
    role="status"
    className={`flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 ${className}`}
    data-testid="pricing-provenance-notice"
  >
    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
    <div className="min-w-0 flex-1 space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold">{title}</p>
        <DataSourceBadge variant={badgeVariant} label={badgeLabel} size="xs" />
      </div>
      <p className="text-xs text-amber-200/90">{detail}</p>
    </div>
  </div>
);

export default PricingProvenanceNotice;
