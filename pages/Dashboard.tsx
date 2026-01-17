
import React from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  Activity, 
  Trophy, 
  Zap,
  Layers,
  Sparkles,
  PieChart,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { MOCK_CARDS } from '../constants.tsx';

const Dashboard: React.FC = () => {
  const chartData = [
    { name: 'Oct', val: 4200 },
    { name: 'Nov', val: 4800 },
    { name: 'Dec', val: 4500 },
    { name: 'Jan', val: 5100 },
    { name: 'Feb', val: 5900 },
  ];

  const recentCards = MOCK_CARDS.slice(0, 3);
  
  const stats = {
    totalValue: 5917.48,
    roi: 75.32,
    inventoryCount: MOCK_CARDS.length,
    realizedProfit: 1859.50
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Hero Financial Summary */}
      <section className="relative overflow-hidden bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8 md:p-12">
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-brand-lime/10 blur-[120px] rounded-full"></div>
        <div className="relative flex flex-col lg:flex-row gap-12 items-center justify-between">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles size={14} />
              Portfolio Intelligence Active
            </div>
            <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-[0.9]">
              Net Asset Value: <span className="text-brand-lime">${stats.totalValue.toLocaleString()}</span>
            </h1>
            <p className="text-brand-muted text-lg leading-relaxed max-w-xl font-medium">
              Your collection has grown by <span className="text-brand-green font-bold">12.4% this month</span>. Market signals suggest hold position on top-tier prospects.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link to="/collection" className="px-8 py-3 bg-brand-lime hover:bg-lime-400 text-brand-charcoal font-black rounded-xl transition-all shadow-xl shadow-brand-lime/20 flex items-center gap-2 uppercase tracking-widest text-xs">
                Manage Inventory <ArrowUpRight size={18} strokeWidth={3} />
              </Link>
              <button className="px-8 py-3 bg-brand-slate hover:bg-slate-800 border border-slate-700 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs">
                Export Financials
              </button>
            </div>
          </div>
          
          <div className="w-full lg:w-96 aspect-[16/9] bg-brand-slate/50 rounded-3xl border border-slate-800/50 p-6">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Portfolio Valuation Trend</p>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.88 0.20 127)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="oklch(0.88 0.20 127)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'oklch(0.15 0.01 240)', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Area type="monotone" dataKey="val" stroke="oklch(0.88 0.20 127)" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-slate border border-slate-800 p-6 rounded-[2rem] space-y-2">
              <div className="w-10 h-10 bg-brand-lime/10 rounded-xl flex items-center justify-center text-brand-lime">
                 <CreditCard size={20} />
              </div>
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pt-2">Total ROI</p>
              <p className="text-3xl font-mono font-bold text-brand-green">+{stats.roi}%</p>
            </div>
            <div className="bg-brand-slate border border-slate-800 p-6 rounded-[2rem] space-y-2">
              <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                 <PieChart size={20} />
              </div>
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pt-2">Realized Profit</p>
              <p className="text-3xl font-mono font-bold text-white">${stats.realizedProfit.toLocaleString()}</p>
            </div>
            <div className="bg-brand-slate border border-slate-800 p-6 rounded-[2rem] space-y-2">
              <div className="w-10 h-10 bg-brand-lime/10 rounded-xl flex items-center justify-center text-brand-lime">
                 <Layers size={20} />
              </div>
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest pt-2">Inventory Depth</p>
              <p className="text-3xl font-mono font-bold text-white">{stats.inventoryCount} Assets</p>
            </div>
          </div>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bebas tracking-wider flex items-center gap-3">
                <Activity className="text-brand-lime" size={28} />
                Recently Cataloged
              </h2>
              <Link to="/collection" className="text-xs font-black text-brand-lime uppercase tracking-widest hover:underline">Full Collection</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {recentCards.map(card => (
                 <div key={card.id} className="bg-brand-slate border border-slate-800 rounded-3xl p-4 space-y-3">
                    <img src={card.image} className="w-full aspect-square object-cover rounded-2xl" />
                    <div>
                      <h4 className="font-bold text-sm truncate">{card.player}</h4>
                      <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest">{card.year} {card.manufacturer}</p>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-mono font-bold">${card.purchasePrice}</span>
                       <span className="text-[10px] font-black text-brand-lime uppercase">{card.grade ? `PSA ${card.grade}` : 'RAW'}</span>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
           <section className="bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8">
              <h3 className="text-2xl font-bebas tracking-wider mb-6 flex items-center gap-3">
                <Activity className="text-brand-lime" size={24} />
                Market Pulse
              </h3>
              <div className="space-y-5">
                 {[
                   { label: 'Bowman Chrome Hype', val: 'Rising', color: 'text-brand-green' },
                   { label: 'PSA 10 Population', val: 'Inflating', color: 'text-brand-orange' },
                   { label: 'Off-Season Liquidity', val: 'Low', color: 'text-brand-red' },
                   { label: 'Vintage Indices', val: 'Stable', color: 'text-brand-muted' }
                 ].map((pulse, i) => (
                   <div key={i} className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">{pulse.label}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${pulse.color}`}>{pulse.val}</span>
                   </div>
                 ))}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-800">
                 <p className="text-[10px] font-bold text-brand-muted uppercase mb-4 tracking-widest">Live MLB Scores</p>
                 <Link to="/mlb-stats" className="block p-4 bg-brand-slate rounded-2xl border border-slate-800 hover:border-brand-lime/30 transition-all group">
                    <div className="flex justify-between items-center text-xs font-bold">
                       <span>NYY</span>
                       <span className="text-brand-lime font-mono">4</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold mt-2">
                       <span>BOS</span>
                       <span className="text-brand-lime font-mono">2</span>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-[10px] text-brand-muted font-black uppercase">
                       <span>Final</span>
                       <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                 </Link>
              </div>
           </section>

           <section className="bg-brand-lime/5 border border-brand-lime/20 rounded-[2.5rem] p-8 text-center space-y-4">
              <Zap className="mx-auto text-brand-lime" size={32} />
              <h3 className="font-bebas text-2xl tracking-widest text-white">Prospect Alerts</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                3 prospects in your watchlist reached new search trend peaks today. Analyze breakout potential now.
              </p>
              <Link to="/prospects" className="block w-full py-3 bg-brand-slate border border-slate-700 hover:border-brand-lime/50 text-brand-lime rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                 View Trending Prospects
              </Link>
           </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
