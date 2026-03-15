import React from 'react';
import { Cloud, Loader2, CheckCircle2 } from 'lucide-react';
import { Cloud, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
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
        try {
            const result = await triggerMigration();
            if (result.success) {
                addToast('success', `Institutional sync complete: ${result.cardsMigrated} assets secured to cloud.`);
                // Small delay for toast visibility before reload
                setTimeout(() => window.location.reload(), 1500);
            } else if (result.errors.length > 0) {
                addToast('error', result.errors[0] || 'Sync failed. Please check your uplink.');
            }
        } catch (e) {
            addToast('error', 'Critical sync failure. Infrastructure offline.');
        }
    };

    return (
        <div className="px-6 py-3 bg-brand-teal/5 border-b border-brand-teal/20 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isMigrating ? 'bg-brand-teal/20' : 'bg-brand-charcoal border border-slate-800'}`}>
                    {isMigrating ? (
                        <Loader2 className="w-5 h-5 text-brand-teal animate-spin" />
                    ) : lastResult?.success ? (
                        <CheckCircle2 className="w-5 h-5 text-brand-lime" />
                    ) : (
                        <Cloud className="w-5 h-5 text-brand-teal" />
                    )}
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">
                        {isMigrating
                            ? 'Luminous Sync in Progress'
                            : lastResult?.success
                                ? 'Cloud Architecture Synchronized'
                                : 'Local Data Detected'}
                    </h4>
                    <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider mt-0.5">
                        {isMigrating
                            ? 'Securing institutional assets to MSI Cloud...'
                            : lastResult?.success
                                ? 'Your portfolio is now persistent across all platforms.'
                                : 'Bridge local data to your account for multi-device intelligence.'}
                    </p>
                    {lastResult && !lastResult.success && lastResult.errors.length > 0 && (
                        <p className="text-[10px] text-red-400 font-bold mt-1 uppercase tracking-tighter">[{lastResult.errors[0]}]</p>
                    )}
                </div>
            </div>
            {migrationAvailable && !isMigrating && (
                <button
                    onClick={handleSyncNow}
                    className="px-5 py-2.5 rounded-xl bg-brand-teal text-brand-charcoal font-black text-[10px] uppercase tracking-widest transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-lg shadow-brand-teal/20 flex items-center gap-2"
                >
                    <RefreshCw size={14} /> Bridge Now
                </button>
            )}
        </div>
    );
};

export default MigrationBanner;
