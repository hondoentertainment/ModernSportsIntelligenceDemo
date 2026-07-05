import React from 'react';
import { Search, Download, X } from 'lucide-react';
import type { AuditCategory, AuditEvent, AuditSeverity } from '../../lib/utils/auditTrailService';

export const ALL_CATEGORIES: AuditCategory[] = [
    'portfolio', 'trading', 'auth', 'admin', 'finance', 'api', 'compliance', 'data',
];
export const ALL_SEVERITIES: AuditSeverity[] = ['info', 'warning', 'critical', 'security'];
export const ALL_SOURCES: NonNullable<AuditEvent['source']>[] = ['recorded', 'cloud', 'sample'];

interface AuditFilterBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    categories: Set<AuditCategory>;
    onToggleCategory: (cat: AuditCategory) => void;
    severities: Set<AuditSeverity>;
    onToggleSeverity: (sev: AuditSeverity) => void;
    sources: Set<NonNullable<AuditEvent['source']>>;
    onToggleSource: (src: NonNullable<AuditEvent['source']>) => void;
    onExportCsv: () => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
    exportDisabled?: boolean;
    /** Rendered as the small "N of M events" line under the chips. */
    countLine: string;
    /** Only show the Source row when the page mixes multiple provenances. */
    hideSourceRow?: boolean;
}

const AuditFilterBar: React.FC<AuditFilterBarProps> = ({
    search,
    onSearchChange,
    categories,
    onToggleCategory,
    severities,
    onToggleSeverity,
    sources,
    onToggleSource,
    onExportCsv,
    onClearFilters,
    hasActiveFilters,
    exportDisabled,
    countLine,
    hideSourceRow,
}) => (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
                <Search
                    size={14}
                    aria-hidden
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                    type="search"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search action, resource, actor, details…"
                    aria-label="Search audit events"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60"
                />
            </div>
            <button
                type="button"
                onClick={onExportCsv}
                disabled={!!exportDisabled}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <Download size={14} aria-hidden />
                Export CSV
            </button>
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={onClearFilters}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
                >
                    <X size={12} aria-hidden />
                    Clear filters
                </button>
            )}
        </div>

        <FilterChipGroup
            label="Category"
            items={ALL_CATEGORIES}
            selected={categories}
            onToggle={onToggleCategory}
        />
        <FilterChipGroup
            label="Severity"
            items={ALL_SEVERITIES}
            selected={severities}
            onToggle={onToggleSeverity}
        />
        {!hideSourceRow && (
            <FilterChipGroup
                label="Source"
                items={ALL_SOURCES}
                selected={sources}
                onToggle={onToggleSource}
            />
        )}

        <p className="text-[10px] text-slate-500 uppercase tracking-wide">{countLine}</p>
    </div>
);

function FilterChipGroup<T extends string>({
    label,
    items,
    selected,
    onToggle,
}: {
    label: string;
    items: readonly T[];
    selected: Set<T>;
    onToggle: (item: T) => void;
}): React.ReactElement {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wide text-slate-500 font-bold w-20 flex-shrink-0">
                {label}
            </span>
            {items.map((item) => {
                const isOn = selected.has(item);
                return (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onToggle(item)}
                        aria-pressed={isOn}
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold capitalize border transition-colors ${
                            isOn
                                ? 'bg-violet-500/20 text-violet-200 border-violet-500/50'
                                : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                        }`}
                    >
                        {item}
                    </button>
                );
            })}
        </div>
    );
}

export default AuditFilterBar;
