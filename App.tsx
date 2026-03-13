
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Collection from './pages/Collection.tsx';
import MLBStats from './pages/MLBStats.tsx';
import DeepSearch from './pages/DeepSearch.tsx';
import PortfolioAudit from './pages/PortfolioAudit.tsx';
import ProspectTrends from './pages/ProspectTrends.tsx';
import Favorites from './pages/Favorites.tsx';
import Profile from './pages/Profile.tsx';
import Players from './pages/Players.tsx';
import PlayerDetail from './pages/PlayerDetail.tsx';
import Teams from './pages/Teams.tsx';
import Games from './pages/Games.tsx';
import Trends from './pages/Trends.tsx';
import Compare from './pages/Compare.tsx';
import Alerts from './pages/Alerts.tsx';
import AnalystWarRoom from './components/AnalystWarRoom.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import MobileNav from './components/MobileNav.tsx';
import SyncSchedulerInitializer from './components/SyncSchedulerInitializer.tsx';
import LuminousTracker from './components/LuminousTracker.tsx';
import PublicPortfolio from './pages/PublicPortfolio.tsx';
import Leaderboard from './pages/Leaderboard.tsx';
import PortfolioBuilder from './pages/PortfolioBuilder.tsx';
import Billing from './pages/Billing.tsx';
import { MigrationProvider } from './contexts/MigrationContext.tsx';
import MigrationBanner from './components/MigrationBanner.tsx';
import MarketTicker from './components/MarketTicker.tsx';
import LiveImpact from './pages/LiveImpact.tsx';
import FractionalVault from './pages/FractionalVault.tsx';
import ProvenanceChain from './pages/ProvenanceChain.tsx';
import LiveBreaks from './pages/LiveBreaks.tsx';
// Phases 74-83: Core Features (lazy loaded when available)
const TransactionWire = React.lazy(() => import('./pages/TransactionWire.tsx').catch(() => ({ default: () => React.createElement('div', {className: 'p-8 text-slate-400'}, 'Transaction Wire — Coming Soon') })));
const Rebalancer = React.lazy(() => import('./pages/Rebalancer.tsx').catch(() => ({ default: () => React.createElement('div', {className: 'p-8 text-slate-400'}, 'Portfolio Rebalancer — Coming Soon') })));
const CardShowMode = React.lazy(() => import('./pages/CardShowMode.tsx').catch(() => ({ default: () => React.createElement('div', {className: 'p-8 text-slate-400'}, 'Card Show Mode — Coming Soon') })));
const PlayerTrajectory = React.lazy(() => import('./pages/PlayerTrajectory.tsx').catch(() => ({ default: () => React.createElement('div', {className: 'p-8 text-slate-400'}, 'Player Trajectory — Coming Soon') })));
const SentimentRadar = React.lazy(() => import('./pages/SentimentRadar.tsx').catch(() => ({ default: () => React.createElement('div', {className: 'p-8 text-slate-400'}, 'Sentiment Radar — Coming Soon') })));
const ConsignmentRouter = React.lazy(() => import('./pages/ConsignmentRouter.tsx').catch(() => ({ default: () => React.createElement('div', {className: 'p-8 text-slate-400'}, 'Consignment Router — Coming Soon') })));
const ARShowcase = React.lazy(() => import('./pages/ARShowcase.tsx').catch(() => ({ default: () => React.createElement('div', {className: 'p-8 text-slate-400'}, 'AR Showcase — Coming Soon') })));
const EstatePlanning = React.lazy(() => import('./pages/EstatePlanning.tsx').catch(() => ({ default: () => React.createElement('div', {className: 'p-8 text-slate-400'}, 'Estate Planning — Coming Soon') })));
const P2PMarketplace = React.lazy(() => import('./pages/P2PMarketplace.tsx').catch(() => ({ default: () => React.createElement('div', {className: 'p-8 text-slate-400'}, 'P2P Marketplace — Coming Soon') })));
const CardDNA = React.lazy(() => import('./pages/CardDNA.tsx').catch(() => ({ default: () => React.createElement('div', {className: 'p-8 text-slate-400'}, 'Card DNA — Coming Soon') })));
// Phases 84-93: Bloomberg-Grade
import MSITerminal from './pages/MSITerminal.tsx';
import DealRoom from './pages/DealRoom.tsx';
import MarketIndices from './pages/MarketIndices.tsx';
import QuantWorkbench from './pages/QuantWorkbench.tsx';
import DataConsolidation from './pages/DataConsolidation.tsx';
import PortfolioAttribution from './pages/PortfolioAttribution.tsx';
import ComplianceCenter from './pages/ComplianceCenter.tsx';
import APIPlatform from './pages/APIPlatform.tsx';
import DerivativesDesk from './pages/DerivativesDesk.tsx';
import ResearchReports from './pages/ResearchReports.tsx';
// Phases 94-103: Advanced Intelligence
import WaxIntelligence from './pages/WaxIntelligence.tsx';
import AuctionSniper from './pages/AuctionSniper.tsx';
import CollectionGenome from './pages/CollectionGenome.tsx';
import GradingArbitrage from './pages/GradingArbitrage.tsx';
import VintageMarket from './pages/VintageMarket.tsx';
import WeatherImpact from './pages/WeatherImpact.tsx';
import HOFTracker from './pages/HOFTracker.tsx';
import DraftWarRoom from './pages/DraftWarRoom.tsx';
import ErrorCardIntel from './pages/ErrorCardIntel.tsx';
import VaultSecurity from './pages/VaultSecurity.tsx';
import { useSupabaseInventory } from './lib/useSupabaseInventory.ts';

