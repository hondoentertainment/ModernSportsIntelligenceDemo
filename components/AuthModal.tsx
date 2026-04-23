// @ts-nocheck
import React, { useMemo, useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Search,
  ClipboardCheck,
  Eye,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  AuthScore,
  AuthAlert,
  calculateAuthScore,
  verifyCert,
  getRiskFactors,
  getAuthAlerts,
  getCollectionAuthScore,
  getAuthChecklist,
} from '../lib/utils/authenticationService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'overview' | 'detail' | 'checklist';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <ShieldCheck size={16} /> },
  { id: 'detail', label: 'Card Detail', icon: <Search size={16} /> },
  { id: 'checklist', label: 'Checklist', icon: <ClipboardCheck size={16} /> },
];

const GRADING_COMPANIES = ['PSA', 'BGS', 'SGC'];

// ---- Helpers ----

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function getScoreTextClass(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function getSeverityStyle(severity: string): { color: string; bg: string; border: string; text: string } {
  switch (severity) {
    case 'critical': return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'Critical' };
    case 'high': return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'High' };
    case 'medium': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'Medium' };
    default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'Low' };
  }
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Verified';
  if (score >= 75) return 'Likely Authentic';
  if (score >= 60) return 'Review Recommended';
  if (score >= 40) return 'Suspicious';
  return 'High Risk';
}

// ---- Score Gauge Component ----

const ScoreGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 120 }) => {
  const color = getScoreColor(score);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.7s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bebas tracking-wider text-white">{score}</span>
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
};

// ---- Overview Tab ----

