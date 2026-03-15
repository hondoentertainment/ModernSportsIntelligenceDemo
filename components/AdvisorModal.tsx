import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  Lightbulb,
  ShieldCheck,
  Target,
  TrendingUp,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ShoppingCart,
  Tag,
  Crosshair,
  Flame,
  Hourglass,
  Puzzle,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  StrategyProfile,
  getStrategy,
  setStrategy,
  getBuyRecommendations,
  getSellRecommendations,
  analyzeGaps,
  assessRisk,
  generateWeeklyDigest,
  submitFeedback,
  getFeedbackStats,
} from '../lib/advisorService';

interface AdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: CardInventory[];
}

type TabId = 'strategy' | 'recommendations' | 'gaps' | 'risk' | 'digest';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'strategy', label: 'Strategy', icon: <Target size={16} /> },
  { id: 'recommendations', label: 'Recommendations', icon: <TrendingUp size={16} /> },
  { id: 'gaps', label: 'Gaps', icon: <Layers size={16} /> },
  { id: 'risk', label: 'Risk', icon: <ShieldCheck size={16} /> },
  { id: 'digest', label: 'Digest', icon: <Calendar size={16} /> },
];

const strategyCards: {
  id: StrategyProfile;
  name: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  description: string;
  traits: string[];
}[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    icon: <ShieldCheck size={24} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    description: 'Focus on established, high-grade blue-chip cards with proven market demand. Prioritize capital preservation and steady appreciation.',
    traits: ['High-grade PSA 10/BGS 9.5+', 'Star players with track records', 'Flagship sets (Topps Chrome, Prizm)', 'Lower volatility, steady gains'],
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    icon: <Flame size={24} />,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    description: 'Target undervalued cards with high upside potential. Accept higher risk for the chance at outsized returns through quick flips.',
    traits: ['Breakout rookies and prospects', 'Undervalued relative to comps', 'Recent releases with momentum', 'Higher risk, higher reward'],
  },
  {
    id: 'long_term',
    name: 'Long-Term',
    icon: <Hourglass size={24} />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    description: 'Build a collection that appreciates over years and decades. Focus on vintage, scarce, and historically significant cards.',
    traits: ['Vintage and pre-2000 cards', 'Low population counts', 'Hall of Famers and legends', 'Slow but steady appreciation'],
  },
  {
    id: 'completion',
    name: 'Completion',
    icon: <Puzzle size={24} />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    description: 'Fill gaps in your collection systematically. Prioritize breadth across sports, eras, and manufacturers for a well-rounded portfolio.',
    traits: ['Fill sport and era gaps', 'Diversify manufacturers', 'Complete set runs', 'Balanced portfolio coverage'],
  },
];

