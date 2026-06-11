import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateInstantBuyQuote,
  recordInstantBuy,
  getInstantBuyHistory,
  initInstantBuyService,
} from '../../lib/trading/instantBuyService';
import { store } from '../../lib/dal/syncStore';
import type { CardInventory } from '../../types';

const SAMPLE_CARD = {
  id: 'card-test',
  player: 'Test Player',
  sport: 'Baseball',
  manufacturer: 'Topps',
  set: 'Base',
  year: 2024,
  currentValue: 500,
  purchasePrice: 100,
  status: 'active',
  rarity: 'Base',
  grade: 'PSA 9',
  // Minimal shape that LiquidityService (and ScarcityService it pulls in) can
  // score — needs player, sport, year, set in addition to price fields.
} as unknown as CardInventory;

describe('instantBuyService — per-user history persistence', () => {
  beforeEach(() => {
    initInstantBuyService(null);
    store.set('msi_instant_buy_history__guest', []);
    store.set('msi_instant_buy_history__user-a', []);
    store.set('msi_instant_buy_history__user-b', []);
  });

  it('records a quote under the active user key and recovers it on read', () => {
    initInstantBuyService('user-a');
    const quote = generateInstantBuyQuote(SAMPLE_CARD);
    expect(quote).not.toBeNull();
    recordInstantBuy(quote!, false);
    const history = getInstantBuyHistory();
    expect(history.length).toBe(1);
    expect(history[0].cardId).toBe('card-test');
    expect(history[0].finalPayout).toBe(quote!.netPayout);
  });

  it('applies the speed bonus only when accepted in the speed window', () => {
    initInstantBuyService('user-a');
    const quote = generateInstantBuyQuote(SAMPLE_CARD)!;
    recordInstantBuy(quote, true);
    const [entry] = getInstantBuyHistory();
    expect(entry.speedBonusApplied).toBe(true);
    expect(entry.finalPayout).toBeCloseTo(quote.netPayout + quote.speedBonus, 2);
  });

  it('does not leak history across users on the same browser', () => {
    initInstantBuyService('user-a');
    recordInstantBuy(generateInstantBuyQuote(SAMPLE_CARD)!, false);
    initInstantBuyService('user-b');
    expect(getInstantBuyHistory().length).toBe(0);
    initInstantBuyService('user-a');
    expect(getInstantBuyHistory().length).toBe(1);
  });
});
