---
name: sentry-observability
description: >-
  Configures optional Sentry for React error reporting, release health, PII
  scrubbing, and correlation with API failures. Use when adding error tracking,
  debugging production, or when the user mentions Sentry, observability, or
  crash reporting.
---

# Observability (Sentry, optional)

## Dependency

- This project lists **`@sentry/react`** as an **optional** dependency. Initialize only when `import.meta.env` / build flags indicate Sentry DSN is present (follow existing app bootstrap patterns if already wired).

## Setup principles

- **DSN**: via env (e.g. `VITE_SENTRY_DSN` for client SDK is acceptable — DSN is not a secret but still gate by environment).
- **Release**: set release name + version from CI (`git` sha or `package.json` version) for regressions.
- **Environment**: `production` / `staging` / `development` tags.

## Privacy

- Scrub **PII**, tokens, and email from breadcrumbs and `beforeSend`.
- Do not attach full request bodies that may contain passwords or API keys.

## React

- Use **Error Boundary** integration so UI errors reach Sentry.
- Source maps: upload in CI for readable stack traces (Vercel + Sentry integration or CLI).

## Checklist (agent)

- [ ] No secrets in events or breadcrumbs
- [ ] Sampling considered for high-traffic SPAs
- [ ] Errors in API routes use structured logging; Sentry optional on server if added later
