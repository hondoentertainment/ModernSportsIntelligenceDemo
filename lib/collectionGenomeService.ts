// ---- Types ----

export type CollectorType =
  | 'trophy_hunter'
  | 'value_investor'
  | 'prospect_speculator'
  | 'vintage_purist'
  | 'set_builder'
  | 'momentum_trader'
  | 'contrarian'
  | 'diversifier';

export type TraitCategory = 'risk' | 'strategy' | 'preference' | 'behavior';

export interface GenomeTrait {
  name: string;
  score: number; // 0-100
  description: string;
  category: TraitCategory;
}

export interface CollectorGenome {
  collectorType: CollectorType;
  typeDescription: string;
  confidence: number; // 0-100
  traits: GenomeTrait[];
  blindSpots: string[];
  strengths: string[];
  recommendations: string[];
}

export interface BehavioralBias {
  name: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  example: string;
  recommendation: string;
}

export interface CollectorComparison {
  yourGenome: Record<string, number>;
  avgCollector: Record<string, number>;
  percentiles: Record<string, number>;
}

export interface GenomeStats {
  type: CollectorType;
  typeLabel: string;
  topTraits: { name: string; score: number }[];
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

// ---- Constants ----

const GENOME_KEY = 'msi_collection_genome';
const BIASES_KEY = 'msi_genome_biases';
const COMPARISON_KEY = 'msi_genome_comparison';

const TYPE_LABELS: Record<CollectorType, string> = {
  trophy_hunter: 'Trophy Hunter',
  value_investor: 'Value Investor',
  prospect_speculator: 'Prospect Speculator',
  vintage_purist: 'Vintage Purist',
  set_builder: 'Set Builder',
  momentum_trader: 'Momentum Trader',
  contrarian: 'Contrarian',
  diversifier: 'Diversifier',
};

const TYPE_DESCRIPTIONS: Record<CollectorType, string> = {
  trophy_hunter: 'You pursue the most prestigious, high-value cards regardless of market conditions. PSA 10s, rare parallels, and iconic rookie cards dominate your portfolio.',
  value_investor: 'You seek undervalued cards with strong fundamentals and long-term upside. Patient accumulation of mispriced assets is your hallmark strategy.',
  prospect_speculator: 'You bet on future potential, loading up on young talent before breakout seasons. High risk, high reward defines your approach.',
  vintage_purist: 'You gravitate toward pre-2000 cards with historical significance. Condition-sensitive and deeply knowledgeable about card history.',
  set_builder: 'You derive satisfaction from completing sets and checklists. Methodical and persistent, you value comprehensiveness over individual card value.',
  momentum_trader: 'You ride market trends, buying into hot players and selling at peak hype. Quick reflexes and market awareness are your advantages.',
  contrarian: 'You buy when others panic and sell when others are euphoric. Your portfolio often looks contrarian to mainstream collector sentiment.',
  diversifier: 'You spread exposure across sports, eras, and card types. Risk mitigation through breadth is your core philosophy.',
};

// ---- Simulated Trait Generation ----

function buildTraits(): GenomeTrait[] {
  return [
    { name: 'riskTolerance', score: 68, description: 'Willingness to hold volatile or speculative cards', category: 'risk' },
    { name: 'concentrationBias', score: 54, description: 'Tendency to over-allocate to a few players or sets', category: 'behavior' },
    { name: 'sportDiversification', score: 42, description: 'Spread of holdings across different sports leagues', category: 'strategy' },
    { name: 'eraDiversification', score: 35, description: 'Spread of holdings across different card eras (vintage to modern)', category: 'strategy' },
    { name: 'gradeSensitivity', score: 78, description: 'Preference for high-grade authenticated cards over raw', category: 'preference' },
    { name: 'momentumChasing', score: 61, description: 'Tendency to buy cards that are already trending upward', category: 'behavior' },
    { name: 'lossAversion', score: 47, description: 'Reluctance to sell cards at a loss even when fundamentals deteriorate', category: 'risk' },
    { name: 'holderBias', score: 72, description: 'Tendency to hold cards too long past optimal selling windows', category: 'behavior' },
    { name: 'flipperTendency', score: 33, description: 'Frequency of quick buy-sell cycles for short-term profit', category: 'behavior' },
    { name: 'vintageAffinity', score: 28, description: 'Attraction to pre-2000 and vintage-era cards', category: 'preference' },
    { name: 'modernAffinity', score: 82, description: 'Attraction to modern-era cards (2015+)', category: 'preference' },
    { name: 'prospectAppetite', score: 74, description: 'Willingness to invest in unproven young players', category: 'risk' },
  ];
}

// ---- Service Functions ----

export function analyzeGenome(): CollectorGenome {
  const cached = localStorage.getItem(GENOME_KEY);
  if (cached) {
    try { return JSON.parse(cached) as CollectorGenome; } catch { /* regenerate */ }
  }

  const traits = buildTraits();

  const genome: CollectorGenome = {
    collectorType: 'value_investor',
    typeDescription: 'Value Investor / Prospect Speculator hybrid — You combine disciplined value analysis with calculated bets on emerging talent. Your portfolio blends undervalued blue-chips with high-upside prospects, creating a barbell strategy that balances stability with explosive growth potential.',
    confidence: 84,
    traits,
    blindSpots: [
      'Vintage gap: Only 6% of your portfolio is pre-2000 cards — you may be missing underpriced vintage opportunities',
      'Sport concentration: 71% of holdings are in a single sport, creating outsized event risk',
      'Set completion neglect: You rarely pursue complete sets, missing the premium that set collectors pay',
      'Sell discipline: Your average hold time is 2.3x longer than optimal based on historical price curves',
    ],
    strengths: [
      'Strong prospect identification: 68% of your prospect picks have appreciated 30%+ within 12 months',
      'Grade awareness: Your average card grade is PSA 9.1, well above the platform median of 7.8',
      'Contrarian timing: You tend to buy during dips rather than chasing peaks',
      'Value discipline: Your average cost basis is 14% below current market comps at time of purchase',
    ],
    recommendations: [
      'Allocate 10-15% of new acquisitions to vintage cards (pre-1990) to diversify era exposure',
      'Reduce single-sport concentration below 60% by exploring basketball and soccer cards',
      'Implement a 90-day review cycle for holdings — sell cards that haven\'t met your thesis within that window',
      'Consider completing 1-2 flagship sets (e.g., Topps Chrome base) to capture set-completion premiums',
      'Set stop-loss thresholds at -20% for speculative prospect positions to limit downside',
    ],
  };

  localStorage.setItem(GENOME_KEY, JSON.stringify(genome));
  return genome;
}

export function getBehavioralBiases(): BehavioralBias[] {
  const cached = localStorage.getItem(BIASES_KEY);
  if (cached) {
    try { return JSON.parse(cached) as BehavioralBias[]; } catch { /* regenerate */ }
  }

  const biases: BehavioralBias[] = [
    {
      name: 'Recency Bias',
      severity: 'high',
      description: 'You disproportionately weight recent performance when making buying decisions.',
      example: '73% of purchases in the last 90 days were cards that had already risen 20%+ in the prior 30 days.',
      recommendation: 'Before buying a trending card, check its 12-month price history. If it\'s at a 90-day high, consider waiting for a pullback.',
    },
    {
      name: 'Endowment Effect',
      severity: 'medium',
      description: 'You overvalue cards you already own compared to their market price.',
      example: 'Your listed sale prices average 18% above comparable recent sales on eBay and PWCC.',
      recommendation: 'Use market comps (not your purchase price) when evaluating whether to hold or sell. Set automatic price alerts for your holdings.',
    },
    {
      name: 'Anchoring Bias',
      severity: 'medium',
      description: 'Your buying decisions are anchored to the first price you see rather than fair market value.',
      example: 'You passed on 4 cards that later appreciated because the asking price was above the first comp you checked.',
      recommendation: 'Always check at least 3 recent comparable sales before deciding on a fair price. Use aggregated pricing tools.',
    },
    {
      name: 'Confirmation Bias',
      severity: 'high',
      description: 'You seek information that confirms your existing thesis while ignoring contradictory signals.',
      example: 'For your top 5 holdings, you\'ve read 12x more bullish articles than bearish analysis.',
      recommendation: 'Deliberately seek out bear cases for your largest positions. Join collector communities with diverse viewpoints.',
    },
    {
      name: 'Sunk Cost Fallacy',
      severity: 'low',
      description: 'You hold declining cards because of what you already invested rather than future outlook.',
      example: '3 cards in your portfolio are down 30%+ but you haven\'t sold because of the original investment.',
      recommendation: 'Ask yourself: "Would I buy this card today at this price?" If no, consider selling regardless of your cost basis.',
    },
    {
      name: 'Herd Behavior',
      severity: 'medium',
      description: 'Your buying patterns correlate strongly with social media sentiment and community trends.',
      example: '58% of your purchases coincide with spikes in social media mentions for the same player.',
      recommendation: 'Implement a 48-hour cooling-off period after seeing a hyped card on social media before purchasing.',
    },
  ];

  localStorage.setItem(BIASES_KEY, JSON.stringify(biases));
  return biases;
}

export function getCollectorComparison(): CollectorComparison {
  const cached = localStorage.getItem(COMPARISON_KEY);
  if (cached) {
    try { return JSON.parse(cached) as CollectorComparison; } catch { /* regenerate */ }
  }

  const comparison: CollectorComparison = {
    yourGenome: {
      riskTolerance: 68,
      concentrationBias: 54,
      sportDiversification: 42,
      eraDiversification: 35,
      gradeSensitivity: 78,
      momentumChasing: 61,
      lossAversion: 47,
      holderBias: 72,
      flipperTendency: 33,
      vintageAffinity: 28,
      modernAffinity: 82,
      prospectAppetite: 74,
    },
    avgCollector: {
      riskTolerance: 55,
      concentrationBias: 62,
      sportDiversification: 51,
      eraDiversification: 48,
      gradeSensitivity: 58,
      momentumChasing: 67,
      lossAversion: 59,
      holderBias: 64,
      flipperTendency: 45,
      vintageAffinity: 40,
      modernAffinity: 68,
      prospectAppetite: 52,
    },
    percentiles: {
      riskTolerance: 72,
      concentrationBias: 38,
      sportDiversification: 31,
      eraDiversification: 24,
      gradeSensitivity: 89,
      momentumChasing: 42,
      lossAversion: 28,
      holderBias: 67,
      flipperTendency: 22,
      vintageAffinity: 18,
      modernAffinity: 81,
      prospectAppetite: 85,
    },
  };

  localStorage.setItem(COMPARISON_KEY, JSON.stringify(comparison));
  return comparison;
}

export function getGenomeStats(): GenomeStats {
  const genome = analyzeGenome();
  const sorted = [...genome.traits].sort((a, b) => b.score - a.score);
  const avgRisk = genome.traits
    .filter(t => t.category === 'risk')
    .reduce((sum, t) => sum + t.score, 0) / genome.traits.filter(t => t.category === 'risk').length;

  return {
    type: genome.collectorType,
    typeLabel: TYPE_LABELS[genome.collectorType],
    topTraits: sorted.slice(0, 3).map(t => ({ name: t.name, score: t.score })),
    riskProfile: avgRisk > 65 ? 'aggressive' : avgRisk > 45 ? 'moderate' : 'conservative',
  };
}

// ---- Helpers ----

export function getTypeLabel(type: CollectorType): string {
  return TYPE_LABELS[type];
}

export function getTraitLabel(traitName: string): string {
  const labels: Record<string, string> = {
    riskTolerance: 'Risk Tolerance',
    concentrationBias: 'Concentration Bias',
    sportDiversification: 'Sport Diversification',
    eraDiversification: 'Era Diversification',
    gradeSensitivity: 'Grade Sensitivity',
    momentumChasing: 'Momentum Chasing',
    lossAversion: 'Loss Aversion',
    holderBias: 'Holder Bias',
    flipperTendency: 'Flipper Tendency',
    vintageAffinity: 'Vintage Affinity',
    modernAffinity: 'Modern Affinity',
    prospectAppetite: 'Prospect Appetite',
  };
  return labels[traitName] ?? traitName;
}

export function getCategoryColor(category: TraitCategory): { text: string; bg: string; border: string } {
  switch (category) {
    case 'risk': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    case 'strategy': return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'preference': return { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
    case 'behavior': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
  }
}

export function getSeverityColor(severity: 'low' | 'medium' | 'high'): { text: string; bg: string; border: string } {
  switch (severity) {
    case 'low': return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'medium': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    case 'high': return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
  }
}
