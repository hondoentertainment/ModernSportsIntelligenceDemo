import React, { useMemo } from 'react';
import { Gem } from 'lucide-react';
import type { CardInventory } from '../types';
import { GRADING_ROI_LITE_DISCLOSURE, listGradingRoiLite } from '../lib/analytics/gradingRoiLite';

interface Props {
  inventory: CardInventory[];
}

const GradingRoiLitePanel: React.FC<Props> = ({ inventory }) => {
  const rows = useMemo(() => listGradingRoiLite(inventory, 6), [inventory]);
  if (rows.length === 0) return null;

  return (
    <section className="rounded-2xl border border-amber-500/20 bg-brand-charcoal/60 p-5 md:p-6" aria-label="Grading ROI lite">
      <div className="mb-3 flex items-center gap-2">
        <Gem size={16} className="text-amber-300" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-white">Grading ROI lite</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            Raw vs PSA 9/10 · disclosed estimate
          </p>
        </div>
      </div>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{GRADING_ROI_LITE_DISCLOSURE}</p>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.cardId} className="rounded-xl border border-slate-800/80 bg-brand-slate/30 px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-white">{row.player}</p>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                {row.recommendation} · {row.source}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-slate-300">
              Raw ${Math.round(row.rawValue).toLocaleString()} → PSA 9 ${Math.round(row.psa9Estimate).toLocaleString()} (
              {row.roi9.toFixed(0)}%) · PSA 10 ${Math.round(row.psa10Estimate).toLocaleString()} ({row.roi10.toFixed(0)}%)
            </p>
            <p className="mt-1 text-[11px] text-slate-500">{row.rationale}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default GradingRoiLitePanel;
