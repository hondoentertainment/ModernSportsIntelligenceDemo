/**
 * Priority 2.2 remainder — client-side Web Push readiness.
 * Persists a Push subscription endpoint via MSI store when the browser already
 * has one. Does not invent VAPID secrets — server-triggered push remains owner-held.
 */
import { store } from '../dal/syncStore';
import {
  getAlertPreferences,
  isWithinQuietHours,
  shouldFireBrowserNotification,
  subscribeAlertPreferences,
  type AlertPreferences,
} from './alertPreferences';

export const WEB_PUSH_SUBSCRIPTION_KEY = 'msi_web_push_subscription_v1';
export const WEB_PUSH_SW_PREFS_CACHE = 'msi-web-push-prefs-v1';
export const WEB_PUSH_SW_PREFS_URL = '/__msi_web_push_prefs';
export const WEB_PUSH_SW_PREFS_MESSAGE = 'MSI_WEB_PUSH_PREFS';

export interface WebPushDeliveryPrefs {
  browserNotificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export type WebPushStatus =
  | 'unsupported'
  | 'denied'
  | 'permission_needed'
  | 'ready_local'
  | 'subscribed';

export interface WebPushSubscriptionRecord {
  endpoint: string | null;
  permission: NotificationPermission | 'unsupported';
  supported: boolean;
  vapidConfigured: boolean;
  subscribedAt: string | null;
  status: WebPushStatus;
}

export const WEB_PUSH_DISCLOSURE =
  'Client Web Push readiness only. This device can request permission and remember a browser subscription endpoint locally. Server-triggered push still needs owner-held VAPID keys and a backend — none are stored in this repo.';

export const DEFAULT_WEB_PUSH_RECORD: WebPushSubscriptionRecord = {
  endpoint: null,
  permission: 'unsupported',
  supported: false,
  vapidConfigured: false,
  subscribedAt: null,
  status: 'unsupported',
};

export function isWebPushSupported(
  nav: Pick<Navigator, 'serviceWorker'> | undefined = typeof navigator === 'undefined' ? undefined : navigator,
  win: { PushManager?: unknown; Notification?: unknown } | undefined = typeof window === 'undefined' ? undefined : window,
): boolean {
  return Boolean(nav && 'serviceWorker' in nav && win && 'PushManager' in win && 'Notification' in win);
}

export function readOptionalVapidPublicKey(
  env: Record<string, string | undefined> = (typeof import.meta !== 'undefined'
    ? (import.meta.env as Record<string, string | undefined>)
    : {}),
): string | null {
  const raw = env.VITE_WEB_PUSH_VAPID_PUBLIC;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeWebPushRecord(raw: unknown): WebPushSubscriptionRecord {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_WEB_PUSH_RECORD };
  const o = raw as Partial<WebPushSubscriptionRecord>;
  const status: WebPushStatus = [
    'unsupported',
    'denied',
    'permission_needed',
    'ready_local',
    'subscribed',
  ].includes(o.status as string)
    ? (o.status as WebPushStatus)
    : 'unsupported';
  return {
    endpoint: typeof o.endpoint === 'string' && o.endpoint.trim() ? o.endpoint.trim() : null,
    permission:
      o.permission === 'granted' || o.permission === 'denied' || o.permission === 'default' || o.permission === 'unsupported'
        ? o.permission
        : 'unsupported',
    supported: Boolean(o.supported),
    vapidConfigured: Boolean(o.vapidConfigured),
    subscribedAt: typeof o.subscribedAt === 'string' ? o.subscribedAt : null,
    status,
  };
}

export function getStoredWebPushSubscription(): WebPushSubscriptionRecord {
  return normalizeWebPushRecord(store.get<unknown>(WEB_PUSH_SUBSCRIPTION_KEY, null));
}

export function setStoredWebPushSubscription(
  partial: Partial<WebPushSubscriptionRecord>,
): WebPushSubscriptionRecord {
  const next = normalizeWebPushRecord({ ...getStoredWebPushSubscription(), ...partial });
  store.set(WEB_PUSH_SUBSCRIPTION_KEY, next);
  return next;
}

export function clearStoredWebPushSubscription(): void {
  store.remove(WEB_PUSH_SUBSCRIPTION_KEY);
}

export function shouldOfferWebPush(
  now: Date = new Date(),
  prefs: AlertPreferences = getAlertPreferences(),
  supported: boolean = isWebPushSupported(),
): boolean {
  if (!supported) return false;
  if (!prefs.browserNotificationsEnabled) return false;
  if (isWithinQuietHours(now, prefs)) return false;
  return true;
}

export function shouldDeliverWebPush(
  now: Date = new Date(),
  prefs: AlertPreferences = getAlertPreferences(),
): boolean {
  return shouldFireBrowserNotification(now, prefs);
}

export function toWebPushDeliveryPrefs(
  prefs: AlertPreferences = getAlertPreferences(),
): WebPushDeliveryPrefs {
  return {
    browserNotificationsEnabled: prefs.browserNotificationsEnabled,
    quietHoursEnabled: prefs.quietHoursEnabled,
    quietHoursStart: prefs.quietHoursStart,
    quietHoursEnd: prefs.quietHoursEnd,
  };
}

async function postWebPushPrefsToServiceWorker(prefs: WebPushDeliveryPrefs): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const message = { type: WEB_PUSH_SW_PREFS_MESSAGE, prefs };
  try {
    navigator.serviceWorker.controller?.postMessage(message);
  } catch {
    // Controller may be missing before the first SW claims the page.
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage(message);
  } catch {
    // Ready can reject when no SW is registered (jsdom / unsupported browsers).
  }
}

