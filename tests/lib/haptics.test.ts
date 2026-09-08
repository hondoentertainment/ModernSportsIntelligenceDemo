import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setAlertPreferences } from '../../lib/utils/alertPreferences';
import {
  PRICE_ALERT_HAPTIC_PATTERN,
  canVibrate,
  vibrateForPriceAlert,
  vibrateIfAvailable,
} from '../../lib/utils/haptics';

describe('haptics', () => {
  beforeEach(() => {
    localStorage.clear();
    setAlertPreferences({
      quietHoursEnabled: false,
      hapticsEnabled: true,
      browserNotificationsEnabled: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
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

  it('respects haptic off and quiet hours for price alerts', () => {
    const vibrate = vi.fn(() => true);
    vi.stubGlobal('navigator', { vibrate });
    setAlertPreferences({ hapticsEnabled: false });
    expect(vibrateForPriceAlert()).toBe(false);
    expect(vibrate).not.toHaveBeenCalled();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-08T12:00:00'));
    setAlertPreferences({
      hapticsEnabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '09:00',
      quietHoursEnd: '17:00',
    });
    expect(vibrateForPriceAlert()).toBe(false);
    vi.useRealTimers();
  });
});
