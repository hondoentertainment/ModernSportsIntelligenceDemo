import React, { useMemo } from 'react';
import { GitBranch } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { NEXT_FEATURE_DISCLOSURE, snapshotBeta } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const PortfolioBetaIndex: React.FC = () => {
  const { inventory } = useInventory();
  const view = useMemo(() => snapshotBeta(inventory), [inventory]);

  return (
    <FrontierDesk
      badge="v5.2 Frontier"
      title="Portfolio Beta to Index"
      lede="Compares this book’s mark-versus-cost return with an equal-weight basket of the sports you already hold."
      icon={<GitBranch size={12} />}
      stats={[
        { label: 'Snapshot beta', value: view.beta === null ? '—' : String(view.beta) },
        { label: 'Book return', value: view.portfolioReturnPct === null ? '—' : `${view.portfolioReturnPct}%` },
        { label: 'Sport basket', value: view.basketReturnPct === null ? '—' : `${view.basketReturnPct}%` },
      ]}
      sectionTitle="How to read it"
      rows={view.sports > 0 ? [{
        id: 'note',
        title: `${view.sports} sport${view.sports === 1 ? '' : 's'} in the basket`,
        detail: view.note,
      }] : []}
      empty={view.note}
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default PortfolioBetaIndex;
