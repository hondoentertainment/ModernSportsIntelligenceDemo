// @ts-nocheck
import React, { useMemo } from 'react';
import { Users, ChevronRight, Target, Zap } from 'lucide-react';
import {
  getNextDraftEvent,
  getDraftProspects,
  getDraftStats,
  daysUntilDraft,
} from '../lib/utils/draftWarRoomService';

interface DraftWarRoomWidgetProps {
  onOpenModal?: () => void;
}

const SPORT_COLOR: Record<string, string> = {
  NFL: 'text-emerald-400',
  NBA: 'text-blue-400',
  MLB: 'text-amber-400',
  NHL: 'text-cyan-400',
  MLS: 'text-rose-400',
};

const DraftWarRoomWidget: React.FC<DraftWarRoomWidgetProps> = ({ onOpenModal }) => {
  const nextEvent = useMemo(() => getNextDraftEvent(), []);
  const stats = useMemo(() => getDraftStats(), []);
  const topProspect = useMemo(() => {
    if (!nextEvent) return null;
    const prospects = getDraftProspects(nextEvent.sport);
    return prospects[0] || null;
  }, [nextEvent]);

  const days = nextEvent ? daysUntilDraft(nextEvent.date) : 0;

  return (
    <div
      onClick={onOpenModal}
      className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 hover:border-brand-lime/30 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-lime/10">
            <Users size={16} className="text-brand-lime" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Draft War Room
          </span>
        </div>
        <ChevronRight
          size={14}
          className="text-slate-600 group-hover:text-brand-lime transition-colors"
        />
      </div>

      {/* Next Draft */}
      {nextEvent && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Target size={12} className={SPORT_COLOR[nextEvent.sport] || 'text-slate-400'} />
            <span className="text-xs font-bold text-slate-200">{nextEvent.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500">{nextEvent.location}</span>
            <span className="text-xs font-bold text-brand-lime">{days}d away</span>
          </div>
        </div>
      )}

      {/* Top Prospect */}
      {topProspect && (
        <div className="bg-slate-800/50 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Zap size={10} className="text-amber-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                #1 Prospect
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              Mock #{topProspect.mockDraftPosition}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-100">{topProspect.name}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-slate-500">
              {topProspect.position} · {topProspect.school}
            </span>
            <span className="text-[10px] font-bold text-emerald-400">
              ${topProspect.topCard.currentValue}
            </span>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-200">{stats.upcomingDrafts}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">Drafts</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-200">{stats.trackedProspects}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">Tracked</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-400">+{stats.avgDraftNightSurge}%</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">Avg Surge</p>
        </div>
      </div>
    </div>
  );
};

export default DraftWarRoomWidget;
