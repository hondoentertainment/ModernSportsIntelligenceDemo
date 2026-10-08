import React, { useMemo } from 'react';
import { Radio } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { narrativeLifecycles, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const NarrativeLifecycle: React.FC = () => {
  const { inventory } = useInventory();
  const rows = useMemo(() => narrativeLifecycles(inventory), [inventory]);

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Narrative Lifecycle Tracker"
      lede="Groups holdings by player and stages them from mark versus cost and how long you have held them. Social mention counts are not connected."
      icon={<Radio size={12} />}
      stats={[
        { label: 'Players', value: String(rows.length) },
        { label: 'Price-move stage', value: String(rows.filter(row => row.stage === 'Price move').length) },
        { label: 'Exhaustion', value: String(rows.filter(row => row.stage === 'Exhaustion').length) },
      ]}
      sectionTitle="Player narratives"
      rows={rows.slice(0, 40).map(row => ({
        id: row.id,
        title: row.name,
        detail: `${row.stage} · ${row.holdings} card${row.holdings === 1 ? '' : 's'}`,
        aside: `${row.progress}%`,
      }))}
      empty="Add holdings to stage a player narrative."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default NarrativeLifecycle;
