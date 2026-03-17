import React, { useState } from 'react';
import { FlaskConical, TrendingUp, Calendar, Target } from 'lucide-react';

const ThesisBacktester: React.FC = () => {
  const [horizon] = useState('12M');
  const mockPnl = 12400;
  const mockCagr = 18.2;
  const mockRecommendations = 34;

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <FlaskConical size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Thesis Backtester</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          If you had bought every card the agents recommended in the selected period, here is your hypothetical P&L. Proves or disproves agent value with real outcome data.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><TrendingUp size={12} className="text-emerald-400" /> Hypothetical P&L</div>
          <div className="text-2xl font-bold text-emerald-400">${mockPnl.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Last {horizon}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Target size={12} className="text-sky-400" /> CAGR (paper)</div>
          <div className="text-2xl font-bold text-sky-400">{mockCagr}%</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Calendar size={12} className="text-amber-400" /> Recommendations</div>
          <div className="text-2xl font-bold text-amber-400">{mockRecommendations}</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Backtest config</h3>
        <p className="text-slate-400 text-sm">Select horizon (1M, 3M, 6M, 12M) and run backtest against stored agent recommendations and fill data. Requires agent outcome memory and execution fills.</p>
      </div>
    </div>
  );
};

export default ThesisBacktester;
