import { describe, expect, it } from 'vitest';
import type { CardInventory } from '../../types';
import { applyCollectionCsv, exportCollectionCsv } from '../../lib/collection/collectionCsv';

function card(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'judge',
    player: 'Aaron Judge',
    year: 2024,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Series 1',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Near Mint',
    isGraded: false,
    purchasePrice: 40,
    purchaseDate: '2024-06-01',
    currentValue: 80,
    status: 'active',
    notes: 'keep',
    ...overrides,
  };
}

describe('collectionCsv', () => {
  it('round-trips commas, quotes, and spreadsheet formulas', () => {
    const book = [card({ player: 'Trout, Mike', notes: 'keep' }), card({ id: 'eq', player: '=1+1', currentValue: 5 })];
    const parsed = applyCollectionCsv(book, exportCollectionCsv(book));
    expect(parsed.error).toBeNull();
    expect(parsed.updated).toBe(2);
    const trout = parsed.inventory.find((row) => row.id === 'judge');
    expect(trout).toMatchObject({ player: 'Trout, Mike', currentValue: 80, notes: 'keep' });
    expect(parsed.inventory.find((row) => row.id === 'eq')?.player).toBe('=1+1');
  });

  it('updates a match, appends a new row, and keeps cards missing from the file', () => {
    const book = [card(), card({ id: 'other', player: 'Other' })];
    const exported = exportCollectionCsv([card({ currentValue: 99 })]);
    const parsed = applyCollectionCsv(book, `${exported}\n,Paul Skenes,2024,Topps,250,Series 1,Baseball,MLB,18,2024-06-01,30,active`);
    expect(parsed.error).toBeNull();
    expect(parsed.updated).toBe(1);
    expect(parsed.added).toBe(1);
    expect(parsed.inventory.find((row) => row.id === 'judge')?.currentValue).toBe(99);
    expect(parsed.inventory.find((row) => row.id === 'other')?.player).toBe('Other');
    expect(parsed.inventory.find((row) => row.player === 'Paul Skenes')).toMatchObject({ purchasePrice: 18, isGraded: false });
    expect(exported).toContain('99');
  });

  it('imports every data row inside the file size limit', () => {
    const header = exportCollectionCsv([]).split('\n')[0];
    const lines = [header];
    for (let i = 0; i < 201; i += 1) {
      lines.push(`n${i},Player ${i},2020,Topps,${i},Set,Baseball,MLB,1,2020-01-01,2,active`);
    }
    const parsed = applyCollectionCsv([], lines.join('\n'));
    expect(parsed.error).toBeNull();
    expect(parsed.added).toBe(201);
    expect(parsed.skipped).toBe(0);
  });

  it('leaves the book alone when the file is not a collection export', () => {
    const book = [card()];
    const parsed = applyCollectionCsv(book, 'player,year\nA,2024');
    expect(parsed.error).toMatch(/columns/i);
    expect(parsed.inventory).toBe(book);
  });
});
