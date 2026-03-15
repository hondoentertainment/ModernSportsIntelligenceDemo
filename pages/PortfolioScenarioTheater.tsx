import React, { useEffect, useMemo, useState } from 'react';
import { Activity, FlaskConical, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseInventory } from '../lib/useSupabaseInventory';
import { runScenarioTheater, ScenarioTheaterView } from '../lib/fiveDifferentiatorService';
import { getAllScenarios } from '../lib/stressTestService';

const fmt = (value: number) => `$${Math.round(value).toLocaleString()}`;

const PortfolioScenarioTheater: React.FC = () => {
  const { user } = useAuth();
  const { inventory } = useSupabaseInventory();
  const [scenarioId, setScenarioId] = useState<string>(getAllScenarios()[0]?.id || '');
  const [view, setView] = useState<ScenarioTheaterView | null>(null);
  const scenarios = useMemo(() => getAllScenarios(), []);

  useEffect(() => {
    const load = async () => {
      setView(await runScenarioTheater(inventory.filter(card => card.status !== 'sold'), user?.id, scenarioId));
    };
    void load();
  }, [inventory, scenarioId, user?.id]);

  const latestRun = view?.runs[0];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-300">
          <FlaskConical size={12} />
          Portfolio Scenario Theater
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Forward Simulation & Decision Rehearsal</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Run portfolio stress paths, persist scenario snapshots, and compare projected NAV, drawdown, and hedging guidance before taking action.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Scenario Template</div>
            <select
              value={scenarioId}
              onChange={e => setScenarioId(e.target.value)}
              className="mt-2 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
            >
              {scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>{scenario.name}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-500">
            {scenarios.find(scenario => scenario.id === scenarioId)?.description}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Activity size={12} className="text-sky-300" /> Portfolio Value</div>
          <div className="text-2xl font-bold text-white">{fmt(latestRun?.portfolioValue || 0)}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><FlaskConical size={12} className="text-cyan-300" /> Projected Value</div>
          <div className="text-2xl font-bold text-cyan-300">{fmt(latestRun?.projectedValue || 0)}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Shield size={12} className="text-amber-300" /> NAV Delta</div>
          <div className={`text-2xl font-bold ${(latestRun?.navDelta || 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{fmt(latestRun?.navDelta || 0)}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Shield size={12} className="text-violet-300" /> Risk Score</div>
          <div className="text-2xl font-bold text-violet-300">{Math.round(latestRun?.riskScore || 0)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6">
          <h2 className="mb-4 text-lg font-bold text-white">Run History</h2>
          <div className="space-y-3">
            {view?.runs.map(run => (
              <div key={run.id} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-white">{run.scenarioName}</div>
                    <div className="text-xs text-slate-500">{new Date(run.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Start</div>
                      <div className="font-bold text-white">{fmt(run.portfolioValue)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Projected</div>
                      <div className="font-bold text-cyan-300">{fmt(run.projectedValue)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Risk</div>
                      <div className="font-bold text-violet-300">{Math.round(run.riskScore || 0)}</div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-300">{run.summary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6">
          <h2 className="mb-4 text-lg font-bold text-white">Saved Snapshots</h2>
          <div className="space-y-3">
            {view?.snapshots.map(snapshot => (
              <div key={snapshot.id} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                <div className="font-semibold text-white">{snapshot.name}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">{snapshot.templateKind}</div>
                <div className="mt-2 text-sm text-slate-300">{snapshot.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioScenarioTheater;
