// @ts-nocheck
import React, { useState } from 'react';
import { FileCheck } from 'lucide-react';
import ContractValuationModal from '../components/ContractValuationModal.tsx';

const ContractValuation: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-500/20"><FileCheck size={24} className="text-violet-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Player Contract Valuation</h1>
          <p className="text-sm text-slate-400">Analyze player contract impact on card values</p>
        </div>
      </div>
      <ContractValuationModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Player Contract Valuation</button>
      )}
    </div>
  );
};

export default ContractValuation;
