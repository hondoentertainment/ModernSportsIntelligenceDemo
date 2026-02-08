/**
 * Data Migration Utility
 * Handles migration from localStorage to Supabase for multi-tenant support
 */

import { CardInventory, TargetWatchlist } from '../types.ts';
import { supabase } from './supabase';

// LocalStorage keys
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

export interface MigrationResult {
    success: boolean;
    cardsMigrated: number;
    targetsMigrated: number;
    favoritesMigrated: number;
    errors: string[];
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
    const hasLocalData = localStorage.getItem(STORAGE_KEYS.INVENTORY) ||
        localStorage.getItem(STORAGE_KEYS.TARGETS) ||
        localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return !!hasLocalData;
}

/**
 * Get data from localStorage
 */
function getLocalStorageData<T>(key: string): T | null {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.warn(`Failed to parse ${key} from localStorage:`, e);
        return null;
    }
}

/**
 * Save data to localStorage
 */
function setLocalStorageData<T>(key: string, data: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn(`Failed to save ${key} to localStorage:`, e);
    }
}

/**
 * Migrate a single card to Supabase
 */
async function migrateCard(card: CardInventory, userId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('cards')
            .upsert({
                user_id: userId,
                player: card.player,
                year: card.year,
                manufacturer: card.manufacturer,
                card_number: card.cardNumber,
                set_name: card.set,
                sport: card.sport,
                league: card.league,
                is_autographed: card.isAutographed,
                condition: card.condition,
                is_graded: card.isGraded,
                grading_company: card.gradingCompany,
                grade: card.grade,
                purchase_price: card.purchasePrice,
                purchase_date: card.purchaseDate,
                current_value: card.currentValue,
                last_valuation_date: card.lastValuationDate,
                image_url: card.image,
                notes: card.notes,
                search_url: card.searchUrl,
                tax_basis: card.taxBasis,
                grading_fees: card.gradingFees,
                shipping_fees: card.shippingFees,
            }, {
                onConflict: 'user_id,player,year,manufacturer,card_number,set_name',
            });

        if (error) {
            console.error('Failed to migrate card:', card.id, error);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Error migrating card:', card.id, e);
        return false;
    }
}

/**
 * Migrate a single target to Supabase
 */
async function migrateTarget(target: TargetWatchlist, userId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('targets')
            .upsert({
                user_id: userId,
                player: target.player,
                card_description: target.cardDescription,
                priority: target.priority,
                target_price: target.targetPrice,
                current_market_price: target.currentMarketPrice,
                sport: target.sport,
                league: target.league,
                status: target.status,
                image_url: target.image,
                search_url: target.searchUrl,
                notes: target.notes,
            }, {
                onConflict: 'user_id,player,card_description',
            });

        if (error) {
            console.error('Failed to migrate target:', target.id, error);
            return false;
        }

        return true;
    } catch (e) {
        console.error('Error migrating target:', target.id, e);
        return false;
    }
}

/**
 * Perform full migration from localStorage to Supabase
 */
export async function migrateToSupabase(userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
        success: false,
        cardsMigrated: 0,
        targetsMigrated: 0,
        favoritesMigrated: 0,
        errors: [],
    };

    try {
        // Migrate cards
        const cards = getLocalStorageData<CardInventory[]>(STORAGE_KEYS.INVENTORY) || [];
        for (const card of cards) {
            const success = await migrateCard(card, userId);
            if (success) {
                result.cardsMigrated++;
            } else {
                result.errors.push(`Failed to migrate card: ${card.player} (${card.year})`);
            }
        }

        // Migrate targets
        const targets = getLocalStorageData<TargetWatchlist[]>(STORAGE_KEYS.TARGETS) || [];
        for (const target of targets) {
            const success = await migrateTarget(target, userId);
            if (success) {
                result.targetsMigrated++;
            } else {
                result.errors.push(`Failed to migrate target: ${target.player}`);
            }
        }

        // Favorites are stored as card IDs, we'll keep them in localStorage for now
        // as they reference cards that are now in Supabase
        const favorites = getLocalStorageData<string[]>(STORAGE_KEYS.FAVORITES) || [];
        result.favoritesMigrated = favorites.length;

        // Migration successful if no critical errors
        result.success = result.errors.length === 0;

        // If successful, clear migrated data from localStorage
        if (result.success) {
            localStorage.removeItem(STORAGE_KEYS.INVENTORY);
            localStorage.removeItem(STORAGE_KEYS.TARGETS);
            console.log('Migration complete, cleared localStorage data');
        }

    } catch (e) {
        result.errors.push(`Migration failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    return result;
}

/**
 * Backup localStorage data before migration
 */
export function backupLocalStorage(): string {
    const backup: Record<string, any> = {};

    Object.values(STORAGE_KEYS).forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
            backup[key] = data;
        }
    });

    return JSON.stringify(backup, null, 2);
}

/**
 * Restore localStorage from backup
 */
export function restoreLocalStorage(backupJson: string): boolean {
    try {
        const backup = JSON.parse(backupJson);

        Object.entries(backup).forEach(([key, value]) => {
            localStorage.setItem(key, value as string);
        });

        return true;
    } catch (e) {
        console.error('Failed to restore localStorage backup:', e);
        return false;
    }
}

/**
 * Clear all localStorage data (use with caution)
 */
export function clearLocalStorage(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
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
        localDataExists: !!localStorage.getItem(STORAGE_KEYS.INVENTORY),
        supabaseConfigured: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
    };
}
