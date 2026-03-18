import { useState, useEffect, useCallback } from 'react';
import { logger } from '../logger';
import { CardInventory } from '../../types';
import { store } from '../dal/syncStore';

const STORAGE_KEY = 'msi_card_favorites';

export interface CardFavorite {
    id: string;
    cardId: string;
    player: string;
    year: number;
    set?: string;
    currentValue?: number;
    addedAt: string;
}

export function useFavorites() {
    const [favorites, setFavorites] = useState<CardFavorite[]>(() => {
        return store.get<CardFavorite[]>(STORAGE_KEY, []);
    });

    // Persist to localStorage
    useEffect(() => {
        store.set(STORAGE_KEY, favorites);
    }, [favorites]);

    const addFavorite = useCallback((card: CardInventory) => {
        setFavorites(prev => {
            // Don't add if already exists
            if (prev.find(f => f.cardId === card.id)) {
                return prev;
            }
            return [{
                id: `fav_${Date.now()}`,
                cardId: card.id,
                player: card.player,
                year: card.year,
                set: card.set,
                currentValue: card.currentValue || card.purchasePrice,
                addedAt: new Date().toISOString()
            }, ...prev];
        });
    }, []);

    const removeFavorite = useCallback((cardId: string) => {
        setFavorites(prev => prev.filter(f => f.cardId !== cardId));
    }, []);

    const isFavorite = useCallback((cardId: string) => {
        return favorites.some(f => f.cardId === cardId);
    }, [favorites]);

    const toggleFavorite = useCallback((card: CardInventory) => {
        if (isFavorite(card.id)) {
            removeFavorite(card.id);
        } else {
            addFavorite(card);
        }
    }, [isFavorite, removeFavorite, addFavorite]);

    return {
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
        count: favorites.length
    };
}
