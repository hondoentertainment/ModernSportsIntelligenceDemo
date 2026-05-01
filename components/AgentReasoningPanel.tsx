// Phase 112+: Agent Reasoning Panel — Expandable multi-agent analysis display
import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronRight } from 'lucide-react';
import { AgentAnalysis } from '../lib/utils/agentFramework';

// ── Types ──────────────────────────────────────────────────────────────────

interface ConsensusBadgeProps {
  verdict: string;
  confidence: number;
  dissent?: string;
}

export interface AgentReasoningPanelProps {
  analyses: AgentAnalysis[];
  consensus?: {
    verdict: string;
    confidence: number;
    dissent?: string;
  };
  cardName?: string;
  isLoading?: boolean;
  className?: string;
}

// ── Verdict helpers ────────────────────────────────────────────────────────

type VerdictKey = 'strong_buy' | 'buy' | 'hold' | 'reduce' | 'sell';

const verdictConfig: Record<VerdictKey, { label: string; textClass: string; bgClass: string; borderClass: string }> = {
  strong_buy: {
    label: 'Strong Buy',
    textClass: 'text-lime-400',
    bgClass: 'bg-lime-500/10',
    borderClass: 'border-lime-500/30',
  },
  buy: {
    label: 'Buy',
    textClass: 'text-teal-400',
    bgClass: 'bg-teal-500/10',
    borderClass: 'border-teal-500/30',
  },
  hold: {
    label: 'Hold',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
  },
  reduce: {
    label: 'Reduce',
    textClass: 'text-orange-400',
    bgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/30',
  },
  sell: {
    label: 'Sell',
    textClass: 'text-red-400',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/30',
  },
};

function getVerdictConfig(verdict: string) {
  return verdictConfig[verdict as VerdictKey] ?? verdictConfig.hold;
}

const sentimentClass: Record<'positive' | 'neutral' | 'negative', string> = {
  positive: 'text-teal-400',
  neutral: 'text-slate-400',
  negative: 'text-red-400',
};

// ── Skeleton loader ────────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-slate-700/60 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-700/60 rounded w-24" />
        <div className="h-2 bg-slate-700/40 rounded w-40" />
      </div>
      <div className="h-5 bg-slate-700/60 rounded-full w-16" />
    </div>
    <div className="h-2 bg-slate-700/40 rounded w-full" />
    <div className="h-2 bg-slate-700/40 rounded w-3/4" />
    <div className="space-y-1.5">
      <div className="h-2 bg-slate-700/30 rounded w-full" />
      <div className="h-2 bg-slate-700/30 rounded w-5/6" />
    </div>
  </div>
);

// ── Consensus badge ────────────────────────────────────────────────────────

const ConsensusBadge: React.FC<ConsensusBadgeProps> = ({ verdict, confidence, dissent }) => {
  const vc = getVerdictConfig(verdict);
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${vc.bgClass} ${vc.borderClass} mb-4`}>
      <div className="flex items-center gap-3">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Consensus</span>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${vc.bgClass} ${vc.borderClass} ${vc.textClass} border`}>
          {vc.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">{confidence}% confidence</span>
        {dissent && (
          <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 rounded-full text-[10px] text-orange-400 font-semibold">
            Dissent
          </span>
        )}
      </div>
    </div>
  );
};

// ── Individual agent card ──────────────────────────────────────────────────

const AgentCard: React.FC<{ analysis: AgentAnalysis }> = ({ analysis }) => {
  const [showKeyPoints, setShowKeyPoints] = useState(false);
  const [showDataPoints, setShowDataPoints] = useState(false);

  const vc = getVerdictConfig(analysis.verdict);
  const { agent, confidence, summary, keyPoints, dataPoints } = analysis;

  return (
    <div className="bg-slate-800/60 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/70 transition-colors">
      {/* Agent header row */}
      <div className="flex items-center gap-3 p-5 pb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border"
          style={{ backgroundColor: `${agent.color}12`, borderColor: `${agent.color}30` }}
        >
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{agent.name}</span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{agent.title}</span>
          </div>
          <p className="text-[10px] text-slate-500 truncate">{agent.specialty}</p>
        </div>
        {/* Verdict badge */}
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${vc.bgClass} ${vc.borderClass} ${vc.textClass} shrink-0`}>
          {vc.label}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Confidence</span>
          <span className="text-xs font-bold text-slate-300">{confidence}%</span>
        </div>
        <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${vc.textClass.replace('text-', 'bg-').replace('-400', '-500')}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 pb-4">
        <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
      </div>

      {/* Key Reasoning toggle */}
      {keyPoints.length > 0 && (
        <div className="border-t border-slate-700/50">
          <button
            onClick={() => setShowKeyPoints(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-700/20 transition-colors"
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Reasoning</span>
            <ChevronRight
              size={14}
              className={`text-slate-500 transition-transform ${showKeyPoints ? 'rotate-90' : ''}`}
            />
          </button>
          {showKeyPoints && (
            <ul className="px-5 pb-4 space-y-2">
              {keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5 shrink-0 text-xs">•</span>
                  <span className="text-xs text-slate-300 leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Data Points toggle */}
      {dataPoints.length > 0 && (
        <div className="border-t border-slate-700/50">
          <button
            onClick={() => setShowDataPoints(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-700/20 transition-colors"
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Points</span>
            <ChevronRight
              size={14}
              className={`text-slate-500 transition-transform ${showDataPoints ? 'rotate-90' : ''}`}
            />
          </button>
          {showDataPoints && (
            <div className="px-5 pb-4">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-700/30">
                  {dataPoints.map((dp, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-4 text-slate-500 font-medium whitespace-nowrap">{dp.label}</td>
                      <td className={`py-2 font-semibold text-right ${sentimentClass[dp.sentiment]}`}>{dp.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────

const AgentReasoningPanel: React.FC<AgentReasoningPanelProps> = ({
  analyses,
  consensus,
  cardName,
  isLoading = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const agentCount = isLoading ? 4 : analyses.length;

  return (
    <div className={`rounded-2xl border border-slate-700/60 overflow-hidden bg-slate-900/50 ${className}`}>
      {/* Collapsed header toggle */}
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <Brain size={16} className="text-teal-400" />
          </div>
          <span className="text-sm font-bold text-slate-200">
            Agent Analysis
            {cardName ? ` — ${cardName}` : ''}
          </span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            · {agentCount} Agent{agentCount !== 1 ? 's' : ''}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-slate-700/50 pt-4 space-y-3">
          {/* Consensus badge */}
          {!isLoading && consensus && (
            <ConsensusBadge
              verdict={consensus.verdict}
              confidence={consensus.confidence}
              dissent={consensus.dissent}
            />
          )}

          {/* Agent cards or skeletons */}
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : analyses.map((analysis, i) => (
                <AgentCard key={`${analysis.agent.role}-${i}`} analysis={analysis} />
              ))
          }
        </div>
      )}
    </div>
  );
};

export default AgentReasoningPanel;
