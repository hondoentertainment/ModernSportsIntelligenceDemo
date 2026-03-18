import React, { useMemo, useState } from 'react';
import {
  X,
  CalendarDays,
  ShoppingCart,
  DollarSign,
  Bell,
  BarChart3,
  Target,
  Layers,
  CheckCircle2,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { CardInventory, Sport } from '../types';
import {
  SeasonPhase,
  getAllSportProfiles,
  getSeasonalWindows,
  getSeasonalAlerts,
  getPortfolioExposure,
  getBacktestResults,
  getBacktestMonthly,
  markAlertRead,
  dismissAlert,
  MONTH_NAMES,
} from '../lib/analytics/seasonalStrategyService';

interface SeasonalModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'calendar' | 'exposure' | 'backtest' | 'alerts';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={16} /> },
  { id: 'exposure', label: 'Exposure', icon: <Layers size={16} /> },
  { id: 'backtest', label: 'Backtest', icon: <BarChart3 size={16} /> },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={16} /> },
];

const SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

const sportColors: Record<Sport, string> = {
  Baseball: '#ef4444',
  Basketball: '#f97316',
  Football: '#3b82f6',
  Hockey: '#8b5cf6',
  Soccer: '#10b981',
};

const sportColorsTailwind: Record<Sport, { text: string; bg: string; border: string }> = {
  Baseball: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  Basketball: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  Football: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  Hockey: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  Soccer: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
};

const phaseConfig: Record<SeasonPhase, { label: string; color: string; bg: string }> = {
  peak: { label: 'Peak', color: 'text-green-400', bg: 'bg-green-500' },
  rising: { label: 'Rising', color: 'text-emerald-400', bg: 'bg-emerald-500' },
  falling: { label: 'Falling', color: 'text-amber-400', bg: 'bg-amber-500' },
  trough: { label: 'Trough', color: 'text-red-400', bg: 'bg-red-500' },
};

const calendarCellColor = (index: number): string => {
  if (index >= 118) return 'bg-green-500/30 border-green-500/40';
  if (index >= 105) return 'bg-emerald-500/20 border-emerald-500/30';
  if (index >= 90) return 'bg-amber-500/20 border-amber-500/30';
  return 'bg-red-500/20 border-red-500/30';
};

const calendarCellText = (index: number): string => {
  if (index >= 118) return 'text-green-300';
  if (index >= 105) return 'text-emerald-300';
  if (index >= 90) return 'text-amber-300';
  return 'text-red-300';
};

