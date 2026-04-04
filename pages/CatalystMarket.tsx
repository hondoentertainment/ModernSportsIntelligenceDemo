import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Flame, NotebookPen, Radar, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useSupabaseInventory } from '../lib/utils/useSupabaseInventory';
import { ensureCatalystMarket } from '../lib/utils/fiveDifferentiatorService';
import { withRetry } from '../lib/retry';
import { CatalystMarketEvent } from '../types';
import { ChartSkeleton } from '../components/SkeletonLoader';
import {
  appendMarketEvent,
  listMarketEvents,
  type MarketEvent,
} from '../lib/analytics/marketEventsService';

const severityTone: Record<string, string> = {
  watch: 'text-slate-300 border-slate-600',
  actionable: 'text-amber-300 border-amber-500/30',
  urgent: 'text-red-300 border-red-500/30',
};

const CatalystMarket: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { inventory } = useSupabaseInventory();
  const [events, setEvents] = useState<CatalystMarketEvent[]>([]);
  const [personalLog, setPersonalLog] = useState<MarketEvent[]>([]);
  const [logTitle, setLogTitle] = useState('');
  const [logBody, setLogBody] = useState('');
  const [logSaving, setLogSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPersonalLog = useCallback(() => {
    setPersonalLog(listMarketEvents());
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setPersonalLog([]);
      return;
    }
    refreshPersonalLog();
  }, [user?.id, refreshPersonalLog, events]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setEvents([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await withRetry(
          () => ensureCatalystMarket(user.id, inventory.filter(card => card.status !== 'sold')),
          { maxAttempts: 3, initialDelayMs: 400, timeoutMs: 15_000 }
        );
        setEvents(data ?? []);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load catalyst events';
        setError(message);
        setEvents([]);
        addToast('error', 'Could not load catalyst market. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [inventory, user?.id, addToast]);

  const summary = useMemo(() => ({
    urgent: events.filter(event => event.severity === 'urgent').length,
    actionable: events.filter(event => event.severity === 'actionable').length,
    avgConfidence: events.length > 0 ? Math.round((events.reduce((sum, event) => sum + event.confidence, 0) / events.length) * 100) : 0,
  }), [events]);

  const refetch = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await withRetry(
        () => ensureCatalystMarket(user.id, inventory.filter(card => card.status !== 'sold')),
        { maxAttempts: 3, initialDelayMs: 400, timeoutMs: 15_000 }
      );
      setEvents(data ?? []);
      refreshPersonalLog();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      addToast('error', 'Could not load catalyst market. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, inventory, addToast, refreshPersonalLog]);

  const handleAddPersonalCatalyst = useCallback(async () => {
    const title = logTitle.trim();
    if (!user?.id || !title) return;
    setLogSaving(true);
    try {
      await appendMarketEvent({
        kind: 'catalyst_note',
        title,
        body: logBody.trim() || undefined,
        payload: { source: 'catalyst_market_ui' },
      });
      setLogTitle('');
      setLogBody('');
      refreshPersonalLog();
      addToast('success', 'Saved to your catalyst log (syncs when signed in).');
    } catch {
      addToast('error', 'Could not save catalyst note.');
    } finally {
      setLogSaving(false);
    }
  }, [user?.id, logTitle, logBody, addToast, refreshPersonalLog]);

  if (loading && events.length === 0) {
    return (
      <div className="space-y-8 pb-16" role="region" aria-label="Catalyst Market">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-300">
            <Flame size={12} />
            Catalyst Market
          </div>
          <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Event-Driven Demand & Opportunity Layer</h1>
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16" role="region" aria-label="Catalyst Market">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-300">
          <Flame size={12} />
          Catalyst Market
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Event-Driven Demand & Opportunity Layer</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Monitor promotion cycles, scarcity squeezes, award-race sentiment, and event windows that can reprice a card faster than standard comp tracking.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between">
          <span>Unable to load catalyst events.</span>
          <button
            type="button"
            aria-label="Retry loading catalyst market"
            onClick={() => void refetch()}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Radar size={12} className="text-red-300" /> Urgent Windows</div>
          <div className="text-2xl font-bold text-red-300">{summary.urgent}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><TrendingUp size={12} className="text-amber-300" /> Actionable Events</div>
          <div className="text-2xl font-bold text-amber-300">{summary.actionable}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Flame size={12} className="text-sky-300" /> Avg Confidence</div>
          <div className="text-2xl font-bold text-sky-300">{summary.avgConfidence}%</div>
        </div>
      </div>

      {user?.id && (
        <section
          aria-labelledby="personal-catalyst-log-heading"
          className="rounded-3xl border border-slate-700/50 bg-slate-900/40 p-6"
        >
          <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <NotebookPen size={14} className="text-orange-300" />
            <h2 id="personal-catalyst-log-heading" className="text-sm font-semibold text-white normal-case tracking-normal">
              Personal catalyst log
            </h2>
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Notes you add here are stored in your account (Supabase when configured) for show prep, trade rumors, or custom catalysts alongside generated signals.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="catalyst-log-title" className="sr-only">
                Catalyst title
              </label>
              <input
                id="catalyst-log-title"
                type="text"
                value={logTitle}
                onChange={(e) => setLogTitle(e.target.value)}
                placeholder="Short headline (e.g. Playoff roster spot)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-orange-500/50 focus:outline-none"
              />
              <label htmlFor="catalyst-log-body" className="sr-only">
                Optional details
              </label>
              <textarea
                id="catalyst-log-body"
                value={logBody}
                onChange={(e) => setLogBody(e.target.value)}
                placeholder="Optional context…"
                rows={2}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-orange-500/50 focus:outline-none resize-y min-h-[64px]"
              />
            </div>
            <button
              type="button"
              disabled={!logTitle.trim() || logSaving}
              onClick={() => void handleAddPersonalCatalyst()}
              className="rounded-xl bg-orange-500/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-orange-400 disabled:opacity-40 disabled:pointer-events-none"
            >
              {logSaving ? 'Saving…' : 'Add note'}
            </button>
          </div>
          {personalLog.length > 0 && (
            <ul className="mt-5 space-y-2 border-t border-slate-800 pt-4" aria-label="Your saved catalyst notes">
              {personalLog.slice(0, 12).map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2 text-sm"
                >
                  <div className="font-medium text-slate-200">{ev.title}</div>
                  {ev.body ? <p className="mt-1 text-xs text-slate-500">{ev.body}</p> : null}
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                    {new Date(ev.occurredAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section aria-labelledby="catalyst-events-heading">
        <h2 id="catalyst-events-heading" className="sr-only">Catalyst events</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {events.map(event => (
            <div key={event.id} className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${severityTone[event.severity] || severityTone.watch}`}>
                    {event.severity}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-white">{event.headline}</h3>
                  <p className="mt-1 text-xs text-slate-500">{event.assetName} · {event.triggerWindow}</p>
                </div>
                <div className="text-right text-xs">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">Expected Move</div>
                  <div className="text-xl font-bold text-emerald-300">+{event.expectedMovePct.toFixed(1)}%</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">{event.narrative}</p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-2xl bg-slate-950/50 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">Confidence</div>
                  <div className="font-bold text-white">{Math.round(event.confidence * 100)}%</div>
                </div>
                <div className="rounded-2xl bg-slate-950/50 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">Downside</div>
                  <div className="font-bold text-red-300">-{event.downsidePct.toFixed(1)}%</div>
                </div>
                <div className="rounded-2xl bg-slate-950/50 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">Source</div>
                  <div className="font-bold capitalize text-sky-300">{event.source}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CatalystMarket;
