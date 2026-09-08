import React, { useState } from 'react';
import { Bell, Clock } from 'lucide-react';
import {
  ALERT_PREFERENCES_DISCLOSURE,
  getAlertPreferences,
  setAlertPreferences,
  type AlertPreferences,
} from '../lib/utils/alertPreferences';

const AlertDeliverySettings: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const [prefs, setPrefs] = useState<AlertPreferences>(() => getAlertPreferences());

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
      </div>
    </section>
  );
};

export default AlertDeliverySettings;
