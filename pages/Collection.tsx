
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  Search,
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
  Clock,
  XCircle,
  CheckSquare,
  Trash2,
  Download,
  Sparkles,
  Cloud,
  CloudOff,
  Star,
  Calculator,
  Share2,
  BriefcaseBusiness
} from 'lucide-react';
import {
  CardInventory,
  TargetWatchlist,
  League,
  ExitPlan,
} from '../types';
import { Link } from 'react-router-dom';
import { CardInventory, TargetWatchlist, League, ExitPlan } from '../types';
import { getEbayCardPrice } from '../lib/utils/gemini';
import { logger } from '../lib/logger';
import { LEAGUES } from '../constants';
import { useSupabaseInventory } from '../lib/utils/useSupabaseInventory';
import { useFavorites } from '../lib/utils/useFavorites';
import AddTargetModal from '../components/AddTargetModal';
import AddAssetModal from '../components/AddAssetModal';
import OCRIngestionModal from '../components/OCRIngestionModal';
import { getRarityTier, getTierStyles } from '../lib/utils/rarity';
import { generatePopData, ScarcityService } from '../lib/analytics/scarcityService';
import Sparkline from '../components/Sparkline';
import { getPriceTrend, getSparklineData } from '../lib/analytics/priceHistory';
import { Loader2, Cloud, CloudOff } from 'lucide-react';
import CardImage from '../components/CardImage';
import ImageLightbox from '../components/ImageLightbox';
import ScarcityBadge from '../components/ScarcityBadge';
import GradingAuditModal from '../components/GradingAuditModal';
import { LiquidityBadge } from '../components/LiquidityBadge';
import { ExitStrategyModal } from '../components/ExitStrategyModal';
import GradingCalculatorModal from '../components/GradingCalculatorModal';
import BreakEvenModal from '../components/BreakEvenModal';
import InstantBuyModal from '../components/InstantBuyModal';
import PredictiveAlphaModal from '../components/PredictiveAlphaModal';
import AgentThesisModal from '../components/AgentThesisModal';
import MarketDepthModal from '../components/MarketDepthModal';
import TaxReportModal from '../components/TaxReportModal';
import GradingPredictionModal from '../components/GradingPredictionModal';
import PriceHistoryModal from '../components/PriceHistoryModal';
import ConsignmentModal from '../components/ConsignmentModal';
import AnomalyDetailModal from '../components/AnomalyDetailModal';
import { MarketAnomaly, detectAnomalies } from '../lib/analytics/anomalyDetectionService';
import ConfirmDialog from '../components/ConfirmDialog';
import CommandPalette from '../components/CommandPalette';
import CardGridItem from '../components/collection/CardGridItem';
import SwipeableCard from '../components/collection/SwipeableCard';
import VirtualizedGrid from '../components/collection/VirtualizedGrid';
import { useKeyboardShortcuts } from '../lib/utils/useKeyboardShortcuts';

type SortField = 'player' | 'value' | 'purchasePrice' | 'date' | 'roi' | 'league';
type SortDir = 'asc' | 'desc';
import { LiquidityService } from '../lib/analytics/liquidityService';
import { OpportunityBadge } from '../components/OpportunityBadge';
import { useVirtualizer } from '@tanstack/react-virtual';
import GradingPremiumTool from '../components/GradingPremiumTool';
import ShareAlphaModal from '../components/ShareAlphaModal';
import { fetchPublicProfile } from '../lib/social/socialService';
import { useAuth } from '../contexts/AuthContext';

const VIRTUAL_THRESHOLD = 24;
const GRID_COLS = 4;
const CARD_ESTIMATE_HEIGHT = 480;
const ROW_GAP = 32;

interface CardGridItemProps {
  card: CardInventory;
  getRarityTier: (c: CardInventory) => string;
  getTierStyles: (tier: string) => { border: string; glow?: string; text: string; badge: string };
  isFavorite: (id: string) => boolean;
  toggleFavorite: (c: CardInventory) => void;
  deleteCard: (id: string) => void;
  setEditingAsset: (c: CardInventory | null) => void;
  setIsAssetModalOpen: (v: boolean) => void;
  handleAddToWatchlist: (c: CardInventory) => void;
  handleUpdatePrice: (c: CardInventory) => void;
  isPricing: string | null;
  getSparklineData: (id: string, limit?: number) => number[];
  getPriceTrend: (id: string) => string;
  onOpenLightbox?: (card: CardInventory) => void;
  onOpenExitStrategy?: (card: CardInventory) => void;
  onOpenGradingPremium?: (card: CardInventory) => void;
  onOpenDossier?: (card: CardInventory) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  key?: React.Key;
}

