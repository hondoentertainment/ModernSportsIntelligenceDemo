/**
 * Device vibration helpers for price alerts and other attention-critical UX.
 * No-ops when Vibration API is missing (desktop / denied / SSR).
 * Price-alert haptics honor MSI alert prefs (quiet hours + haptic toggle).
 */
import { shouldFireHaptic } from './alertPreferences';

export const PRICE_ALERT_HAPTIC_PATTERN: number[] = [200, 100, 200, 100, 300];

export function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/** Returns true when the browser accepted the vibrate call. */
export function vibrateIfAvailable(pattern: number | number[] = PRICE_ALERT_HAPTIC_PATTERN): boolean {
  if (!canVibrate()) return false;
  try {
    return Boolean(navigator.vibrate(pattern));
  } catch {
    return false;
  }
}

/** Stronger pattern used when a watchlist / price threshold fires. */
export function vibrateForPriceAlert(): boolean {
  if (!shouldFireHaptic()) return false;
  return vibrateIfAvailable(PRICE_ALERT_HAPTIC_PATTERN);
}
