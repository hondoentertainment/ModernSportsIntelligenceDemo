
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
  Clock
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
  Bar
} from 'recharts';
import { MOCK_CARDS, MOCK_INVENTORY_SUMMARY } from '../constants.tsx';
import { syncPortfolio, SyncProgress } from '../lib/marketSync.ts';
import { useInventory, calculateStats } from '../lib/useInventory.ts';
import { useAlerts } from '../lib/useAlerts.ts';
import ReportModal from '../components/ReportModal.tsx';
import MorningBriefingModal from '../components/MorningBriefingModal.tsx';
import { getRarityTier, getTierStyles } from '../lib/rarity.ts';

const Dashboard: React.FC = () => {
  // Shared inventory state
  const { inventory, setInventory, syncMeta, setSyncMeta, initializeFullInventory } = useInventory();
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const { syncComplete: createSyncAlert } = useAlerts();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);

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

    // Reset progress after a delay
    setTimeout(() => setSyncProgress(null), 3000);
  }, [inventory, setInventory, createSyncAlert]);

  const isSyncing = syncProgress?.status === 'syncing';
  const syncComplete = syncProgress?.status === 'complete';

  const chartData = [
    { name: 'Oct', val: 12500 },
    { name: 'Nov', val: 13800 },
    { name: 'Dec', val: 14200 },
    { name: 'Jan', val: 15900 },
    { name: 'Feb', val: MOCK_INVENTORY_SUMMARY.marketValue },
  ];

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
        /* Onboarding Hero State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-8">
          <div className="p-8 bg-brand-lime/10 rounded-full animate-pulse ring-4 ring-brand-lime/5">
            <Sparkles size={64} className="text-brand-lime" />
          </div>
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
              Initialize <span className="text-brand-lime">Portfolio</span>
            </h1>
            <p className="text-xl text-brand-muted font-medium leading-relaxed">
              Your intelligence hub is ready. Begin by adding your first asset to unlock real-time valuation, trend analysis, and liquidity alerts.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/collection" className="px-10 py-5 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all shadow-2xl shadow-brand-lime/20 flex items-center gap-3 uppercase tracking-widest text-sm active:scale-95 group">
              <Package size={20} strokeWidth={3} />
              Add First Asset
              <ArrowUpRight size={20} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            <button
              onClick={() => initializeFullInventory()}
              className="px-10 py-5 bg-brand-charcoal hover:bg-slate-800 border border-slate-700 text-white font-black rounded-2xl transition-all flex items-center gap-3 uppercase tracking-widest text-sm active:scale-95"
            >
              <Zap size={20} /> Load Demo Data
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12 opacity-50 pointer-events-none grayscale">
            {/* Placeholders to show what's coming */}
            <div className="h-40 bg-brand-slate border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
              <div className="w-10 h-10 bg-brand-charcoal rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-2 w-1/3 bg-brand-charcoal rounded-full"></div>
                <div className="h-8 w-1/2 bg-brand-charcoal rounded-xl"></div>
              </div>
            </div>
            <div className="h-40 bg-brand-slate border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
              <div className="w-10 h-10 bg-brand-charcoal rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-2 w-1/3 bg-brand-charcoal rounded-full"></div>
                <div className="h-8 w-2/3 bg-brand-charcoal rounded-xl"></div>
              </div>
            </div>
            <div className="h-40 bg-brand-slate border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
              <div className="w-10 h-10 bg-brand-charcoal rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-2 w-1/3 bg-brand-charcoal rounded-full"></div>
                <div className="h-8 w-1/2 bg-brand-charcoal rounded-xl"></div>
              </div>
            </div>
          </div>
          <p className="text-xs font-black text-brand-muted uppercase tracking-widest mt-4">Unlocking Analytics Engine...</p>
        </div>
      ) : (
        <>
          {/* Hero Financial Summary */}
          <section className="relative overflow-hidden bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-brand-lime/5">
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

          {/* League Intelligence Hub */}
          <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 md:p-12">
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
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Market Sentiment</p>
                    <p className="text-sm text-slate-200 leading-relaxed italic">
                      "{leagueInsights[activeLeague as keyof typeof leagueInsights] || 'Stable market conditions observed.'}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-black uppercase text-brand-lime">
                    <span>Signal: Accumulate</span>
                    <Activity size={12} />
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
                  <p className="text-[10px] text-brand-muted font-bold mt-2 leading-tight">Optimal liquidity window predicted in 14 days.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <section>
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
    </div>
  );
};

export default Dashboard;
