// ─── Lazy-loaded Page Components ──────────────────────────────────────
// Extracted from App.tsx so the router file stays focused on layout and
// route wiring. Critical path: Dashboard loads first, everything else is
// code-split via React.lazy() and resolved on first navigation.
import { lazy } from 'react';

// Core pages (most frequently accessed)
export const Dashboard = lazy(() => import('../pages/Dashboard.tsx'));
export const Collection = lazy(() => import('../pages/Collection.tsx'));
export const Favorites = lazy(() => import('../pages/Favorites.tsx'));
export const Profile = lazy(() => import('../pages/Profile.tsx'));

// Search & analysis pages
export const DeepSearch = lazy(() => import('../pages/DeepSearch.tsx'));
export const PortfolioAudit = lazy(() => import('../pages/PortfolioAudit.tsx'));
export const MLBStats = lazy(() => import('../pages/MLBStats.tsx'));
export const ProspectTrends = lazy(() => import('../pages/ProspectTrends.tsx'));

// Player & team pages
export const Players = lazy(() => import('../pages/Players.tsx'));
export const PlayerDetail = lazy(() => import('../pages/PlayerDetail.tsx'));
export const Teams = lazy(() => import('../pages/Teams.tsx'));
export const Games = lazy(() => import('../pages/Games.tsx'));
export const Trends = lazy(() => import('../pages/Trends.tsx'));
export const Compare = lazy(() => import('../pages/Compare.tsx'));

// Portfolio & financial pages
export const PortfolioBuilder = lazy(() => import('../pages/PortfolioBuilder.tsx'));
export const Billing = lazy(() => import('../pages/Billing.tsx'));
export const Leaderboard = lazy(() => import('../pages/Leaderboard.tsx'));

// Alerts & tools
export const Alerts = lazy(() => import('../pages/Alerts.tsx'));
export const AnalystWarRoom = lazy(() => import('../components/AnalystWarRoom.tsx'));
export const GuildDashboard = lazy(() => import('../pages/GuildDashboard.tsx'));

// Feature discovery and release-ready advanced features
export const FeatureDirectory = lazy(() => import('../pages/FeatureDirectory.tsx'));
export const CollectionNarrative = lazy(() => import('../pages/CollectionNarrative.tsx'));
export const LiquidityTwin = lazy(() => import('../pages/LiquidityTwin.tsx'));
export const CatalystMarket = lazy(() => import('../pages/CatalystMarket.tsx'));
export const CounterpartyTrustGraph = lazy(() => import('../pages/CounterpartyTrustGraph.tsx'));
export const PortfolioScenarioTheater = lazy(() => import('../pages/PortfolioScenarioTheater.tsx'));
export const PrivateDealRoomAgent = lazy(() => import('../pages/PrivateDealRoomAgent.tsx'));
export const CollectorAuditDossier = lazy(() => import('../pages/CollectorAuditDossier.tsx'));

// Phases 114-128: Next-gen features
export const PortfolioCopilot = lazy(() => import('../pages/PortfolioCopilot.tsx'));
export const MarketplaceAggregator = lazy(() => import('../pages/MarketplaceAggregator.tsx'));
export const SubscriptionBox = lazy(() => import('../pages/SubscriptionBox.tsx'));
export const CollectorDna = lazy(() => import('../pages/CollectorDna.tsx'));
export const AuctionWarRoom = lazy(() => import('../pages/AuctionWarRoom.tsx'));
export const GradingTracker = lazy(() => import('../pages/GradingTracker.tsx'));
export const DealerDashboard = lazy(() => import('../pages/DealerDashboard.tsx'));
export const FundManager = lazy(() => import('../pages/FundManager.tsx'));
export const ApiLicensing = lazy(() => import('../pages/ApiLicensing.tsx'));
export const CardShowModePage = lazy(() => import('../pages/CardShowModePage.tsx'));
export const ArScanner = lazy(() => import('../pages/ArScanner.tsx'));
export const HypeRadar = lazy(() => import('../pages/HypeRadar.tsx'));
export const NonSportsExpansion = lazy(() => import('../pages/NonSportsExpansion.tsx'));
export const InjuryIntel = lazy(() => import('../pages/InjuryIntel.tsx'));
export const CarbonScore = lazy(() => import('../pages/CarbonScore.tsx'));

