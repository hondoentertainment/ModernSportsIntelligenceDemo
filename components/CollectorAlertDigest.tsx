import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { store } from '../lib/dal/syncStore';
import {
  ALERT_DIGEST_DISCLOSURE,
  loadCollectorAlertDigest,
  type DigestRow,
} from '../lib/alerts/collectorAlertDigest';

function Rows({ rows }: { rows: DigestRow[] }) {
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.id} className="rounded-lg border border-slate-800 px-3 py-2">
          <p className="text-sm text-white">{row.title}</p>
          <p className="text-xs text-slate-400">{row.detail}</p>
          <Link to={row.href} className="inline-flex min-h-[44px] items-center text-xs text-brand-lime">Open</Link>
        </li>
      ))}
    </ul>
  );
}

const CollectorAlertDigest: React.FC = () => {
  const digest = useMemo(() => loadCollectorAlertDigest(store.get('cardx_targets', [])), []);
  return (
    <section className="rounded-2xl border border-slate-800 bg-brand-slate p-4" aria-label="Watchlist and show alert digest">
      <h2 className="text-sm font-black uppercase tracking-widest text-white">Watchlist and show digest</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{ALERT_DIGEST_DISCLOSURE}</p>
      <h3 className="mt-4 text-xs font-black uppercase tracking-widest text-emerald-200">Price drops</h3>
      {digest.drops.length === 0
        ? <p className="mt-1 text-sm text-slate-400">No watchlist mark is 5% or more under your target.</p>
        : <Rows rows={digest.drops} />}
      <h3 className="mt-4 text-xs font-black uppercase tracking-widest text-amber-200">Shows inside your radius</h3>
      {!digest.showAlertsArmed
        ? <p className="mt-1 text-sm text-slate-400">Show alerts are off. Set a home radius on local card shows.</p>
        : digest.shows.length === 0
          ? <p className="mt-1 text-sm text-slate-400">No seeded show is inside that radius and lead time.</p>
          : <Rows rows={digest.shows} />}
    </section>
  );
};

export default CollectorAlertDigest;
