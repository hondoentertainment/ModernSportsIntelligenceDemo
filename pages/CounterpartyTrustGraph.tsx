import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GitBranch, Shield, ShieldAlert, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { buildCounterpartyTrustGraph, CounterpartyTrustGraphView } from '../lib/fiveDifferentiatorService';
import { logger } from '../lib/logger';

const riskTone: Record<string, string> = {
  low: 'text-emerald-300',
  medium: 'text-amber-300',
  high: 'text-red-300',
};

const CounterpartyTrustGraph: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [graph, setGraph] = useState<CounterpartyTrustGraphView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setGraph(await buildCounterpartyTrustGraph(user?.id));
    } catch (loadError) {
      logger.error('Failed to load counterparty trust graph:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Unable to load trust graph.');
      addToast('error', 'Could not load trust graph. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const topCounterparties = useMemo(
    () => [...(graph?.counterparties || [])].sort((a, b) => b.trustScore - a.trustScore),
    [graph],
  );

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
          <GitBranch size={12} />
          Counterparty Trust Graph
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Identity, Reputation, and Deal Confidence</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Institutional trust scoring across seller identity, successful settlements, dispute history, and relationship edges built from deals, referrals, and provenance events.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold">Trust graph unavailable</div>
            <p className="mt-2 text-red-200/90">{error}</p>
          </div>
          <button type="button" aria-label="Retry loading trust graph" onClick={() => void load()} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-medium transition-colors">Retry</button>
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 text-sm text-slate-400">
          Building the latest counterparty trust view and settlement history...
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Users size={12} className="text-sky-300" /> Counterparties</div>
          <div className="text-2xl font-bold text-white">{graph?.counterparties.length || 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><GitBranch size={12} className="text-violet-300" /> Relationship Edges</div>
          <div className="text-2xl font-bold text-violet-300">{graph?.edges.length || 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Shield size={12} className="text-emerald-300" /> Trust Events</div>
          <div className="text-2xl font-bold text-emerald-300">{graph?.totalTrustEvents || 0}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><ShieldAlert size={12} className="text-amber-300" /> Execution Logs</div>
          <div className="text-2xl font-bold text-amber-300">{graph?.totalExecutionIntents || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6">
          <h2 className="mb-4 text-lg font-bold text-white">Counterparty Ledger</h2>
          <div className="space-y-3">
            {topCounterparties.map(counterparty => (
              <div key={counterparty.id} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{counterparty.displayName}</h3>
                      <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {counterparty.marketplaceVenue}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Verification: {counterparty.verificationTier} · Successful deals: {counterparty.successfulDeals}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Trust</div>
                      <div className="font-bold text-sky-300">{counterparty.trustScore.toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Reputation</div>
                      <div className="font-bold text-violet-300">{counterparty.reputationScore.toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Risk</div>
                      <div className={`font-bold capitalize ${riskTone[counterparty.riskLevel] || 'text-slate-300'}`}>{counterparty.riskLevel}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6">
          <h2 className="mb-4 text-lg font-bold text-white">Relationship Map</h2>
          <div className="space-y-3">
            {graph?.edges.map(edge => {
              const source = graph.counterparties.find(counterparty => counterparty.id === edge.sourceCounterpartyId);
              const target = graph.counterparties.find(counterparty => counterparty.id === edge.targetCounterpartyId);
              return (
                <div key={edge.id} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4 text-sm">
                  <div className="font-medium text-white">{source?.displayName || 'Unknown'} → {target?.displayName || 'Unknown'}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">{edge.edgeType}</div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Weight {edge.weight.toFixed(2)}</span>
                    <span className="text-emerald-300">Trust Δ {edge.trustDelta.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounterpartyTrustGraph;
