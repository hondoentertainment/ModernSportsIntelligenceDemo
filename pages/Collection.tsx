
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Trash2, 
  Sparkles, 
  Tag, 
  History
} from 'lucide-react';
import { CardInventory, TargetWatchlist } from '../types.ts';
import { getEbayCardPrice } from '../lib/gemini.ts';
import { MOCK_CARDS } from '../constants.tsx';

const Collection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'targets'>('inventory');
  
  const [inventory, setInventory] = useState<CardInventory[]>(() => {
    try {
      const saved = localStorage.getItem('cardx_inventory');
      return saved ? JSON.parse(saved) : MOCK_CARDS;
    } catch (e) {
      console.warn('Failed to parse inventory from localStorage', e);
      return MOCK_CARDS;
    }
  });

  const [targets, setTargets] = useState<TargetWatchlist[]>(() => {
    try {
      const saved = localStorage.getItem('cardx_targets');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to parse targets from localStorage', e);
      return [];
    }
  });

  const [isPricing, setIsPricing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('cardx_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('cardx_targets', JSON.stringify(targets));
  }, [targets]);

  const handleAddCard = () => {
    const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 11);

    const newCard: CardInventory = {
      id,
      player: 'New Player',
      year: new Date().getFullYear(),
      manufacturer: 'Topps',
      cardNumber: '1',
      set: 'Series 1',
      sport: 'Baseball',
      isAutographed: false,
      condition: 'Near Mint',
      isGraded: false,
      purchasePrice: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
    };
    setInventory([newCard, ...inventory]);
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
    setInventory(inventory.filter(c => c.id !== id));
  };

  const filteredInventory = inventory.filter(c => 
    c.player.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.set.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalValue: inventory.reduce((sum, c) => sum + (c.currentValue || 0), 0),
    totalCost: inventory.reduce((sum, c) => sum + c.purchasePrice, 0),
    cardCount: inventory.length,
    profit: 0
  };
  stats.profit = stats.totalValue - stats.totalCost;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bebas tracking-tight text-white mb-2">Collection Management</h1>
          <p className="text-brand-muted max-w-2xl">Professional inventory tracking and real-time market valuations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddCard}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-lime hover:bg-lime-400 text-brand-charcoal font-bold rounded-xl transition-all shadow-lg shadow-brand-lime/20"
          >
            <Plus size={18} strokeWidth={3} /> Add Card
          </button>
          <button className="p-2.5 bg-brand-slate border border-slate-700 rounded-xl text-brand-muted hover:text-white transition-all">
            <Upload size={20} />
          </button>
        </div>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-slate border border-slate-800 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Portfolio Value</p>
          <p className="text-2xl font-mono font-bold text-brand-lime">${stats.totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-brand-slate border border-slate-800 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Total Invested</p>
          <p className="text-2xl font-mono font-bold text-white">${stats.totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-brand-slate border border-slate-800 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Net Profit/Loss</p>
          <p className={`text-2xl font-mono font-bold ${stats.profit >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
            {stats.profit >= 0 ? '+' : ''}${stats.profit.toLocaleString()}
          </p>
        </div>
        <div className="bg-brand-slate border border-slate-800 p-5 rounded-2xl">
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Total Assets</p>
          <p className="text-2xl font-mono font-bold text-white">{stats.cardCount} Cards</p>
        </div>
      </section>

      <div className="flex border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`px-8 py-4 font-bebas text-xl tracking-wider transition-all relative
          ${activeTab === 'inventory' ? 'text-brand-lime' : 'text-brand-muted hover:text-white'}`}
        >
          Inventory
          {activeTab === 'inventory' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-lime rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('targets')}
          className={`px-8 py-4 font-bebas text-xl tracking-wider transition-all relative
          ${activeTab === 'targets' ? 'text-brand-lime' : 'text-brand-muted hover:text-white'}`}
        >
          Targets
          {activeTab === 'targets' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-lime rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search collection by player, set, or number..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-slate border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-lime"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-brand-slate border border-slate-800 rounded-xl text-sm font-bold text-brand-muted hover:text-white transition-all">
              <Filter size={18} /> Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInventory.map((card) => (
              <div key={card.id} className="group bg-brand-slate border border-slate-800 rounded-[2rem] overflow-hidden hover:border-brand-lime/30 transition-all flex flex-col">
                <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden">
                  <img src={card.image || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=300'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {card.isGraded && (
                    <div className="absolute top-4 left-4 bg-brand-charcoal/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                      <Tag size={12} className="text-brand-lime" />
                      <span className="text-[10px] font-black uppercase text-white">{card.gradingCompany} {card.grade}</span>
                    </div>
                  )}
                  <button 
                    onClick={() => deleteCard(card.id)}
                    className="absolute top-4 right-4 p-2 bg-brand-red/10 text-brand-red rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-red hover:text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="p-6 space-y-4 flex-1">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-0.5">{card.player}</h3>
                    <p className="text-xs text-brand-muted font-bold tracking-widest uppercase">{card.year} {card.manufacturer} {card.set} #{card.cardNumber}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-brand-charcoal border border-slate-800 rounded-2xl">
                      <p className="text-[10px] font-bold text-brand-muted uppercase mb-1">Purchase Price</p>
                      <p className="text-sm font-mono font-bold">${card.purchasePrice.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-brand-charcoal border border-slate-800 rounded-2xl relative">
                      <p className="text-[10px] font-bold text-brand-muted uppercase mb-1">Market Value</p>
                      <p className="text-sm font-mono font-bold text-brand-lime">
                        {card.currentValue ? `$${card.currentValue.toLocaleString()}` : '—'}
                      </p>
                    </div>
                  </div>

                  {card.lastValuationDate && (
                    <p className="text-[10px] text-brand-muted font-medium flex items-center gap-1">
                      <History size={10} /> Valued: {new Date(card.lastValuationDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-brand-charcoal/50 border-t border-slate-800 flex items-center justify-between">
                  <button 
                    onClick={() => handleUpdatePrice(card)}
                    disabled={isPricing === card.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-brand-slate hover:bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-lime transition-all disabled:opacity-50"
                  >
                    {isPricing === card.id ? (
                      <div className="w-3 h-3 border-2 border-brand-lime border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles size={14} />
                    )}
                    Get eBay Value
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-brand-slate border border-dashed border-slate-800 rounded-[2.5rem]">
           <Plus className="text-slate-700 mb-4" size={64} />
           <h3 className="text-2xl font-bebas tracking-wider text-white mb-2">Target Watchlist Empty</h3>
           <p className="text-brand-muted max-w-sm text-center mb-8">
              Keep track of the cards you're actively hunting. Set target prices and priority levels.
           </p>
           <button className="px-6 py-2.5 bg-brand-slate border border-brand-lime/40 text-brand-lime hover:bg-brand-lime hover:text-brand-charcoal font-bold rounded-xl transition-all">
             Create First Target
           </button>
        </div>
      )}
    </div>
  );
};

export default Collection;
