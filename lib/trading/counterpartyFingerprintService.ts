// @ts-nocheck
// ─────────────────────────────────────────────────────────────
// Counterparty Behavioral Fingerprinting – Service Layer
// Infers cognitive biases from transaction patterns
// ─────────────────────────────────────────────────────────────

export type BehavioralBias = 'loss-aversion' | 'anchoring' | 'endowment-effect' | 'hyperbolic-discounting' | 'fomo' | 'sunk-cost' | 'confirmation-bias';

export type CounterpartyArchetype = 'impatient-liquidator' | 'anchored-hoarder' | 'fomo-chaser' | 'rational-optimizer' | 'emotional-collector' | 'value-hunter';

export interface CounterpartyProfile {
  id: string;
  handle: string;
  archetype: CounterpartyArchetype;
  dominantBiases: {
    bias: BehavioralBias;
    strength: number; // 0-100
  }[];
  avgDaysOnMarket: number;
  priceAcceptanceThreshold: number; // % of asking they accept
  historicalTransactions: number;
  responseTime: string;
  bestNegotiationTactic: string;
  predictedAcceptanceRange: {
    low: number;  // % of asking
    high: number; // % of asking
  };
  reliability: number; // 0-100
  lastActive: string;
}

export interface NegotiationIntel {
  counterpartyId: string;
  suggestedOpeningOffer: number; // % of asking
  optimalTiming: string;
  bestApproach: string;
  avoidActions: string[];
  expectedCounterOffer: number; // % of asking
  confidence: number; // 0-100
}

export interface FingerprintStats {
  totalProfiled: number;
  avgReliability: number;
  mostCommonArchetype: string;
  mostCommonBias: string;
  successRate: number; // % of deals closed with intel
}

// ── Mock Counterparty Profiles (10 profiles) ─────────────────

