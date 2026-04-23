import { z, ZodTypeAny } from 'zod';
import { logger } from '../logger';

/**
 * Parse a JSON string and validate it against a Zod schema.
 * Returns the typed value on success, or null if parsing or validation fails.
 * Strips common markdown code-fence wrapping before parsing (Gemini sometimes
 * ignores responseMimeType and wraps JSON in ```json blocks).
 */
export function safeParseJson<S extends ZodTypeAny>(
  raw: string,
  schema: S,
  context?: string,
): z.infer<S> | null {
  const tag = context ? ` (${context})` : '';

  // Strip ```json ... ``` or ``` ... ``` wrapping
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    logger.warn(`[safeParseJson] JSON.parse failed${tag}`);
    return null;
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    logger.warn(`[safeParseJson] Schema validation failed${tag}`, result.error.issues);
    return null;
  }

  return result.data;
}
