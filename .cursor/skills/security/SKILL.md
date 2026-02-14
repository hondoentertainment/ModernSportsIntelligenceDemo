---
name: security
description: Reviews code for security vulnerabilities and enforces secure patterns. Use when reviewing security, handling secrets, API keys, auth, input validation, XSS, injection, dependency audit, or when the user asks about security practices.
---

# Security Review & Practices

## When to Use

- User asks for a security review, audit, or best practices
- Adding or changing API keys, auth, or credential handling
- Handling user input, forms, or external data
- Reviewing dependencies or running npm audit
- Deploying or configuring environment variables

---

## Secrets & Credentials

### Never Commit Secrets

- [ ] `.env`, `.env.local`, `.env.*.local` in `.gitignore`
- [ ] No hardcoded API keys, tokens, or passwords in source
- [ ] Use environment variables only; set in Vercel/local `.env`

### Vite/Client-Side Exposure

- Variables with `VITE_` prefix are **bundled into the client** and visible in browser.
- **Safe for client**: Supabase anon key, eBay client ID (public). These are designed for client use.
- **Never use `VITE_` for**: Server secrets, refresh tokens, client secrets, DB credentials. Use a backend/proxy instead.

### Pattern

```ts
// ✅ Correct - env var, no fallback for secrets
const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';

// ❌ Avoid - hardcoded fallback
const apiKey = import.meta.env.VITE_API_KEY || 'sk-abc123';
```

---

## Auth & Session

- [ ] Passwords never logged or stored client-side beyond form state
- [ ] Use established auth (Supabase Auth, etc.); avoid custom JWT/session logic
- [ ] Session refresh and token expiry handled by the auth library
- [ ] Password reset links expire; recovery flow uses secure redirects

---

## Input Validation & Injection

### XSS

- React escapes text by default; avoid `dangerouslySetInnerHTML` with user data
- Sanitize if rendering HTML from external sources

### SQL / Injection

- Use parameterized queries or an ORM; never concatenate user input into SQL
- Supabase client uses parameterized queries

### General

- Validate and sanitize user input before use
- Validate file uploads (type, size) if accepting uploads

---

## Dependency Security

```bash
npm audit
npm audit fix    # Apply safe fixes
```

- [ ] Run before major releases or when adding dependencies
- [ ] Review high/critical findings; avoid `npm audit fix --force` without checking

---

## API & Network

- [ ] Use HTTPS in production
- [ ] API keys for server-side calls; client-side keys must be public-safe (e.g., anon keys)
- [ ] Rate limiting considered for public endpoints
- [ ] CORS configured restrictively when using a backend

---

## Security Review Checklist

Use when reviewing code for security:

- [ ] No secrets in source or committed config
- [ ] `VITE_` vars only for client-safe values
- [ ] Auth flows use trusted library (Supabase, etc.)
- [ ] User input validated and not used raw in SQL/HTML
- [ ] Dependencies audited (`npm audit`)
- [ ] `.env*` and secrets in `.gitignore`

---

## Severity Levels for Findings

- **Critical**: Fix before merge (e.g., exposed secrets, SQL injection)
- **High**: Fix soon (e.g., XSS, weak auth)
- **Medium**: Plan a fix (e.g., missing validation, outdated deps)
- **Low**: Document or backlog (e.g., hardening suggestions)
