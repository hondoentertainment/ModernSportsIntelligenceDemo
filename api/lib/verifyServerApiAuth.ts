import { createClient } from '@supabase/supabase-js';
import { apiLogger } from './logger';

type ApiRequest = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

function header(req: ApiRequest, name: string): string | undefined {
  const h = req.headers;
  if (!h) return undefined;
  const direct = h[name] ?? h[name.toLowerCase()];
  if (Array.isArray(direct)) return direct[0];
  return direct;
}

function bearerToken(req: ApiRequest): string | null {
  const raw = header(req, 'authorization') ?? header(req, 'Authorization');
  if (!raw || typeof raw !== 'string') return null;
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

export function isServerApiAuthDisabled(): boolean {
  const v = process.env.MSI_API_AUTH_DISABLED?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function supabaseUrlForAuth(): string | undefined {
  return process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
}

/** Anon key on the server for JWT validation via auth.getUser (not for RLS bypass). */
function supabaseAnonKeyForAuth(): string | undefined {
  return (
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim()
  );
}

export function isServerApiAuthConfigured(): boolean {
  if (isServerApiAuthDisabled()) return true;
  if (process.env.MSI_SERVER_API_SECRET?.trim()) return true;
  const url = supabaseUrlForAuth();
  const anon = supabaseAnonKeyForAuth();
  return !!(url && anon);
}

const isProdLike =
  () => process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

/**
 * Returns true if the request is allowed to call protected server routes (/api/ai, /api/market/ebay).
 * - MSI_API_AUTH_DISABLED=1 → allow (local only; never set in production)
 * - Authorization: Bearer <MSI_SERVER_API_SECRET> → allow (automation / trusted backends)
 * - Authorization: Bearer <supabase_jwt> with valid session → allow
 */
export async function verifyServerApiAuth(req: ApiRequest): Promise<boolean> {
  if (isServerApiAuthDisabled()) {
    if (isProdLike()) {
      apiLogger.error('MSI_API_AUTH_DISABLED must not be set in production — all protected API calls rejected');
      return false;
    }
    return true;
  }

  const secret = process.env.MSI_SERVER_API_SECRET?.trim();
  const token = bearerToken(req);
  if (secret && token === secret) {
    return true;
  }

  const url = supabaseUrlForAuth();
  const anon = supabaseAnonKeyForAuth();
  if (!token || !url || !anon) {
    return false;
  }

  try {
    const sb = createClient(url, anon);
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) {
      return false;
    }
    return true;
  } catch (e) {
    apiLogger.error('verifyServerApiAuth: getUser failed', e);
    return false;
  }
}
