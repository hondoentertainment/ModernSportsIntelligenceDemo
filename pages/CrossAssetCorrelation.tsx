import React, { useState, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  GitBranch,
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
  AlertTriangle,
  ArrowLeft,
  Info,
  Check,
  ChevronDown,
  Loader2,
  Download,
} from 'lucide-react';
import {
  ASSET_CLASSES,
  DEFAULT_ASSET_IDS,
  CARD_ASSET_IDS,
  getCorrelationMatrix,
  getTimeSeries,
  getDiversificationScore,
  getMacroRegimeAnalysis,
  getAlphaSignals,
  getEfficientFrontier,
  getDrawdownAnalysis,
  getRollingCorrelation,
  getAssetById,
  type AssetClass,
  type CorrelationMatrix,
  type CrossAssetTimeSeries,
  type DiversificationScore,
  type MacroRegime,
  type AlphaSignal,
  type EfficientFrontierPoint,
  type DrawdownEvent,
  type RollingCorrelationPoint,
} from '../lib/crossAssetService';

// ─── Tab Definitions ─────────────────────────────────────────────────────────

type TabId =
  | 'correlation'
  | 'multi-asset'
  | 'diversification'
  | 'macro'
  | 'alpha'
  | 'drawdown';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: 'correlation', label: 'Correlation Matrix', icon: <BarChart3 size={16} /> },
  { id: 'multi-asset', label: 'Multi-Asset Chart', icon: <TrendingUp size={16} /> },
  { id: 'diversification', label: 'Diversification Analyzer', icon: <Shield size={16} /> },
  { id: 'macro', label: 'Macro Regimes', icon: <GitBranch size={16} /> },
  { id: 'alpha', label: 'Alpha Signals', icon: <Zap size={16} /> },
  { id: 'drawdown', label: 'Drawdown Analysis', icon: <AlertTriangle size={16} /> },
];

const PERIOD_OPTIONS = [
  { value: 12, label: '1Y' },
  { value: 24, label: '2Y' },
  { value: 36, label: '3Y' },
  { value: 60, label: '5Y' },
];

// ─── Color Utilities ─────────────────────────────────────────────────────────

function correlationColor(v: number): string {
  // -1 (red) through 0 (neutral) to +1 (green)
  if (v >= 0.7) return 'rgba(34, 197, 94, 0.7)';
  if (v >= 0.4) return 'rgba(34, 197, 94, 0.4)';
  if (v >= 0.15) return 'rgba(34, 197, 94, 0.2)';
  if (v > -0.15) return 'rgba(100, 116, 139, 0.25)';
  if (v > -0.4) return 'rgba(239, 68, 68, 0.2)';
  if (v > -0.7) return 'rgba(239, 68, 68, 0.4)';
  return 'rgba(239, 68, 68, 0.7)';
}

function correlationTextColor(v: number): string {
  if (v >= 0.4) return '#4ade80';
  if (v >= 0.15) return '#86efac';
  if (v > -0.15) return '#94a3b8';
  if (v > -0.4) return '#fca5a5';
  return '#f87171';
}

function regimeColor(name: string): string {
  switch (name) {
    case 'risk-on': return '#22c55e';
    case 'risk-off': return '#ef4444';
    case 'inflation': return '#f59e0b';
    case 'deflation': return '#3b82f6';
    case 'stagflation': return '#a855f7';
    default: return '#64748b';
  }
}

function regimeBg(name: string): string {
  switch (name) {
    case 'risk-on': return 'bg-green-500/10 border-green-500/20';
    case 'risk-off': return 'bg-red-500/10 border-red-500/20';
    case 'inflation': return 'bg-amber-500/10 border-amber-500/20';
    case 'deflation': return 'bg-blue-500/10 border-blue-500/20';
    case 'stagflation': return 'bg-purple-500/10 border-purple-500/20';
    default: return 'bg-slate-500/10 border-slate-500/20';
  }
}

