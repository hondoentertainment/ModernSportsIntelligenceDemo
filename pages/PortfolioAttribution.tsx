// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { PieChart } from 'lucide-react';
import { PortfolioAttributionModal } from '../components/PortfolioAttributionModal';

const PortfolioAttribution: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open modal by default on page load
  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-500/10 border border-lime-500/20 rounded-full mb-2">
            <PieChart size={12} className="text-lime-400" />
            <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest">Phase 89 — Attribution Engine</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Portfolio <span className="text-lime-400">Attribution</span>
          </h1>
          <p className="text-slate-400 max-w-2xl font-medium">
            Understand What's Driving Your Returns — Factor Analysis & Alpha Decomposition
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-lime-500/10 border border-lime-500/30 rounded-xl text-lime-400 font-bold text-sm hover:bg-lime-500/20 transition-all"
        >
          Open Attribution Terminal
        </button>
      </div>

      {/* Modal */}
      <PortfolioAttributionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default PortfolioAttribution;
