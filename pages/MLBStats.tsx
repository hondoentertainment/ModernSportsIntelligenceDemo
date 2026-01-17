
import React, { useState, useEffect } from 'react';
import { Trophy, Activity, Search, ChevronRight, User, TrendingUp } from 'lucide-react';
import { getLiveGames, getStandings, searchMLBPlayers } from '../lib/mlbApi.ts';

const MLBStats: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesData, standingsData] = await Promise.all([
          getLiveGames(),
          getStandings()
        ]);
        setGames(gamesData);
        setStandings(standingsData);
      } catch (error) {
        console.error("MLB API Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const interval = setInterval(fetchData, 30000); // Refresh games every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;
    const results = await searchMLBPlayers(searchQuery);
    setSearchResults(results);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bebas tracking-tight text-white mb-2">MLB Intelligence Hub</h1>
          <p className="text-brand-muted max-w-2xl">Real-time stats, live game tracking, and player scouting analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bebas tracking-wider flex items-center gap-3">
                <Activity className="text-brand-lime" size={24} />
                Live Scoreboard
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-brand-lime/10 rounded-lg">
                <div className="w-2 h-2 bg-brand-lime rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Auto-Refresh On</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.length > 0 ? games.map((game, i) => (
                <div key={i} className="bg-brand-slate border border-slate-800 rounded-3xl p-5 hover:border-brand-lime/30 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{game.status.detailedState}</span>
                    <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">{game.venue.name}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center font-bold text-xs">
                          {game.teams.away.team.name.charAt(0)}
                        </div>
                        <span className="font-bold text-sm">{game.teams.away.team.name}</span>
                      </div>
                      <span className="text-2xl font-mono font-black text-white">{game.teams.away.score || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center font-bold text-xs">
                          {game.teams.home.team.name.charAt(0)}
                        </div>
                        <span className="font-bold text-sm">{game.teams.home.team.name}</span>
                      </div>
                      <span className="text-2xl font-mono font-black text-white">{game.teams.home.score || 0}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-10 bg-brand-charcoal/50 rounded-3xl border border-dashed border-slate-800 text-center">
                  <p className="text-brand-muted font-bold">No games scheduled for today.</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bebas tracking-wider mb-6 flex items-center gap-3">
              <TrendingUp className="text-brand-lime" size={24} />
              Division Standings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {standings.slice(0, 4).map((record, i) => (
                <div key={i} className="bg-brand-slate border border-slate-800 rounded-3xl p-6">
                  <h3 className="text-lg font-bebas tracking-widest text-brand-lime mb-4">{record.division.name}</h3>
                  <div className="space-y-3">
                    {record.teamRecords.slice(0, 5).map((team: any, j: number) => (
                      <div key={j} className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-200">{j+1}. {team.team.name}</span>
                        <span className="font-mono text-xs font-bold text-brand-muted">{team.wins}-{team.losses}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bebas tracking-wider mb-6 flex items-center gap-3">
              <Search className="text-brand-lime" size={24} />
              Player Scout
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Lookup active player..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-brand-slate border border-slate-800 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-brand-lime"
                />
                <button 
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-lime text-brand-charcoal rounded-xl"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="space-y-2 mt-6">
                {searchResults.map((player) => (
                  <div key={player.id} className="p-4 bg-brand-slate border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-brand-lime/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
                        <User className="text-brand-muted" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold group-hover:text-white">{player.fullName}</p>
                        <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest">#{player.primaryNumber} • {player.primaryPosition.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MLBStats;
