import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFeatureHub,
  RealTimeEvent,
  SubscriptionHandle,
  FeatureChannelName,
} from '../lib/realTimeFeatureHub';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseRealTimeFeatureReturn<T> {
  /** The most recent event received on this channel (null until first event). */
  latestEvent: T | null;
  /** Rolling history of events, newest first. Capped at `maxHistory`. */
  eventHistory: T[];
  /** True when the feature hub simulation is actively running. */
  isConnected: boolean;
  /** Three-state connection status suitable for UI indicators. */
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export interface UseRealTimeFeatureOptions {
  /**
   * Maximum number of events to keep in `eventHistory`.
   * Defaults to 50.
   */
  maxHistory?: number;
  /**
   * When true the hook will automatically call `startSimulation()` on
   * mount and `stopSimulation()` on unmount. Defaults to false so that
   * multiple hooks sharing the singleton hub don't fight over the
   * simulation lifecycle.
   */
  autoStart?: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * React hook that subscribes to a single RealTimeFeatureHub channel and
 * exposes the latest event, an event history buffer, and connection state.
 *
 * Usage:
 * ```tsx
 * const { latestEvent, eventHistory, connectionStatus } =
 *   useRealTimeFeature<InjuryOraclePayload>('injury-oracle');
 * ```
 *
 * An optional `filter` predicate can narrow which events are surfaced.
 * Only events for which the filter returns `true` will update state.
 */
export function useRealTimeFeature<T = unknown>(
  channel: FeatureChannelName | '*',
  filter?: (event: T) => boolean,
  options?: UseRealTimeFeatureOptions,
): UseRealTimeFeatureReturn<T> {
  const maxHistory = options?.maxHistory ?? 50;
  const autoStart = options?.autoStart ?? false;

  const hub = getFeatureHub();

  const [latestEvent, setLatestEvent] = useState<T | null>(null);
  const [eventHistory, setEventHistory] = useState<T[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(hub.getIsSimulating());
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'connecting' | 'disconnected'
  >(hub.getConnectionStatus());

  // Keep a stable ref for the filter so we don't re-subscribe on every render.
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const maxHistoryRef = useRef(maxHistory);
  maxHistoryRef.current = maxHistory;

  // Subscription to channel events
  useEffect(() => {
    if (autoStart && !hub.getIsSimulating()) {
      hub.startSimulation();
    }

    // Wrap the external filter so it operates on the raw data payload.
    const internalFilter = filterRef.current
      ? (event: RealTimeEvent) => {
          return filterRef.current ? filterRef.current(event.data as T) : true;
        }
      : undefined;

    const handle: SubscriptionHandle = hub.subscribe(
      channel,
      (event: RealTimeEvent) => {
        const payload = event.data as T;
        setLatestEvent(payload);
        setEventHistory((prev) => {
          const next = [payload, ...prev];
          return next.length > maxHistoryRef.current
            ? next.slice(0, maxHistoryRef.current)
            : next;
        });
      },
      internalFilter,
    );

    return () => {
      hub.unsubscribe(handle);
      if (autoStart) {
        hub.stopSimulation();
      }
    };
    // Re-subscribe only when the channel changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, autoStart]);

  // Connection state tracking
  useEffect(() => {
    const unsubConnection = hub.onConnectionChange((connected) => {
      setIsConnected(connected);
      setConnectionStatus(connected ? 'connected' : 'disconnected');
    });

    // Also listen to the upstream notification manager for the
    // intermediate "connecting" state.
    const { getNotificationManager } = require('../lib/realTimeNotificationService');
    const mgr = getNotificationManager();
    const unsubState = mgr.onConnectionStateChange(
      (state: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error') => {
        if (state === 'connecting' || state === 'reconnecting') {
          setConnectionStatus('connecting');
        } else if (state === 'connected') {
          setConnectionStatus('connected');
          setIsConnected(true);
        } else {
          setConnectionStatus('disconnected');
          setIsConnected(false);
        }
      },
    );

    return () => {
      unsubConnection();
      unsubState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Convenience: reset the event history buffer.
   */
  const _clearHistory = useCallback(() => {
    setEventHistory([]);
    setLatestEvent(null);
  }, []);

  // Expose clearHistory on the return value via an expando so advanced
  // consumers can opt-in without polluting the simple return type.
  // (Kept internal for now — uncomment the line below if needed.)
  // (returnValue as any).clearHistory = _clearHistory;
  void _clearHistory; // reference to suppress lint

  return {
    latestEvent,
    eventHistory,
    isConnected,
    connectionStatus,
  };
}

export default useRealTimeFeature;
