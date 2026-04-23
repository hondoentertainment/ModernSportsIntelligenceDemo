// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Ghost,
  Play,
  Plus,
  Loader2,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Search,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  runBacktest,
  getPresetStrategies,
  getAvailablePlayers,
  savePortfolio,
  type BacktestConfig,
  type BacktestResult,
  type PhantomPortfolio,
} from '../lib/analytics/phantomBacktesterService';

interface PhantomBacktesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhantomBacktesterModal: React.FC<PhantomBacktesterModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'config' | 'running' | 'results'>('config');
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [playerSearch, setPlayerSearch] = useState('');

  const presets = useMemo(() => getPresetStrategies(), []);
  const players = useMemo(() => getAvailablePlayers(), []);

  const [config, setConfig] = useState<BacktestConfig>({
    startDate: '2020-01-01',
    endDate: '2024-12-01',
    initialCapital: 25000,
    positions: [],
    rebalanceFrequency: 'quarterly',
    transactionCostPct: 2.5,
    gradingFees: 100,
    holdingCosts: 30,
    benchmark: 'sp500',
  });

  const filteredPlayers = useMemo(
    () => players.filter((p) => p.toLowerCase().includes(playerSearch.toLowerCase())),
    [players, playerSearch],
  );

  const addPosition = useCallback((player: string) => {
    setConfig((prev) => {
      if (prev.positions.find((p) => p.player === player)) return prev;
      return {
        ...prev,
        positions: [...prev.positions, { player, year: 2020, set: 'Panini Prizm', quantity: 1, grade: 'PSA 10' }],
      };
    });
    setPlayerSearch('');
  }, []);

  const removePosition = useCallback((player: string) => {
    setConfig((prev) => ({
      ...prev,
      positions: prev.positions.filter((p) => p.player !== player),
    }));
  }, []);

  const handleLoadPreset = useCallback((presetIdx: number) => {
    setConfig(presets[presetIdx].config);
  }, [presets]);

  const handleRun = useCallback(async () => {
    if (config.positions.length === 0) return;
    setStep('running');
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 18, 92));
    }, 200);

    try {
      const res = await runBacktest(config);
      clearInterval(progressInterval);
      setProgress(100);
      setResult(res);
      setStep('results');

      const portfolio: PhantomPortfolio = {
        id: 'pb-' + Math.random().toString(36).slice(2, 11),
        name: `Quick Backtest ${new Date().toLocaleDateString()}`,
        config,
        result: res,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };
      savePortfolio(portfolio);
    } catch {
      clearInterval(progressInterval);
      setStep('config');
    }
  }, [config]);

  const handleReset = useCallback(() => {
    setStep('config');
    setResult(null);
    setProgress(0);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-700 flex items-center justify-between bg-brand-lime/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lime/10 text-brand-lime rounded-2xl border border-brand-lime/30">
              <Ghost size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-lime/10 text-brand-lime border border-brand-lime/30">
                  <Ghost size={10} />
                  Quick Backtest
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Phantom <span className="text-brand-lime">Backtester</span>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* ---- CONFIG STEP ---- */}
          {step === 'config' && (
            <>
              {/* Quick Presets */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Quick Presets</p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {presets.slice(0, 4).map((preset, idx) => (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadPreset(idx)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs font-bold text-slate-300 hover:border-brand-lime/30 hover:text-brand-lime transition-all whitespace-nowrap"
                    >
                      <Zap size={12} />
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Config Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Start</label>
                  <input
                    type="date"
                    value={config.startDate}
                    onChange={(e) => setConfig((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">End</label>
                  <input
                    type="date"
                    value={config.endDate}
                    onChange={(e) => setConfig((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Capital</label>
                  <input
                    type="number"
                    value={config.initialCapital}
                    onChange={(e) => setConfig((p) => ({ ...p, initialCapital: Number(e.target.value) }))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Benchmark</label>
                  <select
                    value={config.benchmark}
                    onChange={(e) => setConfig((p) => ({ ...p, benchmark: e.target.value as BacktestConfig['benchmark'] }))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:border-brand-lime focus:outline-none"
                  >
                    <option value="sp500">S&P 500</option>
                    <option value="rookie_index">Rookie Index</option>
                    <option value="vintage_index">Vintage Index</option>
                    <option value="modern_index">Modern Index</option>
                  </select>
                </div>
              </div>

              {/* Player Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search players to add..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:border-brand-lime focus:outline-none"
                />
                {playerSearch && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-slate-900 border border-slate-600 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                    {filteredPlayers.map((p) => (
                      <button
                        key={p}
                        onClick={() => addPosition(p)}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-brand-lime transition-colors flex items-center gap-2"
                      >
                        <Plus size={14} />
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Positions */}
              {config.positions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Ghost size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Add players or load a preset to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {config.positions.map((pos) => (
                    <div key={pos.player} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/30 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-white">{pos.player}</p>
                        <p className="text-xs text-slate-500">Qty: {pos.quantity} - {pos.grade}</p>
                      </div>
                      <button
                        onClick={() => removePosition(pos.player)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Run Button */}
              <button
                onClick={handleRun}
                disabled={config.positions.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-brand-lime text-slate-900 hover:bg-brand-lime/90"
              >
                <Play size={18} />
                Run Quick Backtest
              </button>
            </>
          )}

          {/* ---- RUNNING STEP ---- */}
          {step === 'running' && (
            <div className="text-center py-12 space-y-6">
              <div className="relative inline-flex">
                <Ghost size={56} className="text-brand-lime animate-pulse" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-lime rounded-full animate-ping" />
              </div>
              <div>
                <h3 className="text-2xl font-bebas tracking-widest text-white">Simulating Trades</h3>
                <p className="text-sm text-slate-400 mt-1">Processing {config.positions.length} positions across historical data...</p>
              </div>
              <div className="max-w-md mx-auto">
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-lime to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">{Math.round(progress)}% complete</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Calculating Sharpe ratio, alpha, drawdowns...</span>
              </div>
            </div>
          )}

          {/* ---- RESULTS STEP ---- */}
          {step === 'results' && result && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                  <TrendingUp size={16} className={`mx-auto mb-1 ${result.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                  <p className={`text-xl font-bebas tracking-wider ${result.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(1)}%
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Return</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                  <Shield size={16} className="mx-auto mb-1 text-blue-400" />
                  <p className="text-xl font-bebas tracking-wider text-white">{result.sharpeRatio.toFixed(2)}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sharpe</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                  <TrendingDown size={16} className="mx-auto mb-1 text-red-400" />
                  <p className="text-xl font-bebas tracking-wider text-red-400">-{result.maxDrawdown.toFixed(1)}%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max DD</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                  <Target size={16} className={`mx-auto mb-1 ${result.alpha >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                  <p className={`text-xl font-bebas tracking-wider ${result.alpha >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.alpha >= 0 ? '+' : ''}{result.alpha.toFixed(1)}%
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Alpha</p>
                </div>
              </div>

              {/* Equity Curve */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Equity Curve vs Benchmark</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.timeline}>
                      <defs>
                        <linearGradient id="modalPortGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#a3e635" strokeWidth={2} fill="url(#modalPortGrad)" name="Portfolio" />
                      <Line type="monotone" dataKey="benchmark" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Benchmark" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Initial Capital</span>
                  <span className="text-white font-bold">${result.config.initialCapital.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Final Value</span>
                  <span className="text-white font-bold">${Math.round(result.finalValue).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Benchmark Return</span>
                  <span className="text-slate-300">{result.benchmarkReturn.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Trades</span>
                  <span className="text-white">{result.trades.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Hold Period</span>
                  <span className="text-white">{result.avgHoldPeriod} months</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-slate-800 text-white border border-slate-700 hover:border-slate-600 transition-all"
                >
                  <Play size={16} />
                  Run Another
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-brand-lime text-slate-900 hover:bg-brand-lime/90 transition-all"
                >
                  <Ghost size={16} />
                  View Full Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhantomBacktesterModal;
