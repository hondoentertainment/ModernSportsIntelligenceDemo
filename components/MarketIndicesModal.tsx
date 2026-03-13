import React, { useMemo, useState } from 'react';
import {
  X,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  GitCompare,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  getIndices,
  getIndexDetail,
  getIndexComparison,
  calculatePortfolioBeta,
  MarketIndex,
  IndexComponent,
  PortfolioBeta,
} from '../lib/marketIndicesService';

// ---- Props ----

interface MarketIndicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'overview' | 'detail' | 'compare' | 'beta';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
  { id: 'detail', label: 'Index Detail', icon: <Activity size={16} /> },
  { id: 'compare', label: 'Compare', icon: <GitCompare size={16} /> },
  { id: 'beta', label: 'Portfolio Beta', icon: <PieChart size={16} /> },
];

const LINE_COLORS = [
  '#84cc16', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981',
];

// ---- Main Component ----

export const MarketIndicesModal: React.FC<MarketIndicesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedTicker, setSelectedTicker] = useState<string>('MSI500');
  const [betaTicker, setBetaTicker] = useState<string>('MSI500');
  const [compareSelection, setCompareSelection] = useState<string[]>(['MSI500', 'MSINBA', 'MSIMOD']);

  const indices = useMemo(() => getIndices(), []);
  const comparison = useMemo(() => getIndexComparison(), []);

  if (!isOpen) return null;

  // Summary bar data
  const msi500 = indices.find(i => i.ticker === 'MSI500');
  const marketDirection = msi500 && msi500.change >= 0 ? 'bull' : 'bear';
  const mostActive = [...indices].sort((a, b) => {
    const aVol = a.dataPoints[a.dataPoints.length - 1]?.volume ?? 0;
    const bVol = b.dataPoints[b.dataPoints.length - 1]?.volume ?? 0;
    return bVol - aVol;
  })[0];
  const bestPerforming = [...indices].sort((a, b) => b.changePercent - a.changePercent)[0];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 pb-6 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-6xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-lime/10 rounded-xl">
              <BarChart3 size={24} className="text-brand-lime" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                MSI Market Indices
              </h2>
              <p className="text-xs text-slate-400">
                Proprietary Benchmarks — The S&P 500 of Sports Cards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b border-slate-800 bg-slate-900/50">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab indices={indices} onSelectIndex={(t) => { setSelectedTicker(t); setActiveTab('detail'); }} />
          )}
          {activeTab === 'detail' && (
            <DetailTab
              indices={indices}
              selectedTicker={selectedTicker}
              onSelectTicker={setSelectedTicker}
            />
          )}
          {activeTab === 'compare' && (
            <CompareTab
              indices={indices}
              comparison={comparison}
              selection={compareSelection}
              onToggle={(t) => {
                setCompareSelection(prev =>
                  prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                );
              }}
            />
          )}
          {activeTab === 'beta' && (
            <BetaTab
              indices={indices}
              selectedTicker={betaTicker}
              onSelectTicker={setBetaTicker}
            />
          )}
        </div>

        {/* Summary Bar */}
        <div className="border-t border-slate-800 px-6 py-3 flex items-center justify-between gap-4 text-xs bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider">MSI 500</span>
            <span className="text-white font-black">
              {msi500?.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className={msi500 && msi500.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {msi500 && msi500.change >= 0 ? '+' : ''}
              {msi500?.changePercent.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Market:</span>
              <span className={`font-bold flex items-center gap-1 ${marketDirection === 'bull' ? 'text-emerald-400' : 'text-red-400'}`}>
                {marketDirection === 'bull' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {marketDirection === 'bull' ? 'Bullish' : 'Bearish'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Most Active:</span>
              <span className="font-bold" style={{ color: '#FFD700' }}>{mostActive?.ticker}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Best Perf:</span>
              <span className="font-bold text-emerald-400">{bestPerforming?.ticker}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Overview Tab ----

const OverviewTab: React.FC<{
  indices: MarketIndex[];
  onSelectIndex: (ticker: string) => void;
}> = ({ indices, onSelectIndex }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {indices.map(idx => {
        const isPositive = idx.change >= 0;
        const sparkData = idx.dataPoints.slice(-12).map(d => ({ v: d.value }));

        return (
          <div
            key={idx.ticker}
            onClick={() => onSelectIndex(idx.ticker)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 cursor-pointer hover:border-brand-lime/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black tracking-wider" style={{ color: '#FFD700' }}>
                {idx.ticker}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                idx.category === 'composite' ? 'bg-brand-lime/15 text-brand-lime' :
                idx.category === 'sport' ? 'bg-blue-500/15 text-blue-400' :
                idx.category === 'era' ? 'bg-purple-500/15 text-purple-400' :
                'bg-amber-500/15 text-amber-400'
              }`}>
                {idx.category}
              </span>
            </div>

            <p className="text-[10px] text-slate-500 mb-2 truncate">{idx.name}</p>

            <div className="text-lg font-black text-white mb-1">
              {idx.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>

            <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {isPositive ? '+' : ''}{idx.change.toFixed(2)} ({isPositive ? '+' : ''}{idx.changePercent.toFixed(2)}%)
            </div>

            {/* Sparkline */}
            <div className="h-12 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData}>
                  <defs>
                    <linearGradient id={`spark-${idx.ticker}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={isPositive ? '#10b981' : '#ef4444'}
                    strokeWidth={1.5}
                    fill={`url(#spark-${idx.ticker})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
              <span>{idx.components} cards</span>
              <span>Since {idx.inception.slice(0, 4)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Detail Tab ----

const DetailTab: React.FC<{
  indices: MarketIndex[];
  selectedTicker: string;
  onSelectTicker: (t: string) => void;
}> = ({ indices, selectedTicker, onSelectTicker }) => {
  const detail = useMemo(() => getIndexDetail(selectedTicker), [selectedTicker]);

  if (!detail) return <p className="text-slate-400">Index not found.</p>;

  const chartData = detail.dataPoints.map(d => ({
    date: d.date.slice(0, 7),
    value: d.value,
    volume: d.volume,
  }));

  const isPositive = detail.change >= 0;

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="flex gap-2 flex-wrap">
        {indices.map(idx => (
          <button
            key={idx.ticker}
            onClick={() => onSelectTicker(idx.ticker)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedTicker === idx.ticker
                ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
            }`}
          >
            {idx.ticker}
          </button>
        ))}
      </div>

      {/* Index header */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-black text-white">{detail.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{detail.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">
              {detail.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-1 justify-end text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isPositive ? '+' : ''}{detail.change.toFixed(2)} ({isPositive ? '+' : ''}{detail.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Sharpe Ratio', value: detail.sharpeRatio.toFixed(2), color: 'text-brand-lime' },
            { label: 'Annualized Return', value: `${detail.annualizedReturn.toFixed(1)}%`, color: 'text-emerald-400' },
            { label: 'Max Drawdown', value: `${detail.maxDrawdown.toFixed(1)}%`, color: 'text-red-400' },
            { label: '52W High', value: detail.high52Week.toLocaleString(undefined, { minimumFractionDigits: 2 }), color: 'text-blue-400' },
            { label: '52W Low', value: detail.low52Week.toLocaleString(undefined, { minimumFractionDigits: 2 }), color: 'text-amber-400' },
          ].map(m => (
            <div key={m.label} className="bg-slate-900/50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">{m.label}</p>
              <p className={`text-sm font-black ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical chart */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">Historical Performance</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#84cc16" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#84cc16"
                strokeWidth={2}
                fill="url(#detailGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Components */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">
          Top 10 Components
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                {['#', 'Player', 'Card', 'Weight', 'Value', '24h Change', 'Contribution (bps)'].map(h => (
                  <th key={h} className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-wider px-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detail.topComponents.map((comp) => (
                <tr key={comp.rank} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-2.5 px-2 text-xs text-slate-500 font-mono">{comp.rank}</td>
                  <td className="py-2.5 px-2 text-xs font-bold text-white">{comp.player}</td>
                  <td className="py-2.5 px-2 text-[11px] text-slate-400">{comp.cardDescription}</td>
                  <td className="py-2.5 px-2 text-xs font-bold text-brand-lime">{comp.weight.toFixed(2)}%</td>
                  <td className="py-2.5 px-2 text-xs font-bold text-white">
                    ${comp.value.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </td>
                  <td className={`py-2.5 px-2 text-xs font-bold ${comp.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {comp.change24h >= 0 ? '+' : ''}{comp.change24h.toFixed(2)}%
                  </td>
                  <td className={`py-2.5 px-2 text-xs font-bold ${comp.contribution >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {comp.contribution >= 0 ? '+' : ''}{comp.contribution.toFixed(1)}
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

// ---- Compare Tab ----

const CompareTab: React.FC<{
  indices: MarketIndex[];
  comparison: ReturnType<typeof getIndexComparison>;
  selection: string[];
  onToggle: (ticker: string) => void;
}> = ({ indices, comparison, selection, onToggle }) => {
  // Build chart data by normalizing all selected indices to base 100
  const chartData = useMemo(() => {
    const selectedIndices = indices.filter(i => selection.includes(i.ticker));
    if (selectedIndices.length === 0) return [];

    const maxLen = Math.max(...selectedIndices.map(i => i.dataPoints.length));
    const data: Record<string, any>[] = [];

    for (let j = 0; j < maxLen; j++) {
      const row: Record<string, any> = {};
      let dateSet = false;
      for (const idx of selectedIndices) {
        if (j < idx.dataPoints.length) {
          if (!dateSet) {
            row.date = idx.dataPoints[j].date.slice(0, 7);
            dateSet = true;
          }
          const base = idx.dataPoints[0].value;
          row[idx.ticker] = Math.round((idx.dataPoints[j].value / base) * 10000) / 100;
        }
      }
      if (dateSet) data.push(row);
    }
    return data;
  }, [indices, selection]);

  const PERIODS: { key: string; label: string }[] = [
    { key: 'day', label: '1D' },
    { key: 'week', label: '1W' },
    { key: 'month', label: '1M' },
    { key: 'quarter', label: '3M' },
    { key: 'year', label: '1Y' },
    { key: 'ytd', label: 'YTD' },
  ];

  return (
    <div className="space-y-6">
      {/* Selection toggles */}
      <div className="flex gap-2 flex-wrap">
        {indices.map((idx, i) => (
          <button
            key={idx.ticker}
            onClick={() => onToggle(idx.ticker)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              selection.includes(idx.ticker)
                ? 'border-brand-lime/40 bg-brand-lime/10 text-brand-lime'
                : 'border-slate-700/50 bg-slate-800/50 text-slate-500 hover:text-white'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selection.includes(idx.ticker) ? LINE_COLORS[i % LINE_COLORS.length] : '#475569' }}
            />
            {idx.ticker}
          </button>
        ))}
      </div>

      {/* Multi-line chart */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">
          Normalized Performance (Base = 100)
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
              />
              {selection.map((ticker, i) => (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  stroke={LINE_COLORS[indices.findIndex(idx => idx.ticker === ticker) % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">
          Return Comparison
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-wider px-2">Index</th>
                {PERIODS.map(p => (
                  <th key={p.key} className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-wider px-2 text-right">
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.indices.map(ci => (
                <tr key={ci.ticker} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-2.5 px-2">
                    <span className="text-xs font-black" style={{ color: '#FFD700' }}>{ci.ticker}</span>
                    <span className="text-[10px] text-slate-500 ml-2">{ci.name}</span>
                  </td>
                  {PERIODS.map(p => {
                    const val = ci.returns[p.key as keyof typeof ci.returns];
                    return (
                      <td
                        key={p.key}
                        className={`py-2.5 px-2 text-right text-xs font-bold ${
                          val >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {val >= 0 ? '+' : ''}{val.toFixed(2)}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ---- Portfolio Beta Tab ----

const BetaTab: React.FC<{
  indices: MarketIndex[];
  selectedTicker: string;
  onSelectTicker: (t: string) => void;
}> = ({ indices, selectedTicker, onSelectTicker }) => {
  const beta = useMemo(() => calculatePortfolioBeta(selectedTicker), [selectedTicker]);
  const selectedIndex = indices.find(i => i.ticker === selectedTicker);

  const metrics: { label: string; value: string; description: string; color: string }[] = [
    {
      label: 'Portfolio Beta',
      value: beta.portfolioBeta.toFixed(2),
      description: beta.portfolioBeta > 1
        ? 'Your portfolio is more volatile than the index'
        : beta.portfolioBeta < 1
          ? 'Your portfolio is less volatile than the index'
          : 'Your portfolio moves in line with the index',
      color: beta.portfolioBeta > 1.2 ? 'text-red-400' : beta.portfolioBeta < 0.8 ? 'text-blue-400' : 'text-emerald-400',
    },
    {
      label: 'Index Correlation',
      value: beta.indexCorrelation.toFixed(2),
      description: beta.indexCorrelation > 0.8
        ? 'Highly correlated — portfolio tracks the index closely'
        : beta.indexCorrelation > 0.5
          ? 'Moderate correlation with the index'
          : 'Low correlation — portfolio moves independently',
      color: 'text-brand-lime',
    },
    {
      label: 'Tracking Error',
      value: `${beta.trackingError.toFixed(2)}%`,
      description: 'Annualized standard deviation of the return difference vs the index',
      color: 'text-amber-400',
    },
    {
      label: 'Active Return (Alpha)',
      value: `${beta.activeReturn >= 0 ? '+' : ''}${beta.activeReturn.toFixed(2)}%`,
      description: beta.activeReturn > 0
        ? 'Your portfolio is outperforming the index'
        : 'Your portfolio is underperforming the index',
      color: beta.activeReturn >= 0 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      label: 'Information Ratio',
      value: beta.informationRatio.toFixed(2),
      description: 'Risk-adjusted excess return relative to the benchmark',
      color: beta.informationRatio > 0.5 ? 'text-emerald-400' : beta.informationRatio > 0 ? 'text-amber-400' : 'text-red-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Index selector */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-3">
          Select Benchmark Index
        </h4>
        <div className="flex gap-2 flex-wrap">
          {indices.map(idx => (
            <button
              key={idx.ticker}
              onClick={() => onSelectTicker(idx.ticker)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTicker === idx.ticker
                  ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
              }`}
            >
              {idx.ticker}
            </button>
          ))}
        </div>
        {selectedIndex && (
          <p className="text-xs text-slate-500 mt-3">
            Benchmark: <span className="font-bold" style={{ color: '#FFD700' }}>{selectedIndex.name}</span> — {selectedIndex.description}
          </p>
        )}
      </div>

      {/* Beta metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">{m.label}</p>
            <p className={`text-2xl font-black ${m.color} mb-2`}>{m.value}</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">{m.description}</p>
          </div>
        ))}
      </div>

      {/* Interpretation */}
      <div className="bg-slate-800/30 border border-brand-lime/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-brand-lime" />
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Portfolio Analysis</h4>
        </div>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Your portfolio has a <span className="font-bold text-white">beta of {beta.portfolioBeta.toFixed(2)}</span> relative to the{' '}
            <span className="font-bold" style={{ color: '#FFD700' }}>{selectedIndex?.name}</span>.
            {beta.portfolioBeta > 1
              ? ' This means your portfolio amplifies market movements — when the index rises 1%, your portfolio tends to rise more, but also falls more in downturns.'
              : ' This means your portfolio is less sensitive to market swings — a defensive positioning that may underperform in bull markets but protect in downturns.'}
          </p>
          <p>
            With an information ratio of <span className="font-bold text-white">{beta.informationRatio.toFixed(2)}</span>,
            {beta.informationRatio > 0.5
              ? ' your active management is generating strong risk-adjusted excess returns.'
              : beta.informationRatio > 0
                ? ' your active decisions are adding modest value relative to the benchmark.'
                : ' consider whether active management costs are justified relative to simply tracking the index.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketIndicesModal;
