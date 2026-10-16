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
    expect(readHaggle('nyc')).toHaveLength(5);
    expect(readHaggle('other')).toHaveLength(0);
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
});
