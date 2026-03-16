
import React, { Suspense, useState, lazy } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import MobileNav from './components/MobileNav.tsx';
import SyncSchedulerInitializer from './components/SyncSchedulerInitializer.tsx';
import LuminousTracker from './components/LuminousTracker.tsx';
import { MigrationProvider } from './contexts/MigrationContext.tsx';
import MigrationBanner from './components/MigrationBanner.tsx';
import MarketTicker from './components/MarketTicker.tsx';
import { useSupabaseInventory } from './lib/useSupabaseInventory.ts';
import LazyErrorBoundary from './components/LazyErrorBoundary.tsx';
import { PageLoadingFallback } from './components/LazyLoadFallback.tsx';
import GuidedTour from './components/GuidedTour.tsx';
import InstitutionalWallHUD from './components/InstitutionalWallHUD.tsx';
import GrailShowcase from './components/GrailShowcase.tsx';
import DemoFlowWidget from './components/DemoFlowWidget.tsx';

// ─── Lazy-loaded Page Components ──────────────────────────────────────
// Critical path: Dashboard loads first, everything else is code-split

// Core pages (most frequently accessed)
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const Collection = lazy(() => import('./pages/Collection.tsx'));
const Favorites = lazy(() => import('./pages/Favorites.tsx'));
const Profile = lazy(() => import('./pages/Profile.tsx'));

// Search & analysis pages
const DeepSearch = lazy(() => import('./pages/DeepSearch.tsx'));
const PortfolioAudit = lazy(() => import('./pages/PortfolioAudit.tsx'));
const MLBStats = lazy(() => import('./pages/MLBStats.tsx'));
const ProspectTrends = lazy(() => import('./pages/ProspectTrends.tsx'));

// Player & team pages
const Players = lazy(() => import('./pages/Players.tsx'));
const PlayerDetail = lazy(() => import('./pages/PlayerDetail.tsx'));
const Teams = lazy(() => import('./pages/Teams.tsx'));
const Games = lazy(() => import('./pages/Games.tsx'));
const Trends = lazy(() => import('./pages/Trends.tsx'));
const Compare = lazy(() => import('./pages/Compare.tsx'));

// Portfolio & financial pages
const PortfolioBuilder = lazy(() => import('./pages/PortfolioBuilder.tsx'));
const Billing = lazy(() => import('./pages/Billing.tsx'));
const Leaderboard = lazy(() => import('./pages/Leaderboard.tsx'));

// Alerts & tools
const Alerts = lazy(() => import('./pages/Alerts.tsx'));
const AnalystWarRoom = lazy(() => import('./components/AnalystWarRoom.tsx'));
const GuildDashboard = lazy(() => import('./pages/GuildDashboard.tsx'));

// Feature discovery and release-ready advanced features
const FeatureDirectory = lazy(() => import('./pages/FeatureDirectory.tsx'));
const CollectionNarrative = lazy(() => import('./pages/CollectionNarrative.tsx'));
const LiquidityTwin = lazy(() => import('./pages/LiquidityTwin.tsx'));
const CatalystMarket = lazy(() => import('./pages/CatalystMarket.tsx'));
const CounterpartyTrustGraph = lazy(() => import('./pages/CounterpartyTrustGraph.tsx'));
const PortfolioScenarioTheater = lazy(() => import('./pages/PortfolioScenarioTheater.tsx'));
const PrivateDealRoomAgent = lazy(() => import('./pages/PrivateDealRoomAgent.tsx'));
const CollectorAuditDossier = lazy(() => import('./pages/CollectorAuditDossier.tsx'));

