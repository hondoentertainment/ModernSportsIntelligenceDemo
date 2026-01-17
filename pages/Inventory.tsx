
import React from 'react';
import { 
  ArrowUpRight, 
  Target, 
  Layers, 
  ChevronRight,
  PieChart,
  Briefcase,
  Zap,
  Activity
} from 'lucide-react';
import { MOCK_INVENTORY_SUMMARY, MOCK_INVENTORY_ITEMS, MOCK_ACQUISITION_TARGETS } from '../constants.tsx';

const Inventory: React.FC = () => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-white">Portfolio Intelligence</h1>
          <p className="text-brand-muted max-w-2xl">Asset tracking merged with performance-driven acquisition strategy.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <p className="text-xs font-bold text-brand-muted uppercase mb-2 tracking-widest">Portfolio Cost Basis</p>
          <p className="text-2xl font-black">{formatCurrency(MOCK_INVENTORY_SUMMARY.totalCost)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 border-brand-lime/20">
          <p className="text-xs font-bold text-brand-lime uppercase mb-2 tracking-widest">Net Asset Value</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black text-brand-lime">{formatCurrency(MOCK_INVENTORY_SUMMARY.marketValue)}</p>
            <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <ArrowUpRight size={14} /> {MOCK_INVENTORY_SUMMARY.roi}%
            </span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <p className="text-xs font-bold text-brand-muted uppercase mb-2 tracking-widest">Unrealized Growth</p>
          <p className="text-2xl font-black text-brand-green">{formatCurrency(MOCK_INVENTORY_SUMMARY.totalGain)}</p>
        </div>
        <div className="bg-brand-lime/5 border border-brand-lime/20 rounded-3xl p-6">
          <p className="text-xs font-bold text-brand-lime uppercase mb-2 tracking-widest">Total Realized Profit</p>
          <p className="text-2xl font-black">{formatCurrency(MOCK_INVENTORY_SUMMARY.realizedProfit)}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Layers className="text-brand-lime" size={20} />
                Current Holdings
              </h2>
              <button className="text-xs font-bold text-brand-lime hover:underline flex items-center gap-1">
                Download Report <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {MOCK_INVENTORY_ITEMS.map((item) => (
                <div key={item.id} className="p-5 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col md:flex-row gap-6 hover:border-brand-lime/30 transition-all group">
                  <div className="w-full md:w-32 aspect-square rounded-2xl overflow-hidden border border-slate-800">
                    <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg leading-tight mb-1">{item.cardName}</h3>
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 rounded bg-brand-lime/10 border border-brand-lime/20 text-[10px] font-bold text-brand-lime uppercase tracking-widest">
                             {item.status}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <Target className="text-brand-lime" size={18} />
              Acquisition Targets
            </h2>
            <div className="space-y-4">
              {MOCK_ACQUISITION_TARGETS.map((target) => (
                <div key={target.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl group hover:border-brand-lime transition-all">
                  <p className="text-sm font-bold group-hover:text-brand-lime transition-colors leading-none mb-1">{target.name}</p>
                  <p className="text-[10px] text-brand-muted uppercase font-bold tracking-tight mb-4">{target.team} • {target.focus}</p>
                  <div className="flex items-center justify-between border-t border-slate-800/50 pt-4">
                    <p className="text-sm font-black text-white">{formatCurrency(target.targetPrice)}</p>
                    <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-brand-lime transition-all">
                       <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-brand-lime/5 border border-brand-lime/20 rounded-3xl p-6 text-center">
             <Briefcase className="mx-auto text-brand-lime mb-4" size={32} />
             <h3 className="font-bold mb-2 text-white">Strategy Rebalancing</h3>
             <button className="w-full py-3 bg-slate-950 border border-slate-800 hover:border-brand-lime/50 rounded-xl text-xs font-bold transition-all uppercase tracking-widest text-brand-lime">
               Execute Rebalance
             </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
