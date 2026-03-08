import React, { useMemo, useState } from 'react';
import { X, FileText, ArrowUpRight, ArrowDownRight, Scale, TrendingDown, AlertTriangle } from 'lucide-react';
import { CardInventory } from '../types';
import { TaxLotService, CostBasisMethod, TaxLot } from '../lib/taxLotService';

interface TaxReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardInventory;
  portfolio: CardInventory[];
}

const TaxReportModal: React.FC<TaxReportModalProps> = ({ isOpen, onClose, card, portfolio }) => {
  const [method, setMethod] = useState<CostBasisMethod>('FIFO');

  const taxLot = useMemo(() => TaxLotService.getCardTaxLot(card), [card]);
  const methodComparison = useMemo(() => TaxLotService.compareMethodTaxImpact(portfolio), [portfolio]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const holdingDays = useMemo(() => {
    const acquired = new Date(card.purchaseDate).getTime();
    const end = card.saleDate ? new Date(card.saleDate).getTime() : Date.now();
    return Math.round((end - acquired) / (24 * 60 * 60 * 1000));
  }, [card]);

  if (!isOpen) return null;

  const costBasis = (card.taxBasis || card.purchasePrice || 0) + (card.gradingFees || 0) + (card.shippingFees || 0);
  const currentOrSale = card.status === 'sold' ? (card.salePrice || 0) : (card.currentValue || costBasis);
  const gainLoss = currentOrSale - costBasis;
  const gainPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
  const isGain = gainLoss >= 0;
  const taxRate = taxLot.holdingPeriod === 'Short-Term' ? 0.32 : 0.15;
  const taxImpact = isGain ? gainLoss * taxRate : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-brand-slate border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-brand-slate/95 backdrop-blur-sm border-b border-slate-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-orange/10 rounded-xl text-brand-orange">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-wide text-white">Tax Lot Analysis</h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{card.player} — {card.year} {card.manufacturer}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            card.status === 'sold'
              ? 'bg-brand-charcoal/50 border-slate-700'
              : isGain
                ? 'bg-brand-lime/5 border-brand-lime/20'
                : 'bg-brand-red/5 border-brand-red/20'
          }`}>
            <div className="flex items-center gap-3">
              {isGain ? (
                <ArrowUpRight size={20} className="text-brand-lime" />
              ) : (
                <ArrowDownRight size={20} className="text-brand-red" />
              )}
              <div>
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
                  {card.status === 'sold' ? 'Realized' : 'Unrealized'} {isGain ? 'Gain' : 'Loss'}
                </p>
                <p className={`text-2xl font-mono font-bold ${isGain ? 'text-brand-lime' : 'text-brand-red'}`}>
                  {isGain ? '+' : '-'}${Math.abs(gainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-mono font-bold ${isGain ? 'text-brand-lime' : 'text-brand-red'}`}>
                {isGain ? '+' : ''}{gainPercent.toFixed(1)}%
              </p>
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Return</p>
            </div>
          </div>

          {/* Tax Lot Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Cost Basis</p>
              <p className="text-lg font-mono font-bold text-white">${costBasis.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              {(card.gradingFees || card.shippingFees) ? (
                <p className="text-[9px] text-brand-muted mt-1">
                  Incl. ${((card.gradingFees || 0) + (card.shippingFees || 0)).toFixed(2)} fees
                </p>
              ) : null}
            </div>
            <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">
                {card.status === 'sold' ? 'Sale Proceeds' : 'Current FMV'}
              </p>
              <p className="text-lg font-mono font-bold text-white">${currentOrSale.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Holding Period</p>
              <p className={`text-sm font-black uppercase tracking-wider ${taxLot.holdingPeriod === 'Long-Term' ? 'text-brand-lime' : 'text-brand-orange'}`}>
                {taxLot.holdingPeriod}
              </p>
              <p className="text-[9px] text-brand-muted mt-1">{holdingDays} days</p>
            </div>
            <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Tax Impact</p>
              {isGain ? (
                <>
                  <p className="text-lg font-mono font-bold text-brand-red">${taxImpact.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="text-[9px] text-brand-muted mt-1">@ {(taxRate * 100).toFixed(0)}% rate</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-mono font-bold text-brand-lime">-${Math.abs(gainLoss * taxRate).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <p className="text-[9px] text-brand-muted mt-1">Tax offset</p>
                </>
              )}
            </div>
          </div>

          {/* Acquisition Timeline */}
          <div className="bg-brand-charcoal/30 border border-slate-800 rounded-2xl p-5">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Tax Lot Timeline</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Acquired</p>
                <p className="text-sm font-bold text-white">{formatDate(card.purchaseDate)}</p>
                <p className="text-[9px] text-brand-muted">@ ${(card.purchasePrice || 0).toFixed(2)}</p>
              </div>
              <div className="flex-shrink-0 h-px w-12 bg-slate-700 relative">
                <div className="absolute -top-2 left-0 w-4 h-4 rounded-full bg-brand-lime/20 border border-brand-lime/40"></div>
                <div className={`absolute -top-2 right-0 w-4 h-4 rounded-full ${card.status === 'sold' ? 'bg-brand-red/20 border border-brand-red/40' : 'bg-brand-blue/20 border border-brand-blue/40 animate-pulse'}`}></div>
              </div>
              <div className="flex-1 text-right">
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">
                  {card.status === 'sold' ? 'Disposed' : 'Mark-to-Market'}
                </p>
                <p className="text-sm font-bold text-white">
                  {card.status === 'sold' ? formatDate(card.saleDate) : 'Current'}
                </p>
                <p className="text-[9px] text-brand-muted">@ ${currentOrSale.toFixed(2)}</p>
              </div>
            </div>

            {/* Long-term threshold indicator */}
            {taxLot.holdingPeriod === 'Short-Term' && (
              <div className="mt-4 p-3 bg-brand-orange/5 border border-brand-orange/20 rounded-xl flex items-start gap-3">
                <AlertTriangle size={14} className="text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-brand-orange">Short-Term Capital Gains Apply</p>
                  <p className="text-[9px] text-brand-muted">
                    Hold {Math.max(0, 366 - holdingDays)} more days to qualify for long-term rate ({(0.15 * 100).toFixed(0)}% vs {(0.32 * 100).toFixed(0)}%).
                    Potential tax savings: ${((gainLoss > 0 ? gainLoss : 0) * (0.32 - 0.15)).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cost Basis Breakdown */}
          <div className="bg-brand-charcoal/30 border border-slate-800 rounded-2xl p-5">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Cost Basis Breakdown</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                <span className="text-xs text-white font-medium">Purchase Price</span>
                <span className="text-xs font-mono font-bold text-white">${(card.purchasePrice || 0).toFixed(2)}</span>
              </div>
              {card.gradingFees ? (
                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                  <span className="text-xs text-white font-medium">Grading Fees</span>
                  <span className="text-xs font-mono font-bold text-white">+${card.gradingFees.toFixed(2)}</span>
                </div>
              ) : null}
              {card.shippingFees ? (
                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                  <span className="text-xs text-white font-medium">Shipping Fees</span>
                  <span className="text-xs font-mono font-bold text-white">+${card.shippingFees.toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between items-center py-2 pt-3">
                <span className="text-xs text-brand-lime font-black uppercase tracking-wider">Adjusted Basis</span>
                <span className="text-sm font-mono font-black text-brand-lime">${costBasis.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Method Comparison */}
          <div className="bg-brand-charcoal/30 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Scale size={16} className="text-brand-blue" />
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Cost-Basis Method Comparison</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {methodComparison.map(mc => {
                const isActive = mc.method === method;
                const isBest = mc.liability === Math.min(...methodComparison.map(m => m.liability));
                return (
                  <button
                    key={mc.method}
                    onClick={() => setMethod(mc.method)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-brand-lime/10 border-brand-lime/30'
                        : 'bg-brand-charcoal/30 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-brand-lime' : 'text-brand-muted'}`}>
                        {mc.method}
                      </p>
                      {isBest && (
                        <span className="px-1.5 py-0.5 bg-brand-lime/20 text-brand-lime text-[8px] font-black uppercase tracking-widest rounded">
                          Optimal
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-mono font-bold ${mc.netGain >= 0 ? 'text-brand-lime' : 'text-brand-red'}`}>
                      {mc.netGain >= 0 ? '+' : ''}${mc.netGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-[9px] text-brand-muted mt-1">
                      Tax: ${mc.liability.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tax-Loss Harvesting Alert */}
          {!isGain && card.status !== 'sold' && (
            <div className="p-4 bg-brand-green/5 border border-brand-green/20 rounded-2xl flex items-start gap-3">
              <TrendingDown size={18} className="text-brand-green shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-brand-green mb-1">Tax-Loss Harvesting Opportunity</p>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Selling this asset would realize a ${Math.abs(gainLoss).toFixed(2)} loss, offsetting approximately
                  ${Math.abs(gainLoss * taxRate).toFixed(2)} in taxes. This loss can offset capital gains from other positions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxReportModal;
