import React from 'react';
import { Scale, AlertTriangle } from 'lucide-react';
import type { AgentStance, ConsensusView } from '../lib/utils/agentReasoning';

interface AgentConsensusViewProps {
  view: ConsensusView;
  compact?: boolean;
}

const STANCE_STYLES: Record<AgentStance, string> = {
  buy: 'bg-brand-lime/15 text-brand-lime border-brand-lime/30',
  wait: 'bg-brand-orange/15 text-brand-orange border-brand-orange/30',
  hold: 'bg-slate-700/40 text-slate-200 border-slate-600/50',
  sell: 'bg-brand-red/15 text-brand-red border-brand-red/30',
  neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  unknown: 'bg-slate-900 text-slate-500 border-slate-800',
};

function stanceLabel(stance: AgentStance): string {
  switch (stance) {
    case 'buy':
      return 'Buy';
    case 'wait':
      return 'Wait';
    case 'hold':
      return 'Hold';
    case 'sell':
      return 'Sell';
    case 'neutral':
      return 'Neutral';
    default:
      return 'Unstated';
  }
}

function formatConfidence(confidence?: number): string | null {
  if (typeof confidence !== 'number' || Number.isNaN(confidence)) return null;
  const pct = confidence <= 1 ? confidence * 100 : confidence;
  return `${Math.round(pct)}%`;
}

const AgentConsensusView: React.FC<AgentConsensusViewProps> = ({ view, compact = false }) => {
  return (
    <section
      aria-label="Consensus View"
      className={`rounded-2xl border ${
        view.hasConflict ? 'border-brand-orange/30 bg-brand-orange/5' : 'border-slate-800 bg-brand-charcoal/50'
      } ${compact ? 'p-3 space-y-3' : 'p-5 space-y-4'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scale size={16} className={view.hasConflict ? 'text-brand-orange' : 'text-brand-lime'} aria-hidden />
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Consensus View</h3>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              {view.consensusLabel === 'split'
                ? 'Committee split'
                : view.consensusLabel === 'insufficient'
                  ? 'Insufficient stances'
                  : 'Committee aligned'}
            </p>
          </div>
        </div>
        {view.hasConflict ? (
          <span className="inline-flex items-center gap-1 rounded-lg border border-brand-orange/30 bg-brand-orange/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-brand-orange">
            <AlertTriangle size={10} aria-hidden />
            Disagreement
          </span>
        ) : null}
      </div>

      <p className="text-sm leading-relaxed text-slate-200">{view.summary}</p>

      {view.recommendedAction ? (
        <p className="text-[11px] text-slate-400">
          Thesis action: <span className="text-white">{view.recommendedAction}</span>
        </p>
      ) : null}

      {view.stances.length > 0 ? (
        <ul className="space-y-2" aria-label="Per-agent stances">
          {view.stances.map((row) => (
            <li
              key={row.agentId}
              className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-black/20 px-3 py-2 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">{row.agentName}</p>
                {row.persona ? (
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">{row.persona}</p>
                ) : null}
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  {row.conclusion || 'No insight stored for this agent.'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`inline-flex min-w-[4.5rem] justify-center rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-widest ${STANCE_STYLES[row.stance]}`}
                >
                  {stanceLabel(row.stance)}
                </span>
                {formatConfidence(row.confidence) ? (
                  <span className="text-[10px] text-slate-500">{formatConfidence(row.confidence)}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {view.conflictNotes.length > 0 ? (
        <ul className="space-y-1">
          {view.conflictNotes.map((note) => (
            <li key={note} className="text-[11px] leading-relaxed text-brand-orange/90">
              {note}
            </li>
          ))}
        </ul>
      ) : null}

      {view.missingData ? (
        <p role="status" className="text-[11px] italic leading-relaxed text-slate-500">
          {view.missingData}
        </p>
      ) : null}
    </section>
  );
};

export default AgentConsensusView;
