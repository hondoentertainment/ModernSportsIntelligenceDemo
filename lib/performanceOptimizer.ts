/**
 * Performance Optimizer for Modern Sports Intelligence
 *
 * Provides route prefetching, enhanced lazy loading, bundle analysis helpers,
 * and Web Vitals performance monitoring for a large-scale React SPA with
 * 180+ lazy-loaded pages.
 */

import React, { lazy, Suspense, createElement, useCallback, forwardRef } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { logger } from './logger';

// ---------------------------------------------------------------------------
//  1. Route Prefetching System
// ---------------------------------------------------------------------------

/** Cache of already-prefetched route modules so we never fetch twice. */
const prefetchedRoutes = new Map<string, Promise<{ default: ComponentType<any> }>>();

/** Registry that maps route paths to their dynamic import functions. */
const routeImportMap = new Map<string, () => Promise<{ default: ComponentType<any> }>>();

/**
 * Register a route's import function so that `prefetchRoute` can trigger it
 * later on hover / focus.
 */
export function registerRouteImport(
  path: string,
  importFn: () => Promise<{ default: ComponentType<any> }>,
): void {
  routeImportMap.set(path, importFn);
}

/**
 * Dynamically import the chunk for `path` ahead of navigation.
 * Safe to call multiple times -- subsequent calls return the cached promise.
 */
export function prefetchRoute(path: string): Promise<{ default: ComponentType<any> }> | undefined {
  if (prefetchedRoutes.has(path)) return prefetchedRoutes.get(path);

  const importFn = routeImportMap.get(path);
  if (!importFn) return undefined;

  const promise = importFn();
  prefetchedRoutes.set(path, promise);
  return promise;
}

/**
 * Adjacency map: when the user visits route `key`, the routes in the
 * `value` array are prefetched in the background.  Keeps the most likely
 * navigation targets one click warm.
 */
export const adjacentRoutes: Record<string, string[]> = {
  '/': ['/collection', '/deep-search', '/features', '/alerts', '/trends'],
  '/collection': ['/', '/favorites', '/compare', '/deep-search'],
  '/deep-search': ['/', '/collection', '/players'],
  '/features': ['/', '/collection', '/deep-search'],
  '/favorites': ['/collection', '/compare'],
  '/players': ['/players/:id', '/teams', '/trends'],
  '/trends': ['/players', '/teams', '/prospects'],
  '/builder': ['/', '/collection', '/billing'],
  '/compare': ['/collection', '/deep-search'],
  '/alerts': ['/', '/smart-notifications'],
  '/portfolio-copilot': ['/', '/builder', '/audit'],
  '/marketplace-aggregator': ['/auction-sniper', '/listing-optimizer'],
  '/auction-war-room': ['/auction-sniper', '/marketplace-aggregator'],
  '/grading-tracker': ['/grading-auditor', '/grading-prep', '/grading-vision-engine'],
  '/dealer-dashboard': ['/listing-optimizer', '/marketplace-aggregator'],
  '/card-show-mode': ['/card-show-planner', '/collection'],
  '/ar-scanner': ['/ai-card-scanner', '/scan-to-value'],
  '/vault-arbitrage': ['/international-arbitrage', '/cross-platform-arbitrage'],
  '/behavioral-finance': ['/portfolio-stress-test', '/portfolio-copilot'],
  '/tournament-arena': ['/leaderboard', '/guilds'],
  '/rookie-class-index': ['/rookie-pipeline-scanner', '/prospects'],
  '/live-break-hub': ['/live-break-roi', '/rip-flip-sim'],
  '/tax-calculator': ['/tax-report', '/hobby-income'],
  '/social-trading': ['/community-trading', '/social-feed'],
  '/watchlist': ['/alerts', '/real-time-price-engine'],
  '/card-genome-sequencer': ['/card-dna', '/collection-dna-mixer'],
  '/forensics-lab': ['/comp-forensics', '/slab-verification'],
};

/**
 * Prefetch all adjacent routes for the given current path.
 * Intended to be called inside a useEffect when a page mounts.
 */
export function prefetchAdjacentRoutes(currentPath: string): void {
  const neighbors = adjacentRoutes[currentPath];
  if (!neighbors) return;
  neighbors.forEach((p) => prefetchRoute(p));
}

