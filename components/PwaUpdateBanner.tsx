import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

/**
 * Shown when index.html dispatches `sw-update-available` (new service worker waiting).
 * User-triggered reload after SKIP_WAITING avoids reloading on every first SW activation.
 */
const PwaUpdateBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const expectingReloadRef = useRef(false);

  const applyUpdate = useCallback(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    expectingReloadRef.current = true;
    void navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    });
  }, []);

  useEffect(() => {
    const onUpdateAvailable = () => setVisible(true);
    window.addEventListener('sw-update-available', onUpdateAvailable);

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) setVisible(true);
      });
    }

    const onControllerChange = () => {
      if (expectingReloadRef.current) {
        window.location.reload();
      }
    };

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    }

    return () => {
      window.removeEventListener('sw-update-available', onUpdateAvailable);
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2.5 z-50 border-b border-brand-lime/30 bg-brand-lime/10 text-slate-100"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles size={18} className="text-brand-lime flex-shrink-0" aria-hidden />
        <p className="text-sm font-medium truncate">
          A new version of the app is ready. Reload to get the latest fixes and features.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={applyUpdate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-lime text-brand-charcoal hover:opacity-90 transition-opacity"
        >
          <RefreshCw size={14} aria-hidden />
          Reload
        </button>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Dismiss update notice"
        >
          <X size={16} className="opacity-70" />
        </button>
      </div>
    </div>
  );
};

export default PwaUpdateBanner;
