import React, { useEffect, useMemo, useState } from 'react';
import { Bell, MapPin } from 'lucide-react';
import { listResolvedLocalCardShows } from '../lib/shows/localCardShowCatalog';
import {
  SHOW_ALERT_DISCLOSURE,
  getShowAlertPrefs,
  listShowHomePresets,
  markShowAlertRead,
  setShowAlertPrefs,
  syncShowAlerts,
  type ShowAlertHome,
  type ShowAlertPrefs,
  type ShowAlertRecord,
} from '../lib/shows/showAlerts';

interface Props {
  onHomeChange?: (home: ShowAlertHome | null) => void;
}

const ShowAlertDesk: React.FC<Props> = ({ onHomeChange }) => {
  const [prefs, setPrefs] = useState<ShowAlertPrefs>(() => getShowAlertPrefs());
  const [active, setActive] = useState<ShowAlertRecord[]>([]);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [createdCount, setCreatedCount] = useState(0);
  const [geoNote, setGeoNote] = useState('');
  const [radiusDraft, setRadiusDraft] = useState(() => String(getShowAlertPrefs().radiusMiles));
  const [leadDraft, setLeadDraft] = useState(() => String(getShowAlertPrefs().leadDays));
  const shows = useMemo(() => listResolvedLocalCardShows(), []);
  const presets = useMemo(() => listShowHomePresets(), []);
  const homeOptions = useMemo(() => {
    if (prefs.home && !presets.some((row) => row.label === prefs.home?.label)) {
      return [prefs.home, ...presets];
    }
    return presets;
  }, [prefs.home, presets]);

  const apply = (partial: Partial<ShowAlertPrefs>) => {
    setPrefs(setShowAlertPrefs(partial));
  };

  useEffect(() => {
    const result = syncShowAlerts({ shows, prefs });
    setActive(result.active);
    setDeliveryNote(result.deliveryNote);
    setCreatedCount(result.created.length);
  }, [shows, prefs]);

  const saveBrowserHome = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoNote('This browser has no location API. Pick a home city instead.');
      return;
    }
    setGeoNote('Locating…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const home: ShowAlertHome = {
          label: 'This browser’s location',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const next = setShowAlertPrefs({ home });
        setPrefs(next);
        setGeoNote('Saved this browser’s location as the alert home. The seeded calendar did not change.');
        onHomeChange?.(home);
      },
      () => {
        setGeoNote('Location unavailable. Pick a home city from the seeded list.');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
  };

  const unread = active.filter((row) => !row.isRead).length;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-5" aria-label="Show alerts">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-amber-200" aria-hidden />
        <h2 className="text-sm font-semibold text-white">Show alerts</h2>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{SHOW_ALERT_DISCLOSURE}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Show alert home
          <select
            value={prefs.home?.label ?? ''}
            onChange={(event) => {
              const label = event.target.value;
              if (!label) {
                apply({ home: null });
                onHomeChange?.(null);
                return;
              }
              const home = homeOptions.find((row) => row.label === label) ?? null;
              apply({ home });
              onHomeChange?.(home);
            }}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium normal-case tracking-normal text-white"
          >
            <option value="">Choose a home city</option>
            {homeOptions.map((row) => (
              <option key={row.label} value={row.label}>{row.label}</option>
            ))}
          </select>
        </label>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Alert radius (miles)
          <input
            type="number"
            min={5}
            max={500}
            inputMode="numeric"
            value={radiusDraft}
            onChange={(event) => {
              const raw = event.target.value;
              setRadiusDraft(raw);
              const next = Number(raw);
              if (Number.isInteger(next) && next >= 5 && next <= 500) apply({ radiusMiles: next });
            }}
            onBlur={() => {
              const next = setShowAlertPrefs({ radiusMiles: Number(radiusDraft) });
              setPrefs(next);
              setRadiusDraft(String(next.radiusMiles));
            }}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium normal-case tracking-normal text-white"
          />
        </label>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Days before the show
          <input
            type="number"
            min={1}
            max={366}
            inputMode="numeric"
            value={leadDraft}
            onChange={(event) => {
              const raw = event.target.value;
              setLeadDraft(raw);
              const next = Number(raw);
              if (Number.isInteger(next) && next >= 1 && next <= 366) apply({ leadDays: next });
            }}
            onBlur={() => {
              const next = setShowAlertPrefs({ leadDays: Number(leadDraft) });
              setPrefs(next);
              setLeadDraft(String(next.leadDays));
            }}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium normal-case tracking-normal text-white"
          />
        </label>
        <label className="flex items-center gap-2 self-end text-sm text-slate-200">
          <input
            type="checkbox"
            checked={prefs.enabled}
            onChange={(event) => apply({ enabled: event.target.checked })}
          />
          Enable show alerts
        </label>
      </div>
      <button
        type="button"
        onClick={saveBrowserHome}
        className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-xs font-bold text-slate-100"
      >
        <MapPin size={14} aria-hidden />
        Save browser location as home
      </button>
      {geoNote && <p className="mt-2 text-[11px] text-slate-400">{geoNote}</p>}
      <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{deliveryNote}</p>
      {!prefs.enabled && (
        <p className="mt-2 text-sm text-slate-400">Alerts are off. Set a home, a radius, and how many days ahead, then enable them.</p>
      )}
      {prefs.enabled && !prefs.home && (
        <p className="mt-2 text-sm text-slate-400">Pick a home city or save this browser’s location.</p>
      )}
      {prefs.enabled && prefs.home && active.length === 0 && (
        <p className="mt-2 text-sm text-slate-400">
          No seeded show is inside {prefs.radiusMiles} mi and {prefs.leadDays} days of {prefs.home.label}.
        </p>
      )}
      {active.length > 0 && (
        <>
          <p className="mt-3 text-xs text-slate-300">
            {active.length} {active.length === 1 ? 'show' : 'shows'} inside {prefs.radiusMiles} mi and {prefs.leadDays} days
            {unread > 0 ? ` · ${unread} unread` : ''}
            {createdCount > 0 ? ` · ${createdCount} new this check` : ''}
          </p>
          <ul className="mt-3 space-y-2" aria-label="Nearby show alerts">
            {active.map((row) => (
              <li key={row.id} className="rounded-xl border border-slate-800 bg-brand-slate/20 px-3 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-white">{row.title}</p>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {row.isRead ? 'Read' : 'New'}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{row.description}</p>
                {!row.isRead && (
                  <button
                    type="button"
                    onClick={() => {
                      markShowAlertRead(row.id);
                      setActive((current) => current.map((item) => (item.id === row.id ? { ...item, isRead: true } : item)));
                    }}
                    className="mt-2 inline-flex min-h-[44px] items-center rounded-lg border border-slate-600 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-200"
                  >
                    Mark {row.showName} alert read
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default ShowAlertDesk;
