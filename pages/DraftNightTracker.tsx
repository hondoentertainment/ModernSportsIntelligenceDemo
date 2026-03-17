import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import DraftNightTrackerModal from '../components/DraftNightTrackerModal.tsx';

const DraftNightTracker: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-yellow-500/20"><Zap size={24} className="text-yellow-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Draft Night Live Tracker</h1>
          <p className="text-sm text-slate-400">Live draft night card value tracking</p>
        </div>
      </div>
      <DraftNightTrackerModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Draft Night Live Tracker</button>
      )}
    </div>
  );
};

export default DraftNightTracker;
