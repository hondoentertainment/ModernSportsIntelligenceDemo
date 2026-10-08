import React, { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { formatDeskMoney, liquidationPlan, markOf, heldCards, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const CatastropheLiquidation: React.FC = () => {
  const { inventory } = useInventory();
  const nav = useMemo(() => heldCards(inventory).reduce((sum, card) => sum + markOf(card), 0), [inventory]);
  const [targetCash, setTargetCash] = useState(10000);
  const plan = useMemo(() => liquidationPlan(inventory, targetCash), [inventory, targetCash]);

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Catastrophe Liquidation Simulator"
      lede="Sells the most liquid cards first. Recovery takes a haircut that grows as liquidity falls. Haircut = (100 − liquidity) / 100 × 45%."
      icon={<AlertTriangle size={12} />}
      stats={[
        { label: 'Book mark', value: formatDeskMoney(nav) },
        { label: 'Recovered in plan', value: formatDeskMoney(plan.recovered) },
        { label: 'Shortfall', value: formatDeskMoney(plan.shortfall) },
      ]}
      sectionTitle="Sale order"
      rows={plan.sequence.map(step => ({
        id: step.id,
        title: `${step.order}. ${step.asset}`,
        detail: `${step.timeline} · ${step.recoveryPct}% of mark · cumulative ${formatDeskMoney(step.cumulative)}`,
        aside: formatDeskMoney(step.estRecovery),
      }))}
      empty="Add holdings with a mark to build a sale order."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    >
      <label className="block max-w-xs text-sm text-slate-300">
        Cash to raise
        <input
          type="number"
          min={0}
          value={targetCash}
          onChange={event => setTargetCash(Number(event.target.value) || 0)}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
      </label>
    </FrontierDesk>
  );
};

export default CatastropheLiquidation;