// Phases 129-138: Competitive differentiators
export const VaultArbitrage = lazy(() => import('../pages/VaultArbitrage.tsx'));
export const PressingRoi = lazy(() => import('../pages/PressingRoi.tsx'));
export const BehavioralFinance = lazy(() => import('../pages/BehavioralFinance.tsx'));
export const CompForensics = lazy(() => import('../pages/CompForensics.tsx'));
export const TournamentArena = lazy(() => import('../pages/TournamentArena.tsx'));
export const InfluencerImpact = lazy(() => import('../pages/InfluencerImpact.tsx'));
export const ConditionAging = lazy(() => import('../pages/ConditionAging.tsx'));
export const AuthTraining = lazy(() => import('../pages/AuthTraining.tsx'));
export const InventorySync = lazy(() => import('../pages/InventorySync.tsx'));
export const RookieClassIndex = lazy(() => import('../pages/RookieClassIndex.tsx'));

// Phases 139-148: Production-grade expansion
export const VendingMachine = lazy(() => import('../pages/VendingMachine.tsx'));
export const WomensSportsIndex = lazy(() => import('../pages/WomensSportsIndex.tsx'));
export const GradingAuditor = lazy(() => import('../pages/GradingAuditor.tsx'));
export const SmartStorage = lazy(() => import('../pages/SmartStorage.tsx'));
export const PrintRunIntelligence = lazy(() => import('../pages/PrintRunIntelligence.tsx'));
export const YouthOnboarding = lazy(() => import('../pages/YouthOnboarding.tsx'));
export const LiveBreakHub = lazy(() => import('../pages/LiveBreakHub.tsx'));
export const PricePrediction = lazy(() => import('../pages/PricePrediction.tsx'));
export const InternationalArbitrage = lazy(() => import('../pages/InternationalArbitrage.tsx'));
export const BlockchainProvenance = lazy(() => import('../pages/BlockchainProvenance.tsx'));

// Phases 149-158: Advanced platform features
export const TradeDeadline = lazy(() => import('../pages/TradeDeadline.tsx'));
export const CollectionAppraiser = lazy(() => import('../pages/CollectionAppraiser.tsx'));
export const SetRegistry = lazy(() => import('../pages/SetRegistry.tsx'));
export const VintageMarket = lazy(() => import('../pages/VintageMarket.tsx'));
export const SocialTrading = lazy(() => import('../pages/SocialTrading.tsx'));
export const ListingOptimizer = lazy(() => import('../pages/ListingOptimizer.tsx'));
export const TaxCalculator = lazy(() => import('../pages/TaxCalculator.tsx'));
export const SealedProduct = lazy(() => import('../pages/SealedProduct.tsx'));
export const ErrorCard = lazy(() => import('../pages/ErrorCard.tsx'));
export const AuctionSniper = lazy(() => import('../pages/AuctionSniper.tsx'));

// Phases 159-168: Competitive Feature Suite
export const RealTimePriceEngine = lazy(() => import('../pages/RealTimePriceEngine.tsx'));
export const AiCardScanner = lazy(() => import('../pages/AiCardScanner.tsx'));
export const CrossPlatformArbitrage = lazy(() => import('../pages/CrossPlatformArbitrage.tsx'));
export const PredictivePriceEngine = lazy(() => import('../pages/PredictivePriceEngine.tsx'));
export const TaxReport = lazy(() => import('../pages/TaxReport.tsx'));
export const GradePredictionPage = lazy(() => import('../pages/GradePrediction.tsx'));
export const SmartNotifications = lazy(() => import('../pages/SmartNotifications.tsx'));
export const ConsensusPricing = lazy(() => import('../pages/ConsensusPricing.tsx'));
export const LiveBreakRoi = lazy(() => import('../pages/LiveBreakRoi.tsx'));
export const PortfolioBenchmark = lazy(() => import('../pages/PortfolioBenchmark.tsx'));

