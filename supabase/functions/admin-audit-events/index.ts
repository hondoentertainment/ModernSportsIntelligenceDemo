/**
 * admin-audit-events — Supabase Edge Function (Deno bootstrap).
 *
 * All business logic lives in `handler.ts` so it can be unit-tested under
 * Vitest without `Deno.serve` / `Deno.env` / `esm.sh` imports. This file wires
 * the real dependencies (JWT auth, service-role Supabase client) into
 * `handleAdminAuditEvents`.
 *
 * Request:  POST { targetUserId?, category?, before?, limit? }
 * Response: { events: audit_events[], meta: { role, filters, count } }
 *
 * Deploy:
 *   supabase functions deploy admin-audit-events
 *   (SUPABASE_SERVICE_ROLE_KEY is auto-populated for functions.)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../_shared/cors.ts';
import { getUserFromRequest } from '../_shared/auth.ts';
import {
  handleAdminAuditEvents,
  type AdminAuditDeps,
  type AuditEventRow,
} from './handler.ts';

Deno.serve(async (req) => {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) {
    console.error('[admin-audit-events] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return new Response(
      JSON.stringify({ error: 'Server misconfigured' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const deps: AdminAuditDeps = {
    getUserFromRequest,
    async fetchOperatorRole(userId) {
      const { data, error } = await admin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (error) console.error('[admin-audit-events] profile lookup failed', error);
      return { role: (data?.role as string | null) ?? null, error };
    },
    async queryAuditEvents({ targetUserId, category, before, limit }) {
      let query = admin
        .from('audit_events')
        .select('user_id, category, action, entity_type, entity_id, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (targetUserId) query = query.eq('user_id', targetUserId);
      if (category) query = query.eq('category', category);
      if (before) query = query.lt('created_at', before);
      const { data, error } = await query;
      if (error) console.error('[admin-audit-events] audit_events query failed', error);
      return { rows: (data ?? []) as AuditEventRow[], error };
    },
    async writeAuditOfAudit(row) {
      const { error } = await admin.from('audit_events').insert(row);
      if (error) console.error('[admin-audit-events] failed to write audit-of-audit row', error);
      return { error };
    },
    now: () => new Date().toISOString(),
  };

  return handleAdminAuditEvents(req, deps);
});
