
import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

interface WidgetErrorFallbackProps {
  /** Display name of the widget that failed */
  widgetName: string;
  /** The captured error, if available */
  error?: Error;
  /** Re-mount the widget to retry rendering */
  onRetry: () => void;
  /** Remove the widget from view */
  onDismiss: () => void;
}

/**
 * Phase 70: App Shell Hardening — Widget-level error fallback.
 * Compact card that replaces a broken widget inside the dashboard grid.
 * Matches standard widget card styling (bg-brand-slate, rounded-[2.5rem]).
 */
const WidgetErrorFallback: React.FC<WidgetErrorFallbackProps> = ({
  widgetName,
  error,
  onRetry,
  onDismiss,
}) => {
  return (
    <div className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-6 flex flex-col items-center text-center gap-4">
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
        <AlertTriangle className="text-amber-400" size={20} />
      </div>

      {/* Widget name */}
      <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
        {widgetName}
      </p>

      {/* Error headline */}
      <h3 className="text-sm font-bold text-white -mt-1">
        Something went wrong
      </h3>

      {/* Error detail (if provided) */}
      {error?.message && (
        <p className="text-[11px] font-mono text-slate-500 bg-slate-900/60 rounded-lg px-3 py-2 max-w-full break-words leading-relaxed border border-slate-800/50">
          {error.message}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-1">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-lime text-brand-charcoal text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white transition-colors"
        >
          <RotateCcw size={12} />
          Retry
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <X size={12} />
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default WidgetErrorFallback;
