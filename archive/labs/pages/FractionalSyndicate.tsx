import React, { useState } from 'react';
import { Users } from 'lucide-react';
import FractionalSyndicateModal from '../components/FractionalSyndicateModal';

const FractionalSyndicate: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/20">
          <Users size={24} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Fractional Syndicate Engine</h1>
          <p className="text-sm text-slate-400">Pooled capital investment vehicles with democratic governance</p>
        </div>
      </div>
      <FractionalSyndicateModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Fractional Syndicate Engine
        </button>
      )}
    </div>
  );
};

export default FractionalSyndicate;
