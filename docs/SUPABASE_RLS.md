# Supabase Row Level Security (RLS)

This app uses the **anon** Supabase key in the browser. Postgres RLS is the primary guardrail: every table that holds tenant data must have RLS **enabled** and policies that scope rows to `auth.uid()`.

## Roles and keys

| Key / role                                          | RLS                                                                    |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| **Anon** (`VITE_SUPABASE_ANON_KEY`)                 | Enforced — policies must allow only the signed-in user’s rows.         |
| **Service role** (server only, never in the client) | Bypasses RLS — use only in trusted API routes / Edge Functions / cron. |

## Tables and intent

Reference DDL and full policy text live in **[`supabase-schema.sql`](../supabase-schema.sql)**. Migrations under [`supabase/migrations/`](../supabase/migrations/) apply incremental fixes (e.g. `user_data`, `audit_events`).

| Table / area                                              | Owner column                                                 | Notes                                                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `profiles`                                                | `id` (= `auth.users.id`)                                     | Users read/update own row; **public read** where `is_public = true`.                                                                 |
| `cards`                                                   | `user_id`                                                    | Full CRUD own rows; **SELECT** allowed for others when owner’s profile is public.                                                    |
| `targets`                                                 | `user_id`                                                    | Full CRUD own rows only.                                                                                                             |
| `price_history`                                           | `user_id`                                                    | Full CRUD own rows only. Migration **`00006_price_history_market_events_stripe.sql`** ensures incremental deploys include the table. |
| `market_events`                                           | `user_id`                                                    | User catalyst / import feed; full CRUD own rows only. Migration **`00006`**.                                                         |
| `stripe_processed_events`                                 | _(none — keyed by `stripe_event_id`)_                        | **No** anon/authenticated policies; **service role** (webhook) inserts rows for idempotency. Migration **`00006`**.                  |
| `audit_events`                                            | `user_id`                                                    | See migration `00001` — consolidated **FOR ALL** on own rows. Server inserts with `user_id` null need **service role**.              |
| `user_data`                                               | `user_id`                                                    | **DAL** (`SupabaseStorageAdapter`): SELECT/INSERT/UPDATE/DELETE own rows only. Migration **`00002_user_data_rls.sql`**.              |
| Trading / graph (counterparties, listings, deal_rooms, …) | `owner_user_id` (or membership via `deal_room_participants`) | Per-table policies in `supabase-schema.sql`; deal-room rows use **participant** checks for messages/attachments.                     |

## Migrations (recommended order)

1. Baseline or full reference: run or diff against **`supabase-schema.sql`** in the Supabase SQL Editor (or split into smaller migrations over time).
2. **`00001_rls_audit_events.sql`** — RLS + single policy on `audit_events`.
3. **`00002_user_data_rls.sql`** — `user_data` + policies (required for cloud DAL).
4. **`00003_handle_new_user_search_path.sql`** — sets `search_path` on `handle_new_user()` (SECURITY DEFINER hardening).
5. **`00004_valuation_provenance.sql`** — valuation columns on `cards` / `targets` (schema only; not RLS).
6. **`00005_valuation_source_checks.sql`** — `valuation_source` CHECK constraints (schema only; not RLS).
7. **`00006_price_history_market_events_stripe.sql`** — `price_history` (if missing), `market_events`, `stripe_processed_events` + RLS.

## Verify RLS in the dashboard

**Authentication → Policies**: confirm each table shows RLS enabled and expected policies.

## SQL: tables in `public` without RLS

Run in SQL Editor (should return **no rows** after a correct deploy):

```sql
SELECT c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND NOT c.relrowsecurity
ORDER BY 1;
```

## SQL: policy inventory

```sql
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Manual spot-check (two accounts)

1. Create **User A** and **User B** (two emails).
2. As **A**, insert a card or a `user_data` row (via the app or SQL as that user — SQL Editor runs as postgres, so use the **app** or impersonation).
3. As **B**, confirm **cannot** read A’s `cards`, `targets`, `price_history`, or `user_data` via the client (REST or app UI).
4. Set A’s profile **`is_public = true`** — confirm B can read **only** the intended public projection (per policies / views), not private fields.

## Public portfolio behavior

- **`profiles`**: second `SELECT` policy allows reading rows with `is_public = true` (limited columns in app should still be enforced in UI; DB exposes full row to any authenticated user for those profiles — tighten with a **view** or column-level exposure if needed).
- **`cards`**: `SELECT` allowed when the card owner has a public profile (see policy `Public cards are viewable for public profiles`).

If you need stricter public surfaces, prefer **`public_profiles_public`** / **`public_cards_public`** views with explicit column lists and revoke direct `SELECT` on base tables for anon/authenticated (advanced).

## Storage buckets

The current codebase does not use Supabase Storage in TypeScript. If you add buckets later, add **Storage RLS** policies separately (not covered by table RLS).

## See also

- [`docs/OPS_RUNBOOK.md`](./OPS_RUNBOOK.md) — deploy checklist including RLS
- [`docs/SUPABASE_TYPES.md`](./SUPABASE_TYPES.md) — generated types
- [`PRODUCTION_READINESS.md`](../PRODUCTION_READINESS.md) — Phase 1.2 Auth/RLS
