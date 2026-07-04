# Runbook: Key Rotation & Secret Revocation Drill

Phase 31 (Trust, Security, and Data Governance) requires that every secret we
hand to a third party is rotatable on short notice without downtime, and that
the team has actually exercised the procedure. This runbook is the canonical
sequence — execute it at least once per quarter (drill) and immediately
whenever a key is suspected leaked (incident).

**Owner:** Platform Reliability
**Review cadence:** Quarterly, and on every new secret added to `.env.example`

---

## In scope

Every secret used by a deployed environment, including:

| Secret                                         | Where it lives               | Where it's used                                               |
| ---------------------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`                    | Vercel env, Supabase project | Edge Functions (including `admin-audit-events`), server jobs  |
| `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` | Vercel env                   | Browser client (public — rotate only on suspected misuse)     |
| `STRIPE_SECRET_KEY`                            | Vercel env                   | `api/stripe-webhook.ts`, Edge billing functions               |
| `STRIPE_WEBHOOK_SECRET`                        | Vercel env                   | `api/stripe-webhook.ts` signature verification                |
| `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET`        | Vercel env                   | `api/market/ebay.ts` OAuth client-credentials                 |
| `GEMINI_API_KEY`                               | Vercel env                   | `api/ai/generate.ts` (server-side; never exposed to browser)  |
| `PSA_API_KEY`                                  | Supabase Functions           | `supabase/functions/verify-psa-cert`                          |
| `VITE_SENTRY_DSN`                              | Vercel env                   | `lib/sentry.ts` (public DSN — rotate only on suspected abuse) |
| `VITE_ERROR_REPORTING_URL`                     | Vercel env                   | `lib/errorReporting.ts` beacon                                |

Anything with the `VITE_` prefix ships to the browser and is public by design.
Rotation still matters, but treat it as a misuse-driven event, not a
secret-leak event.

---

## Drill: quarterly rehearsal (no live impact)

Run this against a **staging** Vercel project + a **staging** Supabase project.
Goal: confirm every key can be rotated end-to-end with no production exposure.

### 1. Pre-flight (15 min)

- [ ] Page the on-call engineer; confirm they have:
  - Vercel project access (Owner or Admin)
  - Supabase project access (Owner)
  - Stripe Dashboard access for the test-mode keys
  - eBay developer account access
  - Google Cloud / AI Studio access for Gemini
  - PSA developer portal access
- [ ] Confirm the deployed staging build is green and reachable.
- [ ] Snapshot current key fingerprints (last 4 chars only) into the drill log.

### 2. Rotate (30 min per provider)

For each provider in the table above:

1. Generate a new key in the provider's dashboard.
2. Add the **new** key to Vercel (or Supabase Functions secrets) as
   `<NAME>_NEXT` (do not delete the existing `<NAME>` yet).
3. Trigger a preview deployment using `<NAME>_NEXT` to verify the new key
   works against staging.
4. Promote the preview to staging, swap `<NAME>` → `<NAME>_NEXT`'s value, and
   redeploy.
5. Smoke-test the affected surface with `npm run test:e2e:deployed`:
   Stripe checkout, eBay verify, Gemini `/api/ai/generate`, PSA cert lookup,
   and `audit_events` insert (visit `/audit-trail` and confirm a new local
   Recorded row appears after refresh).
6. Confirm the operator viewer `/audit-trail/admin` still authenticates and
   writes an `audit.cross_user_read` row (any `support`/`admin` account will
   do — this exercises the new service-role path end-to-end).
7. Revoke the **old** key in the provider's dashboard.
8. Record fingerprint, rotation time, and smoke-test result in the drill log.

### 3. Post-flight (15 min)

- [ ] Confirm Sentry shows no spike in auth/secret-related errors in the
      30-minute window after each swap.
- [ ] Confirm `api/health` returns 200 and `scripts/rls-verify.mjs` passes.
- [ ] File a follow-up issue for anything that took longer than expected.

**Drill success criteria:** every secret rotated end-to-end with zero failed
production requests, no rollbacks, and total elapsed time under 4 hours.

---

## Incident: suspected leak (live impact)

Execute when a key is believed compromised — exposed in a log, committed to
git, sent to an unintended recipient, or behaviorally suspect (unexpected
billing, unexpected API usage).

### 0-15 min — Contain

- [ ] Declare incident in `#sec-incident`; capture incident ID.
- [ ] Page on-call. Freeze the affected surface if applicable: - Stripe: enable Restricted mode for the leaked key. - Supabase service role: disable the API in `Project Settings → API`. - eBay / Gemini / PSA: disable the application in the provider dashboard.
- [ ] In Vercel, set the env var to a known-bad sentinel (`REVOKED-<incident-id>`)
      and redeploy production to force fast failure rather than silent leak.

