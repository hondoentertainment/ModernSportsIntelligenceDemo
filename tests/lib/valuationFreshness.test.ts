import { describe, expect, it } from 'vitest';
import {
  buildValuationProvenanceTitle,
  formatValuationConfidence,
  formatValuationTimestamp,
  getStaleValuationLabel,
  isThinLiquidityScore,
  isValuationStale,
} from '../../lib/utils/valuationFreshness';

const NOW = Date.parse('2026-09-06T18:00:00.000Z');

describe('valuationFreshness', () => {
  it('marks valuations stale after 7 days', () => {
    expect(isValuationStale('2026-08-20', NOW)).toBe(true);
    expect(isValuationStale('2026-09-05', NOW)).toBe(false);
    expect(getStaleValuationLabel('2026-08-20', NOW)).toBe('17d');
    expect(getStaleValuationLabel('2026-09-05', NOW)).toBeNull();
  });

  it('formats recent and dated timestamps', () => {
    expect(formatValuationTimestamp('2026-09-06T17:30:00.000Z', NOW)).toBe('priced <1h ago');
    expect(formatValuationTimestamp('2026-09-06T12:00:00.000Z', NOW)).toBe('priced 6h ago');
    expect(formatValuationTimestamp('2026-08-01T00:00:00.000Z', NOW)).toBe('priced 2026-08-01');
    expect(formatValuationTimestamp(undefined, NOW)).toBeNull();
  });

  it('formats fractional and percent confidence', () => {
    expect(formatValuationConfidence(0.75)).toBe('75% conf');
    expect(formatValuationConfidence(82)).toBe('82% conf');
    expect(formatValuationConfidence(undefined)).toBeNull();
  });

  it('builds tooltip title from timestamp, confidence, and rationale', () => {
    const title = buildValuationProvenanceTitle({
      timestamp: '2026-09-06T12:00:00.000Z',
      confidence: 0.6,
      rationale: 'Three verified comps in the last week.',
      nowMs: NOW,
    });
    expect(title).toMatch(/priced 6h ago/);
    expect(title).toMatch(/60% conf/);
    expect(title).toMatch(/verified comps/);
  });

  it('flags thin liquidity below 40', () => {
    expect(isThinLiquidityScore(39)).toBe(true);
    expect(isThinLiquidityScore(40)).toBe(false);
    expect(isThinLiquidityScore(undefined)).toBe(false);
  });
});
