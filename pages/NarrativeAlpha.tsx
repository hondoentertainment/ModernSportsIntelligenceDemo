// @ts-nocheck
import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import NarrativeAlphaModal from '../components/NarrativeAlphaModal';

const NarrativeAlpha: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-pink-500/20">
          <BookOpen size={24} className="text-pink-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Narrative Alpha Detector</h1>
          <p className="text-sm text-slate-400">
            AI-powered narrative detection for early-mover card trading advantage
          </p>
        </div>
      </div>
      <NarrativeAlphaModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Open Narrative Alpha Detector
        </button>
      )}
    </div>
  );
};

export default NarrativeAlpha;
