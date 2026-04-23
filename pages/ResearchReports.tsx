// @ts-nocheck
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { ResearchReportsModal } from '../components/ResearchReportsModal';

const ResearchReports: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-lime-500/10 rounded-xl">
              <FileText size={26} className="text-lime-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">MSI Research</h1>
              <p className="text-sm text-slate-400">
                AI-Powered Institutional Research — Bloomberg Intelligence for Cards
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content area with prompt to open modal */}
      {!modalOpen && (
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
              <FileText size={48} className="text-lime-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Research Library</h2>
            <p className="text-sm text-slate-400 max-w-md">
              Access AI-generated market reports, player research notes, sector deep dives, and
              contrarian picks — institutional-quality research for the sports card market.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 bg-lime-500 hover:bg-lime-400 text-slate-900 font-semibold text-sm rounded-xl transition-colors"
            >
              Open Research Library
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <ResearchReportsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default ResearchReports;
