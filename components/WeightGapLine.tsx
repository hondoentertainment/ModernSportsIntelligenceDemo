import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CardInventory } from '../types';
import { store } from '../lib/dal/syncStore';
import { WEIGHT_GAP_NOTE, weightGap, type WeightGap } from '../lib/analytics/weightGap';

interface Props {
  inventory: readonly CardInventory[];
  ids?: readonly string[];
}

function sameGap(prev: WeightGap, next: WeightGap): boolean {
  return prev.copy === next.copy
    && prev.call === next.call
    && prev.alert?.copy === next.alert?.copy
    && prev.alert?.href === next.alert?.href;
}

const WeightGapLine: React.FC<Props> = ({ inventory, ids }) => {
  const [gap, setGap] = useState(() => weightGap(inventory, ids));
  useEffect(() => {
    const refresh = () => {
      const next = weightGap(inventory, ids);
      setGap((prev) => (sameGap(prev, next) ? prev : next));
    };
    refresh();
    const stopWrite = store.onWrite(refresh);
    const stopStatus = store.onStatusChange(refresh);
    return () => {
      stopWrite();
      stopStatus();
    };
  }, [inventory, ids]);
  const label = gap.scoped ? 'Favorites weight gap' : 'Weight gap';
  return (
    <div className="mt-3">
      <p className="text-xs leading-relaxed text-slate-200" aria-label={label}>{gap.copy}</p>
      {gap.alert ? (
        <p className="mt-1 text-xs leading-relaxed text-amber-100" aria-label={`${label} alert`}>{gap.alert.copy}</p>
      ) : null}
      {gap.alert ? (
        <Link to={gap.alert.href} className="inline-flex min-h-[44px] items-center text-xs text-brand-lime">
          Open the weight gap for {gap.alert.player}
        </Link>
      ) : null}
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{WEIGHT_GAP_NOTE}</p>
    </div>
  );
};

export default WeightGapLine;
