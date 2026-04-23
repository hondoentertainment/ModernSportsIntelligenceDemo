// @ts-nocheck
import { describe, expect, it } from 'vitest';
import type { CardInventory, TargetWatchlist } from '../../types';
import {
  cardIdentityKey,
  planCardMigration,
  planTargetMigration,
  targetIdentityKey,
} from '../../lib/utils/migrationMerge';

const baseCard = (over: Partial<CardInventory>): CardInventory =>
  ({
    id: 'local-1',
    player: 'Test Player',
    year: 2020,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Chrome',
    sport: 'MLB',
    league: 'MLB',
    isAutographed: false,
    condition: 'NM',
    isGraded: true,
    purchasePrice: 100,
    purchaseDate: '2020-01-01',
    currentValue: 200,
    lastValuationDate: '2026-01-01',
    ...over,
  }) as CardInventory;

const baseTarget = (over: Partial<TargetWatchlist>): TargetWatchlist =>
  ({
    id: 'lt1',
    player: 'T',
    cardDescription: 'Desc',
    priority: 'High',
    targetPrice: 50,
    sport: 'MLB',
    league: 'MLB',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    ...over,
  }) as TargetWatchlist;

describe('migrationMerge', () => {
  it('cardIdentityKey is stable for matching', () => {
    const a = baseCard({});
    const b = baseCard({ id: 'other' });
    expect(cardIdentityKey(a)).toBe(cardIdentityKey(b));
  });

  it('prefer_cloud skips conflicting cards', () => {
    const local = [baseCard({ id: 'l1' })];
    const cloud = [baseCard({ id: 'c1' })];
    const plan = planCardMigration(local, cloud, 'prefer_cloud');
    expect(plan.toUpsert).toHaveLength(0);
    expect(plan.skippedConflicts).toBe(1);
    expect(plan.mergedOverwrites).toBe(0);
  });

  it('prefer_local overwrites with cloud id', () => {
    const local = [baseCard({ id: 'l1', currentValue: 999 })];
    const cloud = [baseCard({ id: 'c1', currentValue: 100 })];
    const plan = planCardMigration(local, cloud, 'prefer_local');
    expect(plan.toUpsert).toHaveLength(1);
    expect(plan.toUpsert[0].id).toBe('c1');
    expect(plan.toUpsert[0].currentValue).toBe(999);
    expect(plan.mergedOverwrites).toBe(1);
  });

  it('merge_newer keeps cloud when cloud is newer', () => {
    const local = [baseCard({ lastValuationDate: '2025-01-01' })];
    const cloud = [baseCard({ id: 'c1', lastValuationDate: '2026-06-01' })];
    const plan = planCardMigration(local, cloud, 'merge_newer');
    expect(plan.toUpsert).toHaveLength(0);
    expect(plan.skippedConflicts).toBe(1);
  });

  it('merge_newer pushes local when local is newer', () => {
    const local = [baseCard({ lastValuationDate: '2026-06-01' })];
    const cloud = [baseCard({ id: 'c1', lastValuationDate: '2025-01-01' })];
    const plan = planCardMigration(local, cloud, 'merge_newer');
    expect(plan.toUpsert).toHaveLength(1);
    expect(plan.toUpsert[0].id).toBe('c1');
  });

  it('targetIdentityKey and prefer_cloud', () => {
    const t = baseTarget({});
    expect(targetIdentityKey(t)).toContain('desc');
    const plan = planTargetMigration([baseTarget({ id: 'a' })], [baseTarget({ id: 'b' })], 'prefer_cloud');
    expect(plan.skippedConflicts).toBe(1);
  });
});
