import React, { useState } from 'react';
import { {{ICON_NAME}} } from 'lucide-react';
import {{PASCAL_NAME}}Modal from '../components/{{PASCAL_NAME}}Modal.tsx';

const {{PASCAL_NAME}}: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-500/20">
          <{{ICON_NAME}} size={24} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{{DISPLAY_NAME}}</h1>
          <p className="text-sm text-slate-400">{{DESCRIPTION}}</p>
        </div>
      </div>
      <{{PASCAL_NAME}}Modal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Open {{DISPLAY_NAME}}
        </button>
      )}
    </div>
  );
};

export default {{PASCAL_NAME}};
