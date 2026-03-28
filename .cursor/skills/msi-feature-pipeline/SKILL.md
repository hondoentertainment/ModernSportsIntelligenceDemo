---
name: msi-feature-pipeline
description: >-
  Runs the Modern Sports Intelligence feature orchestrator, validators, catalog
  wiring, and verify script. Use when adding or renaming features, wiring
  routes, updating lib/featureCatalog, or when the user mentions joe scripts,
  orchestrator, feature validator, or batch-builder.
---

# MSI feature pipeline

## Canonical files

- Feature catalog: **`lib/utils/featureCatalog.ts`** (re-exported from `lib/featureCatalog.ts`).
- App wiring: **`App.tsx`**, **`constants.tsx`** (or related route constants per orchestrator output).
- Generator: **`scripts/orchestrator.ts`**.

## Orchestrator (`joe`)

- npm script: **`npm run joe`** → `tsx scripts/orchestrator.ts`
- Generates service, widget, modal, page templates and wires **App.tsx**, **constants.tsx**, **feature catalog**.
- Required CLI args: `--name`, `--phase`, `--tier`, `--category`, `--description`, `--icon` (see file header in `scripts/orchestrator.ts`).

## Related scripts (package.json)

| Script | Purpose |
|--------|---------|
| `joe:batch` | `scripts/batch-builder.ts` |
| `joe:validate` | `scripts/feature-validator.ts` |
| `joe:diff` | `scripts/feature-diff.ts` |
| `joe:health` | `scripts/code-health.sh` |
| `joe:bundle` | `scripts/bundle-check.sh` |

Run **`joe:validate`** after catalog or route changes when appropriate.

## Full verification

- **`npm run verify`** — typecheck (release + strict), lint, format check, test coverage, production build. Use before large merges or releases.

## Agent workflow

1. Prefer **orchestrator** for new standardized features instead of hand-copying four files.
2. After edits to catalog or lazy imports, run **`joe:validate`** or **`npm run verify`** as scope dictates.
3. Keep **one canonical** export path for catalog utilities (avoid diverging `lib/featureCatalog.ts` vs `lib/utils/featureCatalog.ts`).

## Checklist (agent)

- [ ] New surface appears in catalog and routing if user-facing
- [ ] Icons and metadata match existing tier/category conventions
- [ ] Verify or validate run passes after structural changes
