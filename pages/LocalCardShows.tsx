import React, { Suspense, lazy, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, ShoppingBag, Scale, BadgePercent } from 'lucide-react';
import type { Sport } from '../types';
import { preferRealCompsWhenConfigured } from '../lib/featureFlags';
import { useSupabaseInventory } from '../lib/utils/useSupabaseInventory';
import { buildShowBag } from '../lib/utils/showBag';
import { formatShowDateRange } from '../lib/shows/localCardShowCatalog';
import {
  SHOW_BUYING_DESK_DISCLOSURE,
  assembleShowBuyingDesk,
  opportunityLabel,
  verdictLabel,
  type ShowBagHint,
  type ShowVerdict,
} from '../lib/shows/showBuyingDesk';
import { buildTripBudget, formatTripUsd, toTripLine } from '../lib/shows/showTripLoop';
import ShowTripLoopPanel from '../components/ShowTripLoopPanel';

const loadShowDesk = () => import('../components/showDeskPanels');
const ShowAlertDesk = lazy(() => loadShowDesk().then((mod) => ({ default: mod.ShowAlertDesk })));
const ShowShoppingList = lazy(() => loadShowDesk().then((mod) => ({ default: mod.ShowShoppingList })));

type AlertHome = { label: string; lat: number; lng: number };

