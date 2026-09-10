import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BadgePercent } from 'lucide-react';
import type { CardInventory, TargetWatchlist } from '../types';
import { DEAL_FINDER_LITE_DISCLOSURE, findDealCandidates } from '../lib/analytics/dealFinderLite';

interface Props {
  inventory: CardInventory[];
  targets?: TargetWatchlist[];
  greatDealsOnly?: boolean;
  compact?: boolean;
}

const DealFinderLiteRail: React.FC<Props> = ({ inventory, targets = [], greatDealsOnly = true, compact }) => {
  const report = useMemo(
    () => findDealCandidates(inventory, targets, { greatDealsOnly, limit: compact ? 3 : 6 }),
    [inventory, targets, greatDealsOnly, compact],
  );

  return (
    <section
      className={
        compact
          ? 'rounded-xl border border-emerald-500/20 bg-brand-charcoal/40 p-3'
          : 'rounded-2xl border border-emerald-500/20 bg-brand-charcoal/60 p-5 md:p-6'
      }
      aria-label="Deal finder lite"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BadgePercent size={16} className="text-emerald-300" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-white">Deal finder lite</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
              ≥{report.thresholdPct}% below consensus · fee-aware break-even
            </p>
          </div>
        </div>
        <Link to="/collection" className="text-[10px] font-black uppercase tracking-widest text-brand-lime">
          Collection
        </Link>
      </div>
      {!compact && <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{DEAL_FINDER_LITE_DISCLOSURE}</p>}
      {report.emptyReason ? (
        <p className="text-[11px] text-slate-500">{report.emptyReason}</p>
      ) : (
        <ul className="space-y-2">
          {report.candidates.map((row) => (
            <li key={row.id} className="rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-white">{row.player}</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  {row.greatDeal ? 'Great deal' : 'Below mark'} · {row.kind}
                </span>
              </div>
              <p className="font-mono text-xs text-slate-300">
                Ask ${Math.round(row.askPrice).toLocaleString()}
                {row.consensusMark != null ? ` vs consensus $${Math.round(row.consensusMark).toLocaleString()}` : ''}
                {row.discountPct != null ? ` (${row.discountPct.toFixed(1)}%)` : ''}
              </p>
              {!compact && <p className="mt-1 text-[11px] text-slate-500">{row.rationale}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default DealFinderLiteRail;
