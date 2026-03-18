import React, { useMemo, useState } from 'react';
import {
  X,
  GitBranch,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  BarChart3,
  Target,
  Layers,
  Zap,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { CardInventory } from '../types';
import {
  getFullDashboard,
  CorrelationDashboard,
  AssetCorrelation,
  RegimeAnalysis,
  MacroEvent,
  AlternativeBenchmark,
  HedgeAllocation,
  SportMarketLinkage,
  PortfolioBeta,
  TimeWindow,
  MarketAsset,
  AlternativeAsset,
  MARKET_LABELS,
  ALT_LABELS,
  saveCorrelationSettings,
  saveDashboardSnapshot,
} from '../lib/analytics/crossAssetCorrelationService';

interface CorrelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'matrix' | 'overlay' | 'regimes' | 'hedge' | 'sport' | 'macro' | 'alternatives';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'matrix', label: 'Correlation Matrix', icon: <Layers size={16} /> },
  { id: 'overlay', label: 'Asset Overlay', icon: <BarChart3 size={16} /> },
  { id: 'regimes', label: 'Regime Analysis', icon: <Activity size={16} /> },
  { id: 'hedge', label: 'Hedge Calculator', icon: <Shield size={16} /> },
  { id: 'sport', label: 'Sport Linkage', icon: <Zap size={16} /> },
  { id: 'macro', label: 'Macro Events', icon: <Globe size={16} /> },
  { id: 'alternatives', label: 'Alt Benchmarks', icon: <Target size={16} /> },
];

const ASSET_LINE_COLORS: Record<string, string> = {
  portfolio: '#818cf8',
  sp500: '#3b82f6',
  bitcoin: '#f59e0b',
  gold: '#eab308',
  treasuries: '#10b981',
  realestate: '#8b5cf6',
  art: '#ec4899',
  wine: '#dc2626',
  vintage_cars: '#f97316',
  sneakers: '#06b6d4',
};

function getHeatmapColor(value: number): string {
  if (value >= 0.6) return 'bg-red-500/40 text-red-300';
  if (value >= 0.3) return 'bg-amber-500/30 text-amber-300';
  if (value >= 0.1) return 'bg-blue-500/20 text-blue-300';
  if (value >= -0.1) return 'bg-slate-700/50 text-slate-300';
  if (value >= -0.3) return 'bg-green-500/20 text-green-300';
  return 'bg-green-500/40 text-green-300';
}

function getHeatmapBorder(value: number): string {
  if (value >= 0.6) return 'border-red-500/30';
  if (value >= 0.3) return 'border-amber-500/20';
  if (value >= 0.1) return 'border-blue-500/15';
  if (value >= -0.1) return 'border-slate-600';
  return 'border-green-500/20';
}

function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// ---- Matrix Tab ----

