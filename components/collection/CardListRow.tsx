import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CardInventory } from '../../types';
import CardImage from '../CardImage';
import { LiquidityBadge } from '../LiquidityBadge';
import { LiquidityService } from '../../lib/analytics/liquidityService';
import { valuationBadgeVariantForEntity } from '../../lib/utils/valuationProvenance';
import { compsUsedForPreferred, preferredValuationForCard } from '../../lib/pricing/compConsensus';
import { buildPricingTruthForCard, chipsFromPricingTruth } from '../../lib/pricing/pricingTruth';
import ValuationProvenanceChips from '../ValuationProvenanceChips';
import CompsUsedPanel from '../CompsUsedPanel';
import ScarcityBadge from '../ScarcityBadge';
import SeasonalWindowChip from '../SeasonalWindowChip';
import Sparkline from '../Sparkline';
import { getCardSparkline } from '../../lib/analytics/priceHistory';
import CardItemActionIcons from './CardItemActionIcons';
import { CardItemActionHandlers } from './cardItemActions';
import BreakEvenStrip from '../BreakEvenStrip';

export interface CardListRowProps extends CardItemActionHandlers {
  card: CardInventory;
  isSelected?: boolean;
  onToggleSelect?: (_id: string) => void;
  onOpenLightbox?: (_card: CardInventory) => void;
}

const CardListRow: React.FC<CardListRowProps> = React.memo(({
  card,
  isSelected,
  onToggleSelect,
  onOpenLightbox,
  ...actionHandlers
}) => {
  const preferred = preferredValuationForCard(card);
  const truth = buildPricingTruthForCard(card);
  const truthChips = chipsFromPricingTruth(truth);
  const displayNav = truth.value || card.currentValue;
  const sparkline = getCardSparkline(card);

  return (
    <tr className={`hover:bg-brand-lime/5 transition-colors group ${isSelected ? 'bg-brand-lime/10' : ''}`}>
      {onToggleSelect && (
        <td className="px-4 py-4 w-12">
          <button
            type="button"
            role="checkbox"
            aria-checked={!!isSelected}
            aria-label={`Select ${card.player}`}
            onClick={() => onToggleSelect(card.id)}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-brand-lime border-brand-lime text-brand-charcoal'
                : 'bg-transparent border-white/20 text-transparent hover:border-white/50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
            }`}
          >
            <CheckCircle2 size={16} strokeWidth={3} />
          </button>
        </td>
      )}
      <td className="px-8 py-4">
        <div className="flex items-center gap-4">
          <CardImage
            src={card.image}
            playerName={card.player}
            year={card.year}
            manufacturer={card.manufacturer}
            className="w-10 h-10 rounded-lg"
            enableLightbox={!!onOpenLightbox}
            onImageClick={onOpenLightbox ? () => onOpenLightbox(card) : undefined}
          />
          <div className="min-w-0">
            <span className="font-bold text-white">{card.player}</span>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <SeasonalWindowChip card={card} />
              {card.popReport && <ScarcityBadge report={card.popReport} />}
            </div>
          </div>
        </div>
      </td>
      <td className="px-8 py-4">
        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
          {card.year} {card.manufacturer}
        </span>
      </td>
      <td className="px-8 py-4 text-right font-mono text-sm">
        ${(card.purchasePrice ?? 0).toLocaleString()}
      </td>
      <td className="px-8 py-4 text-right">
        <p className="font-mono text-sm text-brand-lime">${displayNav ? displayNav.toLocaleString() : '—'}</p>
        <ValuationProvenanceChips
          className="mt-2 justify-end"
          sourceChip={truthChips.sourceChip}
          badgeVariant={valuationBadgeVariantForEntity({ ...card, valuationSource: preferred.source })}
          staleLabel={truthChips.staleLabel}
          thinMarket={truthChips.thinMarket}
          lowLiquidityLabel={truthChips.lowLiquidityLabel}
          compsCount={truthChips.compsCount}
          title={truthChips.title}
        />
        <CompsUsedPanel compact view={compsUsedForPreferred(preferred, card.salesData)} />
        {card.status !== 'sold' && (
          <div className="mt-2">
            <BreakEvenStrip card={card} compact onOpenFull={actionHandlers.onOpenBreakEven} />
          </div>
        )}
      </td>
      <td className="px-8 py-4">
        <Sparkline data={sparkline.values} showTrend={true} height={28} />
        <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-brand-muted">
          {sparkline.source === 'thin' ? 'Awaiting points' : sparkline.source}
        </p>
      </td>
      <td className="px-8 py-4 text-center text-[10px] font-black uppercase">
        {card.isGraded ? `${card.gradingCompany} ${card.grade}` : 'Raw'}
      </td>
      <td className="px-8 py-4 text-center">
        <LiquidityBadge
          score={card.liquidityScore || LiquidityService.calculateLiquidityScore(card)}
          size="sm"
        />
      </td>
      <td className="px-8 py-4 text-right">
        <CardItemActionIcons card={card} {...actionHandlers} />
      </td>
    </tr>
  );
});

CardListRow.displayName = 'CardListRow';

export default CardListRow;
