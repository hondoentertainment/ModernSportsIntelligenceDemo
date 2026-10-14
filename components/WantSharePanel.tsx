import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { store } from '../lib/dal/syncStore';
import {
  WANT_SHARE_DISCLOSURE,
  decodeWantShare,
  encodeWantShare,
  readActiveWants,
  wantShareHref,
} from '../lib/watchlist/wantShare';

const WantSharePanel: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('want') ?? '';
  const shared = useMemo(() => (token ? decodeWantShare(token) : null), [token]);
  const [mine, setMine] = useState(() => readActiveWants());
  useEffect(() => {
    const refresh = () => setMine(readActiveWants());
    const stopWrite = store.onWrite(refresh);
    const stopStatus = store.onStatusChange(refresh);
    return () => {
      stopWrite();
      stopStatus();
    };
  }, []);
  const href = mine.length ? wantShareHref(window.location.href, encodeWantShare(mine)) : '';

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4" aria-label="Want-list share">
      <h2 className="text-sm font-black uppercase tracking-widest text-white">Want-list share</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{WANT_SHARE_DISCLOSURE}</p>
      {href ? (
        <label className="mt-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
          Read-only link
          <input readOnly value={href} aria-label="Want-list share link" className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 text-xs text-white" />
        </label>
      ) : (
        <p className="mt-3 text-sm text-slate-400">No active want-list rows to share.</p>
      )}
      {token ? (
        <div className="mt-4" aria-label="Shared want list">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Shared want list · read-only</h3>
          {shared ? (
            <ul className="mt-2 space-y-2">
              {shared.map((item, index) => (
                <li key={`${item.player}-${item.year}-${index}`} className="text-sm text-white">
                  {item.player} · {item.year} · max ${item.maxUsd.toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-rose-300" role="alert">This share link could not be read.</p>
          )}
        </div>
      ) : null}
    </section>
  );
};

export default WantSharePanel;
