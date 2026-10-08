import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { NEXT_FEATURE_DISCLOSURE, portfolioLiquidityHorizons } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const LiquidityHorizon: React.FC = () => {
  const { inventory } = useInventory();
  const horizons = useMemo(() => portfolioLiquidityHorizons(inventory), [inventory]);

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Liquidity Horizon Curve"
      lede="Value-weighted chance of exiting near fair value in 1, 7, 30, and 90 days. The model uses each card’s liquidity score. A tighter ask is harder."
      icon={<Clock size={12} />}
      stats={horizons.slice(0, 3).map(row => ({
        label: `${row.label} at 90% of FMV`,
        value: `${row.pct90}%`,
      }))}
      sectionTitle="Exit odds"
      rows={horizons.map(row => ({
        id: row.label,
        title: row.label,
        detail: `95% of FMV ${row.pct95}% · 99% of FMV ${row.pct99}%`,
        aside: `${row.pct90}% at 90%`,
        asideClassName: 'text-sky-300',
      }))}
      empty="Add holdings with a mark to plot an exit curve."
      disclosure={`${NEXT_FEATURE_DISCLOSURE} Missing liquidity scores use 75 vaulted, 55 graded, or 35 raw.`}
    />
  );
};

export default LiquidityHorizon;
