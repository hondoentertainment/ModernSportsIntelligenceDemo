# MVP launch scope lock

This document freezes what is in and out for the fast MVP production launch.
Updated 2026-07-19 for the Bloomberg terminal core promotion.

## Launch window

- Target: 2-4 week MVP launch → extended GA with terminal core.
- Strategy: feature-first delivery with hard quality gates; **data truth before Labs sprawl**.

## In scope for MVP GA

- Collection lifecycle: add/edit/remove assets, sold vault, consignment status, watchlist and target flows.
- Core decision surfaces: dashboard, favorites, deep search, profile migration status.
- Pricing truth indicators: provenance, freshness, degraded-state coverage banners, **consensus market ledger**.
- Holdings-linked catalysts on the dashboard + `/catalyst-market`.
- Analyst War Room (`/war-room`) as Alpha terminal home.
- Institutional export: collector audit dossier (`/audit-dossier`) + audit trail.
- Dealer floor: Card Show Mode (`/card-show-mode`) on mobile nav.
- Developer distribution desk: `/api-licensing` (live `/api/*` catalog; metering UI may still show demo keys).
- Supabase-backed auth and inventory sync for signed-in users.
- CI and release gates listed in `docs/RELEASE_GATES.md`.

## Explicitly out of MVP scope

- Marketplace execution rails (true P2P order book, broker APIs, copy-trading execution).
- Regulatory-complete tax-lot exports (Schedule D-grade compliance coverage).
- Enterprise controls (SSO, advanced RBAC provisioning, customer-specific policy packs).
- Full production vision grading pipeline as a _grader network_ (in-session vision engine is live; third-party grader APIs still key-gated).
- Long-tail Labs routes (remain behind `VITE_FF_ENABLE_BETA_SURFACES`).
- `fractional-vault` until legal sign-off.

## Workstream split

- `feature-surface`: UI flows and route-level polish.
- `data-auth`: Supabase migration, auth/session, valuation provenance correctness, eBay/PSA live flags.
- `quality-ops`: tests, CI/release gates, runbooks, staged rollout controls.

## Launch blocking defects

Treat as release blockers:

- Any Sev-1 or Sev-2 bug in auth, collection persistence, migration, or valuation trust labeling.
- Any failing required CI gate.
- Any unresolved data leakage or cross-user access concern.
