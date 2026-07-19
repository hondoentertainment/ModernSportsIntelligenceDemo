import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import type { CardInventory } from '../types';
import { buildConsensusLedger } from '../lib/pricing/consensusMarketLedger';
import { preferRealCompsWhenConfigured } from '../lib/featureFlags';

interface Props {
  inventory: CardInventory[];
}

/** Compact consensus book-of-record strip for the GA dashboard. */
const MarketLedgerStrip: React.FC<Props> = ({ inventory }) => {
  const ledger = useMemo(() => buildConsensusLedger(inventory), [inventory]);
  const liveComps = preferRealCompsWhenConfigured();

  if (ledger.quotedCount === 0) return null;

  return (
    <section
      className="reveal-section rounded-2xl border border-slate-800 bg-brand-charcoal/60 p-5 md:p-6"
      aria-label="Consensus market ledger"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <BookOpen size={18} className="mt-0.5 text-brand-lime" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-white">Consensus market ledger</h3>
            <p className="mt-1 text-xs text-brand-muted">
              Book FMV ${ledger.totalFmv.toLocaleString(undefined, { maximumFractionDigits: 0 })} ·{' '}
              {ledger.freshVerifiablePct}% fresh verifiable (target {ledger.coverageTargetPct}%) ·{' '}
              {liveComps ? 'Live comps flag on' : 'Comps flag off — flip VITE_FF_REAL_EBAY when keys are set'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
              ledger.meetsCoverageTarget
                ? 'bg-brand-lime/15 text-brand-lime'
                : 'bg-amber-500/15 text-amber-200'
            }`}
          >
            {ledger.meetsCoverageTarget ? 'Coverage met' : 'Coverage gap'}
          </span>
          <Link
            to="/war-room"
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-lime hover:underline"
          >
            Open War Room <ChevronRight size={12} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MarketLedgerStrip;
