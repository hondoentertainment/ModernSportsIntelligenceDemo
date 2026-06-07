# Supabase TypeScript types (production workflow)

Generate strongly typed `Database` types from your Supabase project so client code can use `SupabaseClient<Database>` and catch schema drift at compile time.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed (`npm i -g supabase` or use `npx`)
- Logged in: `supabase login` (or use project ref with `--project-id`)

## Generate types (linked project)

From the repo root, with the local project linked to Supabase (`supabase link`):

```bash
npm run types:supabase
```

This writes **`types/supabase.gen.ts`**. Commit updates whenever you change the database schema.

## Generate without link (project ref)

```bash
npx supabase gen types typescript --project-id <YOUR_PROJECT_REF> > types/supabase.gen.ts
```

## Use in app code

1. Import the generated `Database` type.
2. Create the client with typing:

```ts
import type { Database } from '../types/supabase.gen';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

3. Gradually replace `any` row types with `TablesInsert` / `Tables` helpers from the generated file.

## CI

The [`supabase-types` workflow](../.github/workflows/supabase-types.yml) regenerates `types/supabase.gen.ts` from the live schema and fails on drift. It runs on PRs/pushes that touch `supabase/**`, weekly, and on demand.

**Activation:** add repository secrets `SUPABASE_ACCESS_TOKEN` (from the [Supabase account tokens page](https://supabase.com/dashboard/account/tokens)) and `SUPABASE_PROJECT_ID` (project ref). Without them the job no-ops cleanly.

Locally, `npm run types:supabase:check` regenerates and fails if the committed file is stale.

## See also

- `PRODUCTION_READINESS.md` §5.2 (type safety)
- `supabase-schema.sql` — reference schema before migrations
- **[docs/SUPABASE_RLS.md](./SUPABASE_RLS.md)** — RLS policies, migrations, verification queries
