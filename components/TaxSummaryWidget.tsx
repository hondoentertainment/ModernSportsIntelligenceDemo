import React, { useMemo, useState } from 'react';
import {
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Scale,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CardInventory } from '../types';
import { TaxLotService, CostBasisMethod } from '../lib/utils/taxLotService';

interface TaxSummaryWidgetProps {
  inventory: CardInventory[];
  onCardClick?: (_card: CardInventory) => void;
}

const TaxSummaryWidget: React.FC<TaxSummaryWidgetProps> = ({ inventory, onCardClick }) => {
  const [method, setMethod] = useState<CostBasisMethod>('FIFO');
  const [showHarvest, setShowHarvest] = useState(false);

  const summary = useMemo(() => TaxLotService.generateTaxSummary(inventory, new Date().getFullYear(), method), [inventory, method]);

  if (inventory.length === 0) return null;

  const netIsGain = summary.totalNetGainLoss >= 0;

  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-orange/10 rounded-xl text-brand-orange">
            <FileText size={22} />
          </div>
          <div>
            <h3 className="text-2xl font-bebas tracking-wide text-white">Fiscal Intelligence</h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              {summary.taxYear} Tax Year — {summary.totalTransactions} Dispositions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['FIFO', 'LIFO', 'SpecificID', 'AvgCost'] as CostBasisMethod[]).map(m => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                method === m
                  ? 'bg-brand-lime/10 border border-brand-lime/30 text-brand-lime'
                  : 'bg-brand-charcoal border border-slate-800 text-brand-muted hover:text-white'
              }`}
            >
              {m === 'SpecificID' ? 'Spec ID' : m === 'AvgCost' ? 'Avg' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Net Gain/Loss</p>
          <p className={`text-xl font-mono font-bold ${netIsGain ? 'text-brand-lime' : 'text-brand-red'}`}>
            {netIsGain ? '+' : '-'}${Math.abs(summary.totalNetGainLoss).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Est. Tax Liability</p>
          <p className="text-xl font-mono font-bold text-brand-red">
            ${summary.estimatedTaxLiability.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[9px] text-brand-muted mt-1">
            Eff. rate: {(summary.effectiveTaxRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Unrealized Gains</p>
          <p className="text-xl font-mono font-bold text-brand-lime">
            +${summary.unrealizedGains.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Unrealized Losses</p>
          <p className="text-xl font-mono font-bold text-brand-red">
            -${summary.unrealizedLosses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Short-Term vs Long-Term Split */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-brand-charcoal/30 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded bg-brand-orange"></div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Short-Term (32%)</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Gains</p>
              <p className="text-sm font-mono font-bold text-brand-lime flex items-center gap-1">
                <ArrowUpRight size={12} />${summary.shortTermGains.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Losses</p>
              <p className="text-sm font-mono font-bold text-brand-red flex items-center gap-1">
                <ArrowDownRight size={12} />${summary.shortTermLosses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Net</p>
              <p className={`text-sm font-mono font-bold ${summary.netShortTerm >= 0 ? 'text-brand-lime' : 'text-brand-red'}`}>
                {summary.netShortTerm >= 0 ? '+' : ''}${summary.netShortTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-brand-charcoal/30 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded bg-brand-lime"></div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Long-Term (15%)</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Gains</p>
              <p className="text-sm font-mono font-bold text-brand-lime flex items-center gap-1">
                <ArrowUpRight size={12} />${summary.longTermGains.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Losses</p>
              <p className="text-sm font-mono font-bold text-brand-red flex items-center gap-1">
                <ArrowDownRight size={12} />${summary.longTermLosses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Net</p>
              <p className={`text-sm font-mono font-bold ${summary.netLongTerm >= 0 ? 'text-brand-lime' : 'text-brand-red'}`}>
                {summary.netLongTerm >= 0 ? '+' : ''}${summary.netLongTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax-Loss Harvest Candidates */}
      {summary.harvestCandidates.length > 0 && (
        <div className="bg-brand-charcoal/30 border border-slate-800 rounded-2xl p-5">
          <button
            onClick={() => setShowHarvest(!showHarvest)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <TrendingDown size={16} className="text-brand-green" />
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                Tax-Loss Harvest Candidates ({summary.harvestCandidates.length})
              </p>
            </div>
            {showHarvest ? <ChevronUp size={16} className="text-brand-muted" /> : <ChevronDown size={16} className="text-brand-muted" />}
          </button>

          {showHarvest && (
            <div className="mt-4 space-y-2">
              {summary.harvestCandidates.slice(0, 5).map(candidate => (
                <div
                  key={candidate.card.id}
                  className="flex items-center justify-between p-3 bg-brand-charcoal/50 rounded-xl hover:bg-brand-charcoal/70 transition-colors cursor-pointer"
                  onClick={() => onCardClick?.(candidate.card)}
                >
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{candidate.card.player}</p>
                    <p className="text-[9px] text-brand-muted">{candidate.card.year} {candidate.card.manufacturer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-brand-red">
                      -${candidate.unrealizedLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-[9px] text-brand-green font-bold">
                      Save ~${candidate.taxSavingsEstimate.toLocaleString(undefined, { maximumFractionDigits: 0 })} tax
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule D Summary Row */}
      {summary.scheduleDEntries.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-brand-lime/5 border border-brand-lime/10 rounded-2xl">
          <div className="flex items-center gap-3">
            <Scale size={16} className="text-brand-lime" />
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              Schedule D: {summary.scheduleDEntries.length} entries • Avg hold: {summary.avgHoldingDays}d
            </p>
          </div>
          <p className="text-[10px] font-black text-brand-lime uppercase tracking-widest">
            Schedule D–style (demo)
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(TaxSummaryWidget);
