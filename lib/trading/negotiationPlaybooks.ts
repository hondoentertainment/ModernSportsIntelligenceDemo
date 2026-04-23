// @ts-nocheck
// Phase 16: reusable negotiation strategies for the AI acquisition agent (demo / prototype).
import { store } from '../dal/syncStore';

const STORAGE_KEY = 'msi_negotiation_playbook_id';

export interface NegotiationPlaybook {
  id: string;
  label: string;
  description: string;
  /** Opening offer as a fraction of seller ask (e.g. 0.78). */
  openingPctOfAsk: number;
  /** Added to seller- or market-average discount % to derive target settlement (can be negative). */
  targetDiscountAdjustPts: number;
  /** Planning horizon for mock agent behavior copy. */
  maxRoundsHint: number;
  /** Instruction line merged into strategy / future Gemini prompts. */
  agentDirective: string;
}

export const NEGOTIATION_PLAYBOOKS: NegotiationPlaybook[] = [
  {
    id: 'lowball_walk',
    label: 'Lowball & Walk',
    description: 'Aggressive open, few counters. Exit if the seller will not move toward your max.',
    openingPctOfAsk: 0.72,
    targetDiscountAdjustPts: 4,
    maxRoundsHint: 2,
    agentDirective: 'Maximize discount; be ready to walk away rather than chase marginal gains.',
  },
  {
    id: 'fair_market_anchor',
    label: 'Fair Market Anchor',
    description: 'Open closer to comps; collaborative tone; expect several constructive rounds.',
    openingPctOfAsk: 0.82,
    targetDiscountAdjustPts: -2,
    maxRoundsHint: 4,
    agentDirective: 'Anchor to comparable sales and seek a fair midpoint both sides can accept.',
  },
  {
    id: 'bundle_friendly',
    label: 'Bundle Discount',
    description: 'Optimize for multi-card lots and tiered pricing when the seller has depth.',
    openingPctOfAsk: 0.78,
    targetDiscountAdjustPts: 2,
    maxRoundsHint: 3,
    agentDirective: 'Signal appetite for multiple cards and ask for package pricing where possible.',
  },
  {
    id: 'patient_comps',
    label: 'Patient Comps',
    description: 'Slower cadence; emphasize fresh comps between rounds before moving price.',
    openingPctOfAsk: 0.76,
    targetDiscountAdjustPts: 0,
    maxRoundsHint: 5,
    agentDirective: 'Pause between counters to cite or request updated comparable sales.',
  },
];

const DEFAULT_ID = 'fair_market_anchor';

export function getNegotiationPlaybooks(): NegotiationPlaybook[] {
  return NEGOTIATION_PLAYBOOKS;
}

export function getPlaybookById(id: string): NegotiationPlaybook | undefined {
  return NEGOTIATION_PLAYBOOKS.find((p) => p.id === id);
}

export function getSelectedPlaybookId(): string {
  const id = store.get<string>(STORAGE_KEY, DEFAULT_ID);
  return getPlaybookById(id) ? id : DEFAULT_ID;
}

export function setSelectedPlaybookId(id: string): void {
  if (!getPlaybookById(id)) return;
  store.set(STORAGE_KEY, id);
}

export function getSelectedPlaybook(): NegotiationPlaybook {
  const found = getPlaybookById(getSelectedPlaybookId());
  if (found) return found;
  return NEGOTIATION_PLAYBOOKS.find((p) => p.id === DEFAULT_ID) ?? NEGOTIATION_PLAYBOOKS[0];
}
