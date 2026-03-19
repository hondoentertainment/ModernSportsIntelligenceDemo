import {
  FrontierFeatureBlueprint,
  FrontierFeatureState,
  FrontierFeatureStage,
  FrontierFeatureView,
} from '../../types';
import { store } from '../dal/syncStore';

const FRONTIER_STATE_KEY = 'msi_frontier_feature_states';

export const FRONTIER_FEATURES: FrontierFeatureBlueprint[] = [
  {
    id: 'restoration-risk-ledger',
    name: 'Restoration Risk Ledger',
    tagline: 'Price alteration risk like a credit file, not a forum rumor.',
    category: 'Risk',
    tier: 'Competitive Moat',
    complexity: 'high',
    competitionGap: 'Collectors rarely get a structured record of trimming, recoloring, pressing, cleaning, or restoration suspicion across an asset lifecycle.',
    whyDifferent: 'This turns restoration risk into a durable underwriting layer with evidence, discount curves, and repeatable review history.',
    userOutcome: 'Buyers and sellers can price restoration uncertainty explicitly before a negotiation or consignment decision.',
    moatScore: 94,
    dataSources: ['image scans', 'grader notes', 'seller disclosures', 'prior listing archives', 'provenance records'],
    operatorWorkflow: [
      'Ingest scan sets and prior listing photos for a target asset.',
      'Log suspected interventions, confidence bands, and evidence links.',
      'Apply a discount curve based on severity, reversibility, and market tolerance.',
      'Export a due-diligence packet into deal rooms, audit dossiers, or insurance reports.',
    ],
    productionChecklist: [
      { label: 'Typed asset and report models', detail: 'Existing report and inventory schemas can host restoration metadata.', status: 'ready' },
      { label: 'Evidence attachment pipeline', detail: 'Needs upload workflows and attachment review states.', status: 'needs-build' },
      { label: 'Discount curve engine', detail: 'Needs pricing rules for restoration severity by card cohort.', status: 'needs-build' },
      { label: 'Deal room export integration', detail: 'Current private room and report flows can surface the ledger once metadata is attached.', status: 'ready' },
      { label: 'Reviewer audit trail', detail: 'Needs role-aware review events and sign-off records.', status: 'needs-build' },
    ],
    successMetrics: ['review completion time', 'discount estimate accuracy', 'deals prevented by high-risk flags'],
    complianceNotes: ['Require plain-language evidence labels', 'Separate suspicion from confirmed alteration', 'Preserve immutable review timestamps'],
  },
  {
    id: 'claims-recovery-studio',
    name: 'Claims Recovery Studio',
    tagline: 'Loss, theft, and damage recovery without rebuilding the paper trail by hand.',
    category: 'Operations',
    tier: 'Competitive Moat',
    complexity: 'medium',
    competitionGap: 'Insurance tools stop at valuations; they do not operationalize the actual claim packet, evidence trail, and replacement logic.',
    whyDifferent: 'This closes the loop from valuation to recovery by packaging ownership proof, replacement comps, custody history, and incident narratives in one workflow.',
    userOutcome: 'Collectors can move from incident to insurer-ready packet in minutes instead of days.',
    moatScore: 91,
    dataSources: ['inventory snapshots', 'valuation reports', 'policy coverage data', 'incident notes', 'provenance timeline'],
    operatorWorkflow: [
      'Select damaged, stolen, or missing assets from the collection or vault ledger.',
      'Generate an incident packet with values, ownership history, and supporting evidence.',
      'Attach replacement-cost scenarios and carrier-specific notes.',
      'Export JSON, CSV, and print-ready claim bundles for adjusters and brokers.',
    ],
    productionChecklist: [
      { label: 'Report rendering stack', detail: 'Existing dossier and report exporters already provide structured output paths.', status: 'ready' },
      { label: 'Incident intake form', detail: 'Needs guided intake for theft, transit loss, and damage scenarios.', status: 'needs-build' },
      { label: 'Policy-aware recovery rules', detail: 'Insurance policy service can supply base inputs with additional claim templates.', status: 'ready' },
      { label: 'Carrier packet templates', detail: 'Needs insurer-specific export presets and validation.', status: 'needs-build' },
      { label: 'Recovery status tracking', detail: 'Needs persisted claim statuses and follow-up reminders.', status: 'needs-build' },
    ],
    successMetrics: ['packet generation time', 'claim approval rate', 'average documentation completeness score'],
    complianceNotes: ['Do not imply legal advice', 'Mask sensitive policy identifiers in shared exports', 'Maintain incident access controls'],
  },
  {
    id: 'venue-failure-drill',
    name: 'Venue Failure Drill',
    tagline: 'Stress test what happens if a marketplace, vault, or consignor goes dark.',
    category: 'Risk',
    tier: 'Industry-First',
    complexity: 'high',
    competitionGap: 'Most collectible platforms model upside but not operational failure scenarios across marketplaces, consignment channels, and storage providers.',
    whyDifferent: 'This reframes marketplace exposure like counterparty concentration risk with liquidation alternatives and recovery timing.',
    userOutcome: 'Collectors can see where a single vendor outage strands inventory, cash flow, or proof-of-ownership.',
    moatScore: 96,
    dataSources: ['venue exposure by asset', 'consignment records', 'vault holdings', 'liquidity routes', 'scenario engine outputs'],
    operatorWorkflow: [
      'Map each asset to its sale, storage, and custody dependencies.',
      'Run failure drills for venue outage, payout freeze, or vault access delay.',
      'Estimate trapped value, time-to-recovery, and alternate exit paths.',
      'Generate mitigation actions such as reallocating inventory or splitting channel exposure.',
    ],
    productionChecklist: [
      { label: 'Scenario engine foundation', detail: 'Current scenario theater and stress-test infrastructure can model venue shocks.', status: 'ready' },
      { label: 'Venue dependency graph', detail: 'Needs asset-to-channel dependency mapping with exposure weights.', status: 'needs-build' },
      { label: 'Recovery time assumptions', detail: 'Needs configurable outage and payout delay benchmarks by venue.', status: 'needs-build' },
      { label: 'Mitigation recommendations', detail: 'Liquidity Twin can supply alternate route suggestions once dependencies are modeled.', status: 'ready' },
      { label: 'Portfolio concentration alerts', detail: 'Needs threshold-based exposure monitoring and recurring warnings.', status: 'needs-build' },
    ],
    successMetrics: ['share of portfolio with diversified exits', 'median trapped-value reduction', 'outage drill completion rate'],
    complianceNotes: ['Clearly mark simulated scenarios', 'Separate venue risk opinion from fact', 'Retain assumption provenance for each drill'],
  },
  {
    id: 'opportunity-crowding-index',
    name: 'Opportunity Crowding Index',
    tagline: 'Know when a thesis is too popular to still be alpha.',
    category: 'Strategy',
    tier: 'Competitive Moat',
    complexity: 'medium',
    competitionGap: 'Collectors see hype volume but not whether an idea has become crowded enough to compress future returns.',
    whyDifferent: 'This combines listing velocity, watchlist density, content chatter, and price response to measure thesis crowding before it becomes consensus.',
    userOutcome: 'Users can size down crowded trades and rotate toward less obvious opportunities earlier.',
    moatScore: 89,
    dataSources: ['listing volume', 'watchlist activity', 'social velocity', 'offer intensity', 'price momentum'],
    operatorWorkflow: [
      'Aggregate demand signals for a player, card archetype, or thesis.',
      'Compare price response against attention growth to detect crowding.',
      'Flag crowded longs, under-owned ideas, and fading narrative rotations.',
      'Push crowding context into catalyst alerts and acquisition recommendations.',
    ],
    productionChecklist: [
      { label: 'Signal ingestion', detail: 'Existing alerts, marketplace, and social services can seed core inputs.', status: 'ready' },
      { label: 'Crowding score model', detail: 'Needs weighting logic across signal families and cohort baselines.', status: 'needs-build' },
      { label: 'Historical regime storage', detail: 'Needs persisted snapshots for crowding trend comparisons.', status: 'needs-build' },
      { label: 'Advisor integration', detail: 'Smart advisor and catalyst workflows can consume the score once exposed.', status: 'ready' },
      { label: 'False-positive controls', detail: 'Needs sport and season normalization to avoid routine hype spikes.', status: 'needs-build' },
    ],
    successMetrics: ['crowding signal precision', 'alpha preserved after crowded exits', 'advisor recommendation uplift'],
    complianceNotes: ['Disclose signal sources', 'Avoid language that guarantees alpha', 'Version score formulas for auditability'],
  },
  {
    id: 'provenance-gap-heatmap',
    name: 'Provenance Gap Heatmap',
    tagline: 'Value the missing years in a card’s story, not just the years you know.',
    category: 'Trust',
    tier: 'Industry-First',
    complexity: 'medium',
    competitionGap: 'Provenance tools focus on what is documented, not on where documentation gaps themselves create pricing and trust risk.',
    whyDifferent: 'This quantifies undocumented custody periods and tells the operator which missing links matter most to close.',
    userOutcome: 'High-end collectors can prioritize evidence gathering where it drives the most trust and valuation recovery.',
    moatScore: 90,
    dataSources: ['ownership records', 'auction archives', 'vault events', 'grading submissions', 'manual provenance notes'],
    operatorWorkflow: [
      'Lay out the known asset timeline from purchase to present.',
      'Highlight undocumented custody windows and confidence breaks.',
      'Estimate how each missing period affects trust, insurability, and resale quality.',
      'Generate an evidence acquisition queue for dealers, auction houses, and prior owners.',
    ],
    productionChecklist: [
      { label: 'Timeline model', detail: 'Current provenance and trust models provide a starting structure.', status: 'ready' },
      { label: 'Gap detection rules', detail: 'Needs windowing logic that detects suspicious or weakly documented periods.', status: 'needs-build' },
      { label: 'Recovery priority scoring', detail: 'Needs valuation impact weights for each gap type.', status: 'needs-build' },
      { label: 'Trust graph integration', detail: 'Existing counterparty graph can surface who may close each gap.', status: 'ready' },
      { label: 'Evidence request workflow', detail: 'Needs outbound request tracking and closure states.', status: 'needs-build' },
    ],
    successMetrics: ['gaps closed per quarter', 'trust-score uplift from recovered evidence', 'high-value assets with full timeline coverage'],
    complianceNotes: ['Do not fabricate timeline certainty', 'Separate user-supplied evidence from verified evidence', 'Track source provenance for each event'],
  },
  {
    id: 'museum-loan-desk',
    name: 'Museum Loan Desk',
    tagline: 'Turn grails into exhibitable cultural assets with custody controls.',
    category: 'Operations',
    tier: 'Industry-First',
    complexity: 'high',
    competitionGap: 'Collector platforms do not help owners place assets into exhibitions, sponsor activations, or institutional showcases with operational guardrails.',
    whyDifferent: 'This introduces loan underwriting, condition tracking, and payout logic for exhibition-grade collectibles.',
    userOutcome: 'Owners can safely monetize visibility and prestige without defaulting to a sale.',
    moatScore: 93,
    dataSources: ['insured values', 'condition reports', 'provenance history', 'venue requirements', 'availability windows'],
    operatorWorkflow: [
      'Qualify assets for display readiness and insurance requirements.',
      'Match assets against museum, sponsor, or event loan opportunities.',
      'Generate custody checklists, transport steps, and return-condition verification.',
      'Track loan fees, exposure value, and post-event asset condition.',
    ],
    productionChecklist: [
      { label: 'Asset readiness scoring', detail: 'Inventory, insurance, and provenance services can supply baseline qualification inputs.', status: 'ready' },
      { label: 'Loan contract templates', detail: 'Needs venue-specific terms, approval flow, and signature capture.', status: 'needs-build' },
      { label: 'Condition report workflow', detail: 'Needs pre/post event image capture and discrepancy logging.', status: 'needs-build' },
      { label: 'Scheduling and availability', detail: 'Needs calendar windows and blackout controls by asset.', status: 'needs-build' },
      { label: 'Fee and exposure analytics', detail: 'Existing reporting stack can summarize loan economics once events are recorded.', status: 'ready' },
    ],
    successMetrics: ['loan utilization rate', 'revenue from non-sale monetization', 'condition variance after loan'],
    complianceNotes: ['Require explicit custody chain', 'Mask private location data', 'Document transport liability assumptions'],
  },
  {
    id: 'counterfeit-cluster-radar',
    name: 'Counterfeit Cluster Radar',
    tagline: 'Spot fake networks, not just fake cards.',
    category: 'Trust',
    tier: 'Competitive Moat',
    complexity: 'high',
    competitionGap: 'Counterfeit checks are usually per-card heuristics; they rarely detect seller, venue, image, and cert clusters that indicate organized fraud.',
    whyDifferent: 'This treats fraud as a network problem by connecting recurring serials, image reuse, venue overlap, and dispute history.',
    userOutcome: 'Collectors can avoid coordinated counterfeit rings earlier and assign risk before sending money.',
    moatScore: 95,
    dataSources: ['listing images', 'serial/cert data', 'seller identities', 'trust events', 'dispute outcomes'],
    operatorWorkflow: [
      'Ingest suspect listings, serials, and seller entities into a shared graph.',
      'Detect repeated image assets, cert reuse, and suspicious referral chains.',
      'Score each cluster by fraud severity and confidence.',
      'Push risk flags into marketplace views, trust graphs, and deal room access rules.',
    ],
    productionChecklist: [
      { label: 'Graph persistence layer', detail: 'Counterparty graph and trust-event storage already exist.', status: 'ready' },
      { label: 'Image similarity matching', detail: 'Needs perceptual hashing or vision similarity for listing reuse.', status: 'needs-build' },
      { label: 'Cert/serial normalization', detail: 'Needs issuer-aware parsing and duplicate detection.', status: 'needs-build' },
      { label: 'Risk escalation workflow', detail: 'Existing trust graph surfaces can display cluster risk once computed.', status: 'ready' },
      { label: 'Moderator review loop', detail: 'Needs analyst adjudication and appeal history.', status: 'needs-build' },
    ],
    successMetrics: ['fraud cluster detections', 'disputes avoided after flags', 'time from listing ingestion to risk surface'],
    complianceNotes: ['Use careful fraud language until confirmed', 'Retain evidence snapshots for every cluster', 'Support analyst overrides and notes'],
  },
  {
    id: 'capital-stack-optimizer',
    name: 'Capital Stack Optimizer',
    tagline: 'Model partial sales, advances, consignments, and leverage as one stack.',
    category: 'Finance',
    tier: 'Competitive Moat',
    complexity: 'high',
    competitionGap: 'Collectors can track value, but few tools help them compare financing paths against tax, liquidity, and downside constraints.',
    whyDifferent: 'This treats a collection like a treasury asset base with options for advances, partial exits, collateral, and reserve buffers.',
    userOutcome: 'Collectors can unlock cash without blindly sacrificing future upside or over-concentrating risk.',
    moatScore: 92,
    dataSources: ['portfolio liquidity', 'tax posture', 'consignment fees', 'policy coverage', 'user risk tolerances'],
    operatorWorkflow: [
      'Profile the portfolio by liquidity, concentration, and tax friction.',
      'Compare full sale, partial sale, consignment, vault advance, or hold scenarios.',
      'Quantify net proceeds, downside carry cost, and recovery paths under stress.',
      'Recommend a capital stack aligned with user constraints and exit timing.',
    ],
    productionChecklist: [
      { label: 'Liquidity and fee models', detail: 'Current liquidity, consignment, and report services already provide core inputs.', status: 'ready' },
      { label: 'Capital strategy engine', detail: 'Needs scenario optimizer across advances, sales, and hold paths.', status: 'needs-build' },
      { label: 'Tax-aware payoff modeling', detail: 'Fiscal intelligence can seed net-proceeds calculations.', status: 'ready' },
      { label: 'User covenant settings', detail: 'Needs configurable leverage, reserve, and concentration constraints.', status: 'needs-build' },
      { label: 'Strategy comparison UI', detail: 'Needs ranked scenario outputs and recommendation explanations.', status: 'needs-build' },
    ],
    successMetrics: ['cash unlocked without forced sale', 'modeled vs realized net proceeds', 'collector adoption of optimized strategies'],
    complianceNotes: ['Do not imply lending availability', 'Label assumptions clearly', 'Avoid personalized financial advice claims'],
  },
  {
    id: 'prestige-spillover-engine',
    name: 'Prestige Spillover Engine',
    tagline: 'Measure when demand jumps from culture, luxury, and status signals into cards.',
    category: 'Market Structure',
    tier: 'Industry-First',
    complexity: 'medium',
    competitionGap: 'Cross-asset correlation exists, but platforms rarely translate broader prestige and cultural attention into actionable collectible demand forecasts.',
    whyDifferent: 'This focuses on spillover from auctions, documentaries, sneaker cycles, watch markets, and celebrity mentions into specific collectible cohorts.',
    userOutcome: 'Collectors can catch demand migration before it fully shows up in card comps.',
    moatScore: 88,
    dataSources: ['cross-hobby market data', 'search interest', 'social mentions', 'auction calendars', 'media events'],
    operatorWorkflow: [
      'Track prestige and culture signals outside the card market.',
      'Map spillover relationships into players, eras, teams, and archetypes.',
      'Flag when external attention historically leads card demand by a useful window.',
      'Publish spillover theses into market briefs, catalysts, and watchlists.',
    ],
    productionChecklist: [
      { label: 'Cross-asset model base', detail: 'Existing cross-hobby and correlation surfaces can host the spillover layer.', status: 'ready' },
      { label: 'Prestige event feed', detail: 'Needs event ingestion for auctions, media moments, and celebrity signal spikes.', status: 'needs-build' },
      { label: 'Lead-lag scoring', detail: 'Needs a statistical engine for spillover timing and confidence.', status: 'needs-build' },
      { label: 'Narrative publishing surface', detail: 'Current dashboard and catalyst experiences can distribute insights.', status: 'ready' },
      { label: 'Backtest archive', detail: 'Needs stored spillover calls and outcome tracking.', status: 'needs-build' },
    ],
    successMetrics: ['spillover call hit rate', 'lead time before comp movement', 'engagement with cross-hobby theses'],
    complianceNotes: ['Disclose external signal provenance', 'Mark low-confidence spillovers clearly', 'Avoid overstating causal relationships'],
  },
  {
    id: 'reacquisition-radar',
    name: 'Reacquisition Radar',
    tagline: 'Know when an exited position is worth buying back.',
    category: 'Strategy',
    tier: 'Competitive Moat',
    complexity: 'medium',
    competitionGap: 'Collectors track sold items, but they do not usually get a disciplined signal for when an old thesis has reset and deserves re-entry.',
    whyDifferent: 'This links sold-vault history, regret analysis, fresh catalysts, and price resets into a buy-back operating system.',
    userOutcome: 'Users can turn prior exits into a structured edge instead of relying on memory or emotion.',
    moatScore: 87,
    dataSources: ['sold vault history', 'time-machine snapshots', 'new catalyst signals', 'current pricing', 'decision journal notes'],
    operatorWorkflow: [
      'Match sold assets against current market listings and fresh thesis signals.',
      'Measure how far price, narrative, and risk have reset since the prior exit.',
      'Score re-entry opportunities with explicit memory of why the asset was sold.',
      'Send disciplined buy-back alerts with thesis drift and downside context.',
    ],
    productionChecklist: [
      { label: 'Historical sale memory', detail: 'Sold Vault, Time Machine, and decision journal data are already present.', status: 'ready' },
      { label: 'Re-entry score model', detail: 'Needs a model comparing current setup to the original exit rationale.', status: 'needs-build' },
      { label: 'Market relisting matcher', detail: 'Needs better sold-to-live asset matching across venues.', status: 'needs-build' },
      { label: 'Alert distribution', detail: 'Notification Center can deliver reacquisition signals once scored.', status: 'ready' },
      { label: 'Outcome tracking', detail: 'Needs closed-loop measurement on re-entry recommendations.', status: 'needs-build' },
    ],
    successMetrics: ['re-entry signal conversion rate', 'buy-back alpha vs benchmark', 'percentage of sold assets monitored'],
    complianceNotes: ['Preserve the original exit rationale for context', 'Avoid hindsight framing in alerts', 'Version every re-entry score calculation'],
  },
];

