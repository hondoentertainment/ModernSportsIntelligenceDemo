import React, { useMemo } from 'react';
import {
  Target,
  TrendingUp,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { CardInventory } from '../types';
import { generatePredictiveSummary } from '../lib/analytics/predictiveAlpha';

interface BreakoutRadarProps {
  inventory: CardInventory[];
  onCardClick?: (_card: CardInventory) => void;
}

const sentimentConfig = {
  'very bullish': { color: 'text-brand-lime', bg: 'bg-brand-lime/10 border-brand-lime/20', icon: '🚀' },
  'bullish': { color: 'text-brand-green', bg: 'bg-brand-green/10 border-brand-green/20', icon: '📈' },
  'neutral': { color: 'text-brand-blue', bg: 'bg-brand-blue/10 border-brand-blue/20', icon: '➡️' },
  'bearish': { color: 'text-brand-orange', bg: 'bg-brand-orange/10 border-brand-orange/20', icon: '📉' },
  'very bearish': { color: 'text-brand-red', bg: 'bg-brand-red/10 border-brand-red/20', icon: '🔻' },
};

const BreakoutRadar: React.FC<BreakoutRadarProps> = ({ inventory, onCardClick }) => {
  const summary = useMemo(() => generatePredictiveSummary(inventory), [inventory]);
  const sc = sentimentConfig[summary.overallSentiment];

  if (inventory.length === 0) return null;

  const currentTotal = inventory
    .filter(c => c.status !== 'sold')
    .reduce((sum, c) => sum + (c.currentValue || c.purchasePrice || 0), 0);

  return (
    <div className="luminous-card rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 left-0 w-48 h-48 bg-brand-teal/5 blur-[80px] rounded-full -ml-12 -mt-12 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-teal/10 rounded-2xl border border-brand-teal/20">
            <Target size={22} className="text-brand-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-bebas tracking-widest text-white">Predictive Alpha</h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Trajectory Forecast & Breakout Radar</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${sc.bg}`}>
          <span>{sc.icon}</span>
          <span className={`text-[10px] font-black uppercase tracking-widest ${sc.color}`}>{summary.overallSentiment}</span>
        </div>
      </div>

      {/* Portfolio Projections */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Current NAV</p>
          <p className="text-xl font-mono font-bold text-white">${currentTotal.toLocaleString()}</p>
        </div>
        <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">30d Forecast</p>
          <p className="text-xl font-mono font-bold text-white">${summary.totalProjectedValue30d.toLocaleString()}</p>
          <p className={`text-[10px] font-mono font-bold ${summary.projectedDelta30d >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
            {summary.projectedDelta30d >= 0 ? '+' : ''}{summary.projectedDelta30d}%
          </p>
        </div>
        <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">90d Forecast</p>
          <p className="text-xl font-mono font-bold text-white">${summary.totalProjectedValue90d.toLocaleString()}</p>
          <p className={`text-[10px] font-mono font-bold ${summary.projectedDelta90d >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
            {summary.projectedDelta90d >= 0 ? '+' : ''}{summary.projectedDelta90d}%
          </p>
        </div>
        <div className="bg-brand-charcoal/40 rounded-2xl p-4 border border-slate-800">
          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Breakout Candidates</p>
          <p className="text-xl font-mono font-bold text-brand-lime">{summary.topBreakouts.length}</p>
          <p className="text-[10px] text-brand-muted">Score ≥ 50</p>
        </div>
      </div>

      {/* Top Breakouts */}
      {summary.topBreakouts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4 flex items-center gap-2">
            <Zap size={14} className="text-brand-lime" />
            Top Breakout Candidates
          </h4>
          <div className="space-y-3">
            {summary.topBreakouts.map((b) => {
              const card = inventory.find(c => c.id === b.cardId);
              if (!card) return null;
              return (
                <div
                  key={b.cardId}
                  className="flex items-center gap-4 p-4 bg-brand-charcoal/30 rounded-2xl border border-slate-800 hover:border-brand-teal/30 transition-all cursor-pointer group/item"
                  onClick={() => onCardClick?.(card)}
                >
                  {card.image ? (
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                      <img src={card.image} alt={card.player} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-slate-800 shrink-0 flex items-center justify-center text-slate-600 text-xs font-bold">
                      {card.player.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{b.player}</p>
                    <p className="text-[10px] text-brand-muted">{card.year} {card.manufacturer} • {b.breakoutTier}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-brand-lime">{b.breakoutScore}</p>
                      <p className="text-[9px] text-brand-muted uppercase">Score</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                      b.recommendation === 'Strong Buy' ? 'bg-brand-lime/10 border-brand-lime/30 text-brand-lime' :
                      b.recommendation === 'Buy' ? 'bg-brand-green/10 border-brand-green/30 text-brand-green' :
                      'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                    }`}>
                      {b.recommendation}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-brand-green">+{b.upside}%</p>
                      <p className="text-[9px] text-brand-muted uppercase">Upside</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Risk Cards */}
      {summary.riskCards.length > 0 && (
        <div>
          <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-brand-orange" />
            At-Risk Positions
          </h4>
          <div className="space-y-2">
            {summary.riskCards.slice(0, 3).map((t) => {
              const card = inventory.find(c => c.id === t.cardId);
              if (!card) return null;
              return (
                <div
                  key={t.cardId}
                  className="flex items-center gap-4 p-3 bg-brand-red/5 rounded-xl border border-brand-red/10 cursor-pointer hover:border-brand-red/30 transition-all"
                  onClick={() => onCardClick?.(card)}
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-red/10 flex items-center justify-center shrink-0">
                    <TrendingUp size={14} className="text-brand-red rotate-180" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{card.player}</p>
                    <p className="text-[10px] text-brand-muted">{t.trajectory} • momentum {t.momentum}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-red shrink-0">
                    {((t.projections.days90 - t.currentValue) / t.currentValue * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(BreakoutRadar);
