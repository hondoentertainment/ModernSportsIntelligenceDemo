import React, { useCallback, useState } from 'react';
import { Sliders } from 'lucide-react';
import {
  formatAgentPreferencesSummary,
  getAgentPreferences,
  setAgentPreferences,
  type AgentLeagueStyle,
  type AgentTimeHorizon,
  type AgentUserPreferences,
} from '../lib/utils/agentPreferences';

interface AgentPrioritiesPanelProps {
  compact?: boolean;
}

const HORIZONS: { id: AgentTimeHorizon; label: string }[] = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
];

const LEAGUES: { id: AgentLeagueStyle; label: string }[] = [
  { id: 'balanced', label: 'Balanced' },
  { id: 'mlb-first', label: 'MLB tilt' },
  { id: 'nba-first', label: 'NBA tilt' },
  { id: 'nfl-first', label: 'NFL tilt' },
];

const AgentPrioritiesPanel: React.FC<AgentPrioritiesPanelProps> = ({ compact = false }) => {
  const [prefs, setPrefs] = useState<AgentUserPreferences>(() => getAgentPreferences());

  const update = useCallback((partial: Partial<AgentUserPreferences>) => {
    setPrefs(setAgentPreferences(partial));
  }, []);

  return (
    <section
      className={compact ? 'rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4' : 'rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6'}
      aria-label="Agent priorities"
    >
      <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
        <Sliders size={12} className="text-sky-400" />
        Agent priorities
      </div>
      <p className="mb-4 text-xs text-slate-400">
        {compact
          ? formatAgentPreferencesSummary(prefs)
          : 'War Room and Auto-Pilot honor these sliders when Gemini is available. Stored on this device via MSI store. Human still approves every trade.'}
      </p>

      <label className="mb-4 block">
        <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <span>Risk tolerance</span>
          <span className="text-sky-300">{prefs.riskTolerance}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={prefs.riskTolerance}
          onChange={(e) => update({ riskTolerance: Number(e.target.value) })}
          aria-label="Risk tolerance"
          className="w-full accent-sky-400"
        />
      </label>

      <div className="mb-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Time horizon</p>
        <div className="flex flex-wrap gap-2">
          {HORIZONS.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => update({ timeHorizon: h.id })}
              className={`min-h-[36px] rounded-xl px-3 text-[10px] font-black uppercase tracking-widest ${
                prefs.timeHorizon === h.id
                  ? 'bg-brand-lime text-brand-charcoal'
                  : 'border border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">League preference</p>
        <div className="flex flex-wrap gap-2">
          {LEAGUES.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => update({ leagueStyle: l.id })}
              className={`min-h-[36px] rounded-xl px-3 text-[10px] font-black uppercase tracking-widest ${
                prefs.leagueStyle === l.id
                  ? 'bg-emerald-400 text-brand-charcoal'
                  : 'border border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <span>Max single position</span>
          <span className="text-amber-300">{prefs.maxPositionPct}%</span>
        </div>
        <input
          type="range"
          min={5}
          max={40}
          value={prefs.maxPositionPct}
          onChange={(e) => update({ maxPositionPct: Number(e.target.value) })}
          aria-label="Max single position percent"
          className="w-full accent-amber-400"
        />
      </label>
    </section>
  );
};

export default AgentPrioritiesPanel;
