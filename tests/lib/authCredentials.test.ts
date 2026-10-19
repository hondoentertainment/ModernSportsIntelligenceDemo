import { describe, expect, it } from 'vitest';
import {
  classifyLoginIdentifier,
  currentPasswordFailure,
  interpretUsernameWriteError,
  isSessionExpiredError,
  isStaleRecoveryError,
  isUsernameLookupUnavailable,
  lookupOutcomeFromRpc,
  passwordIsStrong,
  passwordRuleError,
  resolveLoginEmail,
  safeRedirectOrigin,
  validateAuthUsername,
} from '../../lib/authCredentials';

describe('validateAuthUsername', () => {
  it('accepts 3-20 letters, numbers, and underscores', () => {
    expect(validateAuthUsername('ab_c')).toEqual({ ok: true, username: 'ab_c' });
    expect(validateAuthUsername('  CardFan99  ')).toEqual({ ok: true, username: 'CardFan99' });
  });

  it('rejects empty, short, long, and punctuation', () => {
    expect(validateAuthUsername('  ')).toMatchObject({ ok: false });
    expect(validateAuthUsername('ab').error).toMatch(/3-20/);
    expect(validateAuthUsername('a'.repeat(21)).error).toMatch(/3-20/);
    expect(validateAuthUsername('card.fan').error).toMatch(/underscores/);
    expect(validateAuthUsername('card-fan').error).toMatch(/underscores/);
    expect(validateAuthUsername('card fan').error).toMatch(/underscores/);
  });
});

describe('password rules', () => {
  it('requires length, upper, lower, and a number', () => {
    expect(passwordRuleError('')).toMatch(/required/i);
    expect(passwordRuleError('short1Ab')).toBeNull();
    expect(passwordRuleError('short')).toMatch(/8/);
    expect(passwordRuleError('alllowercase1')).toMatch(/uppercase/);
    expect(passwordRuleError('ALLUPPERCASE1')).toMatch(/lowercase/);
    expect(passwordRuleError('NoNumbers')).toMatch(/number/);
    expect(passwordRuleError(`${'A'.repeat(73)}a1`)).toMatch(/72/);
    expect(passwordIsStrong('Password1')).toBe(true);
    expect(passwordIsStrong('password1')).toBe(false);
  });
});

describe('classifyLoginIdentifier', () => {
  it('treats a normal address as email and lowercases it', () => {
    expect(classifyLoginIdentifier(' Fan@Example.com ')).toEqual({
      kind: 'email',
      email: 'fan@example.com',
    });
  });

  it('treats a handle as a username', () => {
    expect(classifyLoginIdentifier('Card_Fan')).toEqual({ kind: 'username', username: 'Card_Fan' });
  });

  it('rejects a broken address instead of treating it as a username', () => {
    expect(classifyLoginIdentifier('not-an-email@')).toEqual({ kind: 'invalid' });
    expect(classifyLoginIdentifier('a@b')).toEqual({ kind: 'invalid' });
    expect(classifyLoginIdentifier('no')).toEqual({ kind: 'invalid' });
  });
});

describe('username lookup availability', () => {
  it('recognizes a missing RPC or column', () => {
    expect(isUsernameLookupUnavailable({ code: 'PGRST202', message: 'Could not find the function' })).toBe(true);
    expect(isUsernameLookupUnavailable({ code: '42703', message: 'column username does not exist' })).toBe(true);
    expect(isUsernameLookupUnavailable({ message: 'function resolve_username_email does not exist' })).toBe(true);
    expect(isUsernameLookupUnavailable({ code: '23505', message: 'duplicate key' })).toBe(false);
    expect(isUsernameLookupUnavailable(null)).toBe(false);
  });

  it('maps an RPC payload to found, missing, or unavailable', () => {
    expect(lookupOutcomeFromRpc(null, 'Fan@Example.com')).toEqual({
      status: 'found',
      email: 'fan@example.com',
    });
    expect(lookupOutcomeFromRpc(null, null)).toEqual({ status: 'missing' });
    expect(lookupOutcomeFromRpc({ code: 'PGRST202', message: 'missing' }, null).status).toBe('unavailable');
    expect(lookupOutcomeFromRpc({ code: 'XX000', message: 'boom' }, null).status).toBe('error');
  });
});

