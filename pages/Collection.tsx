
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  Upload,
  History,
  Grid,
  List,
  SortAsc,
  SortDesc,
  CheckCircle2,
  Clock,
  XCircle,
  CheckSquare,
  Square,
  Trash2,
  Download,
  Sparkles,
  Loader2,
  Cloud,
  CloudOff,
  Star,
  Edit3,
  Target,
  Trophy,
} from 'lucide-react';
import { CardInventory, TargetWatchlist, League, ExitPlan } from '../types';
import { getEbayCardPrice } from '../lib/gemini';
import { LEAGUES } from '../constants';
import { useSupabaseInventory } from '../lib/useSupabaseInventory';
import { useFavorites } from '../lib/useFavorites';
import { useToast } from '../contexts/ToastContext';
import AddTargetModal from '../components/AddTargetModal';
import AddAssetModal from '../components/AddAssetModal';
import OCRIngestionModal from '../components/OCRIngestionModal';
import { getRarityTier, getTierStyles } from '../lib/rarity';
import { generatePopData, ScarcityService } from '../lib/scarcityService';
import { getPriceTrend, getSparklineData } from '../lib/priceHistory';
import { LiquidityService } from '../lib/LiquidityService';
import { LiquidityBadge } from '../components/LiquidityBadge';
import CardImage from '../components/CardImage';
import ImageLightbox from '../components/ImageLightbox';
import { ExitStrategyModal } from '../components/ExitStrategyModal';
import GradingCalculatorModal from '../components/GradingCalculatorModal';
import BreakEvenModal from '../components/BreakEvenModal';
import InstantBuyModal from '../components/InstantBuyModal';
import PredictiveAlphaModal from '../components/PredictiveAlphaModal';
import AgentThesisModal from '../components/AgentThesisModal';
import ConfirmDialog from '../components/ConfirmDialog';
import CommandPalette from '../components/CommandPalette';
import { CardGridSkeleton } from '../components/SkeletonLoader';
import CardGridItem from '../components/collection/CardGridItem';
import SwipeableCard from '../components/collection/SwipeableCard';
import VirtualizedGrid from '../components/collection/VirtualizedGrid';
import { useKeyboardShortcuts } from '../lib/useKeyboardShortcuts';

type SortField = 'player' | 'value' | 'purchasePrice' | 'date' | 'roi' | 'league';
type SortDir = 'asc' | 'desc';

const VIRTUAL_THRESHOLD = 24;
const GRID_COLS = 4;
const CARD_ESTIMATE_HEIGHT = 480;
const ROW_GAP = 32;


