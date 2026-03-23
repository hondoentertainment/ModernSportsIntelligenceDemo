/**
 * Priority 1.2 — Conflict resolution when bridging local portfolio data to Supabase.
 * Aligns with unique indexes cards_user_identity_idx and targets_user_identity_idx.
 */

import type { CardInventory, TargetWatchlist } from '../../types';

export type MigrationConflictPolicy = 'prefer_local' | 'prefer_cloud' | 'merge_newer';

export function cardIdentityKey(c: CardInventory): string {
  return [c.player, c.year, c.manufacturer, c.cardNumber, c.set]
    .map((v) => String(v ?? '').trim().toLowerCase())
    .join('|');
}

export function targetIdentityKey(t: TargetWatchlist): string {
  return `${String(t.player ?? '').trim().toLowerCase()}|${String(t.cardDescription ?? '').trim().toLowerCase()}`;
}

function freshnessMs(card: CardInventory): number {
  const raw = card.lastValuationDate || card.purchaseDate;
  const t = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(t) ? t : 0;
}

function targetFreshnessMs(t: TargetWatchlist): number {
  const raw = t.createdAt;
  const parsed = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

export interface CardMigrationPlan {
  toUpsert: CardInventory[];
  skippedConflicts: number;
  mergedOverwrites: number;
}

export interface TargetMigrationPlan {
  toUpsert: TargetWatchlist[];
  skippedConflicts: number;
  mergedOverwrites: number;
}

/**
 * Decide which local cards to upsert given rows already in Supabase.
 */
export function planCardMigration(
  local: CardInventory[],
  cloud: CardInventory[],
  policy: MigrationConflictPolicy
): CardMigrationPlan {
  const cloudByIdentity = new Map<string, CardInventory>();
  for (const row of cloud) {
    cloudByIdentity.set(cardIdentityKey(row), row);
  }

  const toUpsert: CardInventory[] = [];
  let skippedConflicts = 0;
  let mergedOverwrites = 0;

  for (const loc of local) {
    const key = cardIdentityKey(loc);
    const cloudRow = cloudByIdentity.get(key);

    if (!cloudRow) {
      toUpsert.push(loc);
      continue;
    }

    switch (policy) {
      case 'prefer_cloud':
        skippedConflicts += 1;
        break;
      case 'prefer_local':
        toUpsert.push({ ...loc, id: cloudRow.id });
        mergedOverwrites += 1;
        break;
      case 'merge_newer': {
        if (freshnessMs(loc) >= freshnessMs(cloudRow)) {
          toUpsert.push({ ...loc, id: cloudRow.id });
          mergedOverwrites += 1;
        } else {
          skippedConflicts += 1;
        }
        break;
      }
      default:
        skippedConflicts += 1;
    }
  }

  return { toUpsert, skippedConflicts, mergedOverwrites };
}

/**
 * Decide which local watchlist targets to upsert given rows already in Supabase.
 */
export function planTargetMigration(
  local: TargetWatchlist[],
  cloud: TargetWatchlist[],
  policy: MigrationConflictPolicy
): TargetMigrationPlan {
  const cloudByIdentity = new Map<string, TargetWatchlist>();
  for (const row of cloud) {
    cloudByIdentity.set(targetIdentityKey(row), row);
  }

  const toUpsert: TargetWatchlist[] = [];
  let skippedConflicts = 0;
  let mergedOverwrites = 0;

  for (const loc of local) {
    const key = targetIdentityKey(loc);
    const cloudRow = cloudByIdentity.get(key);

    if (!cloudRow) {
      toUpsert.push(loc);
      continue;
    }

    switch (policy) {
      case 'prefer_cloud':
        skippedConflicts += 1;
        break;
      case 'prefer_local':
        toUpsert.push({ ...loc, id: cloudRow.id });
        mergedOverwrites += 1;
        break;
      case 'merge_newer': {
        if (targetFreshnessMs(loc) >= targetFreshnessMs(cloudRow)) {
          toUpsert.push({ ...loc, id: cloudRow.id });
          mergedOverwrites += 1;
        } else {
          skippedConflicts += 1;
        }
        break;
      }
      default:
        skippedConflicts += 1;
    }
  }

  return { toUpsert, skippedConflicts, mergedOverwrites };
}
