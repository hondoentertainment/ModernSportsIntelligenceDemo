
import React, { useState } from 'react';
import { GitCompare, ArrowRightLeft, Target, Zap } from 'lucide-react';
import { MOCK_PLAYERS } from '../constants.tsx';

const Compare: React.FC = () => {
  const [p1] = useState(MOCK_PLAYERS[0]);
  const [p2] = useState(MOCK_PLAYERS[1]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black tracking-tight text-white">Intelligence Comparison</h1>
        <p className="text-brand-muted max-w-xl mx-auto">Analyze contextual differences between players beyond simple stat sheets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 items-start">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-center">
            <img src={p1.image} alt="" className="w-24 h-24 rounded-3xl object-cover border-2 border-slate-800 mx-auto mb-4" />
            <h3 className="text-xl font-bold">{p1.name}</h3>
            <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">{p1.team}</p>
          </div>
          <div className="space-y-3">
             {p1.stats.map((s, i) => (
               <div key={i} className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                 <span className="text-xs font-bold text-slate-500 uppercase">{s.label}</span>
                 <span className="font-bold">{s.value}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="lg:col-span-1 h-full flex items-center justify-center">
          <div className="p-4 bg-brand-lime rounded-full shadow-2xl shadow-brand-lime/30 rotate-90 lg:rotate-0">
            <ArrowRightLeft className="text-brand-charcoal" size={24} />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-center">
            <img src={p2.image} alt="" className="w-24 h-24 rounded-3xl object-cover border-2 border-slate-800 mx-auto mb-4" />
            <h3 className="text-xl font-bold">{p2.name}</h3>
            <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">{p2.team}</p>
          </div>
          <div className="space-y-3">
             {p2.stats.map((s, i) => (
               <div key={i} className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                 <span className="font-bold">{s.value}</span>
                 <span className="text-xs font-bold text-slate-500 uppercase">{s.label}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <section className="bg-brand-lime/5 border border-brand-lime/10 rounded-[2.5rem] p-8 mt-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <GitCompare className="text-brand-lime" size={24} />
          Intelligence Synthesis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start gap-4 p-5 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="p-2 bg-brand-lime/10 rounded-lg text-brand-lime"><Target size={18} /></div>
            <div>
              <h4 className="font-bold mb-1">Consistency Delta</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Higher performance stability detected in system-aligned rotations.</p>
            </div>
          </div>
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl">
            <p className="text-slate-200 leading-relaxed font-medium italic">"Analysis suggests high ceiling potential for isolated performance peaks."</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Compare;
