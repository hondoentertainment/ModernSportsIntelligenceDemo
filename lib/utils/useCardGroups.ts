// @ts-nocheck
import { useState, useCallback, useMemo } from 'react';
import { CardInventory } from '../../types';
import { store } from '../dal/syncStore';

export interface CardGroup {
  id: string;
  label: string;
  color: string;
  icon: string;
}

const STORAGE_KEY = 'msi_card_groups';
const _GROUP_ORDER_KEY = 'msi_group_order';

const DEFAULT_GROUPS: CardGroup[] = [
  { id: 'grade-next', label: 'Grade Next', color: '#d9f99d', icon: 'trophy' },
  { id: 'sell-soon', label: 'Sell This Month', color: '#fca5a5', icon: 'trending-up' },
  { id: 'long-hold', label: 'Long-Term Holds', color: '#93c5fd', icon: 'lock' },
  { id: 'trade-bait', label: 'Trade Bait', color: '#fcd34d', icon: 'repeat' },
];

const GROUP_COLORS = [
  '#d9f99d', '#fca5a5', '#93c5fd', '#fcd34d', '#c4b5fd',
  '#6ee7b7', '#fda4af', '#a5b4fc', '#fdba74', '#67e8f9',
];

function loadGroups(): CardGroup[] {
  const parsed = store.get<CardGroup[]>(STORAGE_KEY, []);
  if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  return DEFAULT_GROUPS;
}

function saveGroups(groups: CardGroup[]) {
  store.set(STORAGE_KEY, groups);
}

/**
 * Hook for managing card groups (lanes) in the Portfolio Builder.
 * Groups are persisted in localStorage. Card-to-group assignment
 * is stored on the card itself via the `group` field.
 */
export function useCardGroups(
  inventory: CardInventory[],
  updateCard: (_id: string, _updates: Partial<CardInventory>) => void,
) {
  const [groups, setGroups] = useState<CardGroup[]>(loadGroups);

  const addGroup = useCallback((label: string) => {
    const id = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    const colorIndex = groups.length % GROUP_COLORS.length;
    const newGroup: CardGroup = { id, label, color: GROUP_COLORS[colorIndex], icon: 'folder' };
    setGroups(prev => {
      const next = [...prev, newGroup];
      saveGroups(next);
      return next;
    });
    return newGroup;
  }, [groups.length]);

  const renameGroup = useCallback((groupId: string, newLabel: string) => {
    setGroups(prev => {
      const next = prev.map(g => g.id === groupId ? { ...g, label: newLabel } : g);
      saveGroups(next);
      return next;
    });
  }, []);

  const deleteGroup = useCallback((groupId: string) => {
    // Unassign all cards from this group
    inventory.forEach(card => {
      if (card.group === groupId) {
        updateCard(card.id, { group: undefined, groupOrder: undefined });
      }
    });
    setGroups(prev => {
      const next = prev.filter(g => g.id !== groupId);
      saveGroups(next);
      return next;
    });
  }, [inventory, updateCard]);

  const reorderGroups = useCallback((reordered: CardGroup[]) => {
    setGroups(reordered);
    saveGroups(reordered);
  }, []);

  const moveCard = useCallback((cardId: string, targetGroupId: string | undefined) => {
    const cardsInTarget = inventory
      .filter(c => c.group === targetGroupId)
      .sort((a, b) => (a.groupOrder ?? 0) - (b.groupOrder ?? 0));
    const nextOrder = cardsInTarget.length > 0
      ? (cardsInTarget[cardsInTarget.length - 1].groupOrder ?? 0) + 1
      : 0;
    updateCard(cardId, { group: targetGroupId, groupOrder: nextOrder });
  }, [inventory, updateCard]);

  const reorderCardInGroup = useCallback((
    cardId: string,
    groupId: string,
    newIndex: number,
  ) => {
    const cardsInGroup = inventory
      .filter(c => c.group === groupId && c.id !== cardId)
      .sort((a, b) => (a.groupOrder ?? 0) - (b.groupOrder ?? 0));

    cardsInGroup.splice(newIndex, 0, inventory.find(c => c.id === cardId)!);

    cardsInGroup.forEach((card, idx) => {
      if (card && card.groupOrder !== idx) {
        updateCard(card.id, { groupOrder: idx });
      }
    });
  }, [inventory, updateCard]);

  // Cards grouped by lane
  const groupedCards = useMemo(() => {
    const map: Record<string, CardInventory[]> = {};
    const ungrouped: CardInventory[] = [];

    for (const card of inventory) {
      if (card.status === 'sold') continue;
      if (card.group && groups.some(g => g.id === card.group)) {
        if (!map[card.group]) map[card.group] = [];
        map[card.group].push(card);
      } else {
        ungrouped.push(card);
      }
    }

    // Sort within each group
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => (a.groupOrder ?? 0) - (b.groupOrder ?? 0));
    }

    return { grouped: map, ungrouped };
  }, [inventory, groups]);

  // Stats per group
  const groupStats = useMemo(() => {
    const stats: Record<string, { count: number; totalValue: number; totalCost: number }> = {};
    for (const group of groups) {
      const cards = groupedCards.grouped[group.id] || [];
      stats[group.id] = {
        count: cards.length,
        totalValue: cards.reduce((s, c) => s + (c.currentValue ?? 0), 0),
        totalCost: cards.reduce((s, c) => s + (c.purchasePrice ?? 0), 0),
      };
    }
    return stats;
  }, [groups, groupedCards]);

  return {
    groups,
    groupedCards,
    groupStats,
    addGroup,
    renameGroup,
    deleteGroup,
    reorderGroups,
    moveCard,
    reorderCardInGroup,
  };
}
