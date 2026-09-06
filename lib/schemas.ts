/**
 * Zod Validation Schemas for External API Responses
 *
 * Validates data at system boundaries to prevent runtime crashes
 * from malformed API responses.
 */

import { z } from 'zod';
import type { CollaborativeThesis } from '../types';

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

export const NegotiationSellerResponseSchema = z.object({
  action: z.enum(['accept', 'counter', 'reject']),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'aggressive']),
  message: z.string().min(1),
  counterAmount: z.number().optional(),
  sellerFirmness: z.number().min(0).max(1).optional(),
  reasoning: z.string().optional(),
});

export type NegotiationSellerResponseValidated = z.infer<typeof NegotiationSellerResponseSchema>;

export const AgenticOfferResponseSchema = z.object({
  offerAmount: z.number(),
  message: z.string().min(1),
  reasoning: z.string(),
});

export type AgenticOfferResponseValidated = z.infer<typeof AgenticOfferResponseSchema>;

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
    object: z.record(z.string(), z.unknown()),
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

// ─── BGS/SGC Grading ─────────────────────────────────────────────

export const BGSSubgradeSchema = z.object({
  category: z.enum(['centering', 'corners', 'edges', 'surface']),
  grade: z.number().min(1).max(10),
});

export const BGSCertResponseSchema = z.object({
  certNumber: z.string(),
  company: z.enum(['BGS', 'SGC']),
  verified: z.boolean(),
  year: z.string().optional(),
  brand: z.string().optional(),
  set: z.string().optional(),
  cardNumber: z.string().optional(),
  player: z.string().optional(),
  grade: z.string().optional(),
  subgrades: z.array(BGSSubgradeSchema).optional(),
  labelType: z.string().optional(),
  imageUrl: z.string().url().optional(),
  lookupDate: z.string(),
});

export type BGSCertResponseValidated = z.infer<typeof BGSCertResponseSchema>;

// ─── Sports Data / Player ────────────────────────────────────────

export const PlayerProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  sport: z.enum(['baseball', 'basketball', 'football', 'hockey', 'soccer']),
  league: z.string(),
  team: z.string(),
  position: z.string(),
  number: z.string().optional(),
  birthDate: z.string().optional(),
  age: z.number().optional(),
  imageUrl: z.string().url().optional(),
  isRookie: z.boolean(),
  isActive: z.boolean(),
  experience: z.number().int().min(0),
  externalIds: z.object({
    mlbId: z.number().optional(),
    espnId: z.number().optional(),
    basketballReferenceId: z.string().optional(),
    proFootballReferenceId: z.string().optional(),
  }),
});

export type PlayerProfileValidated = z.infer<typeof PlayerProfileSchema>;

export const PlayerStatsSummarySchema = z.object({
  playerId: z.string(),
  season: z.string(),
  gamesPlayed: z.number().int().min(0),
  stats: z.record(z.string(), z.any()),
  performanceRating: z.number().min(0).max(100),
  trending: z.enum(['up', 'down', 'stable']),
});

export type PlayerStatsSummaryValidated = z.infer<typeof PlayerStatsSummarySchema>;

// ─── War Room / multi-agent committee JSON ───────────────────────────

export const WarRoomAgentInsightSchema = z.object({
  agentId: z.string(),
  agentName: z.string(),
  persona: z.string(),
  insight: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  confidence: z.number(),
  reasoningChain: z.array(z.string()).optional(),
  conflictNotes: z.array(z.string()).optional(),
});

export const WarRoomCommitteeExecutionActionSchema = z.object({
  id: z.string(),
  type: z.string(),
  assetName: z.string(),
  amount: z.number(),
  rationale: z.string(),
  timestamp: z.string(),
  status: z.string(),
});

/** Parsed body from Gemini structured output for the War Room committee flow. */
export const WarRoomCommitteeResponseSchema = z.object({
  summary: z.string(),
  keyTakeaways: z.array(z.string()),
  riskAssessment: z.string(),
  recommendedAction: z.string(),
  agents: z.array(WarRoomAgentInsightSchema),
  executionPlan: z.array(WarRoomCommitteeExecutionActionSchema).optional(),
});

export type WarRoomCommitteeResponseValidated = z.infer<typeof WarRoomCommitteeResponseSchema>;

export const WarRoomRunMetadataStoredSchema = z.object({
  inputHash: z.string(),
  promptVersion: z.string(),
  modelId: z.string(),
  includeStrategist: z.boolean(),
});

/** Hydrated thesis from `msi_war_room_last_thesis_v1` — lenient on executionPlan shape. */
export const CollaborativeThesisStoredSchema = z.object({
  id: z.string().min(1),
  summary: z.string(),
  keyTakeaways: z.array(z.string()),
  riskAssessment: z.string(),
  recommendedAction: z.string(),
  agents: z.array(WarRoomAgentInsightSchema),
  createdAt: z.string(),
  recommendationId: z.string().optional(),
  executionPlan: z.array(z.record(z.string(), z.unknown())).optional(),
  runMetadata: WarRoomRunMetadataStoredSchema.optional(),
});

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

/** Drop-in validation for War Room localStorage thesis payloads (prevents corrupt JSON from crashing the page). */
export function safeParseCollaborativeThesis(value: unknown): CollaborativeThesis | null {
  const result = CollaborativeThesisStoredSchema.safeParse(value);
  return result.success ? (result.data as unknown as CollaborativeThesis) : null;
}
