import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import LeaguePerformanceVsPricePanel from '../../components/LeaguePerformanceVsPricePanel';
import { makeCard } from '../helpers';
import { SEEDED_LEAGUE_PVP_DISCLOSURE } from '../../lib/analytics/performanceVsPrice';
import { getStatLeaders } from '../../lib/social/leagueHubService';

describe('LeaguePerformanceVsPricePanel', () => {
  it('shows an honest empty state when no holdings bind', () => {
    render(
      <LeaguePerformanceVsPricePanel
        sport="nba"
        inventory={[makeCard({ id: 'mlb', player: 'Mike Trout', sport: 'Baseball', league: 'MLB' })]}
      />,
    );
    expect(screen.getByRole('region', { name: /nba performance vs price/i })).toBeInTheDocument();
    expect(screen.getByText(SEEDED_LEAGUE_PVP_DISCLOSURE, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/no nba holdings bind/i)).toBeInTheDocument();
  });

  it('binds a matching NBA holding to the seeded desk', () => {
    const leader = getStatLeaders('nba')[0];
    render(
      <LeaguePerformanceVsPricePanel
        sport="nba"
        inventory={[
          makeCard({
            id: 'nba-1',
            player: leader.player,
            sport: 'Basketball',
            league: 'NBA',
            currentValue: 180,
          }),
        ]}
      />,
    );
    expect(screen.queryByText(/no nba holdings bind/i)).not.toBeInTheDocument();
    expect(screen.getByText(/performance vs price/i)).toBeInTheDocument();
    expect(leader.player.length).toBeGreaterThan(0);
  });
});
