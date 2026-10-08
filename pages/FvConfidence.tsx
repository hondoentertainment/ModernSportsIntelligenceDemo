import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { fairValueIntervals, formatDeskMoney, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const FvConfidence: React.FC = () => {
  const { inventory } = useInventory();
  const intervals = useMemo(() => fairValueIntervals(inventory), [inventory]);
  const fromComps = intervals.filter(row => row.method === 'comps').length;

  return (
    <FrontierDesk
      badge="v5.1 Frontier"
      title="Fair Value Confidence Interval"
      lede="When sold comps are on the card, the interval is the low and high of those prices. Otherwise the band is widened around the stored mark."
      icon={<BarChart3 size={12} />}
      stats={[
        { label: 'Cards priced', value: String(intervals.length) },
        { label: 'From comps', value: String(fromComps) },
        { label: 'From stored mark', value: String(intervals.length - fromComps) },
      ]}
      sectionTitle="Intervals"
      rows={intervals.slice(0, 40).map(row => ({
        id: row.id,
        title: row.card,
        detail: `${row.method === 'comps' ? 'Comp range' : 'Stored-mark band'} · ${row.confidencePct}% confidence label`,
        aside: `${formatDeskMoney(row.point)} (${formatDeskMoney(row.low)}–${formatDeskMoney(row.high)})`,
      }))}
      empty="Add a mark or sold comps in Collection to see an interval."
      disclosure={NEXT_FEATURE_DISCLOSURE}
    />
  );
};

export default FvConfidence;
