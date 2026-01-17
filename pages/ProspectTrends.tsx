
import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Zap, RefreshCw, ChevronRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { simulateMiLBTrends } from '../lib/gemini.ts';
import { MiLBProspect } from '../types.ts';

const ProspectTrends: React.FC = () => {
  const [prospects, setProspects] = useState<MiLBProspect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'hottest' | 'movers' | 'all'>('hottest');

  const fetchTrends = async () => {
    setIsLoading(true);
    const data = await simulateMiLBTrends();
    if (data && data.length > 0) {
      setProspects(data);
      localStorage.setItem('cardx_prospect_trends', JSON.stringify(data));
      localStorage.setItem('cardx_trends_last_updated', new Date().toISOString());
    }
    setIsLoading(false);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cardx_prospect_trends');
      if (saved) {
        setProspects(JSON.parse(saved));
      } else {
        fetchTrends();
      }
    } catch (e) {
      console.warn('Failed to parse prospect trends', e);
      fetchTrends();
    }
  }, []);

  const hottest = [...prospects].sort((a, b) => b.trendScore - a.trendScore).slice(0, 10);
  const movers = [...prospects].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)).slice(0, 10);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bebas tracking-tight text-white mb-2">MiLB Prospect Intelligence</h1>
          <p className="text-brand-muted max-w-2xl">AI-simulated search interest trends for the top 100 minor league stars.</p>
        </div>
        <button 
          onClick={fetchTrends}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-slate border border-slate-700 hover:border-brand-lime/50 text-brand-lime font-bold rounded-xl transition-all disabled:opacity-50"
        >
          {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          Refresh Trends
        </button>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-brand-slate border border-slate-800 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveView('hottest')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
          ${activeView === 'hottest' ? 'bg-brand-lime text-brand-charcoal' : 'text-brand-muted hover:text-white'}`}
        >
          Today's Hottest
        </button>
        <button 
          onClick={() => setActiveView('movers')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
          ${activeView === 'movers' ? 'bg-brand-lime text-brand-charcoal' : 'text-brand-muted hover:text-white'}`}
        >
          Biggest Movers
        </button>
        <button 
          onClick={() => setActiveView('all')}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
          ${activeView === 'all' ? 'bg-brand-lime text-brand-charcoal' : 'text-brand-muted hover:text-white'}`}
        >
          All Players
        </button>
      </div>

      {isLoading && prospects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <div className="w-12 h-12 border-4 border-brand-lime border-t-transparent rounded-full animate-spin"></div>
           <p className="text-brand-muted font-bold animate-pulse">AI is analyzing MiLB search patterns...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeView === 'hottest' ? hottest : activeView === 'movers' ? movers : prospects).map((p, i) => (
            <div key={i} className="group bg-brand-slate border border-slate-800 rounded-3xl p-6 hover:border-brand-lime/30 transition-all flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-0.5">{p.name}</h3>
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{p.team} • {p.position} • {p.league}</p>
                </div>
                <div className={`p-2 rounded-xl ${p.trendDirection === 'up' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'}`}>
                  {p.trendDirection === 'up' ? <TrendingUp size={20} /> : <Zap size={20} />}
                </div>
              </div>

              <div className="flex items-end justify-between mb-6">
                <div>
                   <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Trend Score</p>
                   <span className="text-4xl font-bebas font-bold text-white">{p.trendScore}</span>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">24h Change</p>
                   <span className={`text-xl font-mono font-bold ${p.change24h >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                     {p.change24h >= 0 ? '+' : ''}{p.change24h}%
                   </span>
                </div>
              </div>

              <div className="h-20 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={p.history7d.map((val, idx) => ({ idx, val }))}>
                    <YAxis hide domain={['dataMin', 'dataMax']} />
                    <Line type="monotone" dataKey="val" stroke={p.trendDirection === 'up' ? '#22c55e' : '#ef4444'} strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Activity size={14} className="text-brand-lime" />
                    <span className="text-[10px] font-black uppercase text-brand-muted">Signal: {p.trendScore > 80 ? 'Buy' : p.trendScore > 50 ? 'Watch' : 'Hold'}</span>
                 </div>
                 <ChevronRight size={16} className="text-slate-600 group-hover:text-brand-lime transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProspectTrends;
