import { z } from 'zod';
import { apiLogger } from '../lib/logger';
import { respondInternalError, setApiCorsHeaders } from '../lib/httpProduction';
import {
  checkRateLimit,
  clientKeyFromRequest,
  envRateLimitMax,
  rateLimitDisabled,
} from '../lib/rateLimit';
import { isServerApiAuthConfigured, verifyServerApiAuth } from '../lib/verifyServerApiAuth';

const ALLOWED_METHODS = 'POST, OPTIONS';
const SPORTS_CATEGORY_IDS = [213, 50132, 2737, 175690, 3034];

// ─── Request schemas ──────────────────────────────────────────────────────────

const ebaySearchParamsSchema = z.object({
  playerName: z.string().optional(),
  cardYear: z.string().optional(),
  cardSet: z.string().optional(),
  cardNumber: z.string().optional(),
  maxPrice: z.union([z.string(), z.number()]).optional(),
  condition: z.string().optional(),
  limit: z.number().optional(),
  /** Browse API pagination offset (max 10k results total). */
  offset: z.number().int().min(0).optional(),
  /** e.g. price, distance, newlyListed — passed through when valid. */
  sort: z.string().optional(),
}).strict();

const ebayBodySchema = z.object({
  /** `verify` checks server credentials only — never returns an OAuth token to the client. */
  action: z.enum(['verify', 'search', 'item']),
  sandbox: z.boolean().optional(),
  params: ebaySearchParamsSchema.optional(),
  itemId: z.string().optional(),
}).strict();

// ─── Browse API response schemas ──────────────────────────────────────────────

/** Price amount as returned by eBay Browse API. */
const ebayPriceSchema = z.object({
  value: z.string(),
  currency: z.string(),
});

/** A single item from the Browse API item_summary/search response. */
export const ebayItemSummarySchema = z.object({
  itemId: z.string().optional(),
  title: z.string().optional(),
  price: ebayPriceSchema.optional(),
  condition: z.string().optional(),
  conditionId: z.string().optional(),
  itemCreationDate: z.string().optional(),
  itemEndDate: z.string().optional(),
  itemWebUrl: z.string().optional(),
  image: z.object({ imageUrl: z.string() }).optional(),
  seller: z.object({ username: z.string(), feedbackScore: z.number().optional() }).optional(),
  categories: z.array(z.object({ categoryId: z.string(), categoryName: z.string() })).optional(),
  shippingOptions: z.array(z.unknown()).optional(),
  buyingOptions: z.array(z.string()).optional(),
}).passthrough();

/** Top-level shape of the Browse API /buy/browse/v1/item_summary/search response. */
export const ebaySearchResponseSchema = z.object({
  href: z.string().optional(),
  total: z.number().optional(),
  next: z.string().optional(),
  prev: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  itemSummaries: z.array(ebayItemSummarySchema).optional(),
  warnings: z.array(z.unknown()).optional(),
}).passthrough();

/** Shape of the Browse API /buy/browse/v1/item/{itemId} response. */
export const ebayItemDetailSchema = z.object({
  itemId: z.string(),
  title: z.string().optional(),
  price: ebayPriceSchema.optional(),
  condition: z.string().optional(),
  conditionId: z.string().optional(),
  description: z.string().optional(),
  itemCreationDate: z.string().optional(),
  itemEndDate: z.string().optional(),
  itemWebUrl: z.string().optional(),
  image: z.object({ imageUrl: z.string() }).optional(),
  additionalImages: z.array(z.object({ imageUrl: z.string() })).optional(),
  seller: z.object({ username: z.string(), feedbackScore: z.number().optional() }).optional(),
  shippingOptions: z.array(z.unknown()).optional(),
  buyingOptions: z.array(z.string()).optional(),
}).passthrough();

export type EbaySearchResponse = z.infer<typeof ebaySearchResponseSchema>;
export type EbayItemDetail = z.infer<typeof ebayItemDetailSchema>;

// ─── Handler types ────────────────────────────────────────────────────────────

type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string | null };
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: object) => unknown; end?: () => void };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBaseUrl(sandbox: boolean): string {
  return sandbox ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';
}

async function getAccessToken(sandbox: boolean): Promise<string> {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('eBay server credentials are not configured.');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${getBaseUrl(sandbox)}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  });

  if (!response.ok) {
    throw new Error(`Failed to get eBay access token: ${response.statusText}`);
  }

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    throw new Error('eBay token response missing access_token');
  }
  return payload.access_token;
}

