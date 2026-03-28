
import { store } from '../lib/dal/syncStore';
import React, {
  Suspense,
  useMemo,
  useState,
  useCallback,
  useEffect,
  lazy,
} from 'react';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Trophy,
  Zap,
  Layers,
  Sparkles,
  PieChart as PieChartIcon,
  ChevronRight,
  BarChart3,
  Package,
  RefreshCw,
  Terminal,
  CheckCircle2,
  Clock,
  Camera,
  Share2,
  FileDown,
  Terminal,
  BriefcaseBusiness
} from 'lucide-react';

import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';
import { calculateAlphaScore, getCollectorTier, getPortfolioDNA } from '../lib/analytics/analytics.ts';
import { generatePortfolioSentiment } from '../lib/utils/gemini.ts';
import { detectSignals } from '../lib/utils/signals.ts';
import { syncPortfolio, SyncProgress } from '../lib/utils/marketSync.ts';
import { useSupabaseInventory } from '../lib/utils/useSupabaseInventory.ts';
import { useAlerts } from '../lib/utils/useAlerts.ts';
import ReportModal from '../components/ReportModal.tsx';
import MorningBriefingModal from '../components/MorningBriefingModal.tsx';
import ShareAlphaModal from '../components/ShareAlphaModal.tsx';
import OCRIngestionModal from '../components/OCRIngestionModal.tsx';
import { getRarityTier, getTierStyles } from '../lib/utils/rarity.ts';
import { getHistoricalDelta } from '../lib/analytics/marketHistory.ts';
import { logger } from '../lib/logger';
import { StatsService } from '../lib/utils/statsService.ts';
import { AggregationService } from '../lib/analytics/aggregationService.ts';
import { Cloud, CloudOff, Gavel } from 'lucide-react';
import CardImage from '../components/CardImage.tsx';
import NegotiationModal from '../components/NegotiationModal.tsx';
import HypeFeed from '../components/HypeFeed.tsx';
import MarketPulseTable from '../components/MarketPulseTable.tsx';
import DeepDiverReport from '../components/DeepDiverReport.tsx';
import { CorrelationTerminal } from '../components/CorrelationTerminal.tsx';
import { HedgeAdvisor } from '../components/HedgeAdvisor.tsx';
import MacroSentinelWidget from '../components/MacroSentinelWidget.tsx';
import { ArbitrageTerminal } from '../components/ArbitrageTerminal.tsx';
import WarRoomWidget from '../components/WarRoomWidget.tsx';
import FiscalHealthWidget from '../components/FiscalHealthWidget.tsx';
import StrategyMap from '../components/StrategyMap.tsx';
import ArbitrageSwarmDashboard from '../components/ArbitrageSwarmDashboard.tsx';
import DashboardFeatureWidgets from '../components/DashboardFeatureWidgets.tsx';
import PricingTruthHealthPanel from '../components/PricingTruthHealthPanel.tsx';


