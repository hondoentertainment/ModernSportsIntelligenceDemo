import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const DEFER_SHOW_MS = 120;
const MIN_DISPLAY_MS = 300;

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
            <div className="min-h-screen bg-brand-charcoal flex items-center justify-center" role="status" aria-label="Loading">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-brand-lime animate-spin mx-auto mb-4" aria-hidden />
                    <p className="text-slate-400 font-bebas text-xl tracking-wider">INITIALIZING...</p>
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
