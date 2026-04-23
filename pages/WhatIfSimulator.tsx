// @ts-nocheck
import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import WhatIfSimulatorModal from '../components/WhatIfSimulatorModal.tsx';

const WhatIfSimulator: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/20">
          <FlaskConical size={24} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">What-If Simulator</h1>
          <p className="text-sm text-slate-400">Trade-scenario planning workspace for NAV and diversification impact</p>
        </div>
      </div>
      <WhatIfSimulatorModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open What-If Simulator
        </button>
      )}
    </div>
  );
};

export default WhatIfSimulator;
