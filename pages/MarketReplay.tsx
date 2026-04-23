// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, FastForward,
  TrendingUp, TrendingDown, BarChart3, Calculator,
  Trophy, Target, Clock, Activity, Zap, Layers,
  ChevronRight, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceDot, Area, AreaChart,
  BarChart, Bar, Legend, ComposedChart
} from 'recharts';
import {
  getCardTimelines, getTimeline, runBacktest, getStrategies,
  getBacktestResults, createWhatIf, getWhatIfScenarios,
  getReplayStats, getTopPerformers, getWorstPerformers,
  calculateReturn, formatCurrency, formatPercent,
  getReturnColor, getStrategyColor,
  CardTimeline, BacktestStrategy, BacktestResult, WhatIfScenario, ReplayStats
} from '../lib/analytics/marketReplayService';

type TabId = 'replay' | 'backtester' | 'whatif' | 'performance';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'replay', label: 'Price Replay', icon: <Play className="w-4 h-4" /> },
  { id: 'backtester', label: 'Backtester', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'whatif', label: 'What-If', icon: <Calculator className="w-4 h-4" /> },
  { id: 'performance', label: 'Performance', icon: <Trophy className="w-4 h-4" /> },
];

// ---- Price Replay Tab ----

function PriceReplayTab() {
  const [timelines] = useState<CardTimeline[]>(() => getCardTimelines());
  const [selectedCard, setSelectedCard] = useState<string>(timelines[0]?.id || '');
  const [playIndex, setPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timeline = timelines.find(t => t.id === selectedCard);
  const visibleHistory = timeline?.priceHistory.slice(0, playIndex + 1) || [];
  const currentPoint = visibleHistory[visibleHistory.length - 1];

  useEffect(() => {
    if (timeline) setPlayIndex(Math.min(playIndex, timeline.priceHistory.length - 1));
  }, [selectedCard]);

  useEffect(() => {
    if (isPlaying && timeline) {
      intervalRef.current = setInterval(() => {
        setPlayIndex(prev => {
          if (prev >= timeline.priceHistory.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 500 / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, speed, timeline]);

  const eventAnnotations = visibleHistory.filter(p => p.event);

  const eventColors: Record<string, string> = {
    rookieYear: '#3b82f6',
    injury: '#ef4444',
    championship: '#f59e0b',
    comeback: '#10b981',
    draft: '#8b5cf6',
    mvpSeason: '#f97316',
    allStar: '#06b6d4',
    worldSeries: '#eab308',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedCard}
          onChange={e => { setSelectedCard(e.target.value); setPlayIndex(0); setIsPlaying(false); }}
          className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 text-sm"
        >
          {timelines.map(t => (
            <option key={t.id} value={t.id}>{t.player} - {t.cardName}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <button onClick={() => setPlayIndex(Math.max(0, playIndex - 10))} className="p-2 bg-slate-700 rounded hover:bg-slate-600"><SkipBack className="w-4 h-4 text-white" /></button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-blue-600 rounded hover:bg-blue-500"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
          </button>
          <button onClick={() => setPlayIndex(Math.min((timeline?.priceHistory.length || 1) - 1, playIndex + 10))} className="p-2 bg-slate-700 rounded hover:bg-slate-600"><SkipForward className="w-4 h-4 text-white" /></button>
          <button onClick={() => setSpeed(s => s >= 4 ? 1 : s * 2)} className="p-2 bg-slate-700 rounded hover:bg-slate-600 flex items-center gap-1">
            <FastForward className="w-4 h-4 text-white" />
            <span className="text-xs text-white">{speed}x</span>
          </button>
        </div>
      </div>

      {timeline && currentPoint && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-xs text-slate-400">Current Price</div>
            <div className="text-xl font-bold text-white">{formatCurrency(currentPoint.price)}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-xs text-slate-400">All-Time High</div>
            <div className="text-xl font-bold text-green-400">{formatCurrency(timeline.allTimeHigh)}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-xs text-slate-400">All-Time Low</div>
            <div className="text-xl font-bold text-red-400">{formatCurrency(timeline.allTimeLow)}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-xs text-slate-400">Volume</div>
            <div className="text-xl font-bold text-blue-400">{currentPoint.volume}</div>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={visibleHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis yAxisId="price" stroke="#94a3b8" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="volume" orientation="right" stroke="#475569" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Bar yAxisId="volume" dataKey="volume" fill="#334155" opacity={0.5} />
            <Line yAxisId="price" type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
            {eventAnnotations.map((p, i) => (
              <ReferenceDot
                key={i}
                yAxisId="price"
                x={p.date}
                y={p.price}
                r={6}
                fill={eventColors[p.event!] || '#fff'}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {eventAnnotations.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {eventAnnotations.map((p, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: eventColors[p.event!] || '#fff' }} />
              <span className="text-slate-300">{p.date}: <span className="text-white font-medium">{p.event}</span></span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-3">
        <input
          type="range"
          min={0}
          max={(timeline?.priceHistory.length || 1) - 1}
          value={playIndex}
          onChange={e => { setPlayIndex(parseInt(e.target.value)); setIsPlaying(false); }}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{timeline?.priceHistory[0]?.date}</span>
          <span>{currentPoint?.date}</span>
          <span>{timeline?.priceHistory[timeline.priceHistory.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
}

// ---- Backtester Tab ----

function BacktesterTab() {
  const [strategies] = useState<BacktestStrategy[]>(() => getStrategies());
  const [timelines] = useState<CardTimeline[]>(() => getCardTimelines());
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0]?.id || '');
  const [selectedCard, setSelectedCard] = useState(timelines[0]?.id || '');
  const [paramOverrides, setParamOverrides] = useState<Record<string, number>>({});
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [allResults, setAllResults] = useState<BacktestResult[]>(() => getBacktestResults());

  const currentStrategy = strategies.find(s => s.id === selectedStrategy);

  const handleRun = useCallback(() => {
    const res = runBacktest(selectedStrategy, selectedCard, paramOverrides);
    setResult(res);
    setAllResults(getBacktestResults());
  }, [selectedStrategy, selectedCard, paramOverrides]);

  const drawdownData = result?.trades.length ? (() => {
    const timeline = getTimeline(result.cardId);
    if (!timeline) return [];
    let peak = result.initialInvestment;
    let value = result.initialInvestment;
    return timeline.priceHistory.map(p => {
      const holding = result.trades.filter(t => t.date <= p.date);
      const lastBuy = [...holding].reverse().find(t => t.action === 'buy');
      const lastSell = [...holding].reverse().find(t => t.action === 'sell');
      if (lastBuy && (!lastSell || lastSell.date < lastBuy.date)) {
        value = result.initialInvestment + (p.price - lastBuy.price) * lastBuy.quantity;
      }
      peak = Math.max(peak, value);
      const drawdown = peak > 0 ? -((peak - value) / peak) * 100 : 0;
      return { date: p.date, drawdown: Math.round(drawdown * 100) / 100 };
    });
  })() : [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Layers className="w-4 h-4 text-blue-400" /> Strategy</h3>
          <select
            value={selectedStrategy}
            onChange={e => { setSelectedStrategy(e.target.value); setParamOverrides({}); }}
            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm"
          >
            {strategies.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {currentStrategy && (
            <p className="text-xs text-slate-400">{currentStrategy.description}</p>
          )}
        </div>
        <div className="bg-slate-800 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Target className="w-4 h-4 text-green-400" /> Card</h3>
          <select
            value={selectedCard}
            onChange={e => setSelectedCard(e.target.value)}
            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm"
          >
            {timelines.map(t => (
              <option key={t.id} value={t.id}>{t.player} - {t.cardName}</option>
            ))}
          </select>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-purple-400" /> Parameters</h3>
          {currentStrategy && Object.entries(currentStrategy.params).map(([key, defaultVal]) => (
            <div key={key} className="flex items-center gap-2">
              <label className="text-xs text-slate-400 w-24 truncate">{key}</label>
              <input
                type="number"
                value={paramOverrides[key] ?? defaultVal}
                onChange={e => setParamOverrides(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                className="flex-1 bg-slate-700 text-white px-2 py-1 rounded border border-slate-600 text-sm"
              />
            </div>
          ))}
          <button
            onClick={handleRun}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" /> Run Backtest
          </button>
        </div>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400">Total Return</div>
              <div className={`text-xl font-bold ${getReturnColor(result.totalReturn)}`}>{formatPercent(result.totalReturn)}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400">Final Value</div>
              <div className="text-xl font-bold text-white">{formatCurrency(result.finalValue)}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400">Max Drawdown</div>
              <div className="text-xl font-bold text-red-400">-{result.maxDrawdown.toFixed(2)}%</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-xs text-slate-400">Sharpe Ratio</div>
              <div className="text-xl font-bold text-blue-400">{result.sharpeRatio.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Drawdown Chart</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={drawdownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="drawdown" fill="#ef4444" fillOpacity={0.3} stroke="#ef4444" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Trades ({result.trades.length})</h4>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {result.trades.map((t, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-700">
                    <span className="text-slate-400">{t.date}</span>
                    <span className={t.action === 'buy' ? 'text-green-400' : 'text-red-400'}>{t.action.toUpperCase()}</span>
                    <span className="text-white">{formatCurrency(t.price)}</span>
                    <span className="text-slate-400">x{t.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {allResults.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Previous Backtests</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2 px-2">Strategy</th>
                  <th className="text-right py-2 px-2">Return</th>
                  <th className="text-right py-2 px-2">Final Value</th>
                  <th className="text-right py-2 px-2">Win Rate</th>
                  <th className="text-right py-2 px-2">Sharpe</th>
                </tr>
              </thead>
              <tbody>
                {allResults.slice(-10).reverse().map((r, i) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-2 px-2 text-white">{r.strategyName}</td>
                    <td className={`py-2 px-2 text-right ${getReturnColor(r.totalReturn)}`}>{formatPercent(r.totalReturn)}</td>
                    <td className="py-2 px-2 text-right text-white">{formatCurrency(r.finalValue)}</td>
                    <td className="py-2 px-2 text-right text-slate-300">{r.winRate.toFixed(1)}%</td>
                    <td className="py-2 px-2 text-right text-blue-400">{r.sharpeRatio.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- What-If Tab ----

function WhatIfTab() {
  const [timelines] = useState<CardTimeline[]>(() => getCardTimelines());
  const [selectedCard, setSelectedCard] = useState(timelines[0]?.id || '');
  const [buyDate, setBuyDate] = useState('2020-01-01');
  const [sellDate, setSellDate] = useState('2024-01-01');
  const [fees, setFees] = useState(25);
  const [scenarios, setScenarios] = useState<WhatIfScenario[]>(() => getWhatIfScenarios());
  const [lastResult, setLastResult] = useState<WhatIfScenario | null>(null);

  const handleCalculate = useCallback(() => {
    const timeline = getTimeline(selectedCard);
    if (!timeline) return;

    const buyPoint = timeline.priceHistory.find(p => p.date >= buyDate) || timeline.priceHistory[0];
    const sellPoint = [...timeline.priceHistory].reverse().find(p => p.date <= sellDate) || timeline.priceHistory[timeline.priceHistory.length - 1];

    const result = createWhatIf({
      name: `${timeline.player} ${buyDate} to ${sellDate}`,
      cardId: selectedCard,
      purchaseDate: buyPoint.date,
      purchasePrice: buyPoint.price,
      sellDate: sellPoint.date,
      sellPrice: sellPoint.price,
      fees,
    });

    setLastResult(result);
    setScenarios(getWhatIfScenarios());
  }, [selectedCard, buyDate, sellDate, fees]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Calculator className="w-4 h-4 text-blue-400" /> What-If Calculator</h3>
          <div>
            <label className="text-xs text-slate-400">Card</label>
            <select
              value={selectedCard}
              onChange={e => setSelectedCard(e.target.value)}
              className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm mt-1"
            >
              {timelines.map(t => (
                <option key={t.id} value={t.id}>{t.player} - {t.cardName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Buy Date</label>
              <input type="date" value={buyDate} onChange={e => setBuyDate(e.target.value)} className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Sell Date</label>
              <input type="date" value={sellDate} onChange={e => setSellDate(e.target.value)} className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400">Fees ($)</label>
            <input type="number" value={fees} onChange={e => setFees(parseFloat(e.target.value) || 0)} className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm mt-1" />
          </div>
          <button
            onClick={handleCalculate}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Calculate Return
          </button>
        </div>

        {lastResult && (
          <div className="bg-slate-800 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><ChevronRight className="w-4 h-4 text-green-400" /> Result</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-slate-400">Purchase Price</div>
                <div className="text-lg font-bold text-white">{formatCurrency(lastResult.purchasePrice)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Sell Price</div>
                <div className="text-lg font-bold text-white">{formatCurrency(lastResult.sellPrice)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Return</div>
                <div className={`text-lg font-bold ${getReturnColor(lastResult.actualReturn)}`}>{formatPercent(lastResult.actualReturn)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Holding Period</div>
                <div className="text-lg font-bold text-blue-400">{lastResult.holdingPeriod} days</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Fees</div>
                <div className="text-lg font-bold text-slate-300">{formatCurrency(lastResult.fees)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Net Profit</div>
                <div className={`text-lg font-bold ${getReturnColor(lastResult.sellPrice - lastResult.purchasePrice - lastResult.fees > 0 ? 1 : -1)}`}>
                  {formatCurrency(lastResult.sellPrice - lastResult.purchasePrice - lastResult.fees)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {scenarios.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Scenario History</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2 px-2">Scenario</th>
                  <th className="text-right py-2 px-2">Buy</th>
                  <th className="text-right py-2 px-2">Sell</th>
                  <th className="text-right py-2 px-2">Return</th>
                  <th className="text-right py-2 px-2">Days Held</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.slice(-10).reverse().map((s, i) => (
                  <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-2 px-2 text-white">{s.name}</td>
                    <td className="py-2 px-2 text-right text-slate-300">{formatCurrency(s.purchasePrice)}</td>
                    <td className="py-2 px-2 text-right text-slate-300">{formatCurrency(s.sellPrice)}</td>
                    <td className={`py-2 px-2 text-right ${getReturnColor(s.actualReturn)}`}>{formatPercent(s.actualReturn)}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{s.holdingPeriod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Performance Tab ----

function PerformanceTab() {
  const [stats] = useState<ReplayStats>(() => getReplayStats());
  const [period, setPeriod] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('all');
  const [topPerformers, setTopPerformers] = useState<CardTimeline[]>(() => getTopPerformers('all'));
  const [worstPerformers, setWorstPerformers] = useState<CardTimeline[]>(() => getWorstPerformers('all'));

  useEffect(() => {
    setTopPerformers(getTopPerformers(period));
    setWorstPerformers(getWorstPerformers(period));
  }, [period]);

  const getReturnForPeriod = (t: CardTimeline): number => {
    const monthsMap: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6, '1y': 12, 'all': 999 };
    const months = monthsMap[period] ?? 999;
    const slice = months >= 999 ? t.priceHistory : t.priceHistory.slice(-months);
    if (slice.length < 2) return 0;
    return calculateReturn(slice[0].price, slice[slice.length - 1].price);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400">Cards Tracked</div>
          <div className="text-2xl font-bold text-white">{stats.totalCardsTracked}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400">Avg Annual Return</div>
          <div className={`text-2xl font-bold ${getReturnColor(stats.avgAnnualReturn)}`}>{formatPercent(stats.avgAnnualReturn)}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400">Best Performer</div>
          <div className="text-lg font-bold text-green-400 truncate">{stats.bestPerformer}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400">Worst Performer</div>
          <div className="text-lg font-bold text-red-400 truncate">{stats.worstPerformer}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-xs text-slate-400">Total Backtests</div>
          <div className="text-2xl font-bold text-blue-400">{stats.totalBacktests}</div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['1m', '3m', '6m', '1y', 'all'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${period === p ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" /> Top Performers
          </h4>
          <div className="space-y-1">
            {topPerformers.slice(0, 6).map((t, i) => {
              const ret = getReturnForPeriod(t);
              return (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                    <div>
                      <div className="text-sm text-white font-medium">{t.player}</div>
                      <div className="text-xs text-slate-400">{t.cardName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getReturnColor(ret)}`}>{formatPercent(ret)}</div>
                    <div className="text-xs text-slate-400">{formatCurrency(t.currentPrice)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" /> Worst Performers
          </h4>
          <div className="space-y-1">
            {worstPerformers.slice(0, 6).map((t, i) => {
              const ret = getReturnForPeriod(t);
              return (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                    <div>
                      <div className="text-sm text-white font-medium">{t.player}</div>
                      <div className="text-xs text-slate-400">{t.cardName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getReturnColor(ret)}`}>{formatPercent(ret)}</div>
                    <div className="text-xs text-slate-400">{formatCurrency(t.currentPrice)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Return Distribution</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topPerformers.map(t => ({
            player: t.player.split(' ').pop(),
            return: Math.round(getReturnForPeriod(t) * 100) / 100,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="player" stroke="#94a3b8" tick={{ fontSize: 10 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }} />
            <Bar dataKey="return" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---- Main Page ----

export default function MarketReplay() {
  const [activeTab, setActiveTab] = useState<TabId>('replay');

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Clock className="w-7 h-7 text-blue-400" />
            Market Replay & Backtester
          </h1>
          <p className="text-slate-400 mt-1">Replay historical prices, backtest strategies, and explore what-if scenarios</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-3 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'replay' && <PriceReplayTab />}
        {activeTab === 'backtester' && <BacktesterTab />}
        {activeTab === 'whatif' && <WhatIfTab />}
        {activeTab === 'performance' && <PerformanceTab />}
      </div>
    </div>
  );
}
