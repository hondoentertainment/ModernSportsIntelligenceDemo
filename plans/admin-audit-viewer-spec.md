# Admin Audit Viewer — Implementation Reference

**Status:** **Shipped in PR #79 (2026-07-04) + PR #80 (2026-07-05).** Live in
`main`. This document is now the pointer to the code, not a spec.

## What shipped

Cross-user audit-trail viewer for operators (`profiles.role` ∈
`{support, admin}`) with an audit-of-audit write on every read.

## Where it lives

| Concern                                                                   | File                                                                                                                       |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Trust-boundary role column + RLS                                          | `supabase/migrations/00008_profiles_role.sql` + `supabase/migrations/00010_profiles_role_fixes.sql`                        |
| `is_operator()` SECURITY DEFINER helper                                   | `supabase/migrations/00010_profiles_role_fixes.sql`                                                                        |
| BEFORE UPDATE trigger blocking self-role changes                          | `supabase/migrations/00008_profiles_role.sql` (see 00010 for the out-of-band exemption)                                    |
| Server-side cross-user read                                               | `supabase/functions/admin-audit-events/index.ts`                                                                           |
| Audit-of-audit row (`category='admin'`, `action='audit.cross_user_read'`) | same file, `admin.from('audit_events').insert(...)`                                                                        |
| Client wrapper (discriminated result)                                     | `lib/utils/adminAuditApi.ts`                                                                                               |
| Route gate                                                                | `components/AdminRoute.tsx` — waits on `profileLoading` before evaluating the role                                         |
| Page                                                                      | `pages/AdminAuditTrail.tsx` — target user id, time window (24h/7d/30d/all), server-limit, category filter (raw vocabulary) |
| `operatorRole` + `profileLoading` on AuthContext                          | `contexts/AuthContext.tsx`                                                                                                 |
| Shared filter chips / CSV export                                          | `components/audit/AuditFilterBar.tsx`, `components/audit/useAuditFilters.ts`                                               |

## Test coverage

| Scope                                                                                                              | File                                                                       |
| ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `AdminRoute` render/redirect matrix                                                                                | `tests/components/AdminRoute.test.tsx`                                     |
| `adminAuditApi` — demo-mode short-circuit, filter forwarding, error handling, malformed-event filtering, role gate | `tests/lib/adminAuditApi.test.ts`                                          |
| Edge Function role check + audit-of-audit insertion + filter passthrough + null-body handling                      | `tests/api/admin-audit-events.test.ts`                                     |
| Shared filter helpers + CSV RFC 4180 quoting                                                                       | `tests/lib/auditTrailService.test.ts`                                      |
| Pagination cursor + composite tie-breaker + discriminated result                                                   | `tests/lib/auditTrailRemote.test.ts`                                       |
| E2E smoke (renders + CSV export)                                                                                   | `tests/e2e/admin-audit-trail.spec.ts`                                      |
| a11y smoke                                                                                                         | `tests/e2e/accessibility.spec.ts` (adds `/audit-trail/admin` to the sweep) |

## Deployment (one-time, after 00010 landed)

1. Apply migration `00010_profiles_role_fixes.sql` in Supabase Dashboard → SQL Editor.
2. Deploy the Edge Function: `supabase functions deploy admin-audit-events`.
3. Assign the first operator role out-of-band:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = '<owner-email>';
   ```
4. Hard-refresh `/audit-trail/admin` and confirm the viewer renders + a new
   `audit.cross_user_read` row appears in the user's own `/audit-trail`.

## Out of scope for this initial ship (recorded here so the follow-up is

obvious):

- Sentry breadcrumb on each admin read — **shipped** in the follow-up PR
  (`lib/utils/adminAuditApi.ts` calls the breadcrumb helper).
- Daily digest email of admin reads — Phase 35 territory; documented in
  `docs/MONITORING.md` when the cron infrastructure lands.
- Soft-delete / privileged-row hiding — Phase 39 (compliance layer), not this
  ticket.
- Default 30-day window on the server query — the client now defaults to a
  30-day time-window filter, but the server still returns whatever the
  `limit` allows. If cross-user query cost becomes a concern, gate on window
  server-side in a follow-up.

## Historical open questions and their resolutions

1. **Should support see Stripe-related audit_events rows?** → **Include**, no
   redaction. The events table doesn't carry PANs or Stripe secrets, only
   customer/subscription ids and event types (see `docs/PAYMENT_SECURITY.md`).
2. **Soft-delete for privileged rows?** → Deferred to Phase 39.
3. **Server-side window default?** → Deferred (see above).
