import React from 'react';
import { Cloud, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMigration } from '../contexts/MigrationContext';
import { useToast } from '../contexts/ToastContext';

/**
 * Banner shown when user has local data and can sync to cloud.
 * Provides "Sync Now" manual trigger and displays migration status.
 */
const MigrationBanner: React.FC = () => {
    const { isMigrating, migrationAvailable, triggerMigration, lastResult } = useMigration();
    const { addToast } = useToast();

    if (!migrationAvailable && !isMigrating && !lastResult) return null;

    const handleSyncNow = async () => {
        const result = await triggerMigration();
        if (result.success) {
            addToast('success', `Synced ${result.cardsMigrated} cards and ${result.targetsMigrated} targets to cloud.`);
            window.location.reload();
        } else if (result.errors.length > 0) {
            addToast('error', result.errors[0] || 'Migration failed.');
        }
    };

    return (
        <div className="px-4 py-3 bg-brand-teal/10 border-b border-brand-teal/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                {isMigrating ? (
                    <Loader2 className="w-5 h-5 text-brand-teal animate-spin flex-shrink-0" />
                ) : lastResult?.success ? (
                    <CheckCircle2 className="w-5 h-5 text-brand-lime flex-shrink-0" />
                ) : (
                    <Cloud className="w-5 h-5 text-brand-teal flex-shrink-0" />
                )}
                <div>
                    <p className="text-sm font-bold text-white">
                        {isMigrating
                            ? 'Syncing your portfolio to the cloud...'
                            : lastResult?.success
                                ? 'Portfolio synced to cloud.'
                                : 'Local portfolio data detected. Sync to cloud for cross-device access.'}
                    </p>
                    {lastResult && !lastResult.success && lastResult.errors.length > 0 && (
                        <p className="text-xs text-red-400 mt-0.5">{lastResult.errors[0]}</p>
                    )}
                </div>
            </div>
            {migrationAvailable && !isMigrating && (
                <button
                    onClick={handleSyncNow}
                    className="px-4 py-2 rounded-xl bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                >
                    <Cloud size={14} /> Sync Now
                </button>
            )}
        </div>
    );
};

export default MigrationBanner;
