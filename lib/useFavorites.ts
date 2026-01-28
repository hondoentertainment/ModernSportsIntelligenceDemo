import { useState, useEffect, useCallback } from 'react';
import { CardInventory } from '../types';

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
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Error loading card favorites:', e);
            return [];
        }
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
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
