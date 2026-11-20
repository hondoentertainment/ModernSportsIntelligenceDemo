import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import RefractorMapperModal from '../components/RefractorMapperModal.tsx';

const RefractorMapper: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-500/20">
          <Eye size={24} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Refractor Light Signature Mapper</h1>
          <p className="text-sm text-slate-400">Optical fingerprinting of chrome and prizm parallels via phone camera AI</p>
        </div>
      </div>
      <RefractorMapperModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Refractor Light Signature Mapper
        </button>
      )}
    </div>
  );
};

export default RefractorMapper;
