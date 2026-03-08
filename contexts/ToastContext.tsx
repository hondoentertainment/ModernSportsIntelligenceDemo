import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { registerToastHandler, unregisterToastHandler } from '../lib/toast';
import type { Toast, ToastType, ToastOptions } from '../lib/toast';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

// ─── Context ─────────────────────────────────────────────────────────────────

interface ToastContextType {
    addToast: (type: ToastType, message: string, options?: ToastOptions) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
};

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_DURATIONS: Record<ToastType, number> = {
    success: 3500,
    info: 4500,
    warning: 5500,
    error: 6500,
};

const MAX_VISIBLE = 5;

// ─── Provider ────────────────────────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
    }, []);

    const addToast = useCallback((type: ToastType, message: string, options?: ToastOptions) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const duration = options?.duration ?? DEFAULT_DURATIONS[type];
        const dismissible = options?.dismissible ?? true;

        const toast: Toast = { id, type, message, duration, dismissible, onUndo: options?.onUndo, undoLabel: options?.undoLabel };

        // Undo toasts get extended duration
        if (options?.onUndo && duration < 8000) {
            toast.duration = 8000;
        }

        setToasts(prev => {
            // Enforce max visible — remove oldest if at limit
            const updated = [...prev, toast];
            if (updated.length > MAX_VISIBLE) {
                const removed = updated.shift();
                if (removed) {
                    const timer = timersRef.current.get(removed.id);
                    if (timer) clearTimeout(timer);
                    timersRef.current.delete(removed.id);
                }
            }
            return updated;
        });

        // Auto-dismiss
        if (duration > 0) {
            const timer = setTimeout(() => removeToast(id), duration);
            timersRef.current.set(id, timer);
        }
    }, [removeToast]);

    // Register module-level handler so service files can fire toasts
    useEffect(() => {
        registerToastHandler(addToast);
        return () => unregisterToastHandler();
    }, [addToast]);

    // Cleanup all timers on unmount
    useEffect(() => {
        return () => {
            timersRef.current.forEach(t => clearTimeout(t));
            timersRef.current.clear();
        };
    }, []);

    // Escape key dismisses most recent toast
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && toasts.length > 0) {
                removeToast(toasts[toasts.length - 1].id);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [toasts, removeToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    );
};

// ─── Toast Container (renders the stack) ─────────────────────────────────────

const ICON_MAP: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={18} />,
    error: <XCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />,
};

const COLOR_MAP: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
    success: {
        bg: 'bg-brand-lime/10',
        border: 'border-brand-lime/30',
        icon: 'text-brand-lime',
        text: 'text-brand-lime',
    },
    error: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        icon: 'text-red-400',
        text: 'text-red-300',
    },
    warning: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: 'text-amber-400',
        text: 'text-amber-300',
    },
    info: {
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/30',
        icon: 'text-sky-400',
        text: 'text-sky-300',
    },
};

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full"
            aria-live="polite"
            aria-atomic="false"
        >
            {toasts.map((toast) => {
                const colors = COLOR_MAP[toast.type];
                return (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${colors.bg} ${colors.border} animate-in slide-in-from-right-5 fade-in duration-300`}
                        role="alert"
                    >
                        <span className={`mt-0.5 flex-shrink-0 ${colors.icon}`}>
                            {ICON_MAP[toast.type]}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium leading-snug ${colors.text}`}>
                                {toast.message}
                            </p>
                            {toast.onUndo && (
                                <button
                                    onClick={() => { toast.onUndo?.(); onDismiss(toast.id); }}
                                    className="mt-1.5 text-xs font-black uppercase tracking-widest text-white hover:text-brand-lime transition-colors underline underline-offset-2"
                                >
                                    {toast.undoLabel || 'Undo'}
                                </button>
                            )}
                        </div>
                        {toast.dismissible && (
                            <button
                                onClick={() => onDismiss(toast.id)}
                                className="mt-0.5 flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
                                aria-label="Dismiss"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
