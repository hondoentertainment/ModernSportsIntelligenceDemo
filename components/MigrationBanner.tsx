import React, { useState } from 'react';
import { Cloud, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useMigration } from '../contexts/MigrationContext';
import { useToast } from '../contexts/ToastContext';
import {
    getMigrationConflictPolicy,
    setMigrationConflictPolicy,
    type MigrationConflictPolicy,
    buildMigrationMergeSummary,
    formatMigrationMergeToast,
    formatMigrationMergeLine,
} from '../lib/utils/migration';
import { MIGRATION_CONFLICT_POLICY_OPTIONS } from '../lib/utils/migrationPolicyOptions';

/**
 * Banner shown when user has local data and can sync to cloud.
 * Provides conflict policy, "Sync Now" manual trigger, and migration status.
 */
const MigrationBanner: React.FC = () => {
    const { isMigrating, migrationAvailable, triggerMigration, lastResult, lastMergeSummary } = useMigration();
    const { addToast } = useToast();
    const [policy, setPolicy] = useState<MigrationConflictPolicy>(() => getMigrationConflictPolicy());

    if (!migrationAvailable && !isMigrating && !lastResult) return null;

    const handlePolicyChange = (value: MigrationConflictPolicy) => {
        setPolicy(value);
        setMigrationConflictPolicy(value);
    };

    const handleSyncNow = async () => {
        try {
            const result = await triggerMigration();
            if (result.success) {
                const summary = buildMigrationMergeSummary(result);
                addToast(
                    'success',
                    summary ? formatMigrationMergeToast(summary) : 'Uplink complete: portfolio synchronized.'
                );
                setTimeout(() => window.location.reload(), 1500);
            } else if (result.errors.length > 0) {
                addToast('error', result.errors[0] || 'Sync failed. Please check your uplink.');
            }
        } catch {
            addToast('error', 'Critical sync failure. Infrastructure offline.');
        }
    };

    return (
        <div className="px-6 py-3 bg-brand-teal/5 border-b border-brand-teal/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-in slide-in-from-top duration-500">
            <div className="flex items-start gap-4 min-w-0">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${isMigrating ? 'bg-brand-teal/20' : 'bg-brand-charcoal border border-slate-800'}`}
                >
                    {isMigrating ? (
                        <Loader2 className="w-5 h-5 text-brand-teal animate-spin" />
                    ) : lastResult?.success ? (
                        <CheckCircle2 className="w-5 h-5 text-brand-lime" />
                    ) : (
                        <Cloud className="w-5 h-5 text-brand-teal" />
                    )}
                </div>
                <div className="min-w-0">
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
                    {lastResult?.success && lastMergeSummary && (
                        <p className="text-[10px] text-slate-400 font-semibold normal-case tracking-normal mt-1.5 leading-snug border-l-2 border-brand-teal/40 pl-2">
                            {formatMigrationMergeLine(lastMergeSummary)}
                        </p>
                    )}
                    {migrationAvailable && !isMigrating && (
                        <div className="mt-2 flex flex-col gap-1 max-w-md">
                            <label htmlFor="msi-migration-policy" className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                                If a card already exists in the cloud
                            </label>
                            <select
                                id="msi-migration-policy"
                                value={policy}
                                onChange={(e) => handlePolicyChange(e.target.value as MigrationConflictPolicy)}
                                className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-brand-teal/50"
                            >
                                {MIGRATION_CONFLICT_POLICY_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value} title={o.hint}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[10px] text-slate-500 leading-snug">
                                {MIGRATION_CONFLICT_POLICY_OPTIONS.find((p) => p.value === policy)?.hint}
                            </p>
                        </div>
                    )}
                    {lastResult && !lastResult.success && lastResult.errors.length > 0 && (
                        <p className="text-[10px] text-red-400 font-bold mt-1 uppercase tracking-tighter flex items-center gap-1">
                            <AlertCircle size={12} aria-hidden />
                            {lastResult.errors[0]}
                        </p>
                    )}
                </div>
            </div>
            {migrationAvailable && !isMigrating && (
                <button
                    type="button"
                    onClick={handleSyncNow}
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-brand-teal text-brand-charcoal font-black text-[10px] uppercase tracking-widest transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-lg shadow-brand-teal/20 flex items-center justify-center gap-2 min-h-[44px]"
                >
                    <RefreshCw size={14} aria-hidden /> Bridge Now
                </button>
            )}
        </div>
    );
};

export default MigrationBanner;
