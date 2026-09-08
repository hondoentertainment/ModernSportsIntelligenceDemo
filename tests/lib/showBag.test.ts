import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SHOW_BAG_DISCLOSURE,
  buildShowBag,
  downloadShowBagHtml,
  formatShowBagHtml,
  formatShowBagText,
  getPackedShowBagIds,
  toggleShowBagPacked,
} from '../../lib/utils/showBag';
import type { CardInventory, TargetWatchlist } from '../../types';
import type { ShowChecklist } from '../../lib/utils/cardShowModeService';

const card = (partial: Partial<CardInventory>): CardInventory => ({
  id: 'c1',
  player: 'Mike Trout',
  year: 2011,
  manufacturer: 'Topps',
  cardNumber: '1',
  set: 'Update',
  sport: 'Baseball',
  league: 'MLB',
  isAutographed: false,
  condition: 'Mint',
  isGraded: false,
  purchasePrice: 100,
  purchaseDate: '2024-01-01',
  currentValue: 150,
  status: 'active',
  ...partial,
});

describe('showBag', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('builds review, consign, targets, and supplies while skipping sold / inactive', () => {
    const inventory = [
      card({ id: 'review-1' }),
      card({
        id: 'consign-1',
        status: 'consignment',
        consignment: {
          houseId: 'h1',
          houseName: 'PWCC',
          entryId: 'e1',
          submittedAt: '2026-01-01',
          reservePrice: 400,
        },
      }),
      card({ id: 'sold-1', status: 'sold' }),
    ];
    const targets: TargetWatchlist[] = [
      {
        id: 't-active',
        player: 'Wembanyama',
        cardDescription: 'Prizm Silver',
        priority: 'High',
        targetPrice: 250,
        sport: 'Basketball',
        league: 'NBA',
        status: 'active',
        createdAt: '2026-01-01',
      },
      {
        id: 't-done',
        player: 'Done',
        cardDescription: 'x',
        priority: 'Low',
        targetPrice: 10,
        sport: 'Basketball',
        league: 'NBA',
        status: 'acquired',
        createdAt: '2026-01-01',
      },
    ];
    const checklist: ShowChecklist[] = [
      { id: 's1', category: 'supplies', item: 'Penny sleeves', checked: false, priority: 'high' },
      { id: 'p1', category: 'prep', item: 'Print list', checked: true, priority: 'low' },
      { id: 'w1', category: 'want_list', item: 'Jordan', checked: false, priority: 'high' },
    ];

    const doc = buildShowBag({
      inventory,
      targets,
      reviewIds: ['review-1', 'sold-1'],
      checklist,
      now: new Date('2026-09-08T12:00:00Z'),
    });

    expect(doc.disclosure).toBe(SHOW_BAG_DISCLOSURE);
    expect(doc.counts.review).toBe(1);
    expect(doc.counts.consign).toBe(1);
    expect(doc.counts.targets).toBe(1);
    expect(doc.counts.supplies).toBe(2);
    expect(doc.items.some((item) => item.detail.includes('PWCC'))).toBe(true);
    expect(doc.items.find((item) => item.id === 'supply:p1')?.packed).toBe(true);
    expect(formatShowBagText(doc)).toMatch(/Review \/ decide/);
    expect(formatShowBagHtml(doc)).toMatch(/&lt;|&amp;|MSI Show Bag/);
  });

  it('renders empty section placeholders and escapes HTML', () => {
    const doc = buildShowBag({
      inventory: [],
      targets: [],
      reviewIds: [],
      checklist: [{ id: 'x', category: 'supplies', item: 'A & B <C>', checked: false, priority: 'low' }],
    });
    const text = formatShowBagText(doc);
    expect(text).toMatch(/none/);
    expect(formatShowBagHtml(doc)).toContain('A &amp; B &lt;C&gt;');
  });

  it('falls back to triage ids and the Card Show checklist when omitted', () => {
    const doc = buildShowBag({ inventory: [], targets: [] });
    expect(doc.counts.supplies).toBeGreaterThan(0);
    expect(doc.disclosure).toBe(SHOW_BAG_DISCLOSURE);
  });

  it('toggles packed ids and ignores blanks', () => {
    expect(toggleShowBagPacked('  ')).toEqual([]);
    expect(toggleShowBagPacked('review:c1')).toEqual(['review:c1']);
    expect(getPackedShowBagIds()).toEqual(['review:c1']);
    expect(toggleShowBagPacked('review:c1')).toEqual([]);
  });

  it('downloads an HTML blob when document exists', () => {
    const click = vi.fn();
    const remove = vi.fn();
    const append = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click,
      remove,
    } as unknown as HTMLAnchorElement);
    const revoke = vi.fn();
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:show', revokeObjectURL: revoke });

    downloadShowBagHtml(buildShowBag({ inventory: [], targets: [], reviewIds: [], checklist: [] }));
    expect(click).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalled();
    expect(downloadShowBagHtml(buildShowBag({ inventory: [], targets: [], reviewIds: [], checklist: [] }), null)).toBeUndefined();
    append.mockRestore();
    vi.restoreAllMocks();
  });
});
