// Phase 112: AI Deal Negotiation Agent — Full Page
// Route: /autonomous-acquisition | Icon: Bot
import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import AutonomousAcquisitionModal from '../components/AutonomousAcquisitionModal.tsx';

const AutonomousAcquisition: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-500/20">
          <Bot size={24} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            AI Deal Negotiation Agent &mdash; Autonomous Acquisition
          </h1>
          <p className="text-sm text-slate-400">
            AI agent that hunts, evaluates, negotiates, and acquires cards across platforms with full escrow protection
          </p>
        </div>
      </div>
      <AutonomousAcquisitionModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Open Acquisition Agent
        </button>
      )}
    </div>
  );
};

export default AutonomousAcquisition;
