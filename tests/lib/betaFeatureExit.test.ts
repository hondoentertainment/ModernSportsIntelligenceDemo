import { describe, it, expect } from 'vitest';
import {
  getBetaFeatureExitStatuses,
  getBetaFeaturesReadyForLive,
  getBetaFeatureExitStatus,
} from '../../lib/betaFeatureExit';

describe('betaFeatureExit', () => {
  it('tracks all six beta catalog features', () => {
    expect(getBetaFeatureExitStatuses()).toHaveLength(6);
  });

  it('requires every gate before readyForLive', () => {
    for (const feature of getBetaFeatureExitStatuses()) {
      const allPass = Object.values(feature.gates).every(Boolean);
      expect(feature.readyForLive).toBe(allPass);
      if (!allPass) {
        expect(feature.blockers.length).toBeGreaterThan(0);
      }
    }
  });

  it('visual-audit and live-impact meet exit criteria with demo labeling', () => {
    expect(getBetaFeatureExitStatus('visual-audit')?.readyForLive).toBe(true);
    expect(getBetaFeatureExitStatus('live-impact')?.readyForLive).toBe(true);
  });

  it('liquidity-pool meets exit criteria with persistence, tests, and sim labeling', () => {
    expect(getBetaFeatureExitStatus('liquidity-pool')?.readyForLive).toBe(true);
  });

  it('provenance-chain meets exit criteria with persistence and reload E2E', () => {
    expect(getBetaFeatureExitStatus('provenance-chain')?.readyForLive).toBe(true);
  });

  it('vision-grading meets exit criteria with analysis-contract coverage', () => {
    expect(getBetaFeatureExitStatus('vision-grading')?.readyForLive).toBe(true);
  });

  it('returns undefined for an unknown feature id', () => {
    expect(getBetaFeatureExitStatus('not-a-feature')).toBeUndefined();
  });

  it('getBetaFeaturesReadyForLive returns promotable subset', () => {
    const ready = getBetaFeaturesReadyForLive();
    expect(ready.map((f) => f.id)).toContain('visual-audit');
    expect(ready.map((f) => f.id)).toContain('live-impact');
  });
});
