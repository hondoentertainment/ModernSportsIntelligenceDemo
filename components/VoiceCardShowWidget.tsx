import React, { useMemo } from 'react';
import { Mic, Radio, ScanLine, ChevronRight } from 'lucide-react';
import {
  getCompanionStats,
  getCardShows,
  getLiveScans,
  getCrowdHeatmap,
} from '../lib/voiceCardShowService';

interface VoiceCardShowWidgetProps {
  onClick?: () => void;
}

const densityColors: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-amber-400',
  high: 'text-orange-400',
  packed: 'text-red-400',
};

export const VoiceCardShowWidget: React.FC<VoiceCardShowWidgetProps> = ({ onClick }) => {
  const stats = useMemo(() => getCompanionStats(), []);
  const shows = useMemo(() => getCardShows(), []);
  const scans = useMemo(() => getLiveScans(), []);

  const activeShow = shows.find(s => s.status === 'live');
  const heatzones = useMemo(
    () => (activeShow ? getCrowdHeatmap(activeShow.id) : []),
    [activeShow]
  );
  const latestScan = scans[0];
  const avgDensity = heatzones.length > 0
    ? (['low', 'medium', 'high', 'packed'] as const)[
        Math.round(
          heatzones.reduce((s, z) => s + ['low', 'medium', 'high', 'packed'].indexOf(z.density), 0) /
            heatzones.length
        )
      ]
    : 'low';

  const recColors: Record<string, string> = {
    'strong-buy': 'text-green-400',
    buy: 'text-emerald-400',
    hold: 'text-amber-400',
    pass: 'text-red-400',
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-slate-900 border border-slate-700 rounded-2xl p-5 hover:border-orange-500/40 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/20">
            <Mic size={18} className="text-orange-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-100">Show Companion</h3>
        </div>
        <ChevronRight
          size={16}
          className="text-slate-500 group-hover:text-orange-400 transition-colors"
        />
      </div>

      {/* 3-col stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-800/60 rounded-xl p-3 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
            Shows
          </p>
          <p className="text-lg font-bold text-slate-100">{stats.showsAttended}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
            Scanned
          </p>
          <p className="text-lg font-bold text-slate-100">{stats.cardsScanned}</p>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-3 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
            Saved
          </p>
          <p className="text-lg font-bold text-orange-400">${stats.totalSaved.toLocaleString()}</p>
        </div>
      </div>

      {/* Active Show */}
      {activeShow && (
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Radio size={12} className="text-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-400">LIVE</span>
            <span className="text-xs text-slate-400 truncate">{activeShow.name}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{activeShow.vendorCount} vendors</span>
            <span className={densityColors[avgDensity]}>
              Crowd: {avgDensity}
            </span>
          </div>
        </div>
      )}

      {/* Latest Scan */}
      {latestScan && (
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <ScanLine size={12} className="text-orange-400" />
            <span className="text-xs font-semibold text-slate-300 truncate">
              {latestScan.cardIdentified}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              {latestScan.estimatedGrade} &middot; ${latestScan.marketValue.toLocaleString()}
            </span>
            <span className={`font-semibold uppercase ${recColors[latestScan.recommendation]}`}>
              {latestScan.recommendation.replace('-', ' ')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceCardShowWidget;
