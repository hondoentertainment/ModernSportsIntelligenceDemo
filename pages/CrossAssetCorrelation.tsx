import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  BarChart3,
  Shield,
  Activity,
  Sliders,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle2,
  Target,
  Globe,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getCorrelationMatrix,
  getPortfolioCorrelationAnalysis,
  getDiversificationScoreAnalysis,
  getHedgeSignals,
  getMacroAlerts,
  getHistoricalMacroImpact,
  getOptimalAllocation,
  CARD_SEGMENT_LABELS,
  ASSET_CLASS_LABELS,
  CardSegment,
  AssetClass,
  TimeWindow,
} from '../lib/crossAssetCorrelationService';

interface CrossAssetCorrelationPageProps {
  inventory: CardInventory[];
  onBack?: () => void;
}

function corrColor(v: number): string {
  if (v >= 0.6) return 'bg-red-500/40 text-red-300';
  if (v >= 0.3) return 'bg-orange-500/30 text-orange-300';
  if (v >= 0.1) return 'bg-yellow-500/20 text-yellow-300';
  if (v > -0.1) return 'bg-slate-600/30 text-slate-300';
  if (v > -0.3) return 'bg-cyan-500/20 text-cyan-300';
  return 'bg-blue-500/30 text-blue-300';
}

function scoreColor(s: number): string {
  if (s >= 75) return 'text-green-400';
  if (s >= 50) return 'text-yellow-400';
  if (s >= 25) return 'text-orange-400';
  return 'text-red-400';
}

function scoreRingColor(s: number): string {
  if (s >= 75) return '#34d399';
  if (s >= 50) return '#facc15';
  if (s >= 25) return '#fb923c';
  return '#f87171';
}

const SEG_SHORT: Record<CardSegment, string> = {
  modern_basketball_rookies: 'Bball Rookies',
  vintage_baseball: 'Vintage BB',
  modern_football: 'Football',
  pokemon_tcg: 'Pokemon/TCG',
  soccer_international: 'Soccer/Intl',
};

const ASSET_SHORT: Record<AssetClass, string> = {
  sp500: 'S&P 500',
  nasdaq: 'NASDAQ',
  bitcoin: 'BTC',
  ethereum: 'ETH',
  gold: 'Gold',
  bonds_10y: '10Y Bond',
  cpi_inflation: 'CPI',
  reit_index: 'REIT',
};

const ALL_SEGMENTS: CardSegment[] = [
  'modern_basketball_rookies',
  'vintage_baseball',
  'modern_football',
  'pokemon_tcg',
  'soccer_international',
];

const ALL_ASSETS: AssetClass[] = [
  'sp500', 'nasdaq', 'bitcoin', 'ethereum', 'gold', 'bonds_10y', 'cpi_inflation', 'reit_index',
];

