import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ManipulationDetectorModal from '../components/ManipulationDetectorModal.tsx';

const ManipulationDetector: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/20"><AlertTriangle size={24} className="text-red-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Market Manipulation Detector</h1>
          <p className="text-sm text-slate-400">Detect market manipulation patterns</p>
        </div>
      </div>
      <ManipulationDetectorModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Market Manipulation Detector</button>
      )}
    </div>
  );
};

export default ManipulationDetector;
