/**
 * Browser calls for username sign-in. Email sign-in stays on the Supabase
 * client so it still works when this route or the username column is absent.
 */
import {
  AUTH_RATE_LIMIT_ERROR,
  EMAIL_NOT_CONFIRMED_ERROR,
  GENERIC_SIGN_IN_ERROR,
  RESET_RATE_LIMIT_ERROR,
  USERNAME_SIGN_IN_UNAVAILABLE,
} from './authCredentials';

export type UsernameSignInResult =
  | { ok: true; accessToken: string; refreshToken: string }
  | { ok: false; code: 'username_signin_unavailable'; message: string }
  | { ok: false; code: 'invalid_credentials'; message: string }
  | { ok: false; code: 'email_not_confirmed'; message: string }
  | { ok: false; code: 'over_request_rate_limit'; message: string }
  | { ok: false; code: 'server_error'; message: string };

export type UsernameResetResult =
  | { ok: true }
  | { ok: false; code: 'username_signin_unavailable' | 'over_request_rate_limit' | 'server_error'; message: string };

export type UsernameAvailability = 'available' | 'taken' | 'unavailable';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const body: unknown = await response.json().catch(() => null);
  return isRecord(body) ? body : {};
}

export async function requestUsernamePasswordSignIn(
  username: string,
  password: string,
  fetchImpl: typeof fetch = fetch,
): Promise<UsernameSignInResult> {
  let response: Response;
  try {
    response = await fetchImpl('/api/auth/password-sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: username, password }),
    });
  } catch {
    return {
      ok: false,
      code: 'username_signin_unavailable',
      message: USERNAME_SIGN_IN_UNAVAILABLE,
    };
  }

  if (response.status === 404) {
    return {
      ok: false,
      code: 'username_signin_unavailable',
      message: USERNAME_SIGN_IN_UNAVAILABLE,
    };
  }

  const body = await readJson(response);
  if (response.status === 409 || body.code === 'username_signin_unavailable') {
    return {
      ok: false,
      code: 'username_signin_unavailable',
      message: USERNAME_SIGN_IN_UNAVAILABLE,
    };
  }
  if (response.status === 429) {
    return { ok: false, code: 'over_request_rate_limit', message: AUTH_RATE_LIMIT_ERROR };
  }
  if (response.status === 403 || body.code === 'email_not_confirmed') {
    return { ok: false, code: 'email_not_confirmed', message: EMAIL_NOT_CONFIRMED_ERROR };
  }
  if (
    response.ok &&
    typeof body.access_token === 'string' &&
    typeof body.refresh_token === 'string' &&
    body.access_token.length > 0 &&
    body.refresh_token.length > 0
  ) {
    return { ok: true, accessToken: body.access_token, refreshToken: body.refresh_token };
  }
  if (response.status >= 500) {
    return { ok: false, code: 'server_error', message: 'Sign-in failed. Please try again.' };
  }
  return { ok: false, code: 'invalid_credentials', message: GENERIC_SIGN_IN_ERROR };
}

export async function requestUsernamePasswordReset(
  username: string,
  redirectTo: string,
  fetchImpl: typeof fetch = fetch,
): Promise<UsernameResetResult> {
  let response: Response;
  try {
    response = await fetchImpl('/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: username, redirectTo }),
    });
  } catch {
    return {
      ok: false,
      code: 'username_signin_unavailable',
      message: USERNAME_SIGN_IN_UNAVAILABLE,
    };
  }

  if (response.status === 404) {
    return {
      ok: false,
      code: 'username_signin_unavailable',
      message: USERNAME_SIGN_IN_UNAVAILABLE,
    };
  }

  const body = await readJson(response);
  if (response.status === 409 || body.code === 'username_signin_unavailable') {
    return {
      ok: false,
      code: 'username_signin_unavailable',
      message: USERNAME_SIGN_IN_UNAVAILABLE,
    };
  }
  if (response.status === 429) {
    return { ok: false, code: 'over_request_rate_limit', message: RESET_RATE_LIMIT_ERROR };
  }
  if (!response.ok) {
    return { ok: false, code: 'server_error', message: 'Could not send a reset email. Please try again.' };
  }
  return { ok: true };
}

export async function requestUsernameAvailability(
  username: string,
  fetchImpl: typeof fetch = fetch,
): Promise<UsernameAvailability> {
  let response: Response;
  try {
    response = await fetchImpl('/api/auth/username-available', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
  } catch {
    return 'unavailable';
  }

  if (response.status === 404) return 'unavailable';
  const body = await readJson(response);
  if (!response.ok || body.code === 'username_signin_unavailable') return 'unavailable';
  if (body.available === true) return 'available';
  if (body.available === false) return 'taken';
  return 'unavailable';
}
