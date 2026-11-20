import { afterEach, describe, expect, it } from 'vitest';
import { clearPriceHistory } from '../../lib/analytics/priceHistory';
import { seedDemoCollectorTape, DEMO_TAPE_FAVORITE_IDS } from '../../lib/analytics/demoTape';
import { equalShare } from '../../lib/analytics/equalShare';
import { indexBeat } from '../../lib/analytics/indexBeat';
import { weightGap } from '../../lib/analytics/weightGap';
import { PREPOPULATED_CARDS } from '../../prepopulatedCards';
import { store } from '../../lib/dal/syncStore';

afterEach(() => {
  clearPriceHistory();
  store.remove('msi_demo_tape_version');
  store.remove('msi_card_favorites');
});

describe('demo collector tape', () => {
  it('names a trim on the book and a fill on the seeded favorites', () => {
    seedDemoCollectorTape();
    const book = equalShare(PREPOPULATED_CARDS);
    const favorites = equalShare(PREPOPULATED_CARDS, DEMO_TAPE_FAVORITE_IDS);

    expect(book.call).not.toBe('off');
    expect(indexBeat(PREPOPULATED_CARDS).call).not.toBe('off');
    expect(weightGap(PREPOPULATED_CARDS).call).not.toBe('off');
    expect(book.move?.side).toBe('trim');
    expect(book.copy).toMatch(/trim of sparkline start, not a sale/);
    expect(book.copy).not.toMatch(/does not name an equal share/);

    expect(favorites.call).not.toBe('off');
    expect(favorites.move?.side).toBe('fill');
    expect(favorites.copy).toMatch(/fill, not a buy/);
    expect(favorites.copy).not.toMatch(/no favorite is on this desk/);
    expect(favorites.copy).toMatch(/Synthetic|Jairo Pomares|not a live/i);
  });

  it('is deterministic and does not stack snapshots on a second seed', () => {
    seedDemoCollectorTape();
    const first = equalShare(PREPOPULATED_CARDS).copy;
    seedDemoCollectorTape();
    expect(equalShare(PREPOPULATED_CARDS).copy).toBe(first);
    expect(store.get<unknown[]>('msi_card_favorites', [])).toHaveLength(2);
  });
});