const Collection: React.FC = () => {

  const [activeTab, setActiveTab] = useState<'inventory' | 'targets' | 'vault'>('inventory');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterLeague, setFilterLeague] = useState<League | 'All'>('All');

  // Unified Supabase-aware state
  const {
    inventory,
    setInventory,
    addCard,
    deleteCard: removeCard,
    updateCard,
    initializeFullInventory,
    targets,
    addTarget,
    updateTarget,
    deleteTarget,
    markAcquired,
    isCloudSynced,
    isMigrating,
    loading
  } = useSupabaseInventory();

  // Hydrate local inventory with Scarcity Data if missing
  useEffect(() => {
    if (inventory.length > 0) {
      let hydrated = false;
      const updatedInventory = inventory.map(card => {
        if (!card.popReport && card.isGraded) {
          const popData = generatePopData(card);
          hydrated = true;
          // Synchronous fallback for display, but simulate a report
          const popReport: any = {
            popAtGrade: popData.popCount,
            popTotal: Math.floor(popData.popCount * 2.5),
            popHigher: popData.popHigher,
            lastChecked: new Date().toISOString(),
            source: 'simulated',
            badge: ScarcityService.getBadgeType(popData.popCount, popData.popHigher)
          };
          return { ...card, ...popData, popReport };
        }
        return card;
      });

      if (hydrated) {
        setInventory(updatedInventory);
        if (import.meta.env.DEV) console.warn(`Hydrated cards with scarcity data.`);
      }
    }
  }, [inventory, setInventory]);

  // Favorites state
  const { isFavorite, toggleFavorite } = useFavorites();

  // Modal states
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TargetWatchlist | null>(null);
  const [initialTargetData, setInitialTargetData] = useState<Partial<TargetWatchlist> | null>(null);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<CardInventory | null>(null);
  const [initialAssetData, setInitialAssetData] = useState<Partial<CardInventory> | null>(null);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [lightboxCard, setLightboxCard] = useState<CardInventory | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitStrategyCard, setExitStrategyCard] = useState<CardInventory | null>(null);
  const [isGradingCalcOpen, setIsGradingCalcOpen] = useState(false);
  const [gradingCalcCard, setGradingCalcCard] = useState<CardInventory | null>(null);
  const [isBreakEvenOpen, setIsBreakEvenOpen] = useState(false);
  const [breakEvenCard, setBreakEvenCard] = useState<CardInventory | null>(null);
  const [isInstantBuyOpen, setIsInstantBuyOpen] = useState(false);
  const [instantBuyCard, setInstantBuyCard] = useState<CardInventory | null>(null);
  const [isPredictiveOpen, setIsPredictiveOpen] = useState(false);
  const [predictiveCard, setPredictiveCard] = useState<CardInventory | null>(null);
  const [isThesisOpen, setIsThesisOpen] = useState(false);
  const [thesisCard, setThesisCard] = useState<CardInventory | null>(null);

  // Sort state
  const [sortField, setSortField] = useState<SortField>('player');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // Command palette
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Search ref for keyboard shortcut focus
  const searchRef = useRef<HTMLInputElement>(null);

  const { addToast } = useToast();

  // Ensure full inventory is loaded on mount
  useEffect(() => {
    initializeFullInventory();
  }, [initializeFullInventory]);

  const [isPricing, setIsPricing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddToWatchlist = (card: CardInventory) => {
    setInitialTargetData({
      player: card.player,
      cardDescription: `${card.year} ${card.manufacturer} ${card.set} #${card.cardNumber}`,
      sport: card.sport,
      league: card.league,
      targetPrice: card.currentValue || card.purchasePrice,
      notes: `Based on asset in collection acquired on ${new Date(card.purchaseDate).toLocaleDateString()}`
    });
    setEditingTarget(null);
    setIsTargetModalOpen(true);
  };


  const handleAddCard = (card: CardInventory) => {
    addCard(card);
    setInitialAssetData(null); // Clear after adding
  };

  const handleVisionSuccess = (cardData: Partial<CardInventory>) => {
    setInitialAssetData(cardData);
    setEditingAsset(null);
    setIsAssetModalOpen(true);
    setIsOCRModalOpen(false);
  };


  const handleUpdatePrice = async (card: CardInventory) => {
    setIsPricing(card.id);
    const oldValue = card.currentValue || card.purchasePrice;
    try {
      const analysis = await getEbayCardPrice(card);
      if (analysis) {
        setInventory(prev => prev.map(c =>
          c.id === card.id
            ? {
              ...c,
              currentValue: analysis.estimatedValue,
              lastValuationDate: analysis.lastUpdated,
              searchUrl: analysis.searchUrl
            }
            : c
        ));
        const delta = analysis.estimatedValue - oldValue;
        const sign = delta >= 0 ? '+' : '';
        addToast(delta >= 0 ? 'success' : 'warning',
          `${card.player}: $${oldValue.toLocaleString()} → $${analysis.estimatedValue.toLocaleString()} (${sign}$${Math.round(delta).toLocaleString()})`
        );
      } else {
        addToast('error', `Failed to update price for ${card.player}. Try again.`);
      }
    } catch {
      addToast('error', `Price update failed for ${card.player}. Check your connection.`);
    }
    setIsPricing(null);
  };

  const handleSaveExitStrategy = (cardId: string, exitPlan: ExitPlan) => {
    updateCard({
      id: cardId,
      exitPlan,
      exitPlanId: exitPlan.id,
      liquidityScore: LiquidityService.calculateLiquidityScore(inventory.find(c => c.id === cardId)!)
    } as any);
  };

  const deleteCard = (id: string) => {
    const card = inventory.find(c => c.id === id);
    if (!card) return;
    setConfirmState({
      open: true,
      title: 'Remove Asset',
      message: `Remove "${card.player} (${card.year} ${card.set})" from your collection? This can be undone for 8 seconds.`,
      onConfirm: () => {
        removeCard(id);
        setConfirmState(prev => ({ ...prev, open: false }));
        addToast('success', `${card.player} removed from collection.`, {
          onUndo: () => { addCard(card); },
          undoLabel: 'Undo Remove'
        });
      }
    });
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const cards = inventory.filter(c => selectedIds.has(c.id));
    setConfirmState({
      open: true,
      title: `Remove ${selectedIds.size} Assets`,
      message: `Remove ${selectedIds.size} selected assets from your collection?`,
      onConfirm: () => {
        cards.forEach(c => removeCard(c.id));
        setConfirmState(prev => ({ ...prev, open: false }));
        setSelectedIds(new Set());
        setBulkMode(false);
        addToast('success', `${cards.length} assets removed.`, {
          onUndo: () => { cards.forEach(c => addCard(c)); }
        });
      }
    });
  };

  // Bulk export to JSON
  const handleBulkExport = () => {
    const cards = bulkMode && selectedIds.size > 0
      ? inventory.filter(c => selectedIds.has(c.id))
      : inventory.filter(c => c.status !== 'sold');
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `msi_collection_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', `Exported ${cards.length} cards to JSON.`);
  };

  // Toggle bulk selection
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all visible cards
  const selectAll = () => {
    if (selectedIds.size === filteredInventory.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredInventory.map(c => c.id)));
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: '/', description: 'Focus search', action: () => searchRef.current?.focus() },
    { key: 'k', ctrl: true, description: 'Command palette', action: () => setIsPaletteOpen(true) },
    { key: 'n', description: 'Add new card', action: () => { setEditingAsset(null); setInitialAssetData(null); setIsAssetModalOpen(true); } },
    { key: 'Escape', description: 'Clear search / close', global: true, action: () => {
      if (searchQuery) setSearchQuery('');
      else if (bulkMode) { setBulkMode(false); setSelectedIds(new Set()); }
    }},
  ]);

  const filteredInventory = useMemo(() => {
    let result = inventory.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || c.player.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q) ||
        c.manufacturer.toLowerCase().includes(q) ||
        (c.cardNumber && c.cardNumber.toLowerCase().includes(q));
      const matchesLeague = filterLeague === 'All' || c.league === filterLeague;

      if (activeTab === 'inventory') return matchesSearch && matchesLeague && c.status !== 'sold';
      if (activeTab === 'vault') return matchesSearch && matchesLeague && c.status === 'sold';
      return matchesSearch && matchesLeague;
    });

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'player': cmp = a.player.localeCompare(b.player); break;
        case 'value': cmp = (a.currentValue || 0) - (b.currentValue || 0); break;
        case 'purchasePrice': cmp = a.purchasePrice - b.purchasePrice; break;
        case 'date': cmp = new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime(); break;
        case 'roi': {
          const roiA = a.purchasePrice > 0 ? ((a.currentValue || 0) - a.purchasePrice) / a.purchasePrice : 0;
          const roiB = b.purchasePrice > 0 ? ((b.currentValue || 0) - b.purchasePrice) / b.purchasePrice : 0;
          cmp = roiA - roiB;
          break;
        }
        case 'league': cmp = a.league.localeCompare(b.league); break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [inventory, searchQuery, filterLeague, activeTab, sortField, sortDir]);

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
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 relative">
      {/* Migration / Sync Overlay */}
      {(loading || isMigrating) && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-brand-lime/20 border-t-brand-lime rounded-full animate-spin"></div>
            <Cloud className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-lime animate-pulse" size={32} />
          </div>
          <div className="mt-8 text-center space-y-2">
            <h2 className="font-bebas text-4xl tracking-widest text-white">
              {isMigrating ? 'SEQUENCING CLOUD MIGRATION' : 'HYDRATING REPOSITORY'}
            </h2>
            <p className="text-brand-muted font-mono text-xs uppercase tracking-[0.3em]">
              {isMigrating ? 'Transferring local assets to secure cloud terminal...' : 'Establishing encrypted handshake with MSI database...'}
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
              Asset <span className="text-brand-lime">Repository</span>
            </h1>
            <div className={`mt-4 px-3 py-1 rounded-full border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${isCloudSynced ? 'bg-brand-lime/10 border-brand-lime/30 text-brand-lime' : 'bg-slate-800 border-slate-700 text-brand-muted'}`}>
              {isCloudSynced ? (
                <>
                  <Cloud size={12} />
                  Cloud Synced
                </>
              ) : (
                <>
                  <CloudOff size={12} />
                  Local Terminal
                </>
              )}
            </div>
          </div>
          <p className="text-brand-muted max-w-2xl font-medium">Professional grade inventory management and market liquidity tracking.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOCRModalOpen(true)}
            className="flex items-center gap-3 px-6 py-4 bg-brand-charcoal border border-brand-lime/30 text-brand-lime font-black rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-[10px] group"
          >
            <Sparkles size={16} className="group-hover:animate-pulse" />
            AI Alpha Scan
          </button>
          <button
            onClick={() => { setEditingAsset(null); setInitialAssetData(null); setIsAssetModalOpen(true); }}
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
            {['inventory', 'targets', 'vault'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 font-bebas text-2xl tracking-widest transition-all relative capitalize
                ${activeTab === tab ? 'text-brand-lime' : 'text-brand-muted hover:text-white'}`}
              >
                {tab === 'vault' ? 'Sold Vault' : tab}
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
                  ref={searchRef}
                  type="text"
                  placeholder="Search players, sets, manufacturers... (press /)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-slate border border-slate-800 rounded-2xl py-4 pl-12 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium"
                  aria-label="Search collection"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>

              {/* Result count */}
              {searchQuery && (
                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest whitespace-nowrap">
                  {filteredInventory.length} result{filteredInventory.length !== 1 ? 's' : ''}
                </span>
              )}

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full lg:w-auto" role="group" aria-label="Filter by league">
                {['All', ...LEAGUES].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterLeague(s as any)}
                    aria-pressed={filterLeague === s}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border
                      ${filterLeague === s
                        ? 'bg-brand-lime border-brand-lime text-brand-charcoal shadow-lg shadow-brand-lime/20'
                        : 'bg-brand-charcoal border-slate-800 text-brand-muted hover:border-slate-700'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-6 py-4 bg-brand-slate border border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest text-brand-muted hover:text-white transition-all shadow-xl"
                  aria-haspopup="listbox"
                  aria-expanded={showSortMenu}
                >
                  {sortDir === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                  Sort
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-brand-slate border border-slate-700 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150" role="listbox">
                    {([
                      { field: 'player' as SortField, label: 'Name' },
                      { field: 'value' as SortField, label: 'Market Value' },
                      { field: 'purchasePrice' as SortField, label: 'Purchase Price' },
                      { field: 'date' as SortField, label: 'Date Added' },
                      { field: 'roi' as SortField, label: 'ROI' },
                      { field: 'league' as SortField, label: 'League' },
                    ]).map(opt => (
                      <button
                        key={opt.field}
                        role="option"
                        aria-selected={sortField === opt.field}
                        onClick={() => {
                          if (sortField === opt.field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                          else { setSortField(opt.field); setSortDir('asc'); }
                          setShowSortMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors ${sortField === opt.field ? 'text-brand-lime bg-brand-charcoal/50' : 'text-slate-300 hover:bg-brand-charcoal/30'}`}
                      >
                        <span>{opt.label}</span>
                        {sortField === opt.field && (
                          <span className="text-[9px] text-brand-muted">{sortDir === 'asc' ? 'A→Z' : 'Z→A'}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bulk mode toggle */}
              <button
                onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
                className={`flex items-center gap-2 px-4 py-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${bulkMode ? 'bg-brand-lime/10 border-brand-lime/30 text-brand-lime' : 'bg-brand-slate border-slate-800 text-brand-muted hover:text-white'}`}
                aria-pressed={bulkMode}
              >
                <CheckSquare size={18} />
              </button>
            </div>

            {/* Bulk action bar */}
            {bulkMode && (
              <div className="flex items-center gap-4 p-4 bg-brand-slate border border-slate-800 rounded-2xl animate-in slide-in-from-top-2 duration-200">
                <button onClick={selectAll} className="text-xs font-black text-brand-muted hover:text-white transition-colors uppercase tracking-widest">
                  {selectedIds.size === filteredInventory.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-[10px] font-mono text-brand-muted">{selectedIds.size} selected</span>
                <div className="flex-1" />
                <button
                  onClick={handleBulkExport}
                  disabled={selectedIds.size === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-charcoal border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-white disabled:opacity-30 transition-all"
                >
                  <Download size={14} /> Export
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.size === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-red/10 border border-brand-red/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-red hover:bg-brand-red hover:text-white disabled:opacity-30 transition-all"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}

            {/* Empty state for no results */}
            {filteredInventory.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <Search size={48} className="text-brand-muted/30" />
                <h3 className="text-xl font-bold text-brand-muted">
                  {searchQuery ? 'No cards match your search' : 'No cards in collection yet'}
                </h3>
                <p className="text-sm text-brand-muted/60 max-w-md">
                  {searchQuery
                    ? `Try adjusting your search or clearing filters.`
                    : `Add your first card to start tracking your portfolio.`}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setFilterLeague('All'); }}
                    className="px-6 py-3 bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-brand-lime/20 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Assets Grid */}
            {viewMode === 'grid' ? (
              filteredInventory.length > VIRTUAL_THRESHOLD ? (
                <VirtualizedGrid
                  items={filteredInventory}
                  columns={GRID_COLS}
                  cardHeight={CARD_ESTIMATE_HEIGHT}
                  rowGap={ROW_GAP}
                  getRarityTier={getRarityTier}
                  getTierStyles={getTierStyles}
                  isFavorite={isFavorite}
                  toggleFavorite={toggleFavorite}
                  deleteCard={deleteCard}
                  setEditingAsset={setEditingAsset}
                  setIsAssetModalOpen={setIsAssetModalOpen}
                  handleAddToWatchlist={handleAddToWatchlist}
                  handleUpdatePrice={handleUpdatePrice}
                  isPricing={isPricing}
                  getSparklineData={getSparklineData}
                  getPriceTrend={getPriceTrend}
                  onOpenLightbox={(c) => setLightboxCard(c)}
                  onOpenExitStrategy={(c) => { setExitStrategyCard(c); setIsExitModalOpen(true); }}
                  onOpenGradingCalc={(c) => { setGradingCalcCard(c); setIsGradingCalcOpen(true); }}
                  onOpenBreakEven={(c) => { setBreakEvenCard(c); setIsBreakEvenOpen(true); }}
                  onInstantBuy={(c) => { setInstantBuyCard(c); setIsInstantBuyOpen(true); }}
                  onOpenPredictive={(c) => { setPredictiveCard(c); setIsPredictiveOpen(true); }}
                  onOpenThesis={(c) => { setThesisCard(c); setIsThesisOpen(true); }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {filteredInventory.map((card) => (
                    <SwipeableCard
                      key={card.id}
                      onSwipeRight={() => handleAddToWatchlist(card)}
                      onSwipeLeft={() => { setEditingAsset({ ...card, status: 'sold' }); setIsAssetModalOpen(true); }}
                    >
                      <CardGridItem
                        card={card}
                        getRarityTier={getRarityTier}
                        getTierStyles={getTierStyles}
                        isFavorite={isFavorite}
                        toggleFavorite={toggleFavorite}
                        deleteCard={deleteCard}
                        setEditingAsset={setEditingAsset}
                        setIsAssetModalOpen={setIsAssetModalOpen}
                        handleAddToWatchlist={handleAddToWatchlist}
                        handleUpdatePrice={handleUpdatePrice}
                        isPricing={isPricing}
                        getSparklineData={getSparklineData}
                        getPriceTrend={getPriceTrend}
                        onOpenLightbox={(c) => setLightboxCard(c)}
                        onOpenExitStrategy={(c) => { setExitStrategyCard(c); setIsExitModalOpen(true); }}
                        onOpenGradingCalc={(c) => { setGradingCalcCard(c); setIsGradingCalcOpen(true); }}
                        onOpenBreakEven={(c) => { setBreakEvenCard(c); setIsBreakEvenOpen(true); }}
                      />
                    </SwipeableCard>
                  ))}
                </div>
              )
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
                      <th className="px-8 py-4 text-center">Liquidity</th>
                      <th className="px-8 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredInventory.map((card) => (
                      <tr key={card.id} className="hover:bg-brand-lime/5 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <CardImage
                              src={card.image}
                              playerName={card.player}
                              year={card.year}
                              manufacturer={card.manufacturer}
                              className="w-10 h-10 rounded-lg"
                              enableLightbox={true}
                              onImageClick={() => setLightboxCard(card)}
                            />
                            <span className="font-bold text-white">{card.player}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{card.year} {card.manufacturer}</span>
                        </td>
                        <td className="px-8 py-4 text-right font-mono text-sm">${card.purchasePrice.toLocaleString()}</td>
                        <td className="px-8 py-4 text-right font-mono text-sm text-brand-lime">${card.currentValue?.toLocaleString() || '—'}</td>
                        <td className="px-8 py-4 text-center text-[10px] font-black uppercase">{card.isGraded ? `${card.gradingCompany} ${card.grade}` : 'Raw'}</td>
                        <td className="px-8 py-4 text-center">
                          <LiquidityBadge score={card.liquidityScore || LiquidityService.calculateLiquidityScore(card)} size="sm" />
                        </td>
                        <td className="px-8 py-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => toggleFavorite(card)}
                            className={`p-2 transition-colors ${isFavorite(card.id) ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100'}`}
                          >
                            <Star size={16} fill={isFavorite(card.id) ? 'currentColor' : 'none'} />
                          </button>
                          <button onClick={() => { setEditingAsset(card); setIsAssetModalOpen(true); }} className="p-2 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => deleteCard(card.id)} className="p-2 text-slate-500 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={16} />
                          </button>
                          <button onClick={() => handleAddToWatchlist(card)} className="p-2 text-slate-500 hover:text-brand-lime transition-colors opacity-0 group-hover:opacity-100" title="Add to Watchlist">
                            <Target size={16} />
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
          onClose={() => { setIsTargetModalOpen(false); setEditingTarget(null); setInitialTargetData(null); }}
          onAdd={addTarget}
          editTarget={editingTarget}
          initialData={initialTargetData}
          onUpdate={updateTarget}
        />

        {/* Add/Edit Asset Modal */}
        <AddAssetModal
          isOpen={isAssetModalOpen}
          onClose={() => { setIsAssetModalOpen(false); setEditingAsset(null); setInitialAssetData(null); }}
          onAdd={handleAddCard}
          editCard={editingAsset}
          initialData={initialAssetData}
          onUpdate={updateCard}
        />

        <OCRIngestionModal
          isOpen={isOCRModalOpen}
          onClose={() => setIsOCRModalOpen(false)}
          onSuccess={handleVisionSuccess}
        />

        <ImageLightbox
          isOpen={!!lightboxCard}
          onClose={() => setLightboxCard(null)}
          src={lightboxCard?.image}
          alt={lightboxCard?.player ?? ''}
          caption={lightboxCard ? `${lightboxCard.player} • ${lightboxCard.year} ${lightboxCard.manufacturer}` : undefined}
        />

        {exitStrategyCard && (
          <ExitStrategyModal
            isOpen={isExitModalOpen}
            onClose={() => { setIsExitModalOpen(false); setExitStrategyCard(null); }}
            card={exitStrategyCard}
            onSave={handleSaveExitStrategy}
          />
        )}

        {gradingCalcCard && (
          <GradingCalculatorModal
            isOpen={isGradingCalcOpen}
            onClose={() => { setIsGradingCalcOpen(false); setGradingCalcCard(null); }}
            card={gradingCalcCard}
          />
        )}

        {breakEvenCard && (
          <BreakEvenModal
            isOpen={isBreakEvenOpen}
            onClose={() => { setIsBreakEvenOpen(false); setBreakEvenCard(null); }}
            card={breakEvenCard}
          />
        )}

        {instantBuyCard && (
          <InstantBuyModal
            isOpen={isInstantBuyOpen}
            onClose={() => { setIsInstantBuyOpen(false); setInstantBuyCard(null); }}
            card={instantBuyCard}
            onAccept={(card, payout) => {
              setInventory(prev => prev.map(c => c.id === card.id ? { ...c, status: 'sold' as const, salePrice: payout, saleDate: new Date().toISOString() } : c));
              toast.success(`${card.player} sold to MSI House for $${payout.toLocaleString()}`);
            }}
          />
        )}

        {predictiveCard && (
          <PredictiveAlphaModal
            isOpen={isPredictiveOpen}
            onClose={() => { setIsPredictiveOpen(false); setPredictiveCard(null); }}
            card={predictiveCard}
          />
        )}

        {thesisCard && (
          <AgentThesisModal
            isOpen={isThesisOpen}
            onClose={() => { setIsThesisOpen(false); setThesisCard(null); }}
            card={thesisCard}
            portfolio={inventory}
          />
        )}

        <ConfirmDialog
          isOpen={confirmState.open}
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel="Remove"
          variant="danger"
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(prev => ({ ...prev, open: false }))}
        />

        <CommandPalette
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
          onAddCard={() => { setEditingAsset(null); setInitialAssetData(null); setIsAssetModalOpen(true); }}
          onOpenScanner={() => setIsOCRModalOpen(true)}
        />
      </div>
    </div>
  );
};

export default Collection;
