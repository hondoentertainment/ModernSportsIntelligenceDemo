import { describe, expect, it } from 'vitest';
import {
  TABLE_LOT_NOTE,
  buildLotDrafts,
  expandLotNotes,
  lotCardId,
  lotCopy,
  lotLineLabel,
  unfiledNotes,
  type LotNote,
} from '../../lib/collector/tableLot';

function lot(overrides: Partial<LotNote> = {}): LotNote {
  return {
    id: 'note-1',
    showId: 'nyc',
    dealer: 'Rivera',
    table: '12',
    askUsd: 80,
    offerUsd: 100,
    result: 'bought',
    player: 'Aaron Judge',
    savedAt: '2026-10-20T00:00:00.000Z',
    lines: [
      { player: 'Aaron Judge', askUsd: 40, cardId: 'judge' },
      { player: 'Jayson Tatum', askUsd: 60, cardId: 'tatum', detail: '2024 Prizm', sport: 'Basketball' },
    ],
    ...overrides,
  };
}

describe('table lots', () => {
  it('keeps several cards on one note and splits the paid price by each ask', () => {
    expect(lotCopy({ askUsd: 10, lines: [{ player: 'Solo' }] })).toBeNull();
    expect(lotCopy(lot())).toBe(
      '2 cards in this lot for $80.00. The lot price is not one card\'s sale. Not a dealer quote.',
    );
    expect(lotLineLabel({ player: '  Aaron Judge  ', askUsd: 40 })).toBe('Aaron Judge · ask $40.00');
    expect(lotLineLabel({ player: '', askUsd: 0 })).toMatch(/no card ask/);
    expect(TABLE_LOT_NOTE).toMatch(/not a live tape/i);
    expect(TABLE_LOT_NOTE).not.toMatch(/live market movers/i);

    const drafts = buildLotDrafts({ note: lot(), showName: 'Metro Meetup', purchaseDate: '2026-10-20' });
    expect(drafts).toHaveLength(2);
    expect(drafts?.[0]).toMatchObject({
      id: lotCardId('note-1', 0),
      player: 'Aaron Judge',
      purchasePrice: 40,
      taxBasis: 40,
    });
    expect(drafts?.[1]).toMatchObject({
      id: lotCardId('note-1', 1),
      player: 'Jayson Tatum',
      purchasePrice: 60,
      sport: 'Basketball',
    });
    expect(drafts?.[0].notes).toMatch(/split by each card's ask/i);
    expect(drafts?.[0].notes).toMatch(/not a live tape/i);

    const discounted = buildLotDrafts({
      note: lot({ offerUsd: 80, askUsd: 100 }),
      showName: ' ',
      purchaseDate: 'bad',
    });
    expect(discounted?.map((row) => row.purchasePrice)).toEqual([32, 48]);
    expect(discounted?.[0].notes).toMatch(/Local card show/);
    expect(buildLotDrafts({
      note: lot({ lines: [{ player: 'Aaron Judge', askUsd: 40 }, { player: 'Jayson Tatum' }] }),
      showName: 'Metro',
      purchaseDate: '2026-10-20',
    })).toBeNull();
    expect(buildLotDrafts({
      note: lot({ result: 'passed' }),
      showName: 'Metro',
      purchaseDate: '2026-10-20',
    })).toBeNull();
    expect(buildLotDrafts({
      note: lot({ offerUsd: 0, askUsd: 0 }),
      showName: 'Metro',
      purchaseDate: '2026-10-20',
    })).toBeNull();
  });

  it('compares card asks and leaves an unfiled lot on the recap', () => {
    const notes = [
      lot(),
      lot({
        id: 'solo',
        lines: undefined,
        player: 'Solo',
        result: 'bought',
        offerUsd: 12,
        askUsd: 12,
      }),
      lot({
        id: 'open-lot',
        result: 'open',
        lines: [
          { player: 'Aaron Judge', askUsd: 30 },
          { player: '', askUsd: 10 },
          { askUsd: -1, player: 'Skip' },
        ],
      }),
    ];
    const expanded = expandLotNotes(notes);
    expect(expanded.map((row) => row.player)).toEqual(['Aaron Judge', 'Jayson Tatum', 'Solo', 'Aaron Judge']);
    expect(expanded[0].askUsd).toBe(40);
    expect(expanded[0].lines).toBeUndefined();
    const waiting = unfiledNotes(notes, []);
    expect(waiting.map((row) => row.id).sort()).toEqual(['note-1', 'solo']);
    const filed = unfiledNotes(notes, [
      { id: lotCardId('note-1', 0) },
      { id: lotCardId('note-1', 1) },
    ]);
    expect(filed.map((row) => row.id)).toEqual(['solo']);
    const half = unfiledNotes(notes, [{ id: lotCardId('note-1', 0) }]);
    expect(half.map((row) => row.id).sort()).toEqual(['note-1', 'solo']);
  });
});
