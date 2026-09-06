import React from 'react';
import { Bot } from 'lucide-react';
import AgentPrioritiesPanel from '../components/AgentPrioritiesPanel';

const AgentPersonality: React.FC = () => {
  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Bot size={12} />
          v5.1 Frontier · persisted locally
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Agent Personality Cloning</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Configure risk, time horizon, league tilt, and max position. War Room committee prompts and Auto-Pilot
          candidate ranking read these values from the MSI store. This is a preference profile — not a live cloned
          trader and not a live marketplace agent.
        </p>
      </div>
      <AgentPrioritiesPanel />
    </div>
  );
};

export default AgentPersonality;
