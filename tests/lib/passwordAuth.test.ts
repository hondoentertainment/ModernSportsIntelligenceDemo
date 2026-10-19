import { describe, expect, it, vi } from 'vitest';
import {
  requestUsernameAvailability,
  requestUsernamePasswordReset,
  requestUsernamePasswordSignIn,
} from '../../lib/passwordAuth';

function jsonResponse(status: number, body: object): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('requestUsernamePasswordSignIn', () => {
  it('returns session tokens when the route signs the user in', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, {
      access_token: 'access',
      refresh_token: 'refresh',
    }));
    await expect(requestUsernamePasswordSignIn('Card_Fan', 'Password1', fetchImpl)).resolves.toEqual({
      ok: true,
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ identifier: 'Card_Fan', password: 'Password1' });
  });

  it('uses one credentials failure for a rejected sign-in', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(401, { error: 'Invalid username or password. Please check your credentials.' }));
    const result = await requestUsernamePasswordSignIn('Card_Fan', 'nope', fetchImpl);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/Invalid username or password/);
  });

  it('falls back to email sign-in when the route or RPC is missing', async () => {
    const missing = await requestUsernamePasswordSignIn('Card_Fan', 'Password1', vi.fn(async () => jsonResponse(404, {})));
    const unavailable = await requestUsernamePasswordSignIn(
      'Card_Fan',
      'Password1',
      vi.fn(async () => jsonResponse(409, { code: 'username_signin_unavailable' })),
    );
    const offline = await requestUsernamePasswordSignIn('Card_Fan', 'Password1', vi.fn(async () => {
      throw new Error('network');
    }));
    for (const result of [missing, unavailable, offline]) {
      expect(result).toMatchObject({ ok: false, code: 'username_signin_unavailable' });
      if (!result.ok) expect(result.message).toMatch(/Sign in with your email/);
    }
  });
});

describe('requestUsernamePasswordReset', () => {
  it('accepts a generic success without reading an email back', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, { ok: true }));
    await expect(requestUsernamePasswordReset('Card_Fan', 'https://msi.example', fetchImpl)).resolves.toEqual({ ok: true });
  });

  it('surfaces the email-only fallback when username reset is not deployed', async () => {
    const result = await requestUsernamePasswordReset(
      'Card_Fan',
      'https://msi.example',
      vi.fn(async () => jsonResponse(409, { code: 'username_signin_unavailable' })),
    );
    expect(result).toMatchObject({ ok: false, code: 'username_signin_unavailable' });
  });
});

describe('requestUsernameAvailability', () => {
  it('reads only the boolean', async () => {
    await expect(requestUsernameAvailability('Card_Fan', vi.fn(async () => jsonResponse(200, { available: true })))).resolves.toBe('available');
    await expect(requestUsernameAvailability('Card_Fan', vi.fn(async () => jsonResponse(200, { available: false })))).resolves.toBe('taken');
    await expect(requestUsernameAvailability('Card_Fan', vi.fn(async () => jsonResponse(409, { code: 'username_signin_unavailable' })))).resolves.toBe('unavailable');
  });
});
