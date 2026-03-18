# Recommended Next Steps — Modern Sports Intelligence

> Generated 2026-03-18 · Based on full codebase analysis of v4.0+ (commit c66fd62)

---

## Current State Summary

MSI is an impressive **prototype/demo** with 344 pages, 395 components, and 404 service files covering 180+ features for the sports card collectibles market. Real integrations exist for **Gemini AI**, **Stripe billing**, and **MLB Stats API**. However, the platform relies heavily on **localStorage** (479 references) and **mock data** (82+ services), making it unsuitable for production use today.

**Production Readiness: ~5-10%** — Great demo, not yet ready for real users or real money.

---

## Priority 0 — Fix Build (Do First)

| # | Task | Why | Effort |
|---|------|-----|--------|
| 1 | **Fix syntax error in `pages/Dashboard.tsx:880`** | Build is currently broken — "Unterminated regular expression" error blocks all compilation | 1 hour |
| 2 | **Resolve TypeScript type definition warnings** | `@testing-library/jest-dom`, `node`, `vitest/globals` type defs missing in tsconfig | 1 hour |

---

## Priority 1 — Foundation (Weeks 1-3)

These items unblock everything else. Without them, no feature can be considered production-ready.

### 1.1 Data Access Layer (DAL)

**Problem:** 479 localStorage references across 106 files. All user data is ephemeral, device-locked, and unrecoverable.

**Action:**
- Create `lib/dal/` module with a `StorageAdapter` interface
- Implement `LocalStorageAdapter` (preserves current behavior) and `SupabaseAdapter`
- Add a feature flag to toggle between adapters per-feature
- Migrate services incrementally, starting with `inventoryService.ts` and `portfolioService.ts`

**Files to start with:**
- `lib/inventoryService.ts` → most critical (card data)
- `lib/portfolioService.ts` → portfolio values
- `lib/watchlistService.ts` → user preferences

### 1.2 Authentication & Authorization

**Problem:** Supabase auth is scaffolded (`contexts/AuthContext.tsx`) but not enforced. No route guards on 112+ pages. Tier-based access (Free/Basic/Pro/Alpha) defined but not gated.

**Action:**
- Wire `AuthContext` into `App.tsx` route definitions
- Create `<ProtectedRoute>` wrapper component
- Add tier-based feature gates using Stripe subscription status
- Implement session refresh and expiry handling

### 1.3 Environment & Secrets Validation

**Problem:** `.env.example` exists but no runtime validation. Risk of API key leaks.

**Action:**
- Add a `lib/env.ts` module using Zod to validate all required env vars at startup
- Fail fast with clear error messages for missing keys
- Ensure Gemini, Stripe, and Supabase keys are never exposed client-side

---

## Priority 2 — Reliability (Weeks 3-6)

### 2.1 Error Handling & Resilience

- Add a global `<ErrorBoundary>` in `App.tsx` (currently missing)
- Implement retry logic with exponential backoff for all API calls
- Add request timeouts and circuit breakers for external APIs
- Integrate Sentry (or similar) for production error tracking

### 2.2 Test Coverage

**Current:** ~10% coverage (91 test files for 800+ source files)
**Target:** 80% for critical paths

**Priority test targets:**
1. `lib/billingService.ts` — payment flows (untested, high risk)
2. `lib/inventoryService.ts` — core data management
3. `lib/portfolioService.ts` — portfolio calculations
4. `components/AuthContext.tsx` — authentication flows
5. E2E: checkout flow, login/signup, card CRUD operations

### 2.3 Input Validation

- Add Zod schemas for all external API responses (Gemini, eBay, MLB)
- Validate user inputs at form boundaries
- Sanitize any user-generated content rendered in the UI

---

## Priority 3 — Real Data Integration (Weeks 6-12)

Per `API_MIGRATION_PLAN.md`, migrate from mock data to real APIs:

### Phase 1: API Client Infrastructure (Weeks 6-7)
- Build unified API client with auth, retry, caching
- Implement feature flag system for gradual rollout
- Add response type validation with Zod

### Phase 2: External API Adapters (Weeks 7-10)
| API | Status | Priority | Notes |
|-----|--------|----------|-------|
| eBay Browse/Finding API | Stub only | High | Core marketplace data |
| PSA Cert Verification | Not started | High | Card authentication |
| BGS/SGC Grading APIs | Not started | Medium | Multi-grader support |
| ESPN/Sports Reference | Not started | Medium | Extended player stats |
| COMC/MySlabs | Not started | Low | Alternative marketplaces |

