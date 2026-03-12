import React, { useState } from 'react';
import { Landmark } from 'lucide-react';
import FractionalVaultModal from '../components/FractionalVaultModal.tsx';

const FractionalVault: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20">
          <Landmark size={24} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Fractional Vault & Copy-Trading</h1>
          <p className="text-sm text-slate-400">Own shares of grail cards and copy top collectors' moves — no competitor offers this</p>
        </div>
      </div>
      <FractionalVaultModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition-colors">
          Open Fractional Vault
        </button>
      )}
    </div>
  );
};

export default FractionalVault;
