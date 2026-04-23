// @ts-nocheck
import React, { useState } from 'react';
import { Dna } from 'lucide-react';
import CollectionGenomeModal from '../components/CollectionGenomeModal.tsx';

const CollectionGenome: React.FC = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-brand-lime/20">
          <Dna size={24} className="text-brand-lime" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Collection Genome &mdash; 23andMe for Your Card Collection</h1>
          <p className="text-sm text-slate-400">Deep personality analysis of your collection: buying patterns, blind spots, behavioral biases, and untapped opportunities</p>
        </div>
      </div>
      <CollectionGenomeModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-brand-lime/20 hover:bg-brand-lime/30 text-brand-lime rounded-lg text-sm font-semibold transition-colors"
        >
          Open Collection Genome
        </button>
      )}
    </div>
  );
};

export default CollectionGenome;
