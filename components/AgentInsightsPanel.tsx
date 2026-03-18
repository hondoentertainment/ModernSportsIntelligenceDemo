import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  AlertTriangle,
  Zap,
  Target,
  Shield,
} from 'lucide-react';
import { CardInventory } from '../types';
import { generatePortfolioBriefing, AGENTS, AgentRole } from '../lib/utils/agentFramework';

interface AgentInsightsPanelProps {
  inventory: CardInventory[];
  onCardClick?: (_card: CardInventory) => void;
}

const healthConfig = {
  excellent: { color: 'text-brand-lime', bg: 'bg-brand-lime/10 border-brand-lime/20', icon: '🟢' },
  good: { color: 'text-brand-green', bg: 'bg-brand-green/10 border-brand-green/20', icon: '🟡' },
  fair: { color: 'text-brand-orange', bg: 'bg-brand-orange/10 border-brand-orange/20', icon: '🟠' },
  poor: { color: 'text-brand-red', bg: 'bg-brand-red/10 border-brand-red/20', icon: '🔴' },
};

const AgentInsightsPanel: React.FC<AgentInsightsPanelProps> = ({ inventory, onCardClick }) => {
  const briefing = useMemo(() => generatePortfolioBriefing(inventory), [inventory]);
  const [expandedAgent, setExpandedAgent] = useState<AgentRole | null>(null);

  if (inventory.length === 0) return null;

  const hc = healthConfig[briefing.overallHealth];

  return (
    <div className="luminous-card rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[100px] rounded-full mr-[-4rem] mb-[-4rem] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-blue/10 rounded-2xl border border-brand-blue/20">
            <Shield size={22} className="text-brand-blue" />
          </div>
          <div>
            <h3 className="text-2xl font-bebas tracking-widest text-white">Synthetic Analyst Team</h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Multi-Agent Portfolio Intelligence</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${hc.bg}`}>
          <span>{hc.icon}</span>
          <span className={`text-[10px] font-black uppercase tracking-widest ${hc.color}`}>
            {briefing.overallHealth} ({briefing.healthScore})
          </span>
        </div>
      </div>

      {/* Agent Reports */}
      <div className="space-y-3 mb-8">
        {briefing.agentReports.map((report) => {
          const isExpanded = expandedAgent === report.agent.role;
          return (
            <div
              key={report.agent.role}
              className={`bg-brand-charcoal/30 rounded-2xl border border-slate-800 overflow-hidden transition-all ${isExpanded ? 'border-slate-600' : 'hover:border-slate-700'}`}
            >
              <button
                onClick={() => setExpandedAgent(isExpanded ? null : report.agent.role)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border"
                  style={{ backgroundColor: `${report.agent.color}10`, borderColor: `${report.agent.color}30` }}
                >
                  {report.agent.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-white">{report.agent.name}</span>
                    <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">{report.agent.title}</span>
                  </div>
                  <p className="text-sm text-slate-300 truncate">{report.headline}</p>
                </div>
                {report.actionItems.length > 0 && (
                  <span className="px-2 py-1 bg-brand-lime/10 border border-brand-lime/20 rounded-lg text-[9px] font-black text-brand-lime uppercase shrink-0">
                    {report.actionItems.length} Action{report.actionItems.length > 1 ? 's' : ''}
                  </span>
                )}
                <ChevronRight
                  size={16}
                  className={`text-brand-muted shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-sm text-brand-muted pl-14">{report.details}</p>
                  {report.actionItems.length > 0 && (
                    <div className="pl-14 space-y-2">
                      {report.actionItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Zap size={12} className="text-brand-lime mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Two-column: Top Picks + Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Picks */}
        {briefing.topPicks.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <Target size={14} className="text-brand-green" /> Agent Top Picks
            </h4>
            <div className="space-y-2">
              {briefing.topPicks.map((pick) => {
                const card = inventory.find(c => c.id === pick.cardId);
                return (
                  <div
                    key={pick.cardId}
                    className="flex items-center gap-3 p-3 bg-brand-green/5 rounded-xl border border-brand-green/10 cursor-pointer hover:border-brand-green/30 transition-all"
                    onClick={() => card && onCardClick?.(card)}
                  >
                    <span className="text-sm">{AGENTS[pick.agent].icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{pick.player}</p>
                      <p className="text-[10px] text-brand-muted truncate">{pick.reason}</p>
                    </div>
                    <ChevronRight size={14} className="text-brand-muted shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warnings */}
        {briefing.warnings.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-brand-orange" /> Risk Alerts
            </h4>
            <div className="space-y-2">
              {briefing.warnings.map((warn, i) => {
                const card = inventory.find(c => c.id === warn.cardId);
                return (
                  <div
                    key={`${warn.cardId}-${i}`}
                    className="flex items-center gap-3 p-3 bg-brand-orange/5 rounded-xl border border-brand-orange/10 cursor-pointer hover:border-brand-orange/30 transition-all"
                    onClick={() => card && onCardClick?.(card)}
                  >
                    <span className="text-sm">{AGENTS[warn.agent].icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{warn.player}</p>
                      <p className="text-[10px] text-brand-muted truncate">{warn.warning}</p>
                    </div>
                    <ChevronRight size={14} className="text-brand-muted shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AgentInsightsPanel);
