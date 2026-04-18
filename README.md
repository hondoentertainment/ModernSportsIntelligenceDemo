<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## CI

[![CI / CD](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/actions/workflows/ci.yml/badge.svg)](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/actions/workflows/ci.yml)
[![PR Checks](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/hondoentertainment/ModernSportsIntelligenceDemo/actions/workflows/pr-checks.yml)

## Production rollout

- **Phased checklist:** [docs/PRODUCTION_ROLLOUT_PHASES.md](docs/PRODUCTION_ROLLOUT_PHASES.md) (data, billing, security, observability, E2E against Vercel).
- **Env & deploy:** [docs/DEPLOY_ENV_CHECKLIST.md](docs/DEPLOY_ENV_CHECKLIST.md) · **Edge Functions:** [supabase/functions/README.md](supabase/functions/README.md)
- **Ops:** [docs/OPS_RUNBOOK.md](docs/OPS_RUNBOOK.md) · **Monitoring:** [docs/MONITORING.md](docs/MONITORING.md)

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1obS_fShKhJaA6YWydCVTdWilJ-_rA4Pn

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
