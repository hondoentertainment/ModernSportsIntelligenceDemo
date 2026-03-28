/**
 * Feature Flags — Controls gradual rollout of real API integrations.
 *
 * Each flag controls whether a specific adapter uses real API calls
 * or returns mock/demo data. Flags are read from environment variables
 * at startup and can be overridden at runtime for testing.
 *
 * Environment variables (all optional, default to false):
 *   VITE_FF_REAL_EBAY=true
 *   VITE_FF_REAL_PSA=true
 *   VITE_FF_REAL_BGS=true
 *   VITE_FF_REAL_SPORTS=true
 *   VITE_FF_REAL_COMC=true
 *   VITE_FF_REAL_GEMINI=true  (already live)
 */

import { logger } from './logger';

export interface FeatureFlags {
  USE_REAL_EBAY: boolean;
  USE_REAL_PSA: boolean;
  USE_REAL_BGS: boolean;
  USE_REAL_SPORTS: boolean;
  USE_REAL_COMC: boolean;
  USE_REAL_GEMINI: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  USE_REAL_EBAY: false,
  USE_REAL_PSA: false,
  USE_REAL_BGS: false,
  USE_REAL_SPORTS: false,
  USE_REAL_COMC: false,
  USE_REAL_GEMINI: false,
};

type FeatureFlagEnvKey =
  | 'VITE_FF_REAL_EBAY'
  | 'VITE_FF_REAL_PSA'
  | 'VITE_FF_REAL_BGS'
  | 'VITE_FF_REAL_SPORTS'
  | 'VITE_FF_REAL_COMC'
  | 'VITE_FF_REAL_GEMINI';

function readEnvFlag(key: FeatureFlagEnvKey): boolean {
  if (typeof import.meta === 'undefined') return false;
  const val = import.meta.env[key];
  return val === 'true' || val === '1';
}

function loadFlags(): FeatureFlags {
  return {
    USE_REAL_EBAY: readEnvFlag('VITE_FF_REAL_EBAY'),
    USE_REAL_PSA: readEnvFlag('VITE_FF_REAL_PSA'),
    USE_REAL_BGS: readEnvFlag('VITE_FF_REAL_BGS'),
    USE_REAL_SPORTS: readEnvFlag('VITE_FF_REAL_SPORTS'),
    USE_REAL_COMC: readEnvFlag('VITE_FF_REAL_COMC'),
    USE_REAL_GEMINI: readEnvFlag('VITE_FF_REAL_GEMINI'),
  };
}

let _flags: FeatureFlags = { ...DEFAULT_FLAGS };
let _initialized = false;

/** Initialize feature flags from environment. Called once at app startup. */
export function initFeatureFlags(): FeatureFlags {
  _flags = loadFlags();
  _initialized = true;

  const active = Object.entries(_flags)
    .filter(([, v]) => v)
    .map(([k]) => k);

  if (active.length > 0) {
    logger.info(`[FeatureFlags] Active: ${active.join(', ')}`);
  } else {
    logger.info('[FeatureFlags] All adapters using mock data');
  }

  return _flags;
}

/** Get current feature flags. Auto-initializes if not yet done. */
export function getFeatureFlags(): FeatureFlags {
  if (!_initialized) initFeatureFlags();
  return { ..._flags };
}

/** Check a single flag. */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  if (!_initialized) initFeatureFlags();
  return _flags[flag];
}

/**
 * When true, pricing flows may use live eBay comps (e.g. `getEbayCardPrice` when the eBay adapter is available).
 * When false, callers should skip real listing APIs and use demo/AI paths so UI matches the "Estimate" chip.
 */
export function preferRealCompsWhenConfigured(): boolean {
  return isFeatureEnabled('USE_REAL_EBAY');
}

/** Override a flag at runtime (for testing or admin panel). */
export function setFeatureFlag(flag: keyof FeatureFlags, value: boolean): void {
  _flags[flag] = value;
  logger.info(`[FeatureFlags] ${flag} set to ${value}`);
}

/** Reset all flags to environment defaults. */
export function resetFeatureFlags(): void {
  _flags = loadFlags();
  logger.info('[FeatureFlags] Reset to environment defaults');
}

/** FMV / Market Nav chip: live eBay comps vs demo estimate (USE_REAL_EBAY). */
export function getValuationSourceChip(): { label: string; className: string } {
  if (isFeatureEnabled('USE_REAL_EBAY')) {
    return {
      label: 'Live comps',
      className:
        'text-brand-teal bg-brand-lime/5 border border-brand-teal/25',
    };
  }
  return {
    label: 'Estimate',
    className: 'text-brand-muted bg-brand-charcoal/50 border border-slate-700/50',
  };
}
