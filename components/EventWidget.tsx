import React, { useMemo } from 'react';
import {
  MapPin,
  Calendar,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  DollarSign,
  Users,
  Clock,
} from 'lucide-react';
import {
  getDashboardSummary,
  getEventTypeLabel,
  getEventTypeColor,
  EventDashboardSummary,
} from '../lib/eventPlannerService';

interface EventWidgetProps {
  onClick?: () => void;
}

export const EventWidget: React.FC<EventWidgetProps> = ({ onClick }) => {
  const summary: EventDashboardSummary = useMemo(() => getDashboardSummary(), []);

  const { nextEvent, daysUntilNext, prepListCount, prepListReady, recentROI, aggregateROI } = summary;

  const daysLabel = daysUntilNext !== null
    ? daysUntilNext <= 0 ? 'Today!' : daysUntilNext === 1 ? '1 day' : `${daysUntilNext} days`
    : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
            <MapPin size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Card Show <span className="text-amber-400">Planner</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Events, prep lists & deal tracking
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Next Event */}
      {nextEvent ? (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              Next Event
            </p>
            {daysLabel && (
              <span className={`flex items-center gap-1 text-xs font-bold ${
                daysUntilNext !== null && daysUntilNext <= 7
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                <Clock size={12} />
                {daysLabel}
              </span>
            )}
          </div>
          <p className="text-lg font-bebas tracking-wider text-white leading-snug">
            {nextEvent.name}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(nextEvent.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {nextEvent.startDate !== nextEvent.endDate && (
                <> - {new Date(nextEvent.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
              )}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {nextEvent.city}, {nextEvent.state}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getEventTypeColor(nextEvent.type)}`}>
              {getEventTypeLabel(nextEvent.type)}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <Users size={10} />
              {nextEvent.estimatedAttendance.toLocaleString()} est.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <p className="text-sm text-slate-500 text-center">
            No upcoming events — browse the event calendar to plan your next show
          </p>
        </div>
      )}

      {/* Prep Status + ROI Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Show Prep */}
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
          <ClipboardList size={14} className="text-blue-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Prep List</p>
            <p className="text-sm font-bold text-white">
              {prepListCount > 0
                ? `${prepListReady}/${prepListCount} ready`
                : 'No items'}
            </p>
          </div>
        </div>

        {/* Running ROI */}
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
          <DollarSign size={14} className="text-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Event ROI</p>
            <p className={`text-sm font-bold ${
              aggregateROI.roiPct >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {aggregateROI.eventCount > 0
                ? `${aggregateROI.roiPct >= 0 ? '+' : ''}${aggregateROI.roiPct.toFixed(1)}%`
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Event Result */}
      {recentROI && (
        <div className="flex items-center gap-3 px-4 py-3 bg-purple-500/5 border border-purple-500/15 rounded-xl">
          <TrendingUp size={14} className="text-purple-400 flex-shrink-0" />
          <span className="text-xs text-slate-400 flex-shrink-0">Last:</span>
          <span className="text-xs text-white font-medium truncate">
            {recentROI.eventName}
          </span>
          <span className={`ml-auto text-xs font-bold flex-shrink-0 ${
            recentROI.roiPercentage >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {recentROI.roiPercentage >= 0 ? '+' : ''}{recentROI.roiPercentage.toFixed(1)}%
          </span>
        </div>
      )}
    </button>
  );
};

export default EventWidget;
