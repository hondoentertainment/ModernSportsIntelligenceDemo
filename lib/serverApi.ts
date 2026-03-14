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

export async function serverApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
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
      const errorPayload = await response.json() as ApiErrorPayload;
      if (errorPayload.error) {
        errorMessage = errorPayload.error;
      }
    } catch {
      // Ignore JSON parsing issues for error responses.
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}
