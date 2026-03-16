import React, { useMemo } from 'react';
import { View, ChevronRight, LayoutGrid, Layers, Eye } from 'lucide-react';
import {
  getVaultRooms,
  getVaultStats,
  getFeaturedRoom,
  calculateRoomValue,
  VAULT_THEME_META,
} from '../lib/arVaultWalkthroughService';

interface ArVaultWalkthroughWidgetProps {
  onClick?: () => void;
}

export const ArVaultWalkthroughWidget: React.FC<ArVaultWalkthroughWidgetProps> = ({ onClick }) => {
  const stats = useMemo(() => getVaultStats(), []);
  const featured = useMemo(() => getFeaturedRoom(), []);
  const featuredValue = useMemo(() => calculateRoomValue(featured.id), [featured.id]);
  const themeMeta = VAULT_THEME_META[featured.theme];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 hover:border-purple-500/40 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400">
            <View size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AR Vault</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              3D Showcase Rooms
            </p>
          </div>
        </div>
        <ChevronRight
          size={18}
          className="text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-center">
          <LayoutGrid size={14} className="text-purple-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white leading-tight">{stats.totalRooms}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">Rooms</p>
        </div>
        <div className="p-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-center">
          <Layers size={14} className="text-purple-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white leading-tight">{stats.totalCardsDisplayed}</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">Cards</p>
        </div>
        <div className="p-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-center">
          <Eye size={14} className="text-purple-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white leading-tight">
            {stats.totalViews >= 1000
              ? `${(stats.totalViews / 1000).toFixed(1)}k`
              : stats.totalViews}
          </p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">Views</p>
        </div>
      </div>

      {/* Featured Room Preview */}
      <div className={`p-3.5 rounded-xl bg-gradient-to-r ${featured.thumbnailGradient} border border-slate-700/50`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
            Featured Room
          </span>
          <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-[10px] font-bold text-purple-300">
            {themeMeta.label}
          </span>
        </div>
        <p className="text-sm font-bold text-white">{featured.name}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-slate-400">
            {featured.occupiedSlots}/{featured.cardSlots} cards
          </span>
          <span className="text-xs text-emerald-400 font-semibold">
            ${featuredValue >= 1000000
              ? `${(featuredValue / 1000000).toFixed(1)}M`
              : `${(featuredValue / 1000).toFixed(0)}k`}
          </span>
          <span className="text-xs text-slate-500">
            {featured.viewCount.toLocaleString()} views
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
        <View size={14} className="text-purple-400" />
        <span className="text-xs font-bold text-purple-400">Enter Vault</span>
      </div>
    </button>
  );
};

export default ArVaultWalkthroughWidget;
