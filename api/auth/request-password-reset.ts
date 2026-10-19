/**
 * POST /api/auth/request-password-reset
 * Sends a Supabase recovery email. A missing account returns the same success
 * body as a real send. Username lookup uses the service role and does not
 * return the email.
 */
import { setApiCorsHeaders, respondInternalError } from '../lib/httpProduction.js';
import {
  RESET_RATE_LIMIT_ERROR,
  USERNAME_SIGN_IN_UNAVAILABLE,
  isAuthRateLimited,
  isHiddenAccountError,
  lookupOutcomeFromRpc,
  passwordResetBodySchema,
  resolveLoginEmail,
  safeRedirectOrigin,
} from '../../lib/authCredentials.js';
import { createAnonAuthClient, createServiceClient } from './supabaseServer.js';
import { noStore, rateLimitAuth, readJsonBody, type ApiRequest, type ApiResponse } from './http.js';

const ALLOWED_METHODS = 'POST, OPTIONS';

function accepted(res: ApiResponse) {
  return res.status(200).json({ ok: true });
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

  if (rateLimitAuth(req, res, 'auth-reset', 5, 60_000)) return;

  const parsed = passwordResetBodySchema.safeParse(readJsonBody(req.body));
  if (!parsed.success) {
    return res.status(400).json({ error: 'Enter your username or email.' });
  }

  const redirectTo = safeRedirectOrigin(parsed.data.redirectTo);
  if (!redirectTo) {
    return res.status(400).json({ error: 'Enter your username or email.' });
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

    if (resolved.status === 'unavailable') {
      return res.status(409).json({
        error: USERNAME_SIGN_IN_UNAVAILABLE,
        code: 'username_signin_unavailable',
      });
    }

    // Same response for a bad identifier and an unknown username.
    if (resolved.status === 'invalid' || resolved.status === 'unknown') {
      return accepted(res);
    }

    if (resolved.status === 'error') {
      return res.status(500).json({
        error: 'Could not send a reset email. Please try again.',
        code: 'server_error',
      });
    }

    const anon = createAnonAuthClient();
    if (!anon) {
      return res.status(503).json({
        error: 'Password reset is not configured.',
        code: 'auth_not_configured',
      });
    }

    const { error } = await anon.auth.resetPasswordForEmail(resolved.email, { redirectTo });
    if (error && isAuthRateLimited(error)) {
      res.setHeader('Retry-After', '3600');
      return res.status(429).json({ error: RESET_RATE_LIMIT_ERROR, code: 'RATE_LIMITED' });
    }
    if (error && !isHiddenAccountError(error)) {
      return res.status(500).json({
        error: 'Could not send a reset email. Please try again.',
        code: 'server_error',
      });
    }
    return accepted(res);
  } catch (err) {
    return respondInternalError(res, err, 'password reset failed', 'auth_reset_failed');
  }
}
