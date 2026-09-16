import { beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import {
  DEFAULT_ALERT_PREFERENCES,
  setAlertPreferences,
} from '../../lib/utils/alertPreferences';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createContext, runInContext } from 'node:vm';
import {
  DEFAULT_WEB_PUSH_RECORD,
  WEB_PUSH_DISCLOSURE,
  WEB_PUSH_SERVER_DISCLOSURE,
  WEB_PUSH_SUBSCRIPTION_KEY,
  WEB_PUSH_SW_PREFS_CACHE,
  WEB_PUSH_SW_PREFS_MESSAGE,
  WEB_PUSH_SW_PREFS_URL,
  clearStoredWebPushSubscription,
  disableWebPushClient,
  enableWebPushClient,
  getStoredWebPushSubscription,
  hydrateWebPushDeliveryPrefs,
  initWebPushDeliveryPrefs,
  isWebPushSupported,
  normalizeWebPushRecord,
  persistWebPushDeliveryPrefs,
  readOptionalVapidPublicKey,
  setStoredWebPushSubscription,
  shouldDeliverWebPush,
  shouldOfferWebPush,
  snapshotWebPushSupport,
  toWebPushDeliveryPrefs,
  webPushStatusCopy,
  readBrowserPushEndpoint,
  readBrowserPushSubscription,
  pushKeysFromSubscription,
  fetchWebPushServerStatus,
  syncWebPushSubscriptionToServer,
  WEB_PUSH_SUBSCRIBE_PATH,
  type WebPushStatus,
} from '../../lib/utils/webPushSubscription';

