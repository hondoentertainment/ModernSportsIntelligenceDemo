
import React, { useState, useMemo } from 'react';
import { GitCompare, ArrowRightLeft, TrendingUp, TrendingDown, DollarSign, Trophy, Star, ChevronDown } from 'lucide-react';
import { useInventory } from '../lib/useInventory.ts';
import { CardInventory } from '../types.ts';

const Compare: React.FC = () => {
  const { inventory } = useInventory();
  const [card1Id, setCard1Id] = useState<string | null>(null);
  const [card2Id, setCard2Id] = useState<string | null>(null);
  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);

  const card1 = useMemo(() => inventory.find(c => c.id === card1Id), [inventory, card1Id]);
  const card2 = useMemo(() => inventory.find(c => c.id === card2Id), [inventory, card2Id]);

  const getROI = (card: CardInventory) => {
    if (!card.purchasePrice || !card.currentValue) return null;
    return ((card.currentValue - card.purchasePrice) / card.purchasePrice) * 100;
  };

  const compareMetric = (val1: number | null | undefined, val2: number | null | undefined, higherIsBetter = true) => {
    if (val1 == null || val2 == null) return { winner: null, card1Better: false, card2Better: false };
    const card1Better = higherIsBetter ? val1 > val2 : val1 < val2;
    const card2Better = higherIsBetter ? val2 > val1 : val2 < val1;
    return { winner: card1Better ? 1 : card2Better ? 2 : null, card1Better, card2Better };
  };

  const CardSelector = ({
    selectedCard,
    onSelect,
    isOpen,
    setIsOpen,
    excludeId,
    label
  }: {
    selectedCard: CardInventory | undefined;
    onSelect: (id: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    excludeId: string | null;
    label: string;
  }) => (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-brand-slate border border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-brand-lime/30 transition-all"
      >
        {selectedCard ? (
          <div className="flex items-center gap-4">
            <img
              src={selectedCard.image || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=600'}
              alt=""
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="text-left">
              <p className="font-bold text-white">{selectedCard.player}</p>
              <p className="text-[10px] text-brand-muted uppercase tracking-widest">{selectedCard.year} {selectedCard.manufacturer}</p>
            </div>
          </div>
        ) : (
          <span className="text-brand-muted font-medium">{label}</span>
        )}
        <ChevronDown className={`text-brand-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-brand-slate border border-slate-800 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {inventory.filter(c => c.id !== excludeId).map(card => (
            <button
              key={card.id}
              onClick={() => { onSelect(card.id); setIsOpen(false); }}
              className="w-full px-4 py-3 flex items-center gap-4 hover:bg-brand-charcoal transition-colors border-b border-slate-800/50 last:border-0"
            >
              <img
                src={card.image || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=600'}
                alt=""
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="text-left flex-1">
                <p className="font-bold text-white text-sm">{card.player}</p>
                <p className="text-[9px] text-brand-muted uppercase tracking-widest">{card.set}</p>
              </div>
              <span className="text-brand-lime font-mono text-sm">
                ${card.currentValue?.toLocaleString() || '—'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const ComparisonRow = ({
    label,
    val1,
    val2,
    format = 'text',
    higherIsBetter = true
  }: {
    label: string;
    val1: any;
    val2: any;
    format?: 'text' | 'currency' | 'percent';
    higherIsBetter?: boolean;
  }) => {
    const comparison = compareMetric(
      typeof val1 === 'number' ? val1 : null,
      typeof val2 === 'number' ? val2 : null,
      higherIsBetter
    );

    const formatValue = (val: any) => {
      if (val == null) return '—';
      if (format === 'currency') return `$${Math.round(val).toLocaleString()}`;
      if (format === 'percent') return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
      return val;
    };

    return (
      <div className="grid grid-cols-3 gap-4 py-4 border-b border-slate-800/50">
        <div className={`text-right font-mono text-lg ${comparison.card1Better ? 'text-brand-lime font-bold' : 'text-white'}`}>
          {formatValue(val1)}
          {comparison.card1Better && <TrendingUp className="inline ml-2 text-brand-lime" size={16} />}
        </div>
        <div className="text-center text-[10px] font-black text-brand-muted uppercase tracking-widest self-center">
          {label}
        </div>
        <div className={`text-left font-mono text-lg ${comparison.card2Better ? 'text-brand-lime font-bold' : 'text-white'}`}>
          {comparison.card2Better && <TrendingUp className="inline mr-2 text-brand-lime" size={16} />}
          {formatValue(val2)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
          Asset <span className="text-brand-lime">Compare</span>
        </h1>
        <p className="text-brand-muted max-w-xl mx-auto font-medium">
          Side-by-side comparison of portfolio assets to inform buy/sell decisions.
        </p>
      </div>

      {/* Card Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8 items-start">
        <div className="lg:col-span-3">
          <CardSelector
            selectedCard={card1}
            onSelect={setCard1Id}
            isOpen={dropdown1Open}
            setIsOpen={setDropdown1Open}
            excludeId={card2Id}
            label="Select First Asset"
          />
        </div>

        <div className="lg:col-span-1 flex items-center justify-center">
          <div className="p-4 bg-brand-lime rounded-full shadow-2xl shadow-brand-lime/30">
            <ArrowRightLeft className="text-brand-charcoal" size={24} />
          </div>
        </div>

        <div className="lg:col-span-3">
          <CardSelector
            selectedCard={card2}
            onSelect={setCard2Id}
            isOpen={dropdown2Open}
            setIsOpen={setDropdown2Open}
            excludeId={card1Id}
            label="Select Second Asset"
          />
        </div>
      </div>

      {/* Comparison Results */}
      {card1 && card2 ? (
        <div className="space-y-8">
          {/* Cards Display */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
            <div className="lg:col-span-3 bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 text-center">
              <img
                src={card1.image || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=600'}
                alt=""
                className="w-32 h-40 rounded-2xl object-cover border-2 border-slate-800 mx-auto mb-4"
              />
              <h3 className="text-2xl font-bold text-white">{card1.player}</h3>
              <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1">{card1.year} {card1.manufacturer}</p>
              <p className="text-sm text-slate-400 mt-2">{card1.set}</p>
              {card1.isGraded && (
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-lime/10 text-brand-lime rounded-xl text-xs font-black uppercase">
                  <Trophy size={14} /> {card1.gradingCompany} {card1.grade}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 flex items-center justify-center">
              <div className="text-4xl font-bebas text-brand-muted">VS</div>
            </div>

            <div className="lg:col-span-3 bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 text-center">
              <img
                src={card2.image || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=600'}
                alt=""
                className="w-32 h-40 rounded-2xl object-cover border-2 border-slate-800 mx-auto mb-4"
              />
              <h3 className="text-2xl font-bold text-white">{card2.player}</h3>
              <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1">{card2.year} {card2.manufacturer}</p>
              <p className="text-sm text-slate-400 mt-2">{card2.set}</p>
              {card2.isGraded && (
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-lime/10 text-brand-lime rounded-xl text-xs font-black uppercase">
                  <Trophy size={14} /> {card2.gradingCompany} {card2.grade}
                </div>
              )}
            </div>
          </div>

          {/* Metrics Comparison */}
          <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bebas tracking-widest text-white mb-6 flex items-center gap-3">
              <GitCompare className="text-brand-lime" size={24} />
              Performance Comparison
            </h2>

            <ComparisonRow label="Market Value" val1={card1.currentValue} val2={card2.currentValue} format="currency" />
            <ComparisonRow label="Purchase Price" val1={card1.purchasePrice} val2={card2.purchasePrice} format="currency" higherIsBetter={false} />
            <ComparisonRow label="ROI" val1={getROI(card1)} val2={getROI(card2)} format="percent" />
            <ComparisonRow label="Year" val1={card1.year} val2={card2.year} />
            <ComparisonRow label="Graded" val1={card1.isGraded ? 'Yes' : 'No'} val2={card2.isGraded ? 'Yes' : 'No'} />
          </div>

          {/* Recommendation */}
          <div className="bg-brand-lime/5 border border-brand-lime/10 rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bebas tracking-widest text-white mb-4 flex items-center gap-3">
              <Star className="text-brand-lime" size={24} />
              Intelligence Recommendation
            </h2>
            {(() => {
              const roi1 = getROI(card1);
              const roi2 = getROI(card2);
              if (roi1 != null && roi2 != null) {
                const better = roi1 > roi2 ? card1 : card2;
                const worse = roi1 > roi2 ? card2 : card1;
                return (
                  <div className="space-y-4">
                    <p className="text-slate-300 leading-relaxed">
                      Based on current performance, <strong className="text-brand-lime">{better.player}</strong> ({better.set})
                      shows stronger ROI at <span className="font-mono text-brand-lime">{Math.max(roi1, roi2).toFixed(1)}%</span>.
                    </p>
                    <p className="text-sm text-slate-400 italic">
                      Consider holding {better.player} and evaluating {worse.player} for potential liquidation if capital reallocation is needed.
                    </p>
                  </div>
                );
              }
              return <p className="text-slate-400">Run a Market Sync to populate current values for comparison recommendations.</p>;
            })()}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-brand-slate border border-dashed border-slate-800 rounded-[3rem] space-y-6">
          <div className="w-24 h-24 bg-brand-lime/5 rounded-full flex items-center justify-center border border-brand-lime/10">
            <GitCompare className="text-brand-lime" size={32} />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bebas tracking-widest text-white">Select Two Assets</h3>
            <p className="text-brand-muted max-w-sm font-medium">
              Choose two cards from your portfolio above to compare their performance metrics side-by-side.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
