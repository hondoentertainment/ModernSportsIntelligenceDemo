import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { isDemoMode } from '../lib/supabase';
import {
    migrateToSupabase,
    needsMigration,
    MigrationResult,
    deniedMigrationResult,
    buildMigrationMergeSummary,
    previewMigrationConflicts,
    type MigrationMergeSummary,
    type MigrationConflictPreview,
} from '../lib/utils/migration';

interface MigrationContextType {
    /** Whether migration is in progress */
    isMigrating: boolean;
    /** Last migration result (for toast/feedback) */
    lastResult: MigrationResult | null;
    /** Last successful run merge/conflict tallies (plain object for UI) */
    lastMergeSummary: MigrationMergeSummary | null;
    /** Local vs cloud duplicate preview (demo-safe when uplink is down) */
    conflictPreview: MigrationConflictPreview | null;
    /** Refresh duplicate-key preview without writing */
    refreshConflictPreview: () => Promise<MigrationConflictPreview>;
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
    const [lastMergeSummary, setLastMergeSummary] = useState<MigrationMergeSummary | null>(null);
    const [conflictPreview, setConflictPreview] = useState<MigrationConflictPreview | null>(null);
    // Prevent double-triggering when user object changes reference but userId stays the same
    const autoTriggeredForRef = useRef<string | null>(null);

    const migrationAvailable = !!user && !isDemoMode && needsMigration();

    const refreshConflictPreview = useCallback(async (): Promise<MigrationConflictPreview> => {
        const preview = await previewMigrationConflicts(user?.id);
        setConflictPreview(preview);
        return preview;
    }, [user]);

    const triggerMigration = useCallback(async (): Promise<MigrationResult> => {
        if (!user || isDemoMode) {
            return deniedMigrationResult(['Not authenticated']);
        }
        setIsMigrating(true);
        setLastResult(null);
        setLastMergeSummary(null);
        try {
            const result = await migrateToSupabase(user.id);
            setLastResult(result);
            setLastMergeSummary(buildMigrationMergeSummary(result));
            return result;
        } finally {
            setIsMigrating(false);
        }
    }, [user]);

    // Auto-trigger migration on login when local data exists
    useEffect(() => {
        if (!user || isDemoMode || !needsMigration()) return;
        if (autoTriggeredForRef.current === user.id) return;
        autoTriggeredForRef.current = user.id;
        triggerMigration();
    }, [user, triggerMigration]);

    useEffect(() => {
        void refreshConflictPreview();
    }, [refreshConflictPreview]);

    return (
        <MigrationContext.Provider
            value={{
                isMigrating,
                lastResult,
                lastMergeSummary,
                conflictPreview,
                refreshConflictPreview,
                triggerMigration,
                migrationAvailable,
            }}
        >
            {children}
        </MigrationContext.Provider>
    );
};
