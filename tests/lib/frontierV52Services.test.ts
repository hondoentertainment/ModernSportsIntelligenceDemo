import { describe, it, expect } from 'vitest';
import { FEATURE_CATALOG } from '../../lib/utils/featureCatalog';

const ARCHIVED_FRONTIER_IDS = [
  'bid-ask-spread-predictor',
  'wash-sale-horizon',
  'seller-urgency-score',
  'portfolio-beta-index',
  'grading-queue-estimator',
  'reputation-decay-tracker',
  'event-impact-attribution',
  'liquidity-reserve-calculator',
  'cross-sport-momentum',
  'agent-confidence-history',
];

describe('v5.2 Frontier services', () => {
  it('does not publish archived v5.2 frontier routes in the live catalog', () => {
    for (const id of ARCHIVED_FRONTIER_IDS) {
      expect(FEATURE_CATALOG.some(f => f.id === id), id).toBe(false);
    }
  });
});
