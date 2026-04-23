// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { X, Shield, ArrowRight, TrendingUp, AlertTriangle, Check, RotateCcw, Scissors, Plus, Calendar } from 'lucide-react';
import { CardInventory } from '../types';
import { CorrelationService, HedgeNode } from '../lib/analytics/CorrelationService';

interface HedgeSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: CardInventory[];
}

const HedgeSimulationModal: React.FC<HedgeSimulationModalProps> = ({ isOpen, onClose, inventory }) => {
  const [deployedNodes, setDeployedNodes] = useState<Set<string>>(() => {
    const hedges = CorrelationService.getDeployedHedges();
    return new Set(hedges.map(h => h.nodeId));
  });

  const simulation = useMemo(() => CorrelationService.generateHedgeSimulation(inventory), [inventory]);

  const handleDeploy = (nodeId: string) => {
    CorrelationService.deployHedgeNode(nodeId);
    setDeployedNodes(prev => new Set([...prev, nodeId]));
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return '#EF4444';
      case 'Elevated': return '#F97316';
      case 'Moderate': return '#F59E0B';
      case 'Low': return '#22C55E';
      case 'Minimal': return '#D9F99D';
      default: return '#94A3B8';
    }
  };

  const getNodeIcon = (type: HedgeNode['type']) => {
    switch (type) {
      case 'rotate': return <RotateCcw size={14} />;
      case 'trim': return <Scissors size={14} />;
      case 'hedge': return <Plus size={14} />;
      case 'rebalance': return <Calendar size={14} />;
    }
  };

  const getNodeColor = (type: HedgeNode['type']) => {
    switch (type) {
      case 'rotate': return '#60A5FA';
      case 'trim': return '#F87171';
      case 'hedge': return '#D9F99D';
      case 'rebalance': return '#F59E0B';
    }
  };

  if (!isOpen) return null;

  const deployedCount = simulation.nodes.filter(n => deployedNodes.has(n.id)).length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-brand-slate border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-brand-slate/95 backdrop-blur-sm border-b border-slate-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lime/10 rounded-xl text-brand-lime">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-wide text-white">Hedge Simulation Engine</h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Cross-Asset Correlation Hedging</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Score Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Current Score</p>
              <p className="text-3xl font-mono font-bold text-white">{simulation.currentScore}</p>
            </div>
            <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Projected Score</p>
              <p className="text-3xl font-mono font-bold text-brand-lime">{simulation.projectedScore}</p>
            </div>
            <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Risk Level</p>
              <p className="text-lg font-black uppercase tracking-wider" style={{ color: getRiskColor(simulation.portfolioRisk) }}>
                {simulation.portfolioRisk}
              </p>
            </div>
            <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-4 text-center">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Rebalance Urgency</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-3xl font-mono font-bold" style={{ color: simulation.rebalanceUrgency > 60 ? '#F87171' : simulation.rebalanceUrgency > 30 ? '#F59E0B' : '#22C55E' }}>
                  {simulation.rebalanceUrgency}
                </p>
                <span className="text-[9px] text-brand-muted font-black">/100</span>
              </div>
            </div>
          </div>

          {/* Seasonal Outlook */}
          <div className="bg-brand-charcoal/30 border border-slate-800 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2 bg-brand-orange/10 rounded-lg text-brand-orange shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Seasonal Outlook</p>
              <p className="text-sm text-white font-medium leading-relaxed">{simulation.seasonalOutlook}</p>
            </div>
          </div>

          {/* Concentration Breakdown */}
          <div className="bg-brand-charcoal/30 border border-slate-800 rounded-2xl p-5">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Portfolio Concentration</p>
            <div className="space-y-3">
              {simulation.concentrationBreakdown.map(item => (
                <div key={item.sport} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-white w-20">{item.sport}</span>
                  <div className="flex-1 h-6 bg-brand-charcoal rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-700"
                      style={{
                        width: `${Math.round(item.weight * 100)}%`,
                        backgroundColor: item.risk === 'High' ? 'rgba(248,113,113,0.6)' : item.risk === 'Medium' ? 'rgba(245,158,11,0.4)' : 'rgba(217,249,157,0.3)',
                      }}
                    />
                    <span className="absolute inset-0 flex items-center px-3 text-[10px] font-mono font-bold text-white">
                      {Math.round(item.weight * 100)}% — ${item.value.toLocaleString()}
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest w-12 text-right"
                    style={{ color: item.risk === 'High' ? '#F87171' : item.risk === 'Medium' ? '#F59E0B' : '#22C55E' }}
                  >
                    {item.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hedge Nodes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-bebas tracking-wide text-white">Virtual Hedge Nodes</p>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                  {deployedCount}/{simulation.nodes.length} deployed
                </p>
              </div>
              {deployedCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-lime/10 border border-brand-lime/20 rounded-full">
                  <Check size={12} className="text-brand-lime" />
                  <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">{deployedCount} Active</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {simulation.nodes.map(node => {
                const isDeployed = deployedNodes.has(node.id);
                const color = getNodeColor(node.type);
                return (
                  <div
                    key={node.id}
                    className={`border rounded-2xl p-5 transition-all ${isDeployed ? 'bg-brand-lime/5 border-brand-lime/20' : 'bg-brand-charcoal/30 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${color}15`, color }}>
                          {getNodeIcon(node.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>
                              {node.type}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
                              {node.fromSport}
                              {node.fromSport !== node.toSport && (
                                <> <ArrowRight size={10} className="inline" /> {node.toSport}</>
                              )}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
                              {node.allocationPercent}% allocation
                            </span>
                          </div>
                          <p className="text-xs text-white/80 font-medium leading-relaxed">{node.rationale}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <TrendingUp size={12} className="text-brand-lime" />
                            <span className="text-[10px] font-bold text-brand-lime">+{node.expectedImpact} diversification pts</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => !isDeployed && handleDeploy(node.id)}
                        disabled={isDeployed}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                          isDeployed
                            ? 'bg-brand-lime/10 border border-brand-lime/20 text-brand-lime cursor-default'
                            : 'bg-brand-charcoal hover:bg-slate-700 border border-slate-700 text-white hover:text-brand-lime'
                        }`}
                      >
                        {isDeployed ? (
                          <span className="flex items-center gap-1"><Check size={12} /> Deployed</span>
                        ) : 'Deploy'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Correlation Insights */}
          {simulation.correlationInsights.length > 0 && (
            <div className="bg-brand-charcoal/30 border border-slate-800 rounded-2xl p-5">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">Correlation Insights</p>
              <div className="space-y-2">
                {simulation.correlationInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <AlertTriangle size={12} className="text-brand-orange shrink-0 mt-0.5" />
                    <p className="text-xs text-white/70 font-medium leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deploy All */}
          {deployedCount < simulation.nodes.length && (
            <button
              onClick={() => {
                simulation.nodes.forEach(n => {
                  if (!deployedNodes.has(n.id)) handleDeploy(n.id);
                });
              }}
              className="w-full py-4 bg-brand-lime text-brand-charcoal font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white transition-all"
            >
              Deploy All Hedge Nodes ({simulation.nodes.length - deployedCount} remaining)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HedgeSimulationModal;