const CrossAssetCorrelation: React.FC<CrossAssetCorrelationPageProps> = ({
  inventory,
  onBack,
}) => {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(90);
  const [hoveredCell, setHoveredCell] = useState<{ seg: CardSegment; asset: AssetClass } | null>(null);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [budget, setBudget] = useState<number>(5000);
  const [selectedEvent, setSelectedEvent] = useState('fed_rate_2022');
  const [_loading, _setLoading] = useState(false);

  const matrix = useMemo(() => getCorrelationMatrix(timeWindow), [timeWindow]);
  const portfolioCorr = useMemo(() => getPortfolioCorrelationAnalysis(inventory), [inventory]);
  const diversification = useMemo(() => getDiversificationScoreAnalysis(inventory), [inventory]);
  const hedgeSignals = useMemo(() => getHedgeSignals(inventory), [inventory]);
  const macroAlerts = useMemo(() => getMacroAlerts(), []);
  const optimalAlloc = useMemo(() => getOptimalAllocation(budget, riskTolerance), [budget, riskTolerance]);
  const historicalImpact = useMemo(() => getHistoricalMacroImpact(selectedEvent), [selectedEvent]);

  const getCoefficient = (seg: CardSegment, asset: AssetClass): number => {
    const cell = matrix.cells.find(c => c.segment === seg && c.asset === asset);
    if (!cell) return 0;
    if (timeWindow === 30) return cell.coefficient30d;
    if (timeWindow === 365) return cell.coefficient365d;
    return cell.coefficient90d;
  };

  const score = diversification.overall;
  const circumference = 2 * Math.PI * 60;
  const scoreOffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-brand-charcoal text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-brand-slate/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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
                <h1 className="text-4xl font-bebas tracking-widest text-white">
                  CROSS-ASSET CORRELATION
                </h1>
                <p className="text-xs text-slate-400">
                  Macro Hedge Intelligence — Portfolio-Level Analysis
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {([30, 90, 365] as TimeWindow[]).map(w => (
              <button
                key={w}
                onClick={() => setTimeWindow(w)}
                className={`px-4 py-1.5 text-xs rounded-md transition-colors ${
                  timeWindow === w
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {w === 365 ? '1 Year' : `${w} Day`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* ---- Interactive Correlation Heatmap (Large) ---- */}
        <section className="bg-brand-slate rounded-[2.5rem] p-8 border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={20} className="text-indigo-400" />
            <h2 className="text-2xl font-bebas tracking-widest">CORRELATION HEATMAP</h2>
            <span className="text-xs text-slate-500 ml-2">
              {timeWindow === 365 ? '1 Year' : `${timeWindow} Day`} Rolling Window
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-slate-500 p-3 w-40 text-xs uppercase tracking-wider">
                    Segment \ Asset
                  </th>
                  {ALL_ASSETS.map(a => (
                    <th key={a} className="text-center text-slate-400 p-3 text-xs font-normal">
                      {ASSET_SHORT[a]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_SEGMENTS.map(seg => (
                  <tr key={seg} className="border-t border-slate-800/50">
                    <td className="text-slate-200 p-3 font-medium text-xs">
                      {SEG_SHORT[seg]}
                    </td>
                    {ALL_ASSETS.map(asset => {
                      const val = getCoefficient(seg, asset);
                      const isHovered =
                        hoveredCell?.seg === seg && hoveredCell?.asset === asset;
                      return (
                        <td
                          key={asset}
                          className="p-1.5"
                          onMouseEnter={() => setHoveredCell({ seg, asset })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <div
                            className={`rounded-xl p-3 text-center font-mono text-sm transition-all cursor-default ${corrColor(val)} ${
                              isHovered ? 'ring-2 ring-indigo-400 scale-105 shadow-lg' : ''
                            }`}
                          >
                            {val > 0 ? '+' : ''}{val.toFixed(2)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hovered detail */}
          {hoveredCell && (
            <div className="mt-4 bg-slate-800/60 rounded-xl p-4 border border-slate-700 flex items-center gap-6">
              <Info size={16} className="text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">
                  {CARD_SEGMENT_LABELS[hoveredCell.seg]} vs {ASSET_CLASS_LABELS[hoveredCell.asset]}
                </p>
                <div className="flex gap-6 mt-1 text-xs">
                  {([30, 90, 365] as const).map(w => {
                    const cell = matrix.cells.find(
                      c => c.segment === hoveredCell.seg && c.asset === hoveredCell.asset
                    );
                    const v = w === 30 ? cell?.coefficient30d : w === 90 ? cell?.coefficient90d : cell?.coefficient365d;
                    return (
                      <span key={w} className={w === timeWindow ? 'text-indigo-400 font-medium' : 'text-slate-400'}>
                        {w === 365 ? '1yr' : `${w}d`}: <span className="font-mono">{(v ?? 0).toFixed(3)}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-500">
            <span>Legend:</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/40" /> Strong Positive ({'>'}0.6)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500/30" /> Moderate (+0.3)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-600/30" /> Neutral</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-500/20" /> Negative</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500/30" /> Strong Negative ({'<'}-0.3)</span>
          </div>
        </section>

        {/* ---- Portfolio Correlation Analysis ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Diversification Score */}
          <section className="bg-brand-slate rounded-[2.5rem] p-8 border border-slate-800 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 self-start">
              <Target size={18} className="text-indigo-400" />
              <h2 className="text-xl font-bebas tracking-widest">DIVERSIFICATION SCORE</h2>
            </div>
            <div className="relative my-4">
              <svg width={140} height={140} viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" fill="none" stroke="#334155" strokeWidth="10" />
                <circle
                  cx="70" cy="70" r="60" fill="none"
                  stroke={scoreRingColor(score)}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={scoreOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bebas ${scoreColor(score)}`}>{score}</span>
                <span className="text-[10px] text-slate-500">/ 100</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center w-full mt-2">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Concentration</p>
                <p className="text-lg font-bebas text-white">{diversification.concentrationRisk}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Macro Exposure</p>
                <p className="text-lg font-bebas text-white">{diversification.macroExposure}%</p>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-4 space-y-2 w-full">
              {diversification.improvementTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] text-slate-400">
                  <CheckCircle2 size={12} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          </section>

          {/* Portfolio Segment Correlations */}
          <section className="lg:col-span-2 bg-brand-slate rounded-[2.5rem] p-8 border border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-indigo-400" />
              <h2 className="text-xl font-bebas tracking-widest">PORTFOLIO CORRELATIONS</h2>
            </div>
            {portfolioCorr.length > 0 ? (
              <div className="space-y-4">
                {portfolioCorr.map(p => (
                  <div key={p.segment} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-white font-medium">{p.segmentLabel}</p>
                        <p className="text-[10px] text-slate-500">{(p.weight * 100).toFixed(1)}% of portfolio</p>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Avg |r| = {p.avgCorrelation.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ALL_ASSETS.map(asset => {
                        const val = p.correlations[asset];
                        return (
                          <div key={asset} className={`rounded-lg px-2.5 py-1.5 text-xs font-mono ${corrColor(val)}`}>
                            {ASSET_SHORT[asset]}: {val > 0 ? '+' : ''}{val.toFixed(2)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/20 rounded-xl p-12 text-center border border-slate-700">
                <Activity size={40} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Add cards to see portfolio correlation analysis.</p>
              </div>
            )}
          </section>
        </div>

        {/* ---- Macro Economic Dashboard ---- */}
        <section className="bg-brand-slate rounded-[2.5rem] p-8 border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={20} className="text-amber-400" />
            <h2 className="text-2xl font-bebas tracking-widest">MACRO ECONOMIC DASHBOARD</h2>
          </div>

          {/* Active Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {macroAlerts.map(alert => (
              <div
                key={alert.id}
                className={`rounded-xl p-4 border ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/5 border-red-500/20'
                    : alert.severity === 'warning'
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-blue-500/5 border-blue-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={16}
                    className={
                      alert.severity === 'critical'
                        ? 'text-red-400'
                        : alert.severity === 'warning'
                          ? 'text-amber-400'
                          : 'text-blue-400'
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-white font-medium truncate">{alert.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                        alert.severity === 'critical'
                          ? 'bg-red-500/10 text-red-400'
                          : alert.severity === 'warning'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-blue-500/10 text-blue-400'
                      }`}>{alert.severity}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2 line-clamp-2">{alert.description}</p>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-slate-500">{alert.date}</span>
                      <span className={alert.historicalCardImpact >= 0 ? 'text-green-400' : 'text-red-400'}>
                        Cards: {alert.historicalCardImpact >= 0 ? '+' : ''}{alert.historicalCardImpact.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 bg-slate-800/50 rounded-lg p-2">
                      <p className="text-[10px] text-indigo-300">{alert.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Historical Event Analysis */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-bebas tracking-wider mb-4">HISTORICAL IMPACT ANALYSIS</h3>
            <div className="flex gap-2 mb-4">
              {[
                { key: 'fed_rate_2022', label: 'Fed Rate Hike 2022' },
                { key: 'covid_stimulus_2020', label: 'COVID Stimulus 2020' },
                { key: 'great_recession_2008', label: 'Great Recession 2008' },
              ].map(evt => (
                <button
                  key={evt.key}
                  onClick={() => setSelectedEvent(evt.key)}
                  className={`px-4 py-2 text-xs rounded-lg transition-colors ${
                    selectedEvent === evt.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {evt.label}
                </button>
              ))}
            </div>

            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
              <h4 className="text-base text-white font-medium mb-1">{historicalImpact.event}</h4>
              <p className="text-xs text-slate-500 mb-3">{historicalImpact.date}</p>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">{historicalImpact.narrative}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 font-medium">Card Segment Returns</p>
                  {historicalImpact.segmentImpacts.map(si => (
                    <div key={si.segment} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                      <span className="text-sm text-slate-300">{si.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${si.returnPct >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, Math.abs(si.returnPct))}%` }}
                          />
                        </div>
                        <span className={`text-sm font-mono w-16 text-right ${si.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {si.returnPct >= 0 ? '+' : ''}{si.returnPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 font-medium">Financial Asset Returns</p>
                  {historicalImpact.assetImpacts.map(ai => (
                    <div key={ai.asset} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                      <span className="text-sm text-slate-300">{ai.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${ai.returnPct >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, Math.abs(ai.returnPct) / (selectedEvent === 'covid_stimulus_2020' ? 5 : 1))}%` }}
                          />
                        </div>
                        <span className={`text-sm font-mono w-16 text-right ${ai.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {ai.returnPct >= 0 ? '+' : ''}{ai.returnPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Hedge Signals & Optimizer ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hedge Signal Recommendations */}
          <section className="bg-brand-slate rounded-[2.5rem] p-8 border border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={20} className="text-green-400" />
              <h2 className="text-2xl font-bebas tracking-widest">HEDGE SIGNALS</h2>
            </div>

            <div className="space-y-4">
              {hedgeSignals.map(signal => (
                <div
                  key={signal.id}
                  className={`rounded-xl p-4 border ${
                    signal.priority === 'high'
                      ? 'bg-red-500/5 border-red-500/20'
                      : signal.priority === 'medium'
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-slate-800/30 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-medium ${
                      signal.priority === 'high'
                        ? 'bg-red-500/10 text-red-400'
                        : signal.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-slate-500/10 text-slate-400'
                    }`}>{signal.priority}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 uppercase">
                      {signal.action}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-auto">{signal.confidence}% conf</span>
                  </div>
                  <p className="text-sm text-white mb-1">{signal.description}</p>
                  <p className="text-xs text-slate-400 mb-3">{signal.impactSummary}</p>
                  <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-2">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500">Current</p>
                      <p className="text-sm font-mono text-red-400">{signal.currentCorrelation.toFixed(2)}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-500" />
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500">Target</p>
                      <p className="text-sm font-mono text-green-400">{signal.projectedCorrelation.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Allocation Optimizer */}
          <section className="bg-brand-slate rounded-[2.5rem] p-8 border border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <Sliders size={20} className="text-indigo-400" />
              <h2 className="text-2xl font-bebas tracking-widest">ALLOCATION OPTIMIZER</h2>
            </div>

            {/* Controls */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-slate-400 block mb-2">Risk Tolerance</label>
                <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                  {(['conservative', 'moderate', 'aggressive'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setRiskTolerance(r)}
                      className={`flex-1 px-2 py-2 text-xs rounded-md transition-colors capitalize ${
                        riskTolerance === r
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-2">Budget ($)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(Math.max(100, Number(e.target.value)))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Allocations */}
            <div className="space-y-3">
              {optimalAlloc.map(alloc => {
                const dollarAmt = Math.round((alloc.optimalPct / 100) * budget);
                return (
                  <div key={alloc.segment} className="bg-slate-800/30 rounded-xl p-3 border border-slate-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{alloc.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-indigo-400">{alloc.optimalPct}%</span>
                        <span className="text-[10px] text-slate-500">${dollarAmt.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-1.5">
                      <div
                        className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${alloc.optimalPct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">{alloc.rationale}</p>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-4 bg-indigo-500/5 rounded-xl p-3 border border-indigo-500/20">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-400">
                  {riskTolerance === 'conservative'
                    ? 'Conservative: Anchored by vintage baseball (40%) and soccer (30%) for maximum cross-asset decorrelation.'
                    : riskTolerance === 'moderate'
                      ? 'Moderate: Balanced across all segments for growth-stability equilibrium.'
                      : 'Aggressive: Concentrated in high-beta modern rookies (35%) and Pokemon/TCG (25%) for maximum upside.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CrossAssetCorrelation;
