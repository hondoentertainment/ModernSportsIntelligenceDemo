# Test coverage policy (whitelist gate)

## Goal

`npm run test:coverage` enforces a **baseline threshold** on an explicit **whitelist** in `vite.config.ts` (`test.coverage.include`), with `coverage.all: false` so untested files elsewhere do not dilute the gate.

**Current gate (2026-08-17):** `statements 98.4` / `branches 91.5` / `functions 99` / `lines 99` across 43 whitelisted files, measuring 98.54 / 92.09 / 99.36 / 99.17 — identical locally and in CI. Full **100% branches** is often impractical (Vite-inlined `import.meta.env`, unreachable defensive branches, ternary explosion).

Raise thresholds in `vite.config.ts` only after `npm run test:coverage` exceeds them, and leave **~0.15–0.5pp of headroom** under the measured value. The gate is a ratchet, not a high-water mark: set flush against the measurement and a single incidental uncovered statement fails CI with an opaque threshold error instead of a useful signal.

## What is included

Core logic that is practical to unit-test in Vitest (jsdom): DAL, utilities, schemas, resilience, analytics helpers, shared lib modules that are not giant feature catalogs, etc.

## What is excluded (and why)

| Pattern                                                                                                      | Reason                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `pages/**`, `components/**`, `contexts/**`, `App.tsx`, `main.tsx`                                            | UI-heavy; primary verification via **E2E** (`npm run test:e2e`) and manual flows.                                                          |
| `api/**`                                                                                                     | Vercel/serverless handlers; not part of the Vite test bundle.                                                                              |
| `lib/**/*Service.ts(x)`                                                                                      | Large **feature catalog** of demo/business services; covering all of them would be enormous with little marginal value vs. sampling + E2E. |
| `lib/priceHistory.ts`                                                                                        | Legacy duplicate; runtime uses `lib/analytics/priceHistory.ts`.                                                                            |
| `lib/utils/gemini.ts`, `lib/gemini.ts`                                                                       | Heavy AI + network; covered indirectly via `geminiClient` tests and integration.                                                           |
| `lib/**/useSupabaseInventory.ts`                                                                             | Large React hook + Supabase; better suited to integration/E2E tests.                                                                       |
| Root `lib/*.ts` that are **thin re-exports** only (e.g. `lib/statsService.ts` → `lib/utils/statsService.ts`) | No logic to test; coverage targets the **canonical** file under `lib/utils/` / `lib/analytics/`.                                           |

## Changing the policy

- To **expand** the gate: add paths to `test.coverage.include` and add tests until `test.coverage.thresholds` pass (or bump thresholds after review).
- To **tighten** toward 100%: increase the four threshold numbers in `vite.config.ts` once the whitelist metrics exceed them in `npm run test:coverage`.
- For **UI-heavy** areas: add component tests under `tests/components/` or Playwright specs — keep them out of the whitelist unless you want the gate to apply.

## Commands

```bash
npm run test          # unit + integration (Vitest)
npm run test:coverage # same + threshold gate on included files (see vite.config.ts)
npm run test:e2e      # UI flows (Playwright)
```
