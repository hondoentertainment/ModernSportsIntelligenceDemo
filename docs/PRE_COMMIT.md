# Pre-commit hooks

This repo uses [husky](https://typicode.github.io/husky/) v9 + [lint-staged](https://github.com/lint-staged/lint-staged) v17 to run lint + format on staged files before every commit.

## Activation

Husky activates on every install via the `prepare` script. After cloning:

```bash
npm install
```

That's it — `.husky/pre-commit` is now wired.

## What runs

Configured in `package.json` under `"lint-staged"`:

- `*.{ts,tsx}` → `eslint --rule "no-unused-vars: off" --fix`
- `*.{json,yml,yaml,md}` → `prettier --write`

Only **staged** files are processed. Files outside the staged set are untouched.

## Bypassing (emergency only)

```bash
git commit --no-verify -m "wip: skip pre-commit"
```

Reserve `--no-verify` for genuine emergencies; the CI lane will still fail on lint/format/typecheck so bypassing locally only delays the failure.

## Coexistence with the workspace-wide CI lane

CI runs `npm run lint` and `npm run format:check` against the entire workspace on every PR (`.github/workflows/ci.yml`). Pre-commit catches issues on the developer machine; CI is the backstop.