### 15-60 min — Rotate

- [ ] Follow Drill step 2 above for the affected key only.
- [ ] If the leaked key was a Supabase service role: also rotate
      `auth.jwt_secret` and force-sign-out all sessions
      (`supabase.auth.admin.signOut(everywhere=true)` via service role).
- [ ] If the leaked key was a Stripe key: review Stripe Dashboard activity
      since the suspected exposure timestamp; refund or dispute any
      unauthorized charges before they settle.
- [ ] If the leaked key was Gemini, eBay, or PSA: review the provider's usage
      logs since the suspected exposure timestamp.

### 1-24 hr — Recover

- [ ] Audit git history for the leaked value:
      `     git log -p -S '<last-4-chars>' --all
    `
      Rewrite history and force-push only with explicit owner approval; prefer
      a public revocation note in the README.
- [ ] Audit `audit_events`, `stripe_processed_events`, and Sentry for any
      anomalous activity windowed to the exposure period; log everything to
      the incident timeline. Use `/audit-trail/admin` with a 24-hour time
      window if the leak may have involved multiple users.
- [ ] Run `npm run audit:localstorage` and `npm run verify:rls` to confirm no
      collateral damage.
- [ ] Notify Stripe / Supabase / eBay / Google / PSA as required by their
      disclosure contracts.

### 24-72 hr — Postmortem

- [ ] Write the postmortem in `plans/incidents/postmortems/<date>-<key>.md`
      (create the folder on first use).
- [ ] File prevention tasks: log scrubbing, secret-scanning CI gate, narrower
      scopes / IP allowlists on the rotated key.
- [ ] Review whether the original drill cadence missed this key class — adjust
      this runbook if so.

---

## Standing automation (already in place)

These guard against the most common failure modes — running them
periodically is part of the drill's exit criteria.

- `scripts/rls-verify.mjs` — anon-client RLS smoke test (`npm run verify:rls`).
  Catches a leaked anon key that has become over-privileged.
- `.github/dependabot.yml` — weekly npm updates so transitive dependencies
  don't sneak in a credential-mishandling regression.
- `api/stripe-webhook.ts` — enforces signature verification; a rotated
  `STRIPE_WEBHOOK_SECRET` must be promoted before old signatures expire.
- `api/health.ts` — used by both the drill smoke-test and the monitoring loop.
- `supabase/functions/admin-audit-events` — the cross-user audit read logs
  every access, so any leaked service-role usage is post-hoc detectable via
  `/audit-trail/admin`.

---

## Drill log template

Append a dated entry under `## Drill log` below at the end of each run.

```
### YYYY-MM-DD — Quarterly drill
- Operator: <name>
- Duration: <hours>
- Keys rotated: [list]
- Fingerprints (last 4): old → new
- Smoke tests: pass / fail (link to Playwright report)
- Follow-ups filed: [issue links]
```

## Drill log

_No drills logged yet — execute the first run before promoting Phase 31 to
"complete" in `plans/next-steps-recommendation.md`._
