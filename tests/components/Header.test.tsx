import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'demo@sportsintel.io', user_metadata: { username: 'Collector' } },
    signOut: vi.fn(),
    isDemoMode: false,
  }),
}));

vi.mock('../../lib/utils/useSupabaseInventory', () => ({
  useSupabaseInventory: () => ({
    inventory: [],
    syncStatus: 'synced',
    lastSyncError: null,
  }),
}));

const useAlertsMock = vi.fn(() => ({ unreadCount: 0 }));
vi.mock('../../lib/utils/useAlerts', () => ({
  useAlerts: () => useAlertsMock(),
}));

// SwarmFeed pulls in CatalystEngine and inventory state — stub it out, this
// test only cares about Header itself.
vi.mock('../../components/SwarmFeed', () => ({
  default: () => null,
}));

import Header from '../../components/Header';

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAlertsMock.mockReturnValue({ unreadCount: 0 });
  });

  it('does not show a notification badge when there are 0 unread alerts', () => {
    useAlertsMock.mockReturnValue({ unreadCount: 0 });
    renderHeader();
    const bell = screen.getByRole('button', { name: 'Notifications' });
    expect(bell).toBeInTheDocument();
    // No numeric badge text expected
    expect(bell.textContent).not.toMatch(/\d/);
  });

  it('shows an unread count badge and updates aria-label when alerts > 0', () => {
    useAlertsMock.mockReturnValue({ unreadCount: 3 });
    renderHeader();
    const bell = screen.getByRole('button', { name: /3 unread/i });
    expect(bell).toBeInTheDocument();
    expect(bell.getAttribute('aria-label')).toContain('3 unread');
    expect(bell.textContent).toContain('3');
  });

  it('caps the badge text at 9+ when unreadCount exceeds 9', () => {
    useAlertsMock.mockReturnValue({ unreadCount: 42 });
    renderHeader();
    const bell = screen.getByRole('button', { name: /42 unread/i });
    expect(bell.textContent).toContain('9+');
  });

  it('uses a plain search placeholder with no /scan reference', () => {
    renderHeader();
    const input = screen.getByLabelText('Search cards, players, and sets') as HTMLInputElement;
    expect(input.placeholder).toBe('Search cards, players, sets...');
    expect(input.placeholder).not.toMatch(/\/scan/i);
  });

  it('does not render the legacy Terminal Active pill or command dropdown hint', () => {
    renderHeader();
    expect(screen.queryByText(/Terminal Active/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Available Commands/i)).not.toBeInTheDocument();
  });

  it('does not register a global Cmd+K window listener (palette owns it now)', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHeader();
    const keydownCalls = addSpy.mock.calls.filter(([type]) => type === 'keydown');
    // Header only registers keydown listeners conditionally on dropdown open;
    // on mount, with the dropdown closed, no keydown listener should be wired.
    expect(keydownCalls).toHaveLength(0);
    addSpy.mockRestore();
  });
});
