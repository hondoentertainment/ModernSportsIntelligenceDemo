import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const fieldCls = 'mt-1 w-full rounded border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-white';

const ShowAlertDesk: React.FC<Props> = ({ onHomeChange }) => {
  const [prefs, setPrefs] = useState<ShowAlertPrefs>(() => getShowAlertPrefs());
  const [active, setActive] = useState<ShowAlertRecord[]>([]);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [geoNote, setGeoNote] = useState('');
  const [radiusDraft, setRadiusDraft] = useState(() => String(prefs.radiusMiles));
  const [leadDraft, setLeadDraft] = useState(() => String(prefs.leadDays));
  const shows = useMemo(() => listResolvedLocalCardShows(), []);
  const presets = useMemo(() => listShowHomePresets(), []);
  const onHomeChangeRef = useRef(onHomeChange);
  onHomeChangeRef.current = onHomeChange;

  const homeOptions = prefs.home && !presets.some((row) => row.label === prefs.home?.label)
    ? [prefs.home, ...presets]
    : presets;

  const apply = (partial: Partial<ShowAlertPrefs>) => setPrefs(setShowAlertPrefs(partial));

  useEffect(() => {
    const home = getShowAlertPrefs().home;
    if (home) onHomeChangeRef.current?.(home);
  }, []);

  useEffect(() => {
    const result = syncShowAlerts({ shows, prefs });
    setActive(result.active);
    setDeliveryNote(result.deliveryNote);
  }, [shows, prefs]);

  const numberField = (
    name: string,
    draft: string,
    setDraft: (value: string) => void,
    key: 'radiusMiles' | 'leadDays',
    min: number,
    max: number,
  ) => (
    <label className="text-xs text-slate-400">
      {name}
      <input
        type="number"
        min={min}
        max={max}
        inputMode="numeric"
        value={draft}
        className={fieldCls}
        onChange={(event) => {
          const raw = event.target.value;
          setDraft(raw);
          const next = Number(raw);
          if (Number.isInteger(next) && next >= min && next <= max) apply({ [key]: next });
        }}
        onBlur={() => {
          const next = setShowAlertPrefs({ [key]: Number(draft) });
          setPrefs(next);
          setDraft(String(next[key]));
        }}
      />
    </label>
  );

  return (
    <section className="rounded-xl border border-slate-800 p-4" aria-label="Show alerts">
      <h2 className="text-sm font-semibold text-white">Show alerts</h2>
      <p className="mt-2 text-xs text-slate-400">{SHOW_ALERT_DISCLOSURE}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-xs text-slate-400">
          Show alert home
          <select
            value={prefs.home?.label ?? ''}
            className={fieldCls}
            onChange={(event) => {
              const home = homeOptions.find((row) => row.label === event.target.value) ?? null;
              apply({ home });
              onHomeChange?.(home);
            }}
          >
            <option value="">Choose a home city</option>
            {homeOptions.map((row) => <option key={row.label} value={row.label}>{row.label}</option>)}
          </select>
        </label>
        {numberField('Alert radius (miles)', radiusDraft, setRadiusDraft, 'radiusMiles', 5, 500)}
        {numberField('Days before the show', leadDraft, setLeadDraft, 'leadDays', 1, 366)}
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input type="checkbox" checked={prefs.enabled} onChange={(event) => apply({ enabled: event.target.checked })} />
          Enable show alerts
        </label>
      </div>
      <button type="button" className="mt-3 min-h-[44px] rounded border border-slate-600 px-3 text-xs text-slate-100" onClick={() => {
        if (!navigator.geolocation) {
          setGeoNote('This browser has no location API. Pick a home city instead.');
          return;
        }
        navigator.geolocation.getCurrentPosition((position) => {
          const home = { label: 'This browser’s location', lat: position.coords.latitude, lng: position.coords.longitude };
          setPrefs(setShowAlertPrefs({ home }));
          setGeoNote('Saved this browser’s location as the alert home.');
          onHomeChange?.(home);
        }, () => setGeoNote('Location unavailable. Pick a home city from the seeded list.'));
      }}>
        Save browser location as home
      </button>
      {geoNote && <p className="mt-2 text-xs text-slate-400">{geoNote}</p>}
      <p className="mt-2 text-xs text-slate-400">{deliveryNote}</p>
      {!prefs.enabled && <p className="mt-2 text-sm text-slate-400">Alerts are off.</p>}
      {prefs.enabled && !prefs.home && <p className="mt-2 text-sm text-slate-400">Pick a home city or save this browser’s location.</p>}
      {prefs.enabled && prefs.home && active.length === 0 && (
        <p className="mt-2 text-sm text-slate-400">No seeded show is inside {prefs.radiusMiles} mi and {prefs.leadDays} days.</p>
      )}
      {active.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label="Nearby show alerts">
          {active.map((row) => (
            <li key={row.id} className="rounded border border-slate-800 px-3 py-2">
              <p className="text-sm text-white">{row.title}</p>
              <p className="text-xs text-slate-400">{row.description}</p>
              <p className="text-xs text-slate-400">{row.isRead ? 'Read' : 'New'}</p>
              {!row.isRead && (
                <button
                  type="button"
                  className="mt-2 min-h-[44px] rounded border border-slate-600 px-3 text-xs text-slate-200"
                  onClick={() => {
                    markShowAlertRead(row.id);
                    setActive((current) => current.map((item) => (item.id === row.id ? { ...item, isRead: true } : item)));
                  }}
                >
                  Mark {row.showName} alert read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ShowAlertDesk;
