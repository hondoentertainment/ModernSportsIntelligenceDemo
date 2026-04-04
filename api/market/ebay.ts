import { z } from 'zod';
import { apiLogger } from '../lib/logger';
import {
  checkRateLimit,
  clientKeyFromRequest,
  envRateLimitMax,
  rateLimitDisabled,
} from '../lib/rateLimit';

const ALLOWED_METHODS = 'POST, OPTIONS';
const SPORTS_CATEGORY_IDS = [213, 50132, 2737, 175690, 3034];

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
  action: z.enum(['token', 'search', 'item']),
  sandbox: z.boolean().optional(),
  params: ebaySearchParamsSchema.optional(),
  itemId: z.string().optional(),
}).strict();

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

function setCorsHeaders(res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Internal Server Error';
}

function getBaseUrl(sandbox: boolean) {
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

  const payload = await response.json();
  return payload.access_token;
}

async function searchListings(
  token: string,
  sandbox: boolean,
  params: z.infer<typeof ebaySearchParamsSchema>
) {
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

  return response.json();
}

async function getItem(token: string, sandbox: boolean, itemId: string) {
  const response = await fetch(`${getBaseUrl(sandbox)}/buy/browse/v1/item/${itemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get item details: ${response.statusText}`);
  }

  return response.json();
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
    const message = parseResult.error.issues?.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') ?? 'Invalid request body';
    return res.status(400).json({ error: message });
  }
  const body = parseResult.data;
  const action = body.action;
  const sandbox = Boolean(body.sandbox);

  try {
    const accessToken = await getAccessToken(sandbox);

    if (action === 'token') {
      return res.status(200).json({ accessToken });
    }

    if (action === 'search') {
      if (!body.params?.playerName) {
        return res.status(400).json({ error: 'Missing playerName for eBay search.' });
      }
      const results = await searchListings(accessToken, sandbox, body.params!);
      return res.status(200).json(results);
    }

    if (action === 'item') {
      if (!body.itemId) {
        return res.status(400).json({ error: 'Missing itemId for eBay item lookup.' });
      }
      const item = await getItem(accessToken, sandbox, body.itemId);
      return res.status(200).json(item);
    }

    return res.status(400).json({ error: 'Unsupported eBay action.' });
  } catch (error) {
    apiLogger.error('eBay handler failed', error);
    return res.status(500).json({ error: getErrorMessage(error) });
  }
}
