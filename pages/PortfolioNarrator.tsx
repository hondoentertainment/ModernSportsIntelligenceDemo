import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Clock,
  BarChart3,
  Settings,
  RefreshCw,
  CheckCircle,
  ChevronRight,
  FileText,
  Zap,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  getNarratives,
  generateNarrative,
  getLatestNarrative,
  getPreferences,
  updatePreferences,
  getPerformanceTimeline,
  getNarratorStats,
  getActionItems,
  getHighlightsByType,
  formatCurrency,
  formatPercent,
  getToneColor,
  getToneLabel,
  getHighlightIcon,
  getPriorityColor,
  NarrativeReport,
  NarrativePeriod,
  NarrativePreferences,
  HighlightType,
} from '../lib/portfolioNarratorService';

type TabId = 'latest' | 'history' | 'performance' | 'settings';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'latest', label: 'Latest Report', icon: <FileText className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
  { id: 'performance', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

const highlightIcons: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  TrendingDown: <TrendingDown className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5" />,
};

const highlightColors: Record<HighlightType, string> = {
  gain: 'border-green-500 bg-green-500/10',
  loss: 'border-red-500 bg-red-500/10',
  milestone: 'border-purple-500 bg-purple-500/10',
  alert: 'border-yellow-500 bg-yellow-500/10',
};

const highlightTextColors: Record<HighlightType, string> = {
  gain: 'text-green-400',
  loss: 'text-red-400',
  milestone: 'text-purple-400',
  alert: 'text-yellow-400',
};

