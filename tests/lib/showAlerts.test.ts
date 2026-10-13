import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Alert } from '../../types';
import { store } from '../../lib/dal/syncStore';
import {
  IN_APP_ALERTS_KEY,
  IN_APP_ALERTS_UPDATED_EVENT,
  setAlertPreferences,
} from '../../lib/utils/alertPreferences';
import { LOCAL_CARD_SHOW_CATALOG } from '../../lib/shows/localCardShowCatalog';
import type { ResolvedLocalCardShow } from '../../lib/shows/localCardShowCatalog';
import {
  DEFAULT_SHOW_ALERT_PREFS,
  MAX_LEAD_DAYS,
  MAX_RADIUS_MILES,
  MIN_LEAD_DAYS,
  SHOW_ALERT_DISCLOSURE,
  SHOW_ALERT_LOG_KEY,
  SHOW_ALERT_LOG_LIMIT,
  SHOW_ALERT_PREFS_KEY,
  ShowAlertPrefsSchema,
  getShowAlertPrefs,
  inboxIdForShowAlert,
  listShowHomePresets,
  markShowAlertRead,
  normalizeShowAlertPrefs,
  notifyShowAlertInBrowser,
  readShowAlertLog,
  setShowAlertPrefs,
  showAlertDeliveryNote,
  showsInAlertWindow,
  syncShowAlerts,
} from '../../lib/shows/showAlerts';

function show(overrides: Partial<ResolvedLocalCardShow> = {}): ResolvedLocalCardShow {
  return {
    id: 'show-nyc',
    name: 'Metro Card Meetup',
    venue: 'Hall A',
    address: '1 Main',
    city: 'New York',
    state: 'NY',
    lat: 40.7571,
    lng: -74.0023,
    month: 10,
    day: 18,
    durationDays: 1,
    admissionUsd: 5,
    vendorCount: 40,
    expectedAttendance: 800,
    sports: ['Baseball'],
    focusPlayers: [],
    tableStyle: 'mixed',
    notes: 'seed',
    startDate: '2026-10-18',
    endDate: '2026-10-18',
    status: 'upcoming',
    daysUntilStart: 5,
    source: 'seeded-public-calendar',
    ...overrides,
  };
}

const home = { label: 'New York, NY', lat: 40.7571, lng: -74.0023 };
const noon = new Date(2026, 9, 13, 12, 0, 0);
const quietNight = new Date(2026, 9, 13, 23, 30, 0);

