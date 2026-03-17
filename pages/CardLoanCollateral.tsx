import React, { useState } from 'react';
import { Landmark } from 'lucide-react';
import CardLoanCollateralModal from '../components/CardLoanCollateralModal.tsx';

const CardLoanCollateral: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-green-500/20"><Landmark size={24} className="text-green-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card Loan Collateral Engine</h1>
          <p className="text-sm text-slate-400">Leverage your collection as loan collateral</p>
        </div>
      </div>
      <CardLoanCollateralModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Card Loan Collateral Engine</button>
      )}
    </div>
  );
};

export default CardLoanCollateral;
