---
name: zod-api-boundaries
description: >-
  Standardizes Zod validation at API, server, and UI boundaries using this
  project's schemas and safeParse patterns. Use when adding endpoints, forms,
  env parsing, or when the user mentions validation, schemas, or zod.
---

# Zod at boundaries

## Where to validate

- **Vercel / API handlers** (`api/**/*.ts`): parse `req.body`, query params, and headers (when used) immediately; return **400** with a stable error shape on failure.
- **Server responses to the client**: validate AI and third-party JSON before use (see `safeParse` pattern in `lib/utils/geminiClient.ts`).
- **Forms**: validate on submit; optional lightweight UX validation mirrors server rules.

## Patterns

- Define schemas next to **`lib/schemas`** (or colocated modules) and **reuse** the same schema on client and server when shapes match.
- Prefer **`.strict()`** or explicit `.passthrough()` deliberately — avoid silently dropping unknown keys for security-sensitive payloads.
- Export **input types** with `z.infer<typeof Schema>` for TypeScript alignment.

## Errors

- Do not expose raw Zod issue dumps to end users in production; map to `{ error: string }` or field-level errors for forms.

## Checklist (agent)

- [ ] Every new API input has a Zod schema
- [ ] External JSON validated before business logic
- [ ] Types inferred from schemas, not duplicated by hand
