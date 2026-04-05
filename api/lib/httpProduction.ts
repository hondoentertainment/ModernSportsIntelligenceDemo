import { apiLogger } from './logger';

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: object) => unknown; end?: () => void };
};

const ALLOWED_METHODS_DEFAULT = 'POST, OPTIONS';

/**
 * CORS for browser clients. Prefer ALLOWED_ORIGIN in production; on Vercel, VERCEL_URL yields the deployment origin.
 * Local dev falls back to * when neither is set.
 */
export function setApiCorsHeaders(
  res: ApiResponse,
  options: { allowMethods?: string; allowHeaders?: string } = {},
): void {
  const explicit = process.env.ALLOWED_ORIGIN?.trim();
  const vercel = process.env.VERCEL_URL?.trim();
  const vercelOrigin = vercel ? `https://${vercel}` : '';
  const isProd =
    process.env.VERCEL_ENV === 'production' ||
    (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1');

  const origin = explicit || vercelOrigin || (!isProd ? '*' : explicit || vercelOrigin || '*');

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', options.allowMethods ?? ALLOWED_METHODS_DEFAULT);
  res.setHeader('Access-Control-Allow-Headers', options.allowHeaders ?? 'Content-Type');
}

/** Log full error server-side; return a generic body to clients (no stack / provider messages). */
export function respondInternalError(
  res: ApiResponse,
  err: unknown,
  logMessage: string,
  clientCode: string,
): void {
  apiLogger.error(logMessage, err);
  res.status(500).json({
    error: 'Something went wrong. Please try again later.',
    code: clientCode,
  });
}
