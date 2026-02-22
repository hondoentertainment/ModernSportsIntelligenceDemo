export class NotificationService {
    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notification');
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    static async notify(title: string, options?: NotificationOptions) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        const registration = await navigator.serviceWorker.ready;
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
        this.notify(`Target Hit: ${player}`, {
            body: `Current market price is $${currentPrice.toLocaleString()}, reaching your target of $${targetPrice.toLocaleString()}.`,
            tag: `price-alert-${player}`,
            data: { url: '/#/alerts' }
        });
    }
}

export const requestNotificationPermission = () => NotificationService.requestPermission();
export const sendLocalNotification = (title: string, options?: NotificationOptions) => NotificationService.notify(title, options);
