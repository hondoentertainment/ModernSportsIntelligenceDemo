import React, { useMemo } from 'react';
import { RefreshCw, Link2, AlertTriangle, Ghost, ChevronRight } from 'lucide-react';
import { getSyncReport, getGhostListings } from '../lib/inventorySyncService';

interface InventorySyncWidgetProps {
  onClick?: () => void;
}

const InventorySyncWidget: React.FC<InventorySyncWidgetProps> = ({ onClick }) => {
  const report = useMemo(() => getSyncReport(), []);
  const ghostListings = useMemo(() => getGhostListings(), []);

  return (
    <div
      className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 cursor-pointer hover:border-brand-lime/30 transition-colors"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <RefreshCw size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Inventory <span className="text-brand-lime">Sync</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Multi-Platform &middot; {report.sync_health}
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
        {/* Platforms Connected */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Link2 size={14} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
              Platforms
            </span>
          </div>
          <p className="text-2xl font-bebas tracking-wider text-white">
            {report.platforms_connected}
          </p>
          <p className="text-[10px] text-brand-muted mt-1">
            {report.platforms_syncing > 0 ? `${report.platforms_syncing} syncing` : 'All synced'}
          </p>
        </div>

        {/* Synced Cards */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={14} className="text-cyan-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
              Synced Cards
            </span>
          </div>
          <p className="text-2xl font-bebas tracking-wider text-cyan-400">
            {report.total_synced}
          </p>
          <p className="text-[10px] text-brand-muted mt-1">
            ${(report.total_value / 1000).toFixed(1)}k total value
          </p>
        </div>

        {/* Conflicts */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
              Conflicts
            </span>
          </div>
          <p className="text-2xl font-bebas tracking-wider text-amber-400">
            {report.conflicts_pending}
          </p>
          <p className="text-[10px] text-brand-muted mt-1">
            Pending resolution
          </p>
        </div>

        {/* Ghost Listings */}
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Ghost size={14} className="text-red-400" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em]">
              Ghost Listings
            </span>
          </div>
          <p className="text-2xl font-bebas tracking-wider text-red-400">
            {ghostListings.length}
          </p>
          <p className="text-[10px] text-brand-muted mt-1">
            Detected alerts
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
        <span>Tap to manage sync, conflicts &amp; ghost detection</span>
      </div>
    </div>
  );
};

export default InventorySyncWidget;