describe('resolveLoginEmail', () => {
  it('does not look up an email address', async () => {
    const lookup = viLookup();
    await expect(resolveLoginEmail('fan@example.com', lookup.fn)).resolves.toEqual({
      status: 'ready',
      email: 'fan@example.com',
      via: 'email',
    });
    expect(lookup.calls).toEqual([]);
  });

  it('resolves a username to the email the lookup returns', async () => {
    const lookup = viLookup(async () => ({ status: 'found' as const, email: 'fan@example.com' }));
    await expect(resolveLoginEmail('Card_Fan', lookup.fn)).resolves.toEqual({
      status: 'ready',
      email: 'fan@example.com',
      via: 'username',
    });
    expect(lookup.calls).toEqual(['Card_Fan']);
  });

  it('hides a missing username from a ready email', async () => {
    const lookup = viLookup(async () => ({ status: 'missing' as const }));
    await expect(resolveLoginEmail('Card_Fan', lookup.fn)).resolves.toEqual({ status: 'unknown' });
  });

  it('reports when the RPC or column is not deployed', async () => {
    const lookup = viLookup(async () => ({ status: 'unavailable' as const }));
    await expect(resolveLoginEmail('Card_Fan', lookup.fn)).resolves.toEqual({ status: 'unavailable' });
  });

  it('does not call lookup for an invalid identifier', async () => {
    const lookup = viLookup();
    await expect(resolveLoginEmail('no', lookup.fn)).resolves.toEqual({ status: 'invalid' });
    expect(lookup.calls).toEqual([]);
  });
});

describe('username writes and redirects', () => {
  it('classifies unique violations and missing columns', () => {
    expect(interpretUsernameWriteError(null)).toBe('ok');
    expect(
      interpretUsernameWriteError({
        code: '23505',
        message: 'duplicate key value violates unique constraint "profiles_username_lower_idx"',
      }),
    ).toBe('taken');
    expect(
      interpretUsernameWriteError({
        code: '23505',
        message: 'duplicate key value violates unique constraint "profiles_pkey"',
      }),
    ).toBe('error');
    expect(interpretUsernameWriteError({ code: '42703', message: 'column username does not exist' })).toBe('unavailable');
    expect(interpretUsernameWriteError({ code: 'XX000', message: 'timeout' })).toBe('error');
  });

  it('keeps only an http(s) origin for reset links', () => {
    expect(safeRedirectOrigin('https://msi.example/reset-password?x=1#hash')).toBe('https://msi.example');
    expect(safeRedirectOrigin('javascript:alert(1)')).toBeNull();
    expect(safeRedirectOrigin('not a url')).toBeNull();
  });
});

describe('session and recovery failures', () => {
  it('treats a dead refresh token as an expired session and leaves a timeout alone', () => {
    expect(isSessionExpiredError({ message: 'Invalid Refresh Token: Refresh Token Not Found' })).toBe(true);
    expect(isSessionExpiredError({ message: 'JWT expired' })).toBe(true);
    expect(isSessionExpiredError({ message: 'Auth session missing!' })).toBe(true);
    expect(isSessionExpiredError({ code: 'session_expired', message: '' })).toBe(true);
    expect(isSessionExpiredError(new Error('Session refresh timed out'))).toBe(false);
    expect(isSessionExpiredError(null)).toBe(false);
  });

  it('recognizes a stale reset link without treating a bad password as one', () => {
    expect(isStaleRecoveryError({ code: 'otp_expired', message: 'Email link is invalid or has expired' })).toBe(true);
    expect(isStaleRecoveryError({ message: 'Email link is invalid or has expired' })).toBe(true);
    expect(isStaleRecoveryError({ code: 'flow_state_expired', message: 'Flow state expired' })).toBe(true);
    expect(isStaleRecoveryError({ message: 'Invalid login credentials' })).toBe(false);
  });

  it('maps a current-password check without hiding a dead session or a throttle', () => {
    expect(currentPasswordFailure({ message: 'Invalid login credentials', code: 'invalid_credentials' })).toMatchObject({
      code: 'current_password_incorrect',
    });
    expect(currentPasswordFailure({ message: 'JWT expired' })).toMatchObject({ code: 'session_expired' });
    expect(currentPasswordFailure({ message: 'Too many requests', code: 'over_request_rate_limit' }).message).toMatch(/few minutes/i);
    expect(currentPasswordFailure({ message: 'database unavailable' })).toMatchObject({ code: 'server_error' });
    expect(currentPasswordFailure(null)).toMatchObject({ code: 'server_error' });
  });
});

function viLookup(impl?: (username: string) => Promise<Awaited<ReturnType<typeof lookupOutcomeFromRpc>> | { status: 'found'; email: string } | { status: 'missing' } | { status: 'unavailable' } | { status: 'error' }>) {
  const calls: string[] = [];
  return {
    calls,
    fn: async (username: string) => {
      calls.push(username);
      if (!impl) return { status: 'missing' as const };
      return impl(username);
    },
  };
}
