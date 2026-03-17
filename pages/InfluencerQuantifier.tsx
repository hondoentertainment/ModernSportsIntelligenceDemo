import React, { useState } from 'react';
import { Megaphone } from 'lucide-react';
import InfluencerQuantifierModal from '../components/InfluencerQuantifierModal.tsx';

const InfluencerQuantifier: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-pink-500/20"><Megaphone size={24} className="text-pink-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Influencer Impact Quantifier</h1>
          <p className="text-sm text-slate-400">Quantify influencer impact on card markets</p>
        </div>
      </div>
      <InfluencerQuantifierModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Influencer Impact Quantifier</button>
      )}
    </div>
  );
};

export default InfluencerQuantifier;
