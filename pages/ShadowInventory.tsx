// @ts-nocheck
import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import ShadowInventoryModal from '../components/ShadowInventoryModal.tsx';

const ShadowInventory: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-500/20">
          <MapPin size={24} className="text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card Show Shadow Inventory</h1>
          <p className="text-sm text-slate-400">Crowdsourced real-time inventory scouting at card shows near you</p>
        </div>
      </div>
      <ShadowInventoryModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Card Show Shadow Inventory
        </button>
      )}
    </div>
  );
};

export default ShadowInventory;
