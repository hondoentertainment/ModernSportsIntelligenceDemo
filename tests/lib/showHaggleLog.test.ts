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
    expect(readHaggle('nyc')).toHaveLength(1);
    expect(readHaggle('other')).toHaveLength(0);
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
