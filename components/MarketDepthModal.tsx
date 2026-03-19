import React, { useMemo } from 'react';
import { X, BarChart3, Clock, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';
import { CardInventory } from '../types';
import { generateMarketDepth, getVolumeMetrics } from '../lib/analytics/marketDepthService';

interface MarketDepthModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardInventory;
}

const velocityConfig = {
  'very fast': { color: 'text-brand-lime', bg: 'bg-brand-lime/10' },
  'fast': { color: 'text-brand-green', bg: 'bg-brand-green/10' },
  'moderate': { color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
  'slow': { color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
  'very slow': { color: 'text-brand-red', bg: 'bg-brand-red/10' },
};

const MarketDepthModal: React.FC<MarketDepthModalProps> = ({ isOpen, onClose, card }) => {
  const depth = useMemo(() => generateMarketDepth(card), [card]);
  const volume = useMemo(() => getVolumeMetrics(card), [card]);

  if (!isOpen) return null;

  const vc = velocityConfig[volume.velocity];
  const maxDepthQty = Math.max(
    ...depth.bids.map(b => b.cumulative),
    ...depth.asks.map(a => a.cumulative),
    1
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-brand-slate border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-charcoal/60 to-brand-charcoal/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-green/10 rounded-2xl border border-brand-green/20">
              <BarChart3 size={24} className="text-brand-green" />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white">Market Depth Analysis</h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{card.player} • Institutional Liquidity Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="p-3 bg-brand-charcoal hover:bg-slate-800 rounded-xl transition-colors">
            <X size={20} className="text-brand-muted" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Bid-Ask Spread</p>
              <p className={`text-xl font-mono font-bold ${depth.spread < 5 ? 'text-brand-green' : depth.spread < 10 ? 'text-brand-orange' : 'text-brand-red'}`}>
                {depth.spread}%
              </p>
              <p className="text-[9px] text-brand-muted capitalize">{depth.spreadCategory}</p>
            </div>
            <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Buy Pressure</p>
              <p className={`text-xl font-mono font-bold ${depth.buyPressure > 55 ? 'text-brand-green' : depth.buyPressure < 45 ? 'text-brand-red' : 'text-white'}`}>
                {depth.buyPressure}%
              </p>
              <p className="text-[9px] text-brand-muted">{depth.totalBidVolume} bids / {depth.totalAskVolume} asks</p>
            </div>
            <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Velocity</p>
              <p className={`text-xl font-mono font-bold capitalize ${vc.color}`}>{volume.velocity}</p>
              <p className="text-[9px] text-brand-muted">{volume.dailyVolume}/day</p>
            </div>
            <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Avg Days to Sell</p>
              <p className="text-xl font-mono font-bold text-white">{volume.avgDaysToSell}</p>
              <p className="text-[9px] text-brand-muted">Sell-through: {volume.sellThroughRate}%</p>
            </div>
          </div>

          {/* Depth Chart */}
          <div>
            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Order Book Depth</h4>
            <div className="bg-brand-charcoal/30 rounded-2xl border border-slate-800 p-6">
              {/* Mid price */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Mid Price</span>
                <span className="text-xl font-mono font-bold text-white">${depth.midPrice.toLocaleString()}</span>
              </div>

              {/* Bids (green, left-aligned) */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUp size={12} className="text-brand-green" />
                  <span className="text-[9px] font-black text-brand-green uppercase tracking-widest">Bids (Buyers)</span>
                </div>
                {depth.bids.map((level, i) => (
                  <div key={`bid-${i}`} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-brand-green w-20 text-right">${level.price.toLocaleString()}</span>
                    <div className="flex-1 h-5 bg-brand-charcoal rounded overflow-hidden">
                      <div
                        className="h-full bg-brand-green/30 rounded transition-all"
                        style={{ width: `${(level.cumulative / maxDepthQty) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-brand-muted w-8 text-right">{level.quantity}</span>
                    <span className="text-[9px] font-mono text-slate-600 w-10 text-right">Σ{level.cumulative}</span>
                  </div>
                ))}
              </div>

              {/* Asks (red, right-aligned) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDown size={12} className="text-brand-red" />
                  <span className="text-[9px] font-black text-brand-red uppercase tracking-widest">Asks (Sellers)</span>
                </div>
                {depth.asks.map((level, i) => (
                  <div key={`ask-${i}`} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-brand-red w-20 text-right">${level.price.toLocaleString()}</span>
                    <div className="flex-1 h-5 bg-brand-charcoal rounded overflow-hidden">
                      <div
                        className="h-full bg-brand-red/30 rounded transition-all"
                        style={{ width: `${(level.cumulative / maxDepthQty) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-brand-muted w-8 text-right">{level.quantity}</span>
                    <span className="text-[9px] font-mono text-slate-600 w-10 text-right">Σ{level.cumulative}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Impact */}
          <div>
            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Market Impact Estimate</h4>
            <div className="grid grid-cols-4 gap-3">
              {depth.marketImpact.map((impact) => (
                <div key={impact.units} className="bg-brand-charcoal/40 rounded-xl p-3 border border-slate-800 text-center">
                  <p className="text-[9px] font-black text-brand-muted uppercase mb-1">Sell {impact.units} unit{impact.units > 1 ? 's' : ''}</p>
                  <p className={`text-lg font-mono font-bold ${impact.avgSlippage < 3 ? 'text-brand-green' : impact.avgSlippage < 8 ? 'text-brand-orange' : 'text-brand-red'}`}>
                    -{impact.avgSlippage}%
                  </p>
                  <p className="text-[9px] text-brand-muted">slippage</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sales */}
          <div>
            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock size={14} className="text-brand-muted" /> Recent Comparable Sales
            </h4>
            <div className="space-y-2">
              {volume.recentSales.map((sale, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-brand-charcoal/30 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-lime" />
                    <span className="text-sm font-mono font-bold text-white">${sale.price.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-brand-muted">{sale.daysAgo} day{sale.daysAgo !== 1 ? 's' : ''} ago</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <TrendingUp size={14} className="text-brand-muted" />
              <span className="text-[10px] text-brand-muted">
                Price consensus: <span className={`font-bold ${volume.priceConsensus >= 70 ? 'text-brand-green' : volume.priceConsensus >= 40 ? 'text-brand-orange' : 'text-brand-red'}`}>
                  {volume.priceConsensus}/100
                </span> — {volume.priceConsensus >= 70 ? 'tightly clustered sales' : volume.priceConsensus >= 40 ? 'moderate price variation' : 'wide price dispersion'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDepthModal;
