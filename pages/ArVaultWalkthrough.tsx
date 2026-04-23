// @ts-nocheck
import React, { useState } from 'react';
import { View, Sparkles } from 'lucide-react';
import { ArVaultWalkthroughModal } from '../components/ArVaultWalkthroughModal';

const ArVaultWalkthrough: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30">
            <View size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">AR Vault Walkthrough</h1>
            <p className="text-sm text-slate-400">
              Immersive 3D card showcases with live price overlays
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-bold hover:bg-purple-500/25 transition-all"
        >
          <Sparkles size={16} />
          Open Vault
        </button>
      </div>

      {/* Info Section */}
      <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 flex-shrink-0">
            <View size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              Build Your Virtual Display Room
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Create immersive 3D showcase environments for your card collection.
              Walk through your vault in augmented reality, rotate slabbed cards
              in real-time, see live price tickers floating above each slab, and
              share virtual tours with potential buyers. Choose from six premium
              room themes and customize every detail of your display.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ArVaultWalkthroughModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ArVaultWalkthrough;
