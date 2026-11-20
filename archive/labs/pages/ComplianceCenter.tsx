import React, { useState } from 'react';
import { FileCheck } from 'lucide-react';
import { ComplianceCenterModal } from '../components/ComplianceCenterModal';

const ComplianceCenter: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-2">
            <FileCheck size={12} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Compliance Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Compliance <span className="text-emerald-400">Center</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">
            IRS-Ready Reporting — Tax, AML, and Regulatory Compliance
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-colors"
        >
          <FileCheck size={18} />
          Open Compliance Dashboard
        </button>
      </div>

      {/* Modal */}
      <ComplianceCenterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ComplianceCenter;
