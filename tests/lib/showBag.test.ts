import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SHOW_BAG_DISCLOSURE,
  SHOW_BAG_UNPACKED_KEY,
  buildShowBag,
  downloadShowBagHtml,
  formatShowBagHtml,
  formatShowBagText,
  getPackedShowBagIds,
  getUnpackedShowBagIds,
  toggleShowBagPacked,
} from '../../lib/utils/showBag';
import type { CardInventory, TargetWatchlist } from '../../types';
import { toggleChecklistItem, type ShowChecklist } from '../../lib/utils/cardShowModeService';
import { store } from '../../lib/dal/syncStore';

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

  it('covers consignment without house/reserve and targets without description', () => {
    const inventory = [
      card({
        id: 'consign-bare',
        status: 'consignment',
        consignment: {
          houseId: 'h2',
          houseName: '',
          entryId: 'e2',
          submittedAt: '2026-01-01',
          reservePrice: 0,
        },
      }),
    ];
    const doc = buildShowBag({
      inventory,
      targets: [
        {
          id: 't-empty',
          player: 'Prospect',
          cardDescription: '',
          priority: 'Low',
          targetPrice: 0,
          sport: 'Basketball',
          league: 'NBA',
          status: 'active',
          createdAt: '2026-01-01',
        },
      ],
      reviewIds: [],
      checklist: [],
    });
    expect(doc.counts.consign).toBe(1);
    expect(doc.items.find((item) => item.section === 'targets')?.label).toMatch(/watchlist/);
    expect(formatShowBagHtml(doc)).toContain('☐');
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
    expect(getUnpackedShowBagIds()).toEqual(['review:c1']);
  });

  it('lets users unpack supplies that start pre-checked on the Card Show checklist', () => {
    const checklist: ShowChecklist[] = [
      { id: 'p1', category: 'prep', item: 'Print list', checked: true, priority: 'low' },
    ];
    const input = { inventory: [], targets: [], reviewIds: [], checklist };
    expect(buildShowBag(input).items.find((item) => item.id === 'supply:p1')?.packed).toBe(true);

    expect(toggleShowBagPacked('supply:p1', true)).toEqual([]);
    expect(getUnpackedShowBagIds()).toEqual(['supply:p1']);
    expect(buildShowBag(input).items.find((item) => item.id === 'supply:p1')?.packed).toBe(false);

    expect(toggleShowBagPacked('supply:p1', false)).toEqual(['supply:p1']);
    expect(getUnpackedShowBagIds()).toEqual([]);
    expect(buildShowBag(input).items.find((item) => item.id === 'supply:p1')?.packed).toBe(true);
  });

  it('infers packed state from the live checklist when toggling a supply without an override', () => {
    expect(toggleShowBagPacked('supply:cl-001')).toEqual(['supply:cl-001']);
    expect(getPackedShowBagIds()).toContain('supply:cl-001');

    toggleChecklistItem('cl-018');
    expect(toggleShowBagPacked('supply:cl-018')).toEqual(['supply:cl-001']);
    expect(getUnpackedShowBagIds()).toContain('supply:cl-018');
    expect(buildShowBag({ inventory: [], targets: [], reviewIds: [] }).items.find((item) => item.id === 'supply:cl-018')?.packed).toBe(false);
    expect(toggleShowBagPacked('supply:cl-018')).toEqual(['supply:cl-001', 'supply:cl-018']);
    expect(getUnpackedShowBagIds()).not.toContain('supply:cl-018');
  });

  it('ignores junk packed/unpacked store blobs', () => {
    store.set('msi_show_bag_packed_v1', { nope: true });
    store.set(SHOW_BAG_UNPACKED_KEY, 'nope');
    expect(getPackedShowBagIds()).toEqual([]);
    expect(getUnpackedShowBagIds()).toEqual([]);
    expect(buildShowBag({ inventory: [], targets: [], reviewIds: [], checklist: [] }).counts.supplies).toBe(0);
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

    const doc = buildShowBag({ inventory: [], targets: [], reviewIds: [], checklist: [] });
    downloadShowBagHtml(doc);
    expect(click).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalled();
    downloadShowBagHtml(doc, null);
    append.mockRestore();
    vi.restoreAllMocks();
  });
});
