import { beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import {
  DEFAULT_ALERT_PREFERENCES,
  setAlertPreferences,
} from '../../lib/utils/alertPreferences';
import {
  WEB_PUSH_DISCLOSURE,
  WEB_PUSH_SUBSCRIPTION_KEY,
  clearStoredWebPushSubscription,
  disableWebPushClient,
  enableWebPushClient,
  getStoredWebPushSubscription,
  isWebPushSupported,
  normalizeWebPushRecord,
  readOptionalVapidPublicKey,
  setStoredWebPushSubscription,
  shouldDeliverWebPush,
  shouldOfferWebPush,
  snapshotWebPushSupport,
  webPushStatusCopy,
} from '../../lib/utils/webPushSubscription';

describe('webPushSubscription', () => {
  beforeEach(() => {
    localStorage.clear();
    store.clear();
    vi.unstubAllGlobals();
  });

  it('normalizes junk and never invents a VAPID secret', () => {
    expect(normalizeWebPushRecord(null)).toEqual({
      endpoint: null,
      permission: 'unsupported',
      supported: false,
      vapidConfigured: false,
      subscribedAt: null,
      status: 'unsupported',
    });
    expect(readOptionalVapidPublicKey({})).toBeNull();
    expect(readOptionalVapidPublicKey({ VITE_WEB_PUSH_VAPID_PUBLIC: '  ' })).toBeNull();
    expect(readOptionalVapidPublicKey({ VITE_WEB_PUSH_VAPID_PUBLIC: 'owner-public' })).toBe('owner-public');
    expect(WEB_PUSH_DISCLOSURE).toMatch(/owner-held VAPID/i);
    expect(WEB_PUSH_DISCLOSURE).not.toMatch(/BEGIN PRIVATE/i);
  });

  it('persists a local endpoint and reports client-ready status', () => {
    const saved = setStoredWebPushSubscription({
      endpoint: 'https://push.example/sub',
      permission: 'granted',
      supported: true,
      status: 'subscribed',
      subscribedAt: '2026-09-10T00:00:00.000Z',
    });
    expect(saved.endpoint).toBe('https://push.example/sub');
    expect(getStoredWebPushSubscription().status).toBe('subscribed');
    expect(store.get(WEB_PUSH_SUBSCRIPTION_KEY, null)?.endpoint).toBe('https://push.example/sub');
    clearStoredWebPushSubscription();
    expect(getStoredWebPushSubscription().endpoint).toBeNull();
  });

  it('gates offer/delivery with quiet hours and browser prefs', () => {
    expect(shouldOfferWebPush(new Date(), DEFAULT_ALERT_PREFERENCES, false)).toBe(false);
    const quiet = setAlertPreferences({
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      browserNotificationsEnabled: true,
    });
    expect(shouldOfferWebPush(new Date('2026-09-10T23:00:00'), quiet, true)).toBe(false);
    expect(shouldDeliverWebPush(new Date('2026-09-10T23:00:00'), quiet)).toBe(false);
    const open = setAlertPreferences({ quietHoursEnabled: false, browserNotificationsEnabled: true });
    expect(shouldOfferWebPush(new Date('2026-09-10T12:00:00'), open, true)).toBe(true);
    const muted = setAlertPreferences({ browserNotificationsEnabled: false });
    expect(shouldOfferWebPush(new Date(), muted, true)).toBe(false);
  });

  it('enableWebPushClient no-ops when Push API is missing', async () => {
    expect(isWebPushSupported(undefined, undefined)).toBe(false);
    const record = await enableWebPushClient();
    expect(record.status).toBe('unsupported');
    expect(record.endpoint).toBeNull();
    expect(webPushStatusCopy(record)).toMatch(/does not expose the Push API/i);
  });

  it('enableWebPushClient stores a granted ready_local snapshot without inventing subscribe', async () => {
    const requestPermission = vi.fn(async () => 'granted' as NotificationPermission);
    vi.stubGlobal('Notification', { permission: 'default', requestPermission });
    vi.stubGlobal('navigator', {
      serviceWorker: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: async () => null,
            subscribe: async () => {
              throw new Error('subscribe must not run without VAPID');
            },
          },
        }),
      },
    });
    vi.stubGlobal('window', { PushManager: function PushManager() {}, Notification: true });

    const record = await enableWebPushClient({});
    expect(requestPermission).toHaveBeenCalled();
    expect(record.status).toBe('ready_local');
    expect(record.endpoint).toBeNull();
    expect(record.vapidConfigured).toBe(false);
    expect(webPushStatusCopy(record)).toMatch(/No VAPID key/i);
  });

  it('snapshot and disable stay honest when unsupported', async () => {
    const snap = snapshotWebPushSupport({});
    expect(snap.status).toBe('unsupported');
    const cleared = await disableWebPushClient();
    expect(cleared.endpoint).toBeNull();
  });
});
