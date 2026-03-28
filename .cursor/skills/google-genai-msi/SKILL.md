---
name: google-genai-msi
description: >-
  Guides Google Gemini and @google/genai usage through this app's server proxy
  and typed schemas. Use when changing AI generation, /api/ai routes,
  structured output, prompts, or when the user mentions Gemini, GenAI, or
  generateContent in Modern Sports Intelligence.
---

# Google GenAI / Gemini (MSI patterns)

## Architecture in this repo

- Browser code should call **`serverApiRequest`** / the existing Gemini wrapper in `lib/utils/geminiClient.ts`, which posts to **`/api/ai/generate`** (or related API routes). **Do not** put API keys in the client bundle for production flows.
- Validate outbound request shapes and **parse responses** with Zod (see `GeminiResponseSchema` / `safeParse` in `lib/schemas` usage from `geminiClient`).

## Safety

- Never log **raw user prompts** or PII at info level in production.
- Treat model output as **untrusted**; sanitize before `dangerouslySetInnerHTML` or DB writes.
- Apply **rate limiting / circuit breaking** where already wired (`geminiCircuit` in `lib/apiResilience`).

## Structured output

- Prefer **`responseSchema` / `responseMimeType`** (when supported by the route) for JSON-shaped answers; validate with Zod on the client after `safeParse`.

## Errors

- Surface user-friendly errors; keep detailed provider errors server-side only.

## Checklist (agent)

- [ ] Keys only on server / env not prefixed `VITE_` for secrets
- [ ] Responses validated before use
- [ ] No sensitive content in client logs or toasts
