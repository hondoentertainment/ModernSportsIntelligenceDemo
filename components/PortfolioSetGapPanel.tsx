import React, { useState } from 'react';
import type { CardInventory } from '../types';
import {
  SET_GAP_DISCLOSURE,
  buildPortfolioSetGaps,
  clearSetGoal,
  formatGapPercent,
  formatGapUsd,
  goalRemaining,
  readSetGoals,
  saveSetGoal,
  type SetGoal,
} from '../lib/collection/portfolioSetGaps';
import { holeAlreadyWatched, holeTarget, type GapHunt, type HoleTarget } from '../lib/collector/floorPack';

interface Props {
  inventory: CardInventory[];
  targets?: readonly { status?: string; player: string; cardDescription: string }[];
  note?: string;
  onWatch?: (draft: HoleTarget) => void;
}

function huntFor(gap: { id: string; label: string; sport: GapHunt['sport'] }, card: { number: string; player: string; estimateUsd: number }): GapHunt {
  return {
    setId: gap.id,
    setLabel: gap.label,
    sport: gap.sport,
    number: card.number,
    player: card.player,
    estimateUsd: card.estimateUsd,
    focused: false,
  };
}

const PortfolioSetGapPanel: React.FC<Props> = ({ inventory, targets = [], note, onWatch }) => {
  const [goals, setGoals] = useState<SetGoal[]>(() => readSetGoals());
  const gaps = buildPortfolioSetGaps(inventory);
  const goalFor = (setId: string) => goals.find((goal) => goal.setId === setId);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4" aria-label="Set completion from your book">
      <h2 className="text-sm font-black uppercase tracking-widest text-white">Set completion from your book</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{SET_GAP_DISCLOSURE}</p>
      {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
      {gaps.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No started set matches the demo checklist.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {gaps.map((gap) => {
            const goal = goalFor(gap.id);
            const left = goal ? goalRemaining(gap.percent, goal.targetPercent) : 0;
            return (
              <li key={gap.id} className="rounded-lg border border-slate-800 px-3 py-3" aria-label={gap.label}>
                <h3 className="text-sm text-white">{gap.label}</h3>
                <p className="mt-1 font-mono text-xs text-slate-200">
                  {formatGapPercent(gap.percent)} · {gap.owned}/{gap.total}
                </p>
                <p className="text-xs text-slate-400">Cost to complete {formatGapUsd(gap.costToCompleteUsd)}</p>
                <p className="text-xs text-slate-400">
                  {gap.missing.length === 0 ? 'Checklist complete.' : `Missing ${gap.missing.map((card) => card.player).join(', ')}`}
                </p>
                {onWatch && gap.missing.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {gap.missing.map((card) => {
                      const hole = huntFor(gap, card);
                      const watched = holeAlreadyWatched(targets, hole);
                      return (
                        <li key={`${gap.id}-${card.number}`}>
                          <button
                            type="button"
                            disabled={watched}
                            onClick={() => onWatch(holeTarget(hole))}
                            className="min-h-[44px] rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-100 disabled:opacity-60"
                          >
                            {watched ? `${card.player} #${card.number} is on the watchlist` : `Watch ${card.player} #${card.number}`}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                {goal ? (
                  <p className="mt-1 text-[11px] text-emerald-300">{left === 0 ? 'Goal met' : `${formatGapPercent(left)} left to the goal`}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => setGoals(goal ? clearSetGoal(gap.id) : saveSetGoal(gap.id, 100))}
                  className="mt-2 min-h-[44px] rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-100"
                >
                  {goal ? `Stop tracking ${gap.label}` : `Track ${gap.label}`}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default PortfolioSetGapPanel;
