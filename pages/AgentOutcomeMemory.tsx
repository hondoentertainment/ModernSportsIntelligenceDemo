import React, { useEffect, useState } from 'react';
import { Brain, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAgentRecommendations } from '../lib/differentiatorData';
import type { AgentRecommendationRecord } from '../types';

const AgentOutcomeMemory: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AgentRecommendationRecord[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    fetchAgentRecommendations(user.id).then(setRecommendations).catch(() => setRecommendations([]));
  }, [user?.id]);

  const approved = recommendations.filter(r => r.status === 'approved').length;
  const rejected = recommendations.filter(r => r.status === 'rejected').length;
  const pending = recommendations.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Brain size={12} />
          v5.1 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Agent Outcome Memory Dashboard</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Closed-loop view: what the AI recommended vs what you did vs what actually happened (fill price, hold return). Recommendation → intent → outcome linkage.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><CheckCircle size={12} className="text-emerald-400" /> Approved</div>
          <div className="text-2xl font-bold text-emerald-400">{approved}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><XCircle size={12} className="text-red-400" /> Rejected</div>
          <div className="text-2xl font-bold text-red-400">{rejected}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Clock size={12} className="text-amber-400" /> Pending</div>
          <div className="text-2xl font-bold text-amber-400">{pending}</div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} /> Recommendation history</h3>
        {recommendations.length === 0 ? (
          <p className="text-slate-500 text-sm">No agent recommendations yet. Use the War Room or Auto-Pilot to generate recommendations; outcomes will appear here.</p>
        ) : (
          <ul className="space-y-3">
            {recommendations.slice(0, 20).map(rec => (
              <li key={rec.id} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
                <span className="text-slate-300 truncate max-w-md">{rec.summary || rec.recommendedAction}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${rec.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : rec.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{rec.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AgentOutcomeMemory;
