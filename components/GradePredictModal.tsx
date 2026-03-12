import React, { useMemo, useState } from 'react';
import {
  X,
  Brain,
  BarChart3,
  Target,
  ListChecks,
  Building2,
  History,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Minus,
  ArrowUpDown,
  Sparkles,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ReferenceLine,
} from 'recharts';
import { CardInventory } from '../types';
import {
  predictGradeDistribution,
  getPredictedGrade,
  getCompanyRecommendations,
  calculateSubmissionROI,
  optimizeBulkSubmission,
  getSubmissionCostTracker,
  getCalibrationData,
  getSubmissionQueue,
  addToSubmissionQueue,
  removeFromSubmissionQueue,
  loadGradePredictPrefs,
  saveGradePredictPrefs,
  GradeProbability,
  GradeCompanyRecommendation,
  SubmissionROI,
} from '../lib/gradePredictService';

interface GradePredictModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'predict' | 'bulk' | 'compare' | 'history' | 'accuracy';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'predict', label: 'Predict', icon: <Brain size={16} /> },
  { id: 'bulk', label: 'Bulk Queue', icon: <ListChecks size={16} /> },
  { id: 'compare', label: 'Companies', icon: <Building2 size={16} /> },
  { id: 'history', label: 'Cost Track', icon: <DollarSign size={16} /> },
  { id: 'accuracy', label: 'Accuracy', icon: <Target size={16} /> },
];

// ---- Predict Tab ----

const PredictTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const ungradedCards = useMemo(
    () => cards.filter((c) => !c.isGraded && c.status !== 'sold'),
    [cards]
  );
  const allCards = ungradedCards.length > 0 ? ungradedCards : cards.filter((c) => c.status !== 'sold');
  const [selectedCardId, setSelectedCardId] = useState<string>(allCards[0]?.id ?? '');
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedCard = useMemo(
    () => allCards.find((c) => c.id === selectedCardId) ?? allCards[0],
    [allCards, selectedCardId]
  );

  const distribution = useMemo<GradeProbability[]>(
    () => (selectedCard ? predictGradeDistribution(selectedCard) : []),
    [selectedCard]
  );

  const prediction = useMemo(
    () => (selectedCard ? getPredictedGrade(selectedCard) : { grade: '?', confidence: 0 }),
    [selectedCard]
  );

  const roi = useMemo<SubmissionROI | null>(
    () => (selectedCard ? calculateSubmissionROI(selectedCard) : null),
    [selectedCard]
  );

  const chartData = useMemo(
    () =>
      distribution.map((d) => ({
        grade: d.grade,
        probability: Math.round(d.probability * 100 * 10) / 10,
      })),
    [distribution]
  );

  if (allCards.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        No cards in your inventory to analyze.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white hover:border-slate-600 transition-colors"
        >
          <span className="truncate">
            {selectedCard
              ? `${selectedCard.player} - ${selectedCard.year} ${selectedCard.manufacturer} #${selectedCard.cardNumber}`
              : 'Select a card'}
          </span>
          <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
        </button>
        {showDropdown && (
          <div className="absolute z-50 top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl max-h-60 overflow-y-auto">
            {allCards.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  setSelectedCardId(card.id);
                  setShowDropdown(false);
                  saveGradePredictPrefs({ selectedCardId: card.id });
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-slate-700 transition-colors ${
                  card.id === selectedCardId
                    ? 'text-brand-lime bg-slate-700/50'
                    : 'text-white'
                }`}
              >
                <span className="truncate">
                  {card.player} - {card.year} {card.manufacturer} #{card.cardNumber}
                </span>
                {!card.isGraded && (
                  <span className="flex-shrink-0 text-[10px] font-bold text-cyan-400 bg-cyan-500/15 px-1.5 py-0.5 rounded">
                    RAW
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prediction Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Predicted Grade
          </p>
          <p className="text-3xl font-bebas tracking-wider text-cyan-400">
            {prediction.grade}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Confidence
          </p>
          <p className="text-3xl font-bebas tracking-wider text-white">
            {(prediction.confidence * 100).toFixed(0)}%
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Expected ROI
          </p>
          <p className={`text-3xl font-bebas tracking-wider ${
            (roi?.expectedROI ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {roi ? `${roi.expectedROI >= 0 ? '+' : ''}${roi.expectedROI.toFixed(1)}%` : '--'}
          </p>
        </div>
      </div>

      {/* Grade Probability Chart */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Grade Probability Distribution
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="grade"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#f8fafc' }}
                formatter={(value: number) => [`${value}%`, 'Probability']}
              />
              <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.grade === prediction.grade
                        ? '#06b6d4'
                        : parseFloat(entry.grade) >= 9
                          ? '#3b82f6'
                          : '#475569'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Submission ROI Breakdown */}
      {roi && (
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Submission ROI Calculator
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Raw card value</span>
              <span className="text-white font-mono">${roi.rawValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Expected graded value ({roi.bestCompany} {roi.predictedGrade})</span>
              <span className="text-white font-mono">${roi.expectedGradedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="h-px bg-slate-700" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Grading fee ({roi.bestCompany})</span>
              <span className="text-red-400 font-mono">-${roi.gradingFee}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Shipping</span>
              <span className="text-red-400 font-mono">-${roi.shippingFee}</span>
            </div>
            <div className="h-px bg-slate-700" />
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-white">Expected Profit</span>
              <span className={`font-mono ${roi.expectedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {roi.expectedProfit >= 0 ? '+' : ''}${roi.expectedProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${
            roi.recommendSubmit
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {roi.recommendSubmit ? (
              <>
                <CheckCircle2 size={14} />
                <span>Recommended to submit &mdash; positive expected ROI</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} />
                <span>Not recommended &mdash; expected ROI is negative</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Bulk Queue Tab ----

const BulkQueueTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const [sortField, setSortField] = useState<'roi' | 'profit' | 'confidence'>('roi');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [queue, setQueue] = useState<string[]>(() => getSubmissionQueue());

  const batch = useMemo(() => optimizeBulkSubmission(cards), [cards]);

  const sortedCards = useMemo(() => {
    const sorted = [...batch.cards];
    sorted.sort((a, b) => {
      let va = 0, vb = 0;
      if (sortField === 'roi') { va = a.expectedROI; vb = b.expectedROI; }
      else if (sortField === 'profit') { va = a.expectedProfit; vb = b.expectedProfit; }
      else { va = a.confidence; vb = b.confidence; }
      return sortDir === 'desc' ? vb - va : va - vb;
    });
    return sorted;
  }, [batch.cards, sortField, sortDir]);

  const toggleSort = (field: 'roi' | 'profit' | 'confidence') => {
    if (sortField === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const toggleQueue = (cardId: string) => {
    if (queue.includes(cardId)) {
      setQueue(removeFromSubmissionQueue(cardId));
    } else {
      setQueue(addToSubmissionQueue(cardId));
    }
  };

  if (batch.cards.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <ListChecks size={40} className="mx-auto text-slate-600" />
        <p className="text-slate-400 text-sm">No profitable submissions found.</p>
        <p className="text-slate-600 text-xs">
          Add ungraded cards to discover submission opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Batch Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Cards</p>
          <p className="text-2xl font-bebas tracking-wider text-white">{batch.cards.length}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Avg ROI</p>
          <p className="text-2xl font-bebas tracking-wider text-green-400">+{batch.averageROI.toFixed(1)}%</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Fees</p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            ${batch.netCostAfterDiscount.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Exp. Profit</p>
          <p className="text-2xl font-bebas tracking-wider text-cyan-400">
            +${batch.totalExpectedProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Batch Discount Banner */}
      {batch.batchDiscount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-2xl">
          <Sparkles size={18} className="text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-white">Bulk Discount: {batch.batchDiscount}% off</p>
            <p className="text-xs text-slate-400">
              Save ${(batch.totalFees - batch.netCostAfterDiscount).toFixed(2)} by submitting {batch.cards.length} cards together via {batch.recommendedCompany}
            </p>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center gap-2 px-1">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mr-auto">
          Submission Queue ({sortedCards.length})
        </p>
        {(['roi', 'profit', 'confidence'] as const).map((field) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
              sortField === field
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ArrowUpDown size={10} />
            {field}
          </button>
        ))}
      </div>

      {/* Card List */}
      <div className="space-y-2">
        {sortedCards.map((roi, idx) => {
          const inQueue = queue.includes(roi.cardId);
          return (
            <div
              key={roi.cardId}
              className={`flex items-center gap-3 px-4 py-3 border rounded-xl transition-all ${
                inQueue
                  ? 'bg-cyan-500/5 border-cyan-500/30'
                  : 'bg-slate-800/30 border-slate-700/50'
              }`}
            >
              <span className="text-[10px] text-slate-600 font-mono w-5 text-right flex-shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-medium truncate">{roi.player}</p>
                <p className="text-[10px] text-slate-500 truncate">
                  {roi.cardDescription} &middot; {roi.bestCompany} &middot; Pred. {roi.predictedGrade}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-xs font-bold font-mono ${
                  roi.expectedROI >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {roi.expectedROI >= 0 ? '+' : ''}{roi.expectedROI.toFixed(1)}%
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ${roi.expectedProfit.toFixed(0)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleQueue(roi.cardId);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    inQueue
                      ? 'bg-cyan-500/20 text-cyan-400 hover:bg-red-500/20 hover:text-red-400'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400'
                  }`}
                >
                  {inQueue ? <Minus size={12} /> : <Plus size={12} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Queue Summary */}
      {queue.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
          <div className="flex items-center gap-2">
            <ListChecks size={16} className="text-cyan-400" />
            <span className="text-sm font-bold text-white">{queue.length} cards in queue</span>
          </div>
          <span className="text-xs text-slate-400">Ready to submit</span>
        </div>
      )}
    </div>
  );
};

// ---- Company Comparison Tab ----

const CompanyTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const activeCards = useMemo(
    () => cards.filter((c) => !c.isGraded && c.status !== 'sold').slice(0, 10),
    [cards]
  );
  const allCards = activeCards.length > 0 ? activeCards : cards.filter((c) => c.status !== 'sold').slice(0, 10);
  const [selectedCardId, setSelectedCardId] = useState<string>(allCards[0]?.id ?? '');
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedCard = useMemo(
    () => allCards.find((c) => c.id === selectedCardId) ?? allCards[0],
    [allCards, selectedCardId]
  );

  const recommendations = useMemo<GradeCompanyRecommendation[]>(
    () => (selectedCard ? getCompanyRecommendations(selectedCard) : []),
    [selectedCard]
  );

  if (allCards.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        No cards available to compare.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white hover:border-slate-600 transition-colors"
        >
          <span className="truncate">
            {selectedCard
              ? `${selectedCard.player} - ${selectedCard.year} ${selectedCard.manufacturer} #${selectedCard.cardNumber}`
              : 'Select a card'}
          </span>
          <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
        </button>
        {showDropdown && (
          <div className="absolute z-50 top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl max-h-60 overflow-y-auto">
            {allCards.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  setSelectedCardId(card.id);
                  setShowDropdown(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-slate-700 transition-colors ${
                  card.id === selectedCardId ? 'text-brand-lime bg-slate-700/50' : 'text-white'
                }`}
              >
                <span className="truncate">
                  {card.player} - {card.year} {card.manufacturer} #{card.cardNumber}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Company Cards */}
      {recommendations.map((rec) => (
        <div
          key={rec.company}
          className={`p-5 border rounded-2xl space-y-4 ${
            rec.recommended
              ? 'bg-cyan-500/5 border-cyan-500/30'
              : 'bg-slate-800/50 border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 size={18} className={rec.recommended ? 'text-cyan-400' : 'text-slate-400'} />
              <div>
                <p className="text-sm font-bold text-white">{rec.company}</p>
                <p className="text-[10px] text-slate-500">{rec.reason}</p>
              </div>
            </div>
            {rec.recommended && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <CheckCircle2 size={10} />
                Best Pick
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900/30 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                <DollarSign size={10} />
                <span className="text-[10px] uppercase tracking-wider">Exp. Value</span>
              </div>
              <p className="text-sm font-bold text-white font-mono">
                ${rec.expectedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-slate-900/30 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                <Percent size={10} />
                <span className="text-[10px] uppercase tracking-wider">Fee</span>
              </div>
              <p className="text-sm font-bold text-white font-mono">${rec.fee}</p>
            </div>
            <div className="p-3 bg-slate-900/30 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                <Clock size={10} />
                <span className="text-[10px] uppercase tracking-wider">Days</span>
              </div>
              <p className="text-sm font-bold text-white font-mono">{rec.turnaroundDays}</p>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-400">Net gain</span>
            <span className={`text-sm font-bold font-mono ${
              rec.netGain >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {rec.netGain >= 0 ? '+' : ''}${rec.netGain.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---- Cost Tracker Tab ----

const CostTrackerTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const tracker = useMemo(() => getSubmissionCostTracker(cards), [cards]);

  if (tracker.totalCardsSubmitted === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <DollarSign size={40} className="mx-auto text-slate-600" />
        <p className="text-slate-400 text-sm">No submission history yet.</p>
        <p className="text-slate-600 text-xs">
          Submit cards for grading to track costs and ROI.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Total Fees
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            ${tracker.totalFeesSpent.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Cards Submitted
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">
            {tracker.totalCardsSubmitted}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Avg Grade
          </p>
          <p className="text-2xl font-bebas tracking-wider text-cyan-400">
            {tracker.averageGradeReceived.toFixed(1)}
          </p>
        </div>
      </div>

      {/* ROI Summary */}
      <div className={`flex items-center gap-3 p-4 border rounded-2xl ${
        tracker.cumulativeROI >= 0
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-red-500/5 border-red-500/20'
      }`}>
        <TrendingUp size={18} className={tracker.cumulativeROI >= 0 ? 'text-green-400' : 'text-red-400'} />
        <div>
          <p className="text-sm font-bold text-white">Cumulative Grading ROI</p>
          <p className="text-xs text-slate-400">
            Total value gained: ${tracker.totalValueGained.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <span className={`ml-auto text-xl font-bebas tracking-wider ${
          tracker.cumulativeROI >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {tracker.cumulativeROI >= 0 ? '+' : ''}{tracker.cumulativeROI.toFixed(1)}%
        </span>
      </div>

      {/* By Company Breakdown */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          By Grading Company
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">Company</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">Cards</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">Fees</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">Avg Grade</th>
                <th className="text-right py-2.5 px-3 text-slate-400 font-bold uppercase tracking-wider">ROI</th>
              </tr>
            </thead>
            <tbody>
              {tracker.byCompany.map((entry) => (
                <tr key={entry.company} className="border-b border-slate-700/50">
                  <td className="py-2.5 px-3 text-white font-medium">{entry.company}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300 font-mono">{entry.count}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300 font-mono">${entry.totalFees}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300 font-mono">{entry.avgGrade.toFixed(1)}</td>
                  <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                    entry.roi >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {entry.roi >= 0 ? '+' : ''}{entry.roi.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Avg Fee Per Card */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
        <span className="text-xs text-slate-400">Average fee per card</span>
        <span className="text-sm font-bold text-white font-mono">
          ${tracker.averageFeePerCard.toFixed(2)}
        </span>
      </div>

      {/* Prediction Accuracy */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
        <span className="text-xs text-slate-400">Model prediction accuracy</span>
        <span className="text-sm font-bold text-cyan-400 font-mono">
          {tracker.accuracyRate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

// ---- Accuracy / Calibration Tab ----

const AccuracyTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const calibration = useMemo(() => getCalibrationData(cards), [cards]);
  const tracker = useMemo(() => getSubmissionCostTracker(cards), [cards]);

  const scatterData = useMemo(
    () =>
      calibration.map((p) => ({
        predicted: p.predictedGrade,
        actual: p.actualGrade,
        player: p.player,
      })),
    [calibration]
  );

  if (calibration.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <Target size={40} className="mx-auto text-slate-600" />
        <p className="text-slate-400 text-sm">No calibration data available.</p>
        <p className="text-slate-600 text-xs">
          Submit cards for grading to build prediction accuracy data.
        </p>
      </div>
    );
  }

  const accurateCount = calibration.filter(
    (p) => Math.abs(p.predictedGrade - p.actualGrade) <= 0.5
  ).length;
  const closeCount = calibration.filter(
    (p) => Math.abs(p.predictedGrade - p.actualGrade) <= 1.0 && Math.abs(p.predictedGrade - p.actualGrade) > 0.5
  ).length;
  const offCount = calibration.length - accurateCount - closeCount;

  return (
    <div className="space-y-6">
      {/* Accuracy Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Exact (within 0.5)
          </p>
          <p className="text-2xl font-bebas tracking-wider text-green-400">{accurateCount}</p>
        </div>
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Close (within 1.0)
          </p>
          <p className="text-2xl font-bebas tracking-wider text-amber-400">{closeCount}</p>
        </div>
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Off (more than 1.0)
          </p>
          <p className="text-2xl font-bebas tracking-wider text-red-400">{offCount}</p>
        </div>
      </div>

      {/* Overall Accuracy */}
      <div className="flex items-center gap-3 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
        <Target size={18} className="text-cyan-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-white">Model Accuracy Rate</p>
          <p className="text-xs text-slate-400">
            Predictions within 0.5 grade of actual result
          </p>
        </div>
        <span className="ml-auto text-xl font-bebas tracking-wider text-cyan-400">
          {tracker.accuracyRate.toFixed(1)}%
        </span>
      </div>

      {/* Scatter Plot: Predicted vs Actual */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Predicted vs Actual Grade
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                type="number"
                dataKey="predicted"
                name="Predicted"
                domain={[0, 10.5]}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                label={{ value: 'Predicted', position: 'bottom', fill: '#64748b', fontSize: 10 }}
              />
              <YAxis
                type="number"
                dataKey="actual"
                name="Actual"
                domain={[0, 10.5]}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                label={{ value: 'Actual', angle: -90, position: 'left', fill: '#64748b', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#f8fafc' }}
                formatter={(value: number, name: string) => [value.toFixed(1), name]}
              />
              <ReferenceLine
                segment={[{ x: 0, y: 0 }, { x: 10.5, y: 10.5 }]}
                stroke="#06b6d4"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
              <Scatter data={scatterData} fill="#3b82f6">
                {scatterData.map((entry, index) => {
                  const diff = Math.abs(entry.predicted - entry.actual);
                  return (
                    <Cell
                      key={`dot-${index}`}
                      fill={diff <= 0.5 ? '#10b981' : diff <= 1.0 ? '#f59e0b' : '#ef4444'}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-600 text-center">
          Dashed line = perfect calibration. Green = within 0.5, Amber = within 1.0, Red = off by more than 1.0
        </p>
      </div>

      {/* Individual Results */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Recent Predictions vs Results
        </p>
        <div className="space-y-2">
          {calibration.slice(0, 10).map((point, idx) => {
            const diff = Math.abs(point.predictedGrade - point.actualGrade);
            const accurate = diff <= 0.5;
            return (
              <div
                key={`cal-${idx}`}
                className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/30 rounded-xl"
              >
                {accurate ? (
                  <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={14} className={diff <= 1.0 ? 'text-amber-400 flex-shrink-0' : 'text-red-400 flex-shrink-0'} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">{point.player}</p>
                  <p className="text-[10px] text-slate-500">
                    Predicted {point.predictedGrade.toFixed(1)} &middot; Actual {point.actualGrade.toFixed(1)}
                  </p>
                </div>
                <span className={`text-xs font-bold font-mono ${
                  accurate ? 'text-green-400' : diff <= 1.0 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {diff <= 0.5 ? 'Accurate' : diff <= 1.0 ? 'Close' : `Off ${diff.toFixed(1)}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Main Modal ----

export const GradePredictModal: React.FC<GradePredictModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const prefs = useMemo(() => loadGradePredictPrefs(), []);
  const [activeTab, setActiveTab] = useState<TabId>(
    (prefs.defaultTab as TabId) ?? 'predict'
  );

  const ungradedCount = useMemo(
    () => cards.filter((c) => !c.isGraded && c.status !== 'sold').length,
    [cards]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-cyan-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/30">
              <Brain size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <BarChart3 size={10} />
                  {ungradedCount} ungraded cards
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30">
                  <History size={10} />
                  AI Engine
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Predictive <span className="text-cyan-400">Grading</span> Engine
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-700 bg-slate-800/30">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                saveGradePredictPrefs({ defaultTab: tab.id });
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-cyan-400 bg-cyan-500/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'predict' && <PredictTab cards={cards} />}
          {activeTab === 'bulk' && <BulkQueueTab cards={cards} />}
          {activeTab === 'compare' && <CompanyTab cards={cards} />}
          {activeTab === 'history' && <CostTrackerTab cards={cards} />}
          {activeTab === 'accuracy' && <AccuracyTab cards={cards} />}
        </div>
      </div>
    </div>
  );
};

export default GradePredictModal;
