# Phase 31 RLS Rollout Checklist

## Pre-Deployment
- [ ] Backup current schema and policies.
- [ ] Confirm new `profiles` fields exist (`username`, `is_public`, `alpha_score`, etc.).
- [ ] Confirm `audit_events` table exists with RLS enabled.
- [ ] Review policy diffs in `supabase-schema.sql` with two reviewers.

## Deployment
- [ ] Run `supabase-schema.sql` in staging.
- [ ] Validate authenticated user can read/write own profile/cards/targets.
- [ ] Validate unauthenticated user can read only `is_public = true` profiles/cards.
- [ ] Validate private profiles are not accessible via direct queries.

## Post-Deployment Verification
- [ ] Validate `/p/:username` loads for public profiles.
- [ ] Validate leaderboard includes only public profiles.
- [ ] Validate non-owner cannot mutate another user records.
- [ ] Validate audit events are created for add/update/delete card/target actions.

## Rollback Plan
- [ ] Reapply prior policy snapshot.
- [ ] Disable public profile routes in app config.
- [ ] Clear edge cache and notify incident channel.
