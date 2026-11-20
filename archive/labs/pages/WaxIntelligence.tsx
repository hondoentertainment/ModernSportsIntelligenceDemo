import React, { useState } from 'react';
import { Package } from 'lucide-react';
import WaxIntelligenceWidget from '../components/WaxIntelligenceWidget';
import WaxIntelligenceModal from '../components/WaxIntelligenceModal';

const WaxIntelligence: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-charcoal">
      {/* Header */}
      <div className="px-8 pt-10 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-bebas tracking-widest text-white leading-tight">
              Wax Market Intelligence
            </h1>
            <p className="text-sm text-brand-muted">
              The Commodity Desk for Sealed Products
            </p>
          </div>
        </div>
      </div>

      {/* Widget */}
      <div className="px-8 pb-10 max-w-2xl">
        <WaxIntelligenceWidget onClick={() => setModalOpen(true)} />
      </div>

      {/* Modal */}
      <WaxIntelligenceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default WaxIntelligence;