const MOCK_COUNTERPARTY_PROFILES: CounterpartyProfile[] = [
  {
    id: 'cp-001',
    handle: 'CardVaultKing',
    archetype: 'anchored-hoarder',
    dominantBiases: [
      { bias: 'endowment-effect', strength: 92 },
      { bias: 'anchoring', strength: 85 },
      { bias: 'sunk-cost', strength: 68 },
    ],
    avgDaysOnMarket: 45,
    priceAcceptanceThreshold: 94,
    historicalTransactions: 312,
    responseTime: '4-6 hours',
    bestNegotiationTactic: 'Present comparable sales data to break anchoring. Show 3+ recent comps below their asking price to shift their reference point.',
    predictedAcceptanceRange: { low: 90, high: 98 },
    reliability: 88,
    lastActive: '2026-03-16',
  },
  {
    id: 'cp-002',
    handle: 'QuickFlipMike',
    archetype: 'impatient-liquidator',
    dominantBiases: [
      { bias: 'hyperbolic-discounting', strength: 94 },
      { bias: 'loss-aversion', strength: 42 },
    ],
    avgDaysOnMarket: 3,
    priceAcceptanceThreshold: 78,
    historicalTransactions: 1847,
    responseTime: '8-15 minutes',
    bestNegotiationTactic: 'Offer immediate payment. This seller values speed over price — a quick PayPal or Venmo close beats a higher offer with delayed payment.',
    predictedAcceptanceRange: { low: 72, high: 85 },
    reliability: 74,
    lastActive: '2026-03-17',
  },
  {
    id: 'cp-003',
    handle: 'HypeBeastCards',
    archetype: 'fomo-chaser',
    dominantBiases: [
      { bias: 'fomo', strength: 96 },
      { bias: 'confirmation-bias', strength: 78 },
      { bias: 'anchoring', strength: 55 },
    ],
    avgDaysOnMarket: 8,
    priceAcceptanceThreshold: 105,
    historicalTransactions: 523,
    responseTime: '2-5 minutes',
    bestNegotiationTactic: 'Create urgency — mention other interested buyers. This counterparty overpays when they feel competition. Frame your card as the last available at this grade.',
    predictedAcceptanceRange: { low: 95, high: 115 },
    reliability: 62,
    lastActive: '2026-03-17',
  },
  {
    id: 'cp-004',
    handle: 'DataDrivenCollector',
    archetype: 'rational-optimizer',
    dominantBiases: [
      { bias: 'anchoring', strength: 35 },
      { bias: 'confirmation-bias', strength: 28 },
    ],
    avgDaysOnMarket: 14,
    priceAcceptanceThreshold: 88,
    historicalTransactions: 891,
    responseTime: '1-2 hours',
    bestNegotiationTactic: 'Lead with data. This buyer respects market analysis and will pay fair value if justified. Present your price with PSA population reports, recent sale history, and trend analysis.',
    predictedAcceptanceRange: { low: 85, high: 92 },
    reliability: 95,
    lastActive: '2026-03-16',
  },
  {
    id: 'cp-005',
    handle: 'NostalgiaCollector88',
    archetype: 'emotional-collector',
    dominantBiases: [
      { bias: 'endowment-effect', strength: 88 },
      { bias: 'sunk-cost', strength: 82 },
      { bias: 'loss-aversion', strength: 76 },
    ],
    avgDaysOnMarket: 62,
    priceAcceptanceThreshold: 97,
    historicalTransactions: 156,
    responseTime: '12-24 hours',
    bestNegotiationTactic: 'Appeal to the story of the card, not the price. Emotional collectors respond to provenance and narrative. Mention the card\'s history, the player\'s legacy, or its rarity in context.',
    predictedAcceptanceRange: { low: 92, high: 100 },
    reliability: 91,
    lastActive: '2026-03-14',
  },
  {
    id: 'cp-006',
    handle: 'BargainHunterJay',
    archetype: 'value-hunter',
    dominantBiases: [
      { bias: 'anchoring', strength: 72 },
      { bias: 'loss-aversion', strength: 65 },
      { bias: 'hyperbolic-discounting', strength: 40 },
    ],
    avgDaysOnMarket: 21,
    priceAcceptanceThreshold: 82,
    historicalTransactions: 634,
    responseTime: '30-60 minutes',
    bestNegotiationTactic: 'Start high and let them negotiate down. Value hunters derive satisfaction from feeling they got a deal. Price 12-15% above your target and concede slowly.',
    predictedAcceptanceRange: { low: 78, high: 86 },
    reliability: 83,
    lastActive: '2026-03-17',
  },
  {
    id: 'cp-007',
    handle: 'WhaleBuyer_NYC',
    archetype: 'rational-optimizer',
    dominantBiases: [
      { bias: 'anchoring', strength: 48 },
      { bias: 'confirmation-bias', strength: 38 },
    ],
    avgDaysOnMarket: 7,
    priceAcceptanceThreshold: 91,
    historicalTransactions: 2104,
    responseTime: '30-45 minutes',
    bestNegotiationTactic: 'Bundle deals work best. This buyer purchases in volume and expects a 5-8% discount for multi-card transactions. Present curated lots aligned with their collection focus.',
    predictedAcceptanceRange: { low: 88, high: 95 },
    reliability: 97,
    lastActive: '2026-03-17',
  },
  {
    id: 'cp-008',
    handle: 'PanicSeller2024',
    archetype: 'impatient-liquidator',
    dominantBiases: [
      { bias: 'loss-aversion', strength: 91 },
      { bias: 'hyperbolic-discounting', strength: 88 },
      { bias: 'fomo', strength: 72 },
    ],
    avgDaysOnMarket: 1,
    priceAcceptanceThreshold: 68,
    historicalTransactions: 289,
    responseTime: '3-8 minutes',
    bestNegotiationTactic: 'Lowball with confidence. This seller panics during market dips and accepts well below market. Offer 65-70% of market value with immediate payment and they will often accept.',
    predictedAcceptanceRange: { low: 62, high: 75 },
    reliability: 58,
    lastActive: '2026-03-16',
  },
  {
    id: 'cp-009',
    handle: 'GradedGemMint',
    archetype: 'anchored-hoarder',
    dominantBiases: [
      { bias: 'endowment-effect', strength: 95 },
      { bias: 'anchoring', strength: 90 },
      { bias: 'confirmation-bias', strength: 74 },
    ],
    avgDaysOnMarket: 90,
    priceAcceptanceThreshold: 98,
    historicalTransactions: 78,
    responseTime: '24-48 hours',
    bestNegotiationTactic: 'Patience is key. This seller anchors to peak prices from 2021 and will not budge quickly. Wait for their listing to age 60+ days, then offer 88% of current market — their resolve weakens over time.',
    predictedAcceptanceRange: { low: 94, high: 100 },
    reliability: 85,
    lastActive: '2026-03-10',
  },
  {
    id: 'cp-010',
    handle: 'TrendRiderAlex',
    archetype: 'fomo-chaser',
    dominantBiases: [
      { bias: 'fomo', strength: 89 },
      { bias: 'confirmation-bias', strength: 82 },
      { bias: 'sunk-cost', strength: 58 },
    ],
    avgDaysOnMarket: 5,
    priceAcceptanceThreshold: 108,
    historicalTransactions: 412,
    responseTime: '5-10 minutes',
    bestNegotiationTactic: 'Sell to this buyer during narrative peaks — they chase trending players and will pay 5-15% above market when a player is in the news. Time your offer to coincide with a big game or media mention.',
    predictedAcceptanceRange: { low: 98, high: 118 },
    reliability: 66,
    lastActive: '2026-03-17',
  },
];

