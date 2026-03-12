import React from 'react';
import { Landmark, TrendingUp, TrendingDown, ChevronRight, Users, DollarSign } from 'lucide-react';
import { getVaultStats, getFractionalListings, getSharePositions } from '../lib/fractionalVaultService.ts';

interface Props {
  onOpenModal?: () => void;
}

const FractionalVaultWidget: React.FC<Props> = ({ onOpenModal }) => {
  const stats = getVaultStats();
  const positions = getSharePositions();
  const topListings = getFractionalListings({ sortBy: 'volume' }).slice(0, 3);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-amber-500/30 transition-all cursor-pointer" onClick={onOpenModal}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20">
            <Landmark size={16} className="text-amber-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Fractional Vault</h3>
        </div>
        <ChevronRight size={14} className="text-slate-500" />
      </div>

      {positions.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500">Vault Value</p>
              <p className="text-sm font-bold text-slate-200">${stats.totalVaultValue.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500">Unrealized P/L</p>
              <p className={`text-sm font-bold ${stats.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.totalPL >= 0 ? '+' : ''}${stats.totalPL.toFixed(0)} ({stats.totalPLPercent.toFixed(1)}%)
              </p>
            </div>
          </div>
          {positions.slice(0, 2).map(pos => (
            <div key={pos.id} className="flex items-center justify-between text-xs border-t border-slate-700/30 pt-2">
              <div>
                <p className="text-slate-300 font-medium">{pos.playerName}</p>
                <p className="text-[10px] text-slate-500">{pos.sharesOwned} shares @ ${pos.averageCost.toFixed(2)}</p>
              </div>
              <span className={`font-mono ${pos.unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {pos.unrealizedPL >= 0 ? '+' : ''}{pos.unrealizedPLPercent.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Landmark size={24} className="text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Own shares of grail cards</p>
          <p className="text-[10px] text-slate-600 mt-1">Starting from $1/share</p>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-slate-700/30">
        <p className="text-[10px] text-slate-500 mb-1">Trending on Vault</p>
        {topListings.slice(0, 1).map(l => (
          <div key={l.id} className="flex items-center justify-between text-xs">
            <span className="text-slate-400 truncate">{l.playerName}</span>
            <span className={`font-mono ${l.dailyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {l.dailyChange >= 0 ? '+' : ''}{l.dailyChange.toFixed(1)}% · {l.volumeToday} vol
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FractionalVaultWidget;
