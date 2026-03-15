import React, { useMemo, useState } from 'react';
import {
  X,
  Box,
  LayoutDashboard,
  PackageOpen,
  Users,
  LineChart as LineChartIcon,
  FileText,
  TrendingUp,
  TrendingDown,
  Trophy,
  Star,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from 'recharts';
import {
  getBoxOpenings,
  getROIByProvider,
  getEVAnalysis,
  getMonthlyReport,
  compareProviders,
  getHitHistory,
  getSubscriptions,
  getMonthlyTrendData,
  getProviderName,
  type SubscriptionProvider,
} from '../lib/subscriptionBoxService';

interface SubscriptionBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'overview' | 'openings' | 'providers' | 'ev_analysis' | 'reports';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'openings', label: 'Openings', icon: <PackageOpen size={16} /> },
  { id: 'providers', label: 'Providers', icon: <Users size={16} /> },
  { id: 'ev_analysis', label: 'EV Analysis', icon: <LineChartIcon size={16} /> },
  { id: 'reports', label: 'Reports', icon: <FileText size={16} /> },
];

// ─── Overview Tab ───────────────────────────────────────────────────────────

const OverviewTab: React.FC = () => {
  const openings = useMemo(() => getBoxOpenings(), []);
  const trendData = useMemo(() => getMonthlyTrendData(), []);
  const _providers = useMemo(() => compareProviders(), []);
  const recentHits = useMemo(() => getHitHistory().slice(0, 5), []);
  const subscriptions = useMemo(() => getSubscriptions(), []);

  const totalSpent = openings.reduce((s, o) => s + o.cost, 0);
  const totalValue = openings.reduce((s, o) => s + o.totalValue, 0);
  const totalProfit = totalValue - totalSpent;
  const overallROI = totalSpent > 0 ? (totalProfit / totalSpent) * 100 : 0;
  const activeSubs = subscriptions.filter(s => s.active).length;
  const totalHits = openings.flatMap(o => o.hits).length;

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Spent</p>
          <p className="text-2xl font-bebas tracking-wider text-white">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Value</p>
          <p className="text-2xl font-bebas tracking-wider text-brand-lime">${totalValue.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Net P/L</p>
          <p className={`text-2xl font-bebas tracking-wider ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Overall ROI</p>
          <p className={`text-2xl font-bebas tracking-wider ${overallROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {overallROI >= 0 ? '+' : ''}{overallROI.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-brand-lime/5 border border-brand-lime/15 rounded-xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Active Subs</p>
          <p className="text-lg font-bebas tracking-wider text-brand-lime">{activeSubs}</p>
        </div>
        <div className="p-3 bg-slate-800/30 border border-slate-700 rounded-xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Boxes Opened</p>
          <p className="text-lg font-bebas tracking-wider text-white">{openings.length}</p>
        </div>
        <div className="p-3 bg-slate-800/30 border border-slate-700 rounded-xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Hits</p>
          <p className="text-lg font-bebas tracking-wider text-white">{totalHits}</p>
        </div>
      </div>

      {/* ROI Trend Chart */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Monthly ROI Trend
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trendData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'ROI']}
            />
            <Line type="monotone" dataKey="roi" stroke="#84cc16" strokeWidth={2} dot={{ r: 4, fill: '#84cc16' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Notable Hits */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Recent Notable Hits
        </p>
        <div className="space-y-1.5">
          {recentHits.map(hit => (
            <div key={hit.id} className="flex items-center gap-3 px-3 py-2.5 bg-slate-700/30 rounded-xl">
              <Star size={14} className="text-amber-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{hit.player}</p>
                <p className="text-[10px] text-slate-500">{hit.cardDescription}</p>
              </div>
              <span className="text-sm font-bold text-green-400 flex-shrink-0">
                ${hit.estimatedValue.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Openings Tab ───────────────────────────────────────────────────────────

const OpeningsTab: React.FC = () => {
  const openings = useMemo(() => getBoxOpenings(), []);
  const sorted = useMemo(
    () => [...openings].sort((a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime()),
    [openings]
  );

  return (
    <div className="space-y-3">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">
        <span className="col-span-3">Product</span>
        <span className="col-span-2">Provider</span>
        <span className="col-span-1 text-right">Cost</span>
        <span className="col-span-1 text-right">Value</span>
        <span className="col-span-2 text-right">Profit</span>
        <span className="col-span-1 text-right">ROI</span>
        <span className="col-span-2 text-right">Date</span>
      </div>

      {/* Opening Rows */}
      <div className="space-y-1.5">
        {sorted.map(opening => (
          <div
            key={opening.id}
            className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-slate-800/30 border border-slate-700 rounded-2xl hover:bg-slate-800/60 transition-colors"
          >
            <div className="col-span-3 min-w-0">
              <p className="text-sm font-medium text-white truncate">{opening.productName}</p>
              <p className="text-[10px] text-slate-500">{opening.hits.length} hit{opening.hits.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="col-span-2 min-w-0">
              <span className="text-xs text-slate-400 truncate">{getProviderName(opening.provider)}</span>
              <p className="text-[10px] text-slate-600">{opening.tierName}</p>
            </div>
            <div className="col-span-1 text-right">
              <p className="text-sm font-mono text-white">${opening.cost}</p>
            </div>
            <div className="col-span-1 text-right">
              <p className="text-sm font-mono text-white">${opening.totalValue}</p>
            </div>
            <div className="col-span-2 text-right">
              <div className="flex items-center justify-end gap-1">
                {opening.profit >= 0 ? (
                  <TrendingUp size={10} className="text-green-400" />
                ) : (
                  <TrendingDown size={10} className="text-red-400" />
                )}
                <span className={`text-sm font-bold ${opening.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {opening.profit >= 0 ? '+' : ''}${opening.profit}
                </span>
              </div>
            </div>
            <div className="col-span-1 text-right">
              <span className={`text-xs font-bold ${opening.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {opening.roi >= 0 ? '+' : ''}{opening.roi.toFixed(0)}%
              </span>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-xs text-slate-500">
                {new Date(opening.openDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Providers Tab ──────────────────────────────────────────────────────────

const ProvidersTab: React.FC = () => {
  const providers = useMemo(() => compareProviders(), []);
  const roiByProvider = useMemo(() => getROIByProvider(), []);

  const chartData = useMemo(() => {
    return providers.map(p => ({
      name: p.displayName.length > 18 ? p.displayName.slice(0, 16) + '...' : p.displayName,
      roi: parseFloat(p.avgMonthlyROI.toFixed(1)),
      evRatio: parseFloat((p.avgEVRatio * 100).toFixed(1)),
      consistency: parseFloat(p.consistencyScore.toFixed(0)),
      fullName: p.displayName,
    }));
  }, [providers]);

  const RANK_COLORS = ['#84cc16', '#22c55e', '#f59e0b', '#ef4444', '#6b7280'];

  return (
    <div className="space-y-5">
      {/* Provider Ranking Cards */}
      <div className="space-y-2">
        {providers.map((p, idx) => (
          <div
            key={p.provider}
            className={`flex items-center gap-4 p-4 border rounded-2xl transition-colors ${
              idx === 0
                ? 'bg-brand-lime/5 border-brand-lime/20'
                : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            {/* Rank Badge */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bebas tracking-wider text-white"
              style={{ backgroundColor: `${RANK_COLORS[idx]}20`, borderColor: `${RANK_COLORS[idx]}40`, borderWidth: 1 }}
            >
              #{p.overallRank}
            </div>

            {/* Provider Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{p.displayName}</p>
                {idx === 0 && <Trophy size={14} className="text-brand-lime" />}
              </div>
              <p className="text-[10px] text-slate-500">{p.totalBoxes} boxes opened</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 text-right flex-shrink-0">
              <div>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-0.5">ROI</p>
                <p className={`text-sm font-bold ${p.avgMonthlyROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {p.avgMonthlyROI >= 0 ? '+' : ''}{p.avgMonthlyROI.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-0.5">EV</p>
                <p className="text-sm font-bold text-brand-lime">
                  {(p.avgEVRatio * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-0.5">Hit/Box</p>
                <p className="text-sm font-bold text-white">{p.hitRate.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-0.5">Best Hit</p>
                <p className="text-sm font-bold text-amber-400">${p.bestHitValue}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Provider ROI Comparison Bar Chart */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Provider ROI Comparison
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ left: 10, right: 20, top: 5, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 10 }}
              angle={-25}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number, name: string) => {
                const label = name === 'roi' ? 'Avg ROI' : 'EV Ratio';
                return [`${value}%`, label];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
            <Bar dataKey="roi" name="Avg ROI" fill="#84cc16" radius={[4, 4, 0, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.roi >= 0 ? '#84cc16' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tier Breakdown */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          ROI by Provider &amp; Tier
        </p>
        <div className="space-y-1.5">
          <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] font-black text-brand-muted uppercase tracking-widest">
            <span className="col-span-3">Provider</span>
            <span className="col-span-2">Tier</span>
            <span className="col-span-1 text-right">Boxes</span>
            <span className="col-span-2 text-right">Spent</span>
            <span className="col-span-2 text-right">Value</span>
            <span className="col-span-2 text-right">ROI</span>
          </div>
          {roiByProvider.map((r, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center px-3 py-2 bg-slate-700/30 rounded-xl text-xs">
              <span className="col-span-3 text-white font-medium truncate">{getProviderName(r.provider)}</span>
              <span className="col-span-2 text-slate-400">{r.tierName}</span>
              <span className="col-span-1 text-right text-slate-400">{r.boxCount}</span>
              <span className="col-span-2 text-right text-white font-mono">${r.totalSpent.toLocaleString()}</span>
              <span className="col-span-2 text-right text-white font-mono">${r.totalValue.toLocaleString()}</span>
              <span className={`col-span-2 text-right font-bold ${r.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {r.roi >= 0 ? '+' : ''}{r.roi.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── EV Analysis Tab ────────────────────────────────────────────────────────

const EVAnalysisTab: React.FC = () => {
  const evData = useMemo(() => getEVAnalysis(), []);
  const trendData = useMemo(() => getMonthlyTrendData(), []);

  // EV over time chart
  const evChartData = useMemo(() => {
    return trendData.map(d => ({
      month: d.month,
      spent: d.spent,
      value: d.value,
      evRatio: d.spent > 0 ? parseFloat(((d.value / d.spent) * 100).toFixed(1)) : 0,
    }));
  }, [trendData]);

  // Group EV data by provider for breakdown
  const _byProvider = useMemo(() => {
    const map = new Map<SubscriptionProvider, typeof evData>();
    evData.forEach(e => {
      if (!map.has(e.provider)) map.set(e.provider, []);
      map.get(e.provider)!.push(e);
    });
    return Array.from(map.entries());
  }, [evData]);

  return (
    <div className="space-y-5">
      {/* EV Ratio Over Time */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          EV Ratio Over Time (Value / Cost)
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={evChartData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number, name: string) => {
                if (name === 'evRatio') return [`${value}%`, 'EV Ratio'];
                return [`$${value.toLocaleString()}`, name === 'spent' ? 'Spent' : 'Value'];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
            <Line type="monotone" dataKey="evRatio" name="EV Ratio" stroke="#84cc16" strokeWidth={2} dot={{ r: 4, fill: '#84cc16' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Spend vs Value */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Monthly Spend vs Value Received
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={evChartData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'spent' ? 'Spent' : 'Value']}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
            <Bar dataKey="spent" name="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.7} />
            <Bar dataKey="value" name="Value" fill="#84cc16" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Provider EV Breakdown */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          EV Breakdown by Provider
        </p>
        <div className="space-y-1.5">
          <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] font-black text-brand-muted uppercase tracking-widest">
            <span className="col-span-3">Provider</span>
            <span className="col-span-2">Tier</span>
            <span className="col-span-2">Month</span>
            <span className="col-span-2 text-right">Cost</span>
            <span className="col-span-1 text-right">Value</span>
            <span className="col-span-2 text-right">EV Ratio</span>
          </div>
          {evData.slice(0, 15).map((e, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center px-3 py-2 bg-slate-700/30 rounded-xl text-xs">
              <span className="col-span-3 text-white font-medium truncate">{getProviderName(e.provider)}</span>
              <span className="col-span-2 text-slate-400">{e.tierName}</span>
              <span className="col-span-2 text-slate-400">{e.month}</span>
              <span className="col-span-2 text-right text-white font-mono">${e.cost}</span>
              <span className="col-span-1 text-right text-white font-mono">${e.actualValue}</span>
              <span className={`col-span-2 text-right font-bold ${e.evRatio >= 1 ? 'text-brand-lime' : e.evRatio >= 0.8 ? 'text-amber-400' : 'text-red-400'}`}>
                {(e.evRatio * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Reports Tab ────────────────────────────────────────────────────────────

const ReportsTab: React.FC = () => {
  const trendData = useMemo(() => getMonthlyTrendData(), []);
  const months = useMemo(() => trendData.map(t => t.month), [trendData]);
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1] || '');

  const report = useMemo(() => {
    // Map display month back to full month name for report
    return getMonthlyReport(selectedMonth);
  }, [selectedMonth]);

  return (
    <div className="space-y-5">
      {/* Month Selector */}
      <div className="flex gap-2 flex-wrap">
        {months.map(m => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              selectedMonth === m
                ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/30'
                : 'bg-slate-800/30 text-slate-500 border border-slate-700 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Spent</p>
          <p className="text-2xl font-bebas tracking-wider text-white">${report.totalSpent.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Value</p>
          <p className="text-2xl font-bebas tracking-wider text-brand-lime">${report.totalValue.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Net P/L</p>
          <p className={`text-2xl font-bebas tracking-wider ${report.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {report.profit >= 0 ? '+' : ''}${report.profit.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">ROI</p>
          <p className={`text-2xl font-bebas tracking-wider ${report.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {report.roi >= 0 ? '+' : ''}{report.roi.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Monthly P&L Trend Chart */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Monthly P&amp;L Trend
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={trendData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Profit']}
            />
            <Bar dataKey="profit" name="Profit" radius={[4, 4, 0, 0]} barSize={28}>
              {trendData.map((entry, index) => (
                <Cell key={index} fill={entry.profit >= 0 ? '#84cc16' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Report Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-800/30 border border-slate-700 rounded-xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Boxes Opened</p>
          <p className="text-lg font-bebas tracking-wider text-white">{report.boxesOpened}</p>
        </div>
        <div className="p-3 bg-slate-800/30 border border-slate-700 rounded-xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Hits</p>
          <p className="text-lg font-bebas tracking-wider text-white">{report.totalHits}</p>
        </div>
      </div>

      {/* By Provider Breakdown */}
      {report.byProvider.length > 0 && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
            Provider Breakdown - {selectedMonth}
          </p>
          <div className="space-y-1.5">
            {report.byProvider.map((bp, idx) => (
              <div key={idx} className="flex items-center gap-3 px-3 py-2.5 bg-slate-700/30 rounded-xl">
                <span className="text-sm font-medium text-white flex-1 truncate">{getProviderName(bp.provider)}</span>
                <span className="text-xs text-slate-400">${bp.spent} spent</span>
                <span className="text-xs text-slate-400">${bp.value} value</span>
                <span className={`text-xs font-bold ${bp.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {bp.roi >= 0 ? '+' : ''}{bp.roi.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notable Hits */}
      {report.notableHits.length > 0 && (
        <div className="p-4 bg-green-500/5 border border-green-500/15 rounded-2xl">
          <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-3">
            Notable Hits - {selectedMonth}
          </p>
          <div className="space-y-1.5">
            {report.notableHits.map(hit => (
              <div key={hit.id} className="flex items-center gap-3 px-3 py-2 bg-slate-700/20 rounded-xl">
                <Star size={14} className="text-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{hit.player}</p>
                  <p className="text-[10px] text-slate-500">{hit.cardDescription}</p>
                </div>
                <span className="text-sm font-bold text-green-400">${hit.estimatedValue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Modal ─────────────────────────────────────────────────────────────

export const SubscriptionBoxModal: React.FC<SubscriptionBoxModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const openings = useMemo(() => getBoxOpenings(), []);
  const subscriptions = useMemo(() => getSubscriptions(), []);

  const activeSubs = subscriptions.filter(s => s.active).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-brand-lime/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lime/10 text-brand-lime rounded-2xl border border-brand-lime/30">
              <Box size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                  <PackageOpen size={10} />
                  {openings.length} boxes opened
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30">
                  {activeSubs} active subs
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Subscription Box <span className="text-brand-lime">Intelligence</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-700 bg-slate-800/30">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-brand-lime border-brand-lime bg-brand-lime/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'openings' && <OpeningsTab />}
          {activeTab === 'providers' && <ProvidersTab />}
          {activeTab === 'ev_analysis' && <EVAnalysisTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBoxModal;
