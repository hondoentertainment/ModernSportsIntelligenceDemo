import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import {
  P2P_ESCROW_KEY,
  P2P_ESCROW_LEDGER_KEY,
  P2P_MATCH_DISCLOSURE,
  P2P_REPUTATION_KEY,
  applyEscrowEvent,
  classifyMatchQuality,
  escrowLabel,
  listEscrowLedger,
  listEscrowStubs,
  localReputation,
  scoreReputation,
  intentsShareCardIdentity,
  suggestMatches,
  transitionEscrow,
  writeReputationStats,
} from '../../lib/trading/p2pMatchingEngine';
import { P2P_INTENT_BOARD_KEY, listOpenIntents, postIntent } from '../../lib/utils/p2pIntentBoard';
import { makeCard } from '../helpers';

describe('p2pMatchingEngine', () => {
  beforeEach(() => {
    localStorage.clear();
    store.remove(P2P_INTENT_BOARD_KEY);
    store.remove(P2P_REPUTATION_KEY);
    store.remove(P2P_ESCROW_KEY);
    store.remove(P2P_ESCROW_LEDGER_KEY);
  });

  it('suggests crossings and near misses on the same player', () => {
    const card = makeCard({ id: 'c1', player: 'Juan Soto', currentValue: 200 });
    postIntent({ side: 'ask', cardId: 'c1', limitPrice: 200 }, [card]);
    postIntent({ side: 'bid', player: 'Juan Soto', year: card.year, set: card.set, limitPrice: 220 });
    const matches = suggestMatches();
    expect(matches).toHaveLength(1);
    expect(matches[0]?.quality).toBe('crosses');
    expect(matches[0]?.advisoryOnly).toBe(true);
    expect(classifyMatchQuality(-10)).toBe('near');
    expect(classifyMatchQuality(-40)).toBe('watch');
    expect(P2P_MATCH_DISCLOSURE).toMatch(/not a live exchange/i);
  });

  it('scores reputation from completion and dispute fields', () => {
    expect(scoreReputation({ completed: 0, disputed: 0, withdrawn: 0, open: 0 }).band).toBe('unproven');
    expect(scoreReputation({ completed: 4, disputed: 0, withdrawn: 0, open: 1 }).band).toBe('reliable');
    expect(scoreReputation({ completed: 1, disputed: 2, withdrawn: 0, open: 0 }).band).toBe('disputed');
    writeReputationStats({ completed: 3, disputed: 0, withdrawn: 0, open: 1 });
    expect(localReputation().score).toBeGreaterThan(50);
  });

  it('runs an escrow stub state machine and ledger without real money', () => {
    expect(transitionEscrow('none', 'fund_stub')).toBeNull();
    const match = { id: 'match-1', bidPrice: 220, askPrice: 200 };
    const offered = applyEscrowEvent(match, 'offer');
    expect(offered?.escrow.state).toBe('offered');
    expect(applyEscrowEvent(match, 'fund_stub')?.escrow.state).toBe('funded_stub');
    expect(applyEscrowEvent(match, 'release_stub')?.escrow.state).toBe('released_stub');
    expect(listEscrowLedger()[0]?.to).toBe('released_stub');
    expect(escrowLabel('offered')).toMatch(/offered/i);
    expect(escrowLabel('funded_stub')).toMatch(/no real money/i);
    expect(escrowLabel('released_stub')).toMatch(/Released/i);
    expect(escrowLabel('disputed')).toMatch(/Disputed/i);
    expect(escrowLabel('cancelled')).toMatch(/Cancelled/i);
    expect(escrowLabel('none')).toMatch(/No escrow/i);
    expect(applyEscrowEvent(match, 'offer')).toBeNull();
    expect(localReputation().stats.completed).toBe(1);
    applyEscrowEvent({ id: 'match-2', bidPrice: 10, askPrice: 10 }, 'offer');
    applyEscrowEvent({ id: 'match-2', bidPrice: 10, askPrice: 10 }, 'dispute');
    expect(localReputation().stats.disputed).toBe(1);
  });

  it('skips year mismatches and junk escrow storage', () => {
    const card = makeCard({ id: 'c2', player: 'Juan Soto', year: 2022, currentValue: 200 });
    postIntent({ side: 'ask', cardId: 'c2', year: 2022, limitPrice: 200 }, [card]);
    postIntent({ side: 'bid', player: 'Juan Soto', year: 2018, limitPrice: 220 });
    expect(suggestMatches()).toHaveLength(0);
    store.set(P2P_ESCROW_KEY, { nope: true } as never);
    store.set(P2P_ESCROW_LEDGER_KEY, { nope: true } as never);
    expect(listEscrowStubs()).toEqual([]);
    expect(listEscrowLedger()).toEqual([]);
  });

  it('does not cross different sets of the same player and year', () => {
    const chrome = makeCard({
      id: 'c4',
      player: 'Juan Soto',
      year: 2022,
      set: 'Chrome',
      manufacturer: 'Topps',
      currentValue: 200,
    });
    postIntent({ side: 'ask', cardId: 'c4', limitPrice: 200 }, [chrome]);
    postIntent({
      side: 'bid',
      player: 'Juan Soto',
      year: 2022,
      set: 'Update',
      manufacturer: 'Topps',
      limitPrice: 220,
    });
    expect(suggestMatches()).toHaveLength(0);
  });

  it('skips player mismatches and tolerates junk reputation storage', () => {
    const trout = makeCard({ id: 'c3', player: 'Mike Trout', currentValue: 180 });
    postIntent({ side: 'ask', cardId: 'c3', limitPrice: 180 }, [trout]);
    postIntent({ side: 'bid', player: 'Juan Soto', limitPrice: 220 });
    expect(suggestMatches()).toHaveLength(0);
    postIntent({ side: 'bid', player: 'Juan Soto', limitPrice: 220 });
    expect(suggestMatches()).toHaveLength(0);
    const ask = listOpenIntents().find((row) => row.side === 'ask');
    const bareBid = listOpenIntents().find((row) => row.side === 'bid' && !row.year);
    if (ask && bareBid) expect(intentsShareCardIdentity(bareBid, ask)).toBe(false);
    store.set(P2P_REPUTATION_KEY, { completed: 'x', disputed: null, withdrawn: '2' } as never);
    expect(localReputation().stats.withdrawn).toBe(2);
    expect(localReputation().stats.completed).toBe(0);
    const uuid = crypto.randomUUID;
    Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: undefined });
    const created = applyEscrowEvent({ id: 'match-noid', bidPrice: 10, askPrice: 10 }, 'offer');
    expect(created?.escrow.id).toMatch(/^escrow-/);
    Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: uuid });
  });

  it('does not cross different sets of the same player and year', () => {
    const chrome = makeCard({
      id: 'c4',
      player: 'Juan Soto',
      year: 2022,
      set: 'Chrome',
      manufacturer: 'Topps',
      currentValue: 200,
    });
    postIntent({ side: 'ask', cardId: 'c4', limitPrice: 200 }, [chrome]);
    postIntent({
      side: 'bid',
      player: 'Juan Soto',
      year: 2022,
      set: 'Update',
      manufacturer: 'Topps',
      limitPrice: 220,
    });
    expect(suggestMatches()).toHaveLength(0);
  });
});
