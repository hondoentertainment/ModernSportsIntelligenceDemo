
import React from 'react';
import { Bell, Zap, TrendingUp, Filter, CheckCircle2, AlertTriangle } from 'lucide-react';

const Alerts: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Alerts & Signals</h1>
          <p className="text-brand-muted max-w-2xl">Automated triggers for significant contextual shifts in the sports landscape.</p>
        </div>
        <button className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2">
          <Filter size={18} /> Alert Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-teal">Active Signals</h2>
          <div className="space-y-4">
            {[
              { id: 1, type: 'trend', title: 'Usage Spike Detected: Victor Wembanyama', desc: 'Usage rate increased +12% over last 3 games. Efficiency remains stable.', time: '12m ago' },
              { id: 2, type: 'momentum', title: 'Team Momentum Alert: Thunder', desc: 'OKC has cleared the 118.0 OffRTG threshold for 5 consecutive games.', time: '2h ago' },
              { id: 3, type: 'warning', title: 'Clutch Regression Signal: Lakers', desc: 'Transition defense tracking shows a 4.2 second delay in rotation over previous week.', time: '5h ago' }
            ].map(alert => (
              <div key={alert.id} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex gap-6 group hover:border-slate-700 transition-all">
                <div className={`p-4 rounded-2xl h-fit ${alert.type === 'trend' ? 'bg-brand-teal/10 text-brand-teal' : alert.type === 'momentum' ? 'bg-brand-green/10 text-brand-green' : 'bg-red-500/10 text-red-400'}`}>
                   {alert.type === 'trend' ? <TrendingUp size={24} /> : alert.type === 'momentum' ? <Zap size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-brand-teal transition-colors">{alert.title}</h3>
                    <span className="text-[10px] text-slate-600 font-bold whitespace-nowrap">{alert.time}</span>
                  </div>
                  <p className="text-brand-muted text-sm leading-relaxed mb-4">{alert.desc}</p>
                  <div className="flex gap-3">
                    <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Analyze Signal</button>
                    <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Acknowledge</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h2 className="text-lg font-bold mb-4">Outcome Tracking</h2>
            <p className="text-xs text-brand-muted mb-6">Historical accuracy of intelligence signals.</p>
            <div className="space-y-4">
              {[
                { label: 'Trend Accuracy', val: '88%' },
                { label: 'Momentum Realization', val: '74%' },
                { label: 'Injury Impact Logic', val: '92%' }
              ].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-tighter">
                    <span>{stat.label}</span>
                    <span className="text-brand-teal">{stat.val}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-teal" style={{ width: stat.val }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-2 text-brand-green">
                <CheckCircle2 size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Model Certified</span>
              </div>
            </div>
          </section>

          <section className="p-6 bg-brand-teal/10 border border-brand-teal/20 rounded-3xl text-center">
             <Bell className="mx-auto text-brand-teal mb-4" size={32} />
             <h3 className="font-bold mb-2">Subscribe to Signals</h3>
             <p className="text-xs text-brand-muted leading-relaxed mb-6">Get real-time push notifications for player-specific intelligence shifts.</p>
             <button className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:border-brand-teal/50 rounded-xl text-xs font-bold transition-all">
               Manage Subscriptions
             </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