describe('webPushSubscription', () => {
  beforeEach(() => {
    localStorage.clear();
    store.clear();
    vi.unstubAllGlobals();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 503,
        json: async () => ({ configured: false, code: 'VAPID_UNSET', error: 'Server VAPID is unset.' }),
      })),
    );
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
      (async () =>
        opts.endpoint
          ? {
              endpoint: opts.endpoint,
              unsubscribe: async () => true,
              getKey: (name: 'p256dh' | 'auth') =>
                name === 'p256dh' ? new Uint8Array([1, 2, 3]).buffer : new Uint8Array([4, 5, 6]).buffer,
            }
          : null);
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
    const posted = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ configured: true, persisted: false }),
    }));
    vi.stubGlobal('fetch', posted);
    const subscribed = await enableWebPushClient({ VITE_WEB_PUSH_VAPID_PUBLIC: 'pub' });
    expect(subscribed.status).toBe('subscribed');
    expect(subscribed.endpoint).toBe('https://push.example/live');
    expect(subscribed.vapidConfigured).toBe(true);
    expect(posted).toHaveBeenCalled();
    const postCall = posted.mock.calls.find((call) => (call[1] as RequestInit | undefined)?.method === 'POST');
    expect(String(postCall?.[1]?.body ?? '')).toMatch(/p256dh/);
    expect(pushKeysFromSubscription(null)).toEqual({});
    expect(await readBrowserPushSubscription()).toMatchObject({ endpoint: 'https://push.example/live' });

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

  it('syncs delivery prefs into Cache + SW postMessage so push can honor quiet hours', async () => {
    const put = vi.fn(async () => undefined);
    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({ put })),
    });
    const postMessage = vi.fn();
    vi.stubGlobal('navigator', {
      serviceWorker: {
        controller: { postMessage },
        ready: Promise.resolve({ active: { postMessage } }),
      },
    });

    const muted = setAlertPreferences({
      browserNotificationsEnabled: false,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    });
    const persisted = await persistWebPushDeliveryPrefs(muted);
    expect(persisted.browserNotificationsEnabled).toBe(false);
    expect(put).toHaveBeenCalled();
    const [, response] = put.mock.calls[0] as [string, Response];
    expect(JSON.parse(await response.text()).quietHoursEnabled).toBe(true);
    expect(postMessage).toHaveBeenCalledWith({
      type: WEB_PUSH_SW_PREFS_MESSAGE,
      prefs: persisted,
    });

    const hydrated = await hydrateWebPushDeliveryPrefs();
    expect(hydrated.browserNotificationsEnabled).toBe(false);
    expect(toWebPushDeliveryPrefs(muted).quietHoursStart).toBe('22:00');
    expect(toWebPushDeliveryPrefs().browserNotificationsEnabled).toBe(false);
  });

  it('initWebPushDeliveryPrefs seeds Cache and re-hydrates after SW ready', async () => {
    const put = vi.fn(async () => undefined);
    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({ put })),
    });
    const postMessage = vi.fn();
    vi.stubGlobal('navigator', {
      serviceWorker: {
        controller: { postMessage },
        ready: Promise.resolve({ active: { postMessage } }),
      },
    });
    await initWebPushDeliveryPrefs();
    expect(put.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(postMessage).toHaveBeenCalled();

    vi.stubGlobal('navigator', {
      serviceWorker: {
        ready: Promise.reject(new Error('no sw')),
      },
    });
    await expect(initWebPushDeliveryPrefs()).resolves.toMatchObject({
      quietHoursStart: '22:00',
    });

    vi.stubGlobal('navigator', {});
    await expect(initWebPushDeliveryPrefs()).resolves.toMatchObject({
      quietHoursStart: '22:00',
    });
  });

  it('can seed Cache before mount without waiting for serviceWorker.ready', async () => {
    const put = vi.fn(async () => undefined);
    vi.stubGlobal('caches', {
      open: vi.fn(async () => ({ put })),
    });
    let resolveReady: (value: { active: { postMessage: () => void } }) => void = () => undefined;
    vi.stubGlobal('navigator', {
      serviceWorker: {
        controller: { postMessage: vi.fn() },
        ready: new Promise((resolve) => {
          resolveReady = resolve;
        }),
      },
    });
    const seeded = await initWebPushDeliveryPrefs({ waitForServiceWorker: false });
    expect(seeded.quietHoursStart).toBe('22:00');
    expect(put).toHaveBeenCalled();
    resolveReady({ active: { postMessage: vi.fn() } });
  });

  it('persistWebPushDeliveryPrefs stays resilient when Cache or SW is unavailable', async () => {
    vi.stubGlobal('caches', {
      open: async () => {
        throw new Error('blocked');
      },
    });
    vi.stubGlobal('navigator', {
      serviceWorker: {
        controller: {
          postMessage: () => {
            throw new Error('no controller');
          },
        },
        ready: Promise.reject(new Error('no sw')),
      },
    });
    await expect(persistWebPushDeliveryPrefs()).resolves.toMatchObject({
      browserNotificationsEnabled: true,
    });

    vi.unstubAllGlobals();
    const payload = await persistWebPushDeliveryPrefs();
    expect(payload.quietHoursStart).toBe('22:00');
  });

  it('SW delivery gate suppresses quiet hours and browser-off before showNotification', () => {
    const gateSrc = readFileSync(path.join(process.cwd(), 'public/web-push-delivery-gate.js'), 'utf8');
    const swSrc = readFileSync(path.join(process.cwd(), 'public/sw.js'), 'utf8');
    expect(swSrc).toContain('importScripts(\'/web-push-delivery-gate.js\')');
    expect(swSrc).toContain('shouldDeliverWebPushNotification');
    expect(swSrc).toContain('WEB_PUSH_PREFS_CACHE');
    expect(swSrc).toContain('PREFS_URL');
    expect(gateSrc).toContain(WEB_PUSH_SW_PREFS_CACHE);
    expect(gateSrc).toContain(WEB_PUSH_SW_PREFS_URL);

    const sandbox: Record<string, unknown> = {};
    sandbox.self = sandbox;
    sandbox.globalThis = sandbox;
    runInContext(gateSrc, createContext(sandbox));
    const gate = sandbox.MSI_WEB_PUSH_GATE as {
      PREFS_CACHE: string;
      PREFS_MESSAGE_TYPE: string;
      shouldDeliverWebPushNotification: (now: Date, prefs: {
        browserNotificationsEnabled?: boolean;
        quietHoursEnabled?: boolean;
        quietHoursStart?: string;
        quietHoursEnd?: string;
      }) => boolean;
      normalizeWebPushDeliveryPrefs: (raw: unknown) => {
        browserNotificationsEnabled: boolean;
        quietHoursEnabled: boolean;
      };
    };

    expect(gate.PREFS_CACHE).toBe(WEB_PUSH_SW_PREFS_CACHE);
    expect(gate.PREFS_MESSAGE_TYPE).toBe(WEB_PUSH_SW_PREFS_MESSAGE);
    const night = new Date('2026-09-10T23:00:00');
    expect(gate.shouldDeliverWebPushNotification(night, {
      browserNotificationsEnabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    })).toBe(false);
    expect(gate.shouldDeliverWebPushNotification(night, {
      browserNotificationsEnabled: false,
      quietHoursEnabled: false,
    })).toBe(false);
    expect(gate.shouldDeliverWebPushNotification(new Date('2026-09-10T12:00:00'), {
      browserNotificationsEnabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    })).toBe(true);
    expect(gate.normalizeWebPushDeliveryPrefs(null).browserNotificationsEnabled).toBe(true);
    expect(gate.shouldDeliverWebPushNotification(new Date('2026-09-10T10:00:00'), {
      browserNotificationsEnabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '09:00',
      quietHoursEnd: '17:00',
    })).toBe(false);
    expect(gate.shouldDeliverWebPushNotification(new Date('2026-09-10T08:00:00'), {
      browserNotificationsEnabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '09:00',
      quietHoursEnd: '17:00',
    })).toBe(true);
    expect(gate.shouldDeliverWebPushNotification(new Date('2026-09-10T06:00:00'), {
      browserNotificationsEnabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
    })).toBe(false);
    expect(gate.shouldDeliverWebPushNotification(new Date('2026-09-10T12:00:00'), {
      browserNotificationsEnabled: true,
      quietHoursEnabled: true,
      quietHoursStart: '10:00',
      quietHoursEnd: '10:00',
    })).toBe(true);
  });

  it('probes /api/push/subscribe and refuses loudly when VAPID is unset', async () => {
    const fetcher = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({ configured: false, code: 'VAPID_UNSET', error: 'Server VAPID is unset.' }),
    })) as unknown as typeof fetch;
    const unset = await fetchWebPushServerStatus(fetcher);
    expect(unset.status).toBe('vapid_unset');
    expect(unset.configured).toBe(false);

    const ready = await fetchWebPushServerStatus(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ configured: true }),
    }) as Response);
    expect(ready.status).toBe('configured');

    const skipped = await fetchWebPushServerStatus(null);
    expect(skipped.status).toBe('skipped');

    const exploded = await fetchWebPushServerStatus(async () => {
      throw new Error('offline');
    });
    expect(exploded.status).toBe('error');
    expect(WEB_PUSH_SUBSCRIBE_PATH).toBe('/api/push/subscribe');
  });

  it('POSTs a local subscription only when VAPID keys and push keys are present', async () => {
    const record = { ...DEFAULT_WEB_PUSH_RECORD, endpoint: 'https://push.example/sub', status: 'subscribed' as const };
    const statusOnly = await syncWebPushSubscriptionToServer(record, {}, async () => ({
      ok: false,
      status: 503,
      json: async () => ({ configured: false, code: 'VAPID_UNSET' }),
    }) as unknown as typeof fetch);
    expect(statusOnly.status).toBe('vapid_unset');

    const posted = await syncWebPushSubscriptionToServer(
      record,
      { p256dh: 'pk', auth: 'ak' },
      async () => ({
        ok: true,
        status: 200,
        json: async () => ({ configured: true }),
      }) as unknown as typeof fetch,
    );
    expect(posted.status).toBe('accepted_scaffold');
    expect(posted.persisted).toBe(false);
    expect(posted.message).toMatch(/not persisted/i);

    const durable = await syncWebPushSubscriptionToServer(
      record,
      { p256dh: 'pk', auth: 'ak' },
      async () => ({
        ok: true,
        status: 200,
        json: async () => ({ configured: true, persisted: true, endpointStored: true }),
      }) as unknown as typeof fetch,
    );
    expect(durable.status).toBe('configured');
    expect(durable.persisted).toBe(true);

    const missing = await syncWebPushSubscriptionToServer({ ...DEFAULT_WEB_PUSH_RECORD });
    expect(missing.status).toBe('skipped');

    const rejected = await syncWebPushSubscriptionToServer(
      record,
      { p256dh: 'pk', auth: 'ak' },
      async () => ({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid push subscription' }),
      }) as unknown as typeof fetch,
    );
    expect(rejected.status).toBe('error');

    const boom = await syncWebPushSubscriptionToServer(
      record,
      { p256dh: 'pk', auth: 'ak' },
      async () => {
        throw new Error('offline');
      },
    );
    expect(boom.status).toBe('error');

    const oddStatus = await fetchWebPushServerStatus(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ configured: false, error: 'not ready' }),
    }) as Response);
    expect(oddStatus.status).toBe('error');

    const viaDefault = await fetchWebPushServerStatus();
    expect(viaDefault.status).toBe('vapid_unset');

    const badJson = await fetchWebPushServerStatus(async () => ({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('no json');
      },
    }) as Response);
    expect(badJson.status).toBe('error');

    const refused = await syncWebPushSubscriptionToServer(
      record,
      { p256dh: 'pk', auth: 'ak' },
      async () => ({
        ok: false,
        status: 503,
        json: async () => ({ code: 'VAPID_UNSET' }),
      }) as unknown as typeof fetch,
    );
    expect(refused.status).toBe('vapid_unset');

    vi.stubGlobal('fetch', undefined);
    const noFetch = await syncWebPushSubscriptionToServer(record, { p256dh: 'pk', auth: 'ak' });
    expect(noFetch.status).toBe('skipped');
    expect(WEB_PUSH_SERVER_DISCLOSURE).toMatch(/VAPID_UNSET/);
  });
});
