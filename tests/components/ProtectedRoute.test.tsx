import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

const mockUseAuth = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

import ProtectedRoute, { PROFILE_LOADING_WAIT_MS } from '../../components/ProtectedRoute';

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/collection']}>
      <Routes>
        <Route path="/login" element={<div>LoginPage</div>} />
        <Route
          path="/collection"
          element={
            <ProtectedRoute>
              <div>ProtectedPage</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

const fakeUser = { id: 'u-1', email: 'collector@sportsintel.io' } as User;

describe('ProtectedRoute', () => {
  it('holds the session shell while auth is resolving', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true, profileLoading: false });
    renderProtected();
    expect(screen.getByRole('status')).toHaveTextContent(/secure uplink/i);
    expect(screen.queryByText('ProtectedPage')).not.toBeInTheDocument();
  });

  it('holds the shell until profile is ready for a signed-in user', () => {
    mockUseAuth.mockReturnValue({ user: fakeUser, loading: false, profileLoading: true });
    renderProtected();
    expect(screen.getByRole('status')).toHaveTextContent(/session \+ profile/i);
    expect(screen.queryByText('ProtectedPage')).not.toBeInTheDocument();
    expect(screen.queryByText('LoginPage')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users after session resolve', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, profileLoading: false });
    renderProtected();
    expect(screen.getByText('LoginPage')).toBeInTheDocument();
  });

  it('renders children when session and profile are ready', () => {
    mockUseAuth.mockReturnValue({ user: fakeUser, loading: false, profileLoading: false });
    renderProtected();
    expect(screen.getByText('ProtectedPage')).toBeInTheDocument();
  });

  it('releases the shell if profileLoading stays true past the wait bound', async () => {
    vi.useFakeTimers();
    mockUseAuth.mockReturnValue({ user: fakeUser, loading: false, profileLoading: true });
    renderProtected();
    expect(screen.getByRole('status')).toHaveTextContent(/session \+ profile/i);
    expect(screen.queryByText('ProtectedPage')).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(PROFILE_LOADING_WAIT_MS);
    });

    expect(screen.getByText('ProtectedPage')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