// Phases 169-178: Next-gen platform features
export const Watchlist = lazy(() => import('../pages/Watchlist.tsx'));
export const InsuranceVault = lazy(() => import('../pages/InsuranceVault.tsx'));
export const BreakEvenCalculator = lazy(() => import('../pages/BreakEvenCalculator.tsx'));
export const CommunityTrading = lazy(() => import('../pages/CommunityTrading.tsx'));
export const SetCompletionPage = lazy(() => import('../pages/SetCompletion.tsx'));
export const PortfolioNarrator = lazy(() => import('../pages/PortfolioNarrator.tsx'));
export const VintageAllocation = lazy(() => import('../pages/VintageAllocation.tsx'));
export const GradingTurnaround = lazy(() => import('../pages/GradingTurnaround.tsx'));
export const MarketReplay = lazy(() => import('../pages/MarketReplay.tsx'));
export const ScanToValue = lazy(() => import('../pages/ScanToValue.tsx'));

// Phases 179-188: Engagement & monetization features
export const HobbyIncome = lazy(() => import('../pages/HobbyIncome.tsx'));
export const CardShowPlanner = lazy(() => import('../pages/CardShowPlanner.tsx'));
export const RipFlipSim = lazy(() => import('../pages/RipFlipSim.tsx'));
export const SocialFeed = lazy(() => import('../pages/SocialFeed.tsx'));
export const SlabVerification = lazy(() => import('../pages/SlabVerification.tsx'));
export const PortfolioStressTest = lazy(() => import('../pages/PortfolioStressTest.tsx'));
export const ConsignmentMarket = lazy(() => import('../pages/ConsignmentMarket.tsx'));
export const GradingPrep = lazy(() => import('../pages/GradingPrep.tsx'));
export const ParallelUniverse = lazy(() => import('../pages/ParallelUniverse.tsx'));
export const AchievementSystem = lazy(() => import('../pages/AchievementSystem.tsx'));
export const SentimentVelocity = lazy(() => import('../pages/SentimentVelocity.tsx'));

// v4.0: Multi-Sport League Hubs
export const NFLHub = lazy(() => import('../pages/NFLHub.tsx'));
export const NBAHub = lazy(() => import('../pages/NBAHub.tsx'));
export const NHLHub = lazy(() => import('../pages/NHLHub.tsx'));
export const SoccerHub = lazy(() => import('../pages/SoccerHub.tsx'));

// v4.0: Multi-Sport & Infrastructure
export const GradingVisionEngine = lazy(() => import('../pages/GradingVisionEngine.tsx'));
export const NotificationCenter = lazy(() => import('../pages/NotificationCenter.tsx'));
export const DashboardBuilder = lazy(() => import('../pages/DashboardBuilder.tsx'));
export const MarketplaceIntegrations = lazy(() => import('../pages/MarketplaceIntegrations.tsx'));
export const InsuranceAppraisal = lazy(() => import('../pages/InsuranceAppraisal.tsx'));
export const OfflineManager = lazy(() => import('../pages/OfflineManager.tsx'));

// v4.0: Industry-First Features
export const ProvenanceDna = lazy(() => import('../pages/ProvenanceDna.tsx'));
export const EmotionalThermometer = lazy(() => import('../pages/EmotionalThermometer.tsx'));
export const CardWeather = lazy(() => import('../pages/CardWeather.tsx'));
export const DeadMoneyDetector = lazy(() => import('../pages/DeadMoneyDetector.tsx'));
export const MicroArbitrageSwarm = lazy(() => import('../pages/MicroArbitrageSwarm.tsx'));
export const GenerationalWealth = lazy(() => import('../pages/GenerationalWealth.tsx'));
export const CardAgingLab = lazy(() => import('../pages/CardAgingLab.tsx'));
export const PhantomBacktester = lazy(() => import('../pages/PhantomBacktester.tsx'));
export const CollectorMatchmaker = lazy(() => import('../pages/CollectorMatchmaker.tsx'));

// v5.0: Next-Gen Investment Intelligence (Batch 1)
export const CardGenomeSequencer = lazy(() => import('../pages/CardGenomeSequencer.tsx'));
export const InjuryOracle = lazy(() => import('../pages/InjuryOracle.tsx'));
export const CrossAssetCorrelation = lazy(() => import('../pages/CrossAssetCorrelation.tsx'));
export const CollectorSocialGraph = lazy(() => import('../pages/CollectorSocialGraph.tsx'));
export const RestorationSimulator = lazy(() => import('../pages/RestorationSimulator.tsx'));
export const MarketMakerArena = lazy(() => import('../pages/MarketMakerArena.tsx'));
export const FractionalVault = lazy(() => import('../pages/FractionalVault.tsx'));
export const PortfolioStressTester = lazy(() => import('../pages/PortfolioStressTester.tsx'));
export const RookiePipelineScanner = lazy(() => import('../pages/RookiePipelineScanner.tsx'));
export const ForensicsLab = lazy(() => import('../pages/ForensicsLab.tsx'));

