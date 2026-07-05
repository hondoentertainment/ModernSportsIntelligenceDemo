import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, TrendingUp } from 'lucide-react';

interface AdminRouteProps {
    children: React.ReactNode;
    /**
     * Minimum operator role required to render children. Defaults to 'support'
     * (viewer-only). Set to 'admin' for surfaces that mutate state.
     */
    minRole?: 'support' | 'admin';
}

const AdminLoadingShell: React.FC = () => (
    <div className="min-h-screen bg-brand-charcoal flex items-center justify-center overflow-hidden relative">
        <div className="relative z-10 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-lime to-brand-teal flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(190,242,100,0.2)]">
                <TrendingUp className="w-7 h-7 text-brand-charcoal" />
            </div>
            <div className="flex items-center gap-3" role="status" aria-live="polite">
                <Loader2 className="w-4 h-4 text-brand-lime animate-spin" aria-hidden />
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Verifying operator role…</p>
            </div>
        </div>
    </div>
);

/**
 * Route wrapper that render-blocks unless the signed-in user's `operatorRole`
 * meets `minRole`. Renders a loading shell while auth is resolving and
 * redirects non-operators to `/audit-trail` (the user-scoped viewer).
 *
 * Trust boundary: this is a UX gate, not a security gate — the actual
 * cross-user read is enforced server-side by `admin-audit-events`. This
 * component's job is to keep the admin UI out of the way of regular users.
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children, minRole = 'support' }) => {
    const { user, loading, operatorRole } = useAuth();

    if (loading) {
        return <AdminLoadingShell />;
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isAllowed = minRole === 'admin'
        ? operatorRole === 'admin'
        : operatorRole === 'support' || operatorRole === 'admin';

    if (!isAllowed) {
        return <Navigate to="/audit-trail" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
