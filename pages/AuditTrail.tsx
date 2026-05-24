import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ScrollText, Shield, AlertTriangle, CheckCircle, XCircle,
  Lock, FileText, Database, RefreshCw, Download, Search, X,
} from 'lucide-react';
import {
  getAuditEvents,
  getComplianceRules,
  getComplianceReports,
  getRetentionPolicies,
  getAuditTrailStats,
  getSeverityColor,
  getCategoryColor,
  getComplianceStatusColor,
  filterAuditEvents,
  exportAuditEventsToCSV,
  getOldestCreatedAt,
  type AuditCategory,
  type AuditSeverity,
  type AuditEvent,
} from '../lib/utils/auditTrailService';
import { fetchCloudAuditEvents } from '../lib/utils/auditLog';
import { useAuth } from '../contexts/AuthContext';

const ALL_CATEGORIES: AuditCategory[] = ['portfolio', 'trading', 'auth', 'admin', 'finance', 'api', 'compliance', 'data'];
const ALL_SEVERITIES: AuditSeverity[] = ['info', 'warning', 'critical', 'security'];
const ALL_SOURCES: NonNullable<AuditEvent['source']>[] = ['recorded', 'cloud', 'sample'];

const CLOUD_PAGE_SIZE = 200;

const AuditTrail: React.FC = () => {
  const { user } = useAuth();
  const [eventsRefresh, setEventsRefresh] = useState(0);
  const [cloudRows, setCloudRows] = useState<unknown[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudOlderLoading, setCloudOlderLoading] = useState(false);
  const [cloudHasMore, setCloudHasMore] = useState(false);

  const reloadEvents = useCallback(() => setEventsRefresh((n) => n + 1), []);

  // Load the signed-in user's audit_events from Supabase. Failures are swallowed
  // by `fetchCloudAuditEvents` (returns []), so the local trail always renders.
  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setCloudRows([]);
      setCloudHasMore(false);
      return;
    }
    setCloudLoading(true);
    fetchCloudAuditEvents(user.id, { limit: CLOUD_PAGE_SIZE })
      .then((rows) => {
        if (cancelled) return;
        setCloudRows(rows);
        setCloudHasMore(rows.length === CLOUD_PAGE_SIZE);
      })
      .finally(() => {
        if (!cancelled) setCloudLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id, eventsRefresh]);

  // Earliest `created_at` we've loaded — used as the cursor for "load older".
  const oldestCloudTimestamp = useMemo(() => getOldestCreatedAt(cloudRows), [cloudRows]);

  const loadOlderCloudEvents = useCallback(async () => {
    if (!user?.id || !oldestCloudTimestamp || cloudOlderLoading) return;
    setCloudOlderLoading(true);
    try {
      const older = await fetchCloudAuditEvents(user.id, {
        limit: CLOUD_PAGE_SIZE,
        before: oldestCloudTimestamp,
      });
      if (older.length === 0) {
        setCloudHasMore(false);
        return;
      }
      setCloudRows((prev) => [...prev, ...older]);
      setCloudHasMore(older.length === CLOUD_PAGE_SIZE);
    } finally {
      setCloudOlderLoading(false);
    }
  }, [user?.id, oldestCloudTimestamp, cloudOlderLoading]);

  const events = useMemo(() => getAuditEvents(cloudRows), [eventsRefresh, cloudRows]);
  const recordedCount = useMemo(() => events.filter((e) => e.source === 'recorded').length, [events]);
  const cloudCount = useMemo(() => events.filter((e) => e.source === 'cloud').length, [events]);
  const rules = useMemo(() => getComplianceRules(), []);
  const compReports = useMemo(() => getComplianceReports(), []);
  const retention = useMemo(() => getRetentionPolicies(), []);
  const stats = useMemo(() => getAuditTrailStats(), []);
  const [activeTab, setActiveTab] = useState<'events' | 'compliance' | 'retention'>('events');

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<Set<AuditCategory>>(new Set());
  const [sevFilter, setSevFilter] = useState<Set<AuditSeverity>>(new Set());
  const [srcFilter, setSrcFilter] = useState<Set<NonNullable<AuditEvent['source']>>>(new Set());

  const filteredEvents = useMemo(
    () => filterAuditEvents(events, {
      search,
      categories: Array.from(catFilter),
      severities: Array.from(sevFilter),
      sources: Array.from(srcFilter),
    }),
    [events, search, catFilter, sevFilter, srcFilter]
  );

  const toggleSetItem = <T,>(set: Set<T>, setter: (s: Set<T>) => void, item: T) => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item); else next.add(item);
    setter(next);
  };

  const clearFilters = useCallback(() => {
    setSearch('');
    setCatFilter(new Set());
    setSevFilter(new Set());
    setSrcFilter(new Set());
  }, []);

  const hasActiveFilters = search.length > 0 || catFilter.size > 0 || sevFilter.size > 0 || srcFilter.size > 0;

  const downloadCsv = useCallback(() => {
    const csv = exportAuditEventsToCSV(filteredEvents);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `msi-audit-events-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredEvents]);

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
                {cloudLoading ? (
                  <>loading cloud events… · </>
                ) : cloudCount > 0 ? (
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
          {(['events', 'compliance', 'retention'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}>{tab === 'events' ? 'Audit Log' : tab === 'compliance' ? 'Compliance Rules' : 'Data Retention'}</button>
          ))}
        </div>

        {activeTab === 'events' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search action, resource, actor, details…"
                  aria-label="Search audit events"
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60"
                />
              </div>
              <button
                type="button"
                onClick={downloadCsv}
                disabled={filteredEvents.length === 0}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={14} aria-hidden />
                Export CSV
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
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
              selected={catFilter}
              onToggle={(item) => toggleSetItem(catFilter, setCatFilter, item)}
            />
            <FilterChipGroup
              label="Severity"
              items={ALL_SEVERITIES}
              selected={sevFilter}
              onToggle={(item) => toggleSetItem(sevFilter, setSevFilter, item)}
            />
            <FilterChipGroup
              label="Source"
              items={ALL_SOURCES}
              selected={srcFilter}
              onToggle={(item) => toggleSetItem(srcFilter, setSrcFilter, item)}
            />

            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              {filteredEvents.length} of {events.length} event{events.length === 1 ? '' : 's'}
            </p>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-2">
            {filteredEvents.length === 0 && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center text-slate-500 text-xs">
                No events match the current filters.
              </div>
            )}
            {filteredEvents.map(e => (
              <div key={e.id} className={`bg-slate-900 rounded-xl border p-4 ${
                e.severity === 'security' || e.severity === 'critical' ? 'border-red-500/30' :
                e.severity === 'warning' ? 'border-amber-500/30' : 'border-slate-800'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {e.result === 'success' ? <CheckCircle size={16} className="text-green-400 mt-0.5" /> :
                     e.result === 'blocked' ? <XCircle size={16} className="text-red-400 mt-0.5" /> :
                     <AlertTriangle size={16} className="text-amber-400 mt-0.5" />}
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSeverityColor(e.severity)}`}>{e.severity}</span>
                        <span className={`text-xs font-semibold ${getCategoryColor(e.category)}`}>{e.category}</span>
                        <code className="text-slate-400 text-[10px] font-mono">{e.action}</code>
                        {e.source === 'recorded' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                            Recorded
                          </span>
                        )}
                        {e.source === 'cloud' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30">
                            Cloud
                          </span>
                        )}
                        {e.source === 'sample' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 bg-slate-500/10 border border-slate-600">
                            Sample
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-xs">{e.details}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span>@{e.actor}</span>
                        <span>{e.resource}</span>
                        <span className="font-mono">{e.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      e.result === 'success' ? 'bg-green-500/10 text-green-400' :
                      e.result === 'blocked' ? 'bg-red-500/10 text-red-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>{e.result}</span>
                    <p className="text-slate-500 mt-1">{e.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
            {user?.id && cloudHasMore && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={loadOlderCloudEvents}
                  disabled={cloudOlderLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {cloudOlderLoading ? 'Loading…' : 'Load older cloud events'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'compliance' && (
          <>
            <div className="space-y-3">
              {rules.map(r => (
                <div key={r.id} className={`bg-slate-900 rounded-xl border p-5 ${
                  r.status === 'violation' ? 'border-red-500/30' : r.status === 'review-needed' ? 'border-amber-500/30' : 'border-slate-800'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-semibold text-sm">{r.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getComplianceStatusColor(r.status)}`}>{r.status.replace('-', ' ')}</span>
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
                <FileText size={16} className="text-violet-400" />Compliance Reports
              </h3>
              <div className="space-y-2">
                {compReports.map(cr => (
                  <div key={cr.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                    <div>
                      <p className="text-white text-xs font-semibold">{cr.title}</p>
                      <p className="text-slate-500 text-[10px]">{cr.framework} • {cr.period} • {cr.findings} findings ({cr.criticalFindings} critical)</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cr.status === 'accepted' ? 'bg-green-500/10 text-green-400' :
                      cr.status === 'submitted' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>{cr.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'retention' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Database size={16} className="text-violet-400" />Data Retention Policies
            </h3>
            <div className="space-y-3">
              {retention.map(r => (
                <div key={r.category} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4">
                  <div>
                    <span className={`text-xs font-bold capitalize ${getCategoryColor(r.category)}`}>{r.category}</span>
                    <p className="text-slate-500 text-[10px] mt-0.5">{r.totalEvents.toLocaleString()} events • {r.storageSize}</p>
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

export default AuditTrail;
