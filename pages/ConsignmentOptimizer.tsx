// @ts-nocheck
import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import ConsignmentOptimizerModal from '../components/ConsignmentOptimizerModal.tsx';

const ConsignmentOptimizer: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-teal-500/20"><Scale size={24} className="text-teal-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Consignment Fee Optimizer</h1>
          <p className="text-sm text-slate-400">Optimize consignment fees across platforms</p>
        </div>
      </div>
      <ConsignmentOptimizerModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Consignment Fee Optimizer</button>
      )}
    </div>
  );
};

export default ConsignmentOptimizer;
