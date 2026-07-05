import { supabase, isDemoMode } from '../supabase';
import { logger } from '../logger';

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

export interface RemoteAuditRow {
  user_id: string | null;
  category: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface FetchRemoteAuditOptions {
  /** Max rows to return (server clamps to 1..MAX_LIMIT). Default 200. */
  limit?: number;
  /** Return rows strictly older than this ISO timestamp (for pagination). */
  before?: string;
}

/**
 * Fetches the latest audit_events for the given user via the RLS-protected
 * `audit_events` table. Returns an empty array in demo mode, when no user is
 * signed in, when the supabase client is missing, or on any error (errors are
 * logged; callers never need to try/catch).
 */
export async function fetchRemoteAuditEvents(
  userId: string | undefined | null,
  opts: FetchRemoteAuditOptions = {},
): Promise<RemoteAuditRow[]> {
  if (!userId || isDemoMode || !supabase) return [];
  const limit = Math.min(Math.max(opts.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

  try {
    let query = supabase
      .from('audit_events')
      .select('user_id, category, action, entity_type, entity_id, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (opts.before) {
      query = query.lt('created_at', opts.before);
    }

    const { data, error } = await query;
    if (error) {
      logger.error('fetchRemoteAuditEvents failed:', error);
      return [];
    }
    return Array.isArray(data) ? (data as RemoteAuditRow[]) : [];
  } catch (err) {
    logger.error('fetchRemoteAuditEvents threw:', err);
    return [];
  }
}
