import { supabase, isDemoMode } from '../supabase';
import { logger } from '../logger';
import { store } from '../dal/syncStore';

const LOCAL_AUDIT_KEY = 'msi_audit_events';
const LOCAL_AUDIT_LIMIT = 200;

export type AuditCategory = 'portfolio' | 'valuation' | 'autonomy' | 'auth' | 'system';

export interface AuditEventInput {
    userId?: string;
    category: AuditCategory;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
}

function getLocalAuditEvents(): any[] {
    const parsed = store.get<any[]>(LOCAL_AUDIT_KEY, []);
    return Array.isArray(parsed) ? parsed : [];
}

function writeLocalAuditEvent(event: any): void {
    const events = getLocalAuditEvents();
    const next = [event, ...events].slice(0, LOCAL_AUDIT_LIMIT);
    store.set(LOCAL_AUDIT_KEY, next);
}

export async function logAuditEvent(input: AuditEventInput): Promise<void> {
    const event = {
        user_id: input.userId || null,
        category: input.category,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId || null,
        metadata: input.metadata || {},
        created_at: new Date().toISOString()
    };

    writeLocalAuditEvent(event);

    if (!input.userId || isDemoMode) {
        return;
    }

    const { error } = await supabase
        .from('audit_events')
        .insert(event);

    if (error) {
        logger.error('Failed to persist audit event:', error);
    }
}

export function getLocalAuditTrail(): any[] {
    return getLocalAuditEvents();
}

export interface FetchCloudAuditOptions {
    /** Max rows to return (defaults to 100, capped at 500). */
    limit?: number;
    /** Return rows strictly older than this ISO timestamp (for pagination). */
    before?: string;
    /** Optional category filter. */
    category?: AuditCategory;
}

/**
 * Fetch the signed-in user's audit events from Supabase. Returns `[]` in demo
 * mode, when no `userId` is provided, or when the call fails (errors are
 * logged but never thrown — the UI falls back to the local trail).
 */
export async function fetchCloudAuditEvents(
    userId: string,
    opts: FetchCloudAuditOptions = {}
): Promise<any[]> {
    if (!userId || isDemoMode) return [];

    const limit = Math.min(Math.max(opts.limit ?? 100, 1), 500);

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
        logger.error('Failed to fetch cloud audit events:', error);
        return [];
    }
    return Array.isArray(data) ? data : [];
}
