import React from 'react';
import { Link2, ChevronRight, Shield, CheckCircle, Clock } from 'lucide-react';
import { getDigitalTwins, getProvenanceStats } from '../lib/provenanceChainService.ts';

interface Props {
  onOpenModal?: () => void;
}

const ProvenanceChainWidget: React.FC<Props> = ({ onOpenModal }) => {
  const twins = getDigitalTwins();
  const stats = getProvenanceStats();

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/30 transition-all cursor-pointer" onClick={onOpenModal}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20">
            <Link2 size={16} className="text-cyan-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Provenance Chain</h3>
        </div>
        <ChevronRight size={14} className="text-slate-500" />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Digital Twins</p>
          <p className="text-lg font-bold text-cyan-400">{stats.totalTwins}</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Verified</p>
          <p className="text-lg font-bold text-emerald-400">{stats.totalVerified}</p>
        </div>
      </div>

      {twins.slice(0, 2).map(twin => (
        <div key={twin.id} className="flex items-center justify-between text-xs border-t border-slate-700/30 pt-2 mt-2">
          <div className="flex items-center gap-2">
            <CheckCircle size={10} className="text-emerald-400" />
            <div>
              <p className="text-slate-300 font-medium">{twin.playerName}</p>
              <p className="text-[10px] text-slate-500">{twin.provenanceChain.length} chain events</p>
            </div>
          </div>
          <span className="text-[10px] text-cyan-400">{twin.authenticityScore}%</span>
        </div>
      ))}
    </div>
  );
};

export default ProvenanceChainWidget;
