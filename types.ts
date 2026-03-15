
export type Sport = 'Baseball' | 'Basketball' | 'Football' | 'Hockey' | 'Soccer';
export type League = 'MLB' | 'MiLB' | 'NBA' | 'NFL' | 'Other';
export type AssetClass = 'Sports Cards' | 'Luxury Watches' | 'Fine Art' | 'Wine & Spirits';


export interface ExitPlan {
  id: string;
  targetPrice: number;
  timeframe: 'Short (3m)' | 'Medium (6-12m)' | 'Long (1-3y)' | 'Held (3y+)';
  strategy: 'Take Profit' | 'Cut Loss' | 'Institutional Hold';
  notes?: string;
  createdAt: string;
}

export interface PopReport {
  popHigher: number;
  popTotal: number;
  popAtGrade: number;
  lastChecked: string;
  source: 'simulated' | 'psa' | 'bgs';
  badge?: 'Apex' | 'Low Pop' | 'Standard';
}


export interface CardInventory {
  id: string;
  player: string;
  year: number;
  manufacturer: string;
  cardNumber: string;
  set: string;
  sport: Sport;
  league: League;
  isAutographed: boolean;
  condition: string;
  isGraded: boolean;
  gradingCompany?: 'PSA' | 'BGS' | 'SGC' | 'CSG' | 'HGA' | 'Other';
  grade?: string;
  purchasePrice: number;
  purchaseDate: string;
  currentValue?: number;
  lastValuationDate?: string;
  valuationConfidence?: number;
  pricingRationale?: string;
  notes?: string;
  image?: string;
  searchUrl?: string;
  // Fiscal Intelligence (Phase 27)
  realizedGainLoss?: number;
  taxCategory?: 'Short Term' | 'Long Term';
  overheadCost?: number; // Sum of grading, insurance, shipping
  taxBasis?: number;
  gradingFees?: number;
  shippingFees?: number;
  insuranceFees?: number;
  salePrice?: number;
  saleDate?: string;
  status?: 'active' | 'sold';
  // Portfolio Builder Groups
  group?: string;
  groupOrder?: number;
  // Scarcity Data
  popCount?: number;
  popHigher?: number;
  scarcityIndex?: number; // 0-100
  popReport?: PopReport;
  gradingRoi?: number; // Percentage gain/loss
  // Liquidity Intelligence (Phase 20)
  liquidityScore?: number; // 0-100
  exitPlan?: ExitPlan;
  exitPlanId?: string;
  // Arbitrage Intelligence (Phase 22)
  opportunityScore?: number; // 0-100
  arbitrageDelta?: number; // Percentage deviation from mean
  // Vault Intelligence (Phase 25)
  isVaulted?: boolean;
  vaultProvider?: 'PWCC' | 'PSA' | 'Goldin' | 'Other';
  vaultAssetId?: string;
  vaultInstantLiquidityPrice?: number;
  valuationSource?: ValuationSource;
  valuationTimestamp?: string;
  salesData?: MarketComp[];
}

export type VaultProvider = 'PWCC' | 'PSA' | 'Goldin' | 'Other';

export interface VaultAsset extends CardInventory {
  isVaulted: true;
  vaultProvider: VaultProvider;
  vaultAssetId: string;
}

export interface TargetWatchlist {
  id: string;
  player: string;
  cardDescription: string;
  priority: 'High' | 'Medium' | 'Low';
  targetPrice: number;
  currentMarketPrice?: number;
  notes?: string;
  sport: Sport;
  league: League;
  status: 'active' | 'acquired' | 'expired';
  createdAt: string;
  image?: string;
  searchUrl?: string;
  // Arbitrage Intelligence (Phase 22)
  opportunityScore?: number; // 0-100
  arbitrageDelta?: number; // Percentage deviation from mean
  pricingRationale?: string;
  valuationSource?: ValuationSource;
  valuationTimestamp?: string;
  salesData?: MarketComp[];
}

export interface MiLBProspect {
  id: string;
  name: string;
  team: string;
  position: string;
  league: 'AAA' | 'AA' | 'High-A' | 'Low-A';
  trendScore: number; // 0-100
  change24h: number; // percentage
  trendDirection: 'up' | 'down' | 'stable';
  history7d: number[];
  breakoutScore: number; // 0-100
  summary: string;
  image: string;
}

