// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldAlert,
  Zap,
  BarChart3,
  AlertTriangle,
  TrendingDown,
  Activity,
  Target,
  Clock,
  Flame,
  CheckCircle2,
  ArrowDownRight,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import {
  getScenarios,
  getStressTestResults,
  getStressTestStats,
  getPortfolioResilience,
  getHistoricalCrashes,
  getMostVulnerableCards,
  formatCurrency,
  formatPercent,
  getSeverityColor,
  getSeverityLabel,
  getScenarioIcon,
  getRiskColor,
} from '../lib/analytics/portfolioStressTestService';
import type {
  StressScenario,
  StressTestResult,
  StressTestStats,
  PortfolioResilience,
  HistoricalCrash,
  MostAffectedCard,
  SeverityLevel,
} from '../lib/analytics/portfolioStressTestService';

interface PortfolioStressTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'scenarios' | 'results' | 'summary';

const tabs = [
  { id: 'scenarios' as TabId, label: 'Scenarios', icon: <Zap size={16} /> },
  { id: 'results' as TabId, label: 'Results', icon: <BarChart3 size={16} /> },
  { id: 'summary' as TabId, label: 'Summary', icon: <FileText size={16} /> },
];

const severityStyles: Record<SeverityLevel, { bg: string; text: string; border: string }> = {
  mild: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  moderate: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  severe: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  catastrophic: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

const PortfolioStressTestModal: React.FC<PortfolioStressTestModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('scenarios');

  const scenarios = useMemo(() => getScenarios(), []);
  const results = useMemo(() => getStressTestResults(), []);
  const stats = useMemo(() => getStressTestStats(), []);
  const resilience = useMemo(() => getPortfolioResilience(), []);
  const crashes = useMemo(() => getHistoricalCrashes(), []);
  const vulnerableCards = useMemo(() => getMostVulnerableCards(), []);

  if (!isOpen) return null;

  const renderScenarios = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Total Scenarios</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{scenarios.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs text-slate-400">Catastrophic</span>
          </div>
          <p className="text-2xl font-bold text-red-400">
            {scenarios.filter((s) => s.severity === 'catastrophic').length}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-orange-400" />
            <span className="text-xs text-slate-400">Avg Impact</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.avgImpact}%</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Tests Run</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.totalTestsRun}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Stress Scenarios
        </h3>
        {scenarios.map((scenario: StressScenario) => {
          const sev = severityStyles[scenario.severity];
          return (
            <div
              key={scenario.id}
              className={`${sev.bg} rounded-xl p-5 border ${sev.border}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${sev.bg}`}>
                    <span className="text-lg">{getScenarioIcon(scenario.type)}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{scenario.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{scenario.description}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>
                  {getSeverityLabel(scenario.severity)}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div>
                  <p className="text-xs text-slate-500">Price Impact</p>
                  <p className={`text-sm font-semibold ${scenario.priceImpact < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {scenario.priceImpact > 0 ? '+' : ''}{scenario.priceImpact}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Recovery Time</p>
                  <p className="text-sm font-semibold text-slate-200">{scenario.recoveryTime}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Sports</p>
                  <p className="text-sm font-semibold text-slate-200">{scenario.affectedSports.join(', ')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Categories</p>
                  <p className="text-sm font-semibold text-slate-200">{scenario.affectedCategories.slice(0, 2).join(', ')}</p>
                </div>
              </div>
              {scenario.historicalPrecedent && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Clock size={12} />
                  <span>Precedent: {scenario.historicalPrecedent}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Stress Test Results
        </h3>
        {results.map((result: StressTestResult) => (
          <div
            key={result.scenarioId}
            className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{result.scenarioName}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Risk Score: <span style={{ color: getRiskColor(result.riskScore) }}>{result.riskScore}/100</span>
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${result.impactPercent < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {result.impactPercent > 0 ? '+' : ''}{result.impactPercent.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">
                  {formatCurrency(result.impactAmount)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Portfolio Before</p>
                <p className="text-sm font-semibold text-slate-200">{formatCurrency(result.portfolioValueBefore)}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Portfolio After</p>
                <p className="text-sm font-semibold text-slate-200">{formatCurrency(result.portfolioValueAfter)}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${result.riskScore >= 70 ? 'bg-red-500' : result.riskScore >= 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
            {result.mostAffectedCards.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Most Affected Cards</p>
                <div className="space-y-2">
                  {result.mostAffectedCards.slice(0, 3).map((card, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{card.cardName}</span>
                      <span className={card.impactPercent < 0 ? 'text-red-400' : 'text-green-400'}>
                        {card.impactPercent > 0 ? '+' : ''}{card.impactPercent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert size={20} className="text-lime-400" />
          <h3 className="text-sm font-semibold text-slate-300">Portfolio Resilience Score</h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#334155" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={resilience.overallScore >= 70 ? '#84cc16' : resilience.overallScore >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="2.5"
                strokeDasharray={`${resilience.overallScore} ${100 - resilience.overallScore}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
              {resilience.overallScore}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-medium mb-2">
              {resilience.overallScore >= 70 ? 'Strong Resilience' : resilience.overallScore >= 40 ? 'Moderate Vulnerability' : 'High Risk Portfolio'}
            </p>
            <div className="flex flex-wrap gap-2">
              {resilience.strengths.slice(0, 3).map((s, i) => (
                <span key={i} className="px-2 py-1 bg-green-500/10 text-green-400 rounded-full text-xs flex items-center gap-1">
                  <CheckCircle2 size={10} /> {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {resilience.vulnerabilities.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Vulnerabilities
          </h3>
          <div className="space-y-2">
            {resilience.vulnerabilities.map((v, i) => (
              <div key={i} className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-200">{v.area}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                    {v.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Most Vulnerable Cards
        </h3>
        <div className="space-y-2">
          {vulnerableCards.slice(0, 5).map((card: MostAffectedCard, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">{card.cardName}</p>
                <p className="text-xs text-slate-500">{card.player}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-red-400 flex items-center gap-1">
                  <ArrowDownRight size={14} /> {card.impactPercent}%
                </p>
                <p className="text-xs text-slate-500">
                  {formatCurrency(card.currentValue)} &rarr; {formatCurrency(card.projectedValue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Historical Crashes
        </h3>
        <div className="space-y-2">
          {crashes.map((crash: HistoricalCrash) => (
            <div key={crash.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-orange-400" />
                  <span className="text-sm font-semibold text-slate-200">{crash.name}</span>
                  <span className="text-xs text-slate-500">({crash.year})</span>
                </div>
                <span className="text-sm font-bold text-red-400">-{Math.abs(crash.impactPercent)}%</span>
              </div>
              <p className="text-xs text-slate-400">{crash.description}</p>
              <p className="text-xs text-slate-500 mt-1">Recovery: {crash.recoveryMonths} months</p>
            </div>
          ))}
        </div>
      </div>

      {resilience.recommendations.length > 0 && (
        <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-lime-400" />
            <p className="text-sm font-semibold text-lime-300">Recommendations</p>
          </div>
          <ul className="space-y-2">
            {resilience.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <ShieldAlert size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Portfolio Stress Test</h2>
              <p className="text-sm text-slate-400">Simulate market shocks and measure portfolio resilience</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex gap-1 p-4 border-b border-slate-700/50">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-lime-500/20 text-lime-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {activeTab === 'scenarios' && renderScenarios()}
          {activeTab === 'results' && renderResults()}
          {activeTab === 'summary' && renderSummary()}
        </div>
      </div>
    </div>
  );
};

export default PortfolioStressTestModal;
