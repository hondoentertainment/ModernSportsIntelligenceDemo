import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { VaultSecurityModal } from '../components/VaultSecurityModal';

const VaultSecurity: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-lime/10 border border-brand-lime/20 rounded-full mb-2">
            <Lock size={12} className="text-brand-lime" />
            <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Vault Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Vault <span className="text-brand-lime">Security</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">
            Physical Collection Protection & Storage Intelligence
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-lime/10 border border-brand-lime/20 rounded-2xl text-brand-lime text-sm font-bold hover:bg-brand-lime/20 transition-colors"
        >
          <Lock size={18} />
          Open Vault Dashboard
        </button>
      </div>

      {/* Modal */}
      <VaultSecurityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default VaultSecurity;
