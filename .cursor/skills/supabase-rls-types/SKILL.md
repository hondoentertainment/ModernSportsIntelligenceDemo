---
name: supabase-rls-types
description: >-
  Applies Supabase Row Level Security, migrations, typed clients, and anon vs
  service-role boundaries for this repo. Use when changing Supabase schema,
  policies, auth, inventory queries, regenerating TypeScript types, or when
  the user mentions Supabase, RLS, or postgres policies.
---

# Supabase (RLS, migrations, types)

## Principles

- **Anon key** (`VITE_SUPABASE_*` or public anon): safe in the browser only with **RLS** enforcing access. Never bypass RLS from the client with the service role.
- **Service role**: server-only (Vercel functions, scripts). Never expose in `VITE_` vars or client bundles.
- Prefer **parameterized** Supabase client calls; avoid string-built filters from raw user input without validation.

## Row Level Security

- Enable RLS on tables that hold user or tenant data.
- Policies should express **who can SELECT/INSERT/UPDATE/DELETE** in terms of `auth.uid()`, claims, or membership tables.
- Test policies for: owner access, non-owner denial, and optional public read where intended.

## TypeScript types

- Regenerate generated types after schema changes:

```bash
npm run types:supabase
```

- Output path in this project: `types/supabase.gen.ts` (per `package.json`). Import from there or through project aliases; keep **one canonical** generated file.

## Migrations workflow

- Use Supabase CLI migrations for production-traceable schema changes; apply in order; avoid ad-hoc prod edits.
- After migration: regenerate types and fix compile errors in `lib/**` and hooks such as `lib/useSupabaseInventory.ts`.

## Checklist (agent)

- [ ] RLS enabled where data is sensitive
- [ ] No service role key in client or `VITE_` prefix
- [ ] Types regenerated if schema changed
- [ ] Queries respect intended policy (not relying on “security by obscurity”)
