import React, { useEffect, useMemo, useState } from 'react';
import { Flame, Radar, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseInventory } from '../lib/useSupabaseInventory';
import { ensureCatalystMarket } from '../lib/fiveDifferentiatorService';
import { CatalystMarketEvent } from '../types';

const severityTone: Record<string, string> = {
  watch: 'text-slate-300 border-slate-600',
  actionable: 'text-amber-300 border-amber-500/30',
  urgent: 'text-red-300 border-red-500/30',
};

const CatalystMarket: React.FC = () => {
  const { user } = useAuth();
  const { inventory } = useSupabaseInventory();
  const [events, setEvents] = useState<CatalystMarketEvent[]>([]);

  useEffect(() => {
    const load = async () => {
      setEvents(await ensureCatalystMarket(user?.id, inventory.filter(card => card.status !== 'sold')));
    };
    void load();
  }, [inventory, user?.id]);

  const summary = useMemo(() => ({
    urgent: events.filter(event => event.severity === 'urgent').length,
    actionable: events.filter(event => event.severity === 'actionable').length,
    avgConfidence: events.length > 0 ? Math.round((events.reduce((sum, event) => sum + event.confidence, 0) / events.length) * 100) : 0,
  }), [events]);

  return (
    <div className="space-y-8 pb-16">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {events.map(event => (
          <div key={event.id} className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${severityTone[event.severity] || severityTone.watch}`}>
                  {event.severity}
                </div>
                <h2 className="mt-3 text-xl font-semibold text-white">{event.headline}</h2>
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
    </div>
  );
};

export default CatalystMarket;
