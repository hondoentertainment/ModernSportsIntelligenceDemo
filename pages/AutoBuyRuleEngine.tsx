import React, { useState } from 'react';
import { Cpu } from 'lucide-react';
import AutoBuyRuleEngineModal from '../components/AutoBuyRuleEngineModal.tsx';

const AutoBuyRuleEngine: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-green-500/20"><Cpu size={24} className="text-green-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Auto-Buy Rule Engine</h1>
          <p className="text-sm text-slate-400">Automated purchase rules based on conditions</p>
        </div>
      </div>
      <AutoBuyRuleEngineModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Auto-Buy Rule Engine</button>
      )}
    </div>
  );
};

export default AutoBuyRuleEngine;
