import { describe, expect, it } from 'vitest';
import { shouldApplyProfileLoadTimeoutDefaults } from '../../contexts/AuthContext';

describe('shouldApplyProfileLoadTimeoutDefaults', () => {
  it('releases only an unresolved initial profile load', () => {
    expect(shouldApplyProfileLoadTimeoutDefaults(null, 'user-1')).toBe(true);
    expect(shouldApplyProfileLoadTimeoutDefaults('other', 'user-1')).toBe(true);
  });

  it('does not apply safe defaults during a hung background refresh', () => {
    expect(shouldApplyProfileLoadTimeoutDefaults('user-1', 'user-1')).toBe(false);
  });
});
