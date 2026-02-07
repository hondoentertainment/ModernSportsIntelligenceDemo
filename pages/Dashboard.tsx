
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
  CheckCircle2,
  Clock,
  Camera,
  Share2,
  FileDown
} from 'lucide-react';

import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
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
  PolarRadiusAxis
} from 'recharts';
import { calculateAlphaScore, getCollectorTier, getPortfolioDNA } from '../lib/analytics.ts';
import { generatePortfolioSentiment } from '../lib/gemini.ts';
import { detectSignals } from '../lib/signals.ts';
import { MOCK_CARDS, MOCK_INVENTORY_SUMMARY } from '../constants.tsx';
import { syncPortfolio, SyncProgress } from '../lib/marketSync.ts';
import { useInventory, calculateStats } from '../lib/useInventory.ts';
import { useAlerts } from '../lib/useAlerts.ts';
import ReportModal from '../components/ReportModal.tsx';
import MorningBriefingModal from '../components/MorningBriefingModal.tsx';
import ShareAlphaModal from '../components/ShareAlphaModal.tsx';
import OCRIngestionModal from '../components/OCRIngestionModal.tsx';
import { getRarityTier, getTierStyles } from '../lib/rarity.ts';
import { getHistoricalDelta } from '../lib/marketHistory.ts';
import { StatsService } from '../lib/statsService.ts';
import { generatePortfolioReport } from '../lib/pdfExport.ts';
import { getPortfolioNAVHistory } from '../lib/priceHistory.ts';

