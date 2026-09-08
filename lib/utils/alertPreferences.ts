/**
 * Local alert delivery prefs: quiet hours, haptics, optional Notification API.
 * MSI store only — no Web Push / server push.
 */
import { store } from '../dal/syncStore';

export const ALERT_PREFERENCES_KEY = 'msi_alert_preferences_v1';
const LEGACY_NOTIFICATION_PREFS_KEY = 'msi_notification_prefs';

export interface AlertPreferences {
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  hapticsEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

export const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  hapticsEnabled: true,
  browserNotificationsEnabled: true,
};

export const ALERT_PREFERENCES_DISCLOSURE =
  'On-device delivery only. Quiet hours suppress haptics and browser notifications; in-app alerts still record. Not Web Push or a server feed.';

const HHMM = /^(\d{1,2}):(\d{2})$/;

export function parseTimeToMinutes(value: string): number | null {
  const match = HHMM.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function asTime(value: unknown, fallback: string): string {
  if (typeof value !== 'string' || parseTimeToMinutes(value) == null) return fallback;
  const match = HHMM.exec(value.trim());
  if (!match) return fallback;
  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
}

export function normalizeAlertPreferences(raw: unknown): AlertPreferences {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_ALERT_PREFERENCES };
  const o = raw as Partial<AlertPreferences>;
  return {
    quietHoursEnabled: Boolean(o.quietHoursEnabled),
    quietHoursStart: asTime(o.quietHoursStart, DEFAULT_ALERT_PREFERENCES.quietHoursStart),
    quietHoursEnd: asTime(o.quietHoursEnd, DEFAULT_ALERT_PREFERENCES.quietHoursEnd),
    hapticsEnabled: o.hapticsEnabled !== false,
    browserNotificationsEnabled: o.browserNotificationsEnabled !== false,
  };
}

function hydrateFromLegacyPrefs(): AlertPreferences | null {
  const legacy = store.get<unknown>(LEGACY_NOTIFICATION_PREFS_KEY, null);
  if (!legacy || typeof legacy !== 'object') return null;
  const o = legacy as {
    quietHoursEnabled?: unknown;
    quietHoursStart?: unknown;
    quietHoursEnd?: unknown;
  };
  if (typeof o.quietHoursEnabled !== 'boolean' && typeof o.quietHoursStart !== 'string') {
    return null;
  }
  return normalizeAlertPreferences({
    ...DEFAULT_ALERT_PREFERENCES,
    quietHoursEnabled: Boolean(o.quietHoursEnabled),
    quietHoursStart: o.quietHoursStart,
    quietHoursEnd: o.quietHoursEnd,
  });
}

export function getAlertPreferences(): AlertPreferences {
  const stored = store.get<unknown>(ALERT_PREFERENCES_KEY, null);
  if (stored != null) return normalizeAlertPreferences(stored);
  return hydrateFromLegacyPrefs() ?? { ...DEFAULT_ALERT_PREFERENCES };
}

export function setAlertPreferences(partial: Partial<AlertPreferences>): AlertPreferences {
  const next = normalizeAlertPreferences({ ...getAlertPreferences(), ...partial });
  store.set(ALERT_PREFERENCES_KEY, next);
  return next;
}

export function isWithinQuietHours(
  now: Date = new Date(),
  prefs: AlertPreferences = getAlertPreferences(),
): boolean {
  if (!prefs.quietHoursEnabled) return false;
  const start = parseTimeToMinutes(prefs.quietHoursStart);
  const end = parseTimeToMinutes(prefs.quietHoursEnd);
  if (start == null || end == null || start === end) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  if (start < end) return current >= start && current < end;
  return current >= start || current < end;
}

export function shouldFireHaptic(
  now: Date = new Date(),
  prefs: AlertPreferences = getAlertPreferences(),
): boolean {
  return prefs.hapticsEnabled && !isWithinQuietHours(now, prefs);
}

export function shouldFireBrowserNotification(
  now: Date = new Date(),
  prefs: AlertPreferences = getAlertPreferences(),
): boolean {
  return prefs.browserNotificationsEnabled && !isWithinQuietHours(now, prefs);
}
