// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Fingerprint,
  ChevronRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { getCardPassports, getRecentVerifications, getNetworkStats } from '../lib/core/blockchainProvenanceService';

interface BlockchainProvenanceWidgetProps {
  onOpenModal?: () => void;
}

export const BlockchainProvenanceWidget: React.FC<BlockchainProvenanceWidgetProps> = ({ onOpenModal }) => {
  const passports = useMemo(() => getCardPassports(), []);
  const verifications = useMemo(() => getRecentVerifications(), []);
  const networkStats = useMemo(() => getNetworkStats(), []);

  const verifiedCount = useMemo(() => verifications.filter(v => v.verified).length, [verifications]);

  const avgScore = useMemo(() => {
    if (verifications.length === 0) return 0;
    return (verifications.reduce((sum, v) => sum + v.authenticityScore, 0) / verifications.length).toFixed(1);
  }, [verifications]);

  const latestVerification = useMemo(() => {
    if (verifications.length === 0) return null;
    return verifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }, [verifications]);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate rounded-[2.5rem] p-8 hover:border-violet-500/30 hover:bg-slate-800/60 transition-all duration-300 group border border-slate-700/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-500/10 rounded-lg">
            <Fingerprint size={16} className="text-violet-400" />
          </div>
          <span className="text-xs font-bebas text-slate-400 uppercase tracking-wider">Blockchain Provenance</span>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
      </div>

      {/* 4-stat grid */}
      <div className="grid grid-cols-4 divide-x divide-slate-700 mb-5">
        <div className="pr-3">
          <p className="text-xs text-slate-400">Passports</p>
          <p className="text-lg font-bold text-violet-400">{passports.length}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Verified</p>
          <p className="text-lg font-bold text-emerald-400">{verifiedCount}</p>
        </div>
        <div className="px-3">
          <p className="text-xs text-slate-400">Avg Score</p>
          <p className="text-lg font-bold text-white">{avgScore}%</p>
        </div>
        <div className="pl-3">
          <p className="text-xs text-slate-400">Networks</p>
          <p className="text-lg font-bold text-cyan-400">{networkStats.length}</p>
        </div>
      </div>

      {/* Latest verification highlight */}
      {latestVerification && (
        <div className="flex items-center gap-3 p-3 bg-violet-500/5 border border-violet-500/20 rounded-xl mb-4">
          <ShieldCheck size={14} className="text-violet-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Latest Verification</p>
            <p className="text-xs text-white font-medium truncate">{latestVerification.cardName}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-violet-400">{latestVerification.authenticityScore}%</p>
            <p className="text-[10px] text-slate-500">{latestVerification.verified ? 'Verified' : 'Pending'}</p>
          </div>
        </div>
      )}

      {/* Bottom footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Fingerprint size={12} className="text-brand-lime" />
          <span className="text-xs text-slate-400">Total Scans: <span className="text-white font-bold">{verifications.length}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-violet-400" />
          <span className="text-xs text-slate-400">
            Chains: <span className="text-violet-400 font-bold">{networkStats.length}</span>
          </span>
        </div>
      </div>
    </button>
  );
};

export default BlockchainProvenanceWidget;
