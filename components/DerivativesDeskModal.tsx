import React, { useState, useMemo } from 'react';
import {
  X,
  Shield,
  Umbrella,
  TrendingDown,
  TrendingUp,
  Calculator,
  Activity,
  AlertTriangle,
  Layers,
  Zap,
  Plus,
  Check,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  getAvailableOptions,
  getInsurancePolicies,
  createInsurance,
  calculateHedge,
  getVolatilitySurface,
  runScenario,
  getDerivativesStats,
  getPlayerList,
  getPlayerPrice,
  getQuantEnrichedDerivatives,
  type InsurancePolicy,
  type HedgeCalculation,
  type VolatilitySurface as _VolSurfaceType,
  type ScenarioResult,
} from '../lib/derivativesDeskService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'options' | 'insurance' | 'hedge' | 'volsurface' | 'scenarios';

const TAB_CONFIG: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'options', label: 'Options Chain', icon: <Layers size={13} /> },
  { key: 'insurance', label: 'Insurance', icon: <Umbrella size={13} /> },
  { key: 'hedge', label: 'Hedge Calculator', icon: <Calculator size={13} /> },
  { key: 'volsurface', label: 'Vol Surface', icon: <Activity size={13} /> },
  { key: 'scenarios', label: 'Scenarios', icon: <AlertTriangle size={13} /> },
];

// ---- Options Chain Tab ----

