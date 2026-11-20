/**
 * Deterministic synthetic price tape for the seeded demo book.
 * Clearly demo data: snapshots are tagged `demo_synthetic` and are not a
 * live Sports Card Investor or Market Movers feed.
 *
 * The full book names a trim (Riley Greene sits above an equal share and the
 * book beats the index). The two seeded favorites name a fill (Jairo Pomares
 * sits below an equal share and those favorites lag the index).
 */
import { store } from '../dal/syncStore';
import { DEMO_SYNTHETIC_SOURCE, recordBatchSnapshots } from './priceHistory';
import { isPublicDemoSession, markPublicDemoData } from '../demoSession';

export const DEMO_TAPE_KEY = 'msi_demo_tape_version';
export const DEMO_TAPE_VERSION = 1;
export const DEMO_FAVORITES_KEY = 'msi_card_favorites';

const FROM = '2026-08-01T00:00:00.000Z';
const TO = '2026-09-01T00:00:00.000Z';

/** Held demo cards. Ids match `data/prepopulatedCards.json`. */
export const DEMO_TAPE_CARDS = [
  { id: '11', player: 'Riley Greene', year: 2019, set: 'Silver /499', from: 800, to: 2000 },
  { id: '15', player: 'CJ Abrams', year: 2019, set: 'Silver /499', from: 100, to: 100 },
  { id: '5', player: 'Julio Rodriguez', year: 2019, set: 'Paper', from: 400, to: 280 },
  { id: '48', player: 'Jairo Pomares', year: 2021, set: 'Speckle /299', from: 100, to: 140 },
] as const;

/** Favorites desk: the lag pair, so the line names a fill. */
export const DEMO_TAPE_FAVORITE_IDS = ['5', '48'] as const;

interface StoredFavorite {
  id: string;
  cardId: string;
  player: string;
  year: number;
  set?: string;
  currentValue?: number;
  addedAt: string;
}

function favoriteRows(): StoredFavorite[] {
  return DEMO_TAPE_CARDS.filter(card =>
    (DEMO_TAPE_FAVORITE_IDS as readonly string[]).includes(card.id)
  ).map(card => ({
    id: `demo-fav-${card.id}`,
    cardId: card.id,
    player: card.player,
    year: card.year,
    set: card.set,
    currentValue: card.to,
    addedAt: FROM,
  }));
}

/** Write the tape once. Safe to call on every demo entry. */
export function seedDemoCollectorTape(): void {
  if (store.get<number>(DEMO_TAPE_KEY, 0) !== DEMO_TAPE_VERSION) {
    recordBatchSnapshots(
      DEMO_TAPE_CARDS.flatMap(card => [
        {
          id: card.id,
          value: card.from,
          timestamp: FROM,
          source: DEMO_SYNTHETIC_SOURCE,
          valuationMethod: 'demo_synthetic',
          metadata: { demo: true, label: 'Synthetic demo tape' },
        },
        {
          id: card.id,
          value: card.to,
          timestamp: TO,
          source: DEMO_SYNTHETIC_SOURCE,
          valuationMethod: 'demo_synthetic',
          metadata: { demo: true, label: 'Synthetic demo tape' },
        },
      ])
    );
    store.set(DEMO_TAPE_KEY, DEMO_TAPE_VERSION);
  }

  const favorites = store.get<StoredFavorite[]>(DEMO_FAVORITES_KEY, []);
  if (!Array.isArray(favorites) || favorites.length === 0) {
    store.set(DEMO_FAVORITES_KEY, favoriteRows());
  }

  if (isPublicDemoSession()) markPublicDemoData();
}
