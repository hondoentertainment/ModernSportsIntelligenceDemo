import React, { useRef, useState, useCallback } from 'react';
import { BookmarkCheck, Tag, Truck, Eye } from 'lucide-react';
import { resolveSwipeTriage, SWIPE_TRIAGE_THRESHOLD, type SwipeTriageAction } from '../../lib/utils/swipeTriage';

interface SwipeableCardProps {
  children: React.ReactNode;
  onKeep?: () => void;
  onSell?: () => void;
  onConsign?: () => void;
  onReview?: () => void;
  /** @deprecated use onSell */
  onSwipeLeft?: () => void;
  /** @deprecated use onKeep */
  onSwipeRight?: () => void;
}

/**
 * Mobile 4-way swipe triage:
 * right → keep, left → sell, up → consign, down → review.
 */
const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onKeep,
  onSell,
  onConsign,
  onReview,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const keepHandler = onKeep ?? onSwipeRight;
  const sellHandler = onSell ?? onSwipeLeft;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    setSwiping(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;
    setOffsetX(dx * 0.6);
    setOffsetY(dy * 0.6);
  }, [swiping]);

  const fire = (action: SwipeTriageAction) => {
    if ('vibrate' in navigator) navigator.vibrate(30);
    if (action === 'keep') keepHandler?.();
    if (action === 'sell') sellHandler?.();
    if (action === 'consign') onConsign?.();
    if (action === 'review') onReview?.();
  };

  const onTouchEnd = useCallback(() => {
    if (!swiping) return;
    setSwiping(false);
    const action = resolveSwipeTriage(offsetX / 0.6, offsetY / 0.6, SWIPE_TRIAGE_THRESHOLD);
    if (action) fire(action);
    setOffsetX(0);
    setOffsetY(0);
  }, [swiping, offsetX, offsetY, keepHandler, sellHandler, onConsign, onReview]);

  const preview = resolveSwipeTriage(offsetX / 0.6, offsetY / 0.6, 40);

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] md:overflow-visible">
      <div className="md:hidden absolute inset-0 flex items-center justify-between pointer-events-none z-0 px-6">
        <div className={`flex items-center gap-2 transition-opacity ${preview === 'keep' ? 'opacity-100' : 'opacity-0'}`}>
          <BookmarkCheck size={20} className="text-brand-lime" />
          <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Keep</span>
        </div>
        <div className={`flex items-center gap-2 transition-opacity ${preview === 'sell' ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">Sell</span>
          <Tag size={20} className="text-brand-red" />
        </div>
      </div>
      <div className="md:hidden absolute inset-x-0 top-4 flex justify-center pointer-events-none z-0">
        <div className={`flex items-center gap-2 transition-opacity ${preview === 'consign' ? 'opacity-100' : 'opacity-0'}`}>
          <Truck size={18} className="text-brand-teal" />
          <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">Consign</span>
        </div>
      </div>
      <div className="md:hidden absolute inset-x-0 bottom-4 flex justify-center pointer-events-none z-0">
        <div className={`flex items-center gap-2 transition-opacity ${preview === 'review' ? 'opacity-100' : 'opacity-0'}`}>
          <Eye size={18} className="text-amber-400" />
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Review</span>
        </div>
      </div>

      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: offsetX !== 0 || offsetY !== 0 ? `translate(${offsetX}px, ${offsetY}px)` : undefined,
          transition: swiping ? 'none' : 'transform 0.3s ease-out',
        }}
        className="relative z-10"
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;
