import React, { useState, useEffect } from 'react';
import { Tv, ChevronRight, Users, Flame, Timer, Gavel } from 'lucide-react';
import { getLiveBreakRooms, getLiveAuctions } from '../lib/liveBreakRoomService.ts';

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
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-rose-500/30 transition-all cursor-pointer" onClick={onOpenModal}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-rose-500/20 ${liveBreaks.length > 0 && pulse ? 'animate-pulse' : ''}`}>
            <Tv size={16} className="text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Live Breaks & Auctions</h3>
          {liveBreaks.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/30 text-rose-300 rounded-full">
              LIVE
            </span>
          )}
        </div>
        <ChevronRight size={14} className="text-slate-500" />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Live Breaks</p>
          <p className="text-lg font-bold text-rose-400">{liveBreaks.length}</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Ending Soon</p>
          <p className="text-lg font-bold text-amber-400">{endingSoonAuctions.length}</p>
        </div>
      </div>

      {liveBreaks.length > 0 && (
        <div className="space-y-2">
          {liveBreaks.slice(0, 1).map(brk => (
            <div key={brk.id} className="bg-slate-900/50 rounded-lg p-2">
              <p className="text-xs font-medium text-slate-300 truncate">{brk.title}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                <span className="flex items-center gap-0.5"><Users size={8} /> {brk.viewers}</span>
                <span className="flex items-center gap-0.5"><Flame size={8} /> {brk.hits.length} hits</span>
                <span>{brk.filledSpots}/{brk.totalSpots} spots</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {endingSoonAuctions.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-700/30">
          {endingSoonAuctions.slice(0, 1).map(auction => (
            <div key={auction.id} className="flex items-center justify-between text-xs">
              <div>
                <p className="text-slate-300 font-medium truncate">{auction.playerName}</p>
                <p className="text-[10px] text-slate-500">{auction.platform} · {auction.timeRemaining}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-200">${auction.currentBid.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-400">Deal: {auction.dealScore}/100</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveBreakRoomWidget;
