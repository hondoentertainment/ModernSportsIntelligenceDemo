import { withRetry, type RetryOptions } from './apiResilience';
import { getServerApiAuthHeaders } from './serverApiAuth';

interface ApiErrorPayload {
  error?: string;
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export function getServerApiBaseUrl(): string {
  const configured = import.meta.env.VITE_SERVER_API_BASE_URL?.trim();
  if (!configured) return '';
  return trimTrailingSlash(configured);
}

export function getServerApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = getServerApiBaseUrl();
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

/** Default retry options for server API calls */
const SERVER_RETRY: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 8000,
  timeoutMs: 20000,
  shouldRetry: (err) => {
    // Don't retry client errors (4xx), only retry network/server errors
    if (err instanceof ServerApiError && err.status >= 400 && err.status < 500) {
      return false;
    }
    return true;
  },
};

export class ServerApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ServerApiError';
  }
}

export async function serverApiRequest<T>(
  path: string,
  init: RequestInit = {},
  retryOptions?: RetryOptions
): Promise<T> {
  return withRetry(async () => {
    const response = await fetch(getServerApiUrl(path), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorPayload = (await response.json()) as ApiErrorPayload;
        if (errorPayload.error) {
          errorMessage = errorPayload.error;
        }
      } catch {
        // Ignore JSON parsing issues for error responses.
      }
      throw new ServerApiError(errorMessage, response.status);
    }

    return response.json() as Promise<T>;
  }, retryOptions ?? SERVER_RETRY);
}

/** Same as serverApiRequest but attaches Supabase session JWT when available (for protected /api routes). */
export async function serverApiRequestAuthenticated<T>(
  path: string,
  init: RequestInit = {},
  retryOptions?: RetryOptions,
): Promise<T> {
  const auth = await getServerApiAuthHeaders();
  return serverApiRequest<T>(
    path,
    {
      ...init,
      headers: {
        ...auth,
        ...(init.headers as Record<string, string>),
      },
    },
    retryOptions,
  );
}
