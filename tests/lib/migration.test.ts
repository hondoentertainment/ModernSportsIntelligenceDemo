import { describe, it, expect, beforeEach } from 'vitest';
import {
    needsMigration,
    getMigrationStatus,
    buildMigrationMergeSummary,
    formatMigrationMergeLine,
    type MigrationResult,
} from '../../lib/utils/migration';

const STORAGE_KEYS = {
    INVENTORY: 'cardx_inventory',
    TARGETS: 'cardx_targets',
    FAVORITES: 'cardx_favorites',
};

describe('migration', () => {
    beforeEach(() => {
        localStorage.removeItem(STORAGE_KEYS.INVENTORY);
        localStorage.removeItem(STORAGE_KEYS.TARGETS);
        localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    });

    describe('needsMigration', () => {
        it('returns false when no local data exists', () => {
            localStorage.removeItem(STORAGE_KEYS.INVENTORY);
            localStorage.removeItem(STORAGE_KEYS.TARGETS);
            localStorage.removeItem(STORAGE_KEYS.FAVORITES);
            expect(needsMigration()).toBe(false);
        });

        it('returns true when inventory exists', () => {
            localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify([{ id: '1' }]));
            expect(needsMigration()).toBe(true);
        });

        it('returns true when targets exist', () => {
            localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify([{ id: '1' }]));
            expect(needsMigration()).toBe(true);
        });

        it('returns true when favorites exist', () => {
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(['id1']));
            expect(needsMigration()).toBe(true);
        });
    });

    describe('getMigrationStatus', () => {
        it('returns correct structure', () => {
            const status = getMigrationStatus();
            expect(status).toHaveProperty('needsMigration');
            expect(status).toHaveProperty('localDataExists');
            expect(status).toHaveProperty('supabaseConfigured');
            expect(typeof status.needsMigration).toBe('boolean');
            expect(typeof status.localDataExists).toBe('boolean');
            expect(typeof status.supabaseConfigured).toBe('boolean');
        });
    });

    describe('merge summary helpers', () => {
        const base: MigrationResult = {
            success: true,
            cardsMigrated: 3,
            targetsMigrated: 1,
            favoritesMigrated: 0,
            errors: [],
            conflictPolicy: 'prefer_local',
            cardsSkippedConflicts: 2,
            cardsMergedOverwrites: 1,
            targetsSkippedConflicts: 0,
            targetsMergedOverwrites: 1,
        };

        it('buildMigrationMergeSummary returns null when migration failed', () => {
            expect(buildMigrationMergeSummary({ ...base, success: false })).toBeNull();
        });

        it('buildMigrationMergeSummary aggregates overwrite and skip counts', () => {
            const s = buildMigrationMergeSummary(base);
            expect(s).toEqual({
                cardsWritten: 3,
                targetsWritten: 1,
                conflictsResolved: 2,
                duplicatesSkipped: 2,
                conflictPolicy: 'prefer_local',
            });
        });

        it('formatMigrationMergeLine lists writes and policy outcomes', () => {
            const s = buildMigrationMergeSummary(base)!;
            expect(formatMigrationMergeLine(s)).toContain('3 cards, 1 target written');
            expect(formatMigrationMergeLine(s)).toContain('2 conflicts resolved per policy');
            expect(formatMigrationMergeLine(s)).toContain('2 duplicates skipped (cloud retained)');
        });
    });
});
