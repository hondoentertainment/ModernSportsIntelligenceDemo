import { logger } from './logger';

export class NotificationService {
    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            logger.warn('This browser does not support desktop notification');
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    /** Trigger device haptic feedback (mobile) */
    static vibrate(pattern: number | number[] = [200, 100, 200]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    static async notify(title: string, options?: NotificationOptions & { vibrate?: boolean }) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        // Haptic feedback on mobile when notification fires
        if (options?.vibrate !== false) {
            this.vibrate();
        }

        const registration = await navigator.serviceWorker?.ready;
        if (registration) {
            registration.showNotification(title, {
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                ...options
            });
        } else {
            new Notification(title, options);
        }
    }

    static async sendPriceAlert(player: string, currentPrice: number, targetPrice: number) {
        // Strong vibration pattern for price alerts — attention-critical
        this.vibrate([200, 100, 200, 100, 300]);

        this.notify(`Target Hit: ${player}`, {
            body: `Current market price is $${currentPrice.toLocaleString()}, reaching your target of $${targetPrice.toLocaleString()}.`,
            tag: `price-alert-${player}`,
            data: { url: '/#/alerts' },
            vibrate: false // Already vibrated above with custom pattern
        });
    }

    /** Register for background sync when online */
    static async registerBackgroundSync(tag: string = 'msi-portfolio-sync') {
        const registration = await navigator.serviceWorker?.ready;
        if (registration && 'sync' in registration) {
            await (registration as any).sync.register(tag);
        }
    }
}

export const requestNotificationPermission = () => NotificationService.requestPermission();
export const sendLocalNotification = (title: string, options?: NotificationOptions) => NotificationService.notify(title, options);
