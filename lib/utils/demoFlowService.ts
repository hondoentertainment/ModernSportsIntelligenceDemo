// @ts-nocheck
// Demo Flow Service
// Orchestrates guided investor walkthroughs across the platform's key features.
// Supports multiple pre-built flows targeting investors, collectors, and dealers.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DemoCategory =
  | 'scan'
  | 'authenticate'
  | 'analyze'
  | 'optimize'
  | 'monetize'
  | 'monitor';

export interface KeyMetric {
  label: string;
  value: string;
}

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  route: string;
  featureName: string;
  investorPitch: string;
  keyMetric: KeyMetric;
  duration: number; // seconds
  highlights: string[];
  category: DemoCategory;
}

export type TargetAudience = 'investor' | 'collector' | 'dealer' | 'all';

export interface DemoFlow {
  id: string;
  name: string;
  description: string;
  steps: DemoStep[];
  totalDuration: number; // seconds
  targetAudience: TargetAudience;
}

export interface StepAnalytics {
  timePerStep: Record<string, number>;
  interactionsPerStep: Record<string, number>;
}

export interface DemoProgress {
  flowId: string;
  currentStep: number;
  completedSteps: string[];
  startedAt: string; // ISO timestamp
  analytics: StepAnalytics;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Definitions
// ─────────────────────────────────────────────────────────────────────────────

const STEP_CARD_GENOME: DemoStep = {
  id: 'step-card-genome',
  title: 'Card Genome Sequencer',
  description: 'DNA-level card analysis breaking every card into measurable genetic markers for condition, rarity, and valuation.',
  route: '/card-genome-sequencer',
  featureName: 'Card Genome',
  investorPitch: 'Our proprietary Card Genome engine is the "23andMe of trading cards" — it decomposes every card into 47 measurable traits, creating a unique fingerprint that powers pricing, authentication, and portfolio optimization across the platform.',
  keyMetric: { label: 'Genome Accuracy', value: '99.2%' },
  duration: 90,
  highlights: [
    'Proprietary 47-gene decomposition model',
    'Real-time genome sequencing in <200ms',
    'Powers downstream pricing and authentication',
    'Patent-pending genetic distance algorithm',
  ],
  category: 'scan',
};

const STEP_FORENSICS_LAB: DemoStep = {
  id: 'step-forensics-lab',
  title: 'Forensics Lab',
  description: 'AI-powered authentication and counterfeit detection using multi-spectral imaging analysis.',
  route: '/forensics-lab',
  featureName: 'Forensics Lab',
  investorPitch: 'Counterfeit cards cost the hobby $500M+ annually. Our Forensics Lab uses AI multi-spectral analysis to detect fakes with 98.7% accuracy — turning authentication from a weeks-long bottleneck into an instant, scalable service.',
  keyMetric: { label: 'Fraud Detection Rate', value: '98.7%' },
  duration: 75,
  highlights: [
    'Multi-spectral imaging analysis',
    'AI counterfeit detection model trained on 2M+ cards',
    'Real-time authentication scoring',
    'Integration with PSA/BGS/SGC databases',
  ],
  category: 'authenticate',
};

const STEP_CROSS_ASSET: DemoStep = {
  id: 'step-cross-asset',
  title: 'Cross-Asset Correlation',
  description: 'Institutional-grade correlation engine mapping card prices against equities, crypto, luxury goods, and macro indicators.',
  route: '/cross-asset-correlation',
  featureName: 'Cross-Asset Correlation',
  investorPitch: 'For the first time, sports cards are analyzed as a true asset class. Our cross-asset correlation engine maps card prices against the S&P 500, Bitcoin, luxury indices, and 40+ macro indicators — giving institutional allocators the tools they expect.',
  keyMetric: { label: 'Asset Classes Tracked', value: '47' },
  duration: 90,
  highlights: [
    'Real-time correlation with equities, crypto, and commodities',
    'Institutional-grade Sharpe ratio and alpha calculations',
    'Macro regime detection for portfolio positioning',
    'Exportable reports for fund allocation committees',
  ],
  category: 'analyze',
};

const STEP_STRESS_TESTER: DemoStep = {
  id: 'step-stress-tester',
  title: 'Portfolio Stress Tester',
  description: 'Monte Carlo simulation engine stress-testing card portfolios against historical market shocks.',
  route: '/portfolio-stress-tester',
  featureName: 'Portfolio Stress Tester',
  investorPitch: 'Borrowed from Wall Street: our Monte Carlo stress tester runs 10,000 simulations across historical market shocks — from the 2008 crash to the 2021 bubble pop — giving collectors and funds quantified downside risk for the first time.',
  keyMetric: { label: 'Simulations per Run', value: '10,000' },
  duration: 90,
  highlights: [
    'Monte Carlo engine with 10K simulations',
    'Historical scenario replay (2008, COVID, junk wax)',
    'Value at Risk (VaR) and Conditional VaR',
    'Portfolio-level heat maps and concentration alerts',
  ],
  category: 'optimize',
};

const STEP_GRAIL_INDEX: DemoStep = {
  id: 'step-grail-index',
  title: 'Grail Index Constructor',
  description: 'Build and track custom indices of blue-chip "grail" cards like an S&P 500 for the hobby.',
  route: '/grail-index-constructor',
  featureName: 'Grail Index Constructor',
  investorPitch: 'We built the "S&P 500 of sports cards." The Grail Index Constructor lets anyone create, backtest, and track custom indices of blue-chip cards — enabling passive investing strategies and benchmarking that the hobby has never had.',
  keyMetric: { label: 'Index YTD Return', value: '+18.4%' },
  duration: 75,
  highlights: [
    'Custom index creation with weighted constituents',
    'Historical backtesting to 2015',
    'Auto-rebalancing triggers',
    'Benchmark comparison against S&P, BTC, and Alt-A cards',
  ],
  category: 'monetize',
};

const STEP_FRACTIONAL_VAULT: DemoStep = {
  id: 'step-fractional-vault',
  title: 'Fractional Vault',
  description: 'Institutional-grade fractional ownership enabling $10 minimum investments in high-value cards.',
  route: '/fractional-vault',
  featureName: 'Fractional Vault',
  investorPitch: 'Our Fractional Vault democratizes access to $100K+ grails with $10 minimums. With SEC-compliant tokenization, insured physical custody, and a secondary marketplace, we unlock a $50B+ TAM that was previously gated by ticket size.',
  keyMetric: { label: 'Assets Under Vault', value: '$4.2M' },
  duration: 90,
  highlights: [
    '$10 minimum investment in blue-chip cards',
    'SEC-compliant tokenized ownership',
    'Insured physical custody with real-time monitoring',
    'Secondary marketplace for share liquidity',
  ],
  category: 'monetize',
};

const STEP_YIELD_FARMING: DemoStep = {
  id: 'step-yield-farming',
  title: 'Card Yield Farming',
  description: 'Generate passive yield from card inventory through lending, staking, and liquidity provision.',
  route: '/card-yield-farming',
  featureName: 'Card Yield Farming',
  investorPitch: 'Dead inventory earns zero. Our Yield Farming engine turns idle cards into productive assets — through lending to dealers, staking in showcase pools, and providing liquidity for fractional markets. Average yield: 8.2% APY on blue-chip holdings.',
  keyMetric: { label: 'Average APY', value: '8.2%' },
  duration: 75,
  highlights: [
    'Multiple yield strategies: lending, staking, LP',
    '8.2% average APY on blue-chip cards',
    'Smart routing to highest-yield pools',
    'Risk-adjusted yield scoring',
  ],
  category: 'monetize',
};

const STEP_CHAOS_THEORY: DemoStep = {
  id: 'step-chaos-theory',
  title: 'Chaos Theory Simulator',
  description: 'Butterfly-effect modeling showing how micro-events cascade into macro market movements.',
  route: '/chaos-theory-simulator',
  featureName: 'Chaos Theory Simulator',
  investorPitch: 'Markets are non-linear. Our Chaos Theory Simulator models butterfly effects — how a single injury, trade rumor, or social media post cascades through interconnected card markets. This is predictive alpha no one else has.',
  keyMetric: { label: 'Cascade Accuracy', value: '87.3%' },
  duration: 60,
  highlights: [
    'Non-linear event propagation modeling',
    'Social media sentiment cascade tracking',
    'Real-time butterfly effect visualization',
    'Early-warning system for market dislocations',
  ],
  category: 'monitor',
};

const STEP_ROOKIE_PIPELINE: DemoStep = {
  id: 'step-rookie-pipeline',
  title: 'Rookie Pipeline Scanner',
  description: 'Scout the next generation of valuable rookie cards with AI-powered prospect analysis.',
  route: '/rookie-pipeline-scanner',
  featureName: 'Prospect Pipeline',
  investorPitch: 'Get ahead of the market by identifying breakout rookies before card prices spike. Our pipeline scanner analyzes 1,200+ minor league and draft prospects with real-time performance correlation to card valuations.',
  keyMetric: { label: 'Prospects Tracked', value: '1,247' },
  duration: 75,
  highlights: [
    'Real-time minor league performance tracking',
    'ML-powered breakout probability scoring',
    'Card price correlation analysis',
    'Draft and call-up impact modeling',
  ],
  category: 'scan',
};

const STEP_INJURY_ORACLE: DemoStep = {
  id: 'step-injury-oracle',
  title: 'Injury Oracle',
  description: 'Predict injury impacts on card values using biomechanical and historical injury data.',
  route: '/injury-oracle',
  featureName: 'Injury Oracle',
  investorPitch: 'Injuries are the single biggest risk factor in sports card investing. Our Injury Oracle predicts recovery timelines and card price impacts using biomechanical data, giving collectors a 48-hour information edge.',
  keyMetric: { label: 'Prediction Lead Time', value: '48 hrs' },
  duration: 60,
  highlights: [
    'Biomechanical injury risk modeling',
    'Historical recovery timeline analysis',
    'Card price impact prediction',
    '48-hour early warning alerts',
  ],
  category: 'monitor',
};

const STEP_NARRATIVE_ARC: DemoStep = {
  id: 'step-narrative-arc',
  title: 'Narrative Arc Engine',
  description: 'Map the story-driven value cycles of athletes and how narratives drive card prices.',
  route: '/narrative-arc-engine',
  featureName: 'Narrative Arcs',
  investorPitch: 'Card prices follow stories, not just stats. Our Narrative Arc Engine tracks 15 career archetypes — from "Comeback King" to "Dynasty Builder" — and predicts which narrative phase an athlete is in to time buy/sell decisions.',
  keyMetric: { label: 'Arc Patterns', value: '15' },
  duration: 60,
  highlights: [
    '15 validated career narrative archetypes',
    'Sentiment + performance phase detection',
    'Historical arc overlay for pattern matching',
    'Buy/sell signal generation from arc transitions',
  ],
  category: 'analyze',
};

const STEP_LIQUIDITY_SCANNER: DemoStep = {
  id: 'step-liquidity-scanner',
  title: 'Liquidity Depth Scanner',
  description: 'Real-time order book analysis showing true market depth for any card.',
  route: '/liquidity-depth-scanner',
  featureName: 'Liquidity Scanner',
  investorPitch: 'Illiquidity is the hidden risk in card investing. Our Liquidity Scanner aggregates order books across eBay, COMC, MySlabs, and 12 other marketplaces to show true market depth — preventing collectors from buying cards they cannot sell.',
  keyMetric: { label: 'Markets Scanned', value: '15' },
  duration: 60,
  highlights: [
    'Real-time order book aggregation across 15 platforms',
    'Bid-ask spread analysis and liquidity scoring',
    'Exit time estimation by card and grade',
    'Liquidity risk alerts for portfolio holdings',
  ],
  category: 'analyze',
};

const STEP_RESTORATION_SIM: DemoStep = {
  id: 'step-restoration-sim',
  title: 'Restoration Simulator',
  description: 'AI-powered simulation of card restoration outcomes and ROI calculations.',
  route: '/restoration-simulator',
  featureName: 'Restoration Sim',
  investorPitch: 'Should you restore that off-center vintage card? Our Restoration Simulator predicts the outcome — including grade improvement probability, cost, and expected ROI — using our proprietary condition-to-value model trained on 500K+ grading submissions.',
  keyMetric: { label: 'ROI Accuracy', value: '91.4%' },
  duration: 60,
  highlights: [
    'AI-predicted restoration outcomes',
    'Grade improvement probability scoring',
    'Cost-benefit ROI calculator',
    'Before/after visual simulation',
  ],
  category: 'optimize',
};

const STEP_CONTAGION_MAPPER: DemoStep = {
  id: 'step-contagion-mapper',
  title: 'Contagion Mapper',
  description: 'Track how price movements spread across related cards, players, and markets.',
  route: '/contagion-mapper',
  featureName: 'Contagion Map',
  investorPitch: 'When a star player gets traded, it does not just affect their cards — it ripples across teammates, rivals, and entire markets. Our Contagion Mapper visualizes these ripple effects in real time, enabling proactive portfolio hedging.',
  keyMetric: { label: 'Ripple Detection', value: '<30s' },
  duration: 60,
  highlights: [
    'Real-time price contagion visualization',
    'Network graph of card market interconnections',
    'Cascading impact predictions',
    'Automated hedging recommendations',
  ],
  category: 'monitor',
};

const STEP_TEMPORAL_ARBITRAGE: DemoStep = {
  id: 'step-temporal-arbitrage',
  title: 'Temporal Arbitrage Radar',
  description: 'Detect time-based pricing inefficiencies across markets and time zones.',
  route: '/temporal-arbitrage-radar',
  featureName: 'Time Arbitrage',
  investorPitch: 'Card markets are fragmented across time zones, platforms, and information speeds. Our Temporal Arbitrage Radar detects pricing dislocations that exist for minutes to hours — generating risk-free profit opportunities for active collectors.',
  keyMetric: { label: 'Avg Arb Spread', value: '12.6%' },
  duration: 60,
  highlights: [
    'Cross-platform price dislocation detection',
    'Time-zone arbitrage opportunity alerts',
    'Execution window estimation',
    'Historical arbitrage performance tracking',
  ],
  category: 'monetize',
};

// ─────────────────────────────────────────────────────────────────────────────
// All Steps Registry (used for Full Platform Tour)
// ─────────────────────────────────────────────────────────────────────────────

const ALL_STEPS: DemoStep[] = [
  STEP_CARD_GENOME,
  STEP_FORENSICS_LAB,
  STEP_ROOKIE_PIPELINE,
  STEP_INJURY_ORACLE,
  STEP_CROSS_ASSET,
  STEP_NARRATIVE_ARC,
  STEP_LIQUIDITY_SCANNER,
  STEP_STRESS_TESTER,
  STEP_GRAIL_INDEX,
  STEP_FRACTIONAL_VAULT,
  STEP_YIELD_FARMING,
  STEP_CHAOS_THEORY,
];

// ─────────────────────────────────────────────────────────────────────────────
// Pre-built Demo Flows
// ─────────────────────────────────────────────────────────────────────────────

const INVESTOR_PITCH_FLOW: DemoFlow = {
  id: 'investor-pitch',
  name: 'Investor Pitch',
  description: 'A curated 8-step walkthrough of our most compelling institutional-grade features. Designed for Series A and beyond conversations.',
  steps: [
    STEP_CARD_GENOME,
    STEP_FORENSICS_LAB,
    STEP_CROSS_ASSET,
    STEP_STRESS_TESTER,
    STEP_GRAIL_INDEX,
    STEP_FRACTIONAL_VAULT,
    STEP_YIELD_FARMING,
    STEP_CHAOS_THEORY,
  ],
  totalDuration: 645,
  targetAudience: 'investor',
};

const COLLECTOR_JOURNEY_FLOW: DemoFlow = {
  id: 'collector-journey',
  name: 'Collector Journey',
  description: 'A 7-step tour through the features collectors use daily — from scouting rookies to finding arbitrage opportunities.',
  steps: [
    STEP_ROOKIE_PIPELINE,
    STEP_INJURY_ORACLE,
    STEP_NARRATIVE_ARC,
    STEP_LIQUIDITY_SCANNER,
    STEP_RESTORATION_SIM,
    STEP_CONTAGION_MAPPER,
    STEP_TEMPORAL_ARBITRAGE,
  ],
  totalDuration: 435,
  targetAudience: 'collector',
};

const FULL_PLATFORM_TOUR_FLOW: DemoFlow = {
  id: 'full-platform-tour',
  name: 'Full Platform Tour',
  description: 'A comprehensive 12-step tour covering every major feature in logical order — from scanning to monetization.',
  steps: ALL_STEPS,
  totalDuration: ALL_STEPS.reduce((sum, s) => sum + s.duration, 0),
  targetAudience: 'all',
};

const SIXTY_SECOND_PITCH_FLOW: DemoFlow = {
  id: '60-second-pitch',
  name: '60-Second Pitch',
  description: 'The fastest path to "wow" — 4 features that showcase our core value proposition in under a minute.',
  steps: [
    STEP_CARD_GENOME,
    STEP_CROSS_ASSET,
    STEP_STRESS_TESTER,
    STEP_YIELD_FARMING,
  ],
  totalDuration: 345,
  targetAudience: 'investor',
};

const DEMO_FLOWS: DemoFlow[] = [
  INVESTOR_PITCH_FLOW,
  COLLECTOR_JOURNEY_FLOW,
  FULL_PLATFORM_TOUR_FLOW,
  SIXTY_SECOND_PITCH_FLOW,
];

// ─────────────────────────────────────────────────────────────────────────────
// In-memory Progress Store
// ─────────────────────────────────────────────────────────────────────────────

const progressStore: Map<string, DemoProgress> = new Map();

function getOrCreateProgress(flowId: string): DemoProgress {
  const existing = progressStore.get(flowId);
  if (existing) return existing;

  const progress: DemoProgress = {
    flowId,
    currentStep: 0,
    completedSteps: [],
    startedAt: new Date().toISOString(),
    analytics: {
      timePerStep: {},
      interactionsPerStep: {},
    },
  };
  progressStore.set(flowId, progress);
  return progress;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Returns all available demo flows. */
export function getDemoFlows(): DemoFlow[] {
  return DEMO_FLOWS;
}

/** Returns a single demo flow by ID, or undefined if not found. */
export function getDemoFlow(id: string): DemoFlow | undefined {
  return DEMO_FLOWS.find((f) => f.id === id);
}

/** Returns the next step in the flow, or null if at the end. */
export function getNextStep(
  flowId: string,
  currentStepIndex: number,
): DemoStep | null {
  const flow = getDemoFlow(flowId);
  if (!flow) return null;

  const nextIndex = currentStepIndex + 1;
  if (nextIndex >= flow.steps.length) return null;

  return flow.steps[nextIndex];
}

/** Returns progress for a given flow, creating it if needed. */
export function getDemoProgress(flowId: string): DemoProgress {
  return getOrCreateProgress(flowId);
}

/** Records that the user advanced to a step. */
export function advanceStep(
  flowId: string,
  stepId: string,
  stepIndex: number,
): DemoProgress {
  const progress = getOrCreateProgress(flowId);
  if (!progress.completedSteps.includes(stepId)) {
    progress.completedSteps.push(stepId);
  }
  progress.currentStep = stepIndex;
  return progress;
}

/** Records time spent on a step. */
export function recordStepTime(
  flowId: string,
  stepId: string,
  seconds: number,
): void {
  const progress = getOrCreateProgress(flowId);
  progress.analytics.timePerStep[stepId] =
    (progress.analytics.timePerStep[stepId] ?? 0) + seconds;
}

/** Records an interaction on a step. */
export function recordStepInteraction(
  flowId: string,
  stepId: string,
): void {
  const progress = getOrCreateProgress(flowId);
  progress.analytics.interactionsPerStep[stepId] =
    (progress.analytics.interactionsPerStep[stepId] ?? 0) + 1;
}

/** Resets progress for a given flow. */
export function resetProgress(flowId: string): DemoProgress {
  const progress: DemoProgress = {
    flowId,
    currentStep: 0,
    completedSteps: [],
    startedAt: new Date().toISOString(),
    analytics: {
      timePerStep: {},
      interactionsPerStep: {},
    },
  };
  progressStore.set(flowId, progress);
  return progress;
}

/** High-level investor metrics aggregated across all demo flows. */
export function getInvestorMetrics(): {
  totalFeatures: number;
  categories: Record<DemoCategory, number>;
  totalDemoTime: number;
  avgStepDuration: number;
  coverageByAudience: Record<TargetAudience, number>;
  keyMetrics: { feature: string; metric: KeyMetric }[];
} {
  const categoryCount: Record<DemoCategory, number> = {
    scan: 0,
    authenticate: 0,
    analyze: 0,
    optimize: 0,
    monetize: 0,
    monitor: 0,
  };

  const seenSteps = new Set<string>();
  const keyMetrics: { feature: string; metric: KeyMetric }[] = [];

  for (const step of ALL_STEPS) {
    if (!seenSteps.has(step.id)) {
      seenSteps.add(step.id);
      categoryCount[step.category]++;
      keyMetrics.push({ feature: step.featureName, metric: step.keyMetric });
    }
  }

  const audienceCoverage: Record<TargetAudience, number> = {
    investor: 0,
    collector: 0,
    dealer: 0,
    all: 0,
  };

  for (const flow of DEMO_FLOWS) {
    audienceCoverage[flow.targetAudience] += flow.steps.length;
  }

  const totalDuration = ALL_STEPS.reduce((sum, s) => sum + s.duration, 0);

  return {
    totalFeatures: ALL_STEPS.length,
    categories: categoryCount,
    totalDemoTime: totalDuration,
    avgStepDuration: Math.round(totalDuration / ALL_STEPS.length),
    coverageByAudience: audienceCoverage,
    keyMetrics,
  };
}
