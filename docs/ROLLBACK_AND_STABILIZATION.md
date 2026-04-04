# Rollback and stabilization runbook

Post-release control plan for the MVP launch.

## Rollout stages

1. Internal verification (team accounts only).
2. Limited rollout (small cohort).
3. Full rollout.

Progress only when current stage has no Sev-1/Sev-2 incidents for at least 2 hours.

## Rollback triggers

Trigger rollback immediately if any of these occur:

- Auth regression blocks sign-in or sign-out for >5% of sessions.
- Collection writes fail or data appears inconsistent across refresh/sync.
- Pricing truth labels show contradictory states in critical surfaces.
- Sustained API error spike above baseline and no mitigation within 15 minutes.

## Rollback actions

1. Revert the latest release tag/commit from production deployment target.
2. Disable non-essential beta/experimental surfaces via feature flags.
3. Confirm health endpoint and smoke tests pass on the previous known-good version.
4. Communicate incident timeline and customer impact summary.

## 72-hour stabilization checklist

- Monitor error trends every 4 hours.
- Re-run `npm run test:e2e:smoke` and `npm run test:e2e:pricing-truth` against the deployed app at least daily.
- Audit migration and valuation trust telemetry for drift.
- Record all hotfixes and update deferred backlog items.

## Exit criteria for GA close

- Error and performance trends are stable for 72 hours.
- No unresolved Sev-1/Sev-2 incidents.
- Deferred improvements documented with owner and target milestone.
