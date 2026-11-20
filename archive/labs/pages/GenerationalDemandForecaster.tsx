import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import GenerationalDemandForecasterModal from '../components/GenerationalDemandForecasterModal.tsx';

const GenerationalDemandForecaster: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-rose-500/20"><Clock size={24} className="text-rose-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Generational Demand Forecaster</h1>
          <p className="text-sm text-slate-400">10-25 year demographic-driven demand projection modeling</p>
        </div>
      </div>
      <GenerationalDemandForecasterModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Generational Demand Forecaster</button>
      )}
    </div>
  );
};

export default GenerationalDemandForecaster;
