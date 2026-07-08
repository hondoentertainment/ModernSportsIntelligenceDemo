/**
 * Pure request handler for the `admin-audit-events` Edge Function.
 *
 * Kept separate from `index.ts` so Vitest can exercise it under Node without
 * bringing in `Deno.serve` / `Deno.env` / `esm.sh` imports. `index.ts` becomes
 * a thin Deno bootstrap that injects the real dependencies.
 *
 * The three critical invariants this file enforces:
 *   1. Role check happens BEFORE any audit_events read. Non-operators get 403.
 *   2. Audit-of-audit row is written BEFORE the response returns. If the write
 *      fails, the caller gets 502 and no rows leak.
 *   3. Non-object JSON payloads (`null`, `42`, arrays) don't crash the handler.
 */

import { corsHeaders } from '../_shared/cors.ts';

export const MAX_LIMIT = 500;
export const DEFAULT_LIMIT = 100;

export type OperatorRole = 'support' | 'admin';

export interface RequestBody {
  targetUserId?: string;
  category?: string;
  before?: string;
  limit?: number;
}

export interface AuditEventRow {
  user_id: string | null;
  category: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuthenticatedUser {
  id: string;
}

/**
 * Trait the handler needs from the underlying Supabase clients. Split into
 * two so tests can inject different fixtures per capability.
 */
export interface AdminAuditDeps {
  /** Verify the caller's JWT and return their user. */
  getUserFromRequest(req: Request):
    | Promise<{ user: AuthenticatedUser }>
    | Promise<{ error: string; status: number }>;
  /** Read `profiles.role` for the given user id (service-role scope). */
  fetchOperatorRole(userId: string): Promise<{
    role: string | null;
    error: unknown;
  }>;
  /** Query `audit_events` with the requested filters (service-role scope). */
  queryAuditEvents(filters: {
    targetUserId?: string;
    category?: string;
    before?: string;
    limit: number;
  }): Promise<{ rows: AuditEventRow[]; error: unknown }>;
  /** Insert the audit-of-audit row. Return the error (if any). */
  writeAuditOfAudit(row: {
    user_id: string;
    category: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
  }): Promise<{ error: unknown }>;
  /** Timestamp source, injected so tests can pin the clock. */
  now(): string;
}

export function clampLimit(raw: unknown): number {
  const n = typeof raw === 'number' && Number.isFinite(raw) ? Math.floor(raw) : DEFAULT_LIMIT;
  return Math.min(Math.max(n, 1), MAX_LIMIT);
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Coerce whatever JSON.parse yielded into a safe object shape. */
export function coerceRequestBody(raw: unknown): RequestBody {
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as RequestBody) : {};
}

/**
 * Pure request handler. Deps are injected; no top-level Deno / esm.sh / env
 * reads happen here, so Vitest can exercise the whole matrix.
 */
export async function handleAdminAuditEvents(req: Request, deps: AdminAuditDeps): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const authResult = await deps.getUserFromRequest(req);
  if ('error' in authResult) {
    return json(authResult.status, { error: authResult.error });
  }
  const { user } = authResult;

  const { role, error: profileErr } = await deps.fetchOperatorRole(user.id);
  if (profileErr || !role) {
    return json(403, { error: 'Forbidden' });
  }
  if (role !== 'support' && role !== 'admin') {
    return json(403, { error: 'Forbidden' });
  }

  let body: RequestBody = {};
  try {
    const raw = await req.text();
    body = coerceRequestBody(raw ? JSON.parse(raw) : {});
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

  const { rows, error: queryErr } = await deps.queryAuditEvents({
    targetUserId, category, before, limit,
  });
  if (queryErr) {
    return json(502, { error: 'Query failed' });
  }
  const events = Array.isArray(rows) ? rows : [];

  // Audit-of-audit MUST land before we return rows. Failing to log the
  // access means the caller sees nothing — fail closed.
  const { error: writeErr } = await deps.writeAuditOfAudit({
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
    created_at: deps.now(),
  });

  if (writeErr) {
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
}