// ── Mock Negotiation Intel (5 items) ─────────────────────────

const MOCK_NEGOTIATION_INTEL: NegotiationIntel[] = [
  {
    counterpartyId: 'cp-002',
    suggestedOpeningOffer: 72,
    optimalTiming: 'Friday evening — QuickFlipMike lists heavily on Fridays and accepts lowballs before the weekend',
    bestApproach: 'Send a clean, no-haggle offer at 72% of asking with "PayPal ready, can close in 10 minutes." Speed is the currency this seller values most.',
    avoidActions: [
      'Do not ask for additional photos or condition details — delays kill the deal',
      'Do not counter-offer more than once — they will move on to the next buyer',
      'Do not reference market data — they already know and do not care',
    ],
    expectedCounterOffer: 80,
    confidence: 85,
  },
  {
    counterpartyId: 'cp-005',
    suggestedOpeningOffer: 92,
    optimalTiming: 'Weekday evenings — NostalgiaCollector88 browses after work and is most emotionally engaged',
    bestApproach: 'Open with a message about the card\'s significance. Mention the player\'s career highlights or the set\'s place in hobby history before discussing price. Then offer 92% as a "fair price for a fellow collector."',
    avoidActions: [
      'Do not use aggressive negotiation tactics — emotional collectors shut down',
      'Do not mention "investment value" — this is a collector, not a flipper',
      'Do not rush the conversation — they need time to process',
    ],
    expectedCounterOffer: 96,
    confidence: 78,
  },
  {
    counterpartyId: 'cp-008',
    suggestedOpeningOffer: 65,
    optimalTiming: 'During market dips or after bad news — PanicSeller2024 lists immediately and accepts fast',
    bestApproach: 'Monitor for new listings from this seller during market downturns. Send an immediate offer at 65% with proof of funds. They accept within minutes during panic episodes.',
    avoidActions: [
      'Do not wait — their listings sell within hours to other bargain hunters',
      'Do not offer fair market value — they expect to lose money and will be suspicious of full-price offers',
      'Do not negotiate up from your opening — hold firm at 65-68%',
    ],
    expectedCounterOffer: 70,
    confidence: 82,
  },
  {
    counterpartyId: 'cp-007',
    suggestedOpeningOffer: 88,
    optimalTiming: 'Tuesday or Wednesday midday — WhaleBuyer_NYC reviews offers during business lunch hours',
    bestApproach: 'Present a curated bundle of 3-5 cards in their collection focus area. Offer 88% of combined asking with a volume discount framing. Include PSA population data and recent auction results.',
    avoidActions: [
      'Do not waste their time with low-value cards under $200',
      'Do not use emotional appeals — they are purely analytical',
      'Do not send multiple follow-up messages — one professional pitch is sufficient',
    ],
    expectedCounterOffer: 92,
    confidence: 88,
  },
  {
    counterpartyId: 'cp-009',
    suggestedOpeningOffer: 85,
    optimalTiming: 'After 60+ days of listing — GradedGemMint\'s resolve weakens significantly after 2 months',
    bestApproach: 'Reference the listing duration tactfully: "I\'ve been watching this card for a while and I\'d love to add it to my collection at $X." Start at 85% and be prepared to negotiate up to 92%.',
    avoidActions: [
      'Do not reference current market prices directly — they anchor to historical highs',
      'Do not lowball aggressively — they will block you permanently',
      'Do not mention that the card has been listed for a long time — they are sensitive about it',
    ],
    expectedCounterOffer: 95,
    confidence: 72,
  },
];

