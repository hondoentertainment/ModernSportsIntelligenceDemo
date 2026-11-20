import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import SentimentSeismographModal from '../components/SentimentSeismographModal.tsx';

const SentimentSeismograph: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/20"><Activity size={24} className="text-red-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Hobby Sentiment Seismograph</h1>
          <p className="text-sm text-slate-400">Real-time hobby sentiment analysis</p>
        </div>
      </div>
      <SentimentSeismographModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Hobby Sentiment Seismograph</button>
      )}
    </div>
  );
};

export default SentimentSeismograph;
