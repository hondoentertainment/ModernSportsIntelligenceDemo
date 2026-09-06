import { describe, expect, it } from 'vitest';
import { resolveSwipeTriage } from '../../lib/utils/swipeTriage';

describe('resolveSwipeTriage', () => {
  it('returns null under the threshold', () => {
    expect(resolveSwipeTriage(20, 10)).toBeNull();
  });

  it('maps four directions for keep / sell / consign / review', () => {
    expect(resolveSwipeTriage(120, 10)).toBe('keep');
    expect(resolveSwipeTriage(-120, 8)).toBe('sell');
    expect(resolveSwipeTriage(10, -120)).toBe('consign');
    expect(resolveSwipeTriage(4, 130)).toBe('review');
  });

  it('lets the dominant axis win', () => {
    expect(resolveSwipeTriage(200, 90)).toBe('keep');
    expect(resolveSwipeTriage(40, -200)).toBe('consign');
  });
});
