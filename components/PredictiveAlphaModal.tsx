import React, { useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Minus, Zap, Shield, Target, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CardInventory } from '../types';
import { forecastPriceTrajectory, analyzeBreakoutPotential, PriceTrajectory, BreakoutAnalysis } from '../lib/predictiveAlpha';

interface PredictiveAlphaModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardInventory;
}

const trajectoryConfig: Record<PriceTrajectory['trajectory'], { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  moonshot: { color: 'text-brand-lime', bg: 'bg-brand-lime/10 border-brand-lime/20', icon: <ArrowUpRight size={18} />, label: 'Moonshot' },
  bullish: { color: 'text-brand-green', bg: 'bg-brand-green/10 border-brand-green/20', icon: <TrendingUp size={18} />, label: 'Bullish' },
  stable: { color: 'text-brand-blue', bg: 'bg-brand-blue/10 border-brand-blue/20', icon: <Minus size={18} />, label: 'Stable' },
  bearish: { color: 'text-brand-orange', bg: 'bg-brand-orange/10 border-brand-orange/20', icon: <TrendingDown size={18} />, label: 'Bearish' },
  declining: { color: 'text-brand-red', bg: 'bg-brand-red/10 border-brand-red/20', icon: <ArrowDownRight size={18} />, label: 'Declining' },
};

const recConfig: Record<BreakoutAnalysis['recommendation'], { color: string; bg: string }> = {
  'Strong Buy': { color: 'text-brand-lime', bg: 'bg-brand-lime/10 border-brand-lime/30' },
  'Buy': { color: 'text-brand-green', bg: 'bg-brand-green/10 border-brand-green/30' },
  'Hold': { color: 'text-brand-blue', bg: 'bg-brand-blue/10 border-brand-blue/30' },
  'Reduce': { color: 'text-brand-orange', bg: 'bg-brand-orange/10 border-brand-orange/30' },
  'Sell': { color: 'text-brand-red', bg: 'bg-brand-red/10 border-brand-red/30' },
};

const PredictiveAlphaModal: React.FC<PredictiveAlphaModalProps> = ({ isOpen, onClose, card }) => {
  const trajectory = useMemo(() => forecastPriceTrajectory(card), [card]);
  const breakout = useMemo(() => analyzeBreakoutPotential(card), [card]);

  if (!isOpen) return null;

  const tc = trajectoryConfig[trajectory.trajectory];
  const rc = recConfig[breakout.recommendation];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-brand-slate border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-charcoal/60 to-brand-charcoal/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-teal/10 rounded-2xl border border-brand-teal/20">
              <Target size={24} className="text-brand-teal" />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white">Predictive Alpha Engine</h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{card.player} • Price Trajectory & Breakout Analysis</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="p-3 bg-brand-charcoal hover:bg-slate-800 rounded-xl transition-colors">
            <X size={20} className="text-brand-muted" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">

          {/* Trajectory + Recommendation Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-6 rounded-2xl border ${tc.bg}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={tc.color}>{tc.icon}</span>
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Trajectory</span>
              </div>
              <p className={`text-3xl font-bebas tracking-widest ${tc.color}`}>{tc.label}</p>
              <p className="text-[10px] text-brand-muted mt-1">
                Momentum: <span className={trajectory.momentum >= 0 ? 'text-brand-green' : 'text-brand-red'}>{trajectory.momentum > 0 ? '+' : ''}{trajectory.momentum}</span>
                {' '} • Volatility: <span className="text-white">{trajectory.volatility}</span>
              </p>
            </div>
            <div className={`p-6 rounded-2xl border ${rc.bg}`}>
              <div className="flex items-center gap-3 mb-3">
                <Zap size={18} className={rc.color} />
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Recommendation</span>
              </div>
              <p className={`text-3xl font-bebas tracking-widest ${rc.color}`}>{breakout.recommendation}</p>
              <p className="text-[10px] text-brand-muted mt-1">
                Breakout: <span className="text-white">{breakout.breakoutScore}/100</span>
                {' '} • Tier: <span className="text-white">{breakout.breakoutTier}</span>
              </p>
            </div>
          </div>

          {/* Price Projections */}
          <div>
            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Price Projections</h4>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: '30 Day', value: trajectory.projections.days30 },
                { label: '90 Day', value: trajectory.projections.days90 },
                { label: '6 Month', value: trajectory.projections.days180 },
                { label: '1 Year', value: trajectory.projections.days365 },
              ].map(({ label, value }) => {
                const delta = trajectory.currentValue > 0
                  ? ((value - trajectory.currentValue) / trajectory.currentValue) * 100
                  : 0;
                return (
                  <div key={label} className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
                    <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">{label}</p>
                    <p className="text-lg font-mono font-bold text-white">${value.toLocaleString()}</p>
                    <p className={`text-xs font-mono font-bold ${delta >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                      {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Shield size={14} className="text-brand-muted" />
              <span className="text-[10px] text-brand-muted">
                Confidence: <span className="text-white font-bold">{trajectory.confidence}%</span> — based on {getCardHistoryCount(card.id)} data points
              </span>
            </div>
          </div>

          {/* Breakout Factors */}
          <div>
            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Breakout Factor Analysis</h4>
            <div className="space-y-3">
              {breakout.factors.map((factor) => (
                <div key={factor.name} className="bg-brand-charcoal/30 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{factor.name}</span>
                      <span className="text-[9px] font-black text-brand-muted uppercase">({Math.round(factor.weight * 100)}% weight)</span>
                    </div>
                    <span className={`text-sm font-mono font-bold ${factor.score >= 70 ? 'text-brand-green' : factor.score >= 40 ? 'text-brand-orange' : 'text-brand-red'}`}>
                      {factor.score}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-brand-charcoal rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${factor.score}%`,
                        backgroundColor: factor.score >= 70 ? '#22C55E' : factor.score >= 40 ? '#F59E0B' : '#EF4444',
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-brand-muted">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Catalysts */}
          {trajectory.catalysts.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Price Catalysts</h4>
              <div className="space-y-2">
                {trajectory.catalysts.map((catalyst, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 bg-brand-charcoal/30 rounded-xl border border-slate-800">
                    <AlertTriangle size={14} className="text-brand-lime mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-300">{catalyst}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Footer */}
          <div className="flex items-center justify-between p-6 bg-brand-charcoal/40 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Breakout Upside</p>
              <p className="text-2xl font-mono font-bold text-brand-lime">+{breakout.upside}%</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Time Horizon</p>
              <p className="text-sm font-bold text-white">{breakout.timeHorizon}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Helper to get history count without importing priceHistory directly */
function getCardHistoryCount(cardId: string): number {
  try {
    const data = localStorage.getItem('cardx_price_history');
    if (!data) return 0;
    const history = JSON.parse(data);
    return (history[cardId] || []).length;
  } catch { return 0; }
}

export default PredictiveAlphaModal;