// Phases 114-128: Next-gen features
const PortfolioCopilot = lazy(() => import('./pages/PortfolioCopilot.tsx'));
const MarketplaceAggregator = lazy(() => import('./pages/MarketplaceAggregator.tsx'));
const SubscriptionBox = lazy(() => import('./pages/SubscriptionBox.tsx'));
const CollectorDna = lazy(() => import('./pages/CollectorDna.tsx'));
const AuctionWarRoom = lazy(() => import('./pages/AuctionWarRoom.tsx'));
const GradingTracker = lazy(() => import('./pages/GradingTracker.tsx'));
const DealerDashboard = lazy(() => import('./pages/DealerDashboard.tsx'));
const FundManager = lazy(() => import('./pages/FundManager.tsx'));
const ApiLicensing = lazy(() => import('./pages/ApiLicensing.tsx'));
const CardShowModePage = lazy(() => import('./pages/CardShowModePage.tsx'));
const ArScanner = lazy(() => import('./pages/ArScanner.tsx'));
const HypeRadar = lazy(() => import('./pages/HypeRadar.tsx'));
const NonSportsExpansion = lazy(() => import('./pages/NonSportsExpansion.tsx'));
const InjuryIntel = lazy(() => import('./pages/InjuryIntel.tsx'));
const CarbonScore = lazy(() => import('./pages/CarbonScore.tsx'));

// Phases 129-138: Competitive differentiators
const VaultArbitrage = lazy(() => import('./pages/VaultArbitrage.tsx'));
const PressingRoi = lazy(() => import('./pages/PressingRoi.tsx'));
const BehavioralFinance = lazy(() => import('./pages/BehavioralFinance.tsx'));
const CompForensics = lazy(() => import('./pages/CompForensics.tsx'));
const TournamentArena = lazy(() => import('./pages/TournamentArena.tsx'));
const InfluencerImpact = lazy(() => import('./pages/InfluencerImpact.tsx'));
const ConditionAging = lazy(() => import('./pages/ConditionAging.tsx'));
const AuthTraining = lazy(() => import('./pages/AuthTraining.tsx'));
const InventorySync = lazy(() => import('./pages/InventorySync.tsx'));
const RookieClassIndex = lazy(() => import('./pages/RookieClassIndex.tsx'));

// Phases 139-148: Production-grade expansion
const VendingMachine = lazy(() => import('./pages/VendingMachine.tsx'));
const WomensSportsIndex = lazy(() => import('./pages/WomensSportsIndex.tsx'));
const GradingAuditor = lazy(() => import('./pages/GradingAuditor.tsx'));
const SmartStorage = lazy(() => import('./pages/SmartStorage.tsx'));
const PrintRunIntelligence = lazy(() => import('./pages/PrintRunIntelligence.tsx'));
const YouthOnboarding = lazy(() => import('./pages/YouthOnboarding.tsx'));
const LiveBreakHub = lazy(() => import('./pages/LiveBreakHub.tsx'));
const PricePrediction = lazy(() => import('./pages/PricePrediction.tsx'));
const InternationalArbitrage = lazy(() => import('./pages/InternationalArbitrage.tsx'));
const BlockchainProvenance = lazy(() => import('./pages/BlockchainProvenance.tsx'));

// Phases 149-158: Advanced platform features
const TradeDeadline = lazy(() => import('./pages/TradeDeadline.tsx'));
const CollectionAppraiser = lazy(() => import('./pages/CollectionAppraiser.tsx'));
const SetRegistry = lazy(() => import('./pages/SetRegistry.tsx'));
const VintageMarket = lazy(() => import('./pages/VintageMarket.tsx'));
const SocialTrading = lazy(() => import('./pages/SocialTrading.tsx'));
const ListingOptimizer = lazy(() => import('./pages/ListingOptimizer.tsx'));
const TaxCalculator = lazy(() => import('./pages/TaxCalculator.tsx'));
const SealedProduct = lazy(() => import('./pages/SealedProduct.tsx'));
const ErrorCard = lazy(() => import('./pages/ErrorCard.tsx'));
const AuctionSniper = lazy(() => import('./pages/AuctionSniper.tsx'));

