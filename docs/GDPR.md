# GDPR / privacy compliance

Modern Sports Intelligence implements two GDPR data-subject rights as automated API endpoints.

## Article 20 — Right to data portability

**Endpoint:** `GET /api/me/export`

**Auth:** `Authorization: Bearer <supabase-jwt>` (the user's own session token).

**Rate limit:** 5 requests / minute / IP.

**Response:** a downloadable JSON file (`Content-Disposition: attachment`) containing every row the user owns in `cards`, `targets`, `audit_events`, and `user_data`. Rows are returned via the **anon** Supabase client so Row-Level Security guarantees no cross-user leakage.

**Audit trail:** every export writes a `data.exported` row to `audit_events` with row counts (best-effort; the export does not fail if the audit insert fails).

**Schema:** `schemaVersion: 1`. If the response shape ever changes, bump this number.

## Article 17 — Right to erasure

See `api/me/delete.ts` (sibling endpoint, owned by Agent G in the same release).

## Operator runbook

If a user emails support requesting export:

1. Confirm they own the account (the API does this automatically via JWT).
2. Direct them to the in-app "Download my data" button in Settings (UI work pending — see follow-up).
3. If the user is locked out and can't access the button, the operator can issue a one-time signed URL using the service role (procedure: TBD — to be added in the support-tooling sprint).
