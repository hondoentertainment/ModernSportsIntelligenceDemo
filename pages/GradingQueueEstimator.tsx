import React, { useMemo } from 'react';
import { Package } from 'lucide-react';
import { FrontierDesk } from '../components/FrontierDesk';
import { gradingQueue, NEXT_FEATURE_DISCLOSURE } from '../lib/analytics/nextFeatureDesk';
import { useInventory } from '../lib/utils/useInventory';

const GradingQueueEstimator: React.FC = () => {
  const { inventory } = useInventory();
  const rows = useMemo(() => gradingQueue(inventory), [inventory]);

  return (
    <FrontierDesk
      badge="v5.2 Frontier"
      title="Grading Queue Estimator"
      lede="Planning bands for raw cards by mark. Queue position is omitted until a grader feed is connected."
      icon={<Package size={12} />}
      stats={[
        { label: 'Raw cards', value: String(rows.length) },
        { label: 'Queue position', value: 'Unavailable' },
        { label: 'Bands', value: 'Economy / Regular / Express' },
      ]}
      sectionTitle="Submission planning"
      rows={rows.map(row => ({
        id: row.id,
        title: row.asset,
        detail: row.tier,
        aside: row.etaDays,
      }))}
      empty="Every holding is already graded, or the book is empty."
      disclosure={`${NEXT_FEATURE_DISCLOSURE} Under $400 uses 45–120 days, $400–$2,000 uses 20–45 days, and $2,000+ uses 5–15 days.`}
    />
  );
};

export default GradingQueueEstimator;
