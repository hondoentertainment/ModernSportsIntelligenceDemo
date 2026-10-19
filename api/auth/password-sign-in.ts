/**
 * POST /api/auth/password-sign-in
 * Resolves a username to an email with the service role, then signs in with
 * the anon key. The email is not returned. Unknown usernames and bad passwords
 * share one response so callers cannot tell them apart.
 */
import { setApiCorsHeaders, respondInternalError } from '../lib/httpProduction.js';
import {
  AUTH_RATE_LIMIT_ERROR,
  EMAIL_NOT_CONFIRMED_ERROR,
  GENERIC_SIGN_IN_ERROR,
  USERNAME_SIGN_IN_UNAVAILABLE,
  isAuthRateLimited,
  isEmailNotConfirmed,
  lookupOutcomeFromRpc,
  passwordSignInBodySchema,
  resolveLoginEmail,
} from '../../lib/authCredentials.js';
import { createAnonAuthClient, createServiceClient } from './supabaseServer.js';
import { noStore, rateLimitAuth, readJsonBody, type ApiRequest, type ApiResponse } from './http.js';

const ALLOWED_METHODS = 'POST, OPTIONS';

function genericUnauthorized(res: ApiResponse) {
  return res.status(401).json({ error: GENERIC_SIGN_IN_ERROR });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setApiCorsHeaders(res, { allowMethods: ALLOWED_METHODS });
  noStore(res);

  if (req.method === 'OPTIONS') {
    const done = res.status(204);
    done.end?.();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ALLOWED_METHODS);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (rateLimitAuth(req, res, 'auth-sign-in', 20, 60_000)) return;

  const parsed = passwordSignInBodySchema.safeParse(readJsonBody(req.body));
  if (!parsed.success) {
    return res.status(400).json({ error: 'Enter your username or email and a password.' });
  }

  try {
    const resolved = await resolveLoginEmail(parsed.data.identifier, async username => {
      const admin = createServiceClient();
      if (!admin) return { status: 'unavailable' };
      const { data, error } = await admin.rpc('resolve_username_email', { p_username: username });
      return lookupOutcomeFromRpc(
        error ? { code: error.code, message: error.message } : null,
        data as unknown,
      );
    });

    if (resolved.status === 'invalid' || resolved.status === 'unknown') {
      return genericUnauthorized(res);
    }
    if (resolved.status === 'unavailable') {
      return res.status(409).json({
        error: USERNAME_SIGN_IN_UNAVAILABLE,
        code: 'username_signin_unavailable',
      });
    }
    if (resolved.status === 'error') {
      return res.status(500).json({
        error: 'Sign-in failed. Please try again.',
        code: 'server_error',
      });
    }

    const anon = createAnonAuthClient();
    if (!anon) {
      return res.status(503).json({
        error: 'Sign-in is not configured.',
        code: 'auth_not_configured',
      });
    }

    const { data, error } = await anon.auth.signInWithPassword({
      email: resolved.email,
      password: parsed.data.password,
    });

    if (error || !data.session?.access_token || !data.session.refresh_token) {
      if (error && isAuthRateLimited(error)) {
        res.setHeader('Retry-After', '60');
        return res.status(429).json({ error: AUTH_RATE_LIMIT_ERROR, code: 'RATE_LIMITED' });
      }
      if (error && isEmailNotConfirmed(error)) {
        return res.status(403).json({
          error: EMAIL_NOT_CONFIRMED_ERROR,
          code: 'email_not_confirmed',
        });
      }
      return genericUnauthorized(res);
    }

    return res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (err) {
    return respondInternalError(res, err, 'password sign-in failed', 'auth_sign_in_failed');
  }
}
