// @ts-nocheck
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import EmotionJournalModal from '../components/EmotionJournalModal.tsx';

const EmotionJournal: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-rose-500/20">
          <Heart size={24} className="text-rose-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Micro-Emotion Trade Journal</h1>
          <p className="text-sm text-slate-400">Emotion-tagged trade P&L revealing which feelings cost or make you money</p>
        </div>
      </div>
      <EmotionJournalModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Micro-Emotion Trade Journal
        </button>
      )}
    </div>
  );
};

export default EmotionJournal;
