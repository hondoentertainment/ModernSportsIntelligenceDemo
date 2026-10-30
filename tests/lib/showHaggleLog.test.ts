import { describe, expect, it } from 'vitest';
import { addHaggle, readHaggle, removeHaggle } from '../../lib/shows/showHaggleLog';

describe('showHaggleLog', () => {
  it('stores a table note on the show and drops it', () => {
    const saved = addHaggle({
      showId: 'nyc',
      dealer: '  Rivera Cards  ',
      table: '12',
      askUsd: 80,
      offerUsd: 65,
      result: 'bought',
      note: 'Held firm then moved',
    });
    expect(saved.error).toBeNull();
    expect(saved.notes).toHaveLength(1);
    expect(saved.notes[0]).toMatchObject({ dealer: 'Rivera Cards', table: '12', result: 'bought', askUsd: 80, offerUsd: 65 });
    expect(saved.notes[0].savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    const dated = addHaggle({
      showId: 'nyc',
      dealer: 'Ace',
      table: '2',
      askUsd: 10,
      offerUsd: 8,
      result: 'open',
      note: '',
      savedAt: '2026-10-14T00:00:00Z',
      cardId: 'judge-1',
    });
    expect(dated.notes[0]).toMatchObject({ cardId: 'judge-1', savedAt: '2026-10-14T00:00:00.000Z' });
    const dropped = addHaggle({
      showId: 'nyc', dealer: 'Ace', table: '3', askUsd: 10, offerUsd: 8, result: 'open', note: '', cardId: 'bad id',
    });
    expect(dropped.notes[0].cardId).toBeUndefined();
    const named = addHaggle({
      showId: 'nyc',
      dealer: 'Named',
      table: '5',
      askUsd: 12,
      offerUsd: 0,
      result: 'passed',
      note: '',
      player: '  Showclose   Player ',
      detail: '  2024 Topps  ',
      sport: 'Basketball',
    });
    expect(named.notes[0]).toMatchObject({ player: 'Showclose Player', detail: '2024 Topps', sport: 'Basketball' });
    const droppedSport = addHaggle({
      showId: 'nyc', dealer: 'Named', table: '6', askUsd: 12, offerUsd: 0, result: 'open', note: '', sport: 'Cricket' as 'Baseball',
    });
    expect(droppedSport.notes[0].sport).toBeUndefined();
    const lot = addHaggle({
      showId: 'nyc',
      dealer: 'Lot Dealer',
      table: '9',
      askUsd: 100,
      offerUsd: 80,
      result: 'bought',
      note: '',
      player: 'Aaron Judge',
      lines: [
        { player: ' Aaron Judge ', askUsd: 40, cardId: 'judge' },
        { player: 'Jayson Tatum', askUsd: 60, detail: ' 2024 Prizm ', sport: 'Basketball' },
      ],
    });
    expect(lot.error).toBeNull();
    expect(lot.notes[0].lines).toEqual([
      { player: 'Aaron Judge', askUsd: 40, cardId: 'judge', detail: undefined, sport: undefined },
      { player: 'Jayson Tatum', askUsd: 60, detail: '2024 Prizm', sport: 'Basketball', cardId: undefined },
    ]);
    expect(addHaggle({
      showId: 'nyc', dealer: 'Lot', table: '1', askUsd: 10, offerUsd: 0, result: 'open', note: '',
      lines: [{ player: 'One' }, { player: '' }],
    }).error).toMatch(/name each card/i);
    expect(addHaggle({
      showId: 'nyc', dealer: 'Lot', table: '1', askUsd: 10, offerUsd: 0, result: 'open', note: '',
      lines: [{ player: 'One', askUsd: -1 }, { player: 'Two', askUsd: 2 }],
    }).error).toMatch(/card ask/i);
    expect(addHaggle({
      showId: 'nyc', dealer: 'Lot', table: '1', askUsd: 10, offerUsd: 0, result: 'open', note: '',
      lines: Array.from({ length: 7 }, () => ({ player: 'Card', askUsd: 1 })),
    }).error).toMatch(/up to 6/);
    expect(readHaggle('nyc')).toHaveLength(6);
    expect(readHaggle('other')).toHaveLength(0);
    removeHaggle('nyc', lot.notes[0].id);
    removeHaggle('nyc', dropped.notes[0].id);
    removeHaggle('nyc', dated.notes[0].id);
    removeHaggle('nyc', named.notes[0].id);
    removeHaggle('nyc', droppedSport.notes[0].id);
    expect(removeHaggle('nyc', saved.notes[0].id)).toHaveLength(0);
    expect(readHaggle('nyc')).toHaveLength(0);
  });

  it('rejects a blank dealer and a negative ask', () => {
    expect(addHaggle({
      showId: 'nyc', dealer: ' ', table: '1', askUsd: 10, offerUsd: 8, result: 'open', note: '',
    }).error).toMatch(/dealer/i);
    expect(addHaggle({
      showId: 'nyc', dealer: 'Ace', table: '1', askUsd: -1, offerUsd: 8, result: 'open', note: '',
    }).error).toMatch(/ask/i);
    expect(readHaggle('nyc')).toHaveLength(0);
  });

  it('requires one held card and a price before a sale', () => {
    expect(addHaggle({
      showId: 'nyc', dealer: 'Ace', table: '1', askUsd: 0, offerUsd: 0, result: 'sold', note: '', cardId: 'judge',
    }).error).toMatch(/price you took/i);
    expect(addHaggle({
      showId: 'nyc', dealer: 'Ace', table: '1', askUsd: 20, offerUsd: 0, result: 'sold', note: '',
    }).error).toMatch(/card you hold/i);
    expect(addHaggle({
      showId: 'nyc',
      dealer: 'Ace',
      table: '1',
      askUsd: 40,
      offerUsd: 30,
      result: 'sold',
      note: '',
      cardId: 'judge',
      lines: [{ player: 'One', askUsd: 10 }, { player: 'Two', askUsd: 20 }],
    }).error).toMatch(/lot stays a buy/i);
    const saved = addHaggle({
      showId: 'nyc', dealer: 'Ace', table: '1', askUsd: 0, offerUsd: 30, result: 'sold', note: '', cardId: 'judge',
    });
    expect(saved.error).toBeNull();
    expect(saved.notes[0]).toMatchObject({ result: 'sold', offerUsd: 30, cardId: 'judge' });
  });
});
