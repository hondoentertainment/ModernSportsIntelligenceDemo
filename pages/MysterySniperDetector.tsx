// @ts-nocheck
import React, { useState } from 'react';
import { Target } from 'lucide-react';
import MysterySniperDetectorModal from '../components/MysterySniperDetectorModal.tsx';

const MysterySniperDetector: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/20"><Target size={24} className="text-red-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Mystery Sniper Detector</h1>
          <p className="text-sm text-slate-400">Identify hidden buyers targeting specific cards</p>
        </div>
      </div>
      <MysterySniperDetectorModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Mystery Sniper Detector</button>
      )}
    </div>
  );
};

export default MysterySniperDetector;
