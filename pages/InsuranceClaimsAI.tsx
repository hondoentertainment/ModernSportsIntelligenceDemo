// @ts-nocheck
import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import InsuranceClaimsAIModal from '../components/InsuranceClaimsAIModal.tsx';

const InsuranceClaimsAI: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-500/20"><Shield size={24} className="text-blue-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card Insurance Claims AI</h1>
          <p className="text-sm text-slate-400">AI-assisted insurance claims processing</p>
        </div>
      </div>
      <InsuranceClaimsAIModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Card Insurance Claims AI</button>
      )}
    </div>
  );
};

export default InsuranceClaimsAI;
