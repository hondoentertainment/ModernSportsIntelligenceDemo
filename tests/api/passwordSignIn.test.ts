import { beforeEach, describe, expect, it, vi } from 'vitest';

const { signInWithPassword, resetPasswordForEmail, rpc, createAnonAuthClient, createServiceClient } = vi.hoisted(() => {
  const signInWithPassword = vi.fn();
  const resetPasswordForEmail = vi.fn();
  const rpc = vi.fn();
  return {
    signInWithPassword,
    resetPasswordForEmail,
    rpc,
    createAnonAuthClient: vi.fn(() => ({ auth: { signInWithPassword, resetPasswordForEmail } })),
    createServiceClient: vi.fn(() => ({ rpc })),
  };
});

vi.mock('../../api/auth/supabaseServer', () => ({
  createAnonAuthClient,
  createServiceClient,
}));

import signInHandler from '../../api/auth/password-sign-in';
import resetHandler from '../../api/auth/request-password-reset';
import availableHandler from '../../api/auth/username-available';

function makeRes() {
  const headers: Record<string, string> = {};
  return {
    statusCode: 0,
    body: undefined as unknown,
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return {
        end: () => undefined,
        json: (payload: object) => {
          this.body = payload;
        },
      };
    },
    headers,
  };
}

const GENERIC = { error: 'Invalid username or password. Please check your credentials.' };

beforeEach(() => {
  process.env.RATE_LIMIT_DISABLED = '1';
  signInWithPassword.mockReset();
  resetPasswordForEmail.mockReset();
  rpc.mockReset();
  createAnonAuthClient.mockClear();
  createServiceClient.mockClear();
  createAnonAuthClient.mockImplementation(() => ({ auth: { signInWithPassword, resetPasswordForEmail } }));
  createServiceClient.mockImplementation(() => ({ rpc }));
});

describe('POST /api/auth/password-sign-in', () => {
  it('signs in an email without calling the username RPC', async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'a', refresh_token: 'r' } },
      error: null,
    });
    const res = makeRes();
    await signInHandler({ method: 'POST', body: { identifier: 'Fan@Example.com', password: 'Password1' } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ access_token: 'a', refresh_token: 'r' });
    expect(rpc).not.toHaveBeenCalled();
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'fan@example.com', password: 'Password1' });
  });

  it('returns the same body for an unknown username and a bad password', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: null });
    const unknown = makeRes();
    await signInHandler({ method: 'POST', body: { identifier: 'Card_Fan', password: 'Password1' } }, unknown);

    rpc.mockResolvedValueOnce({ data: 'fan@example.com', error: null });
    signInWithPassword.mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'Invalid login credentials', code: 'invalid_credentials' },
    });
    const badPassword = makeRes();
    await signInHandler({ method: 'POST', body: { identifier: 'Card_Fan', password: 'WrongPass1' } }, badPassword);

    expect(unknown.statusCode).toBe(401);
    expect(badPassword.statusCode).toBe(401);
    expect(unknown.body).toEqual(GENERIC);
    expect(badPassword.body).toEqual(unknown.body);
    expect(JSON.stringify(unknown.body)).not.toContain('@');
    expect(JSON.stringify(badPassword.body)).not.toContain('fan@example.com');
  });

  it('tells the client to use email when the RPC is not deployed', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: 'PGRST202', message: 'Could not find the function public.resolve_username_email' } });
    const res = makeRes();
    await signInHandler({ method: 'POST', body: { identifier: 'Card_Fan', password: 'Password1' } }, res);
    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({ code: 'username_signin_unavailable' });
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('throttles repeated attempts with one generic body that does not echo the username', async () => {
    delete process.env.RATE_LIMIT_DISABLED;
    rpc.mockResolvedValue({ data: null, error: null });
    const headers = { 'x-forwarded-for': '203.0.113.44' };
    for (let i = 0; i < 20; i += 1) {
      const res = makeRes();
      await signInHandler({ method: 'POST', headers, body: { identifier: 'Card_Fan', password: 'Password1' } }, res);
      expect(res.statusCode).toBe(401);
    }
    const first = makeRes();
    await signInHandler({ method: 'POST', headers, body: { identifier: 'Card_Fan', password: 'Password1' } }, first);
    const second = makeRes();
    await signInHandler({ method: 'POST', headers, body: { identifier: 'Other_Fan', password: 'OtherPass1' } }, second);
    expect(first.statusCode).toBe(429);
    expect(second.statusCode).toBe(429);
    expect(first.body).toEqual(second.body);
    expect(first.headers['Retry-After']).toBeTruthy();
    const text = JSON.stringify(first.body);
    expect(text).not.toContain('Card_Fan');
    expect(text).not.toContain('Other_Fan');
    expect(text).not.toContain('@');
    expect(first.body).toMatchObject({ code: 'RATE_LIMITED' });
    expect(rpc).toHaveBeenCalledTimes(20);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('rejects a non-POST and a body that is missing a password', async () => {
    const method = makeRes();
    await signInHandler({ method: 'GET' }, method);
    expect(method.statusCode).toBe(405);

    const body = makeRes();
    await signInHandler({ method: 'POST', body: { identifier: 'Card_Fan', password: '' } }, body);
    expect(body.statusCode).toBe(400);
    expect(JSON.stringify(body.body)).not.toContain('Card_Fan');
  });
});

describe('POST /api/auth/request-password-reset', () => {
  it('sends a reset for a resolved username and does not return the email', async () => {
    rpc.mockResolvedValue({ data: 'fan@example.com', error: null });
    resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    const res = makeRes();
    await resetHandler({
      method: 'POST',
      body: { identifier: 'Card_Fan', redirectTo: 'https://msi.example/forgot-password#token' },
    }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(resetPasswordForEmail).toHaveBeenCalledWith('fan@example.com', { redirectTo: 'https://msi.example' });
    expect(JSON.stringify(res.body)).not.toContain('fan@example.com');
  });

  it('returns the same success when the username does not exist', async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    const res = makeRes();
    await resetHandler({
      method: 'POST',
      body: { identifier: 'Missing_Fan', redirectTo: 'https://msi.example' },
    }, res);
    expect(res.body).toEqual({ ok: true });
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('swallows a user-not-found error from Supabase', async () => {
    rpc.mockResolvedValue({ data: 'fan@example.com', error: null });
    resetPasswordForEmail.mockResolvedValue({ data: null, error: { code: 'user_not_found', message: 'User not found' } });
    const res = makeRes();
    await resetHandler({
      method: 'POST',
      body: { identifier: 'Card_Fan', redirectTo: 'https://msi.example' },
    }, res);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('POST /api/auth/username-available', () => {
  it('returns a boolean and nothing else about the profile', async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    const res = makeRes();
    await availableHandler({ method: 'POST', body: { username: 'Card_Fan' } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ available: false });
    expect(rpc).toHaveBeenCalledWith('username_available', { p_username: 'Card_Fan' });
  });

  it('degrades when the function is missing', async () => {
    rpc.mockResolvedValue({ data: null, error: { code: '42883', message: 'function username_available(text) does not exist' } });
    const res = makeRes();
    await availableHandler({ method: 'POST', body: { username: 'Card_Fan' } }, res);
    expect(res.statusCode).toBe(409);
    expect(res.body).toMatchObject({ available: null, code: 'username_signin_unavailable' });
  });

  it('rejects a username that fails the shape rules', async () => {
    const res = makeRes();
    await availableHandler({ method: 'POST', body: { username: 'no' } }, res);
    expect(res.statusCode).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });
});
