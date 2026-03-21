# Data Access Layer (DAL) & SyncedStore

This document ties together the production persistence stack introduced under **[PRODUCTION_READINESS.md §1.1](../PRODUCTION_READINESS.md#11-replace-localstorage-with-real-backend-services)** (*Replace localStorage with Real Backend Services*).

## Phase 1.1 in one paragraph

The roadmap calls for moving off ad hoc `localStorage` toward durable backends. The codebase implements that in two complementary layers: an **async** DAL for inventory/targets and typed JSON (`lib/dal.ts`), and a **synchronous** cache + adapter pipeline (`lib/dal/syncStore.ts`, `lib/dal/index.ts`) used by most services. App startup calls **`initDAL`** once so the correct adapter (local vs Supabase) is selected.

## File map

| Piece | Role |
|--------|------|
| [`lib/dal.ts`](../lib/dal.ts) | `createDataAccessLayer(userId)`, `IDataAccessLayer`, `DAL_KEYS`, `SyncMeta`. Async API: `getCards` / `setCards` / `getTargets` / `setTargets` / `getJson` / `setJson` / `remove`. Re-exports **`initDAL`** from `lib/dal/index.ts` so `import { initDAL } from './lib/dal'` works (the folder entrypoint is not shadowed by the file). |
| [`lib/dal/index.ts`](../lib/dal/index.ts) | **`initDAL(userId)`** — sets `LocalStorageAdapter` or `SupabaseStorageAdapter`, assigns it to **`syncStore`** via `store.setAdapter`, and triggers **`store.hydrate()`** for signed-in Supabase users. Also exports `store`, `dal` (adapter helpers), and adapter classes. |
| [`lib/dal/syncStore.ts`](../lib/dal/syncStore.ts) | **`store`** singleton: synchronous `get` / `set` / `remove` / `has` with in-memory cache, batched async flush to the active `StorageAdapter`, and a localStorage fast path for sync reads/writes. This is the intended replacement for direct `localStorage` in services that need synchronous APIs. |
| [`lib/dal/StorageAdapter.ts`](../lib/dal/StorageAdapter.ts) | `StorageAdapter` interface and `setAdapter` / `getAdapter` used by `initDAL` and flush logic. |
| [`tests/lib/dal.test.ts`](../tests/lib/dal.test.ts) | Unit tests for the localStorage-backed DAL path. |
| [`tests/lib/syncStore.test.ts`](../tests/lib/syncStore.test.ts) | Tests for `SyncedStore` behavior. |

## Startup: where `initDAL` runs

Call **`initDAL(user?.id ?? null)`** once when auth state is known (e.g. [`App.tsx`](../App.tsx) after the user session is available). Until this runs, code that relies on the adapter stack should follow existing patterns (many services only use `store`, which still falls back to reading `localStorage` on cache miss).

## Migration guide for new code

1. **Prefer `store` for generic key/value JSON** (same keys as before — `store` persists through the adapter when authenticated):

   ```ts
   import { store } from '../dal/syncStore';

   const data = store.get<MyType>('msi_some_key', defaultValue);
   store.set('msi_some_key', data);
   ```

2. **Use `createDataAccessLayer` / `IDataAccessLayer`** for first-class entities (cards, targets) and when you need the documented `DAL_KEYS` contract — see the header comment in [`lib/dal.ts`](../lib/dal.ts).

3. **Do not** add new raw `localStorage.getItem` / `setItem` in services except for truly ephemeral UI (e.g. sidebar collapse), per PRODUCTION_READINESS §1.1.

## Optional migration completed in-repo

- **`lib/useFavorites.ts`** was an unused duplicate of the favorites hook that read/wrote **`localStorage` directly**. It now **re-exports** [`lib/utils/useFavorites.ts`](../lib/utils/useFavorites.ts), which uses **`store`** and stays consistent with DAL-backed persistence. Production pages already import from `lib/utils/useFavorites`.

## Next migration batches (priority order)

Aligned with [PRODUCTION_READINESS.md §1.1](../PRODUCTION_READINESS.md#11-replace-localstorage-with-real-backend-services): **inventory → billing-related → trading**. Use `store` / `IDataAccessLayer` and remove raw `localStorage` except ephemeral UI keys.

| Batch | Focus | Examples (grep `localStorage` under `lib/` and migrate) |
|-------|--------|-----------------------------------------------------------|
| **1 — Inventory & portfolio** | Cards, targets, goals, registry, notifications tied to holdings | **Canonical:** `lib/utils/goalPlannerService.ts`, `lib/core/setRegistryService.ts`, `lib/utils/notificationCenterService.ts`, `lib/analytics/prospectPipelineService.ts`, `lib/analytics/rebalancingAlertService.ts`. Root `lib/goalPlannerService.ts`, `lib/notificationCenterService.ts`, etc. **re-export** those modules. **`lib/useInventory.ts`** → **`lib/utils/useInventory.ts`**. |
| **2 — Billing & account** | Stripe-adjacent state, auth history, compliance | **Canonical:** `lib/utils/authenticationService.ts`, `lib/utils/taxHarvestService.ts`, `lib/utils/hobbyIncomeService.ts`, `lib/utils/complianceCenterService.ts` (all use **`store`**). Root **`lib/authenticationService.ts`**, **`lib/taxHarvestService.ts`**, etc. re-export utils — import either path. Next: Stripe/billing modules that still use raw `localStorage` (if any). |
| **3 — Trading & marketplace** | Deals, listings, negotiation, liquidity | **Canonical:** `lib/trading/*` (persistence via **`store`**). Root `lib/dealRoomService.ts`, `lib/p2pMarketplaceService.ts`, `lib/marketplaceAggregatorService.ts`, `lib/differentiatorData.ts`, etc. are **thin barrels** → `trading/` or `utils/differentiatorData`. Pages: **`useSupabaseInventory`** for inventory (Favorites, Compare, Trends aligned). |

After each batch: smoke-test signed-in Supabase user (hydrate/flush), run relevant unit tests, and avoid new raw `localStorage` in migrated modules.

### Root `lib/*.ts` barrel waves (duplicate cleanup)

Large root files that already have a same-named twin under `lib/utils`, `lib/analytics`, `lib/core`, `lib/trading`, or `lib/social` are replaced with a **thin re-export** so there is a single canonical implementation. Batch 3 covered trading-heavy names; a **second wave** (largest remaining duplicates first) barreled 45 more modules (e.g. `realTimePriceEngineService`, `smartNotificationsService`, `gemini`, `socialService`). To run another slice: adjust the slice size in [`scripts/barrel-wave2.mjs`](../scripts/barrel-wave2.mjs), run `node scripts/barrel-wave2.mjs`, then `npm run typecheck` and `npx vitest run`.

## See also

- [PRODUCTION_READINESS.md §1.1](../PRODUCTION_READINESS.md#11-replace-localstorage-with-real-backend-services) — roadmap status and remaining work
- [docs/SUPABASE_TYPES.md](./SUPABASE_TYPES.md) — generated types for Supabase-backed paths
- [docs/BETA_FEATURE_EXIT_CRITERIA.md](./BETA_FEATURE_EXIT_CRITERIA.md) — when to mark catalog features `live` vs `beta`