export async function persistWebPushDeliveryPrefs(
  prefs: AlertPreferences = getAlertPreferences(),
): Promise<WebPushDeliveryPrefs> {
  const payload = toWebPushDeliveryPrefs(prefs);
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open(WEB_PUSH_SW_PREFS_CACHE);
      await cache.put(
        WEB_PUSH_SW_PREFS_URL,
        new Response(JSON.stringify(payload), {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    } catch {
      // Cache API can throw in private mode or when SW storage is blocked.
    }
  }
  await postWebPushPrefsToServiceWorker(payload);
  return payload;
}

export async function hydrateWebPushDeliveryPrefs(): Promise<WebPushDeliveryPrefs> {
  return persistWebPushDeliveryPrefs(getAlertPreferences());
}

/** App-startup seed so quiet hours / browser-off apply before settings mount. */
export async function initWebPushDeliveryPrefs(): Promise<WebPushDeliveryPrefs> {
  const first = await hydrateWebPushDeliveryPrefs();
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return first;
  try {
    await navigator.serviceWorker.ready;
    return hydrateWebPushDeliveryPrefs();
  } catch {
    // No SW registered yet (dev / jsdom). Cache write above still seeds prefs.
    return first;
  }
}

subscribeAlertPreferences((prefs) => {
  void persistWebPushDeliveryPrefs(prefs);
});

function permissionOf(): NotificationPermission | 'unsupported' {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

export function snapshotWebPushSupport(
  env?: Record<string, string | undefined>,
): WebPushSubscriptionRecord {
  const supported = isWebPushSupported();
  const permission = permissionOf();
  const vapidConfigured = Boolean(readOptionalVapidPublicKey(env));
  const stored = getStoredWebPushSubscription();
  if (!supported) {
    return {
      ...DEFAULT_WEB_PUSH_RECORD,
      endpoint: stored.endpoint,
      subscribedAt: stored.subscribedAt,
    };
  }
  let status: WebPushStatus = 'permission_needed';
  if (permission === 'denied') status = 'denied';
  else if (permission === 'granted' && stored.endpoint) status = 'subscribed';
  else if (permission === 'granted') status = 'ready_local';
  return {
    endpoint: stored.endpoint,
    permission,
    supported: true,
    vapidConfigured,
    subscribedAt: stored.subscribedAt,
    status,
  };
}

export async function readBrowserPushEndpoint(): Promise<string | null> {
  if (!isWebPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    return existing?.endpoint ?? null;
  } catch {
    return null;
  }
}

/**
 * Client readiness path. Requests Notification permission and remembers any
 * existing Push subscription endpoint. Does not call subscribe() without a
 * real owner-held VAPID public key.
 */
export async function enableWebPushClient(
  env?: Record<string, string | undefined>,
): Promise<WebPushSubscriptionRecord> {
  if (!isWebPushSupported()) {
    return setStoredWebPushSubscription({ ...DEFAULT_WEB_PUSH_RECORD });
  }

  let permission: NotificationPermission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch {
      permission = Notification.permission;
    }
  }

  const vapidConfigured = Boolean(readOptionalVapidPublicKey(env));
  const endpoint = await readBrowserPushEndpoint();
  const subscribedAt = endpoint ? new Date().toISOString() : getStoredWebPushSubscription().subscribedAt;

  let status: WebPushStatus = 'permission_needed';
  if (permission === 'denied') status = 'denied';
  else if (permission === 'granted' && endpoint) status = 'subscribed';
  else if (permission === 'granted') status = 'ready_local';

  const record = setStoredWebPushSubscription({
    endpoint,
    permission,
    supported: true,
    vapidConfigured,
    subscribedAt: permission === 'granted' ? subscribedAt ?? new Date().toISOString() : subscribedAt,
    status,
  });
  await persistWebPushDeliveryPrefs();
  return record;
}

export async function disableWebPushClient(): Promise<WebPushSubscriptionRecord> {
  if (isWebPushSupported()) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      await existing?.unsubscribe();
    } catch {
      // Browser may reject unsubscribe when no VAPID-backed subscription exists.
    }
  }
  const record = setStoredWebPushSubscription({
    endpoint: null,
    subscribedAt: null,
    status: isWebPushSupported()
      ? permissionOf() === 'denied'
        ? 'denied'
        : 'permission_needed'
      : 'unsupported',
    permission: permissionOf(),
    supported: isWebPushSupported(),
    vapidConfigured: Boolean(readOptionalVapidPublicKey()),
  });
  await persistWebPushDeliveryPrefs();
  return record;
}

export function webPushStatusCopy(record: WebPushSubscriptionRecord): string {
  switch (record.status) {
    case 'unsupported':
      return 'This browser does not expose the Push API. On-device notifications can still fire when allowed.';
    case 'denied':
      return 'Notification permission is blocked. Enable it in the browser to continue the client readiness path.';
    case 'permission_needed':
      return 'Enable to request permission and remember a local subscription endpoint. Server push still needs owner VAPID keys.';
    case 'ready_local':
      return record.vapidConfigured
        ? 'Permission granted. No browser subscription endpoint yet — owner VAPID can complete subscribe later.'
        : 'Permission granted on this device. No VAPID key in env, so server-triggered push is not armed.';
    case 'subscribed':
      return 'Browser subscription endpoint stored locally. Server-triggered delivery still needs owner-held VAPID + backend.';
    default:
      return WEB_PUSH_DISCLOSURE;
  }
}
