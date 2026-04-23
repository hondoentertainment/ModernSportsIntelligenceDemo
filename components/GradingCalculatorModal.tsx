// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { X, Award, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { CardInventory } from '../types';

interface GradingCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardInventory;
}

// ─── Fee tables ──────────────────────────────────────────────────────────────

type ServiceTier = { label: string; fee: number };

const FEES: Record<string, ServiceTier[]> = {
  PSA: [
    { label: 'Economy (~45 days)', fee: 22 },
    { label: 'Regular (~20 days)', fee: 50 },
    { label: 'Express (~10 days)', fee: 150 },
    { label: 'Super Express (~5 days)', fee: 300 },
  ],
  BGS: [
    { label: 'Economy (~50 days)', fee: 25 },
    { label: 'Regular (~20 days)', fee: 65 },
    { label: 'Express (~10 days)', fee: 200 },
  ],
  SGC: [
    { label: 'Economy (~45 days)', fee: 18 },
    { label: 'Regular (~15 days)', fee: 40 },
    { label: 'Express (~7 days)', fee: 120 },
  ],
};

// ─── Grade outcome scenarios ──────────────────────────────────────────────────

type GradeScenario = {
  grade: string;
  probability: number; // 0-100
  multiplier: number;  // relative to raw value
};

const SCENARIOS: Record<string, GradeScenario[]> = {
  PSA: [
    { grade: 'PSA 10', probability: 15, multiplier: 3.5 },
    { grade: 'PSA 9',  probability: 35, multiplier: 1.6 },
    { grade: 'PSA 8',  probability: 30, multiplier: 1.15 },
    { grade: 'PSA 7',  probability: 20, multiplier: 0.85 },
  ],
  BGS: [
    { grade: 'BGS 9.5', probability: 10, multiplier: 2.5 },
    { grade: 'BGS 9',   probability: 30, multiplier: 1.5 },
    { grade: 'BGS 8.5', probability: 35, multiplier: 1.2 },
    { grade: 'BGS 8',   probability: 25, multiplier: 1.0 },
  ],
  SGC: [
    { grade: 'SGC 10', probability: 12, multiplier: 2.8 },
    { grade: 'SGC 9',  probability: 35, multiplier: 1.4 },
    { grade: 'SGC 8',  probability: 33, multiplier: 1.1 },
    { grade: 'SGC 7',  probability: 20, multiplier: 0.8 },
  ],
};

const SUBMISSION_URLS: Record<string, string> = {
  PSA: 'https://www.psacard.com/submit',
  BGS: 'https://www.beckett.com/grading',
  SGC: 'https://www.sgccard.com/submit',
};

const SHIPPING_ESTIMATE = 15; // round-trip estimate

// ─── Component ────────────────────────────────────────────────────────────────

