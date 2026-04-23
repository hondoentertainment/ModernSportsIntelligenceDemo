// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, TrendingUp } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const MIN_DISPLAY_MS = 250;

const SessionLoadingShell: React.FC = () => (
    <div className="min-h-screen bg-brand-charcoal flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-charcoal via-slate-900 to-brand-charcoal" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-lime/5 via-transparent to-transparent opacity-50" />

        <div className="relative z-10 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-lime to-brand-teal flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(190,242,100,0.2)]">
                <TrendingUp className="w-8 h-8 text-brand-charcoal" />
            </div>
            <h1 className="font-bebas text-3xl tracking-[0.2em] text-white mb-2">MODERN SPORTS INTELLIGENCE</h1>
            <div className="flex items-center gap-3" role="status" aria-live="polite">
                <Loader2 className="w-4 h-4 text-brand-lime animate-spin" aria-hidden />
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Secure Uplink...</p>
            </div>
        </div>
    </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const [exitHold, setExitHold] = useState(false);
    const prevLoadingRef = useRef<boolean | null>(null);
    const loadStartedAt = useRef<number | null>(null);

    useEffect(() => {
        const prev = prevLoadingRef.current;
        prevLoadingRef.current = loading;

        if (loading) {
            loadStartedAt.current = Date.now();
            setExitHold(false);
            return;
        }

        if (prev !== true) return;

        const started = loadStartedAt.current;
        const elapsed = started != null ? Date.now() - started : MIN_DISPLAY_MS;
        const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
        setExitHold(true);
        const t = setTimeout(() => {
            setExitHold(false);
            loadStartedAt.current = null;
        }, remaining);
        return () => clearTimeout(t);
    }, [loading]);

    if (loading || exitHold) {
        return <SessionLoadingShell />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
