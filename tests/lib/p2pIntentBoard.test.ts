import { beforeEach, describe, expect, it } from 'vitest';
import { makeCard } from '../helpers';
import {
  MAX_OPEN_INTENTS,
  P2P_INTENT_BOARD_KEY,
  P2P_INTENT_DISCLOSURE,
  intentBoardDisclaimer,
  listIntents,
  listOpenIntents,
  normalizeIntent,
  normalizeIntents,
  postIntent,
  suggestAskFromCard,
  summarizeIntentBoard,
  withdrawIntent,
} from '../../lib/utils/p2pIntentBoard';
import { store } from '../../lib/dal/syncStore';

describe('p2pIntentBoard', () => {
  beforeEach(() => {
    localStorage.clear();
    store.remove(P2P_INTENT_BOARD_KEY);
  });

  it('normalizes junk and keeps advisory-only intents', () => {
    expect(normalizeIntent(null)).toBeNull();
    expect(normalizeIntent({ side: 'ask', player: '', limitPrice: 10 })).toBeNull();
    expect(normalizeIntents('nope')).toEqual([]);

    const ok = normalizeIntent({
      side: 'bid',
      player: '  Shohei Ohtani  ',
      limitPrice: '125.456',
      note: 'x'.repeat(300),
      status: 'open',
    });
    expect(ok?.player).toBe('Shohei Ohtani');
    expect(ok?.limitPrice).toBe(125.46);
    expect(ok?.note).toHaveLength(200);
    expect(ok?.advisoryOnly).toBe(true);
    expect(intentBoardDisclaimer()).toBe(P2P_INTENT_DISCLOSURE);
    expect(P2P_INTENT_DISCLOSURE).toMatch(/not a P2P exchange/i);
  });

  it('posts an ask from a held card and upserts the same card', () => {
    const card = makeCard({
      id: 'hold-1',
      player: 'Mike Trout',
      currentValue: 900,
      purchasePrice: 400,
    });
    const suggested = suggestAskFromCard(card);
    expect(suggested.side).toBe('ask');
    expect(suggested.limitPrice).toBe(900);

    const posted = postIntent({ ...suggested, note: 'Show floor ask' }, [card]);
    expect(posted.side).toBe('ask');
    expect(posted.cardId).toBe('hold-1');
    expect(posted.source).toBe('local_inventory');
    expect(posted.advisoryOnly).toBe(true);

    const updated = postIntent({ ...suggested, limitPrice: 950, note: 'Revised' }, [card]);
    expect(updated.id).toBe(posted.id);
    expect(updated.limitPrice).toBe(950);
    expect(listOpenIntents()).toHaveLength(1);
    expect(summarizeIntentBoard()).toEqual({ openBids: 0, openAsks: 1, totalOpen: 1 });
  });

  it('rejects sell intents for missing or sold cards and accepts manual bids', () => {
    const sold = makeCard({ id: 'sold-1', player: 'Sold Star', status: 'sold', currentValue: 200 });
    expect(() => postIntent({ side: 'ask', cardId: 'sold-1', limitPrice: 200 }, [sold])).toThrow(/held local inventory/i);
    expect(() => postIntent({ side: 'ask', cardId: 'missing', limitPrice: 10 }, [])).toThrow(/held local inventory/i);
    expect(() => postIntent({ side: 'bid', player: '  ', limitPrice: 50 })).toThrow(/player name/i);
    expect(() => postIntent({ side: 'bid', player: 'Rookie', limitPrice: 0 })).toThrow(/positive number/i);

    const bid = postIntent({ side: 'bid', player: 'Elly De La Cruz', limitPrice: 175, source: 'manual' });
    expect(bid.source).toBe('manual');
    expect(bid.cardId).toBeNull();
    expect(listIntents()).toHaveLength(1);

    const again = postIntent({ side: 'bid', player: 'elly de la cruz', limitPrice: 160 });
    expect(again.id).toBe(bid.id);
    expect(again.limitPrice).toBe(160);
  });

  it('withdraws an intent and caps open posts', () => {
    const first = postIntent({ side: 'bid', player: 'Alpha', limitPrice: 10 });
    expect(withdrawIntent(first.id)?.status).toBe('withdrawn');
    expect(listOpenIntents()).toHaveLength(0);
    expect(withdrawIntent('missing')).toBeNull();

    for (let i = 0; i < MAX_OPEN_INTENTS; i += 1) {
      postIntent({ side: 'bid', player: `Player ${i}`, limitPrice: 20 + i });
    }
    expect(() => postIntent({ side: 'bid', player: 'Overflow', limitPrice: 99 })).toThrow(/at most/i);
    expect(summarizeIntentBoard().totalOpen).toBe(MAX_OPEN_INTENTS);
  });
});