const SPORTS: Array<Sport | 'all'> = ['all', 'Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];

function verdictClass(verdict: ShowVerdict): string {
  if (verdict === 'buy-at-show') return 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
  if (verdict === 'worth-attending') return 'text-amber-200 border-amber-500/40 bg-amber-500/10';
  if (verdict === 'sell-into-show') return 'text-sky-200 border-sky-500/40 bg-sky-500/10';
  if (verdict === 'watch') return 'text-slate-200 border-slate-600 bg-slate-800/60';
  return 'text-slate-500 border-slate-800 bg-slate-900/40';
}

const LocalCardShows: React.FC = () => {
  const { inventory, targets, addCard, updateCard } = useSupabaseInventory();
  const [cityQuery, setCityQuery] = useState('');
  const [openShowId, setOpenShowId] = useState<string | null>(null);
  const [sport, setSport] = useState<Sport | 'all'>('all');
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [geoNote, setGeoNote] = useState('Location off — distance unknown. Ranking uses dates and your book.');
  const [geoState, setGeoState] = useState<'idle' | 'pending' | 'ready' | 'denied'>('idle');

  const applyAlertHome = (home: AlertHome | null) => {
    if (!home) {
      setGeo(null);
      setGeoState('idle');
      setGeoNote('Alert home cleared. Distance is unknown until you pick a city or use location.');
      return;
    }
    setGeo({ lat: home.lat, lng: home.lng });
    setGeoState('ready');
    setGeoNote(`Alert home is ${home.label}. Ranking uses that point. The show list is still the seeded calendar.`);
  };
  const liveTape = preferRealCompsWhenConfigured();

  const showBagItems = useMemo<ShowBagHint[]>(() => {
    try {
      return buildShowBag({ inventory, targets }).items.map((item) => ({
        id: item.id,
        label: item.label,
        section: item.section,
        packed: item.packed,
      }));
    } catch {
      return [];
    }
  }, [inventory, targets]);

  const report = useMemo(
    () => assembleShowBuyingDesk({
      inventory,
      targets,
      showBagItems,
      geo,
      cityQuery,
      sport,
      liveTape,
    }),
    [inventory, targets, showBagItems, geo, cityQuery, sport, liveTape],
  );

  const requestGeo = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeo(null);
      setGeoState('denied');
      setGeoNote('This browser has no location API. Pick a city or browse the full seeded calendar.');
      return;
    }
    setGeoState('pending');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeo({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoState('ready');
        setGeoNote('Using this browser’s location for nearby vs regional. The show list is still the seeded calendar.');
      },
      () => {
        setGeo(null);
        setGeoState('denied');
        setGeoNote('Location unavailable. Shows stay listed by date and collection match — distance is unknown.');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/20 p-2">
            <MapPin size={24} className="text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Local card shows</h1>
            <p className="text-sm text-slate-400">
              Venues and buy calls, then a trip budget, floor log, and recap back into the book.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/card-show-mode"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-xs font-bold text-slate-100"
          >
            <ShoppingBag size={14} className="text-emerald-300" />
            Show bag & floor
          </Link>
          <Link
            to="/collection"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-xs font-bold text-slate-100"
          >
            Collection
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3" aria-label="Show calendar disclosure">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Seeded calendar · {report.tapeLabel}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-amber-50/90">{SHOW_BUYING_DESK_DISCLOSURE}</p>
        <p className="mt-2 text-[11px] text-amber-100/80">{geoNote}</p>
      </section>

      <Suspense fallback={null}>
        <ShowAlertDesk onHomeChange={applyAlertHome} />
      </Suspense>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <label className="flex-1 text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor="local-show-city">
          City or venue
          <input
            id="local-show-city"
            value={cityQuery}
            onChange={(event) => setCityQuery(event.target.value)}
            placeholder="Dallas, NY, convention…"
            autoComplete="off"
            className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-base font-medium normal-case tracking-normal text-white md:text-sm"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor="local-show-sport">
          Sport
          <select
            id="local-show-sport"
            value={sport}
            onChange={(event) => setSport(event.target.value as Sport | 'all')}
            className="mt-1 w-full min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-base font-medium normal-case tracking-normal text-white md:w-40 md:text-sm"
          >
            {SPORTS.map((option) => (
              <option key={option} value={option}>{option === 'all' ? 'All sports' : option}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={requestGeo}
          disabled={geoState === 'pending'}
          aria-pressed={geoState === 'ready'}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-100 disabled:opacity-60"
        >
          <Navigation size={14} />
          {geoState === 'pending' ? 'Locating…' : geoState === 'ready' ? 'Location on' : 'Use my location'}
        </button>
      </div>

      {report.headline && (
        <p className="text-xs text-slate-400">
          Top call: <span className="text-white">{report.headline.show.name}</span>
          {' · '}
          {verdictLabel(report.headline.verdict)}
          {' · '}
          {report.opportunityCount} buying {report.opportunityCount === 1 ? 'opportunity' : 'opportunities'} on this list
        </p>
      )}

      {report.emptyReason ? (
        <p className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-6 text-sm text-slate-400">{report.emptyReason}</p>
      ) : (
        <ul className="space-y-4">
          {report.shows.map((row, index) => {
            const fallbackSport = row.show.sports.length === 1 ? row.show.sports[0] : null;
            const tripNeed = buildTripBudget({
              showId: row.show.id,
              admissionUsd: row.show.admissionUsd,
              distanceMiles: row.distanceMiles,
              items: row.opportunities.map((opportunity) => toTripLine(opportunity, inventory, targets, fallbackSport)),
            }).netNeedUsd;
            const tripOpen = (openShowId ?? report.shows[0]?.show.id) === row.show.id;
            return (
            <li key={row.show.id} className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-lg font-semibold text-white">{row.show.name}</h2>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${verdictClass(row.verdict)}`}>
                      {verdictLabel(row.verdict)} · {row.worthAttendingScore}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">
                    {row.show.venue} · {row.show.city}, {row.show.state}
                  </p>
                  <p className="font-mono text-xs text-slate-400">
                    {formatShowDateRange(row.show)}
                    {row.show.status === 'in-progress' ? ' · open now' : ''}
                    {' · '}
                    {row.distanceMiles == null ? 'distance unknown' : `${row.distanceMiles.toFixed(0)} mi (${row.geoStatus})`}
                    {' · '}
                    ${row.show.admissionUsd} admission · {row.show.vendorCount} dealers
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {row.show.sports.join(' · ')} · {row.show.tableStyle} · {row.show.notes}
                  </p>
                </div>
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {row.reasons.map((reason) => (
                  <li key={reason} className="rounded-lg bg-slate-800/80 px-2 py-1 text-[11px] text-slate-300">
                    {reason}
                  </li>
                ))}
              </ul>
              {row.opportunities.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {row.opportunities.slice(0, 4).map((opportunity) => (
                    <li key={opportunity.id} className="rounded-xl border border-slate-800 bg-brand-slate/20 px-3 py-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm text-white">
                          {opportunity.player}
                          <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {opportunityLabel(opportunity.kind)}
                          </span>
                        </p>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
                          {opportunity.tapeLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{opportunity.detail}</p>
                      {(opportunity.askPrice != null || opportunity.consensusMark != null) && (
                        <p className="mt-1 font-mono text-xs text-slate-300">
                          {opportunity.askPrice != null ? `Ask $${Math.round(opportunity.askPrice).toLocaleString()}` : 'No ask'}
                          {opportunity.consensusMark != null ? ` · mark $${Math.round(opportunity.consensusMark).toLocaleString()}` : ''}
                          {opportunity.discountPct != null ? ` · ${opportunity.discountPct.toFixed(1)}%` : ''}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{opportunity.why}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {opportunity.compsHref && (
                          <Link to={opportunity.compsHref} className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-[10px] font-black uppercase tracking-widest text-brand-lime">
                            <Scale size={12} aria-hidden /> Comps
                          </Link>
                        )}
                        <Link to={opportunity.collectionHref} className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-[10px] font-black uppercase tracking-widest text-brand-lime">
                          <BadgePercent size={12} aria-hidden /> Collection
                        </Link>
                        <Link to={opportunity.showBagHref} className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-[10px] font-black uppercase tracking-widest text-brand-lime">
                          <ShoppingBag size={12} aria-hidden /> Show bag
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Suspense fallback={null}>
                <ShowShoppingList
                  show={row.show}
                  inventory={inventory}
                  targets={targets}
                  liveTape={liveTape}
                  disclose={index === 0}
                  onFileBuy={addCard}
                />
              </Suspense>
              <p className="mt-3 text-[11px] text-slate-400">
                Trip need {formatTripUsd(tripNeed)} · admission, travel stub, buy reserve, and sell credit.
              </p>
              <button
                type="button"
                aria-expanded={tripOpen}
                onClick={() => setOpenShowId(tripOpen ? '' : row.show.id)}
                className="mt-2 inline-flex min-h-[44px] items-center rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-100"
              >
                {tripOpen ? 'Hide trip loop' : 'Plan trip, floor, and recap'}
              </button>
              {tripOpen && (
                <ShowTripLoopPanel
                  showId={row.show.id}
                  showName={row.show.name}
                  admissionUsd={row.show.admissionUsd}
                  distanceMiles={row.distanceMiles}
                  purchaseDate={row.show.endDate}
                  opportunities={row.opportunities}
                  inventory={inventory}
                  targets={targets}
                  show={row.show}
                  liveTape={liveTape}
                  fallbackSport={fallbackSport}
                  onFileBuy={addCard}
                  onRecordSale={updateCard}
                />
              )}
            </li>
          );
          })}
        </ul>
      )}
    </div>
  );
};

export default LocalCardShows;
