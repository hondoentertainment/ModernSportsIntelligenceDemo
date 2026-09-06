import { describe, expect, it } from 'vitest';
import type { CardInventory } from '../../types';
import {
  buildInsurancePacket,
  INSURANCE_DISCLAIMER,
  INSURANCE_REPLACEMENT_MULTIPLIER,
  resolveFmvAsOf,
} from '../../lib/utils/insurancePacket';

const card = (over: Partial<CardInventory> = {}): CardInventory =>
  ({
    id: 'c1',
    player: 'Shohei Ohtani',
    year: 2018,
    manufacturer: 'Topps',
    cardNumber: '700',
    set: 'Update',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Gem Mint',
    isGraded: true,
    gradingCompany: 'PSA',
    grade: '10',
    certNumber: '12345678',
    purchasePrice: 200,
    purchaseDate: '2021-01-01',
    currentValue: 1000,
    lastValuationDate: '2026-08-01T00:00:00.000Z',
    valuationSource: 'ebay-api',
    status: 'active',
    ...over,
  }) as CardInventory;

describe('insurancePacket', () => {
  it('timestamps FMV, totals collection value, and discloses methodology', () => {
    const packet = buildInsurancePacket(
      [card(), card({ id: 'sold', status: 'sold', currentValue: 50 })],
      { generatedAt: '2026-09-06T12:00:00.000Z', ownerName: 'Ada', reportId: 'INS-TEST' }
    );
    expect(packet.totals.itemCount).toBe(1);
    expect(packet.totals.totalFmv).toBe(1000);
    expect(packet.totals.totalReplacement).toBe(1000 * INSURANCE_REPLACEMENT_MULTIPLIER);
    expect(packet.items[0].fmvAsOf).toBe('2026-08-01T00:00:00.000Z');
    expect(packet.items[0].certNumber).toBe('12345678');
    expect(packet.items[0].valuationSource).toBe('eBay adapter');
    expect(packet.methodology.length).toBeGreaterThan(0);
    expect(packet.disclaimer).toBe(INSURANCE_DISCLAIMER);
  });

  it('falls back to generation time when no valuation date exists', () => {
    expect(resolveFmvAsOf(card({ lastValuationDate: undefined, valuationTimestamp: undefined }), '2026-09-06T00:00:00.000Z')).toBe(
      '2026-09-06T00:00:00.000Z'
    );
  });
});
