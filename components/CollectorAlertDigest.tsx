import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CardInventory, TargetWatchlist } from '../types';
import type { HoleTarget } from '../lib/collector/floorPack';
import { store } from '../lib/dal/syncStore';
import {
  ALERT_DIGEST_DISCLOSURE,
  loadCollectorAlertDigest,
  type DigestRow,
} from '../lib/alerts/collectorAlertDigest';
import { SALE_RANGE_BLURB } from '../lib/collector/saleRange';
import type { FollowUp } from '../lib/collector/showClose';

interface Props {
  inventory?: CardInventory[];
  targets?: TargetWatchlist[];
  onWatch?: (draft: HoleTarget) => void;
}

function Rows({ rows }: { rows: DigestRow[] }) {
  return (
    <ul className="space-y-2">
      {rows.map(row => (
        <li key={row.id} className="rounded-lg border border-slate-800 px-3 py-2">
          <p className="text-sm text-white">{row.title}</p>
          <p className="text-xs text-slate-400">{row.detail}</p>
          <Link to={row.href} className="inline-flex min-h-[44px] items-center text-xs text-brand-lime">Open</Link>
        </li>
      ))}
    </ul>
  );
}

function FollowRows({ rows, onWatch }: { rows: FollowUp[]; onWatch?: (draft: HoleTarget) => void }) {
  const [pending, setPending] = useState<string | null>(null);
  return (
    <ul className="space-y-2">
      {rows.map(row => (
        <li key={row.id} className="rounded-lg border border-slate-800 px-3 py-2">
          <p className="text-sm text-white">{row.title}</p>
          <p className="text-xs text-slate-400">{row.detail}</p>
          <Link to={row.href} className="inline-flex min-h-[44px] items-center text-xs text-brand-lime">Show desk</Link>
          {row.kind === 'revisit' && row.watch && onWatch ? (
            <button
              type="button"
              disabled={pending === row.id}
              onClick={() => {
                const draft = row.watch;
                if (!draft) return;
                setPending(row.id);
                void Promise.resolve(onWatch(draft)).finally(() => setPending(null));
              }}
              className="ml-2 inline-flex min-h-[44px] items-center rounded-lg border border-amber-500/40 px-3 text-xs font-bold text-amber-100 disabled:opacity-50"
            >
              {pending === row.id ? 'Watching…' : `Watch ${row.watch.player}`}
            </button>
          ) : null}
          {row.watched ? (
            <p className="text-xs text-emerald-300">On the watchlist.</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

const CollectorAlertDigest: React.FC<Props> = ({ inventory = [], targets, onWatch }) => {
  const [digest, setDigest] = useState(() => loadCollectorAlertDigest(
    targets ?? store.get('cardx_targets', []),
    new Date(),
    inventory,
  ));
  useEffect(() => {
    const refresh = () => setDigest(loadCollectorAlertDigest(
      targets ?? store.get('cardx_targets', []),
      new Date(),
      inventory,
    ));
    refresh();
    const stopWrite = store.onWrite(refresh);
    const stopStatus = store.onStatusChange(refresh);
    return () => {
      stopWrite();
      stopStatus();
    };
  }, [targets, inventory]);
  return (
    <section className="rounded-2xl border border-slate-800 bg-brand-slate p-4" aria-label="Watchlist and show alert digest">
      <h2 className="text-sm font-black uppercase tracking-widest text-white">Watchlist and show digest</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{ALERT_DIGEST_DISCLOSURE}</p>
      <h3 className="mt-4 text-xs font-black uppercase tracking-widest text-emerald-200">Price drops</h3>
      {digest.drops.length === 0
        ? <p className="mt-1 text-sm text-slate-400">No watchlist mark is 5% or more under your target.</p>
        : <Rows rows={digest.drops} />}
      <h3 className="mt-4 text-xs font-black uppercase tracking-widest text-cyan-200">Target versus the sale range</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{SALE_RANGE_BLURB}</p>
      {digest.ranges.length === 0
        ? <p className="mt-1 text-sm text-slate-400">No active target has stored sales or a local mark to place.</p>
        : <Rows rows={digest.ranges} />}
      {digest.rangeOmitted > 0 ? (
        <p className="mt-1 text-xs text-slate-500">
          {digest.rangeOmitted} more {digest.rangeOmitted === 1 ? 'target stays' : 'targets stay'} off this list.
        </p>
      ) : null}
      <h3 className="mt-4 text-xs font-black uppercase tracking-widest text-amber-200">Shows inside your radius</h3>
      {!digest.showAlertsArmed
        ? <p className="mt-1 text-sm text-slate-400">Show alerts are off. Set a home radius on local card shows.</p>
        : digest.shows.length === 0
          ? <p className="mt-1 text-sm text-slate-400">No seeded show is inside that radius and lead time.</p>
          : <Rows rows={digest.shows} />}
      <h3 className="mt-4 text-xs font-black uppercase tracking-widest text-sky-200">From the show floor</h3>
      {digest.follows.length === 0
        ? <p className="mt-1 text-sm text-slate-400">No open table note, and no passed ask under a local mark.</p>
        : <FollowRows rows={digest.follows} onWatch={onWatch} />}
    </section>
  );
};

export default CollectorAlertDigest;
