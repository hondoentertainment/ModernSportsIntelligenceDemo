import React, { useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CardInventory } from '../../types';
import CardListRow, { CardListRowProps } from './CardListRow';

type VirtualizedListProps = Omit<CardListRowProps, 'card' | 'isSelected'> & {
  items: CardInventory[];
  rowHeight?: number;
  isItemSelected?: (id: string) => boolean;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
};

const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  rowHeight = 96,
  isItemSelected,
  onSelectAll,
  onClearSelection,
  onToggleSelect,
  ...rowProps
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const allSelected = items.length > 0 && items.every((card) => isItemSelected?.(card.id));

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
    getItemKey: (index) => items[index]?.id ?? index,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0 ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-340px)] min-h-[420px] overflow-y-auto rounded-[2rem] border border-slate-800 bg-brand-slate"
    >
      <table className="w-full text-left">
        <thead className="sticky top-0 z-10 bg-brand-charcoal/95 text-[10px] font-black uppercase tracking-widest text-brand-muted border-b border-slate-800">
          <tr>
            <th className="px-4 py-4 w-12">
              <button
                type="button"
                role="checkbox"
                aria-checked={allSelected}
                aria-label={allSelected ? 'Clear selection' : 'Select all'}
                onClick={() => {
                  if (allSelected) onClearSelection?.();
                  else onSelectAll?.();
                }}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  allSelected
                    ? 'bg-brand-lime border-brand-lime text-brand-charcoal'
                    : 'bg-transparent border-white/20 text-slate-500 hover:border-white/50'
                }`}
              >
                <CheckCircle2 size={16} strokeWidth={3} />
              </button>
            </th>
            <th className="px-8 py-4">Asset</th>
            <th className="px-8 py-4">Details</th>
            <th className="px-8 py-4 text-right">P-Price</th>
            <th className="px-8 py-4 text-right">Market</th>
            <th className="px-8 py-4 text-center">Trend</th>
            <th className="px-8 py-4 text-center">Grade</th>
            <th className="px-8 py-4 text-center">Liquidity</th>
            <th className="px-8 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {paddingTop > 0 && (
            <tr aria-hidden>
              <td colSpan={9} style={{ height: paddingTop, padding: 0, border: 0 }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const card = items[virtualRow.index];
            if (!card) return null;
            return (
              <CardListRow
                key={card.id}
                card={card}
                isSelected={isItemSelected?.(card.id)}
                onToggleSelect={onToggleSelect}
                {...rowProps}
              />
            );
          })}
          {paddingBottom > 0 && (
            <tr aria-hidden>
              <td colSpan={9} style={{ height: paddingBottom, padding: 0, border: 0 }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VirtualizedList;
