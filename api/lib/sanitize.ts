/** Strip control characters and trim whitespace from user-supplied strings. */
export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLength);
}

/** Max body size in bytes for non-file API routes. */
export const MAX_BODY_BYTES = 64 * 1024; // 64 KB
