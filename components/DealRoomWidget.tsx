import React from 'react';
import { MessageSquare, ChevronRight, Lock, Bell, DollarSign } from 'lucide-react';
import { getDealRooms, getDealFlowStats, getIOIBoard } from '../lib/trading/dealRoomService';

interface DealRoomWidgetProps {
  onOpenModal: () => void;
}

const DealRoomWidget: React.FC<DealRoomWidgetProps> = ({ onOpenModal }) => {
  const stats = getDealFlowStats();
  const rooms = getDealRooms();
  const ioiBoard = getIOIBoard();
  const latestIOI = ioiBoard[0];

  const negotiatingRoom = rooms.find(r => r.status === 'negotiating' || r.status === 'pending_close');

  return (
    <div
      className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 hover:border-blue-500/30 transition-all cursor-pointer group"
      onClick={onOpenModal}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20">
            <MessageSquare size={16} className="text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Deal Room</h3>
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Lock size={8} />
            ENCRYPTED
          </span>
        </div>
        <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Active</p>
          <p className="text-lg font-bold text-slate-200">{stats.activeRooms}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Pending</p>
          <p className="text-lg font-bold text-amber-400">{stats.pendingOffers}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Volume</p>
          <p className="text-lg font-bold text-emerald-400">${(stats.totalVolume / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Active negotiation preview */}
      {negotiatingRoom && (
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-2.5 mb-2.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <DollarSign size={12} className="text-amber-400" />
              <span className="text-xs font-medium text-slate-300 truncate max-w-[180px]">{negotiatingRoom.card.player}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
              {negotiatingRoom.status === 'pending_close' ? 'CLOSING' : 'NEGOTIATING'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            Bid: ${negotiatingRoom.currentBid.toLocaleString()} / Ask: ${negotiatingRoom.askingPrice.toLocaleString()}
          </p>
        </div>
      )}

      {/* Latest IOI alert */}
      {latestIOI && (
        <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/10 rounded-lg p-2">
          <Bell size={12} className="text-blue-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-blue-300 font-medium mb-0.5">New IOI Alert</p>
            <p className="text-[10px] text-slate-400 truncate">
              {latestIOI.type === 'buy' ? 'BUY' : 'SELL'}: {latestIOI.category.split('/')[1]?.trim() || latestIOI.category} — ${(latestIOI.priceRange.min / 1000).toFixed(0)}K-${(latestIOI.priceRange.max / 1000).toFixed(0)}K
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealRoomWidget;