export interface MLBPlayer {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  primaryNumber: string;
  birthDate: string;
  currentTeam: { id: number; name: string };
  primaryPosition: { code: string; name: string };
  batSide: { code: string; description: string };
  pitchHand: { code: string; description: string };
  image?: string;
}

export type ValuationSource = 'ebay-api' | 'gemini' | 'fallback';

export interface MarketComp {
  itemId?: string;
  title: string;
  price: number;
  currency?: string;
  condition: string;
  soldAt: string;
  listedAt?: string;
  listingUrl?: string;
  shippingPrice?: number;
  totalPrice?: number;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PricingAnalysis {
  estimatedValue: number;
  low: number;
  high: number;
  avg: number;
  confidence: number;
  salesCount: number;
  lastUpdated: string;
  searchUrl?: string; // Deep link to eBay for manual verification
  rationale?: string; // AI-generated rationale for this valuation
  salesData?: MarketComp[]; // Granular sales data used for analysis
  valuationSource?: ValuationSource;
  valuationTimestamp?: string;
  quality?: ValuationQuality;
}

export type AlertType = 'price_target' | 'sync_complete' | 'trend' | 'momentum' | 'warning' | 'system';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  relatedId?: string; // Target ID, Card ID, etc.
  metadata?: Record<string, any>;
}


export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  isPublic: boolean;
  twitterHandle?: string;
  instagramHandle?: string;
  joinedAt: string;
  alphaScore: number;
  portfolioValue: number;
  roi: number;
  tier?: string;
  // Fiscal Settings
  estimatedTaxRate?: number; // 0-1
  isTaxResident?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user: UserProfile;
  alphaScore: number;
  change24h: number;
}

export type NegotiationStatus = 'active' | 'accepted' | 'rejected' | 'countered';

