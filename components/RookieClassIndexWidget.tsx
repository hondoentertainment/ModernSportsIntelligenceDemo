// @ts-nocheck
import React, { useMemo } from 'react';
import { Trophy, TrendingUp, Calendar, BarChart3, ChevronRight } from 'lucide-react';
import { getRookieClassIndices, getTopROIRookies } from '../lib/analytics/rookieClassIndexService';

interface RookieClassIndexWidgetProps {
  onClick?: () => void;
}

const RookieClassIndexWidget: React.FC<RookieClassIndexWidgetProps> = ({ onClick }) => {
  const allClasses = useMemo(() => getRookieClassIndices(), []);
  const topClassThisYear = useMemo(() => {
    const recent = allClasses.filter((c) => c.year >= 2023).sort((a, b) => b.change_pct - a.change_pct);
    return recent[0];
  }, [allClasses]);
  const bestRookie = useMemo(() => {
    if (!topClassThisYear) return null;
    const rookies = getTopROIRookies(topClassThisYear.year, topClassThisYear.sport);
    return rookies[0] || null;
  }, [topClassThisYear]);

  const totalClasses = allClasses.length;

  // Days until 2026 NBA draft (approx June 25, 2026)
  const draftDate = new Date(2026, 5, 25);
  const now = new Date(2026, 2, 14);
  const daysUntilDraft = Math.ceil((draftDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 cursor-pointer hover:border-brand-lime/30 transition-colors"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Trophy size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Rookie Class <span className="text-brand-lime">Index</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Draft Capital &middot; Predictive Analytics
            </p>
          </div>
        </div>
        {onClick && (
          <button className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-brand-lime hover:bg-slate-700/50 transition-colors">
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Top Performing Class */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
              Hot Class
            </span>
          </div>
          <p className="text-2xl font-bebas tracking-wider text-white">
            {topClassThisYear ? `${topClassThisYear.year} ${topClassThisYear.sport.toUpperCase()}` : 'N/A'}
          </p>
          <p className="text-[10px] text-brand-muted mt-1">
            {topClassThisYear ? `+${topClassThisYear.change_pct}% trending` : ''}
          </p>
        </div>

        {/* Best ROI Rookie */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={14} className="text-amber-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
              Best ROI
            </span>
          </div>
          <p className="text-2xl font-bebas tracking-wider text-amber-400">
            {bestRookie ? `+${bestRookie.roi_since_draft}%` : 'N/A'}
          </p>
          <p className="text-[10px] text-brand-muted mt-1">
            {bestRookie?.player || ''}
          </p>
        </div>

        {/* Classes Tracked */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-cyan-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
              Classes Tracked
            </span>
          </div>
          <p className="text-2xl font-bebas tracking-wider text-cyan-400">
            {totalClasses}
          </p>
          <p className="text-[10px] text-brand-muted mt-1">
            4 sports covered
          </p>
        </div>

        {/* Draft Countdown */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-purple-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
              NBA Draft
            </span>
          </div>
          <p className="text-2xl font-bebas tracking-wider text-purple-400">
            {daysUntilDraft}d
          </p>
          <p className="text-[10px] text-brand-muted mt-1">
            Until 2026 draft
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
        <span>Tap to explore class rankings &amp; draft efficiency</span>
      </div>
    </div>
  );
};

export default RookieClassIndexWidget;
