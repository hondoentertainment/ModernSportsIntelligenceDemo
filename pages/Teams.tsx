
import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, BarChart, ShieldAlert, Filter, Search, ChevronDown } from 'lucide-react';
import { MOCK_TEAMS } from '../constants.tsx';

const Teams: React.FC = () => {
  const [leagueFilter, setLeagueFilter] = useState<string>('All');
  const [confFilter, setConfFilter] = useState<string>('All');
  const [divFilter, setDivFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTeams = useMemo(() => {
    return MOCK_TEAMS.filter(team => {
      const matchesLeague = leagueFilter === 'All' || team.league === leagueFilter;
      const matchesConf = confFilter === 'All' || team.conference === confFilter;
      const matchesDiv = divFilter === 'All' || team.division === divFilter;
      const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLeague && matchesConf && matchesDiv && matchesSearch;
    });
  }, [leagueFilter, confFilter, divFilter, searchQuery]);

  const leagues = useMemo(() => ['All', ...Array.from(new Set(MOCK_TEAMS.map(t => t.league)))], []);
  const conferences = useMemo(() => ['All', ...Array.from(new Set(MOCK_TEAMS.map(t => t.conference)))], []);
  const divisions = useMemo(() => ['All', ...Array.from(new Set(MOCK_TEAMS.map(t => t.division)))], []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-white">Teams Intelligence</h1>
          <p className="text-brand-muted max-w-2xl">Decoding systems, tactical trends, and momentum shifts across the league.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search teams..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-lime w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase tracking-wider">
          <Filter size={14} className="text-brand-lime" />
          Quick Filters
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <select 
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-brand-lime"
          >
            {leagues.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredTeams.map((team) => (
          <div key={team.id} className="bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 hover:border-brand-lime/50 transition-all group">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-24 h-24 mb-4 p-4 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center justify-center">
                <img src={team.logo} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 space-y-4">
                <h2 className="text-3xl font-bold">{team.name}</h2>
                <p className="text-slate-400 italic leading-relaxed">"{team.summary}"</p>
                <div className="flex gap-4 pt-2">
                  <div className="flex-1 p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center">
                    <p className="text-[10px] font-bold text-brand-muted uppercase mb-1">Momentum</p>
                    <div className="flex items-center justify-center gap-2">
                       {team.momentum === 'up' ? <TrendingUp className="text-brand-green" size={18} /> : <BarChart className="text-slate-400" size={18} />}
                       <span className="font-bold text-sm uppercase">{team.momentum}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
