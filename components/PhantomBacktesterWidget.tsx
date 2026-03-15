import React, { useMemo } from 'react';
import { Ghost, ChevronRight, TrendingUp, Zap, Crown, Rocket, Play } from 'lucide-react';
import { getSavedPortfolios, getPresetStrategies } from '../lib/phantomBacktesterService';

interface PhantomBacktesterWidgetProps {
  onClick?: () => void;
}

export const PhantomBacktesterWidget: React.FC<PhantomBacktesterWidgetProps> = ({ onClick }) => {
  const portfolios = useMemo(() => getSavedPortfolios(), []);
  const presets = useMemo(() => getPresetStrategies(), []);

  const completedPortfolios = portfolios.filter((p) => p.status === 'completed');
  const bestReturn = completedPortfolios.length > 0
    ? completedPortfolios.reduce((best, p) => {
        const ret = p.result?.totalReturn || 0;
        return ret > (best.result?.totalReturn || 0) ? p : best;
      })
    : null;

  const latestCompleted = completedPortfolios.length > 0
    ? completedPortfolios.reduce((latest, p) =>
        new Date(p.createdAt) > new Date(latest.createdAt) ? p : latest,
      )
    : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Ghost size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Phantom <span className="text-brand-lime">Backtester</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Historical Portfolio Simulator
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Best Return Highlight */}
      {bestReturn && bestReturn.result && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Best Backtest</p>
              <p className="text-sm font-bold text-white mt-0.5">{bestReturn.name}</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bebas tracking-wider ${bestReturn.result.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {bestReturn.result.totalReturn >= 0 ? '+' : ''}{bestReturn.result.totalReturn.toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-500">Total Return</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/40 rounded-xl p-3 text-center">
          <p className="text-lg font-bebas tracking-wider text-white">{portfolios.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Portfolios</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 text-center">
          <p className="text-lg font-bebas tracking-wider text-brand-lime">{presets.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Strategies</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 text-center">
          <p className="text-lg font-bebas tracking-wider text-emerald-400">
            {latestCompleted?.result ? `${latestCompleted.result.sharpeRatio.toFixed(1)}` : '--'}
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sharpe</p>
        </div>
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {presets.slice(0, 3).map((preset) => (
          <div
            key={preset.id}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/40 rounded-full border border-slate-700/30 whitespace-nowrap"
          >
            {preset.category === 'nfl' && <Zap size={12} className="text-orange-400" />}
            {preset.category === 'vintage' && <Crown size={12} className="text-amber-400" />}
            {preset.category === 'nba' && <TrendingUp size={12} className="text-blue-400" />}
            {preset.category === 'modern' && <Rocket size={12} className="text-purple-400" />}
            {preset.category === 'mlb' && <Play size={12} className="text-yellow-400" />}
            <span className="text-[10px] font-bold text-slate-400">{preset.name}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-2 text-sm text-brand-lime font-bold group-hover:gap-3 transition-all">
        <Ghost size={14} />
        Run a Phantom Backtest
        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

export default PhantomBacktesterWidget;
