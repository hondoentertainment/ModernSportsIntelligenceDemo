
export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.log("This browser does not support desktop notification");
        return false;
    }

    let permission = Notification.permission;

    if (permission === "granted") {
        return true;
    } else if (permission !== "denied") {
        permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
}

export function sendLocalNotification(title: string, options?: NotificationOptions) {
    if (Notification.permission === "granted") {
        // Check if service worker is ready for "mobile-like" notification
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    icon: '/pwa-192x192.png',
                    badge: '/pwa-192x192.png',
                    vibrate: [200, 100, 200],
                    ...options
                });
            });
        } else {
            // Fallback to standard web notification
            new Notification(title, options);
        }
    }
}
