# Beta feature exit criteria

Features marked `status: 'beta'` in [`lib/featureCatalog.ts`](../lib/featureCatalog.ts) are shipped in the UI but **not** treated as production-grade until they pass the checks below. Promote to `live` only when all **required** rows for that feature are satisfied (or document an explicit exception in the PR).

## Required for any promotion

| Criterion | Pass when |
|-----------|-----------|
| **Persistence** | User state survives refresh and syncs for signed-in users via `store` / DAL / Supabase (no device-only critical data unless the feature is explicitly offline-only). |
| **Data honesty** | Primary metrics are backed by **real inputs** (user portfolio, APIs, or defined mock mode labeled in UI) — not silent fabrication. |
| **Auth & tenancy** | No cross-user data leakage; RLS or equivalent enforced for server-backed keys. |
| **Errors** | Failing APIs show user-visible feedback (toast/error state), not blank screens. |
| **Tests** | At least one of: focused unit tests for core logic, integration test, or E2E path covering the happy path; no known P0 bugs open. |

## Per-feature notes (catalog `beta` IDs)

| ID | Feature | Extra gates before `live` |
|----|---------|---------------------------|
| `agentic-negotiation` | Agentic Negotiation | Playbooks/history on `store` or server; analytics persisted; Gemini failures degraded gracefully. |
| `liquidity-pool` | Institutional Liquidity Pool | Payout / quote logic reviewed for money-like flows; legal copy if simulating purchases. |
| `predictive-alpha` | Predictive Alpha Engine | Validated against real or imported comp signals; document confidence / mock mode. |
| `multi-agent` | Multi-Agent Intelligence | Agent outputs reproducible from inputs; audit trail export or on-screen “why” for recommendations. |
| `cross-correlation` | Cross-Asset Correlation | Live or user-uploaded series; no-only-simulated multi-asset claims without disclosure. |
| `visual-audit` | Visual Audit Simulation | Vision path security (image handling); grade probabilities labeled as estimates. |
| `consignment` | Consignment Tracker | Multi-user persistence; partner/fees model matches real consignment flows or is labeled demo. |
| `anomaly-detection` | Market Anomaly Detection | Signal source documented; alert fatigue mitigated (thresholds, dedupe). |
| `live-impact` | Live Game Impact Engine | Live scores or explicit “replay / demo” mode; latency expectations documented. |
| `vision-grading` | AI Vision Grading Lab | Same as visual-audit for uploads; no implied third-party grader certification. |
| `fractional-vault` | Fractional Vault & Copy-Trading | No implied securities offering; execution rails or clear “simulation only”. |
| `provenance-chain` | Provenance Chain & Digital Twin | Chain/mock distinction clear; no false verification claims. |

## Process

1. Implement persistence + data source improvements for the feature.
2. Add or extend tests; run `npm run test:coverage` and relevant E2E specs.
3. Update [`lib/featureCatalog.ts`](../lib/featureCatalog.ts): change `status` to `'live'` and refresh `description` to remove “prototype / simulated” language where accurate.
4. If the feature remains partially simulated, keep `beta` or add a short “Demo mode” label in the UI instead of promoting.
