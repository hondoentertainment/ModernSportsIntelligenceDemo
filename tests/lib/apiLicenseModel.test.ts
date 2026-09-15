import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import {
  DEMO_LICENSE_DISCLOSURE,
  DEMO_LICENSE_KEY,
  DEMO_LICENSE_METER_KEY,
  DEMO_LICENSE_WATERMARK,
  issueDemoScopedToken,
  listDemoTokens,
  meterDemoRequest,
  normalizeScopes,
  revokeDemoToken,
  tokenHasScope,
  watermarkedDemoPayload,
} from '../../lib/platform/apiLicenseModel';

describe('apiLicenseModel', () => {
  beforeEach(() => {
    localStorage.clear();
    store.remove(DEMO_LICENSE_KEY);
    store.remove(DEMO_LICENSE_METER_KEY);
  });

  it('issues scoped demo tokens with a watermark and no production store', () => {
    expect(normalizeScopes(['valuation.read', 'nope', 'alerts.read'])).toEqual(['valuation.read', 'alerts.read']);
    expect(() => issueDemoScopedToken(['not-a-scope'])).toThrow(/recognized demo scope/i);
    const token = issueDemoScopedToken(['valuation.read', 'webhooks.write']);
    expect(token.demo).toBe(true);
    expect(token.watermark).toBe(DEMO_LICENSE_WATERMARK);
    expect(tokenHasScope(token.token, 'valuation.read')).toBe(true);
    expect(tokenHasScope(token.token, 'alerts.read')).toBe(false);
    expect(listDemoTokens()).toHaveLength(1);
    expect(revokeDemoToken('missing')).toBeNull();
    expect(tokenHasScope('nope', 'valuation.read')).toBe(false);
    expect(DEMO_LICENSE_DISCLOSURE).toMatch(/cloud ops/i);
  });

  it('meters watermarked demo calls and refuses revoked or exhausted tokens', () => {
    const token = issueDemoScopedToken(['valuation.read']);
    const first = meterDemoRequest(token.token, 'valuation.read', new Date('2026-09-15T12:00:00.000Z'));
    expect(first.allowed).toBe(true);
    expect(first.watermark).toBe(DEMO_LICENSE_WATERMARK);
    expect(meterDemoRequest(token.token, 'alerts.read').allowed).toBe(false);
    revokeDemoToken(token.id);
    expect(meterDemoRequest(token.token, 'valuation.read').allowed).toBe(false);
    const other = issueDemoScopedToken(['alerts.read']);
    for (let i = 0; i < 25; i += 1) {
      meterDemoRequest(other.token, 'alerts.read', new Date('2026-09-15T12:00:00.000Z'));
    }
    expect(meterDemoRequest(other.token, 'alerts.read', new Date('2026-09-15T12:00:00.000Z')).reason).toMatch(/quota/i);
    expect(watermarkedDemoPayload({ ok: true }).demo).toBe(true);
  });

  it('tolerates junk stores, already-revoked tokens, and missing crypto.randomUUID', () => {
    store.set(DEMO_LICENSE_KEY, { nope: true } as never);
    expect(listDemoTokens()).toEqual([]);
    store.set(DEMO_LICENSE_METER_KEY, { nope: true } as never);
    const uuid = crypto.randomUUID;
    Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: undefined });
    const token = issueDemoScopedToken(['valuation.read']);
    expect(token.id.startsWith('demo-')).toBe(true);
    Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: uuid });
    expect(revokeDemoToken(token.id)?.revokedAt).toBeTruthy();
    expect(revokeDemoToken(token.id)?.revokedAt).toBeTruthy();
    expect(meterDemoRequest(token.token, 'valuation.read').reason).toMatch(/revoked/i);
  });
});
