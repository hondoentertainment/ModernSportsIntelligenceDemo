import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, FileText, Download, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Settings, Calendar, BarChart3, Filter, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import {
  getTransactions,
  getTaxSummary,
  generateForm8949,
  generateScheduleD,
  getTaxOptimizations,
  getMonthlyBreakdown,
  getTaxSettings,
  updateTaxSettings,
  getWashSaleTransactions,
  exportReport,
  formatCurrency,
  formatDate,
  getHoldingPeriodLabel,
  type TaxYear,
  type TaxableTransaction,
  type TaxSummary,
  type Form8949Entry,
  type ScheduleD,
  type TaxOptimization,
  type MonthlyBreakdown,
  type TaxSettings,
  type FilingStatus,
  type TaxBracket,
  type ReportFormat,
} from '../lib/taxReportService';

const TAX_YEARS: TaxYear[] = [2023, 2024, 2025, 2026];
const CHART_COLORS = ['#f97316', '#60a5fa', '#f87171', '#34d399', '#a78bfa', '#fbbf24', '#22d3ee', '#fb923c'];

type ActiveTab = 'summary' | 'form8949' | 'scheduled' | 'transactions' | 'optimizations' | 'export' | 'settings';

const TaxReport: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<TaxYear>(2025);
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
  const [transactions, setTransactions] = useState<TaxableTransaction[]>([]);
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [form8949Entries, setForm8949Entries] = useState<Form8949Entry[]>([]);
  const [scheduleD, setScheduleD] = useState<ScheduleD | null>(null);
  const [optimizations, setOptimizations] = useState<TaxOptimization[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyBreakdown[]>([]);
  const [washSales, setWashSales] = useState<TaxableTransaction[]>([]);
  const [settings, setSettings] = useState<TaxSettings>(getTaxSettings());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [holdingFilter, setHoldingFilter] = useState<'all' | 'short_term' | 'long_term'>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  // Load data whenever year changes
  useEffect(() => {
    try {
      setLoading(true);
      setTransactions(getTransactions(selectedYear));
      setSummary(getTaxSummary(selectedYear));
      setForm8949Entries(generateForm8949(selectedYear));
      setScheduleD(generateScheduleD(selectedYear));
      setOptimizations(getTaxOptimizations());
      setMonthlyData(getMonthlyBreakdown(selectedYear));
      setWashSales(getWashSaleTransactions());
      setSettings(getTaxSettings());
      setLoading(false);
    } catch {
      setError('Failed to load Tax Report data');
      setLoading(false);
    }
  }, [selectedYear]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.cardName.toLowerCase().includes(q) ||
          tx.player.toLowerCase().includes(q) ||
          tx.platform.toLowerCase().includes(q)
      );
    }
    if (holdingFilter !== 'all') {
      result = result.filter((tx) => tx.holdingPeriod === holdingFilter);
    }
    if (platformFilter !== 'all') {
      result = result.filter((tx) => tx.platform === platformFilter);
    }
    return result;
  }, [transactions, searchQuery, holdingFilter, platformFilter]);

  const platforms = useMemo(() => {
    const set = new Set(transactions.map((tx) => tx.platform));
    return ['all', ...Array.from(set)];
  }, [transactions]);

  // Chart data
  const monthlyChartData = useMemo(
    () =>
      monthlyData.map((m) => ({
        month: m.month,
        gains: Math.max(0, m.gainLoss),
        losses: Math.min(0, m.gainLoss),
        transactions: m.transactions,
      })),
    [monthlyData]
  );

  const holdingPieData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Short-Term', value: Math.abs(summary.shortTermGainLoss) },
      { name: 'Long-Term', value: Math.abs(summary.longTermGainLoss) },
    ];
  }, [summary]);

  // Form 8949 grouped by box
  const form8949ByBox = useMemo(() => {
    const groups: Record<string, Form8949Entry[]> = {};
    for (const entry of form8949Entries) {
      if (!groups[entry.box]) groups[entry.box] = [];
      groups[entry.box].push(entry);
    }
    return groups;
  }, [form8949Entries]);

  const handleSettingChange = (key: keyof TaxSettings, value: string | boolean) => {
    const updated = updateTaxSettings({ [key]: value });
    setSettings(updated);
    setSummary(getTaxSummary(selectedYear));
  };

  const handleExport = (format: ReportFormat) => {
    const content = exportReport(format, selectedYear);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = format === 'csv' ? 'csv' : format === 'turbotax' ? 'txf' : 'txt';
    a.download = `tax_report_${selectedYear}_${format}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setExportStatus(`${format.replace('_', ' ').toUpperCase()} exported successfully`);
    setTimeout(() => setExportStatus(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Tax Report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'summary', label: 'Summary', icon: <BarChart3 size={14} /> },
    { key: 'form8949', label: 'Form 8949', icon: <FileText size={14} /> },
    { key: 'scheduled', label: 'Schedule D', icon: <Calculator size={14} /> },
    { key: 'transactions', label: 'Transactions', icon: <DollarSign size={14} /> },
    { key: 'optimizations', label: 'Optimize', icon: <TrendingUp size={14} /> },
    { key: 'export', label: 'Export', icon: <Download size={14} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={14} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20">
            <FileText size={24} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">One-Click Tax Report</h1>
            <p className="text-sm text-slate-400">IRS Form 8949 &amp; Schedule D &mdash; Capital Gains Reporting</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-sm font-bold bg-emerald-500/20 text-emerald-300 rounded-full">
            {transactions.length} Transactions
          </span>
          {washSales.length > 0 && (
            <span className="px-3 py-1.5 text-sm font-bold bg-amber-500/20 text-amber-300 rounded-full flex items-center gap-1">
              <AlertTriangle size={12} /> {washSales.length} Wash Sales
            </span>
          )}
        </div>
      </div>

      {/* Tax Year Selector */}
      <div className="flex gap-2 flex-wrap">
        {TAX_YEARS.map((yr) => (
          <button
            key={yr}
            onClick={() => setSelectedYear(yr)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              selectedYear === yr
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
            Tax Year {yr}
          </button>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 flex-wrap bg-slate-800/30 rounded-xl p-1.5 border border-slate-700/30">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Dashboard */}
      {activeTab === 'summary' && summary && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Proceeds</p>
              <p className="text-2xl font-bold text-slate-100">{formatCurrency(summary.totalProceeds)}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cost Basis</p>
              <p className="text-2xl font-bold text-slate-300">{formatCurrency(summary.totalCostBasis)}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Net Gain/Loss</p>
              <p className={`text-2xl font-bold ${summary.totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {summary.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(summary.totalGainLoss)}
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Estimated Tax</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(summary.estimatedTax)}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Effective Rate</p>
              <p className="text-2xl font-bold text-brand-lime">{summary.effectiveRate}%</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Fees</p>
              <p className="text-2xl font-bold text-amber-400">{formatCurrency(summary.totalFees)}</p>
            </div>
          </div>

          {/* Short vs Long Term breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Short-Term Gain/Loss</p>
              <p className={`text-3xl font-bold ${summary.shortTermGainLoss >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                {summary.shortTermGainLoss >= 0 ? '+' : ''}{formatCurrency(summary.shortTermGainLoss)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Taxed at ordinary income rates</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Long-Term Gain/Loss</p>
              <p className={`text-3xl font-bold ${summary.longTermGainLoss >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {summary.longTermGainLoss >= 0 ? '+' : ''}{formatCurrency(summary.longTermGainLoss)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Taxed at preferential capital gains rates</p>
            </div>
          </div>

          {/* Monthly Breakdown Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-400" />
              Monthly Gains &amp; Losses ({selectedYear})
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name === 'gains' ? 'Gains' : 'Losses']}
                  />
                  <Bar dataKey="gains" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="losses" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Holding Period Pie Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4">Holding Period Split</h2>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={holdingPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }: { name: string; value: number }) => `${name}: ${formatCurrency(value)}`}
                    >
                      {holdingPieData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Wash Sale Alerts */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" />
                Wash Sale Alerts
              </h2>
              {washSales.length === 0 ? (
                <p className="text-slate-400 text-sm">No wash sale transactions detected.</p>
              ) : (
                <div className="space-y-3">
                  {washSales.map((ws) => (
                    <div key={ws.id} className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                      <p className="text-sm font-semibold text-amber-300">{ws.cardName}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Sold {formatDate(ws.dateSold)} | Loss of {formatCurrency(ws.gainLoss)} disallowed
                      </p>
                      <p className="text-xs text-amber-400 mt-1">
                        Disallowed amount: {formatCurrency(ws.washSaleDisallowed)} (added to replacement cost basis)
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cumulative Gain/Loss Line Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-4">Cumulative Gain/Loss Trend</h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData.reduce<{ month: string; cumulative: number }[]>((acc, m) => {
                    const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
                    acc.push({ month: m.month, cumulative: prev + m.gainLoss });
                    return acc;
                  }, [])}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(value: number) => [formatCurrency(value), 'Cumulative']}
                  />
                  <Line type="monotone" dataKey="cumulative" stroke="#34d399" strokeWidth={2} dot={{ r: 4, fill: '#34d399' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Form 8949 Preview */}
      {activeTab === 'form8949' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" />
              Form 8949 &mdash; Sales and Other Dispositions of Capital Assets
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Part I: Short-Term (Boxes A, B, C) &bull; Part II: Long-Term (Boxes D, E, F)
            </p>

            {Object.entries(form8949ByBox).map(([box, entries]) => (
              <div key={box} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    Box {box}
                  </span>
                  <span className="text-xs text-slate-500">
                    {['A', 'B', 'C'].includes(box) ? 'Short-Term' : 'Long-Term'}
                    {' | '}
                    {box === 'A' || box === 'D'
                      ? 'Basis reported to IRS (1099-B)'
                      : box === 'B' || box === 'E'
                      ? 'Basis NOT reported to IRS'
                      : 'Cannot determine if basis reported'}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-2 pr-2">(a) Description</th>
                        <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-2 pr-2">(b) Acquired</th>
                        <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-2 pr-2">(c) Sold</th>
                        <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-2 pr-2">(d) Proceeds</th>
                        <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-2 pr-2">(e) Cost Basis</th>
                        <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-2 pr-2">(f) Code</th>
                        <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-2 pr-2">(g) Adj</th>
                        <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-2">(h) Gain/Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, idx) => (
                        <tr key={idx} className="border-b border-slate-700/20">
                          <td className="py-2 pr-2 text-xs text-white max-w-[250px] truncate">{entry.description}</td>
                          <td className="py-2 pr-2 text-xs text-slate-400">{formatDate(entry.dateAcquired)}</td>
                          <td className="py-2 pr-2 text-xs text-slate-400">{formatDate(entry.dateSold)}</td>
                          <td className="py-2 pr-2 text-xs text-right text-slate-300">{formatCurrency(entry.proceeds)}</td>
                          <td className="py-2 pr-2 text-xs text-right text-slate-300">{formatCurrency(entry.costBasis)}</td>
                          <td className="py-2 pr-2 text-xs text-center text-amber-400 font-semibold">{entry.adjustmentCode || '-'}</td>
                          <td className="py-2 pr-2 text-xs text-right text-slate-400">{entry.adjustmentAmount ? formatCurrency(entry.adjustmentAmount) : '-'}</td>
                          <td className={`py-2 text-xs text-right font-bold ${entry.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {entry.gainLoss >= 0 ? '+' : ''}{formatCurrency(entry.gainLoss)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-600">
                        <td colSpan={3} className="py-2 text-xs font-bold text-slate-300">Box {box} Totals</td>
                        <td className="py-2 text-xs text-right font-bold text-slate-200">
                          {formatCurrency(entries.reduce((s, e) => s + e.proceeds, 0))}
                        </td>
                        <td className="py-2 text-xs text-right font-bold text-slate-200">
                          {formatCurrency(entries.reduce((s, e) => s + e.costBasis, 0))}
                        </td>
                        <td></td>
                        <td className="py-2 text-xs text-right font-bold text-slate-200">
                          {formatCurrency(entries.reduce((s, e) => s + e.adjustmentAmount, 0))}
                        </td>
                        <td className={`py-2 text-xs text-right font-bold ${entries.reduce((s, e) => s + e.gainLoss, 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(entries.reduce((s, e) => s + e.gainLoss, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule D Preview */}
      {activeTab === 'scheduled' && scheduleD && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
              <Calculator size={18} className="text-emerald-400" />
              Schedule D &mdash; Capital Gains and Losses
            </h2>
            <p className="text-xs text-slate-500 mb-6">Summary of Form 8949 entries for your tax return</p>

            {/* Part I */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-amber-400 mb-4 uppercase tracking-wider">Part I &mdash; Short-Term Capital Gains and Losses</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                  <span className="text-sm text-slate-400">Line 7: Short-term gain/loss from Form 8949 (Box A, B, C)</span>
                  <span className={`text-sm font-bold ${scheduleD.shortTermFromForm8949 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(scheduleD.shortTermFromForm8949)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                  <span className="text-sm text-slate-400">Line 8: Other short-term capital gains</span>
                  <span className="text-sm font-bold text-slate-300">{formatCurrency(scheduleD.shortTermOther)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-slate-700/20 rounded-lg px-3">
                  <span className="text-sm font-bold text-slate-200">Total Short-Term (Line 7 + 8)</span>
                  <span className={`text-lg font-bold ${scheduleD.totalShortTerm >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(scheduleD.totalShortTerm)}
                  </span>
                </div>
              </div>
            </div>

            {/* Part II */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-blue-400 mb-4 uppercase tracking-wider">Part II &mdash; Long-Term Capital Gains and Losses</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                  <span className="text-sm text-slate-400">Line 15: Long-term gain/loss from Form 8949 (Box D, E, F)</span>
                  <span className={`text-sm font-bold ${scheduleD.longTermFromForm8949 >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(scheduleD.longTermFromForm8949)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                  <span className="text-sm text-slate-400">Line 16: Other long-term capital gains</span>
                  <span className="text-sm font-bold text-slate-300">{formatCurrency(scheduleD.longTermOther)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-slate-700/20 rounded-lg px-3">
                  <span className="text-sm font-bold text-slate-200">Total Long-Term (Line 15 + 16)</span>
                  <span className={`text-lg font-bold ${scheduleD.totalLongTerm >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(scheduleD.totalLongTerm)}
                  </span>
                </div>
              </div>
            </div>

            {/* Part III */}
            <div>
              <h3 className="text-sm font-bold text-emerald-400 mb-4 uppercase tracking-wider">Part III &mdash; Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                  <span className="text-sm text-slate-400">Net capital gain or loss</span>
                  <span className={`text-sm font-bold ${scheduleD.netGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(scheduleD.netGainLoss)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                  <span className="text-sm text-slate-400">Capital loss carryover to next year</span>
                  <span className="text-sm font-bold text-amber-400">{formatCurrency(scheduleD.capitalLossCarryover)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-emerald-500/10 rounded-lg px-3 border border-emerald-500/30">
                  <span className="text-sm font-bold text-slate-200">Taxable Gain (or deductible loss, limited to -$3,000)</span>
                  <span className={`text-xl font-bold ${scheduleD.taxableGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(scheduleD.taxableGain)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Log */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search cards, players, platforms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <select
              value={holdingFilter}
              onChange={(e) => setHoldingFilter(e.target.value as 'all' | 'short_term' | 'long_term')}
              className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Periods</option>
              <option value="short_term">Short-Term</option>
              <option value="long_term">Long-Term</option>
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p === 'all' ? 'All Platforms' : p}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500">
              <Filter size={12} className="inline mr-1" />
              {filteredTransactions.length} of {transactions.length}
            </span>
          </div>

          {/* Transaction Table */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-2">Card</th>
                    <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-2">Acquired</th>
                    <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-2">Sold</th>
                    <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-2">Proceeds</th>
                    <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-2">Basis</th>
                    <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-2">Gain/Loss</th>
                    <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-2">Period</th>
                    <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-2">Fees</th>
                    <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider pb-3 pr-2">Platform</th>
                    <th className="text-center text-[10px] text-slate-500 uppercase tracking-wider pb-3">Wash</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-700/20 hover:bg-slate-700/10">
                      <td className="py-2.5 pr-2">
                        <p className="text-xs font-bold text-white truncate max-w-[220px]">{tx.cardName}</p>
                        <p className="text-[10px] text-slate-500">{tx.player}</p>
                      </td>
                      <td className="py-2.5 pr-2 text-xs text-slate-400">{formatDate(tx.dateAcquired)}</td>
                      <td className="py-2.5 pr-2 text-xs text-slate-400">{formatDate(tx.dateSold)}</td>
                      <td className="py-2.5 pr-2 text-xs text-right text-slate-300">{formatCurrency(tx.proceeds)}</td>
                      <td className="py-2.5 pr-2 text-xs text-right text-slate-300">{formatCurrency(tx.costBasis)}</td>
                      <td className={`py-2.5 pr-2 text-xs text-right font-bold ${tx.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.gainLoss >= 0 ? '+' : ''}{formatCurrency(tx.gainLoss)}
                      </td>
                      <td className="py-2.5 pr-2 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${tx.holdingPeriod === 'short_term' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
                          {tx.holdingPeriod === 'short_term' ? 'ST' : 'LT'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-2 text-xs text-right text-slate-400">{formatCurrency(tx.totalFees)}</td>
                      <td className="py-2.5 pr-2 text-xs text-slate-400">{tx.platform}</td>
                      <td className="py-2.5 text-center">
                        {tx.washSale ? (
                          <span className="text-amber-400" title={`Disallowed: ${formatCurrency(tx.washSaleDisallowed)}`}>
                            <AlertTriangle size={14} />
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTransactions.length === 0 && (
              <p className="text-center text-slate-500 py-8 text-sm">No transactions match your filters.</p>
            )}
          </div>
        </div>
      )}

      {/* Tax Optimization Strategies */}
      {activeTab === 'optimizations' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              Tax Optimization Strategies
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Actionable recommendations to minimize your tax liability
            </p>
            <div className="space-y-4">
              {optimizations.map((opt) => (
                <div
                  key={opt.id}
                  className={`border rounded-xl p-4 ${opt.implemented ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-700/20 border-slate-700/50'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-slate-200">{opt.strategy}</h3>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          opt.risk === 'low' ? 'bg-emerald-500/20 text-emerald-300' :
                          opt.risk === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {opt.risk} risk
                        </span>
                        {opt.implemented && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-500/20 text-emerald-300 flex items-center gap-0.5">
                            <CheckCircle size={10} /> Implemented
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{opt.description}</p>
                      <p className="text-xs text-slate-500">
                        <span className="font-semibold">Action:</span> {opt.action}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        <span className="font-semibold">Deadline:</span> {formatDate(opt.deadline)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500">Potential Savings</p>
                      <p className="text-xl font-bold text-emerald-400">{formatCurrency(opt.potentialSavings)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-200">Total Potential Savings</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(optimizations.reduce((s, o) => s + (o.implemented ? 0 : o.potentialSavings), 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Panel */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
              <Download size={18} className="text-emerald-400" />
              Export Tax Reports
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Download your tax data in various formats for filing or import into tax software
            </p>

            {exportStatus && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-sm text-emerald-300">{exportStatus}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {([
                { format: 'form_8949' as ReportFormat, title: 'IRS Form 8949', desc: 'Complete Form 8949 with all boxes (A-F)', icon: <FileText size={24} className="text-emerald-400" /> },
                { format: 'schedule_d' as ReportFormat, title: 'Schedule D', desc: 'Capital Gains and Losses summary', icon: <Calculator size={24} className="text-blue-400" /> },
                { format: 'csv' as ReportFormat, title: 'CSV Export', desc: 'Spreadsheet-compatible format for custom analysis', icon: <Download size={24} className="text-amber-400" /> },
                { format: 'turbotax' as ReportFormat, title: 'TurboTax (TXF)', desc: 'Direct import into TurboTax software', icon: <DollarSign size={24} className="text-purple-400" /> },
                { format: 'hrblock' as ReportFormat, title: 'H&R Block', desc: 'Compatible with H&R Block tax software', icon: <DollarSign size={24} className="text-red-400" /> },
              ]).map(({ format, title, desc, icon }) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className="bg-slate-700/30 border border-slate-700/50 rounded-xl p-5 text-left hover:border-emerald-500/50 hover:bg-slate-700/50 transition-all group"
                >
                  <div className="mb-3">{icon}</div>
                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">{title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{desc}</p>
                  <p className="text-xs text-emerald-400 mt-2 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Download for {selectedYear} &rarr;
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 mb-2 flex items-center gap-2">
              <Settings size={18} className="text-emerald-400" />
              Tax Settings
            </h2>
            <p className="text-xs text-slate-500 mb-6">Configure your filing status, tax bracket, and preferences</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Filing Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Filing Status</label>
                <select
                  value={settings.filingStatus}
                  onChange={(e) => handleSettingChange('filingStatus', e.target.value as FilingStatus)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="single">Single</option>
                  <option value="married_joint">Married Filing Jointly</option>
                  <option value="married_separate">Married Filing Separately</option>
                  <option value="head_of_household">Head of Household</option>
                </select>
              </div>

              {/* Tax Bracket */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Federal Tax Bracket</label>
                <select
                  value={settings.taxBracket}
                  onChange={(e) => handleSettingChange('taxBracket', e.target.value as TaxBracket)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  {(['10%', '12%', '22%', '24%', '32%', '35%', '37%'] as TaxBracket[]).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">State</label>
                <select
                  value={settings.state}
                  onChange={(e) => handleSettingChange('state', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  {['California', 'New York', 'New Jersey', 'Texas', 'Florida', 'Washington', 'Nevada', 'Illinois', 'Pennsylvania', 'Ohio', 'Massachusetts', 'Oregon', 'Minnesota', 'Hawaii', 'Georgia', 'Arizona', 'Colorado', 'North Carolina', 'Michigan', 'Virginia'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">State rate: {(settings.stateRate * 100).toFixed(2)}%</p>
              </div>

              {/* Cost Basis Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cost Basis Method</label>
                <select
                  value={settings.costBasisMethod}
                  onChange={(e) => handleSettingChange('costBasisMethod', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="fifo">FIFO (First In, First Out)</option>
                  <option value="lifo">LIFO (Last In, First Out)</option>
                  <option value="specific_id">Specific Identification</option>
                  <option value="average">Average Cost</option>
                </select>
              </div>
            </div>

            {/* Fee Inclusion Toggles */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Fee Deductions</label>
              <div className="space-y-3">
                {([
                  { key: 'includeGradingFees' as keyof TaxSettings, label: 'Include grading fees in cost basis' },
                  { key: 'includeShippingFees' as keyof TaxSettings, label: 'Include shipping fees in cost basis' },
                  { key: 'includePlatformFees' as keyof TaxSettings, label: 'Include platform fees in cost basis' },
                ] as const).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => handleSettingChange(key, !settings[key])}
                      className={`w-10 h-5 rounded-full transition-colors relative ${settings[key] ? 'bg-emerald-500' : 'bg-slate-600'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm text-slate-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-amber-300 font-semibold">Tax Disclaimer</p>
                  <p className="text-xs text-slate-400 mt-1">
                    This tool provides estimates for informational purposes only. It is not tax advice.
                    Consult a qualified tax professional for your specific situation. IRS rules on collectibles
                    may apply different rates. Always verify calculations before filing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxReport;
