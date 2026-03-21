import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { apiLogger } from '../lib/logger';
import {
  checkRateLimit,
  clientKeyFromRequest,
  envRateLimitMax,
  rateLimitDisabled,
} from '../lib/rateLimit';

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

function setCorsHeaders(res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Internal Server Error';
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    const r = res.status(204);
    r.end?.();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!rateLimitDisabled()) {
    const maxPerMin = envRateLimitMax('RATE_LIMIT_AI_MAX_PER_MINUTE', 30);
    const rl = checkRateLimit(`ai:${clientKeyFromRequest(req)}`, maxPerMin, 60_000);
    if (rl.limited) {
      res.setHeader('Retry-After', String(rl.retryAfterSec));
      return res.status(429).json({ error: 'Too many requests', retryAfterSec: rl.retryAfterSec });
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on the server.' });
  }

  const body = req.body ?? {};
  const parsed = generateBodySchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join('; ') || 'Invalid request body';
    return res.status(400).json({ error: message });
  }
  const { model, contents, config } = parsed.data;

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
    apiLogger.error('AI generate failed', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
}
