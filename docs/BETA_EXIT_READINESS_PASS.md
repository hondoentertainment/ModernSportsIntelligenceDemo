# Beta exit readiness — wave 1 complete (agentic negotiation, predictive alpha, multi-agent)

Snapshot against [`BETA_FEATURE_EXIT_CRITERIA.md`](./BETA_FEATURE_EXIT_CRITERIA.md). **Wave 1 features are promoted to `status: 'live'`** in [`lib/utils/featureCatalog.ts`](../lib/utils/featureCatalog.ts). Tickets and acceptance criteria lived in [`BETA_PROMOTION_IMPLEMENTATION_PLAN.md`](./BETA_PROMOTION_IMPLEMENTATION_PLAN.md).

## `agentic-negotiation` (Autonomous Acquisition + playbooks) — **live**

| Area           | Shipped                                                                                                                                                                                                                                                                                                                                       | Residual demo / limits                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| State          | Campaigns, negotiations, escrow, activity, acquisition results, and analytics source rows persist via MSI `store` / DAL; read paths use repositories in [`autonomousAcquisitionService.ts`](../lib/trading/autonomousAcquisitionService.ts).                                                                                                  | Execution remains simulated; in-modal disclosure that data is demo-grade, not live marketplace trading. |
| Disclosure     | [`AUTONOMOUS_ACQUISITION_DISCLOSURE`](../lib/trading/autonomousAcquisitionService.ts) at top of [`AutonomousAcquisitionModal.tsx`](../components/AutonomousAcquisitionModal.tsx).                                                                                                                                                             | —                                                                                                       |
| Errors / tests | Sanitize / corrupt payload handling with user-visible feedback where applicable. Unit tests: [`tests/lib/autonomousAcquisitionService.test.ts`](../tests/lib/autonomousAcquisitionService.test.ts). E2E: campaign persists after reload in [`war-room-predictive-acquisition.spec.ts`](../tests/e2e/war-room-predictive-acquisition.spec.ts). | —                                                                                                       |

## `predictive-alpha` (Predictive Alpha Engine) — **live**

| Area           | Shipped                                                                                                                                                                                                                     | Residual demo / limits                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Inputs         | Portfolio, [`getCardHistory`](../lib/analytics/priceHistory.ts), liquidity, scarcity; signal modes `historical_only` / `hybrid` / `imported_comps` in [`predictiveAlpha.ts`](../lib/analytics/predictiveAlpha.ts).          | Heuristics + optional imported anchors — not third-party market execution. |
| Disclosure     | Modal labels signal source; confidence breakdown (history depth, liquidity, scarcity, weighting) in [`PredictiveAlphaModal.tsx`](../components/PredictiveAlphaModal.tsx).                                                   | —                                                                          |
| Errors / tests | Unit: [`tests/lib/predictiveAlpha.test.ts`](../tests/lib/predictiveAlpha.test.ts). E2E: sparse predictive engine path in [`war-room-predictive-acquisition.spec.ts`](../tests/e2e/war-room-predictive-acquisition.spec.ts). | —                                                                          |

## `multi-agent` (Analyst War Room committee) — **live**

| Area                  | Shipped                                                                                                                                                                                                                                                                                                                  | Residual demo / limits                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| State                 | Last thesis: `msi_war_room_last_thesis_v1` via `store` in [`AnalystWarRoom.tsx`](../components/AnalystWarRoom.tsx). Recommendations via [`upsertAgentRecommendation`](../lib/utils/differentiatorData.ts) with `inputHash`, `promptVersion`, `modelId` from [`MultiAgentService.ts`](../lib/utils/MultiAgentService.ts). | Gemini narrative is **non-deterministic**; fingerprint and metadata correlate inputs and config, not wording. |
| Traceability / export | Deterministic input fingerprint, prompt version, model id ([`warRoomThesisAudit.ts`](../lib/utils/warRoomThesisAudit.ts)); on-screen panel + **Export thesis JSON** in War Room.                                                                                                                                         | —                                                                                                             |
| Errors / tests        | Gemini failures: toast + null thesis in `MultiAgentService`. Unit: [`tests/lib/warRoomThesisAudit.test.ts`](../tests/lib/warRoomThesisAudit.test.ts). E2E: War Room load + refresh + export skeleton in [`war-room-predictive-acquisition.spec.ts`](../tests/e2e/war-room-predictive-acquisition.spec.ts).               | —                                                                                                             |

## Related catalog rows

