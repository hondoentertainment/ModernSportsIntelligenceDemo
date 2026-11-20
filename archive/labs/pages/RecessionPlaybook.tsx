import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import RecessionPlaybookModal from '../components/RecessionPlaybookModal.tsx';

const RecessionPlaybook: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-500/20"><BookOpen size={24} className="text-slate-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Hobby Recession Playbook</h1>
          <p className="text-sm text-slate-400">Strategic playbook for hobby market downturns</p>
        </div>
      </div>
      <RecessionPlaybookModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Hobby Recession Playbook</button>
      )}
    </div>
  );
};

export default RecessionPlaybook;
