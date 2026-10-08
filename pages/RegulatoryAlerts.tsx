import React, { useMemo } from 'react';
import { Shield } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { NEXT_FEATURE_DISCLOSURE, regulatoryChecklist } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const RegulatoryAlerts: React.FC = () => {
  const { inventory } = useInventory();
  const items = useMemo(() => regulatoryChecklist(inventory), [inventory]);
  const high = items.filter(item => item.severity === 'high').length;

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Regulatory Change Alerts"
      lede="A checklist against sales and holding periods already in this book. It does not watch Congress, state tax departments, or securities rules."
      icon={<Shield size={12} />}
      stats={[
        { label: 'Checklist items', value: String(items.length) },
        { label: 'Proceeds flag', value: String(high) },
        { label: 'Live statute feed', value: 'Off' },
      ]}
      sectionTitle="Checklist"
      rows={items.map(item => ({
        id: item.id,
        title: item.title,
        detail: item.detail,
        aside: item.severity === 'high' ? 'Review' : 'Note',
        asideClassName: item.severity === 'high' ? 'text-amber-300' : 'text-slate-400',
      }))}
      empty="Checklist unavailable."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default RegulatoryAlerts;
