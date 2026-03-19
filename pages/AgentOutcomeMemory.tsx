import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAgentRecommendations } from '../lib/useAgentRecommendations';
import { ChartSkeleton } from '../components/SkeletonLoader';

const AgentOutcomeMemory: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { recommendations, loading, error, refetch } = useAgentRecommendations(user?.id);

  useEffect(() => {
    if (error) {
      addToast('error', 'Could not load agent recommendations. Please try again.');
    }
  }, [error, addToast]);

  const approved = recommendations.filter(r => r.status === 'approved').length;
  const rejected = recommendations.filter(r => r.status === 'rejected').length;
  const pending = recommendations.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="space-y-8 pb-16" role="region" aria-label="Agent Outcome Memory">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
            <Brain size={12} />
            v5.1 Frontier
          </div>
          <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Agent Outcome Memory Dashboard</h1>
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16" role="region" aria-label="Agent Outcome Memory">
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
      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between">
          <span>Unable to load recommendations.</span>
          <button
            type="button"
            aria-label="Retry loading recommendations"
            onClick={() => void refetch()}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}
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
      <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6" aria-labelledby="outcome-memory-heading">
        <h2 id="outcome-memory-heading" className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} /> Recommendation history</h2>
        {recommendations.length === 0 ? (
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 text-center space-y-4">
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              No recommendations logged yet. When you run the Analyst War Room or Auto-Pilot, approved or rejected actions show up here with outcomes.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/war-room"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-lime text-brand-charcoal text-xs font-black uppercase tracking-wider hover:opacity-90"
              >
                Open War Room
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-800"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-3" role="list">
            {recommendations.slice(0, 20).map(rec => (
              <li key={rec.id} className="flex items-center justify-between rounded-xl bg-slate-800/50 p-3 text-sm">
                <span className="text-slate-300 truncate max-w-md">{rec.summary || rec.recommendedAction}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${rec.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : rec.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{rec.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AgentOutcomeMemory;
