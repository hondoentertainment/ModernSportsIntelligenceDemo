// @ts-nocheck
import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import VoiceCardShowModal from '../components/VoiceCardShowModal';

const VoiceCardShow: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-500/20">
          <Mic size={24} className="text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Voice Card Show Companion</h1>
          <p className="text-sm text-slate-400">
            Hands-free AI assistant for live card show negotiations
          </p>
        </div>
      </div>
      <VoiceCardShowModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Open Show Companion
        </button>
      )}
    </div>
  );
};

export default VoiceCardShow;
