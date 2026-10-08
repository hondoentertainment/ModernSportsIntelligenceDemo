import React, { useMemo } from 'react';
import { GitBranch } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { crossSportMomentum, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const CrossSportMomentum: React.FC = () => {
  const { inventory } = useInventory();
  const rows = useMemo(() => crossSportMomentum(inventory), [inventory]);
  const leader = rows.find(row => row.lead);

  return (
    <FrontierDesk
      badge="v5.2 Frontier"
      title="Cross-Sport Momentum"
      lede="Ranks sports in this book by mark versus cost. Lag between sports needs a daily index, so no lag days are shown."
      icon={<GitBranch size={12} />}
      stats={[
        { label: 'Sports', value: String(rows.length) },
        { label: 'Leader', value: leader?.sport ?? '—' },
        { label: 'Leader return', value: leader ? `${leader.returnPct}%` : '—' },
      ]}
      sectionTitle="Sport basket"
      rows={rows.map(row => ({
        id: row.sport,
        title: row.sport,
        detail: row.lead ? 'Highest return in this book' : 'Trailing the leader on this snapshot',
        aside: `${row.momentum.toFixed(2)} · ${row.returnPct}%`,
        asideClassName: row.lead ? 'text-emerald-400' : 'text-slate-300',
      }))}
      empty="Add holdings across sports with a cost and a mark."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default CrossSportMomentum;