// ---------------------------------------------------------------------------
//  PrefetchLink — drop-in wrapper around React-Router's <Link>
// ---------------------------------------------------------------------------

/**
 * Props mirror React-Router `LinkProps` but are kept intentionally loose so
 * that the component works regardless of the exact react-router-dom version
 * installed (v6 / v7).
 */
export interface PrefetchLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children?: ReactNode;
  /** Extra class names for the inner <Link> */
  className?: string;
  /** Prefetch strategy: "hover" (default) | "mount" | "none" */
  prefetchStrategy?: 'hover' | 'mount' | 'none';
}

/**
 * A `<Link>` wrapper that starts prefetching the target route chunk on
 * hover or focus, so by the time the user clicks the module is already
 * downloaded (or downloading).
 *
 * Usage:
 * ```tsx
 * import { PrefetchLink } from '@/lib/performanceOptimizer';
 * <PrefetchLink to="/collection">My Collection</PrefetchLink>
 * ```
 *
 * NOTE: We dynamically import react-router-dom's `Link` at module level to
 * avoid a hard dependency on the router package in this utility module.
 */
let RouterLink: ComponentType<any> | null = null;

// Eagerly resolve so the first render already has the component.
import('react-router-dom').then((mod) => {
  RouterLink = mod.Link;
});

export const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  function PrefetchLink({ to, children, prefetchStrategy = 'hover', ...rest }, ref) {
    const handleInteraction = useCallback(() => {
      prefetchRoute(to);
    }, [to]);

    // If react-router-dom hasn't resolved yet fall back to a plain <a>.
    const LinkComponent = RouterLink ?? 'a';
    const linkProps: Record<string, any> = RouterLink ? { to, ref, ...rest } : { href: to, ref, ...rest };

    if (prefetchStrategy === 'hover') {
      linkProps.onMouseEnter = (e: React.MouseEvent) => {
        handleInteraction();
        rest.onMouseEnter?.(e);
      };
      linkProps.onFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
        handleInteraction();
        rest.onFocus?.(e);
      };
    }

    // "mount" strategy: prefetch immediately when the link renders
    if (prefetchStrategy === 'mount') {
      // We intentionally call this during render for simplicity; it is
      // idempotent and free after the first call.
      prefetchRoute(to);
    }

    return createElement(LinkComponent, linkProps, children);
  },
);

// ---------------------------------------------------------------------------
//  2. Lazy Loading Enhancer
// ---------------------------------------------------------------------------

export interface CreateLazyPageOptions {
  /** If true the chunk will be prefetched as soon as `createLazyPage` runs. */
  prefetch?: boolean;
  /** Timeout (ms) before the import is considered failed. Default 10 000. */
  timeout?: number;
  /** Max retries on failure.  Default 2. */
  retries?: number;
  /** Optional loading fallback for this specific route. */
  fallback?: ReactNode;
}

/**
 * Enhanced version of `React.lazy()` with timeout, automatic retry, and
 * optional eager prefetch.
 *
 * ```ts
 * const Dashboard = createLazyPage(() => import('./pages/Dashboard'), {
 *   prefetch: true,
 *   timeout: 8000,
 * });
 * ```
 */
export function createLazyPage(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  options: CreateLazyPageOptions = {},
): React.LazyExoticComponent<ComponentType<any>> {
  const { prefetch = false, timeout = 10_000, retries = 2 } = options;

  const enhancedImport = (): Promise<{ default: ComponentType<any> }> => {
    return importWithRetry(importFn, retries, timeout);
  };

  if (prefetch) {
    // Kick off the import immediately but do not block.
    enhancedImport().catch(() => {
      /* swallow -- will retry on actual render */
    });
  }

  return lazy(enhancedImport);
}

