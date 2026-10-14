import React, { useMemo } from 'react';
import type { CardInventory } from '../types';
import { PORTFOLIO_SERIES_DISCLOSURE, buildPortfolioSeries } from '../lib/analytics/portfolioSeries';

interface Props {
  inventory: CardInventory[];
}

function money(value: number): string {
  return `$${value.toLocaleString()}`;
}

const PortfolioSeriesChart: React.FC<Props> = ({ inventory }) => {
  const points = useMemo(() => buildPortfolioSeries(inventory), [inventory]);
  const max = Math.max(...points.map((point) => point.valueUsd), 1);
  const coords = points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * 100;
    const y = 36 - (point.valueUsd / max) * 32;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const first = points[0];
  const last = points[points.length - 1];
  const flat = points.every((point) => point.valueUsd === 0);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4" aria-label="Portfolio performance">
      <h2 className="text-sm font-black uppercase tracking-widest text-white">Portfolio performance</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{PORTFOLIO_SERIES_DISCLOSURE}</p>
      {flat ? (
        <p className="mt-3 text-sm text-slate-400">No held cards to chart.</p>
      ) : (
        <>
          <svg viewBox="0 0 100 40" className="mt-3 h-16 w-full text-emerald-300" role="img" aria-label="Demo portfolio value over six months">
            <polyline fill="none" stroke="currentColor" strokeWidth="1.2" points={coords} />
          </svg>
          <p className="mt-2 font-mono text-xs text-slate-200">
            {first.label} {money(first.valueUsd)} → {last.label} {money(last.valueUsd)}
          </p>
        </>
      )}
    </section>
  );
};

export default PortfolioSeriesChart;
