import React, { useMemo } from 'react';
import { Gavel, ChevronRight, Clock, Eye, Trophy } from 'lucide-react';
import {
  getLiveAuctions,
  getWatchedLots,
  getAuctionAnalytics,
  getPlatformConfig,
  getStrategyConfig,
  formatCurrency,
} from '../lib/auctionWarRoomService';

interface AuctionWarRoomWidgetProps {
  onOpenModal?: () => void;
}

const AuctionWarRoomWidget: React.FC<AuctionWarRoomWidgetProps> = ({ onOpenModal }) => {
  const auctions = useMemo(() => getLiveAuctions(), []);
  const watchedLots = useMemo(() => getWatchedLots(), []);
  const analytics = useMemo(() => getAuctionAnalytics(), []);

  const liveAuctions = auctions.filter(a => a.status === 'live');
  const endingSoon = liveAuctions
    .filter(a => {
      const remaining = a.timeRemaining;
      return remaining.includes('m') && !remaining.includes('h') && !remaining.includes('d');
    })
    .sort((a, b) => a.timeRemaining.localeCompare(b.timeRemaining));

  const topWatched = watchedLots.find(w => w.status === 'live' && w.strategy !== 'watch_only') || watchedLots[0];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-lime-400" />
          <h3 className="text-base font-bold text-white">Auction War Room</h3>
        </div>
        <button
          onClick={onOpenModal}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          Details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-700 border-b border-slate-700">
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Active</p>
          <p className="text-lg font-bold text-emerald-400">{liveAuctions.length}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Ending Soon</p>
          <p className="text-lg font-bold text-amber-400">{endingSoon.length}</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-xs text-slate-400">Win Rate</p>
          <p className="text-lg font-bold text-lime-400">{analytics.winRate}%</p>
        </div>
      </div>

      {/* Top Watched Lot */}
      {topWatched && (
        <div className="p-4 border-b border-slate-700">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-lime-400" />
            Top Watched Lot
          </h4>
          <button
            onClick={onOpenModal}
            className="w-full flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-colors text-left group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white truncate">
                  {topWatched.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const pc = getPlatformConfig(topWatched.platform);
                  return (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${pc.bg} ${pc.text} ${pc.border}`}>
                      {pc.label}
                    </span>
                  );
                })()}
                {(() => {
                  const sc = getStrategyConfig(topWatched.strategy);
                  return (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${sc.bg} ${sc.text} ${sc.border}`}>
                      {sc.label}
                    </span>
                  );
                })()}
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {topWatched.timeRemaining}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-sm font-bold text-white">
                {formatCurrency(topWatched.currentBid)}
              </span>
              <span className="text-[10px] text-slate-500">current bid</span>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Ending Soon */}
      {endingSoon.length > 0 && (
        <div className="p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Ending Soon
          </h4>
          <div className="space-y-2">
            {endingSoon.slice(0, 3).map(auction => {
              const pc = getPlatformConfig(auction.platform);
              return (
                <div
                  key={auction.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border bg-amber-500/5 border-amber-500/20 text-xs"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${pc.bg} ${pc.text} ${pc.border}`}>
                      {pc.label}
                    </span>
                    <span className="text-white font-medium truncate">{auction.title}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-white font-bold">{formatCurrency(auction.currentBid)}</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {auction.timeRemaining}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Win Rate Badge */}
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-lime-400" />
            <span className="text-sm font-semibold text-white">Season Record</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400 font-bold">{analytics.totalWins}W</span>
            <span className="text-xs text-red-400 font-bold">{analytics.totalAuctionsParticipated - analytics.totalWins}L</span>
            <span className="px-2 py-0.5 text-xs font-bold text-lime-400 bg-lime-500/10 border border-lime-500/20 rounded-full">
              {analytics.winRate}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionWarRoomWidget;