const OverviewTab: React.FC<{
  cards: CardInventory[];
  alerts: AuthAlert[];
  collectionScore: ReturnType<typeof getCollectionAuthScore>;
  onSelectCard: (_cardId: string) => void;
}> = ({ cards, alerts, collectionScore, onSelectCard }) => {
  const [sortBy, setSortBy] = useState<'score' | 'severity'>('severity');

  const cardScores = useMemo(() => {
    return cards.map(card => ({
      card,
      score: calculateAuthScore(card),
      alert: alerts.find(a => a.cardId === card.id),
    }));
  }, [cards, alerts]);

  const sortedCards = useMemo(() => {
    const sorted = [...cardScores];
    if (sortBy === 'score') {
      sorted.sort((a, b) => a.score.overall - b.score.overall);
    } else {
      const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      sorted.sort((a, b) => {
        const aSev = a.alert ? severityOrder[a.alert.severity] : 4;
        const bSev = b.alert ? severityOrder[b.alert.severity] : 4;
        if (aSev !== bSev) return aSev - bSev;
        return a.score.overall - b.score.overall;
      });
    }
    return sorted;
  }, [cardScores, sortBy]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Auth Score</p>
          <p className={`text-2xl font-bebas tracking-wider ${getScoreTextClass(collectionScore.overall)}`}>
            {collectionScore.overall}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Verified</p>
          <p className="text-2xl font-bebas tracking-wider text-green-400">{collectionScore.verifiedCount}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Suspicious</p>
          <p className="text-2xl font-bebas tracking-wider text-amber-400">{collectionScore.suspiciousCount}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">High Risk</p>
          <p className="text-2xl font-bebas tracking-wider text-red-400">{collectionScore.highRiskCount}</p>
        </div>
      </div>

      {/* Breakdown Bar */}
      {collectionScore.breakdown.length > 0 && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Collection Breakdown
          </p>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {collectionScore.breakdown.map((segment, i) => (
              <div
                key={i}
                className="h-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: segment.color,
                  width: `${(segment.count / collectionScore.totalCards) * 100}%`,
                  minWidth: segment.count > 0 ? '8px' : '0',
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {collectionScore.breakdown.map((segment, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                <span className="text-slate-400">{segment.label}</span>
                <span className="text-white font-bold">{segment.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts by Severity */}
      {alerts.length > 0 && (
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Active Alerts ({alerts.length})
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {alerts.slice(0, 8).map(alert => {
              const style = getSeverityStyle(alert.severity);
              return (
                <button
                  key={alert.cardId}
                  onClick={() => onSelectCard(alert.cardId)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${style.bg} border ${style.border} hover:opacity-80 transition-opacity`}
                >
                  <ShieldAlert size={14} className={style.color} />
                  <span className="flex-1 text-xs text-slate-300 truncate">{alert.cardLabel}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${style.color}`}>
                    {style.text}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{alert.score}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Card List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            All Cards ({cards.length})
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSortBy('severity')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                sortBy === 'severity'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Risk
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                sortBy === 'score'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Score
            </button>
          </div>
        </div>

        <div className="space-y-1 max-h-60 overflow-y-auto">
          {sortedCards.map(({ card, score, alert }) => (
            <button
              key={card.id}
              onClick={() => onSelectCard(card.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-colors ${
                alert && (alert.severity === 'critical' || alert.severity === 'high')
                  ? 'bg-red-500/5 border border-red-500/15 hover:bg-red-500/10'
                  : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/60'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getScoreColor(score.overall) }}
              />
              <span className="flex-1 text-white truncate">
                {card.year} {card.player} #{card.cardNumber}
              </span>
              {card.isGraded && card.gradingCompany && (
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {card.gradingCompany} {card.grade}
                </span>
              )}
              <span className={`font-mono text-sm font-bold ${getScoreTextClass(score.overall)}`}>
                {score.overall}
              </span>
              <ChevronRight size={14} className="text-slate-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---- Card Detail Tab ----

const CardDetailTab: React.FC<{
  card: CardInventory;
  onBack: () => void;
}> = ({ card, onBack }) => {
  const score = useMemo(() => calculateAuthScore(card), [card]);
  const cert = useMemo(() => verifyCert(card), [card]);
  const riskFactors = useMemo(() => getRiskFactors(card), [card]);

  const scoreBreakdown: { label: string; value: number; key: keyof AuthScore }[] = [
    { label: 'Cert Validation', value: score.certValidation, key: 'certValidation' },
    { label: 'Grade Consistency', value: score.gradeConsistency, key: 'gradeConsistency' },
    { label: 'Price Analysis', value: score.priceAnomaly, key: 'priceAnomaly' },
    { label: 'Holder Alignment', value: score.holderAlignment, key: 'holderAlignment' },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button + Card Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h3 className="text-lg font-bebas tracking-wider text-white">
            {card.year} {card.manufacturer} {card.player}
          </h3>
          <p className="text-xs text-slate-500">
            #{card.cardNumber} &middot; {card.set}
            {card.isGraded && card.gradingCompany && ` \u00B7 ${card.gradingCompany} ${card.grade}`}
          </p>
        </div>
      </div>

      {/* Score Gauge + Overall */}
      <div className="flex items-center gap-6 p-5 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <ScoreGauge score={score.overall} />
        <div className="flex-1 space-y-3">
          {scoreBreakdown.map(item => (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{item.label}</span>
                <span className={`font-bold ${getScoreTextClass(item.value)}`}>{item.value}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ backgroundColor: getScoreColor(item.value), width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cert Verification */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-blue-400" />
          <span className="text-sm font-bold text-white">Certificate Verification</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Status</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
              cert.status === 'valid'
                ? 'text-green-400 bg-green-500/10 border-green-500/30'
                : cert.status === 'invalid'
                  ? 'text-red-400 bg-red-500/10 border-red-500/30'
                  : 'text-slate-400 bg-slate-500/10 border-slate-500/30'
            }`}>
              {cert.status === 'valid' ? <CheckCircle2 size={12} /> : cert.status === 'invalid' ? <ShieldAlert size={12} /> : <Info size={12} />}
              {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Cert #</p>
            <p className="text-sm text-white font-mono">{cert.certNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Holder Type</p>
            <p className="text-sm text-white capitalize">{cert.holderType}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Label Match</p>
            <span className={`text-sm font-bold ${cert.labelStyleMatch ? 'text-green-400' : 'text-red-400'}`}>
              {cert.labelStyleMatch ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Population */}
        <div className="pt-3 border-t border-slate-700">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Population Check</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">At Grade: <span className="text-white font-bold">{cert.populationCheck.popAtGrade}</span></span>
            <span className="text-slate-400">Higher: <span className="text-white font-bold">{cert.populationCheck.popHigher}</span></span>
            <span className="text-slate-400">Total: <span className="text-white font-bold">{cert.populationCheck.totalPop}</span></span>
          </div>
        </div>

        {/* Notes */}
        <div className="flex items-start gap-2 p-3 bg-slate-700/30 rounded-xl">
          <Info size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">{cert.notes}</p>
        </div>
      </div>

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
            Risk Factors ({riskFactors.length})
          </p>
          {riskFactors.map((factor, i) => {
            const style = getSeverityStyle(factor.severity);
            return (
              <div key={i} className={`p-4 rounded-2xl border space-y-2 ${style.bg} ${style.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className={style.color} />
                    <span className="text-xs font-bold text-white capitalize">
                      {factor.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${style.color}`}>
                    {style.text}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{factor.description}</p>
                <div className="flex items-start gap-2 p-2.5 bg-slate-900/50 rounded-xl">
                  <CheckCircle2 size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-blue-300">{factor.recommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {riskFactors.length === 0 && (
        <div className="flex items-center gap-2 p-4 bg-green-500/5 border border-green-500/15 rounded-xl">
          <ShieldCheck size={16} className="text-green-400" />
          <span className="text-sm text-green-400 font-medium">No risk factors detected for this card.</span>
        </div>
      )}
    </div>
  );
};

// ---- Checklist Tab ----

const ChecklistTab: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState('PSA');
  const checklist = useMemo(() => getAuthChecklist(selectedCompany), [selectedCompany]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (step: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(step)) {
        next.delete(step);
      } else {
        next.add(step);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Grading Company Selector */}
      <div className="flex items-center gap-2">
        {GRADING_COMPANIES.map(company => (
          <button
            key={company}
            onClick={() => { setSelectedCompany(company); setCompletedSteps(new Set()); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              selectedCompany === company
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            {company}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <ClipboardCheck size={18} className="text-blue-400" />
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">Verification Progress</span>
            <span className="text-white font-bold">
              {completedSteps.size} / {checklist.steps.length}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${checklist.steps.length > 0 ? (completedSteps.size / checklist.steps.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Steps */}
      <div className="space-y-3">
        {checklist.steps.map(step => {
          const isComplete = completedSteps.has(step.step);
          return (
            <button
              key={step.step}
              onClick={() => toggleStep(step.step)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                isComplete
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isComplete
                    ? 'bg-green-500 border-green-500'
                    : 'border-slate-600'
                }`}>
                  {isComplete && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isComplete ? 'text-green-400 line-through' : 'text-white'}`}>
                      {step.step}. {step.title}
                    </span>
                    {step.critical && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/30 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                  {step.visualNote && (
                    <div className="flex items-start gap-2 p-2.5 bg-slate-700/30 rounded-xl">
                      <Eye size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-blue-300 leading-relaxed">{step.visualNote}</p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {completedSteps.size === checklist.steps.length && checklist.steps.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-green-500/5 border border-green-500/15 rounded-xl">
          <ShieldCheck size={16} className="text-green-400" />
          <span className="text-sm text-green-400 font-medium">
            All verification steps completed for {selectedCompany}!
          </span>
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const alerts = useMemo(() => getAuthAlerts(cards), [cards]);
  const collectionScore = useMemo(() => getCollectionAuthScore(cards), [cards]);
  const selectedCard = useMemo(
    () => cards.find(c => c.id === selectedCardId) ?? null,
    [cards, selectedCardId]
  );

  const handleSelectCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setActiveTab('detail');
  };

  const handleBackToOverview = () => {
    setSelectedCardId(null);
    setActiveTab('overview');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  collectionScore.overall >= 80
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : collectionScore.overall >= 60
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  <ShieldCheck size={10} />
                  Score: {collectionScore.overall}/100
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Authentication <span className="text-blue-400">Center</span>
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
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'overview') setSelectedCardId(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-400 bg-blue-500/5'
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
          {activeTab === 'overview' && (
            <OverviewTab
              cards={cards}
              alerts={alerts}
              collectionScore={collectionScore}
              onSelectCard={handleSelectCard}
            />
          )}
          {activeTab === 'detail' && selectedCard && (
            <CardDetailTab card={selectedCard} onBack={handleBackToOverview} />
          )}
          {activeTab === 'detail' && !selectedCard && (
            <div className="text-center py-12 space-y-3">
              <Search size={32} className="mx-auto text-slate-600" />
              <p className="text-sm text-slate-500">Select a card from the Overview tab to view its authentication details.</p>
              <button
                onClick={() => setActiveTab('overview')}
                className="text-xs text-blue-400 font-bold hover:underline"
              >
                Go to Overview
              </button>
            </div>
          )}
          {activeTab === 'checklist' && <ChecklistTab />}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
