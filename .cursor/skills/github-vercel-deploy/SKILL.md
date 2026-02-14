---
name: github-vercel-deploy
description: Deploy to GitHub and Vercel. Use when pushing to GitHub, configuring deploy-on-push, setting up vercel.json, connecting a repo to Vercel, configuring environment variables for deployment, or when the user asks about deploying to GitHub or Vercel.
---

# GitHub & Vercel Deployment

## When to Use

- User wants to deploy to Vercel, push to GitHub, or set up deploy-on-push
- User mentions GitHub, Vercel, production, preview deployment, or vercel.json
- Configuring repo connection, build settings, SPA routing, or env vars for deployment

---

## Workflow: Push → Deploy

1. **Push to GitHub** → Vercel detects push and builds automatically (when repo is connected)
2. **Production**: Default branch (e.g. `main`) → Production URL
3. **Preview**: Other branches and PRs → Preview URLs

---

## GitHub Checklist

- [ ] Repo exists on GitHub; local remotes point correctly (`git remote -v`)
- [ ] Branch to deploy from (e.g. `main`) is pushed and up to date
- [ ] No uncommitted changes blocking deploy (`git status`)

```bash
git add .
git commit -m "chore: deploy"
git push origin main
```

---

## Vercel Setup

### Connect Repo

1. Vercel Dashboard → **Add New Project**
2. Import Git Repository → choose the GitHub repo
3. Confirm root directory (usually project root)
4. Vercel auto-detects Vite; verify build settings

### vercel.json

Keep config minimal. For Vite + HashRouter (SPA):

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- **rewrites**: Required for client-side routing (HashRouter uses `#`; standard SPA rewrite still recommended for consistency)
- **outputDirectory**: Must match Vite output (`dist`)

### Environment Variables

Set in Vercel: Project → Settings → Environment Variables.

| Variable | Environment | Purpose |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Production, Preview | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview | Supabase anon key |
| `VITE_GEMINI_API_KEY` | Production, Preview | Gemini AI (if used in build) |
| `VITE_EBAY_*` | Production, Preview | eBay API (if used) |

- Never commit secrets; use Vercel env only
- Choose Production, Preview, and/or Development per variable

---

## Pre-Deploy Checklist

- [ ] `npm run build` succeeds locally
- [ ] `vercel.json` has correct `outputDirectory` and SPA rewrites
- [ ] Env vars set in Vercel for the target environment
- [ ] Production branch configured in Vercel (Settings → Git)

---

## Common Issues

| Problem | Fix |
|---------|-----|
| 404 on refresh or direct URL | Add SPA rewrite in `vercel.json` |
| Build fails | Check Node version; add `engines.node` in package.json if needed |
| Wrong branch deploys | Vercel → Settings → Git → Production Branch |
| Missing env in build | Ensure vars set for Production or Preview as needed |
| HashRouter URLs not working | Rewrite `/(.*)` → `/index.html` covers hash routes |

---

## Optional: Vercel CLI

```bash
npx vercel          # Preview deploy
npx vercel --prod   # Production deploy (use with care)
```

Useful for testing config without pushing.

---

## Reference

- [Vercel configuration](https://vercel.com/docs/projects/project-configuration)
- [Vercel + Vite](https://vercel.com/docs/frameworks/vite)
