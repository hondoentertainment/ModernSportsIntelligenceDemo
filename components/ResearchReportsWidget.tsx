// @ts-nocheck
import React, { useMemo } from 'react';
import {
  FileText,
  ChevronRight,
  BookOpen,
  Star,
  TrendingUp,
} from 'lucide-react';
import {
  getRecentReports,
  getContrarianPicks,
  getUnreadCount,
  ReportType,
} from '../lib/utils/researchReportsService';

interface ResearchReportsWidgetProps {
  onOpenModal: () => void;
}

const typeBadge: Record<ReportType, { label: string; color: string; bg: string }> = {
  weekly_market: { label: 'Weekly', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  player_analysis: { label: 'Player', color: 'text-lime-400', bg: 'bg-lime-500/10' },
  sector_deep_dive: { label: 'Sector', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  event_preview: { label: 'Event', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  contrarian_report: { label: 'Contrarian', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  special_report: { label: 'Special', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

export const ResearchReportsWidget: React.FC<ResearchReportsWidgetProps> = ({ onOpenModal }) => {
  const reports = useMemo(() => getRecentReports(), []);
  const contrarianCount = useMemo(() => getContrarianPicks().length, []);
  const unreadCount = useMemo(() => getUnreadCount(), []);

  const latestReport = reports[0];
  const latestDate = latestReport
    ? new Date(latestReport.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  const badge = latestReport ? typeBadge[latestReport.type] : null;

  return (
    <div
      onClick={onOpenModal}
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-lime-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-lime-500/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-lime-500/10 rounded-lg">
            <FileText size={18} className="text-lime-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">MSI Research</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-lime-500 text-slate-900 text-[10px] font-bold rounded-full">
              {unreadCount} New
            </span>
          )}
        </div>
        <ChevronRight size={16} className="text-slate-400" />
      </div>

      {/* Latest Report */}
      {latestReport && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            {badge && (
              <span className={`px-1.5 py-0.5 ${badge.bg} ${badge.color} text-[10px] font-medium rounded`}>
                {badge.label}
              </span>
            )}
            <span className="text-[10px] text-slate-500">{latestDate}</span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {latestReport.title}
          </p>
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-700/50">
        <div className="flex items-center gap-1">
          <BookOpen size={12} className="text-slate-500" />
          <span className="text-[10px] text-slate-400">{reports.length} Reports</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp size={12} className="text-orange-400" />
          <span className="text-[10px] text-orange-400">{contrarianCount} Contrarian</span>
        </div>
        {reports.filter((r) => r.bookmarked).length > 0 && (
          <div className="flex items-center gap-1">
            <Star size={12} className="text-amber-400" />
            <span className="text-[10px] text-amber-400">
              {reports.filter((r) => r.bookmarked).length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchReportsWidget;
