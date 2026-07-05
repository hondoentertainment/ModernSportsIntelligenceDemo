import { supabase, isDemoMode } from '../supabase';
import { logger } from '../logger';

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

export interface RemoteAuditRow {
  /**
   * Row UUID. Included so pagination can break `created_at` ties — several
   * rows can share the same millisecond timestamp under load, and a
   * `WHERE created_at < :before` cursor would silently drop every remaining
   * row with that exact timestamp.
   */
  id?: string;
  user_id: string | null;
  category: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Composite cursor for stable ordering: descend `created_at`, break ties by
 * descending `id`. The server-side WHERE clause is
 *   `created_at < :ts OR (created_at = :ts AND id < :id)`
 */
export interface RemoteAuditCursor {
  createdAt: string;
  id: string;
}

export interface FetchRemoteAuditOptions {
  /** Max rows to return (server clamps to 1..MAX_LIMIT). Default 200. */
  limit?: number;
  /** Return rows strictly older than this timestamp (for pagination). */
  before?: string;
  /**
   * Composite cursor. Preferred over `before` — includes the tie-breaker
   * `id` so rows sharing the boundary timestamp are not dropped.
   */
  beforeCursor?: RemoteAuditCursor;
}

/**
 * Discriminated result. `{ ok: true, rows }` means the server responded;
 * an empty `rows` array means "no more rows exist". `{ ok: false }` means
 * the request failed (network, RLS, missing supabase client, demo mode) —
 * callers must NOT interpret this as "no more rows".
 */
export type FetchRemoteAuditResult =
  | { ok: true; rows: RemoteAuditRow[] }
  | { ok: false; reason: 'demo-mode' | 'no-user' | 'no-client' | 'query-failed' | 'threw' };

function clampLimit(raw: number): number {
  return Math.min(Math.max(raw, 1), MAX_LIMIT);
}

/**
 * Fetches audit_events for the given user with pagination + tie-breaker
 * cursor. Never throws — errors surface as `{ ok: false }`.
 */
export async function fetchRemoteAuditEventsResult(
  userId: string | undefined | null,
  opts: FetchRemoteAuditOptions = {},
): Promise<FetchRemoteAuditResult> {
  if (!userId) return { ok: false, reason: 'no-user' };
  if (isDemoMode) return { ok: false, reason: 'demo-mode' };
  if (!supabase) return { ok: false, reason: 'no-client' };
  const limit = clampLimit(opts.limit ?? DEFAULT_LIMIT);

  try {
    let query = supabase
      .from('audit_events')
      .select('id, user_id, category, action, entity_type, entity_id, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit);

    if (opts.beforeCursor) {
      const { createdAt, id } = opts.beforeCursor;
      // `created_at < ts OR (created_at = ts AND id < id)`.
      // PostgREST's .or() expects the string form of each disjunct.
      query = query.or(
        `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`,
      );
    } else if (opts.before) {
      query = query.lt('created_at', opts.before);
    }

    const { data, error } = await query;
    if (error) {
      logger.error('fetchRemoteAuditEventsResult failed:', error);
      return { ok: false, reason: 'query-failed' };
    }
    return { ok: true, rows: Array.isArray(data) ? (data as RemoteAuditRow[]) : [] };
  } catch (err) {
    logger.error('fetchRemoteAuditEventsResult threw:', err);
    return { ok: false, reason: 'threw' };
  }
}

/**
 * Legacy array-returning shim. Existing callers that don't care about the
 * error/success distinction (they collapse both to "no rows") can keep
 * using this.
 *
 * NEW callers that page ("Load older…") should use
 * `fetchRemoteAuditEventsResult` so a transient failure doesn't strand the
 * user on the current page.
 */
export async function fetchRemoteAuditEvents(
  userId: string | undefined | null,
  opts: FetchRemoteAuditOptions = {},
): Promise<RemoteAuditRow[]> {
  const result = await fetchRemoteAuditEventsResult(userId, opts);
  return result.ok ? result.rows : [];
}
