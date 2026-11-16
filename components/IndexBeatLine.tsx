import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CardInventory } from '../types';
import { store } from '../lib/dal/syncStore';
import { INDEX_BEAT_NOTE, indexBeat, type IndexBeat } from '../lib/analytics/indexBeat';

interface Props {
  inventory: readonly CardInventory[];
  ids?: readonly string[];
}

function sameBeat(prev: IndexBeat, next: IndexBeat): boolean {
  return prev.copy === next.copy
    && prev.call === next.call
    && prev.alert?.copy === next.alert?.copy
    && prev.alert?.href === next.alert?.href;
}

const IndexBeatLine: React.FC<Props> = ({ inventory, ids }) => {
  const [beat, setBeat] = useState(() => indexBeat(inventory, ids));
  useEffect(() => {
    const refresh = () => {
      const next = indexBeat(inventory, ids);
      setBeat((prev) => (sameBeat(prev, next) ? prev : next));
    };
    refresh();
    const stopWrite = store.onWrite(refresh);
    const stopStatus = store.onStatusChange(refresh);
    return () => {
      stopWrite();
      stopStatus();
    };
  }, [inventory, ids]);
  const label = beat.scoped ? 'Favorites index beat' : 'Index beat';
  return (
    <div className="mt-3">
      <p className="text-xs leading-relaxed text-slate-200" aria-label={label}>{beat.copy}</p>
      {beat.alert ? (
        <p className="mt-1 text-xs leading-relaxed text-amber-100" aria-label={`${label} alert`}>{beat.alert.copy}</p>
      ) : null}
      {beat.alert ? (
        <Link to={beat.alert.href} className="inline-flex min-h-[44px] items-center text-xs text-brand-lime">
          Open the index beat for {beat.alert.player}
        </Link>
      ) : null}
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{INDEX_BEAT_NOTE}</p>
    </div>
  );
};

export default IndexBeatLine;
