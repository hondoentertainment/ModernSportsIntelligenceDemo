import React, { useEffect, useState } from 'react';
import { Bell, Clock, Radio } from 'lucide-react';
import {
  ALERT_PREFERENCES_DISCLOSURE,
  getAlertPreferences,
  setAlertPreferences,
  type AlertPreferences,
} from '../lib/utils/alertPreferences';
import {
  SYNC_PRODUCT_DEFAULTS_DISCLOSURE,
  getSyncProductDefaults,
  resolveSyncProductProfile,
  setDailySyncOptIn,
} from '../lib/utils/syncProductDefaults';
import {
  WEB_PUSH_DISCLOSURE,
  disableWebPushClient,
  enableWebPushClient,
  shouldOfferWebPush,
  snapshotWebPushSupport,
  webPushStatusCopy,
  type WebPushSubscriptionRecord,
} from '../lib/utils/webPushSubscription';
import { isDemoMode } from '../lib/supabase';

const AlertDeliverySettings: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const [prefs, setPrefs] = useState<AlertPreferences>(() => getAlertPreferences());
  const profile = resolveSyncProductProfile({ signedIn: !isDemoMode, isDemo: isDemoMode });
  const [dailySync, setDailySync] = useState(() => getSyncProductDefaults()?.optedIn !== false);
  const [pushRecord, setPushRecord] = useState<WebPushSubscriptionRecord>(() => snapshotWebPushSupport());
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    setPushRecord(snapshotWebPushSupport());
  }, [prefs.browserNotificationsEnabled, prefs.quietHoursEnabled, prefs.quietHoursStart, prefs.quietHoursEnd]);

  const patch = (partial: Partial<AlertPreferences>) => {
    setPrefs(setAlertPreferences(partial));
  };

  return (
    <section
      className={
        compact
          ? 'rounded-2xl border border-slate-800 bg-brand-charcoal/50 p-4'
          : 'rounded-2xl border border-slate-800 bg-slate-900/60 p-6'
      }
      aria-label="Alert delivery preferences"
    >
      <div className="mb-3 flex items-center gap-2">
        <Bell size={16} className="text-brand-lime" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold text-white">Alert delivery</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
            Quiet hours · haptics · on-device notifications
          </p>
        </div>
      </div>
      <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{ALERT_PREFERENCES_DISCLOSURE}</p>
      <div className="space-y-3">
        <label className="flex items-center justify-between gap-3 text-sm text-slate-200">
          <span>Quiet hours</span>
          <input
            type="checkbox"
            checked={prefs.quietHoursEnabled}
            onChange={(e) => patch({ quietHoursEnabled: e.target.checked })}
            aria-label="Enable quiet hours"
          />
        </label>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock size={12} aria-hidden />
          <input
            type="time"
            value={prefs.quietHoursStart}
            onChange={(e) => patch({ quietHoursStart: e.target.value })}
            aria-label="Quiet hours start"
            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200"
          />
          <span>to</span>
          <input
            type="time"
            value={prefs.quietHoursEnd}
            onChange={(e) => patch({ quietHoursEnd: e.target.value })}
            aria-label="Quiet hours end"
            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200"
          />
        </div>
        <label className="flex items-center justify-between gap-3 text-sm text-slate-200">
          <span>Price-alert haptics</span>
          <input
            type="checkbox"
            checked={prefs.hapticsEnabled}
            onChange={(e) => patch({ hapticsEnabled: e.target.checked })}
            aria-label="Enable price-alert haptics"
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-slate-200">
          <span>Browser notifications</span>
          <input
            type="checkbox"
            checked={prefs.browserNotificationsEnabled}
            onChange={(e) => patch({ browserNotificationsEnabled: e.target.checked })}
            aria-label="Enable browser notifications"
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-slate-200">
          <span>Daily portfolio + watchlist sync</span>
          <input
            type="checkbox"
            checked={dailySync}
            onChange={(e) => {
              const next = e.target.checked;
              setDailySync(next);
              setDailySyncOptIn(next, profile);
            }}
            aria-label="Enable daily portfolio and watchlist sync"
          />
        </label>
        <p className="text-[11px] leading-relaxed text-slate-500">{SYNC_PRODUCT_DEFAULTS_DISCLOSURE}</p>
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-brand-lime" aria-hidden />
            <p className="text-sm font-semibold text-white">Web Push (client)</p>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">{WEB_PUSH_DISCLOSURE}</p>
          <p className="text-[11px] text-slate-300">{webPushStatusCopy(pushRecord)}</p>
          {pushRecord.endpoint && (
            <p className="break-all font-mono text-[10px] text-slate-500">Endpoint stored: {pushRecord.endpoint}</p>
          )}
          {!shouldOfferWebPush() && prefs.browserNotificationsEnabled && (
            <p className="text-[11px] text-amber-200">Quiet hours are on — client push stays armed but delivery is suppressed.</p>
          )}
          {!prefs.browserNotificationsEnabled && (
            <p className="text-[11px] text-amber-200">Turn on browser notifications above to use the client readiness path.</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pushBusy || !prefs.browserNotificationsEnabled}
              onClick={async () => {
                setPushBusy(true);
                try {
                  setPushRecord(await enableWebPushClient());
                } finally {
                  setPushBusy(false);
                }
              }}
              aria-label="Enable Web Push client readiness"
              className="rounded-lg bg-brand-lime px-3 py-2 text-[10px] font-black uppercase tracking-widest text-brand-charcoal disabled:opacity-40"
            >
              {pushRecord.status === 'subscribed' || pushRecord.status === 'ready_local' ? 'Refresh endpoint' : 'Enable client push'}
            </button>
            {(pushRecord.status === 'subscribed' || pushRecord.status === 'ready_local' || pushRecord.endpoint) && (
              <button
                type="button"
                disabled={pushBusy}
                onClick={async () => {
                  setPushBusy(true);
                  try {
                    setPushRecord(await disableWebPushClient());
                  } finally {
                    setPushBusy(false);
                  }
                }}
                aria-label="Clear Web Push subscription"
                className="rounded-lg border border-slate-700 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 disabled:opacity-40"
              >
                Clear local subscription
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlertDeliverySettings;
