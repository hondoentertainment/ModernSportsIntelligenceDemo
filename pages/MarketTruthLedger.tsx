import React, { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { formatDeskMoney, marketTruthLedger, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const MarketTruthLedger: React.FC = () => {
  const { inventory } = useInventory();
  const sales = useMemo(() => marketTruthLedger(inventory), [inventory]);
  const avg = sales.length ? sales.reduce((sum, sale) => sum + sale.price, 0) / sales.length : 0;
  const latest = sales[0]?.date ?? '—';

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Market Truth Ledger"
      lede="Sales already stored on your cards: sold comps and recorded exits. Rows appear only when a price is on the card."
      icon={<BookOpen size={12} />}
      stats={[
        { label: 'Sales on file', value: String(sales.length) },
        { label: 'Average price', value: sales.length ? formatDeskMoney(avg) : '—' },
        { label: 'Latest date', value: latest },
      ]}
      sectionTitle="Sales on file"
      rows={sales.slice(0, 40).map(sale => ({
        id: sale.id,
        title: sale.asset,
        detail: `${sale.venue} · ${sale.date} · ${sale.kind === 'sold-comp' ? 'Sold comp' : 'Recorded sale'}`,
        aside: formatDeskMoney(sale.price),
        asideClassName: 'text-emerald-400 font-medium',
      }))}
      empty="No sold comps or recorded sales on this book yet."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default MarketTruthLedger;
