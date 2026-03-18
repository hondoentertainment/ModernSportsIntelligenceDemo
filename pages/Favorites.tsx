
import React, { useState, useEffect, useCallback } from 'react';
import { Star, Search, Trash2, User, ChevronRight, LayoutGrid, List, CreditCard, TrendingUp, Target, RefreshCw, Plus, Loader2, Zap } from 'lucide-react';
import { searchMLBPlayers } from '../lib/mlbApi.ts';
import { useFavorites } from '../lib/useFavorites.ts';
import { useInventory } from '../lib/useInventory.ts';
import { useTargets } from '../lib/useTargets.ts';
import { useAlerts } from '../lib/useAlerts.ts';
import { syncWatchlistPrices } from '../lib/marketSync.ts';
import WatchlistPriceCard from '../components/WatchlistPriceCard.tsx';
import AddTargetModal from '../components/AddTargetModal.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { logger } from '../lib/logger';
import { store } from '../lib/dal/syncStore';

const Favorites: React.FC = () => {
  // MLB Player favorites (existing)
  const [playerFavorites, setPlayerFavorites] = useState<any[]>(() => {
    return store.get<any[]>('cardx_favorites', []);
  });

  const { addToast } = useToast();

  // Card favorites
  const { favorites: cardFavorites, removeFavorite: removeCardFavorite } = useFavorites();
  const { inventory } = useInventory();

  // Acquisition targets
  const { targets, setTargets, addTarget, deleteTarget, markAcquired } = useTargets();
  const { priceTargetHit, systemMessage } = useAlerts();

  const [activeTab, setActiveTab] = useState<'cards' | 'players' | 'targets'>('targets');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddTarget, setShowAddTarget] = useState(false);

  // Watchlist sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    store.set('cardx_favorites', playerFavorites);
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

  const getCardDetails = (cardId: string) => {
    return inventory.find(c => c.id === cardId);
  };

  // Sync watchlist prices
  const handleSyncWatchlist = useCallback(async () => {
    if (isSyncing || targets.length === 0) return;
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: targets.filter(t => t.status === 'active').length });

    try {
      const result = await syncWatchlistPrices(targets, (current, total) => {
        setSyncProgress({ current, total });
      });

      // Update targets with new prices
      setTargets(result.updatedTargets);

      // Fire alerts for price hits
      result.priceHits.forEach(target => {
        priceTargetHit(
          target.player,
          target.cardDescription,
          target.targetPrice,
          target.currentMarketPrice!,
          target.id
        );
      });

      if (result.priceHits.length > 0) {
        systemMessage(
          '🎯 Watchlist Price Hits',
          `${result.priceHits.length} target(s) have reached your desired price!`
        );
      }
    } catch (e) {
      logger.error('Watchlist sync failed:', e);
      addToast('error', 'Watchlist sync failed. Try again later.');
    } finally {
      setIsSyncing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSyncing, targets, setTargets, priceTargetHit, systemMessage]);

  // Compute acquisition target stats
  const activeTargets = targets.filter(t => t.status === 'active');
  const targetsWithPrice = activeTargets.filter(t => t.currentMarketPrice != null);
  const nearHitTargets = targetsWithPrice.filter(t => {
    const delta = (t.currentMarketPrice! - t.targetPrice) / t.targetPrice;
    return delta <= 0.1; // within 10% of target
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bebas tracking-tight text-white mb-2">Watchlist Hub</h1>
          <p className="text-brand-muted max-w-2xl">Track cards, players, and acquisition targets with live market pricing.</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-brand-slate rounded-2xl p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('targets')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'targets'
              ? 'bg-brand-lime text-brand-charcoal'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Target size={16} />
            Targets ({activeTargets.length})
          </button>
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
              {activeTab === 'targets' ? (
                <><Target className="text-brand-lime" size={24} /> Acquisition Targets</>
              ) : activeTab === 'cards' ? (
                <><Star className="text-brand-lime fill-brand-lime" size={24} /> Watched Cards</>
              ) : (
                <><User className="text-brand-lime" size={24} /> Tracked Players</>
              )}
            </h2>
            <div className="flex gap-2">
              {activeTab === 'targets' && (
                <>
                  <button
                    onClick={handleSyncWatchlist}
                    disabled={isSyncing || activeTargets.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-brand-slate border border-slate-800 text-slate-300 hover:text-brand-lime hover:border-brand-lime/30 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSyncing ? (
                      <><Loader2 size={16} className="animate-spin" /> Syncing {syncProgress.current}/{syncProgress.total}</>
                    ) : (
                      <><RefreshCw size={16} /> Sync Prices</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowAddTarget(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-brand-lime text-brand-charcoal hover:bg-brand-lime/90"
                  >
                    <Plus size={16} /> Add Target
                  </button>
                </>
              )}
              {activeTab !== 'targets' && (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Acquisition Targets Tab */}
          {activeTab === 'targets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTargets.length > 0 ? activeTargets.map((target) => (
                <WatchlistPriceCard
                  key={target.id}
                  target={target}
                  onDelete={deleteTarget}
                  onMarkAcquired={markAcquired}
                />
              )) : (
                <div className="col-span-full py-20 bg-brand-slate border border-dashed border-slate-800 rounded-3xl text-center space-y-4">
                  <Target className="mx-auto text-slate-800" size={48} />
                  <p className="text-brand-muted font-bold">No acquisition targets yet.</p>
                  <p className="text-xs text-brand-muted">Add targets to track market prices and get notified when they hit your desired price.</p>
                  <button
                    onClick={() => setShowAddTarget(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-lime text-brand-charcoal hover:bg-brand-lime/90 transition-all"
                  >
                    <Plus size={16} /> Add Your First Target
                  </button>
                </div>
              )}

              {/* Acquired targets section */}
              {targets.filter(t => t.status === 'acquired').length > 0 && (
                <div className="col-span-full mt-6">
                  <h3 className="text-lg font-bebas tracking-wider text-slate-500 mb-3">Acquired</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {targets.filter(t => t.status === 'acquired').map(target => (
                      <div key={target.id} className="rounded-2xl border border-slate-800/50 p-4 opacity-60" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-400">{target.player}</h4>
                            <p className="text-[10px] text-slate-600">{target.cardDescription}</p>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                            Acquired
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Search Panel - Only for Players */}
          {activeTab === 'players' && (
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
          )}

          {/* Watchlist Summary */}
          <div className="bg-brand-slate border border-slate-800 rounded-3xl p-6">
            <h3 className="font-bebas text-lg tracking-wider mb-4">Watchlist Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Active Targets</span>
                <span className="font-bold text-white">{activeTargets.length}</span>
              </div>
              {targetsWithPrice.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Near Price Hit</span>
                  <span className="font-bold text-yellow-400">{nearHitTargets.length}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Cards Tracked</span>
                <span className="font-bold text-white">{cardFavorites.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Players Tracked</span>
                <span className="font-bold text-white">{playerFavorites.length}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-sm">Card Fav Value</span>
                <span className="font-bold text-brand-lime">
                  ${cardFavorites.reduce((sum, f) => sum + (f.currentValue || 0), 0).toLocaleString()}
                </span>
              </div>
              {targetsWithPrice.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Avg Market Price</span>
                  <span className="font-bold text-white">
                    ${Math.round(targetsWithPrice.reduce((sum, t) => sum + (t.currentMarketPrice || 0), 0) / targetsWithPrice.length).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips for Targets Tab */}
          {activeTab === 'targets' && (
            <div className="bg-brand-charcoal border border-slate-800 rounded-3xl p-6">
              <h3 className="font-bebas text-lg tracking-wider mb-3 flex items-center gap-2">
                <Zap className="text-brand-lime" size={18} />
                How It Works
              </h3>
              <div className="space-y-3 text-xs text-slate-400">
                <p><strong className="text-slate-300">1.</strong> Add cards you want to acquire with a target price.</p>
                <p><strong className="text-slate-300">2.</strong> Hit <strong className="text-brand-lime">Sync Prices</strong> to fetch live eBay market data.</p>
                <p><strong className="text-slate-300">3.</strong> Get alerts when market prices drop below your target.</p>
                <p><strong className="text-slate-300">4.</strong> Click <strong className="text-green-400">Acquired</strong> when you buy the card.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Target Modal */}
      <AddTargetModal
        isOpen={showAddTarget}
        onClose={() => setShowAddTarget(false)}
        onAdd={addTarget}
      />
    </div>
  );
};

export default Favorites;
