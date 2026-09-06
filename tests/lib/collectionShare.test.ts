import { describe, expect, it, beforeEach } from 'vitest';
import type { CardInventory } from '../../types';
import { store } from '../../lib/dal/syncStore';
import {
  buildShareableCollectionPreview,
  generateEmbedCode,
  getSharedCollections,
} from '../../lib/social/collectionShare';

const card = (over: Partial<CardInventory> = {}): CardInventory =>
  ({
    id: 'c1',
    player: 'Mike Trout',
    year: 2011,
    manufacturer: 'Topps',
    cardNumber: '175',
    set: 'Update',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Mint',
    isGraded: true,
    purchasePrice: 100,
    purchaseDate: '2020-01-01',
    currentValue: 400,
    ...over,
  }) as CardInventory;

describe('collectionShare embed', () => {
  beforeEach(() => {
    store.remove('msi-shared-collections');
  });

  it('builds a preview without persisting', () => {
    const preview = buildShareableCollectionPreview([card()], {
      ownerName: 'Ada',
      title: 'Ada vault',
      description: 'demo',
    });
    expect(preview.stats.totalCards).toBe(1);
    expect(preview.stats.totalValue).toBe(400);
    expect(getSharedCollections()).toHaveLength(0);
  });

  it('escapes owner and title in the static widget HTML', () => {
    const preview = buildShareableCollectionPreview([card({ player: '<script>x</script>' })], {
      ownerName: '<img>',
      title: 'A & B',
      description: 'demo',
    });
    const html = generateEmbedCode(preview);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('A &amp; B');
    expect(html).toContain('estimates, not live comps');
  });
});