// v5.0: Next-Gen Investment Intelligence (Batch 2)
export const CardDecayPredictor = lazy(() => import('../pages/CardDecayPredictor.tsx'));
export const NarrativeArcEngine = lazy(() => import('../pages/NarrativeArcEngine.tsx'));
export const LiquidityDepthScanner = lazy(() => import('../pages/LiquidityDepthScanner.tsx'));
export const ContagionMapper = lazy(() => import('../pages/ContagionMapper.tsx'));
export const GrailIndexConstructor = lazy(() => import('../pages/GrailIndexConstructor.tsx'));
export const PrintRunDecoder = lazy(() => import('../pages/PrintRunDecoder.tsx'));
export const TemporalArbitrageRadar = lazy(() => import('../pages/TemporalArbitrageRadar.tsx'));
export const CollectionDNAMixer = lazy(() => import('../pages/CollectionDNAMixer.tsx'));
export const CardYieldFarming = lazy(() => import('../pages/CardYieldFarming.tsx'));
export const ChaosTheorySimulator = lazy(() => import('../pages/ChaosTheorySimulator.tsx'));

// v5.1: Beyond-Competition Intelligence (Batch 3)
export const SentimentVolatilityIndex = lazy(() => import('../pages/SentimentVolatilityIndex.tsx'));
export const MicroSeasonCapitalizer = lazy(() => import('../pages/MicroSeasonCapitalizer.tsx'));
export const CollectionHedgeConstructor = lazy(() => import('../pages/CollectionHedgeConstructor.tsx'));
export const GenerationalWealthPlanner = lazy(() => import('../pages/GenerationalWealthPlanner.tsx'));
export const CardClimateRiskMapper = lazy(() => import('../pages/CardClimateRiskMapper.tsx'));
export const RuleChangeImpactModeler = lazy(() => import('../pages/RuleChangeImpactModeler.tsx'));
export const NostalgiaPredictor = lazy(() => import('../pages/NostalgiaPredictor.tsx'));
export const SyntheticCardIndex = lazy(() => import('../pages/SyntheticCardIndex.tsx'));
export const ProvenanceChainVerifier = lazy(() => import('../pages/ProvenanceChainVerifier.tsx'));
export const MarketRegimeDetector = lazy(() => import('../pages/MarketRegimeDetector.tsx'));

// v5.0: Industry-First Features — Round 3 (Phases 134-143)
export const OptionsDesk = lazy(() => import('../pages/OptionsDesk.tsx'));
export const ConditionCensus = lazy(() => import('../pages/ConditionCensus.tsx'));
export const BreakEvenVelocity = lazy(() => import('../pages/BreakEvenVelocity.tsx'));
export const TaxAutopilot = lazy(() => import('../pages/TaxAutopilot.tsx'));
export const CardShowGps = lazy(() => import('../pages/CardShowGps.tsx'));
export const ContractCorrelation = lazy(() => import('../pages/ContractCorrelation.tsx'));
export const BankruptcyShield = lazy(() => import('../pages/BankruptcyShield.tsx'));
export const NegotiationCoach = lazy(() => import('../pages/NegotiationCoach.tsx'));
export const MultiGenCompare = lazy(() => import('../pages/MultiGenCompare.tsx'));
export const PortfolioDnaRebalancer = lazy(() => import('../pages/PortfolioDnaRebalancer.tsx'));

