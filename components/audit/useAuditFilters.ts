import { useCallback, useMemo, useState } from 'react';
import {
    filterAuditEvents,
    type AuditCategory,
    type AuditEvent,
    type AuditSeverity,
} from '../../lib/utils/auditTrailService';

/**
 * Client-side filter state for the audit-trail viewers. Both `AuditTrail` and
 * `AdminAuditTrail` need the same search box + category / severity / source
 * filter chips + Clear button + derived filtered list, so the state lives in
 * one hook that both pages compose.
 *
 * `AuditFilterBar` renders the UI; this hook owns the state.
 */
export function useAuditFilters(events: AuditEvent[]) {
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState<Set<AuditCategory>>(new Set());
    const [severities, setSeverities] = useState<Set<AuditSeverity>>(new Set());
    const [sources, setSources] = useState<Set<NonNullable<AuditEvent['source']>>>(new Set());

    const toggleCategory = useCallback((cat: AuditCategory) => {
        setCategories((prev) => toggleInSet(prev, cat));
    }, []);
    const toggleSeverity = useCallback((sev: AuditSeverity) => {
        setSeverities((prev) => toggleInSet(prev, sev));
    }, []);
    const toggleSource = useCallback((src: NonNullable<AuditEvent['source']>) => {
        setSources((prev) => toggleInSet(prev, src));
    }, []);

    const clearFilters = useCallback(() => {
        setSearch('');
        setCategories(new Set());
        setSeverities(new Set());
        setSources(new Set());
    }, []);

    const hasActiveFilters =
        search.length > 0 || categories.size > 0 || severities.size > 0 || sources.size > 0;

    const filteredEvents = useMemo(
        () =>
            filterAuditEvents(events, {
                search,
                categories: Array.from(categories),
                severities: Array.from(severities),
                sources: Array.from(sources),
            }),
        [events, search, categories, severities, sources],
    );

    return {
        search,
        setSearch,
        categories,
        toggleCategory,
        severities,
        toggleSeverity,
        sources,
        toggleSource,
        clearFilters,
        hasActiveFilters,
        filteredEvents,
    };
}

/** Functional-updater-safe set toggle. */
function toggleInSet<T>(prev: Set<T>, item: T): Set<T> {
    const next = new Set(prev);
    if (next.has(item)) next.delete(item); else next.add(item);
    return next;
}
