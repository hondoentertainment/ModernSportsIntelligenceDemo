import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, TrendingUp, Zap, Trophy, Package, RefreshCw, Sparkles, ChevronRight } from 'lucide-react';

interface DashboardEmptyStateProps {
  onScanOpen: () => void;
  onInitialize: () => void;
}

const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ onScanOpen, onInitialize }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden py-12">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-lime/5 blur-[100px] rounded-full animate-pulse"></div>

    <div className="relative z-10 w-full max-w-4xl space-y-8 text-center reveal-section">
      <div className="inline-flex flex-col items-center gap-4">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-brand-lime to-brand-teal rounded-full blur-md opacity-25 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
          <div className="relative p-6 bg-brand-charcoal border border-slate-800 rounded-full shadow-2xl">
            <Activity size={48} className="text-brand-lime animate-pulse" />
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-lime to-transparent opacity-50 animate-scan pointer-events-none"></div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tighter text-white leading-none">
            SYSTEM <span className="text-brand-lime">INITIALIZATION</span>
          </h1>
          <p className="text-lg text-brand-muted font-medium max-w-xl mx-auto leading-tight">
            Intelligence engine active. Deploy your first asset to calibrate market tracking.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center pt-2">
        <Link
          to="/collection"
          className="px-10 py-5 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all shadow-2xl shadow-brand-lime/20 flex items-center gap-3 uppercase tracking-widest text-xs transform active:scale-95 group"
        >
          <Package size={18} strokeWidth={3} />
          Deploy First Asset
          <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <button
          onClick={onScanOpen}
          className="px-10 py-5 bg-brand-charcoal hover:bg-slate-800 border border-brand-lime/30 text-brand-lime font-black rounded-2xl transition-all shadow-2xl flex items-center gap-3 uppercase tracking-widest text-xs transform active:scale-95 group"
        >
          <Sparkles size={18} className="group-hover:animate-pulse" />
          AI Alpha Scan
        </button>
        <button
          onClick={onInitialize}
          className="px-10 py-5 bg-brand-charcoal hover:bg-slate-800 border border-slate-700 text-white font-black rounded-2xl transition-all flex items-center gap-3 uppercase tracking-widest text-xs transform active:scale-95 group"
        >
          <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
          Initialize Demo Sync
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 opacity-80 scale-95">
        {[
          { icon: <TrendingUp size={18} />, title: 'Market Pulse', desc: 'Real-time liquidity' },
          { icon: <Zap size={18} />, title: 'Gemini Insight', desc: 'AI valuation' },
          { icon: <Trophy size={18} />, title: 'Asset Alpha', desc: 'League analytics' },
        ].map((feature, i) => (
          <div
            key={i}
            className="bg-brand-slate/40 backdrop-blur-md border border-slate-800 p-6 rounded-[1.5rem] space-y-2 group hover:border-brand-lime/30 transition-all"
          >
            <div className="w-10 h-10 bg-brand-charcoal rounded-xl flex items-center justify-center text-brand-lime mb-1 group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bebas tracking-wide text-white">{feature.title}</h3>
            <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest leading-none">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="pt-6">
        <p className="text-[9px] font-black text-brand-muted/60 uppercase tracking-[0.6em] animate-pulse">Awaiting Data Ingestion...</p>
      </div>
    </div>
  </div>
);

export default DashboardEmptyState;
