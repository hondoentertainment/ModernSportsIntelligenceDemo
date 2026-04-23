// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  FlaskConical,
  Play,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Target,
  Lightbulb,
  Plus,
  Trash2,
  BarChart3,
  Clock,
  Shield,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CardInventory } from '../types';
import {
  StressScenario,
  StressTestResult,
  ScenarioShock,
  TimeHorizon,
  runStressTest,
  getAllScenarios,
  createCustomScenario,
  deleteCustomScenario,
  getRiskScoreLabel,
  getScenarioCategoryColor,
  PRESET_SCENARIOS,
} from '../lib/analytics/stressTestService';

interface StressTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'scenarios' | 'montecarlo' | 'var' | 'concentration' | 'hedging';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'scenarios', label: 'Scenarios', icon: <FlaskConical size={16} /> },
  { id: 'montecarlo', label: 'Monte Carlo', icon: <BarChart3 size={16} /> },
  { id: 'var', label: 'VaR & Drawdown', icon: <TrendingDown size={16} /> },
  { id: 'concentration', label: 'Concentration', icon: <Target size={16} /> },
  { id: 'hedging', label: 'Hedging', icon: <Lightbulb size={16} /> },
];

const HORIZONS: { value: TimeHorizon; label: string }[] = [
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
  { value: 365, label: '1 Year' },
  { value: 730, label: '2 Years' },
  { value: 1825, label: '5 Years' },
];

const SHOCK_TARGETS: { value: ScenarioShock['target']; label: string }[] = [
  { value: 'all', label: 'All Cards' },
  { value: 'Baseball', label: 'Baseball' },
  { value: 'Basketball', label: 'Basketball' },
  { value: 'Football', label: 'Football' },
  { value: 'Hockey', label: 'Hockey' },
  { value: 'Soccer', label: 'Soccer' },
  { value: 'graded', label: 'Graded Only' },
  { value: 'ungraded', label: 'Ungraded Only' },
  { value: 'high_value', label: 'High Value ($500+)' },
  { value: 'low_value', label: 'Low Value (<$500)' },
];

function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function getRiskBadge(level: string): { color: string; bg: string; border: string } {
  switch (level) {
    case 'critical': return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    case 'high': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    case 'medium': return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
  }
}

const priorityColor: Record<string, { text: string; bg: string; border: string }> = {
  high: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  medium: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  low: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
};

const categoryIcon: Record<string, React.ReactNode> = {
  diversify: <Layers size={16} />,
  reduce: <TrendingDown size={16} />,
  hedge: <Shield size={16} />,
  rebalance: <Activity size={16} />,
};

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

