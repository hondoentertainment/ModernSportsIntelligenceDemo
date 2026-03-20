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

Optional: add a CI step that runs `npm run types:supabase` and fails if `git diff --exit-code types/supabase.gen.ts` is non-empty (requires `SUPABASE_ACCESS_TOKEN` secret and project ref).

## See also

- `PRODUCTION_READINESS.md` §5.2 (type safety)
- `supabase-schema.sql` — reference schema before migrations