const Dashboard: React.FC = () => {
  // Shared inventory state
  const {
    inventory,
    targets,
    setInventory,
    setSyncMeta,
    syncMeta,
    initializeFullInventory,
    isCloudSynced,
    loading,
    persistSyncToCloud,
    syncStatus,
    lastSyncError
  } = useSupabaseInventory();

  const [realMlbStats, setRealMlbStats] = useState<any[]>([]);

  // Fetch real stats for top MLB assets
  useEffect(() => {
    const fetchRealStats = async () => {
      const mlbCards = inventory.filter(c => c.league === 'MLB').slice(0, 3);
      const statsPromises = mlbCards.map(c => StatsService.getPlayerPerformance(c.player));
      const results = await Promise.all(statsPromises);
      setRealMlbStats(results.filter(Boolean));
    };

    if (inventory.length > 0) {
      fetchRealStats();
    }
  }, [inventory]);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const { syncComplete: createSyncAlert, portfolioMomentum: createMomentumAlert } = useAlerts();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
  const [negotiationTarget, setNegotiationTarget] = useState<any>(null);
  const [isTerminalMode, setIsTerminalMode] = useState(false);

  // Identity Metrics
  const alphaScore = useMemo(() => calculateAlphaScore(inventory), [inventory]);
  const tier = useMemo(() => getCollectorTier(alphaScore), [alphaScore]);
  const dnaData = useMemo(() => getPortfolioDNA(inventory), [inventory]);
  const signals = useMemo(() => detectSignals(targets, inventory), [targets, inventory]);
  const [marketSentiment, setMarketSentiment] = useState('Analyzing portfolio alpha signals...');

  // Personalization State
  interface UserSettings { favoriteTeam?: string; primarySport?: string }
  const [userSettings, _setUserSettings] = useState<UserSettings | null>(() => {
  const [userSettings, setUserSettings] = useState<any>(() => {
    try {
      const saved = store.get<any>('msi_user_settings', null);
      return saved;
    } catch {
      return null;
    }
  });

  // Fetch Sentiment
  useEffect(() => {
    if (inventory.length > 0) {
      generatePortfolioSentiment(inventory).then(setMarketSentiment);
    }
  }, [inventory]);

  // Morning Briefing Logic
  useEffect(() => {
    const lastSeen = store.get<string>('lastMorningBriefing', '');
    const today = new Date().toDateString();

    // Show if we haven't seen it today and have inventory
    if (lastSeen !== today && inventory.length > 0) {
      // Delay slightly for effect
      const timer = setTimeout(() => {
        setShowBriefing(true);
        store.set('lastMorningBriefing', today);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [inventory.length]);

  // Ensure full inventory is loaded on mount
  useEffect(() => {
    initializeFullInventory();
  }, [initializeFullInventory]);

  const handleSync = useCallback(async () => {
    const { inventory: updatedInventory, result } = await syncPortfolio(
      inventory,
      (progress) => setSyncProgress(progress)
    );
    setInventory(updatedInventory);
    setSyncMeta({
      lastSyncTime: new Date().toISOString(),
      totalValue: result.totalValue,
      assetCount: updatedInventory.length,
    });

    await persistSyncToCloud(updatedInventory);

    // Create alert for sync completion
    createSyncAlert(result.updatedCount, result.totalValue, result.duration);

    // Check for significant delta to trigger momentum alert
    const delta = getHistoricalDelta();
    if (delta && Math.abs(delta.gainPercent) > 0.1) {
      createMomentumAlert(delta.gainValue, delta.gainPercent, delta.isPositive);
    }

    // Reset progress after a delay
    setTimeout(() => setSyncProgress(null), 3000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory, setInventory, setSyncMeta, persistSyncToCloud, createSyncAlert]);

  const isSyncing = syncProgress?.status === 'syncing';
  const _syncComplete = syncProgress?.status === 'complete';

  // Portfolio metrics from aggregation service
  const portfolioMetrics = useMemo(() => AggregationService.calculatePortfolioMetrics(inventory), [inventory]);
  const growthComparison = useMemo(() => AggregationService.getComparisonMetrics(inventory, '30d'), [inventory]);

  // Use real aggregated trend data for the chart
  const chartData = useMemo(() => {
    return AggregationService.getAggregatedTrendData(inventory, 14); // 14 day view for dash
  }, [inventory]);
  }, [inventory, syncMeta.lastSyncTime]);

  const recentCards = inventory.slice(-3).reverse();

  const _sportData = useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach(card => {
      counts[card.sport] = (counts[card.sport] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  const manufacturerData = useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach(card => {
      counts[card.manufacturer] = (counts[card.manufacturer] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [inventory]);

  const COLORS = ['#D9F99D', '#22C55E', '#10B981', '#059669', '#047857'];

  const [activeLeague, setActiveLeague] = React.useState<string>(() => {
    if (userSettings?.primarySport === 'Baseball') return 'MLB';
    if (userSettings?.primarySport === 'Basketball') return 'NBA';
    if (userSettings?.primarySport === 'Football') return 'NFL';
    return 'MLB';
  });

  const leagueData = useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach(card => {
      counts[card.league] = (counts[card.league] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  const activeLeagueStats = useMemo(() => {
    const leagueCards = inventory.filter(c => c.league === activeLeague);
    const value = leagueCards.reduce((sum, c) => sum + (c.currentValue || 0), 0);
    const cost = leagueCards.reduce((sum, c) => sum + (c.purchasePrice || 0), 0);
    return {
      count: leagueCards.length,
      value,
      roi: cost > 0 ? ((value - cost) / cost) * 100 : 0
    };
  }, [activeLeague, inventory]);

  const _leagueInsights = {
    MLB: "Market is stabilizing after off-season volatility. High demand for pristine vintage assets.",
    MiLB: "Scouting velocity is up 14%. Focus on AAA breakouts before summer call-ups.",
    NBA: "Liquidity peaking as playoffs approach. Star potential drives extreme parity in mid-tier assets.",
    NFL: "Seasonal cooldown in effect. Prime accumulation window for defensive anchors and rookie QB variants."
  };

  return (
    <div className={`space-y-12 animate-in fade-in duration-700 pb-12 ${isTerminalMode ? 'px-2' : ''}`}>
      {lastSyncError && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <span className="font-semibold">Cloud sync needs attention.</span>
            <span className="text-xs uppercase tracking-widest text-amber-300">
              {syncStatus === 'offline' ? 'Offline Cache' : syncStatus}
            </span>
          </div>
          <p className="mt-2 text-amber-200/90">{lastSyncError}</p>
        </section>
      )}

      {inventory.length === 0 ? (
        /* Compact HUD Initialization State */
        <div className="min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden py-12">
          {/* Background Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-lime/5 blur-[100px] rounded-full animate-pulse"></div>

          <div className="relative z-10 w-full max-w-4xl space-y-8 text-center reveal-section">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-brand-lime to-brand-teal rounded-full blur-md opacity-25 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
                <div className="relative p-6 bg-brand-charcoal border border-slate-800 rounded-full shadow-2xl">
                  <Activity size={48} className="text-brand-lime animate-pulse" />
                </div>
                {/* Scanning Line Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-lime to-transparent opacity-50 animate-scan pointer-events-none"></div>
              </div>

              <div className="space-y-2">
                <h1 className="text-5xl md:text-7xl font-bebas tracking-tighter text-white leading-none">
                  SYSTEM <span className="text-brand-lime">INITIALIZATION</span>
                </h1>
                <p className="text-lg text-brand-muted font-medium max-w-xl mx-auto leading-tight">
                  Intelligence engine active. Deploy your first asset to calibrate market tracking.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link to="/collection" className="px-10 py-5 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all shadow-2xl shadow-brand-lime/20 flex items-center gap-3 uppercase tracking-widest text-xs transform active:scale-95 group">
                <Package size={18} strokeWidth={3} />
                Deploy First Asset
                <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => setIsScanOpen(true)}
                className="px-10 py-5 bg-brand-charcoal hover:bg-slate-800 border border-brand-lime/30 text-brand-lime font-black rounded-2xl transition-all shadow-2xl flex items-center gap-3 uppercase tracking-widest text-xs transform active:scale-95 group"
              >
                <Sparkles size={18} className="group-hover:animate-pulse" />
                AI Alpha Scan
              </button>
              <button
                onClick={() => initializeFullInventory()}
                className="px-10 py-5 bg-brand-charcoal hover:bg-slate-800 border border-slate-700 text-white font-black rounded-2xl transition-all flex items-center gap-3 uppercase tracking-widest text-xs transform active:scale-95 group"
              >
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                Initialize Demo Sync
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 opacity-80 scale-95">
              {[
                { icon: <TrendingUp size={18} />, title: 'Market Pulse', desc: 'Real-time liquidity' },
                { icon: <Zap size={18} />, title: 'Gemini Insight', desc: 'AI valuation' },
                { icon: <Trophy size={18} />, title: 'Asset Alpha', desc: 'League analytics' }
              ].map((feature, i) => (
                <div key={i} className="bg-brand-slate/40 backdrop-blur-md border border-slate-800 p-6 rounded-[1.5rem] space-y-2 group hover:border-brand-lime/30 transition-all">
                  <div className="w-10 h-10 bg-brand-charcoal rounded-xl flex items-center justify-center text-brand-lime mb-1 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bebas tracking-wide text-white">{feature.title}</h3>
                  <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest leading-none">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <p className="text-[9px] font-black text-brand-muted/60 uppercase tracking-[0.6em] animate-pulse">Awaiting Data Ingestion...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className={isTerminalMode ? 'grid grid-cols-12 gap-4' : 'space-y-12'}>
          {/* Hero Financial Summary */}
          <div className={isTerminalMode ? 'col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
            {/* Main NAV Mega-Widget */}
            <div className={isTerminalMode ? 'md:col-span-2 luminous-card rounded-2xl p-6 relative overflow-hidden group shadow-xl flex flex-col justify-between' : 'md:col-span-2 lg:col-span-2 luminous-card rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl shadow-brand-lime/5 flex flex-col justify-between'}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lime/5 blur-[100px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isCloudSynced ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue' : 'bg-slate-800 border-slate-700 text-brand-muted'}`}>
                      {isCloudSynced ? <><Cloud size={12} /> Cloud Synced</> : <><CloudOff size={12} /> Local Mode</>}
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-[10px] font-black uppercase tracking-[0.2em]">
                      <Sparkles size={12} /> Live
                    </div>
                    <button
                      onClick={() => setIsTerminalMode(!isTerminalMode)}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isTerminalMode ? 'bg-brand-lime text-brand-charcoal border-brand-lime' : 'bg-slate-800 border-slate-700 text-brand-muted hover:text-white'}`}
                    >
                      <Terminal size={12} /> {isTerminalMode ? 'Terminal Active' : 'Enter Terminal'}
                    </button>
                  </div>

                  <div>
                    <h1 className={isTerminalMode ? "text-2xl font-bebas tracking-tight text-white leading-none mb-1" : "text-4xl md:text-6xl font-bebas tracking-tight text-white leading-none mb-1"}>
                      {userSettings?.favoriteTeam ? `${userSettings.favoriteTeam.split(' ').pop()} Hub` : 'Net Asset'} <span className="text-brand-lime">{userSettings?.favoriteTeam ? 'Intelligence' : 'Value'}</span>
                    </h1>
                    <span className={isTerminalMode ? "text-4xl font-mono font-bold text-white tracking-tighter" : "text-5xl md:text-7xl font-mono font-bold text-white tracking-tighter"}>
                      ${portfolioMetrics.totalValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={handleSync} disabled={isSyncing} className={`px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[9px] flex items-center gap-2 transition-all active:scale-95 ${isSyncing ? 'bg-slate-800 text-brand-lime cursor-wait' : 'bg-brand-lime text-brand-charcoal hover:bg-white'}`}>
                      {isSyncing ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                      {isSyncing ? 'Syncing...' : 'Sync Market'}
                    </button>
                    <button
                      onClick={() => setIsScanOpen(true)}
                      className="px-4 py-2 rounded-lg bg-brand-charcoal hover:bg-slate-800 border border-brand-lime/20 text-brand-lime font-black uppercase tracking-widest text-[9px] flex items-center gap-2 transition-all active:scale-95"
                    >
                      <Sparkles size={12} /> Alpha
                    </button>
                    <Link
                      to="/audit-dossier"
                      className="px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-200 font-black uppercase tracking-widest text-[9px] flex items-center gap-2 transition-all active:scale-95"
                    >
                      <BriefcaseBusiness size={12} /> Dossier
                    </Link>
                    <Link to="/collection" className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all border border-slate-700">
                      Manage Assets <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>

                {!isTerminalMode && (
                  <div className="w-full md:w-[280px] h-[160px] bg-slate-900/50 rounded-2xl border border-white/5 p-4 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">30d Momentum</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${growthComparison.deltaPercent >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                        {growthComparison.deltaPercent >= 0 ? '+' : ''}{growthComparison.deltaPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-[100px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValMini" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#D9F99D" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#D9F99D" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="value" stroke="#D9F99D" strokeWidth={2} fillOpacity={1} fill="url(#colorValMini)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column Stack / Terminal Grid Items */}
            <div className={isTerminalMode ? 'md:col-span-1 luminous-card rounded-2xl p-4 flex flex-col justify-center gap-2 min-h-[100px]' : 'luminous-card rounded-[2rem] p-6 flex flex-col justify-center gap-4 min-h-[160px]'}>
              <div className="flex justify-between items-start">
                <div className="p-2 bg-brand-charcoal rounded-lg border border-slate-800 text-brand-blue">
                  <Activity size={16} />
                </div>
                <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest"> eBay Feed</span>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-white leading-none">{inventory.length}</p>
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mt-1">Total Assets</p>
              </div>
            </div>

            {/* ROI Card */}
            <div className={isTerminalMode ? 'md:col-span-1 luminous-card rounded-2xl p-4 flex flex-col justify-center gap-2 min-h-[100px]' : 'luminous-card rounded-[2rem] p-6 flex flex-col justify-center gap-4 min-h-[160px]'}>
              <div className="flex justify-between items-start">
                <div className="p-2 bg-brand-charcoal rounded-lg border border-slate-800 text-brand-green">
                  <TrendingUp size={16} />
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest block"> Gain/Loss</span>
                  {portfolioMetrics.soldCount > 0 && (
                    <span className="text-[8px] font-black text-brand-lime uppercase tracking-widest">{portfolioMetrics.soldCount} Assets Realized</span>
                  )}
                </div>
              </div>
              <div>
                <p className={`text-2xl font-mono font-bold leading-none ${portfolioMetrics.totalGain >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                  ${portfolioMetrics.totalGain >= 0 ? '+' : ''}{portfolioMetrics.totalGain.toLocaleString()}
                </p>
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mt-1">
                  Portfolio P/L
                </p>
              </div>
            </div>
          </div>

          {/* Terminal Mode Market Pulse Table & Analyst Desk */}
          {isTerminalMode && (
            <>
              <div className="col-span-12 lg:col-span-8 animate-in slide-in-from-left duration-500">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-brand-lime/10 rounded-lg text-brand-lime">
                      <Activity size={16} />
                    </div>
                    <h3 className="text-lg font-bebas tracking-wide text-white">Live Market Quotes</h3>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-brand-charcoal border border-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest">Streaming</span>
                  </div>
                </div>
                <MarketPulseTable items={inventory.slice(0, 8)} />
              </div>
              <div className="col-span-12 lg:col-span-4 animate-in slide-in-from-right duration-500">
                <DeepDiverReport cardName={inventory[0]?.player ? `${inventory[0].year} ${inventory[0].manufacturer} ${inventory[0].player}` : undefined} />
              </div>
            </>
          )}

          {/* Portfolio Identity HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-200 order-3 lg:order-2">
            <div className="lg:col-span-1 luminous-card rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl shadow-brand-lime/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-lime/10 transition-colors"></div>

              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand-charcoal border border-slate-800 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                      {tier.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand-lime uppercase tracking-widest mb-1">MSI Rank</p>
                      <h2 className="text-3xl font-bebas tracking-wide text-white leading-none">{tier.title}</h2>
                    </div>
                  </div>
                  <p className="text-sm text-brand-muted font-medium leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alpha Score</span>
                    <span className="text-2xl font-mono font-bold text-brand-lime">{alphaScore}<span className="text-xs text-slate-700">/100</span></span>
                  </div>
                  <div className="h-2 w-full bg-brand-charcoal rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-brand-lime to-brand-teal rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${alphaScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 luminous-card rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl shadow-brand-teal/5 flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bebas tracking-wide text-white mb-1">Portfolio DNA</h3>
                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Investment Signature</p>
                  </div>
                  <div className="flex gap-4">
                    {dnaData.map((point, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-lime/40 group-hover:bg-brand-lime transition-colors"></div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{point.subject}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dnaData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                      />
                      <Radar
                        name="DNA"
                        dataKey="A"
                        stroke="#BEF264"
                        fill="#BEF264"
                        fillOpacity={0.15}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="w-full lg:w-72 h-[320px] lg:h-auto border-t lg:border-t-0 lg:border-l border-slate-800 pt-8 lg:pt-0 lg:pl-8">
                <HypeFeed />
              </div>
            </div>
          </div>

          {/* Intelligence Signals - Feature Metric Widgets */}
          <DashboardFeatureWidgets />
          <PricingTruthHealthPanel inventory={inventory} />

          {/* Strategic Signals Feed */}
          <div className="reveal-section bg-brand-charcoal/50 border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden relative shadow-2xl shadow-brand-blue/5 animate-in slide-in-from-bottom-8 duration-700 order-1 lg:order-3" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-bebas tracking-wide text-white">Strategic Signals</h3>
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest leading-none">Market Opportunity Analysis</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-brand-charcoal border border-slate-800 rounded-full text-[10px] font-black text-brand-blue uppercase tracking-widest">
                {signals.length} Active {signals.length === 1 ? 'Signal' : 'Signals'}
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              <Link
                to="/audit-dossier"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-[10px] font-black uppercase tracking-widest"
              >
                <BriefcaseBusiness size={14} />
                Open Collector Audit Dossier
              </Link>
              <button
                onClick={() => setIsReportOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-black uppercase tracking-widest"
              >
                <FileDown size={14} />
                Open Report Builder
              </button>
            </div>

            {signals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {signals.map((signal, i) => (
                  <div key={signal.id} className="p-6 luminous-card rounded-2xl relative overflow-hidden group hover:border-brand-blue/40 transition-all">
                    <div className={`absolute top-0 right-0 w-16 h-16 blur-3xl opacity-10 rounded-full -mr-8 -mt-8 ${signal.type === 'buy' ? 'bg-brand-lime' : 'bg-brand-teal'}`}></div>
                    <div className="relative z-10 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${signal.type === 'buy' ? 'bg-brand-lime/10 text-brand-lime' : 'bg-brand-teal/10 text-brand-teal'}`}>
                          {signal.type === 'buy' ? 'Liquidity Inbound' : 'Asset Maturity'}
                        </div>
                        {signal.impact === 'high' && (
                          <div className="flex items-center gap-1 text-[9px] font-black text-brand-orange uppercase animate-pulse">
                            <Zap size={10} /> High Impact
                          </div>
                        )}
                      </div>
                      <h4 className="text-white font-bold leading-tight">{signal.title}</h4>
                      <p className="text-xs text-brand-muted leading-relaxed font-medium">
                        {signal.description}
                      </p>
                      <button className="flex items-center gap-2 text-[10px] font-black text-brand-blue uppercase tracking-widest pt-2 group-hover:text-white transition-colors">
                        Execute Action <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-brand-slate/20 rounded-3xl border border-dashed border-slate-800">
                <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600">
                  <Layers size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Awaiting Alpha Breakouts</p>
                  <p className="text-[10px] text-slate-500 font-medium">No active entry/exit signals detected in current market cycle.</p>
                </div>
              </div>
            )}
          </div>

          {/* Asset Correlation & Strategic Autonomy (Phase 19 & 21) */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-500 order-last" style={{ animationDelay: '600ms' }}>
            <div className="xl:col-span-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-6">
                <CorrelationTerminal inventory={inventory} />
                <div className="mt-6 lg:mt-0">
                  <StrategyMap inventory={inventory} />
                </div>
              </div>
            </div>
            <div className="xl:col-span-2">
              <WarRoomWidget />
            </div>
          </div>

          <div className="reveal-section mt-8 animate-in slide-in-from-bottom-8 duration-700 order-last" style={{ animationDelay: '650ms' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HedgeAdvisor inventory={inventory} />
              <FiscalHealthWidget />
            </div>
          </div>

          {/* Macro-Sentinel Monitoring (Phase 24) */}
          <div className="reveal-section mb-12 animate-in slide-in-from-bottom-8 duration-700 order-last" style={{ animationDelay: '450ms' }}>
            <MacroSentinelWidget portfolioValue={portfolioMetrics.totalValue} />
          </div>

          {/* Arbitrage & Tactical Execution (Phase 22) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-500 order-last" style={{ animationDelay: '700ms' }}>
            <div className="xl:col-span-1">
              <ArbitrageTerminal inventory={inventory} targets={targets} />
            </div>
            <div className="xl:col-span-2">
              <ArbitrageSwarmDashboard />
            </div>

          </div>

          {/* Negotiation / Marketplace Teaser */}
          <div className="reveal-section mt-8 mb-12" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-orange/10 rounded-xl text-brand-orange">
                  <Gavel size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bebas tracking-wide text-white">Agentic Marketplace</h3>
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Live Negotiations</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-brand-charcoal border border-slate-800 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-lime animate-pulse"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Simulation Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-6 flex gap-6 hover:border-brand-orange/30 transition-all group cursor-pointer"
                onClick={() => {
                  setNegotiationTarget({
                    id: 'market-1',
                    player: 'Elly De La Cruz',
                    year: 2024,
                    manufacturer: 'Topps Chrome',
                    price: 450,
                    image: 'https://m.media-amazon.com/images/I/71R2o5C2HNL._AC_UF1000,1000_QL80_.jpg'
                  });
                  setIsNegotiationOpen(true);
                }}
              >
                <div className="w-24 h-32 bg-slate-900 rounded-xl overflow-hidden relative">
                  <img src="https://m.media-amazon.com/images/I/71R2o5C2HNL._AC_UF1000,1000_QL80_.jpg" alt="Card" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2 bg-brand-charcoal/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-black text-white border border-white/10">PSA 10</div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-white group-hover:text-brand-orange transition-colors">Elly De La Cruz</h4>
                    <p className="text-xs text-brand-muted mb-2">2024 Topps Chrome #15</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-mono font-bold text-white">$450</span>
                      <span className="text-xs text-brand-red line-through opacity-50">$525</span>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-brand-charcoal border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg group-hover:bg-brand-orange group-hover:border-brand-orange group-hover:text-brand-charcoal transition-all">
                    Launch Agent
                  </button>
                </div>
              </div>

              <div className="bg-brand-charcoal/50 border border-slate-800 rounded-2xl p-6 flex gap-6 hover:border-brand-orange/30 transition-all group cursor-pointer"
                onClick={() => {
                  setNegotiationTarget({
                    id: 'market-2',
                    player: 'Anthony Edwards',
                    year: 2020,
                    manufacturer: 'Panini Prizm',
                    price: 850,
                    image: 'https://i.ebayimg.com/images/g/Y~QAAOSw~dVl~u~g/s-l1200.jpg'
                  });
                  setIsNegotiationOpen(true);
                }}
              >
                <div className="w-24 h-32 bg-slate-900 rounded-xl overflow-hidden relative">
                  <img src="https://i.ebayimg.com/images/g/Y~QAAOSw~dVl~u~g/s-l1200.jpg" alt="Card" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2 bg-brand-charcoal/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-black text-white border border-white/10">BGS 9.5</div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-white group-hover:text-brand-orange transition-colors">Anthony Edwards</h4>
                    <p className="text-xs text-brand-muted mb-2">2020 Panini Prizm #258</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-mono font-bold text-white">$850</span>
                      <span className="text-xs text-brand-red line-through opacity-50">$980</span>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-brand-charcoal border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg group-hover:bg-brand-orange group-hover:border-brand-orange group-hover:text-brand-charcoal transition-all">
                    Launch Agent
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="reveal-section mb-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bebas tracking-wide text-white">Differentiator Layer</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Execution, trust, catalysts, and simulation</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                { title: 'Liquidity Twin', subtitle: 'Exit velocity + venue routing', path: '/liquidity-twin', icon: <Zap size={16} /> },
                { title: 'Private Deal Room', subtitle: 'High-value negotiation rooms', path: '/private-deal-room-agent', icon: <Gavel size={16} /> },
                { title: 'Trust Graph', subtitle: 'Counterparty confidence map', path: '/counterparty-trust-graph', icon: <Share2 size={16} /> },
                { title: 'Catalyst Market', subtitle: 'Event-driven repricing windows', path: '/catalyst-market', icon: <TrendingUp size={16} /> },
                { title: 'Scenario Theater', subtitle: 'Forward NAV simulation', path: '/portfolio-scenario-theater', icon: <Activity size={16} /> },
              ].map(card => (
                <Link
                  key={card.path}
                  to={card.path}
                  className="rounded-2xl border border-slate-800 bg-brand-charcoal/50 p-5 transition-all hover:border-brand-lime/30 hover:bg-brand-charcoal"
                >
                  <div className="mb-3 flex items-center gap-2 text-brand-lime">{card.icon}</div>
                  <h4 className="font-semibold text-white">{card.title}</h4>
                  <p className="mt-1 text-xs text-brand-muted">{card.subtitle}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* League Intelligence Hub */}
          <section className="reveal-section luminous-card rounded-[2.5rem] p-8 md:p-12" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="w-full lg:w-1/3 space-y-8">
                <div>
                  <h2 className="text-4xl font-bebas tracking-tight text-white mb-2">League <span className="text-brand-lime">Intelligence</span></h2>
                  <p className="text-brand-muted text-sm font-medium">Switch between major market hubs for league-specific ROI and sentiment tracking.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {['MLB', 'MiLB', 'NBA', 'NFL'].map((lg) => (
                    <button
                      key={lg}
                      onClick={() => setActiveLeague(lg)}
                      className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border
                    ${activeLeague === lg
                          ? 'bg-brand-lime border-brand-lime text-brand-charcoal shadow-xl shadow-brand-lime/20'
                          : 'bg-brand-charcoal border-slate-800 text-brand-muted hover:border-slate-700'}`}
                    >
                      {lg}
                    </button>
                  ))}
                </div>

                <div className="p-6 bg-brand-charcoal rounded-[2rem] border border-slate-800 space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">AI Market Sentiment</p>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {marketSentiment}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-black uppercase text-brand-lime">
                    <span>Signal: {alphaScore > 70 ? 'Institutional Hold' : 'Accumulate Alpha'}</span>
                    <Sparkles size={12} className="animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-3 bg-brand-charcoal/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/5 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="h-48 w-48 shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leagueData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {leagueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-brand-slate stroke-2" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest leading-none">Global</span>
                      <span className="text-xl font-bebas text-white">Assets</span>
                    </div>
                  </div>
                  <div className="flex-1 relative z-10 w-full">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-10">
                      <div className="flex flex-col gap-1 border-l-2 border-brand-lime/20 pl-6 py-1">
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-1">League NAV</p>
                        <p className="text-2xl md:text-3xl font-mono font-bold text-white whitespace-nowrap tracking-tight">${activeLeagueStats.value.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col gap-1 border-l-2 border-brand-lime/20 pl-6 py-1">
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-1">League ROI</p>
                        <p className={`text-2xl md:text-3xl font-mono font-bold whitespace-nowrap tracking-tight ${activeLeagueStats.roi >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                          {activeLeagueStats.roi >= 0 ? '+' : ''}{activeLeagueStats.roi.toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 border-l-2 border-brand-lime/20 pl-6 py-1">
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-1">Asset Mass</p>
                        <p className="text-2xl md:text-3xl font-mono font-bold text-white tracking-tight">{activeLeagueStats.count} <span className="text-[10px] uppercase tracking-widest text-brand-muted font-black ml-1">Units</span></p>
                      </div>
                      <div className="flex flex-col gap-1 border-l-2 border-brand-lime/20 pl-6 py-1">
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-1">VOLATILITY</p>
                        <p className="text-2xl md:text-3xl font-mono font-bold text-brand-orange uppercase tracking-tight">Low</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-charcoal/30 backdrop-blur-sm rounded-3xl p-6 border border-white/5 group hover:border-brand-lime/20 transition-all">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4 flex items-center justify-between">
                    Manufacturer Alpha
                    <BarChart3 size={12} className="text-brand-lime opacity-50" />
                  </p>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={manufacturerData.slice(0, 3)} layout="vertical">
                        <Bar dataKey="value" fill="url(#limeGradient)" radius={[0, 4, 4, 0]} barSize={12} />
                        <defs>
                          <linearGradient id="limeGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#D9F99D" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#22C55E" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-brand-charcoal/30 backdrop-blur-sm rounded-3xl p-6 border border-white/5 group hover:border-brand-lime/20 transition-all">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4 flex items-center justify-between">
                    Price Parity Index
                    <Activity size={12} className="text-brand-lime opacity-50" />
                  </p>
                  <div className="flex items-end gap-1 h-24">
                    {[40, 70, 45, 90, 65, 80].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-brand-slate to-brand-slate/40 rounded-t-sm group-hover:from-brand-lime/20 transition-all" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
                <div className="bg-brand-charcoal/30 backdrop-blur-sm rounded-3xl p-6 border border-white/5 group hover:border-brand-lime/20 transition-all flex flex-col justify-between">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Liquidity Score</p>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bebas text-brand-green">84.2</span>
                    <TrendingUp className="text-brand-green animate-pulse" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time MLB Stats Integration */}
            {activeLeague === 'MLB' && realMlbStats.length > 0 && (
              <div className="mt-12 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-1.5 bg-brand-lime/10 rounded-lg text-brand-lime">
                    <Trophy size={18} />
                  </div>
                  <h3 className="text-xl font-bebas tracking-wide text-white">Live Performance Hydration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {realMlbStats.map((player, idx) => (
                    <div key={idx} className="bg-brand-charcoal/40 border border-slate-800 rounded-2xl p-6 hover:border-brand-lime/30 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">#{player.primaryNumber}</span>
                        <div className="w-2 h-2 bg-brand-lime rounded-full animate-pulse"></div>
                      </div>
                      <h4 className="text-white font-bold mb-4">{player.fullName}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {player.stats.map((stat: any, sIdx: number) => (
                          <div key={sIdx}>
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">{stat.label}</p>
                            <p className="text-sm font-mono font-black text-slate-200">{stat.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ─── Below-the-fold widget sections (lazy loaded) ─── */}
          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Predictive Alpha Engine */}
              <BreakoutRadar
                inventory={inventory}
                onCardClick={(card) => { setPredictiveCard(card); setIsPredictiveOpen(true); }}
              />
            </Suspense>
          </LazyErrorBoundary>

          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Multi-Agent Intelligence */}
              <AgentInsightsPanel
                inventory={inventory}
                onCardClick={(card) => { setThesisCard(card); setIsThesisOpen(true); }}
              />
            </Suspense>
          </LazyErrorBoundary>

          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Liquidity Intelligence */}
              <LiquidityHeatmap
                inventory={inventory}
                onCardClick={(card) => { setMarketDepthCard(card); setIsMarketDepthOpen(true); }}
              />
            </Suspense>
          </LazyErrorBoundary>

          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Liquidity Pool */}
              <LiquidityPoolWidget
                inventory={inventory}
                onInstantBuy={(card) => { setInstantBuyCard(card); setIsInstantBuyOpen(true); }}
              />
            </Suspense>
          </LazyErrorBoundary>

          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Fiscal Intelligence */}
              <TaxSummaryWidget
                inventory={inventory}
                onCardClick={(card) => { setTaxLotCard(card); setIsTaxLotOpen(true); }}
              />
            </Suspense>
          </LazyErrorBoundary>

          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Visual Audit Simulation */}
              <GradeAuditWidget
                inventory={inventory}
                onCardClick={(card) => { setGradePredCard(card); setIsGradePredOpen(true); }}
              />
            </Suspense>
          </LazyErrorBoundary>

          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Portfolio Rebalancing */}
              <RebalanceWidget
                inventory={inventory}
                onAlertClick={(alert) => { setRebalAlert(alert); setIsRebalAlertOpen(true); }}
              />
            </Suspense>
          </LazyErrorBoundary>

          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Auction Sniper Intelligence */}
              <AuctionSniperWidget
                inventory={inventory}
                onListingClick={(listing) => {
                  setAuctionListing(listing);
                  getAnalyzeListing().then(fn => setAuctionAnalysis(fn(listing)));
                  setIsAuctionSniperOpen(true);
                }}
              />
            </Suspense>
          </LazyErrorBoundary>

          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Price History Charts */}
              <PriceHistoryWidget
                inventory={inventory}
                onCardClick={(card) => { setPriceHistCard(card); setIsPriceHistOpen(true); }}
              />
            </Suspense>
          </LazyErrorBoundary>

          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Consignment Tracker */}
              <ConsignmentWidget inventory={inventory} />
            </Suspense>
          </LazyErrorBoundary>

          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Collection Achievements */}
              <AchievementWidget
                inventory={inventory}
                onViewAll={() => setIsAchievementOpen(true)}
              />
            </Suspense>
          </LazyErrorBoundary>

          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Market Anomaly Detection */}
              <AnomalyWidget
                inventory={inventory}
                onAnomalyClick={(anomaly) => { setAnomalyDetail(anomaly); setIsAnomalyOpen(true); }}
              />
            </Suspense>
          </LazyErrorBoundary>

          <LazyErrorBoundary compact>
            <Suspense fallback={<WidgetLoadingFallback />}>
              {/* Recents Section */}
              <RecentlyIngested inventory={inventory} />
            </Suspense>
          </LazyErrorBoundary>

          {/* Recents Section */}
          <section className="reveal-section" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bebas tracking-wider flex items-center gap-4">
                <Activity className="text-brand-lime" size={32} />
                Recently Ingested
              </h2>
              <Link to="/collection" className="text-xs font-black text-brand-lime uppercase tracking-widest border-b border-brand-lime/30 hover:border-brand-lime pb-1 transition-all">View All {inventory.length} Assets</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentCards.map(card => {
                const tier = getRarityTier(card);
                const styles = getTierStyles(tier);

                return (
                  <div key={card.id} className={`group bg-brand-slate border ${styles.border} rounded-[2rem] p-6 hover:shadow-xl transition-all flex items-center gap-6 relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${styles.glow || 'from-transparent'} via-transparent to-transparent opacity-30`}></div>

                    <div className={`w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-slate-800 ${styles.border !== 'border-slate-800' ? styles.border : ''} transition-colors relative z-10`}>
                      <CardImage
                        src={card.image}
                        playerName={card.player}
                        year={card.year}
                        manufacturer={card.manufacturer}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold text-lg truncate ${styles.text}`}>{card.player}</h4>
                        {tier !== 'Common' && tier !== 'Uncommon' && (
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${styles.badge}`}>
                            {tier === 'OneOfOne' ? '1/1' : tier}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mb-3 truncate">{card.year} {card.manufacturer} {card.set}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono font-black text-slate-100">${card.purchasePrice.toLocaleString()}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${card.isGraded ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/20' : 'bg-slate-800 text-brand-muted'}`}>
                          {card.isGraded ? `${card.gradingCompany} ${card.grade}` : 'Raw'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        inventory={inventory}
      />

      {/* Morning Briefing Modal */}
      <MorningBriefingModal
        isOpen={showBriefing}
        onClose={() => setShowBriefing(false)}
        inventory={inventory}
      />

      <ShareAlphaModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        alphaScore={alphaScore}
        roi={syncMeta.totalValue > 0 ? ((syncMeta.totalValue - 12000) / 12000) * 100 : 0}
        portfolioName="My Alpha HUD"
      />

      <OCRIngestionModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onSuccess={(card) => {
          const newCard = {
            id: `card-${Date.now()}`,
            purchasePrice: 0,
            purchaseDate: new Date().toISOString(),
            condition: 'Ungraded',
            ...card
          } as any;
          setInventory(prev => [newCard, ...prev]);
        }}
      />

      <NegotiationModal
        isOpen={isNegotiationOpen}
        onClose={() => setIsNegotiationOpen(false)}
        targetItem={negotiationTarget}
        onSuccess={(finalPrice) => {
          // Add to inventory logic here if desired
          logger.log('Acquired for', finalPrice);
        }}
      />
    </div>
  );
};

export default Dashboard;
