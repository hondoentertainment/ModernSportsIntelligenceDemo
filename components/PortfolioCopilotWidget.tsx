// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Bot,
  ChevronRight,
  Bell,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { getDailyBriefing, getProactiveNudges, getCopilotSuggestions } from '../lib/utils/portfolioCopilotService';

interface PortfolioCopilotWidgetProps {
  onOpenModal?: () => void;
}

const PortfolioCopilotWidget: React.FC<PortfolioCopilotWidgetProps> = ({ onOpenModal }) => {
  const briefing = useMemo(() => getDailyBriefing(), []);
  const nudges = useMemo(() => getProactiveNudges(), []);
  const suggestions = useMemo(() => getCopilotSuggestions().slice(0, 1), []);

  const unreadNudges = nudges.filter(n => !n.isRead);
  const topSuggestion = suggestions[0];
  const urgentNudges = nudges.filter(n => !n.isRead && (n.priority === 'critical' || n.priority === 'high'));

  return (
    <div
      onClick={onOpenModal}
      className="bg-brand-slate rounded-[2.5rem] p-8 hover:border-brand-lime/30 border border-slate-700/50 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-lime/10">
            <Bot size={18} className="text-brand-lime" />
          </div>
          <h3 className="font-bebas text-lg tracking-wider text-slate-100 uppercase">
            AI Portfolio Copilot
          </h3>
        </div>
        <ChevronRight
          size={14}
          className="text-slate-600 group-hover:text-brand-lime transition-colors"
        />
      </div>

      {/* Daily Briefing Preview */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={10} className="text-brand-lime" />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Daily Briefing
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
          {briefing.summary}
        </p>
      </div>

      {/* Top Suggestion */}
      {topSuggestion && (
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 mb-5">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageSquare size={10} className="text-sky-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Top Suggestion
            </span>
          </div>
          <p className="text-xs font-bold text-slate-200 mb-0.5">{topSuggestion.title}</p>
          <p className="text-[10px] text-slate-500 truncate">{topSuggestion.description}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Bell size={10} className="text-amber-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Nudges
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-brand-lime">
              {unreadNudges.length}
            </span>
            {urgentNudges.length > 0 && (
              <span className="text-[9px] font-black text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded-full border border-red-500/40">
                {urgentNudges.length} urgent
              </span>
            )}
          </div>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={10} className="text-purple-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Portfolio
            </span>
          </div>
          <span className={`text-lg font-black ${briefing.portfolioChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {briefing.portfolioChangePct >= 0 ? '+' : ''}{briefing.portfolioChangePct}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCopilotWidget;
