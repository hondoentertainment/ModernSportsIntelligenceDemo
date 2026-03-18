import { describe, it, expect } from 'vitest';
import {
  GeminiResponseSchema,
  GeminiValuationSchema,
  EbaySearchResponseSchema,
  MLBPlayerSchema,
  CardInventoryInputSchema,
  safeParse,
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
});
