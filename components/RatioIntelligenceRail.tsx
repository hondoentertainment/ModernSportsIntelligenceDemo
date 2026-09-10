import React, { useMemo } from 'react';
import { Scale } from 'lucide-react';
import type { CardInventory } from '../types';
import { buildRatioIntelligenceReport, RATIO_INTELLIGENCE_DISCLOSURE } from '../lib/analytics/ratioIntelligence';

interface Props {
  inventory: CardInventory[];
  compact?: boolean;
}

const RatioIntelligenceRail: React.FC<Props> = ({ inventory, compact }) => {
  const report = useMemo(() => buildRatioIntelligenceReport(inventory), [inventory]);
  if (report.grades.length === 0 && report.players.length === 0 && report.variations.length === 0) {
    return null;
  }

  const grades = report.grades.slice(0, compact ? 2 : 4);
  const players = report.players.slice(0, compact ? 1 : 3);
  const variations = report.variations.slice(0, compact ? 1 : 3);

  return (
    <section
      className={
        compact
          ? 'rounded-xl border border-cyan-500/20 bg-brand-charcoal/40 p-3'
          : 'rounded-2xl border border-cyan-500/20 bg-brand-charcoal/60 p-5 md:p-6'
      }
      aria-label="Ratio intelligence reports"
    >
      <div className="mb-3 flex items-center gap-2">
        <Scale size={16} className="text-cyan-300" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-white">Ratio intelligence</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            Grade · player · variation · {report.thinCount} thin
          </p>
        </div>
      </div>
      {!compact && <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{RATIO_INTELLIGENCE_DISCLOSURE}</p>}
      <div className={`grid grid-cols-1 gap-4 ${compact ? '' : 'md:grid-cols-3'}`}>
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-muted">Grade ladder</p>
          <ul className="space-y-2">
            {grades.map((row) => (
              <li key={row.cardId} className="rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-2">
                <p className="text-sm text-white">{row.player}</p>
                <p className="font-mono text-xs text-slate-300">
                  10/9 {row.psa10Over9?.toFixed(2) ?? '—'} · 9/raw {row.psa9OverRaw?.toFixed(2) ?? '—'}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-cyan-300">
                  {row.source}
                  {row.thinTape ? ' · thin' : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
        {!compact && (
          <>
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-muted">Player spread</p>
              <ul className="space-y-2">
                {players.length === 0 ? (
                  <li className="text-[11px] text-slate-500">Need two priced siblings of the same player.</li>
                ) : (
                  players.map((row) => (
                    <li key={row.player} className="rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-2">
                      <p className="text-sm text-white">{row.player}</p>
                      <p className="font-mono text-xs text-slate-300">High/low {row.highOverLow?.toFixed(2) ?? '—'}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-muted">Variation vs base</p>
              <ul className="space-y-2">
                {variations.length === 0 ? (
                  <li className="text-[11px] text-slate-500">No base/parallel pairs in local inventory.</li>
                ) : (
                  variations.map((row) => (
                    <li key={row.variationCardId} className="rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-2">
                      <p className="text-sm text-white">{row.player}</p>
                      <p className="font-mono text-xs text-slate-300">
                        {row.variationKind} {row.ratioVsBase?.toFixed(2) ?? '—'}x
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default RatioIntelligenceRail;
