import React, { useState, useMemo } from 'react';
import {
  X,
  ScanLine,
  AlertTriangle,
  Database,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Fingerprint,
  Search,
  Eye,
  Hash,
} from 'lucide-react';
import {
  getAnalyses,
  getDatabaseEntries,
} from '../lib/analytics/slabCaseForensicsService';

interface SlabCaseForensicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'scans' | 'alerts' | 'database';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'scans', label: 'Scans', icon: <ScanLine size={16} /> },
  { id: 'alerts', label: 'Alerts', icon: <AlertTriangle size={16} /> },
  { id: 'database', label: 'Database', icon: <Database size={16} /> },
];

const getScanColor = (result: string) => {
  if (result === 'authentic') return { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
  if (result === 'suspect') return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' };
  return { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
};

const getScanIcon = (result: string) => {
  if (result === 'authentic') return <ShieldCheck size={16} />;
  if (result === 'suspect') return <ShieldAlert size={16} />;
  return <ShieldX size={16} />;
};

const SlabCaseForensicsModal: React.FC<SlabCaseForensicsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('scans');

  const scans = useMemo(() => getAnalyses(), []);
  const dbEntries = useMemo(() => getDatabaseEntries(), []);
  const alerts: any[] = [];
  const stats = {
    totalScans: scans.length,
    authentic: scans.filter((s) => s.scanResult === 'authentic').length,
    suspect: scans.filter((s) => s.scanResult === 'suspect').length,
    counterfeit: scans.filter((s) => s.scanResult === 'counterfeit').length,
  };

  if (!isOpen) return null;

  const renderScans = () => (
    <div className="space-y-4">
      {scans.map((scan: any) => {
        const sev = getScanColor(scan.scanResult || scan.result || 'authentic');
        return (
          <div key={scan.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${sev.bg}`}>
                  <span className={sev.text}>{getScanIcon(scan.scanResult || scan.result)}</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{scan.cardName || scan.card}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <Hash size={12} />
                    <span>Cert: {scan.certNumber || scan.cert}</span>
                    <span className="text-slate-600">|</span>
                    <span>{scan.company || scan.grader} &mdash; {scan.grade}</span>
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${sev.bg} ${sev.text}`}>
                {scan.scanResult || scan.result || 'unknown'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Confidence</p>
                <p className="text-sm font-bold text-lime-400">{scan.confidence}%</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Font Match</p>
                <p className="text-sm font-bold text-slate-200">{scan.fontMatch}%</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Hologram</p>
                <p className={`text-sm font-bold ${scan.hologramValid ? 'text-green-400' : 'text-red-400'}`}>
                  {scan.hologramValid ? 'Valid' : 'Failed'}
                </p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Edge Score</p>
                <p className="text-sm font-bold text-slate-200">{scan.edgeConsistency}%</p>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (scan.confidence ?? 0) >= 90 ? 'bg-green-500' : (scan.confidence ?? 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${scan.confidence ?? 0}%` }}
              />
            </div>
            {scan.notes && <p className="text-xs text-slate-400 mt-2 italic">{scan.notes}</p>}
          </div>
        );
      })}
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      {alerts.map((alert: any, idx: number) => {
        const isHigh = (alert.severity || 'warning') === 'critical';
        const bgClass = isHigh ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30';
        const textClass = isHigh ? 'text-red-400' : 'text-amber-400';
        return (
          <div key={alert.id || idx} className={`rounded-xl p-5 border ${bgClass}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <ShieldAlert size={18} className={textClass} />
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{alert.title || alert.message}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{alert.date || alert.triggeredAt}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${textClass}`}>
                {alert.severity || 'warning'}
              </span>
            </div>
            <p className="text-sm text-slate-300 mb-3">{alert.description || alert.details}</p>
            {alert.recommendation && (
              <div className="bg-slate-900/50 rounded-lg p-3 flex items-start gap-2">
                <Eye size={14} className="text-lime-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-300">{alert.recommendation}</p>
              </div>
            )}
          </div>
        );
      })}
      {alerts.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <ShieldCheck size={32} className="mx-auto mb-3 text-green-400" />
          <p className="text-sm">No active forensic alerts</p>
        </div>
      )}
    </div>
  );

  const renderDatabase = () => (
    <div className="space-y-4">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search cert number or card name..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
            readOnly
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs text-slate-400 pb-2 font-medium">Cert #</th>
                <th className="text-left text-xs text-slate-400 pb-2 font-medium">Card</th>
                <th className="text-left text-xs text-slate-400 pb-2 font-medium">Company</th>
                <th className="text-left text-xs text-slate-400 pb-2 font-medium">Grade</th>
                <th className="text-right text-xs text-slate-400 pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {dbEntries.map((entry: any, idx: number) => {
                const status = entry.status || 'unknown';
                const statusColor =
                  status === 'verified' || status === 'authentic'
                    ? 'text-green-400 bg-green-500/20'
                    : status === 'flagged' || status === 'suspect'
                    ? 'text-amber-400 bg-amber-500/20'
                    : 'text-red-400 bg-red-500/20';
                return (
                  <tr key={idx} className="border-b border-slate-700/30">
                    <td className="py-3 text-lime-400 font-mono text-xs">{entry.certNumber || entry.cert}</td>
                    <td className="py-3 text-slate-200 text-xs">{entry.cardName || entry.card}</td>
                    <td className="py-3 text-slate-400 text-xs">{entry.company || entry.grader}</td>
                    <td className="py-3 text-slate-400 text-xs">{entry.grade}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <Fingerprint size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Slab Case Forensics</h2>
              <p className="text-sm text-slate-400">Authenticate graded card slabs and detect counterfeits</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Total Scans</p>
            <p className="text-xl font-bold text-slate-100">{stats?.totalScans ?? scans.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Authentic</p>
            <p className="text-xl font-bold text-green-400">{stats?.authentic ?? scans.filter((s: any) => s.scanResult === 'authentic').length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Suspect</p>
            <p className="text-xl font-bold text-amber-400">{stats?.suspect ?? scans.filter((s: any) => s.scanResult === 'suspect').length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Counterfeit</p>
            <p className="text-xl font-bold text-red-400">{stats?.counterfeit ?? scans.filter((s: any) => s.scanResult === 'counterfeit').length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 border-b border-slate-700/50">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-lime-500/20 text-lime-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'scans' && renderScans()}
          {activeTab === 'alerts' && renderAlerts()}
          {activeTab === 'database' && renderDatabase()}
        </div>
      </div>
    </div>
  );
};

export default SlabCaseForensicsModal;
