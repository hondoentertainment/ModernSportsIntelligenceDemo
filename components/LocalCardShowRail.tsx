import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { CardInventory, TargetWatchlist } from '../types';
import { preferRealCompsWhenConfigured } from '../lib/featureFlags';
import { formatShowDateRange } from '../lib/shows/localCardShowCatalog';
import {
  SHOW_BUYING_DESK_DISCLOSURE,
  assembleShowBuyingDesk,
  verdictLabel,
} from '../lib/shows/showBuyingDesk';

interface Props {
  inventory: CardInventory[];
  targets?: TargetWatchlist[];
  compact?: boolean;
}

const LocalCardShowRail: React.FC<Props> = ({ inventory, targets = [], compact }) => {
  const liveTape = preferRealCompsWhenConfigured();
  const report = useMemo(
    () => assembleShowBuyingDesk({ inventory, targets, liveTape }),
    [inventory, targets, liveTape],
  );
  const rows = (report.shows.filter((row) => row.verdict !== 'skip').slice(0, compact ? 2 : 3));
  const visible = rows.length > 0 ? rows : report.shows.slice(0, compact ? 2 : 3);

  return (
    <section
      className={
        compact
          ? 'rounded-xl border border-amber-500/20 bg-brand-charcoal/40 p-3'
          : 'rounded-2xl border border-amber-500/20 bg-brand-charcoal/60 p-5 md:p-6'
      }
      aria-label="Local card shows"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-amber-300" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-white">Local card shows</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
              Seeded calendar · {report.tapeLabel} · trip and recap
            </p>
          </div>
        </div>
        <Link
          to="/local-card-shows"
          className="inline-flex min-h-[44px] shrink-0 items-center rounded-lg px-2 text-[10px] font-black uppercase tracking-widest text-brand-lime"
        >
          Show desk
        </Link>
      </div>
      {!compact && (
        <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{SHOW_BUYING_DESK_DISCLOSURE}</p>
      )}
      {visible.length === 0 ? (
        <p className="text-[11px] text-slate-500">{report.emptyReason ?? 'No seeded shows to rank.'}</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((row) => (
            <li key={row.show.id} className="rounded-xl border border-slate-800/80 bg-brand-slate/30 px-3 py-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-white">{row.show.name}</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
                  {verdictLabel(row.verdict)} · {row.worthAttendingScore}
                </span>
              </div>
              <p className="font-mono text-xs text-slate-300">
                {row.show.city}, {row.show.state} · {formatShowDateRange(row.show)}
                {row.distanceMiles == null ? ' · distance unknown' : ` · ${row.distanceMiles.toFixed(0)} mi`}
              </p>
              {!compact && row.opportunities[0] && (
                <p className="mt-1 text-[11px] text-slate-500">
                  {row.opportunities[0].player}: {row.opportunities[0].why}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default LocalCardShowRail;
