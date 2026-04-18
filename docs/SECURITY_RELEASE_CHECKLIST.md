# Security release checklist

Use this before cutting a release tag.

## Auth and session

- Supabase auth flows verified for login, logout, password recovery, and token refresh.
- Protected routes redirect unauthenticated users to `/login`.
- No auth tokens or credentials logged in client console output.

## Data and tenancy

- Supabase RLS checks run for launch-critical tables.
- No client-side usage of service role keys.
- Migration paths validated for signed-in users without cross-user data access.

## Input and rendering safety

- User-controlled content is rendered as text or sanitized HTML.
- Public API routes validate request payloads (Zod/safeParse).
- No new `dangerouslySetInnerHTML` usage without sanitization review.

## Dependencies and vulnerabilities

- `npm run audit:high` reviewed; no unresolved high-severity vulnerabilities in release candidate.
- New dependencies are justified and from trusted maintainers.

## Deployment controls

- Release gate workflow passed (`verify`, pricing guardrail, pricing truth E2E, build).
- Rollback steps verified in `docs/ROLLBACK_AND_STABILIZATION.md`.
