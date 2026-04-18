import { describe, it, expect } from 'vitest';
import {
  GeminiResponseSchema,
  GeminiValuationSchema,
  EbaySearchResponseSchema,
  MLBPlayerSchema,
  CardInventoryInputSchema,
  safeParse,
  WarRoomCommitteeResponseSchema,
  safeParseCollaborativeThesis,
} from '../../lib/schemas';

describe('GeminiResponseSchema', () => {
  it('should accept valid response', () => {
    const result = GeminiResponseSchema.safeParse({ text: 'Hello world' });
    expect(result.success).toBe(true);
  });

  it('should reject missing text', () => {
    const result = GeminiResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject non-string text', () => {
    const result = GeminiResponseSchema.safeParse({ text: 42 });
    expect(result.success).toBe(false);
  });
});

describe('GeminiValuationSchema', () => {
  it('should accept valid valuation', () => {
    const result = GeminiValuationSchema.safeParse({
      estimatedValue: 150,
      low: 100,
      high: 200,
      confidence: 85,
      rationale: 'Based on recent sales',
    });
    expect(result.success).toBe(true);
  });

  it('should reject negative values', () => {
    const result = GeminiValuationSchema.safeParse({
      estimatedValue: -10,
      low: 100,
      high: 200,
      confidence: 50,
    });
    expect(result.success).toBe(false);
  });

  it('should reject confidence > 100', () => {
    const result = GeminiValuationSchema.safeParse({
      estimatedValue: 150,
      low: 100,
      high: 200,
      confidence: 150,
    });
    expect(result.success).toBe(false);
  });
});

