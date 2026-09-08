/**
 * Phase 33 leftover — local day-bucketed Auto-Pilot decision replay.
 * Advisory only. No live marketplace execution.
 */
import type { AutonomousAction, RiskCollar } from '../../types';
import type { AutopilotImpactPreview } from './autoPilotImpactPreview';
import { AUTOPILOT_IMPACT_DISCLOSURE } from './autoPilotImpactPreview';
import { store } from '../dal/syncStore';

export const AUTOPILOT_REPLAY_KEY = 'msi_autopilot_replay_v1';
export const AUTOPILOT_REPLAY_DISCLOSURE =
  'Local day-bucketed replay of Auto-Pilot / War Room advisory decisions. Records actions considered, collars, approvals, and the NAV preview snapshot. Not live marketplace execution.';

const MAX_ENTRIES = 40;

export interface AutopilotReplayCandidate {
  type: AutonomousAction['type'];
  assetName: string;
  amount: number;
  confidence?: number;
}

export interface AutopilotReplayGated {
  type: AutonomousAction['type'];
  assetName: string;
  policyDecision?: AutonomousAction['policyDecision'];
  policyReason?: string;
}

export interface AutopilotReplayCollar {
  maxBudget: number;
  maxDailyBudget: number;
  maxSpendPerAsset: number;
  maxDrawdownPct: number;
  requireApprovalAbove: number;
}

export interface AutopilotReplayNavSnapshot {
  startingValue: number;
  projectedPostCycleValue: number;
  navDelta: number;
  estimatedTotalTax: number;
}

export interface AutopilotReplayEntry {
  id: string;
  dayKey: string;
  cycleId: string;
  timestamp: string;
  source: 'preview' | 'cycle';
  considered: AutopilotReplayCandidate[];
  gated: AutopilotReplayGated[];
  collar: AutopilotReplayCollar;
  approvals: { pending: number; approved: number; blocked: number };
  navPreview: AutopilotReplayNavSnapshot;
  disclosure: string;
}

export function replayDayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function asEntry(raw: unknown): AutopilotReplayEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Partial<AutopilotReplayEntry>;
  if (typeof o.id !== 'string' || typeof o.dayKey !== 'string' || typeof o.timestamp !== 'string') return null;
  if (o.source !== 'preview' && o.source !== 'cycle') return null;
  return {
    id: o.id,
    dayKey: o.dayKey,
    cycleId: typeof o.cycleId === 'string' ? o.cycleId : 'default',
    timestamp: o.timestamp,
    source: o.source,
    considered: Array.isArray(o.considered) ? o.considered : [],
    gated: Array.isArray(o.gated) ? o.gated : [],
    collar: {
      maxBudget: Number(o.collar?.maxBudget) || 0,
      maxDailyBudget: Number(o.collar?.maxDailyBudget) || 0,
      maxSpendPerAsset: Number(o.collar?.maxSpendPerAsset) || 0,
      maxDrawdownPct: Number(o.collar?.maxDrawdownPct) || 0,
      requireApprovalAbove: Number(o.collar?.requireApprovalAbove) || 0,
    },
    approvals: {
      pending: Number(o.approvals?.pending) || 0,
      approved: Number(o.approvals?.approved) || 0,
      blocked: Number(o.approvals?.blocked) || 0,
    },
    navPreview: {
      startingValue: Number(o.navPreview?.startingValue) || 0,
      projectedPostCycleValue: Number(o.navPreview?.projectedPostCycleValue) || 0,
      navDelta: Number(o.navPreview?.navDelta) || 0,
      estimatedTotalTax: Number(o.navPreview?.estimatedTotalTax) || 0,
    },
    disclosure: typeof o.disclosure === 'string' ? o.disclosure : AUTOPILOT_REPLAY_DISCLOSURE,
  };
}

export function listAutopilotReplay(): AutopilotReplayEntry[] {
  const raw = store.get<unknown>(AUTOPILOT_REPLAY_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.map(asEntry).filter((row): row is AutopilotReplayEntry => row != null);
}

export function listAutopilotReplayForDay(dayKey: string = replayDayKey()): AutopilotReplayEntry[] {
  return listAutopilotReplay().filter((row) => row.dayKey === dayKey);
}

export function recordAutopilotReplay(input: {
  source: 'preview' | 'cycle';
  cycleId?: string;
  considered: AutonomousAction[];
  gated: AutonomousAction[];
  collar: RiskCollar;
  impact: Pick<AutopilotImpactPreview, 'startingValue' | 'projectedPostCycleValue' | 'navDelta' | 'estimatedTotalTax'>;
  now?: Date;
}): AutopilotReplayEntry {
  const now = input.now ?? new Date();
  const dayKey = replayDayKey(now);
  const cycleId = input.cycleId || input.considered[0]?.cycleId || input.gated[0]?.cycleId || `replay-${dayKey}`;
  const entry: AutopilotReplayEntry = {
    id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `replay-${cycleId}-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    dayKey,
    cycleId,
    timestamp: now.toISOString(),
    source: input.source,
    considered: input.considered.map((action) => ({
      type: action.type,
      assetName: action.assetName,
      amount: action.amount,
      confidence: action.confidence,
    })),
    gated: input.gated.map((action) => ({
      type: action.type,
      assetName: action.assetName,
      policyDecision: action.policyDecision,
      policyReason: action.policyReason,
    })),
    collar: {
      maxBudget: input.collar.maxBudget,
      maxDailyBudget: input.collar.maxDailyBudget || 0,
      maxSpendPerAsset: input.collar.maxSpendPerAsset,
      maxDrawdownPct: input.collar.maxDrawdownPct || 0,
      requireApprovalAbove: input.collar.requireApprovalAbove || 0,
    },
    approvals: {
      pending: input.gated.filter((a) => a.policyDecision === 'needs_approval').length,
      approved: input.gated.filter((a) => a.policyDecision === 'approved').length,
      blocked: input.gated.filter((a) => a.policyDecision === 'blocked').length,
    },
    navPreview: {
      startingValue: input.impact.startingValue,
      projectedPostCycleValue: input.impact.projectedPostCycleValue,
      navDelta: input.impact.navDelta,
      estimatedTotalTax: input.impact.estimatedTotalTax,
    },
    disclosure: `${AUTOPILOT_REPLAY_DISCLOSURE} ${AUTOPILOT_IMPACT_DISCLOSURE}`,
  };

  const next = [entry, ...listAutopilotReplay().filter((row) => row.id !== entry.id)].slice(0, MAX_ENTRIES);
  store.set(AUTOPILOT_REPLAY_KEY, next);
  return entry;
}
