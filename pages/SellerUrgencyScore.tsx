import React, { useMemo } from 'react';
import { Zap } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { NEXT_FEATURE_DISCLOSURE, sellerUrgency } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const SellerUrgencyScore: React.FC = () => {
  const { targets } = useInventory();
  const rows = useMemo(() => sellerUrgency(targets), [targets]);
  const hot = rows.filter(row => row.urgencyScore >= 60).length;

  return (
    <FrontierDesk
      badge="v5.2 Frontier"
      title="Seller Urgency Score"
      lede="Scored from your active watchlist: days since you added the target, plus a bump when the stored market price is at or under your target. These are not live listing ages."
      icon={<Zap size={12} />}
      stats={[
        { label: 'Active targets', value: String(rows.length) },
        { label: 'Score 60+', value: String(hot) },
        { label: 'Top score', value: rows[0] ? String(rows[0].urgencyScore) : '—' },
      ]}
      sectionTitle="Watchlist urgency"
      rows={rows.map(row => ({
        id: row.id,
        title: row.title,
        detail: `${row.daysListed} days on the watchlist`,
        aside: String(row.urgencyScore),
        asideClassName: row.urgencyScore >= 60 ? 'text-amber-300 font-semibold' : 'text-slate-300',
      }))}
      empty="Add active targets on the watchlist to score urgency."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default SellerUrgencyScore;
