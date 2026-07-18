/**
 * Client for the `admin-audit-events` Supabase Edge Function.
 *
 * The Edge Function performs the actual role check and the audit-of-audit
 * write. This module is a thin, testable wrapper: it validates the response
 * shape, coerces optional filters into the request body, and swallows errors
 * into a discriminated result so callers never need a try/catch.
 */

import { supabase, isDemoMode } from '../supabase';
import { logger } from '../logger';
import { addBreadcrumb } from '../sentry';
import type { RemoteAuditRow } from './auditTrailRemote';

export interface AdminAuditFilters {
  /** Restrict results to this user id. */
  targetUserId?: string;
  /** Restrict results to this `audit_events.category`. */
  category?: string;
  /** Return rows strictly older than this ISO timestamp. */
  before?: string;
  /** Max rows to return (server clamps to 1..500). */
  limit?: number;
}

/**
 * Cross-user audit row returned by the `admin-audit-events` Edge Function.
 * Shape is identical to the direct-Supabase `RemoteAuditRow`, so we re-export
 * that to keep a single source of truth for the `audit_events` row shape.
 */
export type AdminAuditRow = RemoteAuditRow;

export type AdminAuditResult =
  | {
      ok: true;
      events: AdminAuditRow[];
      role: 'support' | 'admin';
      count: number;
    }
  | {
      ok: false;
      error: string;
      status?: number;
    };

function isAdminAuditRow(raw: unknown): raw is AdminAuditRow {
  if (!raw || typeof raw !== 'object') return false;
  const r = raw as Record<string, unknown>;
  return (
    typeof r.category === 'string' &&
    typeof r.action === 'string' &&
    typeof r.entity_type === 'string' &&
    typeof r.created_at === 'string'
  );
}

/**
 * Redact the filter set for Sentry breadcrumbs. `targetUserId` is a user
 * UUID — PII per `docs/MONITORING.md` §PII — so we send its presence and a
 * short deterministic prefix hash for cross-breadcrumb correlation, never the
 * raw value. `category`, `before` (ISO timestamp cursor), and `limit` are not
 * identifying and pass through untouched.
 */
function summarizeFiltersForBreadcrumb(body: AdminAuditFilters): Record<string, unknown> {
  const out: Record<string, unknown> = {
    hasTargetUser: !!body.targetUserId,
  };
  if (body.targetUserId) {
    // Non-cryptographic prefix hash — enough to correlate multiple
    // breadcrumbs from the same operator read without exposing the raw UUID.
    // Using a djb2 variant to stay dependency-free.
    let hash = 5381;
    for (let i = 0; i < body.targetUserId.length; i++) {
      hash = ((hash << 5) + hash + body.targetUserId.charCodeAt(i)) | 0;
    }
    out.targetUserPrefix = (hash >>> 0).toString(16).padStart(8, '0').slice(0, 8);
  }
  if (body.category) out.category = body.category;
  if (body.before) out.before = body.before;
  if (typeof body.limit === 'number') out.limit = body.limit;
  return out;
}

export async function fetchAdminAuditEvents(
  filters: AdminAuditFilters = {},
): Promise<AdminAuditResult> {
  if (isDemoMode) {
    return { ok: false, error: 'Admin viewer is not available in demo mode.' };
  }

  const body: AdminAuditFilters = {};
  if (filters.targetUserId) body.targetUserId = filters.targetUserId;
  if (filters.category) body.category = filters.category;
  if (filters.before) body.before = filters.before;
  if (typeof filters.limit === 'number') body.limit = filters.limit;

  const filtersSummary = summarizeFiltersForBreadcrumb(body);

  const { data, error } = await supabase.functions.invoke('admin-audit-events', { body });

  if (error) {
    logger.error('admin-audit-events invoke failed', error);
    // Breadcrumb the failure so any downstream exception carries the context
    // that an operator read just tried and failed. Filter summary is PII-safe
    // (see summarizeFiltersForBreadcrumb).
    addBreadcrumb({
      category: 'admin.audit',
      message: 'admin-audit-events invoke failed',
      level: 'error',
      data: {
        filters: filtersSummary,
        errorMessage: error.message ?? null,
      },
    });
    return {
      ok: false,
      error: error.message || 'Admin audit read failed',
    };
  }

  const payload = data as { events?: unknown; meta?: { role?: unknown; count?: unknown } } | null;
  const events = Array.isArray(payload?.events)
    ? payload!.events.filter(isAdminAuditRow)
    : [];
  const role = payload?.meta?.role;
  if (role !== 'support' && role !== 'admin') {
    addBreadcrumb({
      category: 'admin.audit',
      message: 'admin-audit-events returned an unexpected role',
      level: 'warning',
      data: { role: typeof role === 'string' ? role : typeof role },
    });
    return { ok: false, error: 'Unexpected role from admin-audit-events response' };
  }
  const count = typeof payload?.meta?.count === 'number' ? payload!.meta!.count : events.length;
  // Success breadcrumb — every cross-user read is auditable, and now visible in
  // Sentry's session trail if a subsequent error is captured.
  addBreadcrumb({
    category: 'admin.audit',
    message: 'admin-audit-events read',
    level: 'info',
    data: {
      role,
      filters: filtersSummary,
      rowCount: count,
    },
  });
  return { ok: true, events, role, count };
}
