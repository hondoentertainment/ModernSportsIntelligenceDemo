import React from 'react';
import { Clock, ChevronRight, Award, Crown } from 'lucide-react';
import { getVintageStats, getVintageCards, getVintageMarketTrends } from '../lib/vintageMarketService';

interface Props {
  onOpenModal?: () => void;
}

const VintageMarketWidget: React.FC<Props> = ({ onOpenModal }) => {
  const stats = getVintageStats();
  const cards = getVintageCards();
  const trends = getVintageMarketTrends();

  const topCard = cards.reduce((a, b) => (a.currentValue > b.currentValue ? a : b));
  const appreciatingEras = trends.filter(t => t.trend === 'appreciating').length;

  const eraColors: Record<string, string> = {
    pre_war: 'text-amber-400',
    post_war: 'text-blue-400',
    golden_age: 'text-yellow-400',
    silver_age: 'text-slate-300',
    bronze_age: 'text-orange-400',
  };

  return (
    <div
      onClick={onOpenModal}
      className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 hover:border-amber-500/30 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20">
            <Clock size={16} className="text-amber-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Vintage Market Scanner</h3>
        </div>
        <ChevronRight size={14} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Vintage Value</p>
          <p className="text-lg font-bold text-amber-400">
            ${stats.totalVintageValue >= 1000000
              ? `${(stats.totalVintageValue / 1000000).toFixed(1)}M`
              : `${(stats.totalVintageValue / 1000).toFixed(0)}K`}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">5yr Appreciation</p>
          <p className="text-lg font-bold text-emerald-400">+{stats.portfolioAppreciation}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs border-t border-slate-700/30 pt-2 mb-2">
        <div className="flex items-center gap-2">
          <Crown size={10} className="text-amber-400" />
          <div>
            <p className="text-slate-300 font-medium">{topCard.year} {topCard.player}</p>
            <p className="text-[10px] text-slate-500">{topCard.set}</p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold ${eraColors[topCard.era] || 'text-slate-400'}`}>
          ${(topCard.currentValue / 1000000).toFixed(1)}M
        </span>
      </div>

      <div className="flex items-center justify-between text-xs border-t border-slate-700/30 pt-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Award size={10} />
          <span>Era Trends</span>
        </div>
        <span className="text-[10px] font-semibold text-emerald-400">
          {appreciatingEras}/{trends.length} Appreciating
        </span>
      </div>
    </div>
  );
};

export default VintageMarketWidget;
