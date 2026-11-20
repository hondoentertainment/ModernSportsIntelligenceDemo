import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import PriceWhispererModal from '../components/PriceWhispererModal.tsx';

const PriceWhisperer: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-500/20"><MessageSquare size={24} className="text-blue-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">AI Price Whisperer</h1>
          <p className="text-sm text-slate-400">AI-powered price prediction and insights</p>
        </div>
      </div>
      <PriceWhispererModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors">Open AI Price Whisperer</button>
      )}
    </div>
  );
};

export default PriceWhisperer;
