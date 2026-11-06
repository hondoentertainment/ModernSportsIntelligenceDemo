import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CardInventory } from '../types';
import { store } from '../lib/dal/syncStore';
import {
  HOLD_CALL_ALERT_NOTE,
  loadHoldCallAlerts,
  type HoldCallAlert,
} from '../lib/collector/holdCallAlert';

interface Props {
  inventory?: CardInventory[];
  rows?: HoldCallAlert[];
}

const HoldCallAlerts: React.FC<Props> = ({ inventory = [], rows }) => {
  const [live, setLive] = useState<HoldCallAlert[]>(() => rows ?? loadHoldCallAlerts(inventory));
  useEffect(() => {
    if (rows) {
      setLive(rows);
      return;
    }
    const refresh = () => setLive(loadHoldCallAlerts(inventory));
    refresh();
    const stopWrite = store.onWrite(refresh);
    const stopStatus = store.onStatusChange(refresh);
    return () => {
      stopWrite();
      stopStatus();
    };
  }, [inventory, rows]);
  return (
    <section className="rounded-2xl border border-slate-800 bg-brand-slate p-4" aria-label="Hold call alerts">
      <h3 className="text-xs font-black uppercase tracking-widest text-amber-100">Hold call</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{HOLD_CALL_ALERT_NOTE}</p>
      {live.length === 0 ? (
        <p className="mt-1 text-sm text-slate-400">No unsold card is in the hold window, newly long-term, or under the card-show fee.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {live.map(row => (
            <li key={row.id} className="rounded-lg border border-slate-800 px-3 py-2">
              <p className="text-sm text-white">{row.title}</p>
              <p className="text-xs text-slate-400">{row.detail}</p>
              <Link to={row.href} className="inline-flex min-h-[44px] items-center text-xs text-brand-lime">
                Open {row.player}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default HoldCallAlerts;