/** Internal: wraps an import with a timeout and retry loop. */
function importWithRetry(
  importFn: () => Promise<{ default: ComponentType<any> }>,
  retriesLeft: number,
  timeout: number,
): Promise<{ default: ComponentType<any> }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Lazy import timed out after ${timeout}ms`));
    }, timeout);

    importFn()
      .then((mod) => {
        clearTimeout(timer);
        resolve(mod);
      })
      .catch((err) => {
        clearTimeout(timer);
        if (retriesLeft > 0) {
          // Exponential back-off: 500ms, 1000ms, ...
          const delay = 500 * (3 - retriesLeft);
          setTimeout(() => {
            importWithRetry(importFn, retriesLeft - 1, timeout).then(resolve, reject);
          }, delay);
        } else {
          reject(err);
        }
      });
  });
}

/**
 * A configurable loading fallback that can be used per route group.
 * Returns a Suspense wrapper component.
 */
export function createRouteGroup(
  fallback: ReactNode,
): ComponentType<{ children: ReactNode }> {
  return function RouteGroup({ children }: { children: ReactNode }) {
    return createElement(Suspense, { fallback }, children);
  };
}

// ---------------------------------------------------------------------------
//  3. Bundle Analysis Helpers
// ---------------------------------------------------------------------------

/**
 * Estimated route chunk sizes (KB).  These are based on typical production
 * build output for this codebase and are updated by the build pipeline.
 * In development they serve as a rough guide for the PerformanceDashboard.
 */
const routeChunkEstimates: Record<string, number> = {
  // Core
  '/': 42,
  '/collection': 38,
  '/favorites': 18,
  '/settings': 22,
  '/deep-search': 35,
  '/audit': 48,
  '/mlb-stats': 55,
  '/prospects': 32,
  '/players': 28,
  '/teams': 24,
  '/games': 30,
  '/trends': 45,
  '/builder': 52,
  '/billing': 20,
  '/compare': 40,
  '/alerts': 16,
  '/war-room': 38,
  '/guilds': 26,
  '/leaderboard': 22,
  '/features': 14,
  // Phase 114-128
  '/portfolio-copilot': 62,
  '/marketplace-aggregator': 48,
  '/subscription-box': 34,
  '/collector-dna': 44,
  '/auction-war-room': 56,
  '/grading-tracker': 38,
  '/dealer-dashboard': 50,
  '/fund-manager': 58,
  '/api-licensing': 28,
  '/card-show-mode': 36,
  '/ar-scanner': 64,
  '/hype-radar': 32,
  '/non-sports': 30,
  '/injury-intel': 42,
  '/carbon-score': 22,
  // Phase 129-138
  '/vault-arbitrage': 46,
  '/pressing-roi': 28,
  '/behavioral-finance': 52,
  '/comp-forensics': 44,
  '/tournament-arena': 60,
  '/influencer-impact': 36,
  '/condition-aging': 32,
  '/auth-training': 24,
  '/inventory-sync': 30,
  '/rookie-class-index': 38,
  // Phase 139-148
  '/vending-machine': 34,
  '/womens-sports-index': 40,
  '/grading-auditor': 36,
  '/smart-storage': 28,
  '/print-run-intelligence': 42,
  '/youth-onboarding': 26,
  '/live-break-hub': 54,
  '/price-prediction': 48,
  '/international-arbitrage': 44,
  '/blockchain-provenance': 38,
  // Phase 149-158
  '/trade-deadline': 46,
  '/collection-appraiser': 40,
  '/set-registry': 34,
  '/vintage-market': 42,
  '/social-trading': 50,
  '/listing-optimizer': 36,
  '/tax-calculator': 32,
  '/sealed-product': 28,
  '/error-card': 24,
  '/auction-sniper': 44,
  // Phase 159-168
  '/real-time-price-engine': 58,
  '/ai-card-scanner': 66,
  '/cross-platform-arbitrage': 52,
  '/predictive-price-engine': 56,
  '/tax-report': 34,
  '/grade-prediction': 40,
  '/smart-notifications': 26,
  '/consensus-pricing': 38,
  '/live-break-roi': 32,
  '/portfolio-benchmark': 44,
  // Phase 169-178
  '/watchlist': 24,
  '/insurance-vault': 36,
  '/break-even-calculator': 22,
  '/community-trading': 46,
  '/set-completion': 30,
  '/portfolio-narrator': 42,
  '/vintage-allocation': 34,
  '/grading-turnaround': 28,
  '/market-replay': 50,
  '/scan-to-value': 38,
  // Phase 179-188
  '/hobby-income': 26,
  '/card-show-planner': 32,
  '/rip-flip-sim': 36,
  '/social-feed': 44,
  '/slab-verification': 30,
  '/portfolio-stress-test': 48,
  '/consignment-market': 34,
  '/grading-prep': 28,
  '/parallel-universe': 52,
  '/achievement-system': 30,
  '/sentiment-velocity': 36,
  // v4.0
  '/nfl-hub': 42,
  '/nba-hub': 42,
  '/nhl-hub': 42,
  '/soccer-hub': 42,
  '/grading-vision-engine': 68,
  '/notification-center': 24,
  '/dashboard-builder': 56,
  '/marketplace-integrations': 38,
  '/insurance-appraisal': 32,
  '/offline-manager': 20,
  '/provenance-dna': 46,
  '/emotional-thermometer': 28,
  '/card-weather': 34,
  '/dead-money-detector': 30,
  '/micro-arbitrage-swarm': 48,
  '/generational-wealth': 40,
  '/card-aging-lab': 36,
  '/phantom-backtester': 54,
  '/collector-matchmaker': 32,
  // v5.0 batch 1
  '/card-genome-sequencer': 58,
  '/injury-oracle': 44,
  '/cross-asset-correlation': 50,
  '/collector-social-graph': 38,
  '/restoration-simulator': 42,
  '/market-maker-arena': 56,
  '/fractional-vault': 36,
  '/portfolio-stress-tester': 48,
  '/rookie-pipeline-scanner': 40,
  '/forensics-lab': 52,
  // v5.0 batch 2
  '/card-decay-predictor': 38,
  '/narrative-arc-engine': 44,
  '/liquidity-depth-scanner': 46,
  '/contagion-mapper': 50,
  '/grail-index-constructor': 42,
  '/print-run-decoder': 34,
  '/temporal-arbitrage-radar': 48,
  '/collection-dna-mixer': 40,
  '/card-yield-farming': 36,
  '/chaos-theory-simulator': 54,
};

/** Returns a map of route path -> estimated chunk size in KB. */
export function getRouteChunkSizes(): Record<string, number> {
  return { ...routeChunkEstimates };
}

/** Shared dependencies and their approximate sizes (KB, minified+gzipped). */
const sharedDeps: { name: string; sizeKB: number; usedBy: string }[] = [
  { name: 'recharts', sizeKB: 145, usedBy: 'Charts across 120+ pages' },
  { name: 'react', sizeKB: 42, usedBy: 'All pages' },
  { name: 'react-dom', sizeKB: 130, usedBy: 'All pages' },
  { name: 'react-router-dom', sizeKB: 28, usedBy: 'All pages' },
  { name: '@supabase/supabase-js', sizeKB: 55, usedBy: 'Auth & data layer' },
  { name: 'tailwindcss (runtime)', sizeKB: 8, usedBy: 'All pages (via PostCSS)' },
  { name: 'lucide-react', sizeKB: 18, usedBy: 'Icons across 100+ pages' },
  { name: 'date-fns', sizeKB: 12, usedBy: 'Date formatting in 60+ pages' },
  { name: 'framer-motion', sizeKB: 48, usedBy: 'Animations in 40+ pages' },
];

/** Returns a list of shared dependencies with their sizes and usage scope. */
export function getSharedDependencies(): typeof sharedDeps {
  return [...sharedDeps];
}

/** Returns the N largest route chunks, sorted descending by estimated size. */
export function getLargestChunks(n: number): { route: string; sizeKB: number }[] {
  return Object.entries(routeChunkEstimates)
    .map(([route, sizeKB]) => ({ route, sizeKB }))
    .sort((a, b) => b.sizeKB - a.sizeKB)
    .slice(0, n);
}

// ---------------------------------------------------------------------------
//  4. Performance Monitoring
// ---------------------------------------------------------------------------

interface RouteLoadMeasurement {
  route: string;
  durationMs: number;
  timestamp: number;
  success: boolean;
}

const routeLoadMeasurements: RouteLoadMeasurement[] = [];

/**
 * Times a route's lazy load and stores the result.
 * Returns the measured duration in milliseconds.
 */
export async function measureRouteLoad(route: string): Promise<number> {
  const importFn = routeImportMap.get(route);
  if (!importFn) {
    logger.warn(`[perf] No import registered for route "${route}"`);
    return -1;
  }

  const start = performance.now();
  let success = true;
  try {
    await importFn();
  } catch {
    success = false;
  }
  const durationMs = Math.round(performance.now() - start);

  routeLoadMeasurements.push({
    route,
    durationMs,
    timestamp: Date.now(),
    success,
  });

  return durationMs;
}

/** Returns all recorded route-load measurements. */
export function getRouteLoadMeasurements(): readonly RouteLoadMeasurement[] {
  return routeLoadMeasurements;
}

// ---------------------------------------------------------------------------
//  Web Vitals tracking (LCP, FID, CLS)
// ---------------------------------------------------------------------------

interface WebVital {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

const webVitals: WebVital[] = [];

function rateMetric(name: WebVital['name'], value: number): WebVital['rating'] {
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000],
    FID: [100, 300],
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
    INP: [200, 500],
  };
  const [good, poor] = thresholds[name] ?? [Infinity, Infinity];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

function recordVital(name: WebVital['name'], value: number): void {
  webVitals.push({
    name,
    value: Math.round(value * 1000) / 1000,
    rating: rateMetric(name, value),
    timestamp: Date.now(),
  });
}

/**
 * Initialises Web Vitals observers.  Safe to call in the browser only --
 * this is a no-op during SSR / tests.
 */
export function initWebVitalsTracking(): void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

  // LCP
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      if (last) recordVital('LCP', last.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    /* unsupported */
  }

  // FID (first-input)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entry = list.getEntries()[0] as PerformanceEntry & {
        processingStart: number;
        startTime: number;
      };
      if (entry) recordVital('FID', entry.processingStart - entry.startTime);
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch {
    /* unsupported */
  }

  // CLS
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput: boolean; value: number })[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      recordVital('CLS', clsValue);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    /* unsupported */
  }
}

/** Returns all captured Web Vitals. */
export function getWebVitals(): readonly WebVital[] {
  return webVitals;
}

// ---------------------------------------------------------------------------
//  Performance Report
// ---------------------------------------------------------------------------

export interface PerformanceReport {
  routeLoadTimes: readonly RouteLoadMeasurement[];
  largestChunks: { route: string; sizeKB: number }[];
  totalEstimatedBundleSizeKB: number;
  sharedDependencies: typeof sharedDeps;
  webVitals: readonly WebVital[];
  suggestions: string[];
}

/**
 * Aggregates all collected performance data into a single report with
 * actionable optimisation suggestions.
 */
export function getPerformanceReport(): PerformanceReport {
  const largestChunks = getLargestChunks(10);
  const totalEstimatedBundleSizeKB = Object.values(routeChunkEstimates).reduce(
    (sum, kb) => sum + kb,
    0,
  );

  const suggestions: string[] = [];

  // Suggest splitting oversized chunks
  const oversized = largestChunks.filter((c) => c.sizeKB > 60);
  if (oversized.length > 0) {
    suggestions.push(
      `${oversized.length} route chunk(s) exceed 60 KB: ${oversized.map((c) => c.route).join(', ')}. Consider code-splitting heavy sub-components.`,
    );
  }

  // Suggest prefetching for slow routes
  const slowRoutes = routeLoadMeasurements.filter((m) => m.durationMs > 1000);
  if (slowRoutes.length > 0) {
    suggestions.push(
      `${slowRoutes.length} route(s) took >1 s to load: ${slowRoutes.map((m) => m.route).join(', ')}. Add them to adjacentRoutes for prefetching.`,
    );
  }

  // Recharts is the single biggest shared dependency
  suggestions.push(
    'Recharts (145 KB gzip) is used by 120+ pages. It is already split into its own vendor chunk via manualChunks in vite.config.ts.',
  );

  // Generic advice
  if (totalEstimatedBundleSizeKB > 5000) {
    suggestions.push(
      `Total lazy bundle estimate is ${totalEstimatedBundleSizeKB} KB across ${Object.keys(routeChunkEstimates).length} routes. Consider tree-shaking unused exports in service files.`,
    );
  }

  // Check for poor Web Vitals
  const poorVitals = webVitals.filter((v) => v.rating === 'poor');
  if (poorVitals.length > 0) {
    suggestions.push(
      `Poor Web Vitals detected: ${poorVitals.map((v) => `${v.name}=${v.value}`).join(', ')}. Investigate render-blocking resources and layout shifts.`,
    );
  }

  return {
    routeLoadTimes: routeLoadMeasurements,
    largestChunks,
    totalEstimatedBundleSizeKB,
    sharedDependencies: getSharedDependencies(),
    webVitals,
    suggestions,
  };
}
