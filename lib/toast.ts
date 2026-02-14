/**
 * Module-level toast helper
 *
 * Allows non-React service files (gemini.ts, ebayApi.ts, etc.) to trigger
 * user-visible notifications without needing React hooks.
 *
 * The ToastContext registers itself as the handler on mount.
 * If no handler is registered, toasts fall back to console output.
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number; // ms, 0 = persistent
    dismissible?: boolean;
}

export interface ToastOptions {
    duration?: number;
    dismissible?: boolean;
    /** Dedupe key — if set, prevents duplicate toasts with the same key within 10s */
    dedupeKey?: string;
}

type ToastHandler = (type: ToastType, message: string, options?: ToastOptions) => void;

let _handler: ToastHandler | null = null;
const _recentDedupeKeys = new Map<string, number>(); // key → timestamp
const DEDUPE_WINDOW = 10_000; // 10 seconds

/**
 * Register the React toast handler. Called by ToastContext on mount.
 */
export function registerToastHandler(handler: ToastHandler): void {
    _handler = handler;
}

/**
 * Unregister the handler. Called by ToastContext on unmount.
 */
export function unregisterToastHandler(): void {
    _handler = null;
}

/**
 * Show a toast notification from anywhere in the app.
 * Works from both React components (via useToast) and plain service modules.
 */
export function showToast(type: ToastType, message: string, options?: ToastOptions): void {
    // Deduplication check
    if (options?.dedupeKey) {
        const now = Date.now();
        const lastShown = _recentDedupeKeys.get(options.dedupeKey);
        if (lastShown && now - lastShown < DEDUPE_WINDOW) {
            return; // Suppress duplicate
        }
        _recentDedupeKeys.set(options.dedupeKey, now);

        // Clean up old entries periodically
        if (_recentDedupeKeys.size > 50) {
            for (const [key, ts] of _recentDedupeKeys) {
                if (now - ts > DEDUPE_WINDOW) _recentDedupeKeys.delete(key);
            }
        }
    }

    if (_handler) {
        _handler(type, message, options);
    } else {
        // Fallback to console if no React handler is mounted
        const logFn = type === 'error' ? console.error : type === 'warning' ? console.warn : console.log;
        logFn(`[Toast:${type}]`, message);
    }
}
