import { supabase, isDemoMode } from '../supabase';
import { logger } from '../logger';

const REMOTE_LIMIT = 200;
const REMOTE_LIMIT_MAX = 500;

export interface FetchRemoteAuditOptions {
  /** Max rows to return (defaults to 200, capped at 500). */
  limit?: number;
  /** Return rows strictly older than this ISO timestamp (for pagination). */
  before?: string;
  /** Optional category filter. */
  category?: string;
}

export interface RemoteAuditRow {
  user_id: string | null;
  category: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/**
 * Fetches the latest audit_events for the given user via RLS-protected query.
 * Returns an empty array on demo mode, missing user, missing supabase client,
 * or any error (errors are logged via the project logger).
 */
export async function fetchRemoteAuditEvents(
  userId: string | undefined | null,
  opts: FetchRemoteAuditOptions = {},
): Promise<RemoteAuditRow[]> {
  if (!userId || isDemoMode || !supabase) return [];
  const limit = Math.min(Math.max(opts.limit ?? REMOTE_LIMIT, 1), REMOTE_LIMIT_MAX);
  try {
    let query = supabase
      .from('audit_events')
      .select('user_id, category, action, entity_type, entity_id, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (opts.category) {
      query = query.eq('category', opts.category);
    }
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
