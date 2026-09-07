import React, { useMemo } from 'react';
import type { CardInventory } from '../types';
import { getPlayerSeasonalHint } from '../lib/analytics/seasonalWindowSignals';

const SeasonalWindowChip: React.FC<{ card: CardInventory }> = ({ card }) => {
  const hint = useMemo(() => getPlayerSeasonalHint(card), [card]);
  const tone =
    hint.windowType === 'buy'
      ? 'bg-brand-lime/15 text-brand-lime border-brand-lime/30'
      : hint.windowType === 'sell'
        ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
        : 'bg-slate-800 text-slate-400 border-slate-700';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${tone}`}
      title={hint.rationale}
    >
      {hint.windowType} · {hint.eventLabel}
    </span>
  );
};

export default SeasonalWindowChip;
