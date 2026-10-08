import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { bidAskSpreads, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const BidAskSpreadPredictor: React.FC = () => {
  const { inventory } = useInventory();
  const rows = useMemo(() => bidAskSpreads(inventory), [inventory]);
  const avg = rows.length ? rows.reduce((sum, row) => sum + row.predictedSpreadPct, 0) / rows.length : 0;

  return (
    <FrontierDesk
      badge="v5.2 Frontier"
      title="Bid-Ask Spread Predictor"
      lede="A planning spread from liquidity: less liquid cards get a wider band. Venue is the vault or consignment house on the card when one is set."
      icon={<BarChart3 size={12} />}
      stats={[
        { label: 'Cards', value: String(rows.length) },
        { label: 'Average band', value: rows.length ? `${avg.toFixed(1)}%` : '—' },
        { label: 'Floor', value: '2%' },
      ]}
      sectionTitle="Predicted bands"
      rows={rows.map(row => ({
        id: row.id,
        title: row.card,
        detail: row.venue,
        aside: `${row.predictedSpreadPct}%`,
      }))}
      empty="Add holdings with a mark to estimate a band."
      disclosure={`${NEXT_FEATURE_DISCLOSURE} Spread = max(2%, (100 − liquidity) × 0.15).`}
    />
  );
};

export default BidAskSpreadPredictor;
