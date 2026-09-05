import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CardInventory } from '../../types';
import CardImage from '../CardImage';
import { LiquidityBadge } from '../LiquidityBadge';
import { LiquidityService } from '../../lib/analytics/liquidityService';
import { getStaleValuationLabel } from '../../lib/utils/valuationFreshness';
import { getValuationSourceChipForCard } from '../../lib/utils/valuationProvenance';
import CardItemActionIcons from './CardItemActionIcons';
import { CardItemActionHandlers } from './cardItemActions';

export interface CardListRowProps extends CardItemActionHandlers {
  card: CardInventory;
  isSelected?: boolean;
  onToggleSelect?: (_id: string) => void;
  onOpenLightbox?: (_card: CardInventory) => void;
}

const CardListRow: React.FC<CardListRowProps> = ({
  card,
  isSelected,
  onToggleSelect,
  onOpenLightbox,
  ...actionHandlers
}) => {
  const staleLabel = getStaleValuationLabel(card.lastValuationDate);
  const valuationChip = getValuationSourceChipForCard(card);

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
          <span className="font-bold text-white">{card.player}</span>
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
        <p className="font-mono text-sm text-brand-lime">${card.currentValue?.toLocaleString() || '—'}</p>
        <div className="mt-2 flex justify-end gap-1.5">
          <span
            className={`inline-flex items-center rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider ${valuationChip.className}`}
          >
            {valuationChip.label}
          </span>
          {staleLabel && (
            <span className="inline-flex items-center rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500 bg-brand-charcoal/35 border border-slate-700/45">
              {staleLabel}
            </span>
          )}
        </div>
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
};

CardListRow.displayName = 'CardListRow';

export default CardListRow;
