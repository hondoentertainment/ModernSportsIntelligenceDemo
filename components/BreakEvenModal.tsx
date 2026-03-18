import React, { useState, useMemo } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown, Minus, ArrowRightLeft } from 'lucide-react';
import { CardInventory } from '../types';
import { calculateBreakEven, MARKETPLACE_FEES } from '../lib/analytics/breakEvenService';

interface BreakEvenModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardInventory;
}

export const BreakEvenModal: React.FC<BreakEvenModalProps> = ({ isOpen, onClose, card }) => {
  const [marketplace, setMarketplace] = useState('ebay');
  const [additionalCosts, setAdditionalCosts] = useState(0);

  const result = useMemo(
    () => calculateBreakEven(card, marketplace, additionalCosts),
    [card, marketplace, additionalCosts]
  );

  if (!isOpen) return null;

  const fee = MARKETPLACE_FEES[marketplace];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-brand-slate border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-brand-charcoal/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-orange/10 text-brand-orange rounded-2xl">
              <DollarSign size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bebas tracking-widest text-white leading-tight">Break-Even Calculator</h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                {card.player} — {card.year} {card.set}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto no-scrollbar">

          {/* Cost basis breakdown */}
          <div className="p-5 bg-brand-charcoal/30 border border-slate-800 rounded-2xl space-y-2 text-xs">
            <p className="font-black text-brand-muted uppercase tracking-widest mb-3">Total Cost Basis</p>
            <div className="flex justify-between text-slate-400">
              <span>Purchase price</span>
              <span className="font-mono">${card.purchasePrice.toLocaleString()}</span>
            </div>
            {(card.gradingFees || 0) > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Grading fees</span>
                <span className="font-mono">${(card.gradingFees || 0).toLocaleString()}</span>
              </div>
            )}
            {(card.shippingFees || 0) > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Shipping fees</span>
                <span className="font-mono">${(card.shippingFees || 0).toLocaleString()}</span>
              </div>
            )}
            {additionalCosts > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Additional costs</span>
                <span className="font-mono">${additionalCosts.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-white">
              <span>Total in</span>
              <span className="font-mono">${Math.round(result.costBasis).toLocaleString()}</span>
            </div>
          </div>

          {/* Marketplace selector */}
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">Sell Platform</p>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
              {Object.entries(MARKETPLACE_FEES).map(([key, mp]) => (
                <button
                  key={key}
                  onClick={() => setMarketplace(key)}
                  className={`py-3 px-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all ${marketplace === key
                    ? 'bg-brand-orange/10 border-brand-orange/40 text-brand-orange'
                    : 'bg-brand-charcoal/40 border-slate-800 text-brand-muted hover:text-white hover:border-slate-700'
                    }`}
                >
                  {mp.label}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-brand-muted mt-2">
              {fee.label}: {(fee.rate * 100).toFixed(1)}%{fee.fixed > 0 ? ` + $${fee.fixed.toFixed(2)}` : ''} per sale
            </p>
          </div>

          {/* Additional costs input */}
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">Additional Costs (optional)</p>
            <input
              type="number"
              min="0"
              step="0.01"
              value={additionalCosts || ''}
              onChange={(e) => setAdditionalCosts(Number(e.target.value) || 0)}
              placeholder="e.g. insurance, holder, etc."
              className="w-full px-5 py-3 bg-brand-charcoal/50 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-orange/40"
            />
          </div>

          {/* Break-even result */}
          <div className={`p-6 rounded-2xl border ${result.currentProfit >= 0 ? 'bg-brand-green/5 border-brand-green/20' : 'bg-brand-red/5 border-brand-red/20'}`}>
            <div className="flex items-center gap-2 mb-4">
              <ArrowRightLeft size={16} className="text-brand-orange" />
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Break-Even Analysis</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-[9px] text-brand-muted uppercase tracking-tighter mb-1">Break-Even Price</p>
                <p className="text-lg font-mono font-black text-brand-orange">${Math.round(result.breakEvenPrice).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-muted uppercase tracking-tighter mb-1">Current Value</p>
                <p className="text-lg font-mono font-black text-slate-200">${Math.round(card.currentValue || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-muted uppercase tracking-tighter mb-1">Net Profit</p>
                <p className={`text-lg font-mono font-black ${result.currentProfit >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                  {result.currentProfit >= 0 ? '+' : ''}${Math.round(result.currentProfit).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-brand-muted uppercase tracking-tighter mb-1">Net ROI</p>
                <p className={`text-lg font-mono font-black ${result.currentROI >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                  {result.currentROI >= 0 ? '+' : ''}{Math.round(result.currentROI)}%
                </p>
              </div>
            </div>
            <p className="text-[9px] text-brand-muted mt-4 leading-relaxed">
              You need to sell for at least <span className="text-white font-bold">${Math.round(result.breakEvenPrice).toLocaleString()}</span> on {fee.label} to recover your total investment of ${Math.round(result.costBasis).toLocaleString()} after platform fees.
            </p>
          </div>

          {/* Scenarios */}
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">Profit Scenarios</p>
            <div className="space-y-2">
              {result.scenarios.map((s) => (
                <div key={s.label} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center p-4 bg-brand-charcoal/40 border border-slate-800 rounded-2xl">
                  <div>
                    <p className="text-xs font-black text-white">{s.label}</p>
                    <p className="text-[9px] text-brand-muted">-${Math.round(s.fees).toLocaleString()} fees</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-brand-muted uppercase tracking-tighter">Net</p>
                    <p className="text-xs font-mono font-black text-slate-200">${Math.round(s.netProceeds).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-brand-muted uppercase tracking-tighter">Profit</p>
                    <p className={`text-xs font-mono font-black ${s.profit >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                      {s.profit >= 0 ? '+' : ''}${Math.round(s.profit).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {s.roi > 5 ? (
                      <TrendingUp size={14} className="text-brand-green flex-shrink-0" />
                    ) : s.roi < -5 ? (
                      <TrendingDown size={14} className="text-brand-red flex-shrink-0" />
                    ) : (
                      <Minus size={14} className="text-slate-500 flex-shrink-0" />
                    )}
                    <span className={`text-xs font-black ${s.roi > 5 ? 'text-brand-green' : s.roi < -5 ? 'text-brand-red' : 'text-slate-400'}`}>
                      {s.roi >= 0 ? '+' : ''}{Math.round(s.roi)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BreakEvenModal;
