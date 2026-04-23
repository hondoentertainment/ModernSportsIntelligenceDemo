// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield, AlertTriangle, TrendingDown, Activity, BarChart3,
  Play, ChevronRight, Clock, Target, Flame, DollarSign,
  HeartPulse, UserMinus, ShieldAlert, Scale, HelpCircle, Zap,
} from 'lucide-react';
import {
  getScenarios,
  getScenarioById,
  runStressTest,
  getStressTestResults,
  getResilienceScore,
  getPortfolioResilience,
  getStressTestStats,
  getHistoricalCrashes,
  getRecoveryProjection,
  getMostVulnerableCards,
  formatCurrency,
  formatPercent,
  getSeverityColor,
  getSeverityLabel,
  getScenarioIcon,
  getRiskColor,
  type StressScenario,
  type StressTestResult,
  type PortfolioResilience,
  type StressTestStats,
  type HistoricalCrash,
  type MostAffectedCard,
  type RecoveryProjectionPoint,
} from '../lib/analytics/portfolioStressTestService.ts';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, Cell,
} from 'recharts';

const TABS = ['Scenarios', 'Results', 'Resilience', 'History'] as const;
type Tab = typeof TABS[number];

const CHART_COLORS = ['#10b981', '#60a5fa', '#f87171', '#a78bfa', '#fbbf24', '#34d399'];

const ICON_MAP: Record<string, React.ReactNode> = {
  HeartPulse: <HeartPulse className="w-5 h-5" />,
  UserMinus: <UserMinus className="w-5 h-5" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5" />,
  TrendingDown: <TrendingDown className="w-5 h-5" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" />,
  Scale: <Scale className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  HelpCircle: <HelpCircle className="w-5 h-5" />,
};

const SEVERITY_BG: Record<string, string> = {
  mild: 'bg-green-900/40 border-green-700',
  moderate: 'bg-yellow-900/40 border-yellow-700',
  severe: 'bg-orange-900/40 border-orange-700',
  catastrophic: 'bg-red-900/40 border-red-700',
};

const PortfolioStressTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Scenarios');
  const [scenarios, setScenarios] = useState<StressScenario[]>([]);
  const [results, setResults] = useState<StressTestResult[]>([]);
  const [resilience, setResilience] = useState<PortfolioResilience | null>(null);
  const [resilienceScore, setResilienceScore] = useState(50);
  const [stats, setStats] = useState<StressTestStats | null>(null);
  const [crashes, setCrashes] = useState<HistoricalCrash[]>([]);
  const [vulnerableCards, setVulnerableCards] = useState<MostAffectedCard[]>([]);
  const [selectedResult, setSelectedResult] = useState<StressTestResult | null>(null);
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    try {
      setScenarios(getScenarios());
      setResults(getStressTestResults());
      setResilience(getPortfolioResilience());
      setResilienceScore(getResilienceScore());
      setStats(getStressTestStats());
      setCrashes(getHistoricalCrashes());
      setVulnerableCards(getMostVulnerableCards());
      setLoading(false);
    } catch {
      setError('Failed to load stress test data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRunTest = useCallback((scenarioId: string) => {
    setRunningScenario(scenarioId);
    // Simulate animation delay
    setTimeout(() => {
      try {
        const result = runStressTest(scenarioId);
        setSelectedResult(result);
        loadData();
        setActiveTab('Results');
      } catch (err) {
        setError('Failed to run stress test');
      }
      setRunningScenario(null);
    }, 800);
  }, [loadData]);

  const totalTestsRun = useMemo(() => stats?.totalTestsRun ?? 0, [stats]);
  const avgImpact = useMemo(() => stats?.avgImpact ?? 0, [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Portfolio Stress Test</h1>
        </div>
        <p className="text-slate-400">
          Simulate market scenarios to understand portfolio vulnerabilities and build resilience.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Activity className="w-4 h-4" />
            Tests Run
          </div>
          <div className="text-2xl font-bold">{totalTestsRun}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <TrendingDown className="w-4 h-4" />
            Avg Impact
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {avgImpact > 0 ? `-${avgImpact}%` : '0%'}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Shield className="w-4 h-4" />
            Resilience Score
          </div>
          <div className={`text-2xl font-bold ${getRiskColor(100 - resilienceScore)}`}>
            {resilienceScore}/100
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <BarChart3 className="w-4 h-4" />
            Scenarios
          </div>
          <div className="text-2xl font-bold">{scenarios.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Scenarios' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Stress Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`bg-slate-800 rounded-xl p-5 border ${SEVERITY_BG[scenario.severity] || 'border-slate-700'} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">
                      {ICON_MAP[getScenarioIcon(scenario.type)] || ICON_MAP.HelpCircle}
                    </span>
                    <h3 className="font-semibold text-lg">{scenario.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(scenario.severity)} ${SEVERITY_BG[scenario.severity]}`}>
                    {getSeverityLabel(scenario.severity)}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-4">{scenario.description}</p>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-slate-400">
                    Impact: <span className={scenario.priceImpact < 0 ? 'text-red-400' : 'text-green-400'}>
                      {formatPercent(scenario.priceImpact)}
                    </span>
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {scenario.recoveryTime}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {scenario.affectedSports.map((sport) => (
                    <span key={sport} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      {sport}
                    </span>
                  ))}
                </div>
                {scenario.historicalPrecedent && (
                  <p className="text-xs text-slate-500 mb-3 italic">
                    Precedent: {scenario.historicalPrecedent}
                  </p>
                )}
                <button
                  onClick={() => handleRunTest(scenario.id)}
                  disabled={runningScenario !== null}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    runningScenario === scenario.id
                      ? 'bg-blue-600 animate-pulse text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } disabled:opacity-50`}
                >
                  {runningScenario === scenario.id ? (
                    <>
                      <Zap className="w-4 h-4 animate-bounce" />
                      Running Test...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Stress Test
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Results' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>

          {results.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
              <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No stress tests have been run yet.</p>
              <p className="text-slate-500 text-sm mt-1">Go to Scenarios tab to run your first test.</p>
            </div>
          ) : (
            <>
              {/* Selected Result or Latest */}
              {(() => {
                const display = selectedResult || results[results.length - 1];
                return (
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold mb-4">{display.scenarioName}</h3>

                    {/* Before/After Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-slate-900 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Before</div>
                        <div className="text-xl font-bold text-green-400">
                          {formatCurrency(display.portfolioValueBefore)}
                        </div>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">After</div>
                        <div className="text-xl font-bold text-red-400">
                          {formatCurrency(display.portfolioValueAfter)}
                        </div>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Impact</div>
                        <div className={`text-xl font-bold ${display.impactPercent < 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {formatPercent(display.impactPercent)} ({formatCurrency(display.impactAmount)})
                        </div>
                      </div>
                    </div>

                    {/* Risk Score */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Risk Score</span>
                        <span className={`font-bold ${getRiskColor(display.riskScore)}`}>
                          {display.riskScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            display.riskScore <= 25 ? 'bg-green-500' :
                            display.riskScore <= 50 ? 'bg-yellow-500' :
                            display.riskScore <= 75 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${display.riskScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Most Affected Cards Table */}
                    <h4 className="font-medium mb-3">Most Affected Cards</h4>
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-slate-400 border-b border-slate-700">
                            <th className="pb-2 pr-4">Card</th>
                            <th className="pb-2 pr-4">Player</th>
                            <th className="pb-2 pr-4 text-right">Current</th>
                            <th className="pb-2 pr-4 text-right">Projected</th>
                            <th className="pb-2 text-right">Impact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {display.mostAffectedCards.map((card, idx) => (
                            <tr key={idx} className="border-b border-slate-700/50">
                              <td className="py-2 pr-4 text-slate-300">{card.cardName}</td>
                              <td className="py-2 pr-4">{card.player}</td>
                              <td className="py-2 pr-4 text-right">{formatCurrency(card.currentValue)}</td>
                              <td className="py-2 pr-4 text-right">{formatCurrency(card.projectedValue)}</td>
                              <td className={`py-2 text-right font-medium ${card.impactPercent < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {formatPercent(card.impactPercent)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Recovery Projection Chart */}
                    <h4 className="font-medium mb-3">Recovery Projection</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={display.recoveryProjection}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis
                            dataKey="month"
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            label={{ value: 'Months', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                          />
                          <YAxis
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                            labelStyle={{ color: '#94a3b8' }}
                            formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                            labelFormatter={(label) => `Month ${label}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#60a5fa"
                            strokeWidth={2}
                            dot={{ fill: '#60a5fa', r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })()}

              {/* All Results Summary */}
              {results.length > 1 && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4">All Test Results</h3>
                  <div className="space-y-2">
                    {results.map((r) => (
                      <button
                        key={r.scenarioId}
                        onClick={() => setSelectedResult(r)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          selectedResult?.scenarioId === r.scenarioId
                            ? 'bg-blue-900/30 border border-blue-700'
                            : 'bg-slate-900 hover:bg-slate-700'
                        }`}
                      >
                        <span className="font-medium">{r.scenarioName}</span>
                        <div className="flex items-center gap-4">
                          <span className={r.impactPercent < 0 ? 'text-red-400' : 'text-green-400'}>
                            {formatPercent(r.impactPercent)}
                          </span>
                          <span className={`text-sm ${getRiskColor(r.riskScore)}`}>
                            Risk: {r.riskScore}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'Resilience' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio Resilience</h2>

          {resilience && (
            <>
              {/* Resilience Score Gauge */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4 text-center">Overall Resilience Score</h3>
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-24 mb-4">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                      {/* Background arc */}
                      <path
                        d="M 10 95 A 90 90 0 0 1 190 95"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      {/* Score arc */}
                      <path
                        d="M 10 95 A 90 90 0 0 1 190 95"
                        fill="none"
                        stroke={resilienceScore >= 60 ? '#10b981' : resilienceScore >= 40 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(resilienceScore / 100) * 283} 283`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                      <span className={`text-4xl font-bold ${getRiskColor(100 - resilienceScore)}`}>
                        {resilienceScore}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {resilienceScore >= 70 ? 'Your portfolio is well-protected against market shocks.' :
                     resilienceScore >= 40 ? 'Your portfolio has moderate resilience. Consider diversifying.' :
                     'Your portfolio is highly vulnerable. Immediate action recommended.'}
                  </p>
                </div>
              </div>

              {/* Vulnerabilities */}
              {resilience.vulnerabilities.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    Vulnerabilities
                  </h3>
                  <div className="space-y-3">
                    {resilience.vulnerabilities.map((v, idx) => (
                      <div key={idx} className="bg-slate-900 rounded-lg p-4 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{v.area}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            v.severity === 'critical' ? 'bg-red-900/50 text-red-400' :
                            v.severity === 'high' ? 'bg-orange-900/50 text-orange-400' :
                            'bg-yellow-900/50 text-yellow-400'
                          }`}>
                            {v.severity}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{v.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {resilience.strengths.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {resilience.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <span className="text-green-400 mt-0.5">&#10003;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {resilience.recommendations.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {resilience.recommendations.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Most Vulnerable Cards */}
              {vulnerableCards.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4">Most Vulnerable Cards</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vulnerableCards.slice(0, 6)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                          type="number"
                          stroke="#94a3b8"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <YAxis
                          type="category"
                          dataKey="player"
                          stroke="#94a3b8"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                          formatter={(value: number) => [`${value}%`, 'Avg Impact']}
                        />
                        <Bar dataKey="impactPercent" radius={[0, 4, 4, 0]}>
                          {vulnerableCards.slice(0, 6).map((_, idx) => (
                            <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'History' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Historical Market Crashes</h2>
          <p className="text-slate-400 text-sm mb-4">
            Learn from past market disruptions to better prepare your portfolio for future shocks.
          </p>
          <div className="space-y-4">
            {crashes.map((crash) => (
              <div key={crash.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{crash.name}</h3>
                    <span className="text-sm text-slate-400">{crash.year}</span>
                  </div>
                  <span className="text-red-400 font-bold text-lg">
                    {formatPercent(crash.impactPercent)}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-3">{crash.description}</p>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Recovery: {crash.recoveryMonths} months
                  </span>
                  <div className="flex gap-1">
                    {crash.affectedMarkets.map((m) => (
                      <span key={m} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Impact Comparison Chart */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4">Impact Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crashes.map((c) => ({ name: c.name, impact: Math.abs(c.impactPercent), recovery: c.recoveryMonths }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  />
                  <Bar dataKey="impact" name="Impact %" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioStressTest;
