# Incident Playbook: Auth Lockout

## Trigger
- Sudden spike in login failures or password reset failures.

## Immediate Actions (0-15 min)
- Confirm Supabase auth status and project health.
- Check recent auth-related deployments.
- Freeze auth-related releases.

## Containment (15-60 min)
- Enable fallback messaging in login/forgot-password UI.
- Announce degraded auth in status channel.
- Verify reset flow and token expiration handling.

## Recovery
- Roll back faulty auth changes if required.
- Run smoke tests: signup, login, forgot, reset, logout.
- Capture root cause and prevention tasks.
