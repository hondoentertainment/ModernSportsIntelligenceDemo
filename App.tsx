
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

// Auth pages (public routes, also lazy since not needed after login)
const Login = lazy(() => import('./pages/Login.tsx'));
const Signup = lazy(() => import('./pages/Signup.tsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.tsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.tsx'));
const PublicPortfolio = lazy(() => import('./pages/PublicPortfolio.tsx'));

// ─── App Layout ───────────────────────────────────────────────────────

const AppLayout: React.FC<{ isSidebarOpen: boolean, setIsSidebarOpen: (_val: boolean) => void }> = ({ isSidebarOpen, setIsSidebarOpen }) => {
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </LazyErrorBoundary>
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
      <GuidedTour />
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

