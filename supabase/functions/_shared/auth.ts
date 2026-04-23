// @ts-nocheck
import { createClient, type User } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

export async function getUserFromRequest(req: Request): Promise<{ user: User } | { error: string; status: number }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { error: 'Missing Authorization', status: 401 };
  }

  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anon) {
    return { error: 'Server misconfigured', status: 503 };
  }

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: 'Invalid or expired session', status: 401 };
  }

  return { user };
}

/** Reject if client sent a different user id than the JWT subject. */
export function assertBodyUserMatchesJwt(
  bodyUserId: unknown,
  jwtUserId: string,
): { ok: true } | { error: string; status: number } {
  if (bodyUserId === undefined || bodyUserId === null || bodyUserId === '') {
    return { ok: true };
  }
  if (typeof bodyUserId !== 'string' || bodyUserId !== jwtUserId) {
    return { error: 'userId does not match authenticated user', status: 403 };
  }
  return { ok: true };
}
