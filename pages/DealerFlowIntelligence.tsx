// @ts-nocheck
import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import DealerFlowIntelligenceModal from '../components/DealerFlowIntelligenceModal.tsx';

const DealerFlowIntelligence: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20"><Briefcase size={24} className="text-amber-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dealer Flow Intelligence</h1>
          <p className="text-sm text-slate-400">Wholesale dealer inventory movement tracking and accumulation patterns</p>
        </div>
      </div>
      <DealerFlowIntelligenceModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Dealer Flow Intelligence</button>
      )}
    </div>
  );
};

export default DealerFlowIntelligence;