describe('EbaySearchResponseSchema', () => {
  it('should accept empty response with defaults', () => {
    const result = EbaySearchResponseSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.itemSummaries).toEqual([]);
      expect(result.data.total).toBe(0);
    }
  });

  it('should accept response with items', () => {
    const result = EbaySearchResponseSchema.safeParse({
      itemSummaries: [
        {
          itemId: '123',
          title: 'PSA 10 Trout',
          price: { value: '150.00', currency: 'USD' },
        },
      ],
      total: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe('MLBPlayerSchema', () => {
  it('should accept valid player with defaults', () => {
    const result = MLBPlayerSchema.safeParse({
      id: 545361,
      fullName: 'Mike Trout',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe('');
      expect(result.data.currentTeam.name).toBe('Unknown');
    }
  });

  it('should reject missing id', () => {
    const result = MLBPlayerSchema.safeParse({ fullName: 'Test' });
    expect(result.success).toBe(false);
  });
});

describe('CardInventoryInputSchema', () => {
  const validCard = {
    player: 'Mike Trout',
    year: 2023,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Chrome',
    sport: 'Baseball',
    league: 'MLB',
    purchasePrice: 50,
    condition: 'Near Mint',
    isGraded: true,
    isAutographed: false,
    gradingCompany: 'PSA',
    grade: '10',
  };

  it('should accept valid card input', () => {
    const result = CardInventoryInputSchema.safeParse(validCard);
    expect(result.success).toBe(true);
  });

  it('should reject empty player name', () => {
    const result = CardInventoryInputSchema.safeParse({ ...validCard, player: '' });
    expect(result.success).toBe(false);
  });

  it('should reject negative purchase price', () => {
    const result = CardInventoryInputSchema.safeParse({ ...validCard, purchasePrice: -10 });
    expect(result.success).toBe(false);
  });

  it('should reject invalid sport', () => {
    const result = CardInventoryInputSchema.safeParse({ ...validCard, sport: 'Cricket' });
    expect(result.success).toBe(false);
  });

  it('should reject year out of range', () => {
    const result = CardInventoryInputSchema.safeParse({ ...validCard, year: 1800 });
    expect(result.success).toBe(false);
  });
});

describe('safeParse', () => {
  it('should return parsed data on success', () => {
    const result = safeParse(GeminiResponseSchema, { text: 'hello' }, 'test');
    expect(result).toEqual({ text: 'hello' });
  });

  it('should return null on failure', () => {
    const result = safeParse(GeminiResponseSchema, { wrong: 'shape' }, 'test');
    expect(result).toBeNull();
  });

  it('should return null on failure without context (log prefix branch)', () => {
    const result = safeParse(GeminiResponseSchema, { wrong: 'shape' });
    expect(result).toBeNull();
  });

  it('should work without context', () => {
    const result = safeParse(GeminiResponseSchema, { text: 'hello' });
    expect(result).toEqual({ text: 'hello' });
  });
});

describe('MarketListingSchema', () => {
  it('should accept valid listing', async () => {
    const { MarketListingSchema } = await import('../../lib/schemas');
    const result = MarketListingSchema.safeParse({
      id: '123',
      source: 'ebay',
      title: 'Test Card',
      price: 100,
      condition: 'Mint',
      isSold: false,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid source', async () => {
    const { MarketListingSchema } = await import('../../lib/schemas');
    const result = MarketListingSchema.safeParse({
      id: '123',
      source: 'invalid',
      title: 'Test',
      price: 100,
      condition: 'Mint',
      isSold: false,
    });
    expect(result.success).toBe(false);
  });
});

describe('PriceAggregateSchema', () => {
  it('should accept valid aggregate', async () => {
    const { PriceAggregateSchema } = await import('../../lib/schemas');
    const result = PriceAggregateSchema.safeParse({
      averagePrice: 100,
      medianPrice: 95,
      lowPrice: 80,
      highPrice: 120,
      totalListings: 10,
      soldListings: 5,
      trendPercent: 5.5,
      lastUpdated: '2024-01-01',
    });
    expect(result.success).toBe(true);
  });
});

describe('GameEventSchema', () => {
  it('should accept valid game event', async () => {
    const { GameEventSchema } = await import('../../lib/schemas');
    const result = GameEventSchema.safeParse({
      id: 'event-1',
      type: 'milestone',
      playerId: 'player-1',
      playerName: 'Test Player',
      sport: 'baseball',
      headline: 'Test Headline',
      description: 'Test Description',
      impactScore: 50,
      priceImpactPercent: 10,
      timestamp: '2024-01-01',
      source: 'MLB',
    });
    expect(result.success).toBe(true);
  });
});

describe('BGSCertResponseSchema', () => {
  it('should accept valid BGS cert', async () => {
    const { BGSCertResponseSchema } = await import('../../lib/schemas');
    const result = BGSCertResponseSchema.safeParse({
      certNumber: '123456',
      company: 'BGS',
      verified: true,
      lookupDate: '2024-01-01',
    });
    expect(result.success).toBe(true);
  });
});

describe('PlayerProfileSchema', () => {
  it('should accept valid player profile', async () => {
    const { PlayerProfileSchema } = await import('../../lib/schemas');
    const result = PlayerProfileSchema.safeParse({
      id: 'player-1',
      name: 'Test Player',
      firstName: 'Test',
      lastName: 'Player',
      sport: 'baseball',
      league: 'MLB',
      team: 'Angels',
      position: 'OF',
      isRookie: false,
      isActive: true,
      experience: 5,
      externalIds: {},
    });
    expect(result.success).toBe(true);
  });
});

describe('PlayerStatsSummarySchema', () => {
  it('should accept valid stats summary', async () => {
    const { PlayerStatsSummarySchema } = await import('../../lib/schemas');
    const result = PlayerStatsSummarySchema.safeParse({
      playerId: 'player-1',
      season: '2024',
      gamesPlayed: 100,
      stats: { hits: 150 },
      performanceRating: 85,
      trending: 'up',
    });
    expect(result.success).toBe(true);
  });
});

describe('WarRoomCommitteeResponseSchema', () => {
  it('accepts a valid committee payload', () => {
    const result = WarRoomCommitteeResponseSchema.safeParse({
      summary: 'Balanced',
      keyTakeaways: ['a', 'b', 'c'],
      riskAssessment: 'Medium',
      recommendedAction: 'Hold',
      agents: [
        {
          agentId: 'scout',
          agentName: 'Scout Prime',
          persona: 'x',
          insight: 'y',
          sentiment: 'neutral',
          confidence: 0.7,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid agent sentiment', () => {
    const result = WarRoomCommitteeResponseSchema.safeParse({
      summary: 'x',
      keyTakeaways: ['a'],
      riskAssessment: 'r',
      recommendedAction: 'h',
      agents: [
        {
          agentId: 'scout',
          agentName: 'Scout Prime',
          persona: 'x',
          insight: 'y',
          sentiment: 'bullish',
          confidence: 0.7,
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('safeParseCollaborativeThesis', () => {
  it('returns null for corrupt or partial payloads', () => {
    expect(safeParseCollaborativeThesis(null)).toBeNull();
    expect(safeParseCollaborativeThesis({ id: 'x' })).toBeNull();
    expect(
      safeParseCollaborativeThesis({
        id: 't1',
        summary: 's',
        keyTakeaways: 'not-array',
        riskAssessment: 'r',
        recommendedAction: 'a',
        agents: [],
        createdAt: '2026-01-01',
      }),
    ).toBeNull();
  });

  it('returns thesis for valid stored shape including runMetadata', () => {
    const t = safeParseCollaborativeThesis({
      id: 'thesis-1',
      summary: 'S',
      keyTakeaways: ['k'],
      riskAssessment: 'low',
      recommendedAction: 'hold',
      agents: [
        {
          agentId: 'a',
          agentName: 'A',
          persona: 'p',
          insight: 'i',
          sentiment: 'positive',
          confidence: 0.9,
        },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      runMetadata: {
        inputHash: '0'.repeat(32),
        promptVersion: 'v1',
        modelId: 'm',
        includeStrategist: false,
      },
    });
    expect(t).not.toBeNull();
    expect(t?.runMetadata?.inputHash).toHaveLength(32);
  });
});