export const SeasonalModal: React.FC<SeasonalModalProps> = ({ isOpen, onClose, cards }) => {
  const [activeTab, setActiveTab] = useState<TabId>('calendar');
  const [selectedSport, setSelectedSport] = useState<Sport>('Football');
  const [calendarSports, setCalendarSports] = useState<Sport[]>([...SPORTS]);

  const profiles = useMemo(() => getAllSportProfiles(), []);
  const windows = useMemo(() => getSeasonalWindows(), []);
  const alerts = useMemo(() => getSeasonalAlerts(cards), [cards]);
  const exposure = useMemo(() => getPortfolioExposure(cards), [cards]);
  const backtestResults = useMemo(() => getBacktestResults(), []);
  const backtestMonthly = useMemo(() => getBacktestMonthly(selectedSport), [selectedSport]);

  const [localAlerts, setLocalAlerts] = useState(alerts);

  const currentMonth = new Date().getMonth(); // 0-based

  const handleMarkRead = (alertId: string) => {
    markAlertRead(alertId);
    setLocalAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
  };

  const handleDismiss = (alertId: string) => {
    dismissAlert(alertId);
    setLocalAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const toggleCalendarSport = (sport: Sport) => {
    setCalendarSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  if (!isOpen) return null;

  // ---- Calendar Data ----
  const calendarData = MONTH_NAMES.map((name, i) => {
    const entry: Record<string, unknown> = { month: name };
    for (const sport of SPORTS) {
      const profile = profiles.find(p => p.sport === sport);
      if (profile) {
        entry[sport] = profile.monthlyIndices[i].index;
      }
    }
    return entry;
  });

  // ---- Radar data for exposure ----
  const radarData = SPORTS.map(sport => {
    const exp = exposure.find(e => e.sport === sport);
    return {
      sport,
      alignment: exp ? exp.seasonalAlignmentScore : 0,
      value: exp ? Math.min(100, (exp.totalValue / 500) * 100) : 0,
    };
  });

  // ---- Render ----
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">

        {/* Header */}
        <div className="p-8 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/30">
              <CalendarDays size={24} />
            </div>
            <div>
              <h2 className="text-4xl font-bebas tracking-widest text-white">
                Seasonal <span className="text-teal-400">Strategy Engine</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Price seasonality, buy/sell windows, portfolio exposure & backtesting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-6">
          <div className="flex gap-1 bg-slate-800/50 p-1 rounded-2xl">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'alerts' && localAlerts.filter(a => !a.isRead).length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full">
                    {localAlerts.filter(a => !a.isRead).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <>
              {/* Sport Toggles */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-medium mr-1">Sports:</span>
                {SPORTS.map(sport => {
                  const sc = sportColorsTailwind[sport];
                  const isOn = calendarSports.includes(sport);
                  return (
                    <button
                      key={sport}
                      onClick={() => toggleCalendarSport(sport)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        isOn
                          ? `${sc.text} ${sc.bg} ${sc.border}`
                          : 'text-slate-600 bg-slate-800/30 border-slate-700/50 hover:text-slate-400'
                      }`}
                    >
                      {sport}
                    </button>
                  );
                })}
              </div>

              {/* Line Chart - Monthly Indices */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Monthly Price Index by Sport</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={calendarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[60, 145]} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    {/* Reference line at 100 */}
                    {calendarSports.map(sport => (
                      <Area
                        key={sport}
                        type="monotone"
                        dataKey={sport}
                        stroke={sportColors[sport]}
                        fill={sportColors[sport]}
                        fillOpacity={0.08}
                        strokeWidth={2}
                        dot={{ r: 3, fill: sportColors[sport] }}
                      />
                    ))}
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Calendar Grid - Buy/Sell Zones */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">12-Month Seasonal Calendar</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left text-slate-400 font-medium py-2 px-3 w-24">Sport</th>
                        {MONTH_NAMES.map((m, i) => (
                          <th
                            key={m}
                            className={`text-center font-medium py-2 px-1.5 ${
                              i === currentMonth ? 'text-teal-400' : 'text-slate-400'
                            }`}
                          >
                            {m}
                            {i === currentMonth && (
                              <div className="w-1 h-1 bg-teal-400 rounded-full mx-auto mt-0.5" />
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {calendarSports.map(sport => {
                        const profile = profiles.find(p => p.sport === sport)!;
                        const sc = sportColorsTailwind[sport];
                        return (
                          <tr key={sport}>
                            <td className={`py-1.5 px-3 font-bold ${sc.text}`}>{sport}</td>
                            {profile.monthlyIndices.map((mi, i) => {
                              const cellColor = calendarCellColor(mi.index);
                              const textColor = calendarCellText(mi.index);
                              const isCurrent = i === currentMonth;
                              return (
                                <td key={i} className="py-1.5 px-1">
                                  <div
                                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border ${cellColor} ${
                                      isCurrent ? 'ring-1 ring-teal-400/50' : ''
                                    }`}
                                  >
                                    <span className={`font-mono font-bold text-[11px] ${textColor}`}>
                                      {mi.index}
                                    </span>
                                    {mi.phase === 'peak' && (
                                      <DollarSign size={9} className="text-green-400 mt-0.5" />
                                    )}
                                    {mi.phase === 'trough' && (
                                      <ShoppingCart size={9} className="text-red-400 mt-0.5" />
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/40" />
                    <span>Peak (118+)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
                    <span>Rising (105-117)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" />
                    <span>Falling (90-104)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
                    <span>Trough (&lt;90)</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <DollarSign size={10} className="text-green-400" /> Sell zone
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShoppingCart size={10} className="text-red-400" /> Buy zone
                  </div>
                </div>
              </div>

              {/* Active Windows */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Buy & Sell Windows</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {windows.map(w => {
                    const sc = sportColorsTailwind[w.sport];
                    return (
                      <div
                        key={w.id}
                        className={`p-4 rounded-xl border transition-all ${
                          w.isActive
                            ? w.type === 'buy'
                              ? 'bg-green-500/5 border-green-500/30'
                              : 'bg-amber-500/5 border-amber-500/30'
                            : 'bg-slate-800/20 border-slate-700/30 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {w.type === 'buy' ? (
                              <ShoppingCart size={14} className="text-green-400" />
                            ) : (
                              <DollarSign size={14} className="text-amber-400" />
                            )}
                            <span className={`text-xs font-bold ${sc.text}`}>{w.sport}</span>
                            {w.isActive && (
                              <span className="px-1.5 py-0.5 bg-teal-500/15 text-teal-400 text-[9px] font-bold rounded-full uppercase tracking-wider">
                                Active
                              </span>
                            )}
                          </div>
                          <span className={`font-mono text-sm font-bold ${
                            w.type === 'buy' ? 'text-green-400' : 'text-amber-400'
                          }`}>
                            +{w.historicalAvgReturn}%
                          </span>
                        </div>
                        <p className="text-xs text-white font-medium">{w.label}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{w.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                          <span>Months {w.startMonth}-{w.endMonth}</span>
                          <span>Confidence: {w.confidence}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Exposure Tab */}
          {activeTab === 'exposure' && (
            <>
              {/* Portfolio Exposure Cards */}
              {exposure.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <Layers size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No portfolio holdings to analyze</p>
                  <p className="text-xs text-slate-600 mt-1">Add cards to see seasonal exposure analysis</p>
                </div>
              ) : (
                <>
                  {/* Radar Chart */}
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Seasonal Alignment Radar</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="sport" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
                        <Radar
                          name="Alignment"
                          dataKey="alignment"
                          stroke="#14b8a6"
                          fill="#14b8a6"
                          fillOpacity={0.2}
                        />
                        <Radar
                          name="Value Weight"
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.15}
                        />
                        <Legend />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Exposure Details */}
                  <div className="space-y-3">
                    {exposure.map(exp => {
                      const sc = sportColorsTailwind[exp.sport];
                      const pc = phaseConfig[exp.currentPhase];
                      return (
                        <div
                          key={exp.sport}
                          className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-bold ${sc.text}`}>{exp.sport}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${pc.color} ${pc.bg}/15 border ${pc.bg}/30`}>
                                {pc.label}
                              </span>
                            </div>
                            <span className="text-sm font-mono text-white font-bold">
                              ${exp.totalValue.toLocaleString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-3 mb-3">
                            <div className="text-center">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Cards</p>
                              <p className="text-sm font-bold text-white font-mono">{exp.cardCount}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Index</p>
                              <p className={`text-sm font-bold font-mono ${pc.color}`}>{exp.currentIndex}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">To Peak</p>
                              <p className="text-sm font-bold text-white font-mono">{exp.monthsToNextPeak}mo</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Alignment</p>
                              <p className={`text-sm font-bold font-mono ${
                                exp.seasonalAlignmentScore >= 70 ? 'text-green-400' :
                                exp.seasonalAlignmentScore >= 40 ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                {exp.seasonalAlignmentScore}%
                              </p>
                            </div>
                          </div>

                          {/* Alignment bar */}
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-3">
                            <div
                              className={`h-full rounded-full transition-all ${
                                exp.seasonalAlignmentScore >= 70 ? 'bg-green-500' :
                                exp.seasonalAlignmentScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${exp.seasonalAlignmentScore}%` }}
                            />
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed">
                            {exp.recommendation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* Backtest Tab */}
          {activeTab === 'backtest' && (
            <>
              {/* Sport Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-medium mr-1">Sport:</span>
                {SPORTS.map(sport => {
                  const sc = sportColorsTailwind[sport];
                  const isOn = sport === selectedSport;
                  return (
                    <button
                      key={sport}
                      onClick={() => setSelectedSport(sport)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        isOn
                          ? `${sc.text} ${sc.bg} ${sc.border}`
                          : 'text-slate-600 bg-slate-800/30 border-slate-700/50 hover:text-slate-400'
                      }`}
                    >
                      {sport}
                    </button>
                  );
                })}
              </div>

              {/* Equity Curve */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-1">
                  3-Year Backtest: Seasonal vs Buy & Hold
                </h3>
                <p className="text-[11px] text-slate-400 mb-4">
                  Simulated $10,000 portfolio using seasonal timing versus passive holding
                </p>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={backtestMonthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      interval={5}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    />
                    <Line
                      type="monotone"
                      dataKey="seasonalValue"
                      name="Seasonal Strategy"
                      stroke="#14b8a6"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="buyHoldValue"
                      name="Buy & Hold"
                      stroke="#64748b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Backtest Results Table */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Performance Summary (All Sports)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 font-medium py-3 px-3">Sport</th>
                        <th className="text-right text-slate-400 font-medium py-3 px-3">Seasonal</th>
                        <th className="text-right text-slate-400 font-medium py-3 px-3">Buy & Hold</th>
                        <th className="text-right text-slate-400 font-medium py-3 px-3">Excess</th>
                        <th className="text-right text-slate-400 font-medium py-3 px-3">Win Rate</th>
                        <th className="text-right text-slate-400 font-medium py-3 px-3">Trades</th>
                        <th className="text-right text-slate-400 font-medium py-3 px-3">Max DD</th>
                        <th className="text-right text-slate-400 font-medium py-3 px-3">Sharpe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backtestResults.map(r => {
                        const sc = sportColorsTailwind[r.sport];
                        return (
                          <tr key={r.sport} className="border-b border-slate-800 hover:bg-slate-800/30">
                            <td className={`py-3 px-3 font-bold ${sc.text}`}>{r.sport}</td>
                            <td className="py-3 px-3 text-right font-mono text-green-400">+{r.seasonalReturn}%</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-300">+{r.buyHoldReturn}%</td>
                            <td className={`py-3 px-3 text-right font-mono font-bold ${
                              r.excessReturn > 0 ? 'text-teal-400' : 'text-red-400'
                            }`}>
                              {r.excessReturn > 0 ? '+' : ''}{r.excessReturn}%
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-white">{r.winRate}%</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-300">{r.tradeCount}</td>
                            <td className="py-3 px-3 text-right font-mono text-red-400">{r.maxDrawdown}%</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-300">{r.sharpeRatio}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strategy Notes */}
              <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Target size={18} className="text-teal-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                    <p className="font-bold text-white">How the seasonal strategy works</p>
                    <p>The strategy increases position size during historically favorable months and reduces exposure during weak periods. It does not predict future returns but uses multi-year seasonal patterns to time entries and exits.</p>
                    <p className="text-slate-500">Past simulated performance does not guarantee future results. All data is based on historical seasonal patterns.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <>
              {localAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <Bell size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No seasonal alerts</p>
                  <p className="text-xs text-slate-600 mt-1">Alerts will appear when buy/sell windows activate for your sports</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {localAlerts.map(alert => {
                    const sc = sportColorsTailwind[alert.sport];
                    const priorityConfig = {
                      high: { dot: 'bg-red-500', text: 'text-red-400', label: 'High' },
                      medium: { dot: 'bg-amber-500', text: 'text-amber-400', label: 'Medium' },
                      low: { dot: 'bg-slate-400', text: 'text-slate-400', label: 'Low' },
                    };
                    const pc = priorityConfig[alert.priority];
                    return (
                      <div
                        key={alert.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          alert.isRead
                            ? 'bg-slate-800/20 border-slate-700/30 opacity-60'
                            : 'bg-slate-800/40 border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pc.dot}`} />
                            {alert.windowType === 'buy' && <ShoppingCart size={14} className="text-green-400" />}
                            {alert.windowType === 'sell' && <DollarSign size={14} className="text-amber-400" />}
                            {!alert.windowType && <Bell size={14} className="text-slate-400" />}
                            <span className={`text-xs font-bold ${sc.text}`}>{alert.sport}</span>
                            <span className={`text-[9px] font-bold uppercase ${pc.text}`}>{pc.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {!alert.isRead && (
                              <button
                                onClick={() => handleMarkRead(alert.id)}
                                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-teal-400 transition-colors"
                                title="Mark as read"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDismiss(alert.id)}
                              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                              title="Dismiss"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        <h4 className="text-sm text-white font-bold mb-1">{alert.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{alert.message}</p>
                        <p className="text-[10px] text-slate-600 mt-2">
                          {new Date(alert.createdAt).toLocaleDateString()} &middot; Expires {new Date(alert.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeasonalModal;
