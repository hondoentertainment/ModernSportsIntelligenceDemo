import React, { useMemo } from 'react';
import { Network } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { counterparties, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const IdentityGraph: React.FC = () => {
  const { inventory } = useInventory();
  const nodes = useMemo(() => counterparties(inventory), [inventory]);
  const linked = nodes.filter(node => node.venues.length > 0).length;

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Cross-Venue Identity Graph"
      lede="Links the vault and consignment names already stored on each card. It does not resolve eBay, COMC, or PWCC usernames across venues."
      icon={<Network size={12} />}
      stats={[
        { label: 'Names', value: String(nodes.length) },
        { label: 'With a venue', value: String(linked) },
        { label: 'Cross-username matches', value: '0' },
      ]}
      sectionTitle="Names on this book"
      rows={nodes.map(node => ({
        id: node.id,
        title: node.name,
        detail: node.venues.join(' · ') || 'No venue label',
        aside: `${node.deals} cards`,
      }))}
      empty="No vault or consignment name is stored yet."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default IdentityGraph;