### Phase 3: Service Migration (Weeks 10-16)
- Migrate 82 mock-data services one at a time
- Each migration: add real API call → validate against mock → feature flag → release
- Start with highest-value services: pricing, inventory, grading

### Phase 4: Real-Time Data (Weeks 16-20)
- WebSocket subscriptions for live auction data
- Real-time price ticker updates
- Push notifications for watchlist alerts

---

## Priority 4 — Code Quality & Architecture (Ongoing)

### 4.1 Directory Restructuring

**Problem:** 404 flat files in `lib/`, 395 flat files in `components/`. No domain grouping.

**Recommended structure:**
```
lib/
  core/           # inventoryService, portfolioService, types
  analytics/      # all analytics services
  trading/        # trading, negotiation, marketplace
  social/         # social, messaging, sharing
  integrations/   # ebay, psa, mlb, gemini adapters
  dal/            # data access layer

components/
  layout/         # Sidebar, Header, Footer
  dashboard/      # Dashboard widgets
  cards/          # Card display, editing, grading
  trading/        # Trade, negotiate, marketplace UI
  analytics/      # Charts, reports, visualizations
  shared/         # Buttons, modals, form elements
```

### 4.2 Bundle Optimization

- Current: 259+ components loaded via lazy imports (good)
- Add bundle size budget enforcement in CI (workflow exists but not gated)
- Audit Recharts usage — largest vendor chunk
- Consider dynamic imports for PDF generation (jsPDF)

### 4.3 Type Safety

- Eliminate remaining `any` types
- Add strict TypeScript mode fully (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- Generate types from Supabase schema automatically

---

## Priority 5 — Production Infrastructure (Weeks 12-16)

### 5.1 Database Operations
- Convert `supabase-schema.sql` into versioned migrations
- Add database backup strategy
- Create indexes based on expected query patterns
- Set up connection pooling

### 5.2 Monitoring & Observability
- Error tracking: Sentry
- Structured logging: replace `console.log` with structured logger (partially done)
- Uptime monitoring: health check endpoint
- Business metrics: portfolio values, active users, feature usage

### 5.3 Security Audit
- Stripe webhook signature verification
- CORS policy review
- CSP headers configuration
- Rate limiting on API routes
- Dependency vulnerability scanning (workflow exists)

---

## Quick Wins (Can Do Anytime)

These deliver visible value with minimal effort:

| Task | Effort | Impact |
|------|--------|--------|
| Fix Dashboard.tsx build error | 1 hour | Unblocks everything |
| Add `<ErrorBoundary>` to App.tsx | 2 hours | Prevents white-screen crashes |
| Add env var validation at startup | 2 hours | Prevents runtime key errors |
| Wire auth into 5 most-used routes | 4 hours | Basic access control |
| Add Zod validation to Gemini responses | 3 hours | Prevents AI response crashes |
| Set up Sentry free tier | 2 hours | Visibility into production errors |
| Add loading skeletons to Dashboard | 3 hours | Better perceived performance |

---

## Recommended 90-Day Roadmap

```
Week 1-2:   Fix build + DAL foundation + auth wiring + env validation
Week 3-4:   Error boundaries + Sentry + test coverage for billing/auth
Week 5-6:   eBay API integration + PSA cert lookup + input validation
Week 7-8:   Directory restructure + bundle optimization + type safety
Week 9-10:  Service migration (top 20 services from mock → real)
Week 11-12: Real-time data + WebSocket infrastructure + monitoring
Week 13:    Security audit + production deployment checklist
```

---

## What NOT to Do Next

1. **Don't add more features** — 344 pages is more than enough surface area. Focus on depth over breadth.
2. **Don't start blockchain/IoT integration** — The foundation (auth, data persistence, error handling) must come first.
3. **Don't optimize performance prematurely** — Fix correctness first (real data, real auth, real error handling).
4. **Don't restructure directories yet** — Wait until the DAL and auth are solid; restructuring is easier with good test coverage.

---

## Key Files Reference

| Purpose | File |
|---------|------|
| Product roadmap | `PRD.md` |
| Production checklist | `PRODUCTION_READINESS.md` |
| API migration plan | `API_MIGRATION_PLAN.md` |
| Feature generation | `ORCHESTRATION.md` |
| Database schema | `supabase-schema.sql` |
| Build config | `vite.config.ts` |
| App router | `App.tsx` |
| Type definitions | `types.ts` |
| Feature catalog | `lib/featureCatalog.ts` |
| CI/CD | `.github/workflows/ci.yml` |
