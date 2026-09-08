import React, { useMemo } from 'react';
import type { CardInventory } from '../types';
import type { LeagueSport } from '../lib/social/leagueHubService';
import { getStatLeaders, LEAGUE_HUB_DATA_DISCLOSURE } from '../lib/social/leagueHubService';
import {
  SEEDED_LEAGUE_PVP_DISCLOSURE,
  buildLeaguePerformanceVsPriceSeries,
} from '../lib/analytics/performanceVsPrice';
import PerformanceVsPriceChart from './PerformanceVsPriceChart';

interface Props {
  sport: LeagueSport;
  inventory: CardInventory[];
}

const LeaguePerformanceVsPricePanel: React.FC<Props> = ({ sport, inventory }) => {
  const points = useMemo(
    () => buildLeaguePerformanceVsPriceSeries(inventory, getStatLeaders(sport), sport),
    [inventory, sport],
  );

  return (
    <section className="rounded-2xl border border-slate-800 bg-brand-charcoal/40 p-5" aria-label={`${sport} performance vs price`}>
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-brand-muted">
        Holdings vs seeded {sport.toUpperCase()} desk
      </p>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-400">
        {SEEDED_LEAGUE_PVP_DISCLOSURE} {LEAGUE_HUB_DATA_DISCLOSURE}
      </p>
      {points.length === 0 ? (
        <p className="text-xs text-slate-500">
          No {sport.toUpperCase()} holdings bind to this seeded desk yet. Add matching player names to Collection — stats stay
          heuristic unless a live feed exists.
        </p>
      ) : (
        <PerformanceVsPriceChart points={points} subtitle={SEEDED_LEAGUE_PVP_DISCLOSURE} />
      )}
    </section>
  );
};

export default LeaguePerformanceVsPricePanel;