// v6.0: Industry-Absent Innovation Suite (10 features)
export const InjuryShockwave = lazy(() => import('../pages/InjuryShockwave.tsx'));
export const ArVaultWalkthrough = lazy(() => import('../pages/ArVaultWalkthrough.tsx'));
export const HofProbability = lazy(() => import('../pages/HofProbability.tsx'));
export const MarketMicrostructure = lazy(() => import('../pages/MarketMicrostructure.tsx'));
export const IotConditionGuardian = lazy(() => import('../pages/IotConditionGuardian.tsx'));
export const FractionalSyndicate = lazy(() => import('../pages/FractionalSyndicate.tsx'));
export const VoiceCardShow = lazy(() => import('../pages/VoiceCardShow.tsx'));
export const NarrativeAlpha = lazy(() => import('../pages/NarrativeAlpha.tsx'));
export const CounterfactualValue = lazy(() => import('../pages/CounterfactualValue.tsx'));
export const BiometricTradingGuard = lazy(() => import('../pages/BiometricTradingGuard.tsx'));

// v6.1: Industry-Absent Innovation — Round 2
export const DopamineCycleTracker = lazy(() => import('../pages/DopamineCycleTracker.tsx'));
export const HobbyLiquidityCrisis = lazy(() => import('../pages/HobbyLiquidityCrisis.tsx'));
export const MemoryIndex = lazy(() => import('../pages/MemoryIndex.tsx'));
export const PopForecaster = lazy(() => import('../pages/PopForecaster.tsx'));
export const DraftCapitalFutures = lazy(() => import('../pages/DraftCapitalFutures.tsx'));
export const ShadowInventory = lazy(() => import('../pages/ShadowInventory.tsx'));
export const EmotionJournal = lazy(() => import('../pages/EmotionJournal.tsx'));
export const EstateSuccession = lazy(() => import('../pages/EstateSuccession.tsx'));
export const RefractorMapper = lazy(() => import('../pages/RefractorMapper.tsx'));
export const CenteringAnalyzer = lazy(() => import('../pages/CenteringAnalyzer.tsx'));

// v7.0: Industry-Absent Innovation — Round 3 (Phases 224-233)
export const RegulatoryComplianceRadar = lazy(() => import('../pages/RegulatoryComplianceRadar.tsx'));
export const AcousticAuthentication = lazy(() => import('../pages/AcousticAuthentication.tsx'));
export const DealerFlowIntelligence = lazy(() => import('../pages/DealerFlowIntelligence.tsx'));
export const PsychographicDemand = lazy(() => import('../pages/PsychographicDemand.tsx'));
export const MicroGeographicDemand = lazy(() => import('../pages/MicroGeographicDemand.tsx'));
export const CrossHobbyContagion = lazy(() => import('../pages/CrossHobbyContagion.tsx'));
export const VenueHealthOracle = lazy(() => import('../pages/VenueHealthOracle.tsx'));
export const NegotiationReplay = lazy(() => import('../pages/NegotiationReplay.tsx'));
export const CardMaterialSpectrometry = lazy(() => import('../pages/CardMaterialSpectrometry.tsx'));
export const GenerationalDemandForecaster = lazy(() => import('../pages/GenerationalDemandForecaster.tsx'));

// v7.1: Industry-Absent Innovation — Round 4 (Phases 234-253)
export const SlabCaseForensics = lazy(() => import('../pages/SlabCaseForensics.tsx'));
export const PriceWhisperer = lazy(() => import('../pages/PriceWhisperer.tsx'));
export const CardLoanCollateral = lazy(() => import('../pages/CardLoanCollateral.tsx'));
export const GradingArbitrage = lazy(() => import('../pages/GradingArbitrage.tsx'));
export const ConsignmentOptimizer = lazy(() => import('../pages/ConsignmentOptimizer.tsx'));
export const CardAgingClock = lazy(() => import('../pages/CardAgingClock.tsx'));
export const SentimentSeismograph = lazy(() => import('../pages/SentimentSeismograph.tsx'));
export const ContractValuation = lazy(() => import('../pages/ContractValuation.tsx'));
export const CollectionEntropy = lazy(() => import('../pages/CollectionEntropy.tsx'));
export const CardShowNavigator = lazy(() => import('../pages/CardShowNavigator.tsx'));
export const InfluencerQuantifier = lazy(() => import('../pages/InfluencerQuantifier.tsx'));
export const WaxCTScanner = lazy(() => import('../pages/WaxCTScanner.tsx'));
export const ManipulationDetector = lazy(() => import('../pages/ManipulationDetector.tsx'));
export const InsuranceClaimsAI = lazy(() => import('../pages/InsuranceClaimsAI.tsx'));
export const RecessionPlaybook = lazy(() => import('../pages/RecessionPlaybook.tsx'));
export const PersonalityMatrix = lazy(() => import('../pages/PersonalityMatrix.tsx'));
export const PhotoStudio = lazy(() => import('../pages/PhotoStudio.tsx'));
export const PeerLending = lazy(() => import('../pages/PeerLending.tsx'));
export const DraftNightTracker = lazy(() => import('../pages/DraftNightTracker.tsx'));
export const VintageProvenance = lazy(() => import('../pages/VintageProvenance.tsx'));

