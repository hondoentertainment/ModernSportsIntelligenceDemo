import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import GradingBatchPlannerModal from '../components/GradingBatchPlannerModal.tsx';

const GradingBatchPlanner: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20">
          <ClipboardList size={24} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Grading Batch Planner</h1>
          <p className="text-sm text-slate-400">Optimize grading submissions for maximum ROI across companies</p>
        </div>
      </div>
      <GradingBatchPlannerModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Grading Planner
        </button>
      )}
    </div>
  );
};

export default GradingBatchPlanner;
