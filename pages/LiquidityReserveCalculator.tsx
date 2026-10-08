import React, { useMemo } from 'react';
import { Droplets } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { liquidityReserve, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const LiquidityReserveCalculator: React.FC = () => {
  const { inventory } = useInventory();
  const view = useMemo(() => liquidityReserve(inventory), [inventory]);
  const gapLabel = view.gapPct > 0 ? `${view.gapPct} pts short` : view.gapPct < 0 ? `${Math.abs(view.gapPct)} pts above` : 'At target';

  return (
    <FrontierDesk
      badge="v5.2 Frontier"
      title="Liquidity Reserve Calculator"
      lede="Share of book value in cards with a liquidity score of at least 60, compared with a 15% planning reserve."
      icon={<Droplets size={12} />}
      stats={[
        { label: 'Recommended', value: `${view.recommendedPct}%` },
        { label: 'Current', value: `${view.currentPct}%` },
        { label: 'Gap', value: gapLabel },
      ]}
      sectionTitle="Cards counted as liquid"
      rows={view.liquidNames.map(name => ({ id: name, title: name, aside: 'Score ≥ 60' }))}
      empty="No holding currently clears the liquidity threshold."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default LiquidityReserveCalculator;
