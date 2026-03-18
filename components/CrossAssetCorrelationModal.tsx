import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  GitBranch,
  BarChart3,
  Shield,
  Activity,
  Sliders,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Info,
  CheckCircle2,
  Target,
  Zap,
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
  CorrelationMatrix,
  CARD_SEGMENT_LABELS,
  ASSET_CLASS_LABELS,
  CardSegment,
  AssetClass,
  TimeWindow,
} from '../lib/analytics/crossAssetCorrelationService';

interface CrossAssetCorrelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: CardInventory[];
}

type Tab = 'matrix' | 'portfolio' | 'hedge' | 'macro' | 'optimizer';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'matrix', label: 'Correlation Matrix', icon: <BarChart3 size={14} /> },
  { key: 'portfolio', label: 'My Portfolio', icon: <Activity size={14} /> },
  { key: 'hedge', label: 'Hedge Signals', icon: <Shield size={14} /> },
  { key: 'macro', label: 'Macro Dashboard', icon: <Globe size={14} /> },
  { key: 'optimizer', label: 'Optimizer', icon: <Sliders size={14} /> },
];

function corrColor(v: number): string {
  if (v >= 0.6) return 'bg-red-500/40 text-red-300';
  if (v >= 0.3) return 'bg-orange-500/30 text-orange-300';
  if (v >= 0.1) return 'bg-yellow-500/20 text-yellow-300';
  if (v > -0.1) return 'bg-slate-600/30 text-slate-300';
  if (v > -0.3) return 'bg-cyan-500/20 text-cyan-300';
  return 'bg-blue-500/30 text-blue-300';
}

function _corrBg(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 0.6) return v > 0 ? '#ef444460' : '#3b82f660';
  if (abs >= 0.3) return v > 0 ? '#f9731640' : '#06b6d440';
  return '#64748b20';
}

function scoreLabel(s: number): string {
  if (s >= 75) return 'Excellent';
  if (s >= 50) return 'Good';
  if (s >= 25) return 'Fair';
  return 'Poor';
}

