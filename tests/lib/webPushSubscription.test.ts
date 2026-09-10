import { beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import {
  DEFAULT_ALERT_PREFERENCES,
  setAlertPreferences,
} from '../../lib/utils/alertPreferences';
import {
  DEFAULT_WEB_PUSH_RECORD,
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
  readBrowserPushEndpoint,
  type WebPushStatus,
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
    expect(typeof shouldOfferWebPush()).toBe('boolean');
    expect(typeof shouldDeliverWebPush()).toBe('boolean');
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

  it('copies every status honestly including VAPID-ready local', () => {
    expect(webPushStatusCopy({ ...DEFAULT_WEB_PUSH_RECORD, status: 'denied' })).toMatch(/blocked/i);
    expect(webPushStatusCopy({ ...DEFAULT_WEB_PUSH_RECORD, status: 'permission_needed' })).toMatch(/owner VAPID/i);
    expect(webPushStatusCopy({ ...DEFAULT_WEB_PUSH_RECORD, status: 'ready_local', vapidConfigured: true })).toMatch(/owner VAPID can complete/i);
    expect(webPushStatusCopy({ ...DEFAULT_WEB_PUSH_RECORD, status: 'subscribed' })).toMatch(/endpoint stored/i);
    expect(webPushStatusCopy({ ...DEFAULT_WEB_PUSH_RECORD, status: 'nope' as WebPushStatus })).toMatch(/owner-held VAPID/i);
    expect(normalizeWebPushRecord({ status: 'denied', permission: 'denied', supported: true }).status).toBe('denied');
    expect(normalizeWebPushRecord({ endpoint: 12, permission: 'maybe' }).permission).toBe('unsupported');
  });

  function stubPush(opts: {
    permission: NotificationPermission;
    endpoint?: string | null;
    requestPermission?: () => Promise<NotificationPermission>;
    getSubscription?: () => Promise<{ endpoint: string; unsubscribe?: () => Promise<boolean> } | null>;
    readyReject?: boolean;
  }) {
    const requestPermission = opts.requestPermission ?? vi.fn(async () => opts.permission);
    vi.stubGlobal('Notification', { permission: opts.permission, requestPermission });
    const getSubscription =
      opts.getSubscription ??
      (async () => (opts.endpoint ? { endpoint: opts.endpoint, unsubscribe: async () => true } : null));
    vi.stubGlobal('navigator', {
      serviceWorker: {
        ready: opts.readyReject
          ? Promise.reject(new Error('no sw'))
          : Promise.resolve({ pushManager: { getSubscription } }),
      },
    });
    vi.stubGlobal('window', { PushManager: function PushManager() {}, Notification: true });
    return { requestPermission };
  }

  it('snapshots granted+stored endpoint as subscribed and denied as denied', () => {
    stubPush({ permission: 'granted' });
    setStoredWebPushSubscription({ endpoint: 'https://push.example/a', status: 'subscribed' });
    const granted = snapshotWebPushSupport({ VITE_WEB_PUSH_VAPID_PUBLIC: 'pub' });
    expect(granted.status).toBe('subscribed');
    expect(granted.vapidConfigured).toBe(true);

    stubPush({ permission: 'denied' });
    expect(snapshotWebPushSupport({}).status).toBe('denied');

    stubPush({ permission: 'default' });
    expect(snapshotWebPushSupport({}).status).toBe('permission_needed');
  });

  it('enableWebPushClient records denied, subscribed, and request failures', async () => {
    stubPush({ permission: 'denied' });
    expect((await enableWebPushClient({})).status).toBe('denied');

    stubPush({
      permission: 'granted',
      endpoint: 'https://push.example/live',
    });
    const subscribed = await enableWebPushClient({ VITE_WEB_PUSH_VAPID_PUBLIC: 'pub' });
    expect(subscribed.status).toBe('subscribed');
    expect(subscribed.endpoint).toBe('https://push.example/live');
    expect(subscribed.vapidConfigured).toBe(true);

    stubPush({
      permission: 'default',
      requestPermission: async () => {
        throw new Error('blocked');
      },
    });
    vi.stubGlobal('Notification', {
      permission: 'default',
      requestPermission: async () => {
        throw new Error('blocked');
      },
    });
    const failed = await enableWebPushClient({});
    expect(['permission_needed', 'denied', 'ready_local']).toContain(failed.status);
  });

  it('readBrowserPushEndpoint and disable handle missing or failing PushManager', async () => {
    expect(await readBrowserPushEndpoint()).toBeNull();
    stubPush({ permission: 'granted', readyReject: true });
    expect(await readBrowserPushEndpoint()).toBeNull();

    stubPush({
      permission: 'denied',
      getSubscription: async () => {
        throw new Error('no sub');
      },
    });
    const disabled = await disableWebPushClient();
    expect(disabled.endpoint).toBeNull();
    expect(disabled.status).toBe('denied');

    stubPush({
      permission: 'granted',
      endpoint: 'https://push.example/bye',
    });
    const cleared = await disableWebPushClient();
    expect(cleared.status).toBe('permission_needed');
  });
});
