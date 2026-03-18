import React, { useMemo } from 'react';
import { BookOpen, Star, MessageSquare, ChevronRight } from 'lucide-react';
import { getNarrativeStats } from '../lib/core/collectionNarrativeService';

interface CollectionNarrativeWidgetProps {
  onViewAll?: () => void;
}

const CollectionNarrativeWidget: React.FC<CollectionNarrativeWidgetProps> = ({ onViewAll }) => {
  const stats = useMemo(() => getNarrativeStats(), []);

  const scoreColor =
    stats.significanceScore >= 80
      ? 'text-emerald-400'
      : stats.significanceScore >= 50
        ? 'text-yellow-400'
        : 'text-red-400';

  const scoreBarColor =
    stats.significanceScore >= 80
      ? '#34d399'
      : stats.significanceScore >= 50
        ? '#facc15'
        : '#f87171';

  return (
    <div className="bg-brand-slate rounded-[2.5rem] p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen size={20} className="text-brand-lime" />
          <h3 className="font-bebas text-xl tracking-wide text-white">Collection Narrative</h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-slate-400 hover:text-brand-lime flex items-center gap-1 transition-colors"
          >
            Details <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Significance Score */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">Historical Significance</span>
          <span className={`font-bold text-lg ${scoreColor}`}>{stats.significanceScore}/100</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.significanceScore}%`, backgroundColor: scoreBarColor }}
          />
        </div>
      </div>

      {/* Primary Theme */}
      <div className="mb-5 bg-slate-800/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Star size={14} className="text-amber-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">Primary Theme</span>
        </div>
        <p className="text-sm text-white font-medium">{stats.primaryTheme}</p>
      </div>

      {/* Story Preview */}
      <div className="mb-5">
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
          &ldquo;{stats.storyPreview}&rdquo;
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-800/40 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-white">{stats.momentLinkCount}</div>
          <div className="text-xs text-slate-400">Moment Links</div>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <MessageSquare size={14} className="text-brand-lime" />
            <span className="text-lg font-bold text-white">{stats.memoCount}</span>
          </div>
          <div className="text-xs text-slate-400">Legacy Memos</div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onViewAll}
        className="w-full bg-brand-lime text-black font-semibold text-sm py-3 rounded-xl hover:brightness-110 transition-all"
      >
        Generate Story
      </button>
    </div>
  );
};

export default CollectionNarrativeWidget;
