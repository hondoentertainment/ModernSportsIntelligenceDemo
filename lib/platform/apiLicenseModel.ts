/**
 * Alpha API licensing lite — scoped demo tokens + watermarked metering.
 * No real key-issuance database and no cloud ops.
 */
import { store } from '../dal/syncStore';

export const API_LICENSE_SCOPES = ['valuation.read', 'alerts.read', 'webhooks.write'] as const;
export type ApiLicenseScope = (typeof API_LICENSE_SCOPES)[number];

export const DEMO_LICENSE_WATERMARK = 'MSI-DEMO-WATERMARK';
export const DEMO_LICENSE_KEY = 'msi_alpha_demo_tokens_v1';
export const DEMO_LICENSE_METER_KEY = 'msi_alpha_demo_meter_v1';
export const DEMO_LICENSE_DISCLOSURE =
  'Demo scoped tokens and watermarked metering only. Real Alpha key issuance needs cloud ops after #77 — this model never writes a production key store.';

export const DEMO_DAILY_QUOTA = 25;

export interface DemoScopedToken {
  id: string;
  token: string;
  scopes: ApiLicenseScope[];
  watermark: typeof DEMO_LICENSE_WATERMARK;
  demo: true;
  createdAt: string;
  revokedAt: string | null;
}

export interface DemoMeterRecord {
  tokenId: string;
  used: number;
  quota: number;
  dayKey: string;
}

function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

export function isApiLicenseScope(value: string): value is ApiLicenseScope {
  return (API_LICENSE_SCOPES as readonly string[]).includes(value);
}

export function normalizeScopes(scopes: string[]): ApiLicenseScope[] {
  return [...new Set(scopes.filter(isApiLicenseScope))];
}

export function issueDemoScopedToken(scopes: string[]): DemoScopedToken {
  const normalized = normalizeScopes(scopes);
  if (normalized.length === 0) {
    throw new Error('At least one recognized demo scope is required.');
  }
  const record: DemoScopedToken = {
    id: newId('demo'),
    token: `msi_demo_${newId('tok').replace(/-/g, '').slice(0, 24)}`,
    scopes: normalized,
    watermark: DEMO_LICENSE_WATERMARK,
    demo: true,
    createdAt: new Date().toISOString(),
    revokedAt: null,
  };
  const list = listDemoTokens();
  store.set(DEMO_LICENSE_KEY, [record, ...list].slice(0, 40));
  return record;
}

export function listDemoTokens(): DemoScopedToken[] {
  const raw = store.get<DemoScopedToken[]>(DEMO_LICENSE_KEY, []);
  return Array.isArray(raw) ? raw : [];
}

export function revokeDemoToken(id: string): DemoScopedToken | null {
  const list = listDemoTokens();
  const target = list.find((row) => row.id === id);
  if (!target || target.revokedAt) return target ?? null;
  const next = { ...target, revokedAt: new Date().toISOString() };
  store.set(
    DEMO_LICENSE_KEY,
    list.map((row) => (row.id === id ? next : row)),
  );
  return next;
}

export function tokenHasScope(token: string, scope: ApiLicenseScope): boolean {
  const rec = listDemoTokens().find((row) => row.token === token && !row.revokedAt);
  return Boolean(rec?.scopes.includes(scope));
}

function readMeter(tokenId: string, now = new Date()): DemoMeterRecord {
  const dayKey = todayKey(now);
  const raw = store.get<DemoMeterRecord[]>(DEMO_LICENSE_METER_KEY, []);
  const list = Array.isArray(raw) ? raw : [];
  const existing = list.find((row) => row.tokenId === tokenId && row.dayKey === dayKey);
  return existing ?? { tokenId, used: 0, quota: DEMO_DAILY_QUOTA, dayKey };
}

export function meterDemoRequest(
  token: string,
  scope: ApiLicenseScope,
  now = new Date(),
): { allowed: boolean; remaining: number; watermark: typeof DEMO_LICENSE_WATERMARK; reason?: string } {
  const rec = listDemoTokens().find((row) => row.token === token);
  if (!rec || rec.revokedAt) {
    return { allowed: false, remaining: 0, watermark: DEMO_LICENSE_WATERMARK, reason: 'Token missing or revoked.' };
  }
  if (!rec.scopes.includes(scope)) {
    return { allowed: false, remaining: 0, watermark: DEMO_LICENSE_WATERMARK, reason: `Missing scope ${scope}.` };
  }
  const meter = readMeter(rec.id, now);
  if (meter.used >= meter.quota) {
    return { allowed: false, remaining: 0, watermark: DEMO_LICENSE_WATERMARK, reason: 'Demo daily quota exhausted.' };
  }
  const next: DemoMeterRecord = { ...meter, used: meter.used + 1 };
  const raw = store.get<DemoMeterRecord[]>(DEMO_LICENSE_METER_KEY, []);
  const list = Array.isArray(raw) ? raw.filter((row) => !(row.tokenId === rec.id && row.dayKey === meter.dayKey)) : [];
  store.set(DEMO_LICENSE_METER_KEY, [next, ...list].slice(0, 80));
  return {
    allowed: true,
    remaining: next.quota - next.used,
    watermark: DEMO_LICENSE_WATERMARK,
  };
}

export function watermarkedDemoPayload<T extends Record<string, unknown>>(
  body: T,
): T & { watermark: typeof DEMO_LICENSE_WATERMARK; demo: true } {
  return { ...body, watermark: DEMO_LICENSE_WATERMARK, demo: true };
}
