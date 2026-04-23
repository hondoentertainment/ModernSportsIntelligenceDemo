// @ts-nocheck
import React from 'react';
import { Activity, Zap, Layers, ArrowUpRight } from 'lucide-react';

interface Signal {
  id: string;
  type: 'buy' | 'sell' | 'scarcity';
  impact: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

interface StrategicSignalsFeedProps {
  signals: Signal[];
}

const StrategicSignalsFeed: React.FC<StrategicSignalsFeedProps> = ({ signals }) => (
  <div
    className="reveal-section bg-brand-charcoal/50 border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden relative shadow-2xl shadow-brand-blue/5 animate-in slide-in-from-bottom-8 duration-700 order-1 lg:order-3"
    style={{ animationDelay: '400ms' }}
  >
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
          <Activity size={20} />
        </div>
        <div>
          <h3 className="text-2xl font-bebas tracking-wide text-white">Strategic Signals</h3>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest leading-none">Market Opportunity Analysis</p>
        </div>
      </div>
      <div className="px-3 py-1 bg-brand-charcoal border border-slate-800 rounded-full text-[10px] font-black text-brand-blue uppercase tracking-widest">
        {signals.length} Active {signals.length === 1 ? 'Signal' : 'Signals'}
      </div>
    </div>

    {signals.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {signals.map(signal => (
          <div
            key={signal.id}
            className="p-6 luminous-card rounded-2xl relative overflow-hidden group hover:border-brand-blue/40 transition-all"
          >
            <div
              className={`absolute top-0 right-0 w-16 h-16 blur-3xl opacity-10 rounded-full -mr-8 -mt-8 ${signal.type === 'buy' ? 'bg-brand-lime' : 'bg-brand-teal'}`}
            ></div>
            <div className="relative z-10 space-y-3">
              <div className="flex justify-between items-start">
                <div
                  className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${signal.type === 'buy' ? 'bg-brand-lime/10 text-brand-lime' : 'bg-brand-teal/10 text-brand-teal'}`}
                >
                  {signal.type === 'buy' ? 'Liquidity Inbound' : 'Asset Maturity'}
                </div>
                {signal.impact === 'high' && (
                  <div className="flex items-center gap-1 text-[9px] font-black text-brand-orange uppercase animate-pulse">
                    <Zap size={10} /> High Impact
                  </div>
                )}
              </div>
              <h4 className="text-white font-bold leading-tight">{signal.title}</h4>
              <p className="text-xs text-brand-muted leading-relaxed font-medium">{signal.description}</p>
              <button className="flex items-center gap-2 text-[10px] font-black text-brand-blue uppercase tracking-widest pt-2 group-hover:text-white transition-colors">
                Execute Action <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-brand-slate/20 rounded-3xl border border-dashed border-slate-800">
        <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600">
          <Layers size={24} />
        </div>
        <div>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Awaiting Alpha Breakouts</p>
          <p className="text-[10px] text-slate-500 font-medium">
            No active entry/exit signals detected in current market cycle.
          </p>
        </div>
      </div>
    )}
  </div>
);

export default StrategicSignalsFeed;