/** Renders a single card - shared between virtualized and static grid */
function CardGridItem({
  card,
  getRarityTier,
  getTierStyles,
  isFavorite,
  toggleFavorite,
  deleteCard,
  setEditingAsset,
  setIsAssetModalOpen,
  handleAddToWatchlist,
  handleUpdatePrice,
  isPricing,
  getSparklineData,
  getPriceTrend,
  onOpenLightbox,
  onOpenExitStrategy,
  onOpenGradingPremium,
  onOpenDossier,
  isSelected,
  onToggleSelect,
}: CardGridItemProps) {
  const tier = getRarityTier(card);
  const styles = getTierStyles(tier);
  return (
    <div className={`group bg-brand-slate border ${isSelected ? 'border-brand-lime ring-2 ring-brand-lime/20' : styles.border} rounded-[2.5rem] overflow-hidden transition-all flex flex-col active:scale-[0.98] relative`}>
      {/* Selection Checkbox */}
      <button
        onClick={(e) => { e.preventDefault(); onToggleSelect?.(card.id); }}
        className={`absolute top-6 left-6 z-20 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-lime border-brand-lime text-brand-charcoal' : 'bg-black/50 border-white/20 text-transparent hover:border-white/50 opacity-0 group-hover:opacity-100'}`}
      >
        <CheckCircle2 size={16} strokeWidth={3} />
      </button>

      <div className="aspect-[4/5] bg-slate-950 relative overflow-hidden group">
        <CardImage
          src={card.image}
          playerName={card.player}
          year={card.year}
          manufacturer={card.manufacturer}
          className="w-full h-full"
          enableLightbox={!!onOpenLightbox}
          onImageClick={onOpenLightbox ? () => onOpenLightbox(card) : undefined}
        />
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
        <button onClick={(e) => { e.preventDefault(); deleteCard(card.id); }} className="absolute top-6 right-6 p-3 bg-brand-red/10 text-brand-red rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-red hover:text-white backdrop-blur-md"><Trash2 size={20} /></button>
        <button onClick={(e) => { e.preventDefault(); setEditingAsset(card); setIsAssetModalOpen(true); }} className="absolute top-6 right-20 p-3 bg-brand-charcoal/30 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-charcoal hover:text-brand-lime backdrop-blur-md"><Edit3 size={20} /></button>
        <button onClick={(e) => { e.preventDefault(); toggleFavorite(card); }} className={`absolute top-6 right-[8.5rem] p-3 rounded-xl transition-all backdrop-blur-md ${isFavorite(card.id) ? 'bg-amber-500/20 text-amber-400 opacity-100' : 'bg-brand-charcoal/30 text-white opacity-0 group-hover:opacity-100 hover:bg-amber-500/20 hover:text-amber-400'}`}><Star size={20} fill={isFavorite(card.id) ? 'currentColor' : 'none'} /></button>
        <button onClick={(e) => { e.preventDefault(); handleAddToWatchlist(card); }} className="absolute top-6 right-[12rem] p-3 bg-brand-charcoal/30 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-charcoal hover:text-brand-lime backdrop-blur-md" title="Add to Watchlist"><Target size={20} /></button>
        {card.status !== 'sold' && (
          <button
            onClick={(e) => { e.preventDefault(); setEditingAsset({ ...card, status: 'sold' }); setIsAssetModalOpen(true); }}
            className="absolute top-6 left-6 p-3 bg-brand-red/10 text-brand-red rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-red hover:text-white backdrop-blur-md"
            title="Mark as Sold"
          >
            <Tag size={20} />
          </button>
        )}
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
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono font-black text-brand-lime">{card.currentValue ? `$${Math.round(card.currentValue).toLocaleString()}` : '—'}</p>
              {card.currentValue !== undefined && <OpportunityBadge asset={card} size="sm" showLabel={false} />}
            </div>
          </div>
        </div>
        {card.pricingRationale && (
          <div className="p-4 bg-brand-lime/5 border border-brand-lime/10 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-brand-lime" />
              <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Market Rationale</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300 italic">
              "{card.pricingRationale}"
            </p>
          </div>
        )}
        {
          (card.popReport || card.popCount !== undefined) && (
            <div className="flex items-center justify-between p-4 bg-brand-charcoal/30 border border-slate-800/30 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${card.scarcityIndex && card.scarcityIndex > 80 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-slate-600'}`}></div>
                <span className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">Pop Intelligence</span>
              </div>
              <ScarcityBadge report={card.popReport} />
              {!card.popReport && card.popCount !== undefined && (
                <div className="text-right">
                  <span className="text-xs font-black text-white">Pop {card.popCount}</span>
                  {card.popHigher !== undefined && card.popHigher < 5 && (
                    <span className="text-[9px] font-bold text-brand-muted ml-1">({card.popHigher === 0 ? 'None' : card.popHigher} Higher)</span>
                  )}
                </div>
              )}
            </div>
          )
        }
        <div className="flex items-center justify-between p-4 bg-brand-charcoal/30 border border-slate-800/30 rounded-2xl cursor-pointer hover:bg-brand-charcoal/50 transition-colors" onClick={() => onOpenExitStrategy?.(card)}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${(card.liquidityScore || 0) > 70 ? 'bg-brand-green shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
            <span className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">Market Depth</span>
          </div>
          <LiquidityBadge score={card.liquidityScore || LiquidityService.calculateLiquidityScore(card)} size="sm" />
        </div>
        <div className="bg-brand-charcoal/30 border border-slate-800/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">Price Trend</span>
            {getPriceTrend(card.id) !== 'stable' && (
              <span className={`text-[9px] font-black uppercase ${getPriceTrend(card.id) === 'up' ? 'text-brand-green' : 'text-brand-red'}`}>{getPriceTrend(card.id) === 'up' ? '↑' : '↓'}</span>
            )}
          </div>
          <Sparkline data={getSparklineData(card.id)} showTrend={true} height={32} />
        </div>
        <button onClick={() => handleUpdatePrice(card)} disabled={isPricing === card.id} className="w-full flex items-center justify-center gap-3 py-3.5 bg-brand-charcoal hover:bg-slate-800 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all disabled:opacity-50">
          {isPricing === card.id ? <div className="w-4 h-4 border-2 border-brand-lime border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={16} className="text-brand-lime" />}
          Intelligence Check
        </button>
        <button
          onClick={() => onOpenDossier?.(card)}
          className="w-full flex items-center justify-center gap-3 py-3.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200 transition-all"
        >
          <BriefcaseBusiness size={16} />
          Audit Dossier
        </button>
        {
          card.searchUrl && (
            <a href={card.searchUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 py-3.5 bg-brand-lime/10 hover:bg-brand-lime/20 border border-brand-lime/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-brand-lime transition-all"><Search size={16} /> Verify on eBay</a>
          )
        }
      </div >
    </div >
  );
}

function VirtualizedGrid({
  items,
  columns,
  cardHeight,
  rowGap,
  getRarityTier,
  getTierStyles,
  isFavorite,
  toggleFavorite,
  deleteCard,
  setEditingAsset,
  setIsAssetModalOpen,
  handleAddToWatchlist,
  handleUpdatePrice,
  isPricing,
  getSparklineData,
  getPriceTrend,
  onOpenLightbox,
  onOpenExitStrategy,
  onOpenGradingPremium,
  onOpenDossier,
}: {
  items: CardInventory[];
  columns: number;
  cardHeight: number;
  rowGap: number;
  getRarityTier: (c: CardInventory) => string;
  getTierStyles: (tier: string) => { border: string; glow?: string; text: string; badge: string };
  isFavorite: (id: string) => boolean;
  toggleFavorite: (c: CardInventory) => void;
  deleteCard: (id: string) => void;
  setEditingAsset: (c: CardInventory | null) => void;
  setIsAssetModalOpen: (v: boolean) => void;
  handleAddToWatchlist: (c: CardInventory) => void;
  handleUpdatePrice: (c: CardInventory) => void;
  isPricing: string | null;
  getSparklineData: (id: string, limit?: number) => number[];
  getPriceTrend: (id: string) => string;
  onOpenLightbox?: (card: CardInventory) => void;
  onOpenExitStrategy?: (card: CardInventory) => void;
  onOpenGradingPremium?: (card: CardInventory) => void;
  onOpenDossier?: (card: CardInventory) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(items.length / columns);
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => cardHeight + rowGap,
    overscan: 3,
    gap: rowGap,
  });
  return (
    <div ref={parentRef} className="h-[calc(100vh-340px)] min-h-[420px] overflow-y-auto rounded-2xl">
      <div
        style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const start = virtualRow.index * columns;
          const rowItems = items.slice(start, start + columns);
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
            >
              {rowItems.map((card) => (
                <CardGridItem
                  key={card.id}
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
                  onOpenLightbox={onOpenLightbox}
                  onOpenExitStrategy={onOpenExitStrategy}
                  onOpenGradingPremium={onOpenGradingPremium}
                  onOpenDossier={onOpenDossier}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
    loading,
    syncStatus,
    lastSyncError
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
            popHigher: card.grade === '10' ? 0 : Math.floor(popData.popCount * 0.15),
            lastChecked: new Date().toISOString(),
            source: 'simulated',
            badge: ScarcityService.getBadgeType(popData.popCount, card.grade === '10' ? 0 : 5)
          };
          return { ...card, ...popData, popReport };
        }
        return card;
      });

      if (hydrated) {
        setInventory(updatedInventory);
        logger.log(`Hydrated cards with scarcity data.`);
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
  const [isGradingAuditOpen, setIsGradingAuditOpen] = useState(false);
  const [lightboxCard, setLightboxCard] = useState<CardInventory | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [exitStrategyCard, setExitStrategyCard] = useState<CardInventory | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [premiumCard, setPremiumCard] = useState<CardInventory | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.email) {
      // For demo, we use the user's email prefix as username
      const username = user.email.split('@')[0];
      fetchPublicProfile(username).then(profile => {
        if (profile) setUserProfile(profile);
      });
    }
  }, [user]);

  // Ensure full inventory is loaded on mount
  useEffect(() => {
    initializeFullInventory();
  }, [initializeFullInventory]);

  const [isPricing, setIsPricing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());
  const selectAll = () => setSelectedIds(new Set(filteredInventory.map(c => c.id)));

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
    const analysis = await getEbayCardPrice(card);
    if (analysis) {
      setInventory(prev => prev.map(c =>
        c.id === card.id
          ? {
            ...c,
            currentValue: analysis.estimatedValue,
            lastValuationDate: analysis.lastUpdated,
            searchUrl: analysis.searchUrl,
            pricingRationale: analysis.rationale
          }
          : c
      ));
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

  const filteredInventory = useMemo(() => {
    return inventory.filter(c => {
      const matchesSearch = c.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.set.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLeague = filterLeague === 'All' || c.league === filterLeague;

      if (activeTab === 'inventory') return matchesSearch && matchesLeague && c.status !== 'sold';
      if (activeTab === 'vault') return matchesSearch && matchesLeague && c.status === 'sold';
      return matchesSearch && matchesLeague;
    });
  }, [inventory, searchQuery, filterLeague, activeTab]);

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

      {lastSyncError && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <span className="font-semibold">Repository sync is running in a degraded state.</span>
            <span className="text-xs uppercase tracking-widest text-amber-300">
              {syncStatus === 'offline' ? 'Offline Cache' : syncStatus}
            </span>
          </div>
          <p className="mt-2 text-amber-200/90">{lastSyncError}</p>
        </section>
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
          <Link
            to="/audit-dossier"
            className="flex items-center gap-3 px-6 py-4 bg-slate-950 border border-cyan-500/20 text-cyan-200 font-black rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-[10px]"
          >
            <BriefcaseBusiness size={16} />
            Audit Dossier
          </Link>
          <button
            onClick={() => setIsOCRModalOpen(true)}
            className="flex items-center gap-3 px-6 py-4 bg-brand-charcoal border border-brand-lime/30 text-brand-lime font-black rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-[10px] group"
          >
            <Sparkles size={16} className="group-hover:animate-pulse" />
            AI Alpha Scan
          </button>
          <button
            onClick={() => setIsGradingAuditOpen(true)}
            className="flex items-center gap-3 px-6 py-4 bg-brand-charcoal border border-brand-lime/30 text-brand-lime font-black rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-[10px] group"
          >
            <Search size={16} className="group-hover:animate-pulse" />
            Visual Audit
          </button>
          <button
            onClick={() => { setEditingAsset(null); setInitialAssetData(null); setIsAssetModalOpen(true); }}
            className="flex items-center gap-3 px-10 py-4 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all shadow-xl shadow-brand-lime/20 active:scale-95 uppercase tracking-widest text-xs"
          >
            <Plus size={18} strokeWidth={4} />
            Add Asset
          </button>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-4 bg-brand-slate border border-slate-800 rounded-2xl text-brand-muted hover:text-brand-lime transition-all shadow-lg active:scale-95"
            title="Share Portfolio Alpha"
          >
            <Share2 size={18} />
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

            {/* Bulk Actions Floating Bar */}
            {selectedIds.size > 0 && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-12 duration-500">
                <div className="bg-brand-charcoal/90 backdrop-blur-xl border border-brand-lime/30 rounded-full px-6 py-3 shadow-2xl flex items-center gap-6">
                  <span className="text-xs font-black text-white uppercase tracking-widest border-r border-slate-700 pr-6 mr-2">
                    {selectedIds.size} Selected
                  </span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={clearSelection}
                      className="text-[10px] font-black text-brand-muted uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      className="flex items-center gap-2 px-5 py-2 bg-brand-lime text-brand-charcoal rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95"
                    >
                      <History size={14} /> Mark Sold
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Mass delete ${selectedIds.size} assets?`)) {
                          selectedIds.forEach(id => removeCard(id));
                          clearSelection();
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-2 bg-brand-red text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all active:scale-95"
                    >
                      <Trash2 size={14} /> Batch Delete
                    </button>
                  </div>
                </div>
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
                  onOpenGradingPremium={(c) => { setPremiumCard(c); setIsPremiumModalOpen(true); }}
                  onOpenDossier={(c) => window.location.hash = `/audit-dossier?cardId=${c.id}`}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {filteredInventory.map((card) => (
                    <CardGridItem
                      key={card.id}
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
                      onOpenDossier={(c) => window.location.hash = `/audit-dossier?cardId=${c.id}`}
                      isSelected={selectedIds.has(card.id)}
                      onToggleSelect={toggleSelection}
                    />
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
                          <button onClick={() => window.location.hash = `/audit-dossier?cardId=${card.id}`} className="p-2 text-slate-500 hover:text-cyan-300 transition-colors opacity-0 group-hover:opacity-100" title="Open Audit Dossier">
                            <BriefcaseBusiness size={16} />
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

                      {target.pricingRationale && (
                        <div className="p-4 bg-brand-lime/5 border border-brand-lime/10 rounded-xl mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={12} className="text-brand-lime" />
                            <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Pricing Intelligence</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-300 italic">
                            "{target.pricingRationale}"
                          </p>
                        </div>
                      )}

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

        <GradingAuditModal
          isOpen={isGradingAuditOpen}
          onClose={() => setIsGradingAuditOpen(false)}
          onComplete={(res) => {
            logger.log('Visual Audit Complete:', res);
            setIsGradingAuditOpen(false);
          }}
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

        {/* Grading Premium Modal */}
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isPremiumModalOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsPremiumModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-brand-charcoal border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-lime/10 rounded-lg text-brand-lime text-xs font-black uppercase tracking-widest border border-brand-lime/20">
                  Phase 13
                </div>
                <h2 className="text-xl font-bebas tracking-wide text-white">Grading <span className="text-brand-lime">Premium</span></h2>
              </div>
              <button
                onClick={() => setIsPremiumModalOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
              >
                <Plus className="rotate-45" size={20} />
              </button>
            </div>
            <div className="p-6">
              {premiumCard && <GradingPremiumTool card={premiumCard} />}
            </div>
          </div>
        </div>

        {userProfile && (
          <ShareAlphaModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            profile={userProfile}
            onToggleVisibility={(isPublic) => {
              setUserProfile({ ...userProfile, isPublic });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Collection;