Live routes such as `war-room`, `playbook-templates`, and `agent-thesis` remain separate catalog entries; promoting `multi-agent` documents the committee/traceability slice that powers the War Room experience.

## Follow-ups (outside wave 1)

- Other `beta` IDs in `featureCatalog` still subject to [`BETA_FEATURE_EXIT_CRITERIA.md`](./BETA_FEATURE_EXIT_CRITERIA.md) before `live`.
- Optional: CSV export for War Room audit package (plan noted JSON first).

---

# Beta wave 2 — safety pass for MVP launch (no promotions)

Audit of the 7 remaining `status: 'beta'` IDs in [`lib/utils/featureCatalog.ts`](../lib/utils/featureCatalog.ts) against [`BETA_FEATURE_EXIT_CRITERIA.md`](./BETA_FEATURE_EXIT_CRITERIA.md). None passes the bar to promote to `live`. Per [`MVP_LAUNCH_SCOPE.md`](./MVP_LAUNCH_SCOPE.md), beta promotions are explicitly out of MVP scope. This pass instead removes the most exposed risks so the betas are safe to keep visible during launch.

## Outcomes

| ID                    | Reachable                                              | Action taken (this pass)                                                                                                                                                                                             | Status after pass             |
| --------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `live-impact`         | `/live-impact`                                         | Replaced misleading "real-time" copy with prototype label; added **Demo data** badge.                                                                                                                                | beta, prod-safe disclosure    |
| `visual-audit`        | catalog `path: null` (modal-only)                      | Added "AI estimate — not an official grade" amber callout under the Predicted Grade panel in [`GradingAuditModal.tsx`](../components/GradingAuditModal.tsx).                                                         | beta, prod-safe disclosure    |
| `vision-grading`      | `/grading-vision-engine` (not in catalog `path`)       | Header chip + persistent disclaimer banner stating the lab does not certify cards.                                                                                                                                   | beta, prod-safe disclosure    |
| `liquidity-pool`      | catalog `path: null` (widget unmounted)                | Added `initInstantBuyService(userId)` and per-user storage key (`msi_instant_buy_history__<userId>` / `__guest`) so two accounts on the same browser cannot read each other's history once the feature is surfaced.  | beta, tenancy-safe            |
| `fractional-vault`    | `/fractional-vault`                                    | Prototype copy + **Beta · Simulation only** chip + securities disclaimer banner ("not an offer or sale of a security ... live execution rails and regulatory review are prerequisites").                             | beta, prod-safe disclosure    |
| `fractional-vault-v2` | catalog `path: '/fractional-vault'` (collided with v1) | Set catalog `path: null`; v2 was unreachable behind v1's route. Description updated to reflect "catalog-only" status.                                                                                                | beta, route collision removed |
| `provenance-chain`    | `/provenance`                                          | Replaced "Blockchain-backed ownership history and authentication" header with honest prototype copy; added disclaimer that authenticity scores are mock and must not be relied on for buying/selling/authenticating. | beta, prod-safe disclosure    |

## What did **not** ship in this pass (wave 3 candidates)

- **Persistence for `fractional-vault` and `provenance-chain`** — services are seeded in-memory; promoting requires Supabase-backed schemas and RLS for shares, dividends, governance votes, and provenance records.
- **Tests** — `live-impact`, `vision-grading`, `provenance-chain`, and the fractional vault have no dedicated unit/E2E coverage.
- **`liquidity-pool` simulated-pool disclosure** — `LiquidityPoolWidget` hardcodes a `$250K` pool capitalization without a "demo" label. Safe to defer until the widget is mounted.
- **`fractional-vault` securities/legal review** — required before any real execution path lands; copy disclaimer is a stop-gap.
- **`provenance-chain` chain/mock split in the modal** — header banner covers the page; per-tab/per-card labels inside the modal still need review.

## Process notes

- Wave 2 prioritized **misleading copy** and **tenancy** because both are visible in production today. Persistence and tests are tracked separately under wave 3 and `BETA_FEATURE_EXIT_CRITERIA.md`.
- No `status` value changed in `featureCatalog.ts` for any wave-2 feature; all seven remain `beta`.

---

# Beta wave 3 — persistence and tests (in progress)

Engineering work to bring the 7 remaining betas to the bar for `status: 'live'`. Wave-3 explicitly does not touch user-facing copy (wave-2 covered that) or product scope (out of MVP per [`MVP_LAUNCH_SCOPE.md`](./MVP_LAUNCH_SCOPE.md)). It only adds the persistence + test coverage that the criteria require.

