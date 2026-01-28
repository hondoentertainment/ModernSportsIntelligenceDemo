
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Upload,
  Trash2,
  Sparkles,
  Tag,
  History,
  Grid,
  List,
  SortAsc,
  Trophy,
  Target,
  Edit3,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { CardInventory, TargetWatchlist, League } from '../types.ts';
import { getEbayCardPrice } from '../lib/gemini.ts';
import { LEAGUES } from '../constants.tsx';
import { useInventory } from '../lib/useInventory.ts';
import { useTargets } from '../lib/useTargets.ts';
import AddTargetModal from '../components/AddTargetModal.tsx';
import AddAssetModal from '../components/AddAssetModal.tsx';
import { getRarityTier, getTierStyles } from '../lib/rarity.ts';

const Collection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'targets'>('inventory');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterLeague, setFilterLeague] = useState<League | 'All'>('All');

  // Shared inventory state - synced with Dashboard
  const { inventory, setInventory, addCard, deleteCard: removeCard, initializeFullInventory } = useInventory();

  // Targets state
  const { targets, addTarget, updateTarget, deleteTarget, markAcquired } = useTargets();
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TargetWatchlist | null>(null);

  // Asset Modal state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<CardInventory | null>(null);
  const { updateCard } = useInventory();

  // Ensure full inventory is loaded on mount
  useEffect(() => {
    initializeFullInventory();
  }, [initializeFullInventory]);

  const [isPricing, setIsPricing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');


  const handleAddCard = (card: CardInventory) => {
    addCard(card);
  };


  const handleUpdatePrice = async (card: CardInventory) => {
    setIsPricing(card.id);
    const analysis = await getEbayCardPrice(card);
    if (analysis) {
      setInventory(prev => prev.map(c =>
        c.id === card.id
          ? { ...c, currentValue: analysis.estimatedValue, lastValuationDate: analysis.lastUpdated }
          : c
      ));
    }
    setIsPricing(null);
  };

  const deleteCard = (id: string) => {
    if (confirm('Are you sure you want to remove this asset from your collection?')) {
      removeCard(id);
    }
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(c => {
      const matchesSearch = c.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.set.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLeague = filterLeague === 'All' || c.league === filterLeague;
      return matchesSearch && matchesLeague;
    });
  }, [inventory, searchQuery, filterLeague]);

  const stats = useMemo(() => {
    const totalValue = inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0);
    const totalCost = inventory.reduce((sum, c) => sum + (c.purchasePrice || 0), 0);
    return {
      totalValue,
      totalCost,
      cardCount: inventory.length,
      profit: totalValue - totalCost
    };
  }, [inventory]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Asset <span className="text-brand-lime">Repository</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">Professional grade inventory management and market liquidity tracking.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setEditingAsset(null); setIsAssetModalOpen(true); }}
            className="flex items-center gap-3 px-10 py-4 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all shadow-xl shadow-brand-lime/20 active:scale-95 uppercase tracking-widest text-xs"
          >
            <Plus size={18} strokeWidth={4} />
            Add Asset
          </button>
          <button className="p-4 bg-brand-slate border border-slate-800 rounded-2xl text-brand-muted hover:text-white transition-all shadow-lg">
            <Upload size={18} />
          </button>
        </div>
      </div>

      {/* Financial Quick-View */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Portfolio NAV', val: stats.totalValue, color: 'text-brand-lime', isCurrency: true },
          { label: 'Capital Invested', val: stats.totalCost, color: 'text-white', isCurrency: true },
          { label: 'Unrealized G/L', val: stats.profit, color: stats.profit >= 0 ? 'text-brand-green' : 'text-brand-red', isCurrency: true, showSign: true },
          { label: 'Total Holdings', val: stats.cardCount, color: 'text-brand-muted', suffix: ' Units' }
        ].map((s, i) => (
          <div key={i} className="bg-brand-slate border border-slate-800 p-6 rounded-[1.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-lime/5 blur-3xl rounded-full group-hover:bg-brand-lime/10 transition-all"></div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1 relative z-10">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-mono font-bold ${s.color} relative z-10`}>
              {s.isCurrency && (s.showSign && s.val >= 0 ? '+' : '')}
              {s.isCurrency ? `$${Math.round(s.val).toLocaleString()}` : s.val}
              {s.suffix}
            </p>
          </div>
        ))}
      </section>

      {/* Toolbar & Tabs */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-800/50 pb-2">
          <div className="flex gap-8">
            {['inventory', 'targets'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 font-bebas text-2xl tracking-widest transition-all relative capitalize
                ${activeTab === tab ? 'text-brand-lime' : 'text-brand-muted hover:text-white'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-brand-lime rounded-t-full shadow-[0_-4px_12px_rgba(217,249,157,0.3)]"></div>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 p-1 bg-brand-slate border border-slate-800 rounded-xl mb-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-charcoal text-white shadow-lg' : 'text-brand-muted hover:text-slate-200'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-charcoal text-white shadow-lg' : 'text-brand-muted hover:text-slate-200'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {activeTab === 'inventory' ? (
          <div className="space-y-8">
            {/* Search & Extensive Filtering */}
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-lime transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Query collection players, manufacturers, or sets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-slate border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full lg:w-auto">
                {['All', ...LEAGUES].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterLeague(s as any)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border
                      ${filterLeague === s
                        ? 'bg-brand-lime border-brand-lime text-brand-charcoal shadow-lg shadow-brand-lime/20'
                        : 'bg-brand-charcoal border-slate-800 text-brand-muted hover:border-slate-700'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button className="flex items-center gap-2 px-6 py-4 bg-brand-slate border border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-brand-muted hover:text-white transition-all shadow-xl">
                <SortAsc size={18} /> Sort
              </button>
            </div>

            {/* Assets Grid */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                {filteredInventory.map((card) => {
                  const tier = getRarityTier(card);
                  const styles = getTierStyles(tier);

                  return (
                    <div key={card.id} className={`group bg-brand-slate border ${styles.border} rounded-[2.5rem] overflow-hidden transition-all flex flex-col active:scale-[0.98] relative`}>
                      <div className="aspect-[4/5] bg-slate-950 relative overflow-hidden group">
                        <img src={card.image || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=600'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />

                        {/* Premium Overlays */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${styles.glow || 'from-black/80'} via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity`}></div>

                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          {tier !== 'Common' && tier !== 'Uncommon' && (
                            <div className={`${styles.badge} px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2`}>
                              {tier === 'OneOfOne' ? <Sparkles size={14} fill="currentColor" /> : <Trophy size={14} fill="currentColor" />}
                              {tier === 'OneOfOne' ? '1 of 1' : tier}
                            </div>
                          )}
                          {card.isGraded && (
                            <div className="bg-brand-lime text-brand-charcoal px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2">
                              <Trophy size={14} fill="currentColor" /> {card.gradingCompany} {card.grade}
                            </div>
                          )}
                          {card.isAutographed && (
                            <div className="bg-white text-brand-charcoal px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2">
                              <Sparkles size={14} /> Auto
                            </div>
                          )}
                        </div>

                        <div className="absolute bottom-6 left-6 right-6">
                          <span className={`text-[10px] font-black ${styles.text} uppercase tracking-widest mb-1 block`}>{card.sport}</span>
                          <h3 className="text-2xl font-bold text-white leading-tight truncate">{card.player}</h3>
                        </div>

                        <button
                          onClick={(e) => { e.preventDefault(); deleteCard(card.id); }}
                          className="absolute top-6 right-6 p-3 bg-brand-red/10 text-brand-red rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-red hover:text-white backdrop-blur-md"
                        >
                          <Trash2 size={20} />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); setEditingAsset(card); setIsAssetModalOpen(true); }}
                          className="absolute top-6 right-20 p-3 bg-brand-charcoal/30 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-charcoal hover:text-brand-lime backdrop-blur-md"
                        >
                          <Edit3 size={20} />
                        </button>
                      </div>

                      <div className="p-8 space-y-6 flex-1">
                        <div>
                          <p className="text-[10px] text-brand-muted font-black tracking-widest uppercase mb-1">{card.year} {card.manufacturer}</p>
                          <p className="text-sm font-bold text-slate-300 truncate">{card.set} #{card.cardNumber}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-brand-charcoal/40 border border-slate-800/50 rounded-2xl">
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">Book Value</p>
                            <p className="text-sm font-mono font-black text-slate-200">${Math.round(card.purchasePrice).toLocaleString()}</p>
                          </div>
                          <div className="p-4 bg-brand-lime/5 border border-brand-lime/10 rounded-2xl">
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">Market Nav</p>
                            <p className="text-sm font-mono font-black text-brand-lime">
                              {card.currentValue ? `$${Math.round(card.currentValue).toLocaleString()}` : '—'}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleUpdatePrice(card)}
                          disabled={isPricing === card.id}
                          className="w-full flex items-center justify-center gap-3 py-3.5 bg-brand-charcoal hover:bg-slate-800 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all disabled:opacity-50"
                        >
                          {isPricing === card.id ? (
                            <div className="w-4 h-4 border-2 border-brand-lime border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Sparkles size={16} className="text-brand-lime" />
                          )}
                          Intelligence Check
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View implementation to handle dense data */
              <div className="bg-brand-slate border border-slate-800 rounded-[2rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-brand-charcoal/50 text-[10px] font-black text-brand-muted uppercase tracking-widest border-b border-slate-800">
                    <tr>
                      <th className="px-8 py-4">Asset</th>
                      <th className="px-8 py-4">Details</th>
                      <th className="px-8 py-4 text-right">P-Price</th>
                      <th className="px-8 py-4 text-right">Market</th>
                      <th className="px-8 py-4 text-center">Grade</th>
                      <th className="px-8 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredInventory.map((card) => (
                      <tr key={card.id} className="hover:bg-brand-lime/5 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <img src={card.image} className="w-10 h-10 rounded-lg object-cover bg-slate-900" />
                            <span className="font-bold text-white">{card.player}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{card.year} {card.manufacturer}</span>
                        </td>
                        <td className="px-8 py-4 text-right font-mono text-sm">${card.purchasePrice.toLocaleString()}</td>
                        <td className="px-8 py-4 text-right font-mono text-sm text-brand-lime">${card.currentValue?.toLocaleString() || '—'}</td>
                        <td className="px-8 py-4 text-center text-[10px] font-black uppercase">{card.isGraded ? `${card.gradingCompany} ${card.grade}` : 'Raw'}</td>
                        <td className="px-8 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => { setEditingAsset(card); setIsAssetModalOpen(true); }} className="p-2 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => deleteCard(card.id)} className="p-2 text-slate-500 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Add Target Button */}
            <div className="flex justify-end">
              <button
                onClick={() => { setEditingTarget(null); setIsTargetModalOpen(true); }}
                className="flex items-center gap-3 px-8 py-4 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all shadow-xl shadow-brand-lime/20 active:scale-95 uppercase tracking-widest text-xs"
              >
                <Plus size={18} strokeWidth={4} />
                Add Target
              </button>
            </div>

            {targets.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-32 bg-brand-slate border border-dashed border-slate-800 rounded-[3rem] space-y-6">
                <div className="w-24 h-24 bg-brand-lime/5 rounded-full flex items-center justify-center border border-brand-lime/10">
                  <Target className="text-brand-lime" size={32} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-bebas tracking-widest text-white">Target Feed Dormant</h3>
                  <p className="text-brand-muted max-w-sm font-medium">
                    Establish acquisition thresholds for your most wanted assets to receive real-time liquidity alerts.
                  </p>
                </div>
                <button
                  onClick={() => { setEditingTarget(null); setIsTargetModalOpen(true); }}
                  className="px-10 py-4 bg-brand-charcoal border border-brand-lime/30 text-brand-lime hover:bg-brand-lime hover:text-brand-charcoal font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                >
                  Initialize First Target
                </button>
              </div>
            ) : (
              /* Targets Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {targets.map((target) => (
                  <div
                    key={target.id}
                    className={`group bg-brand-slate border rounded-[2rem] overflow-hidden transition-all hover:shadow-xl ${target.status === 'acquired' ? 'border-brand-green/40' : 'border-slate-800 hover:border-brand-lime/40'
                      }`}
                  >
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${target.priority === 'High' ? 'bg-red-500/20' :
                            target.priority === 'Medium' ? 'bg-amber-500/20' : 'bg-slate-500/20'
                            }`}>
                            <Target className={`${target.priority === 'High' ? 'text-red-400' :
                              target.priority === 'Medium' ? 'text-amber-400' : 'text-slate-400'
                              }`} size={20} />
                          </div>
                          <div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${target.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                              target.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                              }`}>
                              {target.priority}
                            </span>
                          </div>
                        </div>
                        {target.status === 'acquired' && (
                          <div className="flex items-center gap-1 text-brand-green text-[10px] font-black uppercase">
                            <CheckCircle2 size={14} /> Acquired
                          </div>
                        )}
                      </div>

                      {/* Player & Card Info */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{target.player}</h3>
                        <p className="text-sm text-brand-muted font-medium line-clamp-2">{target.cardDescription}</p>
                      </div>

                      {/* Target Price */}
                      <div className="bg-brand-charcoal/40 border border-slate-800/50 rounded-xl p-4">
                        <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">Target Price</p>
                        <p className="text-2xl font-mono font-bold text-brand-lime">
                          ${target.targetPrice.toLocaleString()}
                        </p>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-[10px] text-brand-muted font-medium">
                        <span className="flex items-center gap-1"><Trophy size={12} /> {target.sport}</span>
                        <span>{target.league}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(target.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Notes */}
                      {target.notes && (
                        <p className="text-xs text-slate-400 italic border-l-2 border-brand-lime/30 pl-3">
                          {target.notes}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {target.status === 'active' && (
                          <button
                            onClick={() => markAcquired(target.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-green/10 hover:bg-brand-green/20 border border-brand-green/30 text-brand-green rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            <CheckCircle2 size={14} /> Acquired
                          </button>
                        )}
                        <button
                          onClick={() => { setEditingTarget(target); setIsTargetModalOpen(true); }}
                          className="p-3 bg-brand-charcoal hover:bg-slate-800 border border-slate-800 text-white rounded-xl transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Remove this target from your watchlist?')) {
                              deleteTarget(target.id);
                            }
                          }}
                          className="p-3 bg-brand-charcoal hover:bg-brand-red/20 border border-slate-800 text-brand-muted hover:text-brand-red rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Target Modal */}
        <AddTargetModal
          isOpen={isTargetModalOpen}
          onClose={() => { setIsTargetModalOpen(false); setEditingTarget(null); }}
          onAdd={addTarget}
          editTarget={editingTarget}
          onUpdate={updateTarget}
        />

        {/* Add/Edit Asset Modal */}
        <AddAssetModal
          isOpen={isAssetModalOpen}
          onClose={() => { setIsAssetModalOpen(false); setEditingAsset(null); }}
          onAdd={handleAddCard}
          editCard={editingAsset}
          onUpdate={updateCard}
        />
      </div>
    </div>
  );
};

export default Collection;
