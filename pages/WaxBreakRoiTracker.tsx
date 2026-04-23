// @ts-nocheck
import React, { useState } from 'react';
import { Package } from 'lucide-react';
import WaxBreakRoiTrackerModal from '../components/WaxBreakRoiTrackerModal.tsx';

const WaxBreakRoiTracker: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-500/20">
          <Package size={24} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Wax Break ROI Tracker</h1>
          <p className="text-sm text-slate-400">Track ROI from sealed wax breaks with hit logging and EV analysis</p>
        </div>
      </div>
      <WaxBreakRoiTrackerModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Break Tracker
        </button>
      )}
    </div>
  );
};

export default WaxBreakRoiTracker;
