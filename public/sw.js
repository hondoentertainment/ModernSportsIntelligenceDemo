// Bump when shell/offline behavior changes so clients drop stale caches (see PRODUCTION_READINESS PWA notes).
importScripts('/web-push-delivery-gate.js');

const CACHE_VERSION = 'msi-v6';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const WEB_PUSH_PREFS_CACHE = self.MSI_WEB_PUSH_GATE.PREFS_CACHE;
const WEB_PUSH_PREFS_URL = self.MSI_WEB_PUSH_GATE.PREFS_URL;
const WEB_PUSH_PREFS_MESSAGE = self.MSI_WEB_PUSH_GATE.PREFS_MESSAGE_TYPE;

let cachedPushPrefs = self.MSI_WEB_PUSH_GATE.normalizeWebPushDeliveryPrefs(null);

// Core shell assets that enable offline usage
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/offline.html',
    '/pwa-192x192.png',
    '/pwa-512x512.png'
];

// Max items in dynamic cache before eviction
const DYNAMIC_CACHE_LIMIT = 80;

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ─── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) =>
                        key !== STATIC_CACHE &&
                        key !== DYNAMIC_CACHE &&
                        key !== API_CACHE &&
                        key !== WEB_PUSH_PREFS_CACHE
                    )
                    .map((key) => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// ─── Fetch strategies ───────────────────────────────────────────────────────

function isNavigationRequest(request) {
    return request.mode === 'navigate';
}

function isStaticAsset(url) {
    return url.pathname.match(/\.(js|css|woff2?|ttf|png|jpg|jpeg|svg|ico|webp)$/);
}

function isApiRequest(url) {
    return url.hostname.includes('supabase') ||
           url.hostname.includes('generativelanguage.googleapis.com') ||
           url.hostname.includes('statsapi.mlb.com');
}

// Trim dynamic cache to limit
async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        await cache.delete(keys[0]);
        return trimCache(cacheName, maxItems);
    }
}

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET and chrome-extension requests
    if (event.request.method !== 'GET' || url.protocol === 'chrome-extension:') {
        return;
    }

    // Strategy 1: Navigation — Network first, fall back to cache, then offline page
    if (isNavigationRequest(event.request)) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() =>
                    caches.match(event.request).then((cached) => {
                        if (cached) return cached;
                        // Hash-router shell: serve cached SPA so /#/routes still open offline.
                        return caches.match('/').then((root) =>
                            root ||
                            caches.match('/index.html').then((index) => index || caches.match('/offline.html'))
                        );
                    })
                )
        );
        return;
    }

    // Strategy 2: Static assets — Cache first, network fallback
    if (isStaticAsset(url)) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((response) => {
                    const clone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(event.request, clone);
                        trimCache(DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT);
                    });
                    return response;
                });
            })
        );
        return;
    }

    // Strategy 3: API requests — Network first, cache fallback (stale data better than nothing)
    if (isApiRequest(url)) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(API_CACHE).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Strategy 4: Everything else — Stale-while-revalidate
    event.respondWith(
        caches.match(event.request).then((cached) => {
            const networkFetch = fetch(event.request).then((response) => {
                const clone = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(event.request, clone);
                    trimCache(DYNAMIC_CACHE, DYNAMIC_CACHE_LIMIT);
                });
                return response;
            });
            return cached || networkFetch;
        })
    );
});

// ─── Push notifications ─────────────────────────────────────────────────────
async function persistPushPrefs(prefs) {
    cachedPushPrefs = self.MSI_WEB_PUSH_GATE.normalizeWebPushDeliveryPrefs(prefs);
    try {
        const cache = await caches.open(WEB_PUSH_PREFS_CACHE);
        await cache.put(
            WEB_PUSH_PREFS_URL,
            new Response(JSON.stringify(cachedPushPrefs), {
                headers: { 'Content-Type': 'application/json' },
            })
        );
    } catch {
        // Cache may be unavailable in some SW environments.
    }
    return cachedPushPrefs;
}

async function loadPushPrefs() {
    try {
        const cache = await caches.open(WEB_PUSH_PREFS_CACHE);
        const res = await cache.match(WEB_PUSH_PREFS_URL);
        if (res) {
            cachedPushPrefs = self.MSI_WEB_PUSH_GATE.normalizeWebPushDeliveryPrefs(await res.json());
        }
    } catch {
        // Keep the in-memory snapshot when Cache API is unavailable.
    }
    return cachedPushPrefs;
}

self.addEventListener('push', (event) => {
    event.waitUntil((async () => {
        const prefs = await loadPushPrefs();
        if (!self.MSI_WEB_PUSH_GATE.shouldDeliverWebPushNotification(new Date(), prefs)) {
            return;
        }

        const data = event.data?.json() ?? {};
        const title = data.title || 'MSI Intelligence Alert';
        const options = {
            body: data.body || 'New alpha signal detected in your portfolio.',
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            vibrate: [200, 100, 200, 100, 300],
            data: {
                url: data.url || '/',
                type: data.type || 'general'
            },
            actions: [
                { action: 'view', title: 'View Details' },
                { action: 'dismiss', title: 'Dismiss' }
            ],
            tag: data.tag || 'msi-alert',
            renotify: true
        };

        await self.registration.showNotification(title, options);
    })());
});

// ─── Notification click ─────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Focus existing window if available
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(event.notification.data.url);
                    return client.focus();
                }
            }
            // Open new window
            return clients.openWindow(event.notification.data.url);
        })
    );
});

// ─── Background sync ────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
    if (event.tag === 'msi-portfolio-sync') {
        event.waitUntil(
            // Notify the app that a sync opportunity is available
            self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'SYNC_AVAILABLE' });
                });
            })
        );
    }
});

// ─── Message handler (for app communication) ────────────────────────────────
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
        return;
    }
    if (event.data?.type === WEB_PUSH_PREFS_MESSAGE) {
        event.waitUntil(persistPushPrefs(event.data.prefs));
    }
});