interface FanTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const FanChartTooltip: React.FC<FanTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data: Record<string, number> = {};
  for (const p of payload) {
    data[p.name] = p.value;
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-slate-400 font-bold mb-2">Month {label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-red-400">P95 (Bull):</span>
          <span className="text-white font-mono">{formatCurrency(data['p95'] ?? 0)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-blue-400">P75:</span>
          <span className="text-white font-mono">{formatCurrency(data['p75'] ?? 0)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-purple-400 font-bold">Median:</span>
          <span className="text-white font-mono font-bold">{formatCurrency(data['p50'] ?? 0)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-blue-400">P25:</span>
          <span className="text-white font-mono">{formatCurrency(data['p25'] ?? 0)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-red-400">P5 (Bear):</span>
          <span className="text-white font-mono">{formatCurrency(data['p5'] ?? 0)}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Modal ─────────────────────────────────────────────────────────────

export const StressTestModal: React.FC<StressTestModalProps> = ({ isOpen, onClose, cards }) => {
  const [activeTab, setActiveTab] = useState<TabId>('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<StressScenario>(PRESET_SCENARIOS[0]);
  const [horizon, setHorizon] = useState<TimeHorizon>(365);
  const [result, setResult] = useState<StressTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Custom scenario builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customShocks, setCustomShocks] = useState<ScenarioShock[]>([
    { target: 'all', magnitude: -0.20, durationMonths: 6, recoveryMonths: 12 },
  ]);

  const scenarios = useMemo(() => getAllScenarios(), []);

  const handleRunTest = useCallback(() => {
    if (cards.length === 0) return;
    setIsRunning(true);
    // Simulate async for UX
    setTimeout(() => {
      const res = runStressTest(cards, selectedScenario, horizon);
      setResult(res);
      setIsRunning(false);
      setActiveTab('montecarlo');
    }, 100);
  }, [cards, selectedScenario, horizon]);

  const handleCreateCustom = useCallback(() => {
    if (!customName.trim()) return;
    const s = createCustomScenario(customName.trim(), customDesc.trim(), customShocks);
    setSelectedScenario(s);
    setShowBuilder(false);
    setCustomName('');
    setCustomDesc('');
    setCustomShocks([{ target: 'all', magnitude: -0.20, durationMonths: 6, recoveryMonths: 12 }]);
  }, [customName, customDesc, customShocks]);

  const handleDeleteCustom = useCallback((id: string) => {
    deleteCustomScenario(id);
    if (selectedScenario.id === id) {
      setSelectedScenario(PRESET_SCENARIOS[0]);
    }
  }, [selectedScenario]);

  const addShock = useCallback(() => {
    setCustomShocks(prev => [
      ...prev,
      { target: 'all', magnitude: -0.10, durationMonths: 6, recoveryMonths: 12 },
    ]);
  }, []);

  const updateShock = useCallback((idx: number, field: keyof ScenarioShock, value: any) => {
    setCustomShocks(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  }, []);

  const removeShock = useCallback((idx: number) => {
    setCustomShocks(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const riskLabel = result ? getRiskScoreLabel(result.riskScore) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0f1729] border border-slate-800 rounded-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
              <FlaskConical size={22} />
            </div>
            <div>
              <h2 className="text-3xl font-bebas tracking-widest text-white">
                Monte Carlo <span className="text-purple-400">Stress Test</span>
              </h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                1,000 simulated portfolio paths
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

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 pb-2 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
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
          {/* ─── Scenarios Tab ─────────────────────────────────────── */}
          {activeTab === 'scenarios' && (
            <>
              {/* Horizon selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Time Horizon:</span>
                <div className="flex gap-2">
                  {HORIZONS.map(h => (
                    <button
                      key={h.value}
                      onClick={() => setHorizon(h.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        horizon === h.value
                          ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                          : 'text-slate-500 hover:text-white bg-slate-800/50 border border-slate-700/50'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenario grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scenarios.map(s => {
                  const catColor = getScenarioCategoryColor(s.category);
                  const isSelected = selectedScenario.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedScenario(s)}
                      className={`text-left p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/20'
                          : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${catColor.text} ${catColor.bg} border ${catColor.border}`}>
                            {s.category}
                          </span>
                          {s.isCustom && (
                            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                              CUSTOM
                            </span>
                          )}
                        </div>
                        {s.isCustom && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCustom(s.id); }}
                            className="p-1 rounded hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{s.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{s.description}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {s.shocks.map((sh, i) => (
                          <span
                            key={i}
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              sh.magnitude < 0 ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'
                            }`}
                          >
                            {sh.target === 'all' ? 'All' : sh.target}: {sh.magnitude > 0 ? '+' : ''}{(sh.magnitude * 100).toFixed(0)}%
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Scenario Builder */}
              <div className="border border-slate-700/50 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowBuilder(!showBuilder)}
                  className="w-full flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Plus size={16} className="text-cyan-400" />
                    <span className="text-sm font-bold text-white">Custom Scenario Builder</span>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${showBuilder ? 'rotate-180' : ''}`} />
                </button>

                {showBuilder && (
                  <div className="p-4 space-y-4 border-t border-slate-700/50">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Name</label>
                        <input
                          type="text"
                          value={customName}
                          onChange={e => setCustomName(e.target.value)}
                          placeholder="My scenario"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Description</label>
                        <input
                          type="text"
                          value={customDesc}
                          onChange={e => setCustomDesc(e.target.value)}
                          placeholder="What-if analysis..."
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Shock rows */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shocks</p>
                      {customShocks.map((shock, idx) => (
                        <div key={idx} className="flex items-end gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                          <div className="flex-1">
                            <label className="text-[9px] text-slate-500 uppercase mb-0.5 block">Target</label>
                            <select
                              value={shock.target}
                              onChange={e => updateShock(idx, 'target', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs text-white focus:outline-none"
                            >
                              {SHOCK_TARGETS.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="w-28">
                            <label className="text-[9px] text-slate-500 uppercase mb-0.5 block">
                              Magnitude: {(shock.magnitude * 100).toFixed(0)}%
                            </label>
                            <input
                              type="range"
                              min="-80"
                              max="100"
                              value={shock.magnitude * 100}
                              onChange={e => updateShock(idx, 'magnitude', Number(e.target.value) / 100)}
                              className="w-full accent-purple-500"
                            />
                          </div>
                          <div className="w-24">
                            <label className="text-[9px] text-slate-500 uppercase mb-0.5 block">
                              Duration: {shock.durationMonths}mo
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="36"
                              value={shock.durationMonths}
                              onChange={e => updateShock(idx, 'durationMonths', Number(e.target.value))}
                              className="w-full accent-purple-500"
                            />
                          </div>
                          <div className="w-24">
                            <label className="text-[9px] text-slate-500 uppercase mb-0.5 block">
                              Recovery: {shock.recoveryMonths}mo
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="48"
                              value={shock.recoveryMonths}
                              onChange={e => updateShock(idx, 'recoveryMonths', Number(e.target.value))}
                              className="w-full accent-purple-500"
                            />
                          </div>
                          {customShocks.length > 1 && (
                            <button
                              onClick={() => removeShock(idx)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={addShock}
                        className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <Plus size={14} />
                        Add shock layer
                      </button>
                    </div>

                    <button
                      onClick={handleCreateCustom}
                      disabled={!customName.trim()}
                      className="px-4 py-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-bold hover:bg-cyan-500/25 transition-colors disabled:opacity-40"
                    >
                      Save Custom Scenario
                    </button>
                  </div>
                )}
              </div>

              {/* Run button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  Selected: <span className="text-white font-bold">{selectedScenario.name}</span>
                  {' | '}Horizon: <span className="text-white font-bold">{HORIZONS.find(h => h.value === horizon)?.label}</span>
                  {' | '}Cards: <span className="text-white font-bold">{cards.length}</span>
                </div>
                <button
                  onClick={handleRunTest}
                  disabled={cards.length === 0 || isRunning}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play size={16} />
                  {isRunning ? 'Running...' : 'Run Simulation'}
                </button>
              </div>
            </>
          )}

          {/* ─── Monte Carlo Fan Chart Tab ─────────────────────────── */}
          {activeTab === 'montecarlo' && (
            <>
              {result ? (
                <div className="space-y-6">
                  {/* Summary bar */}
                  <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                    <div className="text-xs text-slate-400">
                      Scenario: <span className="text-white font-bold">{result.scenarioName}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700" />
                    <div className="text-xs text-slate-400">
                      Simulations: <span className="text-purple-400 font-mono font-bold">{result.numSimulations.toLocaleString()}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700" />
                    <div className="text-xs text-slate-400">
                      Starting Value: <span className="text-white font-mono font-bold">{formatCurrency(result.portfolioValue)}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-slate-400">Risk Score:</span>
                      <span className={`text-sm font-bebas tracking-wider ${riskLabel?.color ?? 'text-slate-400'}`}>
                        {result.riskScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Fan Chart */}
                  <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <BarChart3 size={16} className="text-purple-400" />
                      Portfolio Value Projection — Percentile Bands
                    </h3>
                    <ResponsiveContainer width="100%" height={380}>
                      <AreaChart data={result.percentileBands}>
                        <defs>
                          <linearGradient id="fanP95" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="fanP75" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.20} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.04} />
                          </linearGradient>
                          <linearGradient id="fanP25" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.20} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.04} />
                          </linearGradient>
                          <linearGradient id="fanP5" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                          label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
                        />
                        <YAxis
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                          tickFormatter={(v: number) => formatCurrency(v)}
                        />
                        <Tooltip content={<FanChartTooltip />} />
                        <ReferenceLine
                          y={result.portfolioValue}
                          stroke="#475569"
                          strokeDasharray="6 4"
                          label={{ value: 'Start', fill: '#64748b', fontSize: 10, position: 'right' }}
                        />
                        {/* P5-P95 outer band */}
                        <Area
                          type="monotone"
                          dataKey="p95"
                          stroke="#22c55e"
                          strokeWidth={1}
                          fill="url(#fanP95)"
                          name="p95"
                          dot={false}
                          activeDot={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="p5"
                          stroke="#ef4444"
                          strokeWidth={1}
                          fill="url(#fanP5)"
                          name="p5"
                          dot={false}
                          activeDot={false}
                        />
                        {/* P25-P75 inner band */}
                        <Area
                          type="monotone"
                          dataKey="p75"
                          stroke="#3b82f6"
                          strokeWidth={1}
                          fill="url(#fanP75)"
                          name="p75"
                          dot={false}
                          activeDot={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="p25"
                          stroke="#3b82f6"
                          strokeWidth={1}
                          fill="url(#fanP25)"
                          name="p25"
                          dot={false}
                          activeDot={false}
                        />
                        {/* Median line */}
                        <Area
                          type="monotone"
                          dataKey="p50"
                          stroke="#a855f7"
                          strokeWidth={2.5}
                          fill="none"
                          name="p50"
                          dot={false}
                          activeDot={{ r: 4, fill: '#a855f7' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-green-500 rounded" /> P95 (Bull)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-blue-500 rounded" /> P25-P75
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-1 bg-purple-500 rounded" /> Median
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-red-500 rounded" /> P5 (Bear)
                      </span>
                    </div>
                  </div>

                  {/* Terminal values */}
                  <div className="grid grid-cols-5 gap-3">
                    {(['p5', 'p25', 'p50', 'p75', 'p95'] as const).map(key => {
                      const last = result.percentileBands[result.percentileBands.length - 1];
                      const val = last[key];
                      const change = ((val - result.portfolioValue) / result.portfolioValue) * 100;
                      const colors = {
                        p5: 'text-red-400',
                        p25: 'text-blue-400',
                        p50: 'text-purple-400',
                        p75: 'text-blue-400',
                        p95: 'text-green-400',
                      };
                      const labels = { p5: '5th %ile', p25: '25th %ile', p50: 'Median', p75: '75th %ile', p95: '95th %ile' };
                      return (
                        <div key={key} className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">{labels[key]}</p>
                          <p className={`text-lg font-bebas tracking-wider ${colors[key]}`}>
                            {formatCurrency(val)}
                          </p>
                          <p className={`text-[10px] font-mono ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-5 bg-slate-800/50 rounded-2xl mb-4">
                    <BarChart3 size={36} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No simulation results yet</p>
                  <p className="text-xs text-slate-600 mt-1">Select a scenario and run the simulation first</p>
                  <button
                    onClick={() => setActiveTab('scenarios')}
                    className="mt-4 px-4 py-2 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/25 transition-colors"
                  >
                    Go to Scenarios
                  </button>
                </div>
              )}
            </>
          )}

          {/* ─── VaR & Drawdown Tab ────────────────────────────────── */}
          {activeTab === 'var' && (
            <>
              {result ? (
                <div className="space-y-6">
                  {/* VaR Cards */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-red-400" />
                      Value at Risk (VaR)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[result.var95, result.var99].map(v => (
                        <div key={v.confidence} className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {v.confidence}% Confidence
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {v.horizon}-day horizon
                            </span>
                          </div>
                          <div className="text-center mb-4">
                            <p className="text-3xl font-bebas tracking-wider text-red-400">
                              -{v.varPercent.toFixed(1)}%
                            </p>
                            <p className="text-sm font-mono text-slate-300">
                              -{formatCurrency(v.varAbsolute)}
                            </p>
                          </div>
                          <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-3">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400"
                              style={{ width: `${Math.min(v.varPercent, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Expected Shortfall (CVaR):</span>
                            <span className="text-red-400 font-mono font-bold">
                              -{formatCurrency(v.expectedShortfall)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Drawdown Analysis */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <TrendingDown size={16} className="text-amber-400" />
                      Drawdown Analysis
                    </h3>
                    <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl">
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Worst Drawdown</p>
                          <p className="text-2xl font-bebas tracking-wider text-red-400">
                            -{result.drawdown.worstDrawdown.toFixed(1)}%
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            -{formatCurrency(result.drawdown.worstDrawdownDollar)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Peak Value</p>
                          <p className="text-2xl font-bebas tracking-wider text-green-400">
                            {formatCurrency(result.drawdown.peakValue)}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            Month {result.drawdown.peakMonth}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Trough Value</p>
                          <p className="text-2xl font-bebas tracking-wider text-red-400">
                            {formatCurrency(result.drawdown.troughValue)}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            Month {result.drawdown.troughMonth}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Est. Recovery</p>
                          <p className="text-2xl font-bebas tracking-wider text-amber-400">
                            {result.drawdown.expectedRecoveryMonths}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">months</p>
                        </div>
                      </div>
                      {/* Drawdown visualization bar */}
                      <div className="relative h-12 bg-slate-700/50 rounded-xl overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-green-500/15 border-r border-green-500/30" style={{ width: `${Math.min((result.drawdown.peakMonth / Math.ceil(result.horizon / 30)) * 100, 100)}%` }} />
                        <div
                          className="absolute inset-y-0 bg-red-500/15"
                          style={{
                            left: `${(result.drawdown.peakMonth / Math.ceil(result.horizon / 30)) * 100}%`,
                            width: `${((result.drawdown.troughMonth - result.drawdown.peakMonth) / Math.ceil(result.horizon / 30)) * 100}%`,
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-slate-300 font-bold">
                            Peak-to-trough: {result.drawdown.peakMonth} → {result.drawdown.troughMonth} months
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                        <span>P5 worst-case drawdown: <span className="text-red-400 font-mono">{result.drawdown.medianDrawdown.toFixed(1)}%</span></span>
                        <span>
                          <Clock size={10} className="inline mr-1" />
                          Full recovery estimated at month {result.drawdown.troughMonth + result.drawdown.expectedRecoveryMonths}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyResultState onGoToScenarios={() => setActiveTab('scenarios')} />
              )}
            </>
          )}

          {/* ─── Concentration Tab ─────────────────────────────────── */}
          {activeTab === 'concentration' && (
            <>
              {result ? (
                <div className="space-y-6">
                  {/* Diversification summary */}
                  <div className="grid grid-cols-4 gap-3">
                    <MetricCard
                      label="Risk Score"
                      value={`${result.riskScore}/100`}
                      sub={riskLabel?.label ?? ''}
                      color={riskLabel?.color ?? 'text-slate-400'}
                    />
                    <MetricCard
                      label="Effective Positions"
                      value={result.diversification.effectivePositions.toFixed(1)}
                      sub={`of ${result.diversification.playerCount} players`}
                      color="text-blue-400"
                    />
                    <MetricCard
                      label="Diversification Benefit"
                      value={`${result.diversification.diversificationBenefit.toFixed(1)}%`}
                      sub="volatility reduction"
                      color="text-green-400"
                    />
                    <MetricCard
                      label="HHI Index"
                      value={result.diversification.herfindahlIndex.toFixed(3)}
                      sub={result.diversification.herfindahlIndex < 0.15 ? 'Well diversified' : result.diversification.herfindahlIndex < 0.25 ? 'Moderate' : 'Concentrated'}
                      color={result.diversification.herfindahlIndex < 0.15 ? 'text-green-400' : result.diversification.herfindahlIndex < 0.25 ? 'text-amber-400' : 'text-red-400'}
                    />
                  </div>

                  {/* Concentration risks */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-400" />
                      Concentration Risk Flags
                    </h3>
                    {result.concentrationRisks.length > 0 ? (
                      <div className="space-y-2">
                        {result.concentrationRisks.map((risk, idx) => {
                          const badge = getRiskBadge(risk.riskLevel);
                          const typeLabel = { player: 'Player', sport: 'Sport', era: 'Era', grading_company: 'Grader' };
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl"
                            >
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${badge.color} ${badge.bg} border ${badge.border}`}>
                                {risk.riskLevel}
                              </span>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold w-14">
                                {typeLabel[risk.type]}
                              </span>
                              <span className="text-sm text-white font-medium flex-1">{risk.name}</span>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-slate-400">
                                  {risk.cardCount} card{risk.cardCount !== 1 ? 's' : ''}
                                </span>
                                <span className="font-mono text-white">{formatCurrency(risk.value)}</span>
                                <div className="w-24">
                                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        risk.riskLevel === 'critical' ? 'bg-red-500' :
                                        risk.riskLevel === 'high' ? 'bg-amber-500' :
                                        risk.riskLevel === 'medium' ? 'bg-blue-500' : 'bg-slate-400'
                                      }`}
                                      style={{ width: `${Math.min(risk.exposure, 100)}%` }}
                                    />
                                  </div>
                                  <p className="text-[9px] text-slate-500 text-right mt-0.5">{risk.exposure.toFixed(1)}%</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 bg-slate-800/20 border border-slate-700/30 rounded-2xl text-center">
                        <Target size={28} className="mx-auto text-green-400 mb-2" />
                        <p className="text-sm text-green-400 font-bold">No concentration risks detected</p>
                        <p className="text-xs text-slate-500 mt-1">Your portfolio has healthy diversification across all dimensions</p>
                      </div>
                    )}
                  </div>

                  {/* Sport breakdown */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Activity size={16} className="text-blue-400" />
                      Diversity Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">Sports Coverage</p>
                        <div className="flex items-center gap-2">
                          {['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'].map(s => {
                            const hasSport = cards.some(c => c.sport === s);
                            return (
                              <span
                                key={s}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                  hasSport ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-600 border border-slate-700'
                                }`}
                              >
                                {s}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">Era Spread</p>
                        <p className="text-2xl font-bebas tracking-wider text-white">
                          {result.diversification.eraSpread} <span className="text-sm text-slate-400">years</span>
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {result.diversification.eraSpread >= 20 ? 'Excellent temporal diversification' :
                           result.diversification.eraSpread >= 10 ? 'Good era coverage' : 'Consider adding vintage or modern cards'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyResultState onGoToScenarios={() => setActiveTab('scenarios')} />
              )}
            </>
          )}

          {/* ─── Hedging Tab ───────────────────────────────────────── */}
          {activeTab === 'hedging' && (
            <>
              {result && result.hedgingRecommendations.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                    <Lightbulb size={20} className="text-purple-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-white font-bold">Hedging Recommendations</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        AI-generated suggestions to reduce portfolio risk based on your concentration analysis and stress test results.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {result.hedgingRecommendations.map(rec => {
                      const pColor = priorityColor[rec.priority];
                      return (
                        <div
                          key={rec.id}
                          className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${pColor.bg} ${pColor.text} flex-shrink-0`}>
                              {categoryIcon[rec.category] ?? <Lightbulb size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-bold text-white">{rec.action}</h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${pColor.text} ${pColor.bg} border ${pColor.border}`}>
                                  {rec.priority}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">{rec.rationale}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <TrendingUp size={12} className="text-green-400" />
                                <span className="text-xs text-green-400 font-medium">{rec.impact}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : result ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="p-5 bg-green-500/10 rounded-2xl mb-4">
                    <Shield size={36} className="text-green-400" />
                  </div>
                  <p className="text-sm text-green-400 font-bold">No hedging actions needed</p>
                  <p className="text-xs text-slate-500 mt-1">Your portfolio is well-diversified with manageable risk levels</p>
                </div>
              ) : (
                <EmptyResultState onGoToScenarios={() => setActiveTab('scenarios')} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const MetricCard: React.FC<{ label: string; value: string; sub: string; color: string }> = ({
  label, value, sub, color,
}) => (
  <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center">
    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">{label}</p>
    <p className={`text-2xl font-bebas tracking-wider ${color}`}>{value}</p>
    <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
  </div>
);

const EmptyResultState: React.FC<{ onGoToScenarios: () => void }> = ({ onGoToScenarios }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="p-5 bg-slate-800/50 rounded-2xl mb-4">
      <FlaskConical size={36} className="text-slate-600" />
    </div>
    <p className="text-sm text-slate-400">No simulation results yet</p>
    <p className="text-xs text-slate-600 mt-1">Select a scenario and run the simulation first</p>
    <button
      onClick={onGoToScenarios}
      className="mt-4 px-4 py-2 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-bold hover:bg-purple-500/25 transition-colors"
    >
      Go to Scenarios
    </button>
  </div>
);

export default StressTestModal;
