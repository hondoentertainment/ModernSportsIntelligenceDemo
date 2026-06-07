import { apiLogger } from './logger.js';

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: object) => unknown; end?: () => void };
};

const ALLOWED_METHODS_DEFAULT = 'POST, OPTIONS';
/** Browser preflight must allow Bearer tokens for protected API routes. */
const DEFAULT_ALLOW_HEADERS = 'Content-Type, Authorization';

function isApiProductionDeployment(): boolean {
  return (
    process.env.VERCEL_ENV === 'production' ||
    (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1')
  );
}

/**
 * CORS for browser clients. Prefer `ALLOWED_ORIGIN` for your canonical site; on Vercel, `VERCEL_URL` is used as origin.
 * Wildcard (`*`) is used only in non-production. Production without a resolved origin logs a warning and omits `Access-Control-Allow-Origin`.
 */
export function setApiCorsHeaders(
  res: ApiResponse,
  options: { allowMethods?: string; allowHeaders?: string } = {},
): void {
  const explicit = process.env.ALLOWED_ORIGIN?.trim();
  const vercel = process.env.VERCEL_URL?.trim();
  const vercelOrigin = vercel ? `https://${vercel}` : '';
  const isProd = isApiProductionDeployment();

  let origin: string | undefined;
  if (explicit) {
    origin = explicit;
  } else if (vercelOrigin) {
    origin = vercelOrigin;
  } else if (!isProd) {
    origin = '*';
  } else {
    apiLogger.warn(
      'CORS: production deployment missing ALLOWED_ORIGIN and VERCEL_URL; omitting Access-Control-Allow-Origin',
    );
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', options.allowMethods ?? ALLOWED_METHODS_DEFAULT);
  res.setHeader('Access-Control-Allow-Headers', options.allowHeaders ?? DEFAULT_ALLOW_HEADERS);
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