function scoreColor(s: number): string {
  if (s >= 75) return 'text-green-400';
  if (s >= 50) return 'text-yellow-400';
  if (s >= 25) return 'text-orange-400';
  return 'text-red-400';
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

export const CrossAssetCorrelationModal: React.FC<CrossAssetCorrelationModalProps> = ({
  isOpen,
  onClose,
  inventory,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('matrix');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(90);
  const [hoveredCell, setHoveredCell] = useState<{ seg: CardSegment; asset: AssetClass } | null>(null);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [budget, setBudget] = useState<number>(5000);
  const [selectedEvent, setSelectedEvent] = useState('fed_rate_2022');

  const matrix = useMemo(() => getCorrelationMatrix(timeWindow), [timeWindow]);
  const portfolioCorr = useMemo(() => getPortfolioCorrelationAnalysis(inventory), [inventory]);
  const diversification = useMemo(() => getDiversificationScoreAnalysis(inventory), [inventory]);
  const hedgeSignals = useMemo(() => getHedgeSignals(inventory), [inventory]);
  const macroAlerts = useMemo(() => getMacroAlerts(), []);
  const optimalAlloc = useMemo(() => getOptimalAllocation(budget, riskTolerance), [budget, riskTolerance]);
  const historicalImpact = useMemo(() => getHistoricalMacroImpact(selectedEvent), [selectedEvent]);

  const getCoefficient = useCallback(
    (seg: CardSegment, asset: AssetClass): number => {
      const cell = matrix.cells.find(c => c.segment === seg && c.asset === asset);
      if (!cell) return 0;
      if (timeWindow === 30) return cell.coefficient30d;
      if (timeWindow === 365) return cell.coefficient365d;
      return cell.coefficient90d;
    },
    [matrix, timeWindow]
  );

  if (!isOpen) return null;

  const circumference = 2 * Math.PI * 52;
  const scoreOffset = circumference - (diversification.overall / 100) * circumference;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
              <GitBranch size={22} />
            </div>
            <div>
              <h2 className="text-3xl font-bebas tracking-widest text-white">
                CROSS-ASSET CORRELATION
              </h2>
              <p className="text-xs text-slate-400">
                Macro Hedge Intelligence — Phase 105
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 px-6 gap-1 overflow-x-auto flex-shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.key
                  ? 'text-indigo-400 border-indigo-400'
                  : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ---- Correlation Matrix Tab ---- */}
          {activeTab === 'matrix' && (
            <>
              {/* Time period selector */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">
                  Rolling correlation coefficients between card segments and financial assets
                </p>
                <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                  {([30, 90, 365] as TimeWindow[]).map(w => (
                    <button
                      key={w}
                      onClick={() => setTimeWindow(w)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        timeWindow === w
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {w === 365 ? '1yr' : `${w}d`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Heatmap */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left text-slate-500 p-2 w-28" />
                      {ALL_ASSETS.map(a => (
                        <th
                          key={a}
                          className="text-center text-slate-400 p-2 font-normal"
                        >
                          {ASSET_SHORT[a]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_SEGMENTS.map(seg => (
                      <tr key={seg} className="border-t border-slate-800">
                        <td className="text-slate-300 p-2 font-medium whitespace-nowrap">
                          {SEG_SHORT[seg]}
                        </td>
                        {ALL_ASSETS.map(asset => {
                          const val = getCoefficient(seg, asset);
                          const isHovered =
                            hoveredCell?.seg === seg && hoveredCell?.asset === asset;
                          return (
                            <td
                              key={asset}
                              className="p-1"
                              onMouseEnter={() => setHoveredCell({ seg, asset })}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <div
                                className={`rounded-lg p-2 text-center font-mono transition-all cursor-default ${corrColor(val)} ${
                                  isHovered ? 'ring-2 ring-indigo-400 scale-105' : ''
                                }`}
                                title={`${CARD_SEGMENT_LABELS[seg]} vs ${ASSET_CLASS_LABELS[asset]}: ${val.toFixed(2)}`}
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

              {/* Tooltip panel */}
              {hoveredCell && (
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-indigo-400" />
                    <span className="text-sm text-white font-medium">
                      {CARD_SEGMENT_LABELS[hoveredCell.seg]} vs{' '}
                      {ASSET_CLASS_LABELS[hoveredCell.asset]}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500">30-Day</p>
                      <p className="text-white font-mono">
                        {getCoeffForWindow(matrix, hoveredCell.seg, hoveredCell.asset, 30).toFixed(3)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">90-Day</p>
                      <p className="text-white font-mono">
                        {getCoeffForWindow(matrix, hoveredCell.seg, hoveredCell.asset, 90).toFixed(3)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">365-Day</p>
                      <p className="text-white font-mono">
                        {getCoeffForWindow(matrix, hoveredCell.seg, hoveredCell.asset, 365).toFixed(3)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span>Legend:</span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-red-500/40" /> Strong +
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-orange-500/30" /> Moderate +
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-slate-600/30" /> Neutral
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-cyan-500/20" /> Negative
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-500/30" /> Strong -
                </span>
              </div>
            </>
          )}

          {/* ---- My Portfolio Tab ---- */}
          {activeTab === 'portfolio' && (
            <>
              {/* Diversification Score */}
              <div className="flex items-center gap-6 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="relative flex-shrink-0">
                  <svg width={120} height={120} viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#334155" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke={diversification.overall >= 75 ? '#34d399' : diversification.overall >= 50 ? '#facc15' : diversification.overall >= 25 ? '#fb923c' : '#f87171'}
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={scoreOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bebas ${scoreColor(diversification.overall)}`}>
                      {diversification.overall}
                    </span>
                    <span className="text-[10px] text-slate-500">/ 100</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bebas text-white tracking-wider">
                    DIVERSIFICATION SCORE
                  </h3>
                  <p className={`text-sm font-medium ${scoreColor(diversification.overall)}`}>
                    {scoreLabel(diversification.overall)}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <p className="text-[10px] text-slate-500">Concentration Risk</p>
                      <p className="text-sm text-white">{diversification.concentrationRisk}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Macro Exposure</p>
                      <p className="text-sm text-white">{diversification.macroExposure}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segment breakdown */}
              {portfolioCorr.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm text-slate-300 font-medium">
                    Portfolio Segment Correlations
                  </h4>
                  {portfolioCorr.map(p => (
                    <div
                      key={p.segment}
                      className="bg-slate-800/30 rounded-xl p-4 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-white font-medium">
                            {p.segmentLabel}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {(p.weight * 100).toFixed(1)}% of portfolio
                          </p>
                        </div>
                        <span className="text-xs text-slate-400">
                          Avg |r| = {p.avgCorrelation.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ALL_ASSETS.map(asset => {
                          const val = p.correlations[asset];
                          return (
                            <div
                              key={asset}
                              className={`rounded-lg px-2 py-1 text-[10px] font-mono ${corrColor(val)}`}
                            >
                              {ASSET_SHORT[asset]}: {val > 0 ? '+' : ''}{val.toFixed(2)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-800/30 rounded-xl p-8 text-center border border-slate-700">
                  <Activity size={32} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">
                    Add cards to your collection to see portfolio correlation analysis.
                  </p>
                </div>
              )}

              {/* Improvement tips */}
              {diversification.improvementTips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm text-slate-300 font-medium">
                    Improvement Tips
                  </h4>
                  {diversification.improvementTips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-slate-400 bg-slate-800/20 rounded-lg p-3"
                    >
                      <CheckCircle2 size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                      {tip}
                    </div>
                  ))}
                </div>
              )}

              {/* Per-segment scores */}
              {diversification.segmentScores.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm text-slate-300 font-medium">
                    Segment Diversification Scores
                  </h4>
                  {diversification.segmentScores.map(ss => (
                    <div
                      key={ss.segment}
                      className="bg-slate-800/30 rounded-xl p-3 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-white">{ss.label}</p>
                        <span className={`text-sm font-bebas ${scoreColor(ss.score)}`}>
                          {ss.score}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${ss.score}%`,
                            backgroundColor:
                              ss.score >= 75 ? '#34d399' : ss.score >= 50 ? '#facc15' : '#f87171',
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">{ss.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ---- Hedge Signals Tab ---- */}
          {activeTab === 'hedge' && (
            <>
              <p className="text-sm text-slate-300">
                Actionable recommendations to optimize your portfolio's cross-asset exposure
              </p>

              <div className="space-y-4">
                {hedgeSignals.map(signal => (
                  <div
                    key={signal.id}
                    className={`rounded-2xl p-5 border ${
                      signal.priority === 'high'
                        ? 'bg-red-500/5 border-red-500/20'
                        : signal.priority === 'medium'
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : 'bg-slate-800/30 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          signal.action === 'add'
                            ? 'bg-green-500/10 text-green-400'
                            : signal.action === 'reduce'
                              ? 'bg-red-500/10 text-red-400'
                              : signal.action === 'swap'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        {signal.action === 'add' ? (
                          <TrendingUp size={18} />
                        ) : signal.action === 'reduce' ? (
                          <TrendingDown size={18} />
                        ) : signal.action === 'swap' ? (
                          <Target size={18} />
                        ) : (
                          <Shield size={18} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-medium ${
                              signal.priority === 'high'
                                ? 'bg-red-500/10 text-red-400'
                                : signal.priority === 'medium'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-slate-500/10 text-slate-400'
                            }`}
                          >
                            {signal.priority}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 uppercase font-medium">
                            {signal.action}
                          </span>
                          <span className="text-[10px] text-slate-500 ml-auto">
                            {signal.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-white font-medium mb-1">
                          {signal.description}
                        </p>
                        <p className="text-xs text-slate-400 mb-2">
                          {signal.impactSummary}
                        </p>

                        {/* Correlation change visualization */}
                        <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-2">
                          <div className="text-center">
                            <p className="text-[10px] text-slate-500">Current</p>
                            <p className="text-sm font-mono text-red-400">
                              {signal.currentCorrelation.toFixed(2)}
                            </p>
                          </div>
                          <ArrowRight size={16} className="text-slate-500" />
                          <div className="text-center">
                            <p className="text-[10px] text-slate-500">Projected</p>
                            <p className="text-sm font-mono text-green-400">
                              {signal.projectedCorrelation.toFixed(2)}
                            </p>
                          </div>
                          <div className="ml-auto text-center">
                            <p className="text-[10px] text-slate-500">Reduction</p>
                            <p className="text-sm font-mono text-indigo-400">
                              {(
                                ((signal.currentCorrelation - signal.projectedCorrelation) /
                                  Math.max(0.01, Math.abs(signal.currentCorrelation))) *
                                100
                              ).toFixed(0)}
                              %
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ---- Macro Dashboard Tab ---- */}
          {activeTab === 'macro' && (
            <>
              {/* Active alerts */}
              <div className="space-y-3">
                <h4 className="text-sm text-slate-300 font-medium flex items-center gap-2">
                  <Zap size={14} className="text-amber-400" />
                  Active Macro Alerts
                </h4>
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-white font-medium">
                            {alert.title}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${
                              alert.severity === 'critical'
                                ? 'bg-red-500/10 text-red-400'
                                : alert.severity === 'warning'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-blue-500/10 text-blue-400'
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-[10px]">
                          <span className="text-slate-500">
                            Date: {alert.date}
                          </span>
                          <span
                            className={
                              alert.historicalCardImpact >= 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          >
                            Historical Card Impact:{' '}
                            {alert.historicalCardImpact >= 0 ? '+' : ''}
                            {alert.historicalCardImpact.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {alert.affectedSegments.map(seg => (
                            <span
                              key={seg}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300"
                            >
                              {SEG_SHORT[seg]}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 bg-slate-800/50 rounded-lg p-2">
                          <p className="text-[10px] text-slate-500 mb-0.5">Recommendation</p>
                          <p className="text-xs text-indigo-300">{alert.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Historical Event Selector */}
              <div className="space-y-3">
                <h4 className="text-sm text-slate-300 font-medium">
                  Historical Macro Impact Analysis
                </h4>
                <div className="flex gap-2">
                  {[
                    { key: 'fed_rate_2022', label: 'Fed Rate Hike 2022' },
                    { key: 'covid_stimulus_2020', label: 'COVID Stimulus' },
                    { key: 'great_recession_2008', label: 'Great Recession' },
                  ].map(evt => (
                    <button
                      key={evt.key}
                      onClick={() => setSelectedEvent(evt.key)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        selectedEvent === evt.key
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {evt.label}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                  <h5 className="text-sm text-white font-medium mb-1">
                    {historicalImpact.event}
                  </h5>
                  <p className="text-[10px] text-slate-500 mb-3">
                    {historicalImpact.date}
                  </p>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    {historicalImpact.narrative}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                        Card Segments
                      </p>
                      {historicalImpact.segmentImpacts.map(si => (
                        <div
                          key={si.segment}
                          className="flex items-center justify-between py-1 text-xs"
                        >
                          <span className="text-slate-300">{si.label}</span>
                          <span
                            className={`font-mono ${
                              si.returnPct >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {si.returnPct >= 0 ? '+' : ''}
                            {si.returnPct.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                        Financial Assets
                      </p>
                      {historicalImpact.assetImpacts.map(ai => (
                        <div
                          key={ai.asset}
                          className="flex items-center justify-between py-1 text-xs"
                        >
                          <span className="text-slate-300">{ai.label}</span>
                          <span
                            className={`font-mono ${
                              ai.returnPct >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {ai.returnPct >= 0 ? '+' : ''}
                            {ai.returnPct.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ---- Optimizer Tab ---- */}
          {activeTab === 'optimizer' && (
            <>
              <p className="text-sm text-slate-300">
                Markowitz-style optimal allocation across card segments based on risk tolerance
              </p>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                  <label className="text-xs text-slate-400 block mb-2">
                    Risk Tolerance
                  </label>
                  <div className="flex gap-1">
                    {(['conservative', 'moderate', 'aggressive'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => setRiskTolerance(r)}
                        className={`flex-1 px-2 py-2 text-xs rounded-lg transition-colors capitalize ${
                          riskTolerance === r
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                  <label className="text-xs text-slate-400 block mb-2">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(Math.max(100, Number(e.target.value)))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Allocation bars */}
              <div className="space-y-3">
                <h4 className="text-sm text-slate-300 font-medium">
                  Optimal Allocation — ${budget.toLocaleString()}
                </h4>
                {optimalAlloc.map(alloc => {
                  const dollarAmount = Math.round((alloc.optimalPct / 100) * budget);
                  return (
                    <div
                      key={alloc.segment}
                      className="bg-slate-800/30 rounded-xl p-4 border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white font-medium">
                          {alloc.label}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-indigo-400">
                            {alloc.optimalPct}%
                          </span>
                          <span className="text-xs text-slate-500">
                            ${dollarAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
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
              <div className="bg-indigo-500/5 rounded-xl p-4 border border-indigo-500/20">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-white font-medium">Optimization Summary</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {riskTolerance === 'conservative'
                        ? 'Conservative allocation emphasizes vintage baseball (40%) as low-correlation anchor with strong soccer/international diversification (30%). Minimizes exposure to tech-correlated modern segments.'
                        : riskTolerance === 'moderate'
                          ? 'Balanced allocation across all segments. Equal weighting of vintage baseball and modern basketball provides growth-stability balance. Pokemon/TCG adds asymmetric upside.'
                          : 'Aggressive allocation concentrates in high-growth modern basketball (35%) and Pokemon/TCG (25%). Accepts higher equity/crypto correlation for maximum return potential.'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to get coefficient for a specific window from matrix
function getCoeffForWindow(
  matrix: CorrelationMatrix,
  seg: CardSegment,
  asset: AssetClass,
  window: number
): number {
  const cell = matrix.cells.find(c => c.segment === seg && c.asset === asset);
  if (!cell) return 0;
  if (window === 30) return cell.coefficient30d;
  if (window === 365) return cell.coefficient365d;
  return cell.coefficient90d;
}

export default CrossAssetCorrelationModal;
