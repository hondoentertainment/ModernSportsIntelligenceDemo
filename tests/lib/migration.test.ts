import { describe, it, expect, beforeEach } from 'vitest';
import { needsMigration, getMigrationStatus } from '../../lib/utils/migration';

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
});
