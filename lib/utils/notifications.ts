import { logger } from '../logger';
import { shouldFireBrowserNotification, shouldFireHaptic } from './alertPreferences';
import { PRICE_ALERT_HAPTIC_PATTERN, vibrateIfAvailable } from './haptics';

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
        vibrateIfAvailable(pattern);
    }

    static async notify(title: string, options?: NotificationOptions & { vibrate?: boolean; bypassQuietHours?: boolean }) {
        const bypass = options?.bypassQuietHours === true;
        if (!bypass && !shouldFireBrowserNotification()) {
            return;
        }
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        if (options?.vibrate !== false && (bypass || shouldFireHaptic())) {
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
        if (shouldFireHaptic()) {
            this.vibrate(PRICE_ALERT_HAPTIC_PATTERN);
        }

        await this.notify(`Target Hit: ${player}`, {
            body: `Current market price is $${currentPrice.toLocaleString()}, reaching your target of $${targetPrice.toLocaleString()}.`,
            tag: `price-alert-${player}`,
            data: { url: '/#/alerts' },
            vibrate: false
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
export const sendLocalNotification = (
    title: string,
    options?: NotificationOptions & { vibrate?: boolean; bypassQuietHours?: boolean },
) => NotificationService.notify(title, options);
