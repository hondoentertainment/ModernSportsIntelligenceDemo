// @ts-nocheck
import React, { useState } from 'react';
import { Award } from 'lucide-react';
import { HOFTrackerModal } from '../components/HOFTrackerModal';

const HOFTracker: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-2">
            <Award size={12} className="text-amber-400" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Phase 100</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Hall of Fame <span className="text-amber-400">Tracker</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">
            The #1 Long-Term Card Value Catalyst &mdash; ML-Powered Probability, Historical Vote Modeling, and Invest-Before-the-Call Timing Signals
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-sm font-bold hover:bg-amber-500/20 transition-colors"
        >
          <Award size={18} />
          Open HOF Dashboard
        </button>
      </div>

      {/* Modal */}
      <HOFTrackerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default HOFTracker;
