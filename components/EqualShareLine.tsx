import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CardInventory } from '../types';
import { store } from '../lib/dal/syncStore';
import { EQUAL_SHARE_NOTE, equalShare, type EqualShare } from '../lib/analytics/equalShare';

interface Props {
  inventory: readonly CardInventory[];
  ids?: readonly string[];
}

function sameShare(prev: EqualShare, next: EqualShare): boolean {
  return prev.copy === next.copy
    && prev.call === next.call
    && prev.alert?.copy === next.alert?.copy
    && prev.alert?.href === next.alert?.href;
}

const EqualShareLine: React.FC<Props> = ({ inventory, ids }) => {
  const [share, setShare] = useState(() => equalShare(inventory, ids));
  useEffect(() => {
    const refresh = () => {
      const next = equalShare(inventory, ids);
      setShare((prev) => (sameShare(prev, next) ? prev : next));
    };
    refresh();
    const stopWrite = store.onWrite(refresh);
    const stopStatus = store.onStatusChange(refresh);
    return () => {
      stopWrite();
      stopStatus();
    };
  }, [inventory, ids]);
  const label = share.scoped ? 'Favorites equal share' : 'Equal share';
  return (
    <div className="mt-3">
      <p className="text-xs leading-relaxed text-slate-200" aria-label={label}>{share.copy}</p>
      {share.alert ? (
        <p className="mt-1 text-xs leading-relaxed text-amber-100" aria-label={`${label} alert`}>{share.alert.copy}</p>
      ) : null}
      {share.alert ? (
        <Link to={share.alert.href} className="inline-flex min-h-[44px] items-center text-xs text-brand-lime">
          Open the equal share for {share.alert.player}
        </Link>
      ) : null}
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{EQUAL_SHARE_NOTE}</p>
    </div>
  );
};

export default EqualShareLine;
