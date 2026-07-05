import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ScrollText, Shield, AlertTriangle, FileText, Database, RefreshCw, Lock,
} from 'lucide-react';
import {
  getAuditEvents,
  getRemoteAuditEvents,
  getRemoteAuditEventsResult,
  getComplianceRules,
  getComplianceReports,
  getRetentionPolicies,
  getAuditTrailStats,
  getCategoryColor,
  getComplianceStatusColor,
  exportAuditEventsToCSV,
  type AuditEvent,
} from '../lib/utils/auditTrailService';
import { useAuth } from '../contexts/AuthContext';
import AuditFilterBar from '../components/audit/AuditFilterBar';
import AuditEventRow from '../components/audit/AuditEventRow';
import { useAuditFilters } from '../components/audit/useAuditFilters';
import { downloadFile } from '../lib/utils/reportGenerator';

const REMOTE_PAGE_SIZE = 200;

const AuditTrail: React.FC = () => {
  const { user } = useAuth();
  const [eventsRefresh, setEventsRefresh] = useState(0);
  const reloadEvents = useCallback(() => setEventsRefresh((n) => n + 1), []);

  const [events, setEvents] = useState<AuditEvent[]>(() => getAuditEvents());
  const [remoteHasMore, setRemoteHasMore] = useState(false);
  const [olderLoading, setOlderLoading] = useState(false);

  const { recordedCount, cloudCount } = useMemo(() => {
    let recorded = 0;
    let cloud = 0;
    for (const e of events) {
      if (e.source === 'recorded') recorded++;
      else if (e.source === 'cloud') cloud++;
    }
    return { recordedCount: recorded, cloudCount: cloud };
  }, [events]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const local = getAuditEvents();
      if (!user?.id) {
        if (!ignore) {
          setEvents(local);
          setRemoteHasMore(false);
        }
        return;
      }
      const remote = await getRemoteAuditEvents(user.id, { limit: REMOTE_PAGE_SIZE });
      if (!ignore) {
        setEvents([...remote, ...local]);
        setRemoteHasMore(remote.length === REMOTE_PAGE_SIZE);
      }
    }
    void load();
    return () => {
      ignore = true;
    };
  }, [user?.id, eventsRefresh]);

  // Composite cursor (createdAt + rowId) for the "Load older" page. The
  // tie-breaker on rowId means multiple rows sharing the exact same
  // `created_at` millisecond can't silently fall off the boundary.
  const oldestCloudCursor = useMemo<{ createdAt: string; id: string } | undefined>(() => {
    let oldest: { createdAt: string; id: string } | undefined;
    for (const e of events) {
      if (e.source !== 'cloud' || !e.isoTimestamp || !e.rowId) continue;
      if (
        oldest === undefined ||
        e.isoTimestamp < oldest.createdAt ||
        (e.isoTimestamp === oldest.createdAt && e.rowId < oldest.id)
      ) {
        oldest = { createdAt: e.isoTimestamp, id: e.rowId };
      }
    }
    return oldest;
  }, [events]);

  const loadOlder = useCallback(async () => {
    if (!user?.id || olderLoading || !oldestCloudCursor) return;
    setOlderLoading(true);
    try {
      const result = await getRemoteAuditEventsResult(user.id, {
        limit: REMOTE_PAGE_SIZE,
        beforeCursor: oldestCloudCursor,
      });
      // Only mutate `remoteHasMore` on a definite empty page. A transient
      // network / RLS failure must NOT hide the Load-older button — that
      // would strand the user until they hard-refresh.
      if (!result.ok) return;
      if (result.events.length === 0) {
        setRemoteHasMore(false);
        return;
      }
      // Insert the older cloud page BEFORE the local/sample tail so the
      // chronology stays: newer cloud → older cloud → local → sample.
      setEvents((prev) => {
        const firstNonCloud = prev.findIndex((e) => e.source !== 'cloud');
        const cutoff = firstNonCloud === -1 ? prev.length : firstNonCloud;
        return [...prev.slice(0, cutoff), ...result.events, ...prev.slice(cutoff)];
      });
      setRemoteHasMore(result.events.length === REMOTE_PAGE_SIZE);
    } finally {
      setOlderLoading(false);
    }
  }, [user?.id, olderLoading, oldestCloudCursor]);

  const rules = useMemo(() => getComplianceRules(), []);
  const compReports = useMemo(() => getComplianceReports(), []);
  const retention = useMemo(() => getRetentionPolicies(), []);
  const stats = useMemo(() => getAuditTrailStats(), []);
  const [activeTab, setActiveTab] = useState<'events' | 'compliance' | 'retention'>('events');

  const filters = useAuditFilters(events);

  const onExportCsv = useCallback(() => {
    downloadFile(
      exportAuditEventsToCSV(filters.filteredEvents),
      `msi-audit-events-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;',
    );
  }, [filters.filteredEvents]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <ScrollText size={22} className="text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">Audit Trail & Compliance Logging</h1>
              <p className="text-slate-400 text-sm">
                Recorded actions from this session (portfolio, valuations, autonomy) appear first; sample enterprise
                scenarios follow for demos.
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {recordedCount > 0 ? (
                  <>{recordedCount} recorded event{recordedCount === 1 ? '' : 's'} · </>
                ) : (
                  <>No recorded events yet — use the app to generate audit entries · </>
                )}
                {cloudCount > 0 ? (
                  <>{cloudCount} cloud event{cloudCount === 1 ? '' : 's'} for your account · </>
                ) : user?.id ? (
                  <>no cloud events for your account yet · </>
                ) : null}
                refresh to pull the latest from storage
              </p>
            </div>
            <button
              type="button"
              onClick={reloadEvents}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30 transition-colors flex-shrink-0"
            >
              <RefreshCw size={14} aria-hidden />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: ScrollText, color: 'text-violet-400', label: 'Events Today', value: stats.eventsToday.toLocaleString() },
            { icon: Shield, color: 'text-green-400', label: 'Compliance', value: `${stats.complianceScore}%` },
            { icon: AlertTriangle, color: 'text-red-400', label: 'Violations', value: stats.violations },
            { icon: Lock, color: 'text-amber-400', label: 'Security Events', value: stats.securityEvents },
            { icon: Database, color: 'text-blue-400', label: 'Storage', value: stats.storageUsed },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={16} className={s.color} />
                <span className="text-slate-400 text-xs uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-white font-bold text-2xl">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {(['events', 'compliance', 'retention'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {tab === 'events' ? 'Audit Log' : tab === 'compliance' ? 'Compliance Rules' : 'Data Retention'}
            </button>
          ))}
        </div>

        {activeTab === 'events' && (
          <>
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
              countLine={`${filters.filteredEvents.length} of ${events.length} event${events.length === 1 ? '' : 's'}`}
            />

            <div className="space-y-2">
              {filters.filteredEvents.length === 0 && (
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center text-slate-500 text-xs">
                  No events match the current filters.
                </div>
              )}
              {filters.filteredEvents.map((e) => (
                <AuditEventRow key={e.id} event={e} />
              ))}
              {user?.id && remoteHasMore && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={loadOlder}
                    disabled={olderLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {olderLoading ? 'Loading…' : 'Load older cloud events'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'compliance' && (
          <>
            <div className="space-y-3">
              {rules.map((r) => (
                <div
                  key={r.id}
                  className={`bg-slate-900 rounded-xl border p-5 ${
                    r.status === 'violation'
                      ? 'border-red-500/30'
                      : r.status === 'review-needed'
                        ? 'border-amber-500/30'
                        : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-semibold text-sm">{r.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getComplianceStatusColor(r.status)}`}>
                          {r.status.replace('-', ' ')}
                        </span>
                        {r.autoEnforced && <Lock size={10} className="text-green-400" />}
                      </div>
                      <p className="text-slate-400 text-xs mt-1">{r.description}</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>{r.violationCount} violations</p>
                      <p>Checked: {r.lastChecked}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <FileText size={16} className="text-violet-400" />
                Compliance Reports
              </h3>
              <div className="space-y-2">
                {compReports.map((cr) => (
                  <div key={cr.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                    <div>
                      <p className="text-white text-xs font-semibold">{cr.title}</p>
                      <p className="text-slate-500 text-[10px]">
                        {cr.framework} • {cr.period} • {cr.findings} findings ({cr.criticalFindings} critical)
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cr.status === 'accepted'
                          ? 'bg-green-500/10 text-green-400'
                          : cr.status === 'submitted'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-slate-500/10 text-slate-400'
                      }`}
                    >
                      {cr.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'retention' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Database size={16} className="text-violet-400" />
              Data Retention Policies
            </h3>
            <div className="space-y-3">
              {retention.map((r) => (
                <div key={r.category} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4">
                  <div>
                    <span className={`text-xs font-bold capitalize ${getCategoryColor(r.category)}`}>{r.category}</span>
                    <p className="text-slate-500 text-[10px] mt-0.5">
                      {r.totalEvents.toLocaleString()} events • {r.storageSize}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <p className="text-white font-bold">{Math.round(r.retentionDays / 365)}y</p>
                      <p className="text-slate-500 text-[10px]">retention</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400">{r.lastPurge}</p>
                      <p className="text-slate-500 text-[10px]">last purge</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;
