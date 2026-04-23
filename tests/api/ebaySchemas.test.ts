// @ts-nocheck
/**
 * Tests for Zod schema validation of eBay Browse API responses.
 * Covers:
 *   - ebaySearchResponseSchema (/buy/browse/v1/item_summary/search)
 *   - ebayItemDetailSchema (/buy/browse/v1/item/{itemId})
 *   - USE_REAL_EBAY env flag auto-enabling when VITE_EBAY_CLIENT_ID is set
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ebaySearchResponseSchema,
  ebayItemSummarySchema,
  ebayItemDetailSchema,
} from '../../api/market/ebay';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeItemSummary(overrides = {}) {
  return {
    itemId: 'v1|123456789|0',
    title: '2020 Topps Chrome Mike Trout PSA 10 Baseball Card',
    price: { value: '99.99', currency: 'USD' },
    condition: 'Like New',
    conditionId: '3000',
    itemCreationDate: '2024-01-15T10:30:00.000Z',
    itemEndDate: '2024-02-15T10:30:00.000Z',
    itemWebUrl: 'https://www.ebay.com/itm/123456789',
    image: { imageUrl: 'https://i.ebayimg.com/images/g/abc/s-l1600.jpg' },
    seller: { username: 'cardseller2024', feedbackScore: 1234 },
    buyingOptions: ['FIXED_PRICE'],
    ...overrides,
  };
}

function makeSearchResponse(overrides = {}) {
  return {
    href: 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=mike+trout+card',
    total: 1500,
    next: 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=mike+trout+card&offset=50',
    limit: 50,
    offset: 0,
    itemSummaries: [makeItemSummary()],
    ...overrides,
  };
}

function makeItemDetail(overrides = {}) {
  return {
    itemId: 'v1|123456789|0',
    title: '2020 Topps Chrome Mike Trout PSA 10 Baseball Card',
    price: { value: '99.99', currency: 'USD' },
    condition: 'Like New',
    conditionId: '3000',
    description: '<p>Beautiful card in excellent condition.</p>',
    itemCreationDate: '2024-01-15T10:30:00.000Z',
    itemEndDate: '2024-02-15T10:30:00.000Z',
    itemWebUrl: 'https://www.ebay.com/itm/123456789',
    image: { imageUrl: 'https://i.ebayimg.com/images/g/abc/s-l1600.jpg' },
    additionalImages: [
      { imageUrl: 'https://i.ebayimg.com/images/g/def/s-l1600.jpg' },
    ],
    seller: { username: 'cardseller2024', feedbackScore: 1234 },
    buyingOptions: ['FIXED_PRICE'],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// ebayItemSummarySchema
// ---------------------------------------------------------------------------

describe('ebayItemSummarySchema', () => {
  it('accepts a valid item summary', () => {
    const result = ebayItemSummarySchema.safeParse(makeItemSummary());
    expect(result.success).toBe(true);
  });

  it('accepts a minimal item summary (all fields optional except nothing required)', () => {
    // The schema has no required fields — everything is optional
    const result = ebayItemSummarySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts extra unknown fields via passthrough', () => {
    const input = makeItemSummary({ unknownField: 'extra data' });
    const result = ebayItemSummarySchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.unknownField).toBe('extra data');
    }
  });

  it('rejects invalid price structure (value must be string)', () => {
    const input = makeItemSummary({ price: { value: 99.99, currency: 'USD' } });
    const result = ebayItemSummarySchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid price structure (currency missing)', () => {
    const input = makeItemSummary({ price: { value: '99.99' } });
    const result = ebayItemSummarySchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid image structure (imageUrl must be string)', () => {
    const input = makeItemSummary({ image: { imageUrl: 42 } });
    const result = ebayItemSummarySchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects non-string itemId', () => {
    const input = makeItemSummary({ itemId: 12345 });
    const result = ebayItemSummarySchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ebaySearchResponseSchema
// ---------------------------------------------------------------------------

describe('ebaySearchResponseSchema', () => {
  it('accepts a full valid search response', () => {
    const result = ebaySearchResponseSchema.safeParse(makeSearchResponse());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.total).toBe(1500);
      expect(result.data.itemSummaries).toHaveLength(1);
    }
  });

  it('accepts a response with no itemSummaries (empty result set)', () => {
    const result = ebaySearchResponseSchema.safeParse(
      makeSearchResponse({ itemSummaries: [] })
    );
    expect(result.success).toBe(true);
  });

  it('accepts a response with undefined itemSummaries (field is optional)', () => {
    const input = makeSearchResponse();
    delete input.itemSummaries;
    const result = ebaySearchResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('accepts a minimal response (all fields optional)', () => {
    const result = ebaySearchResponseSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts extra unknown fields via passthrough', () => {
    const input = makeSearchResponse({ warnings: [{ code: 'W001', message: 'test' }] });
    const result = ebaySearchResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects when total is not a number', () => {
    const input = makeSearchResponse({ total: '1500' });
    const result = ebaySearchResponseSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects when limit is not a number', () => {
    const input = makeSearchResponse({ limit: '50' });
    const result = ebaySearchResponseSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects when itemSummaries contains invalid item (price value not string)', () => {
    const badItem = makeItemSummary({ price: { value: 99, currency: 'USD' } });
    const input = makeSearchResponse({ itemSummaries: [badItem] });
    const result = ebaySearchResponseSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects when itemSummaries is not an array', () => {
    const input = makeSearchResponse({ itemSummaries: 'not-an-array' });
    const result = ebaySearchResponseSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('accepts response with next and prev pagination links', () => {
    const input = makeSearchResponse({
      prev: 'https://api.ebay.com/buy/browse/v1/item_summary/search?offset=0',
      next: 'https://api.ebay.com/buy/browse/v1/item_summary/search?offset=100',
    });
    const result = ebaySearchResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prev).toBeDefined();
      expect(result.data.next).toBeDefined();
    }
  });

  it('returns structured data matching input on valid parse', () => {
    const input = makeSearchResponse();
    const result = ebaySearchResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      const item = result.data.itemSummaries?.[0];
      expect(item?.itemId).toBe('v1|123456789|0');
      expect(item?.price?.value).toBe('99.99');
      expect(item?.price?.currency).toBe('USD');
    }
  });
});

// ---------------------------------------------------------------------------
// ebayItemDetailSchema
// ---------------------------------------------------------------------------

describe('ebayItemDetailSchema', () => {
  it('accepts a full valid item detail response', () => {
    const result = ebayItemDetailSchema.safeParse(makeItemDetail());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.itemId).toBe('v1|123456789|0');
    }
  });

  it('rejects when itemId is missing (required field)', () => {
    const input = makeItemDetail();
    delete input.itemId;
    const result = ebayItemDetailSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects when itemId is not a string', () => {
    const input = makeItemDetail({ itemId: 12345 });
    const result = ebayItemDetailSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('accepts item detail with no optional fields', () => {
    const result = ebayItemDetailSchema.safeParse({ itemId: 'v1|123|0' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid price value type (number instead of string)', () => {
    const input = makeItemDetail({ price: { value: 99.99, currency: 'USD' } });
    const result = ebayItemDetailSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('accepts extra unknown fields via passthrough', () => {
    const input = makeItemDetail({ customField: 'extra' });
    const result = ebayItemDetailSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customField).toBe('extra');
    }
  });

  it('accepts additionalImages array', () => {
    const input = makeItemDetail({
      additionalImages: [
        { imageUrl: 'https://i.ebayimg.com/a.jpg' },
        { imageUrl: 'https://i.ebayimg.com/b.jpg' },
      ],
    });
    const result = ebayItemDetailSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.additionalImages).toHaveLength(2);
    }
  });

  it('rejects malformed additionalImages (imageUrl not string)', () => {
    const input = makeItemDetail({
      additionalImages: [{ imageUrl: 42 }],
    });
    const result = ebayItemDetailSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('accepts seller with optional feedbackScore omitted', () => {
    const input = makeItemDetail({ seller: { username: 'seller123' } });
    const result = ebayItemDetailSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects seller with non-string username', () => {
    const input = makeItemDetail({ seller: { username: 42, feedbackScore: 100 } });
    const result = ebayItemDetailSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects completely invalid input (non-object)', () => {
    const result = ebayItemDetailSchema.safeParse('not-an-object');
    expect(result.success).toBe(false);
  });

  it('rejects null input', () => {
    const result = ebayItemDetailSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// USE_REAL_EBAY / env flag behaviour (featureFlags integration)
// ---------------------------------------------------------------------------

describe('USE_REAL_EBAY env flag', () => {
  // We test the featureFlags module's resolveUseRealEbay logic indirectly
  // through the exported functions.

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('USE_REAL_EBAY defaults to false when no env vars are set', async () => {
    vi.stubEnv('VITE_FF_REAL_EBAY', '');
    vi.stubEnv('VITE_EBAY_CLIENT_ID', '');
    const { initFeatureFlags, resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const flags = initFeatureFlags();
    expect(flags.USE_REAL_EBAY).toBe(false);
  });

  it('USE_REAL_EBAY is true when VITE_FF_REAL_EBAY=true', async () => {
    vi.stubEnv('VITE_FF_REAL_EBAY', 'true');
    vi.stubEnv('VITE_EBAY_CLIENT_ID', '');
    const { initFeatureFlags, resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const flags = initFeatureFlags();
    expect(flags.USE_REAL_EBAY).toBe(true);
  });

  it('USE_REAL_EBAY is true when VITE_EBAY_CLIENT_ID is set (auto-enable)', async () => {
    vi.stubEnv('VITE_FF_REAL_EBAY', '');
    vi.stubEnv('VITE_EBAY_CLIENT_ID', 'my-app-id-value');
    const { initFeatureFlags, resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const flags = initFeatureFlags();
    expect(flags.USE_REAL_EBAY).toBe(true);
  });

  it('USE_REAL_EBAY remains true when both VITE_FF_REAL_EBAY=true and VITE_EBAY_CLIENT_ID are set', async () => {
    vi.stubEnv('VITE_FF_REAL_EBAY', 'true');
    vi.stubEnv('VITE_EBAY_CLIENT_ID', 'my-app-id-value');
    const { initFeatureFlags, resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const flags = initFeatureFlags();
    expect(flags.USE_REAL_EBAY).toBe(true);
  });

  it('USE_REAL_EBAY is false when VITE_EBAY_CLIENT_ID is whitespace only', async () => {
    vi.stubEnv('VITE_FF_REAL_EBAY', '');
    vi.stubEnv('VITE_EBAY_CLIENT_ID', '   ');
    const { initFeatureFlags, resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const flags = initFeatureFlags();
    expect(flags.USE_REAL_EBAY).toBe(false);
  });
});
