
import React, { Suspense, useState, useEffect } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AutoTierGate } from './components/TieredRoute';
import GlobalErrorBoundary from './components/GlobalErrorBoundary.tsx';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import MobileNav from './components/MobileNav.tsx';
import SyncSchedulerInitializer from './components/SyncSchedulerInitializer.tsx';
import LuminousTracker from './components/LuminousTracker.tsx';
import { MigrationProvider } from './contexts/MigrationContext.tsx';
import MigrationBanner from './components/MigrationBanner.tsx';
import ProductionConfigBanner from './components/ProductionConfigBanner.tsx';
import PwaUpdateBanner from './components/PwaUpdateBanner.tsx';
import MarketTicker from './components/MarketTicker.tsx';
import { useSupabaseInventory } from './lib/utils/useSupabaseInventory.ts';
import LazyErrorBoundary from './components/LazyErrorBoundary.tsx';
import { PageLoadingFallback } from './components/LazyLoadFallback.tsx';
import GuidedTour from './components/GuidedTour.tsx';
import InstitutionalWallHUD from './components/InstitutionalWallHUD.tsx';
import GrailShowcase from './components/GrailShowcase.tsx';
import DemoFlowWidget from './components/DemoFlowWidget.tsx';
import DocumentTitleSync from './components/DocumentTitleSync.tsx';
import { validateEnv } from './lib/utils/env';
import { initDAL } from './lib/dal';
// ─── Lazy-loaded Page Components ──────────────────────────────────────
// All React.lazy() page declarations live in routes/lazyRoutes.ts so this
// file stays focused on layout and route wiring.
import {
  Dashboard, Collection, Favorites, Profile, DeepSearch, PortfolioAudit,
  MLBStats, ProspectTrends, Players, PlayerDetail, Teams, Games,
  Trends, Compare, PortfolioBuilder, Billing, Leaderboard, Alerts,
  AnalystWarRoom, GuildDashboard, FeatureDirectory, CollectionNarrative, LiquidityTwin, CatalystMarket,
  CounterpartyTrustGraph, PortfolioScenarioTheater, PrivateDealRoomAgent, CollectorAuditDossier, PortfolioCopilot, MarketplaceAggregator,
  SubscriptionBox, CollectorDna, AuctionWarRoom, GradingTracker, DealerDashboard, FundManager,
  ApiLicensing, CardShowModePage, ArScanner, HypeRadar, NonSportsExpansion, InjuryIntel,
  CarbonScore, VaultArbitrage, PressingRoi, BehavioralFinance, CompForensics, TournamentArena,
  InfluencerImpact, ConditionAging, AuthTraining, InventorySync, RookieClassIndex, VendingMachine,
  WomensSportsIndex, GradingAuditor, SmartStorage, PrintRunIntelligence, YouthOnboarding, LiveBreakHub,
  PricePrediction, InternationalArbitrage, BlockchainProvenance, TradeDeadline, CollectionAppraiser, SetRegistry,
  VintageMarket, SocialTrading, ListingOptimizer, TaxCalculator, SealedProduct, ErrorCard,
  AuctionSniper, RealTimePriceEngine, AiCardScanner, CrossPlatformArbitrage, PredictivePriceEngine, TaxReport,
  GradePredictionPage, SmartNotifications, ConsensusPricing, LiveBreakRoi, PortfolioBenchmark, Watchlist,
  InsuranceVault, BreakEvenCalculator, CommunityTrading, SetCompletionPage, PortfolioNarrator, VintageAllocation,
  GradingTurnaround, MarketReplay, ScanToValue, HobbyIncome, CardShowPlanner, RipFlipSim,
  SocialFeed, SlabVerification, PortfolioStressTest, ConsignmentMarket, GradingPrep, ParallelUniverse,
  AchievementSystem, SentimentVelocity, NFLHub, NBAHub, NHLHub, SoccerHub,
  GradingVisionEngine, NotificationCenter, DashboardBuilder, MarketplaceIntegrations, InsuranceAppraisal, OfflineManager,
  ProvenanceDna, EmotionalThermometer, CardWeather, DeadMoneyDetector, MicroArbitrageSwarm, GenerationalWealth,
  CardAgingLab, PhantomBacktester, CollectorMatchmaker, CardGenomeSequencer, InjuryOracle, CrossAssetCorrelation,
  CollectorSocialGraph, RestorationSimulator, MarketMakerArena, FractionalVault, PortfolioStressTester, RookiePipelineScanner,
  ForensicsLab, CardDecayPredictor, NarrativeArcEngine, LiquidityDepthScanner, ContagionMapper, GrailIndexConstructor,
  PrintRunDecoder, TemporalArbitrageRadar, CollectionDNAMixer, CardYieldFarming, ChaosTheorySimulator, SentimentVolatilityIndex,
  MicroSeasonCapitalizer, CollectionHedgeConstructor, GenerationalWealthPlanner, CardClimateRiskMapper, RuleChangeImpactModeler, NostalgiaPredictor,
  SyntheticCardIndex, ProvenanceChainVerifier, MarketRegimeDetector, OptionsDesk, ConditionCensus, BreakEvenVelocity,
  TaxAutopilot, CardShowGps, ContractCorrelation, BankruptcyShield, NegotiationCoach, MultiGenCompare,
  PortfolioDnaRebalancer, InjuryShockwave, ArVaultWalkthrough, HofProbability, MarketMicrostructure, IotConditionGuardian,
  FractionalSyndicate, VoiceCardShow, NarrativeAlpha, CounterfactualValue, BiometricTradingGuard, DopamineCycleTracker,
  HobbyLiquidityCrisis, MemoryIndex, PopForecaster, DraftCapitalFutures, ShadowInventory, EmotionJournal,
  EstateSuccession, RefractorMapper, CenteringAnalyzer, RegulatoryComplianceRadar, AcousticAuthentication, DealerFlowIntelligence,
  PsychographicDemand, MicroGeographicDemand, CrossHobbyContagion, VenueHealthOracle, NegotiationReplay, CardMaterialSpectrometry,
  GenerationalDemandForecaster, SlabCaseForensics, PriceWhisperer, CardLoanCollateral, GradingArbitrage, ConsignmentOptimizer,
  CardAgingClock, SentimentSeismograph, ContractValuation, CollectionEntropy, CardShowNavigator, InfluencerQuantifier,
  WaxCTScanner, ManipulationDetector, InsuranceClaimsAI, RecessionPlaybook, PersonalityMatrix, PhotoStudio,
  PeerLending, DraftNightTracker, VintageProvenance, AuctionEquilibrium, MemeticPropagation, CircadianOptimizer,
  CulturalVelocity, CounterpartyFingerprint, CollectionTopology, SurvivorshipBias, ForgeryEvolution, DecisionFatigue,
  OpportunityCostPhantom, SharedWatchlists, GroupBreaks, ClubManagement, CollectiveGrading, SharedDashboards,
  RBACTeams, WhiteLabelApi, DealerInventory, FundReporting, AuditTrail, CollaborativeSetRegistry,
  CardShowSquad, GroupBuyCoop, DraftNightWarRoom, MentorshipExchange, DisputeArbitration, GroupInsurance,
  CrowdPricing, GroupVault, SwapMeet, AgentOutcomeMemory, MarketTruthLedger, CounterpartyPassport,
  ThesisBacktester, LiquidityHorizon, FvConfidence, RegulatoryAlerts, AgentDelegationAudit, CapitalFlowRadar,
  SyntheticIndexBuilder, CatastropheLiquidation, PortfolioImmunization, IdentityGraph, NarrativeLifecycle, AgentPersonality,
  BidAskSpreadPredictor, WashSaleHorizon, SellerUrgencyScore, PortfolioBetaIndex, GradingQueueEstimator, ReputationDecayTracker,
  EventImpactAttribution, LiquidityReserveCalculator, CrossSportMomentum, AgentConfidenceHistory, WhatIfSimulator, GradingBatchPlanner,
  EbayListingGenerator, WaxBreakRoiTracker, RegretMinimizationEngine, MentalHealthSafeguards, GradeInflationDetector, SubscriptionBoxOptimizer,
  ReverseDutchAuctionEngine, CarbonFootprintTracker, BidderPsychologyProfiler, ProductAnnouncementRadar, CollectorSuccessionProtocol, CrossHobbyArbitrageBridge,
  LiveGameImpactEngine, PreGradeIntelligence, CopyTrading, PredictiveMarketMaker, InfluenceGraph, CrossHobbyPortfolio,
  AutonomousAcquisition, DraftWarRoom, APIPlatform, ComplianceCenter, PhaseOperations, DataConsolidation,
  MSITerminal, VaultSecurity, DealRoom, DerivativesDesk, ConsignmentRouter, P2PMarketplace,
  TransactionWire, LiveBreaks, CardDNA, CollectionGenome, ErrorCardIntel, HOFTracker,
  MarketIndices, PlayerTrajectory, PortfolioAttribution, ProvenanceChain, ProvenanceChainIntelligence, QuantWorkbench,
  ResearchReports, SentimentRadar, WaxIntelligence, WeatherImpact, EstatePlanning, Rebalancer,
  ARShowcase, FrontierLab, LiveImpact, Inventory, DemoFlowPage, Login,
  Signup, ForgotPassword, ResetPassword, PublicPortfolio,
} from './routes/lazyRoutes';

