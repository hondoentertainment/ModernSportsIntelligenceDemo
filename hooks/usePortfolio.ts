// @ts-nocheck
/**
 * usePortfolio
 *
 * React hook for portfolio management that integrates with the
 * userStatePersistence layer. Provides positions CRUD, computed totals
 * (value, cost, PnL), and automatic persistence.
 *
 * Usage:
 *   const { positions, addPosition, removePosition, updatePosition, totalValue, totalCost, totalPnL } = usePortfolio();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CardPosition, UserPortfolioState } from '../lib/utils/userStatePersistence';
import { logger } from '../lib/logger';
import {
  loadUserState,
  saveUserState,
} from '../lib/utils/userStatePersistence';

export type { CardPosition } from '../lib/utils/userStatePersistence';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeTotals(positions: CardPosition[]): { totalValue: number; totalCost: number; totalPnL: number } {
  let totalValue = 0;
  let totalCost = 0;
  for (const p of positions) {
    totalValue += p.currentValue * p.quantity;
    totalCost += p.costBasis * p.quantity;
  }
  return {
    totalValue: Math.round(totalValue * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    totalPnL: Math.round((totalValue - totalCost) * 100) / 100,
  };
}

// Debounce interval for persisting to storage
const PERSIST_DEBOUNCE_MS = 500;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UsePortfolioReturn {
  positions: CardPosition[];
  addPosition: (card: CardPosition) => void;
  removePosition: (cardId: string) => void;
  updatePosition: (cardId: string, updates: Partial<CardPosition>) => void;
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  /** True while the initial load from persistence is in-flight. */
  isLoading: boolean;
}

export function usePortfolio(): UsePortfolioReturn {
  const [positions, setPositions] = useState<CardPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ref to track the latest positions for the debounced writer
  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  // Persist timer
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Initial load ----------

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const state = await loadUserState();
        if (!cancelled) {
          setPositions(state.portfolio.positions);
        }
      } catch (err) {
        logger.error('[usePortfolio] Failed to load state:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ---------- Debounced persistence ----------

  const schedulePersist = useCallback((nextPositions: CardPosition[]) => {
    if (persistTimer.current !== null) {
      clearTimeout(persistTimer.current);
    }
    persistTimer.current = setTimeout(() => {
      const { totalValue } = computeTotals(nextPositions);
      const portfolio: UserPortfolioState = {
        positions: nextPositions,
        totalValue,
        lastUpdated: new Date().toISOString(),
      };
      saveUserState({ portfolio }).catch((err) => {
        logger.error('[usePortfolio] Failed to persist portfolio:', err);
      });
      persistTimer.current = null;
    }, PERSIST_DEBOUNCE_MS);
  }, []);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (persistTimer.current !== null) {
        clearTimeout(persistTimer.current);
        const current = positionsRef.current;
        const { totalValue } = computeTotals(current);
        const portfolio: UserPortfolioState = {
          positions: current,
          totalValue,
          lastUpdated: new Date().toISOString(),
        };
        saveUserState({ portfolio }).catch(() => { /* best effort */ });
      }
    };
  }, []);

  // ---------- Actions ----------

  const addPosition = useCallback((card: CardPosition) => {
    setPositions((prev) => {
      const existingIdx = prev.findIndex((p) => p.cardId === card.cardId);
      let next: CardPosition[];
      if (existingIdx >= 0) {
        // Merge: add quantity, average the cost basis
        const existing = prev[existingIdx];
        const totalQty = existing.quantity + card.quantity;
        const avgCost = totalQty > 0
          ? (existing.costBasis * existing.quantity + card.costBasis * card.quantity) / totalQty
          : card.costBasis;
        const merged: CardPosition = {
          ...existing,
          quantity: totalQty,
          costBasis: Math.round(avgCost * 100) / 100,
          currentValue: card.currentValue, // use latest
          notes: card.notes ?? existing.notes,
        };
        next = [...prev];
        next[existingIdx] = merged;
      } else {
        next = [...prev, card];
      }
      schedulePersist(next);
      return next;
    });
  }, [schedulePersist]);

  const removePosition = useCallback((cardId: string) => {
    setPositions((prev) => {
      const next = prev.filter((p) => p.cardId !== cardId);
      schedulePersist(next);
      return next;
    });
  }, [schedulePersist]);

  const updatePosition = useCallback((cardId: string, updates: Partial<CardPosition>) => {
    setPositions((prev) => {
      const idx = prev.findIndex((p) => p.cardId === cardId);
      if (idx < 0) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      schedulePersist(next);
      return next;
    });
  }, [schedulePersist]);

  // ---------- Computed totals ----------

  const { totalValue, totalCost, totalPnL } = computeTotals(positions);

  return {
    positions,
    addPosition,
    removePosition,
    updatePosition,
    totalValue,
    totalCost,
    totalPnL,
    isLoading,
  };
}

export default usePortfolio;
