// @ts-nocheck
import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildFrontierRoadmapExport,
  getFrontierFeatureBlueprints,
  getMergedFrontierFeatures,
  saveFrontierFeatureState,
} from '../../lib/utils/frontierFeatureService';

describe('frontierFeatureService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exposes ten differentiated frontier features', () => {
    const features = getFrontierFeatureBlueprints();
    expect(features).toHaveLength(10);
    expect(features[0].productionChecklist.length).toBeGreaterThan(0);
  });

  it('persists per-feature stage and notes', () => {
    saveFrontierFeatureState('reacquisition-radar', {
      stage: 'production-ready',
      note: 'Wire into Sold Vault alerts first.',
    });

    const feature = getMergedFrontierFeatures().find(item => item.id === 'reacquisition-radar');
    expect(feature?.stage).toBe('production-ready');
    expect(feature?.note).toContain('Sold Vault');
  });

  it('builds a roadmap export with summary stats', () => {
    const payload = buildFrontierRoadmapExport();
    expect(payload.featureCount).toBeGreaterThanOrEqual(9);
    expect(payload.averageMoatScore).toBeGreaterThan(0);
    expect(payload.stageCount.recommended).toBeGreaterThanOrEqual(9);
  });
});
