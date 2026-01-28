
import React, { useState, useEffect } from 'react';
import { Star, Search, Trash2, User, ChevronRight, LayoutGrid, List, CreditCard, TrendingUp } from 'lucide-react';
import { searchMLBPlayers } from '../lib/mlbApi.ts';
import { useFavorites, CardFavorite } from '../lib/useFavorites.ts';
import { useInventory } from '../lib/useInventory.ts';

const Favorites: React.FC = () => {
  // MLB Player favorites (existing)
  const [playerFavorites, setPlayerFavorites] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cardx_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn("Error parsing player favorites", e);
      return [];
    }
  });

  // Card favorites (new)
  const { favorites: cardFavorites, removeFavorite: removeCardFavorite } = useFavorites();
  const { inventory } = useInventory();

  const [activeTab, setActiveTab] = useState<'cards' | 'players'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    localStorage.setItem('cardx_favorites', JSON.stringify(playerFavorites));
  }, [playerFavorites]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    const results = await searchMLBPlayers(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const togglePlayerFavorite = (player: any) => {
    setPlayerFavorites(prev => {
      const exists = prev.find(p => p.id === player.id);
      if (exists) {
        return prev.filter(p => p.id !== player.id);
      }
      return [player, ...prev];
    });
  };

  // Get card details from inventory for favorites
  const getCardDetails = (cardId: string) => {
    return inventory.find(c => c.id === cardId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bebas tracking-tight text-white mb-2">Watchlist Hub</h1>
          <p className="text-brand-muted max-w-2xl">Track your favorite cards and players across your collection.</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-brand-slate rounded-2xl p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'cards'
                ? 'bg-brand-lime text-brand-charcoal'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <CreditCard size={16} />
            Cards ({cardFavorites.length})
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'players'
                ? 'bg-brand-lime text-brand-charcoal'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <User size={16} />
            Players ({playerFavorites.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bebas tracking-wider flex items-center gap-3">
              <Star className="text-brand-lime fill-brand-lime" size={24} />
              {activeTab === 'cards' ? 'Watched Cards' : 'Tracked Players'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg border transition-all ${viewMode === 'grid' ? 'bg-brand-lime/10 border-brand-lime/30 text-brand-lime' : 'bg-brand-slate border-slate-800 text-brand-muted'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg border transition-all ${viewMode === 'list' ? 'bg-brand-lime/10 border-brand-lime/30 text-brand-lime' : 'bg-brand-slate border-slate-800 text-brand-muted'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Cards Tab */}
          {activeTab === 'cards' && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
              {cardFavorites.length > 0 ? cardFavorites.map((fav) => {
                const card = getCardDetails(fav.cardId);
                return (
                  <div key={fav.id} className="group bg-brand-slate border border-slate-800 rounded-3xl p-5 hover:border-brand-lime/30 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-bold text-lg border border-slate-800 group-hover:bg-brand-lime/10 transition-colors">
                        <CreditCard className="text-brand-muted group-hover:text-brand-lime" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{fav.player}</h3>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                          {fav.year} {fav.set}
                        </p>
                        {fav.currentValue && (
                          <p className="text-xs text-brand-lime font-bold mt-1">
                            ${fav.currentValue.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {card && (
                        <div className="text-right mr-2">
                          <p className="text-[10px] text-brand-muted">Portfolio</p>
                          <p className="text-xs font-bold text-white flex items-center gap-1">
                            <TrendingUp size={12} className="text-brand-lime" />
                            In Collection
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => removeCardFavorite(fav.cardId)}
                        className="p-2 text-brand-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-20 bg-brand-slate border border-dashed border-slate-800 rounded-3xl text-center space-y-4">
                  <CreditCard className="mx-auto text-slate-800" size={48} />
                  <p className="text-brand-muted font-bold">No cards on your watchlist yet.</p>
                  <p className="text-xs text-brand-muted">Go to your Collection and click the star icon on cards to add them here.</p>
                </div>
              )}
            </div>
          )}

          {/* Players Tab */}
          {activeTab === 'players' && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
              {playerFavorites.length > 0 ? playerFavorites.map((player) => (
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
                      onClick={() => togglePlayerFavorite(player)}
                      className="p-2 text-brand-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 bg-brand-slate border border-dashed border-slate-800 rounded-3xl text-center space-y-4">
                  <User className="mx-auto text-slate-800" size={48} />
                  <p className="text-brand-muted font-bold">No players on your watchlist yet.</p>
                  <p className="text-xs text-brand-muted">Search for MLB players on the right to start tracking them.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Panel - Only for Players */}
        <div className="space-y-6">
          <div className="bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-8">
            <h2 className="text-2xl font-bebas tracking-wider mb-6">Find MLB Players</h2>
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

              <div className="space-y-3 pt-4 max-h-80 overflow-y-auto">
                {isSearching && (
                  <p className="text-center text-brand-muted text-sm py-4">Searching...</p>
                )}
                {searchResults.map((player) => {
                  const isFav = playerFavorites.find(f => f.id === player.id);
                  return (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-brand-slate border border-slate-800 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-white leading-none mb-1">{player.fullName}</p>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{player.currentTeam?.name}</p>
                      </div>
                      <button
                        onClick={() => togglePlayerFavorite(player)}
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

          {/* Quick Stats */}
          <div className="bg-brand-slate border border-slate-800 rounded-3xl p-6">
            <h3 className="font-bebas text-lg tracking-wider mb-4">Watchlist Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Cards Tracked</span>
                <span className="font-bold text-white">{cardFavorites.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Players Tracked</span>
                <span className="font-bold text-white">{playerFavorites.length}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-sm">Total Value</span>
                <span className="font-bold text-brand-lime">
                  ${cardFavorites.reduce((sum, f) => sum + (f.currentValue || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
