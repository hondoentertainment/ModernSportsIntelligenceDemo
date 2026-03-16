import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  MapPin,
  Clock,
  Eye,
  FileText,
  Fingerprint,
  Layers,
  GitCompare,
  Link2,
  Grid3X3,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  getForensicReports,
  getForensicReport,
  getCounterfeitDatabase,
  compareCards,
  getChainOfCustody,
  getAnomalyHeatMap,
  getAuthenticationHistory,
  getLayerDisplayName,
  getVerdictColor,
  getVerdictBg,
  getSeverityColor,
  getSeverityBg,
  getAuthenticityColor,
  type ForensicReport,
  type ForensicLayer,
  type ForensicLayerName,
  type ForensicComparison,
  type CounterfeitDatabase,
  type CustodyEvent,
  type HeatMapCell,
  type AuthenticationHistoryEntry,
  type AnomalySeverity,
  type ForensicVerdict,
} from '../lib/forensicsLabService';

// ---- Tab Definition ----

type TabId = 'dashboard' | 'deep-scan' | 'counterfeit-db' | 'comparison' | 'custody' | 'anomaly-map';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Analysis Dashboard', icon: <Shield className="w-4 h-4" /> },
  { id: 'deep-scan', label: 'Deep Scan', icon: <Fingerprint className="w-4 h-4" /> },
  { id: 'counterfeit-db', label: 'Counterfeit Database', icon: <FileText className="w-4 h-4" /> },
  { id: 'comparison', label: 'Comparison Tool', icon: <GitCompare className="w-4 h-4" /> },
  { id: 'custody', label: 'Chain of Custody', icon: <Link2 className="w-4 h-4" /> },
  { id: 'anomaly-map', label: 'Anomaly Map', icon: <Grid3X3 className="w-4 h-4" /> },
];

// ---- Authenticity Gauge Component ----

const AuthenticityGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 100 }) => {
  const color = getAuthenticityColor(score);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#334155" strokeWidth="6" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color, fontSize: size * 0.22 }}>{score}</span>
        <span className="text-[10px] text-slate-500" style={{ fontSize: size * 0.09 }}>/ 100</span>
      </div>
    </div>
  );
};

// ---- Verdict Badge Component ----

const VerdictBadge: React.FC<{ verdict: ForensicVerdict }> = ({ verdict }) => {
  const icons: Record<ForensicVerdict, React.ReactNode> = {
    authentic: <CheckCircle className="w-3.5 h-3.5" />,
    suspicious: <AlertTriangle className="w-3.5 h-3.5" />,
    counterfeit: <XCircle className="w-3.5 h-3.5" />,
    inconclusive: <HelpCircle className="w-3.5 h-3.5" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getVerdictBg(verdict)} ${getVerdictColor(verdict)}`}>
      {icons[verdict]}
      {verdict.charAt(0).toUpperCase() + verdict.slice(1)}
    </span>
  );
};

// ---- Severity Badge Component ----

const SeverityBadge: React.FC<{ severity: AnomalySeverity }> = ({ severity }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${getSeverityBg(severity)} ${getSeverityColor(severity)}`}>
    {severity}
  </span>
);

// ---- Status Indicator Component ----

