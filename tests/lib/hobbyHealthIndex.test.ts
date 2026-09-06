import { describe, expect, it } from 'vitest';
import { bandForHobbyScore, computeHobbyHealthIndex, HOBBY_HEALTH_DISCLOSURE } from '../../lib/utils/hobbyHealthIndex';

describe('hobbyHealthIndex', () => {
  it('is deterministic for a seed and discloses synthetic data', () => {
    const a = computeHobbyHealthIndex({ seed: 99, portfolioNav: 10000, asOf: '2026-09-06T00:00:00.000Z' });
    const b = computeHobbyHealthIndex({ seed: 99, portfolioNav: 10000, asOf: '2026-09-06T00:00:00.000Z' });
    expect(a.score).toBe(b.score);
    expect(a.band).toBe(bandForHobbyScore(a.score));
    expect(a.disclosure).toBe(HOBBY_HEALTH_DISCLOSURE);
    expect(a.components).toHaveLength(4);
  });
});