async function searchListings(
  token: string,
  sandbox: boolean,
  params: z.infer<typeof ebaySearchParamsSchema>
): Promise<EbaySearchResponse | null> {
  let query = `${params.playerName ?? ''}`.trim();
  if (params.cardYear) query += ` ${params.cardYear}`;
  if (params.cardSet) query += ` ${params.cardSet}`;
  if (params.cardNumber) query += ` ${params.cardNumber}`;
  query = `${query} card`.trim();

  const filters: string[] = [];
  if (params.maxPrice) filters.push(`price:[0..${params.maxPrice}]`);
  if (params.condition) filters.push(`condition:${params.condition}`);

  const sort = params.sort && params.sort.trim() ? params.sort.trim() : 'price';
  const searchParams = new URLSearchParams({
    q: query,
    category_ids: SPORTS_CATEGORY_IDS.join(','),
    limit: String(Math.min(params.limit || 50, 200)),
    sort,
    fieldgroups: 'EXTENDED',
  });

  if (params.offset != null && params.offset > 0) {
    searchParams.set('offset', String(params.offset));
  }

  if (filters.length > 0) {
    searchParams.append('filter', filters.join(','));
  }

  const response = await fetch(
    `${getBaseUrl(sandbox)}/buy/browse/v1/item_summary/search?${searchParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        'Accept-Language': 'en-US',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`eBay API search failed: ${response.statusText}`);
  }

  const raw: unknown = await response.json();
  const parsed = ebaySearchResponseSchema.safeParse(raw);
  if (!parsed.success) {
    apiLogger.warn('[eBay] Search response failed schema validation', {
      issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
    });
    return null;
  }
  return parsed.data;
}

async function getItem(
  token: string,
  sandbox: boolean,
  itemId: string
): Promise<EbayItemDetail | null> {
  const response = await fetch(`${getBaseUrl(sandbox)}/buy/browse/v1/item/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get item details: ${response.statusText}`);
  }

  const raw: unknown = await response.json();
  const parsed = ebayItemDetailSchema.safeParse(raw);
  if (!parsed.success) {
    apiLogger.warn('[eBay] Item detail response failed schema validation', {
      itemId,
      issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
    });
    return null;
  }
  return parsed.data;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<unknown> {
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
    const maxPerMin = envRateLimitMax('RATE_LIMIT_EBAY_MAX_PER_MINUTE', 60);
    const rl = checkRateLimit(`ebay:${clientKeyFromRequest(req)}`, maxPerMin, 60_000);
    if (rl.limited) {
      res.setHeader('Retry-After', String(rl.retryAfterSec));
      return res.status(429).json({ error: 'Too many requests', retryAfterSec: rl.retryAfterSec });
    }
  }

  const rawBody = req.body ?? {};
  const parseResult = ebayBodySchema.safeParse(rawBody);
  if (!parseResult.success) {
    const message =
      parseResult.error.issues?.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') ??
      'Invalid request body';
    return res.status(400).json({ error: message });
  }
  const body = parseResult.data;
  const action = body.action;
  const sandbox = Boolean(body.sandbox);

  try {
    const accessToken = await getAccessToken(sandbox);

    if (action === 'verify') {
      return res.status(200).json({ ok: true });
    }

    if (action === 'search') {
      if (!body.params?.playerName) {
        return res.status(400).json({ error: 'Missing playerName for eBay search.' });
      }
      const results = await searchListings(accessToken, sandbox, body.params);
      if (results === null) {
        return res.status(502).json({ error: 'eBay search response was malformed.' });
      }
      return res.status(200).json(results);
    }

    if (action === 'item') {
      if (!body.itemId) {
        return res.status(400).json({ error: 'Missing itemId for eBay item lookup.' });
      }
      const item = await getItem(accessToken, sandbox, body.itemId);
      if (item === null) {
        return res.status(502).json({ error: 'eBay item response was malformed.' });
      }
      return res.status(200).json(item);
    }

    return res.status(400).json({ error: 'Unsupported eBay action.' });
  } catch (error) {
    respondInternalError(res, error, 'eBay handler failed', 'ebay_handler_failed');
    return;
  }
}
