import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PieChart } from 'lucide-react';
import type { CardInventory } from '../types';
import { analyzePortfolioConcentration } from '../lib/analytics/portfolioConcentration';

interface Props {
  inventory: CardInventory[];
}

const PortfolioConcentrationRail: React.FC<Props> = ({ inventory }) => {
  const report = useMemo(() => analyzePortfolioConcentration(inventory), [inventory]);
  if (report.nav <= 0) return null;

  const topPlayers = report.players.slice(0, 4);
  const topLeagues = report.leagues.slice(0, 4);

  return (
    <section
      className="rounded-2xl border border-slate-800 bg-brand-charcoal/60 p-5 md:p-6"
      aria-label="Portfolio concentration risk"
    >
      <div className="mb-3 flex items-center gap-2">
        <PieChart size={16} className="text-rose-300" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-white">Concentration / risk rail</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            Share of NAV · advisory heuristic
          </p>
        </div>
      </div>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{report.disclosure}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-muted">By player</p>
          <ul className="space-y-2">
            {topPlayers.map((row) => (
              <li key={row.key} className="flex items-center justify-between gap-3 text-sm">
                <span className={row.overConcentrated ? 'text-rose-200' : 'text-white'}>{row.label}</span>
                <span className="font-mono text-xs text-slate-300">{row.sharePct.toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-muted">By league</p>
          <ul className="space-y-2">
            {topLeagues.map((row) => (
              <li key={row.key} className="flex items-center justify-between gap-3 text-sm">
                <span className={row.overConcentrated ? 'text-rose-200' : 'text-white'}>{row.label}</span>
                <span className="font-mono text-xs text-slate-300">{row.sharePct.toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {report.hints.length > 0 && (
        <ul className="mt-4 space-y-3">
          {report.hints.map((hint) => (
            <li key={hint.id} className="rounded-xl border border-slate-800/80 bg-brand-slate/30 px-4 py-3">
              <p className="text-sm font-medium text-white">{hint.title}</p>
              <p className="mt-1 text-[11px] text-slate-400">{hint.detail}</p>
              <Link
                to={hint.href}
                className="mt-2 inline-flex text-[10px] font-black uppercase tracking-widest text-brand-lime"
              >
                {hint.hrefLabel}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PortfolioConcentrationRail;
