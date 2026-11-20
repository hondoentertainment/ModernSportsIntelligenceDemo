import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { FRESH_VERIFIABLE_COVERAGE_TARGET_PCT } from '../lib/utils/valuationProvenance';

export type ValuationCoverageScopeLabel = 'inventory' | 'watchlist';

interface ValuationCoverageBannerProps {
  scope: ValuationCoverageScopeLabel;
  coveragePct: number;
  covered: number;
  total: number;
  targetPct?: number;
  actions?: React.ReactNode;
  className?: string;
  /** Demo sessions show a calm seeded-tape label instead of an SLA breach. */
  tone?: 'sla' | 'demo';
}

const SCOPE_COPY: Record<
  ValuationCoverageScopeLabel,
  { title: string; detail: (covered: number, total: number, pct: number, target: number) => string }
> = {
  inventory: {
    title: 'Pricing truth coverage is below SLA.',
    detail: (covered, total, pct, target) =>
      `Fresh verifiable valuations are at ${pct}% (${covered}/${total} active assets). Target is ${target}%.`,
  },
  watchlist: {
    title: 'Watchlist pricing coverage below SLA.',
    detail: (covered, total, pct) =>
      `Fresh verifiable targets: ${pct}% (${covered}/${total}). Sync prices to refresh comp-backed valuations.`,
  },
};

const ValuationCoverageBanner: React.FC<ValuationCoverageBannerProps> = ({
  scope,
  coveragePct,
  covered,
  total,
  targetPct = FRESH_VERIFIABLE_COVERAGE_TARGET_PCT,
  actions,
  className = '',
  tone = 'sla',
}) => {
  if (total <= 0 || coveragePct >= targetPct) return null;

  if (tone === 'demo') {
    return (
      <section
        className={`rounded-2xl border border-slate-700 bg-slate-900/60 px-5 py-4 text-sm text-slate-200 ${className}`}
        role="status"
        data-testid="demo-pricing-notice"
      >
        <p className="font-semibold">Demo data</p>
        <p className="mt-1 text-xs text-slate-400">
          Seeded demo price history is on this book. Live verifiable coverage is not scored in a demo session.
        </p>
      </section>
    );
  }

  const copy = SCOPE_COPY[scope];
  const Wrapper = actions ? 'section' : 'div';
  const baseClass = actions
    ? 'rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100'
    : 'rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100';

  return (
    <Wrapper
      className={`${baseClass} ${className}`}
      role="status"
      data-testid="valuation-coverage-banner"
    >
      <div className={`flex items-start ${actions ? 'justify-between' : ''} gap-3`}>
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-300" aria-hidden />
          <div>
            <p className={`${actions ? '' : 'text-sm '}font-semibold`}>{copy.title}</p>
            <p className="mt-1 text-xs text-amber-200/90">
              {copy.detail(covered, total, coveragePct, targetPct)}
            </p>
          </div>
        </div>
        {actions ? <div className="shrink-0 flex items-center gap-2">{actions}</div> : null}
      </div>
    </Wrapper>
  );
};

export default ValuationCoverageBanner;
