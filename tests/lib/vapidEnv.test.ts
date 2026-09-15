import { describe, expect, it } from 'vitest';
import {
  WEB_PUSH_VAPID_UNSET_CODE,
  WEB_PUSH_VAPID_UNSET_ERROR,
  assertVapidConfigured,
  readVapidEnv,
  vapidPublicStatusPayload,
} from '../../lib/push/vapidEnv';

describe('vapidEnv', () => {
  it('refuses loudly when public or private keys are missing', () => {
    expect(readVapidEnv({}).configured).toBe(false);
    expect(readVapidEnv({ WEB_PUSH_VAPID_PUBLIC: '  ' }).publicKey).toBeNull();
    const publicOnly = readVapidEnv({ WEB_PUSH_VAPID_PUBLIC: 'pub' });
    expect(publicOnly.configured).toBe(false);
    expect(publicOnly.privateKeyPresent).toBe(false);
    expect(() => assertVapidConfigured({})).toThrow(WEB_PUSH_VAPID_UNSET_ERROR);
    try {
      assertVapidConfigured({ WEB_PUSH_VAPID_PUBLIC: 'pub' });
    } catch (error) {
      expect((error as Error).name).toBe(WEB_PUSH_VAPID_UNSET_CODE);
    }
  });

  it('exposes public status without leaking a private key', () => {
    const ready = readVapidEnv({
      WEB_PUSH_VAPID_PUBLIC: 'owner-public',
      WEB_PUSH_VAPID_PRIVATE: 'owner-private',
    });
    expect(ready.configured).toBe(true);
    expect(assertVapidConfigured({
      WEB_PUSH_VAPID_PUBLIC: 'owner-public',
      WEB_PUSH_VAPID_PRIVATE: 'owner-private',
    }).publicKey).toBe('owner-public');
    const payload = vapidPublicStatusPayload(ready);
    expect(payload.configured).toBe(true);
    expect(payload.publicKey).toBe('owner-public');
    expect(JSON.stringify(payload)).not.toMatch(/owner-private/);
    expect(vapidPublicStatusPayload(readVapidEnv({})).code).toBe(WEB_PUSH_VAPID_UNSET_CODE);
  });

  it('defaults to process.env and treats non-strings as unset', () => {
    const priorPub = process.env.WEB_PUSH_VAPID_PUBLIC;
    const priorPriv = process.env.WEB_PUSH_VAPID_PRIVATE;
    delete process.env.WEB_PUSH_VAPID_PUBLIC;
    delete process.env.WEB_PUSH_VAPID_PRIVATE;
    expect(readVapidEnv().configured).toBe(false);
    expect(vapidPublicStatusPayload().publicKey).toBeNull();
    expect(readVapidEnv({ WEB_PUSH_VAPID_PUBLIC: 12 as unknown as string }).publicKey).toBeNull();
    if (priorPub === undefined) delete process.env.WEB_PUSH_VAPID_PUBLIC;
    else process.env.WEB_PUSH_VAPID_PUBLIC = priorPub;
    if (priorPriv === undefined) delete process.env.WEB_PUSH_VAPID_PRIVATE;
    else process.env.WEB_PUSH_VAPID_PRIVATE = priorPriv;
  });
});
