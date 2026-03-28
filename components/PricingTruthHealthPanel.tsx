import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, DatabaseZap } from 'lucide-react';
import type { CardInventory } from '../types';
import {
  computeFreshVerifiableCoverage,
  FRESH_VERIFIABLE_COVERAGE_TARGET_PCT,
} from '../lib/utils/valuationProvenance';
import { isValuationStale } from '../lib/utils/valuationFreshness';
import { getCoverageHistory } from '../lib/utils/valuationCoverageAlerts';

interface PricingTruthHealthPanelProps {
  inventory: CardInventory[];
}

const PricingTruthHealthPanel: React.FC<PricingTruthHealthPanelProps> = ({ inventory }) => {
  const activeCards = useMemo(
    () => inventory.filter(card => card.status !== 'sold'),
    [inventory],
  );
  const coverage = useMemo(
    () => computeFreshVerifiableCoverage(activeCards),
    [activeCards],
  );
  const staleCount = useMemo(
    () => activeCards.filter(card => isValuationStale(card.lastValuationDate || card.valuationTimestamp)).length,
    [activeCards],
  );

  const sourceMix = useMemo(() => {
    return activeCards.reduce(
      (acc, card) => {
        if (card.valuationSource === 'ebay-api') acc.ebay += 1;
        else if (card.valuationSource === 'historical-comps') acc.historical += 1;
        else if (card.valuationSource === 'gemini') acc.gemini += 1;
        else acc.fallback += 1;
        return acc;
      },
      { ebay: 0, historical: 0, gemini: 0, fallback: 0 },
    );
  }, [activeCards]);
  const trendText = useMemo(() => {
    const history = getCoverageHistory('inventory');
    if (history.length < 2) return 'Trend pending';
    const latest = history[0];
    const previous = history[1];
    const delta = latest.coveragePct - previous.coveragePct;
    if (delta === 0) return 'Stable vs prior snapshot';
    return `${delta > 0 ? '+' : ''}${delta}% vs prior snapshot`;
  }, [coverage.coveragePct, coverage.total]);

  const healthy = coverage.coveragePct >= FRESH_VERIFIABLE_COVERAGE_TARGET_PCT;

  return (
    <div className="luminous-card rounded-[2rem] p-6 border border-slate-800/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Pricing Truth Health</p>
          <h3 className="text-xl font-bebas tracking-wide text-white">Fresh Verifiable Coverage</h3>
        </div>
        <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${healthy ? 'bg-brand-green/10 text-brand-green border border-brand-green/25' : 'bg-amber-500/10 text-amber-300 border border-amber-500/25'}`}>
          {healthy ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
          {healthy ? 'Healthy' : 'Degraded'}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-brand-charcoal/40 px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Coverage</p>
          <p className={`text-lg font-mono font-bold ${healthy ? 'text-brand-green' : 'text-amber-300'}`}>{coverage.coveragePct}%</p>
          <p className="text-[9px] text-slate-500">{coverage.covered}/{coverage.total}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-brand-charcoal/40 px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Stale</p>
          <p className="text-lg font-mono font-bold text-white">{staleCount}</p>
          <p className="text-[9px] text-slate-500">active assets</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-brand-charcoal/40 px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Source Mix</p>
          <p className="text-sm font-bold text-brand-lime">Live {sourceMix.ebay}</p>
          <p className="text-[9px] text-slate-500">Hist {sourceMix.historical} · AI {sourceMix.gemini}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-brand-charcoal/40 px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Target</p>
          <p className="text-lg font-mono font-bold text-white">{FRESH_VERIFIABLE_COVERAGE_TARGET_PCT}%</p>
          <p className="text-[9px] text-slate-500 flex items-center gap-1"><DatabaseZap size={10} /> {trendText}</p>
        </div>
      </div>
    </div>
  );
};

export default PricingTruthHealthPanel;