function readStateMap(): Record<string, FrontierFeatureState> {
  const parsed = store.get<Record<string, FrontierFeatureState>>(FRONTIER_STATE_KEY, {});
  return parsed && typeof parsed === 'object' ? parsed : {};
}

function writeStateMap(next: Record<string, FrontierFeatureState>) {
  store.set(FRONTIER_STATE_KEY, next);
}

export function getFrontierFeatureBlueprints(): FrontierFeatureBlueprint[] {
  return FRONTIER_FEATURES;
}

export function getLaunchReadiness(feature: FrontierFeatureBlueprint): number {
  const total = feature.productionChecklist.length;
  if (total === 0) return 0;
  const readyCount = feature.productionChecklist.filter(item => item.status === 'ready').length;
  return Math.round((readyCount / total) * 100);
}

export function loadFrontierFeatureStates(): Record<string, FrontierFeatureState> {
  return readStateMap();
}

export function saveFrontierFeatureState(
  featureId: string,
  updates: Partial<Pick<FrontierFeatureState, 'stage' | 'note'>>
): FrontierFeatureState {
  const stateMap = readStateMap();
  const previous = stateMap[featureId];
  const nextState: FrontierFeatureState = {
    featureId,
    stage: updates.stage ?? previous?.stage ?? 'recommended',
    note: updates.note ?? previous?.note ?? '',
    updatedAt: new Date().toISOString(),
  };
  stateMap[featureId] = nextState;
  writeStateMap(stateMap);
  return nextState;
}

