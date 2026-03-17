import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import RegulatoryComplianceRadarModal from '../components/RegulatoryComplianceRadarModal.tsx';

const RegulatoryComplianceRadar: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/20"><Shield size={24} className="text-red-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Regulatory Compliance Radar</h1>
          <p className="text-sm text-slate-400">Track legislation, tax nexus, AML rules, and compliance scoring</p>
        </div>
      </div>
      <RegulatoryComplianceRadarModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Regulatory Compliance Radar</button>
      )}
    </div>
  );
};

export default RegulatoryComplianceRadar;
