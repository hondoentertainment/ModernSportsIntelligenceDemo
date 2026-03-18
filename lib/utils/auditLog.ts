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