export const GradingCalculatorModal: React.FC<GradingCalculatorModalProps> = ({
  isOpen,
  onClose,
  card,
}) => {
  const [company, setCompany] = useState<'PSA' | 'BGS' | 'SGC'>('PSA');
  const [tierIndex, setTierIndex] = useState(0);

  const rawValue = card.currentValue || card.purchasePrice;
  const serviceFee = FEES[company][tierIndex]?.fee ?? FEES[company][0].fee;
  const totalCost = card.purchasePrice + serviceFee + SHIPPING_ESTIMATE;
  const scenarios = SCENARIOS[company];

  const results = useMemo(() =>
    scenarios.map(s => {
      const gradedValue = rawValue * s.multiplier;
      const profit = gradedValue - totalCost;
      const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
      return { ...s, gradedValue, profit, roi };
    }),
    [scenarios, rawValue, totalCost]
  );

  const expectedValue = useMemo(() =>
    results.reduce((sum, r) => sum + r.gradedValue * (r.probability / 100), 0),
    [results]
  );
  const expectedProfit = expectedValue - totalCost;
  const expectedRoi = totalCost > 0 ? (expectedProfit / totalCost) * 100 : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-brand-slate border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-brand-charcoal/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-lime/10 text-brand-lime rounded-2xl">
              <Award size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bebas tracking-widest text-white leading-tight">Grading Premium Calculator</h2>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                {card.player} — {card.year} {card.set}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto no-scrollbar">

          {/* Card basis */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-brand-charcoal/50 border border-slate-800 rounded-2xl">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">Raw / Cost Basis</p>
              <p className="text-sm font-mono font-black text-slate-200">${Math.round(card.purchasePrice).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-brand-charcoal/50 border border-slate-800 rounded-2xl">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">Current Raw Value</p>
              <p className="text-sm font-mono font-black text-brand-lime">${Math.round(rawValue).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-brand-charcoal/50 border border-slate-800 rounded-2xl">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">Condition</p>
              <p className="text-sm font-black text-slate-200">{card.condition || 'Unknown'}</p>
            </div>
          </div>

          {/* Grading company selector */}
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">Grading Company</p>
            <div className="flex gap-3">
              {(['PSA', 'BGS', 'SGC'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => { setCompany(c); setTierIndex(0); }}
                  className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${company === c ? 'bg-brand-lime/10 border-brand-lime/40 text-brand-lime' : 'bg-brand-charcoal/40 border-slate-800 text-brand-muted hover:text-white hover:border-slate-700'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Service tier selector */}
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">Service Tier</p>
            <div className="grid grid-cols-1 gap-2">
              {FEES[company].map((tier, i) => (
                <button
                  key={tier.label}
                  onClick={() => setTierIndex(i)}
                  className={`flex items-center justify-between px-5 py-3 rounded-xl border text-xs transition-all ${tierIndex === i ? 'bg-brand-charcoal border-slate-600 text-white' : 'bg-brand-charcoal/30 border-slate-800 text-brand-muted hover:border-slate-700 hover:text-slate-300'}`}
                >
                  <span className="font-bold">{tier.label}</span>
                  <span className="font-mono font-black">${tier.fee}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Total cost breakdown */}
          <div className="p-5 bg-brand-charcoal/30 border border-slate-800 rounded-2xl space-y-2 text-xs">
            <p className="font-black text-brand-muted uppercase tracking-widest mb-3">Total Cost Basis</p>
            <div className="flex justify-between text-slate-400">
              <span>Purchase price</span>
              <span className="font-mono">${card.purchasePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Grading fee ({company} {FEES[company][tierIndex]?.label.split(' ')[0]})</span>
              <span className="font-mono">${serviceFee}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping (est.)</span>
              <span className="font-mono">${SHIPPING_ESTIMATE}</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between font-black text-white">
              <span>Total in</span>
              <span className="font-mono">${totalCost.toLocaleString()}</span>
            </div>
          </div>

          {/* Grade outcome scenarios */}
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">Grade Outcome Scenarios</p>
            <div className="space-y-2">
              {results.map(r => (
                <div key={r.grade} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center p-4 bg-brand-charcoal/40 border border-slate-800 rounded-2xl">
                  <div>
                    <p className="text-xs font-black text-white">{r.grade}</p>
                    <p className="text-[9px] text-brand-muted">{r.probability}% probability</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-brand-muted uppercase tracking-tighter">Value</p>
                    <p className="text-xs font-mono font-black text-slate-200">${Math.round(r.gradedValue).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-brand-muted uppercase tracking-tighter">Profit</p>
                    <p className={`text-xs font-mono font-black ${r.profit >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                      {r.profit >= 0 ? '+' : ''}${Math.round(r.profit).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {r.roi > 5 ? (
                      <TrendingUp size={14} className="text-brand-green flex-shrink-0" />
                    ) : r.roi < -5 ? (
                      <TrendingDown size={14} className="text-brand-red flex-shrink-0" />
                    ) : (
                      <Minus size={14} className="text-slate-500 flex-shrink-0" />
                    )}
                    <span className={`text-xs font-black ${r.roi > 5 ? 'text-brand-green' : r.roi < -5 ? 'text-brand-red' : 'text-slate-400'}`}>
                      {r.roi >= 0 ? '+' : ''}{Math.round(r.roi)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Value summary */}
          <div className={`p-6 rounded-2xl border ${expectedProfit >= 0 ? 'bg-brand-green/5 border-brand-green/20' : 'bg-brand-red/5 border-brand-red/20'}`}>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4">Expected Value Analysis</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[9px] text-brand-muted uppercase tracking-tighter mb-1">Expected Value</p>
                <p className="text-lg font-mono font-black text-slate-200">${Math.round(expectedValue).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-muted uppercase tracking-tighter mb-1">Expected Profit</p>
                <p className={`text-lg font-mono font-black ${expectedProfit >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                  {expectedProfit >= 0 ? '+' : ''}${Math.round(expectedProfit).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-brand-muted uppercase tracking-tighter mb-1">Expected ROI</p>
                <p className={`text-lg font-mono font-black ${expectedRoi >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                  {expectedRoi >= 0 ? '+' : ''}{Math.round(expectedRoi)}%
                </p>
              </div>
            </div>
            <p className="text-[9px] text-brand-muted mt-4 leading-relaxed">
              Probability-weighted across all grade outcomes. Multipliers reflect typical {company} premium vs. raw market comps. Actual results vary.
            </p>
          </div>

          {/* Submission link */}
          <a
            href={SUBMISSION_URLS[company]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-brand-lime/10 hover:bg-brand-lime/20 border border-brand-lime/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-brand-lime transition-all"
          >
            <ExternalLink size={16} /> Submit to {company}
          </a>

        </div>
      </div>
    </div>
  );
};

export default GradingCalculatorModal;
