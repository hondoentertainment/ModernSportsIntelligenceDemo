import React, { useMemo } from 'react';
import { TrendingDown } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { counterparties, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const ReputationDecayTracker: React.FC = () => {
  const { inventory } = useInventory();
  const nodes = useMemo(() => counterparties(inventory), [inventory]);

  return (
    <FrontierDesk
      badge="v5.2 Frontier"
      title="Reputation Decay Tracker"
      lede="Score starts at 80 and drops 2 points for every 30 days of silence after 90 days. Disputes are not invented."
      icon={<TrendingDown size={12} />}
      stats={[
        { label: 'Tracked', value: String(nodes.length) },
        { label: 'Decaying', value: String(nodes.filter(node => node.decay < 0).length) },
        { label: 'Disputes on file', value: '0' },
      ]}
      sectionTitle="Idle decay"
      rows={nodes.map(node => ({
        id: node.id,
        title: node.name,
        detail: node.lastActivity ? `Last activity ${node.lastActivity.slice(0, 10)}` : 'No activity date',
        aside: `${node.score} (${node.decay})`,
        asideClassName: node.decay < 0 ? 'text-amber-300' : 'text-emerald-400',
      }))}
      empty="No consignment or vault counterparty is on file."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default ReputationDecayTracker;
