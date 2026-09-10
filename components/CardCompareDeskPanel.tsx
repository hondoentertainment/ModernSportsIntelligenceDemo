import React, { useMemo } from 'react';
import { GitCompare } from 'lucide-react';
import type { CardInventory } from '../types';
import { buildCardCompareDesk, CARD_COMPARE_DESK_DISCLOSURE } from '../lib/analytics/cardCompareDesk';

interface Props {
  cards: CardInventory[];
  universe?: CardInventory[];
}

const CardCompareDeskPanel: React.FC<Props> = ({ cards, universe }) => {
  const desk = useMemo(() => buildCardCompareDesk(cards, universe ?? cards), [cards, universe]);
  if (desk.incomplete) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-800 bg-brand-slate/30 p-6" aria-label="Card compare desk">
        <p className="text-sm text-slate-400">{desk.emptyReason}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-brand-charcoal/60 p-5 md:p-6" aria-label="Card compare desk">
      <div className="mb-3 flex items-center gap-2">
        <GitCompare size={16} className="text-brand-lime" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-white">Compare desk</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            Marks · comps · ratios · ST/LT · concentration
          </p>
        </div>
      </div>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{CARD_COMPARE_DESK_DISCLOSURE}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left">
          <thead className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            <tr>
              <th className="py-2 pr-3">Metric</th>
              {desk.columns.map((col) => (
                <th key={col.cardId} className="py-2 pr-3">
                  {col.player}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm text-white">
            <tr>
              <td className="py-2 pr-3 text-slate-400">Preferred mark</td>
              {desk.columns.map((col) => (
                <td key={`${col.cardId}-mark`} className="py-2 pr-3 font-mono">
                  ${Math.round(col.mark).toLocaleString()}
                  <span className="ml-2 text-[10px] uppercase text-slate-500">{col.markLabel}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 pr-3 text-slate-400">Comps used</td>
              {desk.columns.map((col) => (
                <td key={`${col.cardId}-comps`} className="py-2 pr-3">
                  {col.compsUsed}
                  {col.thinTape ? ' · thin' : ''}
                  {col.stale ? ' · stale' : ''}
                  {col.lowLiquidity && !col.thinTape ? ' · low liq' : ''}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 pr-3 text-slate-400">Grade 10/9</td>
              {desk.columns.map((col) => (
                <td key={`${col.cardId}-ratio`} className="py-2 pr-3 font-mono">
                  {col.gradeRatio?.psa10Over9?.toFixed(2) ?? '—'}
                  {col.gradeRatio?.thinTape ? ' · heuristic' : ''}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 pr-3 text-slate-400">Horizon</td>
              {desk.columns.map((col) => (
                <td key={`${col.cardId}-hz`} className="py-2 pr-3">
                  {col.treatment} · {col.daysHeld}d
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 pr-3 text-slate-400">Player NAV share</td>
              {desk.columns.map((col) => (
                <td key={`${col.cardId}-nav`} className="py-2 pr-3 font-mono">
                  {col.concentrationSharePct.toFixed(0)}%
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 pr-3 text-slate-400">ROI</td>
              {desk.columns.map((col) => (
                <td key={`${col.cardId}-roi`} className="py-2 pr-3 font-mono">
                  {col.roiPct == null ? '—' : `${col.roiPct.toFixed(1)}%`}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CardCompareDeskPanel;
