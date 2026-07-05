/**
 * admin-audit-events — Supabase Edge Function
 *
 * Cross-user audit-trail read for operators (profiles.role in ('support','admin')).
 * The signed-in user's JWT proves who they are; a service-role client performs
 * the actual read so RLS on `audit_events` (self-only) can be bypassed on
 * purpose. Every access is itself written to `audit_events` before the response
 * is returned — the audit trail of the audit trail.
 *
 * Request:  POST { targetUserId?: string, category?: string, before?: string, limit?: number }
 * Response: { events: audit_events[], meta: { role, filters, count } }
 *
 * Deploy:
 *   supabase functions deploy admin-audit-events
 *   (SUPABASE_SERVICE_ROLE_KEY is auto-populated for functions.)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';
import { getUserFromRequest } from '../_shared/auth.ts';

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 100;

type OperatorRole = 'support' | 'admin';

interface RequestBody {
  targetUserId?: string;
  category?: string;
  before?: string;
  limit?: number;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function clampLimit(raw: unknown): number {
  const n = typeof raw === 'number' && Number.isFinite(raw) ? Math.floor(raw) : DEFAULT_LIMIT;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const authResult = await getUserFromRequest(req);
  if ('error' in authResult) {
    return json(authResult.status, { error: authResult.error });
  }
  const { user } = authResult;

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) {
    console.error('[admin-audit-events] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return json(503, { error: 'Server misconfigured' });
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Role check — service role reads bypass RLS, so this is authoritative.
  const { data: profile, error: profileErr } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile) {
    console.error('[admin-audit-events] profile lookup failed', profileErr);
    return json(403, { error: 'Forbidden' });
  }
  const role = profile.role as string | null;
  if (role !== 'support' && role !== 'admin') {
    return json(403, { error: 'Forbidden' });
  }

  let body: RequestBody = {};
  try {
    const raw = await req.text();
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const limit = clampLimit(body.limit);
  const targetUserId = typeof body.targetUserId === 'string' && body.targetUserId.length > 0
    ? body.targetUserId
    : undefined;
  const category = typeof body.category === 'string' && body.category.length > 0
    ? body.category
    : undefined;
  const before = typeof body.before === 'string' && body.before.length > 0
    ? body.before
    : undefined;

  let query = admin
    .from('audit_events')
    .select('user_id, category, action, entity_type, entity_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (targetUserId) query = query.eq('user_id', targetUserId);
  if (category) query = query.eq('category', category);
  if (before) query = query.lt('created_at', before);

  const { data, error } = await query;
  if (error) {
    console.error('[admin-audit-events] audit_events query failed', error);
    return json(502, { error: 'Query failed' });
  }

  const events = Array.isArray(data) ? data : [];

  // Write the audit-of-audit row before returning. Failing to log the access
  // must NOT leak audit rows to the caller — 502 out if the write errors.
  const { error: writeErr } = await admin.from('audit_events').insert({
    user_id: user.id,
    category: 'admin',
    action: 'audit.cross_user_read',
    entity_type: 'audit_events',
    entity_id: targetUserId ?? null,
    metadata: {
      operator_role: role as OperatorRole,
      filters: { targetUserId, category, before, limit },
      row_count: events.length,
    },
    created_at: new Date().toISOString(),
  });

  if (writeErr) {
    console.error('[admin-audit-events] failed to write audit-of-audit row', writeErr);
    return json(502, { error: 'Failed to record admin access; read aborted' });
  }

  return json(200, {
    events,
    meta: {
      role,
      filters: { targetUserId, category, before, limit },
      count: events.length,
    },
  });
});
