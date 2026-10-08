import React, { useMemo, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { formatDeskMoney, NEXT_FEATURE_DISCLOSURE, thesisBacktest } from '../lib/analytics/nextFeatureDesk';
import { useAgentRecommendations } from '../lib/utils/useAgentRecommendations';
import { useInventory } from '../lib/utils/useInventory';
import { useAuth } from '../contexts/AuthContext';

const HORIZONS = [1, 3, 6, 12] as const;

const ThesisBacktester: React.FC = () => {
  const { user } = useAuth();
  const { inventory } = useInventory();
  const { recommendations, loading } = useAgentRecommendations(user?.id);
  const [months, setMonths] = useState<(typeof HORIZONS)[number]>(12);
  const result = useMemo(
    () => thesisBacktest(recommendations, inventory, months),
    [recommendations, inventory, months],
  );

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Thesis Backtester"
      lede="Paper result if approved, submitted, or filled recommendations in the window name a player you still hold. Unmatched recommendations stay out of the P&L."
      icon={<FlaskConical size={12} />}
      stats={[
        { label: 'Paper P&L', value: loading ? '…' : formatDeskMoney(result.pnl) },
        { label: 'Simple annualized', value: result.cagrPct === null ? '—' : `${result.cagrPct}%` },
        { label: 'Recommendations in window', value: String(result.recommendations) },
      ]}
      sectionTitle="Matched holdings"
      rows={result.matched.map(row => ({
        id: row.id,
        title: row.player,
        aside: formatDeskMoney(row.pnl),
        asideClassName: row.pnl >= 0 ? 'text-emerald-400' : 'text-red-300',
      }))}
      empty={user ? 'No recommendation in this window names a player you hold.' : 'Sign in to load saved agent recommendations. The book alone is not a backtest.'}
      disclosure={NEXT_FEATURE_DISCLOSURE}
    >
      <div className="flex flex-wrap gap-2">
        {HORIZONS.map(horizon => (
          <button
            key={horizon}
            type="button"
            onClick={() => setMonths(horizon)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${months === horizon ? 'bg-brand-lime/20 text-brand-lime' : 'bg-slate-800 text-slate-300'}`}
          >
            {horizon}M
          </button>
        ))}
      </div>
    </FrontierDesk>
  );
};

export default ThesisBacktester;
