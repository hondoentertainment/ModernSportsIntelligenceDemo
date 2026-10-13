/**
 * In-app alerts for seeded local card shows.
 * Home, radius, and lead time stay on this device. Browser delivery follows
 * existing alert prefs (quiet hours, browser notifications, haptics). Server
 * Web Push still needs owner-held VAPID keys — this module does not add any
 * and does not read or flip VITE_FF_REAL_* flags.
 */
import { z } from 'zod';
import type { Alert } from '../../types';
import { store } from '../dal/syncStore';
import {
  IN_APP_ALERTS_KEY,
  IN_APP_ALERTS_UPDATED_EVENT,
  getAlertPreferences,
  isWithinQuietHours,
  shouldFireHaptic,
  type AlertPreferences,
} from '../utils/alertPreferences';
import { vibrateIfAvailable } from '../utils/haptics';
import { shouldDeliverWebPush } from '../utils/webPushSubscription';
import {
  LOCAL_CARD_SHOW_CATALOG,
  distanceMiles,
  type LocalCardShow,
  type ResolvedLocalCardShow,
} from './localCardShowCatalog';

export const SHOW_ALERT_PREFS_KEY = 'msi_show_alert_prefs_v1';
export const SHOW_ALERT_LOG_KEY = 'msi_show_alert_log_v1';

export const MIN_RADIUS_MILES = 5;
export const MAX_RADIUS_MILES = 500;
export const DEFAULT_RADIUS_MILES = 50;
export const MIN_LEAD_DAYS = 1;
export const MAX_LEAD_DAYS = 366;
export const DEFAULT_LEAD_DAYS = 14;
export const SHOW_ALERT_LOG_LIMIT = 40;
export const INBOX_LIMIT = 50;

export const SHOW_ALERT_DISCLOSURE =
  'In-app alerts use this seeded calendar and a home point you set. They are not a promoter feed. Browser delivery follows your existing alert prefs (quiet hours and browser notifications). Server Web Push still needs owner-held VAPID keys — this desk does not add any. Not live Market Movers or Sports Card Investor parity.';

const HomeSchema = z.object({
  label: z.string().trim().min(1).max(80),
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
}).strict();

export const ShowAlertPrefsSchema = z.object({
  enabled: z.boolean(),
  home: HomeSchema.nullable(),
  radiusMiles: z.number().int().gte(MIN_RADIUS_MILES).lte(MAX_RADIUS_MILES),
  leadDays: z.number().int().gte(MIN_LEAD_DAYS).lte(MAX_LEAD_DAYS),
}).strict();

export type ShowAlertPrefs = z.infer<typeof ShowAlertPrefsSchema>;
export type ShowAlertHome = NonNullable<ShowAlertPrefs['home']>;

export const DEFAULT_SHOW_ALERT_PREFS: ShowAlertPrefs = {
  enabled: false,
  home: null,
  radiusMiles: DEFAULT_RADIUS_MILES,
  leadDays: DEFAULT_LEAD_DAYS,
};

export interface ShowAlertHit {
  show: ResolvedLocalCardShow;
  distanceMiles: number;
}

export interface ShowAlertRecord {
  id: string;
  showId: string;
  showName: string;
  venue: string;
  city: string;
  state: string;
  startDate: string;
  daysUntilStart: number;
  distanceMiles: number;
  title: string;
  description: string;
  recordedAt: string;
  isRead: boolean;
  pushDelivered: boolean;
}

