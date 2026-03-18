import { store } from './dal/syncStore';

export interface NegotiationPlaybook {
  id: string;
  name: string;
  description: string;
  icon: string;               // emoji for UI display
  openingMultiplier: number;   // Starting offer as fraction of ask price
  incrementRate: number;       // How much to raise each round (fraction of gap)
  maxRounds: number;           // Walk away after N rounds
  firmness: 'soft' | 'moderate' | 'firm' | 'aggressive';
  walkAwayThreshold: number;   // Walk away if seller won't go below this % of ask
}

/** Built-in negotiation strategy templates */
export const PLAYBOOKS: NegotiationPlaybook[] = [
  {
    id: 'lowball-walk',
    name: 'Lowball & Walk',
    description: 'Start very low, move slowly, walk away if seller resists. Best for buyers market conditions.',
    icon: '🎯',
    openingMultiplier: 0.50,
    incrementRate: 0.15,
    maxRounds: 4,
    firmness: 'aggressive',
    walkAwayThreshold: 0.75
  },
  {
    id: 'fair-market',
    name: 'Fair Market Anchor',
    description: 'Anchor to recent comps and FMV. Reasonable starting point with moderate flexibility.',
    icon: '⚖️',
    openingMultiplier: 0.75,
    incrementRate: 0.30,
    maxRounds: 6,
    firmness: 'moderate',
    walkAwayThreshold: 0.90
  },
  {
    id: 'bundle-discount',
    name: 'Bundle Discount',
    description: 'Offer to buy multiple items for a volume discount. Emphasize total deal size.',
    icon: '📦',
    openingMultiplier: 0.70,
    incrementRate: 0.25,
    maxRounds: 5,
    firmness: 'moderate',
    walkAwayThreshold: 0.85
  },
  {
    id: 'quick-close',
    name: 'Quick Close',
    description: 'Start near ask, close fast. Best for hot cards where speed matters more than savings.',
    icon: '⚡',
    openingMultiplier: 0.90,
    incrementRate: 0.50,
    maxRounds: 3,
    firmness: 'soft',
    walkAwayThreshold: 0.98
  }
];

export const STORAGE_KEY = 'msi-custom-playbooks';

/** Load user's custom playbooks from localStorage */
export function getCustomPlaybooks(): NegotiationPlaybook[] {
  return store.get<NegotiationPlaybook[]>(STORAGE_KEY, []);
}

/** Save a custom playbook */
export function saveCustomPlaybook(playbook: NegotiationPlaybook): void {
  const existing = getCustomPlaybooks();
  const idx = existing.findIndex(p => p.id === playbook.id);
  if (idx >= 0) {
    existing[idx] = playbook;
  } else {
    existing.push(playbook);
  }
  store.set(STORAGE_KEY, existing);
}

/** Delete a custom playbook */
export function deleteCustomPlaybook(id: string): void {
  const existing = getCustomPlaybooks().filter(p => p.id !== id);
  store.set(STORAGE_KEY, existing);
}

/** Get all playbooks (built-in + custom) */
export function getAllPlaybooks(): NegotiationPlaybook[] {
  return [...PLAYBOOKS, ...getCustomPlaybooks()];
}

/**
 * Calculate the agent's next offer based on a playbook strategy.
 * Returns null if the agent should walk away.
 */
export function getPlaybookOffer(
  playbook: NegotiationPlaybook,
  askPrice: number,
  maxWillingToPay: number,
  currentOffer: number,
  roundNumber: number
): { amount: number; shouldWalk: boolean; message: string } {
  // Walk away if exceeded max rounds
  if (roundNumber > playbook.maxRounds) {
    return {
      amount: currentOffer,
      shouldWalk: true,
      message: `I've reached my limit. I'll pass at this price.`
    };
  }

  // First offer
  if (currentOffer === 0 || roundNumber === 1) {
    const opening = Math.floor(askPrice * playbook.openingMultiplier);
    const capped = Math.min(opening, maxWillingToPay);
    return {
      amount: capped,
      shouldWalk: false,
      message: `I'll start at $${capped.toLocaleString()}.`
    };
  }

  // Subsequent offers: close the gap incrementally
  const gap = askPrice - currentOffer;
  const increment = Math.floor(gap * playbook.incrementRate);
  const nextOffer = Math.min(currentOffer + increment, maxWillingToPay);

  // Walk away if we'd exceed our threshold
  const thresholdPrice = askPrice * playbook.walkAwayThreshold;
  if (nextOffer > thresholdPrice && nextOffer < askPrice * 0.95) {
    return {
      amount: nextOffer,
      shouldWalk: true,
      message: `$${nextOffer.toLocaleString()} is my final offer. Take it or leave it.`
    };
  }

  return {
    amount: nextOffer,
    shouldWalk: false,
    message: `I can go to $${nextOffer.toLocaleString()}.`
  };
}
