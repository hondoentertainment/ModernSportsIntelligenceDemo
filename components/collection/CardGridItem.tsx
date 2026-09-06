import React from 'react';
import {
  Sparkles,
  Trophy,
  Trash2,
  Edit3,
  Star,
  Target,
  Tag,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { CardInventory } from '../../types';
import CardImage from '../CardImage';
import ScarcityBadge from '../ScarcityBadge';
import { LiquidityBadge } from '../LiquidityBadge';
import { OpportunityBadge } from '../OpportunityBadge';
import Sparkline from '../Sparkline';
import { LiquidityService } from '../../lib/analytics/liquidityService';
import { getStaleValuationLabel, isThinLiquidityScore } from '../../lib/utils/valuationFreshness';
import {
  getValuationSourceChipForCard,
  valuationBadgeVariantForEntity,
} from '../../lib/utils/valuationProvenance';
import DataSourceBadge from '../DataSourceBadge';
import CertVerifiedBadge from '../CertVerifiedBadge';
import { CardItemActionHandlers, getCardItemActionsForSurface } from './cardItemActions';
import SwipeableCard from './SwipeableCard';
import type { SwipeTriageAction } from '../../lib/utils/swipeTriage';

export interface CardGridItemProps extends CardItemActionHandlers {
  card: CardInventory;
  getRarityTier: (_c: CardInventory) => string;
  getTierStyles: (_tier: string) => { border: string; glow?: string; text: string; badge: string };
  getSparklineData: (_id: string, _limit?: number) => number[];
  getPriceTrend: (_id: string) => string;
  onOpenLightbox?: (_card: CardInventory) => void;
  isSelected?: boolean;
  onToggleSelect?: (_id: string) => void;
  onSwipeTriage?: (_card: CardInventory, _action: SwipeTriageAction) => void;
}

/** Renders a single card — shared between virtualized and static grid. Memoized for list performance so parent re-renders don't re-render unchanged items. */
const CardGridItem: React.FC<CardGridItemProps> = React.memo(({
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
  onOpenGradingCalc,
  onOpenBreakEven,
  onInstantBuy,
  onOpenPredictive,
  onOpenThesis,
  onOpenMarketDepth,
  onOpenTaxLot,
  onOpenGradePrediction,
  onOpenPriceHistory,
  onOpenConsignment,
  onOpenAnomaly,
  onOpenDossier,
  isSelected,
  onToggleSelect,
  onSwipeTriage,
}) => {
  const tier = getRarityTier(card);
  const styles = getTierStyles(tier);
  const valuationChip = getValuationSourceChipForCard(card);
  const valuationBadgeVariant = valuationBadgeVariantForEntity(card);
  const staleLabel = getStaleValuationLabel(card.lastValuationDate);
  const showThinMarket = isThinLiquidityScore(card.liquidityScore);
  const mutedChipClass =
    'inline-flex min-h-[26px] items-center rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500 bg-brand-charcoal/35 border border-slate-700/45';
  const bodyActions = getCardItemActionsForSurface(card, {
    isFavorite,
    toggleFavorite,
    deleteCard,
    setEditingAsset,
    setIsAssetModalOpen,
    handleAddToWatchlist,
    handleUpdatePrice,
    isPricing,
    onOpenExitStrategy,
    onOpenGradingCalc,
    onOpenBreakEven,
    onInstantBuy,
    onOpenPredictive,
    onOpenThesis,
    onOpenMarketDepth,
    onOpenTaxLot,
    onOpenGradePrediction,
    onOpenPriceHistory,
    onOpenConsignment,
    onOpenAnomaly,
    onOpenDossier,
  }, 'body');

  const cardBody = (
    <div
      className={`group bg-brand-slate border ${isSelected ? 'border-brand-lime ring-2 ring-brand-lime/20' : styles.border} rounded-[2.5rem] overflow-hidden transition-all flex flex-col active:scale-[0.98] relative`}
    >
      {onToggleSelect && (
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            onToggleSelect(card.id);
          }}
          className={`absolute top-6 left-6 z-20 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-lime border-brand-lime text-brand-charcoal' : 'bg-black/50 border-white/20 text-transparent hover:border-white/50 opacity-0 group-hover:opacity-100'}`}
        >
          <CheckCircle2 size={16} strokeWidth={3} />
        </button>
      )}
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
        <div
          className={`absolute inset-0 bg-gradient-to-t ${styles.glow || 'from-black/80'} via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity`}
        ></div>
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          {tier !== 'Common' && tier !== 'Uncommon' && (
            <div
              className={`${styles.badge} px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2`}
            >
              {tier === 'OneOfOne' ? (
                <Sparkles size={14} fill="currentColor" />
              ) : (
                <Trophy size={14} fill="currentColor" />
              )}
              {tier === 'OneOfOne' ? '1 of 1' : tier}
            </div>
          )}
          {card.isGraded && (
            <div className="bg-brand-lime text-brand-charcoal px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2">
              <Trophy size={14} fill="currentColor" /> {card.gradingCompany} {card.grade}
            </div>
          )}
          {card.certNumber && (
            <CertVerifiedBadge
              key={card.certNumber}
              certNumber={card.certNumber}
              gradingCompany={card.gradingCompany}
              className="shadow-2xl"
            />
          )}
          {card.isAutographed && (
            <div className="bg-white text-brand-charcoal px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2">
              <Sparkles size={14} /> Auto
            </div>
          )}
          {card.status === 'consignment' && card.consignment && (
            <div className="bg-amber-500/20 text-amber-200 border border-amber-500/40 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 max-w-[min(100%,14rem)]">
              <Package size={14} />
              <span className="truncate">Consigned · {card.consignment.houseName}</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <span className={`text-[10px] font-black ${styles.text} uppercase tracking-widest mb-1 block`}>
            {card.sport}
          </span>
          <h3 className="text-2xl font-bold text-white leading-tight truncate">{card.player}</h3>
        </div>
        <button
          onClick={e => {
            e.preventDefault();
            deleteCard(card.id);
          }}
          className="absolute top-6 right-6 p-3 bg-brand-red/10 text-brand-red rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-red hover:text-white backdrop-blur-md"
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={e => {
            e.preventDefault();
            setEditingAsset(card);
            setIsAssetModalOpen(true);
          }}
          className="absolute top-6 right-20 p-3 bg-brand-charcoal/30 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-charcoal hover:text-brand-lime backdrop-blur-md"
        >
          <Edit3 size={20} />
        </button>
        <button
          onClick={e => {
            e.preventDefault();
            toggleFavorite(card);
          }}
          className={`absolute top-6 right-[8.5rem] p-3 rounded-xl transition-all backdrop-blur-md ${isFavorite(card.id) ? 'bg-amber-500/20 text-amber-400 opacity-100' : 'bg-brand-charcoal/30 text-white opacity-0 group-hover:opacity-100 hover:bg-amber-500/20 hover:text-amber-400'}`}
        >
          <Star size={20} fill={isFavorite(card.id) ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={e => {
            e.preventDefault();
            handleAddToWatchlist(card);
          }}
          className="absolute top-6 right-[12rem] p-3 bg-brand-charcoal/30 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-charcoal hover:text-brand-lime backdrop-blur-md"
          title="Add to Watchlist"
        >
          <Target size={20} />
        </button>
        {card.status !== 'sold' && (
          <button
            onClick={e => {
              e.preventDefault();
              setEditingAsset({ ...card, status: 'sold' });
              setIsAssetModalOpen(true);
            }}
            className="absolute top-6 left-6 p-3 bg-brand-red/10 text-brand-red rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-red hover:text-white backdrop-blur-md"
            title="Mark as Sold"
          >
            <Tag size={20} />
          </button>
        )}
      </div>
      <div className="p-8 space-y-6 flex-1">
        <div>
          <p className="text-[10px] text-brand-muted font-black tracking-widest uppercase mb-1">
            {card.year} {card.manufacturer}
          </p>
          <p className="text-sm font-bold text-slate-300 truncate">
            {card.set} #{card.cardNumber}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-brand-charcoal/40 border border-slate-800/50 rounded-2xl">
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">Book Value</p>
            <p className="text-sm font-mono font-black text-slate-200">
              ${Math.round(card.purchasePrice).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-brand-lime/5 border border-brand-lime/10 rounded-2xl">
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-1">Market Nav</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono font-black text-brand-lime">
                {card.currentValue ? `$${Math.round(card.currentValue).toLocaleString()}` : '—'}
              </p>
              {card.currentValue !== undefined && (
                <OpportunityBadge asset={card} size="sm" showLabel={false} />
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex min-h-[26px] items-center rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider ${valuationChip.className}`}>
                {valuationChip.label}
              </span>
              <DataSourceBadge variant={valuationBadgeVariant} size="xs" className="ml-1" />
              {staleLabel && <span className={mutedChipClass}>{staleLabel}</span>}
              {showThinMarket && <span className={mutedChipClass}>Thin market</span>}
            </div>
          </div>
        </div>
        {card.pricingRationale && (
          <div className="p-4 bg-brand-lime/5 border border-brand-lime/10 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-brand-lime" />
              <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Market Rationale</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300 italic">&quot;{card.pricingRationale}&quot;</p>
          </div>
        )}
        {(card.popReport || card.popCount !== undefined) && (
          <div className="flex items-center justify-between p-4 bg-brand-charcoal/30 border border-slate-800/30 rounded-2xl">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${card.scarcityIndex && card.scarcityIndex > 80 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-slate-600'}`}
              ></div>
              <span className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">
                Pop Intelligence
              </span>
            </div>
            <ScarcityBadge report={card.popReport} />
            {!card.popReport && card.popCount !== undefined && (
              <div className="text-right">
                <span className="text-xs font-black text-white">Pop {card.popCount}</span>
                {card.popHigher !== undefined && card.popHigher < 5 && (
                  <span className="text-[9px] font-bold text-brand-muted ml-1">
                    ({card.popHigher === 0 ? 'None' : card.popHigher} Higher)
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        <div
          className="flex items-center justify-between p-4 bg-brand-charcoal/30 border border-slate-800/30 rounded-2xl cursor-pointer hover:bg-brand-charcoal/50 transition-colors"
          onClick={() => onOpenExitStrategy?.(card)}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${(card.liquidityScore || 0) > 70 ? 'bg-brand-green shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}
            ></div>
            <span className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">Market Depth</span>
          </div>
          <LiquidityBadge
            score={card.liquidityScore || LiquidityService.calculateLiquidityScore(card)}
            size="sm"
          />
        </div>
        <div className="bg-brand-charcoal/30 border border-slate-800/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black text-brand-muted uppercase tracking-tighter">Price Trend</span>
            {getPriceTrend(card.id) !== 'stable' && (
              <span
                className={`text-[9px] font-black uppercase ${getPriceTrend(card.id) === 'up' ? 'text-brand-green' : 'text-brand-red'}`}
              >
                {getPriceTrend(card.id) === 'up' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <Sparkline data={getSparklineData(card.id)} showTrend={true} height={32} />
        </div>
        {bodyActions.map(action => {
          const Icon = action.icon;
          const lime = action.tone === 'lime';
          const className = lime
            ? 'w-full flex items-center justify-center gap-3 py-3.5 bg-brand-lime/10 hover:bg-brand-lime/20 border border-brand-lime/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-brand-lime transition-all'
            : 'w-full flex items-center justify-center gap-3 py-3.5 bg-brand-charcoal hover:bg-slate-800 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all disabled:opacity-50';
          const icon = action.busy ? (
            <div className="w-4 h-4 border-2 border-brand-lime border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Icon size={16} className={action.iconClassName} />
          );

          if (action.href) {
            return (
              <a
                key={action.id}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {icon} {action.label}
              </a>
            );
          }

          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              disabled={action.busy}
              className={className}
            >
              {icon}
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!onSwipeTriage) return cardBody;

  return (
    <SwipeableCard
      onKeep={() => onSwipeTriage(card, 'keep')}
      onSell={() => onSwipeTriage(card, 'sell')}
      onConsign={() => onSwipeTriage(card, 'consign')}
      onReview={() => onSwipeTriage(card, 'review')}
    >
      {cardBody}
    </SwipeableCard>
  );
});

CardGridItem.displayName = 'CardGridItem';

export default CardGridItem;
