import React, { useMemo } from 'react';
import { Shield } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { NEXT_FEATURE_DISCLOSURE, portfolioImmunization } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const PortfolioImmunization: React.FC = () => {
  const { inventory } = useInventory();
  const view = useMemo(() => portfolioImmunization(inventory), [inventory]);

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Portfolio Immunization"
      lede="Duration here is a liquidity proxy: less liquid cards lengthen how long a hobby slump stays in the book. The target is 60% of the current duration."
      icon={<Shield size={12} />}
      stats={[
        { label: 'Current duration', value: `${view.durationMonths} mo` },
        { label: 'Shorter target', value: `${view.targetMonths} mo` },
        { label: 'Cards to trim first', value: String(view.trim.length) },
      ]}
      sectionTitle="Longest duration holdings"
      rows={view.trim.map(row => ({
        id: row.id,
        title: row.asset,
        aside: `${row.durationMonths} mo`,
      }))}
      empty="Add holdings with a mark to estimate duration."
      disclosure={`${NEXT_FEATURE_DISCLOSURE} Duration is (100 − liquidity) / 100 × 18 months, weighted by mark.`}
    />
  );
};

export default PortfolioImmunization;
