import { describe, expect, it } from 'vitest';
import type { NegotiableItem } from '../../types';
import { NegotiationService } from '../../lib/trading/negotiationService';
import {
  MARKETPLACE_LOT_CATALOG,
  buildLotNegotiableItem,
  collectLotLines,
  defaultPackagePrice,
  lotDisplayName,
  packageDiscountPct,
  quoteLot,
  sumLotAsk,
  toLotLine,
} from '../../lib/trading/lotNegotiation';
import { recordNegotiation, getHistory, NEGOTIATION_HISTORY_KEY } from '../../lib/trading/negotiationAnalytics';
import { store } from '../../lib/dal/syncStore';

const lines = [
  { id: 'a', name: 'Card A', player: 'Elly De La Cruz', price: 100 },
  { id: 'b', name: 'Card B', player: 'Anthony Edwards', price: 200 },
  { id: 'c', name: 'Card C', player: 'Wemby', price: 50 },
];

describe('lotNegotiation', () => {
  it('sums asks and applies a demo package discount', () => {
    expect(sumLotAsk(lines)).toBe(350);
    expect(packageDiscountPct(1)).toBe(0);
    expect(packageDiscountPct(2)).toBe(6);
    expect(packageDiscountPct(5)).toBe(12);
    expect(packageDiscountPct(10)).toBe(14);
    expect(defaultPackagePrice(350, 3)).toBe(Math.round(350 * 0.92));
  });

  it('quotes sum vs package and names the lot', () => {
    const pkg = quoteLot(lines, 'package', 0.8);
    expect(pkg.mode).toBe('package');
    expect(pkg.ask).toBe(pkg.packagePrice);
    expect(pkg.suggestedOpening).toBe(Math.round(pkg.ask * 0.8));

    const sum = quoteLot(lines, 'sum', 0.8);
    expect(sum.ask).toBe(350);
    expect(lotDisplayName(lines)).toMatch(/^Lot of 3: Elly De La Cruz, Anthony Edwards/);
    expect(lotDisplayName(lines.slice(0, 1))).toBe('Elly De La Cruz');
  });

  it('collects nested marketplace lots without duplicate lines', () => {
    const prebuilt = MARKETPLACE_LOT_CATALOG.find((item) => item.id === 'market-lot-bowman-five');
    expect(prebuilt?.lotItems?.length).toBe(5);
    const singles = MARKETPLACE_LOT_CATALOG.filter((item) => item.id === 'market-1' || item.id === 'market-2');
    const merged = collectLotLines([prebuilt as NegotiableItem, ...singles]);
    const ids = merged.map((line) => line.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('market-1');
  });

  it('builds a negotiable lot and persists Arena history under the lot name', () => {
    store.remove(NEGOTIATION_HISTORY_KEY);
    const lot = buildLotNegotiableItem(lines, 'package');
    expect(lot.pricingMode).toBe('package');
    expect(lot.lotItems).toHaveLength(3);
    expect(lot.price).toBe(quoteLot(lines, 'package').ask);

    const session = NegotiationService.startNegotiation(lot, 300);
    expect(session.targetItem.lotSize).toBe(3);
    expect(session.messages[0].content).toMatch(/3-card lot/);
    session.currentUserOffer = 280;
    session.status = 'accepted';
    const record = recordNegotiation(session, 'Bundle Discount', 'accepted');
    expect(record.itemName).toMatch(/Lot of 3/);
    expect(getHistory()).toHaveLength(1);
  });

  it('maps a single catalog card to a lot line', () => {
    const line = toLotLine({
      id: 'x',
      player: 'Judge',
      price: 90,
      year: 2022,
      manufacturer: 'Topps',
    });
    expect(line.price).toBe(90);
    expect(line.player).toBe('Judge');
  });
});
