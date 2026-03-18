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

// ─── PSA / Grading API Responses ─────────────────────────────────

export const PSACertResponseSchema = z.object({
  certNumber: z.string(),
  verified: z.boolean(),
  year: z.string().optional(),
  brand: z.string().optional(),
  set: z.string().optional(),
  cardNumber: z.string().optional(),
  player: z.string().optional(),
  grade: z.string().optional(),
  qualifier: z.string().optional(),
  variety: z.string().optional(),
  labelType: z.string().optional(),
  imageUrl: z.string().url().optional(),
  lookupDate: z.string(),
});

export type PSACertResponse = z.infer<typeof PSACertResponseSchema>;

export const PopulationEntrySchema = z.object({
  grade: z.string(),
  count: z.number().int().min(0),
  qualifier: z.string().optional(),
});

export const PopulationReportSchema = z.object({
  year: z.string(),
  brand: z.string(),
  set: z.string(),
  cardNumber: z.string(),
  player: z.string(),
  grades: z.array(PopulationEntrySchema),
  totalGraded: z.number().int().min(0),
  lastUpdated: z.string(),
});

export type PopulationReport = z.infer<typeof PopulationReportSchema>;

// ─── Marketplace Aggregation ─────────────────────────────────────

export const MarketListingSchema = z.object({
  id: z.string(),
  source: z.enum(['ebay', 'comc', 'goldin', 'heritage', 'pwcc', 'myslabs']),
  title: z.string(),
  price: z.number().min(0),
  currency: z.string().default('USD'),
  condition: z.string(),
  grade: z.string().optional(),
  gradingCompany: z.string().optional(),
  imageUrl: z.string().url().optional(),
  listingUrl: z.string().url().optional(),
  endDate: z.string().optional(),
  isSold: z.boolean(),
  soldDate: z.string().optional(),
});

export type MarketListingValidated = z.infer<typeof MarketListingSchema>;

export const PriceAggregateSchema = z.object({
  averagePrice: z.number().min(0),
  medianPrice: z.number().min(0),
  lowPrice: z.number().min(0),
  highPrice: z.number().min(0),
  totalListings: z.number().int().min(0),
  soldListings: z.number().int().min(0),
  trendPercent: z.number(),
  trendPeriod: z.string().optional(),
  sources: z.array(z.string()).optional(),
  lastUpdated: z.string(),
});

export type PriceAggregateValidated = z.infer<typeof PriceAggregateSchema>;

// ─── Player / Sports Event ───────────────────────────────────────

export const GameEventSchema = z.object({
  id: z.string(),
  type: z.enum(['milestone', 'injury', 'trade', 'award', 'record', 'debut', 'retirement']),
  playerId: z.string(),
  playerName: z.string(),
  sport: z.enum(['baseball', 'basketball', 'football', 'hockey', 'soccer']),
  headline: z.string(),
  description: z.string(),
  impactScore: z.number().min(0).max(100),
  priceImpactPercent: z.number(),
  timestamp: z.string(),
  source: z.string(),
});

export type GameEventValidated = z.infer<typeof GameEventSchema>;

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
