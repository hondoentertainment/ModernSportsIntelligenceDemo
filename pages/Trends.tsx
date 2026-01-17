
import React from 'react';
import { TrendingUp, Activity, BarChart, Briefcase, Flame, Target } from 'lucide-react';

const Trends: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Trends & Patterns</h1>
          <p className="text-brand-muted max-w-2xl">Macro-level shifts in league dynamics, breakout surges, and strategic evolution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-brand-green/10 rounded-2xl text-brand-green">
              <Flame size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Predicting the Breakout Surge</h2>
              <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">Usage x Efficiency • Forecast</p>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed">
            A new pattern is emerging: Players with &lt;20% usage but >60% TS% who see a sudden +5% volume spike are currently seeing a 4x card market multiplier within 14 days. 
          </p>
          <div className="h-48 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-brand-green/10 to-transparent"></div>
             <Activity className="text-brand-green opacity-40" size={64} />
          </div>
          <div className="p-5 bg-brand-green/5 border border-brand-green/10 rounded-2xl">
            <h4 className="text-xs font-black text-brand-green uppercase mb-2">Market Indicator</h4>
            <p className="text-sm italic text-slate-400">"Current alpha is found in the 'secondary scoring' tier before national media narrative takes hold."</p>
          </div>
        </section>

        <section className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-brand-teal/10 rounded-2xl text-brand-teal">
              <Target size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Small-Ball Fatigue Metrics</h2>
              <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">Pace Dynamics • Current</p>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Elite teams are seeing a 15% drop-off in defensive rotation speed during the final 5 minutes of high-pace games. Lineup versatility is becoming more valuable than raw speed.
          </p>
          <div className="h-48 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center">
            <BarChart className="text-slate-800" size={64} />
          </div>
          <div className="p-5 bg-brand-teal/5 border border-brand-teal/10 rounded-2xl">
            <h4 className="text-xs font-black text-brand-teal uppercase mb-2">Strategic Briefing</h4>
            <p className="text-sm italic text-slate-400">"Expect roster expansion at the deadline to favor 'utility wings' who can absorb high-intensity defensive minutes."</p>
          </div>
        </section>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center max-w-3xl mx-auto space-y-4">
        <Briefcase className="mx-auto text-brand-teal" size={32} />
        <h2 className="text-xl font-bold">Need a custom pattern analysis?</h2>
        <p className="text-sm text-brand-muted leading-relaxed">
          Our intelligence platform can run bespoke regressions on specific lineup combinations, breakout potential, or schedule density factors.
        </p>
        <button className="px-8 py-3 bg-brand-teal hover:bg-teal-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand-teal/20">
          Request Custom Briefing
        </button>
      </div>
    </div>
  );
};

export default Trends;
