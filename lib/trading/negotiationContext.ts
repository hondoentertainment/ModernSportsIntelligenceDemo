/**
 * Playbook-aware negotiation context for Gemini counters and deterministic fallback.
 * Demo / simulated seller only — not live marketplace trading.
 */
import type { NegotiationPlaybook } from './negotiationPlaybooks';
import { getSelectedPlaybook } from './negotiationPlaybooks';

export type CounterSource = 'gemini' | 'deterministic';

export interface SellerFirmnessHint {
  /** 0 = flexible, 1 = immovable. */
  score: number;
  label: 'Flexible' | 'Measured' | 'Firm';
  rationale: string;
}

export interface PlaybookCounterThresholds {
  acceptGapPct: number;
  lowballGapPct: number;
  concessionMin: number;
  concessionMax: number;
}

export function playbookCounterThresholds(playbook: NegotiationPlaybook): PlaybookCounterThresholds {
  switch (playbook.id) {
    case 'lowball_walk':
      return { acceptGapPct: 0.03, lowballGapPct: 0.35, concessionMin: 0.15, concessionMax: 0.25 };
    case 'bundle_friendly':
      return { acceptGapPct: 0.06, lowballGapPct: 0.38, concessionMin: 0.25, concessionMax: 0.4 };
    case 'patient_comps':
      return { acceptGapPct: 0.05, lowballGapPct: 0.45, concessionMin: 0.2, concessionMax: 0.35 };
    case 'fair_market_anchor':
    default:
      return { acceptGapPct: 0.05, lowballGapPct: 0.4, concessionMin: 0.3, concessionMax: 0.5 };
  }
}

export function estimateSellerFirmness(
  percentGap: number,
  playbook: NegotiationPlaybook = getSelectedPlaybook(),
): SellerFirmnessHint {
  const gap = Number.isFinite(percentGap) ? Math.max(0, percentGap) : 1;
  const thresholds = playbookCounterThresholds(playbook);
  let score: number;
  if (gap <= thresholds.acceptGapPct) {
    score = 0.22;
  } else if (gap > thresholds.lowballGapPct) {
    score = 0.88;
  } else {
    score = 0.42 + (gap / Math.max(thresholds.lowballGapPct, 0.01)) * 0.32;
  }

  if (playbook.id === 'lowball_walk') score = Math.min(1, score + 0.08);
  if (playbook.id === 'patient_comps') score = Math.min(1, score + 0.04);
  if (playbook.id === 'fair_market_anchor') score = Math.max(0, score - 0.05);

  score = Math.round(Math.min(1, Math.max(0, score)) * 100) / 100;
  const label: SellerFirmnessHint['label'] = score >= 0.75 ? 'Firm' : score >= 0.45 ? 'Measured' : 'Flexible';
  return {
    score,
    label,
    rationale: `${Math.round(gap * 100)}% gap vs ${playbook.label} accept/${Math.round(thresholds.lowballGapPct * 100)}% lowball bands.`,
  };
}

export function buildSellerPromptAddendum(
  playbook: NegotiationPlaybook,
  firmness: SellerFirmnessHint,
): string {
  const t = playbookCounterThresholds(playbook);
  return `
BUYER PLAYBOOK (simulated strategy the seller can feel, not a live order):
- Name: ${playbook.label}
- Directive: ${playbook.agentDirective}
- Typical open: ${Math.round(playbook.openingPctOfAsk * 100)}% of ask
- Planning horizon: ~${playbook.maxRoundsHint} rounds
- Accept when gap ≤ ${Math.round(t.acceptGapPct * 100)}%; hold firm / reject when gap > ${Math.round(t.lowballGapPct * 100)}%

SELLER FIRMNESS HINT (heuristic, not a live marketplace signal):
- Score: ${firmness.score} (${firmness.label})
- ${firmness.rationale}

Also return sellerFirmness (0-1) and a short reasoning string for the buyer UI.
Be honest that this is a simulated seller. Do not invent live listings or executed trades.`;
}

export function buildAgentPromptAddendum(playbook: NegotiationPlaybook): string {
  return `
CLIENT PLAYBOOK:
- ${playbook.label}: ${playbook.agentDirective}
- Prefer opening near ${Math.round(playbook.openingPctOfAsk * 100)}% of ask on first move when last offer is 0.
- Target settlement can flex ${playbook.targetDiscountAdjustPts} pts vs typical discount.
- Stay inside max budget. This is a simulated counter — not live marketplace execution.`;
}

export function counterSourceLabel(source: CounterSource | undefined): string {
  if (source === 'gemini') return 'Gemini seller simulation · not live marketplace';
  if (source === 'deterministic') return 'Demo seller · deterministic fallback (Gemini unavailable)';
  return 'Gemini when available · demo fallback otherwise';
}