const gapTypeBadge: Record<string, { label: string; color: string; bg: string; border: string }> = {
  sport: { label: 'Sport', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  decade: { label: 'Decade', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  manufacturer: { label: 'Manufacturer', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  grade: { label: 'Grade', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
};

const urgencyBadge: Record<string, { color: string; bg: string; border: string }> = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  low: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

function riskBarColor(score: number): string {
  if (score < 30) return 'bg-green-500';
  if (score < 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function riskLabel(score: number): string {
  if (score < 30) return 'Low';
  if (score < 60) return 'Moderate';
  return 'High';
}

function riskLabelColor(score: number): string {
  if (score < 30) return 'text-green-400';
  if (score < 60) return 'text-amber-400';
  return 'text-red-400';
}

export const AdvisorModal: React.FC<AdvisorModalProps> = ({ isOpen, onClose, inventory }) => {
  const [activeTab, setActiveTab] = useState<TabId>('strategy');
  const [currentStrategy, setCurrentStrategy] = useState<StrategyProfile>(() => getStrategy());
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'thumbs_up' | 'thumbs_down'>>({});

  const buyRecs = useMemo(() => getBuyRecommendations(inventory, currentStrategy), [inventory, currentStrategy]);
  const sellRecs = useMemo(() => getSellRecommendations(inventory), [inventory]);
  const gaps = useMemo(() => analyzeGaps(inventory), [inventory]);
  const risk = useMemo(() => assessRisk(inventory), [inventory]);
  const digest = useMemo(() => generateWeeklyDigest(inventory, currentStrategy), [inventory, currentStrategy]);
  const feedbackStats = useMemo(() => getFeedbackStats(), []);

  const handleStrategySelect = useCallback((strategy: StrategyProfile) => {
    setStrategy(strategy);
    setCurrentStrategy(strategy);
  }, []);

  const handleFeedback = useCallback((recId: string, type: 'thumbs_up' | 'thumbs_down') => {
    submitFeedback(recId, type);
    setFeedbackGiven(prev => ({ ...prev, [recId]: type }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
              <Lightbulb size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bebas tracking-widest text-white leading-tight">
                Smart <span className="text-amber-400">Collection Advisor</span>
              </h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                AI-powered collection intelligence
                {feedbackStats.totalFeedback > 0 && (
                  <span className="ml-3 text-slate-500">
                    {feedbackStats.totalFeedback} ratings ({feedbackStats.positiveRate}% positive)
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-8 pt-4 pb-0 flex-shrink-0 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8 overflow-y-auto no-scrollbar flex-1">

          {/* ---- Strategy Tab ---- */}
          {activeTab === 'strategy' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400 mb-6">
                Select a strategy profile to tailor recommendations to your investment style. Your selection is saved automatically.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategyCards.map(sc => {
                  const isActive = currentStrategy === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => handleStrategySelect(sc.id)}
                      className={`text-left p-6 rounded-2xl border transition-all ${
                        isActive
                          ? `${sc.bg} ${sc.border} ring-1 ring-${sc.id === 'conservative' ? 'blue' : sc.id === 'aggressive' ? 'red' : sc.id === 'long_term' ? 'emerald' : 'purple'}-500/20`
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${sc.bg} ${sc.color}`}>
                            {sc.icon}
                          </div>
                          <span className={`font-bebas text-xl tracking-widest ${isActive ? sc.color : 'text-white'}`}>
                            {sc.name}
                          </span>
                        </div>
                        {isActive && (
                          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sc.bg} ${sc.color} border ${sc.border}`}>
                            <CheckCircle2 size={12} />
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">{sc.description}</p>
                      <div className="space-y-1">
                        {sc.traits.map((trait, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className={`w-1 h-1 rounded-full ${isActive ? sc.color.replace('text-', 'bg-') : 'bg-slate-600'}`} />
                            {trait}
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---- Recommendations Tab ---- */}
          {activeTab === 'recommendations' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Buy Side */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart size={16} className="text-green-400" />
                  <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Buy Recommendations</p>
                </div>
                {buyRecs.length === 0 && (
                  <p className="text-xs text-slate-500 p-4 bg-slate-800/30 rounded-xl">No buy recommendations at this time.</p>
                )}
                {buyRecs.map(rec => {
                  const fb = feedbackGiven[rec.id];
                  return (
                    <div key={rec.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-white font-medium">{rec.player}</span>
                          <span className="text-xs text-slate-500 ml-2">{rec.sport} &middot; {rec.year} &middot; {rec.set}</span>
                        </div>
                        <span className="font-mono text-xs text-green-400 font-bold">
                          ${rec.estimatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {/* Fit Score Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 uppercase tracking-widest font-black">Fit Score</span>
                          <span className="font-mono text-white">{rec.fitScore}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              rec.fitScore >= 80 ? 'bg-green-500' : rec.fitScore >= 60 ? 'bg-amber-500' : 'bg-slate-500'
                            }`}
                            style={{ width: `${rec.fitScore}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{rec.reasoning}</p>
                      {/* Feedback */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleFeedback(rec.id, 'thumbs_up')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            fb === 'thumbs_up'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'text-slate-500 hover:text-green-400 hover:bg-green-500/10 border border-transparent'
                          }`}
                        >
                          <ThumbsUp size={11} />
                          Helpful
                        </button>
                        <button
                          onClick={() => handleFeedback(rec.id, 'thumbs_down')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            fb === 'thumbs_down'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent'
                          }`}
                        >
                          <ThumbsDown size={11} />
                          Not useful
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sell Side */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={16} className="text-red-400" />
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Sell Recommendations</p>
                </div>
                {sellRecs.length === 0 && (
                  <p className="text-xs text-slate-500 p-4 bg-slate-800/30 rounded-xl">No sell recommendations at this time.</p>
                )}
                {sellRecs.map(rec => {
                  const ub = urgencyBadge[rec.urgency];
                  const fb = feedbackGiven[rec.id];
                  return (
                    <div key={rec.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">{rec.player}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${ub.color} ${ub.bg} border ${ub.border}`}>
                          {rec.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{rec.reasoning}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Clock size={11} />
                        <span>Peak window: <span className="text-slate-300 font-medium">{rec.estimatedPeakWindow}</span></span>
                      </div>
                      {/* Feedback */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleFeedback(rec.id, 'thumbs_up')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            fb === 'thumbs_up'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'text-slate-500 hover:text-green-400 hover:bg-green-500/10 border border-transparent'
                          }`}
                        >
                          <ThumbsUp size={11} />
                          Helpful
                        </button>
                        <button
                          onClick={() => handleFeedback(rec.id, 'thumbs_down')}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            fb === 'thumbs_down'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent'
                          }`}
                        >
                          <ThumbsDown size={11} />
                          Not useful
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---- Gaps Tab ---- */}
          {activeTab === 'gaps' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400 mb-4">
                Collection gaps represent areas where diversification or completeness can be improved. Higher priority gaps should be addressed first.
              </p>
              {gaps.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <p className="text-sm text-slate-400">No significant gaps detected</p>
                  <p className="text-xs text-slate-600 mt-1">Your collection is well-diversified</p>
                </div>
              )}
              {gaps.map(gap => {
                const badge = gapTypeBadge[gap.type];
                return (
                  <div key={gap.id} className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${badge.color} ${badge.bg} border ${badge.border}`}>
                          {badge.label}
                        </span>
                        <span className="text-sm text-white font-medium">{gap.description}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < gap.priority ? 'bg-amber-400' : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-brand-lime/5 border border-brand-lime/15 rounded-xl">
                      <Zap size={14} className="text-brand-lime flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-300 leading-relaxed">{gap.suggestion}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---- Risk Tab ---- */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              <p className="text-sm text-slate-400 mb-4">
                Risk assessment evaluates your portfolio across concentration, liquidity, and market exposure dimensions.
              </p>

              {/* Risk Meters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                  { label: 'Concentration Risk', value: risk.concentrationRisk, desc: 'How concentrated your portfolio is in specific players or sports' },
                  { label: 'Liquidity Risk', value: risk.liquidityRisk, desc: 'How easily your cards can be sold at fair market value' },
                  { label: 'Market Exposure', value: risk.marketExposure, desc: 'How correlated your positions are to overall market movements' },
                  { label: 'Composite Score', value: risk.compositeScore, desc: 'Weighted aggregate of all risk dimensions' },
                ] as const).map(meter => (
                  <div key={meter.label} className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{meter.label}</p>
                      <span className={`font-mono text-lg font-bold ${riskLabelColor(meter.value)}`}>
                        {meter.value}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${riskBarColor(meter.value)}`}
                        style={{ width: `${meter.value}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{meter.desc}</span>
                      <span className={`font-bold uppercase ${riskLabelColor(meter.value)}`}>
                        {riskLabel(meter.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mitigations */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Mitigation Suggestions</p>
                <div className="space-y-2">
                  {risk.mitigations.map((mitigation, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                      <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-relaxed">{mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- Digest Tab ---- */}
          {activeTab === 'digest' && (
            <div className="space-y-6">
              <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-amber-400" />
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Weekly Digest</p>
                </div>
                <p className="text-xs text-slate-400">
                  Personalized summary based on your <span className="text-white font-medium">{currentStrategy.replace('_', '-')}</span> strategy profile.
                </p>
              </div>

              {/* Strategy Alignment */}
              <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Strategy Alignment</p>
                  <span className="font-bebas text-2xl tracking-wider text-white">{digest.strategyAlignment}%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      digest.strategyAlignment >= 70 ? 'bg-green-500' : digest.strategyAlignment >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${digest.strategyAlignment}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {digest.strategyAlignment >= 70
                    ? 'Your collection is well-aligned with your chosen strategy.'
                    : digest.strategyAlignment >= 40
                    ? 'Moderate alignment. Consider adjusting positions to better match your strategy.'
                    : 'Low alignment. Your collection diverges significantly from your chosen strategy.'}
                </p>
              </div>

              {/* Top Buys */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={14} className="text-green-400" />
                  <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Top 3 Buys This Week</p>
                </div>
                {digest.topBuys.length === 0 ? (
                  <p className="text-xs text-slate-500 p-3 bg-slate-800/30 rounded-xl">No buy recommendations this week.</p>
                ) : (
                  <div className="space-y-2">
                    {digest.topBuys.map((rec, idx) => (
                      <div key={rec.id} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                        <span className="text-xs font-mono text-slate-600 w-5">#{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-white font-medium truncate block">
                            {rec.player}
                          </span>
                          <span className="text-[10px] text-slate-500">{rec.sport} &middot; {rec.year} &middot; {rec.set}</span>
                        </div>
                        <span className="font-mono text-xs text-brand-lime">{rec.fitScore}%</span>
                        <span className="font-mono text-xs text-green-400">
                          ${rec.estimatedPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Sells */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-red-400" />
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Top 3 Sells This Week</p>
                </div>
                {digest.topSells.length === 0 ? (
                  <p className="text-xs text-slate-500 p-3 bg-slate-800/30 rounded-xl">No sell recommendations this week.</p>
                ) : (
                  <div className="space-y-2">
                    {digest.topSells.map((rec, idx) => {
                      const ub = urgencyBadge[rec.urgency];
                      return (
                        <div key={rec.id} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                          <span className="text-xs font-mono text-slate-600 w-5">#{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-white font-medium truncate block">{rec.player}</span>
                            <span className="text-[10px] text-slate-500">Peak: {rec.estimatedPeakWindow}</span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${ub.color} ${ub.bg} border ${ub.border}`}>
                            {rec.urgency}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Gap to Fill */}
              {digest.gapToFill && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Crosshair size={14} className="text-purple-400" />
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Priority Gap to Fill</p>
                  </div>
                  <div className="p-4 bg-purple-500/5 border border-purple-500/15 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${gapTypeBadge[digest.gapToFill.type].color} ${gapTypeBadge[digest.gapToFill.type].bg} border ${gapTypeBadge[digest.gapToFill.type].border}`}>
                        {gapTypeBadge[digest.gapToFill.type].label}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < digest.gapToFill!.priority ? 'bg-amber-400' : 'bg-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">{digest.gapToFill.description}</p>
                    <div className="flex items-start gap-2 p-2 bg-brand-lime/5 rounded-lg">
                      <Zap size={12} className="text-brand-lime flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-400">{digest.gapToFill.suggestion}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-slate-400" />
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Risk Summary</p>
                </div>
                <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-300 leading-relaxed">{digest.riskSummary}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorModal;
