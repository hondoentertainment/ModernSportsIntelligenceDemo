
import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Search,
  ChevronRight,
  TrendingUp,
  Zap,
  Newspaper,
  MapPin,
  Radio,
} from 'lucide-react';
import {
  getLiveGames,
  getStandings,
  searchMLBPlayers,
  getProbablePitchers,
  getAthleteHeadshotUrl,
} from '../lib/utils/mlbApi.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { logger } from '../lib/logger';

const MLBStats: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [_probables, setProbables] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGameIndex, setActiveGameIndex] = useState(0);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesData, standingsData, probablesData] = await Promise.all([
          getLiveGames(),
          getStandings(),
          getProbablePitchers()
        ]);
        setGames(gamesData);
        setStandings(standingsData);
        setProbables(probablesData);
      } catch (error) {
        logger.error("MLB API Error:", error);
        addToast('error', 'MLB data unavailable. Check back later.', { dedupeKey: 'mlb_api' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const results = await searchMLBPlayers(searchQuery);
      setSearchResults(results);
    } catch  {
      addToast('error', 'Player search failed. Try again.', { dedupeKey: 'mlb_search' });
    }
  };

  const activeGame = useMemo(() => games[activeGameIndex] || null, [games, activeGameIndex]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-lime/10 border border-brand-lime/20 rounded-full mb-2">
            <Radio size={12} className="text-brand-lime animate-pulse" />
            <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Live PressBox Link Active</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            MLB <span className="text-brand-lime">Intelligence Hub</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">Real-time stats, press-box telemetry, and player scouting analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Live Scores & Standings */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bebas tracking-wider flex items-center gap-3">
                <Activity className="text-brand-lime" size={24} />
                Live Scoreboard
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-brand-lime/10 rounded-lg">
                <div className="w-2 h-2 bg-brand-lime rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Real-time Feed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {games.length > 0 ? games.map((game, i) => (
                <div
                  key={i}
                  onClick={() => setActiveGameIndex(i)}
                  className={`bg-brand-slate border rounded-3xl p-5 transition-all cursor-pointer group ${activeGameIndex === i ? 'border-brand-lime ring-1 ring-brand-lime/50' : 'border-slate-800 hover:border-slate-700'}`}
                >
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
                        <span className="font-bold text-sm text-slate-200">{game.teams.away.team.name}</span>
                      </div>
                      <span className="text-2xl font-mono font-black text-white">{game.teams.away.score ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center font-bold text-xs">
                          {game.teams.home.team.name.charAt(0)}
                        </div>
                        <span className="font-bold text-sm text-slate-200">{game.teams.home.team.name}</span>
                      </div>
                      <span className="text-2xl font-mono font-black text-white">{game.teams.home.score ?? 0}</span>
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
                <div key={i} className="bg-brand-slate border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-colors">
                  <h3 className="text-lg font-bebas tracking-widest text-brand-lime mb-4">{record.division.name}</h3>
                  <div className="space-y-3">
                    {record.teamRecords.slice(0, 5).map((team: any, j: number) => (
                      <div key={j} className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-200">{j + 1}. {team.team.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-brand-muted">{team.wins}-{team.losses}</span>
                          <span className={`text-[10px] font-black ${team.winningPercentage >= 0.5 ? 'text-brand-green' : 'text-brand-red'}`}>
                            .{Math.round(team.winningPercentage * 1000)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: PressBox Live & Player Search */}
        <div className="lg:col-span-2 space-y-8">
          {/* PressBox Component */}
          <section className="bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Newspaper size={120} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bebas tracking-wider text-white">PressBox <span className="text-brand-lime">Live</span></h2>
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Game Notes & Telemetry</p>
                </div>
                <div className="px-3 py-1 bg-brand-charcoal border border-slate-800 rounded-full text-[10px] font-black text-brand-blue uppercase tracking-widest">
                  Verified Feed
                </div>
              </div>

              {activeGame ? (
                <div className="space-y-6">
                  <div className="p-4 bg-brand-slate/40 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-3 text-brand-lime">
                      <MapPin size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">{activeGame.venue.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Away Starter</p>
                        <div className="flex items-center gap-2">
                          {activeGame.teams.away.probablePitcher ? (
                            <img
                              src={getAthleteHeadshotUrl(activeGame.teams.away.probablePitcher.id, 'small')}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 bg-slate-900"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">RHP</div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-white">{activeGame.teams.away.probablePitcher?.fullName || 'TBD'}</p>
                            <p className="text-[8px] text-brand-muted font-black uppercase">Probable</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Home Starter</p>
                        <div className="flex items-center gap-2">
                          {activeGame.teams.home.probablePitcher ? (
                            <img
                              src={getAthleteHeadshotUrl(activeGame.teams.home.probablePitcher.id, 'small')}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-700 bg-slate-900"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">LHP</div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-white">{activeGame.teams.home.probablePitcher?.fullName || 'TBD'}</p>
                            <p className="text-[8px] text-brand-muted font-black uppercase">Probable</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-brand-orange" />
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">Live Momentum</h4>
                    </div>
                    <div className="bg-brand-slate rounded-2xl p-4 border border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400">Win Probability</span>
                        <span className="text-xs font-mono font-bold text-brand-lime">54% Home</span>
                      </div>
                      <div className="h-1.5 w-full bg-brand-charcoal rounded-full overflow-hidden flex">
                        <div className="h-full bg-slate-700" style={{ width: '46%' }}></div>
                        <div className="h-full bg-brand-lime" style={{ width: '54%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button className="w-full py-4 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand-lime/10">
                      Deep Scouting Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <Activity size={48} className="mx-auto text-slate-800 mb-4 animate-pulse" />
                  <p className="text-brand-muted font-bold">Select a game to hydrate PressBox data.</p>
                </div>
              )}
            </div>
          </section>

          {/* Player Search Section */}
          <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bebas tracking-wider mb-6 flex items-center gap-3 text-white">
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
                  className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-3 pl-4 pr-12 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-lime transition-all"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-lime hover:bg-white text-brand-charcoal rounded-xl transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="space-y-2 mt-6">
                {searchResults.length > 0 ? searchResults.map((player) => (
                  <div key={player.id} className="p-4 bg-brand-charcoal border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-brand-lime/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <img
                        src={getAthleteHeadshotUrl(player.id, 'small')}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border border-slate-700 bg-slate-900"
                      />
                      <div>
                        <p className="text-sm font-bold group-hover:text-brand-lime transition-colors">{player.fullName}</p>
                        <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest">#{player.primaryNumber} • {player.primaryPosition.name}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-brand-lime transition-colors" />
                  </div>
                )) : searchQuery && !isLoading && (
                  <p className="text-center py-4 text-xs font-bold text-brand-muted uppercase tracking-widest">No intelligence found.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MLBStats;
