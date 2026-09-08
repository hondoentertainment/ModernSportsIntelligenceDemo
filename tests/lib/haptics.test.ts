import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PRICE_ALERT_HAPTIC_PATTERN,
  canVibrate,
  vibrateForPriceAlert,
  vibrateIfAvailable,
} from '../../lib/utils/haptics';

describe('haptics', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('no-ops when Vibration API is missing', () => {
    vi.stubGlobal('navigator', {});
    expect(canVibrate()).toBe(false);
    expect(vibrateIfAvailable()).toBe(false);
    expect(vibrateForPriceAlert()).toBe(false);
  });

  it('fires the price-alert pattern when vibrate exists', () => {
    const vibrate = vi.fn(() => true);
    vi.stubGlobal('navigator', { vibrate });
    expect(canVibrate()).toBe(true);
    expect(vibrateForPriceAlert()).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(PRICE_ALERT_HAPTIC_PATTERN);
  });

  it('returns false when vibrate throws', () => {
    vi.stubGlobal('navigator', {
      vibrate: () => {
        throw new Error('blocked');
      },
    });
    expect(vibrateIfAvailable([50])).toBe(false);
  });
});
