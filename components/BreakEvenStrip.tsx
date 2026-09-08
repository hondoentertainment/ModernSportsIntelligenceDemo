import React, { useMemo, useState } from 'react';
import { DollarSign } from 'lucide-react';
import type { CardInventory } from '../types';
import {
  BREAK_EVEN_STRIP_DISCLOSURE,
  BREAK_EVEN_STRIP_PRESETS,
  MARKETPLACE_FEES,
  calculateBreakEven,
  type BreakEvenStripPreset,
} from '../lib/analytics/breakEvenService';

interface Props {
  card: CardInventory;
  compact?: boolean;
  onOpenFull?: (_card: CardInventory) => void;
}

const BreakEvenStrip: React.FC<Props> = ({ card, compact, onOpenFull }) => {
  const [preset, setPreset] = useState<BreakEvenStripPreset>('ebay');
  const [customRatePct, setCustomRatePct] = useState(10);
  const custom = { rate: customRatePct / 100, fixed: 0 };
  const result = useMemo(
    () => calculateBreakEven(card, preset, 0, preset === 'custom' ? custom : undefined),
    [card, preset, customRatePct],
  );
  const fee = MARKETPLACE_FEES[preset] || MARKETPLACE_FEES.ebay;

  return (
    <section
      className={compact
        ? 'rounded-xl border border-slate-800/60 bg-brand-charcoal/40 p-3'
        : 'rounded-2xl border border-slate-800 bg-brand-charcoal/40 p-4'}
      aria-label="Fee-aware break-even"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <DollarSign size={14} className="text-amber-300" aria-hidden />
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            Break-even sale
          </p>
        </div>
        {onOpenFull && (
          <button
            type="button"
            onClick={() => onOpenFull(card)}
            className="text-[10px] font-black uppercase tracking-widest text-brand-lime"
          >
            Full calculator
          </button>
        )}
      </div>
      {!compact && <p className="mb-3 text-[11px] leading-relaxed text-slate-500">{BREAK_EVEN_STRIP_DISCLOSURE}</p>}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {BREAK_EVEN_STRIP_PRESETS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setPreset(key)}
            className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
              preset === key
                ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800'
            }`}
          >
            {MARKETPLACE_FEES[key].label}
          </button>
        ))}
      </div>
      {preset === 'custom' && (
        <label className="mb-3 flex items-center justify-between gap-3 text-[11px] text-slate-400">
          Custom fee %
          <input
            type="number"
            min={0}
            max={99}
            step={0.1}
            value={customRatePct}
            onChange={(e) => setCustomRatePct(Number(e.target.value) || 0)}
            aria-label="Custom marketplace fee percent"
            className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-slate-200"
          />
        </label>
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-sm text-white">
          ${result.breakEvenPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
        <p className={`text-[11px] font-medium ${result.currentProfit >= 0 ? 'text-emerald-400' : 'text-rose-300'}`}>
          {result.currentProfit >= 0 ? 'Above' : 'Below'} at mark · {result.currentROI.toFixed(0)}% ROI
        </p>
      </div>
      <p className="mt-1 text-[10px] text-slate-500">
        {fee.label} {preset === 'custom' ? `${customRatePct}%` : `${(fee.rate * 100).toFixed(1)}%`}
        {fee.fixed > 0 ? ` + $${fee.fixed.toFixed(2)}` : ''} · purchase + grading + shipping
      </p>
    </section>
  );
};

export default BreakEvenStrip;
