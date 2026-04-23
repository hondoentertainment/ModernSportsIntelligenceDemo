import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { respondInternalError, setApiCorsHeaders } from '../lib/httpProduction';
import {
  checkRateLimit,
  clientKeyFromRequest,
  envRateLimitMax,
  rateLimitDisabled,
} from '../lib/rateLimit';
import { isServerApiAuthConfigured, verifyServerApiAuth } from '../lib/verifyServerApiAuth';
import { MAX_BODY_BYTES, sanitizeString } from '../lib/sanitize';

const generateBodySchema = z.object({
  model: z.string().min(1),
  contents: z.any(),
  config: z.any().optional(),
});

const ALLOWED_METHODS = 'POST, OPTIONS';

/** Minimal request type for Vercel serverless handler (no @vercel/node dependency). */
type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string | null };
};

/** Minimal response type for Vercel serverless handler. */
type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: object) => unknown; end?: () => void };
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setApiCorsHeaders(res, { allowMethods: ALLOWED_METHODS });

  if (req.method === 'OPTIONS') {
    const r = res.status(204);
    r.end?.();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!isServerApiAuthConfigured()) {
    return res.status(503).json({
      error: 'Server API authentication is not configured.',
      code: 'api_auth_misconfigured',
    });
  }
  if (!(await verifyServerApiAuth(req))) {
    return res.status(401).json({ error: 'Unauthorized', code: 'api_auth_required' });
  }

  if (!rateLimitDisabled()) {
    const maxPerMin = envRateLimitMax('RATE_LIMIT_AI_MAX_PER_MINUTE', 30);
    const rl = checkRateLimit(`ai:${clientKeyFromRequest(req)}`, maxPerMin, 60_000);
    if (rl.limited) {
      res.setHeader('Retry-After', String(rl.retryAfterSec));
      return res.status(429).json({ error: 'Too many requests', retryAfterSec: rl.retryAfterSec });
    }
  }

  // Body size guard: reject payloads that exceed MAX_BODY_BYTES before parsing.
  const contentLength = req.headers?.['content-length'];
  const contentLengthNum =
    typeof contentLength === 'string' ? parseInt(contentLength, 10) : NaN;
  if (!Number.isNaN(contentLengthNum) && contentLengthNum > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'Request too large' });
  }
  if (typeof req.body === 'string' && Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'Request too large' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on the server.' });
  }

  // Sanitize the model field before Zod parsing so log messages never reflect raw user input.
  const rawBody = req.body != null && typeof req.body === 'object' ? req.body : {};
  const sanitizedBody = {
    ...(rawBody as Record<string, unknown>),
    model: sanitizeString((rawBody as Record<string, unknown>)['model']),
  };
  const parsed = generateBodySchema.safeParse(sanitizedBody);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join('; ') || 'Invalid request body';
    return res.status(400).json({ error: message });
  }
  const { model, contents, config } = parsed.data;
  // model is already sanitized above; contents/config are passed to Gemini as-is (validated by Zod).

  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model,
      contents,
      config,
    });

    return res.status(200).json({
      text: response.text || '',
    });
  } catch (error) {
    respondInternalError(res, error, 'AI generate failed', 'ai_generate_failed');
    return;
  }
}
