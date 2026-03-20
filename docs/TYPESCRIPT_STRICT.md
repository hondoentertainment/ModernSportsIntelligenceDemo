# TypeScript strict mode (incremental adoption)

This repo’s default TypeScript config (`tsconfig.json`) does **not** enable [`strict`](https://www.typescriptlang.org/tsconfig#strict). A separate config, `tsconfig.strict.json`, extends the base config and sets `compilerOptions.strict` to `true` so you can opt in to stricter checks without changing day-to-day builds until you are ready.

## Commands

| Script | What it checks |
|--------|----------------|
| `npm run typecheck` | `tsconfig.release.json` — curated include list (CI-style gate today). |
| `npm run typecheck:strict` | `tsconfig.strict.json` — same base as root, with `strict: true`. |

Run strict checks locally:

```bash
npm run typecheck:strict
```

## Why adopt incrementally?

`strict` turns on a bundle of checks (`strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `useUnknownInCatchVariables`, plus `alwaysStrict`). Large codebases often have hundreds of pre-existing violations; fixing them in one shot is risky. Incremental adoption keeps `main` green while you tighten types file by file or area by area.

## Practical adoption steps

1. **Baseline** — Run `npm run typecheck:strict` and capture the error list (or fix count). Treat this as a backlog, not a blocker, unless you promote strict to CI.
2. **Prefer local wins** — Enable stricter checks in new code; when touching a file, fix nearby strict errors if cheap.
3. **Narrow scope** — For a focused pass, you can temporarily add an `include` array to a dedicated config (or extend `tsconfig.release.json` with `strict: true`) so only part of the tree is checked under strict mode.
4. **Use types deliberately** — Replace `any` with unknown + narrowing, add explicit null checks, type function parameters and return values on exported APIs.
5. **CI policy** — When strict is clean (or clean enough), consider switching `typecheck` to use `tsconfig.strict.json` or adding `typecheck:strict` to CI as a non-blocking or required job.

## What `tsconfig.strict.json` adds

Besides `compilerOptions.strict: true`, this file sets an explicit **`exclude`** list (`dist/`, `node_modules/`, `scripts/`, test artifacts, etc.). The root `tsconfig.json` only excludes `scripts/templates/**`; a custom `exclude` replaces TypeScript’s defaults, so without narrowing, `tsc` could follow `allowJs` into **`dist/**`** and use a very large file graph—enough to exhaust the Node heap on a full run. The strict config’s excludes keep the check **feasible** on typical dev machines.

## Current status

**`npm run typecheck:strict` passes** as of the Phase 14 migration. The strict config extends `tsconfig.release.json` (narrow include) with `strict: true`, and uses `@types/react` / `@types/react-dom` for JSX. Remaining strict errors in api/, lib/, and tests were fixed (optional chaining, explicit types, null coalescing).

It remains a **local / opt-in** gate—CI runs `npm run typecheck` (release config). Consider adding `typecheck:strict` to CI when ready.
