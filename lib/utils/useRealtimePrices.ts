/**
 * useRealtimePrices — subscribes to Supabase Realtime `card_prices` broadcast
 * channel for live price updates.
 *
 * Falls back to polling inventory values when:
 *   - Supabase is in demo mode (no credentials)
 *   - The `card_prices` channel is unavailable
 *
 * Channel protocol:
 *   Channel: "card_prices"
 *   Event:   "price_update"
 *   Payload: { card_id: string; symbol: string; price: number; change_pct: number }
 */

import { useEffect, useRef, useState } from 'react';
import { supabase, isDemoMode } from '../supabase';
import { logger } from '../logger';

export interface PriceTick {
  card_id: string;
  symbol: string;
  price: number;
  change_pct: number;
}

export type RealtimePriceMap = Map<string, PriceTick>;

interface UseRealtimePricesOptions {
  /** Seed data shown before the first real update arrives (or in demo mode). */
  seedTicks?: PriceTick[];
  /** How often (ms) to shuffle demo/seed data to simulate movement. Default 5000. */
  demoIntervalMs?: number;
}

function jitter(base: number): number {
  const pct = (Math.random() - 0.48) * 0.06;
  return Math.round(base * (1 + pct) * 100) / 100;
}

/**
 * Returns a map of card_id → latest PriceTick, refreshed via Supabase Realtime.
 * In demo mode the seed ticks are periodically simulated.
 */
export function useRealtimePrices(options: UseRealtimePricesOptions = {}): {
  prices: RealtimePriceMap;
  connected: boolean;
} {
  const { seedTicks = [], demoIntervalMs = 5000 } = options;

  const [prices, setPrices] = useState<RealtimePriceMap>(() => {
    const m = new Map<string, PriceTick>();
    for (const t of seedTicks) m.set(t.card_id, t);
    return m;
  });
  const [connected, setConnected] = useState(false);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const demoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isDemoMode || !supabase.channel) {
      // Demo/offline mode — simulate price movement from seed ticks
      if (seedTicks.length === 0) return;

      demoTimerRef.current = setInterval(() => {
        setPrices((prev) => {
          const next = new Map(prev);
          for (const [id, tick] of next) {
            const newPrice = jitter(tick.price);
            const change = ((newPrice - tick.price) / tick.price) * 100;
            next.set(id, { ...tick, price: newPrice, change_pct: Math.round(change * 100) / 100 });
          }
          return next;
        });
      }, demoIntervalMs);

      return () => {
        if (demoTimerRef.current) clearInterval(demoTimerRef.current);
      };
    }

    const channel = supabase.channel('card_prices');
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'price_update' }, (payload: { payload?: PriceTick }) => {
        const tick = payload.payload;
        if (!tick?.card_id) return;
        setPrices((prev) => new Map(prev).set(tick.card_id, tick));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          logger.info('[useRealtimePrices] Subscribed to card_prices channel');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnected(false);
          logger.warn('[useRealtimePrices] Channel closed or errored:', status);
        }
      });

    return () => {
      setConnected(false);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(() => {});
        channelRef.current = null;
      }
    };
    // seedTicks intentionally omitted — only used as initial state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, demoIntervalMs]);

  return { prices, connected };
}
