// @ts-nocheck
import React, { useState } from 'react';
import { Code } from 'lucide-react';
import QuantWorkbenchModal from '../components/QuantWorkbenchModal';

const QuantWorkbench: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-2">
            <Code size={12} className="text-cyan-400" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Quant Engine Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Quantitative <span className="text-cyan-400">Workbench</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">
            BQuant for Cards — Programmatic Analysis & Strategy Backtesting
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-500/15 border border-cyan-500/30 rounded-xl text-cyan-400 text-sm font-bold uppercase tracking-wider hover:bg-cyan-500/25 transition-colors"
        >
          <Code size={18} />
          Open Workbench
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-charcoal border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Code size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Strategy Editor</h3>
              <p className="text-[10px] text-slate-500">Write & execute custom analysis code</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Full code editor with syntax highlighting, auto-complete suggestions, and instant execution against the entire card universe.
          </p>
        </div>

        <div className="bg-brand-charcoal border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Code size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Backtesting Engine</h3>
              <p className="text-[10px] text-slate-500">Historical strategy performance analysis</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Run strategies against 24 months of historical data. Equity curves, Sharpe ratios, max drawdown, win rates, and full trade logs.
          </p>
        </div>

        <div className="bg-brand-charcoal border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Code size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Custom Screener</h3>
              <p className="text-[10px] text-slate-500">Visual filter builder for card discovery</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Build multi-criteria screens with field/operator/value filters. Find undervalued cards, momentum plays, and arbitrage opportunities.
          </p>
        </div>
      </div>

      {/* Modal */}
      <QuantWorkbenchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default QuantWorkbench;
