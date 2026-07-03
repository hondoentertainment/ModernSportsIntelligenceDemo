# Admin Audit Viewer — Design Spec

**Status:** Specification only — implementation deferred until a tenant
role/permission layer lands (tracked under Phase 31).

## Why this is a separate document

The user-facing audit timeline (`pages/AuditTrail.tsx`) is correctly scoped
to the signed-in user by Supabase RLS:

```sql
CREATE POLICY "Users can view their own audit events" ON audit_events
  FOR SELECT USING (auth.uid() = user_id);
```

A cross-user / admin view needs to bypass that policy on purpose — only for
operators with a vetted role. That requires infrastructure that does not yet
exist in this codebase:

1. A persisted notion of an admin role (today there is no `profiles.role`
   column; the `subscription_tier` column drives feature gating but is not a
   trust boundary).
2. A server-side surface for the admin read that can use the service role
   key without exposing it to browsers.
3. An audit-of-the-audit-trail — every admin read must itself be logged.

This document specifies the minimum design for all three so the work can be
picked up as a single contained ticket.

## Goal

Let a small set of operators view audit events across all tenants from a
restricted UI, with every access itself auditable.

## Non-goals

- Editing audit rows. The table is append-only.
- Surfacing PII beyond what already exists in `metadata`.
- Replacing Sentry / observability tooling for general debugging.

## Architecture

### 1. Role storage

Add to `supabase-schema.sql` and a follow-up migration:

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member'
  CHECK (role IN ('member', 'support', 'admin'));

CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role)
  WHERE role <> 'member';
```

- `member` — default for every signup.
- `support` — read-only access to the cross-user audit view.
- `admin` — superset of `support`; also able to manage roles via SQL only
  (no UI for role assignment — kept out-of-band by design).

RLS for the new column:

```sql
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins/support can read every profile (role lookup only).
DROP POLICY IF EXISTS "Operators can view profiles" ON profiles;
CREATE POLICY "Operators can view profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('support', 'admin')
    )
  );

-- Updates remain self-only; role changes are out-of-band.
```

### 2. Admin read endpoint

New Supabase Edge Function `supabase/functions/admin-audit-events/index.ts`:

- Verifies the caller's JWT, fetches their `profiles.role`, and 403s anyone
  who is not `support` or `admin`.
- Uses the service role key (server-side only) to query `audit_events` with
  the requested filters (user_id, category, before, limit).
- Before returning, writes a **new** `audit_events` row recording the admin
  read (`category: 'admin'`, `action: 'audit.cross_user_read'`,
  `metadata: { target_user_id, filters, row_count }`).

JWT contract: same as the existing Edge Functions (see
`docs/SUPABASE_EDGE_FUNCTIONS.md`).

### 3. Client surface

New page `pages/AdminAuditTrail.tsx` mounted at `/audit-trail/admin`:

- Route gated by a new `<AdminRoute>` wrapper in `routes/AdminRoute.tsx`.
  Render-blocks unless the loaded `profile.role` is `support` or `admin`;
  otherwise redirects to `/audit-trail` (or `/`).
- Reuses `FilterChipGroup`, `filterAuditEvents`, and `exportAuditEventsToCSV`
  from `pages/AuditTrail.tsx` / `lib/utils/auditTrailService.ts`.
- Adds two new filter dimensions specific to the admin view:
  - **User ID** — text input that prefixes the query.
  - **Time window** — last 24h / 7d / 30d / custom.
- Cloud rows fetched via the new Edge Function (not the existing
  `fetchRemoteAuditEvents`).
- A persistent banner reminds the operator that every read is being logged.

### 4. Telemetry

- Sentry breadcrumb on every admin read with the target user id and filters.
- A daily Supabase cron job (Phase 35 territory — note in `MONITORING.md`)
  emails the platform owner a digest of admin reads.

## Test plan

- Unit: `tests/lib/auditTrailService.test.ts` already covers filter +
  CSV behavior; reuse it.
- Unit: new `tests/routes/AdminRoute.test.tsx` covering redirect for
  non-operators and pass-through for operators.
- Integration: new `tests/api/admin-audit-events.test.ts` covering the Edge
  Function's role check, audit-of-audit insertion, and filter passthrough.
- E2E: `tests/e2e/admin-audit-trail.spec.ts` — seeds a `support` profile,
  signs in, confirms the admin viewer renders and CSV download works.

## Open questions

1. Should `support` see Stripe-related `audit_events` rows, or should those
   be redacted? Default proposal: include but with a "Finance" badge to make
   redaction policy obvious to reviewers.
2. Do we need a soft-delete / hide capability for legally privileged rows?
   Out of scope here; would be a separate Phase 39 task.
3. Pagination: the cross-user query should default to a 30-day window and
   require an explicit "load all time" toggle to avoid full-table scans.

## Estimated effort

- Schema migration + RLS + Edge Function: 1 day
- Admin route + page + filters: 1 day
- Tests + E2E + telemetry: 1 day
- Buffer / review: 1 day

**Total: ~4 engineering days.** Block on Phase 31 incident-drill completion
so the audit-of-audit surface is exercised in the drill log before going
live.
