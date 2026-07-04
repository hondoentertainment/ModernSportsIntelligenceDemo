/**
 * Beta feature exit criteria tracker — docs/BETA_FEATURE_EXIT_CRITERIA.md
 * Features remain `beta` in the catalog until all required gates pass.
 */

export type BetaExitGate =
  | 'persistence'
  | 'data_honesty'
  | 'auth_tenancy'
  | 'errors'
  | 'tests';

export interface BetaFeatureExitStatus {
  id: string;
  name: string;
  gates: Record<BetaExitGate, boolean>;
  readyForLive: boolean;
  blockers: string[];
}

const BETA_FEATURES: Omit<BetaFeatureExitStatus, 'readyForLive' | 'blockers'>[] = [
  {
    id: 'liquidity-pool',
    name: 'Institutional Liquidity Pool',
    gates: {
      // Wave-3: recordInstantBuy() persists per-user via the DAL with
      // round-trip tests, the Dashboard widget ships with a "Simulated
      // Pool" label, and empty inventory hides the widget entirely.
      persistence: true,
      data_honesty: true,
      auth_tenancy: true,
      errors: true,
      tests: true,
    },
  },
  {
    id: 'visual-audit',
    name: 'Visual Audit Simulation',
    gates: {
      persistence: true,
      data_honesty: true,
      auth_tenancy: true,
      errors: true,
      tests: true,
    },
  },
  {
    id: 'live-impact',
    name: 'Live Game Impact Engine',
    gates: {
      persistence: true,
      data_honesty: true,
      auth_tenancy: true,
      errors: true,
      tests: true,
    },
  },
  {
    id: 'vision-grading',
    name: 'AI Vision Grading Lab',
    gates: {
      // Wave-3: unit coverage pins the analysis contract and the
      // image-handling decision (in-session only, never persisted — same
      // decision visual-audit shipped with).
      persistence: true,
      data_honesty: true,
      auth_tenancy: true,
      errors: true,
      tests: true,
    },
  },
  {
    id: 'fractional-vault',
    name: 'Fractional Vault & Copy-Trading',
    gates: {
      persistence: true,
      data_honesty: true,
      auth_tenancy: true,
      errors: true,
      tests: false,
    },
  },
  {
    id: 'provenance-chain',
    name: 'Provenance Chain & Digital Twin',
    gates: {
      persistence: true,
      data_honesty: true,
      auth_tenancy: true,
      errors: true,
      tests: true,
    },
  },
];

const GATE_LABELS: Record<BetaExitGate, string> = {
  persistence: 'User state persists via store/DAL for signed-in users',
  data_honesty: 'Demo/simulated data labeled in UI',
  auth_tenancy: 'No cross-user leakage (RLS + ProtectedRoute)',
  errors: 'User-visible error/empty states (no blank screens)',
  tests: 'Unit or E2E happy-path coverage',
};

export function evaluateBetaFeatureExit(
  feature: Omit<BetaFeatureExitStatus, 'readyForLive' | 'blockers'>,
): BetaFeatureExitStatus {
  const blockers = (Object.entries(feature.gates) as [BetaExitGate, boolean][])
    .filter(([, pass]) => !pass)
    .map(([gate]) => GATE_LABELS[gate]);

  return {
    ...feature,
    readyForLive: blockers.length === 0,
    blockers,
  };
}

export function getBetaFeatureExitStatuses(): BetaFeatureExitStatus[] {
  return BETA_FEATURES.map(evaluateBetaFeatureExit);
}

export function getBetaFeaturesReadyForLive(): BetaFeatureExitStatus[] {
  return getBetaFeatureExitStatuses().filter((f) => f.readyForLive);
}

export function getBetaFeatureExitStatus(id: string): BetaFeatureExitStatus | undefined {
  const feature = BETA_FEATURES.find((f) => f.id === id);
  return feature ? evaluateBetaFeatureExit(feature) : undefined;
}
