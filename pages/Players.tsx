
import React, { useState, useMemo } from 'react';
import { Filter, Search, ArrowUpRight, ArrowDownRight, MoreHorizontal, Zap, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_PLAYERS } from '../constants.tsx';

const Players: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlayers = useMemo(() => {
    return MOCK_PLAYERS.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            player.team.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeFilter === 'All') return matchesSearch;
      if (activeFilter === 'Hot Breakouts') return matchesSearch && player.breakoutScore > 80;
      if (activeFilter === 'Usage Shifts') return matchesSearch && player.trend > 0;
      if (activeFilter === 'Consistency') return matchesSearch && player.intelligenceScore > 93;
      
      return matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Player Intelligence</h1>
          <p className="text-brand-muted max-w-2xl">Spotting performance breakouts and usage anomalies before they hit the mass market.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
            <input 
              type="text" 
              placeholder="Filter players..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-teal w-full md:w-64"
            />
          </div>
          <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-brand-muted hover:text-white transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 pb-2 overflow-x-auto no-scrollbar">
        {['All', 'Hot Breakouts', 'Usage Shifts', 'Consistency'].map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border tracking-wide uppercase
              ${activeFilter === tag 
                ? 'bg-brand-lime border-brand-lime text-brand-charcoal shadow-lg shadow-brand-lime/20' 
                : 'bg-slate-900 border-slate-800 text-brand-muted hover:border-slate-700'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlayers.length > 0 ? filteredPlayers.map((player) => (
          <Link 
            to={`/players/${player.id}`} 
            key={player.id} 
            className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-brand-lime/40 transition-all flex flex-col relative"
          >
            {player.breakoutScore > 80 && (
              <div className="absolute top-4 right-4 z-10 p-2 bg-brand-green/10 text-brand-green rounded-xl border border-brand-green/20 flex items-center gap-1.5 animate-pulse">
                <Flame size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Surge</span>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={player.image} alt={player.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-800" />
                    <div className="absolute -bottom-1 -right-1 bg-brand-lime text-brand-charcoal p-1 rounded-lg border-2 border-slate-900 shadow-md">
                      <Zap size={10} fill="currentColor" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold group-hover:text-brand-lime transition-colors mb-0.5">{player.name}</h2>
                    <p className="text-xs text-brand-muted font-bold tracking-widest uppercase">{player.team} • {player.position}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-8">
                {player.stats.map((s, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-2xl border border-slate-800/50">
                    <p className="text-[10px] text-brand-muted font-bold mb-1 uppercase tracking-tighter">{s.label}</p>
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-bold">{s.value}</span>
                      <span className={`text-[10px] font-bold ${s.change.startsWith('+') ? 'text-brand-green' : 'text-red-400'}`}>
                        {s.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/30">
                <p className="text-[10px] font-black text-brand-lime mb-2 uppercase tracking-widest flex items-center gap-2">
                  <MoreHorizontal size={14} /> Brief Intelligence
                </p>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{player.summary}"
                </p>
              </div>
            </div>
            
            <div className="mt-auto px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex flex-col">
                <p className="text-[10px] text-brand-muted font-bold uppercase tracking-tight">Breakout Confidence</p>
                <div className={`flex items-center gap-1.5 text-sm font-black ${player.breakoutScore > 75 ? 'text-brand-green' : 'text-slate-100'}`}>
                   {player.breakoutScore}%
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${player.trend > 0 ? 'bg-brand-green/10 text-brand-green' : 'bg-red-400/10 text-red-400'}`}>
                {player.trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(player.trend)}% Surge
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Players;