beforeEach(() => {
  store.remove(SHOW_ALERT_PREFS_KEY);
  store.remove(SHOW_ALERT_LOG_KEY);
  store.remove(IN_APP_ALERTS_KEY);
  setAlertPreferences({
    quietHoursEnabled: false,
    browserNotificationsEnabled: true,
    hapticsEnabled: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('show alert prefs', () => {
  it('rejects a partial payload on the schema and clamps it into a safe default', () => {
    expect(ShowAlertPrefsSchema.safeParse({ enabled: true }).success).toBe(false);
    expect(ShowAlertPrefsSchema.safeParse({ ...DEFAULT_SHOW_ALERT_PREFS, extra: true }).success).toBe(false);
    expect(normalizeShowAlertPrefs(null)).toEqual(DEFAULT_SHOW_ALERT_PREFS);
    expect(normalizeShowAlertPrefs({
      enabled: true,
      radiusMiles: 9999,
      leadDays: 0,
      home: { label: '  Dallas, TX  ', lat: 32.774, lng: -96.801, extra: true },
    })).toEqual({
      enabled: true,
      radiusMiles: MAX_RADIUS_MILES,
      leadDays: MIN_LEAD_DAYS,
      home: { label: 'Dallas, TX', lat: 32.774, lng: -96.801 },
    });
    expect(normalizeShowAlertPrefs({
      enabled: 'yes',
      radiusMiles: '12',
      leadDays: '400',
      home: { label: '', lat: 10, lng: 10 },
    })).toMatchObject({
      enabled: false,
      radiusMiles: 12,
      leadDays: MAX_LEAD_DAYS,
      home: null,
    });
    expect(normalizeShowAlertPrefs({
      home: { label: 'Nope', lat: 120, lng: 0 },
    }).home).toBeNull();
  });

  it('persists a home, radius, and lead time', () => {
    const saved = setShowAlertPrefs({ enabled: true, home, radiusMiles: 40, leadDays: 10 });
    expect(saved.home?.label).toBe('New York, NY');
    expect(getShowAlertPrefs()).toEqual(saved);
    expect(store.get(SHOW_ALERT_PREFS_KEY, null)).toMatchObject({ enabled: true, radiusMiles: 40 });
  });

  it('lists one preset per seeded city', () => {
    const presets = listShowHomePresets();
    const labels = [...new Set(LOCAL_CARD_SHOW_CATALOG.map((row) => `${row.city}, ${row.state}`))].sort();
    expect(presets.map((row) => row.label)).toEqual(labels);
    const nyc = presets.find((row) => row.label === 'New York, NY');
    const source = LOCAL_CARD_SHOW_CATALOG.find((row) => row.city === 'New York');
    expect(nyc).toEqual({ label: 'New York, NY', lat: source?.lat, lng: source?.lng });
  });
});

describe('show alert window', () => {
  it('stays empty until alerts are enabled with a home', () => {
    const rows = [show()];
    expect(showsInAlertWindow(rows, DEFAULT_SHOW_ALERT_PREFS)).toEqual([]);
    expect(showsInAlertWindow(rows, { ...DEFAULT_SHOW_ALERT_PREFS, enabled: true })).toEqual([]);
  });

  it('keeps shows inside the radius and lead time, including a show that is open now', () => {
    const prefs = { enabled: true, home, radiusMiles: 50, leadDays: 7 };
    const openNow = show({
      id: 'open',
      name: 'Open Room',
      status: 'in-progress',
      daysUntilStart: 0,
      startDate: '2026-10-13',
    });
    const soon = show();
    const later = show({ id: 'later', name: 'Later', daysUntilStart: 30, startDate: '2026-11-12' });
    const far = show({
      id: 'far',
      name: 'Far',
      lat: 47.6115,
      lng: -122.3316,
      city: 'Seattle',
      daysUntilStart: 2,
      startDate: '2026-10-15',
    });
    const ended = show({ id: 'ended', daysUntilStart: -1, startDate: '2026-10-01' });
    const hits = showsInAlertWindow([later, far, ended, soon, openNow], prefs);
    expect(hits.map((row) => row.show.id)).toEqual(['open', 'show-nyc']);
    expect(hits[1].distanceMiles).toBe(0);
  });
});

describe('show alert sync', () => {
  it('records an in-app alert and does not notify twice', () => {
    const notify = vi.fn(() => true);
    const prefs = setShowAlertPrefs({ enabled: true, home, radiusMiles: 25, leadDays: 7 });
    const first = syncShowAlerts({
      shows: [show()],
      prefs,
      now: noon,
      notify,
    });
    expect(first.created).toHaveLength(1);
    expect(first.active[0].title).toMatch(/in 5 days/i);
    expect(first.active[0].isRead).toBe(false);
    expect(first.browserNotified).toBe(1);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(first.deliveryNote).toMatch(/owner-held VAPID/i);
    expect(SHOW_ALERT_DISCLOSURE).toMatch(/not live Market Movers/i);
    expect(SHOW_ALERT_DISCLOSURE).not.toMatch(/VITE_FF_REAL/);

    const inbox = store.get<Alert[]>(IN_APP_ALERTS_KEY, []);
    expect(inbox[0]?.id).toBe(inboxIdForShowAlert(first.created[0].id));
    expect(inbox[0]?.actionUrl).toBe('/local-card-shows');
    expect(inbox[0]?.priority).toBe('medium');

    const second = syncShowAlerts({ shows: [show({ daysUntilStart: 4 })], prefs, now: noon, notify });
    expect(second.created).toEqual([]);
    expect(second.active[0].daysUntilStart).toBe(4);
    expect(second.active[0].isRead).toBe(false);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(store.get<Alert[]>(IN_APP_ALERTS_KEY, [])).toHaveLength(1);
  });

  it('still records during quiet hours and when browser notifications are off', () => {
    const notify = vi.fn(() => true);
    const vibrate = vi.fn(() => true);
    vi.stubGlobal('navigator', { vibrate });
    setAlertPreferences({
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      browserNotificationsEnabled: true,
      hapticsEnabled: true,
    });
    const quiet = syncShowAlerts({
      shows: [show()],
      prefs: { enabled: true, home, radiusMiles: 25, leadDays: 7 },
      now: quietNight,
      notify,
    });
    expect(quiet.created).toHaveLength(1);
    expect(quiet.browserNotified).toBe(0);
    expect(notify).not.toHaveBeenCalled();
    expect(vibrate).not.toHaveBeenCalled();
    expect(quiet.deliveryNote).toMatch(/quiet hours/i);
    expect(showAlertDeliveryNote(quietNight)).toMatch(/quiet hours/i);

    store.remove(SHOW_ALERT_LOG_KEY);
    store.remove(IN_APP_ALERTS_KEY);
    setAlertPreferences({ browserNotificationsEnabled: false, quietHoursEnabled: false, hapticsEnabled: false });
    const muted = syncShowAlerts({
      shows: [show({ daysUntilStart: 1, status: 'upcoming' })],
      prefs: { enabled: true, home, radiusMiles: 25, leadDays: 7 },
      now: noon,
      notify,
    });
    expect(muted.created[0].title).toMatch(/tomorrow/i);
    expect(muted.browserNotified).toBe(0);
    expect(muted.deliveryNote).toMatch(/browser notifications are off/i);
    expect(store.get<Alert[]>(IN_APP_ALERTS_KEY, [])[0]?.priority).toBe('high');
  });

  it('marks a show open now and keeps the alert when the window is empty later', () => {
    const prefs = { enabled: true, home, radiusMiles: 25, leadDays: 7 };
    const open = syncShowAlerts({
      shows: [show({ status: 'in-progress', daysUntilStart: 0, startDate: '2026-10-13' })],
      prefs,
      now: noon,
      notify: () => false,
    });
    expect(open.created[0].title).toMatch(/open now/i);
    syncShowAlerts({ shows: [], prefs, now: noon, notify: () => false });
    expect(readShowAlertLog()).toHaveLength(1);
    expect(readShowAlertLog()[0].isRead).toBe(false);
  });

  it('marks the in-app row and the inbox read', () => {
    const prefs = { enabled: true, home, radiusMiles: 25, leadDays: 7 };
    const result = syncShowAlerts({ shows: [show()], prefs, now: noon, notify: () => false });
    const id = result.created[0].id;
    const heard = vi.fn();
    window.addEventListener(IN_APP_ALERTS_UPDATED_EVENT, heard);
    const next = markShowAlertRead(id);
    expect(next.find((row) => row.id === id)?.isRead).toBe(true);
    expect(store.get<Alert[]>(IN_APP_ALERTS_KEY, [])[0]?.isRead).toBe(true);
    expect(heard).toHaveBeenCalled();
    markShowAlertRead('missing');
    window.removeEventListener(IN_APP_ALERTS_UPDATED_EVENT, heard);
  });

  it('drops historical rows once the log cap is full and ignores a corrupt log', () => {
    const prefs = { enabled: true, home, radiusMiles: 10, leadDays: 14 };
    const many = Array.from({ length: SHOW_ALERT_LOG_LIMIT + 1 }, (_, index) => show({
      id: `show-${index}`,
      name: `Show ${index}`,
      startDate: `2026-11-${String((index % 27) + 1).padStart(2, '0')}`,
      daysUntilStart: 1,
    }));
    syncShowAlerts({ shows: many, prefs, now: noon, notify: () => false });
    expect(readShowAlertLog().length).toBe(SHOW_ALERT_LOG_LIMIT + 1);
    syncShowAlerts({
      shows: [show({ id: 'show-0', startDate: many[0].startDate, daysUntilStart: 1 })],
      prefs,
      now: noon,
      notify: () => false,
    });
    const log = readShowAlertLog();
    expect(log).toHaveLength(SHOW_ALERT_LOG_LIMIT);
    expect(log.some((row) => row.id.startsWith('show-0:'))).toBe(true);

    store.set(SHOW_ALERT_LOG_KEY, { bad: true });
    expect(readShowAlertLog()).toEqual([]);
    store.set(IN_APP_ALERTS_KEY, { bad: true });
    syncShowAlerts({ shows: [show()], prefs, now: noon, notify: () => false });
    expect(Array.isArray(store.get(IN_APP_ALERTS_KEY, null))).toBe(true);
  });

  it('uses the Notification API only when permission is already granted', () => {
    expect(notifyShowAlertInBrowser('Hi', 'Body', 'tag')).toBe(false);
    const seen: string[] = [];
    vi.stubGlobal('Notification', class {
      static permission: NotificationPermission = 'granted';
      constructor(title: string) {
        seen.push(title);
      }
    });
    expect(notifyShowAlertInBrowser('Show', 'Nearby', 'msi-show-alert:1')).toBe(true);
    expect(seen).toEqual(['Show']);
    vi.stubGlobal('Notification', class {
      static permission: NotificationPermission = 'granted';
      constructor() {
        throw new Error('blocked');
      }
    });
    expect(notifyShowAlertInBrowser('Show', 'Nearby', 'tag')).toBe(false);
    vi.stubGlobal('Notification', { permission: 'default' });
    expect(notifyShowAlertInBrowser('Show', 'Nearby', 'tag')).toBe(false);
  });
});
