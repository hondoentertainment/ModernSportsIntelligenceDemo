import React, { useMemo } from 'react';
import type { CardInventory } from '../types';
import { GRADING_SUBMIT_DISCLOSURE, listGradeSubmits } from '../lib/analytics/gradingSubmit';

interface Props {
  inventory: CardInventory[];
}

const GradingSubmitPanel: React.FC<Props> = ({ inventory }) => {
  const rows = useMemo(() => listGradeSubmits(inventory), [inventory]);
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4" aria-label="Grading submit decision">
      <h2 className="text-sm font-black uppercase tracking-widest text-white">Grading submit decision</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{GRADING_SUBMIT_DISCLOSURE}</p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No raw cards with a local mark.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((row) => (
            <li key={row.cardId} className="rounded-lg border border-slate-800 px-3 py-3" aria-label={row.player}>
              <h3 className="text-sm text-white">{row.player}</h3>
              <p className="mt-1 text-xs text-slate-200">{row.summary}</p>
              <p className="mt-1 font-mono text-[11px] text-slate-400">
                {row.quotes.map((quote) => `${quote.label} net $${quote.netUsd} · ${quote.roiPct}% · ${quote.days}d · pop ${quote.pop}`).join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default GradingSubmitPanel;
