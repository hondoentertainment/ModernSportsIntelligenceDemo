import { useRef, useCallback } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;        // minimum px to trigger (default 80)
  maxVertical?: number;      // max vertical drift before canceling (default 60)
}

/**
 * Touch swipe handler for mobile card triage.
 * Returns touch event handlers to spread onto a container element.
 */
export function useSwipeActions({ onSwipeLeft, onSwipeRight, threshold = 80, maxVertical = 60 }: SwipeConfig) {
  const startX = useRef(0);
  const startY = useRef(0);
  const deltaX = useRef(0);
  const swiping = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    deltaX.current = 0;
    swiping.current = true;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping.current) return;
    const touch = e.touches[0];
    const dy = Math.abs(touch.clientY - startY.current);
    // Cancel if user is scrolling vertically
    if (dy > maxVertical) {
      swiping.current = false;
      deltaX.current = 0;
      return;
    }
    deltaX.current = touch.clientX - startX.current;
  }, [maxVertical]);

  const onTouchEnd = useCallback(() => {
    if (!swiping.current) return;
    swiping.current = false;

    if (deltaX.current > threshold && onSwipeRight) {
      // Haptic feedback
      if ('vibrate' in navigator) navigator.vibrate(30);
      onSwipeRight();
    } else if (deltaX.current < -threshold && onSwipeLeft) {
      if ('vibrate' in navigator) navigator.vibrate(30);
      onSwipeLeft();
    }
    deltaX.current = 0;
  }, [threshold, onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