// Phases 159-168: Competitive Feature Suite
const RealTimePriceEngine = lazy(() => import('./pages/RealTimePriceEngine.tsx'));
const AiCardScanner = lazy(() => import('./pages/AiCardScanner.tsx'));
const CrossPlatformArbitrage = lazy(() => import('./pages/CrossPlatformArbitrage.tsx'));
const PredictivePriceEngine = lazy(() => import('./pages/PredictivePriceEngine.tsx'));
const TaxReport = lazy(() => import('./pages/TaxReport.tsx'));
const GradePredictionPage = lazy(() => import('./pages/GradePrediction.tsx'));
const SmartNotifications = lazy(() => import('./pages/SmartNotifications.tsx'));
const ConsensusPricing = lazy(() => import('./pages/ConsensusPricing.tsx'));
const LiveBreakRoi = lazy(() => import('./pages/LiveBreakRoi.tsx'));
const PortfolioBenchmark = lazy(() => import('./pages/PortfolioBenchmark.tsx'));

// Phases 169-178: Next-gen platform features
const Watchlist = lazy(() => import('./pages/Watchlist.tsx'));
const InsuranceVault = lazy(() => import('./pages/InsuranceVault.tsx'));
const BreakEvenCalculator = lazy(() => import('./pages/BreakEvenCalculator.tsx'));
const CommunityTrading = lazy(() => import('./pages/CommunityTrading.tsx'));
const SetCompletionPage = lazy(() => import('./pages/SetCompletion.tsx'));
const PortfolioNarrator = lazy(() => import('./pages/PortfolioNarrator.tsx'));
const VintageAllocation = lazy(() => import('./pages/VintageAllocation.tsx'));
const GradingTurnaround = lazy(() => import('./pages/GradingTurnaround.tsx'));
const MarketReplay = lazy(() => import('./pages/MarketReplay.tsx'));
const ScanToValue = lazy(() => import('./pages/ScanToValue.tsx'));

// Phases 179-188: Engagement & monetization features
const HobbyIncome = lazy(() => import('./pages/HobbyIncome.tsx'));
const CardShowPlanner = lazy(() => import('./pages/CardShowPlanner.tsx'));
const RipFlipSim = lazy(() => import('./pages/RipFlipSim.tsx'));
const SocialFeed = lazy(() => import('./pages/SocialFeed.tsx'));
const SlabVerification = lazy(() => import('./pages/SlabVerification.tsx'));
const PortfolioStressTest = lazy(() => import('./pages/PortfolioStressTest.tsx'));
const ConsignmentMarket = lazy(() => import('./pages/ConsignmentMarket.tsx'));
const GradingPrep = lazy(() => import('./pages/GradingPrep.tsx'));
const ParallelUniverse = lazy(() => import('./pages/ParallelUniverse.tsx'));
const AchievementSystem = lazy(() => import('./pages/AchievementSystem.tsx'));
const SentimentVelocity = lazy(() => import('./pages/SentimentVelocity.tsx'));

// v4.0: Multi-Sport League Hubs
const NFLHub = lazy(() => import('./pages/NFLHub.tsx'));
const NBAHub = lazy(() => import('./pages/NBAHub.tsx'));
const NHLHub = lazy(() => import('./pages/NHLHub.tsx'));
const SoccerHub = lazy(() => import('./pages/SoccerHub.tsx'));

