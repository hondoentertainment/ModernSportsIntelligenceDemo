// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Tv, ChevronRight, Users, Flame, Timer, Gavel, Bell } from 'lucide-react';
import { getLiveBreakRooms, getLiveAuctions } from '../lib/social/liveBreakRoomService.ts';
import { WidgetErrorBoundary } from './ui/WidgetErrorBoundary';

interface Props {
  onOpenModal?: () => void;
}

const LiveBreakRoomWidget: React.FC<Props> = ({ onOpenModal }) => {
  const [pulse, setPulse] = useState(false);
  const breaks = getLiveBreakRooms();
  const auctions = getLiveAuctions();
  const liveBreaks = breaks.filter(b => b.status === 'live');
  const endingSoonAuctions = auctions.filter(a => a.status === 'ending_soon');

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <WidgetErrorBoundary title="Live Break Room">
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 bg-rose-500/10 rounded-xl text-rose-400 ${liveBreaks.length > 0 && pulse ? 'animate-pulse' : ''}`}>
            <Tv size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Live <span className="text-rose-400">Breaks</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Break rooms & auction intelligence
            </p>
          </div>
        </div>
        {liveBreaks.length > 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 animate-pulse">
            <Bell size={12} />
            {liveBreaks.length} LIVE
          </div>
        ) : (
          <ChevronRight
            size={20}
            className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
          />
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs">
          <Tv size={12} className="text-rose-400" />
          <span className="text-slate-400 font-medium">Live:</span>
          <span className={`font-bebas text-lg tracking-wider ${liveBreaks.length > 0 ? 'text-rose-400' : 'text-white'}`}>
            {liveBreaks.length}
          </span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <Gavel size={12} className="text-amber-400" />
          <span className="text-slate-400 font-medium">Ending Soon:</span>
          <span className={`font-bebas text-lg tracking-wider ${endingSoonAuctions.length > 0 ? 'text-amber-400' : 'text-white'}`}>
            {endingSoonAuctions.length}
          </span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <Timer size={12} className="text-slate-400" />
          <span className="text-slate-400 font-medium">Upcoming:</span>
          <span className="font-bebas text-lg text-white tracking-wider">
            {breaks.filter(b => b.status === 'upcoming').length}
          </span>
        </div>
      </div>

      {/* Top Live Break */}
      {liveBreaks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Now Breaking</p>
          <div className="space-y-1.5">
            {liveBreaks.slice(0, 2).map(brk => (
              <div
                key={brk.id}
                className="flex items-center gap-3 p-3 bg-rose-500/5 border border-rose-500/15 rounded-xl text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{brk.title}</p>
                  <p className="text-[10px] text-slate-500">
                    {brk.sport} &bull; {brk.filledSpots}/{brk.totalSpots} spots
                  </p>
                </div>
                <div className="flex items-center gap-2 text-slate-400 flex-shrink-0">
                  <span className="flex items-center gap-0.5"><Users size={10} /> {brk.viewers}</span>
                  <span className="flex items-center gap-0.5"><Flame size={10} className="text-orange-400" /> {brk.hits.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Ending Auction */}
      {endingSoonAuctions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Ending Soon</p>
          <div className="space-y-1.5">
            {endingSoonAuctions.slice(0, 2).map(auction => (
              <div
                key={auction.id}
                className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs"
              >
                <Gavel size={12} className="text-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{auction.playerName}</p>
                  <p className="text-[10px] text-slate-500">{auction.platform} &bull; {auction.timeRemaining}</p>
                </div>
                <span className="font-mono text-white font-bold">${auction.currentBid.toLocaleString()}</span>
                <span className={`text-[10px] font-bold ${auction.dealScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {auction.dealScore}/100
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {liveBreaks.length === 0 && endingSoonAuctions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Tv size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No live breaks or auctions</p>
          <p className="text-xs text-slate-600 mt-1 group-hover:text-slate-500 transition-colors">
            Click to browse upcoming breaks and auctions
          </p>
        </div>
      )}

      {/* Footer hint */}
      {(liveBreaks.length > 0 || endingSoonAuctions.length > 0) && (
        <p className="text-[10px] text-slate-600 text-center group-hover:text-slate-500 transition-colors uppercase tracking-widest font-bold">
          Click to manage breaks & auctions
        </p>
      )}
    </button>
    </WidgetErrorBoundary>
  );
};

export default LiveBreakRoomWidget;