// v8.0: Industry-Absent Innovation — Frontier Phase (Phases 254-263)
export const AuctionEquilibrium = lazy(() => import('../pages/AuctionEquilibrium.tsx'));
export const MemeticPropagation = lazy(() => import('../pages/MemeticPropagation.tsx'));
export const CircadianOptimizer = lazy(() => import('../pages/CircadianOptimizer.tsx'));
export const CulturalVelocity = lazy(() => import('../pages/CulturalVelocity.tsx'));
export const CounterpartyFingerprint = lazy(() => import('../pages/CounterpartyFingerprint.tsx'));
export const CollectionTopology = lazy(() => import('../pages/CollectionTopology.tsx'));
export const SurvivorshipBias = lazy(() => import('../pages/SurvivorshipBias.tsx'));
export const ForgeryEvolution = lazy(() => import('../pages/ForgeryEvolution.tsx'));
export const DecisionFatigue = lazy(() => import('../pages/DecisionFatigue.tsx'));
export const OpportunityCostPhantom = lazy(() => import('../pages/OpportunityCostPhantom.tsx'));

// v9.0: Industry Phases — Group & Enterprise Scale (Phases 264-273)
export const SharedWatchlists = lazy(() => import('../pages/SharedWatchlists.tsx'));
export const GroupBreaks = lazy(() => import('../pages/GroupBreaks.tsx'));
export const ClubManagement = lazy(() => import('../pages/ClubManagement.tsx'));
export const CollectiveGrading = lazy(() => import('../pages/CollectiveGrading.tsx'));
export const SharedDashboards = lazy(() => import('../pages/SharedDashboards.tsx'));
export const RBACTeams = lazy(() => import('../pages/RBACTeams.tsx'));
export const WhiteLabelApi = lazy(() => import('../pages/WhiteLabelApi.tsx'));
export const DealerInventory = lazy(() => import('../pages/DealerInventory.tsx'));
export const FundReporting = lazy(() => import('../pages/FundReporting.tsx'));
export const AuditTrail = lazy(() => import('../pages/AuditTrail.tsx'));

// v10.0: Group Scale Phase 2 — Community Infrastructure (Phases 274-283)
export const CollaborativeSetRegistry = lazy(() => import('../pages/CollaborativeSetRegistry.tsx'));
export const CardShowSquad = lazy(() => import('../pages/CardShowSquad.tsx'));
export const GroupBuyCoop = lazy(() => import('../pages/GroupBuyCoop.tsx'));
export const DraftNightWarRoom = lazy(() => import('../pages/DraftNightWarRoom.tsx'));
export const MentorshipExchange = lazy(() => import('../pages/MentorshipExchange.tsx'));
export const DisputeArbitration = lazy(() => import('../pages/DisputeArbitration.tsx'));
export const GroupInsurance = lazy(() => import('../pages/GroupInsurance.tsx'));
export const CrowdPricing = lazy(() => import('../pages/CrowdPricing.tsx'));
export const GroupVault = lazy(() => import('../pages/GroupVault.tsx'));
export const SwapMeet = lazy(() => import('../pages/SwapMeet.tsx'));

