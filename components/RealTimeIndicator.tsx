import React, { useEffect, useState } from 'react';
import { getFeatureHub } from '../lib/realTimeFeatureHub';
import { getNotificationManager, WebSocketConnectionState } from '../lib/realTimeNotificationService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IndicatorStatus = 'connected' | 'connecting' | 'disconnected';

interface RealTimeIndicatorProps {
  /** Override the auto-detected status. When omitted the component
   *  derives status from the FeatureHub + NotificationManager. */
  status?: IndicatorStatus;
  /** Render size in pixels. Defaults to 10. */
  size?: number;
  /** Show a text label next to the dot. Defaults to false. */
  showLabel?: boolean;
  /** Extra CSS classes on the outer wrapper. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Colour / label maps
// ---------------------------------------------------------------------------

const STATUS_COLOURS: Record<IndicatorStatus, { dot: string; ring: string }> = {
  connected:    { dot: 'bg-emerald-500', ring: 'bg-emerald-400' },
  connecting:   { dot: 'bg-amber-400',   ring: 'bg-amber-300' },
  disconnected: { dot: 'bg-slate-400',   ring: 'bg-slate-300' },
};

const STATUS_LABELS: Record<IndicatorStatus, string> = {
  connected: 'Live',
  connecting: 'Connecting',
  disconnected: 'Offline',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A small pulsing dot that communicates real-time data pipeline health.
 *
 * - **Green pulse** — receiving live events.
 * - **Yellow pulse** — establishing connection.
 * - **Gray (no pulse)** — disconnected / idle.
 *
 * When no explicit `status` prop is supplied the component listens to both
 * the FeatureHub and the upstream RealtimeNotificationManager so it always
 * reflects the true connection state.
 */
const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({
  status: statusOverride,
  size = 10,
  showLabel = false,
  className = '',
}) => {
  const [derivedStatus, setDerivedStatus] = useState<IndicatorStatus>('disconnected');

  useEffect(() => {
    if (statusOverride !== undefined) return; // controlled externally

    // Derive from both sources — feature hub + notification manager.
    function resolveStatus(
      hubSimulating: boolean,
      wsState: WebSocketConnectionState,
    ): IndicatorStatus {
      if (hubSimulating && wsState === 'connected') return 'connected';
      if (wsState === 'connecting' || wsState === 'reconnecting') return 'connecting';
      if (hubSimulating) return 'connected'; // hub running, WS not yet ready
      return 'disconnected';
    }

    const hub = getFeatureHub();
    const mgr = getNotificationManager();

    // Set initial state
    setDerivedStatus(resolveStatus(hub.getIsSimulating(), mgr.getConnectionState()));

    const unsubHub = hub.onConnectionChange((connected) => {
      setDerivedStatus(resolveStatus(connected, mgr.getConnectionState()));
    });

    const unsubWs = mgr.onConnectionStateChange((state: WebSocketConnectionState) => {
      setDerivedStatus(resolveStatus(hub.getIsSimulating(), state));
    });

    return () => {
      unsubHub();
      unsubWs();
    };
  }, [statusOverride]);

  const effectiveStatus = statusOverride ?? derivedStatus;
  const colours = STATUS_COLOURS[effectiveStatus];
  const isPulsing = effectiveStatus !== 'disconnected';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      role="status"
      aria-label={STATUS_LABELS[effectiveStatus]}
    >
      {/* Dot wrapper — relative so the ping ring can overlay */}
      <span className="relative inline-flex" style={{ width: size, height: size }}>
        {/* Animated ping ring (only when connected or connecting) */}
        {isPulsing && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${colours.ring}`}
          />
        )}
        {/* Solid dot */}
        <span
          className={`relative inline-flex rounded-full h-full w-full ${colours.dot}`}
          style={{ width: size, height: size }}
        />
      </span>

      {showLabel && (
        <span className="text-xs font-medium text-slate-400 select-none">
          {STATUS_LABELS[effectiveStatus]}
        </span>
      )}
    </span>
  );
};

export default RealTimeIndicator;
