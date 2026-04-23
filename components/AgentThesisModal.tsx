// @ts-nocheck
import React, { useMemo } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { CardInventory } from '../types';
import { generateInvestmentThesis, AGENTS, AgentAnalysis } from '../lib/utils/agentFramework';

interface AgentThesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardInventory;
  portfolio: CardInventory[];
}

const verdictConfig: Record<AgentAnalysis['verdict'], { label: string; color: string; bg: string }> = {
  strong_buy: { label: 'Strong Buy', color: 'text-brand-lime', bg: 'bg-brand-lime/10 border-brand-lime/20' },
  buy: { label: 'Buy', color: 'text-brand-green', bg: 'bg-brand-green/10 border-brand-green/20' },
  hold: { label: 'Hold', color: 'text-brand-blue', bg: 'bg-brand-blue/10 border-brand-blue/20' },
  reduce: { label: 'Reduce', color: 'text-brand-orange', bg: 'bg-brand-orange/10 border-brand-orange/20' },
  sell: { label: 'Sell', color: 'text-brand-red', bg: 'bg-brand-red/10 border-brand-red/20' },
};

const AgentThesisModal: React.FC<AgentThesisModalProps> = ({ isOpen, onClose, card, portfolio }) => {
  const thesis = useMemo(() => generateInvestmentThesis(card, portfolio), [card, portfolio]);

  if (!isOpen) return null;

  const cc = verdictConfig[thesis.consensus.verdict];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-brand-slate border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-charcoal/60 to-brand-charcoal/30">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {Object.values(AGENTS).map(a => (
                <div
                  key={a.role}
                  className="w-10 h-10 rounded-full border-2 border-brand-slate flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${a.color}20` }}
                  title={`${a.name} — ${a.title}`}
                >
                  {a.icon}
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-2xl font-bebas tracking-widest text-white">Investment Thesis</h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{card.player} • 4-Agent Consensus</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="p-3 bg-brand-charcoal hover:bg-slate-800 rounded-xl transition-colors">
            <X size={20} className="text-brand-muted" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">

          {/* Consensus Banner */}
          <div className={`p-6 rounded-2xl border ${cc.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Consensus Verdict</span>
              <span className="text-[10px] font-black text-brand-muted">Confidence: <span className="text-white">{thesis.consensus.confidence}%</span></span>
            </div>
            <p className={`text-4xl font-bebas tracking-widest ${cc.color} mb-2`}>{cc.label}</p>
            <p className="text-sm text-slate-300">{thesis.consensus.summary}</p>
            {thesis.dissent && (
              <div className="flex items-start gap-2 mt-4 p-3 bg-brand-charcoal/50 rounded-xl">
                <AlertTriangle size={14} className="text-brand-orange mt-0.5 shrink-0" />
                <p className="text-[10px] text-brand-orange">{thesis.dissent}</p>
              </div>
            )}
          </div>

          {/* Individual Agent Analyses */}
          <div className="space-y-4">
            {thesis.analyses.map((analysis) => {
              const vc = verdictConfig[analysis.verdict];
              return (
                <div key={analysis.agent.role} className="bg-brand-charcoal/30 rounded-2xl border border-slate-800 overflow-hidden">
                  {/* Agent Header */}
                  <div className="flex items-center gap-4 p-5 border-b border-slate-800/50">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border"
                      style={{ backgroundColor: `${analysis.agent.color}10`, borderColor: `${analysis.agent.color}30` }}
                    >
                      {analysis.agent.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{analysis.agent.name}</span>
                        <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{analysis.agent.title}</span>
                      </div>
                      <p className="text-[10px] text-brand-muted truncate">{analysis.agent.specialty}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${vc.bg} ${vc.color}`}>
                        {vc.label}
                      </div>
                      <span className="text-xs font-mono text-brand-muted">{analysis.confidence}%</span>
                    </div>
                  </div>

                  {/* Analysis Content */}
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-300">{analysis.summary}</p>

                    {/* Data Points */}
                    <div className="flex flex-wrap gap-3">
                      {analysis.dataPoints.map((dp, i) => (
                        <div key={i} className="px-3 py-2 bg-brand-charcoal/50 rounded-xl border border-slate-800">
                          <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-0.5">{dp.label}</p>
                          <p className={`text-xs font-mono font-bold ${dp.sentiment === 'positive' ? 'text-brand-green' : dp.sentiment === 'negative' ? 'text-brand-red' : 'text-white'}`}>
                            {dp.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Key Points */}
                    <div className="space-y-1.5">
                      {analysis.keyPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: analysis.agent.color }} />
                          <span className="text-xs text-slate-400">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentThesisModal;
