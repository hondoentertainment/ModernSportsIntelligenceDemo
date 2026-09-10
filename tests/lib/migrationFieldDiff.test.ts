import { describe, expect, it } from 'vitest';
import { makeCard } from '../helpers';
import {
  countFieldConflicts,
  diffCardFields,
  diffTargetFields,
  formatFieldConflictLine,
} from '../../lib/utils/migrationFieldDiff';
import type { TargetWatchlist } from '../../types';

const baseTarget = (over: Partial<TargetWatchlist> = {}): TargetWatchlist =>
  ({
    id: 't1',
    player: 'Trout',
    cardDescription: '2011 Update',
    priority: 'High',
    targetPrice: 400,
    sport: 'MLB',
    league: 'MLB',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    ...over,
  }) as TargetWatchlist;

describe('migrationFieldDiff', () => {
  it('returns only key field conflicts for duplicate cards', () => {
    const local = makeCard({
      currentValue: 220,
      purchasePrice: 90,
      notes: 'local note',
      condition: 'NM',
    });
    const cloud = makeCard({
      id: 'cloud',
      currentValue: 180,
      purchasePrice: 90,
      notes: 'cloud note',
      condition: 'NM',
    });
    const diffs = diffCardFields(local, cloud);
    expect(diffs.map((row) => row.field).sort()).toEqual(['currentValue', 'notes']);
    expect(formatFieldConflictLine(diffs[0])).toMatch(/local/);
    expect(countFieldConflicts(diffs)).toBe(2);
  });

  it('treats empty and missing as the same display', () => {
    const local = makeCard({ notes: undefined, certNumber: '' });
    const cloud = makeCard({ id: 'c', notes: '', certNumber: undefined });
    expect(diffCardFields(local, cloud)).toEqual([]);
  });

  it('diffs watchlist targets on price and priority', () => {
    const diffs = diffTargetFields(
      baseTarget({ targetPrice: 410, priority: 'High' }),
      baseTarget({ id: 'c', targetPrice: 350, priority: 'Low' }),
    );
    expect(diffs.map((row) => row.field)).toEqual(['targetPrice', 'priority']);
  });
});
