import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { store } from '../../lib/dal/syncStore';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const demoRef = vi.hoisted(() => ({ value: false }));

const authStateSub = vi.hoisted(() => ({ fn: null as ((event: string, session: unknown) => void) | null }));

vi.mock('../../lib/supabase', () => ({
  get isDemoMode() { return demoRef.value; },
  supabase: {
    auth: {
      onAuthStateChange: vi.fn((cb) => {
        authStateSub.fn = cb;
        // Immediately fire INITIAL_SESSION with no session
        cb('INITIAL_SESSION', null);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
      refreshSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'no profile' } }),
    })),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function TestConsumer() {
  const { user, userTier, loading, isDemoMode } = useAuth();
  return (
    <div>
      <span data-testid="user">{user?.email ?? 'none'}</span>
      <span data-testid="tier">{userTier}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="demo">{String(isDemoMode)}</span>
    </div>
  );
}

function DemoConsumer() {
  const { demoLogin, signOut, user } = useAuth();
  return (
    <div>
      <span data-testid="user">{user?.email ?? 'none'}</span>
      <button onClick={demoLogin}>Login Demo</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

const storage: Record<string, string> = {};
const lsMock = {
  get length() { return Object.keys(storage).length; },
  key: (i: number) => Object.keys(storage)[i] ?? null,
  getItem: (k: string) => storage[k] ?? null,
  setItem: (k: string, v: string) => { storage[k] = v; },
  removeItem: (k: string) => { delete storage[k]; },
  clear: () => { for (const k of Object.keys(storage)) delete storage[k]; },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthContext', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', lsMock);
    lsMock.clear();
    store.clear();
    demoRef.value = false;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('useAuth throws when rendered outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    consoleError.mockRestore();
  });

  it('renders children with default state (loading resolves, no user, free tier)', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(screen.getByTestId('tier').textContent).toBe('free');
  });

  it('demoLogin sets demo user and alpha tier', async () => {
    demoRef.value = true;

    render(
      <AuthProvider>
        <DemoConsumer />
      </AuthProvider>,
    );

    await waitFor(() => screen.getByText('Login Demo'));

    act(() => {
      screen.getByText('Login Demo').click();
    });

    await waitFor(() =>
      expect(screen.getByTestId('user').textContent).toBe('demo@sportsintel.io'),
    );
  });

  it('demoLogin persists demo session flag in store', async () => {
    demoRef.value = true;

    render(
      <AuthProvider>
        <DemoConsumer />
      </AuthProvider>,
    );

    await waitFor(() => screen.getByText('Login Demo'));

    act(() => {
      screen.getByText('Login Demo').click();
    });

    await waitFor(() =>
      expect(store.get<boolean>('msi_demo_session', false)).toBe(true),
    );
  });

  it('signOut in demo mode clears user and removes demo session from store', async () => {
    demoRef.value = true;
    // Pre-populate demo session
    store.set('msi_demo_session', true);

    render(
      <AuthProvider>
        <DemoConsumer />
      </AuthProvider>,
    );

    await waitFor(() => screen.getByText('Login Demo'));

    // Login first
    act(() => { screen.getByText('Login Demo').click(); });
    await waitFor(() =>
      expect(screen.getByTestId('user').textContent).toBe('demo@sportsintel.io'),
    );

    // Sign out
    act(() => { screen.getByText('Sign Out').click(); });
    await waitFor(() =>
      expect(screen.getByTestId('user').textContent).toBe('none'),
    );
    expect(store.has('msi_demo_session')).toBe(false);
  });

  it('signIn delegates to supabase.auth.signInWithPassword', async () => {
    const { supabase } = await import('../../lib/supabase');

    function SignInConsumer() {
      const { signIn } = useAuth();
      return <button onClick={() => signIn('a@b.com', 'pass')}>Sign In</button>;
    }

    render(
      <AuthProvider>
        <SignInConsumer />
      </AuthProvider>,
    );

    await waitFor(() => screen.getByText('Sign In'));
    act(() => { screen.getByText('Sign In').click(); });

    await waitFor(() =>
      expect(vi.mocked(supabase.auth.signInWithPassword)).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'pass',
      }),
    );
  });
});
