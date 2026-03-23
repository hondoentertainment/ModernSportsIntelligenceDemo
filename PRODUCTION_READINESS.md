# Production Readiness Roadmap

Current state: **Prototype / Demo** — The platform has an impressive feature surface (174 services, 259 components, 112 pages) but nearly all business logic runs on localStorage with mock data. Below are the prioritized steps to bring the codebase to production quality.

---

## Phase 2 progress (production-grade hardening)

Completed in recent sprints (post–v4.3):

| Area | Done |
|------|------|
| **1.3 Environment** | `.env.example` added with all `VITE_*` variables documented; env validation (dev-only) already in place. |
| **2.2 Error handling** | `lib/retry.ts`: `withRetry()` and `withTimeout()` for resilient data loads. `useAgentRecommendations` uses retry + 15s timeout. `lib/errorReporting.ts`: `reportError()` logs and optionally beacons to `VITE_ERROR_REPORTING_URL`; `ErrorBoundary` and `LazyErrorBoundary` call it. |
| **Security headers** | `vercel.json`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` on all responses. |
| **Operations** | `api/health.ts`: GET/HEAD returns 200 for monitoring. `.github/dependabot.yml`: weekly npm updates with grouped PRs. |

**Phase 3–5 (agent swarm):** Retry/timeout expanded to CatalystMarket, CounterpartyTrustGraph, PrivateDealRoomAgent, PublicPortfolio. Test coverage: `errorReporting.test.ts`, `billingService.test.ts`, E2E `api-health.spec.ts` (skips when endpoint unavailable). Payment security: `docs/PAYMENT_SECURITY.md` and audit (no raw card data; webhook signature required). Input validation: Zod in `lib/apiValidation.ts` (public portfolio username), `api/market/ebay.ts` body validation. Monitoring: `docs/MONITORING.md` (health, reportError, CI). Public portfolio validates username before fetch; optional CI health run against deployment URL.

**Phase 6 (next-phase hardening):** Global unhandled promise rejections reported via `reportError` (same pipeline as ErrorBoundary). API routes use structured logging: `api/lib/logger.ts` (`apiLogger.error/warn/info`) in `api/market/ebay.ts` and `api/ai/generate.ts` so production logs are consistent and grep-able.

**Phase 7–11 (agent swarm, production-grade):**
- **Phase 7 – Test coverage:** Unit tests for `lib/envValidation.ts` and `lib/apiValidation.ts`; E2E test "feature search opens and shows featured features" in `release-smoke.spec.ts`.
- **Phase 8 – Performance:** `React.memo()` on `CardGridItem` and Collection grid item; `scripts/bundle-size.cjs` and `npm run build:size`; PRODUCTION_READINESS §2.3 and MONITORING bundle-size note; vite `chunkSizeWarningLimit` comment.
- **Phase 9 – Security:** Content-Security-Policy-Report-Only in `vercel.json`; Zod body validation in `api/ai/generate.ts`; per-IP rate limits on `api/ai/generate.ts` and `api/market/ebay.ts` (`api/lib/rateLimit.ts`, env in `.env.example`); details in `docs/MONITORING.md`.
- **Phase 10 – Type safety:** `HealthResponse` in `api/health.ts`; `ApiRequest`/`ApiResponse` in `api/ai/generate.ts`; JSDoc on `lib/retry.ts` and `lib/errorReporting.ts`.
- **Phase 11 – Sentry & runbook:** `lib/sentry.ts` (optional init when `VITE_SENTRY_DSN` set, `captureException`); `reportError` calls `captureException`; Runbook in `docs/MONITORING.md`; `.env.example` documents `VITE_SENTRY_DSN`. Optional dep `@sentry/react` for builds when Sentry is used.

**Coverage:** CI runs `npm run test:coverage` and uploads the report. `vite.config.ts` uses `coverage.all: false` and an explicit `coverage.include` whitelist; `test.coverage.thresholds` enforce the current aggregate (statements/lines/functions **92%**, branches **80%** — raise as the whitelist improves). Policy: **[docs/COVERAGE_POLICY.md](docs/COVERAGE_POLICY.md)**. Long-term: **~80%+** on business-critical modules (§2.1) and/or **100%** on a shrinking whitelist.

**Idempotency:** Client sends `idempotencyKey` with checkout and portal requests; backend Edge Functions must forward it to Stripe as `Idempotency-Key` (see docs/PAYMENT_SECURITY.md §c).

**Completed (roadmap progression):**
- Fixed `constants.tsx` duplicate icon imports (Shield, Sparkles, Dices).
- Fixed `lib/gemini.ts` duplicate imports (merged duplicate blocks; single clean import).
- Unhandled rejection handler: already wired in `index.tsx` (calls `reportError`).
- `reportError` → `captureException` (Sentry) already wired in `lib/errorReporting.ts`.
- Phase 10 JSDoc: `lib/retry.ts` and `lib/errorReporting.ts` already have JSDoc.

**Implemented (all phases):**
- **Phase 1.1 DAL:** `lib/dal.ts` — `createDataAccessLayer(userId)`, `IDataAccessLayer` (getCards, setCards, getTargets, setTargets, getJson, setJson, remove). Supabase-backed when userId + configured; localStorage fallback. Tests: `tests/lib/dal.test.ts`.
- **Phase 1.2 Auth/RLS:** ProtectedRoute on all protected routes; `supabase-schema.sql` and `supabase/migrations/` (`00001`–`00003`) for RLS; **[docs/SUPABASE_RLS.md](docs/SUPABASE_RLS.md)** for policy map and verification SQL.
- **Phase 3.1 Docker:** `Dockerfile` (multi-stage, nginx), `docker-compose.yml` for production image.
- **Phase 3.3 Migrations:** `supabase/migrations/` (`00001`–`00003`: audit_events, `user_data` DAL, `handle_new_user` search_path); see [docs/SUPABASE_RLS.md](docs/SUPABASE_RLS.md).
- **Phase 4 Stripe webhook:** `api/stripe-webhook.ts` — signature verification, raw body; idempotency per PAYMENT_SECURITY.
- **Phase 5.1 Features:** `features/portfolio/index.ts` — barrel exports for portfolio (useSupabaseInventory, dal, types).

**Next phases (TypeScript / Zod):**
- **Done:** Zod v4 — `error.issues` in api/ai/generate.ts and api/market/ebay.ts; `z.record(z.string(), z.unknown())` in lib/schemas.ts; Stripe webhook `apiVersion: '2026-02-25.clover'` (must match `stripe` package typings) and `apiLogger.info(message, meta)`; geminiClient returns `{ text: validated.text ?? '' }`. **`npm run typecheck` passes.**

**Phase 12 (production-grade — XSS + types workflow + DAL export):**
- **HTML sanitization:** `lib/sanitizeHtml.ts` uses DOMPurify with an allowlist; `APIPlatformModal` and `EbayListingGeneratorModal` sanitize before `dangerouslySetInnerHTML`. Tests: `tests/lib/sanitizeHtml.test.ts`.
- **Supabase generated types:** `docs/SUPABASE_TYPES.md` documents `npm run types:supabase` (CLI → `types/supabase.gen.ts`). Placeholder `types/supabase.gen.ts` committed until first generation.
- **DAL:** `initDAL` re-exported from `lib/dal.ts` so `import { initDAL } from './lib/dal'` resolves (file previously shadowed `lib/dal/index.ts`).

**Phase 14 (agent swarm — production-grade next steps):**
- **Strict TypeScript:** `tsconfig.strict.json` + `npm run typecheck:strict` — **required in CI** alongside release typecheck; see `docs/TYPESCRIPT_STRICT.md`.
- **E2E smoke:** `release-smoke.spec.ts` — test `billing or settings surface shows subscription or account copy` (settings copy after demo login).
- **CI dependency visibility:** Non-blocking `npm audit --audit-level=high` in `.github/workflows/ci.yml`; local `npm run audit:high`; `docs/MONITORING.md` § Dependency audit.
- **DAL migration doc:** `docs/DAL_MIGRATION.md`; `lib/useFavorites.ts` re-exports `lib/utils/useFavorites` (single store-backed implementation).

**Next:**
- **`npm run typecheck:strict`** is required in CI (see `docs/TYPESCRIPT_STRICT.md`); fix new violations when they appear.
- **Phase 13 – Coverage:** `tests/lib/syncStore.test.ts` exercises `lib/dal/syncStore` (get/set/has/remove/clear, localStorage fallbacks, adapter hydrate/flush/forceFlush); `sanitizeHtml.test.ts` expanded with non-string input, disallowed tags, and event/`javascript:` URL stripping. Global coverage thresholds in `vite.config.ts` track the **current aggregate** on instrumented files so CI stays honest; raise them gradually as tests are added (see [docs/COVERAGE_POLICY.md](docs/COVERAGE_POLICY.md)).
- **PWA / offline (v4 hardening):** `components/PwaUpdateBanner.tsx` listens for `sw-update-available` (from `index.html`) and reloads after `SKIP_WAITING`; service worker cache generation bumped in `public/sw.js` when shell caching behavior changes. `public/offline.html` offers HashRouter recovery link `/#/` and branded shell. CSP **Report-Only** in `vercel.json` includes **`wss:`** for Supabase Realtime, **`js.stripe.com`** / **`hooks.stripe.com`** / **`checkout.stripe.com`** for Stripe, **`worker-src`**, **`img-src`** (`data:` / `blob:` / `https:`), **`base-uri`** / **`frame-ancestors`** (see [docs/CSP_ROLLOUT.md](docs/CSP_ROLLOUT.md)).
- Continue raising test coverage toward 80% on critical paths and/or narrowing `coverage.include` toward a 100% gate on core modules.
- Gradually migrate services from direct localStorage to DAL (see [docs/DAL_MIGRATION.md](docs/DAL_MIGRATION.md)) — **AuthContext** / **useUsageGate** profile + demo keys now use **`store`**.
- Before enforcing a blocking CSP in production, follow [docs/CSP_ROLLOUT.md](docs/CSP_ROLLOUT.md).

