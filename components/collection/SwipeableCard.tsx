import React, { useRef, useState, useCallback } from 'react';
import { Target, Tag } from 'lucide-react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;   // Mark for sale
  onSwipeRight?: () => void;  // Add to watchlist
}

/**
 * Wraps a card item with touch-swipe actions for mobile triage.
 * Swipe right → Add to Watchlist
 * Swipe left → Mark for Sale
 */
const SwipeableCard: React.FC<SwipeableCardProps> = ({ children, onSwipeLeft, onSwipeRight }) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const THRESHOLD = 80;
  const MAX_VERTICAL = 40;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    setSwiping(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping) return;
    const touch = e.touches[0];
    const dy = Math.abs(touch.clientY - startY.current);
    if (dy > MAX_VERTICAL) {
      setSwiping(false);
      setOffset(0);
      return;
    }
    const dx = touch.clientX - startX.current;
    // Dampen the offset for rubber-band feel
    setOffset(dx * 0.6);
  }, [swiping]);

  const onTouchEnd = useCallback(() => {
    if (!swiping) return;
    setSwiping(false);

    if (offset > THRESHOLD && onSwipeRight) {
      if ('vibrate' in navigator) navigator.vibrate(30);
      onSwipeRight();
    } else if (offset < -THRESHOLD && onSwipeLeft) {
      if ('vibrate' in navigator) navigator.vibrate(30);
      onSwipeLeft();
    }
    setOffset(0);
  }, [swiping, offset, onSwipeLeft, onSwipeRight]);

  const showRight = offset > 30;
  const showLeft = offset < -30;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] md:overflow-visible">
      {/* Swipe action backgrounds (mobile only) */}
      <div className="md:hidden absolute inset-0 flex items-center justify-between pointer-events-none z-0">
        {/* Right swipe — watchlist */}
        <div className={`flex items-center gap-2 pl-6 transition-opacity ${showRight ? 'opacity-100' : 'opacity-0'}`}>
          <Target size={20} className="text-brand-teal" />
          <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">Watchlist</span>
        </div>
        {/* Left swipe — mark for sale */}
        <div className={`flex items-center gap-2 pr-6 transition-opacity ${showLeft ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">Sell</span>
          <Tag size={20} className="text-brand-red" />
        </div>
      </div>

      {/* Card content */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: offset !== 0 ? `translateX(${offset}px)` : undefined,
          transition: swiping ? 'none' : 'transform 0.3s ease-out'
        }}
        className="relative z-10"
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;