// v4.0: Multi-Sport & Infrastructure
const GradingVisionEngine = lazy(() => import('./pages/GradingVisionEngine.tsx'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter.tsx'));
const DashboardBuilder = lazy(() => import('./pages/DashboardBuilder.tsx'));
const MarketplaceIntegrations = lazy(() => import('./pages/MarketplaceIntegrations.tsx'));
const InsuranceAppraisal = lazy(() => import('./pages/InsuranceAppraisal.tsx'));
const OfflineManager = lazy(() => import('./pages/OfflineManager.tsx'));

// v4.0: Industry-First Features
const ProvenanceDna = lazy(() => import('./pages/ProvenanceDna.tsx'));
const EmotionalThermometer = lazy(() => import('./pages/EmotionalThermometer.tsx'));
const CardWeather = lazy(() => import('./pages/CardWeather.tsx'));
const DeadMoneyDetector = lazy(() => import('./pages/DeadMoneyDetector.tsx'));
const MicroArbitrageSwarm = lazy(() => import('./pages/MicroArbitrageSwarm.tsx'));
const GenerationalWealth = lazy(() => import('./pages/GenerationalWealth.tsx'));
const CardAgingLab = lazy(() => import('./pages/CardAgingLab.tsx'));
const PhantomBacktester = lazy(() => import('./pages/PhantomBacktester.tsx'));
const CollectorMatchmaker = lazy(() => import('./pages/CollectorMatchmaker.tsx'));

// v5.0: Next-Gen Investment Intelligence (Batch 1)
const CardGenomeSequencer = lazy(() => import('./pages/CardGenomeSequencer.tsx'));
const InjuryOracle = lazy(() => import('./pages/InjuryOracle.tsx'));
const CrossAssetCorrelation = lazy(() => import('./pages/CrossAssetCorrelation.tsx'));
const CollectorSocialGraph = lazy(() => import('./pages/CollectorSocialGraph.tsx'));
const RestorationSimulator = lazy(() => import('./pages/RestorationSimulator.tsx'));
const MarketMakerArena = lazy(() => import('./pages/MarketMakerArena.tsx'));
const FractionalVault = lazy(() => import('./pages/FractionalVault.tsx'));
const PortfolioStressTester = lazy(() => import('./pages/PortfolioStressTester.tsx'));
const RookiePipelineScanner = lazy(() => import('./pages/RookiePipelineScanner.tsx'));
const ForensicsLab = lazy(() => import('./pages/ForensicsLab.tsx'));

// v5.0: Next-Gen Investment Intelligence (Batch 2)
const CardDecayPredictor = lazy(() => import('./pages/CardDecayPredictor.tsx'));
const NarrativeArcEngine = lazy(() => import('./pages/NarrativeArcEngine.tsx'));
const LiquidityDepthScanner = lazy(() => import('./pages/LiquidityDepthScanner.tsx'));
const ContagionMapper = lazy(() => import('./pages/ContagionMapper.tsx'));
const GrailIndexConstructor = lazy(() => import('./pages/GrailIndexConstructor.tsx'));
const PrintRunDecoder = lazy(() => import('./pages/PrintRunDecoder.tsx'));
const TemporalArbitrageRadar = lazy(() => import('./pages/TemporalArbitrageRadar.tsx'));
const CollectionDNAMixer = lazy(() => import('./pages/CollectionDNAMixer.tsx'));
const CardYieldFarming = lazy(() => import('./pages/CardYieldFarming.tsx'));
const ChaosTheorySimulator = lazy(() => import('./pages/ChaosTheorySimulator.tsx'));

// v5.1: Beyond-Competition Intelligence (Batch 3)
const SentimentVolatilityIndex = lazy(() => import('./pages/SentimentVolatilityIndex.tsx'));
const MicroSeasonCapitalizer = lazy(() => import('./pages/MicroSeasonCapitalizer.tsx'));
const CollectionHedgeConstructor = lazy(() => import('./pages/CollectionHedgeConstructor.tsx'));
const GenerationalWealthPlanner = lazy(() => import('./pages/GenerationalWealthPlanner.tsx'));
const CardClimateRiskMapper = lazy(() => import('./pages/CardClimateRiskMapper.tsx'));
const RuleChangeImpactModeler = lazy(() => import('./pages/RuleChangeImpactModeler.tsx'));
const NostalgiaPredictor = lazy(() => import('./pages/NostalgiaPredictor.tsx'));
const SyntheticCardIndex = lazy(() => import('./pages/SyntheticCardIndex.tsx'));
const ProvenanceChainVerifier = lazy(() => import('./pages/ProvenanceChainVerifier.tsx'));
const MarketRegimeDetector = lazy(() => import('./pages/MarketRegimeDetector.tsx'));

// v5.0: Industry-First Features — Round 3 (Phases 134-143)
const OptionsDesk = lazy(() => import('./pages/OptionsDesk.tsx'));
const ConditionCensus = lazy(() => import('./pages/ConditionCensus.tsx'));
const BreakEvenVelocity = lazy(() => import('./pages/BreakEvenVelocity.tsx'));
const TaxAutopilot = lazy(() => import('./pages/TaxAutopilot.tsx'));
const CardShowGps = lazy(() => import('./pages/CardShowGps.tsx'));
const ContractCorrelation = lazy(() => import('./pages/ContractCorrelation.tsx'));
const BankruptcyShield = lazy(() => import('./pages/BankruptcyShield.tsx'));
const NegotiationCoach = lazy(() => import('./pages/NegotiationCoach.tsx'));
const MultiGenCompare = lazy(() => import('./pages/MultiGenCompare.tsx'));
const PortfolioDnaRebalancer = lazy(() => import('./pages/PortfolioDnaRebalancer.tsx'));

// v6.0: Industry-Absent Innovation Suite (10 features)
const InjuryShockwave = lazy(() => import('./pages/InjuryShockwave.tsx'));
const ArVaultWalkthrough = lazy(() => import('./pages/ArVaultWalkthrough.tsx'));
const HofProbability = lazy(() => import('./pages/HofProbability.tsx'));
const MarketMicrostructure = lazy(() => import('./pages/MarketMicrostructure.tsx'));
const IotConditionGuardian = lazy(() => import('./pages/IotConditionGuardian.tsx'));
const FractionalSyndicate = lazy(() => import('./pages/FractionalSyndicate.tsx'));
const VoiceCardShow = lazy(() => import('./pages/VoiceCardShow.tsx'));
const NarrativeAlpha = lazy(() => import('./pages/NarrativeAlpha.tsx'));
const CounterfactualValue = lazy(() => import('./pages/CounterfactualValue.tsx'));
const BiometricTradingGuard = lazy(() => import('./pages/BiometricTradingGuard.tsx'));

// Previously unrouted pages — Advanced Trading & Analysis
const LiveGameImpactEngine = lazy(() => import('./pages/LiveGameImpactEngine.tsx'));
const PreGradeIntelligence = lazy(() => import('./pages/PreGradeIntelligence.tsx'));
const CopyTrading = lazy(() => import('./pages/CopyTrading.tsx'));
const PredictiveMarketMaker = lazy(() => import('./pages/PredictiveMarketMaker.tsx'));
const InfluenceGraph = lazy(() => import('./pages/InfluenceGraph.tsx'));
const CrossHobbyPortfolio = lazy(() => import('./pages/CrossHobbyPortfolio.tsx'));
const AutonomousAcquisition = lazy(() => import('./pages/AutonomousAcquisition.tsx'));
const DraftWarRoom = lazy(() => import('./pages/DraftWarRoom.tsx'));

// Previously unrouted pages — Institutional & Operations
const APIPlatform = lazy(() => import('./pages/APIPlatform.tsx'));
const ComplianceCenter = lazy(() => import('./pages/ComplianceCenter.tsx'));
const PhaseOperations = lazy(() => import('./pages/PhaseOperations.tsx'));
const DataConsolidation = lazy(() => import('./pages/DataConsolidation.tsx'));
const MSITerminal = lazy(() => import('./pages/MSITerminal.tsx'));
const VaultSecurity = lazy(() => import('./pages/VaultSecurity.tsx'));

// Previously unrouted pages — Trading & Marketplace
const DealRoom = lazy(() => import('./pages/DealRoom.tsx'));
const DerivativesDesk = lazy(() => import('./pages/DerivativesDesk.tsx'));
const ConsignmentRouter = lazy(() => import('./pages/ConsignmentRouter.tsx'));
const P2PMarketplace = lazy(() => import('./pages/P2PMarketplace.tsx'));
const TransactionWire = lazy(() => import('./pages/TransactionWire.tsx'));
const LiveBreaks = lazy(() => import('./pages/LiveBreaks.tsx'));

// Previously unrouted pages — Analytics & Intelligence
const CardDNA = lazy(() => import('./pages/CardDNA.tsx'));
const CollectionGenome = lazy(() => import('./pages/CollectionGenome.tsx'));
const ErrorCardIntel = lazy(() => import('./pages/ErrorCardIntel.tsx'));
const HOFTracker = lazy(() => import('./pages/HOFTracker.tsx'));
const MarketIndices = lazy(() => import('./pages/MarketIndices.tsx'));
const PlayerTrajectory = lazy(() => import('./pages/PlayerTrajectory.tsx'));
const PortfolioAttribution = lazy(() => import('./pages/PortfolioAttribution.tsx'));
const ProvenanceChain = lazy(() => import('./pages/ProvenanceChain.tsx'));
const ProvenanceChainIntelligence = lazy(() => import('./pages/ProvenanceChainIntelligence.tsx'));
const QuantWorkbench = lazy(() => import('./pages/QuantWorkbench.tsx'));
const ResearchReports = lazy(() => import('./pages/ResearchReports.tsx'));
const SentimentRadar = lazy(() => import('./pages/SentimentRadar.tsx'));
const WaxIntelligence = lazy(() => import('./pages/WaxIntelligence.tsx'));
const WeatherImpact = lazy(() => import('./pages/WeatherImpact.tsx'));

// Previously unrouted pages — Portfolio & Financial
const EstatePlanning = lazy(() => import('./pages/EstatePlanning.tsx'));
const Rebalancer = lazy(() => import('./pages/Rebalancer.tsx'));
const GradingArbitrage = lazy(() => import('./pages/GradingArbitrage.tsx'));

// Previously unrouted pages — Showcase & Labs
const ARShowcase = lazy(() => import('./pages/ARShowcase.tsx'));
const FrontierLab = lazy(() => import('./pages/FrontierLab.tsx'));
const LiveImpact = lazy(() => import('./pages/LiveImpact.tsx'));
const Inventory = lazy(() => import('./pages/Inventory.tsx'));

// Interactive Demo Flow
const DemoFlowPage = lazy(() => import('./pages/DemoFlow.tsx'));

// Auth pages (public routes, also lazy since not needed after login)
const Login = lazy(() => import('./pages/Login.tsx'));
const Signup = lazy(() => import('./pages/Signup.tsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.tsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.tsx'));
const PublicPortfolio = lazy(() => import('./pages/PublicPortfolio.tsx'));

// ─── App Layout ───────────────────────────────────────────────────────

const AppLayout: React.FC<{ isSidebarOpen: boolean, setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> }> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { inventory } = useSupabaseInventory();
  const [isWallHUDOpen, setIsWallHUDOpen] = useState(false);
  const [selectedGrail, setSelectedGrail] = useState<any>(null);

  // Expose a way to open grail via window for testing/demo
  (window as any).openGrail = (card: any) => setSelectedGrail(card);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-charcoal text-slate-100 font-sans selection:bg-brand-lime/30 luminous-container">
      <LuminousTracker />
      {/* Desktop Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <Header onToggleWallHUD={() => setIsWallHUDOpen(true)} />
        <MarketTicker inventory={inventory} />
        <MigrationBanner />

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

        <main className="flex-1 p-4 md:p-8 page-container overflow-y-auto pb-24 md:pb-8">
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
                <Route path="/grading-arbitrage" element={<GradingArbitrage />} />
                {/* Showcase & Labs — Previously Unrouted */}
                <Route path="/ar-showcase" element={<ARShowcase />} />
                <Route path="/frontier-lab" element={<FrontierLab />} />
                <Route path="/live-impact" element={<LiveImpact />} />
                <Route path="/inventory" element={<Inventory />} />
                {/* Interactive Demo Flow */}
                <Route path="/demo-flow" element={<DemoFlowPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </LazyErrorBoundary>
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
    <AuthProvider>
      <MigrationProvider>
        <ToastProvider>
          <Router>
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
    </AuthProvider>
  );
};

export default App;

