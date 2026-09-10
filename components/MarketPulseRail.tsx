import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';
import type { CardInventory } from '../types';
import { computeMarketPulse, MARKET_PULSE_DISCLOSURE } from '../lib/analytics/marketPulse';

interface Props {
  inventory: CardInventory[];
  compact?: boolean;
}

const MarketPulseRail: React.FC<Props> = ({ inventory, compact }) => {
  const report = useMemo(() => computeMarketPulse({ inventory }), [inventory]);
  const sports = report.segments.filter((row) => row.kind === 'sport' && row.cardCount > 0);
  const eras = report.segments.filter((row) => row.kind === 'era');
  const formats = report.segments.filter((row) => row.kind === 'format');

  return (
    <section
      className={
        compact
          ? 'rounded-xl border border-slate-800/60 bg-brand-charcoal/40 p-3'
          : 'rounded-2xl border border-slate-800 bg-brand-charcoal/60 p-5 md:p-6'
      }
      aria-label="Market Pulse hobby indexes"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-amber-300" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-white">Market Pulse</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
              Headline {report.headline.score} · {report.headline.band} · seeded + local
            </p>
          </div>
        </div>
      </div>
      {!compact && <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{MARKET_PULSE_DISCLOSURE}</p>}
      <div className={`grid grid-cols-1 gap-4 ${compact ? '' : 'md:grid-cols-3'}`}>
        <PulseGroup title="Sport" rows={sports.length ? sports : report.segments.filter((row) => row.kind === 'sport').slice(0, 3)} />
        <PulseGroup title="Era" rows={eras} />
        <PulseGroup title="Sealed vs singles" rows={formats} />
      </div>
    </section>
  );
};

function PulseGroup({
  title,
  rows,
}: {
  title: string;
  rows: { id: string; label: string; score: number; band: string; navSharePct: number; thin: boolean }[];
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-muted">{title}</p>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3 text-sm">
            <span className={row.thin ? 'text-slate-400' : 'text-white'}>
              {row.label}
              {row.thin ? ' · thin' : ''}
            </span>
            <span className="font-mono text-xs text-slate-300">
              {row.score} · {row.navSharePct.toFixed(0)}% NAV
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MarketPulseRail;
