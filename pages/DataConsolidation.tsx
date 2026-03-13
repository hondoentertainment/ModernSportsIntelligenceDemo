import React, { useState } from 'react';
import { Database } from 'lucide-react';
import DataConsolidationModal from '../components/DataConsolidationModal';

const DataConsolidation: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-lime/10 border border-brand-lime/20 rounded-full mb-2">
            <Database size={12} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Phase 88 — Consolidated Tape</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Market Data <span className="text-brand-lime">Hub</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">
            Consolidated Tape — Every Sale, Every Platform, One View
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-brand-lime/10 border border-brand-lime/30 text-brand-lime rounded-xl text-sm font-bold hover:bg-brand-lime/20 transition-colors"
        >
          <Database size={16} />
          Open Data Hub
        </button>
      </div>

      {/* Modal */}
      <DataConsolidationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default DataConsolidation;
