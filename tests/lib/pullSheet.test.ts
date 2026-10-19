import { describe, expect, it } from 'vitest';
import { buildPullSheet, pullSheetCopy, PULL_SHEET_NOTE } from '../../lib/collector/pullSheet';

describe('buildPullSheet', () => {
  it('groups sell lines by binder, box, slab, and no saved place', () => {
    const sheet = buildPullSheet(
      [
        { id: 's-box', cardId: 'box-card', player: '  Mike Trout ', detail: '2011 Update #US175', markUsd: 40.126 },
        { id: 's-binder-b', cardId: 'binder-b', player: 'Aaron Judge', detail: '2017 Chrome #1', markUsd: 20 },
        { id: 's-binder-a', cardId: 'binder-a', player: 'Aaron Judge', detail: '2018 Update #2', markUsd: 15 },
        { id: 's-slab', cardId: 'slab-card', player: 'Shohei Ohtani', detail: '2018 Update #1', markUsd: 80 },
        { id: 's-none', cardId: 'loose', player: 'Juan Soto', detail: '2019 Chrome #9', markUsd: 0 },
        { id: 's-missing', cardId: null, player: '', detail: '  ', markUsd: null },
        { id: 's-nan', cardId: 'nan-card', player: 'Nan Player', detail: 'x', markUsd: Number.NaN },
        { id: 's-dup', cardId: 'binder-a', player: 'Aaron Judge', detail: 'duplicate row', markUsd: 99 },
        { id: '  ', cardId: '  ', player: 'Skipped', detail: 'no id', markUsd: 5 },
      ],
      {
        'binder-a': 'binder',
        'binder-b': 'binder',
        'box-card': 'box',
        'slab-card': 'slab',
        loose: 'vault',
      },
    );

    expect(sheet.groups.map(group => group.place)).toEqual(['binder', 'box', 'slab', 'unplaced']);
    expect(sheet.groups[0].items.map(item => item.id)).toEqual(['binder-a', 'binder-b']);
    expect(sheet.groups[1].items[0]).toMatchObject({ player: 'Mike Trout', markUsd: 40.13 });
    expect(sheet.groups[3].items.map(item => item.player)).toEqual(['Juan Soto', 'Nan Player', 'Untitled']);
    expect(sheet.groups[3].items.every(item => item.markUsd == null)).toBe(true);
    expect(sheet.count).toBe(7);
    expect(sheet.note).toBe(PULL_SHEET_NOTE);
    expect(pullSheetCopy(sheet)).toMatch(/7 cards to pull: 2 from Binder, 1 from Box, 1 from Slab case, 3 from No saved place/);
    expect(pullSheetCopy(sheet)).toMatch(/not a live tape/i);
  });

  it('says there is nothing to pull when the show has no sell lines', () => {
    const sheet = buildPullSheet([], {});
    expect(sheet.count).toBe(0);
    expect(sheet.groups).toEqual([]);
    expect(pullSheetCopy(sheet)).toMatch(/No sell lines to pull/);
    expect(pullSheetCopy({ count: 1, groups: [{ place: 'binder', label: 'Binder', items: [{ id: 'a', player: 'A', detail: '', markUsd: 1 }] }] })).toMatch(/1 card to pull/);
  });
});
