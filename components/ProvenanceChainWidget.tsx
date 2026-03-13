import React from 'react';
import { Link2, ChevronRight, Shield, CheckCircle, Clock, Fingerprint } from 'lucide-react';
import { getDigitalTwins, getProvenanceStats } from '../lib/provenanceChainService.ts';

interface Props {
  onOpenModal?: () => void;
}

const ProvenanceChainWidget: React.FC<Props> = ({ onOpenModal }) => {
  const twins = getDigitalTwins();
  const stats = getProvenanceStats();

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Link2 size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Provenance <span className="text-cyan-400">Chain</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Blockchain-backed ownership history
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs">
          <Fingerprint size={12} className="text-cyan-400" />
          <span className="text-slate-400 font-medium">Twins:</span>
          <span className="font-bebas text-lg text-cyan-400 tracking-wider">{stats.totalTwins}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <CheckCircle size={12} className="text-emerald-400" />
          <span className="text-slate-400 font-medium">Verified:</span>
          <span className="font-bebas text-lg text-emerald-400 tracking-wider">{stats.totalVerified}</span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs">
          <Shield size={12} className="text-amber-400" />
          <span className="text-slate-400 font-medium">Auth Score:</span>
          <span className="font-mono text-amber-400">{stats.averageAuthenticityScore.toFixed(1)}%</span>
        </div>
      </div>

      {/* Recent Twins */}
      {twins.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Recent Digital Twins</p>
          <div className="space-y-1.5">
            {twins.slice(0, 3).map(twin => (
              <div
                key={twin.id}
                className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs"
              >
                <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{twin.playerName}</p>
                  <p className="text-[10px] text-slate-500">{twin.provenanceChain.length} chain events</p>
                </div>
                <span className={`font-mono text-xs w-14 text-right ${
                  twin.authenticityScore >= 95 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {twin.authenticityScore}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Link2 size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">No digital twins created</p>
          <p className="text-xs text-slate-600 mt-1 group-hover:text-slate-500 transition-colors">
            Click to create blockchain-backed provenance records
          </p>
        </div>
      )}

      {/* Footer hint */}
      {twins.length > 0 && (
        <p className="text-[10px] text-slate-600 text-center group-hover:text-slate-500 transition-colors uppercase tracking-widest font-bold">
          Click to manage provenance chain
        </p>
      )}
    </button>
  );
};

export default ProvenanceChainWidget;
