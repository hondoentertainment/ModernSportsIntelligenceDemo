import { store } from '../dal/syncStore';
import { incrementCounter, recordMetric } from './telemetryService';

export type ValuationCoverageScope = 'inventory' | 'watchlist';
type CoverageHealthStatus = 'healthy' | 'degraded';

interface PersistedCoverageHealth {
  status: CoverageHealthStatus;
  coveragePct: number;
  total: number;
  updatedAt: string;
}

interface CoverageTransitionResult {
  event: 'degraded' | 'recovered' | null;
  status: CoverageHealthStatus | null;
}

const COVERAGE_ALERT_KEY_PREFIX = 'msi_valuation_coverage_health_v1';
const COVERAGE_HISTORY_KEY = 'msi_valuation_coverage_history_v1';
const COVERAGE_HISTORY_MAX = 336; // 14 days @ hourly snapshots
const COVERAGE_HISTORY_MIN_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export interface CoverageHistorySnapshot {
  scope: ValuationCoverageScope;
  coveragePct: number;
  total: number;
  targetPct: number;
  status: CoverageHealthStatus;
  timestamp: string;
}

function keyForScope(scope: ValuationCoverageScope): string {
  return `${COVERAGE_ALERT_KEY_PREFIX}:${scope}`;
}

function recordCoverageTransitionTelemetry(
  scope: ValuationCoverageScope,
  event: 'degraded' | 'recovered',
  coveragePct: number,
  total: number,
): void {
  incrementCounter(`valuation.coverage.${scope}.${event}`);
  recordMetric('valuation.coverage.transition', 1, {
    scope,
    event,
    coverage_pct: String(coveragePct),
    total: String(total),
  });
}

export function recordCoverageHealthSnapshot(
  scope: ValuationCoverageScope,
  coveragePct: number,
  total: number,
  targetPct: number,
): void {
  if (total <= 0) return;
  const nowIso = new Date().toISOString();
  const history = store.get<CoverageHistorySnapshot[]>(COVERAGE_HISTORY_KEY, []);
  const latestForScope = history.find(snapshot => snapshot.scope === scope);
  if (latestForScope) {
    const latestMs = Date.parse(latestForScope.timestamp);
    const nextMs = Date.parse(nowIso);
    const withinInterval = Number.isFinite(latestMs) && Number.isFinite(nextMs) && (nextMs - latestMs) < COVERAGE_HISTORY_MIN_INTERVAL_MS;
    const sameCoverage = latestForScope.coveragePct === coveragePct && latestForScope.total === total;
    if (withinInterval && sameCoverage) return;
  }

  const status: CoverageHealthStatus = coveragePct >= targetPct ? 'healthy' : 'degraded';
  const nextSnapshot: CoverageHistorySnapshot = {
    scope,
    coveragePct,
    total,
    targetPct,
    status,
    timestamp: nowIso,
  };
  store.set(COVERAGE_HISTORY_KEY, [nextSnapshot, ...history].slice(0, COVERAGE_HISTORY_MAX));
}

export function getCoverageHistory(scope?: ValuationCoverageScope): CoverageHistorySnapshot[] {
  const history = store.get<CoverageHistorySnapshot[]>(COVERAGE_HISTORY_KEY, []);
  if (!scope) return history;
  return history.filter(snapshot => snapshot.scope === scope);
}

/**
 * Tracks health transitions for fresh + verifiable valuation coverage.
 * Emits a transition event only when status changes between healthy/degraded.
 */
export function trackCoverageHealthTransition(
  scope: ValuationCoverageScope,
  coveragePct: number,
  total: number,
  targetPct: number,
): CoverageTransitionResult {
  const key = keyForScope(scope);
  recordCoverageHealthSnapshot(scope, coveragePct, total, targetPct);
  if (total <= 0) {
    store.remove(key);
    return { event: null, status: null };
  }

  const status: CoverageHealthStatus = coveragePct >= targetPct ? 'healthy' : 'degraded';
  const nextSnapshot: PersistedCoverageHealth = {
    status,
    coveragePct,
    total,
    updatedAt: new Date().toISOString(),
  };

  const previous = store.get<PersistedCoverageHealth | null>(key, null);
  store.set(key, nextSnapshot);

  if (!previous) {
    if (status === 'degraded') {
      recordCoverageTransitionTelemetry(scope, 'degraded', coveragePct, total);
      return { event: 'degraded', status };
    }
    return { event: null, status };
  }

  if (previous.status !== status) {
    const event: 'degraded' | 'recovered' = status === 'degraded' ? 'degraded' : 'recovered';
    recordCoverageTransitionTelemetry(scope, event, coveragePct, total);
    return { event, status };
  }

  return { event: null, status };
}
