---
name: vite-env-build
description: >-
  Configures Vite 6 env variables, build modes, code splitting, and bundle
  checks for this project. Use when changing vite.config, import.meta.env,
  build:e2e, bundle size scripts, or when the user mentions Vite build or
  environment modes.
---

# Vite 6 — env and build

## Environment variables

- **Client-exposed**: only `import.meta.env.VITE_*` — bundled and visible in the browser.
- **Server / API**: use `process.env` in `api/**` and Node scripts; never rely on `VITE_` for secrets.

## Modes

- `npm run build` — production build.
- `npm run build:e2e` — E2E mode (`--mode e2e`) for Playwright; gate test-only behavior with `import.meta.env.MODE === 'e2e'` where appropriate.

## Performance

- Lazy-load heavy routes in `App.tsx` (or route table) to keep initial chunk small.
- After large dependency or route changes, consider `npm run build:size` (runs `scripts/bundle-size.cjs`).

## Checklist (agent)

- [ ] New secrets are not added as `VITE_`
- [ ] E2E-specific behavior is behind `e2e` mode, not default dev
- [ ] Build succeeds after router or dynamic import changes
