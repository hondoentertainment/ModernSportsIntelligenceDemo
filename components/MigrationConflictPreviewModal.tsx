import React, { useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import type { MigrationPreview, MigrationConflictPolicy } from '../lib/utils/migration';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    preview: MigrationPreview | null;
    policy: MigrationConflictPolicy;
    isLoading: boolean;
    onProceed: () => void;
}

function ResolutionBadge({ resolution }: { resolution: 'overwrite' | 'skip' | 'newer_wins' }) {
    if (resolution === 'overwrite') {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Overwrite
            </span>
        );
    }
    if (resolution === 'skip') {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-700/60 text-slate-400 border border-slate-600/40">
                Keep Cloud
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/15 text-teal-400 border border-teal-500/30">
            Newer Wins
        </span>
    );
}

function SkeletonRow() {
    return (
        <tr className="border-b border-slate-800">
            {[1, 2, 3, 4, 5].map((i) => (
                <td key={i} className="px-3 py-3">
                    <div className="h-3 bg-slate-700/60 rounded animate-pulse" style={{ width: `${50 + i * 10}%` }} />
                </td>
            ))}
        </tr>
    );
}

const MigrationConflictPreviewModal: React.FC<Props> = ({
    isOpen,
    onClose,
    preview,
    policy,
    isLoading,
    onProceed,
}) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const policyLabel: Record<MigrationConflictPolicy, string> = {
        prefer_local: 'Prefer Local',
        prefer_cloud: 'Prefer Cloud',
        merge_newer: 'Merge Newer',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="migration-preview-title"
        >
            <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
                    <div>
                        <h2
                            id="migration-preview-title"
                            className="text-sm font-black uppercase tracking-widest text-white"
                        >
                            {isLoading
                                ? 'Analyzing local portfolio…'
                                : preview
                                  ? `Sync Preview — ${preview.total} local record${preview.total === 1 ? '' : 's'}`
                                  : 'Sync Preview'}
                        </h2>
                        {!isLoading && preview && (
                            <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider mt-0.5">
                                Policy: {policyLabel[policy]}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close preview"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Summary bar */}
                {!isLoading && preview && (
                    <div className="px-6 py-3 bg-slate-800/40 border-b border-slate-800 flex items-center gap-4 shrink-0">
                        <span className="text-[11px] font-bold text-brand-teal uppercase tracking-wider">
                            {preview.toAdd} new to cloud
                        </span>
                        <span className="text-slate-600 text-xs">·</span>
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                            {preview.conflicts.length} conflict{preview.conflicts.length === 1 ? '' : 's'}
                        </span>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {isLoading && (
                        <table className="w-full text-xs">
                            <thead className="sticky top-0 bg-slate-900/95 border-b border-slate-800">
                                <tr>
                                    {['Player', 'Year / Set', 'Local Value', 'Cloud Value', 'Action'].map((h) => (
                                        <th
                                            key={h}
                                            className="px-3 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-slate-500"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
                            </tbody>
                        </table>
                    )}

                    {!isLoading && preview && preview.conflicts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center">
                                <RefreshCw size={22} className="text-brand-teal" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-widest text-white">
                                No Conflicts Detected
                            </p>
                            <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                                All {preview.toAdd} local record{preview.toAdd === 1 ? '' : 's'} are new — nothing in the cloud will be overwritten.
                            </p>
                        </div>
                    )}

                    {!isLoading && preview && preview.conflicts.length > 0 && (
                        <table className="w-full text-xs">
                            <thead className="sticky top-0 bg-slate-900/95 border-b border-slate-800">
                                <tr>
                                    {['Player', 'Year / Set', 'Local Value', 'Cloud Value', 'Action'].map((h) => (
                                        <th
                                            key={h}
                                            className="px-3 py-2.5 text-left text-[9px] font-black uppercase tracking-widest text-slate-500"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {preview.conflicts.map((c, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="px-3 py-3 font-semibold text-slate-200 whitespace-nowrap">
                                            {c.player}
                                        </td>
                                        <td className="px-3 py-3 text-slate-400 whitespace-nowrap">
                                            {c.year} · {c.set}
                                        </td>
                                        <td className="px-3 py-3 text-slate-200 whitespace-nowrap">
                                            ${c.localValue.toLocaleString()}
                                            {c.localDate && (
                                                <span className="block text-[9px] text-slate-500 mt-0.5">
                                                    {c.localDate}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-slate-200 whitespace-nowrap">
                                            ${c.cloudValue.toLocaleString()}
                                            {c.cloudDate && (
                                                <span className="block text-[9px] text-slate-500 mt-0.5">
                                                    {c.cloudDate}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3">
                                            <ResolutionBadge resolution={c.resolution} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onProceed}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-xl bg-brand-teal text-brand-charcoal font-black text-[10px] uppercase tracking-widest transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-lg shadow-brand-teal/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <RefreshCw size={13} aria-hidden />
                        Proceed with Sync
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MigrationConflictPreviewModal;