// v5.1+: PRD 4.11 — Next set of features not in the industry (Frontier)
export const AgentOutcomeMemory = lazy(() => import('../pages/AgentOutcomeMemory.tsx'));
export const MarketTruthLedger = lazy(() => import('../pages/MarketTruthLedger.tsx'));
export const CounterpartyPassport = lazy(() => import('../pages/CounterpartyPassport.tsx'));
export const ThesisBacktester = lazy(() => import('../pages/ThesisBacktester.tsx'));
export const LiquidityHorizon = lazy(() => import('../pages/LiquidityHorizon.tsx'));
export const FvConfidence = lazy(() => import('../pages/FvConfidence.tsx'));
export const RegulatoryAlerts = lazy(() => import('../pages/RegulatoryAlerts.tsx'));
export const AgentDelegationAudit = lazy(() => import('../pages/AgentDelegationAudit.tsx'));
export const CapitalFlowRadar = lazy(() => import('../pages/CapitalFlowRadar.tsx'));
export const SyntheticIndexBuilder = lazy(() => import('../pages/SyntheticIndexBuilder.tsx'));
export const CatastropheLiquidation = lazy(() => import('../pages/CatastropheLiquidation.tsx'));
export const PortfolioImmunization = lazy(() => import('../pages/PortfolioImmunization.tsx'));
export const IdentityGraph = lazy(() => import('../pages/IdentityGraph.tsx'));
export const NarrativeLifecycle = lazy(() => import('../pages/NarrativeLifecycle.tsx'));
export const AgentPersonality = lazy(() => import('../pages/AgentPersonality.tsx'));

// v5.2: Next 10 industry-absent features (PRD 4.12)
export const BidAskSpreadPredictor = lazy(() => import('../pages/BidAskSpreadPredictor.tsx'));
export const WashSaleHorizon = lazy(() => import('../pages/WashSaleHorizon.tsx'));
export const SellerUrgencyScore = lazy(() => import('../pages/SellerUrgencyScore.tsx'));
export const PortfolioBetaIndex = lazy(() => import('../pages/PortfolioBetaIndex.tsx'));
export const GradingQueueEstimator = lazy(() => import('../pages/GradingQueueEstimator.tsx'));
export const ReputationDecayTracker = lazy(() => import('../pages/ReputationDecayTracker.tsx'));
export const EventImpactAttribution = lazy(() => import('../pages/EventImpactAttribution.tsx'));
export const LiquidityReserveCalculator = lazy(() => import('../pages/LiquidityReserveCalculator.tsx'));
export const CrossSportMomentum = lazy(() => import('../pages/CrossSportMomentum.tsx'));
export const AgentConfidenceHistory = lazy(() => import('../pages/AgentConfidenceHistory.tsx'));

// Formerly coming-soon features — now live
export const WhatIfSimulator = lazy(() => import('../pages/WhatIfSimulator.tsx'));
export const GradingBatchPlanner = lazy(() => import('../pages/GradingBatchPlanner.tsx'));
export const EbayListingGenerator = lazy(() => import('../pages/EbayListingGenerator.tsx'));
export const WaxBreakRoiTracker = lazy(() => import('../pages/WaxBreakRoiTracker.tsx'));

// Industry-first new features (v11)
export const RegretMinimizationEngine = lazy(() => import('../pages/RegretMinimizationEngine.tsx'));
export const MentalHealthSafeguards = lazy(() => import('../pages/MentalHealthSafeguards.tsx'));
export const GradeInflationDetector = lazy(() => import('../pages/GradeInflationDetector.tsx'));
export const SubscriptionBoxOptimizer = lazy(() => import('../pages/SubscriptionBoxOptimizer.tsx'));
export const ReverseDutchAuctionEngine = lazy(() => import('../pages/ReverseDutchAuctionEngine.tsx'));
export const CarbonFootprintTracker = lazy(() => import('../pages/CarbonFootprintTracker.tsx'));
export const BidderPsychologyProfiler = lazy(() => import('../pages/BidderPsychologyProfiler.tsx'));
export const ProductAnnouncementRadar = lazy(() => import('../pages/ProductAnnouncementRadar.tsx'));
export const CollectorSuccessionProtocol = lazy(() => import('../pages/CollectorSuccessionProtocol.tsx'));
export const CrossHobbyArbitrageBridge = lazy(() => import('../pages/CrossHobbyArbitrageBridge.tsx'));

