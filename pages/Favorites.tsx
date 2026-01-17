
import React, { useState, useEffect } from 'react';
import { Star, Search, Trash2, User, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { searchMLBPlayers } from '../lib/mlbApi.ts';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cardx_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Error parsing favorites", e);
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    localStorage.setItem('cardx_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    const results = await searchMLBPlayers(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const toggleFavorite = (player: any) => {
    setFavorites(prev => {
      const exists = prev.find(p => p.id === player.id);
      if (exists) {
        return prev.filter(p => p.id !== player.id);
      }
      return [player, ...prev];
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bebas tracking-tight text-white mb-2">Watchlist Hub</h1>
          <p className="text-brand-muted max-w-2xl">Curate and track your primary scouting interests across Major League Baseball.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bebas tracking-wider flex items-center gap-3">
              <Star className="text-brand-lime fill-brand-lime" size={24} />
              Tracked Stars
            </h2>
            <div className="flex gap-2">
               <button className="p-2 bg-brand-slate border border-slate-800 rounded-lg text-brand-lime"><LayoutGrid size={18} /></button>
               <button className="p-2 bg-brand-slate border border-slate-800 rounded-lg text-brand-muted"><List size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favorites.length > 0 ? favorites.map((player) => (
              <div key={player.id} className="group bg-brand-slate border border-slate-800 rounded-3xl p-5 hover:border-brand-lime/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-bold text-lg border border-slate-800 group-hover:bg-brand-lime/10 transition-colors">
                      <User className="text-brand-muted group-hover:text-brand-lime" size={24} />
                   </div>
                   <div>
                      <h3 className="font-bold text-white">{player.fullName}</h3>
                      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{player.currentTeam?.name} • {player.primaryPosition?.name}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-brand-muted hover:text-white transition-colors">
                    <ChevronRight size={18} />
                  </button>
                  <button 
                    onClick={() => toggleFavorite(player)}
                    className="p-2 text-brand-lime hover:text-brand-red transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 bg-brand-slate border border-dashed border-slate-800 rounded-3xl text-center space-y-4">
                 <Star className="mx-auto text-slate-800" size={48} />
                 <p className="text-brand-muted font-bold">Your watchlist is empty.</p>
                 <p className="text-xs text-brand-muted">Search for players on the right to start tracking them.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bebas tracking-wider mb-6">Find Players</h2>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter MLB player name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-brand-slate border border-slate-800 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-brand-lime"
                />
                <button 
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-lime text-brand-charcoal rounded-xl"
                >
                  <Search size={18} />
                </button>
              </div>

              <div className="space-y-3 pt-4">
                {searchResults.map((player) => {
                  const isFav = favorites.find(f => f.id === player.id);
                  return (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-brand-slate border border-slate-800 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-white leading-none mb-1">{player.fullName}</p>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{player.currentTeam?.name}</p>
                      </div>
                      <button 
                        onClick={() => toggleFavorite(player)}
                        className={`p-2 rounded-xl transition-all ${isFav ? 'bg-brand-lime text-brand-charcoal' : 'bg-slate-900 text-brand-muted hover:text-white'}`}
                      >
                        <Star size={16} fill={isFav ? "currentColor" : "none"} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
