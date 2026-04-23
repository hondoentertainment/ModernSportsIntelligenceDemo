// @ts-nocheck
import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import DopamineCycleTrackerModal from '../components/DopamineCycleTrackerModal.tsx';

const DopamineCycleTracker: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-purple-500/20">
          <Brain size={24} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dopamine Cycle Tracker</h1>
          <p className="text-sm text-slate-400">Detect and manage dopamine-driven overconsumption cycles in buying behavior</p>
        </div>
      </div>
      <DopamineCycleTrackerModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Dopamine Cycle Tracker
        </button>
      )}
    </div>
  );
};

export default DopamineCycleTracker;
