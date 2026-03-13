import React, { useMemo } from 'react';
import { MapPin, ChevronRight, CheckCircle2, Tag, Zap } from 'lucide-react';
import { getActiveDeals, getWantList, getDealStats } from '../lib/cardShowService';

interface CardShowWidgetProps {
  onClick?: () => void;
}

function getDealScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-lime-400';
  if (score >= 35) return 'text-amber-400';
  return 'text-red-400';
}

function getDealScoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-500/15 border-emerald-500/30';
  if (score >= 50) return 'bg-lime-500/15 border-lime-500/30';
  if (score >= 35) return 'bg-amber-500/15 border-amber-500/30';
  return 'bg-red-500/15 border-red-500/30';
}

export const CardShowWidget: React.FC<CardShowWidgetProps> = ({ onClick }) => {
  const deals = useMemo(() => getActiveDeals(), []);
  const wantList = useMemo(() => getWantList(), []);
  const stats = useMemo(() => getDealStats(), []);

  const foundCount = wantList.filter((w) => w.found).length;
  const bestDeal = stats.bestDeal;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-lime-500/10 rounded-xl text-lime-400">
            <MapPin size={22} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-lg">Card Show Mode</h3>
            <p className="text-xs text-slate-500">Live deal tracking</p>
          </div>
        </div>
        <ChevronRight
          size={18}
          className="text-slate-600 group-hover:text-slate-400 transition-colors"
        />
      </div>

      {/* Active Deals Count */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-lg border border-slate-700/50">
          <Tag size={14} className="text-lime-400" />
          <span className="text-sm font-medium text-slate-200">{deals.length}</span>
          <span className="text-xs text-slate-500">deals logged</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-lg border border-slate-700/50">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span className="text-sm font-medium text-slate-200">
            {foundCount}/{wantList.length}
          </span>
          <span className="text-xs text-slate-500">found</span>
        </div>
      </div>

      {/* Best Deal Highlight */}
      {bestDeal && (
        <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/40">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">
              Best Deal
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">{bestDeal.player}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {bestDeal.cardDescription}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`text-lg font-bold ${getDealScoreColor(bestDeal.dealScore)}`}
              >
                {bestDeal.dealScore}
              </span>
              <span
                className={`ml-1.5 text-xs px-2 py-0.5 rounded-full border ${getDealScoreBg(bestDeal.dealScore)} ${getDealScoreColor(bestDeal.dealScore)}`}
              >
                ${bestDeal.marketValue - bestDeal.askingPrice} saved
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Want List Progress Bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500">Want List Progress</span>
          <span className="text-slate-400 font-medium">
            {Math.round((foundCount / wantList.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(foundCount / wantList.length) * 100}%` }}
          />
        </div>
      </div>
    </button>
  );
};

export default CardShowWidget;
