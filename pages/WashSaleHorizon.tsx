import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { NEXT_FEATURE_DISCLOSURE, washSaleWindows } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const WashSaleHorizon: React.FC = () => {
  const { inventory } = useInventory();
  const windows = useMemo(() => washSaleWindows(inventory), [inventory]);
  const open = windows.filter(row => !row.clear).length;

  return (
    <FrontierDesk
      badge="v5.2 Frontier"
      title="Wash-Sale Horizon Calendar"
      lede="Thirty days after each recorded sale. Use it to see proximity. It does not decide whether a wash-sale rule applies to that card."
      icon={<Calendar size={12} />}
      stats={[
        { label: 'Recorded sales', value: String(windows.length) },
        { label: 'Inside 30 days', value: String(open) },
        { label: 'Window elapsed', value: String(windows.length - open) },
      ]}
      sectionTitle="Windows"
      rows={windows.map(row => ({
        id: row.lotId,
        title: row.asset,
        detail: `Sold ${row.soldDate} · window ends ${row.washWindowEnd}`,
        aside: row.clear ? 'Elapsed' : 'Inside 30 days',
        asideClassName: row.clear ? 'text-emerald-400' : 'text-amber-300',
      }))}
      empty="No recorded sale dates on this book."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default WashSaleHorizon;