function strengthLabel(v: number): string {
  if (v >= 0.75) return 'Very Strong';
  if (v >= 0.5) return 'Strong';
  if (v >= 0.25) return 'Moderate';
  return 'Weak';
}

function strengthColor(v: number): string {
  if (v >= 0.75) return 'text-green-400';
  if (v >= 0.5) return 'text-emerald-400';
  if (v >= 0.25) return 'text-yellow-400';
  return 'text-slate-400';
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

interface AssetSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

function AssetSelector({ selectedIds, onChange }: AssetSelectorProps) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        if (selectedIds.length > 2) {
          onChange(selectedIds.filter((i) => i !== id));
        }
      } else {
        onChange([...selectedIds, id]);
      }
    },
    [selectedIds, onChange],
  );

  const categories = useMemo(() => {
    const map = new Map<string, AssetClass[]>();
    for (const a of ASSET_CLASSES) {
      const list = map.get(a.category) ?? [];
      list.push(a);
      map.set(a.category, list);
    }
    return map;
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 hover:border-slate-600 transition-colors"
      >
        <span>{selectedIds.length} assets selected</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-slate-800 border border-slate-700 rounded-xl p-3 w-72 shadow-xl max-h-80 overflow-y-auto">
          {Array.from(categories.entries()).map(([cat, assets]) => (
            <div key={cat} className="mb-3 last:mb-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-medium">
                {cat}
              </p>
              {assets.map((a) => (
                <label
                  key={a.id}
                  className="flex items-center gap-2 py-1 px-2 rounded hover:bg-slate-700/50 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      selectedIds.includes(a.id)
                        ? 'bg-indigo-600 border-indigo-500'
                        : 'border-slate-600'
                    }`}
                  >
                    {selectedIds.includes(a.id) && <Check size={10} className="text-white" />}
                  </div>
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: a.color }}
                  />
                  <span className="text-xs text-slate-300">{a.name}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">{a.ticker}</span>
                </label>
              ))}
            </div>
          ))}
          <div className="border-t border-slate-700 pt-2 mt-2 flex gap-2">
            <button
              onClick={() => onChange(ASSET_CLASSES.map((a) => a.id))}
              className="text-[10px] text-indigo-400 hover:text-indigo-300"
            >
              Select All
            </button>
            <button
              onClick={() => onChange(DEFAULT_ASSET_IDS)}
              className="text-[10px] text-slate-400 hover:text-slate-300"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Correlation Matrix ─────────────────────────────────────────────────

function CorrelationMatrixTab({
  assetIds,
  period,
}: {
  assetIds: string[];
  period: number;
}) {
  const matrix = useMemo(() => getCorrelationMatrix(assetIds, period), [assetIds, period]);
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(null);

  // Also show rolling correlation for hovered pair
  const rollingData = useMemo(() => {
    if (!hovered || hovered.row === hovered.col) return null;
    return getRollingCorrelation(
      matrix.assets[hovered.row],
      matrix.assets[hovered.col],
      12,
    );
  }, [hovered, matrix.assets]);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1"
          style={{
            gridTemplateColumns: `140px repeat(${assetIds.length}, minmax(56px, 1fr))`,
          }}
        >
          {/* Header row */}
          <div />
          {assetIds.map((id) => {
            const asset = getAssetById(id);
            return (
              <div key={id} className="text-center px-1">
                <p className="text-[10px] text-slate-400 truncate">{asset?.ticker ?? id}</p>
              </div>
            );
          })}

          {/* Matrix rows */}
          {assetIds.map((rowId, rowIdx) => {
            const rowAsset = getAssetById(rowId);
            return (
              <React.Fragment key={rowId}>
                <div className="flex items-center gap-2 pr-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: rowAsset?.color }}
                  />
                  <span className="text-xs text-slate-300 truncate">
                    {rowAsset?.ticker ?? rowId}
                  </span>
                </div>
                {assetIds.map((colId, colIdx) => {
                  const val = matrix.matrix[rowIdx]?.[colIdx] ?? 0;
                  const isHov =
                    hovered?.row === rowIdx && hovered?.col === colIdx;
                  const isDiag = rowIdx === colIdx;
                  return (
                    <div
                      key={colId}
                      className={`rounded-lg flex items-center justify-center h-12 font-mono text-xs cursor-default transition-all ${
                        isHov ? 'ring-2 ring-indigo-400 scale-105 z-10' : ''
                      } ${isDiag ? 'opacity-50' : ''}`}
                      style={{ backgroundColor: correlationColor(val) }}
                      onMouseEnter={() => setHovered({ row: rowIdx, col: colIdx })}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <span style={{ color: correlationTextColor(val) }}>
                        {val > 0 ? '+' : ''}
                        {val.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <span>Legend:</span>
        <div className="flex items-center gap-1">
          <span className="w-8 h-3 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.7)' }} />
          <span>-1</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-8 h-3 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.2)' }} />
        </div>
        <div className="flex items-center gap-1">
          <span className="w-8 h-3 rounded" style={{ backgroundColor: 'rgba(100,116,139,0.25)' }} />
          <span>0</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-8 h-3 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.2)' }} />
        </div>
        <div className="flex items-center gap-1">
          <span className="w-8 h-3 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.7)' }} />
          <span>+1</span>
        </div>
      </div>

      {/* Rolling Correlation Chart for Hovered Pair */}
      {hovered && hovered.row !== hovered.col && rollingData && rollingData.length > 0 && (
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-3">
            12-Month Rolling Correlation:{' '}
            <span className="text-white font-medium">
              {getAssetById(matrix.assets[hovered.row])?.name}
            </span>{' '}
            vs{' '}
            <span className="text-white font-medium">
              {getAssetById(matrix.assets[hovered.col])?.name}
            </span>
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={rollingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(v: string) => v.slice(0, 7)}
              />
              <YAxis
                domain={[-1, 1]}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(v: number) => v.toFixed(1)}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
                formatter={(val: number) => [val.toFixed(3), 'Correlation']}
              />
              <Area
                type="monotone"
                dataKey="correlation"
                stroke="#818cf8"
                fill="#818cf8"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Multi-Asset Chart ──────────────────────────────────────────────────

function MultiAssetTab({
  assetIds,
  period,
}: {
  assetIds: string[];
  period: number;
}) {
  const ts = useMemo(() => getTimeSeries(assetIds, period), [assetIds, period]);

  const chartData = useMemo(() => {
    if (!ts.dates.length) return [];
    return ts.dates.map((date, i) => {
      const point: Record<string, string | number> = { date };
      for (const s of ts.series) {
        point[s.assetId] = Math.round(s.values[i] * 100) / 100;
      }
      return point;
    });
  }, [ts]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Normalized to 100 at start. Overlaid line chart across all selected assets.
      </p>
      <ResponsiveContainer width="100%" height={480}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickFormatter={(v: string) => v.slice(0, 7)}
            interval={Math.max(1, Math.floor(chartData.length / 12))}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#64748b' }}
            domain={['dataMin', 'dataMax']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: 11,
            }}
            formatter={(val: number, name: string) => {
              const asset = getAssetById(name);
              return [val.toFixed(2), asset?.name ?? name];
            }}
          />
          <Legend
            formatter={(value: string) => {
              const asset = getAssetById(value);
              return <span className="text-xs">{asset?.ticker ?? value}</span>;
            }}
          />
          {assetIds.map((id) => {
            const asset = getAssetById(id);
            return (
              <Line
                key={id}
                type="monotone"
                dataKey={id}
                stroke={asset?.color ?? '#64748b'}
                strokeWidth={id.startsWith('cards_') ? 2.5 : 1.5}
                dot={false}
                opacity={id.startsWith('cards_') ? 1 : 0.7}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      {/* Return comparison table */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {assetIds.map((id) => {
          const asset = getAssetById(id);
          if (!asset) return null;
          const series = ts.series.find((s) => s.assetId === id);
          const finalVal = series?.values[series.values.length - 1] ?? 100;
          const totalReturn = finalVal - 100;
          return (
            <div
              key={id}
              className="bg-slate-800/40 rounded-lg p-3 border border-slate-700"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: asset.color }}
                />
                <span className="text-xs text-slate-300 truncate">{asset.ticker}</span>
              </div>
              <p
                className={`text-lg font-mono font-semibold ${
                  totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {totalReturn >= 0 ? '+' : ''}
                {totalReturn.toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-500">
                Sharpe: {asset.sharpeRatio.toFixed(2)} | Vol: {asset.volatility.toFixed(1)}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Diversification Analyzer ───────────────────────────────────────────

function DiversificationTab({ assetIds }: { assetIds: string[] }) {
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    for (const id of assetIds) {
      w[id] = id.startsWith('cards_') ? 15 : 10;
    }
    return w;
  });

  const normalizedWeights = useMemo(() => {
    const total = Object.values(weights).reduce((s, v) => s + v, 0);
    return Object.entries(weights).map(([assetId, w]) => ({
      assetId,
      weight: total > 0 ? w / total : 0,
    }));
  }, [weights]);

  const score = useMemo(
    () => getDiversificationScore(normalizedWeights),
    [normalizedWeights],
  );

  const frontier = useMemo(
    () => getEfficientFrontier(assetIds),
    [assetIds],
  );

  const frontierData = useMemo(() => {
    return frontier.map((p, idx) => ({
      ...p,
      name: p.isOptimal ? 'Optimal' : `P${idx}`,
      fill: p.isOptimal ? '#f59e0b' : '#818cf8',
      r: p.isOptimal ? 8 : 4,
    }));
  }, [frontier]);

  // Radar data for the portfolio
  const radarData = useMemo(() => {
    const categories = [
      'Expected Return',
      'Low Volatility',
      'Sharpe Ratio',
      'Diversification',
      'Drawdown Resilience',
      'Recovery Speed',
    ];
    return categories.map((cat) => {
      let value = 0;
      switch (cat) {
        case 'Expected Return':
          value = Math.min(100, Math.max(0, score.efficientFrontierPosition.expectedReturn * 3));
          break;
        case 'Low Volatility':
          value = Math.max(0, 100 - score.efficientFrontierPosition.volatility * 2);
          break;
        case 'Sharpe Ratio':
          value = Math.min(100, Math.max(0, score.overallScore));
          break;
        case 'Diversification':
          value = score.overallScore;
          break;
        case 'Drawdown Resilience':
          value = Math.max(0, 100 - score.maxDrawdown * 3);
          break;
        case 'Recovery Speed':
          value = Math.max(0, 100 - score.recoveryTime * 8);
          break;
      }
      return { category: cat, value: Math.round(value) };
    });
  }, [score]);

  const updateWeight = useCallback((id: string, val: number) => {
    setWeights((prev) => ({ ...prev, [id]: Math.max(0, val) }));
  }, []);

  const circumference = 2 * Math.PI * 54;
  const scoreOffset = circumference - (score.overallScore / 100) * circumference;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Sliders */}
        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-medium text-white mb-4">Portfolio Weights</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {assetIds.map((id) => {
              const asset = getAssetById(id);
              if (!asset) return null;
              return (
                <div key={id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      />
                      <span className="text-xs text-slate-300">{asset.ticker}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {(
                        ((weights[id] ?? 0) /
                          Math.max(
                            1,
                            Object.values(weights).reduce((s, v) => s + v, 0),
                          )) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={weights[id] ?? 10}
                    onChange={(e) => updateWeight(id, Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Efficient Frontier Scatter */}
        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-medium text-white mb-4">Efficient Frontier</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="volatility"
                name="Volatility %"
                tick={{ fontSize: 10, fill: '#64748b' }}
                label={{ value: 'Volatility %', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#94a3b8' }}
              />
              <YAxis
                dataKey="expectedReturn"
                name="Return %"
                tick={{ fontSize: 10, fill: '#64748b' }}
                label={{ value: 'Expected Return %', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: 11,
                }}
                formatter={(val: number, name: string) => [
                  val.toFixed(2) + '%',
                  name,
                ]}
              />
              <Scatter data={frontierData} shape="circle">
                {frontierData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.fill}
                    r={entry.r}
                    stroke={entry.isOptimal ? '#fbbf24' : 'transparent'}
                    strokeWidth={entry.isOptimal ? 2 : 0}
                  />
                ))}
              </Scatter>
              {/* Current portfolio position */}
              <Scatter
                data={[
                  {
                    volatility: score.efficientFrontierPosition.volatility,
                    expectedReturn: score.efficientFrontierPosition.expectedReturn,
                  },
                ]}
                shape="diamond"
                fill="#ec4899"
              >
                <Cell fill="#ec4899" r={8} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-indigo-500" /> Frontier Portfolios
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> Optimal (Max Sharpe)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-pink-500" /> Your Portfolio
            </span>
          </div>
        </div>

        {/* Score & Radar */}
        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700 flex flex-col items-center">
          <h3 className="text-sm font-medium text-white mb-4 self-start">
            Portfolio Score
          </h3>
          <div className="relative mb-4">
            <svg width={120} height={120} viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#334155" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={score.overallScore >= 70 ? '#22c55e' : score.overallScore >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={scoreOffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{score.overallScore}</span>
              <span className="text-[10px] text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full text-center mb-4">
            <div>
              <p className="text-[10px] text-slate-500">Max Drawdown</p>
              <p className="text-sm font-mono text-red-400">-{score.maxDrawdown.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Recovery</p>
              <p className="text-sm font-mono text-blue-400">{score.recoveryTime}mo</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Exp. Return</p>
              <p className="text-sm font-mono text-green-400">
                {score.efficientFrontierPosition.expectedReturn.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Volatility</p>
              <p className="text-sm font-mono text-amber-400">
                {score.efficientFrontierPosition.volatility.toFixed(1)}%
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData} outerRadius={65}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fontSize: 9, fill: '#94a3b8' }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                dataKey="value"
                stroke="#818cf8"
                fill="#818cf8"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Macro Regimes ──────────────────────────────────────────────────────

function MacroRegimesTab() {
  const regimes = useMemo(() => getMacroRegimeAnalysis(), []);
  const [selectedRegime, setSelectedRegime] = useState<string>(regimes[0]?.name ?? 'risk-on');

  const activeRegime = useMemo(
    () => regimes.find((r) => r.name === selectedRegime) ?? regimes[0],
    [regimes, selectedRegime],
  );

  const barData = useMemo(() => {
    if (!activeRegime) return [];
    return activeRegime.assetPerformance.map((ap) => {
      const asset = getAssetById(ap.assetId);
      return {
        name: asset?.ticker ?? ap.assetId,
        return: ap.return,
        fill: ap.return >= 0 ? '#22c55e' : '#ef4444',
        color: asset?.color ?? '#64748b',
      };
    });
  }, [activeRegime]);

  // Comparison radar across all regimes for sports cards
  const radarCompare = useMemo(() => {
    return regimes.map((r) => {
      const cardPerf = r.assetPerformance.find((a) => a.assetId === 'cards_all');
      const sp500Perf = r.assetPerformance.find((a) => a.assetId === 'sp500');
      const btcPerf = r.assetPerformance.find((a) => a.assetId === 'btc');
      const goldPerf = r.assetPerformance.find((a) => a.assetId === 'gold');
      return {
        regime: r.name,
        'Sports Cards': cardPerf?.return ?? 0,
        'S&P 500': sp500Perf?.return ?? 0,
        Bitcoin: btcPerf?.return ?? 0,
        Gold: goldPerf?.return ?? 0,
      };
    });
  }, [regimes]);

  return (
    <div className="space-y-6">
      {/* Regime Selector */}
      <div className="flex flex-wrap gap-2">
        {regimes.map((r) => (
          <button
            key={r.name}
            onClick={() => setSelectedRegime(r.name)}
            className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${
              selectedRegime === r.name
                ? regimeBg(r.name) + ' text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: regimeColor(r.name) }}
            />
            {r.name} ({r.period})
          </button>
        ))}
      </div>

      {activeRegime && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Bars */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700">
            <h3 className="text-sm font-medium text-white mb-1 capitalize">
              {activeRegime.name} Regime Performance
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">{activeRegime.period}</p>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={60}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: 11,
                  }}
                  formatter={(val: number) => [`${val.toFixed(1)}%`, 'Return']}
                />
                <ReferenceLine x={0} stroke="#475569" />
                <Bar dataKey="return" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cross-regime comparison */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700">
            <h3 className="text-sm font-medium text-white mb-1">
              Cards vs Traditional Assets Across Regimes
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">
              Performance comparison during each macro regime
            </p>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={radarCompare}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="regime"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: 11,
                  }}
                  formatter={(val: number) => [`${val.toFixed(1)}%`]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar dataKey="Sports Cards" fill="#ec4899" radius={[2, 2, 0, 0]} />
                <Bar dataKey="S&P 500" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Bitcoin" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Gold" fill="#eab308" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Key Insight */}
      <div className="bg-indigo-500/5 rounded-xl p-4 border border-indigo-500/20 flex items-start gap-3">
        <Info size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-white font-medium mb-1">
            Sports Cards: The Regime-Resilient Asset
          </p>
          <p className="text-xs text-slate-400">
            Historical analysis shows sports cards exhibit positive returns in 3 of 5 macro regimes,
            with notably smaller drawdowns during risk-off periods compared to equities and crypto.
            During inflationary regimes, cards outperformed the S&P 500 by an average of 17 percentage points.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Alpha Signals ──────────────────────────────────────────────────────

function AlphaSignalsTab() {
  const signals = useMemo(() => getAlphaSignals(), []);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Detected cross-asset leading indicators and mean-reversion signals based on 5-year
        historical backtesting.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {signals.map((signal, idx) => {
          const asset1 = getAssetById(signal.assetPair[0]);
          const asset2 = getAssetById(signal.assetPair[1]);
          return (
            <div
              key={idx}
              className="bg-slate-800/40 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap
                    size={14}
                    className={
                      signal.strength >= 0.7
                        ? 'text-amber-400'
                        : signal.strength >= 0.5
                          ? 'text-indigo-400'
                          : 'text-slate-400'
                    }
                  />
                  <span className="text-sm text-white font-medium">{signal.signal}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-medium ${
                    signal.direction === 'long'
                      ? 'bg-green-500/10 text-green-400'
                      : signal.direction === 'short'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-purple-500/10 text-purple-400'
                  }`}
                >
                  {signal.direction}
                </span>
              </div>

              {/* Asset Pair */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: asset1?.color }}
                />
                <span className="text-xs text-slate-300">{asset1?.name}</span>
                <span className="text-slate-600 text-xs">→</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: asset2?.color }}
                />
                <span className="text-xs text-slate-300">{asset2?.name}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {signal.description}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500 mb-0.5">Strength</p>
                  <p className={`text-sm font-mono font-medium ${strengthColor(signal.strength)}`}>
                    {(signal.strength * 100).toFixed(0)}%
                  </p>
                  <p className={`text-[10px] ${strengthColor(signal.strength)}`}>
                    {strengthLabel(signal.strength)}
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500 mb-0.5">Confidence</p>
                  <p className="text-sm font-mono font-medium text-blue-400">
                    {(signal.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500 mb-0.5">Accuracy</p>
                  <p className="text-sm font-mono font-medium text-emerald-400">
                    {(signal.historicalAccuracy * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Date */}
              <p className="text-[10px] text-slate-600 mt-3">
                Detected: {signal.detectedDate}
              </p>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/20 flex items-start gap-2">
        <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-slate-400">
          Alpha signals are based on historical backtesting and do not guarantee future performance.
          Past correlations may break down during unprecedented market events. Always conduct your own
          due diligence.
        </p>
      </div>
    </div>
  );
}

// ─── Tab: Drawdown Analysis ──────────────────────────────────────────────────

function DrawdownTab({ assetIds, period }: { assetIds: string[]; period: number }) {
  const [selectedAsset, setSelectedAsset] = useState(
    assetIds.includes('cards_all') ? 'cards_all' : assetIds[0],
  );

  const drawdowns = useMemo(
    () => getDrawdownAnalysis(selectedAsset),
    [selectedAsset],
  );

  // Max drawdown comparison across all assets
  const comparisonData = useMemo(() => {
    return assetIds.map((id) => {
      const dd = getDrawdownAnalysis(id);
      const maxDD = dd.reduce(
        (max, d) => (d.drawdownPct > max ? d.drawdownPct : max),
        0,
      );
      const asset = getAssetById(id);
      const avgRecovery =
        dd.filter((d) => d.recoveryMonths != null).length > 0
          ? dd
              .filter((d) => d.recoveryMonths != null)
              .reduce((s, d) => s + (d.recoveryMonths ?? 0), 0) /
            dd.filter((d) => d.recoveryMonths != null).length
          : 0;
      return {
        name: asset?.ticker ?? id,
        maxDrawdown: -maxDD,
        avgRecovery: Math.round(avgRecovery * 10) / 10,
        color: asset?.color ?? '#64748b',
        numEvents: dd.length,
      };
    });
  }, [assetIds]);

  // Time series for drawdown waterfall
  const ts = useMemo(() => getTimeSeries([selectedAsset], period), [selectedAsset, period]);

  const drawdownSeries = useMemo(() => {
    const series = ts.series.find((s) => s.assetId === selectedAsset);
    if (!series) return [];
    const values = series.values;
    let peak = values[0];
    return ts.dates.map((date, i) => {
      if (values[i] > peak) peak = values[i];
      const dd = ((values[i] - peak) / peak) * 100;
      return { date, drawdown: Math.round(dd * 100) / 100 };
    });
  }, [ts, selectedAsset]);

  const asset = getAssetById(selectedAsset);

  return (
    <div className="space-y-6">
      {/* Asset selector for detailed view */}
      <div className="flex flex-wrap gap-2">
        {assetIds.map((id) => {
          const a = getAssetById(id);
          return (
            <button
              key={id}
              onClick={() => setSelectedAsset(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors border ${
                selectedAsset === id
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: a?.color }}
              />
              {a?.ticker ?? id}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drawdown Waterfall */}
        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-medium text-white mb-1">
            Drawdown Profile: {asset?.name ?? selectedAsset}
          </h3>
          <p className="text-[10px] text-slate-500 mb-4">
            Peak-to-trough drawdowns over the analysis period
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={drawdownSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(v: string) => v.slice(0, 7)}
                interval={Math.max(1, Math.floor(drawdownSeries.length / 8))}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(v: number) => `${v}%`}
                domain={['dataMin', 0]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: 11,
                }}
                formatter={(val: number) => [`${val.toFixed(2)}%`, 'Drawdown']}
              />
              <ReferenceLine y={0} stroke="#475569" />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Max Drawdown Comparison */}
        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-medium text-white mb-1">
            Max Drawdown Comparison
          </h3>
          <p className="text-[10px] text-slate-500 mb-4">
            Worst peak-to-trough declines across assets
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={comparisonData.sort((a, b) => a.maxDrawdown - b.maxDrawdown)}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={50}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: 11,
                }}
                formatter={(val: number) => [`${val.toFixed(1)}%`, 'Max Drawdown']}
              />
              <Bar dataKey="maxDrawdown" radius={[0, 4, 4, 0]}>
                {comparisonData
                  .sort((a, b) => a.maxDrawdown - b.maxDrawdown)
                  .map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} fillOpacity={0.7} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drawdown Events Table */}
      {drawdowns.length > 0 && (
        <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-medium text-white mb-4">
            Drawdown Events: {asset?.name ?? selectedAsset}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase tracking-wider">
                  <th className="text-left p-2">Peak Date</th>
                  <th className="text-left p-2">Trough Date</th>
                  <th className="text-right p-2">Drawdown</th>
                  <th className="text-right p-2">Peak Value</th>
                  <th className="text-right p-2">Trough Value</th>
                  <th className="text-right p-2">Recovery</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {drawdowns.map((dd, idx) => (
                  <tr key={idx} className="border-t border-slate-700/50">
                    <td className="p-2 text-xs text-slate-300">{dd.peakDate}</td>
                    <td className="p-2 text-xs text-slate-300">{dd.troughDate}</td>
                    <td className="p-2 text-xs text-red-400 font-mono text-right">
                      -{dd.drawdownPct.toFixed(1)}%
                    </td>
                    <td className="p-2 text-xs text-slate-400 font-mono text-right">
                      {dd.peakValue.toFixed(1)}
                    </td>
                    <td className="p-2 text-xs text-slate-400 font-mono text-right">
                      {dd.troughValue.toFixed(1)}
                    </td>
                    <td className="p-2 text-xs text-right font-mono">
                      {dd.recoveryMonths != null ? (
                        <span className="text-green-400">{dd.recoveryMonths}mo</span>
                      ) : (
                        <span className="text-amber-400">--</span>
                      )}
                    </td>
                    <td className="p-2">
                      {dd.recoveryDate ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                          Recovered
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insight */}
      <div className="bg-indigo-500/5 rounded-xl p-4 border border-indigo-500/20 flex items-start gap-3">
        <Info size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-white font-medium mb-1">
            Drawdown Resilience Advantage
          </p>
          <p className="text-xs text-slate-400">
            The Sports Cards Index exhibits shallower maximum drawdowns than Bitcoin (-62%),
            NASDAQ (-33%), and Oil (-54%), while maintaining competitive risk-adjusted returns.
            Average recovery time for card drawdowns is 4.2 months vs 8.6 months for crypto assets.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

interface CrossAssetCorrelationPageProps {
  inventory?: unknown[];
  onBack?: () => void;
}

const CrossAssetCorrelation: React.FC<CrossAssetCorrelationPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('correlation');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(DEFAULT_ASSET_IDS);
  const [period, setPeriod] = useState<number>(60);
  const [loading, setLoading] = useState(false);

  // Simulate loading on tab/asset changes
  const handleTabChange = useCallback((tab: TabId) => {
    setLoading(true);
    setActiveTab(tab);
    setTimeout(() => setLoading(false), 300);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1419] text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-[#141a21]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <GitBranch size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">
                    Cross-Asset Correlation Engine
                  </h1>
                  <p className="text-xs text-slate-500">
                    Prove sports cards as an investable alternative asset class through
                    cross-market analysis
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AssetSelector
                selectedIds={selectedAssetIds}
                onChange={setSelectedAssetIds}
              />
              <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                {PERIOD_OPTIONS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value)}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                      period === p.value
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mb-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'bg-slate-800/60 text-white border-indigo-500'
                    : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/30'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="text-indigo-400 animate-spin" />
              <p className="text-sm text-slate-500">Loading analysis...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'correlation' && (
              <CorrelationMatrixTab assetIds={selectedAssetIds} period={period} />
            )}
            {activeTab === 'multi-asset' && (
              <MultiAssetTab assetIds={selectedAssetIds} period={period} />
            )}
            {activeTab === 'diversification' && (
              <DiversificationTab assetIds={selectedAssetIds} />
            )}
            {activeTab === 'macro' && <MacroRegimesTab />}
            {activeTab === 'alpha' && <AlphaSignalsTab />}
            {activeTab === 'drawdown' && (
              <DrawdownTab assetIds={selectedAssetIds} period={period} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CrossAssetCorrelation;
