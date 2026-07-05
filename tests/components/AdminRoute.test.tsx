import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

// Mock useAuth so we can flip role/user/loading per test without spinning up
// the real Supabase-backed provider.
const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

import AdminRoute from '../../components/AdminRoute';

function renderRoute(initialPath: string) {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="/audit-trail" element={<div>UserAuditPage</div>} />
                <Route path="/login" element={<div>LoginPage</div>} />
                <Route
                    path="/audit-trail/admin"
                    element={
                        <AdminRoute>
                            <div>AdminAuditPage</div>
                        </AdminRoute>
                    }
                />
                <Route
                    path="/audit-trail/admin-only"
                    element={
                        <AdminRoute minRole="admin">
                            <div>AdminOnlyPage</div>
                        </AdminRoute>
                    }
                />
            </Routes>
        </MemoryRouter>,
    );
}

const fakeUser = { id: 'u-1', email: 'op@sportsintel.io' } as User;

describe('AdminRoute', () => {
    it('renders the loading shell while auth is still resolving', () => {
        mockUseAuth.mockReturnValue({ user: null, loading: true, operatorRole: 'member', profileLoading: false });
        renderRoute('/audit-trail/admin');
        expect(screen.getByRole('status')).toHaveTextContent(/verifying operator role/i);
        expect(screen.queryByText('AdminAuditPage')).not.toBeInTheDocument();
    });

    it('redirects unauthenticated users to /login', () => {
        mockUseAuth.mockReturnValue({ user: null, loading: false, operatorRole: 'member', profileLoading: false });
        renderRoute('/audit-trail/admin');
        expect(screen.getByText('LoginPage')).toBeInTheDocument();
    });

    it('holds the loading shell while the profile fetch is still in flight', () => {
        // Auth resolved, but profileLoading is true — do NOT redirect yet or
        // real support/admin users would be bounced to /audit-trail before
        // their role arrives.
        mockUseAuth.mockReturnValue({ user: fakeUser, loading: false, operatorRole: 'member', profileLoading: true });
        renderRoute('/audit-trail/admin');
        expect(screen.getByRole('status')).toHaveTextContent(/verifying operator role/i);
        expect(screen.queryByText('UserAuditPage')).not.toBeInTheDocument();
    });

    it('redirects members to /audit-trail (the user-scoped viewer)', () => {
        mockUseAuth.mockReturnValue({ user: fakeUser, loading: false, operatorRole: 'member', profileLoading: false });
        renderRoute('/audit-trail/admin');
        expect(screen.getByText('UserAuditPage')).toBeInTheDocument();
        expect(screen.queryByText('AdminAuditPage')).not.toBeInTheDocument();
    });

    it('lets support see the default (support) route', () => {
        mockUseAuth.mockReturnValue({ user: fakeUser, loading: false, operatorRole: 'support', profileLoading: false });
        renderRoute('/audit-trail/admin');
        expect(screen.getByText('AdminAuditPage')).toBeInTheDocument();
    });

    it('lets admin see the default (support) route', () => {
        mockUseAuth.mockReturnValue({ user: fakeUser, loading: false, operatorRole: 'admin', profileLoading: false });
        renderRoute('/audit-trail/admin');
        expect(screen.getByText('AdminAuditPage')).toBeInTheDocument();
    });

    it('redirects support away from an admin-only route (minRole="admin")', () => {
        mockUseAuth.mockReturnValue({ user: fakeUser, loading: false, operatorRole: 'support', profileLoading: false });
        renderRoute('/audit-trail/admin-only');
        expect(screen.getByText('UserAuditPage')).toBeInTheDocument();
        expect(screen.queryByText('AdminOnlyPage')).not.toBeInTheDocument();
    });

    it('lets admin through an admin-only route', () => {
        mockUseAuth.mockReturnValue({ user: fakeUser, loading: false, operatorRole: 'admin', profileLoading: false });
        renderRoute('/audit-trail/admin-only');
        expect(screen.getByText('AdminOnlyPage')).toBeInTheDocument();
    });
});
