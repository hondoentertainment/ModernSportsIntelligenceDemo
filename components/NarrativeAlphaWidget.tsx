import React, { useMemo } from 'react';
import { BookOpen, ChevronRight, Zap, Radio, TrendingUp } from 'lucide-react';
import {
  getNarrativeStats,
  getEmergingNarratives,
  getMediaMentions,
  PHASE_COLORS,
  NARRATIVE_TYPE_META,
} from '../lib/narrativeAlphaService';

interface NarrativeAlphaWidgetProps {
  onClick?: () => void;
}

export const NarrativeAlphaWidget: React.FC<NarrativeAlphaWidgetProps> = ({ onClick }) => {
  const stats = useMemo(() => getNarrativeStats(), []);
  const emerging = useMemo(() => getEmergingNarratives(), []);
  const mentions = useMemo(() => getMediaMentions(), []);

  const topNarrative = emerging[0];
  const recentMentions = mentions.slice(0, 3);

  const sourceIcon: Record<string, string> = {
    'ESPN': '📺',
    'Twitter/X': '𝕏',
    'Reddit': '🔴',
    'YouTube': '▶',
    'Podcast': '🎙',
    'Bloomberg': '💹',
    'Local News': '📰',
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-400">
            <BookOpen size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Narrative <span className="text-pink-400">Alpha</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Early narrative detection engine
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-600 group-hover:text-pink-400 transition-colors" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <Radio size={14} className="mx-auto text-pink-400 mb-1" />
          <p className="text-lg font-bold text-white">{stats.activeNarratives}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Active</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <Zap size={14} className="mx-auto text-cyan-400 mb-1" />
          <p className="text-lg font-bold text-white">{stats.emergingCount}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Emerging</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <TrendingUp size={14} className="mx-auto text-green-400 mb-1" />
          <p className="text-lg font-bold text-white">+{stats.totalAlphaGenerated.toFixed(0)}%</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Alpha</p>
        </div>
      </div>

      {/* Top Emerging Narrative */}
      {topNarrative && (
        <div className="bg-slate-800/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">{topNarrative.playerName}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${PHASE_COLORS[topNarrative.maturityPhase]}`}>
              {topNarrative.maturityPhase}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">{topNarrative.title}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500 rounded-full transition-all"
                style={{ width: `${topNarrative.strengthScore}%` }}
              />
            </div>
            <span className="text-[10px] text-pink-400 font-bold">{topNarrative.strengthScore}</span>
          </div>
        </div>
      )}

      {/* Media Mentions Feed */}
      <div className="space-y-1.5">
        {recentMentions.map((mention) => (
          <div
            key={mention.id}
            className="flex items-center gap-2 text-[11px] bg-slate-800/20 rounded-lg px-3 py-1.5"
          >
            <span className="flex-shrink-0 w-4 text-center">{sourceIcon[mention.source] || '📄'}</span>
            <span className="text-slate-400 truncate flex-1">{mention.headline}</span>
            <span className={`flex-shrink-0 font-bold ${mention.sentimentScore > 0.5 ? 'text-green-400' : mention.sentimentScore > 0 ? 'text-amber-400' : 'text-red-400'}`}>
              {mention.sentimentScore > 0 ? '+' : ''}{(mention.sentimentScore * 100).toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
};

export default NarrativeAlphaWidget;
