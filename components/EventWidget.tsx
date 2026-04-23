// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Calendar,
  MapPin,
  ChevronRight,
  Package,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getUpcomingEvents,
  getPrepList,
  getEventHistory,
  CardEvent,
  EventROI,
} from '../lib/utils/eventPlannerService';

interface EventWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getEventTypeColor(type: CardEvent['type']): { text: string; bg: string; border: string } {
  switch (type) {
    case 'national':
      return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    case 'regional':
      return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'local':
      return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'trade_night':
      return { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
  }
}

export const EventWidget: React.FC<EventWidgetProps> = ({ cards, onClick }) => {
  const nextEvent = useMemo(() => {
    const upcoming = getUpcomingEvents();
    return upcoming.length > 0 ? upcoming[0] : null;
  }, []);

  const prepStatus = useMemo(() => {
    if (!nextEvent) return null;
    const prep = getPrepList(nextEvent.id);
    if (!prep) return { total: 0, ready: 0 };
    return {
      total: prep.items.length,
      ready: prep.items.filter(i => i.status === 'ready').length,
    };
  }, [nextEvent]);

  const recentROI = useMemo<EventROI | null>(() => {
    const history = getEventHistory();
    return history.length > 0 ? history[0] : null;
  }, []);

  const days = nextEvent ? daysUntil(nextEvent.date) : null;
  const typeColors = nextEvent ? getEventTypeColor(nextEvent.type) : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Calendar size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Card Show <span className="text-blue-400">Planner</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Events & prep lists
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Next Event */}
      {nextEvent && typeColors ? (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${typeColors.bg} ${typeColors.text} border ${typeColors.border}`}>
                {nextEvent.type === 'trade_night' ? 'Trade Night' : nextEvent.type}
              </span>
              <span className="text-sm font-bold text-white truncate max-w-[180px]">
                {nextEvent.name}
              </span>
            </div>
            {days !== null && (
              <span className={`flex items-center gap-1 text-xs font-bold ${
                days <= 7 ? 'text-amber-400' : days <= 30 ? 'text-blue-400' : 'text-slate-400'
              }`}>
                <Clock size={12} />
                {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days} days`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin size={12} className="flex-shrink-0" />
            <span>{nextEvent.location}</span>
            <span className="text-slate-600 mx-1">|</span>
            <span>{new Date(nextEvent.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>

          {/* Prep Status */}
          {prepStatus && prepStatus.total > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <Package size={12} className="text-green-400" />
              <span className="text-slate-400">Prep list:</span>
              <span className="font-bold text-green-400">{prepStatus.ready}</span>
              <span className="text-slate-500">/ {prepStatus.total} cards ready</span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${prepStatus.total > 0 ? (prepStatus.ready / prepStatus.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
          {prepStatus && prepStatus.total === 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Package size={12} />
              <span>No prep list yet</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center text-sm text-slate-500">
          No upcoming events
        </div>
      )}

      {/* Recent Event ROI */}
      {recentROI && (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <TrendingUp size={14} className={recentROI.netROI >= 0 ? 'text-green-400' : 'text-red-400'} />
          <span className="text-xs text-slate-400">Last event:</span>
          <span className="text-xs text-white font-medium truncate flex-1">
            {recentROI.eventName}
          </span>
          <span className={`text-xs font-bold font-mono ${recentROI.netROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {recentROI.netROI >= 0 ? '+' : ''}${recentROI.netROI.toFixed(0)}
          </span>
        </div>
      )}

      {/* Summary Stats */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Upcoming:</span>
          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold rounded-md">
            {getUpcomingEvents().length} events
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Cards:</span>
          <span className="px-2 py-0.5 bg-slate-700/50 border border-slate-600 text-slate-300 font-bold rounded-md">
            {cards.filter(c => c.status !== 'sold').length} available
          </span>
        </div>
      </div>
    </button>
  );
};

export default EventWidget;
