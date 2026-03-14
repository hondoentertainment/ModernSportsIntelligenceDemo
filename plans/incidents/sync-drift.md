# Incident Playbook: Sync Drift

## Trigger
- Reported mismatch between local and cloud portfolio states.

## Immediate Actions (0-15 min)
- Identify affected user IDs and last successful sync timestamp.
- Confirm Supabase write error rates.
- Pause automated background sync if corruption risk exists.

## Containment (15-60 min)
- Instruct users to avoid concurrent edits across devices.
- Use migration/sync logs to isolate divergence point.
- Snapshot current local and remote states before remediation.

## Recovery
- Run one-way reconciliation with conflict report.
- Verify card count, NAV, and watchlist parity.
- Add missing regression tests for the discovered failure mode.
