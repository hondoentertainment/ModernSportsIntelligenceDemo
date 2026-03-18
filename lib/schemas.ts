/**
 * Zod Validation Schemas for External API Responses
 *
 * Validates data at system boundaries to prevent runtime crashes
 * from malformed API responses.
 */

import { z } from 'zod';

// ─── Gemini AI Response ──────────────────────────────────────────────

export const GeminiResponseSchema = z.object({
  text: z.string(),
});

export const GeminiValuationSchema = z.object({
  estimatedValue: z.number().min(0),
  low: z.number().min(0),
  high: z.number().min(0),
  confidence: z.number().min(0).max(100),
  rationale: z.string().optional(),
});

export type GeminiValuation = z.infer<typeof GeminiValuationSchema>;

// ─── eBay API Responses ──────────────────────────────────────────────

export const EbayItemSchema = z.object({
  itemId: z.string(),
  title: z.string(),
  price: z.object({
    value: z.string(),
    currency: z.string().default('USD'),
  }),
  condition: z.string().optional().default('Unknown'),
  image: z
    .object({ imageUrl: z.string().url().optional() })
    .optional(),
  itemWebUrl: z.string().url().optional(),
});

export const EbaySearchResponseSchema = z.object({
  itemSummaries: z.array(EbayItemSchema).optional().default([]),
  total: z.number().optional().default(0),
  next: z.string().optional(),
});

export type EbayItem = z.infer<typeof EbayItemSchema>;
export type EbaySearchResponse = z.infer<typeof EbaySearchResponseSchema>;

// ─── MLB Stats API ───────────────────────────────────────────────────

export const MLBPlayerSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  firstName: z.string().optional().default(''),
  lastName: z.string().optional().default(''),
  primaryNumber: z.string().optional().default(''),
  birthDate: z.string().optional().default(''),
  currentTeam: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .optional()
    .default({ id: 0, name: 'Unknown' }),
  primaryPosition: z
    .object({
      code: z.string(),
      name: z.string(),
    })
    .optional()
    .default({ code: 'UN', name: 'Unknown' }),
  batSide: z
    .object({
      code: z.string(),
      description: z.string(),
    })
    .optional()
    .default({ code: 'U', description: 'Unknown' }),
  pitchHand: z
    .object({
      code: z.string(),
      description: z.string(),
    })
    .optional()
    .default({ code: 'U', description: 'Unknown' }),
});

export const MLBRosterResponseSchema = z.object({
  roster: z.array(
    z.object({
      person: MLBPlayerSchema,
      jerseyNumber: z.string().optional(),
      position: z
        .object({
          code: z.string(),
          name: z.string(),
        })
        .optional(),
    })
  ),
});

export type MLBPlayer = z.infer<typeof MLBPlayerSchema>;

// ─── Stripe Webhook Event (server-side) ──────────────────────────────

export const StripeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.unknown()),
  }),
});

// ─── Supabase Profile ────────────────────────────────────────────────

export const SupabaseProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().optional(),
  display_name: z.string().optional(),
  subscription_tier: z
    .enum(['free', 'basic', 'pro', 'alpha'])
    .optional()
    .default('free'),
  subscription_status: z
    .enum(['active', 'trialing', 'past_due', 'canceled', 'none'])
    .optional()
    .default('none'),
  stripe_customer_id: z.string().optional(),
  created_at: z.string().optional(),
});

export type SupabaseProfile = z.infer<typeof SupabaseProfileSchema>;

// ─── Card Inventory (input validation) ───────────────────────────────

export const CardInventoryInputSchema = z.object({
  player: z.string().min(1, 'Player name is required'),
  year: z.number().int().min(1900).max(2100),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  cardNumber: z.string(),
  set: z.string(),
  sport: z.enum(['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer']),
  league: z.enum(['MLB', 'MiLB', 'NBA', 'NFL', 'Other']),
  purchasePrice: z.number().min(0),
  condition: z.string(),
  isGraded: z.boolean(),
  isAutographed: z.boolean(),
  gradingCompany: z
    .enum(['PSA', 'BGS', 'SGC', 'CSG', 'HGA', 'Other'])
    .optional(),
  grade: z.string().optional(),
  notes: z.string().optional(),
  image: z.string().optional(),
});

export type CardInventoryInput = z.infer<typeof CardInventoryInputSchema>;

// ─── Utility: Safe Parse with Logging ────────────────────────────────

import { logger } from './logger';

/**
 * Safely parse data against a Zod schema, logging warnings on failure.
 * Returns the parsed data on success, or null on failure.
 */
export function safeParse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context?: string
): T | null {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const issues = result.error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('; ');
  logger.warn(`[Schema${context ? `:${context}` : ''}] Validation failed: ${issues}`);
  return null;
}
