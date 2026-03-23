import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CardInventory } from '../../types';
import CardGridItem, { CardGridItemProps } from './CardGridItem';

type VirtualizedGridProps = Omit<CardGridItemProps, 'card' | 'isSelected'> & {
  items: CardInventory[];
  columns: number;
  cardHeight: number;
  rowGap: number;
  isItemSelected?: (id: string) => boolean;
};

const VirtualizedGrid: React.FC<VirtualizedGridProps> = ({
  items,
  columns,
  cardHeight,
  rowGap,
  isItemSelected,
  ...cardItemProps
}) => {
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
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
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
              {rowItems.map(card => (
                <CardGridItem
                  key={card.id}
                  card={card}
                  {...cardItemProps}
                  isSelected={isItemSelected?.(card.id)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualizedGrid;
