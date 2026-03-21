
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GitCompare,
  ArrowRightLeft,
  TrendingUp,
  Trophy,
  ChevronDown,
  Sparkles,
  Share2,
  Check,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useSupabaseInventory } from '../lib/utils/useSupabaseInventory.ts';
import { CardInventory } from '../types.ts';
import { generateCompareAnalysis } from '../lib/analytics/compareAnalysis.ts';
import { getCardHistory } from '../lib/analytics/priceHistory';
import CardImage from '../components/CardImage.tsx';
import ImageLightbox from '../components/ImageLightbox.tsx';

const Compare: React.FC = () => {
  const { inventory, loading: inventoryLoading } = useSupabaseInventory();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL params if present
  const [card1Id, setCard1Id] = useState<string | null>(searchParams.get('card1'));
  const [card2Id, setCard2Id] = useState<string | null>(searchParams.get('card2'));
  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [lightboxCard, setLightboxCard] = useState<CardInventory | null>(null);

  const card1 = useMemo(() => inventory.find(c => c.id === card1Id), [inventory, card1Id]);
  const card2 = useMemo(() => inventory.find(c => c.id === card2Id), [inventory, card2Id]);

  // Update URL params when selections change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (card1Id) params.card1 = card1Id;
    if (card2Id) params.card2 = card2Id;
    setSearchParams(params, { replace: true });
  }, [card1Id, card2Id, setSearchParams]);

  // Generate historical data for chart from real price history
  const historicalData = useMemo(() => {
    if (!card1 || !card2) return [];

    // Get real history for both cards
    const history1 = [...getCardHistory(card1.id)].reverse(); // reverse for chronological order
    const history2 = [...getCardHistory(card2.id)].reverse();

    // If no history exists, fall back to a single point (current value)
    if (history1.length === 0 && history2.length === 0) {
      return [{
        month: 'Current',
        [card1.player]: card1.currentValue || card1.purchasePrice,
        [card2.player]: card2.currentValue || card2.purchasePrice
      }];
    }

    // Combine and sort all unique timestamps
    const allTimestamps = Array.from(new Set([
      ...history1.map(s => s.timestamp.split('T')[0]),
      ...history2.map(s => s.timestamp.split('T')[0])
    ])).sort();

    // Map timestamps to chart data points
    return allTimestamps.map(date => {
      // Find the latest snapshot for each card on or before this date
      const s1 = history1.filter(s => s.timestamp.split('T')[0] <= date).slice(-1)[0];
      const s2 = history2.filter(s => s.timestamp.split('T')[0] <= date).slice(-1)[0];

      const d = new Date(date);
      return {
        month: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        [card1.player]: s1?.value ?? card1.purchasePrice,
        [card2.player]: s2?.value ?? card2.purchasePrice,
      };
    });
  }, [card1, card2]);

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

  const handleGenerateAnalysis = async () => {
    if (!card1 || !card2) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const analysis = await generateCompareAnalysis(card1, card2);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const handleShareComparison = () => {
    const url = `${window.location.origin}${window.location.pathname}#/compare?card1=${card1Id}&card2=${card2Id}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
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
    onSelect: (_id: string) => void;
    isOpen: boolean;
    setIsOpen: (_open: boolean) => void;
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
            <CardImage
              src={selectedCard.image}
              playerName={selectedCard.player}
              year={selectedCard.year}
              manufacturer={selectedCard.manufacturer}
              className="w-12 h-12 rounded-xl shrink-0"
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
              <CardImage
                src={card.image}
                playerName={card.player}
                year={card.year}
                manufacturer={card.manufacturer}
                className="w-10 h-10 rounded-lg shrink-0"
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

  if (inventoryLoading && inventory.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-lime" aria-label="Loading inventory" />
      </div>
    );
  }

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
              <div className="w-32 h-40 rounded-2xl border-2 border-slate-800 mx-auto mb-4 overflow-hidden">
                <CardImage
                  src={card1.image}
                  playerName={card1.player}
                  year={card1.year}
                  manufacturer={card1.manufacturer}
                  className="w-full h-full"
                  enableLightbox={true}
                  onImageClick={() => setLightboxCard(card1)}
                />
              </div>
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
              <div className="w-32 h-40 rounded-2xl border-2 border-slate-800 mx-auto mb-4 overflow-hidden">
                <CardImage
                  src={card2.image}
                  playerName={card2.player}
                  year={card2.year}
                  manufacturer={card2.manufacturer}
                  className="w-full h-full"
                  enableLightbox={true}
                  onImageClick={() => setLightboxCard(card2)}
                />
              </div>
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

          {/* Historical Trend Chart */}
          <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bebas tracking-widest text-white mb-6 flex items-center gap-3">
              <TrendingUp className="text-brand-lime" size={24} />
              Price History (Simulated)
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorCard1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9F99D" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D9F99D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCard2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94A3B8' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey={card1.player} stroke="#D9F99D" strokeWidth={3} fillOpacity={1} fill="url(#colorCard1)" />
                <Area type="monotone" dataKey={card2.player} stroke="#38BDF8" strokeWidth={3} fillOpacity={1} fill="url(#colorCard2)" />
              </AreaChart>
            </ResponsiveContainer>
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

          {/* AI Recommendation */}
          <div className="bg-brand-lime/5 border border-brand-lime/10 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bebas tracking-widest text-white flex items-center gap-3">
                <Sparkles className="text-brand-lime" size={24} />
                AI Investment Analysis
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleShareComparison}
                  className="px-4 py-2 bg-brand-slate border border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:border-brand-lime/50 transition-all flex items-center gap-2"
                >
                  {linkCopied ? <Check size={14} className="text-brand-lime" /> : <Share2 size={14} />}
                  {linkCopied ? 'Copied!' : 'Share'}
                </button>
                <button
                  onClick={handleGenerateAnalysis}
                  disabled={isAnalyzing}
                  className="px-6 py-2 bg-brand-lime text-brand-charcoal rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {isAnalyzing ? 'Analyzing...' : 'Generate Analysis'}
                </button>
              </div>
            </div>

            {aiAnalysis ? (
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
            ) : (
              <p className="text-slate-400 italic">Click "Generate Analysis" to get an AI-powered investment recommendation comparing these two assets.</p>
            )}
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

      <ImageLightbox
        isOpen={!!lightboxCard}
        onClose={() => setLightboxCard(null)}
        src={lightboxCard?.image}
        alt={lightboxCard?.player ?? ''}
        caption={lightboxCard ? `${lightboxCard.player} • ${lightboxCard.year} ${lightboxCard.manufacturer}` : undefined}
      />
    </div>
  );
};

export default Compare;