// Previously unrouted pages — Advanced Trading & Analysis
export const LiveGameImpactEngine = lazy(() => import('../pages/LiveGameImpactEngine.tsx'));
export const PreGradeIntelligence = lazy(() => import('../pages/PreGradeIntelligence.tsx'));
export const CopyTrading = lazy(() => import('../pages/CopyTrading.tsx'));
export const PredictiveMarketMaker = lazy(() => import('../pages/PredictiveMarketMaker.tsx'));
export const InfluenceGraph = lazy(() => import('../pages/InfluenceGraph.tsx'));
export const CrossHobbyPortfolio = lazy(() => import('../pages/CrossHobbyPortfolio.tsx'));
export const AutonomousAcquisition = lazy(() => import('../pages/AutonomousAcquisition.tsx'));
export const DraftWarRoom = lazy(() => import('../pages/DraftWarRoom.tsx'));

// Previously unrouted pages — Institutional & Operations
export const APIPlatform = lazy(() => import('../pages/APIPlatform.tsx'));
export const ComplianceCenter = lazy(() => import('../pages/ComplianceCenter.tsx'));
export const PhaseOperations = lazy(() => import('../pages/PhaseOperations.tsx'));
export const DataConsolidation = lazy(() => import('../pages/DataConsolidation.tsx'));
export const MSITerminal = lazy(() => import('../pages/MSITerminal.tsx'));
export const VaultSecurity = lazy(() => import('../pages/VaultSecurity.tsx'));

// Previously unrouted pages — Trading & Marketplace
export const DealRoom = lazy(() => import('../pages/DealRoom.tsx'));
export const DerivativesDesk = lazy(() => import('../pages/DerivativesDesk.tsx'));
export const ConsignmentRouter = lazy(() => import('../pages/ConsignmentRouter.tsx'));
export const P2PMarketplace = lazy(() => import('../pages/P2PMarketplace.tsx'));
export const TransactionWire = lazy(() => import('../pages/TransactionWire.tsx'));
export const LiveBreaks = lazy(() => import('../pages/LiveBreaks.tsx'));

// Previously unrouted pages — Analytics & Intelligence
export const CardDNA = lazy(() => import('../pages/CardDNA.tsx'));
export const CollectionGenome = lazy(() => import('../pages/CollectionGenome.tsx'));
export const ErrorCardIntel = lazy(() => import('../pages/ErrorCardIntel.tsx'));
export const HOFTracker = lazy(() => import('../pages/HOFTracker.tsx'));
export const MarketIndices = lazy(() => import('../pages/MarketIndices.tsx'));
export const PlayerTrajectory = lazy(() => import('../pages/PlayerTrajectory.tsx'));
export const PortfolioAttribution = lazy(() => import('../pages/PortfolioAttribution.tsx'));
export const ProvenanceChain = lazy(() => import('../pages/ProvenanceChain.tsx'));
export const ProvenanceChainIntelligence = lazy(() => import('../pages/ProvenanceChainIntelligence.tsx'));
export const QuantWorkbench = lazy(() => import('../pages/QuantWorkbench.tsx'));
export const ResearchReports = lazy(() => import('../pages/ResearchReports.tsx'));
export const SentimentRadar = lazy(() => import('../pages/SentimentRadar.tsx'));
export const WaxIntelligence = lazy(() => import('../pages/WaxIntelligence.tsx'));
export const WeatherImpact = lazy(() => import('../pages/WeatherImpact.tsx'));

// Previously unrouted pages — Portfolio & Financial
export const EstatePlanning = lazy(() => import('../pages/EstatePlanning.tsx'));
export const Rebalancer = lazy(() => import('../pages/Rebalancer.tsx'));

// Previously unrouted pages — Showcase & Labs
export const ARShowcase = lazy(() => import('../pages/ARShowcase.tsx'));
export const FrontierLab = lazy(() => import('../pages/FrontierLab.tsx'));
export const LiveImpact = lazy(() => import('../pages/LiveImpact.tsx'));
export const Inventory = lazy(() => import('../pages/Inventory.tsx'));

// Interactive Demo Flow
export const DemoFlowPage = lazy(() => import('../pages/DemoFlow.tsx'));

// Auth pages (public routes, also lazy since not needed after login)
export const Login = lazy(() => import('../pages/Login.tsx'));
export const Signup = lazy(() => import('../pages/Signup.tsx'));
export const ForgotPassword = lazy(() => import('../pages/ForgotPassword.tsx'));
export const ResetPassword = lazy(() => import('../pages/ResetPassword.tsx'));
export const PublicPortfolio = lazy(() => import('../pages/PublicPortfolio.tsx'));