---

## Phase 1: Foundation (Critical — Do First)

### 1.1 Replace localStorage with Real Backend Services

**Docs:** [docs/DAL_MIGRATION.md](docs/DAL_MIGRATION.md) — how `lib/dal.ts`, `initDAL`, and `lib/dal/syncStore.ts` fit together.

**Status:** DAL implemented. `lib/dal.ts` provides `createDataAccessLayer(userId)`; use `dal.getCards()`, `dal.setCards()`, `dal.getTargets()`, `dal.setTargets()`, `dal.getJson()`, `dal.setJson()`. Supabase-backed when userId present; localStorage fallback otherwise. `useSupabaseInventory` remains primary for React. `tests/lib/dal.test.ts` covers LocalStorageDAL.

**Why:** 426 localStorage references across 106 service files means all user data is ephemeral, device-locked, and unrecoverable. This is the single largest gap.

**Actions:**
- ~~Define a data access layer (DAL) abstraction so services call `dal.getCards()` instead of `localStorage.getItem()`~~ ✅
- Implement the DAL against Supabase (schema already exists in `supabase-schema.sql`)
- Migrate services in priority order: inventory → authentication → billing → trading → analytics
- Add offline-first caching (e.g., TanStack Query with Supabase realtime sync) so the UX stays snappy
- Remove all `localStorage.setItem/getItem` calls from service files (keep only for ephemeral UI state like sidebar collapse)

