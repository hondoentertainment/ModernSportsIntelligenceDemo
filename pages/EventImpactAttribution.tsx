import React, { useMemo } from 'react';
import { Zap } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { eventAttribution, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const EventImpactAttribution: React.FC = () => {
  const { inventory } = useInventory();
  const rows = useMemo(() => eventAttribution(inventory), [inventory]);
  const tagged = rows.filter(row => row.event !== 'Holding period (no event tape)').length;

  return (
    <FrontierDesk
      badge="v5.2 Frontier"
      title="Event Impact Attribution"
      lede="Mark versus cost for each holding. If a sold comp stores an event name, that label is used. Otherwise the move stays on the holding period."
      icon={<Zap size={12} />}
      stats={[
        { label: 'Holdings', value: String(rows.length) },
        { label: 'Event-tagged', value: String(tagged) },
        { label: 'Largest move', value: rows[0] ? `${rows[0].impactPct}%` : '—' },
      ]}
      sectionTitle="Moves"
      rows={rows.slice(0, 40).map(row => ({
        id: row.id,
        title: row.asset,
        detail: row.event,
        aside: `${row.impactPct > 0 ? '+' : ''}${row.impactPct}%`,
        asideClassName: row.impactPct >= 0 ? 'text-emerald-400' : 'text-red-300',
      }))}
      empty="Add a cost and a mark to attribute a move."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default EventImpactAttribution;
