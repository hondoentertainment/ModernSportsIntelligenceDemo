// @ts-nocheck
import React from 'react';
import { Landmark, TrendingUp, TrendingDown, ChevronRight, Users, DollarSign } from 'lucide-react';
import { getVaultStats, getFractionalListings, getSharePositions } from '../lib/utils/fractionalVaultService.ts';

interface Props {
  onOpenModal?: () => void;
}

const FractionalVaultWidget: React.FC<Props> = ({ onOpenModal }) => {
  const stats = getVaultStats();
  const positions = getSharePositions();
  const topListings = getFractionalListings({ sortBy: 'volume' }).slice(0, 3);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
            <Landmark size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Fractional <span className="text-amber-400">Vault</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Own shares of grail cards
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {positions.length > 0 ? (
        <>
          {/* Stats Bar */}
          <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs">
              <DollarSign size={12} className="text-amber-400" />
              <span className="text-slate-400 font-medium">Vault:</span>
              <span className="font-bebas text-lg text-white tracking-wider">${stats.totalVaultValue.toLocaleString()}</span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs">
              <Users size={12} className="text-amber-400" />
              <span className="text-slate-400 font-medium">Positions:</span>
              <span className="font-bebas text-lg text-white tracking-wider">{positions.length}</span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs">
              {stats.totalPL >= 0 ? (
                <TrendingUp size={12} className="text-emerald-400" />
              ) : (
                <TrendingDown size={12} className="text-red-400" />
              )}
              <span className="text-slate-400 font-medium">P/L:</span>
              <span className={`font-mono ${stats.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {stats.totalPL >= 0 ? '+' : ''}${stats.totalPL.toFixed(0)} ({stats.totalPLPercent.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Top Positions */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Top Positions</p>
            <div className="space-y-1.5">
              {positions.slice(0, 3).map(pos => (
                <div
                  key={pos.id}
                  className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs"
                >
                  <span className="text-white font-medium truncate flex-1">
                    {pos.playerName}
                  </span>
                  <span className="font-mono text-slate-400">
                    {pos.sharesOwned} shares @ ${pos.averageCost.toFixed(2)}
                  </span>
                  <span className={`font-mono text-xs w-16 text-right ${
                    pos.unrealizedPL >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {pos.unrealizedPL >= 0 ? '+' : ''}{pos.unrealizedPLPercent.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trending */}
          {topListings.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Trending on Vault</p>
              <div className="space-y-1.5">
                {topListings.slice(0, 2).map(l => (
                  <div key={l.id} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs">
                    <span className="text-slate-300 truncate flex-1">{l.playerName}</span>
                    <span className={`font-mono ${l.dailyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {l.dailyChange >= 0 ? '+' : ''}{l.dailyChange.toFixed(1)}%
                    </span>
                    <span className="text-slate-500 font-mono">{l.volumeToday} vol</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer hint */}
          <p className="text-[10px] text-slate-600 text-center group-hover:text-slate-500 transition-colors uppercase tracking-widest font-bold">
            Click to manage vault positions
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Landmark size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">Own shares of grail cards</p>
          <p className="text-xs text-slate-600 mt-1 group-hover:text-slate-500 transition-colors">
            Click to browse the fractional marketplace
          </p>
        </div>
      )}
    </button>
  );
};

export default FractionalVaultWidget;