export interface ShowAlertSyncResult {
  active: ShowAlertRecord[];
  created: ShowAlertRecord[];
  deliveryNote: string;
  browserNotified: number;
}

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function asFinite(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function coerceHome(raw: unknown): ShowAlertHome | null {
  if (!raw || typeof raw !== 'object') return null;
  const home = raw as Record<string, unknown>;
  const lat = asFinite(home.lat);
  const lng = asFinite(home.lng);
  const label = typeof home.label === 'string' ? home.label.trim().slice(0, 80) : '';
  if (!label || lat == null || lng == null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { label, lat, lng };
}

export function normalizeShowAlertPrefs(raw: unknown): ShowAlertPrefs {
  const source = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const radius = asFinite(source.radiusMiles);
  const lead = asFinite(source.leadDays);
  const coerced: ShowAlertPrefs = {
    enabled: source.enabled === true,
    home: coerceHome(source.home),
    radiusMiles: radius == null ? DEFAULT_RADIUS_MILES : clampInt(radius, MIN_RADIUS_MILES, MAX_RADIUS_MILES),
    leadDays: lead == null ? DEFAULT_LEAD_DAYS : clampInt(lead, MIN_LEAD_DAYS, MAX_LEAD_DAYS),
  };
  const parsed = ShowAlertPrefsSchema.safeParse(coerced);
  return parsed.success ? parsed.data : { ...DEFAULT_SHOW_ALERT_PREFS };
}

export function getShowAlertPrefs(): ShowAlertPrefs {
  return normalizeShowAlertPrefs(store.get<unknown>(SHOW_ALERT_PREFS_KEY, null));
}

export function setShowAlertPrefs(partial: Partial<ShowAlertPrefs>): ShowAlertPrefs {
  const next = normalizeShowAlertPrefs({ ...getShowAlertPrefs(), ...partial });
  store.set(SHOW_ALERT_PREFS_KEY, next);
  return next;
}

export function listShowHomePresets(shows: readonly LocalCardShow[] = LOCAL_CARD_SHOW_CATALOG): ShowAlertHome[] {
  const seen = new Set<string>();
  const rows: ShowAlertHome[] = [];
  for (const show of shows) {
    const label = `${show.city}, ${show.state}`.slice(0, 80);
    if (seen.has(label)) continue;
    seen.add(label);
    rows.push({ label, lat: show.lat, lng: show.lng });
  }
  return rows.sort((a, b) => a.label.localeCompare(b.label));
}

export function showsInAlertWindow(shows: readonly ResolvedLocalCardShow[], prefs: ShowAlertPrefs): ShowAlertHit[] {
  if (!prefs.enabled || !prefs.home) return [];
  const home = prefs.home;
  const rows: ShowAlertHit[] = [];
  for (const show of shows) {
    if (show.daysUntilStart < 0 || show.daysUntilStart > prefs.leadDays) continue;
    const miles = distanceMiles(home, { lat: show.lat, lng: show.lng });
    if (miles > prefs.radiusMiles) continue;
    rows.push({ show, distanceMiles: miles });
  }
  return rows.sort((a, b) => (
    a.show.daysUntilStart - b.show.daysUntilStart
    || a.distanceMiles - b.distanceMiles
    || a.show.name.localeCompare(b.show.name)
  ));
}

function titleFor(show: ResolvedLocalCardShow): string {
  if (show.daysUntilStart <= 0 || show.status === 'in-progress') {
    return `Card show open now: ${show.name}`;
  }
  if (show.daysUntilStart === 1) return `Card show tomorrow: ${show.name}`;
  return `Card show in ${show.daysUntilStart} days: ${show.name}`;
}

function describeShowAlert(show: ResolvedLocalCardShow, miles: number, prefs: ShowAlertPrefs): string {
  const home = prefs.home?.label ?? 'home';
  return `${show.venue}, ${show.city}, ${show.state} · ${miles.toFixed(1)} mi from ${home} · inside ${prefs.radiusMiles} mi and ${prefs.leadDays} days. Seeded calendar, not a promoter feed.`;
}

function alertId(show: ResolvedLocalCardShow): string {
  return `${show.id}:${show.startDate}`;
}

export function inboxIdForShowAlert(id: string): string {
  return `show-alert:${id}`;
}

function isRecord(value: unknown): value is ShowAlertRecord {
  if (!value || typeof value !== 'object') return false;
  const row = value as Partial<ShowAlertRecord>;
  return typeof row.id === 'string'
    && typeof row.showId === 'string'
    && typeof row.showName === 'string'
    && typeof row.title === 'string'
    && typeof row.description === 'string'
    && typeof row.recordedAt === 'string'
    && typeof row.startDate === 'string';
}

export function readShowAlertLog(): ShowAlertRecord[] {
  const raw = store.get<unknown>(SHOW_ALERT_LOG_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isRecord).map((row) => ({
    ...row,
    venue: typeof row.venue === 'string' ? row.venue : '',
    city: typeof row.city === 'string' ? row.city : '',
    state: typeof row.state === 'string' ? row.state : '',
    daysUntilStart: typeof row.daysUntilStart === 'number' && Number.isFinite(row.daysUntilStart) ? row.daysUntilStart : 0,
    distanceMiles: typeof row.distanceMiles === 'number' && Number.isFinite(row.distanceMiles) ? row.distanceMiles : 0,
    isRead: row.isRead === true,
    pushDelivered: row.pushDelivered === true,
  }));
}

function trimLog(records: ShowAlertRecord[], activeIds: ReadonlySet<string>): ShowAlertRecord[] {
  const active = records.filter((row) => activeIds.has(row.id));
  const rest = records.filter((row) => !activeIds.has(row.id));
  const room = Math.max(0, SHOW_ALERT_LOG_LIMIT - active.length);
  return [...active, ...rest.slice(0, room)];
}

function readInbox(): Alert[] {
  const raw = store.get<unknown>(IN_APP_ALERTS_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter((row): row is Alert => {
    if (!row || typeof row !== 'object') return false;
    return typeof (row as Alert).id === 'string' && typeof (row as Alert).title === 'string';
  });
}

function publishInbox(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(IN_APP_ALERTS_UPDATED_EVENT));
}

function appendInbox(created: ShowAlertRecord[], nowIso: string): void {
  if (created.length === 0) return;
  const existing = readInbox();
  const ids = new Set(existing.map((row) => row.id));
  const fresh: Alert[] = [];
  for (const row of created) {
    const id = inboxIdForShowAlert(row.id);
    if (ids.has(id)) continue;
    fresh.push({
      id,
      type: 'system',
      title: row.title,
      description: row.description,
      timestamp: nowIso,
      isRead: false,
      priority: row.daysUntilStart <= 2 ? 'high' : 'medium',
      actionUrl: '/local-card-shows',
      relatedId: row.showId,
      metadata: {
        kind: 'show-alert',
        showId: row.showId,
        startDate: row.startDate,
        distanceMiles: row.distanceMiles,
      },
    });
  }
  if (fresh.length === 0) return;
  store.set(IN_APP_ALERTS_KEY, [...fresh, ...existing].slice(0, INBOX_LIMIT));
  publishInbox();
}

export function showAlertDeliveryNote(
  now: Date = new Date(),
  prefs: AlertPreferences = getAlertPreferences(),
): string {
  const vapid = 'Server Web Push still needs owner-held VAPID keys — none are stored here.';
  if (!prefs.browserNotificationsEnabled) {
    return `In-app alerts still record. Browser notifications are off, so delivery stays on this page. ${vapid}`;
  }
  if (isWithinQuietHours(now, prefs)) {
    return `In-app alerts still record. Quiet hours suppress browser notifications and Web Push delivery. ${vapid}`;
  }
  return `Browser notifications can fire for a new show when this browser has already granted permission. ${vapid}`;
}

export function notifyShowAlertInBrowser(title: string, body: string, tag: string): boolean {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission !== 'granted') return false;
  try {
    new Notification(title, { body, tag });
    return true;
  } catch {
    return false;
  }
}

function toRecord(hit: ShowAlertHit, prefs: ShowAlertPrefs, nowIso: string, pushDelivered: boolean): ShowAlertRecord {
  const { show, distanceMiles: miles } = hit;
  return {
    id: alertId(show),
    showId: show.id,
    showName: show.name,
    venue: show.venue,
    city: show.city,
    state: show.state,
    startDate: show.startDate,
    daysUntilStart: show.daysUntilStart,
    distanceMiles: miles,
    title: titleFor(show),
    description: describeShowAlert(show, miles, prefs),
    recordedAt: nowIso,
    isRead: false,
    pushDelivered,
  };
}

export function syncShowAlerts(input: {
  shows: readonly ResolvedLocalCardShow[];
  prefs?: ShowAlertPrefs;
  now?: Date;
  notify?: (title: string, body: string, tag: string) => boolean;
}): ShowAlertSyncResult {
  const prefs = input.prefs ?? getShowAlertPrefs();
  const now = input.now ?? new Date();
  const alertPrefs = getAlertPreferences();
  const deliveryNote = showAlertDeliveryNote(now, alertPrefs);
  const windowRows = showsInAlertWindow(input.shows, prefs);
  const byId = new Map(readShowAlertLog().map((row) => [row.id, row]));
  const created: ShowAlertRecord[] = [];
  const active: ShowAlertRecord[] = [];
  const deliver = shouldDeliverWebPush(now, alertPrefs);
  const notify = input.notify ?? notifyShowAlertInBrowser;
  const nowIso = now.toISOString();

  for (const hit of windowRows) {
    const id = alertId(hit.show);
    const prior = byId.get(id);
    if (prior) {
      const updated: ShowAlertRecord = {
        ...prior,
        showName: hit.show.name,
        venue: hit.show.venue,
        city: hit.show.city,
        state: hit.show.state,
        daysUntilStart: hit.show.daysUntilStart,
        distanceMiles: hit.distanceMiles,
        title: titleFor(hit.show),
        description: describeShowAlert(hit.show, hit.distanceMiles, prefs),
      };
      byId.set(id, updated);
      active.push(updated);
      continue;
    }
    const pushDelivered = deliver && notify(titleFor(hit.show), describeShowAlert(hit.show, hit.distanceMiles, prefs), `msi-show-alert:${id}`);
    const record = toRecord(hit, prefs, nowIso, pushDelivered);
    byId.set(id, record);
    created.push(record);
    active.push(record);
  }

  const activeIds = new Set(active.map((row) => row.id));
  store.set(SHOW_ALERT_LOG_KEY, trimLog([...byId.values()], activeIds));
  appendInbox(created, nowIso);
  if (created.length > 0 && shouldFireHaptic(now, alertPrefs)) {
    vibrateIfAvailable();
  }

  return {
    active,
    created,
    deliveryNote,
    browserNotified: created.filter((row) => row.pushDelivered).length,
  };
}

export function markShowAlertRead(id: string): ShowAlertRecord[] {
  const next = readShowAlertLog().map((row) => (row.id === id ? { ...row, isRead: true } : row));
  store.set(SHOW_ALERT_LOG_KEY, next);
  const inboxId = inboxIdForShowAlert(id);
  const inbox = readInbox();
  if (inbox.some((row) => row.id === inboxId && !row.isRead)) {
    store.set(IN_APP_ALERTS_KEY, inbox.map((row) => (row.id === inboxId ? { ...row, isRead: true } : row)));
    publishInbox();
  }
  return next;
}