### 1.2 Authentication and Authorization

**Why:** `authenticationService.ts` and Supabase auth exist but are not wired into most features. No route guards, no role-based access.

**Actions:**
- Implement Supabase Auth with proper session management (refresh tokens, logout on expiry)
- Add route guards to all 112 pages — unauthenticated users see only public routes
- Implement role-based access control (free/basic/pro/alpha tiers already defined in the DB schema)
- Add CSRF protection and rate limiting on the API layer
- Secure all Supabase RLS (Row Level Security) policies so users can only access their own data

### 1.3 Environment and Secrets Management

**Why:** No `.env.example`, no validation of required env vars at startup. API keys (Gemini, Stripe, Supabase) could leak or be missing silently.

**Actions:**
- Create `.env.example` documenting all required variables
- Add startup validation (fail fast if `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `STRIPE_PUBLISHABLE_KEY` etc. are missing)
- Use Vite's `import.meta.env` consistently — audit for any hardcoded keys
- Set up separate environments: development, staging, production with distinct Supabase projects and Stripe test/live keys

---

## Phase 2: Quality and Reliability

### 2.1 Test Coverage (Currently ~10%)

**Why:** 29 service tests and 11 component tests for 174 services and 259 components. Any refactor (like the DAL migration above) will break things silently.

**Actions:**
- **Unit tests**: Target 80%+ coverage on service files. Start with the 10 real-API services (`billingService`, `authenticationService`, `useSupabaseInventory`, etc.)
- **Component tests**: Add tests for all interactive components (modals, forms, data grids). Prioritize components that handle money (`BillingModal`, payment flows)
- **Integration tests**: Test auth flow → inventory CRUD → billing lifecycle end-to-end against Supabase test instance
- **E2E tests**: Expand from 4 spec files to cover critical user journeys: signup → add cards → get valuations → subscribe → trade
- **Add coverage reporting** to CI (e.g., `vitest --coverage` with Istanbul) and set a coverage gate (no PR merges below threshold)

### 2.2 Error Handling and Resilience

**Why:** Generated services likely have minimal error handling. Network failures, API rate limits, and invalid data will crash the app.

**Actions:**
- Add a global `ErrorBoundary` at the app level (one exists in tests — verify it's used in production)
- Implement retry logic with exponential backoff for all Supabase/API calls
- Add request timeouts and circuit breakers for external APIs (Gemini, eBay, Stripe)
- Validate all external data at the boundary (use Zod or similar schema validation)
- Add a toast/notification system for user-facing errors instead of silent failures

### 2.3 Performance Optimization

**Why:** 112 lazy-loaded pages is good, but 259 components likely create a large initial bundle.

**Actions:**
- Run `npx vite-bundle-visualizer` to identify the largest chunks
- Ensure all page-level components use `React.lazy()` (verify in `App.tsx`)
- Add `React.memo()` to expensive list/grid components
- Implement virtual scrolling for card lists (already have `@tanstack/react-virtual` — verify it's used everywhere needed)
- Add image optimization (lazy loading, WebP format, CDN URLs instead of base64)
- Set a performance budget in CI: bundle size < 500KB gzipped, Lighthouse score > 90
- **Bundle size tracking:** Run `npm run build:size` to build and print `dist/assets/*.js` sizes (top 5 chunks and total). Use this to track bundle size; see also `docs/MONITORING.md`.

---

## Phase 3: Infrastructure and Operations

### 3.1 Containerization and Deployment

**Why:** Currently deploying to GitHub Pages (static only). A production app with Supabase Edge Functions, Stripe webhooks, and real-time features needs a proper deployment pipeline.

**Actions:**
- Add `Dockerfile` and `docker-compose.yml` for local development (app + Supabase local)
- Set up staging environment on Vercel/Netlify with preview deployments per PR
- Configure Supabase Edge Functions for server-side logic (Stripe webhook handlers, AI valuations)
- Add health check endpoints
- Set up blue-green or canary deployments for zero-downtime releases

### 3.2 Monitoring and Observability

**Why:** No error tracking, no analytics, no alerting. Production issues will be invisible.

**Actions:**
- Add Sentry (or similar) for error tracking and performance monitoring
- Add structured logging for server-side functions
- Set up uptime monitoring (e.g., Checkly, Better Uptime)
- Add business metrics dashboards (signups, active users, transactions, revenue)
- Configure alerts for: error rate spikes, API failures, payment processing issues

### 3.3 Database Operations

**Why:** `supabase-schema.sql` exists but there's no migration strategy for schema changes.

**Actions:**
- Set up Supabase CLI with local development workflow (`supabase init`, `supabase db diff`)
- Create proper migration files (not a single monolithic SQL file)
- Add database seeding scripts for development/testing
- Implement backup strategy and disaster recovery plan
- Add database indexes based on query patterns (card lookups by user, price history queries)

---

## Phase 4: Security Hardening

### 4.1 Input Validation and Sanitization

- Validate all user inputs with Zod schemas before sending to the backend
- Sanitize any user-generated content rendered in the UI (prevent XSS)
- Implement Content Security Policy (CSP) headers
- Add rate limiting on authentication endpoints

### 4.2 Payment Security

- Audit Stripe integration — ensure PCI compliance (never handle raw card numbers)
- Verify webhook signature validation in Stripe webhook handlers
- Add idempotency keys to all payment operations
- Implement proper subscription lifecycle handling (upgrades, downgrades, cancellations, failed payments)

**Checklist:** See **docs/PAYMENT_SECURITY.md** for the Phase 3 payment-security checklist (no raw card data, webhook signature verification, idempotency keys, env vars).

### 4.3 API Security

- Add API key rotation strategy
- Implement request signing for sensitive operations
- Set up CORS properly for production domains only
- Audit all Supabase RLS policies with a security review ([docs/SUPABASE_RLS.md](docs/SUPABASE_RLS.md))

---

## Phase 5: Developer Experience and Maintainability

### 5.1 Code Organization

**Why:** 174 service files in a flat `lib/` directory and 259 components in `components/` makes navigation difficult.

**Actions:**
- Group by feature domain: `features/trading/`, `features/analytics/`, `features/grading/`, etc.
- Each feature folder contains its own service, components, types, and tests
- Extract shared utilities into `lib/shared/` (the DAL, formatters, validators)
- Add barrel exports (`index.ts`) per feature for clean imports

### 5.2 Type Safety

- Audit all `any` types and replace with proper types
- Enable `strict: true` in `tsconfig.json` if not already set
- Add discriminated unions for API response types (success/error)
- Generate Supabase types from the schema (`supabase gen types typescript`)

### 5.3 Documentation

- Add JSDoc comments to all public service APIs
- Create an architecture decision record (ADR) for key decisions
- Document the data model and entity relationships
- Add Storybook for component documentation and visual testing

---

## Recommended Priority Order

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| **P0** | 1.1 Data access layer + Supabase migration | Large | Critical — app is non-functional for real users without this |
| **P0** | 1.2 Auth + route guards + RLS | Medium | Critical — data is wide open without this |
| **P0** | 1.3 Environment management | Small | Critical — prevents key leaks and misconfiguration |
| **P1** | 2.1 Test coverage to 80% | Large | High — enables safe refactoring |
| **P1** | 2.2 Error handling | Medium | High — prevents crashes in production |
| **P1** | 4.2 Payment security audit | Medium | High — financial and legal risk |
| **P2** | 3.1 Containerization + staging | Medium | Medium — enables team development |
| **P2** | 3.2 Monitoring | Medium | Medium — enables incident response |
| **P2** | 2.3 Performance optimization | Medium | Medium — user experience |
| **P3** | 5.1 Code reorganization | Large | Low-medium — maintainability |
| **P3** | 3.3 Database operations | Small | Medium — operational safety |
| **P3** | 4.1, 4.3 Security hardening | Medium | Medium — defense in depth |
| **P4** | 5.2, 5.3 Type safety + docs | Medium | Low — long-term maintainability |

---

## Quick Wins (Can Do This Week)

**Status:** Items 1, 3, 4, 7 done. Item 2 (strict) blocked on fixing existing TS errors. Items 5 (audit), 6 (supabase gen types) pending.

1. **Create `.env.example`** with all required variables documented
2. **Enable `strict: true`** in `tsconfig.json` and fix type errors
3. **Add Sentry** for error tracking (one package, one init call)
4. **Add `vitest --coverage`** to CI and generate a baseline report
5. **Audit the 10 real-API service files** for error handling and secret exposure
6. **Add `supabase gen types`** to generate TypeScript types from the database schema
7. **Set up Dependabot** or Renovate for automated dependency updates
