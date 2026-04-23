// @ts-nocheck
import React, { useState } from 'react';
import { Rocket } from 'lucide-react';
import PhenomePipelineModal from '../components/PhenomePipelineModal.tsx';

const PhenomePipeline: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-fuchsia-500/20"><Rocket size={24} className="text-fuchsia-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Phenome Pipeline</h1>
          <p className="text-sm text-slate-400">Track rising prospect phenoms before they break out</p>
        </div>
      </div>
      <PhenomePipelineModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Phenome Pipeline</button>
      )}
    </div>
  );
};

export default PhenomePipeline;
