import React, { useMemo } from 'react';
import { History } from 'lucide-react';
import {
  AUTOPILOT_REPLAY_DISCLOSURE,
  listAutopilotReplay,
  replayDayKey,
  type AutopilotReplayEntry,
} from '../lib/trading/autoPilotReplay';

interface Props {
  entries?: AutopilotReplayEntry[];
}

const AutoPilotReplayLog: React.FC<Props> = ({ entries }) => {
  const rows = useMemo(() => entries ?? listAutopilotReplay(), [entries]);
  const today = replayDayKey();
  const todayRows = rows.filter((row) => row.dayKey === today);
  const shown = (todayRows.length > 0 ? todayRows : rows).slice(0, 6);

  return (
    <section
      className="rounded-2xl border border-white/10 bg-black/20 p-4"
      aria-label="Auto-Pilot decision replay"
    >
      <div className="mb-3 flex items-center gap-2 text-cyan-300">
        <History size={16} aria-hidden />
        <h3 className="text-xs font-bold uppercase tracking-wider">Decision replay</h3>
      </div>
      <p className="mb-3 text-[10px] leading-relaxed text-slate-500">{AUTOPILOT_REPLAY_DISCLOSURE}</p>
      {shown.length === 0 ? (
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          No advisory cycles recorded yet. Run a policy-gated preview to start the day bucket.
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((row) => (
            <li key={row.id} className="rounded-xl border border-white/5 bg-white/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white">
                  {row.source} · {row.dayKey}
                </p>
                <span className="text-[9px] text-slate-500">
                  {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Considered {row.considered.length} · approved {row.approvals.approved} · pending {row.approvals.pending} · blocked {row.approvals.blocked}
              </p>
              <p className="mt-1 font-mono text-[10px] text-slate-300">
                NAV {Math.round(row.navPreview.startingValue).toLocaleString()} → {Math.round(row.navPreview.projectedPostCycleValue).toLocaleString()}
                {' '}· tax ${Math.round(row.navPreview.estimatedTotalTax).toLocaleString()}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-widest text-slate-500">
                Collar ${row.collar.maxBudget} / day ${row.collar.maxDailyBudget} / asset ${row.collar.maxSpendPerAsset} / DD {row.collar.maxDrawdownPct}%
              </p>
              {row.gated.slice(0, 3).map((action) => (
                <p key={`${row.id}-${action.type}-${action.assetName}`} className="mt-1 text-[10px] text-slate-400">
                  {action.type} {action.assetName} · {action.policyDecision || 'ungated'}
                </p>
              ))}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AutoPilotReplayLog;
