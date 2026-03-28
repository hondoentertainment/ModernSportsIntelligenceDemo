---
name: vitest-testing-library
description: >-
  Writes and maintains Vitest unit tests with Testing Library for React
  components and pure libs in this repo. Use when adding tests, fixing flaky
  tests, coverage gaps, or when the user mentions vitest, RTL, or unit tests.
---

# Vitest + Testing Library

## Commands

- `npm run test` — run unit tests once.
- `npm run test:watch` — watch mode.
- `npm run test:coverage` — coverage (v8).

## Conventions

- Place tests under `tests/**` mirroring source (`tests/components`, `tests/lib`) per existing layout.
- Prefer **`@testing-library/react`** with **`user-event`** over firing raw DOM events.
- Query priority: **`getByRole`** > `getByLabelText` > `getByPlaceholderText` > `getByText` > test-id as last resort.

## Async

- Use **`await user.click()`** / **`await findBy*`** for async UI; wrap in `await act(async () => ...)` only when needed for legacy patterns.

## Mocking

- Mock **`serverApi`**, fetch, or routers at the boundary under test; avoid mocking implementation details of child components unless necessary.

## E2E boundary

- **Playwright** covers full flows (`npm run test:e2e`). Unit tests stay fast: no real network, no full app bootstrap unless using custom render helpers.

## Checklist (agent)

- [ ] Tests assert behavior users see, not internal state
- [ ] No `waitFor` with arbitrary long timeouts without cause
- [ ] New pure logic in `lib/**` has focused tests