// Validate environment on startup
validateEnv();


// ─── DAL Initializer ─────────────────────────────────────────────────
// Initializes the Data Access Layer when auth state is known.
const DALInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  useEffect(() => {
    initDAL(user?.id ?? null);
  }, [user?.id]);
  return <>{children}</>;
};

// ─── App Layout ───────────────────────────────────────────────────────

const AppLayout: React.FC<{ isSidebarOpen: boolean, setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> }> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { inventory } = useSupabaseInventory();
  const [isWallHUDOpen, setIsWallHUDOpen] = useState(false);
  const [selectedGrail, setSelectedGrail] = useState<any>(null);

  // Expose a way to open grail via window for testing/demo
  (window as any).openGrail = (card: any) => setSelectedGrail(card);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-charcoal text-slate-100 font-sans selection:bg-brand-lime/30 luminous-container">
      <a
        href="#main-content"
        className="absolute left-[-9999px] w-px h-px overflow-hidden focus:left-4 focus:top-4 focus:z-[100] focus:w-auto focus:h-auto focus:overflow-visible focus:px-4 focus:py-2 focus:bg-brand-lime focus:text-brand-charcoal focus:font-bold focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      <LuminousTracker />
      {/* Desktop Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <Header onToggleWallHUD={() => setIsWallHUDOpen(true)} />
        <MarketTicker inventory={inventory} />
        <MigrationBanner />
        <ProductionConfigBanner />
        <PwaUpdateBanner />

        {isWallHUDOpen && (
          <InstitutionalWallHUD
            onClose={() => setIsWallHUDOpen(false)}
            inventoryCount={inventory.length}
            totalMarketValue={`$${inventory.reduce((acc, curr) => acc + (parseFloat(curr.market_value?.replace(/[^0-9.]/g, '') || '0')), 0).toLocaleString()}`}
          />
        )}

        {selectedGrail && (
          <GrailShowcase
            isOpen={!!selectedGrail}
            onClose={() => setSelectedGrail(null)}
            card={{
              name: selectedGrail.name || selectedGrail.card_name || 'Grail Asset',
              player: selectedGrail.player_name || 'Elite Athlete',
              year: selectedGrail.year || '2024',
              set: selectedGrail.set_name || 'Panini Prizm',
              grade: selectedGrail.grade || 'PSA 10',
              image: selectedGrail.image_url || 'https://images.unsplash.com/photo-1510133769062-80c1e26dcb6e?q=80&w=2070&auto=format&fit=crop',
              marketValue: selectedGrail.market_value || '$12,500.00'
            }}
          />
        )}

        <main id="main-content" className="flex-1 p-4 md:p-8 page-container overflow-y-auto pb-24 md:pb-8" role="main">
          <AutoTierGate>
          <LazyErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/collection" element={<Collection />} />
                <Route path="/deep-search" element={<DeepSearch />} />
                <Route path="/audit" element={<PortfolioAudit />} />
                <Route path="/mlb-stats" element={<MLBStats />} />
                <Route path="/prospects" element={<ProspectTrends />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/settings" element={<Profile />} />
                <Route path="/players" element={<Players />} />
                <Route path="/players/:id" element={<PlayerDetail />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/games" element={<Games />} />
                <Route path="/trends" element={<Trends />} />
                <Route path="/builder" element={<PortfolioBuilder />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/war-room" element={<AnalystWarRoom />} />
                <Route path="/guilds" element={<GuildDashboard />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/features" element={<FeatureDirectory />} />
                <Route path="/liquidity-twin" element={<LiquidityTwin />} />
                <Route path="/counterparty-trust-graph" element={<CounterpartyTrustGraph />} />
                <Route path="/portfolio-scenario-theater" element={<PortfolioScenarioTheater />} />
                <Route path="/private-deal-room-agent" element={<PrivateDealRoomAgent />} />
                <Route path="/catalyst-market" element={<CatalystMarket />} />
                <Route path="/collection-narrative" element={<CollectionNarrative />} />
                <Route path="/portfolio-copilot" element={<PortfolioCopilot />} />
                <Route path="/marketplace-aggregator" element={<MarketplaceAggregator />} />
                <Route path="/subscription-box" element={<SubscriptionBox />} />
                <Route path="/collector-dna" element={<CollectorDna />} />
                <Route path="/auction-war-room" element={<AuctionWarRoom />} />
                <Route path="/grading-tracker" element={<GradingTracker />} />
                <Route path="/dealer-dashboard" element={<DealerDashboard />} />
                <Route path="/fund-manager" element={<FundManager />} />
                <Route path="/api-licensing" element={<ApiLicensing />} />
                <Route path="/card-show-mode" element={<CardShowModePage />} />
                <Route path="/ar-scanner" element={<ArScanner />} />
                <Route path="/hype-radar" element={<HypeRadar />} />
                <Route path="/non-sports" element={<NonSportsExpansion />} />
                <Route path="/injury-intel" element={<InjuryIntel />} />
                <Route path="/carbon-score" element={<CarbonScore />} />
                <Route path="/vault-arbitrage" element={<VaultArbitrage />} />
                <Route path="/pressing-roi" element={<PressingRoi />} />
                <Route path="/behavioral-finance" element={<BehavioralFinance />} />
                <Route path="/comp-forensics" element={<CompForensics />} />
                <Route path="/tournament-arena" element={<TournamentArena />} />
                <Route path="/influencer-impact" element={<InfluencerImpact />} />
                <Route path="/condition-aging" element={<ConditionAging />} />
                <Route path="/auth-training" element={<AuthTraining />} />
                <Route path="/inventory-sync" element={<InventorySync />} />
                <Route path="/rookie-class-index" element={<RookieClassIndex />} />
                <Route path="/vending-machine" element={<VendingMachine />} />
                <Route path="/womens-sports-index" element={<WomensSportsIndex />} />
                <Route path="/grading-auditor" element={<GradingAuditor />} />
                <Route path="/smart-storage" element={<SmartStorage />} />
                <Route path="/print-run-intelligence" element={<PrintRunIntelligence />} />
                <Route path="/youth-onboarding" element={<YouthOnboarding />} />
                <Route path="/live-break-hub" element={<LiveBreakHub />} />
                <Route path="/price-prediction" element={<PricePrediction />} />
                <Route path="/international-arbitrage" element={<InternationalArbitrage />} />
                <Route path="/blockchain-provenance" element={<BlockchainProvenance />} />
                <Route path="/trade-deadline" element={<TradeDeadline />} />
                <Route path="/collection-appraiser" element={<CollectionAppraiser />} />
                <Route path="/set-registry" element={<SetRegistry />} />
                <Route path="/vintage-market" element={<VintageMarket />} />
                <Route path="/social-trading" element={<SocialTrading />} />
                <Route path="/listing-optimizer" element={<ListingOptimizer />} />
                <Route path="/tax-calculator" element={<TaxCalculator />} />
                <Route path="/sealed-product" element={<SealedProduct />} />
                <Route path="/error-card" element={<ErrorCard />} />
                <Route path="/auction-sniper" element={<AuctionSniper />} />
                <Route path="/audit-dossier" element={<CollectorAuditDossier />} />
                <Route path="/real-time-price-engine" element={<RealTimePriceEngine />} />
                <Route path="/ai-card-scanner" element={<AiCardScanner />} />
                <Route path="/cross-platform-arbitrage" element={<CrossPlatformArbitrage />} />
                <Route path="/predictive-price-engine" element={<PredictivePriceEngine />} />
                <Route path="/tax-report" element={<TaxReport />} />
                <Route path="/grade-prediction" element={<GradePredictionPage />} />
                <Route path="/smart-notifications" element={<SmartNotifications />} />
                <Route path="/consensus-pricing" element={<ConsensusPricing />} />
                <Route path="/live-break-roi" element={<LiveBreakRoi />} />
                <Route path="/portfolio-benchmark" element={<PortfolioBenchmark />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/insurance-vault" element={<InsuranceVault />} />
                <Route path="/break-even-calculator" element={<BreakEvenCalculator />} />
                <Route path="/community-trading" element={<CommunityTrading />} />
                <Route path="/set-completion" element={<SetCompletionPage />} />
                <Route path="/portfolio-narrator" element={<PortfolioNarrator />} />
                <Route path="/vintage-allocation" element={<VintageAllocation />} />
                <Route path="/grading-turnaround" element={<GradingTurnaround />} />
                <Route path="/market-replay" element={<MarketReplay />} />
                <Route path="/scan-to-value" element={<ScanToValue />} />
                <Route path="/hobby-income" element={<HobbyIncome />} />
                <Route path="/card-show-planner" element={<CardShowPlanner />} />
                <Route path="/rip-flip-sim" element={<RipFlipSim />} />
                <Route path="/social-feed" element={<SocialFeed />} />
                <Route path="/slab-verification" element={<SlabVerification />} />
                <Route path="/portfolio-stress-test" element={<PortfolioStressTest />} />
                <Route path="/consignment-market" element={<ConsignmentMarket />} />
                <Route path="/grading-prep" element={<GradingPrep />} />
                <Route path="/parallel-universe" element={<ParallelUniverse />} />
                <Route path="/achievement-system" element={<AchievementSystem />} />
                <Route path="/sentiment-velocity" element={<SentimentVelocity />} />
                {/* v4.0: Multi-Sport League Hubs */}
                <Route path="/nfl-hub" element={<NFLHub />} />
                <Route path="/nba-hub" element={<NBAHub />} />
                <Route path="/nhl-hub" element={<NHLHub />} />
                <Route path="/soccer-hub" element={<SoccerHub />} />
                {/* v4.0: Multi-Sport & Infrastructure */}
                <Route path="/grading-vision-engine" element={<GradingVisionEngine />} />
                <Route path="/notification-center" element={<NotificationCenter />} />
                <Route path="/dashboard-builder" element={<DashboardBuilder />} />
                <Route path="/marketplace-integrations" element={<MarketplaceIntegrations />} />
                <Route path="/insurance-appraisal" element={<InsuranceAppraisal />} />
                <Route path="/offline-manager" element={<OfflineManager />} />
                {/* v4.0: Industry-First Features */}
                <Route path="/provenance-dna" element={<ProvenanceDna />} />
                <Route path="/emotional-thermometer" element={<EmotionalThermometer />} />
                <Route path="/card-weather" element={<CardWeather />} />
                <Route path="/dead-money-detector" element={<DeadMoneyDetector />} />
                <Route path="/micro-arbitrage-swarm" element={<MicroArbitrageSwarm />} />
                <Route path="/generational-wealth" element={<GenerationalWealth />} />
                <Route path="/card-aging-lab" element={<CardAgingLab />} />
                <Route path="/phantom-backtester" element={<PhantomBacktester />} />
                <Route path="/collector-matchmaker" element={<CollectorMatchmaker />} />
                {/* v5.0: Next-Gen Investment Intelligence (Batch 1) */}
                <Route path="/card-genome-sequencer" element={<CardGenomeSequencer />} />
                <Route path="/injury-oracle" element={<InjuryOracle />} />
                <Route path="/cross-asset-correlation" element={<CrossAssetCorrelation />} />
                <Route path="/collector-social-graph" element={<CollectorSocialGraph />} />
                <Route path="/restoration-simulator" element={<RestorationSimulator />} />
                <Route path="/market-maker-arena" element={<MarketMakerArena />} />
                <Route path="/fractional-vault" element={<FractionalVault />} />
                <Route path="/portfolio-stress-tester" element={<PortfolioStressTester />} />
                <Route path="/rookie-pipeline-scanner" element={<RookiePipelineScanner />} />
                <Route path="/forensics-lab" element={<ForensicsLab />} />
                {/* v5.0: Next-Gen Investment Intelligence (Batch 2) */}
                <Route path="/card-decay-predictor" element={<CardDecayPredictor />} />
                <Route path="/narrative-arc-engine" element={<NarrativeArcEngine />} />
                <Route path="/liquidity-depth-scanner" element={<LiquidityDepthScanner />} />
                <Route path="/contagion-mapper" element={<ContagionMapper />} />
                <Route path="/grail-index-constructor" element={<GrailIndexConstructor />} />
                <Route path="/print-run-decoder" element={<PrintRunDecoder />} />
                <Route path="/temporal-arbitrage-radar" element={<TemporalArbitrageRadar />} />
                <Route path="/collection-dna-mixer" element={<CollectionDNAMixer />} />
                <Route path="/card-yield-farming" element={<CardYieldFarming />} />
                <Route path="/chaos-theory-simulator" element={<ChaosTheorySimulator />} />
                {/* v5.1: Beyond-Competition Intelligence (Batch 3) */}
                <Route path="/sentiment-volatility-index" element={<SentimentVolatilityIndex />} />
                <Route path="/micro-season-capitalizer" element={<MicroSeasonCapitalizer />} />
                <Route path="/collection-hedge-constructor" element={<CollectionHedgeConstructor />} />
                <Route path="/generational-wealth-planner" element={<GenerationalWealthPlanner />} />
                <Route path="/card-climate-risk-mapper" element={<CardClimateRiskMapper />} />
                <Route path="/rule-change-impact-modeler" element={<RuleChangeImpactModeler />} />
                <Route path="/nostalgia-predictor" element={<NostalgiaPredictor />} />
                <Route path="/synthetic-card-index" element={<SyntheticCardIndex />} />
                <Route path="/provenance-chain-verifier" element={<ProvenanceChainVerifier />} />
                <Route path="/market-regime-detector" element={<MarketRegimeDetector />} />
                {/* v5.0: Industry-First Features — Round 3 */}
                <Route path="/options-desk" element={<OptionsDesk />} />
                <Route path="/condition-census" element={<ConditionCensus />} />
                <Route path="/break-even-velocity" element={<BreakEvenVelocity />} />
                <Route path="/tax-autopilot" element={<TaxAutopilot />} />
                <Route path="/card-show-gps" element={<CardShowGps />} />
                <Route path="/contract-correlation" element={<ContractCorrelation />} />
                <Route path="/bankruptcy-shield" element={<BankruptcyShield />} />
                <Route path="/negotiation-coach" element={<NegotiationCoach />} />
                <Route path="/multi-gen-compare" element={<MultiGenCompare />} />
                <Route path="/portfolio-dna-rebalancer" element={<PortfolioDnaRebalancer />} />
                {/* v6.0: Industry-Absent Innovation Suite */}
                <Route path="/injury-shockwave" element={<InjuryShockwave />} />
                <Route path="/ar-vault-walkthrough" element={<ArVaultWalkthrough />} />
                <Route path="/hof-probability" element={<HofProbability />} />
                <Route path="/market-microstructure" element={<MarketMicrostructure />} />
                <Route path="/iot-condition-guardian" element={<IotConditionGuardian />} />
                <Route path="/fractional-syndicate" element={<FractionalSyndicate />} />
                <Route path="/voice-card-show" element={<VoiceCardShow />} />
                <Route path="/narrative-alpha" element={<NarrativeAlpha />} />
                <Route path="/counterfactual-value" element={<CounterfactualValue />} />
                <Route path="/biometric-trading-guard" element={<BiometricTradingGuard />} />
                {/* Advanced Trading & Analysis — Previously Unrouted */}
                <Route path="/live-game-impact-engine" element={<LiveGameImpactEngine />} />
                <Route path="/pre-grade-intelligence" element={<PreGradeIntelligence />} />
                <Route path="/copy-trading" element={<CopyTrading />} />
                <Route path="/predictive-market-maker" element={<PredictiveMarketMaker />} />
                <Route path="/influence-graph" element={<InfluenceGraph />} />
                <Route path="/cross-hobby-portfolio" element={<CrossHobbyPortfolio />} />
                <Route path="/autonomous-acquisition" element={<AutonomousAcquisition />} />
                <Route path="/draft-war-room" element={<DraftWarRoom />} />
                {/* Institutional & Operations — Previously Unrouted */}
                <Route path="/api-platform" element={<APIPlatform />} />
                <Route path="/compliance-center" element={<ComplianceCenter />} />
                <Route path="/phase-ops" element={<PhaseOperations />} />
                <Route path="/data-consolidation" element={<DataConsolidation />} />
                <Route path="/msi-terminal" element={<MSITerminal />} />
                <Route path="/vault-security" element={<VaultSecurity />} />
                {/* Trading & Marketplace — Previously Unrouted */}
                <Route path="/deal-room" element={<DealRoom />} />
                <Route path="/derivatives-desk" element={<DerivativesDesk />} />
                <Route path="/consignment-router" element={<ConsignmentRouter />} />
                <Route path="/p2p-marketplace" element={<P2PMarketplace />} />
                <Route path="/transaction-wire" element={<TransactionWire />} />
                <Route path="/live-breaks" element={<LiveBreaks />} />
                {/* Analytics & Intelligence — Previously Unrouted */}
                <Route path="/card-dna" element={<CardDNA />} />
                <Route path="/collection-genome" element={<CollectionGenome />} />
                <Route path="/error-card-intel" element={<ErrorCardIntel />} />
                <Route path="/hof-tracker" element={<HOFTracker />} />
                <Route path="/market-indices" element={<MarketIndices />} />
                <Route path="/player-trajectory" element={<PlayerTrajectory />} />
                <Route path="/portfolio-attribution" element={<PortfolioAttribution />} />
                <Route path="/provenance" element={<ProvenanceChain />} />
                <Route path="/provenance-intelligence" element={<ProvenanceChainIntelligence />} />
                <Route path="/quant-workbench" element={<QuantWorkbench />} />
                <Route path="/research-reports" element={<ResearchReports />} />
                <Route path="/sentiment-radar" element={<SentimentRadar />} />
                <Route path="/wax-intelligence" element={<WaxIntelligence />} />
                <Route path="/weather-impact" element={<WeatherImpact />} />
                {/* Portfolio & Financial — Previously Unrouted */}
                <Route path="/estate-planning" element={<EstatePlanning />} />
                <Route path="/rebalancer" element={<Rebalancer />} />
                {/* Showcase & Labs — Previously Unrouted */}
                <Route path="/ar-showcase" element={<ARShowcase />} />
                <Route path="/frontier-lab" element={<FrontierLab />} />
                <Route path="/live-impact" element={<LiveImpact />} />
                <Route path="/inventory" element={<Inventory />} />
                {/* v6.1: Industry-Absent Innovation — Round 2 */}
                <Route path="/dopamine-cycle-tracker" element={<DopamineCycleTracker />} />
                <Route path="/hobby-liquidity-crisis" element={<HobbyLiquidityCrisis />} />
                <Route path="/memory-index" element={<MemoryIndex />} />
                <Route path="/pop-forecaster" element={<PopForecaster />} />
                <Route path="/draft-capital-futures" element={<DraftCapitalFutures />} />
                <Route path="/shadow-inventory" element={<ShadowInventory />} />
                <Route path="/emotion-journal" element={<EmotionJournal />} />
                <Route path="/estate-succession" element={<EstateSuccession />} />
                <Route path="/refractor-mapper" element={<RefractorMapper />} />
                <Route path="/centering-analyzer" element={<CenteringAnalyzer />} />
                {/* v7.0: Industry-Absent Innovation — Round 3 */}
                <Route path="/regulatory-compliance-radar" element={<RegulatoryComplianceRadar />} />
                <Route path="/acoustic-authentication" element={<AcousticAuthentication />} />
                <Route path="/dealer-flow-intelligence" element={<DealerFlowIntelligence />} />
                <Route path="/psychographic-demand" element={<PsychographicDemand />} />
                <Route path="/micro-geographic-demand" element={<MicroGeographicDemand />} />
                <Route path="/cross-hobby-contagion" element={<CrossHobbyContagion />} />
                <Route path="/venue-health-oracle" element={<VenueHealthOracle />} />
                <Route path="/negotiation-replay" element={<NegotiationReplay />} />
                <Route path="/card-material-spectrometry" element={<CardMaterialSpectrometry />} />
                <Route path="/generational-demand-forecaster" element={<GenerationalDemandForecaster />} />
                {/* v7.1: Industry-Absent Innovation — Round 4 */}
                <Route path="/slab-case-forensics" element={<SlabCaseForensics />} />
                <Route path="/price-whisperer" element={<PriceWhisperer />} />
                <Route path="/card-loan-collateral" element={<CardLoanCollateral />} />
                <Route path="/grading-arbitrage" element={<GradingArbitrage />} />
                <Route path="/consignment-optimizer" element={<ConsignmentOptimizer />} />
                <Route path="/card-aging-clock" element={<CardAgingClock />} />
                <Route path="/sentiment-seismograph" element={<SentimentSeismograph />} />
                <Route path="/contract-valuation" element={<ContractValuation />} />
                <Route path="/collection-entropy" element={<CollectionEntropy />} />
                <Route path="/card-show-navigator" element={<CardShowNavigator />} />
                <Route path="/influencer-quantifier" element={<InfluencerQuantifier />} />
                <Route path="/wax-ct-scanner" element={<WaxCTScanner />} />
                <Route path="/manipulation-detector" element={<ManipulationDetector />} />
                <Route path="/insurance-claims-ai" element={<InsuranceClaimsAI />} />
                <Route path="/recession-playbook" element={<RecessionPlaybook />} />
                <Route path="/personality-matrix" element={<PersonalityMatrix />} />
                <Route path="/photo-studio" element={<PhotoStudio />} />
                <Route path="/peer-lending" element={<PeerLending />} />
                <Route path="/draft-night-tracker" element={<DraftNightTracker />} />
                <Route path="/vintage-provenance" element={<VintageProvenance />} />
                {/* v8.0: Industry-Absent Innovation — Frontier Phase */}
                <Route path="/auction-equilibrium" element={<AuctionEquilibrium />} />
                <Route path="/memetic-propagation" element={<MemeticPropagation />} />
                <Route path="/circadian-optimizer" element={<CircadianOptimizer />} />
                <Route path="/cultural-velocity" element={<CulturalVelocity />} />
                <Route path="/counterparty-fingerprint" element={<CounterpartyFingerprint />} />
                <Route path="/collection-topology" element={<CollectionTopology />} />
                <Route path="/survivorship-bias" element={<SurvivorshipBias />} />
                <Route path="/forgery-evolution" element={<ForgeryEvolution />} />
                <Route path="/decision-fatigue" element={<DecisionFatigue />} />
                <Route path="/opportunity-cost-phantom" element={<OpportunityCostPhantom />} />
                <Route path="/shared-watchlists" element={<SharedWatchlists />} />
                <Route path="/group-breaks" element={<GroupBreaks />} />
                <Route path="/club-management" element={<ClubManagement />} />
                <Route path="/collective-grading" element={<CollectiveGrading />} />
                <Route path="/shared-dashboards" element={<SharedDashboards />} />
                <Route path="/rbac-teams" element={<RBACTeams />} />
                <Route path="/white-label-api" element={<WhiteLabelApi />} />
                <Route path="/dealer-inventory" element={<DealerInventory />} />
                <Route path="/fund-reporting" element={<FundReporting />} />
                <Route path="/audit-trail" element={<AuditTrail />} />
                <Route path="/collaborative-set-registry" element={<CollaborativeSetRegistry />} />
                <Route path="/card-show-squad" element={<CardShowSquad />} />
                <Route path="/group-buy-coop" element={<GroupBuyCoop />} />
                <Route path="/draft-night-war-room" element={<DraftNightWarRoom />} />
                <Route path="/mentorship-exchange" element={<MentorshipExchange />} />
                <Route path="/dispute-arbitration" element={<DisputeArbitration />} />
                <Route path="/group-insurance" element={<GroupInsurance />} />
                <Route path="/crowd-pricing" element={<CrowdPricing />} />
                <Route path="/group-vault" element={<GroupVault />} />
                <Route path="/swap-meet" element={<SwapMeet />} />
                {/* v5.1+: PRD 4.11 — Next set of features not in the industry (Frontier) */}
                <Route path="/agent-outcome-memory" element={<AgentOutcomeMemory />} />
                <Route path="/market-truth-ledger" element={<MarketTruthLedger />} />
                <Route path="/counterparty-passport" element={<CounterpartyPassport />} />
                <Route path="/thesis-backtester" element={<ThesisBacktester />} />
                <Route path="/liquidity-horizon" element={<LiquidityHorizon />} />
                <Route path="/fv-confidence" element={<FvConfidence />} />
                <Route path="/regulatory-alerts" element={<RegulatoryAlerts />} />
                <Route path="/agent-delegation-audit" element={<AgentDelegationAudit />} />
                <Route path="/capital-flow-radar" element={<CapitalFlowRadar />} />
                <Route path="/synthetic-index-builder" element={<SyntheticIndexBuilder />} />
                <Route path="/catastrophe-liquidation" element={<CatastropheLiquidation />} />
                <Route path="/portfolio-immunization" element={<PortfolioImmunization />} />
                <Route path="/identity-graph" element={<IdentityGraph />} />
                <Route path="/narrative-lifecycle" element={<NarrativeLifecycle />} />
                <Route path="/agent-personality" element={<AgentPersonality />} />
                {/* v5.2: Next 10 industry-absent features (PRD 4.12) */}
                <Route path="/bid-ask-spread-predictor" element={<BidAskSpreadPredictor />} />
                <Route path="/wash-sale-horizon" element={<WashSaleHorizon />} />
                <Route path="/seller-urgency-score" element={<SellerUrgencyScore />} />
                <Route path="/portfolio-beta-index" element={<PortfolioBetaIndex />} />
                <Route path="/grading-queue-estimator" element={<GradingQueueEstimator />} />
                <Route path="/reputation-decay-tracker" element={<ReputationDecayTracker />} />
                <Route path="/event-impact-attribution" element={<EventImpactAttribution />} />
                <Route path="/liquidity-reserve-calculator" element={<LiquidityReserveCalculator />} />
                <Route path="/cross-sport-momentum" element={<CrossSportMomentum />} />
                <Route path="/agent-confidence-history" element={<AgentConfidenceHistory />} />
                {/* Formerly coming-soon features */}
                <Route path="/what-if-simulator" element={<WhatIfSimulator />} />
                <Route path="/grading-batch-planner" element={<GradingBatchPlanner />} />
                <Route path="/ebay-listing-generator" element={<EbayListingGenerator />} />
                <Route path="/wax-break-roi-tracker" element={<WaxBreakRoiTracker />} />
                {/* Industry-first features v11 */}
                <Route path="/regret-minimization-engine" element={<RegretMinimizationEngine />} />
                <Route path="/mental-health-safeguards" element={<MentalHealthSafeguards />} />
                <Route path="/grade-inflation-detector" element={<GradeInflationDetector />} />
                <Route path="/subscription-box-optimizer" element={<SubscriptionBoxOptimizer />} />
                <Route path="/reverse-dutch-auction-engine" element={<ReverseDutchAuctionEngine />} />
                <Route path="/carbon-footprint-tracker" element={<CarbonFootprintTracker />} />
                <Route path="/bidder-psychology-profiler" element={<BidderPsychologyProfiler />} />
                <Route path="/product-announcement-radar" element={<ProductAnnouncementRadar />} />
                <Route path="/collector-succession-protocol" element={<CollectorSuccessionProtocol />} />
                <Route path="/cross-hobby-arbitrage-bridge" element={<CrossHobbyArbitrageBridge />} />
                {/* Interactive Demo Flow */}
                <Route path="/demo-flow" element={<DemoFlowPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </LazyErrorBoundary>
          </AutoTierGate>
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
      <GuidedTour />
      <DemoFlowWidget />
    </div>
  );
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <DALInitializer>
          <MigrationProvider>
            <ToastProvider>
              <Router>
                <DocumentTitleSync />
                <LazyErrorBoundary>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/p/:username" element={<PublicPortfolio />} />

                      {/* Protected Routes */}
                      <Route path="/*" element={
                        <ProtectedRoute>
                          <SyncSchedulerInitializer>
                            <AppLayout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                          </SyncSchedulerInitializer>
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </Suspense>
                </LazyErrorBoundary>
              </Router>
            </ToastProvider>
          </MigrationProvider>
        </DALInitializer>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
};

export default App;