const Dashboard: React.FC = () => {
  // Shared inventory state
  const {
    inventory,
    targets,
    setInventory,
    syncMeta,
    setSyncMeta,
    initializeFullInventory
  } = useInventory();

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

  // Identity Metrics
  const alphaScore = useMemo(() => calculateAlphaScore(inventory), [inventory]);
  const tier = useMemo(() => getCollectorTier(alphaScore), [alphaScore]);
  const dnaData = useMemo(() => getPortfolioDNA(inventory), [inventory]);
  const signals = useMemo(() => detectSignals(targets, inventory), [targets, inventory]);
  const [marketSentiment, setMarketSentiment] = useState('Analyzing portfolio alpha signals...');

  // Fetch Sentiment
  useEffect(() => {
    if (inventory.length > 0) {
      generatePortfolioSentiment(inventory).then(setMarketSentiment);
    }
  }, [inventory]);

  // Morning Briefing Logic
  useEffect(() => {
    const lastSeen = localStorage.getItem('lastMorningBriefing');
    const today = new Date().toDateString();

    // Show if we haven't seen it today and have inventory
    if (lastSeen !== today && inventory.length > 0) {
      // Delay slightly for effect
      const timer = setTimeout(() => {
        setShowBriefing(true);
        localStorage.setItem('lastMorningBriefing', today);
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

    // Create alert for sync completion
    createSyncAlert(result.updatedCount, result.totalValue, result.duration);

    // Check for significant delta to trigger momentum alert
    const delta = getHistoricalDelta();
    if (delta && Math.abs(delta.gainPercent) > 0.1) {
      createMomentumAlert(delta.gainValue, delta.gainPercent, delta.isPositive);
    }

    // Reset progress after a delay
    setTimeout(() => setSyncProgress(null), 3000);
  }, [inventory, setInventory, createSyncAlert]);

  const isSyncing = syncProgress?.status === 'syncing';
  const syncComplete = syncProgress?.status === 'complete';

  // Portfolio NAV history - use real data if available, fallback to mock
  const chartData = useMemo(() => {
    const realHistory = getPortfolioNAVHistory(5);
    if (realHistory.length >= 2) {
      return realHistory;
    }
    // Fallback to mock data for new users
    return [
      { name: 'Oct', val: 12500 },
      { name: 'Nov', val: 13800 },
      { name: 'Dec', val: 14200 },
      { name: 'Jan', val: 15900 },
      { name: 'Feb', val: MOCK_INVENTORY_SUMMARY.marketValue },
    ];
  }, [syncMeta.lastSyncTime]);

  const recentCards = inventory.slice(-3).reverse();

  const sportData = useMemo(() => {
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

  const [activeLeague, setActiveLeague] = React.useState<string>('MLB');

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

  const leagueInsights = {
    MLB: "Market is stabilizing after off-season volatility. High demand for pristine vintage assets.",
    MiLB: "Scouting velocity is up 14%. Focus on AAA breakouts before summer call-ups.",
    NBA: "Liquidity peaking as playoffs approach. Star potential drives extreme parity in mid-tier assets.",
    NFL: "Seasonal cooldown in effect. Prime accumulation window for defensive anchors and rookie QB variants."
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-12">
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
        <>
          {/* Hero Financial Summary */}
          <section className="reveal-section relative overflow-hidden bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-brand-lime/5">
            <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-brand-lime/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="relative flex flex-col lg:flex-row gap-12 items-center justify-between">
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-[10px] font-black uppercase tracking-[0.2em]">
                  <Sparkles size={14} />
                  Portfolio Intelligence Active
                </div>
                <h1 className="text-5xl md:text-8xl font-bebas tracking-tight text-white leading-[0.85]">
                  Net Asset <span className="text-brand-lime">Value</span>
                </h1>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-5xl md:text-6xl font-mono font-bold text-white mb-2">
                    ${MOCK_INVENTORY_SUMMARY.marketValue.toLocaleString()}
                  </span>
                  <p className="text-brand-muted text-lg leading-relaxed max-w-xl font-medium">
                    Your portfolio holds <span className="text-brand-green font-bold">{MOCK_CARDS.length} unique assets</span> with a total ROI of <span className="text-brand-green font-bold">{MOCK_INVENTORY_SUMMARY.roi}%</span>.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                  <Link to="/collection" className="px-10 py-4 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all shadow-xl shadow-brand-lime/20 flex items-center gap-3 uppercase tracking-widest text-xs active:scale-95">
                    Manage Inventory <ArrowUpRight size={18} strokeWidth={3} />
                  </Link>
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={`px-10 py-4 border font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center gap-3 active:scale-95 ${isSyncing ? 'bg-brand-slate border-brand-lime/50 text-brand-lime cursor-wait' : syncComplete ? 'bg-brand-green/20 border-brand-green text-brand-green' : 'bg-brand-slate hover:bg-slate-800 border-slate-700 text-white'}`}
                  >
                    {isSyncing ? (
                      <><RefreshCw size={18} className="animate-spin" /> Syncing {syncProgress?.current}/{syncProgress?.total}...</>
                    ) : syncComplete ? (
                      <><CheckCircle2 size={18} /> Sync Complete</>
                    ) : (
                      <><RefreshCw size={18} /> Trigger Market Sync</>
                    )}
                  </button>
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="px-10 py-4 bg-brand-slate hover:bg-slate-800 border border-slate-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center gap-3 active:scale-95"
                  >
                    <Package size={18} /> Performance Report
                  </button>
                  <button
                    onClick={() => generatePortfolioReport(inventory, 'Collector')}
                    className="px-10 py-4 bg-brand-charcoal hover:bg-slate-800 border border-slate-700 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center gap-3 active:scale-95"
                  >
                    <FileDown size={18} /> Export PDF
                  </button>
                  <button
                    onClick={() => setIsScanOpen(true)}
                    className="px-10 py-4 bg-brand-charcoal hover:bg-slate-800 border border-brand-lime text-brand-lime font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center gap-3 active:scale-95 shadow-lg shadow-brand-lime/10"
                  >
                    <Camera size={18} /> AI Scan Asset
                  </button>

                  <button
                    onClick={() => setIsShareOpen(true)}
                    className="px-6 py-4 bg-brand-blue/10 hover:bg-brand-blue/20 border border-brand-blue/30 text-brand-blue font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center gap-3 active:scale-95"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
                {syncMeta.lastSyncTime && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-widest pt-2">
                    <Clock size={12} /> Last Sync: {new Date(syncMeta.lastSyncTime).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="w-full lg:w-[480px] bg-brand-slate/40 backdrop-blur-xl rounded-[2rem] border border-white/5 p-8">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Growth Velocity</p>
                  <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">+12.4% MONTHLY</span>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D9F99D" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#D9F99D" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: '16px', fontSize: '12px' }}
                        itemStyle={{ color: '#D9F99D' }}
                      />
                      <Area type="monotone" dataKey="val" stroke="#D9F99D" fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          {/* Portfolio Identity HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="lg:col-span-1 bg-brand-slate border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl shadow-brand-lime/5">
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

            <div className="lg:col-span-2 bg-brand-slate border border-slate-800 rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl shadow-brand-teal/5">
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
          </div>

          {/* Strategic Signals Feed */}
          <div className="reveal-section bg-brand-charcoal/50 border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden relative shadow-2xl shadow-brand-blue/5 animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '400ms' }}>
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

            {signals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {signals.map((signal, i) => (
                  <div key={signal.id} className="p-6 bg-brand-slate border border-slate-800 rounded-2xl relative overflow-hidden group hover:border-brand-blue/40 transition-all">
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

          {/* League Intelligence Hub */}
          <section className="reveal-section bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 md:p-12" style={{ animationDelay: '200ms' }}>
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

          {/* Main Stats Grid */}
          <div className="reveal-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ animationDelay: '400ms' }}>
            <div className="bg-brand-slate border border-slate-800 p-8 rounded-[2rem] group hover:border-brand-lime/30 transition-all">
              <div className="w-12 h-12 bg-brand-lime/10 rounded-2xl flex items-center justify-center text-brand-lime mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Total ROI</p>
              <p className="text-3xl font-mono font-bold text-brand-green">+{MOCK_INVENTORY_SUMMARY.roi}%</p>
            </div>
            <div className="bg-brand-slate border border-slate-800 p-8 rounded-[2rem] group hover:border-brand-lime/30 transition-all">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange mb-4 group-hover:scale-110 transition-transform">
                <CreditCard size={24} />
              </div>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Paper Gains</p>
              <p className="text-3xl font-mono font-bold text-white">${MOCK_INVENTORY_SUMMARY.totalGain.toLocaleString()}</p>
            </div>
            <div className="bg-brand-slate border border-slate-800 p-8 rounded-[2rem] group hover:border-brand-lime/30 transition-all">
              <div className="w-12 h-12 bg-brand-lime/10 rounded-2xl flex items-center justify-center text-brand-lime mb-4 group-hover:scale-110 transition-transform">
                <Layers size={24} />
              </div>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Portfolio Deepness</p>
              <p className="text-3xl font-mono font-bold text-white">{MOCK_CARDS.length} Assets</p>
            </div>
            <div className="bg-brand-slate border border-slate-800 p-8 rounded-[2rem] group hover:border-brand-lime/30 transition-all">
              <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-4 group-hover:scale-110 transition-transform">
                <Package size={24} />
              </div>
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Avg. Asset Value</p>
              <p className="text-3xl font-mono font-bold text-white">
                ${Math.round(MOCK_INVENTORY_SUMMARY.marketValue / MOCK_CARDS.length).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Recents Section */}
          <section className="reveal-section" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bebas tracking-wider flex items-center gap-4">
                <Activity className="text-brand-lime" size={32} />
                Recently Ingested
              </h2>
              <Link to="/collection" className="text-xs font-black text-brand-lime uppercase tracking-widest border-b border-brand-lime/30 hover:border-brand-lime pb-1 transition-all">View All 131 Cards</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentCards.map(card => {
                const tier = getRarityTier(card);
                const styles = getTierStyles(tier);

                return (
                  <div key={card.id} className={`group bg-brand-slate border ${styles.border} rounded-[2rem] p-6 hover:shadow-xl transition-all flex items-center gap-6 relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${styles.glow || 'from-transparent'} via-transparent to-transparent opacity-30`}></div>

                    <div className={`w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-slate-800 ${styles.border !== 'border-slate-800' ? styles.border : ''} transition-colors relative z-10`}>
                      <img src={card.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
        </>
      )
      }

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
    </div >
  );
};

export default Dashboard;
