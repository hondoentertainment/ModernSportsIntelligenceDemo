# MVP launch scope lock

This document freezes what is in and out for the fast MVP production launch.

## Launch window

- Target: 2-4 week MVP launch.
- Strategy: feature-first delivery with hard quality gates.

## In scope for MVP GA

- Collection lifecycle: add/edit/remove assets, sold vault, consignment status, watchlist and target flows.
- Core decision surfaces: dashboard, favorites, deep search, profile migration status.
- Pricing truth indicators: provenance, freshness, and degraded-state coverage banners.
- Supabase-backed auth and inventory sync for signed-in users.
- CI and release gates listed in `docs/RELEASE_GATES.md`.

## Explicitly out of MVP scope

- Promotion of beta catalog features to `live`.
- Marketplace execution rails (true P2P order book, broker APIs, copy-trading execution).
- Regulatory-complete tax-lot exports (Schedule D-grade compliance coverage).
- Enterprise controls (SSO, advanced RBAC provisioning, customer-specific policy packs).
- Full production vision grading pipeline and third-party grader integrations.

## Workstream split

- `feature-surface`: UI flows and route-level polish.
- `data-auth`: Supabase migration, auth/session, valuation provenance correctness.
- `quality-ops`: tests, CI/release gates, runbooks, staged rollout controls.

## Launch blocking defects

Treat as release blockers:

- Any Sev-1 or Sev-2 bug in auth, collection persistence, migration, or valuation trust labeling.
- Any failing required CI gate.
- Any unresolved data leakage or cross-user access concern.
