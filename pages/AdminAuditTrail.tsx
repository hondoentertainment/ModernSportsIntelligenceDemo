import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldAlert, RefreshCw, User as UserIcon, AlertTriangle } from 'lucide-react';
import {
  mapStoredRecordToAuditEvent,
  exportAuditEventsToCSV,
  type AuditCategory,
  type AuditEvent,
} from '../lib/utils/auditTrailService';
import { fetchAdminAuditEvents, type AdminAuditRow } from '../lib/utils/adminAuditApi';
import { useAuth } from '../contexts/AuthContext';
import AuditFilterBar from '../components/audit/AuditFilterBar';
import AuditEventRow from '../components/audit/AuditEventRow';
import { useAuditFilters } from '../components/audit/useAuditFilters';
import { downloadFile } from '../lib/utils/reportGenerator';

type TimeWindow = '24h' | '7d' | '30d' | 'all';

const WINDOW_MS: Record<TimeWindow, number | null> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  all: null,
};

function withinWindow(rows: AdminAuditRow[], window: TimeWindow, nowMs: number): AdminAuditRow[] {
  const ms = WINDOW_MS[window];
  if (ms === null) return rows;
  const cutoff = nowMs - ms;
  return rows.filter((r) => {
    const t = Date.parse(r.created_at);
    return Number.isFinite(t) && t >= cutoff;
  });
}

const AdminAuditTrail: React.FC = () => {
  const { operatorRole } = useAuth();

  const [rows, setRows] = useState<AdminAuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin-specific filters (server-side).
  const [targetUserId, setTargetUserId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | ''>('');
  const [window, setWindow] = useState<TimeWindow>('7d');
  const [limit, setLimit] = useState(200);

  // Bump this to force `windowedRows` to re-evaluate `Date.now()` (used by the
  // Refresh button so the time-window cutoff doesn't drift indefinitely).
  const [nowMs, setNowMs] = useState(() => Date.now());

  const runQuery = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAdminAuditEvents({
      targetUserId: targetUserId.trim() || undefined,
      category: categoryFilter || undefined,
      limit,
    });
    if (!result.ok) {
      setError(result.error);
      setRows([]);
    } else {
      setRows(result.events);
    }
    setNowMs(Date.now());
    setLoading(false);
  }, [targetUserId, categoryFilter, limit]);

  useEffect(() => {
    void runQuery();
    // Only fire on mount — manual filter changes go through Refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const windowedRows = useMemo(() => withinWindow(rows, window, nowMs), [rows, window, nowMs]);
  const events = useMemo<AuditEvent[]>(
    () => windowedRows
      .map((r, i) => mapStoredRecordToAuditEvent(r, i, 'cloud'))
      .filter((e): e is AuditEvent => e !== null),
    [windowedRows],
  );

  const filters = useAuditFilters(events);

  const onExportCsv = useCallback(() => {
    const suffix = targetUserId.trim() ? `-${targetUserId.trim().slice(0, 8)}` : '';
    downloadFile(
      exportAuditEventsToCSV(filters.filteredEvents),
      `msi-admin-audit-events${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;',
    );
  }, [filters.filteredEvents, targetUserId]);

  const countLine = `${filters.filteredEvents.length} of ${events.length} event${events.length === 1 ? '' : 's'} · window ${window}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-rose-500/30 bg-rose-500/5">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-300">
          <ShieldAlert size={14} aria-hidden />
          Operator view — every read below is written to <code className="font-mono">audit_events</code> with
          <code className="font-mono ml-1">action = audit.cross_user_read</code>.
        </div>
      </div>

      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <ShieldAlert size={22} className="text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">Cross-User Audit Trail</h1>
              <p className="text-slate-400 text-sm">
                Role: <span className="font-mono text-rose-300">{operatorRole}</span> · Reads scoped by the
                <code className="font-mono ml-1">admin-audit-events</code> Edge Function.
              </p>
            </div>
            <button
              type="button"
              onClick={runQuery}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <RefreshCw size={14} aria-hidden className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-xs text-slate-400 space-y-1 md:col-span-2">
            <span className="uppercase tracking-wide flex items-center gap-1 text-[10px] font-bold">
              <UserIcon size={10} aria-hidden />
              Target user id
            </span>
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="uuid — leave blank for all users"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500/60"
            />
          </label>

          <label className="text-xs text-slate-400 space-y-1">
            <span className="uppercase tracking-wide text-[10px] font-bold">Category (server)</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as AuditCategory | '')}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/60"
            >
              <option value="">All</option>
              {['portfolio', 'valuation', 'autonomy', 'auth', 'system', 'admin'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="text-xs text-slate-400 space-y-1">
            <span className="uppercase tracking-wide text-[10px] font-bold">Time window</span>
            <select
              value={window}
              onChange={(e) => setWindow(e.target.value as TimeWindow)}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/60"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </label>

          <label className="text-xs text-slate-400 space-y-1">
            <span className="uppercase tracking-wide text-[10px] font-bold">Server limit</span>
            <input
              type="number"
              min={1}
              max={500}
              value={limit}
              onChange={(e) => {
                const n = Number(e.target.value);
                setLimit(Number.isFinite(n) ? Math.max(1, Math.min(500, Math.floor(n))) : 200);
              }}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/60"
            />
          </label>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-300 text-xs"
          >
            <AlertTriangle size={14} aria-hidden />
            {error}
          </div>
        )}

        <AuditFilterBar
          search={filters.search}
          onSearchChange={filters.setSearch}
          categories={filters.categories}
          onToggleCategory={filters.toggleCategory}
          severities={filters.severities}
          onToggleSeverity={filters.toggleSeverity}
          sources={filters.sources}
          onToggleSource={filters.toggleSource}
          onExportCsv={onExportCsv}
          onClearFilters={filters.clearFilters}
          hasActiveFilters={filters.hasActiveFilters}
          exportDisabled={filters.filteredEvents.length === 0}
          countLine={countLine}
          hideSourceRow
        />

        <div className="space-y-2">
          {!loading && filters.filteredEvents.length === 0 && !error && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center text-slate-500 text-xs">
              No events match the current filters.
            </div>
          )}
          {filters.filteredEvents.map((e) => (
            <AuditEventRow key={e.id} event={e} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAuditTrail;
