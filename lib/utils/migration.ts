/**
 * Data Migration Utility
 * Migrates persisted MSI keys (via syncStore) to Supabase for multi-tenant support.
 */

import { logger } from '../logger';
import { store } from '../dal/syncStore';
import { CardInventory, TargetWatchlist } from '../../types.ts';
import { isDemoMode } from '../supabase';
import { fetchCards, fetchTargets } from '../supabaseData';
import {
    type MigrationConflictPolicy,
    planCardMigration,
    planTargetMigration,
} from './migrationMerge';

// Known MSI persistence keys (syncStore + DAL)
const STORAGE_KEYS = {
    INVENTORY: 'cardx_inventory',
    TARGETS: 'cardx_targets',
    FAVORITES: 'cardx_favorites',
    PRICE_HISTORY: 'cardx_price_history',
    SYNC_META: 'cardx_sync_meta',
    SYNC_HISTORY: 'cardx_sync_history',
    USER_SETTINGS: 'msi_user_settings',
    DEMO_SESSION: 'msi_demo_session',
};

const CONFLICT_POLICY_KEY = 'msi_migration_conflict_policy';

export type { MigrationConflictPolicy } from './migrationMerge';

const DEFAULT_CONFLICT_POLICY: MigrationConflictPolicy = 'prefer_local';

export function getMigrationConflictPolicy(): MigrationConflictPolicy {
    const v = store.get<string>(CONFLICT_POLICY_KEY, DEFAULT_CONFLICT_POLICY);
    if (v === 'prefer_cloud' || v === 'merge_newer' || v === 'prefer_local') return v;
    return DEFAULT_CONFLICT_POLICY;
}

export function setMigrationConflictPolicy(policy: MigrationConflictPolicy): void {
    store.set(CONFLICT_POLICY_KEY, policy);
}

/** Result shape for blocked migrations (e.g. not signed in). */
export function deniedMigrationResult(errors: string[]): MigrationResult {
    return {
        success: false,
        cardsMigrated: 0,
        targetsMigrated: 0,
        favoritesMigrated: 0,
        errors,
        conflictPolicy: getMigrationConflictPolicy(),
        cardsSkippedConflicts: 0,
        cardsMergedOverwrites: 0,
        targetsSkippedConflicts: 0,
        targetsMergedOverwrites: 0,
    };
}

export interface MigrationResult {
    success: boolean;
    cardsMigrated: number;
    targetsMigrated: number;
    favoritesMigrated: number;
    errors: string[];
    conflictPolicy: MigrationConflictPolicy;
    cardsSkippedConflicts: number;
    cardsMergedOverwrites: number;
    targetsSkippedConflicts: number;
    targetsMergedOverwrites: number;
}

/** Plain summary for UI after a successful migration (merge policy outcomes). */
export interface MigrationMergeSummary {
    cardsWritten: number;
    targetsWritten: number;
    /** Rows where local (or newer) replaced cloud per policy */
    conflictsResolved: number;
    /** Rows skipped because cloud copy was retained */
    duplicatesSkipped: number;
    conflictPolicy: MigrationConflictPolicy;
}

export function buildMigrationMergeSummary(result: MigrationResult): MigrationMergeSummary | null {
    if (!result.success) return null;
    return {
        cardsWritten: result.cardsMigrated,
        targetsWritten: result.targetsMigrated,
        conflictsResolved: result.cardsMergedOverwrites + result.targetsMergedOverwrites,
        duplicatesSkipped: result.cardsSkippedConflicts + result.targetsSkippedConflicts,
        conflictPolicy: result.conflictPolicy,
    };
}

/** Concise institutional line for banners and inline status. */
export function formatMigrationMergeLine(summary: MigrationMergeSummary): string {
    const w = `${summary.cardsWritten} card${summary.cardsWritten === 1 ? '' : 's'}, ${summary.targetsWritten} target${summary.targetsWritten === 1 ? '' : 's'} written`;
    if (summary.conflictsResolved === 0 && summary.duplicatesSkipped === 0) {
        return w;
    }
    const parts: string[] = [w];
    if (summary.conflictsResolved > 0) {
        parts.push(
            `${summary.conflictsResolved} conflict${summary.conflictsResolved === 1 ? '' : 's'} resolved per policy`
        );
    }
    if (summary.duplicatesSkipped > 0) {
        parts.push(
            `${summary.duplicatesSkipped} duplicate${summary.duplicatesSkipped === 1 ? '' : 's'} skipped (cloud retained)`
        );
    }
    return parts.join(' · ');
}

