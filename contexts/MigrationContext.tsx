import React, { createContext, useContext, useCallback, useState } from 'react';
import { useAuth } from './AuthContext';
import { isDemoMode } from '../lib/supabase';
import { migrateToSupabase, needsMigration, MigrationResult } from '../lib/migration';

interface MigrationContextType {
    /** Whether migration is in progress */
    isMigrating: boolean;
    /** Last migration result (for toast/feedback) */
    lastResult: MigrationResult | null;
    /** Manually trigger migration from localStorage to Supabase */
    triggerMigration: () => Promise<MigrationResult>;
    /** Whether migration is needed (local data exists, user is authenticated) */
    migrationAvailable: boolean;
}

const MigrationContext = createContext<MigrationContextType | undefined>(undefined);

export const useMigration = () => {
    const ctx = useContext(MigrationContext);
    if (!ctx) throw new Error('useMigration must be used within MigrationProvider');
    return ctx;
};

export const MigrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isMigrating, setIsMigrating] = useState(false);
    const [lastResult, setLastResult] = useState<MigrationResult | null>(null);

    const migrationAvailable = !!user && !isDemoMode && needsMigration();

    const triggerMigration = useCallback(async (): Promise<MigrationResult> => {
        if (!user || isDemoMode) {
            return { success: false, cardsMigrated: 0, targetsMigrated: 0, favoritesMigrated: 0, errors: ['Not authenticated'] };
        }
        setIsMigrating(true);
        setLastResult(null);
        try {
            const result = await migrateToSupabase(user.id);
            setLastResult(result);
            return result;
        } finally {
            setIsMigrating(false);
        }
    }, [user]);

    return (
        <MigrationContext.Provider value={{ isMigrating, lastResult, triggerMigration, migrationAvailable }}>
            {children}
        </MigrationContext.Provider>
    );
};