// ── Public API Functions ─────────────────────────────────────

export function getCounterpartyProfiles(): CounterpartyProfile[] {
  return MOCK_COUNTERPARTY_PROFILES;
}

export function getNegotiationIntel(counterpartyId?: string): NegotiationIntel[] {
  if (!counterpartyId) return MOCK_NEGOTIATION_INTEL;
  return MOCK_NEGOTIATION_INTEL.filter(n => n.counterpartyId === counterpartyId);
}

export function getFingerprintStats(): FingerprintStats {
  const profiles = MOCK_COUNTERPARTY_PROFILES;
  const avgReliability = profiles.reduce((sum, p) => sum + p.reliability, 0) / profiles.length;

  const archetypeCounts: Record<string, number> = {};
  profiles.forEach(p => {
    archetypeCounts[p.archetype] = (archetypeCounts[p.archetype] || 0) + 1;
  });
  const mostCommonArchetype = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])[0][0];

  const biasCounts: Record<string, number> = {};
  profiles.forEach(p => {
    p.dominantBiases.forEach(b => {
      biasCounts[b.bias] = (biasCounts[b.bias] || 0) + 1;
    });
  });
  const mostCommonBias = Object.entries(biasCounts).sort((a, b) => b[1] - a[1])[0][0];

  return {
    totalProfiled: profiles.length,
    avgReliability: Math.round(avgReliability),
    mostCommonArchetype,
    mostCommonBias,
    successRate: 73.4,
  };
}

export function getArchetypeColor(archetype: CounterpartyArchetype): string {
  const colors: Record<CounterpartyArchetype, string> = {
    'impatient-liquidator': 'text-red-400',
    'anchored-hoarder': 'text-amber-400',
    'fomo-chaser': 'text-pink-400',
    'rational-optimizer': 'text-green-400',
    'emotional-collector': 'text-purple-400',
    'value-hunter': 'text-cyan-400',
  };
  return colors[archetype];
}

export function getArchetypeLabel(archetype: CounterpartyArchetype): string {
  const labels: Record<CounterpartyArchetype, string> = {
    'impatient-liquidator': 'Impatient Liquidator',
    'anchored-hoarder': 'Anchored Hoarder',
    'fomo-chaser': 'FOMO Chaser',
    'rational-optimizer': 'Rational Optimizer',
    'emotional-collector': 'Emotional Collector',
    'value-hunter': 'Value Hunter',
  };
  return labels[archetype];
}

export function getBiasLabel(bias: BehavioralBias): string {
  const labels: Record<BehavioralBias, string> = {
    'loss-aversion': 'Loss Aversion',
    'anchoring': 'Anchoring',
    'endowment-effect': 'Endowment Effect',
    'hyperbolic-discounting': 'Hyperbolic Discounting',
    'fomo': 'FOMO',
    'sunk-cost': 'Sunk Cost Fallacy',
    'confirmation-bias': 'Confirmation Bias',
  };
  return labels[bias];
}

export function getBiasColor(bias: BehavioralBias): string {
  const colors: Record<BehavioralBias, string> = {
    'loss-aversion': 'text-red-400',
    'anchoring': 'text-amber-400',
    'endowment-effect': 'text-purple-400',
    'hyperbolic-discounting': 'text-orange-400',
    'fomo': 'text-pink-400',
    'sunk-cost': 'text-slate-400',
    'confirmation-bias': 'text-blue-400',
  };
  return colors[bias];
}
