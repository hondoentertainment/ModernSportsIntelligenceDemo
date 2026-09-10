import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { CardInventory } from '../types';
import { listPortfolioMovers, PORTFOLIO_MOVERS_DISCLOSURE } from '../lib/analytics/portfolioMovers';

interface Props {
  inventory: CardInventory[];
  favoriteIds?: string[];
  compact?: boolean;
}

const PortfolioMoversRail: React.FC<Props> = ({ inventory, favoriteIds, compact }) => {
  const report = useMemo(
    () => listPortfolioMovers(inventory, { favoriteIds, limit: compact ? 3 : 5 }),
    [inventory, favoriteIds, compact],
  );
  const scoped = Boolean(favoriteIds);
  const title = scoped ? 'Favorites top movers' : 'Collection top movers';

  return (
    <section
      className={
        compact
          ? 'rounded-xl border border-slate-800/60 bg-brand-charcoal/40 p-3'
          : 'rounded-2xl border border-slate-800 bg-brand-charcoal/60 p-5 md:p-6'
      }
      aria-label={title}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-lime" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
              Local snapshots / comps · not a live feed
            </p>
          </div>
        </div>
        {scoped && (
          <Link to="/favorites" className="text-[10px] font-black uppercase tracking-widest text-brand-lime">
            Favorites
          </Link>
        )}
      </div>
      {!compact && <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{PORTFOLIO_MOVERS_DISCLOSURE}</p>}
      {report.emptyReason ? (
        <p className="text-[11px] text-slate-500">{report.emptyReason}</p>
      ) : (
        <div className={`grid grid-cols-1 gap-4 ${compact ? '' : 'md:grid-cols-2'}`}>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-300">Gainers</p>
            <ul className="space-y-2">
              {report.gainers.length === 0 && <li className="text-[11px] text-slate-500">No local gainers yet.</li>}
              {report.gainers.map((row) => (
                <li key={row.cardId} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white">{row.player}</span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-300">
                    <TrendingUp size={12} aria-hidden />
                    +{row.changePct.toFixed(1)}% · ${Math.round(row.changeAbs).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-rose-300">Losers</p>
            <ul className="space-y-2">
              {report.losers.length === 0 && <li className="text-[11px] text-slate-500">No local losers yet.</li>}
              {report.losers.map((row) => (
                <li key={row.cardId} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white">{row.player}</span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-rose-300">
                    <TrendingDown size={12} aria-hidden />
                    {row.changePct.toFixed(1)}% · ${Math.round(row.changeAbs).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {report.thinCount > 0 && !report.emptyReason && (
        <p className="mt-3 text-[10px] text-slate-500">{report.thinCount} holdings still have thin tape and are omitted.</p>
      )}
    </section>
  );
};

export default PortfolioMoversRail;
