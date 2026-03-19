import React, { useMemo } from 'react';
import { Fingerprint, ChevronRight, Search, Shield, Database } from 'lucide-react';
import { getDatabaseStats, getFingerprintDatabase } from '../lib/core/provenanceDnaService';

interface ProvenanceDnaWidgetProps {
  onClick?: () => void;
}

export const ProvenanceDnaWidget: React.FC<ProvenanceDnaWidgetProps> = ({ onClick }) => {
  const stats = useMemo(() => getDatabaseStats(), []);
  const database = useMemo(() => getFingerprintDatabase(), []);
  const latestScan = database.length > 0
    ? database.reduce((a, b) => (new Date(a.capturedAt) > new Date(b.capturedAt) ? a : b))
    : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-lime/10 rounded-xl text-brand-lime">
            <Fingerprint size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Provenance <span className="text-brand-lime">DNA</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Card Fingerprinting
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
            <Database size={12} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Scanned</span>
          </div>
          <p className="text-xl font-bebas tracking-wider text-white">{stats.totalScanned}</p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-3 text-center border border-slate-700/50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Search size={12} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Matches</span>
          </div>
          <p className="text-xl font-bebas tracking-wider text-white">{stats.matchesFound}</p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-3 text-center border border-slate-700/50">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Shield size={12} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Avg Score</span>
          </div>
          <p className="text-xl font-bebas tracking-wider text-white">{stats.avgProvenance}%</p>
        </div>
      </div>

      {/* Latest Scan */}
      {latestScan && (
        <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/40">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Latest Fingerprint</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{latestScan.cardName}</p>
              <p className="text-xs text-slate-400">
                {latestScan.year} {latestScan.set}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-brand-lime">
                {latestScan.uniquenessScore}% unique
              </p>
              <p className="text-[10px] text-slate-400">
                {latestScan.features.length} features
              </p>
            </div>
          </div>
        </div>
      )}
    </button>
  );
};

export default ProvenanceDnaWidget;