export default function PortfolioNarrator() {
  const [activeTab, setActiveTab] = useState<TabId>('latest');
  const [selectedPeriod, setSelectedPeriod] = useState<NarrativePeriod>('weekly');
  const [prefs, setPrefs] = useState<NarrativePreferences>(getPreferences());
  const [narratives, setNarratives] = useState(() => getNarratives());
  const [selectedReport, setSelectedReport] = useState<NarrativeReport | undefined>(
    getLatestNarrative()
  );

  const stats = useMemo(() => getNarratorStats(), [narratives]);
  const timeline = useMemo(() => getPerformanceTimeline(), []);
  const actionItems = useMemo(() => getActionItems(), [narratives]);

  const handleGenerate = () => {
    const report = generateNarrative(selectedPeriod);
    setNarratives(getNarratives());
    setSelectedReport(report);
    setActiveTab('latest');
  };

  const handleUpdatePreferences = (updates: Partial<NarrativePreferences>) => {
    const updated = updatePreferences(updates);
    setPrefs(updated);
  };

  const renderLatestReport = () => {
    if (!selectedReport) {
      return (
        <div className="text-center py-16 text-slate-400">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No reports generated yet.</p>
          <p className="text-sm mt-2">Generate your first narrative report to get started.</p>
        </div>
      );
    }

    const report = selectedReport;
    return (
      <div className="space-y-6">
        {/* Report Header */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{report.title}</h2>
              <p className="text-sm text-slate-400 mt-1">
                {new Date(report.generatedAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getToneColor(
                report.tone
              )} bg-slate-700`}
            >
              {getToneLabel(report.tone)}
            </span>
          </div>

          {/* Portfolio Snapshot */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Value</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(report.portfolioSnapshot.totalValue)}
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Change</p>
              <p
                className={`text-2xl font-bold ${
                  report.portfolioSnapshot.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatCurrency(report.portfolioSnapshot.change)}
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Change %</p>
              <p
                className={`text-2xl font-bold ${
                  report.portfolioSnapshot.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {formatPercent(report.portfolioSnapshot.changePercent)}
              </p>
            </div>
          </div>

          {/* Summary */}
          <p className="text-slate-300 leading-relaxed">{report.summary}</p>
        </div>

        {/* Highlights */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Highlights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.highlights.map((highlight, idx) => {
              const iconName = getHighlightIcon(highlight.type);
              return (
                <div
                  key={idx}
                  className={`rounded-lg border-l-4 p-4 ${highlightColors[highlight.type]}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={highlightTextColors[highlight.type]}>
                      {highlightIcons[iconName]}
                    </span>
                    <h4 className="font-semibold text-white">{highlight.title}</h4>
                    <span className={`ml-auto text-sm font-mono ${highlightTextColors[highlight.type]}`}>
                      {highlight.type === 'milestone'
                        ? highlight.value.toLocaleString()
                        : formatPercent(highlight.value)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{highlight.description}</p>
                  {highlight.cardName && (
                    <p className="text-xs text-slate-400 mt-1 italic">{highlight.cardName}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Market Insights */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Market Insights
          </h3>
          <ul className="space-y-2">
            {report.marketInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-300">
                <ChevronRight className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Items */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Action Items
          </h3>
          <div className="space-y-3">
            {report.actionItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-slate-900 rounded-lg p-4">
                <span
                  className={`${getPriorityColor(
                    item.priority
                  )} text-white text-xs font-bold px-2 py-1 rounded uppercase`}
                >
                  {item.priority}
                </span>
                <div>
                  <p className="text-white font-medium">{item.action}</p>
                  <p className="text-sm text-slate-400 mt-1">{item.reasoning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    return (
      <div className="space-y-3">
        {narratives.map((report) => (
          <button
            key={report.id}
            onClick={() => {
              setSelectedReport(report);
              setActiveTab('latest');
            }}
            className="w-full text-left bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-500 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">{report.title}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {new Date(report.generatedAt).toLocaleDateString()} &middot;{' '}
                  <span className="capitalize">{report.period}</span>
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-mono font-bold ${
                    report.portfolioSnapshot.changePercent >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {formatPercent(report.portfolioSnapshot.changePercent)}
                </p>
                <span
                  className={`text-xs ${getToneColor(report.tone)}`}
                >
                  {getToneLabel(report.tone)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderPerformance = () => {
    return (
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase">Total Reports</p>
            <p className="text-2xl font-bold text-white">{stats.totalReports}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase">Avg Gain</p>
            <p className="text-2xl font-bold text-green-400">{formatPercent(stats.avgGainReported)}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase">Streak</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.streakDays} days</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 uppercase">Top Highlight</p>
            <p className="text-sm font-medium text-white truncate">{stats.topHighlight}</p>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio vs Benchmark</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value: number) => [formatCurrency(value)]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="portfolioValue"
                name="Portfolio"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="benchmark"
                name="Benchmark"
                stroke="#64748b"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Highlight Breakdown */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Highlights by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['gain', 'loss', 'milestone', 'alert'] as HighlightType[]).map((type) => {
              const highlights = getHighlightsByType(type);
              return (
                <div key={type} className={`rounded-lg border p-4 ${highlightColors[type]}`}>
                  <div className={`flex items-center gap-2 mb-2 ${highlightTextColors[type]}`}>
                    {highlightIcons[getHighlightIcon(type)]}
                    <span className="capitalize font-medium">{type}s</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{highlights.length}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Action Items */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Active Action Items</h3>
          <div className="space-y-2">
            {actionItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-900 rounded-lg p-3">
                <span
                  className={`${getPriorityColor(item.priority)} text-white text-xs font-bold px-2 py-0.5 rounded uppercase`}
                >
                  {item.priority}
                </span>
                <span className="text-sm text-slate-300">{item.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Narrative Preferences</h3>

          <div className="space-y-5">
            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Report Frequency
              </label>
              <select
                value={prefs.frequency}
                onChange={(e) =>
                  handleUpdatePreferences({ frequency: e.target.value as NarrativePeriod })
                }
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            {/* Detail Level */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Detail Level</label>
              <div className="flex gap-3">
                {(['brief', 'detailed', 'comprehensive'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleUpdatePreferences({ detailLevel: level })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      prefs.detailLevel === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Focus Areas</label>
              <div className="flex flex-wrap gap-2">
                {['basketball', 'baseball', 'football', 'hockey', 'soccer', 'vintage', 'rookies', 'graded'].map(
                  (area) => (
                    <button
                      key={area}
                      onClick={() => {
                        const current = prefs.focusAreas;
                        const updated = current.includes(area)
                          ? current.filter((a) => a !== area)
                          : [...current, area];
                        handleUpdatePreferences({ focusAreas: updated });
                      }}
                      className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                        prefs.focusAreas.includes(area)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {area}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Market Context */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Include Market Context</p>
                <p className="text-xs text-slate-400">
                  Add broader market insights to narrative reports
                </p>
              </div>
              <button
                onClick={() =>
                  handleUpdatePreferences({ includeMarketContext: !prefs.includeMarketContext })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  prefs.includeMarketContext ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                    prefs.includeMarketContext ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Portfolio Narrator</h1>
              <p className="text-sm text-slate-400">
                AI-generated narrative insights for your sports card portfolio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as NarrativePeriod)}
              className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'latest' && renderLatestReport()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'performance' && renderPerformance()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
}