const StatusDot: React.FC<{ status: ForensicReport['status'] }> = ({ status }) => {
  const colors: Record<ForensicReport['status'], string> = {
    analyzing: 'bg-blue-400 animate-pulse',
    complete: 'bg-emerald-400',
    flagged: 'bg-red-400',
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]}`} />;
};

// ---- Analysis Dashboard Tab ----

const AnalysisDashboard: React.FC<{
  reports: ForensicReport[];
  history: AuthenticationHistoryEntry[];
  onSelectReport: (id: string) => void;
}> = ({ reports, history, onSelectReport }) => {
  const stats = useMemo(() => {
    const total = reports.length;
    const authentic = reports.filter((r) => r.verdict === 'authentic').length;
    const suspicious = reports.filter((r) => r.verdict === 'suspicious').length;
    const counterfeit = reports.filter((r) => r.verdict === 'counterfeit').length;
    const inconclusive = reports.filter((r) => r.verdict === 'inconclusive').length;
    const avgAuth = Math.round(reports.reduce((s, r) => s + r.overallAuthenticity, 0) / total);
    return { total, authentic, suspicious, counterfeit, inconclusive, avgAuth };
  }, [reports]);

  const verdictPieData = useMemo(() => [
    { name: 'Authentic', value: stats.authentic, color: '#10b981' },
    { name: 'Suspicious', value: stats.suspicious, color: '#f59e0b' },
    { name: 'Counterfeit', value: stats.counterfeit, color: '#ef4444' },
    { name: 'Inconclusive', value: stats.inconclusive, color: '#64748b' },
  ], [stats]);

  const historyLineData = useMemo(() =>
    history.slice().reverse().map((h) => ({
      date: h.date.slice(5),
      authenticity: h.authenticity,
      card: h.cardName,
    })),
  [history]);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Analyzed', value: stats.total, color: 'text-slate-200' },
          { label: 'Authentic', value: stats.authentic, color: 'text-emerald-400' },
          { label: 'Suspicious', value: stats.suspicious, color: 'text-yellow-400' },
          { label: 'Counterfeit', value: stats.counterfeit, color: 'text-red-400' },
          { label: 'Avg. Score', value: stats.avgAuth, color: 'text-blue-400' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Verdict Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={verdictPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                {verdictPieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
              <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Authentication History</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={historyLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="authenticity" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Forensic Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Status</th>
                <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Card</th>
                <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Player</th>
                <th className="text-center py-2 px-3 text-xs text-slate-500 font-medium">Score</th>
                <th className="text-center py-2 px-3 text-xs text-slate-500 font-medium">Verdict</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Submitted</th>
                <th className="text-center py-2 px-3 text-xs text-slate-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-2.5 px-3"><StatusDot status={r.status} /></td>
                  <td className="py-2.5 px-3 text-slate-300 font-medium max-w-[220px] truncate">{r.cardName}</td>
                  <td className="py-2.5 px-3 text-slate-400">{r.player}</td>
                  <td className="py-2.5 px-3 text-center">
                    <AuthenticityGauge score={r.overallAuthenticity} size={44} />
                  </td>
                  <td className="py-2.5 px-3 text-center"><VerdictBadge verdict={r.verdict} /></td>
                  <td className="py-2.5 px-3 text-right text-slate-500 text-xs">{new Date(r.submittedAt).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button onClick={() => onSelectReport(r.id)} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ---- Deep Scan Tab ----

const DeepScan: React.FC<{ reports: ForensicReport[]; selectedReportId: string | null; onSelectReport: (id: string) => void }> = ({
  reports,
  selectedReportId,
  onSelectReport,
}) => {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const report = useMemo(() => reports.find((r) => r.id === selectedReportId) ?? reports[0], [reports, selectedReportId]);

  const radarData = useMemo(
    () =>
      report.layers.map((l) => ({
        layer: getLayerDisplayName(l.name).replace(' Analysis', '').replace(' Composition', '').replace(' Validation', '').replace(' Verification', '').replace(' Precision', '').replace(' Match', '').replace(' Mapping', ''),
        score: l.score,
        reference: l.referenceMatch,
        fullName: getLayerDisplayName(l.name),
      })),
    [report],
  );

  const layerBarData = useMemo(
    () =>
      report.layers.map((l) => ({
        name: getLayerDisplayName(l.name).split(' ')[0],
        score: l.score,
        fill: l.score >= 80 ? '#10b981' : l.score >= 50 ? '#f59e0b' : '#ef4444',
      })),
    [report],
  );

  const toggleLayer = useCallback((layerId: string) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });
  }, []);

  const totalAnomalies = useMemo(() => report.layers.reduce((sum, l) => sum + l.anomalies.length, 0), [report]);

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <label className="text-xs text-slate-500 block mb-2">Select Card for Deep Scan</label>
        <select
          value={report.id}
          onChange={(e) => onSelectReport(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {reports.map((r) => (
            <option key={r.id} value={r.id}>
              {r.id} — {r.cardName} ({r.verdict})
            </option>
          ))}
        </select>
      </div>

      {/* Report Header */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <AuthenticityGauge score={report.overallAuthenticity} size={90} />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-200">{report.cardName}</h3>
          <p className="text-sm text-slate-400">{report.player} &middot; {report.year} &middot; {report.manufacturer}</p>
          <div className="flex items-center gap-3 mt-2">
            <VerdictBadge verdict={report.verdict} />
            <span className="text-xs text-slate-500">Confidence: <span className="text-slate-300 font-medium">{report.confidenceLevel}</span></span>
            <span className="text-xs text-slate-500">Anomalies: <span className={totalAnomalies > 0 ? 'text-red-400 font-medium' : 'text-slate-300'}>{totalAnomalies}</span></span>
          </div>
          {report.knownCounterfeitMatch && (
            <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-xs text-red-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Known Counterfeit Match — {report.knownCounterfeitMatch.similarity}% similarity
              </p>
              <p className="text-xs text-red-300/70 mt-1">Source: {report.knownCounterfeitMatch.source} &middot; ID: {report.knownCounterfeitMatch.knownCounterfeitId}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {report.knownCounterfeitMatch.matchedFeatures.map((f) => (
                  <span key={f} className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Radar Chart and Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">10-Layer Forensic Radar</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="layer" tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
              <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
              <Radar name="Reference" dataKey="reference" stroke="#10b981" fill="none" strokeWidth={1} strokeDasharray="4 4" />
              <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Layer Scores</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={layerBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {layerBarData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Layer-by-Layer Drill-Down */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Layer-by-Layer Forensic Breakdown</h3>
        <div className="space-y-2">
          {report.layers.map((layer) => {
            const isExpanded = expandedLayers.has(layer.id);
            const barColor = layer.score >= 80 ? 'bg-emerald-500' : layer.score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
            return (
              <div key={layer.id} className="border border-slate-700/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleLayer(layer.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/30 transition-colors text-left"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-slate-300 font-medium flex-1">{getLayerDisplayName(layer.name)}</span>
                  {layer.anomalies.length > 0 && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-semibold">
                      {layer.anomalies.length} anomal{layer.anomalies.length === 1 ? 'y' : 'ies'}
                    </span>
                  )}
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${layer.score}%` }} />
                  </div>
                  <span className="text-xs font-mono text-slate-400 w-10 text-right">{layer.score}</span>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-700/50 pt-3 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">Findings</p>
                      <ul className="space-y-1">
                        {layer.findings.map((f, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                            <span className="text-slate-600 mt-0.5">&#8226;</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {layer.anomalies.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">Anomalies Detected</p>
                        <div className="space-y-2">
                          {layer.anomalies.map((a, i) => (
                            <div key={i} className={`rounded-lg p-2.5 border ${getSeverityBg(a.severity)}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <SeverityBadge severity={a.severity} />
                                <span className="text-xs text-slate-300 font-medium">{a.type}</span>
                                <span className="text-[10px] text-slate-500 ml-auto">Confidence: {Math.round(a.confidence * 100)}%</span>
                              </div>
                              <p className="text-xs text-slate-400">{a.description}</p>
                              <p className="text-[10px] text-slate-600 mt-1">
                                Location: {typeof a.location === 'string' ? a.location : `Row ${a.location.row}, Col ${a.location.col}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-slate-500">
                      Reference Match: <span className="text-slate-400 font-medium">{layer.referenceMatch}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Counterfeit Database Tab ----

const CounterfeitDb: React.FC<{ database: CounterfeitDatabase }> = ({ database }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = useMemo(
    () =>
      database.recentAdditions.filter(
        (e) =>
          e.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.player.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.originRegion.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [database, searchTerm],
  );

  const topCounterfeitBar = useMemo(
    () =>
      database.topCounterfeitedCards.slice(0, 8).map((c) => ({
        name: c.player.split(' ').pop(),
        count: c.count,
        full: c.player,
      })),
    [database],
  );

  const hotspotData = useMemo(
    () =>
      database.hotspotRegions.map((h) => ({
        name: h.region.split(',')[0],
        count: h.count,
        full: h.region,
        trend: h.trend,
      })),
    [database],
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Known Counterfeits</p>
          <p className="text-2xl font-bold text-red-400">{database.totalEntries.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Recent Additions</p>
          <p className="text-2xl font-bold text-yellow-400">{database.recentAdditions.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Top Counterfeited Player</p>
          <p className="text-lg font-bold text-slate-200">{database.topCounterfeitedCards[0]?.player}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Hotspot Regions</p>
          <p className="text-2xl font-bold text-orange-400">{database.hotspotRegions.length}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Most Counterfeited Players</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topCounterfeitBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                labelFormatter={(_, payload) => payload[0]?.payload?.full || ''}
              />
              <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Counterfeit Origin Hotspots</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hotspotData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }}
                labelFormatter={(_, payload) => payload[0]?.payload?.full || ''}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Searchable Catalog */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Known Counterfeit Catalog</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search counterfeits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
        </div>
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="border border-slate-700/50 rounded-lg p-3 hover:bg-slate-700/20 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-slate-300 font-medium">{entry.cardName}</p>
                  <p className="text-xs text-slate-500">{entry.player} &middot; {entry.year} &middot; {entry.manufacturer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={entry.severity} />
                  <span className="text-[10px] text-slate-500">{entry.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-2">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {entry.originRegion}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {entry.detectedDate}</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {entry.reportCount} reports</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {entry.telltaleFeatures.map((f) => (
                  <span key={f} className="text-[10px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">{f}</span>
                ))}
              </div>
            </div>
          ))}
          {filteredEntries.length === 0 && (
            <p className="text-sm text-slate-600 text-center py-8">No counterfeits match your search.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ---- Comparison Tool Tab ----

const ComparisonTool: React.FC<{ reports: ForensicReport[] }> = ({ reports }) => {
  const [card1Id, setCard1Id] = useState(reports[0]?.id ?? '');
  const [card2Id, setCard2Id] = useState(reports[2]?.id ?? '');

  const comparison = useMemo<ForensicComparison | null>(() => compareCards(card1Id, card2Id), [card1Id, card2Id]);

  const comparisonRadar = useMemo(() => {
    if (!comparison) return [];
    return comparison.layerComparisons.map((lc) => ({
      layer: getLayerDisplayName(lc.layerName).split(' ')[0],
      card1: lc.card1Score,
      card2: lc.card2Score,
    }));
  }, [comparison]);

  const card1 = useMemo(() => reports.find((r) => r.id === card1Id), [reports, card1Id]);
  const card2 = useMemo(() => reports.find((r) => r.id === card2Id), [reports, card2Id]);

  return (
    <div className="space-y-6">
      {/* Card Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <label className="text-xs text-slate-500 block mb-2">Card 1</label>
          <select
            value={card1Id}
            onChange={(e) => setCard1Id(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {reports.map((r) => (
              <option key={r.id} value={r.id}>{r.id} — {r.player} ({r.verdict})</option>
            ))}
          </select>
          {card1 && (
            <div className="mt-3 flex items-center gap-3">
              <AuthenticityGauge score={card1.overallAuthenticity} size={56} />
              <div>
                <p className="text-xs text-slate-300 font-medium">{card1.cardName}</p>
                <VerdictBadge verdict={card1.verdict} />
              </div>
            </div>
          )}
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <label className="text-xs text-slate-500 block mb-2">Card 2</label>
          <select
            value={card2Id}
            onChange={(e) => setCard2Id(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {reports.map((r) => (
              <option key={r.id} value={r.id}>{r.id} — {r.player} ({r.verdict})</option>
            ))}
          </select>
          {card2 && (
            <div className="mt-3 flex items-center gap-3">
              <AuthenticityGauge score={card2.overallAuthenticity} size={56} />
              <div>
                <p className="text-xs text-slate-300 font-medium">{card2.cardName}</p>
                <VerdictBadge verdict={card2.verdict} />
              </div>
            </div>
          )}
        </div>
      </div>

      {comparison && (
        <>
          {/* Overall Similarity */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 text-center">
            <p className="text-xs text-slate-500 mb-1">Overall Forensic Similarity</p>
            <p className="text-4xl font-bold" style={{ color: comparison.overallSimilarity > 70 ? '#10b981' : comparison.overallSimilarity > 40 ? '#f59e0b' : '#ef4444' }}>
              {comparison.overallSimilarity}%
            </p>
            {comparison.suspiciousLayers.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-red-400 font-medium mb-1">Suspicious Layer Divergences:</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {comparison.suspiciousLayers.map((ln) => (
                    <span key={ln} className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">{getLayerDisplayName(ln)}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Radar Overlay */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Forensic Overlay</h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={comparisonRadar}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="layer" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                  <Radar name="Card 1" dataKey="card1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Card 2" dataKey="card2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
                  <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Layer-by-Layer Comparison</h3>
              <div className="space-y-2">
                {comparison.layerComparisons.map((lc) => (
                  <div key={lc.layerName} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${lc.suspicious ? 'bg-red-500/10 border border-red-500/20' : 'bg-slate-700/20'}`}>
                    <span className="text-xs text-slate-400 w-28 truncate">{getLayerDisplayName(lc.layerName).split(' ')[0]}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-mono w-8 text-right" style={{ color: getAuthenticityColor(lc.card1Score) }}>{lc.card1Score}</span>
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden relative">
                        <div className="absolute left-0 top-0 h-full bg-indigo-500 rounded-full" style={{ width: `${lc.card1Score}%` }} />
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden relative">
                        <div className="absolute left-0 top-0 h-full bg-amber-500 rounded-full" style={{ width: `${lc.card2Score}%` }} />
                      </div>
                      <span className="text-xs font-mono w-8" style={{ color: getAuthenticityColor(lc.card2Score) }}>{lc.card2Score}</span>
                    </div>
                    <span className={`text-[10px] font-mono w-10 text-right ${lc.suspicious ? 'text-red-400' : 'text-slate-500'}`}>
                      {lc.delta > 0 ? `+${lc.delta}` : lc.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ---- Chain of Custody Tab ----

const ChainOfCustodyTab: React.FC<{ reports: ForensicReport[]; selectedReportId: string | null; onSelectReport: (id: string) => void }> = ({
  reports,
  selectedReportId,
  onSelectReport,
}) => {
  const report = useMemo(() => reports.find((r) => r.id === selectedReportId) ?? reports[0], [reports, selectedReportId]);
  const custody = useMemo(() => getChainOfCustody(report.id), [report]);

  const custodyTimeline = useMemo(() => {
    const months: Record<string, number> = {};
    for (const evt of custody) {
      const month = evt.date.slice(0, 7);
      months[month] = (months[month] || 0) + 1;
    }
    return Object.entries(months).map(([month, count]) => ({ month, events: count }));
  }, [custody]);

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <label className="text-xs text-slate-500 block mb-2">Select Card</label>
        <select
          value={report.id}
          onChange={(e) => onSelectReport(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {reports.map((r) => (
            <option key={r.id} value={r.id}>{r.id} — {r.cardName}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provenance Summary */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Provenance Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Total Events</span>
              <span className="text-slate-300 font-medium">{custody.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Verified Events</span>
              <span className="text-emerald-400 font-medium">{custody.filter((c) => c.verified).length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Unverified Events</span>
              <span className="text-yellow-400 font-medium">{custody.filter((c) => !c.verified).length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">First Record</span>
              <span className="text-slate-300 font-medium">{custody[0]?.date ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Latest Record</span>
              <span className="text-slate-300 font-medium">{custody[custody.length - 1]?.date ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Unique Parties</span>
              <span className="text-slate-300 font-medium">{new Set(custody.map((c) => c.party)).size}</span>
            </div>
          </div>
          {custodyTimeline.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs text-slate-500 mb-2">Event Timeline</h4>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={custodyTimeline}>
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                  <Line type="monotone" dataKey="events" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Vertical Timeline */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Chain of Custody Timeline</h3>
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-700" />
            <div className="space-y-6">
              {custody.map((evt, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  {/* Dot */}
                  <div className={`absolute left-[-17px] top-1 w-3 h-3 rounded-full border-2 ${
                    evt.verified ? 'bg-emerald-500 border-emerald-400' : 'bg-yellow-500 border-yellow-400'
                  }`} />
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-500">{evt.date}</span>
                      {evt.verified ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-semibold">
                          <CheckCircle className="w-2.5 h-2.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full font-semibold">
                          <AlertTriangle className="w-2.5 h-2.5" /> Unverified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300">{evt.event}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" /> {evt.party}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {evt.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Anomaly Map Tab ----

const AnomalyMap: React.FC<{ reports: ForensicReport[]; selectedReportId: string | null; onSelectReport: (id: string) => void }> = ({
  reports,
  selectedReportId,
  onSelectReport,
}) => {
  const report = useMemo(() => reports.find((r) => r.id === selectedReportId) ?? reports[0], [reports, selectedReportId]);
  const heatMap = useMemo(() => getAnomalyHeatMap(report.id), [report]);
  const [hoveredCell, setHoveredCell] = useState<HeatMapCell | null>(null);

  const allAnomalies = useMemo(
    () =>
      report.layers.flatMap((l) =>
        l.anomalies.map((a) => ({
          ...a,
          layerName: getLayerDisplayName(l.name),
        })),
      ),
    [report],
  );

  const severityCounts = useMemo(() => {
    const counts = { info: 0, warning: 0, critical: 0 };
    for (const a of allAnomalies) counts[a.severity]++;
    return counts;
  }, [allAnomalies]);

  const severityPieData = useMemo(
    () => [
      { name: 'Info', value: severityCounts.info, color: '#3b82f6' },
      { name: 'Warning', value: severityCounts.warning, color: '#f59e0b' },
      { name: 'Critical', value: severityCounts.critical, color: '#ef4444' },
    ].filter((d) => d.value > 0),
    [severityCounts],
  );

  const cellColor = useCallback((severity: AnomalySeverity | null) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/60 border-red-500/80';
      case 'warning': return 'bg-yellow-500/40 border-yellow-500/60';
      case 'info': return 'bg-blue-500/30 border-blue-500/50';
      default: return 'bg-slate-800/30 border-slate-700/30';
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <label className="text-xs text-slate-500 block mb-2">Select Card for Anomaly Map</label>
        <select
          value={report.id}
          onChange={(e) => onSelectReport(e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {reports.map((r) => (
            <option key={r.id} value={r.id}>
              {r.id} — {r.cardName} ({allAnomalies.length} anomalies)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heat Map Grid */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Card Surface Anomaly Heat Map</h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500/50" /> Info</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-500/50" /> Warning</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500/60" /> Critical</span>
            </div>
          </div>
          <div className="flex justify-center">
            <div
              className="grid gap-0.5 rounded-lg overflow-hidden border border-slate-700/50 p-1"
              style={{ gridTemplateColumns: 'repeat(10, 1fr)', width: 'fit-content' }}
            >
              {heatMap.map((cell, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-sm border cursor-pointer transition-all hover:scale-110 ${cellColor(cell.severity)}`}
                  onMouseEnter={() => cell.severity && setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  title={cell.label || `Row ${cell.row}, Col ${cell.col} — Clear`}
                />
              ))}
            </div>
          </div>
          {/* Tooltip */}
          {hoveredCell && hoveredCell.severity && (
            <div className={`mt-4 rounded-lg p-3 border ${getSeverityBg(hoveredCell.severity)}`}>
              <div className="flex items-center gap-2 mb-1">
                <SeverityBadge severity={hoveredCell.severity} />
                <span className="text-xs text-slate-400">Row {hoveredCell.row}, Col {hoveredCell.col}</span>
              </div>
              <p className="text-xs text-slate-300">{hoveredCell.label}</p>
            </div>
          )}
          {!hoveredCell && allAnomalies.length === 0 && (
            <div className="mt-4 text-center text-xs text-slate-600 py-4">
              No anomalies detected on card surface. All grid cells are clear.
            </div>
          )}
          {!hoveredCell && allAnomalies.length > 0 && (
            <div className="mt-4 text-center text-xs text-slate-500">
              Hover over highlighted cells to see anomaly details.
            </div>
          )}
        </div>

        {/* Anomaly Summary */}
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Anomaly Summary</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-lg font-bold text-blue-400">{severityCounts.info}</p>
                <p className="text-[10px] text-blue-300/60">Info</p>
              </div>
              <div className="text-center p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-lg font-bold text-yellow-400">{severityCounts.warning}</p>
                <p className="text-[10px] text-yellow-300/60">Warning</p>
              </div>
              <div className="text-center p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-lg font-bold text-red-400">{severityCounts.critical}</p>
                <p className="text-[10px] text-red-300/60">Critical</p>
              </div>
            </div>
            {severityPieData.length > 0 && (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={severityPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4} dataKey="value">
                    {severityPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                  <Legend formatter={(value) => <span className="text-[10px] text-slate-400">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Anomaly List */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">All Anomalies</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {allAnomalies.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4">No anomalies detected.</p>
              ) : (
                allAnomalies.map((a, i) => (
                  <div key={i} className={`rounded-lg p-2.5 border ${getSeverityBg(a.severity)}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <SeverityBadge severity={a.severity} />
                      <span className="text-[10px] text-slate-500">{a.layerName}</span>
                    </div>
                    <p className="text-xs text-slate-400">{a.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Main Page Component ----

const ForensicsLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ForensicReport[]>([]);
  const [database, setDatabase] = useState<CounterfeitDatabase | null>(null);
  const [history, setHistory] = useState<AuthenticationHistoryEntry[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReports(getForensicReports());
      setDatabase(getCounterfeitDatabase());
      setHistory(getAuthenticationHistory());
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSelectReport = useCallback((id: string) => {
    setSelectedReportId(id);
    setActiveTab('deep-scan');
  }, []);

  const handleSelectReportForTab = useCallback((id: string) => {
    setSelectedReportId(id);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Initializing Forensic Analysis Engine...</p>
          <p className="text-slate-600 text-xs mt-1">Loading counterfeit databases and reference libraries</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Authentication Forensics Lab</h1>
              <p className="text-xs text-slate-500">Multi-layer forensic analysis for card authentication and counterfeit detection</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400 bg-slate-800/50'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <AnalysisDashboard reports={reports} history={history} onSelectReport={handleSelectReport} />
        )}
        {activeTab === 'deep-scan' && (
          <DeepScan reports={reports} selectedReportId={selectedReportId} onSelectReport={handleSelectReportForTab} />
        )}
        {activeTab === 'counterfeit-db' && database && <CounterfeitDb database={database} />}
        {activeTab === 'comparison' && <ComparisonTool reports={reports} />}
        {activeTab === 'custody' && (
          <ChainOfCustodyTab reports={reports} selectedReportId={selectedReportId} onSelectReport={handleSelectReportForTab} />
        )}
        {activeTab === 'anomaly-map' && (
          <AnomalyMap reports={reports} selectedReportId={selectedReportId} onSelectReport={handleSelectReportForTab} />
        )}
      </div>
    </div>
  );
};

export default ForensicsLab;
