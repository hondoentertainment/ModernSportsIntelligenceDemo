# Beta feature exit criteria

Features marked `status: 'beta'` in [`lib/utils/featureCatalog.ts`](../lib/utils/featureCatalog.ts) are shipped in the UI but **not** treated as production-grade until they pass the checks below. Promote to `live` only when all **required** rows for that feature are satisfied (or document an explicit exception in the PR).

## Required for any promotion

| Criterion          | Pass when                                                                                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Persistence**    | User state survives refresh and syncs for signed-in users via `store` / DAL / Supabase (no device-only critical data unless the feature is explicitly offline-only). |
| **Data honesty**   | Primary metrics are backed by **real inputs** (user portfolio, APIs, or defined mock mode labeled in UI) — not silent fabrication.                                   |
| **Auth & tenancy** | No cross-user data leakage; RLS or equivalent enforced for server-backed keys.                                                                                       |
| **Errors**         | Failing APIs show user-visible feedback (toast/error state), not blank screens.                                                                                      |
| **Tests**          | At least one of: focused unit tests for core logic, integration test, or E2E path covering the happy path; no known P0 bugs open.                                    |

## Per-feature notes (catalog `beta` IDs)

**2026-09-05 quarterly sweep:** `fractional-vault` is the **only** remaining `status: 'beta'` row. It stayed beta (legal-gated). No other IDs were hidden or demoted this cycle.

**Removed from this table when promoted:** `consignment` (Consignment Tracker) is now `live` with inventory + notes-codec persistence and in-UI disclosure that fee comparisons are illustrative. `cross-correlation` is `live` with a synthetic-data banner on `/cross-asset-correlation` and honest copy (no implied live feeds). `anomaly-detection` is `live` with documented signal sources in the widget/modal and per-card dedupe (max 2 alerts per card). `agentic-negotiation` is `live` with DAL-backed stores for campaigns plus negotiation/escrow/results/activity datasets, analytics aligned to persisted acquisitions, corrupt-store recovery with user-visible toast, and simulated-execution disclosure on all Autonomous Acquisition tabs (`/autonomous-acquisition`). `predictive-alpha` is `live` with explicit signal-source modes, auditable confidence breakdown in the Predictive Alpha modal (Dashboard / Breakout Radar), and optional imported-comp snapshots wired through price history. `multi-agent` is `live` with deterministic portfolio input fingerprint, prompt version + model id on thesis and recommendation metadata, on-screen traceability in the War Room, and JSON export of the thesis package (`/war-room`). **`visual-audit`** is `live` at `/pre-grade-intelligence` with `BetaFeatureBanner` demo labeling and store-backed prediction history. **`live-impact`** is `live` at `/live-impact` with explicit simulated replay disclosure in `BetaFeatureBanner`. **`liquidity-pool`**, **`vision-grading`**, and **`provenance-chain`** are `live` (wave-3 persistence + tests).

| ID                 | Feature                         | Extra gates before `live`                                                   |
| ------------------ | ------------------------------- | --------------------------------------------------------------------------- |
| `fractional-vault` | Fractional Vault & Copy-Trading | Legal/securities sign-off on the "Simulation only" disclosure. No engineering blocker. |

## Process

1. Implement persistence + data source improvements for the feature.
2. Add or extend tests; run `npm run test:coverage` and relevant E2E specs.
3. Update [`lib/utils/featureCatalog.ts`](../lib/utils/featureCatalog.ts): change `status` to `'live'` and refresh `description` to remove “prototype / simulated” language where accurate.
4. If the feature remains partially simulated, keep `beta` or add a short “Demo mode” label in the UI instead of promoting.
