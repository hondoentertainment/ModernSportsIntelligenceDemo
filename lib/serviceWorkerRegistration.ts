// ─── Service Worker Registration Helper ──────────────────────────────────────
// Manages service worker lifecycle: registration, updates, and unregistration.

type UpdateCallback = (hasUpdate: boolean) => void;

let updateCallback: UpdateCallback | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;

export function onUpdate(callback: UpdateCallback): void {
  updateCallback = callback;
}

export function register(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported in this browser.');
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const swUrl = '/sw.js';
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
      });

      swRegistration = registration;

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available
              console.log('[SW] New content available; please refresh.');
              updateCallback?.(true);
            } else {
              // Content cached for offline use
              console.log('[SW] Content is cached for offline use.');
              updateCallback?.(false);
            }
          }
        });
      });

      console.log('[SW] Service worker registered successfully.');
    } catch (error) {
      console.log('[SW] Service worker registration failed (expected in dev):', error);
    }
  });
}

export function unregister(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready
    .then((registration) => {
      registration.unregister();
      swRegistration = null;
      console.log('[SW] Service worker unregistered.');
    })
    .catch((error) => {
      console.error('[SW] Error unregistering service worker:', error);
    });
}

export async function checkForUpdates(): Promise<boolean> {
  if (!swRegistration) {
    return false;
  }

  try {
    await swRegistration.update();
    const waiting = swRegistration.waiting;
    return !!waiting;
  } catch {
    return false;
  }
}

export function getRegistration(): ServiceWorkerRegistration | null {
  return swRegistration;
}

export function skipWaiting(): void {
  if (swRegistration?.waiting) {
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

export function isServiceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

export function isRegistered(): boolean {
  return swRegistration !== null;
}
