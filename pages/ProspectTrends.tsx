
import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Activity,
  Zap,
  RefreshCw,
  ChevronRight,
  Flame,
  Target,
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
  AreaChart,
  Area,
  Tooltip,
  XAxis
} from 'recharts';
import { simulateLeagueTrends } from '../lib/gemini.ts';
import { MiLBProspect } from '../types.ts';

const ProspectTrends: React.FC = () => {
  const [prospects, setProspects] = useState<MiLBProspect[]>([]);
  const [activeLeague, setActiveLeague] = useState<string>('MiLB');
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'hottest' | 'movers' | 'all'>('hottest');

  const fetchTrends = async (leagueOverride?: string) => {
    setIsLoading(true);
    const leagueToFetch = leagueOverride || activeLeague;
    const data = await simulateLeagueTrends(leagueToFetch);
    if (data && data.length > 0) {
      setProspects(data);
      localStorage.setItem(`cardx_trends_${leagueToFetch}`, JSON.stringify(data));
      localStorage.setItem(`cardx_trends_last_updated_${leagueToFetch}`, new Date().toISOString());
    }
    setIsLoading(false);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cardx_trends_${activeLeague}`);
      if (saved) {
        setProspects(JSON.parse(saved));
      } else {
        fetchTrends();
      }
    } catch (e) {
      console.warn('Failed to parse prospect trends', e);
      fetchTrends();
    }
  }, [activeLeague]);

  const hottest = useMemo(() => [...prospects].sort((a, b) => b.trendScore - a.trendScore).slice(0, 10), [prospects]);
  const movers = useMemo(() => [...prospects].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)).slice(0, 10), [prospects]);

  const topProspect = hottest[0];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-[10px] font-black uppercase tracking-widest">
            <Activity size={12} />
            Live Market Simulation
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Discovery <span className="text-brand-lime">Intelligence</span>
          </h1>
          <div className="flex gap-2 p-1 bg-brand-slate border border-slate-800 rounded-xl w-fit mt-4">
            {['NBA', 'MLB', 'MiLB', 'NFL'].map((lg) => (
              <button
                key={lg}
                onClick={() => setActiveLeague(lg)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                ${activeLeague === lg ? 'bg-brand-lime text-brand-charcoal shadow-lg' : 'text-brand-muted hover:text-white'}`}
              >
                {lg}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-tighter">Last Synced ({activeLeague})</p>
            <p className="text-xs font-bold text-white">
              {localStorage.getItem(`cardx_trends_last_updated_${activeLeague}`)
                ? new Date(localStorage.getItem(`cardx_trends_last_updated_${activeLeague}`)!).toLocaleTimeString()
                : 'Never'}
            </p>
          </div>
          <button
            onClick={() => fetchTrends()}
            disabled={isLoading}
            className="group flex items-center gap-3 px-6 py-3 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all disabled:opacity-50 active:scale-95 shadow-xl shadow-brand-lime/10"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />}
            <span className="text-sm uppercase tracking-widest">Neural Refresh</span>
          </button>
        </div>
      </div>

      {/* Featured Breakout Alert */}
      {!isLoading && topProspect && (
        <section className="relative overflow-hidden bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8 md:p-12 mb-12">
          <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-brand-green/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green w-fit">
                <Flame size={16} />
                <span className="text-xs font-black uppercase tracking-widest">Priority Breakout Alert</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl md:text-6xl font-bold text-white group-hover:text-brand-lime transition-colors">
                  {topProspect.name}
                </h2>
                <div className="flex items-center gap-4 text-brand-muted">
                  <span className="font-bold uppercase tracking-widest text-xs">{topProspect.team}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span className="font-bold uppercase tracking-widest text-xs font-mono">{topProspect.league} {topProspect.position}</span>
                </div>
              </div>
              <p className="text-xl text-slate-300 leading-relaxed italic font-medium">
                "{topProspect.summary}"
              </p>
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Impact Score</p>
                  <span className="text-3xl font-bebas text-brand-lime">{topProspect.trendScore}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Velocity</p>
                  <span className="text-3xl font-bebas text-brand-green">+{topProspect.change24h}%</span>
                </div>
              </div>
            </div>
            <div className="h-64 bg-slate-900/50 rounded-3xl border border-slate-800 p-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={topProspect.history7d.map((val, idx) => ({ idx, val }))}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="val" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 p-2 bg-brand-slate border border-slate-800 rounded-2xl w-fit">
        {[
          { id: 'hottest', label: "Today's Hottest", icon: <Flame size={14} /> },
          { id: 'movers', label: 'Biggest Movers', icon: <TrendingUp size={14} /> },
          { id: 'all', label: 'All Players', icon: <Target size={14} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
            ${activeView === tab.id ? 'bg-brand-lime text-brand-charcoal shadow-lg shadow-brand-lime/20' : 'text-brand-muted hover:text-white'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && prospects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-brand-lime/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-brand-lime border-t-transparent rounded-full animate-spin"></div>
            <Zap size={32} className="absolute inset-0 m-auto text-brand-lime animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bebas tracking-widest text-white">AI Neural Syncing...</p>
            <p className="text-sm text-brand-muted font-bold tracking-tighter">Analyzing 1,200+ MiLB search vectors and performance nodes.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {(activeView === 'hottest' ? hottest : activeView === 'movers' ? movers : prospects).map((p, i) => (
            <div key={i} className="group bg-brand-slate border border-slate-800 rounded-[2rem] p-8 hover:border-brand-lime/40 transition-all flex flex-col relative overflow-hidden active:scale-[0.98]">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-800 group-hover:border-brand-lime/50 transition-colors">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-0.5 group-hover:text-brand-lime transition-colors">{p.name}</h3>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest leading-none">
                      {p.team} • {p.league}
                    </p>
                  </div>
                </div>
                <div className={`p-2.5 rounded-xl ${p.trendDirection === 'up' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'}`}>
                  {p.trendDirection === 'up' ? <TrendingUp size={18} /> : <AlertCircle size={18} />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Signal Score</p>
                  <span className="text-3xl font-bebas text-white leading-none">{p.trendScore}</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">24h Shift</p>
                  <span className={`text-xl font-mono font-bold leading-none ${p.change24h >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                    {p.change24h >= 0 ? '+' : ''}{p.change24h}%
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/30">
                  <p className="text-[10px] font-black text-brand-lime mb-2 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} /> Intelligence Cache
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed italic line-clamp-2">
                    "{p.summary}"
                  </p>
                </div>

                <div className="h-16 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={p.history7d.map((val, idx) => ({ idx, val }))}>
                      <YAxis hide domain={['dataMin', 'dataMax']} />
                      <Line type="monotone" dataKey="val" stroke={p.trendDirection === 'up' ? '#22c55e' : '#ef4444'} strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">Market Signal</span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${p.trendScore > 85 ? 'text-brand-lime' : p.trendScore > 65 ? 'text-brand-green' : 'text-slate-400'}`}>
                      {p.trendScore > 85 ? 'Strong Buy' : p.trendScore > 65 ? 'Accumulate' : 'Hold'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
                  <BarChart3 size={12} className="text-brand-lime" />
                  <span className="text-[10px] font-black text-white">{p.breakoutScore}% <span className="text-brand-muted">Breakout</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProspectTrends;
