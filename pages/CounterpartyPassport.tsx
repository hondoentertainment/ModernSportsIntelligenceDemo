import React, { useMemo } from 'react';
import { Fingerprint } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { counterparties, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const CounterpartyPassport: React.FC = () => {
  const { inventory } = useInventory();
  const nodes = useMemo(() => counterparties(inventory), [inventory]);

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Counterparty Passport"
      lede="Houses already on your cards: consignment partners and vault providers. Dispute history stays at zero until a dispute is stored."
      icon={<Fingerprint size={12} />}
      stats={[
        { label: 'Counterparties', value: String(nodes.length) },
        { label: 'Cards linked', value: String(nodes.reduce((sum, node) => sum + node.deals, 0)) },
        { label: 'Disputes on file', value: '0' },
      ]}
      sectionTitle="Passports"
      rows={nodes.map(node => ({
        id: node.id,
        title: node.name,
        detail: `${node.venues.join(', ') || 'Book'} · ${node.deals} card${node.deals === 1 ? '' : 's'} · idle ${node.idleDays ?? '—'}d`,
        aside: `Score ${node.score}`,
      }))}
      empty="Vault or consign a card to create a passport. No sample sellers are shown."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default CounterpartyPassport;
