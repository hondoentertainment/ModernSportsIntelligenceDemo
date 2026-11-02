import { describe, expect, it, vi } from 'vitest';
import {
  REALIZED_CSV_HEADER,
  REALIZED_EXPORT_NOTE,
  acquiredDay,
  ageRowBit,
  applyHold,
  calendarDay,
  canDownloadRealized,
  downloadRealizedCsv,
  holdAge,
  inventoryAgeCopy,
  realizedCsv,
  soldDay,
  type AgedRow,
} from '../../lib/collector/inventoryAge';

const DAY = 24 * 60 * 60 * 1000;
const START = Date.parse('2024-01-01T00:00:00.000Z');

function row(overrides: Partial<AgedRow> = {}): AgedRow {
  return {
    side: 'unsold',
    player: 'Aaron Judge',
    paidUsd: 22,
    costUsd: 22,
    takenUsd: null,
    feeUsd: null,
    realizedUsd: null,
    acquiredAt: '2026-10-01',
    soldAt: null,
    daysHeld: 30,
    treatment: 'short-term',
    daysToLongTerm: 335,
    ...overrides,
  };
}

describe('inventory age', () => {
  it('keeps the export disclosure off a tax form', () => {
    expect(REALIZED_EXPORT_NOTE).toMatch(/not a tax form and not a live tape/i);
    expect(REALIZED_EXPORT_NOTE).toMatch(/unsold inventory stays off the file/i);
  });

  it('reads a calendar day and lets the book date win', () => {
    expect(calendarDay(undefined)).toBeNull();
    expect(calendarDay('')).toBeNull();
    expect(calendarDay('not-a-date')).toBeNull();
    expect(calendarDay('2026-10-30T18:00:00.000Z')).toBe('2026-10-30');
    expect(calendarDay('2024-01-15')).toBe('2024-01-15');
    expect(acquiredDay('2024-01-15', '2026-10-30T00:00:00.000Z')).toBe('2024-01-15');
    expect(acquiredDay('not-a-date', '2026-10-30T00:00:00.000Z')).toBe('2026-10-30');
    expect(acquiredDay(undefined, undefined)).toBeNull();
    expect(soldDay('2026-10-30')).toBe('2026-10-30');
    expect(soldDay('nope')).toBeNull();
  });

  it('ages an open hold and a closed hold on the 365.25-day line', () => {
    expect(holdAge(null, START, null, true)).toBeNull();
    expect(holdAge('2024-01-01', Number.NaN, null, true)).toBeNull();
    expect(holdAge('2024-01-01', START, null, false)).toBeNull();
    expect(holdAge('2026-10-30', START, '2026-01-01', false)).toBeNull();
    expect(holdAge('2024-01-01', START, null, true)).toEqual({
      daysHeld: 0,
      treatment: 'short-term',
      daysToLongTerm: 365,
    });
    expect(holdAge('2024-01-01', START + DAY, null, true)?.daysHeld).toBe(1);
    const year = 365.25 * DAY;
    expect(holdAge('2024-01-01', START + year, null, true)).toMatchObject({
      daysHeld: 365,
      treatment: 'long-term',
      daysToLongTerm: 0,
    });
    expect(holdAge('2024-01-01', START + year - 1, null, true)).toMatchObject({
      daysHeld: 365,
      treatment: 'short-term',
      daysToLongTerm: 0,
    });
    const closed = holdAge('2026-10-01', START, '2026-10-20', false);
    expect(closed).toEqual({ daysHeld: 19, treatment: 'short-term', daysToLongTerm: 346 });
    expect(applyHold('2024-01-01', '2026-10-30', START, true)).toMatchObject({
      acquiredAt: '2024-01-01',
      soldAt: null,
      treatment: 'short-term',
      daysHeld: 0,
    });
    expect(applyHold('2024-01-01', '2026-10-30', START, false)).toMatchObject({
      acquiredAt: '2024-01-01',
      soldAt: '2026-10-30',
      treatment: 'long-term',
    });
    expect(applyHold('2026-10-01', null, START, false)).toMatchObject({
      soldAt: null,
      daysHeld: null,
      treatment: null,
    });
  });

  it('names days held on the row', () => {
    expect(ageRowBit(row({ daysHeld: null, treatment: null }))).toBe('');
    expect(ageRowBit(row({ side: 'sold', daysHeld: 19, treatment: 'short-term', daysToLongTerm: 346 })))
      .toBe(' · held 19 days · short-term');
    expect(ageRowBit(row({ side: 'sold', daysHeld: 1, treatment: 'short-term' })))
      .toBe(' · held 1 day · short-term');
    expect(ageRowBit(row({ daysHeld: 400, treatment: 'long-term', daysToLongTerm: 0 })))
      .toBe(' · held 400 days · long-term');
    expect(ageRowBit(row({ daysHeld: 30, treatment: 'short-term', daysToLongTerm: 335 })))
      .toBe(' · held 30 days · short-term · 335 days to long-term');
    expect(ageRowBit(row({ daysHeld: 330, treatment: 'short-term', daysToLongTerm: 35 })))
      .toMatch(/inside 45 days of long-term/);
    expect(ageRowBit(row({ daysHeld: 320, treatment: 'short-term', daysToLongTerm: 45 })))
      .toMatch(/45 days to long-term · inside 45 days of long-term/);
    expect(ageRowBit(row({ daysHeld: 319, treatment: 'short-term', daysToLongTerm: 46 })))
      .not.toMatch(/inside 45 days/);
    expect(ageRowBit(row({ daysHeld: 365, treatment: 'short-term', daysToLongTerm: null })))
      .toMatch(/0 days to long-term/);
    expect(ageRowBit(row({ daysHeld: 364, treatment: 'short-term', daysToLongTerm: 1 })))
      .toMatch(/1 day to long-term · inside 45 days of long-term/);
  });

  it('summarizes unsold age and recorded holding', () => {
    expect(inventoryAgeCopy({ unsold: [], sold: [] })).toBe('');
    expect(inventoryAgeCopy({ unsold: [], sold: [row({ side: 'sold', takenUsd: null })] })).toBe('');
    expect(inventoryAgeCopy({
      unsold: [row({ treatment: null, daysHeld: null })],
      sold: [],
    })).toMatch(/1 unsold card has no date/);
    expect(inventoryAgeCopy({
      unsold: [
        row({ player: 'A', treatment: null, daysHeld: null }),
        row({ player: 'B', treatment: null, daysHeld: null }),
      ],
      sold: [],
    })).toMatch(/2 unsold cards have no date/);
    expect(inventoryAgeCopy({
      unsold: [row({ treatment: 'short-term', daysToLongTerm: 300 })],
      sold: [],
    })).toBe('Inventory age: 1 short-term.');
    expect(inventoryAgeCopy({
      unsold: [row({ treatment: 'short-term', daysToLongTerm: undefined })],
      sold: [],
    })).toBe('Inventory age: 1 short-term.');
    expect(inventoryAgeCopy({
      unsold: [
        row({ treatment: 'short-term', daysToLongTerm: 300 }),
        row({ treatment: 'short-term', daysToLongTerm: 20 }),
        row({ treatment: 'short-term', daysToLongTerm: 10 }),
      ],
      sold: [],
    })).toBe('Inventory age: 3 short-term, including 2 inside 45 days of long-term.');
    expect(inventoryAgeCopy({
      unsold: [row({ treatment: 'short-term', daysToLongTerm: 20 })],
      sold: [],
    })).toMatch(/including 1 inside 45 days of long-term/);
    expect(inventoryAgeCopy({
      unsold: [row({ treatment: 'long-term', daysHeld: 400 })],
      sold: [],
    })).toBe('Inventory age: 1 long-term.');
    expect(inventoryAgeCopy({
      unsold: [
        row({ treatment: 'short-term', daysToLongTerm: 300 }),
        row({ treatment: 'long-term' }),
        row({ treatment: 'long-term', player: 'Other' }),
        row({ treatment: null, daysHeld: null }),
      ],
      sold: [],
    })).toBe('Inventory age: 1 short-term and 2 long-term. 1 unsold card has no date.');
    expect(inventoryAgeCopy({
      unsold: [
        row({ treatment: 'long-term' }),
        row({ treatment: null, daysHeld: null }),
        row({ player: 'B', treatment: null, daysHeld: null }),
      ],
      sold: [],
    })).toMatch(/2 unsold cards have no date/);
    const sold = (treatment: AgedRow['treatment'], extra: Partial<AgedRow> = {}): AgedRow => row({
      side: 'sold',
      takenUsd: 80,
      feeUsd: 3.2,
      realizedUsd: 20,
      treatment,
      ...extra,
    });
    expect(inventoryAgeCopy({ unsold: [], sold: [sold(null, { daysHeld: null })] }))
      .toBe('Recorded holding: 1 recorded sale has no holding dates.');
    expect(inventoryAgeCopy({
      unsold: [],
      sold: [sold(null, { daysHeld: null }), sold(null, { player: 'B', daysHeld: null })],
    })).toMatch(/2 recorded sales have no holding dates/);
    expect(inventoryAgeCopy({ unsold: [], sold: [sold('short-term')] }))
      .toBe('Recorded holding: 1 short-term.');
    expect(inventoryAgeCopy({ unsold: [], sold: [sold('long-term'), sold('long-term', { player: 'B' })] }))
      .toBe('Recorded holding: 2 long-term.');
    expect(inventoryAgeCopy({
      unsold: [row({ treatment: 'short-term', daysToLongTerm: 300 })],
      sold: [sold('short-term'), sold('long-term', { player: 'B' }), sold(null, { player: 'C', daysHeld: null })],
    })).toBe('Inventory age: 1 short-term. Recorded holding: 1 short-term and 1 long-term. 1 recorded sale has no holding dates.');
    expect(inventoryAgeCopy({
      unsold: [],
      sold: [sold('short-term'), sold(null, { daysHeld: null }), sold(null, { player: 'C', daysHeld: null })],
    })).toMatch(/2 recorded sales have no holding dates/);
  });

  it('downloads sold inventory and leaves unsold rows off the file', () => {
    expect(canDownloadRealized([row()])).toBe(false);
    expect(canDownloadRealized([row({ side: 'sold', takenUsd: 80 })])).toBe(true);
    const csv = realizedCsv([
      row({ player: 'Still Held' }),
      row({ side: 'sold', player: '=Judge, "A"', takenUsd: 10, realizedUsd: 1, daysHeld: 2, treatment: 'short-term' }),
      row({
        side: 'sold',
        player: 'O\'Brien',
        paidUsd: null,
        costUsd: 10.126,
        takenUsd: 80,
        feeUsd: 3.2,
        realizedUsd: -52,
        acquiredAt: '2024-01-01',
        soldAt: '2026-10-30',
        daysHeld: 400,
        treatment: 'long-term',
      }),
      row({
        side: 'sold',
        player: 'Bare',
        paidUsd: 5,
        costUsd: null,
        takenUsd: null,
        feeUsd: null,
        realizedUsd: Number.NaN,
        acquiredAt: null,
        soldAt: null,
        daysHeld: null,
        treatment: null,
      }),
    ]);
    expect(csv.startsWith(`${REALIZED_CSV_HEADER}\n`)).toBe(true);
    expect(csv).toContain(`"'=Judge, ""A"""`);
    expect(csv).toContain("O'Brien,,10.13,80,3.2,-52,2024-01-01,2026-10-30,400,long-term");
    expect(csv).toContain('Bare,5,,,,');
    expect(csv).not.toContain('Still Held');
    expect(downloadRealizedCsv([row({ side: 'sold', takenUsd: 1 })], 'msi-show-realized.csv', null)).toBeUndefined();

    const createObjectURL = vi.fn(() => 'blob:realized');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    downloadRealizedCsv([row({ side: 'sold', player: 'Held', takenUsd: 80, realizedUsd: 10 })], 'msi-week-realized.csv');
    expect(createObjectURL).toHaveBeenCalled();
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toMatch(/text\/csv/);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:realized');
  });
});
