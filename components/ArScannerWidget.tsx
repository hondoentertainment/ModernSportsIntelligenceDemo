import React, { useMemo } from 'react';
import { ScanLine, ChevronRight, History, Box } from 'lucide-react';
import { getScanHistory, getDisplayCases } from '../lib/utils/arScannerService';

interface ArScannerWidgetProps {
  onClick?: () => void;
}

export const ArScannerWidget: React.FC<ArScannerWidgetProps> = ({ onClick }) => {
  const history = useMemo(() => getScanHistory(), []);
  const cases = useMemo(() => getDisplayCases(), []);
  const lastScan = history.recentScans[0];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <ScanLine size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              AR Card <span className="text-brand-lime">Scanner</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Instant Card Identification
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-2xl p-3 text-center border border-slate-700/50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <ScanLine size={12} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Scans</span>
          </div>
          <p className="text-xl font-bebas tracking-wider text-white">{history.totalScans}</p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-3 text-center border border-slate-700/50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <History size={12} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Unique</span>
          </div>
          <p className="text-xl font-bebas tracking-wider text-white">{history.uniqueCards}</p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-3 text-center border border-slate-700/50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Box size={12} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Cases</span>
          </div>
          <p className="text-xl font-bebas tracking-wider text-white">{cases.length}</p>
        </div>
      </div>

      {/* Last Scanned Card */}
      {lastScan && (
        <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/40">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Last Scanned</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{lastScan.player}</p>
              <p className="text-xs text-slate-400">
                {lastScan.year} {lastScan.set}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-brand-lime">
                ${lastScan.estimatedValue.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400">
                {Math.round(lastScan.confidence * 100)}% match
              </p>
            </div>
          </div>
        </div>
      )}
    </button>
  );
};

export default ArScannerWidget;
