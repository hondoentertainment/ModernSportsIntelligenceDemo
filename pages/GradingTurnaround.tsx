import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Minus,
  Send,
  Package,
  CheckCircle2,
  Loader2,
  Calculator,
  List,
  PlusCircle,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  getTurnaroundReports,
  addReport,
  getTurnaroundAverages,
  getETAPrediction,
  getTurnaroundStats,
  getCompanyComparison,
  getTierComparison,
  getHistoricalTrend,
  getMySubmissions,
  formatDays,
  getCompanyColor,
  getTierLabel,
  getStatusColor,
  getTrendIcon,
  getTrendColor,
  GradingCompany,
  TurnaroundTier,
  TurnaroundReport,
  TurnaroundAverage,
  ETAPrediction,
  TurnaroundStats,
  SubmissionStatus,
} from '../lib/core/gradingTurnaroundService';

type TabId = 'overview' | 'comparison' | 'submissions' | 'report';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'comparison', label: 'Company Comparison', icon: <Activity className="w-4 h-4" /> },
  { id: 'submissions', label: 'My Submissions', icon: <List className="w-4 h-4" /> },
  { id: 'report', label: 'Report', icon: <PlusCircle className="w-4 h-4" /> },
];

const COMPANIES: GradingCompany[] = ['PSA', 'BGS', 'SGC', 'CGC'];
const TIERS: TurnaroundTier[] = ['value', 'regular', 'express', 'super_express', 'walk_through'];
const STATUSES: SubmissionStatus[] = ['in_transit', 'received', 'in_progress', 'completed'];

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const color = getStatusColor(status);
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {label}
    </span>
  );
}

function TrendBadge({ trend }: { trend: 'faster' | 'slower' | 'stable' }) {
  const icon = getTrendIcon(trend);
  const color = getTrendColor(trend);
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color }}>
      {trend === 'faster' && <TrendingDown className="w-3 h-3" />}
      {trend === 'slower' && <TrendingUp className="w-3 h-3" />}
      {trend === 'stable' && <Minus className="w-3 h-3" />}
      {icon} {trend}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ---- Tab: Overview ----
