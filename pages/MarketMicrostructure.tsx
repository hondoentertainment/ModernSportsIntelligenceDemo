// @ts-nocheck
import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import MarketMicrostructureModal from '../components/MarketMicrostructureModal';
import { MarketMicrostructureWidget } from '../components/MarketMicrostructureWidget';

const MarketMicrostructure: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <BarChart3 size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
              Market <span className="text-cyan-400">Microstructure</span>
            </h1>
            <p className="text-brand-muted max-w-2xl font-medium">
              Level 2 order flow analytics and market depth visualization.
            </p>
          </div>
        </div>
      </div>

      {/* Widget */}
      <div className="max-w-md">
        <MarketMicrostructureWidget onClick={() => setModalOpen(true)} />
      </div>

      {/* Modal */}
      <MarketMicrostructureModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default MarketMicrostructure;
