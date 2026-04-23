// @ts-nocheck
import React, { useState } from 'react';
import { Bot, Sliders, Target, Zap } from 'lucide-react';

const AgentPersonality: React.FC = () => {
  const [riskTolerance] = useState('moderate');
  const [leaguePref] = useState('NFL, NBA');
  const [maxPositionPct] = useState(15);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Bot size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Agent Personality Cloning</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          User trains a “mini-me” agent (risk tolerance, league preference, max position) that screens and ranks opportunities; human still approves. Personalization at scale.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Sliders size={12} className="text-sky-400" /> Risk tolerance</div>
          <div className="text-2xl font-bold text-sky-400 capitalize">{riskTolerance}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Target size={12} className="text-emerald-400" /> League focus</div>
          <div className="text-2xl font-bold text-emerald-400 text-sm">{leaguePref}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Zap size={12} className="text-amber-400" /> Max single position</div>
          <div className="text-2xl font-bold text-amber-400">{maxPositionPct}%</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Your clone config</h3>
        <p className="text-slate-400 text-sm">Configure risk (conservative / moderate / aggressive), league preference, max % of portfolio per card, and holding horizon. The agent will surface only opportunities that match your profile; you still approve every trade.</p>
      </div>
    </div>
  );
};

export default AgentPersonality;
