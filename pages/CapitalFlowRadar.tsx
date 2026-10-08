import React, { useMemo } from 'react';
import { Radar } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { capitalFlows, formatDeskMoney, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const CapitalFlowRadar: React.FC = () => {
  const { inventory } = useInventory();
  const rows = useMemo(() => capitalFlows(inventory), [inventory]);
  const inflows = rows.filter(row => row.direction === 'inflow').length;

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Capital Flow Radar"
      lede="Where this book’s value sits, by sport and by graded versus raw, using mark versus cost as the direction."
      icon={<Radar size={12} />}
      stats={[
        { label: 'Segments', value: String(rows.length) },
        { label: 'Positive segments', value: String(inflows) },
        { label: 'Largest', value: rows[0] ? formatDeskMoney(rows[0].volume) : '—' },
      ]}
      sectionTitle="Segments"
      rows={rows.map(row => ({
        id: row.segment,
        title: row.segment,
        detail: row.direction,
        aside: `${row.change > 0 ? '+' : ''}${row.change}% · ${formatDeskMoney(row.volume)}`,
        asideClassName: row.direction === 'inflow' ? 'text-emerald-400' : row.direction === 'outflow' ? 'text-red-300' : 'text-slate-300',
      }))}
      empty="Add holdings to see where value sits."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default CapitalFlowRadar;
