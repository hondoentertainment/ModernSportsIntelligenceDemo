// @ts-nocheck
import { z } from 'zod';

/** Schema for public portfolio username: alphanumeric, underscore, or hyphen, 1–64 chars. */
export const publicPortfolioUsernameSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username must be alphanumeric, underscore, or hyphen');

/**
 * Validates and returns a public portfolio username. Throws ZodError on invalid input.
 */
export function validateUsername(username: unknown): string {
  return publicPortfolioUsernameSchema.parse(username);
}
