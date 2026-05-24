/**
 * Real-user Core Web Vitals reporter.
 *
 * Wired from index.tsx on app mount. Reports LCP, INP, CLS, FCP, TTFB to
 * the existing telemetry beacon (best-effort, fire-and-forget).
 *
 * Sampling: defaults to 100% in dev/preview, 25% in production to keep beacon
 * volume reasonable. Override via VITE_RUM_SAMPLE_RATE (a float 0–1).
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { logger } from '../logger';

const SAMPLE_RATE = (() => {
  const raw = import.meta.env.VITE_RUM_SAMPLE_RATE;
  const parsed = raw === undefined ? NaN : Number(raw);
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) return parsed;
  return import.meta.env.PROD ? 0.25 : 1;
})();

const BEACON_URL = import.meta.env.VITE_RUM_BEACON_URL ?? '/api/telemetry/web-vitals';

let initialized = false;

export interface WebVitalPayload {
  name: Metric['name'];
  value: number;
  rating: Metric['rating'];
  id: string;
  delta: number;
  navigationType?: string;
  page: string;
  ts: number;
  sessionSample: number;
}

function send(payload: WebVitalPayload): void {
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const ok = navigator.sendBeacon(BEACON_URL, body);
      if (!ok && typeof fetch === 'function') {
        void fetch(BEACON_URL, { method: 'POST', body, keepalive: true }).catch(() => {});
      }
      return;
    }
    if (typeof fetch === 'function') {
      void fetch(BEACON_URL, { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  } catch (err) {
    logger.warn('web-vitals beacon failed:', err);
  }
}

function makeHandler(sample: number) {
  return (metric: Metric) => {
    if (Math.random() > sample) return;
    const payload: WebVitalPayload = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      delta: metric.delta,
      navigationType: metric.navigationType,
      page: typeof location !== 'undefined' ? `${location.pathname}${location.hash}` : 'unknown',
      ts: Date.now(),
      sessionSample: sample,
    };
    send(payload);
  };
}

export function initWebVitals(): void {
  if (initialized) return;
  initialized = true;
  if (typeof window === 'undefined') return;
  const handler = makeHandler(SAMPLE_RATE);
  try {
    onCLS(handler);
    onFCP(handler);
    onINP(handler);
    onLCP(handler);
    onTTFB(handler);
  } catch (err) {
    logger.warn('web-vitals init failed:', err);
  }
}

export const __test__ = { makeHandler, send };
