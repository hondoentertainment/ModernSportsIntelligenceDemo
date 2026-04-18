# Beta promotion implementation plan (wave 1)

Scope: `agentic-negotiation`, `predictive-alpha`, `multi-agent`.

**Status:** Wave 1 is complete (catalog `live`, tests, and evidence in [`docs/BETA_EXIT_READINESS_PASS.md`](./BETA_EXIT_READINESS_PASS.md)).

Objective: complete the remaining blockers identified in `docs/BETA_EXIT_READINESS_PASS.md` so each feature can be promoted from `beta` to `live` only when criteria in `docs/BETA_FEATURE_EXIT_CRITERIA.md` are fully met.

---

## Execution order

1. `agentic-negotiation` (highest gap closure in persistence + analytics truth)
2. `predictive-alpha` (real-signal validation + confidence semantics)
3. `multi-agent` (reproducibility + auditable rationale/export)

---

## Ticket A1 — Agentic negotiation: persistent history + analytics

**Goal**

- Persist negotiation sessions, activity feed, escrow timeline, and analytics source records (not just campaigns/playbook selection).

**Implementation tasks**

- Add store/DAL-backed repositories for:
  - negotiations
  - escrow transactions
  - activity events
  - acquisition results
- Replace in-memory arrays in `lib/trading/autonomousAcquisitionService.ts` read paths with repository reads.
- Keep simulation mode explicit until a real execution backend exists.
- Ensure `createCampaign`, status transitions, and derived analytics refresh from persisted records.

**Acceptance criteria**

- Data survives reload and is visible across all tabs in `components/AutonomousAcquisitionModal.tsx`.
- Analytics tab numbers match persisted source records.
- Simulated-data disclosure remains visible and accurate.
- No regression in campaign creation/pause/resume behavior.

**Test plan**

- Unit: persistence and hydration for each data family.
- E2E: create/edit campaign and verify negotiations/analytics persist after reload.
- Command: `npm run test -- tests/lib/autonomousAcquisitionService.test.ts`

---

## Ticket A2 — Agentic negotiation: graceful failures

**Goal**

- Ensure user-visible failure behavior for fetch/load/parse faults.

**Implementation tasks**

- Add safe-fallback parsing wrappers and toastable error states where data load can fail.
- Add guarded rendering defaults for empty/corrupt data.

**Acceptance criteria**

- No blank panels on malformed persisted payloads.
- User sees non-blocking feedback when data falls back.

**Test plan**

- Unit: invalid payload recovery.
- E2E: injected malformed local data still renders shell.

---

## Ticket P1 — Predictive alpha: real-signal validation mode

**Goal**

- Validate projections against real/imported comp signals, or keep explicit demo mode if unavailable.

**Implementation tasks**

- Add a signal source indicator (for example `historical_only`, `imported_comps`, `hybrid`) at forecast output boundary.
- If imported/external comps exist, blend into trajectory and confidence scoring.
- If not, retain beta and keep strong disclosure language.

**Acceptance criteria**

- Confidence and output reflect signal source, not only heuristics.
- UI clearly labels the data source and limitations.

**Test plan**

- Unit: deterministic forecast behavior per signal source.
- E2E: sparse data path remains stable and labeled.

---

## Ticket P2 — Predictive alpha: confidence contract

**Goal**

- Make confidence explainable and auditable.

**Implementation tasks**

- Add confidence breakdown fields (history depth, liquidity quality, scarcity quality, source weighting).
- Render compact explanation in `components/PredictiveAlphaModal.tsx`.

**Acceptance criteria**

- Users can see why confidence is high/low.
- Confidence no longer appears as a black-box percentage.

**Test plan**

- Unit: confidence breakdown snapshots.

---

## Ticket M1 — Multi-agent reproducibility baseline

**Goal**

- Improve output reproducibility from stable inputs.

**Implementation tasks**

- Add a deterministic run seed/hash derived from normalized portfolio input.
- Persist prompt version + model identifier + input hash with recommendation records.
- Expose these metadata fields in war room details panel.

**Acceptance criteria**

- Re-running with identical inputs records matching input hash.
- Recommendation records include model/prompt metadata for traceability.

**Test plan**

- Unit: hash generation and metadata persistence.

---

## Ticket M2 — Multi-agent audit export

**Goal**

- Provide user-facing auditability for recommendations.

**Implementation tasks**

- Add export action in war room for current thesis package:
  - summary/risk/action
  - per-agent rationale
  - input hash + timestamp + model metadata
- Export format: JSON first, optional CSV follow-up.

**Acceptance criteria**

- Export succeeds from UI and contains required fields.
- Export reflects currently displayed thesis state.

**Test plan**

- Unit: export serializer.
- E2E: trigger export and validate file payload skeleton.

---

## Promotion gate checklist (per feature)

Before setting `status: 'live'` in `lib/utils/featureCatalog.ts`, confirm:

- Persistence: durable for signed-in users
- Data honesty: source + simulation labeling is explicit
- Auth/tenancy: no cross-user leakage for server-backed data
- Errors: user-visible degradation, no silent blank states
- Tests: unit/integration/E2E evidence exists and passes
- Feature-specific extra gate from `docs/BETA_FEATURE_EXIT_CRITERIA.md` is satisfied

---

## Suggested PR slicing

1. PR-1: Agentic negotiation persistence + tests
2. PR-2: Predictive signal source + confidence contract + tests
3. PR-3: Multi-agent reproducibility metadata + export + tests
4. PR-4: Promotion pass (`featureCatalog` status/description updates + docs evidence refresh)