const MatrixTab: React.FC<{ correlations: AssetCorrelation[]; window: TimeWindow; onWindowChange: (_w: TimeWindow) => void }> = ({
  correlations,
  window,
  onWindowChange,
}) => {
  const getCorr = (c: AssetCorrelation) => {
    if (window === 30) return c.correlation30d;
    if (window === 365) return c.correlation365d;
    return c.correlation90d;
  };

  return (
    <div className="space-y-6">
      {/* Window selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Rolling Window:</span>
        {([30, 90, 365] as TimeWindow[]).map(w => (
          <button
            key={w}
            onClick={() => onWindowChange(w)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              window === w
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            {w}d
          </button>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `100px repeat(${correlations.length}, 90px)` }}>
          {/* Header row */}
          <div />
          {correlations.map(c => (
            <div key={c.asset} className="text-center text-[10px] font-black text-brand-muted uppercase tracking-wider py-2">
              {c.label.length > 10 ? c.label.split(' ')[0] : c.label}
            </div>
          ))}

          {/* Portfolio row */}
          <div className="text-right text-[10px] font-black text-indigo-400 uppercase tracking-wider flex items-center justify-end pr-3">
            Cards
          </div>
          {correlations.map(c => {
            const val = getCorr(c);
            return (
              <div
                key={`cards-${c.asset}`}
                className={`rounded-xl border text-center py-3 transition-all hover:scale-105 cursor-default ${getHeatmapColor(val)} ${getHeatmapBorder(val)}`}
                title={`Cards vs ${c.label}: ${val.toFixed(2)}`}
              >
                <span className="text-sm font-mono font-bold">{val.toFixed(2)}</span>
              </div>
            );
          })}

          {/* Beta row */}
          <div className="text-right text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-end pr-3">
            Beta
          </div>
          {correlations.map(c => (
            <div
              key={`beta-${c.asset}`}
              className="rounded-xl border border-slate-700 bg-slate-800/30 text-center py-3"
            >
              <span className="text-sm font-mono font-bold text-slate-300">{c.beta.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/40" />
          <span>High (+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500/30" />
          <span>Moderate (+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-700/50" />
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500/30" />
          <span>Negative (-)</span>
        </div>
      </div>
    </div>
  );
};

// ---- Overlay Tab ----

const OverlayTab: React.FC<{ dashboard: CorrelationDashboard }> = ({ dashboard }) => {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['sp500', 'bitcoin', 'gold']);

  const toggleAsset = (asset: string) => {
    setSelectedAssets(prev =>
      prev.includes(asset) ? prev.filter(a => a !== asset) : [...prev, asset]
    );
  };

  const allAssets = ['sp500', 'bitcoin', 'gold', 'treasuries', 'realestate', 'art', 'wine', 'vintage_cars', 'sneakers'];

  return (
    <div className="space-y-5">
      {/* Asset toggles */}
      <div className="flex flex-wrap gap-2">
        {allAssets.map(asset => {
          const label = MARKET_LABELS[asset as MarketAsset] || ALT_LABELS[asset as AlternativeAsset] || asset;
          const active = selectedAssets.includes(asset);
          return (
            <button
              key={asset}
              onClick={() => toggleAsset(asset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                active
                  ? 'border-indigo-500/40 text-white'
                  : 'border-slate-700 text-slate-500 hover:border-slate-600'
              }`}
              style={active ? { backgroundColor: ASSET_LINE_COLORS[asset] + '25' } : {}}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: ASSET_LINE_COLORS[asset] }} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-4">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={dashboard.timeSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(d: string) => d.slice(5)}
              interval={Math.floor(dashboard.timeSeries.length / 8)}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              domain={['auto', 'auto']}
              tickFormatter={(v: number) => v.toFixed(0)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '12px',
                fontSize: '11px',
              }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value: number, name: string) => [value.toFixed(2), name === 'portfolio' ? 'Cards' : (MARKET_LABELS[name as MarketAsset] || ALT_LABELS[name as AlternativeAsset] || name)]}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px' }}
              formatter={(value: string) => value === 'portfolio' ? 'Cards' : (MARKET_LABELS[value as MarketAsset] || ALT_LABELS[value as AlternativeAsset] || value)}
            />
            <Line
              type="monotone"
              dataKey="portfolio"
              stroke="#818cf8"
              strokeWidth={2.5}
              dot={false}
            />
            {selectedAssets.map(asset => (
              <Line
                key={asset}
                type="monotone"
                dataKey={asset}
                stroke={ASSET_LINE_COLORS[asset]}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray={['art', 'wine', 'vintage_cars', 'sneakers'].includes(asset) ? '4 2' : undefined}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-slate-500 italic">
        Indexed to 100 at start of period. Portfolio shown as solid purple line.
      </p>
    </div>
  );
};

// ---- Regime Tab ----

const RegimeTab: React.FC<{ regimes: RegimeAnalysis[] }> = ({ regimes }) => {
  const regimeColors: Record<string, { text: string; bg: string; border: string }> = {
    risk_on:     { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    risk_off:    { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    hobby_boom:  { text: 'text-blue-400',  bg: 'bg-blue-500/10',  border: 'border-blue-500/30' },
    hobby_bust:  { text: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/30' },
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regimes.map(r => {
          const colors = regimeColors[r.regime] || regimeColors.risk_on;
          return (
            <div
              key={r.regime}
              className={`p-5 rounded-2xl border transition-all ${
                r.isActive
                  ? `${colors.bg} ${colors.border} border-2`
                  : 'bg-slate-800/30 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {r.isActive && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors.bg.replace('/10', '/40')}`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors.bg.replace('/10', '/60')}`} />
                    </span>
                  )}
                  <span className={`text-sm font-bold ${r.isActive ? colors.text : 'text-white'}`}>
                    {r.label}
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold ${r.isActive ? colors.text : 'text-slate-400'}`}>
                  {Math.round(r.probability * 100)}% prob
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">{r.description}</p>

              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Cards', value: r.cardReturn },
                  { label: 'S&P', value: r.sp500Return },
                  { label: 'Gold', value: r.goldReturn },
                  { label: 'BTC', value: r.bitcoinReturn },
                ].map(item => (
                  <div key={item.label} className="p-2 bg-slate-900/50 rounded-lg">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">{item.label}</p>
                    <p className={`text-xs font-mono font-bold ${item.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPct(item.value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Hedge Tab ----

const HedgeTab: React.FC<{ allocations: HedgeAllocation[]; betas: PortfolioBeta[] }> = ({ allocations, betas }) => {
  return (
    <div className="space-y-6">
      {/* Beta Summary */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Activity size={14} className="text-indigo-400" />
          Portfolio Beta Analysis
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {betas.map(b => {
            const abs = Math.abs(b.beta);
            const barColor = abs < 0.15 ? 'bg-green-500' : abs < 0.4 ? 'bg-blue-500' : abs < 0.7 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={b.asset} className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{b.label}</span>
                  <span className="text-lg font-mono font-black text-white">{b.beta.toFixed(2)}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${Math.min(100, abs * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{b.interpretation}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimal Allocation */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Shield size={14} className="text-green-400" />
          Optimal Hedge Allocation
        </h4>
        <div className="bg-slate-800/30 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-5 gap-px text-[10px] font-black text-brand-muted uppercase tracking-widest px-4 py-3 border-b border-slate-700">
            <span>Asset</span>
            <span className="text-center">Current</span>
            <span className="text-center">Optimal</span>
            <span className="text-center">Action</span>
            <span className="text-right">Visual</span>
          </div>
          {allocations.map(a => (
            <div key={a.asset} className="grid grid-cols-5 gap-px items-center px-4 py-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
              <span className="text-xs font-bold text-white">{a.label}</span>
              <span className="text-xs font-mono text-slate-400 text-center">{Math.round(a.currentWeight * 100)}%</span>
              <span className="text-xs font-mono text-white text-center">{Math.round(a.optimalWeight * 100)}%</span>
              <div className="text-center">
                {a.delta > 0.01 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-400">
                    <TrendingUp size={10} />Add
                  </span>
                ) : a.delta < -0.01 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400">
                    <TrendingDown size={10} />Reduce
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500">Hold</span>
                )}
              </div>
              <div className="flex justify-end">
                <div className="h-2 w-20 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, a.optimalWeight * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1.5">
          <Info size={10} />
          Optimal weights minimize portfolio variance using mean-variance optimization on simulated returns.
        </p>
      </div>
    </div>
  );
};

// ---- Sport Linkage Tab ----

const SportTab: React.FC<{ linkages: SportMarketLinkage[] }> = ({ linkages }) => {
  const corrColor = (v: number) => v >= 0.5 ? 'text-red-400' : v >= 0.3 ? 'text-amber-400' : v >= 0.15 ? 'text-blue-400' : 'text-green-400';
  const corrBar = (v: number) => v >= 0.5 ? 'bg-red-500' : v >= 0.3 ? 'bg-amber-500' : v >= 0.15 ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className="space-y-4">
      {linkages.map(l => (
        <div key={l.sport} className="p-5 bg-slate-800/30 border border-slate-700 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">{l.sport}</span>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span>Contract <span className={`font-mono font-bold ${corrColor(l.contractCorrelation)}`}>{l.contractCorrelation.toFixed(2)}</span></span>
              <span>Win% <span className={`font-mono font-bold ${corrColor(l.winPctCorrelation)}`}>{l.winPctCorrelation.toFixed(2)}</span></span>
              <span>Fantasy <span className={`font-mono font-bold ${corrColor(l.fantasyCorrelation)}`}>{l.fantasyCorrelation.toFixed(2)}</span></span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Contract Value', value: l.contractCorrelation },
              { label: 'Team Win %', value: l.winPctCorrelation },
              { label: 'Fantasy Points', value: l.fantasyCorrelation },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[9px]">
                  <span className="text-slate-500 uppercase font-bold">{item.label}</span>
                  <span className={`font-mono ${corrColor(item.value)}`}>{item.value.toFixed(2)}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${corrBar(item.value)}`}
                    style={{ width: `${item.value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">{l.summary}</p>
        </div>
      ))}
    </div>
  );
};

// ---- Macro Events Tab ----

const MacroTab: React.FC<{ events: MacroEvent[] }> = ({ events }) => {
  const typeColors: Record<string, { text: string; bg: string; icon: React.ReactNode }> = {
    rate_hike:  { text: 'text-amber-400', bg: 'bg-amber-500/10', icon: <TrendingUp size={14} /> },
    recession:  { text: 'text-red-400',   bg: 'bg-red-500/10',   icon: <TrendingDown size={14} /> },
    stimulus:   { text: 'text-green-400', bg: 'bg-green-500/10', icon: <Zap size={14} /> },
    inflation:  { text: 'text-orange-400', bg: 'bg-orange-500/10', icon: <AlertTriangle size={14} /> },
    crash:      { text: 'text-red-400',   bg: 'bg-red-500/10',   icon: <AlertTriangle size={14} /> },
  };

  return (
    <div className="space-y-4">
      {events.map(e => {
        const colors = typeColors[e.type] || typeColors.recession;
        return (
          <div key={e.id} className="p-5 bg-slate-800/30 border border-slate-700 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>{colors.icon}</div>
                <div>
                  <span className="text-sm font-bold text-white">{e.name}</span>
                  <span className="ml-2 text-[10px] text-slate-500 font-mono">{e.date}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${colors.text} ${colors.bg}`}>
                {e.type.replace('_', ' ')}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{e.description}</p>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Cards', value: e.cardImpact },
                { label: 'S&P 500', value: e.sp500Impact },
                { label: 'Gold', value: e.goldImpact },
                { label: 'Bitcoin', value: e.bitcoinImpact },
              ].map(item => (
                <div key={item.label} className="p-2 bg-slate-900/50 rounded-lg text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">{item.label}</p>
                  <p className={`text-xs font-mono font-bold ${item.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPct(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Alternatives Tab ----

const AlternativesTab: React.FC<{ benchmarks: AlternativeBenchmark[]; portfolioReturn: number }> = ({ benchmarks, portfolioReturn }) => {
  return (
    <div className="space-y-5">
      {/* Portfolio vs alternatives table */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 gap-px text-[10px] font-black text-brand-muted uppercase tracking-widest px-4 py-3 border-b border-slate-700">
          <span className="col-span-2">Asset Class</span>
          <span className="text-center">YTD</span>
          <span className="text-center">1Y</span>
          <span className="text-center">3Y</span>
          <span className="text-center">Vol</span>
          <span className="text-center">Sharpe</span>
        </div>

        {/* Portfolio row */}
        <div className="grid grid-cols-7 gap-px items-center px-4 py-3 border-b border-slate-700 bg-indigo-500/5">
          <span className="col-span-2 text-xs font-bold text-indigo-400 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            Your Cards
          </span>
          <span className={`text-xs font-mono text-center ${portfolioReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPct(portfolioReturn)}
          </span>
          <span className="text-xs font-mono text-slate-400 text-center">--</span>
          <span className="text-xs font-mono text-slate-400 text-center">--</span>
          <span className="text-xs font-mono text-slate-400 text-center">--</span>
          <span className="text-xs font-mono text-slate-400 text-center">--</span>
        </div>

        {benchmarks.map(b => (
          <div key={b.asset} className="grid grid-cols-7 gap-px items-center px-4 py-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
            <span className="col-span-2 text-xs font-bold text-white flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ASSET_LINE_COLORS[b.asset] }} />
              {b.label}
            </span>
            <span className={`text-xs font-mono text-center ${b.ytdReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPct(b.ytdReturn)}
            </span>
            <span className={`text-xs font-mono text-center ${b.oneYearReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPct(b.oneYearReturn)}
            </span>
            <span className={`text-xs font-mono text-center ${b.threeYearReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPct(b.threeYearReturn)}
            </span>
            <span className="text-xs font-mono text-slate-400 text-center">{b.volatility.toFixed(1)}%</span>
            <span className="text-xs font-mono text-slate-400 text-center">{b.sharpeRatio.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Correlation comparison */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3">Correlation to Your Portfolio</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {benchmarks.map(b => {
            const abs = Math.abs(b.correlation);
            const barColor = abs >= 0.4 ? 'bg-red-500' : abs >= 0.2 ? 'bg-amber-500' : 'bg-green-500';
            return (
              <div key={b.asset} className="p-3 bg-slate-800/30 border border-slate-700 rounded-xl text-center space-y-2">
                <span className="text-xs font-bold text-white">{b.label}</span>
                <p className="text-lg font-mono font-black text-white">{b.correlation.toFixed(2)}</p>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${abs * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Main Modal ----

export const CorrelationModal: React.FC<CorrelationModalProps> = ({ isOpen, onClose, cards }) => {
  const [activeTab, setActiveTab] = useState<TabId>('matrix');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(90);

  const dashboard = useMemo(() => {
    const d = getFullDashboard(cards);
    saveDashboardSnapshot(d);
    return d;
  }, [cards]);

  const portfolioReturn = useMemo(() => {
    if (dashboard.timeSeries.length < 2) return 0;
    const first = dashboard.timeSeries[0].portfolio;
    const last = dashboard.timeSeries[dashboard.timeSeries.length - 1].portfolio;
    return Math.round(((last - first) / first) * 1000) / 10;
  }, [dashboard]);

  if (!isOpen) return null;

  const report = dashboard.report;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl mx-4 my-8 bg-brand-slate border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-brand-slate/95 backdrop-blur-sm border-b border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                <GitBranch size={22} />
              </div>
              <div>
                <h2 className="text-3xl font-bebas tracking-widest text-white leading-tight">
                  Cross-Asset <span className="text-indigo-400">Correlation Engine</span>
                </h2>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                  Market regime, beta analysis & hedge optimization
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-[9px] text-slate-500 uppercase font-bold">Beta (S&P)</p>
              <p className="text-xl font-mono font-black text-white">{report.portfolioBeta.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-[9px] text-slate-500 uppercase font-bold">Diversification</p>
              <p className="text-xl font-mono font-black text-white">{report.score}<span className="text-xs text-slate-500">/100</span></p>
            </div>
            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-[9px] text-slate-500 uppercase font-bold">Regime</p>
              <p className="text-sm font-bold text-indigo-400 mt-1">{report.regimeLabel}</p>
            </div>
            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-[9px] text-slate-500 uppercase font-bold">90d Return</p>
              <p className={`text-xl font-mono font-black ${portfolioReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPct(portfolioReturn)}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'matrix' && (
            <MatrixTab
              correlations={dashboard.correlations}
              window={timeWindow}
              onWindowChange={w => {
                setTimeWindow(w);
                saveCorrelationSettings({ preferredWindow: w, selectedAssets: [] });
              }}
            />
          )}
          {activeTab === 'overlay' && <OverlayTab dashboard={dashboard} />}
          {activeTab === 'regimes' && <RegimeTab regimes={dashboard.regimes} />}
          {activeTab === 'hedge' && <HedgeTab allocations={dashboard.hedgeAllocations} betas={dashboard.betas} />}
          {activeTab === 'sport' && <SportTab linkages={dashboard.sportLinkages} />}
          {activeTab === 'macro' && <MacroTab events={dashboard.macroEvents} />}
          {activeTab === 'alternatives' && (
            <AlternativesTab benchmarks={dashboard.benchmarks} portfolioReturn={portfolioReturn} />
          )}

          {/* Hedge Recommendation */}
          <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start gap-3">
            <CheckCircle2 size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-indigo-400 mb-1">Hedge Recommendation</p>
              <p className="text-xs text-slate-400 leading-relaxed">{report.hedgeRecommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationModal;
