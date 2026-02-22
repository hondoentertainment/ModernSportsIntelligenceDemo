import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, TrendingUp } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const DEFER_SHOW_MS = 80;
const MIN_DISPLAY_MS = 250;

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();
    const [displayLoader, setDisplayLoader] = useState(false);
    const loaderShownAt = useRef<number | null>(null);

    useEffect(() => {
        if (loading) {
            const t = setTimeout(() => {
                setDisplayLoader(true);
                loaderShownAt.current = Date.now();
            }, DEFER_SHOW_MS);
            return () => clearTimeout(t);
        }
    }, [loading]);

    useEffect(() => {
        if (!loading && displayLoader) {
            const elapsed = loaderShownAt.current ? Date.now() - loaderShownAt.current : MIN_DISPLAY_MS;
            const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
            const t = setTimeout(() => {
                setDisplayLoader(false);
                loaderShownAt.current = null;
            }, remaining);
            return () => clearTimeout(t);
        }
        if (!loading && !displayLoader) {
            loaderShownAt.current = null;
        }
    }, [loading, displayLoader]);

    if (displayLoader) {
        return (
            <div className="min-h-screen bg-brand-charcoal flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-charcoal via-slate-900 to-brand-charcoal" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-lime/5 via-transparent to-transparent opacity-50" />

                <div className="relative z-10 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-lime to-brand-teal flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(190,242,100,0.2)]">
                        <TrendingUp className="w-8 h-8 text-brand-charcoal" />
                    </div>
                    <h1 className="font-bebas text-3xl tracking-[0.2em] text-white mb-2">MODERN SPORTS INTELLIGENCE</h1>
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 text-brand-lime animate-spin" />
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Secure Uplink...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
