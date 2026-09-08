import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import {
  ALERT_PREFERENCES_KEY,
  DEFAULT_ALERT_PREFERENCES,
  getAlertPreferences,
  isWithinQuietHours,
  normalizeAlertPreferences,
  parseTimeToMinutes,
  setAlertPreferences,
  shouldFireBrowserNotification,
  shouldFireHaptic,
} from '../../lib/utils/alertPreferences';

describe('alertPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('normalizes junk and invalid times', () => {
    expect(normalizeAlertPreferences(null)).toEqual(DEFAULT_ALERT_PREFERENCES);
    expect(normalizeAlertPreferences({ quietHoursStart: '25:99', hapticsEnabled: false }).hapticsEnabled).toBe(false);
    expect(normalizeAlertPreferences({ quietHoursStart: '25:99' }).quietHoursStart).toBe('22:00');
    expect(parseTimeToMinutes('7:05')).toBe(7 * 60 + 5);
    expect(parseTimeToMinutes('nope')).toBeNull();
    expect(parseTimeToMinutes('24:00')).toBeNull();
  });

  it('persists toggles and hydrates from legacy notification prefs', () => {
    const saved = setAlertPreferences({ quietHoursEnabled: true, browserNotificationsEnabled: false });
    expect(saved.quietHoursEnabled).toBe(true);
    expect(getAlertPreferences().browserNotificationsEnabled).toBe(false);

    store.remove(ALERT_PREFERENCES_KEY);
    store.set('msi_notification_prefs', {
      quietHoursEnabled: true,
      quietHoursStart: '21:00',
      quietHoursEnd: '06:30',
    });
    expect(getAlertPreferences()).toMatchObject({
      quietHoursEnabled: true,
      quietHoursStart: '21:00',
      quietHoursEnd: '06:30',
    });
  });

  it('does not hydrate from empty legacy blobs', () => {
    store.set('msi_notification_prefs', { soundEnabled: true });
    expect(getAlertPreferences()).toEqual(DEFAULT_ALERT_PREFERENCES);
  });

  it('treats overnight quiet hours and equal windows', () => {
    const prefs = {
      ...DEFAULT_ALERT_PREFERENCES,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    };
    expect(isWithinQuietHours(new Date('2026-09-08T23:00:00'), prefs)).toBe(true);
    expect(isWithinQuietHours(new Date('2026-09-08T06:00:00'), prefs)).toBe(true);
    expect(isWithinQuietHours(new Date('2026-09-08T12:00:00'), prefs)).toBe(false);

    const daytime = { ...prefs, quietHoursStart: '09:00', quietHoursEnd: '17:00' };
    expect(isWithinQuietHours(new Date('2026-09-08T10:00:00'), daytime)).toBe(true);
    expect(isWithinQuietHours(new Date('2026-09-08T08:00:00'), daytime)).toBe(false);

    expect(isWithinQuietHours(new Date(), { ...prefs, quietHoursEnabled: false })).toBe(false);
    expect(isWithinQuietHours(new Date(), { ...prefs, quietHoursStart: '10:00', quietHoursEnd: '10:00' })).toBe(false);
  });

  it('gates haptics and browser notifications', () => {
    const quiet = {
      ...DEFAULT_ALERT_PREFERENCES,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    };
    const night = new Date('2026-09-08T23:30:00');
    expect(shouldFireHaptic(night, quiet)).toBe(false);
    expect(shouldFireBrowserNotification(night, quiet)).toBe(false);
    expect(shouldFireHaptic(night, { ...quiet, hapticsEnabled: false, quietHoursEnabled: false })).toBe(false);
    expect(shouldFireBrowserNotification(night, { ...quiet, browserNotificationsEnabled: false, quietHoursEnabled: false })).toBe(false);
    expect(shouldFireHaptic(night, DEFAULT_ALERT_PREFERENCES)).toBe(true);
  });
});
