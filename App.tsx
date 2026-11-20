
import React, { Suspense, useState, useEffect, lazy } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
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
import OfflineIndicator from './components/OfflineIndicator.tsx';
import MarketTicker from './components/MarketTicker.tsx';
import { useSupabaseInventory } from './lib/utils/useSupabaseInventory.ts';
import LazyErrorBoundary from './components/LazyErrorBoundary.tsx';
import { PageLoadingFallback } from './components/LazyLoadFallback.tsx';
import DocumentTitleSync from './components/DocumentTitleSync.tsx';
import CommandPalette from './components/CommandPalette.tsx';
import { validateEnv } from './lib/utils/env';
import { initDAL } from './lib/dal';
import { isBetaSurfacesEnabled } from './lib/productionLaunch';
import { isPublicDemoSession } from './lib/demoSession';
import DemoModeBanner from './components/DemoModeBanner';

// Labs routes (everything outside the curated product surface) only mount when
// the beta-surfaces flag is on. Dev builds keep them on for convenience; see
// docs/MVP_LAUNCH_SCOPE.md for the launch boundary.
const labsEnabled = isBetaSurfacesEnabled() || import.meta.env.DEV;

// Validate environment on startup
validateEnv();

// ─── Lazy-loaded Modal-Class Shell Components ─────────────────────────
// These only mount behind opened-state flags (or are render-once shells),
// so keep them out of the initial bundle.
const InstitutionalWallHUD = lazy(() => import('./components/InstitutionalWallHUD.tsx'));
const GrailShowcase = lazy(() => import('./components/GrailShowcase.tsx'));
const DemoFlowWidget = lazy(() => import('./components/DemoFlowWidget.tsx'));
const GuidedTour = lazy(() => import('./components/GuidedTour.tsx'));

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
const ApiLicensing = lazy(() => import('./pages/ApiLicensing.tsx'));
const CardShowModePage = lazy(() => import('./pages/CardShowModePage.tsx'));
const LocalCardShows = lazy(() => import('./pages/LocalCardShows.tsx'));

// Phases 129-138: Competitive differentiators

// Phases 139-148: Production-grade expansion

// Phases 149-158: Advanced platform features

// Phases 159-168: Competitive Feature Suite

// Phases 169-178: Next-gen platform features
const SetCompletionPage = lazy(() => import('./pages/SetCompletion.tsx'));

// Phases 179-188: Engagement & monetization features
const SlabVerification = lazy(() => import('./pages/SlabVerification.tsx'));

// v4.0: Multi-Sport League Hubs

// v4.0: Multi-Sport & Infrastructure
const GradingVisionEngine = lazy(() => import('./pages/GradingVisionEngine.tsx'));

// v4.0: Industry-First Features

// v5.0: Next-Gen Investment Intelligence (Batch 1)
const FractionalVault = lazy(() => import('./pages/FractionalVault.tsx'));

// v5.0: Next-Gen Investment Intelligence (Batch 2)

// v5.1: Beyond-Competition Intelligence (Batch 3)

// v5.0: Industry-First Features — Round 3 (Phases 134-143)

// v6.0: Industry-Absent Innovation Suite (10 features)

// v6.1: Industry-Absent Innovation — Round 2

// v7.0: Industry-Absent Innovation — Round 3 (Phases 224-233)

// v7.1: Industry-Absent Innovation — Round 4 (Phases 234-253)

// v8.0: Industry-Absent Innovation — Frontier Phase (Phases 254-263)

// v9.0: Industry Phases — Group & Enterprise Scale (Phases 264-273)
const AuditTrail = lazy(() => import('./pages/AuditTrail.tsx'));
const AdminAuditTrail = lazy(() => import('./pages/AdminAuditTrail.tsx'));

// v10.0: Group Scale Phase 2 — Community Infrastructure (Phases 274-283)
// v5.1+: PRD 4.11 — Next set of features not in the industry (Frontier)

// v5.2: Next 10 industry-absent features (PRD 4.12)

// Formerly coming-soon features — now live

// Industry-first new features (v11)

// Previously unrouted pages — Advanced Trading & Analysis
const CopyTrading = lazy(() => import('./pages/CopyTrading.tsx'));

// Previously unrouted pages — Institutional & Operations

// Previously unrouted pages — Trading & Marketplace
const LiveBreaks = lazy(() => import('./pages/LiveBreaks.tsx'));

// Previously unrouted pages — Analytics & Intelligence
const ProvenanceChain = lazy(() => import('./pages/ProvenanceChain.tsx'));

// Previously unrouted pages — Portfolio & Financial

// Previously unrouted pages — Showcase & Labs
const FrontierLab = lazy(() => import('./pages/FrontierLab.tsx'));

// Interactive Demo Flow
const DemoFlowPage = lazy(() => import('./pages/DemoFlow.tsx'));

