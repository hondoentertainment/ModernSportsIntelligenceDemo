# Incident Playbook: Pricing Sync Failure

## Trigger
- Scheduled/manual valuation updates fail or return stale data for >30% assets.

## Immediate Actions (0-15 min)
- Check external dependency health (eBay, Gemini, network).
- Review error logs for auth and rate-limit failures.
- Disable aggressive retry loops.

## Containment (15-60 min)
- Fall back to last known good valuation with stale badge.
- Notify users that pricing is delayed.
- Prioritize high-value assets for manual refresh path.

## Recovery
- Restore source connectivity and re-run batch sync.
- Confirm confidence/provenance metadata is present.
- Publish postmortem with source-specific remediation.