## Outcomes

| ID                    | Wave-3 status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `provenance-chain`    | **Done.** `registerCard()` persists via the DAL with per-user keying (`msi_provenance_registered_v1__<userId>` / `__guest`); `getMyRegisteredCards()` returns persisted entries first, then seeded "You"-owned mocks. `initProvenanceService(userId)` wired into [`SyncSchedulerInitializer.tsx`](../components/SyncSchedulerInitializer.tsx) next to `initInstantBuyService` and `initPriceHistory`. Unit tests in [`tests/lib/provenanceChainPersistence.test.ts`](../tests/lib/provenanceChainPersistence.test.ts) cover round-trip, cross-user isolation, and guest fallback. |
| `liquidity-pool`      | Pending. Per-user storage key landed in wave 2 (`initInstantBuyService`); wave-3 adds a unit test for `recordInstantBuy` round-trip and surfaces the widget on the Dashboard.                                                                                                                                                                                                                                                                                                                                                                                                     |
| `live-impact`         | Pending. Either real sports-feed adapter behind a flag or explicit demo-only commitment; snapshot test for `getLiveImpactAlerts`.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `visual-audit`        | Pending. Modal-only; needs E2E covering upload → result.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `vision-grading`      | Pending. Same image-handling decision as `visual-audit`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `fractional-vault`    | Pending. Service is pure catalog read; no engineering blocker — gated on legal/securities review of the "Simulation only" disclosure.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `fractional-vault-v2` | Pending. Catalog-only (`path: null`); decide whether to remove from catalog or merge with v1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

Later promotions (after this wave-3 snapshot): `provenance-chain`, `liquidity-pool`, `live-impact`, `visual-audit`, and `vision-grading` are `live`. `fractional-vault-v2` was removed. See the September 2026 sweep below for current catalog truth.

## Promotion checklist (when ready)

Once a feature passes its wave-3 row, flip `status` to `'live'` in [`lib/utils/featureCatalog.ts`](../lib/utils/featureCatalog.ts) and refresh the `description` to drop any "prototype / simulated" language no longer accurate.

---

# September 2026 quarterly catalog sweep (2026-09-05)

Confirmation pass against the 90-day rule in [`NEXT_STEPS.md`](../NEXT_STEPS.md): features `beta` for 90+ days either go `live` or get hidden. No Labs features added; no directory restructure; `fractional-vault` was **not** flipped to `live`.

## Audit inputs

- [`lib/utils/featureCatalog.ts`](../lib/utils/featureCatalog.ts) core + [`featureCatalogRouteSupplement.ts`](../lib/utils/featureCatalogRouteSupplement.ts)
- Default discovery: `DISCOVERABLE_FEATURE_CATALOG` (hides `beta` / `demo` unless `VITE_FF_ENABLE_BETA_SURFACES` / `VITE_FF_ENABLE_DEMO_SURFACES`)
- Labs route gate: [`lib/productionLaunch.ts`](../lib/productionLaunch.ts) (`isBetaSurfacesEnabled`)
- Exit tracker: [`lib/betaFeatureExit.ts`](../lib/betaFeatureExit.ts) (historical six-ID list; catalog truth is `status` on `FEATURE_CATALOG`)

## Outcomes

| ID / surface                                                                          | Status after sweep     | Action                                                                                                                                                           |
| ------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fractional-vault`                                                                    | **beta** (legal-gated) | **Stayed beta.** Hidden from Feature Directory / search by default. No engineering blocker — securities/"Simulation only" sign-off still required before `live`. |
| `fractional-vault-v2`                                                                 | **absent**             | Already removed (duplicate of v1). Sweep confirmed it is not in `FEATURE_CATALOG`.                                                                               |
| `provenance-chain`, `vision-grading`, `liquidity-pool`, `visual-audit`, `live-impact` | **live**               | Already promoted in wave 3. No demotion.                                                                                                                         |
| Auto-supplement `demo` rows                                                           | **demo**               | Already hidden from default discovery. No additional hides.                                                                                                      |
| New betas                                                                             | **none**               | No new `status: 'beta'` rows landed since the August NEXT_STEPS edition.                                                                                         |

**Hidden / demoted this cycle:** none.

**Next sweep:** ~2026-12.

Pinned by `tests/lib/featureCatalog.test.ts` — `keeps fractional-vault as the only catalog beta (2026-09 sweep)`.
