import React, { useState, useMemo } from 'react';
import {
  X,
  FlaskConical,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  BarChart3,
  Shield,
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  Percent,
  Target,
  Calculator,
  Layers,
  GitCompare,
  Plus,
  Eye,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
} from 'lucide-react';
import {
  getScenarios,
  getNavProjections,
  getDiversificationImpact,
  getSimulatorStats,
  compareScenarios,
} from '../lib/whatIfSimulatorService';
import type {
  Scenario,
  NavProjection,
  DiversificationImpact,
  SimulatorStats,
  ScenarioType,
} from '../lib/whatIfSimulatorService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const typeColors: Record<ScenarioType, string> = {
  buy: 'text-green-400 bg-green-500/20',
  sell: 'text-red-400 bg-red-500/20',
  trade: 'text-blue-400 bg-blue-500/20',
  grade: 'text-amber-400 bg-amber-500/20',
  hold: 'text-slate-400 bg-slate-500/20',
  liquidate: 'text-red-400 bg-red-500/20',
};

const typeIcons: Record<ScenarioType, React.ReactNode> = {
  buy: <Plus size={14} />,
  sell: <TrendingDown size={14} />,
  trade: <ArrowUpDown size={14} />,
  grade: <Target size={14} />,
  hold: <Shield size={14} />,
  liquidate: <Zap size={14} />,
};

type Tab = 'scenarios' | 'projections' | 'diversification' | 'compare';

const WhatIfSimulatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  const scenarios = useMemo(() => getScenarios(), []);
  const projections = useMemo(() => getNavProjections(selectedScenario || undefined), [selectedScenario]);
  const diversification = useMemo(() => getDiversificationImpact(selectedScenario || undefined), [selectedScenario]);
  const stats = useMemo(() => getSimulatorStats(), []);
  const comparison = useMemo(() => {
    if (scenarios.length >= 2) return compareScenarios(scenarios[0].id, scenarios[1].id);
    return null;
  }, [scenarios]);

  if (!isOpen) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'scenarios', label: 'Scenarios', icon: <FlaskConical size={16} /> },
    { id: 'projections', label: 'NAV Projections', icon: <TrendingUp size={16} /> },
    { id: 'diversification', label: 'Diversification', icon: <Layers size={16} /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare size={16} /> },
  ];

  const maxProjectionDelta = Math.max(...projections.map(p => Math.abs(p.delta)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-charcoal border border-slate-700 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20">
              <FlaskConical size={22} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">What-If Simulator</h2>
              <p className="text-xs text-slate-400">Trade-scenario planning workspace for NAV and diversification impact</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-slate-700/50 bg-slate-800/30">
          {[
            { label: 'Scenarios', value: stats.totalScenarios.toString(), icon: <FlaskConical size={14} />, color: 'text-indigo-400' },
            { label: 'Avg Return', value: `${stats.avgProjectedReturn >= 0 ? '+' : ''}${stats.avgProjectedReturn.toFixed(1)}%`, icon: <Percent size={14} />, color: stats.avgProjectedReturn >= 0 ? 'text-green-400' : 'text-red-400' },
            { label: 'Best Scenario', value: `+${stats.bestScenarioReturn}%`, icon: <TrendingUp size={14} />, color: 'text-green-400' },
            { label: 'Avg Confidence', value: `${stats.avgConfidence.toFixed(0)}%`, icon: <Target size={14} />, color: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className={`flex items-center justify-center gap-1 text-xs mb-1 ${stat.color}`}>
                {stat.icon} {stat.label}
              </div>
              <div className="text-lg font-bold text-slate-100">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-700/50 text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'scenarios' && (
            <div className="space-y-3">
              {scenarios.map(scenario => (
                <div
                  key={scenario.id}
                  className={`border rounded-xl transition-all cursor-pointer ${
                    selectedScenario === scenario.id
                      ? 'border-indigo-500/50 bg-indigo-500/5'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                  }`}
                  onClick={() => setSelectedScenario(scenario.id === selectedScenario ? null : scenario.id)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${typeColors[scenario.type]}`}>
                          {typeIcons[scenario.type]} {scenario.type.toUpperCase()}
                        </span>
                        <h3 className="text-base font-semibold text-slate-100">{scenario.name}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${scenario.projectedNavPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {scenario.projectedNavPercent >= 0 ? '+' : ''}{scenario.projectedNavPercent}%
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); setExpandedScenario(expandedScenario === scenario.id ? null : scenario.id); }}
                          className="p-1 hover:bg-slate-700 rounded"
                        >
                          {expandedScenario === scenario.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{scenario.description}</p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center">
                        <div className="text-xs text-slate-500">NAV Impact</div>
                        <div className={`text-sm font-semibold ${scenario.projectedNavChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {scenario.projectedNavChange >= 0 ? '+' : ''}${Math.abs(scenario.projectedNavChange).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500">Risk Delta</div>
                        <div className={`text-sm font-semibold ${scenario.riskDelta <= 0 ? 'text-green-400' : 'text-amber-400'}`}>
                          {scenario.riskDelta >= 0 ? '+' : ''}{scenario.riskDelta}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500">Tax Impact</div>
                        <div className="text-sm font-semibold text-slate-300">${scenario.taxImpact.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500">Confidence</div>
                        <div className="text-sm font-semibold text-indigo-400">{scenario.confidenceScore}%</div>
                      </div>
                    </div>
                  </div>

                  {expandedScenario === scenario.id && (
                    <div className="border-t border-slate-700/50 p-4">
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Cards in Scenario</h4>
                      <div className="space-y-2">
                        {scenario.cards.map(card => (
                          <div key={card.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                card.action === 'add' ? 'bg-green-500/20 text-green-400' :
                                card.action === 'remove' ? 'bg-red-500/20 text-red-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>{card.action.toUpperCase()}</span>
                              <span className="text-slate-200">{card.cardName}</span>
                              {card.quantity > 1 && <span className="text-slate-500">x{card.quantity}</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400">{card.grade}</span>
                              <span className="text-slate-200 font-medium">${card.currentValue > 0 ? card.currentValue.toLocaleString() : card.projectedValue.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'projections' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Info size={14} className="text-slate-400" />
                <span className="text-sm text-slate-400">Projected NAV over the next 10 months — baseline vs selected scenario</span>
              </div>
              <div className="space-y-2">
                {projections.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-800/30 rounded-lg p-3">
                    <span className="text-sm text-slate-400 w-20">{p.date}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-500 w-16">Baseline</span>
                        <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                          <div className="bg-slate-500 rounded-full h-2" style={{ width: `${(p.baselineNav / 1500000) * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 w-24 text-right">${(p.baselineNav / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-400 w-16">Scenario</span>
                        <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                          <div className="bg-indigo-500 rounded-full h-2" style={{ width: `${(p.scenarioNav / 1500000) * 100}%` }} />
                        </div>
                        <span className="text-xs text-indigo-400 w-24 text-right">${(p.scenarioNav / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold w-20 text-right ${p.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {p.delta >= 0 ? '+' : ''}${(p.delta / 1000).toFixed(0)}K
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'diversification' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={14} className="text-slate-400" />
                <span className="text-sm text-slate-400">Allocation impact of selected scenario on portfolio diversification</span>
              </div>
              {diversification.map((d, i) => (
                <div key={i} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-200">{d.category}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      d.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                      d.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      d.impact === 'low' ? 'bg-green-500/20 text-green-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>{d.impact.toUpperCase()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Current</div>
                      <div className="text-sm font-medium text-slate-300">{d.currentAllocation}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Projected</div>
                      <div className={`text-sm font-medium ${
                        Math.abs(d.projectedAllocation - d.optimalAllocation) < Math.abs(d.currentAllocation - d.optimalAllocation)
                          ? 'text-green-400' : 'text-amber-400'
                      }`}>{d.projectedAllocation}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Optimal</div>
                      <div className="text-sm font-medium text-indigo-400">{d.optimalAllocation}%</div>
                    </div>
                  </div>
                  <div className="relative h-2 bg-slate-700/50 rounded-full">
                    <div className="absolute h-2 bg-slate-500 rounded-full" style={{ width: `${d.currentAllocation}%` }} />
                    <div className="absolute h-2 bg-indigo-500/60 rounded-full" style={{ width: `${d.projectedAllocation}%` }} />
                    <div className="absolute w-0.5 h-4 -top-1 bg-green-400" style={{ left: `${d.optimalAllocation}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'compare' && comparison && (
            <div className="space-y-4">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <GitCompare size={16} className="text-indigo-400" /> Scenario Comparison
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">NAV Difference</div>
                    <div className={`text-lg font-bold ${comparison.navDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {comparison.navDifference >= 0 ? '+' : ''}${Math.abs(comparison.navDifference).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Risk Difference</div>
                    <div className={`text-lg font-bold ${comparison.riskDifference <= 0 ? 'text-green-400' : 'text-amber-400'}`}>
                      {comparison.riskDifference >= 0 ? '+' : ''}{comparison.riskDifference.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Tax Difference</div>
                    <div className="text-lg font-bold text-slate-300">${Math.abs(comparison.taxDifference).toLocaleString()}</div>
                  </div>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-indigo-400" />
                    <span className="text-sm text-indigo-300">{comparison.recommendation}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {scenarios.slice(0, 2).map(s => (
                  <div key={s.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${typeColors[s.type]}`}>{s.type.toUpperCase()}</span>
                      <h4 className="text-sm font-semibold text-slate-200">{s.name}</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-400">NAV Change</span><span className={s.projectedNavPercent >= 0 ? 'text-green-400' : 'text-red-400'}>{s.projectedNavPercent >= 0 ? '+' : ''}{s.projectedNavPercent}%</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Risk Delta</span><span className="text-slate-300">{s.riskDelta}%</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Tax Impact</span><span className="text-slate-300">${s.taxImpact.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Confidence</span><span className="text-indigo-400">{s.confidenceScore}%</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Cards</span><span className="text-slate-300">{s.cards.length}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700/50 bg-slate-800/30">
          <span className="text-xs text-slate-500">Projections are estimates based on historical trends — not financial advice</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors">
              New Scenario
            </button>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-semibold transition-colors">
              Run Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulatorModal;
