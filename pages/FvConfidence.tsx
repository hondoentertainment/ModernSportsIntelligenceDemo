// @ts-nocheck
import React, { useState } from 'react';
import { BarChart3, DollarSign, Percent, Info } from 'lucide-react';

const MOCK_INTERVALS = [
  { card: '2020 Prizm Justin Herbert RC PSA 10', point: 1250, low: 980, high: 1580, confidence: 70 },
  { card: '2018 Prizm Luka Doncic RC BGS 9.5', point: 4200, low: 3500, high: 5100, confidence: 70 },
];

const FvConfidence: React.FC = () => {
  const [intervals] = useState(MOCK_INTERVALS);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <BarChart3 size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Fair Value Confidence Interval</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          FMV as an interval, not a point — e.g. $500 (70% confidence: $380–$620) from model and market truth. Transparent uncertainty on every valuation.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><DollarSign size={12} className="text-sky-400" /> Default confidence</div>
          <div className="text-2xl font-bold text-sky-400">70%</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Percent size={12} className="text-emerald-400" /> Cards with intervals</div>
          <div className="text-2xl font-bold text-emerald-400">—</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Info size={12} className="text-amber-400" /> Source</div>
          <div className="text-2xl font-bold text-amber-400">Model + truth</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Sample intervals (mock)</h3>
        <ul className="space-y-3">
          {intervals.map((i, idx) => (
            <li key={idx} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
              <span className="text-slate-300 truncate max-w-md">{i.card}</span>
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">${i.point.toLocaleString()}</span>
                <span className="text-slate-500">({i.confidence}%: ${i.low.toLocaleString()}–${i.high.toLocaleString()})</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FvConfidence;