export interface AgentInsight {
  agentId: string;
  agentName: string;
  persona: string;
  insight: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

export interface CollaborativeThesis {
  id: string;
  summary: string;
  keyTakeaways: string[];
  riskAssessment: string;
  recommendedAction: string;
  agents: AgentInsight[];
  executionPlan?: AutonomousAction[];
  recommendationId?: string;
  createdAt: string;
}

export interface RiskCollar {
  maxBudget: number;
  maxSpendPerAsset: number;
  riskTolerance: 'Conservative' | 'Balanced' | 'Aggressive';
  autoSellThreshold?: number; // Percentage gain/loss
  minActionConfidence?: number; // 0-1
  requireApprovalAbove?: number; // Dollar threshold
  maxDailyActions?: number;
  blockedPlayers?: string[];
  blockedSports?: Sport[];
}

export interface AutoPilotConfig {
  isActive: boolean;
  collar: RiskCollar;
  lastExecution?: string;
}

export interface AutonomousAction {
  id: string;
  type: 'BUY' | 'SELL' | 'REBALANCE' | 'HOLD';
  assetName: string;
  amount: number;
  rationale: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'submitted' | 'executed' | 'failed' | 'rejected' | 'cancelled';
  confidence?: number;
  cycleId?: string;
  idempotencyKey?: string;
  policyDecision?: 'approved' | 'blocked' | 'needs_approval';
  policyReason?: string;
  approvalActor?: string;
  approvalNote?: string;
  approvalUpdatedAt?: string;
  scenarioTag?: string;
  estimatedEdgePct?: number;
  recommendationId?: string;
  linkedIntentId?: string;
  linkedOutcomeId?: string;
}

export type AgentRecommendationOrigin = 'war-room' | 'autopilot-preview' | 'autopilot-cycle' | 'manual' | 'system';
export type AgentRecommendationStatus = 'draft' | 'queued' | 'pending_approval' | 'approved' | 'rejected' | 'submitted' | 'filled' | 'failed' | 'cancelled';
export type AgentOutcomeStatus = 'approved' | 'rejected' | 'submitted' | 'filled' | 'partial' | 'failed' | 'cancelled';

export interface AgentRecommendationRecord {
  id: string;
  ownerUserId?: string | null;
  source: AgentRecommendationOrigin;
  cycleId?: string;
  thesisId?: string;
  summary: string;
  recommendedAction: string;
  riskAssessment?: string;
  status: AgentRecommendationStatus;
  keyTakeaways: string[];
  agents: AgentInsight[];
  executionPlan?: AutonomousAction[];
  linkedIntentId?: string | null;
  linkedOutcomeId?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface AgentOutcomeRecord {
  id: string;
  ownerUserId?: string | null;
  recommendationId: string;
  intentId?: string | null;
  fillId?: string | null;
  outcomeType: AgentOutcomeStatus;
  amount?: number;
  quantity?: number;
  price?: number;
  venue?: MarketplaceVenue;
  rationale?: string;
  metadata?: Record<string, unknown>;
  recordedAt: string;
}

export interface SwarmInsight {
  id: string;
  title: string;
  description: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  impactScore: number;
  tags: string[];
  participatingAgents: string[];
}

export interface IntelligenceSwarm {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  activeInsights: SwarmInsight[];
  recentAlpha: string[];
  tier: 'Elite' | 'Institutional' | 'Private';
}

export type GuildRole = 'Owner' | 'Analyst' | 'Member';

export interface GuildMember {
  userId: string;
  displayName: string;
  role: GuildRole;
  joinedAt: string;
}

export interface ProposalVote {
  userId: string;
  vote: 'approve' | 'reject';
  votedAt: string;
}

export interface ContributionLedgerEntry {
  id: string;
  proposalId: string;
  userId: string;
  amount: number;
  status: 'held' | 'released' | 'returned';
  createdAt: string;
}

export interface GuildGovernance {
  quorumPercent: number;
  minApprovals: number;
  approvalWindowHours: number;
  vetoEnabled?: boolean;
}

export interface JointAcquisitionProposal {
  id: string;
  targetCardId: string;
  title?: string;
  targetAssetName?: string;
  targetPrice: number;
  currentFunding: number;
  minEntry: number;
  proposedBy?: string;
  proposalMemo?: string;
  payoutWaterfall?: {
    managerCarryPercent: number;
    reservePercent: number;
    distributionModel: 'pro_rata' | 'priority_return';
  };
  participants: {
    userId: string;
    share: number;
    amount: number;
  }[];
  votes?: ProposalVote[];
  quorumPercent?: number;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalDeadline?: string;
  ledgerEntries?: ContributionLedgerEntry[];
  status: 'open' | 'funded' | 'completed' | 'cancelled';
  expiryDate: string;
  agentEvaluation: CollaborativeThesis;
}

export interface NegotiationMessage {
  id: string;
  sender: 'user' | 'agent' | 'seller';
  content: string;
  offerAmount?: number;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'aggressive';
}

/** Minimal shape accepted by the negotiation flow from any card/target/mock source */
export interface NegotiableItem {
  id?: string;
  player?: string;
  name?: string;
  year?: number;
  manufacturer?: string;
  price?: number;
  currentValue?: number;
  currentMarketPrice?: number;
  image?: string;
  cardDescription?: string;
}

export interface NegotiationSession {
  id: string;
  targetItem: {
    id: string;
    name: string;
    price: number; // Listing Price
    image: string;
  };
  currentUserOffer: number;
  sellerAsk: number;
  maxWillingToPay: number;
  status: NegotiationStatus;
  messages: NegotiationMessage[];
  createdAt: string;
  updatedAt: string;
}

export type MacroTrend = 'bullish' | 'bearish' | 'neutral';

export interface MacroSignal {
  id: string;
  indicator: string;
  value: string;
  trend: MacroTrend;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
  aiAnalysis?: string;
  updatedAt: string;
}

export interface VisualDefect {
  type: 'Centering' | 'Corners' | 'Edges' | 'Surface';
  location: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
  description: string;
}

export interface VisualAuditResult {
  predictedGrade: string;
  confidenceScore: number;
  subgrades: {
    centering: number;
    corners: number;
    edges: number;
    surface: number;
  };
  defects: VisualDefect[];
  summary: string;
  estimatedGradingPremium?: number;
}

export interface GradingPremiumAnalysis {
  cardId: string;
  rawPrice: number;
  psa10Price: number;
  psa9Price: number;
  bgs95Price: number;
  gradingFees: number;
  potentialNetGain: number;
  recommendation: 'Submit' | 'Hold Raw' | 'Sell Now';
  rationale: string;
  updatedAt: string;
}

export interface ArbitrageNode {
  id: string;
  sourceAsset: {
    name: string;
    assetClass: AssetClass;
    currentValue: number;
    image?: string;
  };
  targetAsset: {
    name: string;
    assetClass: AssetClass;
    currentValue: number;
    image?: string;
  };
  correlationDelta: number; // Percentage
  opportunityScore: number; // 0-100
  rationale: string;
  status: 'active' | 'closed';
  createdAt: string;
}

export interface CrossAssetInsight {
  id: string;
  summary: string;
  liquidityFlightStatus: 'Stable' | 'Volatile' | 'Critical';
  topArbitrageNodes: ArbitrageNode[];
  agents: AgentInsight[];
  createdAt: string;
}

export type AuditCategory = 'portfolio' | 'valuation' | 'autonomy' | 'auth' | 'system';

export interface AuditEvent {
  id?: string;
  userId?: string;
  category: AuditCategory;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}





export interface ValuationQuality {
  isStale: boolean;
  freshnessHours: number;
  confidenceTier: 'High' | 'Medium' | 'Low';
  qualityScore: number; // 0-100
  warnings: string[];
}

export type MarketplaceVenue = 'ebay' | 'pwcc' | 'goldin' | 'private' | 'internal';
export type TrustEdgeType = 'transaction' | 'referral' | 'guild' | 'brokered' | 'social' | 'provenance';
export type CounterpartyRiskLevel = 'low' | 'medium' | 'high';
export type CatalystType = 'call_up' | 'playoff' | 'award_race' | 'injury_recovery' | 'scarcity_spike';
export type CatalystSeverity = 'watch' | 'actionable' | 'urgent';
export type ScenarioTemplateKind = 'liquidity' | 'market' | 'player' | 'macro' | 'custom';

export interface CounterpartyProfile {
  id: string;
  ownerUserId?: string | null;
  displayName: string;
  handle?: string;
  marketplaceVenue: MarketplaceVenue;
  externalReference?: string;
  verificationTier: 'unverified' | 'verified' | 'institutional';
  trustScore: number;
  reputationScore: number;
  successfulDeals: number;
  disputedDeals: number;
  avgResponseHours?: number;
  avgCloseDays?: number;
  totalVolumeUsd?: number;
  fraudFlags?: number;
  riskLevel: CounterpartyRiskLevel;
  notes?: string;
  lastInteractionAt?: string;
  createdAt: string;
}

export interface CounterpartyEdge {
  id: string;
  sourceCounterpartyId: string;
  targetCounterpartyId: string;
  edgeType: TrustEdgeType;
  weight: number;
  trustDelta: number;
  evidenceCount: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface TrustEvent {
  id: string;
  counterpartyId: string;
  eventType: 'sale_completed' | 'offer_accepted' | 'dispute' | 'chargeback' | 'referral' | 'provenance_verified' | 'response_time';
  impactScore: number;
  referenceType?: 'listing' | 'offer' | 'deal_room' | 'execution' | 'manual';
  referenceId?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface MarketplaceListingRecord {
  id: string;
  ownerUserId?: string | null;
  counterpartyId?: string | null;
  sourceVenue: MarketplaceVenue;
  externalListingId?: string | null;
  title: string;
  player: string;
  cardDescription: string;
  sport: Sport;
  year?: number;
  setName?: string;
  grade?: string;
  condition?: string;
  askingPrice: number;
  estimatedMarketValue?: number;
  currency: string;
  status: 'active' | 'pending' | 'sold' | 'archived';
  listingUrl?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface ListingOfferRecord {
  id: string;
  listingId: string;
  buyerCounterpartyId?: string | null;
  sellerCounterpartyId?: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  message?: string;
  sourceVenue: MarketplaceVenue;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
}

export interface DealRoomAttachment {
  id: string;
  roomId: string;
  storagePath: string;
  filename: string;
  mimeType?: string;
  uploadedBy?: string | null;
  uploadedAt: string;
}

export interface DealRoomRecord {
  id: string;
  ownerUserId?: string | null;
  listingId?: string | null;
  title: string;
  roomType: 'buy' | 'sell' | 'swap' | 'auction';
  status: 'active' | 'negotiating' | 'pending_close' | 'closed' | 'expired';
  cardPlayer: string;
  cardDescription: string;
  cardGrade?: string;
  estimatedValue?: number;
  askingPrice?: number;
  currentBid?: number;
  isEncrypted: boolean;
  createdAt: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface DealRoomParticipantRecord {
  id: string;
  roomId: string;
  userId?: string | null;
  counterpartyId?: string | null;
  displayName: string;
  role: 'seller' | 'buyer' | 'broker' | 'observer';
  isVerified: boolean;
  joinedAt: string;
}

export interface DealRoomMessageRecord {
  id: string;
  roomId: string;
  senderParticipantId?: string | null;
  senderDisplayName: string;
  messageType: 'message' | 'offer' | 'counter' | 'accept' | 'reject' | 'system';
  content: string;
  offerAmount?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface LiquidityTwinSnapshot {
  id: string;
  assetId: string;
  assetName: string;
  sourceVenue: MarketplaceVenue;
  midpointValue: number;
  bestBid?: number;
  bestAsk?: number;
  spreadPct: number;
  liquidityScore: number;
  timeToExitDays: number;
  slippagePct: number;
  recommendedVenue: MarketplaceVenue;
  confidence: number;
  compsUsed: number;
  generatedAt: string;
}

export interface CatalystMarketEvent {
  id: string;
  assetId?: string | null;
  assetName: string;
  catalystType: CatalystType;
  headline: string;
  narrative: string;
  confidence: number;
  expectedMovePct: number;
  downsidePct: number;
  severity: CatalystSeverity;
  triggerWindow: string;
  source: 'engine' | 'manual' | 'external';
  linkedListingId?: string | null;
  linkedDealRoomId?: string | null;
  createdAt: string;
}

export interface ScenarioSnapshot {
  id: string;
  ownerUserId?: string | null;
  name: string;
  templateKind: ScenarioTemplateKind;
  description?: string;
  inputs: Record<string, unknown>;
  summary?: string;
  createdAt: string;
}

export interface ScenarioRunRecord {
  id: string;
  ownerUserId?: string | null;
  snapshotId?: string | null;
  scenarioName: string;
  scenarioKind: ScenarioTemplateKind;
  portfolioValue: number;
  projectedValue: number;
  navDelta: number;
  riskScore?: number;
  summary?: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  createdAt: string;
}

export interface ExecutionIntentRecord {
  id: string;
  ownerUserId?: string | null;
  recommendationId?: string | null;
  counterpartyId?: string | null;
  listingId?: string | null;
  dealRoomId?: string | null;
  actionType: 'buy' | 'list' | 'cancel' | 'counter';
  venue: MarketplaceVenue;
  assetId?: string | null;
  assetName: string;
  quantity: number;
  limitPrice: number;
  maxSlippagePct?: number;
  status: 'draft' | 'pending_approval' | 'submitted' | 'filled' | 'failed' | 'cancelled';
  rationale?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface ExecutionApprovalRecord {
  id: string;
  intentId: string;
  decision: 'approve' | 'reject';
  actorUserId?: string | null;
  actorLabel: string;
  note?: string;
  createdAt: string;
}

export interface ExecutionFillRecord {
  id: string;
  intentId: string;
  venue: MarketplaceVenue;
  fillQuantity: number;
  fillPrice: number;
  fees?: number;
  state: 'submitted' | 'filled' | 'partial' | 'failed' | 'cancelled';
  externalOrderId?: string | null;
  createdAt: string;
}

export type FrontierFeatureCategory =
  | 'Risk'
  | 'Trust'
  | 'Finance'
  | 'Operations'
  | 'Market Structure'
  | 'Strategy';

export type FrontierFeatureTier = 'Competitive Moat' | 'Industry-First';
export type FrontierFeatureStage = 'recommended' | 'designing' | 'production-ready';
export type FrontierFeatureComplexity = 'medium' | 'high';
export type FrontierChecklistStatus = 'ready' | 'needs-build';

export interface FrontierChecklistItem {
  label: string;
  detail: string;
  status: FrontierChecklistStatus;
}

export interface FrontierFeatureBlueprint {
  id: string;
  name: string;
  tagline: string;
  category: FrontierFeatureCategory;
  tier: FrontierFeatureTier;
  complexity: FrontierFeatureComplexity;
  competitionGap: string;
  whyDifferent: string;
  userOutcome: string;
  moatScore: number;
  dataSources: string[];
  operatorWorkflow: string[];
  productionChecklist: FrontierChecklistItem[];
  successMetrics: string[];
  complianceNotes: string[];
}

export interface FrontierFeatureState {
  featureId: string;
  stage: FrontierFeatureStage;
  note: string;
  updatedAt: string;
}

export interface FrontierFeatureView extends FrontierFeatureBlueprint {
  stage: FrontierFeatureStage;
  note: string;
  updatedAt?: string;
  launchReadiness: number;
}

