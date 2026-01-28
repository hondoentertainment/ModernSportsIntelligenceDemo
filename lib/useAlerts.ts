
import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertType } from '../types.ts';

const STORAGE_KEY = 'cardx_alerts';
const MAX_ALERTS = 50; // Keep last 50 alerts

/**
 * Shared hook for managing alerts/notifications
 */
export function useAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Failed to parse alerts from localStorage', e);
        }
        return [];
    });

    // Persist changes to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts.slice(0, MAX_ALERTS)));
    }, [alerts]);

    const addAlert = useCallback((
        type: AlertType,
        title: string,
        description: string,
        priority: 'high' | 'medium' | 'low' = 'medium',
        metadata?: Record<string, any>
    ) => {
        const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 11);

        const newAlert: Alert = {
            id,
            type,
            title,
            description,
            timestamp: new Date().toISOString(),
            isRead: false,
            priority,
            metadata
        };

        setAlerts(prev => [newAlert, ...prev].slice(0, MAX_ALERTS));
        return newAlert;
    }, []);

    const markAsRead = useCallback((id: string) => {
        setAlerts(prev => prev.map(a =>
            a.id === id ? { ...a, isRead: true } : a
        ));
    }, []);

    const markAllAsRead = useCallback(() => {
        setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    }, []);

    const dismissAlert = useCallback((id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    }, []);

    const clearAllAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    const getUnreadCount = useCallback(() => {
        return alerts.filter(a => !a.isRead).length;
    }, [alerts]);

    const getAlertsByType = useCallback((type: AlertType) => {
        return alerts.filter(a => a.type === type);
    }, [alerts]);

    // Helper to create specific alert types
    const alertHelpers = {
        priceTargetHit: (playerName: string, cardDesc: string, targetPrice: number, currentPrice: number, targetId: string) => {
            addAlert(
                'price_target',
                `🎯 Target Alert: ${playerName}`,
                `${cardDesc} is now available at $${currentPrice.toLocaleString()} - below your target of $${targetPrice.toLocaleString()}!`,
                'high',
                { playerName, cardDesc, targetPrice, currentPrice, targetId }
            );
        },

        syncComplete: (cardCount: number, totalValue: number, duration: number) => {
            addAlert(
                'sync_complete',
                '✅ Market Sync Complete',
                `Updated ${cardCount} assets with live market data. Portfolio NAV: $${totalValue.toLocaleString()}. Completed in ${(duration / 1000).toFixed(1)}s.`,
                'low',
                { cardCount, totalValue, duration }
            );
        },

        valueChange: (playerName: string, cardDesc: string, oldValue: number, newValue: number, cardId: string) => {
            const change = ((newValue - oldValue) / oldValue) * 100;
            const isPositive = change > 0;
            addAlert(
                isPositive ? 'momentum' : 'warning',
                `${isPositive ? '📈' : '📉'} Value ${isPositive ? 'Increase' : 'Decrease'}: ${playerName}`,
                `${cardDesc} ${isPositive ? 'increased' : 'decreased'} ${Math.abs(change).toFixed(1)}% to $${newValue.toLocaleString()}`,
                Math.abs(change) > 20 ? 'high' : 'medium',
                { playerName, cardDesc, oldValue, newValue, change, cardId }
            );
        },

        systemMessage: (title: string, message: string) => {
            addAlert('system', title, message, 'low');
        }
    };

    return {
        alerts,
        setAlerts,
        addAlert,
        markAsRead,
        markAllAsRead,
        dismissAlert,
        clearAllAlerts,
        getUnreadCount,
        getAlertsByType,
        ...alertHelpers,
        unreadCount: alerts.filter(a => !a.isRead).length,
        totalAlerts: alerts.length
    };
}