/** Short toast body after sync. */
export function formatMigrationMergeToast(summary: MigrationMergeSummary): string {
    return `Uplink complete: ${formatMigrationMergeLine(summary)}`;
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
    const hasLocalData = store.has(STORAGE_KEYS.INVENTORY) ||
        store.has(STORAGE_KEYS.TARGETS) ||
        store.has(STORAGE_KEYS.FAVORITES);
    return hasLocalData;
}

/** Read a known MSI key from syncStore (null if missing). */
function getPersistedData<T>(key: string): T | null {
    return store.get<T | null>(key, null);
}

/**
 * Perform full migration from persisted MSI data to Supabase
 */
export async function migrateToSupabase(userId: string): Promise<MigrationResult> {
    const policy = getMigrationConflictPolicy();
    const result: MigrationResult = {
        success: false,
        cardsMigrated: 0,
        targetsMigrated: 0,
        favoritesMigrated: 0,
        errors: [],
        conflictPolicy: policy,
        cardsSkippedConflicts: 0,
        cardsMergedOverwrites: 0,
        targetsSkippedConflicts: 0,
        targetsMergedOverwrites: 0,
    };

    try {
        const cloudCards = !isDemoMode ? await fetchCards(userId) : [];
        const cloudTargets = !isDemoMode ? await fetchTargets(userId) : [];

        // Migrate cards (with identity-level conflict policy)
        const cards = getPersistedData<CardInventory[]>(STORAGE_KEYS.INVENTORY) || [];
        if (cards.length > 0) {
            const { bulkUpsertCards } = await import('../supabaseData');
            const plan = planCardMigration(cards, cloudCards, policy);
            result.cardsSkippedConflicts = plan.skippedConflicts;
            result.cardsMergedOverwrites = plan.mergedOverwrites;

            if (plan.toUpsert.length === 0) {
                result.cardsMigrated = 0;
            } else {
                const cardSuccess = await bulkUpsertCards(plan.toUpsert, userId);
                if (cardSuccess) {
                    result.cardsMigrated = plan.toUpsert.length;
                } else {
                    result.errors.push(`Failed to migrate ${plan.toUpsert.length} cards`);
                }
            }
        }

        // Migrate targets
        const targets = getPersistedData<TargetWatchlist[]>(STORAGE_KEYS.TARGETS) || [];
        if (targets.length > 0) {
            const { bulkUpsertTargets } = await import('../supabaseData');
            const tplan = planTargetMigration(targets, cloudTargets, policy);
            result.targetsSkippedConflicts = tplan.skippedConflicts;
            result.targetsMergedOverwrites = tplan.mergedOverwrites;

            if (tplan.toUpsert.length === 0) {
                result.targetsMigrated = 0;
            } else {
                const targetSuccess = await bulkUpsertTargets(tplan.toUpsert, userId);
                if (targetSuccess) {
                    result.targetsMigrated = tplan.toUpsert.length;
                } else {
                    result.errors.push(`Failed to migrate ${tplan.toUpsert.length} targets`);
                }
            }
        }

        // Favorites stay client-side (card IDs referencing Supabase-backed cards).
        const favorites = getPersistedData<string[]>(STORAGE_KEYS.FAVORITES) || [];
        result.favoritesMigrated = favorites.length;

        // Migration successful if no critical errors
        result.success = result.errors.length === 0;

        if (result.success) {
            store.remove(STORAGE_KEYS.INVENTORY);
            store.remove(STORAGE_KEYS.TARGETS);
            if (import.meta.env.DEV) logger.log('Migration complete, cleared inventory/targets from store');
        }

    } catch (e) {
        result.errors.push(`Migration failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    return result;
}

/** JSON backup of known MSI keys (via syncStore). */
export function backupLocalStorage(): string {
    const backup: Record<string, unknown> = {};

    Object.values(STORAGE_KEYS).forEach(key => {
        if (store.has(key)) {
            backup[key] = store.get<unknown>(key, null);
        }
    });

    return JSON.stringify(backup, null, 2);
}

/**
 * Restore localStorage from backup
 */
export function restoreLocalStorage(backupJson: string): boolean {
    try {
        const backup: Record<string, unknown> = JSON.parse(backupJson);

        Object.entries(backup).forEach(([key, value]) => {
            store.set(key, value);
        });

        return true;
    } catch (e) {
        logger.error('Failed to restore MSI backup:', e);
        return false;
    }
}

/** Remove all known MSI keys from syncStore (use with caution). */
export function clearLocalStorage(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
        store.remove(key);
    });
}

/**
 * Get migration status
 */
export function getMigrationStatus(): {
    needsMigration: boolean;
    localDataExists: boolean;
    supabaseConfigured: boolean;
} {
    return {
        needsMigration: needsMigration(),
        localDataExists: store.has(STORAGE_KEYS.INVENTORY),
        supabaseConfigured: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
    };
}
