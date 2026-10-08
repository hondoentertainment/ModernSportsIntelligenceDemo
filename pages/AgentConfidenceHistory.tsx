import React, { useEffect } from 'react';
import { Brain, TrendingUp, Calendar, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { confidenceHistory } from '../lib/analytics/nextFeatureDesk';
import { useAgentRecommendations } from '../lib/utils/useAgentRecommendations';
import { ChartSkeleton } from '../components/SkeletonLoader';

const AgentConfidenceHistory: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { recommendations, loading, error, refetch } = useAgentRecommendations(user?.id);

  useEffect(() => {
    if (error) {
      addToast('error', 'Could not load agent confidence data. Please try again.');
    }
  }, [error, addToast]);

  const history = confidenceHistory(recommendations);
  const accuracy = history.approvalPct ?? 0;
  const rolling30 = history.rolling30 ?? 0;
  const total = history.total;

  if (loading) {
    return (
      <div className="space-y-8 pb-16" role="region" aria-label="Agent Confidence History">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
            <Brain size={12} />
            v5.2 Frontier
          </div>
          <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Agent Confidence History</h1>
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16" role="region" aria-label="Agent Confidence History">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
          <Brain size={12} />
          v5.2 Frontier
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Agent Confidence History</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Share of recommendations marked approved, submitted, or filled, by month. This is follow-through, not a verified price-forecast hit rate.
        </p>
      </div>
      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between">
          <span>Unable to load confidence data.</span>
          <button
            type="button"
            aria-label="Retry loading confidence data"
            onClick={() => void refetch()}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Target size={12} className="text-sky-400" /> Acted-on rate</div>
          <div className="text-2xl font-bold text-sky-400">{accuracy}%</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><TrendingUp size={12} className="text-emerald-400" /> Rolling 30d</div>
          <div className="text-2xl font-bold text-emerald-400">{rolling30}%</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Calendar size={12} className="text-amber-400" /> Recommendations</div>
          <div className="text-2xl font-bold text-amber-400">{total}</div>
        </div>
      </div>
      <section className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6" aria-labelledby="confidence-history-heading">
        <h2 id="confidence-history-heading" className="text-sm font-semibold text-white mb-4">Accuracy over time</h2>
        {total === 0 ? (
          <p className="text-slate-500 text-sm">No agent recommendations yet. Use War Room or Auto-Pilot to generate recommendations; this history counts how many you acted on.</p>
        ) : (
          <ul className="space-y-2">
            {history.buckets.map(bucket => (
              <li key={bucket.label} className="flex items-center justify-between rounded-xl bg-slate-800/50 px-3 py-2 text-sm">
                <span className="text-slate-300">{bucket.label}</span>
                <span className="text-slate-400">{bucket.count === 0 ? 'No rows' : `${bucket.approvalPct}% of ${bucket.count}`}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AgentConfidenceHistory;