function OverviewTab({ stats, averages }: { stats: TurnaroundStats; averages: TurnaroundAverage[] }) {
  const [etaCompany, setEtaCompany] = useState<GradingCompany>('PSA');
  const [etaTier, setEtaTier] = useState<TurnaroundTier>('regular');
  const [prediction, setPrediction] = useState<ETAPrediction | null>(null);

  const handlePredict = () => {
    setPrediction(getETAPrediction(etaCompany, etaTier));
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Reports" value={stats.totalReports} />
        <StatCard label="Overall Avg Days" value={stats.avgDaysAllCompanies} />
        <StatCard label="Fastest Company" value={stats.fastestCompany} />
        <StatCard label="Reports This Week" value={stats.reportsThisWeek} />
      </div>

      {/* Tier breakdown table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
        <h3 className="text-lg font-semibold text-white p-4 border-b border-slate-700">
          Tier-by-Tier Breakdown
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left p-3">Company</th>
              <th className="text-left p-3">Tier</th>
              <th className="text-right p-3">Avg Days</th>
              <th className="text-right p-3">Min</th>
              <th className="text-right p-3">Max</th>
              <th className="text-right p-3">Median</th>
              <th className="text-right p-3">Reports</th>
              <th className="text-center p-3">Trend</th>
            </tr>
          </thead>
          <tbody>
            {averages.map((a, i) => (
              <tr key={i} className="border-b border-slate-700/50 text-slate-300">
                <td className="p-3 font-medium" style={{ color: getCompanyColor(a.company) }}>
                  {a.company}
                </td>
                <td className="p-3">{getTierLabel(a.tier)}</td>
                <td className="p-3 text-right">{a.avgDays}</td>
                <td className="p-3 text-right">{a.minDays}</td>
                <td className="p-3 text-right">{a.maxDays}</td>
                <td className="p-3 text-right">{a.medianDays}</td>
                <td className="p-3 text-right">{a.reportCount}</td>
                <td className="p-3 text-center">
                  <TrendBadge trend={a.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ETA Calculator */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" /> ETA Calculator
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Company</label>
            <select
              className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm"
              value={etaCompany}
              onChange={e => setEtaCompany(e.target.value as GradingCompany)}
            >
              {COMPANIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Tier</label>
            <select
              className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm"
              value={etaTier}
              onChange={e => setEtaTier(e.target.value as TurnaroundTier)}
            >
              {TIERS.map(t => (
                <option key={t} value={t}>{getTierLabel(t)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handlePredict}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Predict
          </button>
        </div>
        {prediction && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-700/50 rounded p-3">
              <p className="text-xs text-slate-400">Predicted</p>
              <p className="text-xl font-bold text-white">{formatDays(prediction.predictedDays)}</p>
            </div>
            <div className="bg-slate-700/50 rounded p-3">
              <p className="text-xs text-slate-400">Confidence</p>
              <p className="text-xl font-bold text-white">{prediction.confidence}%</p>
            </div>
            <div className="bg-slate-700/50 rounded p-3">
              <p className="text-xs text-slate-400">Range</p>
              <p className="text-xl font-bold text-white">
                {prediction.range.min}–{prediction.range.max}
              </p>
            </div>
            <div className="bg-slate-700/50 rounded p-3">
              <p className="text-xs text-slate-400">Based On</p>
              <p className="text-xl font-bold text-white">{prediction.basedOnReports} reports</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Tab: Company Comparison ----
function ComparisonTab() {
  const comparison = useMemo(() => getCompanyComparison(), []);
  const [selectedCompany, setSelectedCompany] = useState<GradingCompany>('PSA');
  const [selectedTier, setSelectedTier] = useState<TurnaroundTier>('regular');

  const barData = COMPANIES.map(c => {
    const comp = comparison[c];
    return {
      name: c,
      value: comp.avgDays,
      regular: comp.tiers.regular || 0,
      express: comp.tiers.express || 0,
      value_tier: comp.tiers.value || 0,
    };
  });

  const historicalData = useMemo(
    () => getHistoricalTrend(selectedCompany, selectedTier),
    [selectedCompany, selectedTier]
  );

  const tierBreakdown = useMemo(
    () => getTierComparison(selectedCompany),
    [selectedCompany]
  );

  return (
    <div className="space-y-6">
      {/* Bar chart: avg days by company */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Average Days by Company & Tier</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f8fafc' }}
            />
            <Legend />
            <Bar dataKey="value_tier" name="Value" fill="#6366f1" />
            <Bar dataKey="regular" name="Regular" fill="#3b82f6" />
            <Bar dataKey="express" name="Express" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tier breakdown for selected company */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Tier Breakdown</h3>
          <select
            className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 text-sm"
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value as GradingCompany)}
          >
            {COMPANIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left p-2">Tier</th>
              <th className="text-right p-2">Avg</th>
              <th className="text-right p-2">Min</th>
              <th className="text-right p-2">Max</th>
              <th className="text-right p-2">Median</th>
              <th className="text-center p-2">Trend</th>
            </tr>
          </thead>
          <tbody>
            {tierBreakdown.map((a, i) => (
              <tr key={i} className="border-b border-slate-700/50 text-slate-300">
                <td className="p-2">{getTierLabel(a.tier)}</td>
                <td className="p-2 text-right">{a.avgDays}</td>
                <td className="p-2 text-right">{a.minDays}</td>
                <td className="p-2 text-right">{a.maxDays}</td>
                <td className="p-2 text-right">{a.medianDays}</td>
                <td className="p-2 text-center"><TrendBadge trend={a.trend} /></td>
              </tr>
            ))}
            {tierBreakdown.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-slate-500 p-4">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Historical trend line chart */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Historical Trend</h3>
          <div className="flex gap-2">
            <select
              className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 text-sm"
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value as GradingCompany)}
            >
              {COMPANIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 text-sm"
              value={selectedTier}
              onChange={e => setSelectedTier(e.target.value as TurnaroundTier)}
            >
              {TIERS.map(t => (
                <option key={t} value={t}>{getTierLabel(t)}</option>
              ))}
            </select>
          </div>
        </div>
        {historicalData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#f8fafc' }}
              />
              <Line
                type="monotone"
                dataKey="days"
                stroke={getCompanyColor(selectedCompany)}
                strokeWidth={2}
                dot={{ fill: getCompanyColor(selectedCompany) }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-500 text-center py-8">No historical data for this combination</p>
        )}
      </div>
    </div>
  );
}

// ---- Tab: My Submissions ----
function SubmissionsTab() {
  const submissions = useMemo(() => getMySubmissions(), []);

  const statusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case 'in_transit': return <Send className="w-4 h-4 text-amber-400" />;
      case 'received': return <Package className="w-4 h-4 text-blue-400" />;
      case 'in_progress': return <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">My Submissions Timeline</h3>
      {submissions.length === 0 ? (
        <p className="text-slate-500 text-center py-8">No submissions found</p>
      ) : (
        <div className="space-y-3">
          {submissions.map(sub => (
            <div
              key={sub.id}
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center gap-4"
            >
              <div className="flex-shrink-0">{statusIcon(sub.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-semibold text-sm"
                    style={{ color: getCompanyColor(sub.company) }}
                  >
                    {sub.company}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-slate-300 text-sm">{getTierLabel(sub.tier)}</span>
                  <StatusBadge status={sub.status} />
                </div>
                <div className="text-xs text-slate-400 flex flex-wrap gap-3">
                  <span>Submitted: {sub.submittedDate}</span>
                  {sub.receivedDate && <span>Received: {sub.receivedDate}</span>}
                  {sub.completedDate && <span>Completed: {sub.completedDate}</span>}
                  <span>Location: {sub.location}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-white">{formatDays(sub.reportedDays)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Tab: Report ----
function ReportTab({ onReportAdded }: { onReportAdded: () => void }) {
  const [company, setCompany] = useState<GradingCompany>('PSA');
  const [tier, setTier] = useState<TurnaroundTier>('regular');
  const [reportedDays, setReportedDays] = useState(30);
  const [submittedDate, setSubmittedDate] = useState('2026-03-01');
  const [receivedDate, setReceivedDate] = useState('');
  const [completedDate, setCompletedDate] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('in_progress');
  const [location, setLocation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReport({
      company,
      tier,
      reportedDays,
      submittedDate,
      receivedDate: receivedDate || null,
      completedDate: completedDate || null,
      status,
      userId: 'user-1',
      location: location || 'Unknown',
    });
    setSubmitted(true);
    onReportAdded();
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold text-white mb-4">Add New Turnaround Report</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Company</label>
            <select
              className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 text-sm"
              value={company}
              onChange={e => setCompany(e.target.value as GradingCompany)}
            >
              {COMPANIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Tier</label>
            <select
              className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 text-sm"
              value={tier}
              onChange={e => setTier(e.target.value as TurnaroundTier)}
            >
              {TIERS.map(t => (
                <option key={t} value={t}>{getTierLabel(t)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Reported Days</label>
            <input
              type="number"
              min={1}
              className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 text-sm"
              value={reportedDays}
              onChange={e => setReportedDays(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Status</label>
            <select
              className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 text-sm"
              value={status}
              onChange={e => setStatus(e.target.value as SubmissionStatus)}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Submitted Date</label>
            <input
              type="date"
              className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 text-sm"
              value={submittedDate}
              onChange={e => setSubmittedDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Received Date</label>
            <input
              type="date"
              className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 text-sm"
              value={receivedDate}
              onChange={e => setReceivedDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Completed Date</label>
            <input
              type="date"
              className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 text-sm"
              value={completedDate}
              onChange={e => setCompletedDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Location</label>
          <input
            type="text"
            placeholder="e.g. New York, NY"
            className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 text-sm"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors"
        >
          Submit Report
        </button>
        {submitted && (
          <p className="text-emerald-400 text-sm mt-2">Report submitted successfully!</p>
        )}
      </form>
    </div>
  );
}

// ---- Main Page ----
export default function GradingTurnaround() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stats, setStats] = useState<TurnaroundStats | null>(null);
  const [averages, setAverages] = useState<TurnaroundAverage[]>([]);

  const reload = () => {
    setStats(getTurnaroundStats());
    setAverages(getTurnaroundAverages());
  };

  useEffect(() => {
    reload();
  }, []);

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-7 h-7 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Grading Turnaround Tracker</h1>
            <p className="text-sm text-slate-400">
              Track and compare grading company turnaround times
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-800 rounded-lg p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && <OverviewTab stats={stats} averages={averages} />}
        {activeTab === 'comparison' && <ComparisonTab />}
        {activeTab === 'submissions' && <SubmissionsTab />}
        {activeTab === 'report' && <ReportTab onReportAdded={reload} />}
      </div>
    </div>
  );
}