const AppLayout: React.FC<{ isSidebarOpen: boolean, setIsSidebarOpen: (val: boolean) => void }> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { inventory } = useSupabaseInventory();

  return (
    <div className="flex h-screen overflow-hidden bg-brand-charcoal text-slate-100 font-sans selection:bg-brand-lime/30 luminous-container">
      <LuminousTracker />
      {/* Desktop Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <Header />
        <MarketTicker inventory={inventory} />
        <MigrationBanner />

        <main className="flex-1 p-4 md:p-8 page-container overflow-y-auto pb-24 md:pb-8">
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
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/live-impact" element={<LiveImpact />} />
            <Route path="/fractional-vault" element={<FractionalVault />} />
            <Route path="/provenance" element={<ProvenanceChain />} />
            <Route path="/live-breaks" element={<LiveBreaks />} />
            {/* Phases 74-83: Core Features (lazy loaded) */}
            <Route path="/transaction-wire" element={<React.Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}><TransactionWire /></React.Suspense>} />
            <Route path="/rebalancer" element={<React.Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}><Rebalancer /></React.Suspense>} />
            <Route path="/card-show" element={<React.Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}><CardShowMode /></React.Suspense>} />
            <Route path="/trajectory" element={<React.Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}><PlayerTrajectory /></React.Suspense>} />
            <Route path="/sentiment" element={<React.Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}><SentimentRadar /></React.Suspense>} />
            <Route path="/consignment-router" element={<React.Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}><ConsignmentRouter /></React.Suspense>} />
            <Route path="/ar-showcase" element={<React.Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}><ARShowcase /></React.Suspense>} />
            <Route path="/estate-planning" element={<React.Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}><EstatePlanning /></React.Suspense>} />
            <Route path="/marketplace" element={<React.Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}><P2PMarketplace /></React.Suspense>} />
            <Route path="/card-dna" element={<React.Suspense fallback={<div className="p-8 text-slate-400">Loading...</div>}><CardDNA /></React.Suspense>} />
            {/* Phases 84-93: Bloomberg-Grade */}
            <Route path="/terminal" element={<MSITerminal />} />
            <Route path="/deal-room" element={<DealRoom />} />
            <Route path="/indices" element={<MarketIndices />} />
            <Route path="/quant" element={<QuantWorkbench />} />
            <Route path="/data-hub" element={<DataConsolidation />} />
            <Route path="/attribution" element={<PortfolioAttribution />} />
            <Route path="/compliance" element={<ComplianceCenter />} />
            <Route path="/api-platform" element={<APIPlatform />} />
            <Route path="/derivatives" element={<DerivativesDesk />} />
            <Route path="/research" element={<ResearchReports />} />
            {/* Phases 94-103: Advanced Intelligence */}
            <Route path="/wax-intelligence" element={<WaxIntelligence />} />
            <Route path="/auction-sniper" element={<AuctionSniper />} />
            <Route path="/genome" element={<CollectionGenome />} />
            <Route path="/grading-arbitrage" element={<GradingArbitrage />} />
            <Route path="/vintage" element={<VintageMarket />} />
            <Route path="/weather-impact" element={<WeatherImpact />} />
            <Route path="/hof-tracker" element={<HOFTracker />} />
            <Route path="/draft-room" element={<DraftWarRoom />} />
            <Route path="/error-cards" element={<ErrorCardIntel />} />
            <Route path="/vault-security" element={<VaultSecurity />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
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
          </Router>
        </ToastProvider>
      </MigrationProvider>
    </AuthProvider>
  );
};

export default App;
