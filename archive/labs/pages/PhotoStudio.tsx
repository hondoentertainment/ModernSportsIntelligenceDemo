import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import PhotoStudioModal from '../components/PhotoStudioModal.tsx';

const PhotoStudio: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-sky-500/20"><Camera size={24} className="text-sky-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card Photography Studio</h1>
          <p className="text-sm text-slate-400">Professional card photography tools</p>
        </div>
      </div>
      <PhotoStudioModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Card Photography Studio</button>
      )}
    </div>
  );
};

export default PhotoStudio;