// Auth pages (public routes, also lazy since not needed after login)
const Login = lazy(() => import('./pages/Login.tsx'));
const Signup = lazy(() => import('./pages/Signup.tsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.tsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.tsx'));
const PublicPortfolio = lazy(() => import('./pages/PublicPortfolio.tsx'));

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
  const location = useLocation();
  const showLabs = labsEnabled && !isPublicDemoSession();
  const { inventory } = useSupabaseInventory();
  const [isWallHUDOpen, setIsWallHUDOpen] = useState(false);
  const [selectedGrail, setSelectedGrail] = useState<any>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Expose a way to open grail via window for testing/demo
  (window as any).openGrail = (card: any) => setSelectedGrail(card);

  // Global Cmd+K / Ctrl+K toggles the command palette. This is the single
  // canonical shortcut surface — Header used to register its own listener
  // and FeatureSearch had a third one; both were removed in PR-C.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-charcoal text-slate-100 font-sans selection:bg-brand-lime/30 luminous-container">
      <a
        href="#main-content"
        className="absolute left-[-9999px] w-px h-px overflow-hidden focus:left-4 focus:top-4 focus:z-100 focus:w-auto focus:h-auto focus:overflow-visible focus:px-4 focus:py-2 focus:bg-brand-lime focus:text-brand-charcoal focus:font-bold focus:rounded-lg focus:outline-hidden focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      <LuminousTracker />
      {/* Desktop Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <DemoModeBanner />
        <Header onToggleWallHUD={() => setIsWallHUDOpen(true)} />
        <MarketTicker inventory={inventory} />
        <MigrationBanner />
        <ProductionConfigBanner />
        <PwaUpdateBanner />
        <OfflineIndicator />

        {isWallHUDOpen && (
          <Suspense fallback={null}>
            <InstitutionalWallHUD
              onClose={() => setIsWallHUDOpen(false)}
              inventoryCount={inventory.length}
              totalMarketValue={`$${inventory.reduce((acc, curr) => acc + (parseFloat(curr.market_value?.replace(/[^0-9.]/g, '') || '0')), 0).toLocaleString()}`}
            />
          </Suspense>
        )}

        {selectedGrail && (
          <Suspense fallback={null}>
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
          </Suspense>
        )}

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 md:p-8 page-container overflow-y-auto pb-24 md:pb-8" role="main">
          <AutoTierGate>
          <LazyErrorBoundary key={location.pathname}>
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
                <Route path="/frontier-lab" element={<FrontierLab />} />
                {/* /audit-dossier is reachable from Dashboard, Collection, and
                    the command palette via productSurface — keep it always-on
                    so production users don't hit a silent redirect to "/". */}
                <Route path="/audit-dossier" element={<CollectorAuditDossier />} />
                {/* Same rationale for /audit-trail: command palette / nav surface it. */}
                <Route path="/audit-trail" element={<AuditTrail />} />
                {/* Operator-only cross-user audit viewer. The <AdminRoute /> gate
                    render-blocks on operatorRole; the actual cross-user read is
                    enforced server-side by supabase/functions/admin-audit-events. */}
                <Route
                    path="/audit-trail/admin"
                    element={
                        <AdminRoute>
                            <AdminAuditTrail />
                        </AdminRoute>
                    }
                />
                {/* provenance-chain exited beta (wave-3: DAL persistence + reload E2E),
                    so its route ships in production like the rest of the live catalog. */}
                <Route path="/provenance" element={<ProvenanceChain />} />
                {/* vision-grading exited beta (wave-3: analysis-contract tests +
                    in-session-only image handling) — same rationale. */}
                <Route path="/grading-vision-engine" element={<GradingVisionEngine />} />
                {/* Bloomberg distribution + dealer floor — always-on (not Labs). */}
                <Route path="/api-licensing" element={<ApiLicensing />} />
                <Route path="/card-show-mode" element={<CardShowModePage />} />
                <Route path="/local-card-shows" element={<LocalCardShows />} />
                {/* Labs surface — five flag-gated routes kept (see docs/LABS_ARCHIVE.md).
                    Still off unless VITE_FF_ENABLE_BETA_SURFACES is set; dev builds
                    mount them via import.meta.env.DEV. Public demo sessions hide them. */}
                {showLabs && (<>
                <Route path="/set-completion" element={<SetCompletionPage />} />
                <Route path="/slab-verification" element={<SlabVerification />} />
                <Route path="/fractional-vault" element={<FractionalVault />} />
                <Route path="/copy-trading" element={<CopyTrading />} />
                <Route path="/live-breaks" element={<LiveBreaks />} />
                </>)}
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
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
      <Suspense fallback={null}>
        <GuidedTour />
      </Suspense>
      <Suspense fallback={null}>
        <DemoFlowWidget />
      </Suspense>
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