export function getMergedFrontierFeatures(): FrontierFeatureView[] {
  const states = readStateMap();
  return FRONTIER_FEATURES.map(feature => {
    const state = states[feature.id];
    return {
      ...feature,
      stage: state?.stage ?? 'recommended',
      note: state?.note ?? '',
      updatedAt: state?.updatedAt,
      launchReadiness: getLaunchReadiness(feature),
    };
  });
}

export function getFrontierFeatureById(featureId?: string | null): FrontierFeatureView | null {
  if (!featureId) return null;
  return getMergedFrontierFeatures().find(feature => feature.id === featureId) ?? null;
}

export function buildFrontierRoadmapExport() {
  const features = getMergedFrontierFeatures();
  const stageCount = features.reduce<Record<FrontierFeatureStage, number>>(
    (acc, feature) => {
      acc[feature.stage] += 1;
      return acc;
    },
    {
      recommended: 0,
      designing: 0,
      'production-ready': 0,
    }
  );

  return {
    generatedAt: new Date().toISOString(),
    featureCount: features.length,
    averageMoatScore: Math.round(features.reduce((sum, feature) => sum + feature.moatScore, 0) / features.length),
    averageLaunchReadiness: Math.round(features.reduce((sum, feature) => sum + feature.launchReadiness, 0) / features.length),
    stageCount,
    features,
  };
}
