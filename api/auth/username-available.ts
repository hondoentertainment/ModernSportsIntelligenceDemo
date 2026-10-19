/**
 * POST /api/auth/username-available
 * Returns a boolean only. Does not return a profile row or an email.
 * If the RPC is not deployed yet, responds unavailable so signup can continue.
 */
import { setApiCorsHeaders, respondInternalError } from '../lib/httpProduction.js';
import {
  USERNAME_SIGN_IN_UNAVAILABLE,
  isUsernameLookupUnavailable,
  usernameAvailabilityBodySchema,
  validateAuthUsername,
} from '../../lib/authCredentials.js';
import { createServiceClient } from './supabaseServer.js';
import { noStore, rateLimitAuth, readJsonBody, type ApiRequest, type ApiResponse } from './http.js';

const ALLOWED_METHODS = 'POST, OPTIONS';

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

  if (rateLimitAuth(req, res, 'auth-username', 30, 60_000)) return;

  const parsed = usernameAvailabilityBodySchema.safeParse(readJsonBody(req.body));
  if (!parsed.success) {
    return res.status(400).json({ error: 'Enter a username.' });
  }

  const username = validateAuthUsername(parsed.data.username);
  if (!username.ok) {
    return res.status(400).json({ error: username.error });
  }

  const admin = createServiceClient();
  if (!admin) {
    return res.status(409).json({
      available: null,
      error: USERNAME_SIGN_IN_UNAVAILABLE,
      code: 'username_signin_unavailable',
    });
  }

  try {
    const { data, error } = await admin.rpc('username_available', { p_username: username.username });
    if (error) {
      if (isUsernameLookupUnavailable(error)) {
        return res.status(409).json({
          available: null,
          error: USERNAME_SIGN_IN_UNAVAILABLE,
          code: 'username_signin_unavailable',
        });
      }
      return res.status(500).json({
        error: 'Could not check that username. Please try again.',
        code: 'server_error',
      });
    }
    return res.status(200).json({ available: data === true });
  } catch (err) {
    return respondInternalError(res, err, 'username availability failed', 'auth_username_failed');
  }
}
