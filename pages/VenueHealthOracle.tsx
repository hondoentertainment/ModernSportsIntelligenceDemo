// @ts-nocheck
import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import VenueHealthOracleModal from '../components/VenueHealthOracleModal.tsx';

const VenueHealthOracle: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-teal-500/20"><Building2 size={24} className="text-teal-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Venue Health Oracle</h1>
          <p className="text-sm text-slate-400">Real-time reputation scoring for marketplaces and auction houses</p>
        </div>
      </div>
      <VenueHealthOracleModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Venue Health Oracle</button>
      )}
    </div>
  );
};

export default VenueHealthOracle;
