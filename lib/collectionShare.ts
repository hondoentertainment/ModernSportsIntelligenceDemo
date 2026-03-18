import { CardInventory } from '../types';
import { store } from './dal/syncStore';

export interface ShareableCollection {
  id: string;
  ownerName: string;
  title: string;
  description: string;
  cards: ShareableCard[];
  stats: CollectionStats;
  theme: 'dark' | 'light';
  createdAt: string;
  updatedAt: string;
}

export interface ShareableCard {
  player: string;
  year: number;
  set: string;
  manufacturer: string;
  grade?: string;
  gradingCompany?: string;
  currentValue: number;
  image?: string;
  league: string;
  sport: string;
}

export interface CollectionStats {
  totalCards: number;
  totalValue: number;
  topLeague: string;
  gradedPercent: number;
  avgCardValue: number;
}

const STORAGE_KEY = 'msi-shared-collections';

/**
 * Phase 29: Collection Sharing & Embed Widget.
 * Creates shareable collection snapshots for forums, social, and personal sites.
 */
export function createShareableCollection(
  inventory: CardInventory[],
  config: { ownerName: string; title: string; description: string; cardIds?: string[] }
): ShareableCollection {
  const active = inventory.filter(c => c.status !== 'sold');
  const selectedCards = config.cardIds
    ? active.filter(c => config.cardIds!.includes(c.id))
    : active;

  const cards: ShareableCard[] = selectedCards.map(c => ({
    player: c.player,
    year: c.year,
    set: c.set,
    manufacturer: c.manufacturer,
    grade: c.grade,
    gradingCompany: c.gradingCompany,
    currentValue: c.currentValue || c.purchasePrice,
    image: c.image,
    league: c.league,
    sport: c.sport
  }));

  const totalValue = cards.reduce((s, c) => s + c.currentValue, 0);

  // Find top league
  const leagueCounts = new Map<string, number>();
  cards.forEach(c => leagueCounts.set(c.league, (leagueCounts.get(c.league) || 0) + 1));
  const topLeague = [...leagueCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const gradedCount = cards.filter(c => !!c.grade).length;

  const collection: ShareableCollection = {
    id: crypto.randomUUID(),
    ownerName: config.ownerName,
    title: config.title,
    description: config.description,
    cards,
    stats: {
      totalCards: cards.length,
      totalValue,
      topLeague,
      gradedPercent: cards.length > 0 ? Math.round((gradedCount / cards.length) * 100) : 0,
      avgCardValue: cards.length > 0 ? Math.round(totalValue / cards.length) : 0
    },
    theme: 'dark',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Persist locally
  saveCollection(collection);

  return collection;
}

function saveCollection(collection: ShareableCollection): void {
  const existing = getSharedCollections();
  const idx = existing.findIndex(c => c.id === collection.id);
  if (idx >= 0) existing[idx] = collection;
  else existing.push(collection);
  store.set(STORAGE_KEY, existing);
}

export function getSharedCollections(): ShareableCollection[] {
  return store.get<ShareableCollection[]>(STORAGE_KEY, []);
}

export function deleteSharedCollection(id: string): void {
  const collections = getSharedCollections().filter(c => c.id !== id);
  store.set(STORAGE_KEY, collections);
}

/**
 * Generate an HTML embed snippet for external sites.
 * The widget is a self-contained iframe-compatible HTML block.
 */
export function generateEmbedCode(collection: ShareableCollection): string {
  const topCards = [...collection.cards]
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 6);

  const cardRows = topCards.map(c =>
    `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #334155;">
      <span>${c.player} (${c.year})</span>
      <span style="color:#d9f99d;font-family:monospace;">$${c.currentValue.toLocaleString()}</span>
    </div>`
  ).join('\n');

  return `<!-- MSI Collection Widget -->
<div style="background:#1e1e24;color:#fff;font-family:Arial,sans-serif;border-radius:16px;padding:24px;max-width:400px;border:1px solid #334155;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <div>
      <div style="font-size:18px;font-weight:bold;">${collection.title}</div>
      <div style="font-size:12px;color:#94a3b8;">${collection.ownerName}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:20px;font-weight:bold;color:#d9f99d;">$${collection.stats.totalValue.toLocaleString()}</div>
      <div style="font-size:10px;color:#94a3b8;">${collection.stats.totalCards} cards</div>
    </div>
  </div>
  <div style="font-size:13px;">
    ${cardRows}
  </div>
  <div style="margin-top:12px;text-align:center;font-size:10px;color:#64748b;">
    Powered by Modern Sports Intelligence
  </div>
</div>`;
}
