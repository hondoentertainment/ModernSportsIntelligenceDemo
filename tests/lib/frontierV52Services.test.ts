import { describe, it, expect } from 'vitest';
import { FEATURE_CATALOG } from '../../lib/featureCatalog';

describe('v5.2 Frontier services', () => {
  it('catalog has at least 10 features with phase >= 279 (v5.2 Frontier range)', () => {
    const frontierFeatures = FEATURE_CATALOG.filter(f => f.phase >= 279);
    expect(
      frontierFeatures.length,
      `Expected at least 10 features with phase >= 279, got ${frontierFeatures.length}`,
    ).toBeGreaterThanOrEqual(10);
  });
});
