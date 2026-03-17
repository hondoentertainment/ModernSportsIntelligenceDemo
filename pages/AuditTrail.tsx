import React, { useState, useMemo } from 'react';
import {
  ScrollText, Shield, AlertTriangle, CheckCircle, XCircle,
  Clock, Eye, Lock, BarChart3, FileText, Database, Zap,
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
} from '../lib/auditTrailService';

const AuditTrail: React.FC = () => {
  const events = useMemo(() => getAuditEvents(), []);
  const rules = useMemo(() => getComplianceRules(), []);
  const compReports = useMemo(() => getComplianceReports(), []);
  const retention = useMemo(() => getRetentionPolicies(), []);
  const stats = useMemo(() => getAuditTrailStats(), []);
  const [activeTab, setActiveTab] = useState<'events' | 'compliance' | 'retention'>('events');

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <ScrollText size={22} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Audit Trail & Compliance Logging</h1>
              <p className="text-slate-400 text-sm">
                Immutable audit trail with compliance dashboards, regulatory reporting, and data retention policies
              </p>
            </div>
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
          <div className="space-y-2">
            {events.map(e => (
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getSeverityColor(e.severity)}`}>{e.severity}</span>
                        <span className={`text-xs font-semibold ${getCategoryColor(e.category)}`}>{e.category}</span>
                        <code className="text-slate-400 text-[10px] font-mono">{e.action}</code>
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

export default AuditTrail;
