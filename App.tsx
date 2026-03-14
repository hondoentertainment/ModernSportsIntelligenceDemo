
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
import GuildDashboard from './pages/GuildDashboard.tsx';
import PhaseOperations from './pages/PhaseOperations.tsx';
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
import { useSupabaseInventory } from './lib/useSupabaseInventory.ts';
import InstitutionalWallHUD from './components/InstitutionalWallHUD.tsx';
import GrailShowcase from './components/GrailShowcase.tsx';
import { CardInventory } from './types.ts';

const AppLayout: React.FC<{ isSidebarOpen: boolean, setIsSidebarOpen: (val: boolean) => void }> = ({ isSidebarOpen, setIsSidebarOpen }) => {
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
            <Route path="/phase-ops" element={<PhaseOperations />} />
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