const OptionsChainTab: React.FC = () => {
  const players = getPlayerList();
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]);
  const [expiryFilter, setExpiryFilter] = useState<number | null>(null);

  const options = useMemo(() => getAvailableOptions(selectedPlayer), [selectedPlayer]);
  const quantContext = useMemo(() => getQuantEnrichedDerivatives(selectedPlayer), [selectedPlayer]);

  const filtered = useMemo(() => {
    if (!expiryFilter) return options;
    return options.filter(o => o.daysToExpiry === expiryFilter);
  }, [options, expiryFilter]);

  const calls = filtered.filter(o => o.type === 'call');
  const puts = filtered.filter(o => o.type === 'put');
  const price = getPlayerPrice(selectedPlayer);

  // Group by strike
  const strikes = [...new Set(filtered.map(o => o.strikePrice))].sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <select
          value={selectedPlayer}
          onChange={e => setSelectedPlayer(e.target.value)}
          className="bg-slate-800 border border-slate-700/50 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500/50"
        >
          {players.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <div className="flex gap-1">
          <button
            onClick={() => setExpiryFilter(null)}
            className={`px-2 py-1 text-[10px] rounded-md transition-colors ${!expiryFilter ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >All</button>
          {[30, 60, 90, 180].map(d => (
            <button
              key={d}
              onClick={() => setExpiryFilter(d)}
              className={`px-2 py-1 text-[10px] rounded-md transition-colors ${expiryFilter === d ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >{d}d</button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-500">Spot: <span className="text-slate-200 font-semibold">${price.toLocaleString()}</span></span>
      </div>

      {/* Options grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] text-slate-500 uppercase tracking-wider">
              <th colSpan={5} className="text-center text-emerald-400 pb-1 border-b border-slate-700/30">CALLS</th>
              <th className="px-2 pb-1 border-b border-slate-700/30">Strike</th>
              <th colSpan={5} className="text-center text-red-400 pb-1 border-b border-slate-700/30">PUTS</th>
            </tr>
            <tr className="text-[10px] text-slate-500">
              <th className="py-1 px-1 text-right">Delta</th>
              <th className="py-1 px-1 text-right">Gamma</th>
              <th className="py-1 px-1 text-right">Theta</th>
              <th className="py-1 px-1 text-right">IV</th>
              <th className="py-1 px-1 text-right">Prem</th>
              <th className="py-1 px-2 text-center font-bold text-slate-300">$</th>
              <th className="py-1 px-1 text-left">Prem</th>
              <th className="py-1 px-1 text-left">IV</th>
              <th className="py-1 px-1 text-left">Theta</th>
              <th className="py-1 px-1 text-left">Gamma</th>
              <th className="py-1 px-1 text-left">Delta</th>
            </tr>
          </thead>
          <tbody>
            {strikes.slice(0, 10).map(strike => {
              const call = calls.find(c => c.strikePrice === strike);
              const put = puts.find(p => p.strikePrice === strike);
              const isATM = Math.abs(strike - price) < (price * 0.03);

              return (
                <tr key={strike} className={`border-b border-slate-800/50 ${isATM ? 'bg-blue-500/5' : 'hover:bg-slate-800/30'}`}>
                  <td className="py-1.5 px-1 text-right text-emerald-400 font-mono">{call?.delta.toFixed(3) || '-'}</td>
                  <td className="py-1.5 px-1 text-right text-slate-400 font-mono">{call?.gamma.toFixed(5) || '-'}</td>
                  <td className="py-1.5 px-1 text-right text-amber-400 font-mono">{call?.theta.toFixed(3) || '-'}</td>
                  <td className="py-1.5 px-1 text-right text-slate-300 font-mono">{call ? (call.impliedVolatility * 100).toFixed(1) + '%' : '-'}</td>
                  <td className="py-1.5 px-1 text-right">
                    {call && (
                      <button className="text-emerald-400 font-semibold hover:bg-emerald-500/20 px-1.5 py-0.5 rounded transition-colors">
                        ${call.premium.toFixed(0)}
                      </button>
                    )}
                  </td>
                  <td className={`py-1.5 px-2 text-center font-bold ${isATM ? 'text-blue-300 bg-blue-500/10' : 'text-slate-200'}`}>
                    ${strike.toLocaleString()}
                  </td>
                  <td className="py-1.5 px-1 text-left">
                    {put && (
                      <button className="text-red-400 font-semibold hover:bg-red-500/20 px-1.5 py-0.5 rounded transition-colors">
                        ${put.premium.toFixed(0)}
                      </button>
                    )}
                  </td>
                  <td className="py-1.5 px-1 text-left text-slate-300 font-mono">{put ? (put.impliedVolatility * 100).toFixed(1) + '%' : '-'}</td>
                  <td className="py-1.5 px-1 text-left text-amber-400 font-mono">{put?.theta.toFixed(3) || '-'}</td>
                  <td className="py-1.5 px-1 text-left text-slate-400 font-mono">{put?.gamma.toFixed(5) || '-'}</td>
                  <td className="py-1.5 px-1 text-left text-red-400 font-mono">{put?.delta.toFixed(3) || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quant Workbench Insights (Phase 87 Cross-reference) */}
      {quantContext.quantInsights.length > 0 && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={12} className="text-purple-400" />
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Quant Insights</span>
          </div>
          <div className="space-y-1">
            {quantContext.quantInsights.map((insight, i) => (
              <p key={i} className="text-xs text-slate-400 flex gap-2">
                <span className="text-purple-400 mt-0.5">{'>'}</span>
                <span>{insight}</span>
              </p>
            ))}
          </div>
          {quantContext.backtestResult && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-slate-800/40 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-500">Backtest Return</p>
                <p className={`text-sm font-bold ${quantContext.backtestResult.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {quantContext.backtestResult.totalReturn >= 0 ? '+' : ''}{quantContext.backtestResult.totalReturn.toFixed(1)}%
                </p>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-500">Sharpe Ratio</p>
                <p className="text-sm font-bold text-blue-400">{quantContext.backtestResult.sharpeRatio.toFixed(2)}</p>
              </div>
              <div className="bg-slate-800/40 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-500">Max Drawdown</p>
                <p className="text-sm font-bold text-amber-400">{quantContext.backtestResult.maxDrawdown.toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ---- Insurance Tab ----

const InsuranceTab: React.FC = () => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>(getInsurancePolicies());
  const [showForm, setShowForm] = useState(false);
  const [coverage, setCoverage] = useState<'80%' | '90%' | '100%'>('90%');
  const [duration, setDuration] = useState<'30d' | '90d' | '180d' | '365d'>('90d');
  const [created, setCreated] = useState(false);

  const handleCreate = () => {
    const policy = createInsurance(`card-${Date.now()}`, coverage, duration);
    setPolicies([...policies, policy]);
    setCreated(true);
    setShowForm(false);
    setTimeout(() => setCreated(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Active Policies</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-lg hover:bg-blue-500/30 transition-colors"
        >
          <Plus size={12} /> New Policy
        </button>
      </div>

      {created && (
        <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400">
          <Check size={14} /> Insurance policy created successfully
        </div>
      )}

      {showForm && (
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-300">Create Price Protection</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Coverage Level</label>
              <div className="flex gap-1">
                {(['80%', '90%', '100%'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setCoverage(c)}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-colors ${coverage === c ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700/30'}`}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Duration</label>
              <div className="flex gap-1">
                {(['30d', '90d', '180d', '365d'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-colors ${duration === d ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700/30'}`}
                  >{d}</button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Purchase Insurance
          </button>
        </div>
      )}

      {policies.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          <Umbrella size={24} className="mx-auto mb-2 opacity-40" />
          No active insurance policies. Create one to protect your cards.
        </div>
      ) : (
        <div className="space-y-2">
          {policies.map(p => (
            <div key={p.id} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{p.player}</p>
                  <p className="text-[10px] text-slate-500">{p.cardDescription}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                  p.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-700/30 text-slate-500 border-slate-600/30'
                }`}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-2">
                <span>Coverage: <span className="text-blue-400 font-semibold">{p.coverage}</span></span>
                <span>Value: <span className="text-slate-200">${p.coveredValue.toLocaleString()}</span></span>
                <span>Premium: <span className="text-amber-400">${p.premium.toFixed(2)}</span> ({p.premiumPercent}%)</span>
                <span>Expires: {p.expirationDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- Hedge Calculator Tab ----

const HedgeCalculatorTab: React.FC = () => {
  const [strategy, setStrategy] = useState<'protective_put' | 'collar' | 'covered_call'>('protective_put');
  const [coveragePct, setCoveragePct] = useState(80);
  const [result, setResult] = useState<HedgeCalculation | null>(null);

  const handleCalculate = () => {
    setResult(calculateHedge(strategy, coveragePct));
  };

  const strategyInfo: Record<string, { label: string; desc: string; color: string }> = {
    protective_put: { label: 'Protective Put', desc: 'Buy downside protection — full upside, limited downside', color: 'text-red-400' },
    collar: { label: 'Collar', desc: 'Cap upside to reduce hedge cost — balanced risk/reward', color: 'text-amber-400' },
    covered_call: { label: 'Covered Call', desc: 'Earn income by selling upside — income generation', color: 'text-emerald-400' },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(strategyInfo) as Array<keyof typeof strategyInfo>).map(s => (
          <button
            key={s}
            onClick={() => setStrategy(s as 'protective_put' | 'collar' | 'covered_call')}
            className={`p-3 rounded-xl border text-left transition-all ${
              strategy === s
                ? 'bg-slate-800 border-blue-500/40 ring-1 ring-blue-500/20'
                : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
            }`}
          >
            <p className={`text-xs font-semibold ${strategyInfo[s].color}`}>{strategyInfo[s].label}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{strategyInfo[s].desc}</p>
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] text-slate-500 uppercase tracking-wider">Coverage: {coveragePct}%</label>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          step={5}
          value={coveragePct}
          onChange={e => setCoveragePct(+e.target.value)}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
          <span>10%</span><span>50%</span><span>100%</span>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full py-2.5 bg-brand-lime/20 text-brand-lime text-xs font-semibold rounded-lg hover:bg-brand-lime/30 transition-colors border border-brand-lime/30"
      >
        <Calculator size={13} className="inline mr-1.5" />
        Calculate Hedge
      </button>

      {result && (
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Portfolio Value</p>
              <p className="text-lg font-bold text-slate-200">${result.portfolioValue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Hedge Cost</p>
              <p className={`text-lg font-bold ${result.hedgeCost >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {result.hedgeCost >= 0 ? '-' : '+'}${Math.abs(result.hedgeCost).toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500">{result.costAsPercent}% of portfolio</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Max Loss</p>
              <p className="text-lg font-bold text-amber-400">${result.maxLoss.toLocaleString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500">Net Exposure</p>
              <p className="text-sm font-semibold text-slate-200">${result.netExposure.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500">Coverage</p>
              <p className="text-sm font-semibold text-brand-lime">{result.hedgeCoverage}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Vol Surface Tab ----

const VolSurfaceTab: React.FC = () => {
  const players = getPlayerList();
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]);
  const volData = useMemo(() => getVolatilitySurface(selectedPlayer), [selectedPlayer]);

  // Build heatmap-style data for scatter chart
  const chartData = volData.surface.map(pt => ({
    strike: pt.strike,
    expiry: pt.expiry,
    iv: +(pt.iv * 100).toFixed(1),
  }));

  const ivMin = Math.min(...chartData.map(d => d.iv));
  const ivMax = Math.max(...chartData.map(d => d.iv));

  const getColor = (iv: number) => {
    const t = (iv - ivMin) / (ivMax - ivMin + 0.01);
    if (t < 0.25) return '#22c55e';
    if (t < 0.5) return '#eab308';
    if (t < 0.75) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={selectedPlayer}
          onChange={e => setSelectedPlayer(e.target.value)}
          className="bg-slate-800 border border-slate-700/50 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500/50"
        >
          {players.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className="text-xs text-slate-500">Spot: <span className="text-slate-200 font-semibold">${volData.currentPrice.toLocaleString()}</span></span>
        <span className="text-xs text-slate-500">Skew: <span className={`font-semibold ${volData.skew > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{(volData.skew * 100).toFixed(1)}%</span></span>
      </div>

      {/* Scatter "heatmap" */}
      <div className="bg-slate-800/30 rounded-xl p-3">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Implied Volatility Surface (Strike x Expiry)</p>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="strike"
              name="Strike"
              type="number"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              label={{ value: 'Strike ($)', position: 'bottom', fontSize: 10, fill: '#64748b' }}
            />
            <YAxis
              dataKey="expiry"
              name="Expiry"
              type="number"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              label={{ value: 'Days to Expiry', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs shadow-xl">
                    <p className="text-slate-300">Strike: <span className="font-semibold">${d.strike}</span></p>
                    <p className="text-slate-300">Expiry: <span className="font-semibold">{d.expiry}d</span></p>
                    <p className="text-slate-300">IV: <span className="font-bold" style={{ color: getColor(d.iv) }}>{d.iv}%</span></p>
                  </div>
                );
              }}
            />
            <Scatter data={chartData}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getColor(entry.iv)} r={Math.max(6, entry.iv / 4)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low IV</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Very High</span>
        </div>
      </div>

      {/* Term Structure */}
      <div className="bg-slate-800/30 rounded-xl p-3">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Volatility Term Structure</p>
        <div className="flex items-end gap-3 h-20">
          {volData.termStructure.map((iv, i) => {
            const height = ((iv - 0.2) / 0.6) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-300 font-mono">{(iv * 100).toFixed(1)}%</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400"
                  style={{ height: `${Math.max(10, height)}%` }}
                />
                <span className="text-[9px] text-slate-500">{[30, 60, 90, 180][i]}d</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Scenarios Tab ----

const ScenariosTab: React.FC = () => {
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  const scenarios: { key: 'injury' | 'trade' | 'market_crash' | 'breakout' | 'scandal'; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'injury', label: 'Season-Ending Injury (-25%)', icon: <AlertTriangle size={13} />, color: 'text-red-400' },
    { key: 'trade', label: 'Traded to Contender (+15%)', icon: <TrendingUp size={13} />, color: 'text-emerald-400' },
    { key: 'market_crash', label: 'Market-Wide Crash (-20%)', icon: <TrendingDown size={13} />, color: 'text-red-400' },
    { key: 'breakout', label: 'Breakout Season (+30%)', icon: <Zap size={13} />, color: 'text-brand-lime' },
    { key: 'scandal', label: 'Off-Field Scandal (-35%)', icon: <AlertTriangle size={13} />, color: 'text-red-400' },
  ];

  const handleRun = (key: 'injury' | 'trade' | 'market_crash' | 'breakout' | 'scandal') => {
    setRunning(key);
    setTimeout(() => {
      const result = runScenario(key);
      setResults(prev => {
        const existing = prev.filter(r => r.scenario !== result.scenario);
        return [...existing, result];
      });
      setRunning(null);
    }, 400);
  };

  // Build comparison chart data
  const chartData = results.map(r => ({
    name: r.scenario.length > 20 ? r.scenario.slice(0, 18) + '..' : r.scenario,
    Unhedged: r.portfolioImpact,
    Hedged: r.hedgedImpact,
  }));

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">Run "what-if" scenarios to see how hedging protects your portfolio.</p>

      <div className="grid grid-cols-5 gap-2">
        {scenarios.map(s => (
          <button
            key={s.key}
            onClick={() => handleRun(s.key)}
            disabled={running === s.key}
            className="p-2 bg-slate-800/50 border border-slate-700/30 rounded-lg hover:border-slate-600/50 transition-all text-center disabled:opacity-50"
          >
            <div className={`mx-auto mb-1 ${s.color}`}>{s.icon}</div>
            <p className="text-[10px] text-slate-300 leading-tight">{s.label}</p>
          </button>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Portfolio Impact: Hedged vs Unhedged</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Unhedged" fill="#ef4444" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Hedged" fill="#84cc16" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-200">{r.scenario}</p>
                <span className="text-xs font-bold text-emerald-400">Saved: ${r.savings.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div>
                  <p className="text-slate-500">Unhedged P/L</p>
                  <p className={`font-bold ${r.portfolioImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.portfolioImpact >= 0 ? '+' : ''}${r.portfolioImpact.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Hedged P/L</p>
                  <p className={`font-bold ${r.hedgedImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.hedgedImpact >= 0 ? '+' : ''}${r.hedgedImpact.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Savings</p>
                  <p className="font-bold text-brand-lime">${r.savings.toLocaleString()}</p>
                </div>
              </div>
              <details className="mt-2">
                <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-400">Player breakdown</summary>
                <div className="mt-1 space-y-0.5">
                  {r.details.map((d, j) => (
                    <p key={j} className="text-[10px] text-slate-400 font-mono">{d}</p>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

const DerivativesDeskModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<Tab>('options');

  if (!isOpen) return null;

  const stats = getDerivativesStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-5xl max-h-[88vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-500/10 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Shield size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Options & Derivatives Desk</h2>
              <p className="text-xs text-slate-400">Options, Insurance & Hedging — Wall Street Risk Management for Cards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-6 gap-2 p-3 bg-slate-800/30">
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Coverage</p>
            <p className="text-lg font-bold text-brand-lime">{stats.portfolioCoverage.toFixed(1)}%</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Active Options</p>
            <p className="text-lg font-bold text-emerald-400">{stats.activeOptions}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Insurance</p>
            <p className="text-lg font-bold text-blue-400">{stats.activeInsurance}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Premiums Paid</p>
            <p className="text-lg font-bold text-amber-400">${stats.totalPremiumsPaid.toFixed(0)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Hedge Efficiency</p>
            <p className="text-lg font-bold text-slate-200">{stats.hedgeEfficiency}%</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Saved</p>
            <p className="text-lg font-bold text-emerald-400">${stats.savedByHedging.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3">
          {TAB_CONFIG.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                tab === t.key
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto max-h-[48vh]">
          {tab === 'options' && <OptionsChainTab />}
          {tab === 'insurance' && <InsuranceTab />}
          {tab === 'hedge' && <HedgeCalculatorTab />}
          {tab === 'volsurface' && <VolSurfaceTab />}
          {tab === 'scenarios' && <ScenariosTab />}
        </div>
      </div>
    </div>
  );
};

export default DerivativesDeskModal;
